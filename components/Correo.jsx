// Correo saliente — /admin/correo
//
// El envío es la pieza más frágil del sistema y la única que falla en silencio:
// el panel decía «la contraseña salió hacia…» y en el buzón del promotor no
// había nada. Esta pantalla enseña qué transporte se está usando de verdad, deja
// cambiarlo sin tocar ficheros por FTP y manda una prueba mostrando el diálogo
// completo con el servidor.

const CLAVE_OCULTA = "__sin_cambios__";

const NIVEL_COLOR = {
  critico: "var(--bad)",
  alto: "var(--bad)",
  medio: "var(--meh)",
  bajo: "var(--ink-3)",
};

const AvisoDiagnostico = ({ nivel, children }) => {
  const color = NIVEL_COLOR[nivel] || "var(--ink-2)";
  return (
    <div style={{
      display: "flex", gap: 10, alignItems: "flex-start",
      padding: "12px 14px", borderRadius: "var(--r-sm)",
      border: `1px solid ${color}`, color,
      background: `color-mix(in oklch, ${color} 6%, var(--paper))`,
      fontSize: 13, lineHeight: 1.6,
    }}>
      <span aria-hidden="true" style={{ flex: "0 0 auto", fontWeight: 700 }}>
        {nivel === "critico" ? "!" : nivel === "alto" ? "!" : "·"}
      </span>
      <span>{children}</span>
    </div>
  );
};

const TRANSPORTES = [
  {
    id: "smtp",
    titulo: "SMTP autenticado",
    nota: "Recomendado. El correo sale desde el buzón institucional, autenticado, y no acaba en spam.",
  },
  {
    id: "mail",
    titulo: "Función mail() de PHP",
    nota: "Depende del servidor de correo local del hosting. Da éxito aunque el mensaje se pierda después.",
  },
  {
    id: "log",
    titulo: "Sólo registrar en un archivo",
    nota: "NO envía nada. Sirve para probar plantillas sin molestar a nadie.",
  },
];

const AdminCorreoConfig = () => {
  const [datos, setDatos] = React.useState(null);
  const [form, setForm] = React.useState(null);
  const [cargando, setCargando] = React.useState(true);
  const [guardando, setGuardando] = React.useState(false);
  const [error, setError] = React.useState("");
  const [ok, setOk] = React.useState("");
  const [destino, setDestino] = React.useState("");
  const [probando, setProbando] = React.useState(false);
  const [resultado, setResultado] = React.useState(null);
  const [sonda, setSonda] = React.useState(null);
  const [sondando, setSondando] = React.useState(false);

  const cargar = React.useCallback(async () => {
    setCargando(true);
    try {
      const d = await window.LMTApi.getCorreoConfig();
      setDatos(d);
      setForm(d.config);
      setError("");
    } catch (e) {
      setError(mensajeError(e, "No fue posible leer la configuración de correo."));
    } finally { setCargando(false); }
  }, []);

  React.useEffect(() => { cargar(); }, [cargar]);
  React.useEffect(() => {
    const u = window.LMTApi.user && window.LMTApi.user();
    if (u && u.email && !destino) setDestino(u.email);
  }, [destino]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setSmtp = (k, v) => setForm((f) => ({ ...f, smtp: { ...f.smtp, [k]: v } }));

  const guardar = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError(""); setOk(""); setGuardando(true);
    try {
      const d = await window.LMTApi.guardarCorreoConfig(form);
      setDatos((x) => ({ ...x, ...d, sobrescrito: x ? x.sobrescrito : [] }));
      setForm(d.config);
      setOk("Configuración guardada. Manda una prueba para confirmar que sale.");
      await cargar();
    } catch (err) {
      setError(mensajeError(err, "No fue posible guardar la configuración."));
    } finally { setGuardando(false); }
  };

  const restablecer = async () => {
    if (!window.confirm("Se descarta lo configurado desde el panel y vuelve a mandar api/config.php. ¿Continuar?")) return;
    setGuardando(true); setError(""); setOk("");
    try {
      const d = await window.LMTApi.olvidarCorreoConfig();
      setForm(d.config);
      setOk("Se restableció la configuración del archivo.");
      await cargar();
    } catch (err) {
      setError(mensajeError(err, "No fue posible restablecer."));
    } finally { setGuardando(false); }
  };

  const probar = async () => {
    setResultado(null); setError(""); setProbando(true);
    try {
      setResultado(await window.LMTApi.probarCorreo(destino));
    } catch (err) {
      setError(mensajeError(err, "No fue posible ejecutar la prueba."));
    } finally { setProbando(false); }
  };

  if (cargando || !form) return <div className="admin-page"><div className="splash">Cargando…</div></div>;

  const diag = (datos && datos.diagnostico) || { avisos: [], historico: [] };
  const esGmail = /(^|\.)(gmail|googlemail)\.com$/i.test((form.smtp && form.smtp.host) || "");
  const sobrescrito = (datos && datos.sobrescrito) || [];
  // Longitud de la contraseña que hay GUARDADA, no de la que se esté
  // escribiendo: viene del servidor y por eso sobrevive a recargar la página.
  const guardadaLargo = Number(((datos && datos.config && datos.config.smtp) || {}).password_largo) || 0;

  return (
    <div className="admin-page">
      <div className="mono">Correo saliente</div>
      <h1 className="titulo-xl">Envío de correo</h1>
      <p style={{ color: "var(--ink-2)", fontSize: 14, lineHeight: 1.6, margin: "10px 0 24px", maxWidth: 680 }}>
        De aquí salen las contraseñas de los promotores, el QR de su stand y los enlaces del perfil
        de los visitantes. Si esto no funciona, no funciona la inscripción.
      </p>

      {diag.avisos.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {diag.avisos.map((a, i) => <AvisoDiagnostico key={i} nivel={a.nivel}>{a.texto}</AvisoDiagnostico>)}
        </div>
      )}

      {/* --- Sonda de salida ---
          Antes el diagnóstico sólo sabía decir «no se puede abrir el puerto»,
          y con eso el administrador se iba a discutir con el proveedor sin
          saber si el problema era suyo. Esto prueba varios destinos y dice qué
          hacer con lo que contestan. */}
      <div style={{ border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: 20, background: "var(--paper)", marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div className="mono">¿Este servidor puede salir a internet por SMTP?</div>
          <button type="button" className="btn btn-ghost" disabled={sondando}
            onClick={async () => {
              setSondando(true); setSonda(null);
              try { setSonda(await window.LMTApi.correoSonda()); }
              catch (e) { setError(mensajeError(e)); }
              finally { setSondando(false); }
            }}>
            {sondando ? "Probando…" : "Comprobar la salida"}
          </button>
        </div>

        {sonda && (
          <div style={{ marginTop: 14 }}>
            <AvisoDiagnostico nivel={sonda.veredicto.nivel}>
              <strong style={{ fontWeight: 500 }}>{sonda.veredicto.titulo}.</strong>{" "}
              {sonda.veredicto.texto}
            </AvisoDiagnostico>
            <div className="tabla-scroll" style={{ marginTop: 12 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <tbody>
                  {sonda.resultados.map((x) => (
                    <tr key={x.host + x.puerto} style={{ borderBottom: "1px solid var(--line)" }}>
                      <td style={{ padding: "7px 8px", width: 26 }}>{x.ok ? "✓" : "✗"}</td>
                      <td className="mono ruta" style={{ padding: "7px 8px", whiteSpace: "nowrap" }}>{x.host}:{x.puerto}</td>
                      <td style={{ padding: "7px 8px", color: "var(--ink-2)" }}>{x.etiqueta}</td>
                      <td style={{ padding: "7px 8px", textAlign: "right", color: x.ok ? "var(--good)" : "var(--bad)", whiteSpace: "nowrap" }}>
                        {x.ok ? `${x.ms} ms` : `${x.error} (${x.errno})`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="ayuda" style={{ marginTop: 10 }}>
              PHP corre como <strong style={{ fontWeight: 500 }}>{sonda.usuario}</strong>.
              Un rechazo instantáneo («Connection refused») lo produce este mismo servidor;
              una espera agotada es un descarte en la red del proveedor.
            </p>
          </div>
        )}
      </div>

      {/* --- Prueba: lo primero, porque es lo que la gente viene a hacer --- */}
      <div style={{ border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: 20, background: "var(--paper)", marginBottom: 24 }}>
        <div className="mono" style={{ marginBottom: 12 }}>Probar el envío</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div className="field" style={{ flex: 1, minWidth: 240 }}>
            <label htmlFor="co-destino">Mandar un correo de prueba a</label>
            <input id="co-destino" type="email" value={destino} onChange={(e) => setDestino(e.target.value)} maxLength={254}/>
          </div>
          <button className="btn btn-primary" onClick={probar} disabled={probando || !destino}>
            {probando ? "Enviando…" : "Enviar prueba"}
          </button>
        </div>

        {resultado && (
          <div style={{ marginTop: 16 }}>
            <AvisoDiagnostico nivel={resultado.entregado ? "bajo" : (resultado.aceptado ? "medio" : "critico")}>
              <strong>
                {resultado.entregado
                  ? "El servidor de correo aceptó el mensaje."
                  : resultado.aceptado
                    ? "Aceptado, pero no se entregó a nadie."
                    : "No se pudo enviar."}
              </strong>
              <br/>{resultado.pista}
            </AvisoDiagnostico>
            {resultado.traza && resultado.traza.length > 0 && (
              <details style={{ marginTop: 12 }} open={!resultado.entregado}>
                <summary className="mono" style={{ cursor: "pointer" }}>
                  Diálogo con el servidor ({resultado.traza.length} líneas)
                </summary>
                <pre style={{
                  marginTop: 10, padding: 12, background: "var(--paper-2)", borderRadius: "var(--r-sm)",
                  border: "1px solid var(--line)", fontSize: 12, lineHeight: 1.6,
                  overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word",
                }}>{resultado.traza.join("\n")}</pre>
              </details>
            )}
          </div>
        )}
      </div>

      {/* --- Configuración --- */}
      <form onSubmit={guardar} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <BloqueForm titulo="Cómo se envía">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {TRANSPORTES.map((t) => (
              <label key={t.id} style={{
                display: "flex", gap: 12, alignItems: "flex-start", padding: 12, cursor: "pointer",
                border: "1px solid " + (form.transport === t.id ? "var(--ink)" : "var(--line)"),
                borderRadius: "var(--r-md)",
                background: form.transport === t.id ? "var(--paper-2)" : "transparent",
              }}>
                <input type="radio" name="transporte" value={t.id} checked={form.transport === t.id}
                  onChange={() => set("transport", t.id)} style={{ marginTop: 3 }}/>
                <span>
                  <span style={{ fontSize: 14, fontWeight: form.transport === t.id ? 600 : 400 }}>{t.titulo}</span>
                  <span style={{ display: "block", fontSize: 12, color: "var(--ink-3)", lineHeight: 1.5, marginTop: 2 }}>{t.nota}</span>
                </span>
              </label>
            ))}
          </div>
        </BloqueForm>

        <BloqueForm titulo="Quién firma los mensajes">
          <div className="grid-2">
            <div className="field">
              <label htmlFor="co-from">Dirección del remitente</label>
              <input id="co-from" type="email" value={form.from} onChange={(e) => set("from", e.target.value)} maxLength={254} required/>
            </div>
            <div className="field">
              <label htmlFor="co-fromname">Nombre visible</label>
              <input id="co-fromname" value={form.from_name} onChange={(e) => set("from_name", e.target.value)} maxLength={80}/>
            </div>
          </div>
          <div className="field">
            <label htmlFor="co-replyto">Responder a (opcional)</label>
            <input id="co-replyto" type="email" value={form.reply_to} onChange={(e) => set("reply_to", e.target.value)} maxLength={254}/>
            <span className="ayuda">Si un promotor contesta, su respuesta irá a esta dirección.</span>
          </div>
        </BloqueForm>

        {form.transport === "smtp" && (
          <BloqueForm titulo="Servidor SMTP" nota="Pídeselos a quien administra el correo institucional.">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {[
                { t: "Gmail · 587 TLS", h: "smtp.gmail.com", p: 587, s: "tls", usaCorreo: true },
                { t: "Gmail · 465 SSL", h: "smtp.gmail.com", p: 465, s: "ssl", usaCorreo: true },
                // Relé por el servidor de correo de la propia máquina: es una
                // conexión local, así que ninguna regla de salida la toca. Es
                // la salida cuando el hosting cierra el SMTP hacia fuera.
                { t: "Servidor local · 25", h: "127.0.0.1", p: 25, s: "", usaCorreo: false },
              ].map((o) => (
                <button key={o.t} type="button" className="btn btn-ghost" style={{ fontSize: 13, padding: "8px 14px" }}
                  onClick={() => setForm((f) => ({
                    ...f,
                    smtp: {
                      ...f.smtp, host: o.h, port: o.p, secure: o.s,
                      user: o.usaCorreo ? (f.from || f.smtp.user) : "",
                    },
                  }))}>
                  {o.t}
                </button>
              ))}
            </div>
            <span className="ayuda">
              El buzón institucional funciona sobre Gmail. Si la salida está cerrada,
              «Servidor local» entrega por el correo de esta misma máquina.
            </span>
            <div className="grid-2">
              <div className="field">
                <label htmlFor="co-host">Servidor</label>
                <input id="co-host" value={form.smtp.host} onChange={(e) => setSmtp("host", e.target.value)} maxLength={253} placeholder="smtp.narino.gov.co"/>
              </div>
              <div className="field">
                <label htmlFor="co-port">Puerto</label>
                <input id="co-port" type="number" min="1" max="65535" value={form.smtp.port}
                  onChange={(e) => setSmtp("port", parseInt(e.target.value, 10) || 587)}/>
                <span className="ayuda">587 con TLS, o 465 con SSL.</span>
              </div>
            </div>
            <div className="field">
              <label htmlFor="co-secure">Cifrado</label>
              <select id="co-secure" value={form.smtp.secure} onChange={(e) => setSmtp("secure", e.target.value)}>
                <option value="tls">STARTTLS (puerto 587)</option>
                <option value="ssl">SSL directo (puerto 465)</option>
                <option value="">Sin cifrar — sólo para un servidor de la propia red</option>
              </select>
            </div>
            <div className="grid-2">
              <div className="field">
                <label htmlFor="co-user">Usuario del buzón</label>
                <input id="co-user" value={form.smtp.user} onChange={(e) => setSmtp("user", e.target.value)} maxLength={254} autoComplete="off"/>
                {esGmail && form.smtp.user && form.from && form.smtp.user.toLowerCase() !== form.from.toLowerCase() && (
                  <span className="ayuda" style={{ color: "var(--bad)" }}>
                    Debe ser la misma dirección que el remitente, o Gmail reescribirá el correo a nombre de este buzón.
                  </span>
                )}
              </div>
              <div className="field">
                <label htmlFor="co-pass">Contraseña del buzón</label>
                <input id="co-pass" type="password" autoComplete="new-password"
                  value={form.smtp.password === CLAVE_OCULTA ? "" : form.smtp.password}
                  placeholder={form.smtp.password === CLAVE_OCULTA ? "Guardada — escribe sólo si la cambias" : ""}
                  onChange={(e) => setSmtp("password", e.target.value === "" ? CLAVE_OCULTA : e.target.value)}
                  maxLength={200}/>
                <span className="ayuda">
                  Se guarda cifrada y no vuelve a mostrarse.
                  {esGmail && (
                    <> <strong>En Gmail no sirve la contraseña de la cuenta</strong>: crea una
                    «contraseña de aplicación» de 16 caracteres en cuenta de Google → Seguridad →
                    Verificación en dos pasos → Contraseñas de aplicaciones. Pégala con sus cuatro
                    grupos de cuatro: los espacios se quitan solos.</>
                  )}
                </span>
                {/* Cuántos caracteres quedaron guardados de verdad. Es lo único
                    que distingue «la clave está mal» de «se coló un carácter
                    invisible al pegarla»: desde fuera, las dos cosas son el
                    mismo 535 y no hay nada que mirar en pantalla. */}
                {guardadaLargo > 0 && (
                  <span className="mono" style={{
                    marginTop: 6, display: "inline-block",
                    color: esGmail && guardadaLargo !== 16 ? "var(--bad)" : "var(--good)",
                  }}>
                    Guardada · {guardadaLargo} caracteres
                    {esGmail && guardadaLargo !== 16 && " · Gmail espera 16"}
                  </span>
                )}
              </div>
            </div>
          </BloqueForm>
        )}

        <Aviso tipo="ok">{ok}</Aviso>
        <Aviso>{error}</Aviso>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn-primary" type="submit" disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar configuración"}
          </button>
          {sobrescrito.length > 0 && (
            <button type="button" className="btn btn-ghost" onClick={restablecer} disabled={guardando}>
              Volver a la del archivo
            </button>
          )}
        </div>
        <p className="mono" style={{ color: "var(--ink-3)", lineHeight: 1.7 }}>
          {sobrescrito.length > 0
            ? "Esta configuración está guardada en la base de datos y pisa a la de api/config.php."
            : "Ahora mismo manda la configuración de api/config.php."}
        </p>
      </form>

      {diag.historico && diag.historico.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <div className="mono" style={{ marginBottom: 10 }}>Lo enviado hasta ahora</div>
          <div className="tabla-scroll" style={{ border: "1px solid var(--line)", borderRadius: "var(--r-md)", background: "var(--paper)" }}>
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", padding: "10px 16px", borderBottom: "1px solid var(--line)", background: "var(--paper-2)" }}>
                {["Transporte", "Resultado", "Mensajes"].map((h) => <div key={h} className="mono">{h}</div>)}
              </div>
              {diag.historico.map((h, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", padding: "12px 16px", borderTop: i ? "1px solid var(--line)" : "none", fontSize: 13 }}>
                  <div>{h.transporte}</div>
                  <div style={{ color: h.estado === "enviado" ? (h.transporte === "log" ? "var(--meh)" : "var(--good)") : "var(--bad)" }}>
                    {h.transporte === "log" && h.estado === "enviado" ? "sólo registrado, no salió" : h.estado}
                  </div>
                  <div className="mono">{h.n}</div>
                </div>
              ))}
            </div>
          </div>
          <p style={{ marginTop: 12 }}>
            <a href="/admin/correos" data-route style={{ fontSize: 13, color: "var(--grano)" }}>Ver la bitácora mensaje a mensaje →</a>
          </p>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { AdminCorreoConfig });
