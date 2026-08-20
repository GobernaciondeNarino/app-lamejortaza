// Perfil del visitante — /perfil
//
// Quien vota deja su correo y nada más. Aquí puede contarnos, si quiere, de
// dónde nos visita y qué espera del festival. Nada es obligatorio: el grupo
// étnico y la discapacidad son datos sensibles (Ley 1581/2012) y todas las
// listas incluyen «Prefiero no decir». También puede borrar sus datos.

// Valor sólo del desplegable: al elegirlo el país queda vacío y se pide a mano.
// No se guarda nunca; lo que viaja es lo que la persona escriba.
const OTRO_PAIS = "__otro_pais__";

const PERFIL_ETIQUETAS = {
  genero: {
    hombre: "Hombre", mujer: "Mujer", otro: "Otro", prefiero_no_decir: "Prefiero no decir",
  },
  rango_edad: {
    menor_18: "Menor de 18", "18_25": "18 a 25", "26_35": "26 a 35", "36_45": "36 a 45",
    "46_60": "46 a 60", mayor_60: "Mayor de 60", prefiero_no_decir: "Prefiero no decir",
  },
  tipo_visitante: {
    publica: "Entidad pública", privada: "Empresa privada", academica: "Institución académica",
    gremio: "Gremio o asociación", particular: "A título personal", otro: "Otro",
    prefiero_no_decir: "Prefiero no decir",
  },
  grupo_etnico: {
    indigena: "Indígena", afrodescendiente: "Negro, afrocolombiano o afrodescendiente",
    raizal: "Raizal del archipiélago", palenquero: "Palenquero de San Basilio",
    rrom: "Rrom (gitano)", ninguno: "Ninguno", prefiero_no_decir: "Prefiero no decir",
  },
  discapacidad: {
    fisica: "Física o motriz", visual: "Visual", auditiva: "Auditiva",
    intelectual: "Intelectual", psicosocial: "Psicosocial", multiple: "Múltiple",
    ninguna: "Ninguna", prefiero_no_decir: "Prefiero no decir",
  },
  como_se_entero: {
    redes: "Redes sociales", radio: "Radio", television: "Televisión", prensa: "Prensa",
    voz_a_voz: "Un amigo o familiar", institucion: "Una institución", otro: "Otro medio",
  },
};

const PERFIL_VACIO = {
  nombre: "", telefono: "", genero: "", rango_edad: "", pais: "Colombia",
  avatar: "", avatar_emoji: "",
  departamento: "", municipio: "", tipo_visitante: "", entidad: "",
  grupo_etnico: "", discapacidad: "", expectativa: "", como_se_entero: "",
  primera_visita: null,
};

/** Desplegable de un catálogo, con la opción vacía siempre disponible. */
const CampoOpcion = ({ id, label, valor, opciones, etiquetas, ayuda, onChange }) => (
  <div className="field">
    <label htmlFor={id}>{label}</label>
    <select id={id} value={valor || ""} onChange={(e) => onChange(e.target.value)}>
      <option value="">Sin responder</option>
      {(opciones || []).map((o) => (
        <option key={o} value={o}>{(etiquetas && etiquetas[o]) || o}</option>
      ))}
    </select>
    {ayuda && <span className="ayuda">{ayuda}</span>}
  </div>
);

/**
 * Retrato del visitante: una foto que sube o un emoji que elige.
 *
 * El emoji no es un adorno: mucha gente no quiere poner su cara en algo que se
 * enseña en una pantalla en la plaza, y sin alternativa lo que hacen es dejarlo
 * vacío. Con un emoji se identifican igual y nadie tiene que decidir entre su
 * privacidad y aparecer.
 *
 * La foto se sube al momento —no espera al «Guardar»— porque es una petición
 * aparte y porque ver el resultado enseguida es lo que dice si salió bien.
 */
const AvatarVisitante = ({ correo, token, foto, emoji, emojis, onFoto, onEmoji, onError }) => {
  const [subiendo, setSubiendo] = React.useState(false);
  const url = urlImagen(foto);

  const subir = async (archivo) => {
    onError("");
    setSubiendo(true);
    try {
      const r = await window.LMTApi.subirFotoVisitante(correo, token, archivo);
      onFoto(r.avatar || "");
    } catch (e) {
      onError(mensajeError(e, "No fue posible subir la foto."));
    } finally { setSubiendo(false); }
  };

  const quitar = async () => {
    onError("");
    try {
      await window.LMTApi.borrarFotoVisitante(correo, token);
      onFoto("");
    } catch (e) { onError(mensajeError(e, "No fue posible quitar la foto.")); }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <div style={{
          width: 84, height: 84, flexShrink: 0, borderRadius: "50%", overflow: "hidden",
          border: "1px solid var(--line-2)", background: "var(--paper-2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {url
            ? <img src={url} alt="Tu foto" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
            : <span style={{ fontSize: 40, lineHeight: 1 }} aria-hidden="true">{emoji || "🙂"}</span>}
        </div>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          <label className="btn btn-ghost" style={{
            justifyContent: "center", cursor: subiendo ? "wait" : "pointer", opacity: subiendo ? 0.6 : 1,
          }}>
            {subiendo ? "Subiendo…" : (url ? "Cambiar foto" : "Subir una foto")}
            <input type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={subiendo}
              onChange={(e) => { const f = e.target.files && e.target.files[0]; e.target.value = ""; if (f) subir(f); }}/>
          </label>
          {url && (
            <button type="button" onClick={quitar} className="mono"
              style={{ background: "none", border: "none", color: "var(--ink-3)", textDecoration: "underline", cursor: "pointer", padding: "6px 0" }}>
              Quitar la foto y usar un emoji
            </button>
          )}
        </div>
      </div>

      {!url && (
        <div style={{ marginTop: 14 }}>
          <div className="mono" style={{ color: "var(--ink-3)", marginBottom: 8 }}>
            O elige un emoji
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {(emojis || []).map((e) => (
              <button key={e} type="button" aria-label={"Elegir " + e} aria-pressed={emoji === e}
                onClick={() => onEmoji(emoji === e ? "" : e)}
                style={{
                  width: 44, height: 44, fontSize: 22, lineHeight: 1, cursor: "pointer",
                  borderRadius: "50%", background: emoji === e ? "var(--paper-2)" : "transparent",
                  border: emoji === e ? "2px solid var(--ink)" : "1px solid var(--line-2)",
                }}>{e}</button>
            ))}
          </div>
        </div>
      )}

      <p className="ayuda" style={{ marginTop: 12 }}>
        {url
          ? "Tu foto se ve en tu pasaporte. Puedes quitarla cuando quieras."
          : "Nada de esto es obligatorio. Si no eliges, tu pasaporte lleva la inicial de tu nombre."}
      </p>
    </div>
  );
};

/**
 * Salida de emergencia: el enlace al propio buzón.
 *
 * Va debajo de la puerta normal —el correo, sin más— y es para dos casos: quien
 * puso clave a su perfil y no la recuerda, y quien prefiere no escribir nada en
 * un teléfono ajeno. Llegar al buzón es la prueba de propiedad de verdad, así
 * que este camino salta la clave a propósito.
 */
const EnlacePorCorreo = () => {
  const [correo, setCorreo] = React.useState("");
  const [abierto, setAbierto] = React.useState(false);
  const [enviado, setEnviado] = React.useState(false);
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const pedir = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    const sec = window.LMTSecurity;
    if (!sec || !sec.isEmail(correo.trim())) { setError("Escribe un correo válido."); return; }
    setBusy(true);
    try {
      await window.LMTApi.pedirEnlacePerfil(sec.normalizeEmail(correo));
      setEnviado(true);
    } catch (err) {
      setError(mensajeError(err, "No fue posible enviar el enlace."));
    } finally { setBusy(false); }
  };

  if (enviado) {
    return (
      <p style={{ color: "var(--ink-2)", fontSize: 13, lineHeight: 1.65, marginTop: 20 }}>
        Si ese correo participó en el festival, en unos minutos recibirás un enlace para
        abrir tu perfil. Revisa también la carpeta de correo no deseado.
      </p>
    );
  }

  if (!abierto) {
    return (
      <button type="button" onClick={() => setAbierto(true)} className="mono"
        style={{ display: "block", marginTop: 20, color: "var(--ink-3)", textDecoration: "underline" }}>
        ¿Olvidaste tu clave? Recibe un enlace por correo
      </button>
    );
  }

  return (
    <form onSubmit={pedir} style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--line)" }}>
      <p style={{ color: "var(--ink-2)", fontSize: 13, lineHeight: 1.65, marginBottom: 14 }}>
        Te mandamos al buzón un enlace que abre tu perfil sin clave.
      </p>
      <div className="field">
        <label htmlFor="pf-correo">Tu correo</label>
        <input id="pf-correo" type="email" inputMode="email" autoComplete="email"
          value={correo} onChange={(e) => setCorreo(e.target.value)} maxLength={254} required/>
      </div>
      <Aviso>{error}</Aviso>
      <button className="btn btn-ghost" type="submit" disabled={busy}
        style={{ justifyContent: "center", padding: 12, width: "100%", marginTop: 14 }}>
        {busy ? "Enviando…" : "Enviarme el enlace"}
      </button>
    </form>
  );
};

/**
 * Pantalla para quien llega a /perfil sin testigo en este navegador. Basta con
 * el correo; la clave sólo se pide a quien la haya puesto desde dentro.
 */
const PerfilSinAcceso = ({ onListo }) => (
  <PuertaCorreo
    titulo="Tu perfil del festival."
    nota="Escribe el correo con el que votas en los espacios. No hace falta contraseña: si quieres una, la pones después desde aquí dentro."
    onListo={onListo}>
    <EnlacePorCorreo/>
  </PuertaCorreo>
);

/**
 * Clave opcional del perfil.
 *
 * Sin ella, escribir el correo abre el pasaporte, el recorrido y el perfil, que
 * es como tiene que funcionar una feria de dos días. Quien prefiera cerrarlo
 * —aquí hay grupo étnico y discapacidad, datos sensibles— pone una clave y a
 * partir de ese momento se le exige en todas las pantallas.
 */
const BloqueClave = ({ correo, token, protegido, onCambio }) => {
  const [actual, setActual] = React.useState("");
  const [nueva, setNueva] = React.useState("");
  const [repite, setRepite] = React.useState("");
  const [error, setError] = React.useState("");
  const [ok, setOk] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const aplicar = async (quitar) => {
    setError(""); setOk("");
    if (!quitar) {
      if (nueva.length < 6) { setError("La clave debe tener al menos 6 caracteres."); return; }
      if (nueva !== repite) { setError("Las dos claves no coinciden."); return; }
    }
    setBusy(true);
    try {
      const res = await window.LMTApi.guardarClaveVisitante(correo, token, actual, quitar ? "" : nueva);
      setActual(""); setNueva(""); setRepite("");
      setOk(res && res.protegido
        ? "Listo. A partir de ahora se te pedirá esta clave para abrir tu perfil, tu pasaporte y tu recorrido."
        : "Quitada. Ahora te basta con escribir tu correo.");
      if (onCambio) onCambio(!!(res && res.protegido));
    } catch (err) {
      setError(mensajeError(err, "No fue posible cambiar la clave."));
    } finally { setBusy(false); }
  };

  return (
    <BloqueForm
      titulo="Protección de tu perfil"
      nota={protegido
        ? "Tu perfil está protegido: para abrirlo hay que escribir esta clave además del correo."
        : "Con el correo basta para entrar. Si prefieres que además pidan una clave, ponla aquí. Es opcional."}>
      {protegido && (
        <div className="field">
          <label htmlFor="pf-clave-actual">Tu clave actual</label>
          <input id="pf-clave-actual" type="password" autoComplete="current-password" maxLength={128}
            value={actual} onChange={(e) => setActual(e.target.value)}/>
        </div>
      )}
      <div className="field">
        <label htmlFor="pf-clave-nueva">{protegido ? "Clave nueva" : "Clave"}</label>
        <input id="pf-clave-nueva" type="password" autoComplete="new-password" maxLength={128}
          value={nueva} onChange={(e) => setNueva(e.target.value)}/>
        <span className="ayuda">Al menos 6 caracteres. Elige algo que recuerdes: si la pierdes, se recupera por el enlace al correo.</span>
      </div>
      <div className="field">
        <label htmlFor="pf-clave-repite">Repite la clave</label>
        <input id="pf-clave-repite" type="password" autoComplete="new-password" maxLength={128}
          value={repite} onChange={(e) => setRepite(e.target.value)}/>
      </div>
      <Aviso tipo="ok">{ok}</Aviso>
      <Aviso>{error}</Aviso>
      <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => aplicar(false)}
        style={{ justifyContent: "center" }}>
        {busy ? "Guardando…" : (protegido ? "Cambiar la clave" : "Proteger mi perfil")}
      </button>
      {protegido && (
        <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => aplicar(true)}
          style={{ justifyContent: "center", color: "var(--bad)" }}>
          Quitar la clave
        </button>
      )}
    </BloqueForm>
  );
};

const PerfilVisitantePage = () => {
  // De dónde sale la identidad, por orden: el enlace del correo, y si no, lo
  // que este navegador guardó al votar o al pasar por la puerta. El enlace manda
  // ENTERO —correo y testigo juntos—: mezclar el correo del enlace con el
  // testigo guardado abría el perfil de la persona equivocada en un teléfono
  // que ya había usado otra.
  const [ident, setIdent] = React.useState(() => {
    const p = new URLSearchParams(window.location.search);
    const delEnlace = (p.get("correo") || "").toLowerCase();
    if (delEnlace) return { correo: delEnlace, token: p.get("t") || "" };
    const g = (window.LMTPerfil && window.LMTPerfil.leer()) || { correo: "", token: "" };
    return { correo: (g.correo || "").toLowerCase(), token: g.token || "" };
  });
  const correo = ident.correo;
  const token  = ident.token;
  const [protegido, setProtegido] = React.useState(false);

  const [form, setForm] = React.useState(PERFIL_VACIO);
  const [opciones, setOpciones] = React.useState(null);
  const [emojis, setEmojis] = React.useState([]);
  const [cargando, setCargando] = React.useState(true);
  const [acepta, setAcepta] = React.useState(false);
  const [error, setError] = React.useState("");
  const [ok, setOk] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [existia, setExistia] = React.useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  React.useEffect(() => {
    if (!correo || !token) { setCargando(false); return; }
    // Quien llega por el enlace del correo se queda con el testigo en este
    // navegador y no tiene que volver a pedirlo.
    if (window.LMTPerfil) window.LMTPerfil.guardar(correo, token);
    let vivo = true;
    (async () => {
      try {
        const datos = await window.LMTApi.getPerfilVisitante(correo, token);
        if (!vivo) return;
        setOpciones(datos.opciones || null);
        setEmojis(datos.emojis || []);
        setProtegido(!!datos.protegido);
        if (datos.perfil) {
          setForm(Object.assign({}, PERFIL_VACIO, datos.perfil));
          setExistia(true);
          setAcepta(true);
        }
      } catch (err) {
        if (vivo) setError(mensajeError(err, "No fue posible abrir tu perfil."));
      } finally {
        if (vivo) setCargando(false);
      }
    })();
    return () => { vivo = false; };
  }, [correo, token]);

  const guardar = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError(""); setOk("");
    if (!acepta) { setError("Necesitamos tu autorización para guardar estos datos."); return; }
    setBusy(true);
    try {
      await window.LMTApi.guardarPerfilVisitante(correo, token, Object.assign({}, form, { acepta_datos: true }));
      setExistia(true);
      setOk("Tus datos quedaron guardados. Gracias por ayudarnos a conocer al público del festival.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(mensajeError(err, "No fue posible guardar tus datos."));
    } finally { setBusy(false); }
  };

  const borrar = async () => {
    if (!window.confirm("Se borrarán todos los datos de tu perfil. Tu voto y tu pasaporte no se tocan. ¿Continuar?")) return;
    setBusy(true); setError(""); setOk("");
    try {
      await window.LMTApi.borrarPerfilVisitante(correo, token);
      setForm(PERFIL_VACIO); setExistia(false); setAcepta(false);
      setOk("Tus datos fueron borrados.");
    } catch (err) {
      setError(mensajeError(err, "No fue posible borrar tus datos."));
    } finally { setBusy(false); }
  };

  if (!correo || !token) {
    return <PerfilSinAcceso onListo={(c, t) => { setIdent({ correo: c, token: t }); setCargando(true); }}/>;
  }
  if (cargando) return <Splash/>;

  const ops = opciones || {};

  return (
    <div className="mobile-page">
      <div className="mobile-inner">
        <a href="/pasaporte" data-route style={{ color: "var(--ink-3)", fontSize: 13 }}>← Mi pasaporte</a>
        <div className="mono" style={{ marginTop: 22 }}>Perfil del visitante</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 34, fontWeight: 400, margin: "6px 0 10px", lineHeight: 1.05 }}>
          {existia ? "Tus datos." : "Cuéntanos\nquién nos visita."}
        </h1>
        <p style={{ color: "var(--ink-2)", fontSize: 14, lineHeight: 1.65, marginBottom: 8 }}>
          Con esto sabemos quién viene al festival y podemos preparar mejor la próxima edición.
          <strong> Ningún dato es obligatorio</strong>: responde sólo lo que quieras.
        </p>
        <p className="mono" style={{ color: "var(--ink-3)", marginBottom: 24, wordBreak: "break-all" }}>{correo}</p>

        <Aviso tipo="ok">{ok}</Aviso>
        <Aviso>{error}</Aviso>

        <form onSubmit={guardar} style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 8 }}>
          <BloqueForm titulo="Tu retrato">
            <AvatarVisitante
              correo={correo} token={token}
              foto={form.avatar} emoji={form.avatar_emoji} emojis={emojis}
              onFoto={(url) => setForm((f) => ({ ...f, avatar: url, avatar_emoji: "" }))}
              onEmoji={(e) => setForm((f) => ({ ...f, avatar_emoji: e }))}
              onError={setError}/>
          </BloqueForm>

          <BloqueForm titulo="Sobre ti">
            <div className="field">
              <label htmlFor="pf-nombre">Nombre</label>
              <input id="pf-nombre" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} maxLength={120} autoComplete="name"/>
            </div>
            <div className="field">
              <label htmlFor="pf-tel">Teléfono</label>
              <input id="pf-tel" value={form.telefono} onChange={(e) => set("telefono", e.target.value)} maxLength={32} inputMode="tel" autoComplete="tel"/>
            </div>
            <CampoOpcion id="pf-genero" label="Género" valor={form.genero}
              opciones={ops.genero} etiquetas={PERFIL_ETIQUETAS.genero}
              onChange={(v) => set("genero", v)}/>
            <CampoOpcion id="pf-edad" label="Rango de edad" valor={form.rango_edad}
              opciones={ops.rango_edad} etiquetas={PERFIL_ETIQUETAS.rango_edad}
              onChange={(v) => set("rango_edad", v)}/>
          </BloqueForm>

          <BloqueForm titulo="De dónde nos visitas">
            {/* Tres campos encadenados: el país decide si se pregunta el
                departamento, y el departamento decide si el municipio se elige
                de los 64 de Nariño o se escribe. Cambiar uno limpia los de
                abajo: si no, quedaba «Pasto» colgando de «Valle del Cauca». */}
            <div className="grid-2">
              <div className="field">
                <label htmlFor="pf-pais">País</label>
                <select id="pf-pais" value={form.pais === "" ? "" : (form.pais === "Colombia" ? "Colombia" : OTRO_PAIS)}
                  onChange={(e) => setForm((f) => ({
                    ...f,
                    pais: e.target.value === OTRO_PAIS ? "" : e.target.value,
                    departamento: "", municipio: "",
                  }))}>
                  <option value="">Selecciona un país</option>
                  <option value="Colombia">Colombia</option>
                  <option value={OTRO_PAIS}>Otro país</option>
                </select>
              </div>
              {form.pais === "Colombia" ? (
                <SelectorDepartamento id="pf-dep" valor={form.departamento}
                  onCambio={(departamento) => setForm((f) => ({ ...f, departamento, municipio: "" }))}/>
              ) : (
                <div className="field">
                  <label htmlFor="pf-pais-otro">¿Cuál?</label>
                  <input id="pf-pais-otro" value={form.pais} maxLength={80} placeholder="Ecuador"
                    onChange={(e) => set("pais", e.target.value)}/>
                </div>
              )}
            </div>

            {form.pais === "Colombia" && esNarino(form.departamento) ? (
              <SelectorMunicipio id="pf-mun" valor={form.municipio}
                onCambio={(municipio) => set("municipio", municipio)}/>
            ) : (
              <div className="field">
                <label htmlFor="pf-mun-texto">{form.pais === "Colombia" ? "Municipio" : "Ciudad"}</label>
                <input id="pf-mun-texto" value={form.municipio} maxLength={80}
                  disabled={form.pais === "Colombia" && !form.departamento}
                  placeholder={form.pais === "Colombia" ? "Cali" : "Quito"}
                  onChange={(e) => set("municipio", e.target.value)}/>
                <span className="ayuda">
                  {form.pais === "Colombia" && !form.departamento
                    ? "Elige antes el departamento."
                    : "Escríbelo como se llama; sólo los de Nariño salen de una lista."}
                </span>
              </div>
            )}
          </BloqueForm>

          <BloqueForm titulo="Tu visita">
            <CampoOpcion id="pf-tipo" label="Vienes en representación de" valor={form.tipo_visitante}
              opciones={ops.tipo_visitante} etiquetas={PERFIL_ETIQUETAS.tipo_visitante}
              onChange={(v) => set("tipo_visitante", v)}/>
            <div className="field">
              <label htmlFor="pf-entidad">Nombre de la entidad o empresa</label>
              <input id="pf-entidad" value={form.entidad} onChange={(e) => set("entidad", e.target.value)} maxLength={120}/>
              <span className="ayuda">Sólo si vienes por una institución.</span>
            </div>
            <CampoOpcion id="pf-medio" label="¿Cómo te enteraste del festival?" valor={form.como_se_entero}
              opciones={ops.como_se_entero} etiquetas={PERFIL_ETIQUETAS.como_se_entero}
              onChange={(v) => set("como_se_entero", v)}/>
            <div className="field">
              <label htmlFor="pf-primera">¿Es tu primera vez en el festival?</label>
              <select id="pf-primera"
                value={form.primera_visita === null || form.primera_visita === undefined ? "" : (form.primera_visita ? "si" : "no")}
                onChange={(e) => set("primera_visita", e.target.value === "" ? null : e.target.value === "si")}>
                <option value="">Sin responder</option>
                <option value="si">Sí, es la primera</option>
                <option value="no">Ya había venido</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="pf-exp">¿Qué esperas del festival?</label>
              <textarea id="pf-exp" rows={3} value={form.expectativa} onChange={(e) => set("expectativa", e.target.value)} maxLength={500}
                style={{ border: "1px solid var(--line-2)", borderRadius: "var(--r-md)", padding: 12 }}/>
              <span className="ayuda">Lo leemos: nos sirve para armar la programación.</span>
            </div>
          </BloqueForm>

          <BloqueForm
            titulo="Enfoque diferencial"
            nota="Estas dos preguntas son datos sensibles según la Ley 1581 de 2012. Las hacemos porque
                  la Gobernación debe reportar con enfoque diferencial, y responderlas es siempre
                  voluntario: puedes dejarlas sin responder o elegir «Prefiero no decir».">
            <CampoOpcion id="pf-etnia" label="¿Perteneces a algún grupo étnico?" valor={form.grupo_etnico}
              opciones={ops.grupo_etnico} etiquetas={PERFIL_ETIQUETAS.grupo_etnico}
              onChange={(v) => set("grupo_etnico", v)}/>
            <CampoOpcion id="pf-discapacidad" label="¿Tienes alguna discapacidad?" valor={form.discapacidad}
              opciones={ops.discapacidad} etiquetas={PERFIL_ETIQUETAS.discapacidad}
              ayuda="Nos ayuda a preparar el recinto y la atención."
              onChange={(v) => set("discapacidad", v)}/>
          </BloqueForm>

          <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: "var(--ink-2)", lineHeight: 1.55 }}>
            <input type="checkbox" checked={acepta} onChange={(e) => setAcepta(e.target.checked)} style={{ marginTop: 3 }}/>
            <span>
              Autorizo a la Gobernación de Nariño a tratar estos datos con fines estadísticos y de
              caracterización del público del festival, conforme a la Ley 1581 de 2012. Puedo
              consultarlos, corregirlos o borrarlos cuando quiera desde esta misma página.
            </span>
          </label>

          <Aviso>{error}</Aviso>

          <button className="btn btn-primary" type="submit" disabled={busy}
            style={{ justifyContent: "center", padding: 14, opacity: busy ? 0.6 : 1 }}>
            {busy ? "Guardando…" : (existia ? "Guardar cambios" : "Guardar mis datos")}
          </button>

          {existia && (
            <button type="button" onClick={borrar} disabled={busy} className="btn btn-ghost"
              style={{ justifyContent: "center", color: "var(--bad)" }}>
              Borrar mis datos
            </button>
          )}
          <a href="/pasaporte" data-route className="mono" style={{ textAlign: "center", color: "var(--ink-3)", marginBottom: 8 }}>
            Volver a mi pasaporte
          </a>
        </form>

        {/* Fuera del formulario de datos a propósito: la clave no es un dato de
            caracterización y no debe guardarse ni borrarse con ellos. */}
        <div style={{ marginTop: 24, marginBottom: 30 }}>
          <BloqueClave correo={correo} token={token} protegido={protegido} onCambio={setProtegido}/>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, {
  PerfilVisitantePage, PerfilSinAcceso, EnlacePorCorreo, BloqueClave,
  PERFIL_ETIQUETAS, AvatarVisitante,
});
