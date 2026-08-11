// Componentes compartidos: Logo, Sello, QR, Silueta, etc.

const LogoTaza = ({ size = 40, mono = false }) => {
  const c = mono ? "currentColor" : "var(--ink)";
  const accent = mono ? "currentColor" : "var(--galeras)";
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ display: "block" }}>
      {/* Taza con vapor simple */}
      <path d="M10 20 L10 32 Q10 38 16 38 L28 38 Q34 38 34 32 L34 20 Z" stroke={c} strokeWidth="1.6" fill="none"/>
      <path d="M34 24 Q40 24 40 28 Q40 32 34 32" stroke={c} strokeWidth="1.6" fill="none"/>
      {/* Vapor */}
      <path d="M16 12 Q14 10 16 8 Q18 6 16 4" stroke={accent} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
      <path d="M22 12 Q20 10 22 8 Q24 6 22 4" stroke={accent} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
      <path d="M28 12 Q26 10 28 8 Q30 6 28 4" stroke={accent} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
    </svg>
  );
};

const Wordmark = ({ size = 20, onClick }) => (
  <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 10, cursor: onClick ? "pointer" : "default" }}>
    <LogoTaza size={size * 1.4}/>
    <div style={{ lineHeight: 1 }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: size, fontStyle: "italic", letterSpacing: "-0.01em" }}>La Mejor Taza</div>
      <div className="mono" style={{ fontSize: 9, marginTop: 2 }}>Festival · Nariño 2026</div>
    </div>
  </div>
);

// Silueta montañas de Nariño (Galeras) — simple, no recargada
const MontanasSilueta = ({ height = 80, opacity = 0.12 }) => (
  <svg width="100%" height={height} viewBox="0 0 400 80" preserveAspectRatio="none" style={{ opacity, display: "block" }}>
    <path d="M0 80 L0 55 L40 30 L80 50 L120 20 L160 45 L200 10 L240 40 L280 25 L320 55 L360 35 L400 50 L400 80 Z" fill="var(--ink)"/>
  </svg>
);

// Sello circular estilo pasaporte
const SelloCircular = ({ stand, size = 110, rotation = -8, state = "stamped" }) => {
  const letras = stand.nombre.toUpperCase();
  return (
    <div style={{
      width: size, height: size,
      transform: `rotate(${rotation}deg)`,
      opacity: state === "stamped" ? 0.82 : 0,
      transition: "opacity 0.3s",
      mixBlendMode: "multiply",
    }}>
      <svg width={size} height={size} viewBox="0 0 110 110">
        <defs>
          <path id={`circle-${stand.id}`} d="M 55,55 m -40,0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0"/>
        </defs>
        <circle cx="55" cy="55" r="48" stroke={stand.color} strokeWidth="2" fill="none"/>
        <circle cx="55" cy="55" r="42" stroke={stand.color} strokeWidth="1" fill="none"/>
        <text fill={stand.color} fontSize="7" fontFamily="var(--font-mono)" letterSpacing="1.5">
          <textPath href={`#circle-${stand.id}`} startOffset="0">{letras} · {stand.municipio.toUpperCase()} · </textPath>
        </text>
        {/* Interior */}
        <text x="55" y="48" textAnchor="middle" fill={stand.color} fontSize="8" fontFamily="var(--font-mono)" letterSpacing="2">VISITADO</text>
        <text x="55" y="62" textAnchor="middle" fill={stand.color} fontSize="16" fontFamily="var(--font-display)" fontStyle="italic">{stand.nombre.split(" ")[0]}</text>
        <text x="55" y="74" textAnchor="middle" fill={stand.color} fontSize="7" fontFamily="var(--font-mono)" letterSpacing="1">14·ABR·2026</text>
      </svg>
    </div>
  );
};

// Placeholder rayado para logos/fotos que faltan
const Placeholder = ({ width = "100%", height = 80, label = "logo", style }) => (
  <div style={{
    width, height,
    background: `repeating-linear-gradient(45deg, var(--paper-2), var(--paper-2) 6px, var(--paper-3) 6px, var(--paper-3) 12px)`,
    border: "1px solid var(--line)",
    borderRadius: "var(--r-sm)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)",
    textTransform: "uppercase", letterSpacing: "0.1em",
    ...style
  }}>{label}</div>
);

// URL absoluta del QR para un stand: respeta subdirectorio + host actual.
const standUrl = (standId) => {
  const base = (window.LMT_BASE_URL || "").replace(/\/$/, "");
  return window.location.origin + base + "/s/" + standId;
};

// QR generado en el SERVIDOR vía el endpoint /api/qr/{id}.png (PHP puro, sin
// dependencias). Antes se generaba en cliente con qrcode-generator, pero esa
// librería (js/vendor/qrcode.min.js) no está en el repo, así que los QR salían
// en blanco. Usar el endpoint elimina esa dependencia y funciona siempre.
// `data` puede ser el id del stand o una URL /s/{id}.
// `ansioso` desactiva la carga diferida: en la hoja de impresión las imágenes
// nunca llegan a estar en pantalla, así que con loading="lazy" el navegador no
// las pedía y los carteles salían sin QR.
const QRCode = ({ data = "st-01", size = 140, bg = "#ffffff", ansioso = false }) => {
  const raw = String(data == null ? "" : data);
  const m = raw.match(/\/s\/([a-z0-9\-]{2,32})/i);
  const standId = m ? m[1] : raw;

  // urlFor() ya codifica la ruta; el id del stand además está
  // restringido a [a-z0-9-], donde codificar es un no-op.
  const path = "/qr/" + standId + ".png";
  const base = (window.LMTApi && window.LMTApi.urlFor)
    ? window.LMTApi.urlFor(path)
    : ("/api/index.php?path=qr/" + encodeURIComponent(standId) + ".png");
  const src = base + (base.indexOf("?") >= 0 ? "&" : "?") + "scale=10";

  return (
    <img
      src={src}
      width={size}
      height={size}
      role="img"
      alt={`Código QR — ${standId}`}
      style={{ display: "block", width: size, height: size, background: bg, imageRendering: "pixelated", borderRadius: 4 }}
      loading={ansioso ? "eager" : "lazy"}
      decoding={ansioso ? "sync" : "async"}
    />
  );
};

// Barrita de progreso / porcentaje
const BarraVotos = ({ votos }) => {
  const total = votos.bueno + votos.regular + votos.malo || 1;
  const pct = (v) => (v / total) * 100;
  return (
    <div style={{ display: "flex", height: 4, borderRadius: 999, overflow: "hidden", background: "var(--paper-2)" }}>
      <div style={{ width: `${pct(votos.bueno)}%`, background: "var(--good)" }}/>
      <div style={{ width: `${pct(votos.regular)}%`, background: "var(--meh)" }}/>
      <div style={{ width: `${pct(votos.malo)}%`, background: "var(--bad)" }}/>
    </div>
  );
};

const calcScore = (votos) => {
  const total = votos.bueno + votos.regular + votos.malo || 1;
  return (votos.bueno * 100 + votos.regular * 50) / total;
};

const totalVotos = (votos) => votos.bueno + votos.regular + votos.malo;

// ---------------------------------------------------------------------------
// Subida de imágenes (logo del producto, foto del producto)
//
// Vive en Shared.jsx porque el mismo control aparece en tres sitios: la
// inscripción pública, el portal del promotor y el editor de stands del panel.
// ---------------------------------------------------------------------------

/** Ruta relativa devuelta por el servidor ("uploads/…") → URL servible. */
const urlImagen = (ruta) => {
  if (!ruta) return "";
  if (/^(https?:)?\/\//.test(ruta) || ruta.startsWith("data:")) return ruta;
  const base = (window.LMT_BASE_URL || "").replace(/\/$/, "");
  return base + "/" + String(ruta).replace(/^\//, "");
};

/**
 * Grupo de campos con título. Los formularios largos —la inscripción pide ya
 * todo lo del stand— se leen fatal en un teléfono como una lista plana de
 * veinte campos; agrupados, se sabe siempre en qué parte se va.
 */
const BloqueForm = ({ titulo, nota, children }) => (
  <fieldset style={{
    border: "1px solid var(--line)", borderRadius: "var(--r-md)",
    padding: "18px 16px", margin: 0, minWidth: 0,
  }}>
    <legend className="mono" style={{ padding: "0 8px" }}>{titulo}</legend>
    {nota && <p style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.5, margin: "0 0 16px" }}>{nota}</p>}
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>{children}</div>
  </fieldset>
);

const LIMITES_IMAGEN = () => {
  const u = (window.LMT_BOOTSTRAP && window.LMT_BOOTSTRAP.uploads) || {};
  return { maxBytes: u.maxBytes || 3 * 1024 * 1024, maxDim: u.maxDim || 1600 };
};

const enMegas = (bytes) => (bytes / (1024 * 1024)).toFixed(bytes % (1024 * 1024) === 0 ? 0 : 1);

/** Texto de ayuda con los límites reales del servidor. */
const ayudaImagen = (cuadrada) => {
  const { maxBytes, maxDim } = LIMITES_IMAGEN();
  return (cuadrada ? "Imagen cuadrada (misma altura que anchura). " : "")
    + `JPG, PNG o WEBP · máximo ${maxDim}×${maxDim} px y ${enMegas(maxBytes)} MB.`
    + (cuadrada ? " Si no es cuadrada se verá recortada." : "");
};

const SubirImagen = ({ actual, onSubir, etiqueta, alto = 120, cuadrada = false, ayuda, ruta, almacen }) => {
  const ref = React.useRef(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [nota, setNota] = React.useState("");

  const elegir = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setError(""); setNota("");
    const { maxBytes, maxDim } = LIMITES_IMAGEN();

    // Se comprueba aquí además de en el servidor: subir 8 MB por datos móviles
    // para que al final el servidor los rechace es tiempo y plan de datos del
    // caficultor. El servidor sigue siendo quien decide.
    if (file.size > maxBytes) {
      setError(`La imagen pesa ${enMegas(file.size)} MB y el máximo son ${enMegas(maxBytes)} MB. Reduce su tamaño e inténtalo de nuevo.`);
      if (ref.current) ref.current.value = "";
      return;
    }

    if (cuadrada && window.createImageBitmap) {
      try {
        const bmp = await createImageBitmap(file);
        const proporcion = bmp.width / bmp.height;
        const grande = Math.max(bmp.width, bmp.height);
        bmp.close && bmp.close();
        if (proporcion < 0.9 || proporcion > 1.1) {
          setNota(`La imagen mide ${bmp.width}×${bmp.height}. Se recomienda cuadrada: se mostrará recortada al centro.`);
        } else if (grande > maxDim) {
          setNota(`Se reducirá a ${maxDim}×${maxDim} px al guardarla.`);
        }
      } catch (_) { /* si el navegador no puede leerla, decide el servidor */ }
    }

    setBusy(true);
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
        display: "flex", alignItems: "center", gap: 14, background: "var(--paper-2)", flexWrap: "wrap",
      }}>
        {actual
          ? (
            // La miniatura recorta al centro para que la rejilla no baile; el
            // enlace abre el archivo tal cual quedó guardado, que es la única
            // forma de comprobar de verdad qué se subió.
            <a href={actual} target="_blank" rel="noopener" title="Abrir la imagen guardada"
              style={{ display: "block", flex: "0 0 auto" }}>
              <img src={actual} alt={etiqueta}
                style={{ height: alto, width: alto, objectFit: "cover", borderRadius: "var(--r-sm)", background: "var(--paper)", border: "1px solid var(--line)" }}/>
            </a>
          )
          : <Placeholder width={alto} height={alto} label="sin imagen"/>}
        <div style={{ flex: 1, minWidth: 180 }}>
          <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => ref.current && ref.current.click()}>
            {busy ? "Subiendo…" : (actual ? "Cambiar imagen" : "Subir imagen")}
          </button>
          <div style={{ marginTop: 8, fontSize: 12, lineHeight: 1.5, color: "var(--ink-3)" }}>
            {ayuda || ayudaImagen(cuadrada)}
          </div>
          {actual && ruta && (
            <div className="ruta" style={{ marginTop: 8 }}>
              Archivo: {ruta}
              {almacen && <><br/>En el servidor: {almacen.replace(/\/$/, "")}/{String(ruta).replace(/^uploads\//, "")}</>}
            </div>
          )}
          <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" onChange={elegir} style={{ display: "none" }}/>
        </div>
      </div>
      {nota && <Aviso tipo="info">{nota}</Aviso>}
      <Aviso>{error}</Aviso>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Errores y avisos
//
// Viven aquí y no en Promotores.jsx porque el módulo de cuentas de
// administración devuelve los mismos códigos (contraseñas, sesión, origen) y
// tener dos tablas de traducción garantizaba que una se quedara atrás.
// ---------------------------------------------------------------------------

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
  estado_invalido: "Ese cambio de estado no es válido.",
  estado_no_permite_clave: "No se puede enviar una clave a una cuenta rechazada o suspendida.",
  bad_id: "El identificador no es válido. Recarga la página.",
  bad_json: "Los datos enviados no son válidos. Recarga la página.",
  password_invalida: "La contraseña no es válida.",
  payload_too_large: "El contenido es demasiado grande.",
  // Cuentas de administración
  admin_ya_existe: "Ya hay una cuenta con ese correo.",
  requiere_propietario: "Sólo un propietario puede administrar cuentas.",
  ultimo_propietario: "Debe quedar al menos un propietario activo.",
  no_puedes_eliminarte: "No puedes eliminar tu propia cuenta.",
  // Estos tres no son errores del usuario sino del despliegue, y antes caían
  // todos en un "No fue posible completar la acción" que no decía nada. El
  // administrador necesita saber dónde mirar.
  origin_not_allowed:
    "El servidor rechazó la petición por el dominio de origen. Añade el dominio real del sitio a 'allowed_origins' en api/config.php.",
  csrf_invalid: "Tu sesión caducó. Recarga la página y vuelve a intentarlo.",
  internal_error:
    "Error interno del servidor. Revisa el log de errores de PHP: suele ser una tabla que falta (vuelve a ejecutar db/schema) o el envío de correo mal configurado.",
};

const mensajeError = (e, porDefecto) => {
  const code = String((e && (e.code || e.message)) || e || "");
  for (const k of Object.keys(ERRORES)) if (code.includes(k)) return ERRORES[k];
  // Si el código es desconocido, mostrarlo: un mensaje genérico obliga a
  // adivinar, y quien administra el festival no tiene acceso a los logs.
  const limpio = code.replace(/[^a-zA-Z0-9_ .:-]/g, "").slice(0, 60);
  return (porDefecto || "Ocurrió un error.") + (limpio ? ` (código: ${limpio})` : "");
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

Object.assign(window, {
  LogoTaza, Wordmark, MontanasSilueta, SelloCircular, Placeholder, QRCode,
  BarraVotos, calcScore, totalVotos, standUrl,
  ERRORES, mensajeError, Aviso,
  SubirImagen, ayudaImagen, urlImagen, BloqueForm,
});
