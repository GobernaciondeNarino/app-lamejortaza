// Puesta a cero del festival — /admin/sistema
//
// Entre montar el sistema y abrir al público hay semanas de pruebas: stands de
// ejemplo, inscripciones de mentira, votos para comprobar que el pasaporte
// sella. Nada de eso puede quedar el día del evento, y borrarlo a mano desde
// phpMyAdmin es donde alguien se lleva por delante su propia cuenta.
//
// Esta pantalla es deliberadamente incómoda: enseña qué hay, obliga a elegir
// qué se va, hay que escribir una frase exacta y sólo la ve un propietario.

const AMBITOS = [
  {
    id: "votos", titulo: "Votos y pasaportes",
    nota: "Todos los votos, los pasaportes que crearon y los contadores de cada stand. Los stands se quedan.",
  },
  {
    id: "visitantes", titulo: "Visitantes",
    nota: "La caracterización voluntaria del público, sus fotos y sus claves de perfil.",
  },
  {
    id: "promotores", titulo: "Promotores",
    nota: "Las inscripciones, sus empresas y sus productos. Los stands que ya se crearon NO se borran aquí.",
  },
  {
    id: "stands", titulo: "Stands",
    nota: "El catálogo entero. Arrastra los votos y los pasaportes, porque quedarían apuntando a puestos que ya no existen.",
    peligro: true,
  },
  {
    id: "correos", titulo: "Bitácora de correos",
    nota: "El registro de los mensajes enviados. No afecta a nadie, sólo limpia el historial de las pruebas.",
  },
];

const SistemaPage = () => {
  const [info, setInfo] = React.useState(null);
  const [sel, setSel] = React.useState({});
  const [frase, setFrase] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [hecho, setHecho] = React.useState(null);

  const cargar = React.useCallback(() => {
    window.LMTApi.inventarioSistema()
      .then(setInfo)
      .catch((e) => setError(mensajeError(e, "No fue posible leer el estado del sistema.")));
  }, []);
  React.useEffect(cargar, [cargar]);

  const elegidos = AMBITOS.filter((a) => sel[a.id]).map((a) => a.id);
  const fraseOk = info && frase === info.frase;

  const reiniciar = async () => {
    setError(""); setHecho(null); setBusy(true);
    try {
      const r = await window.LMTApi.reiniciarSistema(elegidos, frase);
      setHecho(r);
      setInfo((v) => (v ? { ...v, inventario: r.inventario } : v));
      setSel({}); setFrase("");
    } catch (e) {
      setError(mensajeError(e, "No fue posible poner el sistema a cero."));
    } finally { setBusy(false); }
  };

  const inv = (info && info.inventario) || {};
  const cuenta = (k) => (inv[k] === undefined ? "—" : inv[k].toLocaleString());

  return (
    <div className="admin-page">
      <div style={{ marginBottom: 24 }}>
        <div className="mono">Sistema · Puesta a cero</div>
        <h1 className="titulo-xl">Empezar de cero</h1>
        <p style={{ color: "var(--ink-2)", fontSize: 14, lineHeight: 1.6, marginTop: 10, maxWidth: 640 }}>
          Borra los datos de ejemplo y de las pruebas para dejar el festival listo antes de abrir
          al público. <strong>Las cuentas de administración nunca se tocan</strong>: si se borraran,
          nadie podría volver a entrar a arreglarlo.
        </p>
      </div>

      <Aviso>{error}</Aviso>

      {hecho && (
        <Aviso tipo="ok">
          Listo. {Object.entries(hecho.borrado || {})
            .filter(([, n]) => n > 0)
            .map(([k, n]) => `${k}: ${n}`)
            .join(" · ") || "no había nada que borrar"}.
        </Aviso>
      )}

      {/* Lo que hay ahora. Se lee antes de decidir, no después. */}
      <div style={{ border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: 20, marginTop: 18 }}>
        <div className="mono" style={{ marginBottom: 12 }}>Qué hay ahora en la base</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 14 }}>
          {[
            ["Stands", "stands"], ["Votos", "votos"], ["Pasaportes", "pasaportes"],
            ["Promotores", "promotores"], ["Empresas", "empresas"], ["Productos", "productos"],
            ["Visitantes", "visitantes"], ["Correos", "correos"], ["Administradores", "admins"],
          ].map(([label, k]) => (
            <div key={k}>
              <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 28, lineHeight: 1 }}>{cuenta(k)}</div>
              <div className="mono" style={{ marginTop: 4, color: k === "admins" ? "var(--good)" : "var(--ink-3)" }}>
                {label}{k === "admins" ? " · intactos" : ""}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <div className="mono" style={{ marginBottom: 12 }}>Qué quieres borrar</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {AMBITOS.map((a) => (
            <label key={a.id} style={{
              display: "flex", gap: 12, alignItems: "flex-start", padding: "14px 16px",
              border: "1px solid " + (sel[a.id] ? "var(--bad)" : "var(--line-2)"),
              borderRadius: "var(--r-md)", cursor: "pointer",
              background: sel[a.id] ? "color-mix(in oklch, var(--bad) 5%, var(--paper))" : "var(--paper)",
            }}>
              <input type="checkbox" checked={!!sel[a.id]} style={{ marginTop: 3 }}
                onChange={(e) => setSel((v) => ({ ...v, [a.id]: e.target.checked }))}/>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontWeight: 500, display: "block" }}>
                  {a.titulo}
                  {a.peligro && <span className="mono" style={{ color: "var(--bad)", marginLeft: 8 }}>arrastra más cosas</span>}
                </span>
                <span style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5, display: "block", marginTop: 3 }}>{a.nota}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {elegidos.length > 0 && (
        <div style={{ marginTop: 24, padding: 20, border: "2px solid var(--bad)", borderRadius: "var(--r-md)" }}>
          <div className="mono" style={{ color: "var(--bad)", marginBottom: 10 }}>Esto no se puede deshacer</div>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--ink-2)", margin: "0 0 14px" }}>
            No hay papelera ni «deshacer». Si quieres poder volver atrás, haz antes una copia de la
            base de datos desde el panel de tu hosting.
          </p>
          <div className="field" style={{ maxWidth: 320 }}>
            <label htmlFor="sis-frase">Escribe <strong>{info && info.frase}</strong> para confirmar</label>
            <input id="sis-frase" value={frase} onChange={(e) => setFrase(e.target.value)}
              autoComplete="off" spellCheck={false} placeholder={info && info.frase}/>
          </div>
          <button className="btn btn-primary" disabled={!fraseOk || busy} onClick={reiniciar}
            style={{
              marginTop: 16, justifyContent: "center",
              background: fraseOk ? "var(--bad)" : "var(--line-2)",
              borderColor: fraseOk ? "var(--bad)" : "var(--line-2)",
              opacity: busy ? 0.6 : 1,
            }}>
            {busy ? "Borrando…" : `Borrar ${elegidos.length} ${elegidos.length === 1 ? "conjunto" : "conjuntos"} de datos`}
          </button>
        </div>
      )}

      <p className="ruta" style={{ marginTop: 26, lineHeight: 1.7 }}>
        Después de una puesta a cero conviene volver a generar los códigos QR de los stands nuevos
        desde <strong>Códigos QR</strong>, y comprobar el envío de correo desde <strong>Correo</strong>.
      </p>
    </div>
  );
};

Object.assign(window, { SistemaPage });
