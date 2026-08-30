// Pantallas del Panel Administrador (con autenticación real, CRUD real,
// y navegación por rutas /admin/...).

const AdminShell = ({ active, user, children }) => {
  // Las cuentas de acceso sólo las ve un propietario. Se oculta el enlace
  // además de que el backend lo rechace: enseñar una sección que siempre
  // responde 403 es una trampa, no una medida de seguridad.
  const items = [
    { id: "stands",     label: "Espacios",     sub: "Registro",     path: "/admin/stands" },
    { id: "promotores", label: "Promotores",   sub: "Inscripciones", path: "/admin/promotores" },
    { id: "qr",         label: "Códigos QR",   sub: "Impresión",    path: "/admin/qr" },
    { id: "live",       label: "Actividad",    sub: "En vivo",      path: "/admin/live" },
    { id: "economia",   label: "Actividad económica", sub: "Compras del evento", path: "/admin/economia" },
    { id: "caracterizacion", label: "Visitantes", sub: "Caracterización", path: "/admin/caracterizacion" },
    { id: "festival",   label: "Personalización", sub: "Títulos y fondos", path: "/admin/festival" },
    { id: "correo",     label: "Correo",       sub: "Envío y pruebas", path: "/admin/correo" },
    { id: "correos",    label: "Bitácora",     sub: "Mensajes enviados", path: "/admin/correos" },
  ].concat(user && user.rol === "propietario"
    ? [
        { id: "cuentas", label: "Administradores", sub: "Cuentas de acceso", path: "/admin/cuentas" },
        { id: "sistema", label: "Empezar de cero", sub: "Borrar datos de prueba", path: "/admin/sistema" },
      ]
    : []);
  const logout = async () => {
    if (window.LMTApi && window.LMTApi.enabled) await window.LMTApi.signOutAdmin();
    window.LMTRouter.go("/");
  };
  return (
    <div className="admin-shell">
      <aside className="admin-aside">
        <a href="/" data-route style={{ textDecoration: "none", color: "inherit" }}>
          <Wordmark size={16}/>
        </a>
        <nav className="admin-nav">
          <div className="mono" style={{ marginBottom: 8 }}>Admin · Festival 2026</div>
          {items.map((it) => (
            <a key={it.id} href={it.path} data-route style={{
              display: "flex", flexDirection: "column", alignItems: "flex-start",
              padding: "10px 12px", borderRadius: "var(--r-md)",
              background: active === it.id ? "var(--paper-2)" : "transparent",
              textAlign: "left", textDecoration: "none", color: "var(--ink)",
            }}>
              <span style={{ fontSize: 14, fontWeight: active === it.id ? 600 : 400 }}>{it.label}</span>
              {it.sub && <span className="mono" style={{ fontSize: 9, marginTop: 2 }}>{it.sub}</span>}
            </a>
          ))}
        </nav>
        <div className="admin-sesion">
          <div className="mono" style={{ marginBottom: 4 }}>Sesión</div>
          <div style={{ fontSize: 12, color: "var(--ink-2)", wordBreak: "break-all" }}>{user ? user.email : "—"}</div>
          {user && user.rol && (
            <div className="mono" style={{ marginTop: 4, color: "var(--ink-3)" }}>
              {user.rol === "propietario" ? "Propietario" : "Organizador"}
            </div>
          )}
          <button onClick={logout} className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", marginTop: 10, padding: "8px" }}>
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
};

const LoginAdmin = ({ onLogin, onVisitor }) => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  // El acceso interno arranca plegado, salvo cuando se llega a /admin/login
  // directamente: ahí quien entra ya sabe a qué viene y esconderle el
  // formulario sería un paso de más.
  const [verInterno, setVerInterno] = React.useState(
    () => typeof window !== "undefined" && window.LMTRouter
      ? window.LMTRouter.currentPath().startsWith("/admin")
      : false
  );

  React.useEffect(() => {
    // Si ya hay sesión activa, salta directo al panel.
    if (window.LMTApi && window.LMTApi.user && window.LMTApi.user() && window.LMTApi.user().admin) {
      onLogin();
    }
  }, [onLogin]);

  const handleLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    if (!window.LMTSecurity || !window.LMTSecurity.isEmail(email)) { setError("Correo inválido"); return; }
    if (!password || password.length < 8) { setError("La contraseña debe tener al menos 8 caracteres"); return; }
    setBusy(true);
    try {
      if (!window.LMTApi || !window.LMTApi.enabled) throw new Error("api_unavailable");
      const u = await window.LMTApi.signInAdmin(email, password);
      if (!u || !u.admin) throw new Error("forbidden");
      onLogin();
    } catch (e) {
      const code = e && (e.code || e.message);
      if (code === "rate_limited") setError("Demasiados intentos. Espera unos minutos.");
      else if (code === "api_unavailable") setError("La API no está disponible. ¿Ejecutaste el asistente de instalación?");
      else if (code === "forbidden") setError("Esa cuenta no tiene permisos de administrador.");
      else setError("No fue posible iniciar sesión. Verifica las credenciales.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="split">
      <div className="split-hero">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ filter: "invert(1)" }}><LogoTaza size={36}/></div>
          <div className="mono" style={{ color: "var(--paper-3)" }}>La Mejor Taza · Festival 2026</div>
        </div>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 64, lineHeight: 0.95, margin: 0, fontWeight: 400, letterSpacing: "-0.02em", maxWidth: "16ch" }}>
            El pasaporte<br/>del café<br/><span style={{ color: "var(--galeras)" }}>nariñense</span>.
          </h1>
          <p style={{ fontSize: 15, color: "var(--paper-3)", maxWidth: 420, marginTop: 24, lineHeight: 1.6 }}>
            Recorre los stands, prueba los cafés y vota. Tu pasaporte se va
            sellando con cada visita, y entre todos decidimos cuál es la mejor
            taza de Nariño.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
          <span className="mono" style={{ color: "var(--paper-3)" }}>¿Tienes un espacio en el festival?</span>
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <a href="/inscripcion" data-route style={{ color: "var(--paper)", fontSize: 14, textDecoration: "underline" }}>
              Inscribirme como promotor
            </a>
            <a href="/promotor" data-route style={{ color: "var(--paper-3)", fontSize: 14 }}>
              Ya tengo acceso →
            </a>
          </div>
        </div>
      </div>

      {/* Esta columna es del público. La portada la abre un ciudadano que
          acaba de escanear un QR, no el organizador: pedirle un correo
          institucional y una contraseña nada más entrar era mandarlo de vuelta.
          El acceso interno sigue estando, pero abajo y plegado. */}
      <div className="split-form">
        <div className="mono">Festival 2026 · Nariño</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 40, fontWeight: 400, margin: "8px 0 14px", lineHeight: 1.05 }}>
          Bienvenido al<br/>festival.
        </h2>
        <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6, marginBottom: 22 }}>
          No necesitas cuenta ni contraseña: entra, mira el ranking en vivo y
          vota en los espacios que visites.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button type="button"
            onClick={onVisitor || (() => window.LMTRouter.go("/festival"))}
            className="btn btn-primary"
            style={{ justifyContent: "center", padding: 15, fontSize: 15 }}>
            Entrar al festival →
          </button>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <a href="/recorrido" data-route className="btn btn-ghost" style={{ justifyContent: "center" }}>Mi recorrido</a>
            <a href="/pasaporte" data-route className="btn btn-ghost" style={{ justifyContent: "center" }}>Mi pasaporte</a>
          </div>
        </div>

        <div style={{ height: 1, background: "var(--line)", margin: "26px 0 0" }}/>

        {!verInterno ? (
          <button type="button" onClick={() => setVerInterno(true)}
            className="mono"
            style={{
              background: "none", border: "none", cursor: "pointer", padding: "14px 0",
              color: "var(--ink-3)", textDecoration: "underline", textAlign: "left", minHeight: 44,
            }}>
            ¿Eres administrador o promotor? Entra aquí
          </button>
        ) : (
          <form onSubmit={handleLogin} style={{ animation: "fade-up 0.25s", paddingTop: 18 }}>
            <div className="mono" style={{ marginBottom: 10 }}>Acceso · Organizadores</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div className="field">
                <label htmlFor="lg-email">Correo institucional</label>
                <input id="lg-email" type="email" autoComplete="username" autoFocus
                  value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} required/>
              </div>
              <div className="field">
                <label htmlFor="lg-pass">Contraseña</label>
                <input id="lg-pass" type="password" autoComplete="current-password"
                  value={password} onChange={(e) => setPassword(e.target.value)} maxLength={128} required/>
              </div>
              {error && <div role="alert" style={{ fontSize: 13, color: "var(--bad)" }}>{error}</div>}
              <button className="btn btn-primary" type="submit" disabled={busy}
                style={{ justifyContent: "center", padding: 14, opacity: busy ? 0.6 : 1 }}>
                {busy ? "Validando…" : "Entrar al panel →"}
              </button>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <a href="/promotor" data-route className="mono" style={{ color: "var(--ink-3)" }}>
                  Soy promotor de un espacio →
                </a>
                <span className="mono" style={{ color: "var(--ink-3)" }}>
                  {window.LMTApi && window.LMTApi.enabled ? "API conectada" : "API no disponible"}
                </span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// Punto único del panel admin: switch interno por sección
const AdminPage = ({ section, user, stands, comentarios, editingId }) => {
  if (section === "stands")  return <AdminShell active="stands" user={user}><StandsList stands={stands}/></AdminShell>;
  if (section === "editor")  return <AdminShell active="stands" user={user}><StandEditor stand={editingId ? stands.find((s) => s.id === editingId) : null}/></AdminShell>;
  if (section === "qr")      return <AdminShell active="qr" user={user}><QRPrintView stands={stands}/></AdminShell>;
  if (section === "live")    return <AdminShell active="live" user={user}><ActivityLive stands={stands} comentarios={comentarios || (window.COMENTARIOS_DEMO || [])}/></AdminShell>;
  if (section === "promotores") return <AdminShell active="promotores" user={user}><AdminPromotores stands={stands}/></AdminShell>;
  if (section === "correos")    return <AdminShell active="correos" user={user}><AdminCorreos/></AdminShell>;
  if (section === "correo")     return <AdminShell active="correo" user={user}><AdminCorreoConfig/></AdminShell>;
  if (section === "caracterizacion") return <AdminShell active="caracterizacion" user={user}><AdminCaracterizacion/></AdminShell>;
  if (section === "cuentas")    return <AdminShell active="cuentas" user={user}><AdminCuentas user={user}/></AdminShell>;
  if (section === "sistema")    return <AdminShell active="sistema" user={user}><SistemaPage/></AdminShell>;
  return <AdminShell active="stands" user={user}><div style={{ padding: 32 }}>—</div></AdminShell>;
};

const StandsList = ({ stands }) => {
  const sorted = [...stands].sort((a, b) => calcScore(b.votos) - calcScore(a.votos));
  return (
    <div className="admin-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, gap: 12, flexWrap: "wrap" }}>
        <div>
          <div className="mono">Registro · {stands.length} espacios</div>
          <h1 className="titulo-xl">Espacios del festival</h1>
        </div>
        <a href="/admin/stands/new" data-route className="btn btn-primary">+ Registrar espacio</a>
      </div>

      <div className="grid-4" style={{ marginBottom: 32 }}>
        {[
          { k: "Espacios", v: stands.length, sub: "registrados" },
          { k: "Votos", v: stands.reduce((a, s) => a + totalVotos(s.votos), 0), sub: "totales" },
          { k: "Aprobación", v: (window.LMTApi && window.LMTApi.metricas ? window.LMTApi.metricas.aprobacion + "%" : "—"), sub: "promedio" },
          { k: "Pasaportes", v: (window.LMTApi && window.LMTApi.metricas ? window.LMTApi.metricas.pasaportes : "—"), sub: "activos" },
        ].map(m => (
          <div key={m.k} style={{ padding: 20, border: "1px solid var(--line)", borderRadius: "var(--r-md)", background: "var(--paper)" }}>
            <div className="mono">{m.k}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 40, fontStyle: "italic", lineHeight: 1, marginTop: 8 }}>{m.v}</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {stands.length === 0 ? (
        <div style={{ padding: 60, border: "1px dashed var(--line-2)", borderRadius: "var(--r-md)", textAlign: "center", color: "var(--ink-3)" }}>
          <div className="mono">Sin espacios</div>
          <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 28, color: "var(--ink)", margin: "8px 0 16px" }}>Registra el primero.</div>
          <a href="/admin/stands/new" data-route className="btn btn-primary">+ Registrar espacio</a>
        </div>
      ) : (
        <div className="tabla-scroll" style={{ border: "1px solid var(--line)", borderRadius: "var(--r-md)", background: "var(--paper)" }}>
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "60px 2fr 1fr 1fr 1.2fr 80px", padding: "12px 20px", borderBottom: "1px solid var(--line)", background: "var(--paper-2)" }}>
            {["#", "Espacio", "Municipio", "Región", "Calificación", ""].map((h, i) => (<div key={i} className="mono">{h}</div>))}
          </div>
          {sorted.map((s, i) => (
            <a key={s.id} href={"/admin/stands/" + s.id + "/edit"} data-route style={{
              display: "grid", gridTemplateColumns: "60px 2fr 1fr 1fr 1.2fr 80px",
              padding: "16px 20px", borderBottom: i < sorted.length - 1 ? "1px solid var(--line)" : "none",
              alignItems: "center", textDecoration: "none", color: "var(--ink)",
            }}>
              <div className="mono" style={{ fontSize: 13 }}>{String(i + 1).padStart(2, "0")}</div>
              <div>
                <div style={{ fontWeight: 500, fontSize: 15 }}>{s.nombre}</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{s.direccion}</div>
              </div>
              <div style={{ fontSize: 14 }}>{s.municipio}</div>
              <div style={{ fontSize: 13, color: "var(--ink-2)" }}>{s.region}</div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontStyle: "italic" }}>{calcScore(s.votos).toFixed(0)}</span>
                  <span className="mono" style={{ fontSize: 10 }}>{totalVotos(s.votos)} votos</span>
                </div>
                <BarraVotos votos={s.votos}/>
              </div>
              <div style={{ textAlign: "right", fontSize: 18, color: "var(--ink-3)" }}>→</div>
            </a>
          ))}
        </div>
        </div>
      )}
    </div>
  );
};

/**
 * El número que la organización asigna al espacio en el recinto.
 *
 * La regla es todo o nada, y el aviso de aquí abajo es la mitad de la función:
 * sin él, quien numere tres espacios y no vea ningún cambio en la plataforma
 * pensará que el campo no sirve. Aquí se le dice cuántos faltan.
 */
const NumeroDelEspacio = ({ valor, onCambio, idActual }) => {
  const todos = window.STANDS_DATA || [];
  // El que se está editando cuenta con lo que hay escrito ahora mismo, no con
  // lo último guardado: si no, teclear el último número que faltaba seguiría
  // diciendo «falta 1» hasta recargar.
  const sinNumero = todos.filter((s) =>
    s.id === idActual ? String(valor || "").trim() === "" : String(s.numero || "").trim() === ""
  ).length;
  const completa = todos.length > 0 && sinNumero === 0;

  return (
    <div className="field">
      <label htmlFor="st-numero">Número del espacio</label>
      <input id="st-numero" value={valor || ""} maxLength={16} placeholder="Ej: 12 o A-14"
        onChange={(e) => onCambio(e.target.value.replace(/[^\p{L}0-9 .\-]/gu, "").slice(0, 16))}/>
      <span className="ayuda" style={{ color: completa ? "var(--good)" : "var(--ink-3)" }}>
        {completa
          ? "Todos los espacios están numerados: la plataforma usa estos números."
          : (todos.length === 0
            ? "Es el número del recinto, el que sale en el mapa impreso."
            : `Se usará en toda la plataforma cuando lo tengan TODOS los espacios; faltan ${sinNumero} de ${todos.length}. Mientras tanto se enseña el código del sistema (#${String(idActual || "").toUpperCase()}).`)}
      </span>
    </div>
  );
};

const StandEditor = ({ stand }) => {
  const isNew = !stand;
  const [form, setForm] = React.useState(stand || {
    id: "st-" + Math.random().toString(36).slice(2, 6),
    nombre: "", municipio: "", region: "", direccion: "", correo: "",
    descripcion: "", propietario: "", propietario_documento: "", nit: "", sitio_web: "",
    telefono: "", lat: null, lng: null,
    numero: "",
    tipo_organizacion: "", tipo_organizacion_otro: "",
    actividad_cafe: "", actividad_cafe_otro: "",
    poblacion: "", poblacion_otro: "",
    linea_productiva: [], presentacion: [], presentacion_otro: "",
    promedio_taza: "", camara_comercio_numero: "", invima_detalle: "",
    cert_internacional: null, organico: null, especial: null,
    marca_registrada: null, camara_comercio: null, invima: null,
    manipulacion_alimentos: null,
    logo: "", votos: { bueno: 0, regular: 0, malo: 0 },
    coords: { x: 0.5, y: 0.5 },
    color: "oklch(0.45 0.1 40)",
  });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [almacen, setAlmacen] = React.useState(null);
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Dónde acaban las imágenes en el servidor: hace falta para la copia de
  // seguridad y para saber dónde mirar cuando una subida no aparece.
  React.useEffect(() => {
    let vivo = true;
    window.LMTApi.infoUploads().then((d) => { if (vivo) setAlmacen(d); }).catch(() => {});
    return () => { vivo = false; };
  }, []);

  const save = async () => {
    setError(""); setBusy(true);
    try {
      const payload = {
        id: form.id,
        nombre: form.nombre,
        municipio: form.municipio,
        region: form.region,
        direccion: form.direccion,
        correo: form.correo,
        descripcion: form.descripcion,
        propietario: form.propietario,
        propietario_documento: form.propietario_documento,
        nit: form.nit,
        sitio_web: form.sitio_web,
        telefono: form.telefono,
        lat: form.lat,
        lng: form.lng,
        numero: form.numero || "",
        tipo_organizacion: form.tipo_organizacion || "",
        tipo_organizacion_otro: form.tipo_organizacion_otro || "",
        actividad_cafe: form.actividad_cafe || "",
        actividad_cafe_otro: form.actividad_cafe_otro || "",
        poblacion: form.poblacion || "",
        poblacion_otro: form.poblacion_otro || "",
        linea_productiva: form.linea_productiva || [],
        presentacion: form.presentacion || [],
        presentacion_otro: form.presentacion_otro || "",
        promedio_taza: form.promedio_taza || "",
        camara_comercio_numero: form.camara_comercio_numero || "",
        invima_detalle: form.invima_detalle || "",
        cert_internacional: form.cert_internacional ?? null,
        organico: form.organico ?? null,
        especial: form.especial ?? null,
        marca_registrada: form.marca_registrada ?? null,
        camara_comercio: form.camara_comercio ?? null,
        invima: form.invima ?? null,
        manipulacion_alimentos: form.manipulacion_alimentos ?? null,
        logo: form.logo || null,
        coords: form.coords,
        color: form.color,
      };
      if (isNew) await window.LMTApi.createStand(payload);
      else       await window.LMTApi.updateStand(form.id, payload);
      await window.LMTApi.pollDashboard();
      window.LMTRouter.go(isNew ? "/admin/qr" : "/admin/stands");
    } catch (e) {
      const code = String((e && (e.code || e.message)) || e);
      if (code.includes("bad_id")) setError("Identificador inválido (sólo minúsculas, números y guión).");
      else if (code.includes("bad_nombre")) setError("Nombre obligatorio (máx. 80).");
      else if (code.includes("bad_municipio")) setError("Municipio obligatorio (máx. 80).");
      else if (code.includes("direccion_requerida")) setError(ERRORES.direccion_requerida);
      else if (code.includes("detalle_requerido")) setError(ERRORES.detalle_requerido);
      else if (code.includes("tipo_organizacion_invalido")) setError(ERRORES.tipo_organizacion_invalido);
      else if (code.includes("actividad_cafe_invalida")) setError(ERRORES.actividad_cafe_invalida);
      else if (code.includes("poblacion_invalida")) setError(ERRORES.poblacion_invalida);
      else if (code.includes("numero_invalido")) setError(ERRORES.numero_invalido);
      else if (code.includes("unauthorized")) setError("Tu sesión expiró. Vuelve a iniciar sesión.");
      else setError("No fue posible guardar: " + code);
    } finally { setBusy(false); }
  };

  // El logo se sube aparte y se guarda con el stand: un stand nuevo todavía no
  // tiene id al que asociar el fichero.
  const subirLogo = async (file) => {
    const res = await window.LMTApi.subirLogoStand(file);
    update("logo", res.logo || "");
  };

  const remove = async () => {
    if (!confirmDelete || isNew) return;
    setBusy(true);
    try {
      await window.LMTApi.deleteStand(form.id);
      await window.LMTApi.pollDashboard();
      window.LMTRouter.go("/admin/stands");
    } catch (e) {
      setError("No fue posible borrar: " + (e.code || e.message));
    } finally { setBusy(false); }
  };

  return (
    <div className="admin-page" style={{ maxWidth: 960 }}>
      <a href="/admin/stands" data-route style={{ color: "var(--ink-2)", fontSize: 13, marginBottom: 20, display: "inline-block" }}>← Volver a espacios</a>
      <div className="mono">{isNew ? "Nuevo registro" : "Editar espacio"} · {form.id}</div>
      <h1 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 40, fontWeight: 400, margin: "4px 0 28px" }}>
        {isNew ? "Registrar espacio" : (form.nombre || "Sin nombre")}
      </h1>

      <div className="editor-2col">
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {isNew && (
            <div className="field">
              <label>ID del espacio (URL del QR)</label>
              <input value={form.id} onChange={e => update("id", e.target.value.toLowerCase().replace(/[^a-z0-9\-]/g, ""))} maxLength={32}/>
            </div>
          )}
          <div className="field">
            <label>Nombre del producto</label>
            <input value={form.nombre} onChange={e => update("nombre", e.target.value)} placeholder="Ej: Finca El Tambo" maxLength={80} required/>
          </div>

          {/* El número del recinto. Sólo lo asigna la organización, así que no
              está en la inscripción pública. Ver NumeroDelEspacio. */}
          <NumeroDelEspacio valor={form.numero} onCambio={(v) => update("numero", v)} idActual={form.id}/>
          <div className="grid-2" style={{ gap: 20 }}>
            <SelectorMunicipio id="st-municipio" valor={form.municipio} requerido
              onCambio={(municipio, region) => setForm((f) => ({
                ...f, municipio, region: region || f.region,
              }))}/>
            <SelectorSubregion id="st-region" valor={form.region} municipio={form.municipio}
              onCambio={(v) => update("region", v)}/>
          </div>
          <div className="field">
            <label>Dirección *</label>
            <input value={form.direccion} onChange={e => update("direccion", e.target.value)} maxLength={255} required/>
          </div>
          <div className="grid-2" style={{ gap: 20 }}>
            <div className="field">
              <label>Correo de contacto</label>
              <input type="email" value={form.correo} onChange={e => update("correo", e.target.value)} maxLength={254}/>
            </div>
            <CampoNumerico id="st-tel" etiqueta="Teléfono" telefono maxLength={15}
              valor={form.telefono} onCambio={(v) => update("telefono", v)}/>
          </div>
          <div className="field">
            <label>Descripción del producto</label>
            <textarea value={form.descripcion} onChange={e => update("descripcion", e.target.value)} rows={3} maxLength={800}/>
          </div>

          {/* Los mismos datos que pide la inscripción: un stand y su promotor
              son la misma cosa, y al verificar una solicitud el sistema
              rellena justo estos campos. */}
          <div className="grid-2" style={{ gap: 20 }}>
            <div className="field">
              <label>Propietario</label>
              <input value={form.propietario} onChange={e => update("propietario", e.target.value)} maxLength={120} placeholder="Nombre completo"/>
            </div>
            <CampoNumerico id="st-doc" etiqueta="Documento del propietario"
              valor={form.propietario_documento} onCambio={(v) => update("propietario_documento", v)}/>
          </div>
          <div className="grid-2" style={{ gap: 20 }}>
            <CampoNumerico id="st-nit" etiqueta="NIT o RUT"
              valor={form.nit} onCambio={(v) => update("nit", v)}/>
            <div className="field">
              <label>Sitio web o red social</label>
              <input type="url" value={form.sitio_web} onChange={e => update("sitio_web", e.target.value)} maxLength={255} placeholder="https://…"/>
            </div>
          </div>

          {/* Los mismos catálogos que pide la inscripción pública: un espacio
              creado a mano desde aquí tiene que quedar caracterizado igual que
              uno que llegó por el formulario, o los informes cuentan mitades. */}
          <SelectorCatalogo id="st-org"
            etiqueta="¿Qué tipo de organización es?"
            catalogo={ORGANIZACIONES}
            valor={form.tipo_organizacion} otro={form.tipo_organizacion_otro}
            onCambio={(v) => setForm((f) => ({ ...f, tipo_organizacion: v, tipo_organizacion_otro: v === "otro" ? f.tipo_organizacion_otro : "" }))}
            onOtro={(v) => update("tipo_organizacion_otro", v)}
            etiquetaOtro="¿Cuál es el tipo de organización?"/>
          <SelectorCatalogo id="st-act"
            etiqueta="Actividad o vínculo con la cadena de valor del café"
            catalogo={ACTIVIDADES_CAFE}
            valor={form.actividad_cafe} otro={form.actividad_cafe_otro}
            onCambio={(v) => setForm((f) => ({ ...f, actividad_cafe: v, actividad_cafe_otro: v === "otro" ? f.actividad_cafe_otro : "" }))}
            onOtro={(v) => update("actividad_cafe_otro", v)}
            etiquetaOtro="¿Cuál es la actividad?"/>

          {/* La misma ficha que rellena la inscripción pública, aquí toda
              opcional: los espacios creados antes de que existieran estos
              campos se tienen que poder seguir editando sin inventárselos. */}
          <SelectorCatalogo id="st-pob"
            etiqueta="¿A cuál grupo o tipo de población pertenece?"
            catalogo={POBLACIONES}
            valor={form.poblacion} otro={form.poblacion_otro}
            onCambio={(v) => setForm((f) => ({ ...f, poblacion: v, poblacion_otro: v === "otro" ? f.poblacion_otro : "" }))}
            onOtro={(v) => update("poblacion_otro", v)}
            etiquetaOtro="¿Cuál?"/>

          <SelectorMultiple id="st-linea"
            etiqueta="Línea productiva en la cual participa"
            catalogo={LINEAS_PRODUCTIVAS}
            valores={form.linea_productiva} onCambio={(v) => update("linea_productiva", v)}/>

          <div>
            <div className="mono" style={{ marginBottom: 12 }}>Información detallada</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <SiNo id="st-certint" valor={form.cert_internacional ?? null}
                onCambio={(v) => update("cert_internacional", v)}
                etiqueta="¿Su café cuenta con certificaciones internacionales?"/>
              <SiNo id="st-organico" valor={form.organico ?? null}
                onCambio={(v) => update("organico", v)}
                etiqueta="¿Su café es orgánico?"/>
              <SiNo id="st-especial" valor={form.especial ?? null}
                onCambio={(v) => update("especial", v)}
                etiqueta="¿Su café es especial?"/>
              <div className="field">
                <label htmlFor="st-taza">Promedio de taza</label>
                <input id="st-taza" value={form.promedio_taza || ""} maxLength={40}
                  onChange={(e) => update("promedio_taza", e.target.value)} placeholder="Ej: 84,5 puntos SCA"/>
              </div>
              <SiNo id="st-marca" valor={form.marca_registrada ?? null}
                onCambio={(v) => update("marca_registrada", v)}
                etiqueta="¿Marca registrada ante la Superintendencia de Industria y Comercio?"/>
              <SiNo id="st-camara" valor={form.camara_comercio ?? null}
                onCambio={(v) => update("camara_comercio", v)}
                etiqueta="¿Certificado de Existencia y Representación Legal (Cámara de Comercio)?"
                nota="Con fecha de expedición no mayor a noventa (90) días. Para pequeños
                      productores individuales vale la certificación de la UMATA, la
                      Secretaría de Agricultura Municipal o el Comité de Cafeteros."/>
              {form.camara_comercio === true && (
                <div className="field">
                  <label htmlFor="st-cc-num">Número del certificado de Cámara de Comercio</label>
                  <input id="st-cc-num" value={form.camara_comercio_numero || ""} maxLength={60}
                    onChange={(e) => update("camara_comercio_numero", e.target.value)}/>
                </div>
              )}
              <SiNo id="st-invima" valor={form.invima ?? null}
                onCambio={(v) => update("invima", v)}
                etiqueta="¿Acreditación sanitaria (INVIMA)?"/>
              {form.invima === true && (
                <div className="field">
                  <label htmlFor="st-invima-det">Tipo y número de la acreditación sanitaria</label>
                  <textarea id="st-invima-det" rows={3} maxLength={800}
                    value={form.invima_detalle || ""} onChange={(e) => update("invima_detalle", e.target.value)}/>
                </div>
              )}
              <SiNo id="st-manip" valor={form.manipulacion_alimentos ?? null}
                onCambio={(v) => update("manipulacion_alimentos", v)}
                etiqueta="¿Certificado de manipulación de alimentos vigente?"/>
              <SelectorMultiple id="st-pres"
                etiqueta="Presentación del producto"
                catalogo={PRESENTACIONES}
                valores={form.presentacion} onCambio={(v) => update("presentacion", v)}/>
              {(form.presentacion || []).includes("otros") && (
                <div className="field">
                  <label htmlFor="st-pres-otro">¿Qué otra presentación?</label>
                  <input id="st-pres-otro" value={form.presentacion_otro || ""} maxLength={120}
                    onChange={(e) => update("presentacion_otro", e.target.value)}/>
                </div>
              )}
            </div>
          </div>

          <SubirImagen
            actual={urlImagen(form.logo)}
            etiqueta="Logo del producto"
            cuadrada
            encuadrable
            ruta={form.logo}
            almacen={almacen && almacen.dir}
            onSubir={subirLogo}/>
          <EstadoAlmacen compacto/>

          <div>
            <div className="mono" style={{ marginBottom: 8 }}>Ubicación en Nariño</div>
            <SelectorUbicacion
              lat={form.lat} lng={form.lng} municipio={form.municipio} alto={300}
              onCambio={(u) => setForm((f) => ({
                ...f, lat: u.lat, lng: u.lng,
                municipio: u.municipio || f.municipio,
                region: (u.municipio && subregionDe(u.municipio)) || f.region,
              }))}/>
          </div>

          <div>
            <div className="mono" style={{ marginBottom: 12 }}>Color del sello</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                "oklch(0.42 0.09 50)", "oklch(0.55 0.13 30)", "oklch(0.5 0.08 145)",
                "oklch(0.48 0.1 60)", "oklch(0.5 0.1 200)", "oklch(0.4 0.08 120)",
                "oklch(0.55 0.12 20)", "oklch(0.45 0.11 300)"
              ].map(c => (
                <button key={c} type="button" onClick={() => update("color", c)} style={{
                  width: 36, height: 36, borderRadius: "50%", background: c,
                  border: form.color === c ? "2px solid var(--ink)" : "2px solid transparent",
                  outline: "1px solid var(--line)", outlineOffset: 2,
                }}/>
              ))}
            </div>
          </div>

          <div className="grid-2" style={{ gap: 20 }}>
            <div className="field">
              <label>Coords X (0..1)</label>
              <input type="number" min="0" max="1" step="0.01" value={form.coords?.x ?? 0.5} onChange={e => update("coords", { ...form.coords, x: parseFloat(e.target.value) })}/>
            </div>
            <div className="field">
              <label>Coords Y (0..1)</label>
              <input type="number" min="0" max="1" step="0.01" value={form.coords?.y ?? 0.5} onChange={e => update("coords", { ...form.coords, y: parseFloat(e.target.value) })}/>
            </div>
          </div>

          {error && <div role="alert" style={{ padding: "10px 12px", border: "1px solid var(--bad)", color: "var(--bad)", borderRadius: "var(--r-sm)", fontSize: 13 }}>{error}</div>}

          <div className="acciones" style={{ marginTop: 8 }}>
            <button className="btn btn-primary" onClick={save} disabled={busy} style={{ opacity: busy ? 0.6 : 1 }}>
              {busy ? "Guardando…" : (isNew ? "Registrar y generar QR →" : "Guardar cambios")}
            </button>
            <a href="/admin/stands" data-route className="btn btn-ghost">Cancelar</a>
            {!isNew && (
              <label style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, color: "var(--bad)", fontSize: 13 }}>
                <input type="checkbox" checked={confirmDelete} onChange={(e) => setConfirmDelete(e.target.checked)}/> confirmar borrar
                <button className="btn btn-ghost" onClick={remove} disabled={!confirmDelete || busy} style={{ borderColor: "var(--bad)", color: "var(--bad)" }}>Eliminar</button>
              </label>
            )}
          </div>
        </div>

        <aside style={{ position: "sticky", top: 24 }}>
          <div className="mono" style={{ marginBottom: 12 }}>Vista previa · Sello</div>
          <div style={{ padding: 32, border: "1px dashed var(--line-2)", borderRadius: "var(--r-md)", background: "var(--paper-2)", display: "flex", alignItems: "center", justifyContent: "center", aspectRatio: "1/1" }}>
            {form.nombre ? (
              <SelloCircular stand={form} size={170} rotation={-6}/>
            ) : (
              <div style={{ textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>
                <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 22, marginBottom: 4 }}>—</div>
                Completa el nombre<br/>para ver el sello
              </div>
            )}
          </div>
          <div className="mono" style={{ marginTop: 16 }}>URL del QR</div>
          <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--ink-2)", wordBreak: "break-all", marginTop: 4 }}>
            {window.location.origin}{window.LMT_BASE_URL || ""}/s/{form.id}
          </div>
        </aside>
      </div>
    </div>
  );
};

Object.assign(window, { AdminShell, LoginAdmin, AdminPage, StandsList, StandEditor, NumeroDelEspacio });
