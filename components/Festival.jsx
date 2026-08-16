// Personalización del festival — /admin/festival
//
// Lo que el organizador cambia sin tocar código: cómo se llaman las tres
// valoraciones del voto, cuántas columnas tiene «Mi recorrido» y qué imágenes
// se usan de fondo en el pasaporte.
//
// Todo tiene un valor por defecto que funciona. Quien no entre aquí nunca ve
// exactamente lo que ve hoy: el diseño del sistema.

const FondoRanura = ({ titulo, ayuda, url, onSubir, onQuitar, subiendo }) => (
  <div style={{ border: "1px solid var(--line-2)", borderRadius: "var(--r-md)", padding: 14 }}>
    <div className="mono" style={{ marginBottom: 8 }}>{titulo}</div>
    <div style={{
      height: 130, borderRadius: "var(--r-sm)", overflow: "hidden", marginBottom: 10,
      border: "1px dashed var(--line-2)", background: "var(--paper-2)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {url
        ? <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
        : <span className="mono" style={{ color: "var(--ink-3)", textAlign: "center", padding: 10 }}>Diseño del sistema</span>}
    </div>
    {ayuda && <p className="mono" style={{ color: "var(--ink-3)", lineHeight: 1.5, marginBottom: 8 }}>{ayuda}</p>}
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <label className="btn btn-ghost" style={{ cursor: subiendo ? "wait" : "pointer", opacity: subiendo ? 0.6 : 1 }}>
        {subiendo ? "Subiendo…" : (url ? "Cambiar" : "Subir imagen")}
        <input type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={subiendo}
          onChange={(e) => { const f = e.target.files && e.target.files[0]; e.target.value = ""; if (f) onSubir(f); }}/>
      </label>
      {url && onQuitar && (
        <button type="button" className="btn btn-ghost" onClick={onQuitar}
          style={{ color: "var(--bad)" }}>Quitar</button>
      )}
    </div>
  </div>
);

const FestivalPage = () => {
  const [aj, setAj] = React.useState(null);
  const [error, setError] = React.useState("");
  const [ok, setOk] = React.useState("");
  const [subiendo, setSubiendo] = React.useState("");

  React.useEffect(() => {
    let cancelado = false;
    const cargar = async () => {
      if (cancelado || !window.LMTApi || !window.LMTApi.enabled) return;
      try { const d = await window.LMTApi.festivalAjustes(); if (!cancelado) setAj(d); }
      catch (e) { if (!cancelado) setError(mensajeError(e)); }
    };
    cargar();
    window.addEventListener("lmt:auth", cargar);
    return () => { cancelado = true; window.removeEventListener("lmt:auth", cargar); };
  }, []);

  if (!aj) {
    return <AdminShell active="festival">
      {error ? <Aviso>{error}</Aviso> : <p className="mono" style={{ color: "var(--ink-3)" }}>Cargando…</p>}
    </AdminShell>;
  }

  const guardar = async (siguiente) => {
    setError(""); setOk("");
    try {
      const d = await window.LMTApi.guardarFestivalAjustes(siguiente);
      setAj(d);
      // Los ajustes viven cacheados en el cliente: sin recargarlos, el panel
      // enseñaría lo nuevo y el resto de la aplicación seguiría con lo viejo.
      if (window.LMTFestival) await window.LMTFestival.cargar();
      setOk("Guardado.");
    } catch (e) { setError(mensajeError(e)); }
  };

  const subirFondo = async (destino, archivo) => {
    setError(""); setOk(""); setSubiendo(destino);
    try {
      const d = await window.LMTApi.subirFondoPasaporte(destino, archivo);
      setAj(d);
      if (window.LMTFestival) await window.LMTFestival.cargar();
      setOk("Imagen subida.");
    } catch (e) { setError(mensajeError(e)); }
    finally { setSubiendo(""); }
  };

  const quitarFondo = async (destino, indice) => {
    setError(""); setOk("");
    try {
      const d = await window.LMTApi.quitarFondoPasaporte(destino, indice);
      setAj(d);
      if (window.LMTFestival) await window.LMTFestival.cargar();
    } catch (e) { setError(mensajeError(e)); }
  };

  const hojas = (aj.pasaporte && aj.pasaporte.hojas) || [];

  return (
    <AdminShell active="festival">
      <div className="mono">Personalización</div>
      <h1 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 40, fontWeight: 400, margin: "6px 0 10px", lineHeight: 1 }}>
        Cómo se ve el festival.
      </h1>
      <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6, maxWidth: 620, marginBottom: 22 }}>
        Todo lo de aquí tiene un valor que ya funciona. Lo que no toques se queda
        como está y el pasaporte conserva su diseño.
      </p>

      <Aviso>{error}</Aviso>
      <Aviso tipo="ok">{ok}</Aviso>

      <BloqueForm titulo="Las tres valoraciones del voto">
        <p className="mono" style={{ color: "var(--ink-3)", lineHeight: 1.5 }}>
          Cómo se llaman las tres estrellas que puntúa el visitante. Cambiar el
          nombre no toca lo ya votado: sigue siendo la misma valoración.
        </p>
        <div className="grid-2">
          {[["innovacion", "Primera"], ["atencion", "Segunda"], ["calidad", "Tercera"]].map(([k, orden]) => (
            <div className="field" key={k}>
              <label htmlFor={"fs-" + k}>{orden} valoración</label>
              <input id={"fs-" + k} maxLength={40} value={aj.estrellas[k]}
                onChange={(e) => setAj({ ...aj, estrellas: { ...aj.estrellas, [k]: e.target.value } })}/>
            </div>
          ))}
        </div>
      </BloqueForm>

      <BloqueForm titulo="Rejilla de «Mi recorrido»">
        <div className="grid-2">
          {[["columnas_pc", "Columnas en computador", 6], ["columnas_movil", "Columnas en móvil", 3]].map(([k, etiqueta, max]) => (
            <div className="field" key={k}>
              <label htmlFor={"fr-" + k}>{etiqueta}</label>
              <select id={"fr-" + k} value={aj.recorrido[k]}
                onChange={(e) => setAj({ ...aj, recorrido: { ...aj.recorrido, [k]: Number(e.target.value) } })}>
                {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </BloqueForm>

      <button className="btn btn-primary" onClick={() => guardar(aj)} style={{ marginBottom: 28 }}>
        Guardar títulos y columnas
      </button>

      <div className="mono" style={{ margin: "8px 0 12px" }}>Fondos del pasaporte</div>
      <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.6, maxWidth: 620, marginBottom: 16 }}>
        Si no subes nada, el pasaporte usa el papel que trae el sistema. Las
        imágenes se ven <strong style={{ fontWeight: 500 }}>detrás del texto</strong>,
        así que conviene que sean claras y sin mucho detalle: una textura, no una foto.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 12, marginBottom: 20 }}>
        <FondoRanura titulo="Portada" url={urlImagen(aj.pasaporte.portada)}
          subiendo={subiendo === "portada"}
          ayuda="La tapa del pasaporte. Sobre ella va el nombre del portador en claro."
          onSubir={(f) => subirFondo("portada", f)}
          onQuitar={() => quitarFondo("portada")}/>
        <FondoRanura titulo="Contraportada" url={urlImagen(aj.pasaporte.contraportada)}
          subiendo={subiendo === "contraportada"}
          ayuda="La tapa de atrás, la que cierra el libro."
          onSubir={(f) => subirFondo("contraportada", f)}
          onQuitar={() => quitarFondo("contraportada")}/>
      </div>

      <div className="mono" style={{ margin: "20px 0 10px" }}>
        Hojas internas · {hojas.length} {hojas.length === 1 ? "imagen" : "imágenes"}
      </div>
      <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.6, maxWidth: 620, marginBottom: 14 }}>
        Se reparten en orden por las hojas de dentro. Si hay más hojas que
        imágenes, se repiten desde el principio, así que con dos o tres ya se
        nota variedad sin que el pasaporte pese.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
        {hojas.map((h, i) => (
          <div key={h + i} style={{ border: "1px solid var(--line-2)", borderRadius: "var(--r-sm)", overflow: "hidden" }}>
            <img src={urlImagen(h)} alt="" style={{ width: "100%", height: 96, objectFit: "cover", display: "block" }}/>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 8px" }}>
              <span className="mono" style={{ color: "var(--ink-3)" }}>{i + 1}</span>
              <button type="button" onClick={() => quitarFondo("hojas", i)}
                className="mono" style={{ background: "none", border: "none", color: "var(--bad)", cursor: "pointer" }}>quitar</button>
            </div>
          </div>
        ))}
        <label style={{
          border: "1px dashed var(--line-2)", borderRadius: "var(--r-sm)", minHeight: 128,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: subiendo === "hojas" ? "wait" : "pointer", color: "var(--ink-3)",
        }} className="mono">
          {subiendo === "hojas" ? "Subiendo…" : "+ Añadir hoja"}
          <input type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={subiendo === "hojas"}
            onChange={(e) => { const f = e.target.files && e.target.files[0]; e.target.value = ""; if (f) subirFondo("hojas", f); }}/>
        </label>
      </div>
    </AdminShell>
  );
};

Object.assign(window, { FestivalPage });
