// Caracterización del público — /admin/caracterizacion
//
// Lo que los visitantes contestaron voluntariamente en /perfil, agregado. Aquí
// NO se ven correos ni nombres: la pantalla existe para leer al público como
// conjunto. Quien necesite el detalle descarga el CSV, y esa descarga ya es una
// decisión consciente sobre datos personales.

const BarraDimension = ({ filas, etiquetas, total }) => {
  if (!filas || filas.length === 0) {
    return <p style={{ fontSize: 13, color: "var(--ink-3)", margin: 0 }}>Nadie ha respondido todavía.</p>;
  }
  const max = Math.max(...filas.map((f) => f.n), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {filas.map((f) => {
        const pct = total > 0 ? Math.round((f.n * 100) / total) : 0;
        return (
          <div key={f.valor}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13, marginBottom: 4 }}>
              <span style={{ minWidth: 0 }}>{(etiquetas && etiquetas[f.valor]) || f.valor}</span>
              <span className="mono" style={{ flex: "0 0 auto" }}>{f.n} · {pct}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 999, background: "var(--paper-2)", overflow: "hidden" }}>
              <div style={{ width: `${(f.n * 100) / max}%`, height: "100%", background: "var(--grano)" }}/>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const TarjetaDimension = ({ titulo, nota, children }) => (
  <div style={{ border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: 20, background: "var(--paper)" }}>
    <div className="mono" style={{ marginBottom: nota ? 4 : 14 }}>{titulo}</div>
    {nota && <p style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.5, margin: "0 0 14px" }}>{nota}</p>}
    {children}
  </div>
);

const AdminCaracterizacion = () => {
  const [datos, setDatos] = React.useState(null);
  const [expectativas, setExpectativas] = React.useState([]);
  const [error, setError] = React.useState("");
  const [cargando, setCargando] = React.useState(true);

  React.useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const [r, e] = await Promise.all([
          window.LMTApi.resumenVisitantes(),
          window.LMTApi.expectativasVisitantes(),
        ]);
        if (!vivo) return;
        setDatos(r);
        setExpectativas(e || []);
      } catch (err) {
        if (vivo) setError(mensajeError(err, "No fue posible cargar la caracterización."));
      } finally {
        if (vivo) setCargando(false);
      }
    })();
    return () => { vivo = false; };
  }, []);

  if (cargando) return <div className="admin-page"><div className="splash">Cargando…</div></div>;

  const d = datos || { total: 0, votantes: 0, dimensiones: {}, municipios: [], primera_visita: [], etiquetas: {} };
  const eti = d.etiquetas || {};
  const total = d.total || 0;
  const cobertura = d.votantes > 0 ? Math.round((total * 100) / d.votantes) : 0;
  const csv = window.LMTApi.urlFor("/export/visitantes.csv");

  const primera = (d.primera_visita || []).map((f) => ({
    valor: String(f.valor), n: f.n,
  }));

  return (
    <div className="admin-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, flexWrap: "wrap", marginBottom: 22 }}>
        <div>
          <div className="mono">Visitantes · {total} perfiles</div>
          <h1 className="titulo-xl">Caracterización</h1>
        </div>
        <a className="btn btn-ghost" href={csv}>Descargar CSV</a>
      </div>

      <p style={{ color: "var(--ink-2)", fontSize: 14, lineHeight: 1.6, margin: "0 0 24px", maxWidth: 640 }}>
        Lo que los visitantes respondieron por su cuenta después de votar. Todo es voluntario, así
        que las cifras describen a quien quiso contestar, no al total del público. El CSV lleva
        datos personales: guárdalo donde corresponda y no lo reenvíes por correo.
      </p>

      <Aviso>{error}</Aviso>

      <div className="grid-3" style={{ marginBottom: 24 }}>
        {[
          { k: "Perfiles", v: total, sub: "completados" },
          { k: "Votantes", v: d.votantes || 0, sub: "correos distintos" },
          { k: "Cobertura", v: cobertura + "%", sub: "de los votantes" },
        ].map((m) => (
          <div key={m.k} style={{ padding: 20, border: "1px solid var(--line)", borderRadius: "var(--r-md)", background: "var(--paper)" }}>
            <div className="mono">{m.k}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 40, fontStyle: "italic", lineHeight: 1, marginTop: 8 }}>{m.v}</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {total === 0 ? (
        <div style={{ padding: 50, border: "1px dashed var(--line-2)", borderRadius: "var(--r-md)", textAlign: "center", color: "var(--ink-3)" }}>
          <div className="mono">Sin perfiles</div>
          <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 26, color: "var(--ink)", margin: "8px 0 4px" }}>
            Todavía nadie ha completado su perfil.
          </div>
          <div style={{ fontSize: 13 }}>Se les propone al terminar de votar, y es opcional.</div>
        </div>
      ) : (
        <div className="grid-2" style={{ gap: 18, alignItems: "start" }}>
          <TarjetaDimension titulo="Género">
            <BarraDimension filas={d.dimensiones.genero} etiquetas={eti.genero} total={total}/>
          </TarjetaDimension>
          <TarjetaDimension titulo="Rango de edad">
            <BarraDimension filas={d.dimensiones.rango_edad} etiquetas={eti.rango_edad} total={total}/>
          </TarjetaDimension>
          <TarjetaDimension titulo="Tipo de visitante">
            <BarraDimension filas={d.dimensiones.tipo_visitante} etiquetas={eti.tipo_visitante} total={total}/>
          </TarjetaDimension>
          <TarjetaDimension titulo="Cómo se enteraron">
            <BarraDimension filas={d.dimensiones.como_se_entero} etiquetas={eti.como_se_entero} total={total}/>
          </TarjetaDimension>
          <TarjetaDimension titulo="Grupo étnico" nota="Dato sensible, de respuesta voluntaria.">
            <BarraDimension filas={d.dimensiones.grupo_etnico} etiquetas={eti.grupo_etnico} total={total}/>
          </TarjetaDimension>
          <TarjetaDimension titulo="Discapacidad" nota="Dato sensible, de respuesta voluntaria.">
            <BarraDimension filas={d.dimensiones.discapacidad} etiquetas={eti.discapacidad} total={total}/>
          </TarjetaDimension>
          <TarjetaDimension titulo="Municipio de origen" nota="Los 25 más frecuentes.">
            <BarraDimension filas={d.municipios} etiquetas={null} total={total}/>
          </TarjetaDimension>
          <TarjetaDimension titulo="Primera visita">
            <BarraDimension filas={primera} etiquetas={{ "1": "Es su primera vez", "0": "Ya había venido" }} total={total}/>
          </TarjetaDimension>
        </div>
      )}

      {expectativas.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <div className="mono" style={{ marginBottom: 12 }}>Qué esperan del festival · {expectativas.length} respuestas</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {expectativas.map((e, i) => (
              <div key={i} style={{ border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: "14px 16px", background: "var(--paper)" }}>
                <div style={{ fontSize: 14, lineHeight: 1.6 }}>{e.texto}</div>
                <div className="mono" style={{ marginTop: 6, color: "var(--ink-3)" }}>
                  {e.municipio || "sin municipio"} · {e.hora}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { AdminCaracterizacion });
