// Cuentas de administración del festival.
//
//   /admin/cuentas   el propietario crea organizadores, cambia perfiles,
//                    repone contraseñas y da de baja cuentas.
//   Interstitial     quien entra con la contraseña que le llegó por correo no
//                    ve el panel hasta cambiarla (el backend además rechaza
//                    cualquier otra ruta mientras la bandera siga puesta).

const ROL_ETIQUETA = {
  propietario: { texto: "Propietario", color: "var(--galeras)", ayuda: "Administra el festival y las cuentas de acceso." },
  organizador: { texto: "Organizador", color: "var(--cafeto)", ayuda: "Administra el festival: espacios, votos, pasaportes y promotores." },
};

const RolPill = ({ rol }) => {
  const r = ROL_ETIQUETA[rol] || { texto: rol, color: "var(--ink-3)" };
  return (
    <span className="mono" style={{
      display: "inline-block", padding: "3px 10px", borderRadius: 999,
      border: `1px solid ${r.color}`, color: r.color, fontSize: 10,
    }}>{r.texto}</span>
  );
};

const fechaCorta = (iso) => {
  if (!iso) return "—";
  const d = new Date(String(iso).replace(" ", "T") + (String(iso).endsWith("Z") ? "" : "Z"));
  if (isNaN(d.getTime())) return String(iso).slice(0, 16);
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
       + " · " + d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
};

// ---------------------------------------------------------------------------
// Cambio obligatorio de la contraseña temporal
// ---------------------------------------------------------------------------

const AdminCambioClave = ({ user }) => {
  const [actual, setActual] = React.useState("");
  const [nueva, setNueva] = React.useState("");
  const [repetir, setRepetir] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const enviar = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    if (nueva.length < 10) { setError("La nueva contraseña debe tener al menos 10 caracteres."); return; }
    if (nueva !== repetir) { setError("Las dos contraseñas nuevas no coinciden."); return; }
    setBusy(true);
    try {
      await window.LMTApi.cambiarClaveAdmin(actual, nueva);
      window.LMTRouter.go("/admin");
    } catch (err) {
      setError(mensajeError(err, "No fue posible cambiar la contraseña."));
    } finally { setBusy(false); }
  };

  const salir = async () => {
    if (window.LMTApi && window.LMTApi.enabled) await window.LMTApi.signOutAdmin();
    window.LMTRouter.go("/");
  };

  return (
    <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: "24px 16px", background: "var(--paper-2)" }}>
      <form onSubmit={enviar} style={{
        width: "100%", maxWidth: 460, background: "var(--paper)", padding: "28px 24px",
        border: "1px solid var(--line)", borderRadius: "var(--r-md)",
      }}>
        <div className="mono">Primer acceso</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 400, fontSize: 32, margin: "6px 0 12px", lineHeight: 1.1 }}>
          Cambia tu contraseña
        </h1>
        <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6, margin: "0 0 22px" }}>
          La contraseña que usaste llegó por correo, así que la damos por conocida.
          Elige una nueva para entrar al panel{user && user.email ? ` como ${user.email}` : ""}.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="field">
            <label htmlFor="cc-actual">Contraseña que te enviamos</label>
            <input id="cc-actual" type="password" autoComplete="current-password" value={actual}
              onChange={(e) => setActual(e.target.value)} maxLength={128} required/>
          </div>
          <div className="field">
            <label htmlFor="cc-nueva">Contraseña nueva</label>
            <input id="cc-nueva" type="password" autoComplete="new-password" value={nueva}
              onChange={(e) => setNueva(e.target.value)} maxLength={128} required/>
            <span className="ayuda">
              Mínimo 10 caracteres, con mayúsculas, minúsculas y números. Evita tu nombre,
              tu correo y palabras como «café» o «festival».
            </span>
          </div>
          <div className="field">
            <label htmlFor="cc-repetir">Repite la contraseña nueva</label>
            <input id="cc-repetir" type="password" autoComplete="new-password" value={repetir}
              onChange={(e) => setRepetir(e.target.value)} maxLength={128} required/>
          </div>
          <Aviso>{error}</Aviso>
          <button className="btn btn-primary" type="submit" disabled={busy}
            style={{ justifyContent: "center", padding: 14, opacity: busy ? 0.6 : 1 }}>
            {busy ? "Guardando…" : "Guardar y entrar →"}
          </button>
          <button type="button" onClick={salir} className="btn btn-ghost" style={{ justifyContent: "center" }}>
            Cerrar sesión
          </button>
        </div>
      </form>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Listado y alta
// ---------------------------------------------------------------------------

const AdminCuentas = ({ user }) => {
  const [datos, setDatos] = React.useState(null);      // { yo, lista }
  const [cargando, setCargando] = React.useState(true);
  const [error, setError] = React.useState("");
  const [aviso, setAviso] = React.useState(null);
  const [ocupado, setOcupado] = React.useState(0);
  const [abierto, setAbierto] = React.useState(false);
  const [nuevo, setNuevo] = React.useState({ nombre: "", email: "", rol: "organizador" });
  const [creando, setCreando] = React.useState(false);

  const cargar = React.useCallback(async () => {
    setCargando(true);
    try {
      setDatos(await window.LMTApi.listarAdmins());
      setError("");
    } catch (err) {
      setError(mensajeError(err, "No fue posible cargar las cuentas."));
    } finally { setCargando(false); }
  }, []);

  React.useEffect(() => { cargar(); }, [cargar]);

  const accion = async (id, fn, exito) => {
    setOcupado(id); setAviso(null);
    try {
      const res = await fn();
      await cargar();
      setAviso(exito(res));
    } catch (err) {
      setAviso({ tipo: "error", texto: mensajeError(err, "No fue posible completar la acción.") });
    } finally { setOcupado(0); }
  };

  const crear = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setAviso(null);
    if (!window.LMTSecurity || !window.LMTSecurity.isEmail(nuevo.email)) {
      setAviso({ tipo: "error", texto: "El correo no es válido." }); return;
    }
    if (nuevo.nombre.trim().length < 3) {
      setAviso({ tipo: "error", texto: "Escribe el nombre completo de la persona." }); return;
    }
    setCreando(true);
    try {
      const res = await window.LMTApi.crearAdmin({
        nombre: nuevo.nombre.trim(), email: nuevo.email.trim().toLowerCase(), rol: nuevo.rol,
      });
      setNuevo({ nombre: "", email: "", rol: "organizador" });
      setAbierto(false);
      await cargar();
      setAviso(res.correo_enviado
        ? { tipo: "ok", texto: `Cuenta creada. La contraseña temporal salió hacia ${res.email || nuevo.email}.` }
        : { tipo: "error", texto: `Cuenta creada, pero el correo NO salió. Entrega esta contraseña en persona: ${res.clave_temporal}` });
    } catch (err) {
      setAviso({ tipo: "error", texto: mensajeError(err, "No fue posible crear la cuenta.") });
    } finally { setCreando(false); }
  };

  const cambiarRol = (a, rol) => accion(a.id,
    () => window.LMTApi.actualizarAdmin(a.id, { nombre: a.nombre || a.email, rol }),
    () => ({ tipo: "ok", texto: `${a.nombre || a.email} ahora es ${ROL_ETIQUETA[rol].texto.toLowerCase()}.` }));

  const alternarActivo = (a) => accion(a.id,
    () => window.LMTApi.actualizarAdmin(a.id, { nombre: a.nombre || a.email, activo: !a.activo }),
    () => ({ tipo: "ok", texto: a.activo ? "Cuenta desactivada: ya no puede entrar." : "Cuenta reactivada." }));

  const reponer = (a) => {
    if (!window.confirm(`Se generará una contraseña nueva para ${a.email} y la actual dejará de funcionar. ¿Continuar?`)) return;
    accion(a.id, () => window.LMTApi.reponerClaveAdmin(a.id), (res) => (
      res.correo_enviado
        ? { tipo: "ok", texto: `Contraseña nueva enviada a ${a.email}.` }
        : { tipo: "error", texto: `El correo no salió. Contraseña nueva para ${a.email}: ${res.clave_temporal}` }
    ));
  };

  const eliminar = (a) => {
    if (!window.confirm(`Eliminar la cuenta de ${a.email}. Esta acción no se puede deshacer. ¿Continuar?`)) return;
    accion(a.id, () => window.LMTApi.borrarAdmin(a.id), () => ({ tipo: "ok", texto: "Cuenta eliminada." }));
  };

  const lista = (datos && datos.lista) || [];
  const yoId = (datos && datos.yo && datos.yo.id) || (user && user.id) || 0;
  const propietarios = lista.filter((a) => a.rol === "propietario" && a.activo).length;

  return (
    <div className="admin-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        <div>
          <div className="mono">Cuentas · {lista.length} registradas</div>
          <h1 className="titulo-xl">Administradores</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setAbierto((v) => !v)}>
          {abierto ? "Cancelar" : "+ Crear cuenta"}
        </button>
      </div>

      <p style={{ color: "var(--ink-2)", fontSize: 14, lineHeight: 1.6, margin: "0 0 20px", maxWidth: 640 }}>
        Al crear una cuenta se genera una contraseña temporal y se envía al correo de la persona.
        El sistema le exige cambiarla la primera vez que entra: hasta entonces no puede ver ni
        exportar nada.
      </p>

      {abierto && (
        <form onSubmit={crear} style={{
          border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: 20,
          background: "var(--paper)", marginBottom: 24,
        }}>
          <div className="mono" style={{ marginBottom: 14 }}>Nueva cuenta</div>
          <div className="grid-2" style={{ gap: 16 }}>
            <div className="field">
              <label htmlFor="ac-nombre">Nombre completo</label>
              <input id="ac-nombre" value={nuevo.nombre} maxLength={120} required
                onChange={(e) => setNuevo((n) => ({ ...n, nombre: e.target.value }))}/>
            </div>
            <div className="field">
              <label htmlFor="ac-email">Correo institucional</label>
              <input id="ac-email" type="email" value={nuevo.email} maxLength={254} required
                autoComplete="off"
                onChange={(e) => setNuevo((n) => ({ ...n, email: e.target.value }))}/>
              <span className="ayuda">Ahí llegará la contraseña temporal.</span>
            </div>
          </div>
          <div className="field" style={{ marginTop: 16, maxWidth: 420 }}>
            <label htmlFor="ac-rol">Perfil</label>
            <select id="ac-rol" value={nuevo.rol} onChange={(e) => setNuevo((n) => ({ ...n, rol: e.target.value }))}>
              <option value="organizador">Organizador</option>
              <option value="propietario">Propietario</option>
            </select>
            <span className="ayuda">{ROL_ETIQUETA[nuevo.rol].ayuda}</span>
          </div>
          <button className="btn btn-primary" type="submit" disabled={creando} style={{ marginTop: 18 }}>
            {creando ? "Creando…" : "Crear y enviar contraseña"}
          </button>
        </form>
      )}

      {aviso && <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>}
      <Aviso>{error}</Aviso>

      {cargando ? (
        <div className="splash">Cargando…</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}>
          {lista.map((a) => {
            const soyYo = a.id === yoId;
            const ultimoPropietario = a.rol === "propietario" && a.activo && propietarios <= 1;
            const bloqueado = ocupado === a.id;
            return (
              <div key={a.id} style={{
                border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: 20,
                background: "var(--paper)", opacity: a.activo ? 1 : 0.62,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
                  <div style={{ minWidth: 220, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <strong style={{ fontSize: 16, fontWeight: 600 }}>{a.nombre || a.email}</strong>
                      <RolPill rol={a.rol}/>
                      {soyYo && <span className="mono" style={{ color: "var(--ink-3)" }}>tú</span>}
                      {!a.activo && <span className="mono" style={{ color: "var(--bad)" }}>desactivada</span>}
                      {a.clave_sin_usar && <span className="mono" style={{ color: "var(--meh)" }}>clave sin estrenar</span>}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 6, lineHeight: 1.7, wordBreak: "break-word" }}>
                      {a.email}
                    </div>
                    <div className="mono" style={{ marginTop: 6, color: "var(--ink-3)" }}>
                      Último acceso: {fechaCorta(a.ultimo_acceso)} · Alta: {fechaCorta(a.created_at)}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <select
                      value={a.rol}
                      disabled={bloqueado || ultimoPropietario}
                      title={ultimoPropietario ? "Debe quedar al menos un propietario activo." : "Perfil de la cuenta"}
                      onChange={(e) => cambiarRol(a, e.target.value)}
                      style={{ padding: "7px 10px", fontSize: 13 }}>
                      <option value="organizador">Organizador</option>
                      <option value="propietario">Propietario</option>
                    </select>
                    <button className="btn" disabled={bloqueado} onClick={() => reponer(a)}
                      style={{ padding: "7px 14px", fontSize: 13 }}>
                      Reponer contraseña
                    </button>
                    <button className="btn" disabled={bloqueado || ultimoPropietario}
                      onClick={() => alternarActivo(a)}
                      style={{ padding: "7px 14px", fontSize: 13 }}>
                      {a.activo ? "Desactivar" : "Reactivar"}
                    </button>
                    <button className="btn" disabled={bloqueado || soyYo || ultimoPropietario}
                      onClick={() => eliminar(a)}
                      title={soyYo ? "No puedes eliminar tu propia cuenta." : ""}
                      style={{ padding: "7px 14px", fontSize: 13, color: soyYo ? "var(--ink-3)" : "var(--bad)" }}>
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

Object.assign(window, { AdminCuentas, AdminCambioClave, RolPill });
