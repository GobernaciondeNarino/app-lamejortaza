// Mi recorrido — /recorrido
//
// Todos los stands del festival en una rejilla. Los que ya sellé salen a color
// y con su valoración; el resto quedan apagados, como una colección a medio
// llenar. Es la vista que responde a «¿cuáles me faltan?», que el ranking no
// contesta porque ahí lo que manda es quién va ganando.
//
// El número de columnas lo pone el organizador (PC y móvil por separado) desde
// el panel: en una pantalla de sala grande caben cuatro y en un teléfono a
// veces conviene una sola.

const RECORRIDO_COLUMNAS = { pc: 3, movil: 2 };

const columnasConfiguradas = () => {
  const a = (window.LMTFestival && window.LMTFestival.ajustes()) || {};
  const r = a.recorrido || {};
  return {
    pc:    Math.max(1, Math.min(6, Number(r.columnas_pc)    || RECORRIDO_COLUMNAS.pc)),
    movil: Math.max(1, Math.min(3, Number(r.columnas_movil) || RECORRIDO_COLUMNAS.movil)),
  };
};

/** Tarjeta de un stand. `visitado` es lo que la enciende. */
const TarjetaRecorrido = ({ stand, visitado, valoracion, titulos }) => {
  const logo = urlImagen(stand.logo);
  const inicial = (stand.nombre || "?").trim().charAt(0).toUpperCase();

  return (
    <a href={"/festival/" + stand.id} data-route
      aria-label={`${stand.nombre}, ${stand.municipio}${visitado ? " — visitado" : " — sin visitar"}`}
      style={{
        display: "flex", flexDirection: "column", gap: 10,
        padding: 14, textDecoration: "none", color: "inherit",
        border: visitado ? "1px solid var(--line-2)" : "1px dashed var(--line-2)",
        borderRadius: "var(--r-md)",
        background: visitado ? "var(--paper)" : "transparent",
        // Apagar y no esconder: el stand sin visitar se ve, pero se nota que le
        // falta algo. Con `filter` basta y no hay que duplicar la tarjeta.
        filter: visitado ? "none" : "grayscale(1)",
        opacity: visitado ? 1 : 0.55,
        transition: "opacity 0.2s, filter 0.2s",
        minWidth: 0,
      }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%", flexShrink: 0, overflow: "hidden",
          border: "1px solid var(--line-2)", background: stand.color || "var(--grano)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {logo
            ? <img src={logo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
            : <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 20, color: "var(--paper)" }}>{inicial}</span>}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {stand.nombre}
          </div>
          <div className="mono" style={{ fontSize: 9, color: "var(--ink-3)", marginTop: 2 }}>{stand.municipio}</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {ESTRELLA_CAMPOS.map((campo) => {
          const clave = ESTRELLA_CLAVES[campo];
          // Mi puntuación si la di; si no, la media del festival. Un stand que
          // no visité nunca tendrá «mi» valoración, y enseñar la media es lo
          // que ayuda a decidir a cuál ir.
          const mia = valoracion ? valoracion[clave] : null;
          const media = (stand.estrellas || {})[clave];
          return (
            <EstrellasLectura key={campo} etiqueta={titulos[campo]}
              valor={mia != null ? mia : media} tam={12}/>
          );
        })}
      </div>

      <div className="mono" style={{ fontSize: 9, color: visitado ? "var(--cafeto)" : "var(--ink-3)" }}>
        {visitado ? "✓ Sellado" : "Sin sellar"}
      </div>
    </a>
  );
};

const RecorridoPage = ({ stands }) => {
  const [pasaporte, setPasaporte] = React.useState(null);
  const [cargando, setCargando] = React.useState(true);
  const [cols, setCols] = React.useState(columnasConfiguradas);
  const [titulos, setTitulos] = React.useState(() => window.titulosEstrellas());

  React.useEffect(() => {
    const refrescar = () => { setCols(columnasConfiguradas()); setTitulos(window.titulosEstrellas()); };
    window.addEventListener("lmt:festival", refrescar);
    return () => window.removeEventListener("lmt:festival", refrescar);
  }, []);

  // Sin correo no hay «mi» recorrido: es de esta persona y hay que saber quién
  // es. Se pide con la misma puerta que el pasaporte y el perfil.
  const [correo, setCorreo] = React.useState(() => (window.LMTPerfil && window.LMTPerfil.correoConocido()) || "");

  React.useEffect(() => {
    if (!correo) { setCargando(false); return; }
    let cancelado = false;
    const intentar = async () => {
      if (cancelado || !window.LMTApi || !window.LMTApi.enabled) return;
      try {
        const t = (window.LMTPerfil && window.LMTPerfil.testigoDe(correo)) || "";
        const res = await window.LMTApi.getPasaporte(correo, t);
        if (!cancelado) setPasaporte(res);
      } catch (_) { /* sin pasaporte: se ve el catálogo entero apagado */ }
      finally { if (!cancelado) setCargando(false); }
    };
    intentar();
    window.addEventListener("lmt:auth", intentar);
    return () => { cancelado = true; window.removeEventListener("lmt:auth", intentar); };
  }, [correo]);

  const visitados = (pasaporte && pasaporte.visitados) || [];
  const misEstrellas = (pasaporte && pasaporte.estrellas_mias) || {};
  const setVisitados = React.useMemo(() => new Set(visitados), [visitados]);

  // Los sellados primero: es lo que la persona quiere ver de un vistazo.
  const ordenados = React.useMemo(() => {
    const copia = [...stands];
    copia.sort((a, b) => {
      const va = setVisitados.has(a.id) ? 0 : 1;
      const vb = setVisitados.has(b.id) ? 0 : 1;
      return va !== vb ? va - vb : a.nombre.localeCompare(b.nombre, "es");
    });
    return copia;
  }, [stands, setVisitados]);

  if (!correo) {
    return (
      <PuertaCorreo
        titulo="Tu recorrido por el festival."
        nota="Escribe el correo con el que votas en los espacios y verás cuáles llevas sellados. No hace falta contraseña."
        volverA="/festival" volverTexto="← Volver al ranking"
        onListo={(c) => setCorreo(c)}/>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", background: "var(--paper)" }}>
      <PublicHeader/>
      <section className="seccion" style={{ paddingTop: 28, paddingBottom: 40 }}>
        <div className="mono">Mi recorrido</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "min(56px, 11vw)", fontWeight: 400, margin: "6px 0 8px", lineHeight: 1 }}>
          Los stands del festival.
        </h1>
        <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6, maxWidth: 560 }}>
          {visitados.length
            ? <>Llevas <strong style={{ fontWeight: 500 }}>{visitados.length} de {stands.length}</strong> sellados. Los que están a color ya los visitaste.</>
            : <>Escanea el QR de cualquier espacio y vota: a partir de ahí, los que visites se van encendiendo aquí.</>}
        </p>

        {cargando && (
          <p className="mono" style={{ marginTop: 20, color: "var(--ink-3)" }}>Cargando tu recorrido…</p>
        )}

        <div className="recorrido-grid"
          style={{
            marginTop: 22,
            // Las columnas configuradas viajan como variables CSS y una media
            // query decide cuál de las dos manda (ver styles/tokens.css).
            "--cols-pc": cols.pc,
            "--cols-movil": cols.movil,
          }}>
          {ordenados.map((s) => (
            <TarjetaRecorrido key={s.id} stand={s} titulos={titulos}
              visitado={setVisitados.has(s.id)}
              valoracion={misEstrellas[s.id] || null}/>
          ))}
        </div>

        {!stands.length && (
          <p style={{ marginTop: 24, color: "var(--ink-2)" }}>Todavía no hay espacios registrados.</p>
        )}
      </section>
    </div>
  );
};

Object.assign(window, { RecorridoPage, TarjetaRecorrido });
