// Vista móvil REAL de votación (la que se abre al escanear el QR del stand).
// URL: /s/{standId}. Sin marco de teléfono — ocupa la pantalla.

const EMOJIS = [
  { id: "malo", label: "Malo", emoji: "😞", color: "var(--bad)" },
  { id: "regular", label: "Regular", emoji: "😐", color: "var(--meh)" },
  { id: "bueno", label: "Excelente", emoji: "😍", color: "var(--good)" },
];

const MobileHeader = ({ stand }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 16, borderBottom: "1px solid var(--line)", marginBottom: 16 }}>
    <div style={{ width: 44, height: 44, borderRadius: "50%", background: stand.color, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--paper)", fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 18 }}>
      {(stand.nombre || "?")[0]}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div className="mono" style={{ fontSize: 9 }}>#{stand.id.toUpperCase()}</div>
      <div style={{ fontWeight: 600, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{stand.nombre}</div>
    </div>
  </div>
);

// Votación "un toque": una sola pantalla. Tocar un emoji registra el voto al
// instante si ya hay correo guardado; la primera vez revela un campo de correo
// (una sola vez). Comentario y compra quedan plegados como opcionales.
const VoteForm = ({ stand, onComplete, savedEmail }) => {
  const sec = window.LMTSecurity;
  const [data, setData] = React.useState({ correo: savedEmail || "", emoji: null, compra: null, texto: "" });
  const [needEmail, setNeedEmail] = React.useState(false);   // reveló el campo de correo
  const [showOpt, setShowOpt] = React.useState(false);       // desplegó comentario/compra
  const [submitError, setSubmitError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const emailRef = React.useRef(null);

  const update = (k, v) => setData(d => ({ ...d, [k]: v }));
  const isEmail = (v) => sec ? sec.isEmail((v || "").trim()) : (v || "").includes("@");
  const correoOk = isEmail(data.correo);

  React.useEffect(() => {
    if (needEmail && emailRef.current) emailRef.current.focus();
  }, [needEmail]);

  // Envía el voto. Recibe emoji y correo explícitos para no depender del
  // estado asíncrono de React tras un toque.
  const submitVote = async (emojiId, correo) => {
    setSubmitError("");
    setSubmitting(true);
    try {
      const payload = { stand: stand.id, emoji: emojiId, correo, compra: data.compra, texto: data.texto };
      if (window.LMTApi && window.LMTApi.enabled) {
        await window.LMTApi.submitVote(payload);
      } else if (sec) {
        sec.buildVotePayload(payload);
      }
      try { localStorage.setItem("lmt.email", sec ? sec.normalizeEmail(correo) : correo.toLowerCase()); } catch (_) {}
      onComplete(data);
    } catch (e) {
      const code = String((e && (e.code || e.message)) || e);
      if (code.includes("ya_votaste")) setSubmitError("Ya registraste un voto para este stand con ese correo.");
      else if (code.includes("rate_limited")) setSubmitError("Demasiados votos seguidos. Espera un momento e intenta de nuevo.");
      else if (code.includes("correo_invalido")) setSubmitError("El correo no es válido.");
      else if (code.includes("emoji_invalido")) setSubmitError("Selecciona una calificación.");
      else if (code.includes("stand_no_existe")) setSubmitError("Este stand ya no está disponible.");
      else if (code.includes("csrf")) setSubmitError("Sesión expirada. Recarga la página y vuelve a intentar.");
      else setSubmitError("No fue posible registrar tu voto. Intenta de nuevo.");
      setSubmitting(false);
    }
  };

  // Toque en un emoji: es la acción principal.
  const onEmoji = (emojiId) => {
    if (submitting) return;
    setSubmitError("");
    update("emoji", emojiId);
    if (correoOk) {
      submitVote(emojiId, data.correo);          // un toque = listo
    } else {
      setNeedEmail(true);                         // primera vez: pedir correo
    }
  };

  const confirmFirstTime = () => {
    if (!data.emoji || !correoOk || submitting) return;
    submitVote(data.emoji, data.correo);
  };

  // "Cerrar sesión" del votante en este dispositivo: olvida el correo recordado
  // para que otra persona pueda registrarse/votar desde el mismo teléfono.
  const switchAccount = () => {
    try { localStorage.removeItem("lmt.email"); } catch (_) {}
    setData(d => ({ ...d, correo: "", emoji: null }));
    setNeedEmail(false);
    setSubmitError("");
  };
  const maskedEmail = sec ? sec.maskEmail(data.correo) : data.correo;

  return (
    <div style={{ animation: "fade-up 0.4s" }}>
      <MobileHeader stand={stand}/>

      {/* Indicador de sesión: el votante ya está "registrado" en este dispositivo */}
      {correoOk && !needEmail && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
          padding: "8px 12px", marginBottom: 16, borderRadius: "var(--r-md)",
          background: "color-mix(in oklch, var(--good) 8%, var(--paper))",
          border: "1px solid var(--line)",
        }}>
          <span style={{ fontSize: 12, color: "var(--ink-2)" }}>
            ✓ Sesión iniciada · <strong style={{ fontWeight: 500 }}>{maskedEmail}</strong>
          </span>
          <button onClick={switchAccount} className="mono" style={{
            background: "none", border: "none", color: "var(--ink-3)", cursor: "pointer", textDecoration: "underline",
          }}>cambiar</button>
        </div>
      )}

      <h2 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 30, fontWeight: 400, margin: "4px 0 6px", lineHeight: 1.1, letterSpacing: "-0.01em" }}>
        ¿Cómo estuvo<br/>el café?
      </h2>
      <p style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 20 }}>Toca para calificar.</p>

      {/* Emojis grandes en fila — acción principal de un toque */}
      <div style={{ display: "flex", gap: 10 }}>
        {EMOJIS.map(e => {
          const selected = data.emoji === e.id;
          return (
            <button key={e.id} onClick={() => onEmoji(e.id)} disabled={submitting} aria-label={e.label} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              padding: "22px 8px",
              border: selected ? `2px solid ${e.color}` : "1px solid var(--line-2)",
              borderRadius: "var(--r-lg)",
              background: selected ? `color-mix(in oklch, ${e.color} 10%, var(--paper))` : "var(--paper)",
              transition: "all 0.15s", cursor: submitting ? "default" : "pointer",
            }}>
              <span style={{ fontSize: 40, lineHeight: 1 }}>{e.emoji}</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{e.label}</span>
            </button>
          );
        })}
      </div>

      {submitting && (
        <p className="mono" style={{ textAlign: "center", marginTop: 18, color: "var(--ink-2)" }}>
          Registrando tu voto…
        </p>
      )}

      {/* Primera vez: registro por correo (una sola vez) tras tocar el emoji */}
      {needEmail && !submitting && (
        <div style={{ animation: "fade-up 0.3s", marginTop: 20 }}>
          <div className="mono" style={{ marginBottom: 6 }}>Regístrate para votar · una sola vez</div>
          <div className="field">
            <label>Tu correo</label>
            <input ref={emailRef} type="email" autoComplete="email" inputMode="email" maxLength={254}
              placeholder="nombre@correo.co" value={data.correo}
              onChange={e => update("correo", e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") confirmFirstTime(); }}/>
          </div>
          <p style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 6, lineHeight: 1.5 }}>
            Con tu correo creamos tu pasaporte del café. Queda guardado en este
            dispositivo: la próxima vez votas con un solo toque, sin registrarte de nuevo.
          </p>
          <button className="btn btn-primary" onClick={confirmFirstTime} disabled={!correoOk}
            style={{ width: "100%", justifyContent: "center", padding: 14, marginTop: 14, opacity: correoOk ? 1 : 0.4 }}>
            Registrarme y votar →
          </button>
        </div>
      )}

      {/* Opcional plegado: comentario + compra */}
      {!submitting && (
        <div style={{ marginTop: 18 }}>
          {!showOpt ? (
            <button onClick={() => setShowOpt(true)} className="mono"
              style={{ background: "none", border: "none", color: "var(--ink-2)", cursor: "pointer", padding: "6px 0", textDecoration: "underline" }}>
              + Agregar comentario (opcional)
            </button>
          ) : (
            <div style={{ animation: "fade-up 0.3s" }}>
              <div className="mono" style={{ marginBottom: 10 }}>¿Compraste algo?</div>
              <div style={{ display: "flex", gap: 10 }}>
                {[{v:true,l:"Sí, compré"},{v:false,l:"No esta vez"}].map(o => (
                  <button key={String(o.v)} onClick={() => update("compra", o.v)} style={{
                    flex: 1, padding: 12,
                    border: data.compra === o.v ? "2px solid var(--ink)" : "1px solid var(--line-2)",
                    borderRadius: "var(--r-md)", fontSize: 14, fontWeight: 500,
                    background: data.compra === o.v ? "var(--paper-2)" : "var(--paper)",
                  }}>{o.l}</button>
                ))}
              </div>
              <div className="field" style={{ marginTop: 16 }}>
                <label>Comentario (opcional, máx. 500)</label>
                <textarea rows={3} value={data.texto} maxLength={500} onChange={e => update("texto", e.target.value)}
                  placeholder="¿Qué destacarías del stand?"
                  style={{ border: "1px solid var(--line-2)", borderRadius: "var(--r-md)", padding: 12 }}/>
                <div className="mono" style={{ alignSelf: "flex-end", color: "var(--ink-3)" }}>{data.texto.length}/500</div>
              </div>
              <p className="mono" style={{ color: "var(--ink-3)", marginTop: 6 }}>
                Toca un emoji arriba para enviar tu voto con esto.
              </p>
            </div>
          )}
        </div>
      )}

      {submitError && (
        <div role="alert" style={{ marginTop: 16, padding: "10px 12px", border: "1px solid var(--bad)", color: "var(--bad)", borderRadius: "var(--r-sm)", fontSize: 13 }}>
          {submitError}
        </div>
      )}

      <p className="mono" style={{ textAlign: "center", marginTop: 20, lineHeight: 1.6, color: "var(--ink-3)" }}>
        Al votar aceptas el tratamiento<br/>de datos del festival.
      </p>
    </div>
  );
};

const VoteConfirm = ({ stand, onGoPassport, onGoDashboard }) => {
  const [stamped, setStamped] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setStamped(true), 250);
    return () => clearTimeout(t);
  }, []);

  return (
    <div>
      <div className="mono" style={{ textAlign: "center", marginTop: 8 }}>✓ Voto registrado</div>
      <h2 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 36, fontWeight: 400, margin: "12px 0 6px", textAlign: "center", lineHeight: 1.05 }}>
        Tu pasaporte<br/>ha sido sellado.
      </h2>
      <p style={{ fontSize: 13, color: "var(--ink-2)", textAlign: "center", marginTop: 8 }}>
        {stand.nombre} · {stand.municipio}
      </p>
      <div style={{
        marginTop: 24, aspectRatio: "1/1.3", background: "var(--paper-2)",
        borderRadius: "var(--r-md)", border: "1px solid var(--line)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "repeating-linear-gradient(var(--paper-2) 0, var(--paper-2) 23px, var(--line) 23px, var(--line) 24px)",
          opacity: 0.5,
        }}/>
        <div style={{ padding: 20, position: "relative", height: "100%" }}>
          <div className="mono">Pasaporte · Sellado</div>
          <div style={{
            position: "absolute", top: "55%", left: "50%",
            "--stamp-rot": "-14deg",
            animation: stamped ? "stamp-land 0.6s cubic-bezier(.2,.8,.2,1.2) forwards" : "none",
            opacity: 0,
          }}>
            <SelloCircular stand={stand} size={170} rotation={-14}/>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
        <button className="btn btn-primary" onClick={onGoPassport} style={{ justifyContent: "center", padding: 14 }}>
          Ver mi pasaporte →
        </button>
        <button className="btn btn-ghost" onClick={onGoDashboard} style={{ justifyContent: "center", padding: 14 }}>
          Ver ranking del festival
        </button>
      </div>
    </div>
  );
};

// Página móvil real para /s/{standId}
const MobileVotePage = ({ stand }) => {
  const [done, setDone] = React.useState(false);
  const savedEmail = (typeof localStorage !== "undefined" && localStorage.getItem("lmt.email")) || "";

  return (
    <div className="mobile-page">
      <div className="mobile-inner">
        {!done && <VoteForm stand={stand} savedEmail={savedEmail} onComplete={() => setDone(true)}/>}
        {done && (
          <VoteConfirm stand={stand}
            onGoPassport={() => window.LMTRouter.go("/pasaporte")}
            onGoDashboard={() => window.LMTRouter.go("/festival")}/>
        )}
      </div>
    </div>
  );
};

Object.assign(window, { VoteForm, VoteConfirm, MobileVotePage });
