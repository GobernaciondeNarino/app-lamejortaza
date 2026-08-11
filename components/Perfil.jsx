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

/** Pantalla para quien llega a /perfil sin testigo en este navegador. */
const PerfilSinAcceso = () => {
  const [correo, setCorreo] = React.useState("");
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

  return (
    <div className="mobile-page">
      <div className="mobile-inner">
        <a href="/festival" data-route style={{ color: "var(--ink-3)", fontSize: 13 }}>← Volver</a>
        <div className="mono" style={{ marginTop: 22 }}>Perfil del visitante</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 34, fontWeight: 400, margin: "6px 0 12px", lineHeight: 1.05 }}>
          Te enviamos el<br/>enlace por correo.
        </h1>
        {enviado ? (
          <>
            <p style={{ color: "var(--ink-2)", fontSize: 14, lineHeight: 1.65 }}>
              Si ese correo participó en el festival, en unos minutos recibirás un enlace para
              abrir tu perfil. Revisa también la carpeta de correo no deseado.
            </p>
            <a href="/festival" data-route className="btn btn-ghost" style={{ justifyContent: "center", marginTop: 22 }}>
              Volver al festival
            </a>
          </>
        ) : (
          <form onSubmit={pedir}>
            <p style={{ color: "var(--ink-2)", fontSize: 14, lineHeight: 1.65, marginBottom: 22 }}>
              Tu perfil se abre desde el teléfono con el que votaste. Si estás en otro
              dispositivo, escribe tu correo y te mandamos el enlace.
            </p>
            <div className="field">
              <label htmlFor="pf-correo">Tu correo</label>
              <input id="pf-correo" type="email" inputMode="email" autoComplete="email"
                value={correo} onChange={(e) => setCorreo(e.target.value)} maxLength={254} required/>
            </div>
            <Aviso>{error}</Aviso>
            <button className="btn btn-primary" type="submit" disabled={busy}
              style={{ justifyContent: "center", padding: 14, width: "100%", marginTop: 20 }}>
              {busy ? "Enviando…" : "Enviarme el enlace"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const PerfilVisitantePage = () => {
  // Del enlace del correo, o del testigo que dejó el voto en este navegador.
  const params = new URLSearchParams(window.location.search);
  const guardado = (window.LMTPerfil && window.LMTPerfil.leer()) || { correo: "", token: "" };
  const correo = (params.get("correo") || guardado.correo || "").toLowerCase();
  const token  = params.get("t") || guardado.token || "";

  const [form, setForm] = React.useState(PERFIL_VACIO);
  const [opciones, setOpciones] = React.useState(null);
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

  if (!correo || !token) return <PerfilSinAcceso/>;
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
      </div>
    </div>
  );
};

Object.assign(window, { PerfilVisitantePage, PerfilSinAcceso, PERFIL_ETIQUETAS });
