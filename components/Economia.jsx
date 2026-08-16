// Actividad económica del festival — /admin/economia
//
// La pregunta que hace la Gobernación cuando termina el evento es siempre la
// misma: ¿cuánto se movió y en qué stands? Aquí está, con el desglose por
// stand y las cifras que hacen falta para justificarlo.
//
// Las compras salen del voto: al calificar, el visitante dice si compró y
// cuánto. No es una caja registradora —nadie está obligado a declarar el
// importe— así que la página es explícita sobre qué está mirando: una muestra
// declarada por el público, no la facturación del evento.

const Cifra = ({ etiqueta, valor, nota }) => (
  <div style={{ padding: 18, border: "1px solid var(--line)", borderRadius: "var(--r-md)", background: "var(--paper)" }}>
    <div className="mono" style={{ marginBottom: 6 }}>{etiqueta}</div>
    <div style={{ fontFamily: "var(--font-display)", fontSize: 34, fontStyle: "italic", lineHeight: 1 }}>{valor}</div>
    {nota && <div className="mono" style={{ marginTop: 6, color: "var(--ink-3)" }}>{nota}</div>}
  </div>
);

const EconomiaPage = () => {
  const [datos, setDatos] = React.useState(null);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let cancelado = false;
    const cargar = async () => {
      if (cancelado || !window.LMTApi || !window.LMTApi.enabled) return;
      try {
        const d = await window.LMTApi.economia();
        if (!cancelado) setDatos(d);
      } catch (e) {
        if (!cancelado) setError(mensajeError(e));
      }
    };
    cargar();
    window.addEventListener("lmt:auth", cargar);
    return () => { cancelado = true; window.removeEventListener("lmt:auth", cargar); };
  }, []);

  if (error) return <AdminShell active="economia"><Aviso>{error}</Aviso></AdminShell>;
  if (!datos) {
    return <AdminShell active="economia"><p className="mono" style={{ color: "var(--ink-3)" }}>Cargando…</p></AdminShell>;
  }

  const t = datos.total;
  const conCompras = datos.stands.filter((s) => s.compras > 0);
  const maximo = Math.max(1, ...datos.stands.map((s) => s.valor));

  return (
    <AdminShell active="economia">
      <div className="mono">Actividad económica</div>
      <h1 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 40, fontWeight: 400, margin: "6px 0 10px", lineHeight: 1 }}>
        Las compras del festival.
      </h1>
      <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6, maxWidth: 620, marginBottom: 22 }}>
        Sale de lo que declara el público al votar. No es la facturación del evento:
        indicar la compra y el importe es voluntario, así que <strong style={{ fontWeight: 500 }}>lo
        real siempre es igual o más</strong>. Sirve para medir la magnitud y comparar stands.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 12 }}>
        <Cifra etiqueta="Valor declarado" valor={pesos(t.valor)}
          nota={`${t.con_valor} compras con importe`}/>
        <Cifra etiqueta="Compras" valor={t.compras.toLocaleString("es-CO")}
          nota={`de ${t.votos.toLocaleString("es-CO")} votos`}/>
        <Cifra etiqueta="Conversión" valor={t.conversion + "%"}
          nota="votantes que compraron"/>
        <Cifra etiqueta="Compra media" valor={pesos(t.ticket)}
          nota="entre las que declararon importe"/>
      </div>

      <div className="mono" style={{ margin: "28px 0 12px" }}>Por stand</div>
      {!conCompras.length && (
        <p style={{ color: "var(--ink-2)" }}>Todavía no hay compras registradas.</p>
      )}
      {!!conCompras.length && (
        <div className="tabla-scroll">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 560 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line-2)" }}>
                {["Stand", "Compras", "Valor declarado", "Compra media", "Conversión"].map((h, i) => (
                  <th key={h} className="mono" style={{ textAlign: i === 0 ? "left" : "right", padding: "8px 10px", fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {datos.stands.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "10px", minWidth: 180 }}>
                    <div style={{ fontWeight: 500 }}>{s.nombre}</div>
                    <div className="mono" style={{ fontSize: 9, color: "var(--ink-3)" }}>{s.municipio}</div>
                    {/* Barra proporcional al mayor: la comparación entre stands
                        se ve antes en el largo de una barra que en la cifra. */}
                    <div style={{ height: 4, marginTop: 6, background: "var(--line)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: (s.valor / maximo * 100) + "%", height: "100%", background: "var(--cafeto)" }}/>
                    </div>
                  </td>
                  <td style={{ padding: "10px", textAlign: "right" }}>{s.compras}</td>
                  <td style={{ padding: "10px", textAlign: "right", fontWeight: 500 }}>{pesos(s.valor)}</td>
                  <td style={{ padding: "10px", textAlign: "right", color: "var(--ink-2)" }}>{s.ticket ? pesos(s.ticket) : "—"}</td>
                  <td style={{ padding: "10px", textAlign: "right", color: "var(--ink-2)" }}>{s.conversion}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
};

Object.assign(window, { EconomiaPage });
