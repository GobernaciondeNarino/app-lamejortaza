// Módulo de expositores (rol expositor): acceso (registro + login),
// panel del expositor y bandeja de aprobaciones del admin.

const COLORES_SELLO = [
  "oklch(0.45 0.1 40)", "oklch(0.55 0.13 30)", "oklch(0.5 0.08 145)",
  "oklch(0.45 0.09 50)", "oklch(0.5 0.1 200)", "oklch(0.4 0.08 120)",
  "oklch(0.55 0.12 20)", "oklch(0.45 0.12 300)",
];

// Selects de municipio (64) + subregión (13) con auto-relleno. Reutilizable.
const MuniRegionFields = ({ municipio, region, onChange }) => {
  const munis = (window.NARINO_MAPA && window.NARINO_MAPA.municipios) || [];
  const subs = (window.NARINO_SUBREGIONES && window.NARINO_SUBREGIONES.subregiones) || [];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div className="field">
        <label>Municipio</label>
        <select value={municipio} required onChange={(e) => {
          const val = e.target.value;
          const m = munis.find((x) => x.nombre === val);
          const sub = m && window.NARINO_SUBREGIONES ? window.NARINO_SUBREGIONES.porId[m.id] : "";
          onChange({ municipio: val, region: sub || region });
        }}>
          <option value="">— Municipio —</option>
          {munis.slice().sort((a, b) => a.nombre.localeCompare(b.nombre, "es")).map((m) => (
            <option key={m.id} value={m.nombre}>{m.nombre}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Región (subregión)</label>
        <select value={region} onChange={(e) => onChange({ region: e.target.value })}>
          <option value="">— Subregión —</option>
          {subs.map((s) => (<option key={s} value={s}>{s}</option>))}
        </select>
      </div>
    </div>
  );
};

// -------- Acceso de expositor: registro + login --------
const ExpositorAcceso = () => {
  const [tab, setTab] = React.useState("registro");
  const [done, setDone] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [f, setF] = React.useState({
    nombre: "", email: "", password: "",
    stand: { nombre: "", municipio: "", region: "", direccion: "", correo: "", descripcion: "", color: COLORES_SELLO[0] },
  });
  const up = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const upStand = (patch) => setF((s) => ({ ...s, stand: { ...s.stand, ...patch } }));
  const sec = window.LMTSecurity;

  const registrar = async (e) => {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      if (!sec || !sec.isEmail(f.email)) throw new Error("correo_invalido");
      if ((f.password || "").length < 12) throw new Error("password_debil");
      if (!f.nombre.trim()) throw new Error("nombre_invalido");
      if (!f.stand.nombre.trim() || !f.stand.municipio) throw new Error("stand_incompleto");
      await window.LMTApi.registroExpositor(f);
      setDone(true);
    } catch (err) {
      const c = String((err && (err.code || err.message)) || err);
      if (c.includes("correo_en_uso")) setError("Ese correo ya está registrado.");
      else if (c.includes("correo_invalido")) setError("Correo inválido.");
      else if (c.includes("password_debil")) setError("La contraseña debe tener al menos 12 caracteres.");
      else if (c.includes("nombre_invalido")) setError("Escribe tu nombre.");
      else if (c.includes("stand_incompleto") || c.includes("bad_nombre") || c.includes("bad_municipio")) setError("Completa el nombre y el municipio del stand.");
      else if (c.includes("rate_limited")) setError("Demasiados intentos. Espera un momento.");
      else setError("No fue posible registrar. Revisa los datos e intenta de nuevo.");
    } finally { setBusy(false); }
  };

  const entrar = async (e) => {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      const u = await window.LMTApi.signInAdmin(f.email, f.password);
      if (!u) throw new Error("invalid_credentials");
      if (u.role === "expositor") window.LMTRouter.go("/expositor");
      else if (u.admin) window.LMTRouter.go("/admin");
      else throw new Error("forbidden");
    } catch (err) {
      const c = String((err && (err.code || err.message)) || err);
      if (c.includes("cuenta_rechazada")) setError("Tu registro fue rechazado por el organizador.");
      else if (c.includes("rate_limited")) setError("Demasiados intentos. Espera unos minutos.");
      else setError("Credenciales incorrectas.");
    } finally { setBusy(false); }
  };

  if (done) {
    return (
      <div className="mobile-page"><div className="mobile-inner" style={{ textAlign: "center", padding: 40 }}>
        <div className="mono" style={{ marginBottom: 8 }}>Registro enviado</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 34, fontWeight: 400, margin: "0 0 16px", lineHeight: 1.05 }}>
          Tu stand está<br/>pendiente de aprobación.
        </h2>
        <p style={{ color: "var(--ink-2)", lineHeight: 1.6, maxWidth: 380, margin: "0 auto 24px" }}>
          El organizador revisará tu registro. Cuando lo apruebe, tu stand entrará a la votación y podrás gestionarlo. Puedes iniciar sesión para ver el estado.
        </p>
        <button className="btn btn-primary" style={{ justifyContent: "center" }} onClick={() => { setDone(false); setTab("login"); }}>Iniciar sesión</button>
      </div></div>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 20px" }}>
      <a href="/" data-route className="mono" style={{ color: "var(--ink-3)" }}>← Inicio</a>
      <div className="mono" style={{ marginTop: 20 }}>Expositores · Festival del Café</div>
      <h1 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 40, fontWeight: 400, margin: "6px 0 20px", lineHeight: 1 }}>
        Registra tu stand.
      </h1>

      <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
        {[["registro", "Registrarme"], ["login", "Ya tengo cuenta"]].map(([k, l]) => (
          <button key={k} onClick={() => { setTab(k); setError(""); }} style={{
            padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 500,
            border: tab === k ? "1px solid var(--ink)" : "1px solid var(--line-2)",
            background: tab === k ? "var(--ink)" : "var(--paper)", color: tab === k ? "var(--paper)" : "var(--ink)",
          }}>{l}</button>
        ))}
      </div>

      {error && <div role="alert" style={{ marginBottom: 16, padding: "10px 12px", border: "1px solid var(--bad)", color: "var(--bad)", borderRadius: "var(--r-sm)", fontSize: 13 }}>{error}</div>}

      {tab === "login" ? (
        <form onSubmit={entrar} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="field"><label>Correo</label>
            <input type="email" autoComplete="username" value={f.email} onChange={(e) => up("email", e.target.value)} required maxLength={254}/></div>
          <div className="field"><label>Contraseña</label>
            <input type="password" autoComplete="current-password" value={f.password} onChange={(e) => up("password", e.target.value)} required maxLength={128}/></div>
          <button className="btn btn-primary" type="submit" disabled={busy} style={{ justifyContent: "center", padding: 14, opacity: busy ? 0.6 : 1 }}>
            {busy ? "Entrando…" : "Entrar →"}
          </button>
        </form>
      ) : (
        <form onSubmit={registrar} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="mono">Tus datos</div>
          <div className="field"><label>Tu nombre</label>
            <input value={f.nombre} onChange={(e) => up("nombre", e.target.value)} required maxLength={120} placeholder="Nombre del responsable"/></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="field"><label>Correo</label>
              <input type="email" value={f.email} onChange={(e) => up("email", e.target.value)} required maxLength={254}/></div>
            <div className="field"><label>Contraseña (mín. 12)</label>
              <input type="password" value={f.password} onChange={(e) => up("password", e.target.value)} required minLength={12} maxLength={128}/></div>
          </div>

          <div className="mono" style={{ marginTop: 8 }}>Tu stand</div>
          <div className="field"><label>Nombre del stand</label>
            <input value={f.stand.nombre} onChange={(e) => upStand({ nombre: e.target.value })} required maxLength={80} placeholder="Ej: Finca El Tambo"/></div>
          <MuniRegionFields municipio={f.stand.municipio} region={f.stand.region} onChange={upStand}/>
          <div className="field"><label>Dirección</label>
            <input value={f.stand.direccion} onChange={(e) => upStand({ direccion: e.target.value })} maxLength={255}/></div>
          <div className="field"><label>Correo de contacto del stand</label>
            <input type="email" value={f.stand.correo} onChange={(e) => upStand({ correo: e.target.value })} maxLength={254}/></div>
          <div className="field"><label>Descripción corta</label>
            <textarea rows={3} value={f.stand.descripcion} onChange={(e) => upStand({ descripcion: e.target.value })} maxLength={800} style={{ border: "1px solid var(--line-2)", borderRadius: "var(--r-md)", padding: 12 }}/></div>
          <div className="field"><label>Color del sello</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {COLORES_SELLO.map((c) => (
                <button type="button" key={c} onClick={() => upStand({ color: c })} aria-label="color" style={{
                  width: 34, height: 34, borderRadius: "50%", background: c,
                  border: f.stand.color === c ? "3px solid var(--ink)" : "2px solid var(--paper)", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }}/>
              ))}
            </div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={busy} style={{ justifyContent: "center", padding: 14, marginTop: 6, opacity: busy ? 0.6 : 1 }}>
            {busy ? "Enviando…" : "Registrar mi stand →"}
          </button>
          <p className="mono" style={{ textAlign: "center", color: "var(--ink-3)", lineHeight: 1.6 }}>
            Tu stand quedará pendiente hasta que el<br/>organizador lo apruebe.
          </p>
        </form>
      )}
    </div>
  );
};

// -------- Panel del expositor --------
const ExpositorPanel = () => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [form, setForm] = React.useState(null);
  const [msg, setMsg] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const sec = window.LMTSecurity;

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const d = await window.LMTApi.getMiStand();
      setData(d);
      if (d.stand) setForm({ ...d.stand });
    } catch (_) { setData({ estado_cuenta: "?", stand: null }); }
    finally { setLoading(false); }
  }, []);
  React.useEffect(() => { load(); }, [load]);

  const salir = async () => { try { await window.LMTApi.signOutAdmin(); } catch (_) {} window.LMTRouter.go("/"); };

  const guardar = async () => {
    setBusy(true); setMsg("");
    try {
      await window.LMTApi.updateStand(form.id, {
        nombre: form.nombre, direccion: form.direccion, correo: form.correo,
        descripcion: form.descripcion, color: form.color,
        // el backend ignora estos del expositor, pero se envían por validación:
        municipio: form.municipio, region: form.region, coords: form.coords,
      });
      setMsg("Cambios guardados.");
      await window.LMTApi.pollDashboard();
    } catch (e) {
      setMsg("No fue posible guardar: " + String((e && (e.code || e.message)) || e));
    } finally { setBusy(false); }
  };

  if (loading) return <div className="mobile-page"><div className="mobile-inner"><div className="splash">Cargando…</div></div></div>;

  const estado = data && data.estado_cuenta;
  const Header = () => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid var(--line)" }}>
      <div><Wordmark size={15}/><div className="mono" style={{ marginTop: 2 }}>Panel del expositor</div></div>
      <button onClick={salir} className="mono" style={{ color: "var(--ink-3)" }}>Cerrar sesión</button>
    </div>
  );

  if (estado !== "activo" || !data.stand) {
    return (
      <div style={{ minHeight: "100dvh", background: "var(--paper)" }}>
        <Header/>
        <div style={{ maxWidth: 520, margin: "0 auto", padding: 48, textAlign: "center" }}>
          <div className="mono" style={{ marginBottom: 8 }}>Estado: {estado}</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 34, fontWeight: 400, margin: "0 0 16px", lineHeight: 1.05 }}>
            {estado === "rechazado" ? "Tu registro fue rechazado." : "Tu registro está pendiente."}
          </h2>
          <p style={{ color: "var(--ink-2)", lineHeight: 1.6 }}>
            {estado === "rechazado"
              ? "El organizador no aprobó tu stand. Contáctalo para más información."
              : "El organizador revisará tu stand. Cuando lo apruebe, entrará a la votación y podrás gestionarlo aquí."}
          </p>
        </div>
      </div>
    );
  }

  const s = form;
  const score = window.calcScore ? window.calcScore(data.stand.votos) : 0;
  const total = window.totalVotos ? window.totalVotos(data.stand.votos) : 0;
  return (
    <div style={{ minHeight: "100dvh", background: "var(--paper)" }}>
      <Header/>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
        <div className="mono">Mi stand · activo</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 40, fontWeight: 400, margin: "4px 0 20px" }}>{data.stand.nombre}</h1>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 28 }}>
          {[["Puntaje", score.toFixed(0) + "/100"], ["Votos", total], ["Municipio", data.stand.municipio]].map(([k, v]) => (
            <div key={k} style={{ padding: 16, border: "1px solid var(--line)", borderRadius: "var(--r-md)" }}>
              <div className="mono">{k}</div>
              <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 26, marginTop: 6 }}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 28, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="mono">Editar mi stand</div>
            <div className="field"><label>Nombre</label>
              <input value={s.nombre} onChange={(e) => setForm({ ...s, nombre: e.target.value })} maxLength={80}/></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="field"><label>Municipio (fijado por el organizador)</label>
                <input value={s.municipio} disabled style={{ opacity: 0.6 }}/></div>
              <div className="field"><label>Región</label>
                <input value={s.region || ""} disabled style={{ opacity: 0.6 }}/></div>
            </div>
            <div className="field"><label>Dirección</label>
              <input value={s.direccion || ""} onChange={(e) => setForm({ ...s, direccion: e.target.value })} maxLength={255}/></div>
            <div className="field"><label>Correo de contacto</label>
              <input type="email" value={s.correo || ""} onChange={(e) => setForm({ ...s, correo: e.target.value })} maxLength={254}/></div>
            <div className="field"><label>Descripción</label>
              <textarea rows={3} value={s.descripcion || ""} onChange={(e) => setForm({ ...s, descripcion: e.target.value })} maxLength={800} style={{ border: "1px solid var(--line-2)", borderRadius: "var(--r-md)", padding: 12 }}/></div>
            <div className="field"><label>Color del sello</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {COLORES_SELLO.map((c) => (
                  <button type="button" key={c} onClick={() => setForm({ ...s, color: c })} style={{ width: 30, height: 30, borderRadius: "50%", background: c, border: s.color === c ? "3px solid var(--ink)" : "2px solid var(--paper)" }}/>
                ))}
              </div>
            </div>
            {msg && <div className="mono" style={{ color: "var(--ink-2)" }}>{msg}</div>}
            <button className="btn btn-primary" onClick={guardar} disabled={busy} style={{ justifyContent: "center", padding: 14, opacity: busy ? 0.6 : 1 }}>
              {busy ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
          <div style={{ textAlign: "center" }}>
            <div className="mono" style={{ marginBottom: 10 }}>QR de tu stand</div>
            <div style={{ padding: 12, border: "1px solid var(--line)", borderRadius: "var(--r-md)", display: "inline-block", background: "#fff" }}>
              <QRCode data={data.stand.id} size={160}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// -------- Bandeja de aprobaciones (admin) --------
const AdminAprobaciones = () => {
  const [items, setItems] = React.useState(null);
  const [busy, setBusy] = React.useState("");

  const load = React.useCallback(async () => {
    try { setItems(await window.LMTApi.getAprobaciones()); } catch (_) { setItems([]); }
  }, []);
  React.useEffect(() => { load(); }, [load]);

  const act = async (id, fn) => {
    setBusy(id);
    try { await fn(id); await window.LMTApi.pollDashboard(); await load(); }
    catch (_) {} finally { setBusy(""); }
  };

  if (items === null) return <div style={{ padding: 40 }} className="mono">Cargando…</div>;

  return (
    <div style={{ padding: "40px 48px" }}>
      <div className="mono">Aprobaciones · {items.length} pendientes</div>
      <h1 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 44, fontWeight: 400, margin: "4px 0 28px" }}>Stands por aprobar</h1>

      {items.length === 0 ? (
        <div style={{ padding: 60, border: "1px dashed var(--line-2)", borderRadius: "var(--r-md)", textAlign: "center", color: "var(--ink-3)" }}>
          <div className="mono">Sin pendientes</div>
          <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 26, color: "var(--ink)", marginTop: 8 }}>Todo al día.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {items.map((s) => (
            <div key={s.id} style={{ border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: 20, background: "var(--paper)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 14, height: 14, borderRadius: "50%", background: s.color }}/>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{s.nombre}</div>
                    <span className="mono">#{s.id}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 6 }}>{s.municipio} · {s.region}</div>
                  <div style={{ fontSize: 13, color: "var(--ink-2)" }}>{s.direccion}</div>
                  {s.descripcion && <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 6, fontStyle: "italic" }}>"{s.descripcion}"</div>}
                  <div className="mono" style={{ marginTop: 10 }}>Expositor: {s.expositor && s.expositor.nombre} · {s.expositor && s.expositor.email}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 150 }}>
                  <button className="btn btn-primary" disabled={busy === s.id} onClick={() => act(s.id, window.LMTApi.aprobarStand)} style={{ justifyContent: "center" }}>Aprobar</button>
                  <a href={"/admin/stands/" + s.id + "/edit"} data-route className="btn btn-ghost" style={{ justifyContent: "center" }}>Editar</a>
                  <button className="btn btn-ghost" disabled={busy === s.id} onClick={() => act(s.id, window.LMTApi.rechazarStand)} style={{ justifyContent: "center", color: "var(--bad)" }}>Rechazar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

Object.assign(window, { ExpositorAcceso, ExpositorPanel, AdminAprobaciones, MuniRegionFields });
