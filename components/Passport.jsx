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
      const g = (window.LMTPerfil && window.LMTPerfil.leer()) || {};
      const t = g.correo === String(correo).toLowerCase() ? g.token : "";
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

  if (askingEmail) {
    return (
      <div className="mobile-page">
        <div className="mobile-inner">
          <a href="/festival" data-route style={{ color: "var(--ink-3)", fontSize: 13 }}>← Volver al ranking</a>
          <div className="mono" style={{ marginTop: 24 }}>Mi pasaporte</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 36, fontWeight: 400, margin: "6px 0 12px", lineHeight: 1.05 }}>
            Identifícate con el<br/>correo que usaste<br/>al votar.
          </h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            const sec = window.LMTSecurity;
            const v = (e.target.correo.value || "").trim();
            if (!sec || !sec.isEmail(v)) { setError("Correo inválido."); return; }
            try { localStorage.setItem("lmt.email", sec.normalizeEmail(v)); } catch (_) {}
            setEmail(v);
          }}>
            <div className="field" style={{ marginTop: 24 }}>
              <label>Correo</label>
              <input name="correo" type="email" inputMode="email" autoComplete="email" required maxLength={254} placeholder="nombre@correo.co"/>
            </div>
            {error && <div role="alert" style={{ color: "var(--bad)", fontSize: 13, marginTop: 8 }}>{error}</div>}
            <button className="btn btn-primary" type="submit" style={{ width: "100%", justifyContent: "center", padding: 14, marginTop: 20 }}>
              Ver mi pasaporte →
            </button>
          </form>
        </div>
      </div>
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
    correo: data.correo || email,
    numero: data.numero || "",
    inicio: data.inicio || "",
    visitados: visitadosIds,
    valoraciones: data.valoraciones || {},
    perfil: perfil,
  };
  // El recorrido va AL FINAL: primero la hoja de datos, luego los sellos que se
  // fueron ganando y, al cerrar, el resumen de lo que se visitó y cómo se
  // calificó. Al principio no tenía nada que contar.
  const pages = [
    { type: "cover" },
    { type: "index" },
    ...visitados.map((s) => ({ type: "stamp", stand: s })),
    { type: "travesia" },
    { type: "end" },
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

  // Clave estable: sin memoizar, el efecto se re-ejecutaría en cada render y
  // acumularía libros (y contextos WebGL) hasta tumbar la pestaña.
  const pagesKey = React.useMemo(
    () => visitadosIds.join(",") + "|" + stands.length,
    [visitadosIds, stands.length]
  );

  // Las páginas se arman aparte porque el perfil del visitante llega DESPUÉS
  // de montar el libro: la hoja de datos se repinta con setPaginas y así no
  // hay que tirar el contexto WebGL y volver a crearlo sólo por un nombre.
  const paginasLibro = React.useMemo(() => [
    { tipo: "portada", nombre: passport.nombre, correo: passport.correo, inicio: passport.inicio },
    Object.assign(
      { tipo: "indice", visitados: visitados.length, totalStands: stands.length },
      datosPagina(passport, stands.length)
    ),
    ...visitados.map((s, i) => ({ tipo: "sello", indice: i, stand: s })),
    {
      tipo: "travesia",
      filas: filasTravesia(passport, visitados),
      visitados: visitados.length,
      totalStands: stands.length,
    },
    { tipo: "final", visitados: visitados.length, totalStands: stands.length },
  ], [pagesKey, passport.nombre, passport.correo, passport.inicio, passport.numero,
      passport.perfil, passport.valoraciones]);

  const paginasRef = React.useRef(paginasLibro);
  paginasRef.current = paginasLibro;

  React.useEffect(() => {
    const cont = wrapRef.current;
    if (!cont || !window.LMTPassportBook || !window.LMTPassportBook.soportado()) return;

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
          <a href="/festival" data-route style={{ color: "var(--paper-3)", fontSize: 13, whiteSpace: "nowrap" }}>← Salir</a>
          {/* Con el perfil completo aquí va el nombre entero, que en un móvil
              estrecho aplasta los dos botones de los lados. Se recorta él. */}
          <div className="mono" style={{
            color: "var(--paper-3)", minWidth: 0, flex: 1, textAlign: "center",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>Pasaporte · {passport.nombre}</div>
          <button onClick={() => {
            try { localStorage.removeItem("lmt.email"); } catch (_) {}
            window.LMTRouter.go("/");
          }} style={{ color: "var(--paper-3)", fontSize: 12, whiteSpace: "nowrap" }}>Cerrar</button>
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

const fechaCorta = (iso) => {
  if (!iso) return DATO_VACIO;
  const d = new Date(String(iso).replace(" ", "T"));
  if (isNaN(d)) return DATO_VACIO;
  const meses = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
  return String(d.getDate()).padStart(2, "0") + " " + meses[d.getMonth()] + " " + d.getFullYear();
};

// Banda de lectura mecánica: el remate que hace que la hoja se lea como un
// pasaporte. Va con los datos que ya están arriba, nada nuevo.
const MRZ_ANCHO = 31;   // las dos líneas miden lo mismo o la banda se ve torcida

const bandaMecanica = (passport) => {
  const limpia = (s, n) => String(s || "")
    .toUpperCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .replace(/[^A-Z0-9]/g, "<").slice(0, n).padEnd(n, "<");
  const p = passport.perfil || {};
  const l1 = ("PC<COL" + limpia(passport.nombre, 25)).slice(0, MRZ_ANCHO).padEnd(MRZ_ANCHO, "<");
  const l2 = (limpia(passport.numero, 12) + "COL" + limpia(p.municipio || "NARINO", 16))
    .slice(0, MRZ_ANCHO).padEnd(MRZ_ANCHO, "<");
  return [l1, l2];
};

// Los mismos valores que pinta <PaginaDatos>, en plano, para el libro 3D.
// Uno solo los calcula y las dos vistas no pueden acabar diciendo cosas
// distintas de la misma persona.
const datosPagina = (passport, totalStands) => {
  const p = passport.perfil || {};
  const [mrz1, mrz2] = bandaMecanica(passport);
  return {
    nombre:      passport.nombre,
    correo:      passport.correo,
    numero:      passport.numero || DATO_VACIO,
    sexo:        etiquetaPerfil("genero", p.genero),
    edad:        etiquetaPerfil("rango_edad", p.rango_edad),
    procedencia: [p.municipio, p.departamento].filter(Boolean).join(", ") || p.pais || DATO_VACIO,
    visitante:   p.entidad || etiquetaPerfil("tipo_visitante", p.tipo_visitante),
    expedido:    fechaCorta(passport.inicio),
    conPerfil:   !!passport.perfil,
    totalStands: totalStands,
    mrz1, mrz2,
  };
};

const CampoDato = ({ etiqueta, valor, ancho }) => (
  <div style={{ flex: ancho || 1, minWidth: 0 }}>
    <div className="mono" style={{ fontSize: 8, color: "var(--ink-3)", lineHeight: 1.4 }}>{etiqueta}</div>
    <div style={{
      fontSize: 12, lineHeight: 1.25, marginTop: 1,
      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
    }}>{valor}</div>
  </div>
);

const PaginaDatos = ({ passport, totalStands }) => {
  const p = passport.perfil || {};
  const procedencia = [p.municipio, p.departamento].filter(Boolean).join(", ")
    || p.pais || DATO_VACIO;
  const entidad = p.entidad || etiquetaPerfil("tipo_visitante", p.tipo_visitante);
  const [mrz1, mrz2] = bandaMecanica(passport);
  const sellos = passport.visitados.length;

  return (
    <div style={{ height: "100%", padding: "18px 18px 0", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div className="mono" style={{ fontSize: 9 }}>REPÚBLICA DE COLOMBIA · NARIÑO</div>
        <div className="mono" style={{ fontSize: 9, color: "var(--ink-3)" }}>P·CAFÉ</div>
      </div>
      <div style={{ height: 1, background: "var(--line-2)", margin: "8px 0 12px" }}/>

      <div style={{ display: "flex", gap: 14 }}>
        {/* Donde va la foto: aquí, las iniciales y los sellos conseguidos. */}
        <div style={{
          width: 74, height: 92, flexShrink: 0, border: "1px solid var(--line-2)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          background: "var(--paper-2, transparent)",
        }}>
          <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 30, lineHeight: 1 }}>
            {(passport.nombre || "V").trim().charAt(0).toUpperCase()}
          </div>
          <div className="mono" style={{ fontSize: 8, color: "var(--ink-3)", marginTop: 8 }}>SELLOS</div>
          <div className="mono" style={{ fontSize: 14 }}>{String(sellos).padStart(2, "0")}</div>
        </div>

        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 7 }}>
          <CampoDato etiqueta="PORTADOR / BEARER" valor={passport.nombre}/>
          <div style={{ display: "flex", gap: 10 }}>
            <CampoDato etiqueta="SEXO" valor={etiquetaPerfil("genero", p.genero)}/>
            <CampoDato etiqueta="EDAD" valor={etiquetaPerfil("rango_edad", p.rango_edad)} ancho={1.4}/>
          </div>
          <CampoDato etiqueta="PROCEDENCIA" valor={procedencia}/>
          <CampoDato etiqueta="Nº DE PASAPORTE" valor={passport.numero || DATO_VACIO}/>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <CampoDato etiqueta="EXPEDIDO" valor={fechaCorta(passport.inicio)}/>
        <CampoDato etiqueta="VISITANTE" valor={entidad} ancho={1.6}/>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 7 }}>
        <CampoDato etiqueta="CONTACTO" valor={passport.correo} ancho={2}/>
        <CampoDato etiqueta="AVANCE" valor={sellos + " / " + totalStands}/>
      </div>

      {!passport.perfil && (
        <p style={{ fontSize: 10, color: "var(--ink-3)", lineHeight: 1.5, marginTop: 12 }}>
          Completa tu perfil de visitante y esta hoja se llena con tus datos.
        </p>
      )}

      <div style={{ display: "flex", gap: 10, alignItems: "flex-end", marginTop: 16 }}>
        <CampoDato etiqueta="AUTORIDAD EXPEDIDORA" valor="Gobernación de Nariño" ancho={1.5}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="mono" style={{ fontSize: 8, color: "var(--ink-3)", lineHeight: 1.4 }}>FIRMA</div>
          <div style={{ borderBottom: "1px dotted var(--line-2)", height: 16 }}/>
        </div>
      </div>

      <div style={{ marginTop: "auto" }}>
        <div style={{ height: 1, background: "var(--line-2)" }}/>
        <div className="mono" style={{
          fontSize: 9, letterSpacing: "0.08em", lineHeight: 1.7,
          padding: "8px 0 14px", color: "var(--ink-2)",
          whiteSpace: "nowrap", overflow: "hidden",
        }}>
          {mrz1}<br/>{mrz2}
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
      municipio: s.municipio || "",
      valoracion: v ? v.texto : "",
      color: "var(" + (v ? v.token : "--ink-3") + ")",
      colorPal: v ? v.token : "--ink-3",
    };
  });
};

const PaginaTravesia = ({ passport, visitados, totalStands }) => {
  const filas = filasTravesia(passport, visitados);
  const faltan = Math.max(0, totalStands - filas.length);

  return (
    <div style={{ height: "100%", padding: "22px 22px 0", display: "flex", flexDirection: "column" }}>
      <div className="mono" style={{ marginBottom: 6 }}>Recorrido</div>
      <h2 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 28, fontWeight: 400, margin: "0 0 4px", lineHeight: 1 }}>
        Tu travesía.
      </h2>
      <p style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.5, margin: "0 0 14px" }}>
        {filas.length === 1 ? "El stand que sellaste" : `Los ${filas.length} stands que sellaste`}
        {passport.valoraciones && Object.keys(passport.valoraciones).length ? ", con tu calificación." : "."}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 9, overflow: "hidden" }}>
        {filas.map((f) => (
          <div key={f.n} style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
            <span className="mono" style={{ width: 20, flexShrink: 0, color: "var(--ink-3)" }}>{f.n}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, lineHeight: 1.25, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {f.nombre}
              </div>
              {f.municipio && (
                <div className="mono" style={{ fontSize: 9, color: "var(--ink-3)" }}>{f.municipio}</div>
              )}
            </div>
            {f.valoracion && (
              <span className="mono" style={{ fontSize: 9, color: f.color, flexShrink: 0 }}>{f.valoracion}</span>
            )}
          </div>
        ))}
      </div>

      <div className="mono" style={{ marginTop: "auto", padding: "14px 0 18px", borderTop: "1px solid var(--line-2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{filas.length} sellados</span>
          <span>{faltan} faltantes</span>
        </div>
      </div>
    </div>
  );
};

const PassportPage_Page = ({ pageData, passport, visitados, totalSlots, totalStands }) => {
  const lineBg = { backgroundImage: "repeating-linear-gradient(var(--paper) 0, var(--paper) 26px, var(--line) 26px, var(--line) 27px)" };

  if (pageData.type === "cover") {
    return (
      <div style={{
        height: "100%", padding: 28, display: "flex", flexDirection: "column", justifyContent: "space-between",
        background: "linear-gradient(135deg, var(--grano) 0%, oklch(0.32 0.08 45) 100%)", color: "var(--paper)",
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
    return <PaginaDatos passport={passport} totalStands={totalStands}/>;
  }

  if (pageData.type === "travesia") {
    return <PaginaTravesia passport={passport} visitados={visitados} totalStands={totalStands}/>;
  }

  if (pageData.type === "stamp") {
    const s = pageData.stand;
    const rot = ((s.id.charCodeAt(s.id.length - 1) || 0) % 20) - 10;
    return (
      <div style={{ height: "100%", padding: 22, ...lineBg, position: "relative", overflow: "hidden" }}>
        <div className="mono" style={{ marginBottom: 6 }}>Sello · {s.municipio}</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 26, fontWeight: 400, margin: "0 0 4px", lineHeight: 1 }}>
          {s.nombre}
        </h2>
        <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{s.region}</div>
        <div style={{
          position: "absolute", top: "48%", left: "52%", transform: "translate(-50%, -50%)",
          "--stamp-rot": rot + "deg",
          animation: "stamp-land 0.6s cubic-bezier(.2,.8,.2,1.2) forwards",
        }}>
          <SelloCircular stand={s} size={150} rotation={rot}/>
        </div>
        <div style={{ position: "absolute", bottom: 22, left: 22, right: 22 }}>
          <div style={{ fontSize: 11, color: "var(--ink-2)", lineHeight: 1.5, fontStyle: "italic", fontFamily: "var(--font-display)" }}>
            "{s.descripcion}"
          </div>
        </div>
      </div>
    );
  }

  if (pageData.type === "end") {
    return (
      <div style={{ height: "100%", padding: 28, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", ...lineBg }}>
        <div className="mono">Fin del pasaporte</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 30, fontWeight: 400, margin: "12px 0 8px", lineHeight: 1 }}>
          Gracias por<br/>caminar el café<br/>con nosotros.
        </h2>
        <div style={{ marginTop: 20, padding: "12px 18px", border: "1px solid var(--line-2)", borderRadius: 999, fontSize: 12 }}>
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
Object.assign(window, { PassportPage, datosPagina });
