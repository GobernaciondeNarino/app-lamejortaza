// Pasaporte real del usuario.
// URL: /pasaporte. Lee el correo de localStorage (lo guarda VoteFlow tras votar)
// y consulta /api/pasaportes/{correo} para obtener los stands visitados reales.

const PassportEmpty = () => (
  <div className="mobile-page">
    <div className="mobile-inner" style={{ textAlign: "center", padding: 40 }}>
      <div className="mono" style={{ marginBottom: 8 }}>Aún no tienes pasaporte</div>
      <h2 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 38, fontWeight: 400, margin: "0 0 16px", lineHeight: 1.05 }}>
        Empieza tu travesía<br/>del café.
      </h2>
      <p style={{ color: "var(--ink-2)", lineHeight: 1.6, maxWidth: 360, margin: "0 auto 24px" }}>
        Escanea el QR de cualquier stand del festival y emite tu primer voto. Cada visita estampa una página en tu pasaporte.
      </p>
      <a href="/festival" data-route className="btn btn-ghost" style={{ justifyContent: "center" }}>← Ver el ranking</a>
    </div>
  </div>
);

const PassportPage = ({ stands }) => {
  const [email, setEmail] = React.useState(() => {
    try { return localStorage.getItem("lmt.email") || ""; } catch (_) { return ""; }
  });
  const [data, setData] = React.useState(null);
  // Caracterización del visitante para la página de datos. Sólo se pide si
  // este navegador guarda el testigo del perfil: es la prueba de que quien
  // mira es el dueño del correo. Sin él, la página de datos se queda con lo
  // que ya es público (nombre en iniciales y correo enmascarado).
  const [perfil, setPerfil] = React.useState(null);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [flipping, setFlipping] = React.useState(false);
  const [askingEmail, setAskingEmail] = React.useState(!email);

  const load = React.useCallback(async (correo) => {
    setLoading(true); setError("");
    try {
      // Si este navegador guarda el testigo de ESTE correo, el servidor añade
      // las calificaciones al recorrido. Si no, llega el pasaporte de siempre.
      const t = (window.LMTPerfil && window.LMTPerfil.testigoDe(correo)) || "";
      const res = await window.LMTApi.getPasaporte(correo, t);
      setData(res);
      setAskingEmail(false);
    } catch (e) {
      const code = String((e && (e.code || e.message)) || e);
      if (code.includes("not_found")) setError("Aún no hay pasaporte para ese correo. Vota en cualquier stand para crearlo.");
      else if (code.includes("bad_email")) setError("El correo no es válido.");
      else setError("No fue posible cargar tu pasaporte.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Ojo con la condición: `LMTApi.enabled` es false hasta que termina el
  // bootstrap. Si el componente monta antes (lo normal en una recarga directa
  // de /pasaporte) y sólo dependiéramos de [email, load], la carga no volvería
  // a intentarse nunca y el usuario vería "No fue posible cargar tu pasaporte"
  // teniendo uno perfectamente válido. Por eso también escuchamos lmt:auth,
  // que es el evento que dispara js/api.js al acabar el arranque.
  React.useEffect(() => {
    if (!email) return;
    let cancelado = false;
    const intentar = () => {
      if (cancelado || !window.LMTApi || !window.LMTApi.enabled) return;
      load(email);
    };
    intentar();
    window.addEventListener("lmt:auth", intentar);
    return () => { cancelado = true; window.removeEventListener("lmt:auth", intentar); };
  }, [email, load]);

  React.useEffect(() => {
    if (!email || !window.LMTPerfil) return;
    const guardado = window.LMTPerfil.leer();
    // El testigo es de un correo concreto: si el pasaporte que se está mirando
    // es de otro, no sirve y no se pide nada.
    if (!guardado.token || guardado.correo !== String(email).toLowerCase()) { setPerfil(null); return; }
    let cancelado = false;
    (async () => {
      try {
        const res = await window.LMTApi.getPerfilVisitante(guardado.correo, guardado.token);
        if (!cancelado) setPerfil((res && res.perfil) || null);
      } catch (_) { if (!cancelado) setPerfil(null); }
    })();
    return () => { cancelado = true; };
  }, [email, data]);

  // La misma puerta que el recorrido y el perfil: el correo basta, y quien
  // haya puesto clave a su perfil la escribe aquí. Además del correo trae el
  // testigo, que es lo que hace que en el pasaporte se vean las estrellas que
  // esta persona puso: sin él sólo llegan los sellos.
  if (askingEmail) {
    return (
      <PuertaCorreo
        titulo="Tu pasaporte del festival."
        nota="Escribe el correo con el que votas en los stands. No hace falta contraseña."
        volverA="/festival" volverTexto="← Volver al ranking"
        onListo={(correo) => { setEmail(correo); setAskingEmail(false); }}/>
    );
  }

  if (loading) {
    return <div className="mobile-page"><div className="mobile-inner"><div className="splash">Cargando pasaporte…</div></div></div>;
  }

  if (error || !data) {
    return (
      <div className="mobile-page">
        <div className="mobile-inner" style={{ textAlign: "center", padding: 40 }}>
          <div className="mono">Pasaporte</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 32, fontWeight: 400, margin: "8px 0 16px", lineHeight: 1.1 }}>
            {error || "No fue posible cargar tu pasaporte."}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
            <button className="btn btn-ghost" onClick={() => { setAskingEmail(true); setError(""); }}>Cambiar correo</button>
            <a href="/festival" data-route className="btn btn-primary" style={{ justifyContent: "center" }}>Volver al ranking</a>
          </div>
        </div>
      </div>
    );
  }

  const visitadosIds = data.visitados || [];
  const visitados = visitadosIds.map((id) => stands.find((s) => s.id === id)).filter(Boolean);
  if (!visitados.length) return <PassportEmpty/>;

  const passport = {
    nombre: (perfil && perfil.nombre) || data.nombre || "Visitante",
    // El correo que escribió esta persona, no el que enmascara la API: el
    // pasaporte se abre en su propio teléfono y en la hoja de datos va el suyo
    // completo, como en un documento de verdad. La máscara sigue protegiendo a
    // quien consulte el endpoint desde fuera.
    correo: email || data.correo || "",
    numero: data.numero || "",
    numeroQr: data.numero_qr || "",
    inicio: data.inicio || "",
    ultimaVisita: data.ultima_visita || "",
    visitados: visitadosIds,
    valoraciones: data.valoraciones || {},
    // Las tres estrellas y la fecha de cada sello, para la hoja de ese stand.
    estrellas: data.estrellas_mias || {},
    sellos: data.sellado_en || {},
    perfil: perfil,
  };
  // El recorrido va AL FINAL: primero la hoja de datos, luego los sellos que se
  // fueron ganando y, al cerrar, el resumen de lo que se visitó y cómo se
  // calificó. Al principio no tenía nada que contar.
  // El fondo de cada hoja interna se decide AQUÍ y una sola vez: el índice
  // corre por las hojas de dentro, no por todas, para que las imágenes se
  // repartan en orden empezando por la primera hoja interior.
  const fondos = fondosPasaporte();
  let nHoja = 0;
  const interior = () => ({ fondo: fondoDeHoja(nHoja++) });
  const pages = [
    { type: "cover", fondo: fondos.portada },
    { type: "index", ...interior() },
    ...visitados.map((s) => ({ type: "stamp", stand: s, ...interior() })),
    { type: "travesia", ...interior() },
    { type: "end", fondo: fondos.contraportada },
  ];

  return (
    <PassportBook
      passport={passport}
      pages={pages}
      visitados={visitados}
      visitadosIds={visitadosIds}
      stands={stands}
      email={email}
      page={page}
      setPage={setPage}
      flipping={flipping}
      setFlipping={setFlipping}/>
  );
};

// Presentación del pasaporte. El libro en three.js (js/passport-book.js) se
// monta encima; si no puede —sin WebGL, sin three.js, contexto perdido— el
// render en CSS de siempre queda visible y los botones ←/→ siguen mandando.
// El 3D es una capa reemplazable, nunca el mecanismo de navegación.
const PassportBook = ({ passport, pages, visitados, visitadosIds, stands, page, setPage, flipping, setFlipping }) => {
  const wrapRef = React.useRef(null);
  const libroRef = React.useRef(null);
  const [book3d, setBook3d] = React.useState(false);
  // Los ajustes del festival llegan por su cuenta; cuando lleguen hay que
  // rehacer las páginas o los fondos no aparecerían hasta recargar.
  const [festivalTick, setFestivalTick] = React.useState(0);
  React.useEffect(() => {
    const refrescar = () => setFestivalTick((n) => n + 1);
    window.addEventListener("lmt:festival", refrescar);
    return () => window.removeEventListener("lmt:festival", refrescar);
  }, []);

  // Clave estable: sin memoizar, el efecto se re-ejecutaría en cada render y
  // acumularía libros (y contextos WebGL) hasta tumbar la pestaña.
  const pagesKey = React.useMemo(
    () => visitadosIds.join(",") + "|" + stands.length,
    [visitadosIds, stands.length]
  );

  // Las páginas se arman aparte porque el perfil del visitante llega DESPUÉS
  // de montar el libro: la hoja de datos se repinta con setPaginas y así no
  // hay que tirar el contexto WebGL y volver a crearlo sólo por un nombre.
  const paginasLibro = React.useMemo(() => {
    const fondos = fondosPasaporte();
    let nHoja = 0;
    const interior = () => ({ fondo: fondoDeHoja(nHoja++) });
    return [
      { tipo: "portada", nombre: passport.nombre, correo: passport.correo, inicio: passport.inicio, fondo: fondos.portada },
      Object.assign(
        { tipo: "indice", visitados: visitados.length, totalStands: stands.length },
        datosPagina(passport, stands.length), interior()
      ),
      ...visitados.map((s, i) => Object.assign({
        tipo: "sello", indice: i,
        // El libro dibuja en canvas y necesita la URL absoluta del logo, no la
        // ruta relativa que guarda la base.
        stand: Object.assign({}, s, { logo: urlImagen(s.logo) || "" }),
        desvio_x: desvioSello(s.id).x,
        desvio_y: desvioSello(s.id).y,
      }, datosSello(passport, s), interior())),
      Object.assign({
        tipo: "travesia",
        filas: filasTravesia(passport, visitados),
        visitados: visitados.length,
        totalStands: stands.length,
      }, interior()),
      { tipo: "final", visitados: visitados.length, totalStands: stands.length, fondo: fondos.contraportada },
    ];
  }, [pagesKey, passport.nombre, passport.correo, passport.inicio, passport.numero,
      passport.perfil, passport.valoraciones, passport.estrellas, passport.sellos,
      passport.numeroQr, passport.ultimaVisita, festivalTick]);

  const paginasRef = React.useRef(paginasLibro);
  paginasRef.current = paginasLibro;

  React.useEffect(() => {
    const cont = wrapRef.current;
    if (!cont || !window.LMTPassportBook || !window.LMTPassportBook.soportado()) return;
    // `?libro=0` deja a la vista el render CSS. Es el mismo camino que toma un
    // navegador sin WebGL, y sin una forma de pedirlo a propósito esa vista
    // sólo se comprueba el día que falla en un teléfono de alguien.
    try { if (new URLSearchParams(location.search).get("libro") === "0") return; } catch (_) {}

    const libro = window.LMTPassportBook.mount(cont, {
      paginas: paginasRef.current,
      paginaInicial: 0,
      onReady: () => setBook3d(true),
      onPageChange: (i) => setPage(i),
      onFallback: () => setBook3d(false),
    });
    libroRef.current = libro;

    return () => {
      if (libro) libro.destroy();
      libroRef.current = null;
      setBook3d(false);
    };
  }, [pagesKey]);

  // El perfil llega por su cuenta, segundos después de que el libro esté en
  // pantalla. Sin esto, la hoja de datos se quedaba con «Visitante» y los
  // campos vacíos aunque React ya tuviera el nombre completo.
  React.useEffect(() => {
    const libro = libroRef.current;
    if (libro && libro.setPaginas) libro.setPaginas(paginasLibro, { mantenerIndice: true });
  }, [paginasLibro]);

  // Mientras el libro esté montado él es la fuente de verdad del índice:
  // React sólo lee (onPageChange) y escribe por los botones. Al revés se
  // formaría un bucle setPage -> efecto -> irA -> onPageChange -> setPage.
  const go = (dir) => {
    const libro = libroRef.current;
    if (libro && book3d) {
      dir > 0 ? libro.siguiente() : libro.anterior();
      return;
    }
    if (flipping) return;
    const next = page + dir;
    if (next < 0 || next >= pages.length) return;
    setFlipping(true);
    setTimeout(() => { setPage(next); setFlipping(false); }, 380);
  };

  const total = book3d && libroRef.current ? libroRef.current.totalPaginas() : pages.length;
  const actual = pages[Math.min(page, pages.length - 1)] || pages[0];
  const resumen = actual.type === "stamp"
    ? `Sello: ${actual.stand.nombre}, ${actual.stand.municipio}`
    : actual.type === "cover" ? "Portada del pasaporte"
    : actual.type === "index" ? `Página de datos de ${passport.nombre}`
    : actual.type === "travesia" ? `Recorrido: ${visitados.length} stands sellados`
    : "Fin del pasaporte";

  return (
    <div className="pasaporte-vista" style={{ minHeight: "100dvh", background: "var(--ink)", color: "var(--paper)", padding: "12px 10px 24px" }}>
      <div className="mobile-inner" style={{ background: "transparent", border: "none", boxShadow: "none", padding: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "0 4px", color: "var(--paper-3)" }}>
          {/* Con el perfil completo aquí va el nombre entero, que en un móvil
              estrecho aplasta lo que tiene al lado. Se recorta él. */}
          <div className="mono" style={{
            color: "var(--paper-3)", minWidth: 0, flex: 1,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>Pasaporte · {passport.nombre}</div>
          <button onClick={() => {
            // Cerrar se lleva el testigo también. Dejarlo suelto era la trampa
            // del teléfono prestado: el siguiente escribía otro correo y seguía
            // abriendo el perfil del anterior.
            if (window.LMTPerfil) window.LMTPerfil.olvidar();
            try { localStorage.removeItem("lmt.email"); } catch (_) {}
            window.LMTRouter.go("/");
          }} style={{ color: "var(--paper-3)", fontSize: 12, whiteSpace: "nowrap" }}>Cerrar</button>
          <MenuPublico oscuro/>
        </div>

        {/* El montador inserta su canvas como PRIMER hijo con z-index 0; el
            render CSS vive encima con z-index 1 y desaparece cuando el libro
            avisa que está listo. Así no hay parpadeo en ninguna dirección. */}
        <div className="pasaporte-horizontal">
        <div ref={wrapRef} className="libro-marco" style={{ marginTop: 18, position: "relative" }}>
          {!book3d && (
            <React.Fragment>
              <div style={{ position: "absolute", inset: 0, zIndex: 1, borderRadius: "6px 12px 12px 6px", boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6), -3px 0 0 rgba(0,0,0,0.3)" }}/>
              <div style={{
                position: "absolute", inset: 0, zIndex: 1, borderRadius: "6px 12px 12px 6px",
                background: "var(--paper)", color: "var(--ink)", overflow: "hidden",
                transformStyle: "preserve-3d", transformOrigin: "left center",
                transform: flipping ? "rotateY(-12deg)" : "rotateY(0deg)",
                transition: "transform 0.5s cubic-bezier(.4,.1,.3,1)",
              }}>
                <PassportPage_Page pageData={pages[Math.min(page, pages.length - 1)]} passport={passport} visitados={visitados} totalSlots={Math.max(8, visitados.length)} totalStands={stands.length}/>
              </div>
            </React.Fragment>
          )}
        </div>

        {/* El contenido del pasaporte nunca vive sólo dentro del canvas: un
            lector de pantalla necesita saber en qué página está. */}
        <div role="status" aria-live="polite" style={{
          position: "absolute", width: 1, height: 1, overflow: "hidden",
          clip: "rect(0 0 0 0)", whiteSpace: "nowrap",
        }}>
          Página {page + 1} de {total}. {resumen}
        </div>

        <div className="libro-controles" style={{ marginTop: 18, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px" }}>
          <button onClick={() => go(-1)} disabled={page === 0} style={{
            width: 44, height: 44, borderRadius: "50%",
            background: "var(--paper)", color: "var(--ink)", opacity: page === 0 ? 0.3 : 1,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>←</button>
          <div className="mono" style={{ color: "var(--paper-3)" }}>
            {String(page + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </div>
          <button onClick={() => go(1)} disabled={page >= total - 1} style={{
            width: 44, height: 44, borderRadius: "50%",
            background: "var(--paper)", color: "var(--ink)", opacity: page >= total - 1 ? 0.3 : 1,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>→</button>
        </div>
        <div className="mono" style={{ textAlign: "center", color: "var(--paper-3)", marginTop: 14, lineHeight: 1.6 }}>
          {visitados.length} / {stands.length} stands sellados
        </div>
        {/* Segunda puerta al perfil: quien no lo completó justo tras votar
            vuelve aquí a ver sus sellos, y es donde tiene sentido ofrecérselo
            otra vez sin insistir. */}
        {window.LMTPerfil && window.LMTPerfil.tieneTestigo() && (
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <a href="/perfil" data-route className="mono"
              style={{ color: "var(--paper-3)", textDecoration: "underline", lineHeight: 2 }}>
              Completar mi perfil de visitante
            </a>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

// ── Página de datos ───────────────────────────────────────────────────────
// La hoja que en un pasaporte de verdad lleva la foto y la ficha del titular.
// Antes aquí había un índice de casillas vacías que no decía nada del
// visitante; ahora lleva sus datos, con la misma retícula de etiqueta pequeña
// y valor debajo que usan los documentos reales, y la banda de lectura
// mecánica abajo.
//
// Qué NO aparece: grupo étnico y discapacidad. Se piden para caracterizar al
// público del festival, pero son datos sensibles y esta hoja se enseña y se
// fotografía. Viven en /perfil, que es de la persona y sólo suyo.
const DATO_VACIO = "——";

const etiquetaPerfil = (campo, valor) => {
  if (!valor) return DATO_VACIO;
  const tabla = (window.PERFIL_ETIQUETAS || {})[campo] || {};
  return tabla[valor] || valor;
};

const fechaISO = (iso) => {
  if (!iso) return null;
  const d = new Date(String(iso).replace(" ", "T"));
  return isNaN(d) ? null : d;
};

const MESES_CORTOS = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
const MESES_LARGOS = ["enero","febrero","marzo","abril","mayo","junio","julio",
                      "agosto","septiembre","octubre","noviembre","diciembre"];

const fechaCorta = (iso) => {
  const d = fechaISO(iso);
  if (!d) return DATO_VACIO;
  return String(d.getDate()).padStart(2, "0") + " " + MESES_CORTOS[d.getMonth()] + " " + d.getFullYear();
};

/** «14 abril 2026», como se lee en la hoja del titular de un pasaporte. */
const fechaLarga = (iso) => {
  const d = fechaISO(iso);
  if (!d) return DATO_VACIO;
  return d.getDate() + " " + MESES_LARGOS[d.getMonth()] + " " + d.getFullYear();
};

/** «14·ABR·2026», que es como va en la tinta del sello. */
const fechaSello = (iso) => {
  const d = fechaISO(iso);
  if (!d) return "";
  return String(d.getDate()).padStart(2, "0") + "·" + MESES_CORTOS[d.getMonth()] + "·" + d.getFullYear();
};

const horaSello = (iso) => {
  const d = fechaISO(iso);
  if (!d) return "";
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
};

/** La misma fecha un año después: la vigencia del pasaporte del festival. */
const unAnioDespues = (iso) => {
  const d = fechaISO(iso);
  if (!d) return DATO_VACIO;
  const f = new Date(d.getTime());
  f.setFullYear(f.getFullYear() + 1);
  return fechaLarga(f.toISOString());
};

/**
 * Nombres y apellidos, a partir del único campo de nombre que guarda el perfil.
 *
 * No hay forma de acertar siempre: aquí se usan dos apellidos y quien escribe
 * «María Fernanda Erazo» está dando dos nombres y uno. La convención —la mitad
 * de atrás, redondeando hacia abajo, son apellidos— acierta con los repartos
 * habituales (2+2, 2+1, 1+1) y nunca deja el campo vacío. Es una presentación,
 * no un dato: en la base sigue habiendo un nombre y nada más.
 */
const partirNombre = (completo) => {
  const partes = String(completo || "").trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return { nombres: DATO_VACIO, apellidos: DATO_VACIO };
  if (partes.length === 1) return { nombres: partes[0], apellidos: DATO_VACIO };
  const nAp = Math.floor(partes.length / 2);
  return {
    nombres:   partes.slice(0, partes.length - nAp).join(" "),
    apellidos: partes.slice(partes.length - nAp).join(" "),
  };
};

/** Nacionalidad a partir del país del perfil. Sin país, la del festival. */
const nacionalidadDe = (pais) => {
  const p = String(pais || "").trim();
  if (p === "" || /^colombia$/i.test(p)) return "Colombiana";
  return p;
};

// Banda de lectura mecánica: el remate que hace que la hoja se lea como un
// pasaporte. Va con los datos que ya están arriba, nada nuevo.
const MRZ_ANCHO = 34;   // las dos líneas miden lo mismo o la banda se ve torcida

const bandaMecanica = (passport) => {
  const limpia = (s, n) => String(s || "")
    .toUpperCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .replace(/[^A-Z0-9]/g, "<").slice(0, n).padEnd(n, "<");
  const p = passport.perfil || {};
  const { nombres, apellidos } = partirNombre(passport.nombre);
  // Formato de documento de verdad: apellidos, dos '<', y los nombres.
  const l1 = ("P<COL" + limpia(apellidos, 12) + "<<" + limpia(nombres, 15))
    .slice(0, MRZ_ANCHO).padEnd(MRZ_ANCHO, "<");
  const l2 = (limpia(passport.numero, 12) + "COL" + limpia(p.municipio || "NARINO", 16))
    .slice(0, MRZ_ANCHO).padEnd(MRZ_ANCHO, "<");
  return [l1, l2];
};

/**
 * Lo que enseña la hoja de un sello: las estrellas que puso esta persona a ese
 * stand y cuándo lo selló. Se resuelve en un solo sitio para las dos vistas.
 *
 * Sin estrellas —votó de un toque, que es lo normal— se devuelve la lista
 * vacía y la hoja enseña el veredicto del emoji, que sí tiene.
 */
const datosSello = (passport, stand) => {
  const est = (passport.estrellas || {})[stand.id] || null;
  const titulos = window.titulosEstrellas ? window.titulosEstrellas() : {};
  const estrellas = est ? ESTRELLA_CAMPOS.map((campo) => ({
    titulo: titulos[campo] || campo,
    valor: Number(est[ESTRELLA_CLAVES[campo]]) || 0,
  })).filter((e) => e.valor > 0) : [];

  const cuando = (passport.sellos || {})[stand.id] || "";
  const v = VALORACION[(passport.valoraciones || {})[stand.id]] || null;
  return {
    estrellas,
    veredicto: estrellas.length ? "" : (v ? v.texto : ""),
    veredictoPal: v ? v.token : "--ink-3",
    fecha: fechaSello(cuando),
    hora: horaSello(cuando),
  };
};

// Los mismos valores que pinta <PaginaDatos>, en plano, para el libro 3D.
// Uno solo los calcula y las dos vistas no pueden acabar diciendo cosas
// distintas de la misma persona.
/**
 * El retrato del portador: foto, emoji o nada.
 *
 * Vive aparte porque lo usan el recuadro de la hoja de datos y el libro 3D, y
 * porque el orden importa: la foto manda sobre el emoji, y si no hay ninguna
 * de las dos, quien pinta decide (la inicial en la hoja de datos).
 */
const retratoDe = (passport) => {
  const p = passport.perfil || {};
  return { foto: urlImagen(p.avatar) || "", emoji: p.avatar_emoji || "" };
};

const datosPagina = (passport, totalStands) => {
  const p = passport.perfil || {};
  const [mrz1, mrz2] = bandaMecanica(passport);
  const { nombres, apellidos } = partirNombre(passport.nombre);
  return {
    nombre:      passport.nombre,
    nombres:     nombres,
    apellidos:   apellidos,
    correo:      passport.correo,
    numero:      passport.numero || DATO_VACIO,
    numero_qr:   passport.numeroQr || "",
    sexo:        etiquetaPerfil("genero", p.genero),
    edad:        etiquetaPerfil("rango_edad", p.rango_edad),
    procedencia: [p.municipio, p.departamento].filter(Boolean).join(", ") || p.pais || DATO_VACIO,
    nacionalidad: nacionalidadDe(p.pais),
    visitante:   p.entidad || etiquetaPerfil("tipo_visitante", p.tipo_visitante),
    expedido:    fechaLarga(passport.inicio),
    valido:      unAnioDespues(passport.inicio),
    ultima:      passport.ultimaVisita ? fechaLarga(passport.ultimaVisita) : fechaLarga(passport.inicio),
    sellos:      passport.visitados.length,
    conPerfil:   !!passport.perfil,
    totalStands: totalStands,
    retrato_foto:  retratoDe(passport).foto,
    retrato_emoji: retratoDe(passport).emoji,
    iniciales:   iniciales(passport.nombre),
    mrz1, mrz2,
  };
};

/** Las iniciales del portador, para el retrato cuando no hay foto ni emoji. */
const iniciales = (completo) => {
  const partes = String(completo || "").trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return "V";
  if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
  return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
};

// Un dato de la ficha. `tam` sube el tamaño del valor: la hoja se mira en un
// teléfono y a 12 px no se leía nada, así que lo importante va grande y la
// etiqueta pequeña, que es además como se ven los documentos de verdad.
const CampoDato = ({ etiqueta, valor, ancho, tam = 18, mono = false }) => (
  <div style={{ flex: ancho || 1, minWidth: 0 }}>
    <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.3 }}>{etiqueta}</div>
    <div className={mono ? "mono" : undefined} style={{
      fontSize: tam, lineHeight: 1.2, marginTop: 2,
      // Las fechas y los números van en la mono, como en un documento real; en
      // ella la caja de mayúsculas es la misma y la línea no se descuadra.
      textTransform: mono ? "none" : undefined,
      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
    }}>{valor}</div>
  </div>
);

/** Renglón fino entre campos, como los de la hoja del titular. */
const RayaFina = ({ margen = "6px 0" }) => (
  <div style={{ height: 1, background: "var(--line)", margin: margen }}/>
);

/**
 * El recuadro del retrato.
 *
 * Con foto, la foto llena el recuadro. Sin foto, el fondo rayado en diagonal
 * —el mismo del resto de la interfaz para lo que falta— y encima el emoji que
 * eligió o sus iniciales en un disco, que es lo que hace que el hueco se lea
 * como «aquí va una foto» y no como un error.
 */
const RetratoPortador = ({ retrato, iniciales: ini }) => (
  <div style={{
    width: 98, height: 118, flexShrink: 0,
    border: "1px solid var(--line-2)", borderRadius: 4,
    position: "relative", overflow: "hidden",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    background: retrato.foto ? "var(--paper-2)"
      : "repeating-linear-gradient(45deg, var(--paper-2), var(--paper-2) 7px, var(--paper-3) 7px, var(--paper-3) 14px)",
  }}>
    {retrato.foto ? (
      <img src={retrato.foto} alt="" style={{
        position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
      }}/>
    ) : (
      <React.Fragment>
        <div style={{
          width: 54, height: 54, borderRadius: "50%", background: "var(--grano)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--paper)",
        }}>
          {retrato.emoji
            ? <span style={{ fontSize: 28, lineHeight: 1 }} aria-hidden="true">{retrato.emoji}</span>
            : <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 23, lineHeight: 1 }}>{ini}</span>}
        </div>
        <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 10 }}>FOTOGRAFÍA</div>
      </React.Fragment>
    )}
  </div>
);

const PaginaDatos = ({ passport, totalStands }) => {
  const d = datosPagina(passport, totalStands);
  const retrato = retratoDe(passport);

  return (
    <div style={{ height: "100%", padding: 11, display: "flex", flexDirection: "column" }}>
      {/* Marco interior: en la hoja del titular de un pasaporte todo el bloque
          de datos va dentro de un recuadro, y sin él esto parecía un formulario. */}
      <div style={{
        flex: 1, minHeight: 0, border: "1px solid var(--line-2)", borderRadius: 4,
        padding: "11px 13px 10px", display: "flex", flexDirection: "column",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div className="mono" style={{ fontSize: 11, color: "var(--ink-2)", lineHeight: 1.4 }}>
            REPÚBLICA DE COLOMBIA<br/>DEPARTAMENTO DE NARIÑO
          </div>
          <LogoTaza size={24}/>
        </div>
        <RayaFina margen="8px 0 9px"/>

        <div style={{ display: "flex", gap: 13 }}>
          <RetratoPortador retrato={retrato} iniciales={d.iniciales}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* El número es lo que identifica el documento: va primero, grande
                y en el color del sello, como el número impreso en rojo de un
                pasaporte de verdad. */}
            <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.3 }}>NÚMERO DE PASAPORTE</div>
            <div className="mono" style={{
              fontSize: 19, lineHeight: 1.2, marginTop: 2, color: "var(--grano)",
              textTransform: "none", letterSpacing: "0.01em",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>{d.numero}</div>
            <RayaFina margen="5px 0"/>
            <CampoDato etiqueta="APELLIDOS" valor={d.apellidos} tam={16}/>
            <RayaFina margen="5px 0"/>
            <CampoDato etiqueta="NOMBRES" valor={d.nombres} tam={16}/>
          </div>
        </div>

        <RayaFina margen="9px 0"/>
        <div style={{ display: "flex", gap: 12 }}>
          <CampoDato etiqueta="CIUDAD DE ORIGEN" valor={d.procedencia} tam={16}/>
          <CampoDato etiqueta="NACIONALIDAD" valor={d.nacionalidad} tam={16}/>
        </div>
        <RayaFina/>
        <div style={{ display: "flex", gap: 12 }}>
          <CampoDato etiqueta="EXPEDICIÓN" valor={d.expedido} tam={15} mono/>
          <CampoDato etiqueta="VÁLIDO HASTA" valor={d.valido} tam={15} mono/>
        </div>
        <RayaFina/>
        <div style={{ display: "flex", gap: 12 }}>
          <CampoDato etiqueta="ÚLTIMA VISITA" valor={d.ultima} tam={15} mono/>
          <CampoDato etiqueta="SELLOS" valor={d.sellos + " de " + totalStands} tam={15} mono/>
        </div>
        <RayaFina/>
        <CampoDato etiqueta="CORREO REGISTRADO" valor={d.correo} tam={15}/>

        {!passport.perfil && (
          <p style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.4, margin: "8px 0 0", whiteSpace: "nowrap" }}>
            Completa tu perfil y esta hoja se llena sola.
          </p>
        )}

        {/* Firma y código, abajo del todo como en el documento real. */}
        <div style={{ marginTop: "auto", paddingTop: 6, flexShrink: 0, display: "flex", alignItems: "flex-end", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 21,
              lineHeight: 1.1, color: "var(--grano)",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>{passport.nombre}</div>
            <div style={{ height: 1, background: "var(--ink-3)", opacity: 0.5, margin: "4px 0 4px", maxWidth: 165 }}/>
            <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>FIRMA DEL PORTADOR</div>
          </div>
          {d.numero_qr && (
            <img src={d.numero_qr} alt={"Código del pasaporte " + d.numero} width={46} height={46}
              style={{ width: 46, height: 46, imageRendering: "pixelated", flexShrink: 0 }}/>
          )}
        </div>

        <div className="mono" style={{
          fontSize: 11, letterSpacing: "0.02em", lineHeight: 1.5,
          marginTop: 8, color: "var(--ink-2)", textTransform: "none",
          // Sin esto, el flex la encoge en vez de desbordar y la SEGUNDA línea
          // de la banda desaparecía sin que nada lo delatara.
          flexShrink: 0, whiteSpace: "nowrap", overflow: "hidden",
        }}>
          {d.mrz1}<br/>{d.mrz2}
        </div>
      </div>
    </div>
  );
};

// ── Hoja del recorrido ────────────────────────────────────────────────────
// Va al final, cuando ya hay algo que resumir: qué stands se visitaron, en
// qué orden y qué calificación les puso. La calificación sólo llega si este
// navegador guarda el testigo del visitante (ver api/routes/pasaportes.php).
// `token` es el nombre crudo de la variable: el render CSS lo envuelve en
// var(), y el libro 3D lo busca en su paleta —que resuelve los mismos tokens
// a rgb porque Canvas2D no entiende oklch—.
const VALORACION = {
  bueno:   { texto: "Excelente", token: "--good" },
  regular: { texto: "Regular",   token: "--meh" },
  malo:    { texto: "Mejorable", token: "--bad" },
};

// Lo que se enseña en la hoja del recorrido, en un sitio y para las dos vistas.
const filasTravesia = (passport, visitados) => {
  const val = passport.valoraciones || {};
  return visitados.map((s, i) => {
    const v = VALORACION[val[s.id]] || null;
    return {
      n: String(i + 1).padStart(2, "0"),
      nombre: s.nombre,
      logo: urlImagen(s.logo) || "",
      color: s.color || "var(--grano)",
      inicial: (s.nombre || "?").trim().charAt(0).toUpperCase(),
      municipio: s.municipio || "",
      valoracion: v ? v.texto : "",
      color: "var(" + (v ? v.token : "--ink-3") + ")",
      colorPal: v ? v.token : "--ink-3",
    };
  });
};

/**
 * Logo del stand en círculo. Sin logo, la inicial sobre el color del sello:
 * la fila mantiene su ritmo aunque el caficultor no haya subido imagen.
 */
/**
 * Cuánto se descoloca el sello sobre el logo, en píxeles.
 *
 * Derivado del id del stand y no de Math.random(): el desvío tiene que ser el
 * mismo cada vez que se abre esa página. Con aleatoriedad de verdad el sello
 * bailaría al pasar la hoja adelante y atrás, que es exactamente lo que un
 * sello de tinta no hace.
 */
const desvioSello = (id) => {
  let h = 0;
  for (let i = 0; i < String(id).length; i++) h = (h * 31 + String(id).charCodeAt(i)) >>> 0;
  return { x: (h % 21) - 10, y: ((h >> 5) % 21) - 10 };
};

const LogoRedondo = ({ fila, tam = 26 }) => (
  <div style={{
    width: tam, height: tam, flexShrink: 0, borderRadius: "50%", overflow: "hidden",
    border: "1px solid var(--line-2)", background: fila.color,
    display: "flex", alignItems: "center", justifyContent: "center",
  }}>
    {fila.logo
      ? <img src={fila.logo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
      : <span style={{
          fontFamily: "var(--font-display)", fontStyle: "italic",
          fontSize: Math.round(tam * 0.55), color: "var(--paper)", lineHeight: 1,
        }}>{fila.inicial}</span>}
  </div>
);

const PaginaTravesia = ({ passport, visitados, totalStands }) => {
  const filas = filasTravesia(passport, visitados);
  const faltan = Math.max(0, totalStands - filas.length);

  return (
    <div style={{ height: "100%", padding: "22px 22px 0", display: "flex", flexDirection: "column" }}>
      <div className="mono" style={{ fontSize: 12, marginBottom: 6 }}>Recorrido</div>
      <h2 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 30, fontWeight: 400, margin: "0 0 4px", lineHeight: 1 }}>
        Tu travesía.
      </h2>
      <p style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.5, margin: "0 0 14px" }}>
        {filas.length === 1 ? "El stand que sellaste" : `Los ${filas.length} stands que sellaste`}
        {passport.valoraciones && Object.keys(passport.valoraciones).length ? ", con tu calificación." : "."}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 9, overflow: "hidden" }}>
        {filas.map((f) => (
          <div key={f.n} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="mono" style={{ fontSize: 12, width: 20, flexShrink: 0, color: "var(--ink-3)" }}>{f.n}</span>
            <LogoRedondo fila={f} tam={28}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, lineHeight: 1.25, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {f.nombre}
              </div>
              {f.municipio && (
                <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{f.municipio}</div>
              )}
            </div>
            {f.valoracion && (
              <span className="mono" style={{ fontSize: 11, color: f.color, flexShrink: 0 }}>{f.valoracion}</span>
            )}
          </div>
        ))}
      </div>

      <div className="mono" style={{ fontSize: 12, marginTop: "auto", padding: "14px 0 18px", borderTop: "1px solid var(--line-2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{filas.length} sellados</span>
          <span>{faltan} faltantes</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Fondos que subió el organizador, o vacío si no subió ninguno.
 *
 * `hojas` se reparte por las páginas de dentro en orden y se repite en cuanto
 * se acaba: con dos imágenes y ocho sellos, cada una sale cuatro veces y
 * siempre la misma en la misma hoja. El índice se pasa desde fuera porque cada
 * página tiene que saber cuál le toca, y sin eso el reparto cambiaría al
 * repintar.
 */
const fondosPasaporte = () => {
  const a = (window.LMTFestival && window.LMTFestival.ajustes()) || {};
  const p = a.pasaporte || {};
  return {
    portada: urlImagen(p.portada) || "",
    contraportada: urlImagen(p.contraportada) || "",
    hojas: (p.hojas || []).map((h) => urlImagen(h)).filter(Boolean),
  };
};

const fondoDeHoja = (indice) => {
  const hojas = fondosPasaporte().hojas;
  if (!hojas.length) return "";
  return hojas[((indice % hojas.length) + hojas.length) % hojas.length];
};

/** Capa de imagen bajo el texto, con velo para que el texto siga legible. */
const CapaFondo = ({ url }) => {
  if (!url) return null;
  return (
    <React.Fragment>
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: `url(${url})`, backgroundSize: "cover", backgroundPosition: "center",
      }}/>
      {/* Sin velo, un fondo con contraste se come el texto de la hoja. Es la
          misma razón por la que el logo del sello lleva el suyo. */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, background: "var(--paper)", opacity: 0.78 }}/>
    </React.Fragment>
  );
};

/**
 * Una hoja del pasaporte: el fondo debajo y su contenido encima.
 *
 * El fondo se pone aquí y no dentro de cada tipo de página porque son cinco
 * tipos distintos y cada uno tendría que acordarse; así lo tiene cualquiera.
 */
/**
 * Hoja de tamaño fijo, escalada al hueco que tenga.
 *
 * Todas las hojas se diseñan sobre 380×528 —la misma proporción 0.72 del
 * libro— y se escalan enteras. Es lo que ya hacía el libro 3D, que dibuja
 * sobre un lienzo de proporción fija, y hasta ahora el render CSS era el
 * único que no: con medidas en píxeles fijos, la hoja de datos cabía en un
 * teléfono de 390 y se salía por abajo en uno de 360, perdiendo la firma y la
 * banda mecánica. Escalando, las dos vistas enseñan exactamente lo mismo en
 * cualquier pantalla y un tamaño de letra decidido aquí significa lo mismo en
 * todas partes.
 */
const HOJA_ANCHO = 380;
const HOJA_ALTO = Math.round(HOJA_ANCHO / 0.72);

const HojaEscalada = ({ children }) => {
  const ref = React.useRef(null);
  const [k, setK] = React.useState(1);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const medir = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0) setK(r.width / HOJA_ANCHO);
    };
    medir();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(medir) : null;
    if (ro) ro.observe(el); else window.addEventListener("resize", medir);
    return () => {
      if (ro) ro.disconnect(); else window.removeEventListener("resize", medir);
    };
  }, []);

  return (
    <div ref={ref} style={{ height: "100%", overflow: "hidden" }}>
      <div style={{
        width: HOJA_ANCHO, height: HOJA_ALTO,
        transformOrigin: "top left", transform: `scale(${k})`,
      }}>{children}</div>
    </div>
  );
};

const PassportPage_Page = (props) => {
  // La portada se pinta su propio fondo: es oscura, y el velo de papel de las
  // hojas la dejaría lavada y con el texto claro ilegible.
  const propio = props.pageData.type === "cover";
  return (
    <div style={{ height: "100%", position: "relative", overflow: "hidden" }}>
      {!propio && <CapaFondo url={props.pageData.fondo || ""}/>}
      <div style={{ position: "relative", zIndex: 1, height: "100%" }}>
        <HojaEscalada><PaginaContenido {...props}/></HojaEscalada>
      </div>
    </div>
  );
};

const PaginaContenido = ({ pageData, passport, visitados, totalSlots, totalStands }) => {
  // Con fondo subido, los renglones sobran: son dos texturas peleándose.
  const fondo = pageData.fondo || "";
  const lineBg = fondo
    ? {}
    : { backgroundImage: "repeating-linear-gradient(var(--paper) 0, var(--paper) 26px, var(--line) 26px, var(--line) 27px)" };

  if (pageData.type === "cover") {
    return (
      <div style={{
        height: "100%", padding: 28, display: "flex", flexDirection: "column", justifyContent: "space-between",
        // Con imagen de portada, el degradado se queda debajo como respaldo y
        // encima va un velo OSCURO —no de papel como en las hojas—: el texto
        // de la tapa va en claro y sobre una foto clara desaparecería.
        background: fondo
          ? `linear-gradient(rgba(44,32,24,0.55), rgba(44,32,24,0.55)), url(${fondo}) center/cover, linear-gradient(135deg, var(--grano) 0%, oklch(0.32 0.08 45) 100%)`
          : "linear-gradient(135deg, var(--grano) 0%, oklch(0.32 0.08 45) 100%)",
        color: "var(--paper)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ filter: "invert(1) hue-rotate(180deg)" }}><LogoTaza size={36}/></div>
          <div className="mono" style={{ color: "var(--paper-3)", textAlign: "right" }}>NARIÑO<br/>COLOMBIA</div>
        </div>
        <div>
          <div className="mono" style={{ color: "var(--paper-3)" }}>Pasaporte del Café</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 48, fontWeight: 400, margin: "6px 0 0", lineHeight: 0.9, letterSpacing: "-0.02em" }}>
            La Mejor<br/>Taza.
          </h1>
        </div>
        <div>
          <div style={{ height: 1, background: "var(--paper-3)", opacity: 0.3, marginBottom: 16 }}/>
          <div className="mono" style={{ color: "var(--paper-3)", marginBottom: 4 }}>Portador</div>
          <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 26, fontWeight: 400 }}>{passport.nombre}</div>
          <div style={{ fontSize: 12, color: "var(--paper-3)", marginTop: 6 }}>{passport.correo}</div>
        </div>
      </div>
    );
  }

  if (pageData.type === "index") {
    // Con renglones, como el resto de las hojas: es papel del mismo cuaderno.
    return (
      <div style={{ height: "100%", ...lineBg }}>
        <PaginaDatos passport={passport} totalStands={totalStands}/>
      </div>
    );
  }

  if (pageData.type === "travesia") {
    return <PaginaTravesia passport={passport} visitados={visitados} totalStands={totalStands}/>;
  }

  if (pageData.type === "stamp") {
    const s = pageData.stand;
    const rot = ((s.id.charCodeAt(s.id.length - 1) || 0) % 20) - 10;
    const desv = desvioSello(s.id);
    const logo = urlImagen(s.logo);
    const sello = datosSello(passport, s);
    return (
      <div style={{ height: "100%", padding: 20, ...lineBg, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div className="mono" style={{ fontSize: 12, marginBottom: 6 }}>Sello · {s.municipio}</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 28, fontWeight: 400, margin: "0 0 4px", lineHeight: 1 }}>
          {s.nombre}
        </h2>
        <div style={{ fontSize: 13, color: "var(--ink-3)" }}>{s.region}</div>

        {/* La zona del sello se lleva el espacio que sobre: así la votación y
            el pie quedan siempre abajo, con muchos stands o con pocos. */}
        <div style={{ flex: 1, minHeight: 120, position: "relative" }}>
          {/* El logo del stand, centrado y en círculo, DEBAJO del sello. Si el
              caficultor no subió ninguno no se dibuja nada y el sello queda como
              estaba: no se inventa un hueco vacío. */}
          {logo && (
            <div style={{
              position: "absolute", top: "50%", left: "54%",
              transform: "translate(-50%, -50%)",
              width: 132, height: 132, borderRadius: "50%", overflow: "hidden",
              border: "1px solid var(--line-2)",
            }}>
              <img src={logo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
              {/* Velo de papel sobre el logo. Sin él, un logo oscuro se traga la
                  tinta del sello y no se lee ni una cosa ni la otra. Así el logo
                  se reconoce y el sello manda, que es el orden correcto. */}
              <div style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                background: "var(--paper)", opacity: 0.62,
              }}/>
            </div>
          )}

          {/* El sello, encima y descolocado a propósito: un sello puesto a mano
              nunca cae centrado, y verlo clavado sobre el logo delataba que lo
              pinta un programa. El desvío es estable por stand, no cambia al
              pasar la página. */}
          <div style={{
            position: "absolute",
            top: `calc(50% + ${desv.y}px)`, left: `calc(46% + ${desv.x}px)`,
            transform: "translate(-50%, -50%)",
            "--stamp-rot": rot + "deg",
            animation: "stamp-land 0.6s cubic-bezier(.2,.8,.2,1.2) forwards",
          }}>
            <SelloCircular stand={s} size={150} rotation={rot} fecha={sello.fecha}/>
          </div>
        </div>

        {/* Lo que esta persona votó en este stand. Es suyo y de nadie más: sin
            el testigo del perfil el servidor no lo manda, y aquí no se enseña. */}
        {sello.estrellas.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8, maxWidth: 250 }}>
            {sello.estrellas.map((e) => (
              <EstrellasLectura key={e.titulo} valor={e.valor} tam={15} etiqueta={e.titulo}/>
            ))}
          </div>
        )}
        {sello.veredicto && (
          <div className="mono" style={{ fontSize: 12, color: `var(${sello.veredictoPal})`, marginBottom: 8 }}>
            {sello.veredicto}
          </div>
        )}

        <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--font-display)" }}>
          "{s.descripcion}"
        </div>

        {/* Pie: cuándo se selló. La hora es la del voto, no la de ahora. */}
        {(sello.fecha || sello.hora) && (
          <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid var(--line-2)", display: "flex", justifyContent: "space-between" }}>
            <span className="mono" style={{ fontSize: 12, color: "var(--ink-3)" }}>{sello.fecha}</span>
            <span className="mono" style={{ fontSize: 12, color: "var(--ink-3)" }}>{sello.hora}</span>
          </div>
        )}
      </div>
    );
  }

  if (pageData.type === "end") {
    return (
      <div style={{ height: "100%", padding: 28, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", ...lineBg }}>
        <div className="mono" style={{ fontSize: 12 }}>Fin del pasaporte</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 32, fontWeight: 400, margin: "12px 0 8px", lineHeight: 1 }}>
          Gracias por<br/>caminar el café<br/>con nosotros.
        </h2>
        <div style={{ marginTop: 20, padding: "12px 18px", border: "1px solid var(--line-2)", borderRadius: 999, fontSize: 14 }}>
          Vuelve el próximo festival
        </div>
      </div>
    );
  }
  return null;
};

// `datosPagina` sale al exterior porque es el único sitio donde se decide qué
// dice la hoja de datos, y las dos vistas (CSS y libro 3D) la comparten: poder
// comprobarla directamente evita tener que leer píxeles de un canvas.
Object.assign(window, { PassportPage, datosPagina, datosSello, partirNombre });
