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

// Traducción de los códigos de error del backend a español llano.
const ERRORES = {
  email_invalido: "El correo no es válido.",
  nombre_invalido: "Escribe tu nombre completo.",
  debe_aceptar_tratamiento_datos: "Debes autorizar el tratamiento de tus datos para continuar.",
  invalid_credentials: "Usuario o contraseña incorrectos.",
  cuenta_bloqueada: "Demasiados intentos fallidos. Espera 15 minutos e inténtalo de nuevo.",
  cuenta_suspendida: "Tu cuenta está suspendida. Comunícate con el equipo organizador.",
  solicitud_rechazada: "Tu solicitud no fue aprobada.",
  pendiente_de_verificacion: "Tu solicitud aún está en revisión.",
  password_expirada: "La contraseña temporal caducó. Pide al organizador que te la reenvíe.",
  password_actual_incorrecta: "La contraseña actual no coincide.",
  password_corta: "La contraseña debe tener al menos 10 caracteres.",
  password_larga: "La contraseña es demasiado larga.",
  password_simple: "Combina mayúsculas, minúsculas, números y símbolos.",
  password_predecible: "Evita tu nombre, tu correo o palabras del festival.",
  password_repetida: "La nueva contraseña debe ser distinta de la actual.",
  password_change_required: "Primero debes cambiar tu contraseña temporal.",
  rate_limited: "Demasiadas solicitudes seguidas. Espera un momento.",
  nombre_empresa_invalido: "El nombre de la empresa es obligatorio.",
  nombre_producto_invalido: "El nombre del producto es obligatorio.",
  altura_invalida: "La altura debe estar entre 0 y 6000 msnm.",
  precio_invalido: "El precio no es válido.",
  limite_productos: "Alcanzaste el máximo de 30 productos.",
  registra_la_empresa_primero: "Guarda primero los datos de tu empresa.",
  archivo_muy_grande: "La imagen supera el tamaño máximo (3 MB).",
  no_es_imagen: "El archivo no es una imagen válida.",
  formato_no_permitido: "Sólo se aceptan imágenes JPG, PNG o WEBP.",
  imagen_muy_pequena: "La imagen es demasiado pequeña.",
  archivo_ausente: "Selecciona un archivo.",
  unauthorized: "Tu sesión expiró. Vuelve a entrar.",
  not_found: "No encontrado.",
  ya_verificado: "Este promotor ya estaba verificado.",
  sin_credenciales: "Ese promotor no tiene contraseña: verifícalo primero.",
  stand_no_existe: "Ese stand no existe.",
};
const mensajeError = (e, porDefecto) => {
  const code = String((e && (e.code || e.message)) || e || "");
  for (const k of Object.keys(ERRORES)) if (code.includes(k)) return ERRORES[k];
  return porDefecto || "Ocurrió un error. Inténtalo de nuevo.";
};

const Aviso = ({ tipo = "error", children }) => {
  if (!children) return null;
  const color = tipo === "ok" ? "var(--good)" : tipo === "info" ? "var(--ink-2)" : "var(--bad)";
  return (
    <div role={tipo === "error" ? "alert" : "status"} style={{
      marginTop: 14, padding: "10px 12px", fontSize: 13, lineHeight: 1.5,
      border: `1px solid ${color}`, color, borderRadius: "var(--r-sm)",
      background: `color-mix(in oklch, ${color} 6%, var(--paper))`,
    }}>{children}</div>
  );
};

// ---------------------------------------------------------------------------
// 1. Inscripción pública
// ---------------------------------------------------------------------------

const PromotorRegistroPage = () => {
  const vacio = { nombre: "", email: "", telefono: "", documento: "", municipio: "", empresa: "", mensaje: "" };
  const [form, setForm] = React.useState(vacio);
  const [acepta, setAcepta] = React.useState(false);
  const [error, setError] = React.useState("");
  const [enviado, setEnviado] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const enviar = async (e) => {
    e.preventDefault();
    setError("");
    const sec = window.LMTSecurity;
    if (!form.nombre.trim()) { setError(ERRORES.nombre_invalido); return; }
    if (!sec || !sec.isEmail(form.email.trim())) { setError(ERRORES.email_invalido); return; }
    if (!acepta) { setError(ERRORES.debe_aceptar_tratamiento_datos); return; }
    setBusy(true);
    try {
      await window.LMTApi.promotorRegistro({ ...form, email: sec.normalizeEmail(form.email), acepta_datos: true });
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
            a <strong>{form.email}</strong> tu contraseña para entrar al portal y cargar la
            información de tu empresa y tus productos.
          </p>
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
          Completa tus datos. Un organizador revisará la solicitud y te enviará por correo el
          acceso al portal, donde podrás registrar tu empresa y tus productos.
        </p>

        <form onSubmit={enviar} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="field">
            <label>Nombre completo *</label>
            <input value={form.nombre} onChange={(e) => set("nombre", e.target.value)} maxLength={120} required autoComplete="name"/>
          </div>
          <div className="field">
            <label>Correo electrónico *</label>
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} maxLength={254} required autoComplete="email"/>
            <span className="mono" style={{ textTransform: "none", letterSpacing: 0, color: "var(--ink-3)" }}>
              Aquí llegará tu contraseña de acceso.
            </span>
          </div>
          <div className="grid-2">
            <div className="field">
              <label>Teléfono</label>
              <input value={form.telefono} onChange={(e) => set("telefono", e.target.value)} maxLength={32} inputMode="tel" autoComplete="tel"/>
            </div>
            <div className="field">
              <label>Documento</label>
              <input value={form.documento} onChange={(e) => set("documento", e.target.value)} maxLength={32}/>
            </div>
          </div>
          <div className="field">
            <label>Municipio</label>
            <input value={form.municipio} onChange={(e) => set("municipio", e.target.value)} maxLength={80} placeholder="Sandoná"/>
          </div>
          <div className="field">
            <label>Nombre de tu empresa o finca</label>
            <input value={form.empresa} onChange={(e) => set("empresa", e.target.value)} maxLength={120} placeholder="Finca El Tambo"/>
          </div>
          <div className="field">
            <label>Cuéntanos de tu café (opcional)</label>
            <textarea rows={3} value={form.mensaje} onChange={(e) => set("mensaje", e.target.value)} maxLength={500}
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

const PromotorLoginPage = ({ onEntrar }) => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const entrar = async (e) => {
    e.preventDefault();
    setError("");
    const sec = window.LMTSecurity;
    if (!sec || !sec.isEmail(email.trim())) { setError(ERRORES.email_invalido); return; }
    if (!password) { setError("Escribe tu contraseña."); return; }
    setBusy(true);
    try {
      const p = await window.LMTApi.promotorLogin(sec.normalizeEmail(email), password);
      onEntrar(p);
    } catch (err) {
      setError(mensajeError(err, "No fue posible iniciar sesión."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mobile-page">
      <div className="mobile-inner">
        <a href="/" data-route style={{ color: "var(--ink-3)", fontSize: 13 }}>← Volver</a>
        <div className="mono" style={{ marginTop: 22 }}>Portal del promotor</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 38, fontWeight: 400, margin: "6px 0 22px", lineHeight: 1.05 }}>
          Entra con el acceso<br/>que te llegó al correo.
        </h1>
        <form onSubmit={entrar} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div className="field">
            <label>Usuario (tu correo)</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} required autoComplete="username"/>
          </div>
          <div className="field">
            <label>Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} maxLength={128} required autoComplete="current-password"/>
          </div>
          <Aviso>{error}</Aviso>
          <button className="btn btn-primary" type="submit" disabled={busy}
            style={{ justifyContent: "center", padding: 14, opacity: busy ? 0.6 : 1 }}>
            {busy ? "Validando…" : "Entrar →"}
          </button>
        </form>
        <p className="mono" style={{ textAlign: "center", color: "var(--ink-3)", marginTop: 24, lineHeight: 1.7 }}>
          ¿Aún no te inscribes? <a href="/inscripcion" data-route style={{ color: "var(--grano)" }}>Solicita tu acceso</a><br/>
          Si perdiste la contraseña, pide al organizador que te la reenvíe.
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

const SubirImagen = ({ actual, onSubir, etiqueta, alto = 120 }) => {
  const ref = React.useRef(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  const elegir = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setError(""); setBusy(true);
    try {
      await onSubir(file);
    } catch (err) {
      setError(mensajeError(err, "No fue posible subir la imagen."));
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <div>
      <div className="mono" style={{ marginBottom: 8 }}>{etiqueta}</div>
      <div style={{
        border: "1px dashed var(--line-2)", borderRadius: "var(--r-md)", padding: 12,
        display: "flex", alignItems: "center", gap: 14, background: "var(--paper-2)",
      }}>
        {actual
          ? <img src={actual} alt={etiqueta} style={{ height: alto, width: alto, objectFit: "cover", borderRadius: "var(--r-sm)", background: "var(--paper)" }}/>
          : <Placeholder width={alto} height={alto} label="sin imagen"/>}
        <div style={{ flex: 1 }}>
          <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => ref.current && ref.current.click()}>
            {busy ? "Subiendo…" : (actual ? "Cambiar imagen" : "Subir imagen")}
          </button>
          <div className="mono" style={{ marginTop: 8, color: "var(--ink-3)", textTransform: "none", letterSpacing: 0 }}>
            JPG, PNG o WEBP · máx. 3 MB
          </div>
          <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" onChange={elegir} style={{ display: "none" }}/>
        </div>
      </div>
      <Aviso>{error}</Aviso>
    </div>
  );
};

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

  const p = datos.promotor;
  const base = (window.LMT_BASE_URL || "").replace(/\/$/, "");
  const urlImagen = (r) => (r ? base + "/" + r : null);

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
        <div className="field">
          <label>Municipio</label>
          <input value={form.municipio || ""} onChange={(e) => set("municipio", e.target.value)} maxLength={80}/>
        </div>
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
        ? <SubirImagen actual={logoUrl} etiqueta="Logo de la empresa" onSubir={onLogo}/>
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
          <input value={form.documento} onChange={(e) => set("documento", e.target.value)} maxLength={32}/>
        </div>
      </div>
      <div className="field">
        <label>Municipio</label>
        <input value={form.municipio} onChange={(e) => set("municipio", e.target.value)} maxLength={80}/>
      </div>
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
});
