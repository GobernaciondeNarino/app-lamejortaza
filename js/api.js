// js/api.js — cliente del backend PHP.
// - Detecta automáticamente el base URL (raíz o subdirectorio).
// - Mantiene CSRF + sesión.
// - Polling ligero (5s) sobre /api/dashboard para datos en vivo.

(function () {
  // BASE apunta SIEMPRE al front controller PHP. Esto funciona con o
  // sin mod_rewrite en el servidor — la ruta interna se manda por
  // ?path=auth/me (preservada por mod_rewrite con QSA y leída por el
  // PHP directamente cuando los rewrites están desactivados).
  let BASE = (window.LMT_API_BASE
    || (window.LMT_BASE_URL ? window.LMT_BASE_URL + "/api/index.php" : "/api/index.php")
  ).replace(/\/$/, "");
  // Si nos dieron un BASE viejo del estilo "/api" sin index.php, lo arreglamos.
  if (!/index\.php$/i.test(BASE)) BASE = BASE + "/index.php";

  let csrf = "";
  let user = null;
  let promotor = null;
  let pollTimer = null;
  let bootstrapDone = false;

  const dispatchData = () => window.dispatchEvent(new CustomEvent("lmt:data"));
  const dispatchAuth = () => window.dispatchEvent(new CustomEvent("lmt:auth", { detail: { user, promotor } }));

  // Convierte una ruta interna ("/auth/me", "/votos?limit=20") en una URL
  // absoluta a /api/index.php?path=auth/me[&...].
  //
  // OJO: urlFor ya aplica encodeURIComponent a la ruta. Los llamadores deben
  // pasar los valores EN CRUDO. Codificarlos también daba una doble
  // codificación ("%40" -> "%2540") que el servidor compensaba haciendo un
  // urldecode() extra — un parche que a su vez permitía colar "/" dentro de un
  // parámetro de ruta. Se arregla en el lado que estaba mal: aquí.
  function urlFor(path) {
    let routePath = path, qs = "";
    const qIdx = path.indexOf("?");
    if (qIdx !== -1) {
      routePath = path.slice(0, qIdx);
      qs = path.slice(qIdx + 1);
    }
    routePath = routePath.replace(/^\//, "");
    let url = BASE + "?path=" + encodeURIComponent(routePath);
    if (qs) url += "&" + qs;
    return url;
  }

  // Un token CSRF caducado (sesión rotada, servidor reiniciado) devolvía
  // csrf_invalid y el cliente no lo reintentaba nunca: el usuario se quedaba
  // sin poder votar hasta recargar la página. Ahora se refresca y se reintenta
  // UNA vez, que cubre el caso real sin arriesgar bucles.
  async function request(path, opts = {}, reintento = false) {
    const method = (opts.method || "GET").toUpperCase();
    const headers = Object.assign({ "Accept": "application/json" }, opts.headers || {});
    if (opts.body && !(opts.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }
    if (!["GET", "HEAD", "OPTIONS"].includes(method) && csrf) {
      headers["X-CSRF-Token"] = csrf;
    }
    // FormData (subida de imágenes) debe viajar tal cual: el navegador le pone
    // el Content-Type con su boundary. Serializarla a JSON la destruiría.
    let body;
    if (opts.body instanceof FormData) body = opts.body;
    else if (typeof opts.body === "string") body = opts.body;
    else if (opts.body) body = JSON.stringify(opts.body);

    const res = await fetch(urlFor(path), {
      method,
      credentials: "same-origin",
      headers,
      body,
    });
    let data = null;
    try { data = await res.json(); } catch (_) {}
    if (!res.ok || (data && data.ok === false)) {
      const code = (data && (data.error || data.message)) || ("http_" + res.status);
      if (code === "csrf_invalid" && !reintento) {
        csrf = "";
        await ensureCsrf();
        if (csrf) return request(path, opts, true);
      }
      const err = new Error(code);
      err.status = res.status;
      err.code = code;
      throw err;
    }
    return data && data.data !== undefined ? data.data : data;
  }

  function mapStand(s) {
    return {
      id: s.id,
      nombre: s.nombre,
      municipio: s.municipio,
      region: s.region,
      direccion: s.direccion,
      correo: s.correo,
      descripcion: s.descripcion,
      propietario: s.propietario || "",
      propietario_documento: s.propietario_documento || "",
      nit: s.nit || "",
      sitio_web: s.sitio_web || "",
      telefono: s.telefono || "",
      logo: s.logo || "",
      lat: typeof s.lat === "number" ? s.lat : null,
      lng: typeof s.lng === "number" ? s.lng : null,
      coords: s.coords || { x: 0.5, y: 0.5 },
      color: s.color || "oklch(0.45 0.1 40)",
      votos: s.votos || { bueno: 0, regular: 0, malo: 0 },
      estrellas: s.estrellas || { innovacion: null, atencion: null, calidad: null, n: 0 },
    };
  }

  async function bootstrap() {
    try {
      const me = await request("/auth/me");
      user = me.user || null;
      promotor = me.promotor || null;
      csrf = me.csrf || "";
      window.LMTApi.enabled = true;
    } catch (e) {
      console.warn("[lmt] API no disponible:", e.message);
      window.LMTApi.enabled = false;
    } finally {
      bootstrapDone = true;
      dispatchAuth();
    }
  }

  async function pollDashboard() {
    if (!window.LMTApi.enabled) return;
    try {
      const data = await request("/dashboard");
      if (Array.isArray(data.stands)) {
        window.STANDS_DATA = data.stands.map(mapStand);
      }
      if (Array.isArray(data.votos)) {
        const standMap = Object.fromEntries((window.STANDS_DATA || []).map((s) => [s.id, s]));
        window.COMENTARIOS_DEMO = data.votos.map((v) => ({
          stand: v.stand,
          emoji: v.emoji,
          texto: window.LMTSecurity ? window.LMTSecurity.sanitizeText(v.texto || "", 500) : (v.texto || ""),
          compra: !!v.compra,
          autor: v.autor || "",
          hora: v.hora || "",
          _stand: standMap[v.stand],
        }));
      }
      window.LMTApi.metricas = data.metricas || null;
      dispatchData();
    } catch (_) { /* silencioso */ }
  }

  async function signInAdmin(email, password) {
    const data = await request("/auth/login", { method: "POST", body: { email, password } });
    user = data.user || null;
    csrf = data.csrf || "";
    dispatchAuth();
    return user;
  }

  async function signOutAdmin() {
    try { await request("/auth/logout", { method: "POST" }); } catch (_) {}
    user = null;
    // Refrescar CSRF tras logout (la sesión se regenera)
    try { const me = await request("/auth/me"); csrf = me.csrf || ""; } catch (_) {}
    dispatchAuth();
  }

  // -----------------------------------------------------------------------
  // Promotores de stands
  // -----------------------------------------------------------------------

  async function promotorRegistro(body) {
    await ensureCsrf();
    return request("/promotores/registro", { method: "POST", body });
  }

  async function promotorLogin(email, password) {
    await ensureCsrf();
    const data = await request("/promotores/login", { method: "POST", body: { email, password } });
    promotor = data.promotor || null;
    user = null;                      // el backend cierra la sesión de admin
    csrf = data.csrf || "";
    dispatchAuth();
    return promotor;
  }

  async function promotorLogout() {
    try { await request("/promotores/logout", { method: "POST" }); } catch (_) {}
    promotor = null;
    try { const me = await request("/auth/me"); csrf = me.csrf || ""; } catch (_) {}
    dispatchAuth();
  }

  async function promotorCambiarClave(actual, nueva) {
    await ensureCsrf();
    const data = await request("/promotores/password", {
      method: "POST",
      body: { password_actual: actual, password_nueva: nueva },
    });
    if (promotor) promotor = Object.assign({}, promotor, { must_change: false, estado: data.estado || promotor.estado });
    dispatchAuth();
    return data;
  }

  async function getPerfilPromotor()        { return request("/promotores/perfil"); }
  async function guardarPerfilPromotor(b)   { await ensureCsrf(); return request("/promotores/perfil", { method: "PUT", body: b }); }
  async function guardarEmpresa(b)          { await ensureCsrf(); return request("/promotores/empresa", { method: "PUT", body: b }); }
  async function listarProductos()          { return request("/promotores/productos"); }
  async function crearProducto(b)           { await ensureCsrf(); return request("/promotores/productos", { method: "POST", body: b }); }
  async function actualizarProducto(id, b)  { await ensureCsrf(); return request("/promotores/productos/" + id, { method: "PUT", body: b }); }
  async function borrarProducto(id)         { await ensureCsrf(); return request("/promotores/productos/" + id, { method: "DELETE" }); }

  function archivoFormData(file) {
    const fd = new FormData();
    fd.append("archivo", file);
    return fd;
  }
  async function subirLogo(file) {
    await ensureCsrf();
    return request("/promotores/logo", { method: "POST", body: archivoFormData(file) });
  }
  /** Logo durante la inscripción: sin sesión, con su propio límite por IP. */
  async function subirLogoInscripcion(file) {
    await ensureCsrf();
    return request("/promotores/logo-inscripcion", { method: "POST", body: archivoFormData(file) });
  }
  // ── Festival: personalización y actividad económica ─────────────────────
  async function correoSonda()              { return request("/admin/correo/sonda"); }

  /** Foto del visitante. Va aparte del perfil: es multipart y sin sesión. */
  async function subirFotoVisitante(correo, token, file) {
    await ensureCsrf();
    const fd = archivoFormData(file);
    fd.append("correo", correo);
    fd.append("token", token);
    return request("/visitantes/foto", { method: "POST", body: fd });
  }
  async function borrarFotoVisitante(correo, token) {
    await ensureCsrf();
    return request("/visitantes/foto", { method: "DELETE", body: { correo, token } });
  }
  async function economia()                 { return request("/admin/economia"); }
  async function festivalAjustes()          { return request("/festival/ajustes"); }
  async function guardarFestivalAjustes(b)  { await ensureCsrf(); return request("/admin/festival/ajustes", { method: "PUT", body: b }); }
  async function subirFondoPasaporte(destino, file) {
    await ensureCsrf();
    const fd = archivoFormData(file);
    // El destino viaja en el propio formulario: con multipart no hay cuerpo
    // JSON donde meterlo, y en la query se mezclaría con el enrutado por
    // ?path= que usa este API cuando no hay reescritura de URL.
    fd.append("destino", destino);
    return request("/admin/festival/fondo", { method: "POST", body: fd });
  }
  async function quitarFondoPasaporte(destino, indice) {
    await ensureCsrf();
    return request("/admin/festival/fondo", { method: "DELETE", body: { destino, indice } });
  }

  /** Logo de un stand desde el panel de administración. */
  async function infoUploads()              { return request("/admin/uploads"); }
  async function subirLogoStand(file) {
    await ensureCsrf();
    return request("/stands/logo", { method: "POST", body: archivoFormData(file) });
  }
  async function subirFotoProducto(id, file) {
    await ensureCsrf();
    return request("/promotores/productos/" + id + "/foto", { method: "POST", body: archivoFormData(file) });
  }

  // Administración de promotores
  async function listarPromotores(estado)   { return request("/admin/promotores" + (estado ? "?estado=" + encodeURIComponent(estado) : "")); }
  async function verPromotor(id)            { return request("/admin/promotores/" + id); }
  async function verificarPromotor(id)      { await ensureCsrf(); return request("/admin/promotores/" + id + "/verificar", { method: "POST" }); }
  async function reenviarClave(id)          { await ensureCsrf(); return request("/admin/promotores/" + id + "/reenviar-clave", { method: "POST" }); }
  async function rechazarPromotor(id, motivo, avisar) {
    await ensureCsrf();
    return request("/admin/promotores/" + id + "/rechazar", { method: "POST", body: { motivo, avisar: avisar !== false } });
  }
  async function cambiarEstadoPromotor(id, estado) {
    await ensureCsrf();
    return request("/admin/promotores/" + id + "/estado", { method: "POST", body: { estado } });
  }
  async function vincularStand(id, standId) {
    await ensureCsrf();
    return request("/admin/promotores/" + id + "/stand", { method: "PUT", body: { stand_id: standId || null } });
  }
  async function listarEmails(limit)        { return request("/admin/emails" + (limit ? "?limit=" + encodeURIComponent(limit) : "")); }

  // Correo saliente
  async function getCorreoConfig()          { return request("/admin/correo"); }
  async function guardarCorreoConfig(b)     { await ensureCsrf(); return request("/admin/correo", { method: "PUT", body: b }); }
  async function olvidarCorreoConfig()      { await ensureCsrf(); return request("/admin/correo", { method: "DELETE" }); }
  async function probarCorreo(destino)      { await ensureCsrf(); return request("/admin/correo/prueba", { method: "POST", body: { destino } }); }
  async function getVitrina()               { return request("/vitrina"); }

  // Administradores (sólo propietario)
  async function listarAdmins()             { return request("/admin/administradores"); }
  async function crearAdmin(b)              { await ensureCsrf(); return request("/admin/administradores", { method: "POST", body: b }); }
  async function actualizarAdmin(id, b)     { await ensureCsrf(); return request("/admin/administradores/" + id, { method: "PUT", body: b }); }
  async function reponerClaveAdmin(id)      { await ensureCsrf(); return request("/admin/administradores/" + id + "/clave", { method: "POST" }); }
  async function borrarAdmin(id)            { await ensureCsrf(); return request("/admin/administradores/" + id, { method: "DELETE" }); }

  /** Cambio de la propia contraseña de administrador. */
  async function cambiarClaveAdmin(actual, nueva) {
    await ensureCsrf();
    const data = await request("/auth/password", {
      method: "POST",
      body: { password_actual: actual, password_nueva: nueva },
    });
    if (user) user = Object.assign({}, user, { must_change: false });
    dispatchAuth();
    return data;
  }

  async function ensureCsrf() {
    if (csrf) return;
    try { const me = await request("/auth/me"); csrf = me.csrf || ""; } catch (_) {}
  }

  async function submitVote(raw) {
    if (!window.LMTSecurity) throw new Error("seguridad_no_cargada");
    const payload = window.LMTSecurity.buildVotePayload(raw);
    if (!window.LMTSecurity.canVote(payload.stand)) throw new Error("rate_limited");
    await ensureCsrf();
    const res = await request("/votos", { method: "POST", body: payload });
    window.LMTSecurity.markVote(payload.stand);
    pollDashboard();
    // Se devuelve la respuesta del servidor (trae el testigo del perfil) junto
    // con lo enviado, que es lo que esperaban los llamadores anteriores.
    return Object.assign({}, payload, res || {});
  }

  // -----------------------------------------------------------------------
  // Perfil del visitante
  // -----------------------------------------------------------------------

  async function getPerfilVisitante(correo, token) {
    return request("/visitantes/perfil?correo=" + encodeURIComponent(correo) + "&t=" + encodeURIComponent(token));
  }
  async function guardarPerfilVisitante(correo, token, body) {
    await ensureCsrf();
    return request("/visitantes/perfil", { method: "PUT", body: Object.assign({ correo, token }, body) });
  }
  async function borrarPerfilVisitante(correo, token) {
    await ensureCsrf();
    return request("/visitantes/perfil", { method: "DELETE", body: { correo, token } });
  }
  async function pedirEnlacePerfil(correo) {
    await ensureCsrf();
    return request("/visitantes/enlace", { method: "POST", body: { correo } });
  }
  async function opcionesVisitante()        { return request("/visitantes/opciones"); }
  async function resumenVisitantes()        { return request("/admin/visitantes/resumen"); }
  async function expectativasVisitantes()   { return request("/admin/visitantes/expectativas"); }

  // El testigo del perfil es opcional: sin él llega el pasaporte de siempre;
  // con él, además, la calificación que esta persona puso a cada stand. Es un
  // endpoint público, así que esa parte no puede ir sin prueba de propiedad.
  async function getPasaporte(correo, token) {
    const t = token ? "?t=" + encodeURIComponent(token) : "";
    return request("/pasaportes/" + correo + t);   // urlFor codifica; no duplicar
  }

  async function listStands()           { return (await request("/stands")).map(mapStand); }
  async function getStand(id)           { return mapStand(await request("/stands/" + id)); }
  async function createStand(body)      { await ensureCsrf(); return request("/stands", { method: "POST", body }); }
  async function updateStand(id, body)  { await ensureCsrf(); return request("/stands/" + id, { method: "PUT", body }); }
  async function deleteStand(id)        { await ensureCsrf(); return request("/stands/" + id, { method: "DELETE" }); }

  window.LMTApi = {
    enabled: false,
    base: BASE,
    urlFor,                // útil para descargas (CSV) que necesitan URL completa
    user: () => user,
    promotor: () => promotor,
    csrf: () => csrf,
    bootstrapDone: () => bootstrapDone,
    signInAdmin,
    signOutAdmin,
    promotorRegistro,
    promotorLogin,
    promotorLogout,
    promotorCambiarClave,
    getPerfilPromotor,
    guardarPerfilPromotor,
    guardarEmpresa,
    listarProductos,
    crearProducto,
    actualizarProducto,
    borrarProducto,
    subirLogo,
    subirLogoInscripcion,
    subirLogoStand,
    infoUploads,
    subirFotoProducto,
    listarPromotores,
    verPromotor,
    verificarPromotor,
    reenviarClave,
    rechazarPromotor,
    cambiarEstadoPromotor,
    vincularStand,
    listarEmails,
    getCorreoConfig,
    guardarCorreoConfig,
    olvidarCorreoConfig,
    probarCorreo,
    getVitrina,
    listarAdmins,
    crearAdmin,
    actualizarAdmin,
    reponerClaveAdmin,
    borrarAdmin,
    cambiarClaveAdmin,
    submitVote,
    correoSonda,
    subirFotoVisitante,
    borrarFotoVisitante,
    economia,
    festivalAjustes,
    guardarFestivalAjustes,
    subirFondoPasaporte,
    quitarFondoPasaporte,
    getPerfilVisitante,
    guardarPerfilVisitante,
    borrarPerfilVisitante,
    pedirEnlacePerfil,
    opcionesVisitante,
    resumenVisitantes,
    expectativasVisitantes,
    getPasaporte,
    listStands,
    getStand,
    createStand,
    updateStand,
    deleteStand,
    pollDashboard,
  };

  /**
   * Testigo del perfil del visitante, guardado en este navegador.
   *
   * No es una sesión: es la prueba —emitida por el servidor al votar— de que
   * quien está delante controla ese correo. Vive en localStorage porque el
   * visitante no tiene cuenta y volverá desde el mismo teléfono; quien cambie
   * de dispositivo pide el enlace a su buzón.
   */
  window.LMTPerfil = {
    guardar(correo, token) {
      try {
        localStorage.setItem("lmt.perfil.correo", String(correo || "").toLowerCase());
        localStorage.setItem("lmt.perfil.token", String(token || ""));
      } catch (_) { /* navegación privada: el perfil se abre por el enlace del correo */ }
    },
    leer() {
      try {
        return {
          correo: localStorage.getItem("lmt.perfil.correo") || "",
          token:  localStorage.getItem("lmt.perfil.token")  || "",
        };
      } catch (_) { return { correo: "", token: "" }; }
    },
    tieneTestigo() {
      const c = window.LMTPerfil.leer();
      return !!(c.correo && c.token);
    },
    olvidar() {
      try {
        localStorage.removeItem("lmt.perfil.correo");
        localStorage.removeItem("lmt.perfil.token");
      } catch (_) {}
    },
  };

  /**
   * Ajustes de presentación del festival (títulos de las estrellas, columnas
   * del recorrido, fondos del pasaporte).
   *
   * Se leen UNA vez al arrancar y quedan en memoria: los pinta media interfaz
   * y pedirlos en cada componente sería una ráfaga de peticiones para algo que
   * no cambia durante la visita. Hasta que llegan, se usan los de fábrica, así
   * que nada se queda en blanco esperando.
   */
  let festival = null;
  window.LMTFestival = {
    ajustes() { return festival; },
    async cargar() {
      try {
        festival = await request("/festival/ajustes");
      } catch (_) {
        festival = null;   // se quedan los valores por defecto del componente
      }
      window.dispatchEvent(new CustomEvent("lmt:festival", { detail: festival }));
      return festival;
    },
  };

  // Arranque automático
  bootstrap().then(() => {
    window.LMTFestival.cargar();
    pollDashboard();
    pollTimer = setInterval(pollDashboard, 5000);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        clearInterval(pollTimer); pollTimer = null;
      } else if (!pollTimer) {
        pollDashboard();
        pollTimer = setInterval(pollDashboard, 5000);
      }
    });
  });
})();
