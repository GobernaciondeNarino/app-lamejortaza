// Módulo de promotores de stands.
//
// Tres públicos distintos conviven en este archivo:
//   /inscripcion        cualquiera puede solicitar ser promotor
//   /promotor           el promotor entra con el usuario y la clave que le
//                       llegaron por correo, cambia la clave y gestiona su
//                       empresa y sus productos
//   /admin/promotores   el organizador revisa solicitudes y las verifica (es
//                       la acción que dispara el envío de la clave)

const ESTADO_ETIQUETA = {
  pendiente:  { texto: "Pendiente", color: "var(--meh)" },
  verificado: { texto: "Verificado", color: "var(--cafeto)" },
  activo:     { texto: "Activo", color: "var(--good)" },
  rechazado:  { texto: "Rechazado", color: "var(--bad)" },
  suspendido: { texto: "Suspendido", color: "var(--ink-3)" },
};

const EstadoPill = ({ estado }) => {
  const e = ESTADO_ETIQUETA[estado] || { texto: estado, color: "var(--ink-3)" };
  return (
    <span className="mono" style={{
      display: "inline-block", padding: "3px 10px", borderRadius: 999,
      border: `1px solid ${e.color}`, color: e.color, fontSize: 10,
    }}>{e.texto}</span>
  );
};

// ERRORES, mensajeError y Aviso viven en components/Shared.jsx (los comparte el
// módulo de cuentas de administración).


// ---------------------------------------------------------------------------
// 1. Inscripción pública
// ---------------------------------------------------------------------------

/**
 * Cómo entra un promotor que no recibe el correo.
 *
 * El acceso normal es la clave que se envía al aprobar la inscripción, y falla
 * más de lo que parece: correos que casi no se abren, escritos mal, o que el
 * proveedor manda a spam. El caficultor se queda fuera de su propio stand el
 * día del evento y hay que resolverlo por teléfono, uno a uno.
 *
 * Las cuatro opciones NO son igual de fuertes y la interfaz lo dice. La fecha y
 * el teléfono son fáciles de recordar y fáciles de adivinar; se aceptan porque
 * quedarse fuera es peor, y porque nada funciona hasta que un organizador
 * aprueba la inscripción y quien entra así está obligado a poner una clave de
 * verdad. El QR es el más seguro para quien no maneja correo.
 */
const ACCESOS = [
  {
    id: "password", titulo: "Una contraseña que yo elija",
    nota: "Lo más seguro si vas a recordarla.",
    etiqueta: "Tu contraseña", tipo: "password", ayuda: "Mínimo 8 caracteres.",
  },
  {
    id: "documento", titulo: "La fecha de expedición de mi cédula",
    nota: "No hay que recordar nada nuevo: está impresa en tu documento.",
    etiqueta: "Fecha de expedición del documento", tipo: "date",
    ayuda: "La que aparece en tu cédula. Con eso entrarás al portal.",
    debil: true,
  },
  {
    id: "telefono", titulo: "Mi número de teléfono",
    nota: "El mismo que usas siempre. Se pide dos veces para evitar erratas.",
    etiqueta: "Número de teléfono", tipo: "tel",
    etiqueta2: "Repite el número", ayuda: "Sin espacios ni guiones, como prefieras: da igual.",
    debil: true,
  },
  {
    id: "qr", titulo: "Un código QR que guardo en el celular",
    nota: "El sistema genera uno único. Guárdalo: es la forma más segura si no usas correo.",
  },
];

/** Cómo se le nombra a cada método cuando ya está elegido. */
const ACCESO_FRASE = {
  password:  "la contraseña que elegiste",
  documento: "la fecha de expedición de tu documento",
  telefono:  "tu número de teléfono",
  qr:        "el código QR que guardaste",
};

/**
 * El código QR de acceso, tal y como se enseña la única vez que se puede
 * enseñar: en la base sólo queda su hash.
 *
 * La imagen llega del servidor como data URI. No se dibuja aquí porque el
 * generador de QR vive en PHP —no hay uno en JS— y el endpoint público
 * /qr/{id}.png sólo sabe de stands: darle texto libre lo convertiría en una
 * fábrica de códigos QR para cualquiera.
 *
 * Debajo va el mismo código en letras, porque un QR no se puede copiar a mano
 * y hay quien prefiere escribirlo, y un enlace para bajarlo al carrete del
 * teléfono, que es donde de verdad se guarda algo en una feria.
 */
const TarjetaQrAcceso = ({ png, token, url, titulo = "Tu código de acceso", children }) => (
  <div style={{
    border: "2px solid var(--ink)", borderRadius: "var(--r-md)",
    padding: 18, marginBottom: 24, textAlign: "center",
  }}>
    <div className="mono" style={{ marginBottom: 10 }}>{titulo}</div>
    {png ? (
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
        <img src={png} alt={"Código QR de acceso" + (url ? " (" + url + ")" : "")} width={200} height={200}
          style={{ width: 200, height: 200, imageRendering: "pixelated", background: "#fff", borderRadius: "var(--r-sm)" }}/>
      </div>
    ) : (
      <p style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 12 }}>
        No fue posible dibujar el código, pero el acceso de abajo funciona igual:
        escríbelo como contraseña.
      </p>
    )}
    <div className="mono ruta" style={{
      fontSize: 13, wordBreak: "break-all", padding: "8px 10px",
      background: "var(--paper-2)", borderRadius: "var(--r-sm)", marginBottom: 12,
    }}>{token}</div>
    {png && (
      <a href={png} download="qr-acceso.png" className="btn btn-ghost"
        style={{ justifyContent: "center", width: "100%", marginBottom: 12 }}>
        ↓ Guardar el código
      </a>
    )}
    {children}
  </div>
);

const SelectorAcceso = ({ metodo, valor, valor2, onMetodo, onValor, onValor2 }) => {
  const sel = ACCESOS.find((a) => a.id === metodo) || ACCESOS[0];
  return (
    <React.Fragment>
      <div className="field">
        <label htmlFor="in-acceso">¿Cómo quieres entrar al portal? *</label>
        <select id="in-acceso" value={metodo} onChange={(e) => onMetodo(e.target.value)}>
          {ACCESOS.map((a) => <option key={a.id} value={a.id}>{a.titulo}</option>)}
        </select>
        <span className="ayuda">{sel.nota}</span>
      </div>

      {sel.tipo && (
        <div className="field">
          <label htmlFor="in-acceso-valor">{sel.etiqueta} *</label>
          <input id="in-acceso-valor" type={sel.tipo} value={valor} required
            maxLength={sel.tipo === "tel" ? 32 : 128}
            inputMode={sel.tipo === "tel" ? "tel" : undefined}
            autoComplete={sel.id === "password" ? "new-password" : "off"}
            onChange={(e) => onValor(e.target.value)}/>
          <span className="ayuda">{sel.ayuda}</span>
        </div>
      )}

      {sel.etiqueta2 && (
        <div className="field">
          <label htmlFor="in-acceso-valor2">{sel.etiqueta2} *</label>
          <input id="in-acceso-valor2" type={sel.tipo} value={valor2} required maxLength={32} inputMode="tel"
            autoComplete="off" onChange={(e) => onValor2(e.target.value)}/>
          {valor && valor2 && valor.replace(/\D/g, "") !== valor2.replace(/\D/g, "") && (
            <span className="ayuda" style={{ color: "var(--bad)" }}>Los dos números no coinciden.</span>
          )}
        </div>
      )}

      {sel.id === "qr" && (
        <p className="ayuda">
          Al enviar la solicitud te mostraremos tu código. <strong style={{ fontWeight: 500 }}>Guárdalo
          en ese momento</strong>: por seguridad no lo podemos volver a mostrar.
        </p>
      )}

      {sel.debil && (
        <p className="ayuda" style={{ color: "var(--meh)" }}>
          Es cómodo de recordar, pero también más fácil de adivinar que una contraseña.
          Cuando entres, el sistema te pedirá crear una.
        </p>
      )}
    </React.Fragment>
  );
};

const PromotorRegistroPage = () => {
  // Un promotor y su stand son la misma cosa, así que aquí se pide de una vez
  // todo lo que el stand necesita. Al verificar la solicitud el stand se crea
  // solo, con estos datos y su QR, sin que nadie los vuelva a escribir.
  const vacio = {
    nombre: "", email: "", telefono: "", documento: "", municipio: "", empresa: "", mensaje: "",
    stand_nombre: "", stand_region: "", stand_direccion: "", stand_descripcion: "",
    stand_nit: "", stand_sitio_web: "",
    // Cómo va a entrar si el correo no llega. Ver el comentario del selector.
    acceso_metodo: "password", acceso_valor: "", acceso_valor2: "",
  };
  const [form, setForm] = React.useState(vacio);
  const [ubicacion, setUbicacion] = React.useState({ lat: null, lng: null });
  const [logo, setLogo] = React.useState("");        // ruta devuelta por el servidor
  const [acepta, setAcepta] = React.useState(false);
  const [error, setError] = React.useState("");
  const [enviado, setEnviado] = React.useState(false);
  // El QR llega UNA vez en la respuesta —token, URL e imagen ya dibujada por
  // el servidor— y no se puede volver a consultar: en la base sólo queda su
  // hash. Se enseña en la pantalla final para que lo guarde ahí mismo.
  const [qr, setQr] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const subirLogo = async (file) => {
    const res = await window.LMTApi.subirLogoInscripcion(file);
    setLogo(res.logo || "");
  };

  const enviar = async (e) => {
    e.preventDefault();
    setError("");
    const sec = window.LMTSecurity;
    if (!form.nombre.trim()) { setError(ERRORES.nombre_invalido); return; }
    if (!sec || !sec.isEmail(form.email.trim())) { setError(ERRORES.email_invalido); return; }
    if (!form.municipio.trim()) { setError("Indica el municipio de tu stand."); return; }
    if (!acepta) { setError(ERRORES.debe_aceptar_tratamiento_datos); return; }
    // El acceso se comprueba aquí para dar el mensaje concreto; el servidor lo
    // vuelve a comprobar, que es quien decide.
    if (form.acceso_metodo === "password" && form.acceso_valor.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres."); return;
    }
    if (form.acceso_metodo === "documento" && !form.acceso_valor) {
      setError("Indica la fecha de expedición de tu documento."); return;
    }
    if (form.acceso_metodo === "telefono") {
      const a = form.acceso_valor.replace(/\D/g, ""), b2 = form.acceso_valor2.replace(/\D/g, "");
      if (a.length < 7) { setError("El número de teléfono no parece válido."); return; }
      if (a !== b2) { setError("Los dos números de teléfono no coinciden."); return; }
    }
    setBusy(true);
    try {
      const res = await window.LMTApi.promotorRegistro({
        ...form,
        // El nombre del stand cae al de la empresa si se deja en blanco; el
        // backend hace lo mismo, pero así el resumen que ve el organizador ya
        // viene completo.
        stand_nombre: form.stand_nombre.trim() || form.empresa.trim(),
        email: sec.normalizeEmail(form.email),
        logo: logo || null,
        lat: ubicacion.lat,
        lng: ubicacion.lng,
        acepta_datos: true,
      });
      // El QR sólo viaja en esta respuesta: en la base queda su hash.
      if (res && res.qr_token) setQr({ token: res.qr_token, png: res.qr_png || "", url: res.qr_url || "" });
      setEnviado(true);
    } catch (err) {
      setError(mensajeError(err, "No fue posible enviar tu solicitud."));
    } finally {
      setBusy(false);
    }
  };

  if (enviado) {
    return (
      <div className="mobile-page">
        <div className="mobile-inner" style={{ textAlign: "center", padding: 40 }}>
          <div className="mono">Solicitud enviada</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 36, fontWeight: 400, margin: "10px 0 16px", lineHeight: 1.05 }}>
            Ya quedó<br/>registrada.
          </h2>
          <p style={{ color: "var(--ink-2)", lineHeight: 1.65, marginBottom: 24 }}>
            El equipo organizador revisará tu inscripción. Cuando quede aprobada te llegará
            a <strong>{form.email}</strong> el aviso y el
            <strong> código QR de tu stand</strong>, listo para imprimir y pegar en tu puesto.
            {" "}Entrarás al portal con {ACCESO_FRASE[form.acceso_metodo] || "tu contraseña"}.
          </p>

          {/* El código sólo se puede enseñar AQUÍ: en la base queda su hash y
              no hay forma de recuperarlo. Por eso la pantalla insiste. */}
          {qr && (
            <TarjetaQrAcceso png={qr.png} token={qr.token} url={qr.url}>
              <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.6, margin: 0 }}>
                <strong>Guárdalo ahora</strong>: descárgalo, hazle una foto o escríbelo. Por
                seguridad no lo podemos volver a mostrar. Escanea el código para entrar, o
                escribe esas letras y números como contraseña.
              </p>
            </TarjetaQrAcceso>
          )}

          <a href="/" data-route className="btn btn-ghost" style={{ justifyContent: "center" }}>← Volver al inicio</a>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-page">
      <div className="mobile-inner">
        <a href="/" data-route style={{ color: "var(--ink-3)", fontSize: 13 }}>← Volver</a>
        <div className="mono" style={{ marginTop: 22 }}>Promotores · Inscripción</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 38, fontWeight: 400, margin: "6px 0 10px", lineHeight: 1.05 }}>
          Inscribe tu stand<br/>en el festival.
        </h1>
        <p style={{ color: "var(--ink-2)", fontSize: 14, lineHeight: 1.6, marginBottom: 26 }}>
          Completa los datos de tu stand. Un organizador revisará la solicitud y te enviará por
          correo tu acceso al portal y el código QR de tu stand, ya listo para imprimir.
        </p>

        <form onSubmit={enviar} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <BloqueForm titulo="Quién eres" nota="La persona responsable del stand.">
            <div className="field">
              <label htmlFor="in-nombre">Nombre completo del propietario *</label>
              <input id="in-nombre" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} maxLength={120} required autoComplete="name"/>
            </div>
            <div className="grid-2">
              <div className="field">
                <label htmlFor="in-doc">Documento de identidad</label>
                <input id="in-doc" value={form.documento} onChange={(e) => set("documento", e.target.value)} maxLength={32} inputMode="numeric"/>
                <span className="ayuda">Cédula del propietario, sin puntos.</span>
              </div>
              <div className="field">
                <label htmlFor="in-tel">Teléfono</label>
                <input id="in-tel" value={form.telefono} onChange={(e) => set("telefono", e.target.value)} maxLength={32} inputMode="tel" autoComplete="tel"/>
              </div>
            </div>
            <div className="field">
              <label htmlFor="in-email">Correo electrónico *</label>
              <input id="in-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} maxLength={254} required autoComplete="email"/>
              <span className="ayuda">Aquí llegarán tu contraseña de acceso y el QR de tu stand.</span>
            </div>
          </BloqueForm>

          <BloqueForm titulo="Tu stand" nota="Es lo que verán los visitantes del festival.">
            <div className="field">
              <label htmlFor="in-empresa">Empresa, finca o marca *</label>
              <input id="in-empresa" value={form.empresa} onChange={(e) => set("empresa", e.target.value)} maxLength={120} required placeholder="Finca El Tambo"/>
            </div>
            <div className="field">
              <label htmlFor="in-stand-nombre">Nombre del stand</label>
              <input id="in-stand-nombre" value={form.stand_nombre} onChange={(e) => set("stand_nombre", e.target.value)} maxLength={80}
                placeholder={form.empresa || "Igual al de la empresa"}/>
              <span className="ayuda">Déjalo vacío para usar el nombre de la empresa.</span>
            </div>
            <div className="grid-2">
              <SelectorMunicipio id="in-mun" valor={form.municipio} requerido
                onCambio={(municipio, region) => setForm((f) => ({
                  ...f, municipio, stand_region: region || f.stand_region,
                }))}/>
              <SelectorSubregion id="in-region" valor={form.stand_region} municipio={form.municipio}
                onCambio={(v) => set("stand_region", v)}/>
            </div>
            <div className="field">
              <label htmlFor="in-dir">Dirección</label>
              <input id="in-dir" value={form.stand_direccion} onChange={(e) => set("stand_direccion", e.target.value)} maxLength={255} placeholder="Vereda El Ingenio"/>
            </div>
            <div className="grid-2">
              <div className="field">
                <label htmlFor="in-nit">NIT o RUT</label>
                <input id="in-nit" value={form.stand_nit} onChange={(e) => set("stand_nit", e.target.value)} maxLength={32}/>
                <span className="ayuda">Si estás constituido como empresa.</span>
              </div>
              <div className="field">
                <label htmlFor="in-web">Sitio web o red social</label>
                <input id="in-web" type="url" value={form.stand_sitio_web} onChange={(e) => set("stand_sitio_web", e.target.value)} maxLength={255}
                  placeholder="https://…" inputMode="url"/>
              </div>
            </div>
            <div className="field">
              <label htmlFor="in-desc">Descripción del stand</label>
              <textarea id="in-desc" rows={3} value={form.stand_descripcion} onChange={(e) => set("stand_descripcion", e.target.value)} maxLength={800}
                placeholder="Variedad, proceso, altura, historia de la finca…"
                style={{ border: "1px solid var(--line-2)", borderRadius: "var(--r-md)", padding: 12 }}/>
              <span className="ayuda">Se muestra en la ficha pública de tu stand.</span>
            </div>
            <SubirImagen
              actual={logo ? urlImagen(logo) : ""}
              etiqueta="Logo de tu producto"
              cuadrada
              ruta={logo}
              onSubir={subirLogo}/>
          </BloqueForm>

          <BloqueForm titulo="¿Dónde estás?"
            nota="Toca el mapa de Nariño donde queda tu finca o tu negocio. Al marcarlo se
                  completa solo el municipio. Es opcional, pero ayuda a los visitantes a
                  encontrarte y al festival a saber de qué zonas viene el café.">
            <SelectorUbicacion
              lat={ubicacion.lat} lng={ubicacion.lng} municipio={form.municipio}
              alto={320}
              onCambio={(u) => {
                setUbicacion({ lat: u.lat, lng: u.lng });
                // El municipio sale del propio mapa: es más fiable que elegirlo
                // de la lista y arrastra consigo su subregión.
                if (u.municipio) setForm((f) => ({
                  ...f, municipio: u.municipio, stand_region: subregionDe(u.municipio) || f.stand_region,
                }));
              }}/>
          </BloqueForm>

          <BloqueForm titulo="Cómo vas a entrar"
            nota="Por si el correo no llega: con esto entras igual.">
            <SelectorAcceso
              metodo={form.acceso_metodo}
              valor={form.acceso_valor} valor2={form.acceso_valor2}
              onMetodo={(m) => setForm((f) => ({ ...f, acceso_metodo: m, acceso_valor: "", acceso_valor2: "" }))}
              onValor={(v) => set("acceso_valor", v)}
              onValor2={(v) => set("acceso_valor2", v)}/>
          </BloqueForm>

          <div className="field">
            <label htmlFor="in-msg">Mensaje para el organizador (opcional)</label>
            <textarea id="in-msg" rows={2} value={form.mensaje} onChange={(e) => set("mensaje", e.target.value)} maxLength={500}
              style={{ border: "1px solid var(--line-2)", borderRadius: "var(--r-md)", padding: 12 }}/>
          </div>

          <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: "var(--ink-2)", lineHeight: 1.55 }}>
            <input type="checkbox" checked={acepta} onChange={(e) => setAcepta(e.target.checked)} style={{ marginTop: 3 }}/>
            <span>
              Autorizo a la Gobernación de Nariño a tratar mis datos personales con la finalidad de
              gestionar mi participación en el festival, conforme a la Ley 1581 de 2012. *
            </span>
          </label>

          <Aviso>{error}</Aviso>

          <button className="btn btn-primary" type="submit" disabled={busy}
            style={{ justifyContent: "center", padding: 14, opacity: busy ? 0.6 : 1 }}>
            {busy ? "Enviando…" : "Enviar solicitud →"}
          </button>
          <p className="mono" style={{ textAlign: "center", color: "var(--ink-3)" }}>
            ¿Ya tienes acceso? <a href="/promotor" data-route style={{ color: "var(--grano)" }}>Entra aquí</a>
          </p>
        </form>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 2. Acceso del promotor
// ---------------------------------------------------------------------------

/** Cómo se llama y cómo se escribe cada credencial en el formulario de acceso. */
const ACCESO_ENTRADA = {
  password:  { etiqueta: "Contraseña", tipo: "password", ayuda: "" },
  documento: { etiqueta: "Fecha de expedición de tu documento", tipo: "date",
               ayuda: "La que aparece impresa en tu cédula." },
  telefono:  { etiqueta: "Tu número de teléfono", tipo: "tel",
               ayuda: "El mismo que diste al inscribirte." },
  qr:        { etiqueta: "Código de tu QR", tipo: "text",
               ayuda: "Escanea el QR que guardaste, o escribe aquí sus 32 caracteres." },
};

const PromotorLoginPage = ({ onEntrar }) => {
  // El QR abre /promotor?correo=…&acceso=TOKEN: si viene así, se rellena todo
  // y sólo queda pulsar. Escribir 32 caracteres a mano en un móvil, de pie en
  // un stand, no es una opción razonable.
  const url = new URLSearchParams(window.location.search);
  const tokenUrl = (url.get("acceso") || "").trim();

  const [email, setEmail] = React.useState(() => (url.get("correo") || "").trim());
  const [metodo, setMetodo] = React.useState(() => (tokenUrl ? "qr" : "password"));
  const [password, setPassword] = React.useState(tokenUrl);
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const ent = ACCESO_ENTRADA[metodo] || ACCESO_ENTRADA.password;

  const entrar = React.useCallback(async (correo, credencial, comoEntra) => {
    setError("");
    const sec = window.LMTSecurity;
    if (!sec || !sec.isEmail((correo || "").trim())) { setError(ERRORES.email_invalido); return; }
    if (!credencial) { setError("Escribe " + (ACCESO_ENTRADA[comoEntra] || ent).etiqueta.toLowerCase() + "."); return; }
    setBusy(true);
    try {
      const p = await window.LMTApi.promotorLogin(sec.normalizeEmail(correo), credencial, comoEntra);
      onEntrar(p);
    } catch (err) {
      setError(mensajeError(err, "No fue posible iniciar sesión."));
    } finally {
      setBusy(false);
    }
  }, [onEntrar, ent]);

  // Con correo y token en la URL, entrar es automático: el QR ya identificó a
  // la persona y pedirle que además pulse un botón no añade nada.
  const yaIntentado = React.useRef(false);
  React.useEffect(() => {
    if (yaIntentado.current || !tokenUrl || !email) return;
    yaIntentado.current = true;
    const t = setTimeout(() => entrar(email, tokenUrl, "qr"), 250);
    return () => clearTimeout(t);
  }, [tokenUrl, email, entrar]);

  return (
    <div className="mobile-page">
      <div className="mobile-inner">
        <a href="/" data-route style={{ color: "var(--ink-3)", fontSize: 13 }}>← Volver</a>
        <div className="mono" style={{ marginTop: 22 }}>Portal del promotor</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 38, fontWeight: 400, margin: "6px 0 22px", lineHeight: 1.05 }}>
          Entra a tu stand.
        </h1>
        <form onSubmit={(e) => { e.preventDefault(); entrar(email, password, metodo); }}
          style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div className="field">
            <label htmlFor="pl-email">Usuario (tu correo)</label>
            <input id="pl-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              maxLength={254} required autoComplete="username"/>
          </div>

          {/* El método lo elige quien entra, no se deduce del correo: mirar
              antes qué credencial tiene una cuenta convertiría este formulario
              en un comprobador de «¿está inscrito este correo?». */}
          <div className="field">
            <label htmlFor="pl-metodo">¿Con qué vas a entrar?</label>
            <select id="pl-metodo" value={metodo}
              onChange={(e) => { setMetodo(e.target.value); setPassword(""); }}>
              <option value="password">Mi contraseña</option>
              <option value="documento">La fecha de expedición de mi cédula</option>
              <option value="telefono">Mi número de teléfono</option>
              <option value="qr">El código de mi QR</option>
            </select>
            <span className="ayuda">Lo que elegiste al inscribirte. Si te llegó una clave por correo, es «Mi contraseña».</span>
          </div>

          <div className="field">
            <label htmlFor="pl-clave">{ent.etiqueta}</label>
            <input id="pl-clave" type={ent.tipo} value={password} onChange={(e) => setPassword(e.target.value)}
              maxLength={128} required
              inputMode={metodo === "telefono" ? "tel" : undefined}
              autoComplete={metodo === "password" ? "current-password" : "off"}/>
            {ent.ayuda && <span className="ayuda">{ent.ayuda}</span>}
          </div>

          <Aviso>{error}</Aviso>
          <button className="btn btn-primary" type="submit" disabled={busy}
            style={{ justifyContent: "center", padding: 14, opacity: busy ? 0.6 : 1 }}>
            {busy ? "Validando…" : "Entrar →"}
          </button>
        </form>
        <p className="mono" style={{ textAlign: "center", color: "var(--ink-3)", marginTop: 24, lineHeight: 1.7 }}>
          ¿Aún no te inscribes? <a href="/inscripcion" data-route style={{ color: "var(--grano)" }}>Solicita tu acceso</a><br/>
          Si perdiste tu acceso, pide al organizador que te dé uno nuevo.
        </p>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 3. Cambio obligatorio de la contraseña temporal
// ---------------------------------------------------------------------------

const PromotorCambioClave = ({ onListo }) => {
  const [actual, setActual] = React.useState("");
  const [nueva, setNueva] = React.useState("");
  const [repetir, setRepetir] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const guardar = async (e) => {
    e.preventDefault();
    setError("");
    if (nueva !== repetir) { setError("Las dos contraseñas nuevas no coinciden."); return; }
    setBusy(true);
    try {
      await window.LMTApi.promotorCambiarClave(actual, nueva);
      onListo();
    } catch (err) {
      setError(mensajeError(err, "No fue posible cambiar la contraseña."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mobile-page">
      <div className="mobile-inner">
        <div className="mono">Primer ingreso</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 34, fontWeight: 400, margin: "6px 0 10px", lineHeight: 1.05 }}>
          Crea tu contraseña<br/>definitiva.
        </h1>
        <p style={{ color: "var(--ink-2)", fontSize: 14, lineHeight: 1.6, marginBottom: 22 }}>
          La contraseña que te enviamos por correo es temporal. Cámbiala ahora: mientras
          siga activa, cualquiera con acceso a tu buzón podría entrar en tu nombre.
        </p>
        <form onSubmit={guardar} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="field">
            <label>Contraseña temporal</label>
            <input type="password" value={actual} onChange={(e) => setActual(e.target.value)} maxLength={128} required autoComplete="current-password"/>
          </div>
          <div className="field">
            <label>Nueva contraseña</label>
            <input type="password" value={nueva} onChange={(e) => setNueva(e.target.value)} maxLength={128} required autoComplete="new-password"/>
            <span className="mono" style={{ textTransform: "none", letterSpacing: 0, color: "var(--ink-3)", lineHeight: 1.5 }}>
              Mínimo 10 caracteres, con al menos tres de: mayúsculas, minúsculas, números y símbolos.
              Sin tu nombre ni tu correo.
            </span>
          </div>
          <div className="field">
            <label>Repite la nueva contraseña</label>
            <input type="password" value={repetir} onChange={(e) => setRepetir(e.target.value)} maxLength={128} required autoComplete="new-password"/>
          </div>
          <Aviso>{error}</Aviso>
          <button className="btn btn-primary" type="submit" disabled={busy}
            style={{ justifyContent: "center", padding: 14, opacity: busy ? 0.6 : 1 }}>
            {busy ? "Guardando…" : "Guardar y continuar →"}
          </button>
        </form>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 4. Portal del promotor
// ---------------------------------------------------------------------------

// SubirImagen vive en components/Shared.jsx: el mismo control aparece en la
// inscripción, en el portal del promotor y en el editor de stands del panel.

const ProductoEditor = ({ producto, onGuardar, onBorrar, onFoto }) => {
  const vacio = { nombre: "", variedad: "", proceso: "", altura_msnm: "", notas_cata: "", presentacion: "", precio: "", descripcion: "", publicado: true };
  const [form, setForm] = React.useState(producto ? { ...vacio, ...producto, altura_msnm: producto.altura_msnm ?? "", precio: producto.precio ?? "" } : vacio);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [ok, setOk] = React.useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const esNuevo = !producto;

  const guardar = async () => {
    setError(""); setOk(""); setBusy(true);
    try {
      await onGuardar({ ...form, altura_msnm: form.altura_msnm === "" ? null : form.altura_msnm, precio: form.precio === "" ? null : form.precio });
      setOk(esNuevo ? "Producto agregado." : "Cambios guardados.");
      if (esNuevo) setForm(vacio);
    } catch (err) {
      setError(mensajeError(err, "No fue posible guardar el producto."));
    } finally { setBusy(false); }
  };

  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: 20, background: "var(--paper)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div className="mono">{esNuevo ? "Nuevo producto" : "Producto #" + producto.id}</div>
        {!esNuevo && (
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--ink-2)" }}>
            <input type="checkbox" checked={!!form.publicado} onChange={(e) => set("publicado", e.target.checked)}/>
            visible al público
          </label>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="field">
          <label>Nombre del producto *</label>
          <input value={form.nombre} onChange={(e) => set("nombre", e.target.value)} maxLength={120} placeholder="Caturra lavado"/>
        </div>
        <div className="grid-2" style={{ gap: 14 }}>
          <div className="field">
            <label>Variedad</label>
            <input value={form.variedad || ""} onChange={(e) => set("variedad", e.target.value)} maxLength={80} placeholder="Caturra"/>
          </div>
          <div className="field">
            <label>Proceso</label>
            <input value={form.proceso || ""} onChange={(e) => set("proceso", e.target.value)} maxLength={80} placeholder="Lavado"/>
          </div>
        </div>
        <div className="grid-3" style={{ gap: 14 }}>
          <div className="field">
            <label>Altura (msnm)</label>
            <input type="number" min="0" max="6000" value={form.altura_msnm} onChange={(e) => set("altura_msnm", e.target.value)}/>
          </div>
          <div className="field">
            <label>Presentación</label>
            <input value={form.presentacion || ""} onChange={(e) => set("presentacion", e.target.value)} maxLength={80} placeholder="Bolsa 250 g"/>
          </div>
          <div className="field">
            <label>Precio (COP)</label>
            <input type="number" min="0" step="100" value={form.precio} onChange={(e) => set("precio", e.target.value)}/>
          </div>
        </div>
        <div className="field">
          <label>Notas de cata</label>
          <input value={form.notas_cata || ""} onChange={(e) => set("notas_cata", e.target.value)} maxLength={500} placeholder="Panela, mandarina, cacao"/>
        </div>
        <div className="field">
          <label>Descripción</label>
          <textarea rows={3} value={form.descripcion || ""} onChange={(e) => set("descripcion", e.target.value)} maxLength={1500}
            style={{ border: "1px solid var(--line-2)", borderRadius: "var(--r-md)", padding: 12 }}/>
        </div>

        {!esNuevo && (
          <SubirImagen actual={producto.foto} etiqueta="Foto del producto" alto={110}
            onSubir={(file) => onFoto(producto.id, file)}/>
        )}

        <Aviso>{error}</Aviso>
        <Aviso tipo="ok">{ok}</Aviso>

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={guardar} disabled={busy} style={{ opacity: busy ? 0.6 : 1 }}>
            {busy ? "Guardando…" : (esNuevo ? "+ Agregar producto" : "Guardar cambios")}
          </button>
          {!esNuevo && (
            <button className="btn btn-ghost" style={{ borderColor: "var(--bad)", color: "var(--bad)" }}
              onClick={() => { if (window.confirm("¿Eliminar «" + (producto.nombre || "este producto") + "»?")) onBorrar(producto.id); }}>
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const PromotorPortalPage = ({ onSalir }) => {
  const [datos, setDatos] = React.useState(null);
  const [pestana, setPestana] = React.useState("empresa");
  const [error, setError] = React.useState("");
  const [cargando, setCargando] = React.useState(true);

  const recargar = React.useCallback(async () => {
    try {
      setDatos(await window.LMTApi.getPerfilPromotor());
      setError("");
    } catch (err) {
      setError(mensajeError(err, "No fue posible cargar tu información."));
    } finally {
      setCargando(false);
    }
  }, []);

  React.useEffect(() => { recargar(); }, [recargar]);

  if (cargando) return <div className="mobile-page"><div className="mobile-inner"><div className="splash">Cargando…</div></div></div>;
  if (!datos) {
    return (
      <div className="mobile-page"><div className="mobile-inner" style={{ textAlign: "center", padding: 40 }}>
        <Aviso>{error || "No fue posible cargar tu información."}</Aviso>
        <button className="btn btn-ghost" style={{ marginTop: 18 }} onClick={onSalir}>Salir</button>
      </div></div>
    );
  }

  const p = datos.promotor;   // urlImagen vive en Shared.jsx

  const guardarEmpresa = async (body) => { setDatos(await window.LMTApi.guardarEmpresa(body)); };
  const subirLogo = async (file) => { setDatos(await window.LMTApi.subirLogo(file)); };
  const crearProducto = async (b) => { setDatos({ ...datos, productos: await window.LMTApi.crearProducto(b) }); };
  const actualizarProducto = async (id, b) => { setDatos({ ...datos, productos: await window.LMTApi.actualizarProducto(id, b) }); };
  const borrarProducto = async (id) => { setDatos({ ...datos, productos: await window.LMTApi.borrarProducto(id) }); };
  const subirFoto = async (id, file) => { setDatos({ ...datos, productos: await window.LMTApi.subirFotoProducto(id, file) }); };

  const pestanas = [
    { id: "empresa", label: "Mi empresa" },
    { id: "productos", label: "Mis productos (" + datos.productos.length + ")" },
    { id: "perfil", label: "Mis datos" },
  ];

  return (
    <div style={{ minHeight: "100dvh", background: "var(--paper-2)" }}>
      <header style={{ background: "var(--ink)", color: "var(--paper)", padding: "18px 22px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ filter: "invert(1)" }}><LogoTaza size={30}/></div>
            <div>
              <div className="mono" style={{ color: "var(--paper-3)" }}>Portal del promotor</div>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{p.nombre}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <EstadoPill estado={p.estado}/>
            <button onClick={onSalir} className="mono" style={{ color: "var(--paper-3)", textDecoration: "underline" }}>Cerrar sesión</button>
          </div>
        </div>
      </header>

      <div className="portal-promotor" style={{ maxWidth: 860, margin: "0 auto", padding: "0 18px 60px" }}>
        <nav style={{ display: "flex", gap: 6, borderBottom: "1px solid var(--line)", marginBottom: 26, overflowX: "auto" }}>
          {pestanas.map((t) => (
            <button key={t.id} onClick={() => setPestana(t.id)} style={{
              padding: "14px 16px", fontSize: 14, whiteSpace: "nowrap",
              fontWeight: pestana === t.id ? 600 : 400,
              borderBottom: pestana === t.id ? "2px solid var(--grano)" : "2px solid transparent",
              color: pestana === t.id ? "var(--ink)" : "var(--ink-2)",
            }}>{t.label}</button>
          ))}
        </nav>

        <Aviso>{error}</Aviso>

        {pestana === "empresa" && (
          <EmpresaEditor empresa={datos.empresa} logoUrl={urlImagen(datos.empresa && datos.empresa.logo)}
            onGuardar={guardarEmpresa} onLogo={subirLogo}/>
        )}

        {pestana === "productos" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {datos.empresa
              ? <ProductoEditor onGuardar={crearProducto}/>
              : <Aviso tipo="info">Guarda primero los datos de tu empresa; después podrás agregar productos.</Aviso>}
            {datos.productos.map((prod) => (
              <ProductoEditor key={prod.id}
                producto={{ ...prod, foto: urlImagen(prod.foto) }}
                onGuardar={(b) => actualizarProducto(prod.id, b)}
                onBorrar={borrarProducto}
                onFoto={subirFoto}/>
            ))}
          </div>
        )}

        {pestana === "perfil" && <PerfilEditor promotor={p} onGuardar={async (b) => setDatos(await window.LMTApi.guardarPerfilPromotor(b))}/>}
      </div>
    </div>
  );
};

const EmpresaEditor = ({ empresa, logoUrl, onGuardar, onLogo }) => {
  const vacio = { nombre: "", nit: "", descripcion: "", municipio: "", direccion: "", telefono: "", sitio_web: "" };
  const [form, setForm] = React.useState({ ...vacio, ...(empresa || {}) });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [ok, setOk] = React.useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const guardar = async (e) => {
    e.preventDefault();
    setError(""); setOk(""); setBusy(true);
    try {
      await onGuardar(form);
      setOk("Datos de la empresa guardados.");
    } catch (err) {
      setError(mensajeError(err, "No fue posible guardar la empresa."));
    } finally { setBusy(false); }
  };

  return (
    <form onSubmit={guardar} style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 640 }}>
      <div>
        <h2 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 30, fontWeight: 400, margin: "0 0 6px" }}>
          Los datos de tu empresa
        </h2>
        <p style={{ color: "var(--ink-2)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
          Esta información se muestra a los visitantes del festival junto a tu stand.
        </p>
      </div>

      <div className="field">
        <label>Nombre de la empresa o finca *</label>
        <input value={form.nombre} onChange={(e) => set("nombre", e.target.value)} maxLength={120} required/>
      </div>
      <div className="grid-2">
        <div className="field">
          <label>NIT</label>
          <input value={form.nit || ""} onChange={(e) => set("nit", e.target.value)} maxLength={32}/>
        </div>
        <SelectorMunicipio id="emp-mun" valor={form.municipio || ""} requerido
          onCambio={(municipio) => set("municipio", municipio)}/>
      </div>
      <div className="field">
        <label>Dirección</label>
        <input value={form.direccion || ""} onChange={(e) => set("direccion", e.target.value)} maxLength={255}/>
      </div>
      <div className="grid-2">
        <div className="field">
          <label>Teléfono</label>
          <input value={form.telefono || ""} onChange={(e) => set("telefono", e.target.value)} maxLength={32} inputMode="tel"/>
        </div>
        <div className="field">
          <label>Sitio web</label>
          <input value={form.sitio_web || ""} onChange={(e) => set("sitio_web", e.target.value)} maxLength={255} placeholder="https://…"/>
        </div>
      </div>
      <div className="field">
        <label>Descripción</label>
        <textarea rows={4} value={form.descripcion || ""} onChange={(e) => set("descripcion", e.target.value)} maxLength={1500}
          placeholder="Historia de la finca, altura, familias vinculadas…"
          style={{ border: "1px solid var(--line-2)", borderRadius: "var(--r-md)", padding: 12 }}/>
      </div>

      {empresa
        ? <SubirImagen actual={logoUrl} etiqueta="Logo del producto o de la empresa" cuadrada
            ruta={empresa && empresa.logo} onSubir={onLogo}/>
        : <Aviso tipo="info">Guarda los datos y después podrás subir el logo.</Aviso>}

      <Aviso>{error}</Aviso>
      <Aviso tipo="ok">{ok}</Aviso>

      <button className="btn btn-primary" type="submit" disabled={busy} style={{ alignSelf: "flex-start", opacity: busy ? 0.6 : 1 }}>
        {busy ? "Guardando…" : "Guardar empresa"}
      </button>
    </form>
  );
};

const PerfilEditor = ({ promotor, onGuardar }) => {
  const [form, setForm] = React.useState({
    nombre: promotor.nombre || "", telefono: promotor.telefono || "",
    documento: promotor.documento || "", municipio: promotor.municipio || "",
  });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [ok, setOk] = React.useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const guardar = async (e) => {
    e.preventDefault();
    setError(""); setOk(""); setBusy(true);
    try { await onGuardar(form); setOk("Datos actualizados."); }
    catch (err) { setError(mensajeError(err, "No fue posible guardar tus datos.")); }
    finally { setBusy(false); }
  };

  return (
    <form onSubmit={guardar} style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 520 }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 30, fontWeight: 400, margin: 0 }}>Mis datos</h2>
      <div className="field">
        <label>Correo (usuario)</label>
        <input value={promotor.email} disabled style={{ color: "var(--ink-3)" }}/>
        <span className="mono" style={{ textTransform: "none", letterSpacing: 0, color: "var(--ink-3)" }}>
          El correo no se puede cambiar: es tu usuario de acceso.
        </span>
      </div>
      <div className="field">
        <label>Nombre completo *</label>
        <input value={form.nombre} onChange={(e) => set("nombre", e.target.value)} maxLength={120} required/>
      </div>
      <div className="grid-2">
        <div className="field">
          <label>Teléfono</label>
          <input value={form.telefono} onChange={(e) => set("telefono", e.target.value)} maxLength={32} inputMode="tel"/>
        </div>
        <div className="field">
          <label>Documento</label>
          <input value={form.documento} onChange={(e) => set("documento", e.target.value)} maxLength={32} inputMode="numeric"/>
        </div>
      </div>
      <SelectorMunicipio id="pr-mun" valor={form.municipio} requerido
        onCambio={(municipio) => set("municipio", municipio)}/>
      <p className="ayuda">Tu municipio define la región del stand en el mapa del festival.</p>
      <Aviso>{error}</Aviso>
      <Aviso tipo="ok">{ok}</Aviso>
      <button className="btn btn-primary" type="submit" disabled={busy} style={{ alignSelf: "flex-start", opacity: busy ? 0.6 : 1 }}>
        {busy ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
};

// Punto de entrada de /promotor: decide login, cambio de clave o portal.
const PromotorPage = () => {
  const [promotor, setPromotor] = React.useState(() => (window.LMTApi && window.LMTApi.promotor()) || null);
  const [listo, setListo] = React.useState(() => !!(window.LMTApi && window.LMTApi.bootstrapDone && window.LMTApi.bootstrapDone()));

  React.useEffect(() => {
    const onAuth = () => {
      setPromotor((window.LMTApi && window.LMTApi.promotor()) || null);
      setListo(true);
    };
    window.addEventListener("lmt:auth", onAuth);
    const t = setTimeout(() => setListo(true), 1500);
    return () => { window.removeEventListener("lmt:auth", onAuth); clearTimeout(t); };
  }, []);

  const salir = async () => {
    await window.LMTApi.promotorLogout();
    setPromotor(null);
    window.LMTRouter.go("/");
  };

  if (!listo) return <div className="splash">Cargando…</div>;
  if (!promotor) return <PromotorLoginPage onEntrar={setPromotor}/>;
  if (promotor.must_change) {
    return <PromotorCambioClave onListo={() => setPromotor((window.LMTApi && window.LMTApi.promotor()) || { ...promotor, must_change: false })}/>;
  }
  return <PromotorPortalPage onSalir={salir}/>;
};

// ---------------------------------------------------------------------------
// 5. Panel del administrador: revisar y verificar solicitudes
// ---------------------------------------------------------------------------

const AdminPromotores = ({ stands }) => {
  const [lista, setLista] = React.useState([]);
  const [filtro, setFiltro] = React.useState("");
  const [cargando, setCargando] = React.useState(true);
  const [error, setError] = React.useState("");
  const [aviso, setAviso] = React.useState(null);   // { tipo, texto }
  const [ocupado, setOcupado] = React.useState(0);
  // QR recién reemitido. Se enseña una sola vez, igual que al promotor: el
  // organizador lo imprime o se lo pasa en mano, y al cerrar desaparece.
  const [qr, setQr] = React.useState(null);

  const cargar = React.useCallback(async (estado) => {
    setCargando(true);
    try {
      setLista(await window.LMTApi.listarPromotores(estado));
      setError("");
    } catch (err) {
      setError(mensajeError(err, "No fue posible cargar los promotores."));
    } finally { setCargando(false); }
  }, []);

  React.useEffect(() => { cargar(filtro); }, [filtro, cargar]);

  const accion = async (id, fn, exito) => {
    setOcupado(id); setAviso(null);
    try {
      const res = await fn();
      await cargar(filtro);
      setAviso(exito(res));
    } catch (err) {
      setAviso({ tipo: "error", texto: mensajeError(err, "No fue posible completar la acción.") });
    } finally { setOcupado(0); }
  };

  const verificar = (p) => accion(p.id, () => window.LMTApi.verificarPromotor(p.id), (res) => (
    res.correo_enviado
      ? { tipo: "ok", texto: `Verificado. La contraseña temporal salió hacia ${p.email}.` }
      : { tipo: "error", texto: `Verificado, pero el correo NO pudo enviarse. Entrega esta clave a ${p.email} por un canal seguro: ${res.clave_temporal}` }
  ));

  const reenviar = (p) => accion(p.id, () => window.LMTApi.reenviarClave(p.id), (res) => (
    res.correo_enviado
      ? { tipo: "ok", texto: `Nueva contraseña enviada a ${p.email}. La anterior dejó de funcionar.` }
      : { tipo: "error", texto: `El correo no salió. Clave nueva para ${p.email}: ${res.clave_temporal}` }
  ));

  const reemitirQr = (p) => {
    if (!window.confirm(`Se generará un código QR nuevo para ${p.email}. El anterior dejará de funcionar. ¿Continuar?`)) return;
    accion(p.id, () => window.LMTApi.reemitirQrPromotor(p.id), (res) => {
      setQr({ ...res, email: p.email, nombre: p.nombre });
      return { tipo: "ok", texto: `Código nuevo para ${p.email}. El anterior ya no sirve: entrégaselo antes de cerrar.` };
    });
  };

  const rechazar = (p) => {
    const motivo = window.prompt("Motivo del rechazo (se enviará al promotor):", "");
    if (motivo === null) return;
    accion(p.id, () => window.LMTApi.rechazarPromotor(p.id, motivo, true), () => ({ tipo: "ok", texto: "Solicitud rechazada." }));
  };

  const suspender = (p) => accion(p.id,
    () => window.LMTApi.cambiarEstadoPromotor(p.id, p.estado === "suspendido" ? "activo" : "suspendido"),
    () => ({ tipo: "ok", texto: p.estado === "suspendido" ? "Cuenta reactivada." : "Cuenta suspendida." }));

  const vincular = (p, standId) => accion(p.id, () => window.LMTApi.vincularStand(p.id, standId),
    () => ({ tipo: "ok", texto: standId ? "Promotor vinculado al stand." : "Vínculo con el stand eliminado." }));

  const filtros = [
    { id: "", label: "Todos" },
    { id: "pendiente", label: "Pendientes" },
    { id: "verificado", label: "Verificados" },
    { id: "activo", label: "Activos" },
    { id: "rechazado", label: "Rechazados" },
  ];
  const pendientes = lista.filter((p) => p.estado === "pendiente").length;

  return (
    <div className="admin-page">
      <div style={{ marginBottom: 26 }}>
        <div className="mono">Inscripciones · {lista.length} registros{pendientes ? ` · ${pendientes} por revisar` : ""}</div>
        <h1 className="titulo-xl">Promotores de stands</h1>
        <p style={{ color: "var(--ink-2)", fontSize: 14, lineHeight: 1.6, marginTop: 10, maxWidth: 620 }}>
          Al verificar una solicitud el sistema genera una contraseña temporal y la envía al
          correo del promotor. Sólo entonces podrá entrar a cargar su empresa y sus productos.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {filtros.map((f) => (
          <button key={f.id} onClick={() => setFiltro(f.id)} className="btn"
            style={{
              padding: "7px 14px", fontSize: 13,
              background: filtro === f.id ? "var(--ink)" : "transparent",
              color: filtro === f.id ? "var(--paper)" : "var(--ink)",
              border: "1px solid " + (filtro === f.id ? "var(--ink)" : "var(--line-2)"),
            }}>{f.label}</button>
        ))}
      </div>

      {aviso && <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>}
      <Aviso>{error}</Aviso>

      {qr && (
        <div style={{ maxWidth: 340, margin: "18px 0" }}>
          <TarjetaQrAcceso png={qr.qr_png} token={qr.qr_token} url={qr.qr_url}
            titulo={`Código de ${qr.nombre || qr.email}`}>
            <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.6, margin: "0 0 12px" }}>
              Descárgalo o imprímelo y entrégaselo. Al cerrar este recuadro no se puede
              volver a ver: en la base sólo queda su huella.
            </p>
            <button type="button" className="btn btn-ghost" onClick={() => setQr(null)}
              style={{ justifyContent: "center", width: "100%" }}>Ya lo entregué, cerrar</button>
          </TarjetaQrAcceso>
        </div>
      )}

      {cargando ? (
        <div className="splash">Cargando…</div>
      ) : lista.length === 0 ? (
        <div style={{ padding: 50, border: "1px dashed var(--line-2)", borderRadius: "var(--r-md)", textAlign: "center", color: "var(--ink-3)" }}>
          <div className="mono">Sin inscripciones</div>
          <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 26, color: "var(--ink)", margin: "8px 0 4px" }}>
            Todavía nadie se ha inscrito.
          </div>
          <div style={{ fontSize: 13 }}>Comparte el enlace <code>/inscripcion</code> con los caficultores.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}>
          {lista.map((p) => (
            <div key={p.id} style={{ border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: 20, background: "var(--paper)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
                <div style={{ minWidth: 240, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <strong style={{ fontSize: 16, fontWeight: 600 }}>{p.nombre}</strong>
                    <EstadoPill estado={p.estado}/>
                    {p.must_change && p.estado === "verificado" && (
                      <span className="mono" style={{ color: "var(--meh)" }}>clave sin estrenar</span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 6, lineHeight: 1.7 }}>
                    {p.email}
                    {p.telefono ? " · " + p.telefono : ""}
                    {p.municipio ? " · " + p.municipio : ""}
                    {p.documento ? " · CC " + p.documento : ""}
                  </div>
                  {(p.empresa || p.empresa_tentativa) && (
                    <div style={{ fontSize: 13, marginTop: 4 }}>
                      <span className="mono">Empresa</span> {p.empresa || p.empresa_tentativa}
                      {p.productos > 0 ? ` · ${p.productos} producto${p.productos === 1 ? "" : "s"}` : ""}
                    </div>
                  )}
                  {p.mensaje && (
                    <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 8, fontStyle: "italic", fontFamily: "var(--font-display)" }}>
                      “{p.mensaje}”
                    </div>
                  )}
                  {p.motivo && p.estado === "rechazado" && (
                    <div style={{ fontSize: 12, color: "var(--bad)", marginTop: 8 }}>Motivo: {p.motivo}</div>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "stretch", minWidth: 200, flex: "1 1 200px" }}>
                  {p.estado === "pendiente" && (
                    <button className="btn btn-primary" disabled={ocupado === p.id} onClick={() => verificar(p)}
                      style={{ justifyContent: "center", opacity: ocupado === p.id ? 0.6 : 1 }}>
                      {ocupado === p.id ? "Enviando…" : "✓ Verificar y enviar clave"}
                    </button>
                  )}
                  {(p.estado === "verificado" || p.estado === "activo") && (
                    <button className="btn btn-ghost" disabled={ocupado === p.id} onClick={() => reenviar(p)} style={{ justifyContent: "center" }}>
                      Reenviar contraseña
                    </button>
                  )}
                  {/* Sólo a quien entra con QR: el suyo se enseñó una vez y no
                      se puede recuperar, así que perderlo lo dejaría fuera. */}
                  {p.acceso_metodo === "qr" && p.estado !== "rechazado" && p.estado !== "suspendido" && (
                    <button className="btn btn-ghost" disabled={ocupado === p.id} onClick={() => reemitirQr(p)} style={{ justifyContent: "center" }}>
                      Reemitir código QR
                    </button>
                  )}
                  {p.estado !== "rechazado" && (
                    <button className="btn btn-ghost" disabled={ocupado === p.id} onClick={() => rechazar(p)}
                      style={{ justifyContent: "center", borderColor: "var(--bad)", color: "var(--bad)" }}>
                      Rechazar
                    </button>
                  )}
                  {(p.estado === "activo" || p.estado === "suspendido") && (
                    <button className="btn btn-ghost" disabled={ocupado === p.id} onClick={() => suspender(p)} style={{ justifyContent: "center" }}>
                      {p.estado === "suspendido" ? "Reactivar" : "Suspender"}
                    </button>
                  )}
                  <label className="field" style={{ marginTop: 4 }}>
                    <span className="mono">Stand vinculado</span>
                    <select value={p.stand_id || ""} disabled={ocupado === p.id}
                      onChange={(e) => vincular(p, e.target.value)}
                      style={{ border: "1px solid var(--line-2)", borderRadius: "var(--r-sm)", padding: "7px 8px", background: "var(--paper)" }}>
                      <option value="">— sin vincular —</option>
                      {(stands || []).map((s) => (<option key={s.id} value={s.id}>{s.nombre}</option>))}
                    </select>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Bitácora de correos: sin esto, un fallo de envío es invisible.
const AdminCorreos = () => {
  const [lista, setLista] = React.useState([]);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    window.LMTApi.listarEmails(50).then(setLista).catch((e) => setError(mensajeError(e)));
  }, []);

  const fallidos = lista.filter((e) => e.estado === "fallido").length;

  return (
    <div className="admin-page">
      <div className="mono">Correo saliente · {lista.length} envíos</div>
      <h1 className="titulo-xl" style={{ marginBottom: 20 }}>Bitácora de correos</h1>
      {fallidos > 0 && (
        <Aviso>
          {fallidos} envío{fallidos === 1 ? "" : "s"} fallaron. Revisa la sección <code>mail</code> de
          <code> api/config.php</code>: en hosting compartido suele ser necesario configurar SMTP.
        </Aviso>
      )}
      <Aviso>{error}</Aviso>
      <div className="tabla-scroll" style={{ border: "1px solid var(--line)", borderRadius: "var(--r-md)", marginTop: 18, background: "var(--paper)" }}>
        <div><div style={{ display: "grid", gridTemplateColumns: "150px 1fr 1fr 110px", padding: "12px 18px", background: "var(--paper-2)", borderBottom: "1px solid var(--line)" }}>
          {["Fecha", "Destinatario", "Asunto", "Estado"].map((h) => (<div key={h} className="mono">{h}</div>))}
        </div>
        {lista.map((e) => (
          <div key={e.id} style={{ display: "grid", gridTemplateColumns: "150px 1fr 1fr 110px", padding: "12px 18px", borderBottom: "1px solid var(--line)", fontSize: 13, alignItems: "center" }}>
            <div className="mono" style={{ fontSize: 10 }}>{e.created_at}</div>
            <div style={{ wordBreak: "break-all" }}>{e.destinatario}</div>
            <div style={{ color: "var(--ink-2)" }}>{e.asunto}{e.error ? ` — ${e.error}` : ""}</div>
            <div style={{ color: e.estado === "enviado" ? "var(--good)" : "var(--bad)", fontWeight: 500 }}>{e.estado}</div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, {
  PromotorRegistroPage,
  PromotorLoginPage,
  PromotorCambioClave,
  PromotorPortalPage,
  PromotorPage,
  AdminPromotores,
  AdminCorreos,
  EstadoPill,
  TarjetaQrAcceso,
});
