// GENERADO POR tools/build-components.mjs — NO EDITAR A MANO.
// Fuente: components/Shared.jsx, components/Mapa.jsx, components/Admin.jsx, components/QRPrint.jsx, components/VoteFlow.jsx, components/Passport.jsx, components/Dashboard.jsx, components/Recorrido.jsx, components/Promotores.jsx, components/Cuentas.jsx, components/Perfil.jsx, components/Caracterizacion.jsx, components/Economia.jsx, components/Festival.jsx, components/Correo.jsx, components/App.jsx
// Regenerar tras tocar cualquier .jsx:  node tools/build-components.mjs
// Huella de las fuentes: dfcc4c566da12aa3
/* components/Shared.jsx */
(function () {
const LogoTaza = ({
  size = 40,
  mono = false
}) => {
  const c = mono ? "currentColor" : "var(--ink)";
  const accent = mono ? "currentColor" : "var(--galeras)";
  return React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 48 48",
    fill: "none",
    style: {
      display: "block"
    }
  }, React.createElement("path", {
    d: "M10 20 L10 32 Q10 38 16 38 L28 38 Q34 38 34 32 L34 20 Z",
    stroke: c,
    strokeWidth: "1.6",
    fill: "none"
  }), React.createElement("path", {
    d: "M34 24 Q40 24 40 28 Q40 32 34 32",
    stroke: c,
    strokeWidth: "1.6",
    fill: "none"
  }), React.createElement("path", {
    d: "M16 12 Q14 10 16 8 Q18 6 16 4",
    stroke: accent,
    strokeWidth: "1.4",
    fill: "none",
    strokeLinecap: "round"
  }), React.createElement("path", {
    d: "M22 12 Q20 10 22 8 Q24 6 22 4",
    stroke: accent,
    strokeWidth: "1.4",
    fill: "none",
    strokeLinecap: "round"
  }), React.createElement("path", {
    d: "M28 12 Q26 10 28 8 Q30 6 28 4",
    stroke: accent,
    strokeWidth: "1.4",
    fill: "none",
    strokeLinecap: "round"
  }));
};
const Wordmark = ({
  size = 20,
  onClick
}) => React.createElement("div", {
  onClick: onClick,
  style: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: onClick ? "pointer" : "default"
  }
}, React.createElement(LogoTaza, {
  size: size * 1.4
}), React.createElement("div", {
  style: {
    lineHeight: 1
  }
}, React.createElement("div", {
  style: {
    fontFamily: "var(--font-display)",
    fontSize: size,
    fontStyle: "italic",
    letterSpacing: "-0.01em"
  }
}, "La Mejor Taza"), React.createElement("div", {
  className: "mono",
  style: {
    fontSize: 9,
    marginTop: 2
  }
}, "Festival \xB7 Nari\xF1o 2026")));
const MontanasSilueta = ({
  height = 80,
  opacity = 0.12
}) => React.createElement("svg", {
  width: "100%",
  height: height,
  viewBox: "0 0 400 80",
  preserveAspectRatio: "none",
  style: {
    opacity,
    display: "block"
  }
}, React.createElement("path", {
  d: "M0 80 L0 55 L40 30 L80 50 L120 20 L160 45 L200 10 L240 40 L280 25 L320 55 L360 35 L400 50 L400 80 Z",
  fill: "var(--ink)"
}));
const SelloCircular = ({
  stand,
  size = 110,
  rotation = -8,
  state = "stamped"
}) => {
  const letras = stand.nombre.toUpperCase();
  return React.createElement("div", {
    style: {
      width: size,
      height: size,
      transform: `rotate(${rotation}deg)`,
      opacity: state === "stamped" ? 0.82 : 0,
      transition: "opacity 0.3s",
      mixBlendMode: "multiply"
    }
  }, React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 110 110"
  }, React.createElement("defs", null, React.createElement("path", {
    id: `circle-${stand.id}`,
    d: "M 55,55 m -40,0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0"
  })), React.createElement("circle", {
    cx: "55",
    cy: "55",
    r: "48",
    stroke: stand.color,
    strokeWidth: "2",
    fill: "none"
  }), React.createElement("circle", {
    cx: "55",
    cy: "55",
    r: "42",
    stroke: stand.color,
    strokeWidth: "1",
    fill: "none"
  }), React.createElement("text", {
    fill: stand.color,
    fontSize: "7",
    fontFamily: "var(--font-mono)",
    letterSpacing: "1.5"
  }, React.createElement("textPath", {
    href: `#circle-${stand.id}`,
    startOffset: "0"
  }, letras, " \xB7 ", stand.municipio.toUpperCase(), " \xB7 ")), React.createElement("text", {
    x: "55",
    y: "48",
    textAnchor: "middle",
    fill: stand.color,
    fontSize: "8",
    fontFamily: "var(--font-mono)",
    letterSpacing: "2"
  }, "VISITADO"), React.createElement("text", {
    x: "55",
    y: "62",
    textAnchor: "middle",
    fill: stand.color,
    fontSize: "16",
    fontFamily: "var(--font-display)",
    fontStyle: "italic"
  }, stand.nombre.split(" ")[0]), React.createElement("text", {
    x: "55",
    y: "74",
    textAnchor: "middle",
    fill: stand.color,
    fontSize: "7",
    fontFamily: "var(--font-mono)",
    letterSpacing: "1"
  }, "14\xB7ABR\xB72026")));
};
const Placeholder = ({
  width = "100%",
  height = 80,
  label = "logo",
  style
}) => React.createElement("div", {
  style: {
    width,
    height,
    background: `repeating-linear-gradient(45deg, var(--paper-2), var(--paper-2) 6px, var(--paper-3) 6px, var(--paper-3) 12px)`,
    border: "1px solid var(--line)",
    borderRadius: "var(--r-sm)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    color: "var(--ink-3)",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    ...style
  }
}, label);
const standUrl = standId => {
  const base = (window.LMT_BASE_URL || "").replace(/\/$/, "");
  return window.location.origin + base + "/s/" + standId;
};
const QRCode = ({
  data = "st-01",
  size = 140,
  bg = "#ffffff",
  ansioso = false
}) => {
  const raw = String(data == null ? "" : data);
  const m = raw.match(/\/s\/([a-z0-9\-]{2,32})/i);
  const standId = m ? m[1] : raw;
  const path = "/qr/" + standId + ".png";
  const base = window.LMTApi && window.LMTApi.urlFor ? window.LMTApi.urlFor(path) : "/api/index.php?path=qr/" + encodeURIComponent(standId) + ".png";
  const src = base + (base.indexOf("?") >= 0 ? "&" : "?") + "scale=10";
  return React.createElement("img", {
    src: src,
    width: size,
    height: size,
    role: "img",
    alt: `Código QR — ${standId}`,
    style: {
      display: "block",
      width: size,
      height: size,
      background: bg,
      imageRendering: "pixelated",
      borderRadius: 4
    },
    loading: ansioso ? "eager" : "lazy",
    decoding: ansioso ? "sync" : "async"
  });
};
const BarraVotos = ({
  votos
}) => {
  const total = votos.bueno + votos.regular + votos.malo || 1;
  const pct = v => v / total * 100;
  return React.createElement("div", {
    style: {
      display: "flex",
      height: 4,
      borderRadius: 999,
      overflow: "hidden",
      background: "var(--paper-2)"
    }
  }, React.createElement("div", {
    style: {
      width: `${pct(votos.bueno)}%`,
      background: "var(--good)"
    }
  }), React.createElement("div", {
    style: {
      width: `${pct(votos.regular)}%`,
      background: "var(--meh)"
    }
  }), React.createElement("div", {
    style: {
      width: `${pct(votos.malo)}%`,
      background: "var(--bad)"
    }
  }));
};
const calcScore = votos => {
  const total = votos.bueno + votos.regular + votos.malo || 1;
  return (votos.bueno * 100 + votos.regular * 50) / total;
};
const totalVotos = votos => votos.bueno + votos.regular + votos.malo;
const urlImagen = ruta => {
  if (!ruta) return "";
  if (/^(https?:)?\/\//.test(ruta) || ruta.startsWith("data:")) return ruta;
  const base = (window.LMT_BASE_URL || "").replace(/\/$/, "");
  return base + "/" + String(ruta).replace(/^\//, "");
};
const BloqueForm = ({
  titulo,
  nota,
  children
}) => React.createElement("fieldset", {
  style: {
    border: "1px solid var(--line)",
    borderRadius: "var(--r-md)",
    padding: "18px 16px",
    margin: 0,
    minWidth: 0
  }
}, React.createElement("legend", {
  className: "mono",
  style: {
    padding: "0 8px"
  }
}, titulo), nota && React.createElement("p", {
  style: {
    fontSize: 13,
    color: "var(--ink-3)",
    lineHeight: 1.5,
    margin: "0 0 16px"
  }
}, nota), React.createElement("div", {
  style: {
    display: "flex",
    flexDirection: "column",
    gap: 18
  }
}, children));
const LIMITES_IMAGEN = () => {
  const u = window.LMT_BOOTSTRAP && window.LMT_BOOTSTRAP.uploads || {};
  return {
    maxBytes: u.maxBytes || 3 * 1024 * 1024,
    maxDim: u.maxDim || 1600
  };
};
const enMegas = bytes => (bytes / (1024 * 1024)).toFixed(bytes % (1024 * 1024) === 0 ? 0 : 1);
const ayudaImagen = cuadrada => {
  const {
    maxBytes,
    maxDim
  } = LIMITES_IMAGEN();
  return (cuadrada ? "Imagen cuadrada (misma altura que anchura). " : "") + `JPG, PNG o WEBP · máximo ${maxDim}×${maxDim} px y ${enMegas(maxBytes)} MB.` + (cuadrada ? " Si no es cuadrada se verá recortada." : "");
};
const SubirImagen = ({
  actual,
  onSubir,
  etiqueta,
  alto = 120,
  cuadrada = false,
  ayuda,
  ruta,
  almacen
}) => {
  const ref = React.useRef(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [nota, setNota] = React.useState("");
  const elegir = async e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setError("");
    setNota("");
    const {
      maxBytes,
      maxDim
    } = LIMITES_IMAGEN();
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
      } catch (_) {}
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
  return React.createElement("div", null, React.createElement("div", {
    className: "mono",
    style: {
      marginBottom: 8
    }
  }, etiqueta), React.createElement("div", {
    style: {
      border: "1px dashed var(--line-2)",
      borderRadius: "var(--r-md)",
      padding: 12,
      display: "flex",
      alignItems: "center",
      gap: 14,
      background: "var(--paper-2)",
      flexWrap: "wrap"
    }
  }, actual ? React.createElement("a", {
    href: actual,
    target: "_blank",
    rel: "noopener",
    title: "Abrir la imagen guardada",
    style: {
      display: "block",
      flex: "0 0 auto"
    }
  }, React.createElement("img", {
    src: actual,
    alt: etiqueta,
    style: {
      height: alto,
      width: alto,
      objectFit: "cover",
      borderRadius: "var(--r-sm)",
      background: "var(--paper)",
      border: "1px solid var(--line)"
    }
  })) : React.createElement(Placeholder, {
    width: alto,
    height: alto,
    label: "sin imagen"
  }), React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 180
    }
  }, React.createElement("button", {
    type: "button",
    className: "btn btn-ghost",
    disabled: busy,
    onClick: () => ref.current && ref.current.click()
  }, busy ? "Subiendo…" : actual ? "Cambiar imagen" : "Subir imagen"), React.createElement("div", {
    style: {
      marginTop: 8,
      fontSize: 12,
      lineHeight: 1.5,
      color: "var(--ink-3)"
    }
  }, ayuda || ayudaImagen(cuadrada)), actual && ruta && React.createElement("div", {
    className: "ruta",
    style: {
      marginTop: 8
    }
  }, "Archivo: ", ruta, almacen && React.createElement(React.Fragment, null, React.createElement("br", null), "En el servidor: ", almacen.replace(/\/$/, ""), "/", String(ruta).replace(/^uploads\//, ""))), React.createElement("input", {
    ref: ref,
    type: "file",
    accept: "image/jpeg,image/png,image/webp",
    onChange: elegir,
    style: {
      display: "none"
    }
  }))), nota && React.createElement(Aviso, {
    tipo: "info"
  }, nota), React.createElement(Aviso, null, error));
};
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
  acceso_valor_invalido: "Revisa cómo vas a entrar: la contraseña necesita 8 caracteres, la fecha debe ser válida y el teléfono tener al menos 7 dígitos.",
  acceso_no_coincide: "Los dos números de teléfono no coinciden.",
  municipio_invalido: "Elige un municipio de la lista: deben ser los 64 de Nariño.",
  bad_municipio: "Elige un municipio de la lista: deben ser los 64 de Nariño.",
  bad_json: "Los datos enviados no son válidos. Recarga la página.",
  password_invalida: "La contraseña no es válida.",
  payload_too_large: "El contenido es demasiado grande.",
  admin_ya_existe: "Ya hay una cuenta con ese correo.",
  requiere_propietario: "Sólo un propietario puede administrar cuentas.",
  ultimo_propietario: "Debe quedar al menos un propietario activo.",
  no_puedes_eliminarte: "No puedes eliminar tu propia cuenta.",
  origin_not_allowed: "El servidor rechazó la petición por el dominio de origen. Añade el dominio real del sitio a 'allowed_origins' en api/config.php.",
  csrf_invalid: "Tu sesión caducó. Recarga la página y vuelve a intentarlo.",
  internal_error: "Error interno del servidor. Revisa el log de errores de PHP: suele ser una tabla que falta (vuelve a ejecutar db/schema) o el envío de correo mal configurado."
};
const mensajeError = (e, porDefecto) => {
  const code = String(e && (e.code || e.message) || e || "");
  for (const k of Object.keys(ERRORES)) if (code.includes(k)) return ERRORES[k];
  const limpio = code.replace(/[^a-zA-Z0-9_ .:-]/g, "").slice(0, 60);
  return (porDefecto || "Ocurrió un error.") + (limpio ? ` (código: ${limpio})` : "");
};
const Aviso = ({
  tipo = "error",
  children
}) => {
  if (!children) return null;
  const color = tipo === "ok" ? "var(--good)" : tipo === "info" ? "var(--ink-2)" : "var(--bad)";
  return React.createElement("div", {
    role: tipo === "error" ? "alert" : "status",
    style: {
      marginTop: 14,
      padding: "10px 12px",
      fontSize: 13,
      lineHeight: 1.5,
      border: `1px solid ${color}`,
      color,
      borderRadius: "var(--r-sm)",
      background: `color-mix(in oklch, ${color} 6%, var(--paper))`
    }
  }, children);
};
const MENU_PUBLICO = [{
  href: "/festival",
  texto: "Inicio",
  icono: "◆"
}, {
  href: "/pasaporte",
  texto: "Mi pasaporte",
  icono: "❖"
}, {
  href: "/recorrido",
  texto: "Mi recorrido",
  icono: "◈"
}, {
  href: "/perfil",
  texto: "Mi perfil",
  icono: "◉"
}];
const rutaActual = () => {
  try {
    return window.LMTRouter && window.LMTRouter.currentPath() || "/";
  } catch (_) {
    return location.pathname;
  }
};
const MenuPublico = ({
  oscuro = false
}) => {
  const [abierto, setAbierto] = React.useState(false);
  const cajaRef = React.useRef(null);
  const botonRef = React.useRef(null);
  const actual = rutaActual();
  React.useEffect(() => {
    if (!abierto) return;
    const fuera = e => {
      if (cajaRef.current && !cajaRef.current.contains(e.target)) setAbierto(false);
    };
    const escape = e => {
      if (e.key !== "Escape") return;
      setAbierto(false);
      if (botonRef.current) botonRef.current.focus();
    };
    document.addEventListener("pointerdown", fuera);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", fuera);
      document.removeEventListener("keydown", escape);
    };
  }, [abierto]);
  const tinta = oscuro ? "var(--paper)" : "var(--ink)";
  const tenue = oscuro ? "var(--paper-3)" : "var(--ink-3)";
  return React.createElement("div", {
    ref: cajaRef,
    style: {
      position: "relative"
    }
  }, React.createElement("button", {
    ref: botonRef,
    type: "button",
    onClick: () => setAbierto(v => !v),
    "aria-expanded": abierto,
    "aria-haspopup": "menu",
    "aria-label": "Men\xFA",
    style: {
      width: 44,
      height: 44,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      background: "none",
      border: "none",
      cursor: "pointer",
      color: tinta
    }
  }, [0, 1, 2].map(i => React.createElement("span", {
    key: i,
    style: {
      display: "block",
      width: 22,
      height: 2,
      background: "currentColor",
      borderRadius: 2,
      transition: "transform 0.2s, opacity 0.2s",
      transform: abierto ? i === 0 ? "translateY(7px) rotate(45deg)" : i === 2 ? "translateY(-7px) rotate(-45deg)" : "none" : "none",
      opacity: abierto && i === 1 ? 0 : 1
    }
  }))), abierto && React.createElement("div", {
    role: "menu",
    style: {
      position: "absolute",
      right: 0,
      top: "calc(100% + 8px)",
      zIndex: 60,
      minWidth: 210,
      padding: 6,
      background: "var(--paper)",
      color: "var(--ink)",
      border: "1px solid var(--line-2)",
      borderRadius: "var(--r-md)",
      boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
      animation: "fade-up 0.18s"
    }
  }, MENU_PUBLICO.map(m => {
    const aqui = actual === m.href || actual.startsWith(m.href + "/");
    return React.createElement("a", {
      key: m.href,
      href: m.href,
      "data-route": true,
      role: "menuitem",
      "aria-current": aqui ? "page" : undefined,
      onClick: () => setAbierto(false),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 12px",
        minHeight: 44,
        borderRadius: "var(--r-sm)",
        textDecoration: "none",
        fontSize: 15,
        color: aqui ? "var(--paper)" : "var(--ink)",
        background: aqui ? "var(--ink)" : "transparent"
      }
    }, React.createElement("span", {
      "aria-hidden": "true",
      style: {
        opacity: 0.6,
        fontSize: 12
      }
    }, m.icono), m.texto);
  })), React.createElement("span", {
    className: "mono",
    style: {
      display: "none",
      color: tenue
    }
  }, "men\xFA"));
};
const ESTRELLA_CAMPOS = ["est_innovacion", "est_atencion", "est_calidad"];
const ESTRELLA_CLAVES = {
  est_innovacion: "innovacion",
  est_atencion: "atencion",
  est_calidad: "calidad"
};
const Estrella = ({
  tam = 22,
  relleno = 0,
  color = "var(--meh)"
}) => {
  const id = React.useMemo(() => "est-" + Math.random().toString(36).slice(2, 9), []);
  const pct = Math.max(0, Math.min(1, relleno)) * 100;
  return React.createElement("svg", {
    width: tam,
    height: tam,
    viewBox: "0 0 24 24",
    "aria-hidden": "true",
    style: {
      display: "block"
    }
  }, React.createElement("defs", null, React.createElement("linearGradient", {
    id: id
  }, React.createElement("stop", {
    offset: pct + "%",
    stopColor: color
  }), React.createElement("stop", {
    offset: pct + "%",
    stopColor: "transparent"
  }))), React.createElement("path", {
    d: "M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.4l6.5-.9z",
    fill: `url(#${id})`,
    stroke: color,
    strokeWidth: "1.2",
    strokeLinejoin: "round"
  }));
};
const EstrellasEntrada = ({
  etiqueta,
  valor,
  onCambio,
  id
}) => React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10
  }
}, React.createElement("span", {
  id: id,
  style: {
    fontSize: 14
  }
}, etiqueta), React.createElement("div", {
  role: "radiogroup",
  "aria-labelledby": id,
  style: {
    display: "flex",
    gap: 2
  }
}, [1, 2, 3, 4, 5].map(n => React.createElement("button", {
  key: n,
  type: "button",
  role: "radio",
  "aria-checked": valor === n,
  "aria-label": `${n} de 5`,
  onClick: () => onCambio(valor === n ? null : n),
  style: {
    background: "none",
    border: "none",
    padding: "10px 3px",
    cursor: "pointer",
    minHeight: 44,
    display: "flex",
    alignItems: "center"
  }
}, React.createElement(Estrella, {
  tam: 24,
  relleno: valor >= n ? 1 : 0,
  color: valor >= n ? "var(--meh)" : "var(--line-2)"
})))));
const EstrellasLectura = ({
  valor,
  tam = 14,
  etiqueta
}) => {
  const v = Number(valor) || 0;
  return React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6
    },
    title: etiqueta ? `${etiqueta}: ${v ? v.toFixed(1) : "sin valorar"}` : undefined
  }, etiqueta && React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 9,
      color: "var(--ink-3)",
      flex: 1,
      minWidth: 0,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, etiqueta), React.createElement("div", {
    style: {
      display: "flex",
      gap: 1
    },
    "aria-label": `${v} de 5`
  }, [1, 2, 3, 4, 5].map(n => React.createElement(Estrella, {
    key: n,
    tam: tam,
    relleno: Math.max(0, Math.min(1, v - n + 1)),
    color: v >= n - 0.5 ? "var(--meh)" : "var(--line-2)"
  }))));
};
const titulosEstrellas = () => {
  const a = window.LMTFestival && window.LMTFestival.ajustes() || {};
  const e = a.estrellas || {};
  return {
    est_innovacion: e.innovacion || "Innovación",
    est_atencion: e.atencion || "Atención",
    est_calidad: e.calidad || "Calidad"
  };
};
const pesos = n => {
  const v = Number(n) || 0;
  try {
    return v.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    });
  } catch (_) {
    return "$" + v.toLocaleString("es-CO");
  }
};
Object.assign(window, {
  LogoTaza,
  Wordmark,
  MontanasSilueta,
  SelloCircular,
  Placeholder,
  QRCode,
  BarraVotos,
  calcScore,
  totalVotos,
  standUrl,
  ERRORES,
  mensajeError,
  Aviso,
  SubirImagen,
  ayudaImagen,
  urlImagen,
  BloqueForm,
  Estrella,
  EstrellasEntrada,
  EstrellasLectura,
  ESTRELLA_CAMPOS,
  ESTRELLA_CLAVES,
  titulosEstrellas,
  pesos,
  MenuPublico,
  MENU_PUBLICO
});
})();

/* components/Mapa.jsx */
(function () {
const MAPA_NARINO = () => window.NARINO_MAPA || null;
const mapaDimensiones = mapa => {
  const [,, w, h] = (mapa.viewBox || "0 0 1000 1068").split(" ").map(Number);
  return {
    w,
    h
  };
};
const puntoAGeo = (mapa, x, y) => {
  const {
    w,
    h
  } = mapaDimensiones(mapa);
  const b = mapa.bounds;
  return {
    lng: b.lonMin + x / w * (b.lonMax - b.lonMin),
    lat: b.latMax - y / h * (b.latMax - b.latMin)
  };
};
const geoAPunto = (mapa, lat, lng) => {
  const {
    w,
    h
  } = mapaDimensiones(mapa);
  const b = mapa.bounds;
  return {
    x: (lng - b.lonMin) / (b.lonMax - b.lonMin) * w,
    y: (b.latMax - lat) / (b.latMax - b.latMin) * h
  };
};
const municipioEnPunto = (svg, mapa, x, y) => {
  if (svg && svg.createSVGPoint) {
    const pt = svg.createSVGPoint();
    pt.x = x;
    pt.y = y;
    const trazos = svg.querySelectorAll("path[data-muni]");
    for (const path of trazos) {
      try {
        if (path.isPointInFill(pt)) {
          return mapa.municipios.find(m => m.id === path.getAttribute("data-muni")) || null;
        }
      } catch (_) {}
    }
  }
  let mejor = null,
    mejorD = Infinity;
  mapa.municipios.forEach(m => {
    const d = (m.cx - x) ** 2 + (m.cy - y) ** 2;
    if (d < mejorD) {
      mejorD = d;
      mejor = m;
    }
  });
  return mejor;
};
const SelectorUbicacion = ({
  lat,
  lng,
  municipio,
  onCambio,
  alto = 380,
  soloLectura = false
}) => {
  const mapa = MAPA_NARINO();
  const svgRef = React.useRef(null);
  const [aviso, setAviso] = React.useState("");
  const [buscando, setBuscando] = React.useState(false);
  if (!mapa || !mapa.bounds) {
    return React.createElement(Aviso, {
      tipo: "info"
    }, "El mapa no est\xE1 disponible en este navegador. Puedes continuar sin marcar la ubicaci\xF3n.");
  }
  const {
    w,
    h
  } = mapaDimensiones(mapa);
  const tienePunto = typeof lat === "number" && typeof lng === "number" && !isNaN(lat) && !isNaN(lng);
  const punto = tienePunto ? geoAPunto(mapa, lat, lng) : null;
  const marcar = (clienteX, clienteY) => {
    if (soloLectura) return;
    const svg = svgRef.current;
    if (!svg) return;
    const caja = svg.getBoundingClientRect();
    const escala = Math.min(caja.width / w, caja.height / h);
    const x = (clienteX - caja.left - (caja.width - w * escala) / 2) / escala;
    const y = (clienteY - caja.top - (caja.height - h * escala) / 2) / escala;
    if (x < 0 || y < 0 || x > w || y > h) return;
    const geo = puntoAGeo(mapa, x, y);
    const muni = municipioEnPunto(svg, mapa, x, y);
    setAviso("");
    onCambio({
      lat: Math.round(geo.lat * 1e6) / 1e6,
      lng: Math.round(geo.lng * 1e6) / 1e6,
      municipio: muni ? muni.nombre : ""
    });
  };
  const alTocar = e => {
    const t = e.touches && e.touches[0] || e.changedTouches && e.changedTouches[0];
    if (t) marcar(t.clientX, t.clientY);
  };
  const usarMiUbicacion = () => {
    if (!navigator.geolocation) {
      setAviso("Este navegador no puede darnos tu ubicación.");
      return;
    }
    setBuscando(true);
    setAviso("");
    navigator.geolocation.getCurrentPosition(pos => {
      setBuscando(false);
      const la = pos.coords.latitude,
        lo = pos.coords.longitude;
      if (la < 0.2 || la > 2.9 || lo < -79.3 || lo > -76.5) {
        setAviso("Tu ubicación actual está fuera de Nariño. Marca el punto en el mapa.");
        return;
      }
      const p = geoAPunto(mapa, la, lo);
      const muni = municipioEnPunto(svgRef.current, mapa, p.x, p.y);
      onCambio({
        lat: Math.round(la * 1e6) / 1e6,
        lng: Math.round(lo * 1e6) / 1e6,
        municipio: muni ? muni.nombre : ""
      });
    }, err => {
      setBuscando(false);
      setAviso(err && err.code === 1 ? "No diste permiso para usar tu ubicación. Marca el punto en el mapa." : "No pudimos obtener tu ubicación. Marca el punto en el mapa.");
    }, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    });
  };
  const activo = municipio ? normMuniSimple(municipio) : "";
  return React.createElement("div", null, React.createElement("div", {
    style: {
      position: "relative",
      background: "var(--paper-2)",
      border: "1px solid var(--line)",
      borderRadius: "var(--r-md)",
      overflow: "hidden"
    }
  }, React.createElement("svg", {
    ref: svgRef,
    viewBox: mapa.viewBox,
    preserveAspectRatio: "xMidYMid meet",
    role: soloLectura ? "img" : "application",
    "aria-label": soloLectura ? "Ubicación del stand en Nariño" : "Mapa de Nariño: toca para marcar la ubicación",
    onClick: e => marcar(e.clientX, e.clientY),
    onTouchEnd: alTocar,
    style: {
      display: "block",
      width: "100%",
      height: alto,
      maxHeight: "70dvh",
      cursor: soloLectura ? "default" : "crosshair",
      touchAction: "manipulation"
    }
  }, mapa.municipios.map(m => {
    const esActivo = activo && normMuniSimple(m.nombre) === activo;
    return React.createElement("path", {
      key: m.id,
      d: m.d,
      "data-muni": m.id,
      fill: esActivo ? "color-mix(in oklch, var(--galeras) 26%, var(--paper))" : "var(--paper)",
      stroke: "var(--line-2)",
      strokeWidth: "1",
      strokeLinejoin: "round"
    }, React.createElement("title", null, m.nombre));
  }), punto && React.createElement("g", {
    transform: `translate(${punto.x} ${punto.y})`,
    style: {
      pointerEvents: "none"
    }
  }, React.createElement("circle", {
    r: "26",
    fill: "var(--galeras)",
    opacity: "0.18"
  }), React.createElement("circle", {
    r: "9",
    fill: "var(--galeras)",
    stroke: "var(--paper)",
    strokeWidth: "3"
  })))), React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
      alignItems: "center",
      marginTop: 10
    }
  }, !soloLectura && React.createElement("button", {
    type: "button",
    className: "btn btn-ghost",
    onClick: usarMiUbicacion,
    disabled: buscando,
    style: {
      fontSize: 13,
      padding: "8px 14px"
    }
  }, buscando ? "Buscando…" : "Usar mi ubicación actual"), tienePunto && !soloLectura && React.createElement("button", {
    type: "button",
    className: "btn btn-ghost",
    onClick: () => onCambio({
      lat: null,
      lng: null,
      municipio
    }),
    style: {
      fontSize: 13,
      padding: "8px 14px"
    }
  }, "Quitar el punto"), React.createElement("span", {
    className: "mono",
    style: {
      color: "var(--ink-3)"
    }
  }, tienePunto ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : "sin ubicación marcada")), aviso && React.createElement(Aviso, {
    tipo: "info"
  }, aviso));
};
const normMuniSimple = s => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const MUNICIPIOS = () => (MAPA_NARINO() || {}).municipios || [];
const SUBREGIONES = () => (MAPA_NARINO() || {}).subregiones || [];
const subregionDe = municipio => {
  const clave = normMuniSimple(municipio);
  if (!clave) return "";
  const m = MUNICIPIOS().find(x => normMuniSimple(x.nombre) === clave);
  return m ? m.subregion : "";
};
const OTRO_MUNICIPIO = "__otro__";
const SelectorMunicipio = ({
  id,
  valor,
  onCambio,
  permitirOtro = false,
  requerido = false,
  etiqueta = "Municipio"
}) => {
  const munis = MUNICIPIOS();
  const enCatalogo = !!valor && munis.some(m => normMuniSimple(m.nombre) === normMuniSimple(valor));
  const [otro, setOtro] = React.useState(!!valor && !enCatalogo);
  const grupos = {};
  munis.forEach(m => {
    (grupos[m.subregion] = grupos[m.subregion] || []).push(m);
  });
  const elegir = v => {
    if (v === OTRO_MUNICIPIO) {
      setOtro(true);
      onCambio("", "");
      return;
    }
    setOtro(false);
    onCambio(v, subregionDe(v));
  };
  return React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: id
  }, etiqueta, requerido ? " *" : ""), React.createElement("select", {
    id: id,
    required: requerido && !otro,
    value: otro ? OTRO_MUNICIPIO : enCatalogo ? valor : "",
    onChange: e => elegir(e.target.value)
  }, React.createElement("option", {
    value: ""
  }, "Selecciona un municipio"), SUBREGIONES().map(sub => React.createElement("optgroup", {
    key: sub,
    label: sub
  }, (grupos[sub] || []).map(m => React.createElement("option", {
    key: m.divipola,
    value: m.nombre
  }, m.nombre)))), permitirOtro && React.createElement("option", {
    value: OTRO_MUNICIPIO
  }, "Otro municipio (fuera de Nari\xF1o)")), otro && React.createElement("input", {
    id: id + "-otro",
    value: enCatalogo ? "" : valor || "",
    onChange: e => onCambio(e.target.value, ""),
    maxLength: 80,
    placeholder: "Escribe el municipio",
    style: {
      marginTop: 8
    }
  }));
};
const SelectorSubregion = ({
  id,
  valor,
  municipio,
  onCambio,
  etiqueta = "Región"
}) => {
  const derivada = subregionDe(municipio);
  return React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: id
  }, etiqueta), React.createElement("select", {
    id: id,
    value: valor || "",
    onChange: e => onCambio(e.target.value)
  }, React.createElement("option", {
    value: ""
  }, "Sin especificar"), SUBREGIONES().map(s => React.createElement("option", {
    key: s,
    value: s
  }, s))), React.createElement("span", {
    className: "ayuda"
  }, derivada ? `Se completa sola con el municipio: ${municipio} está en ${derivada}.` : "Las 13 subregiones en que se agrupa el departamento."));
};
const DEPARTAMENTOS = () => (MAPA_NARINO() || {}).departamentos || [];
const esNarino = departamento => normMuniSimple(departamento || "") === normMuniSimple("Nariño");
const SelectorDepartamento = ({
  id,
  valor,
  onCambio,
  etiqueta = "Departamento",
  requerido = false
}) => {
  const lista = DEPARTAMENTOS();
  const enLista = !!valor && lista.some(d => normMuniSimple(d) === normMuniSimple(valor));
  return React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: id
  }, etiqueta, requerido ? " *" : ""), React.createElement("select", {
    id: id,
    required: requerido,
    value: enLista ? valor : "",
    onChange: e => onCambio(e.target.value)
  }, React.createElement("option", {
    value: ""
  }, "Selecciona un departamento"), lista.map(d => React.createElement("option", {
    key: d,
    value: d
  }, d))));
};
Object.assign(window, {
  SelectorUbicacion,
  geoAPunto,
  puntoAGeo,
  normMuniSimple,
  SelectorMunicipio,
  SelectorSubregion,
  subregionDe,
  MUNICIPIOS,
  SUBREGIONES,
  SelectorDepartamento,
  DEPARTAMENTOS,
  esNarino
});
})();

/* components/Admin.jsx */
(function () {
const AdminShell = ({
  active,
  user,
  children
}) => {
  const items = [{
    id: "stands",
    label: "Stands",
    sub: "Registro",
    path: "/admin/stands"
  }, {
    id: "promotores",
    label: "Promotores",
    sub: "Inscripciones",
    path: "/admin/promotores"
  }, {
    id: "qr",
    label: "Códigos QR",
    sub: "Impresión",
    path: "/admin/qr"
  }, {
    id: "live",
    label: "Actividad",
    sub: "En vivo",
    path: "/admin/live"
  }, {
    id: "economia",
    label: "Actividad económica",
    sub: "Compras del evento",
    path: "/admin/economia"
  }, {
    id: "caracterizacion",
    label: "Visitantes",
    sub: "Caracterización",
    path: "/admin/caracterizacion"
  }, {
    id: "festival",
    label: "Personalización",
    sub: "Títulos y fondos",
    path: "/admin/festival"
  }, {
    id: "correo",
    label: "Correo",
    sub: "Envío y pruebas",
    path: "/admin/correo"
  }, {
    id: "correos",
    label: "Bitácora",
    sub: "Mensajes enviados",
    path: "/admin/correos"
  }].concat(user && user.rol === "propietario" ? [{
    id: "cuentas",
    label: "Administradores",
    sub: "Cuentas de acceso",
    path: "/admin/cuentas"
  }] : []);
  const logout = async () => {
    if (window.LMTApi && window.LMTApi.enabled) await window.LMTApi.signOutAdmin();
    window.LMTRouter.go("/");
  };
  return React.createElement("div", {
    className: "admin-shell"
  }, React.createElement("aside", {
    className: "admin-aside"
  }, React.createElement("a", {
    href: "/",
    "data-route": true,
    style: {
      textDecoration: "none",
      color: "inherit"
    }
  }, React.createElement(Wordmark, {
    size: 16
  })), React.createElement("nav", {
    className: "admin-nav"
  }, React.createElement("div", {
    className: "mono",
    style: {
      marginBottom: 8
    }
  }, "Admin \xB7 Festival 2026"), items.map(it => React.createElement("a", {
    key: it.id,
    href: it.path,
    "data-route": true,
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      padding: "10px 12px",
      borderRadius: "var(--r-md)",
      background: active === it.id ? "var(--paper-2)" : "transparent",
      textAlign: "left",
      textDecoration: "none",
      color: "var(--ink)"
    }
  }, React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: active === it.id ? 600 : 400
    }
  }, it.label), it.sub && React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 9,
      marginTop: 2
    }
  }, it.sub)))), React.createElement("div", {
    className: "admin-sesion"
  }, React.createElement("div", {
    className: "mono",
    style: {
      marginBottom: 4
    }
  }, "Sesi\xF3n"), React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--ink-2)",
      wordBreak: "break-all"
    }
  }, user ? user.email : "—"), user && user.rol && React.createElement("div", {
    className: "mono",
    style: {
      marginTop: 4,
      color: "var(--ink-3)"
    }
  }, user.rol === "propietario" ? "Propietario" : "Organizador"), React.createElement("button", {
    onClick: logout,
    className: "btn btn-ghost",
    style: {
      width: "100%",
      justifyContent: "center",
      marginTop: 10,
      padding: "8px"
    }
  }, "Cerrar sesi\xF3n"))), React.createElement("main", {
    className: "admin-main"
  }, children));
};
const LoginAdmin = ({
  onLogin,
  onVisitor
}) => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [verInterno, setVerInterno] = React.useState(() => typeof window !== "undefined" && window.LMTRouter ? window.LMTRouter.currentPath().startsWith("/admin") : false);
  React.useEffect(() => {
    if (window.LMTApi && window.LMTApi.user && window.LMTApi.user() && window.LMTApi.user().admin) {
      onLogin();
    }
  }, [onLogin]);
  const handleLogin = async e => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    if (!window.LMTSecurity || !window.LMTSecurity.isEmail(email)) {
      setError("Correo inválido");
      return;
    }
    if (!password || password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    setBusy(true);
    try {
      if (!window.LMTApi || !window.LMTApi.enabled) throw new Error("api_unavailable");
      const u = await window.LMTApi.signInAdmin(email, password);
      if (!u || !u.admin) throw new Error("forbidden");
      onLogin();
    } catch (e) {
      const code = e && (e.code || e.message);
      if (code === "rate_limited") setError("Demasiados intentos. Espera unos minutos.");else if (code === "api_unavailable") setError("La API no está disponible. ¿Ejecutaste el asistente de instalación?");else if (code === "forbidden") setError("Esa cuenta no tiene permisos de administrador.");else setError("No fue posible iniciar sesión. Verifica las credenciales.");
    } finally {
      setBusy(false);
    }
  };
  return React.createElement("div", {
    className: "split"
  }, React.createElement("div", {
    className: "split-hero"
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, React.createElement("div", {
    style: {
      filter: "invert(1)"
    }
  }, React.createElement(LogoTaza, {
    size: 36
  })), React.createElement("div", {
    className: "mono",
    style: {
      color: "var(--paper-3)"
    }
  }, "La Mejor Taza \xB7 Festival 2026")), React.createElement("div", null, React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontSize: 64,
      lineHeight: 0.95,
      margin: 0,
      fontWeight: 400,
      letterSpacing: "-0.02em",
      maxWidth: "16ch"
    }
  }, "El pasaporte", React.createElement("br", null), "del caf\xE9", React.createElement("br", null), React.createElement("span", {
    style: {
      color: "var(--galeras)"
    }
  }, "nari\xF1ense"), "."), React.createElement("p", {
    style: {
      fontSize: 15,
      color: "var(--paper-3)",
      maxWidth: 420,
      marginTop: 24,
      lineHeight: 1.6
    }
  }, "Recorre los stands, prueba los caf\xE9s y vota. Tu pasaporte se va sellando con cada visita, y entre todos decidimos cu\xE1l es la mejor taza de Nari\xF1o.")), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      alignItems: "flex-start"
    }
  }, React.createElement("span", {
    className: "mono",
    style: {
      color: "var(--paper-3)"
    }
  }, "\xBFTienes un stand en el festival?"), React.createElement("div", {
    style: {
      display: "flex",
      gap: 16,
      alignItems: "center",
      flexWrap: "wrap"
    }
  }, React.createElement("a", {
    href: "/inscripcion",
    "data-route": true,
    style: {
      color: "var(--paper)",
      fontSize: 14,
      textDecoration: "underline"
    }
  }, "Inscribirme como promotor"), React.createElement("a", {
    href: "/promotor",
    "data-route": true,
    style: {
      color: "var(--paper-3)",
      fontSize: 14
    }
  }, "Ya tengo acceso \u2192")))), React.createElement("div", {
    className: "split-form"
  }, React.createElement("div", {
    className: "mono"
  }, "Festival 2026 \xB7 Nari\xF1o"), React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontSize: 40,
      fontWeight: 400,
      margin: "8px 0 14px",
      lineHeight: 1.05
    }
  }, "Bienvenido al", React.createElement("br", null), "festival."), React.createElement("p", {
    style: {
      fontSize: 14,
      color: "var(--ink-2)",
      lineHeight: 1.6,
      marginBottom: 22
    }
  }, "No necesitas cuenta ni contrase\xF1a: entra, mira el ranking en vivo y vota en los stands que visites."), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, React.createElement("button", {
    type: "button",
    onClick: onVisitor || (() => window.LMTRouter.go("/festival")),
    className: "btn btn-primary",
    style: {
      justifyContent: "center",
      padding: 15,
      fontSize: 15
    }
  }, "Entrar al festival \u2192"), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10
    }
  }, React.createElement("a", {
    href: "/recorrido",
    "data-route": true,
    className: "btn btn-ghost",
    style: {
      justifyContent: "center"
    }
  }, "Mi recorrido"), React.createElement("a", {
    href: "/pasaporte",
    "data-route": true,
    className: "btn btn-ghost",
    style: {
      justifyContent: "center"
    }
  }, "Mi pasaporte"))), React.createElement("div", {
    style: {
      height: 1,
      background: "var(--line)",
      margin: "26px 0 0"
    }
  }), !verInterno ? React.createElement("button", {
    type: "button",
    onClick: () => setVerInterno(true),
    className: "mono",
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: "14px 0",
      color: "var(--ink-3)",
      textDecoration: "underline",
      textAlign: "left",
      minHeight: 44
    }
  }, "\xBFEres administrador o promotor? Entra aqu\xED") : React.createElement("form", {
    onSubmit: handleLogin,
    style: {
      animation: "fade-up 0.25s",
      paddingTop: 18
    }
  }, React.createElement("div", {
    className: "mono",
    style: {
      marginBottom: 10
    }
  }, "Acceso \xB7 Organizadores"), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 18
    }
  }, React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "lg-email"
  }, "Correo institucional"), React.createElement("input", {
    id: "lg-email",
    type: "email",
    autoComplete: "username",
    autoFocus: true,
    value: email,
    onChange: e => setEmail(e.target.value),
    maxLength: 254,
    required: true
  })), React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "lg-pass"
  }, "Contrase\xF1a"), React.createElement("input", {
    id: "lg-pass",
    type: "password",
    autoComplete: "current-password",
    value: password,
    onChange: e => setPassword(e.target.value),
    maxLength: 128,
    required: true
  })), error && React.createElement("div", {
    role: "alert",
    style: {
      fontSize: 13,
      color: "var(--bad)"
    }
  }, error), React.createElement("button", {
    className: "btn btn-primary",
    type: "submit",
    disabled: busy,
    style: {
      justifyContent: "center",
      padding: 14,
      opacity: busy ? 0.6 : 1
    }
  }, busy ? "Validando…" : "Entrar al panel →"), React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 10,
      flexWrap: "wrap"
    }
  }, React.createElement("a", {
    href: "/promotor",
    "data-route": true,
    className: "mono",
    style: {
      color: "var(--ink-3)"
    }
  }, "Soy promotor de un stand \u2192"), React.createElement("span", {
    className: "mono",
    style: {
      color: "var(--ink-3)"
    }
  }, window.LMTApi && window.LMTApi.enabled ? "API conectada" : "API no disponible"))))));
};
const AdminPage = ({
  section,
  user,
  stands,
  comentarios,
  editingId
}) => {
  if (section === "stands") return React.createElement(AdminShell, {
    active: "stands",
    user: user
  }, React.createElement(StandsList, {
    stands: stands
  }));
  if (section === "editor") return React.createElement(AdminShell, {
    active: "stands",
    user: user
  }, React.createElement(StandEditor, {
    stand: editingId ? stands.find(s => s.id === editingId) : null
  }));
  if (section === "qr") return React.createElement(AdminShell, {
    active: "qr",
    user: user
  }, React.createElement(QRPrintView, {
    stands: stands
  }));
  if (section === "live") return React.createElement(AdminShell, {
    active: "live",
    user: user
  }, React.createElement(ActivityLive, {
    stands: stands,
    comentarios: comentarios || window.COMENTARIOS_DEMO || []
  }));
  if (section === "promotores") return React.createElement(AdminShell, {
    active: "promotores",
    user: user
  }, React.createElement(AdminPromotores, {
    stands: stands
  }));
  if (section === "correos") return React.createElement(AdminShell, {
    active: "correos",
    user: user
  }, React.createElement(AdminCorreos, null));
  if (section === "correo") return React.createElement(AdminShell, {
    active: "correo",
    user: user
  }, React.createElement(AdminCorreoConfig, null));
  if (section === "caracterizacion") return React.createElement(AdminShell, {
    active: "caracterizacion",
    user: user
  }, React.createElement(AdminCaracterizacion, null));
  if (section === "cuentas") return React.createElement(AdminShell, {
    active: "cuentas",
    user: user
  }, React.createElement(AdminCuentas, {
    user: user
  }));
  return React.createElement(AdminShell, {
    active: "stands",
    user: user
  }, React.createElement("div", {
    style: {
      padding: 32
    }
  }, "\u2014"));
};
const StandsList = ({
  stands
}) => {
  const sorted = [...stands].sort((a, b) => calcScore(b.votos) - calcScore(a.votos));
  return React.createElement("div", {
    className: "admin-page"
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginBottom: 32,
      gap: 12,
      flexWrap: "wrap"
    }
  }, React.createElement("div", null, React.createElement("div", {
    className: "mono"
  }, "Registro \xB7 ", stands.length, " stands"), React.createElement("h1", {
    className: "titulo-xl"
  }, "Stands del festival")), React.createElement("a", {
    href: "/admin/stands/new",
    "data-route": true,
    className: "btn btn-primary"
  }, "+ Registrar stand")), React.createElement("div", {
    className: "grid-4",
    style: {
      marginBottom: 32
    }
  }, [{
    k: "Stands",
    v: stands.length,
    sub: "registrados"
  }, {
    k: "Votos",
    v: stands.reduce((a, s) => a + totalVotos(s.votos), 0),
    sub: "totales"
  }, {
    k: "Aprobación",
    v: window.LMTApi && window.LMTApi.metricas ? window.LMTApi.metricas.aprobacion + "%" : "—",
    sub: "promedio"
  }, {
    k: "Pasaportes",
    v: window.LMTApi && window.LMTApi.metricas ? window.LMTApi.metricas.pasaportes : "—",
    sub: "activos"
  }].map(m => React.createElement("div", {
    key: m.k,
    style: {
      padding: 20,
      border: "1px solid var(--line)",
      borderRadius: "var(--r-md)",
      background: "var(--paper)"
    }
  }, React.createElement("div", {
    className: "mono"
  }, m.k), React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 40,
      fontStyle: "italic",
      lineHeight: 1,
      marginTop: 8
    }
  }, m.v), React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--ink-3)",
      marginTop: 4
    }
  }, m.sub)))), stands.length === 0 ? React.createElement("div", {
    style: {
      padding: 60,
      border: "1px dashed var(--line-2)",
      borderRadius: "var(--r-md)",
      textAlign: "center",
      color: "var(--ink-3)"
    }
  }, React.createElement("div", {
    className: "mono"
  }, "Sin stands"), React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontSize: 28,
      color: "var(--ink)",
      margin: "8px 0 16px"
    }
  }, "Registra el primero."), React.createElement("a", {
    href: "/admin/stands/new",
    "data-route": true,
    className: "btn btn-primary"
  }, "+ Registrar stand")) : React.createElement("div", {
    className: "tabla-scroll",
    style: {
      border: "1px solid var(--line)",
      borderRadius: "var(--r-md)",
      background: "var(--paper)"
    }
  }, React.createElement("div", null, React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "60px 2fr 1fr 1fr 1.2fr 80px",
      padding: "12px 20px",
      borderBottom: "1px solid var(--line)",
      background: "var(--paper-2)"
    }
  }, ["#", "Stand", "Municipio", "Región", "Calificación", ""].map((h, i) => React.createElement("div", {
    key: i,
    className: "mono"
  }, h))), sorted.map((s, i) => React.createElement("a", {
    key: s.id,
    href: "/admin/stands/" + s.id + "/edit",
    "data-route": true,
    style: {
      display: "grid",
      gridTemplateColumns: "60px 2fr 1fr 1fr 1.2fr 80px",
      padding: "16px 20px",
      borderBottom: i < sorted.length - 1 ? "1px solid var(--line)" : "none",
      alignItems: "center",
      textDecoration: "none",
      color: "var(--ink)"
    }
  }, React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 13
    }
  }, String(i + 1).padStart(2, "0")), React.createElement("div", null, React.createElement("div", {
    style: {
      fontWeight: 500,
      fontSize: 15
    }
  }, s.nombre), React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--ink-3)",
      marginTop: 2
    }
  }, s.direccion)), React.createElement("div", {
    style: {
      fontSize: 14
    }
  }, s.municipio), React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--ink-2)"
    }
  }, s.region), React.createElement("div", null, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 6
    }
  }, React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 20,
      fontStyle: "italic"
    }
  }, calcScore(s.votos).toFixed(0)), React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 10
    }
  }, totalVotos(s.votos), " votos")), React.createElement(BarraVotos, {
    votos: s.votos
  })), React.createElement("div", {
    style: {
      textAlign: "right",
      fontSize: 18,
      color: "var(--ink-3)"
    }
  }, "\u2192"))))));
};
const StandEditor = ({
  stand
}) => {
  const isNew = !stand;
  const [form, setForm] = React.useState(stand || {
    id: "st-" + Math.random().toString(36).slice(2, 6),
    nombre: "",
    municipio: "",
    region: "",
    direccion: "",
    correo: "",
    descripcion: "",
    propietario: "",
    propietario_documento: "",
    nit: "",
    sitio_web: "",
    telefono: "",
    lat: null,
    lng: null,
    logo: "",
    votos: {
      bueno: 0,
      regular: 0,
      malo: 0
    },
    coords: {
      x: 0.5,
      y: 0.5
    },
    color: "oklch(0.45 0.1 40)"
  });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [almacen, setAlmacen] = React.useState(null);
  const update = (k, v) => setForm(f => ({
    ...f,
    [k]: v
  }));
  React.useEffect(() => {
    let vivo = true;
    window.LMTApi.infoUploads().then(d => {
      if (vivo) setAlmacen(d);
    }).catch(() => {});
    return () => {
      vivo = false;
    };
  }, []);
  const save = async () => {
    setError("");
    setBusy(true);
    try {
      const payload = {
        id: form.id,
        nombre: form.nombre,
        municipio: form.municipio,
        region: form.region,
        direccion: form.direccion,
        correo: form.correo,
        descripcion: form.descripcion,
        propietario: form.propietario,
        propietario_documento: form.propietario_documento,
        nit: form.nit,
        sitio_web: form.sitio_web,
        telefono: form.telefono,
        lat: form.lat,
        lng: form.lng,
        logo: form.logo || null,
        coords: form.coords,
        color: form.color
      };
      if (isNew) await window.LMTApi.createStand(payload);else await window.LMTApi.updateStand(form.id, payload);
      await window.LMTApi.pollDashboard();
      window.LMTRouter.go(isNew ? "/admin/qr" : "/admin/stands");
    } catch (e) {
      const code = String(e && (e.code || e.message) || e);
      if (code.includes("bad_id")) setError("Identificador inválido (sólo minúsculas, números y guión).");else if (code.includes("bad_nombre")) setError("Nombre obligatorio (máx. 80).");else if (code.includes("bad_municipio")) setError("Municipio obligatorio (máx. 80).");else if (code.includes("unauthorized")) setError("Tu sesión expiró. Vuelve a iniciar sesión.");else setError("No fue posible guardar: " + code);
    } finally {
      setBusy(false);
    }
  };
  const subirLogo = async file => {
    const res = await window.LMTApi.subirLogoStand(file);
    update("logo", res.logo || "");
  };
  const remove = async () => {
    if (!confirmDelete || isNew) return;
    setBusy(true);
    try {
      await window.LMTApi.deleteStand(form.id);
      await window.LMTApi.pollDashboard();
      window.LMTRouter.go("/admin/stands");
    } catch (e) {
      setError("No fue posible borrar: " + (e.code || e.message));
    } finally {
      setBusy(false);
    }
  };
  return React.createElement("div", {
    className: "admin-page",
    style: {
      maxWidth: 960
    }
  }, React.createElement("a", {
    href: "/admin/stands",
    "data-route": true,
    style: {
      color: "var(--ink-2)",
      fontSize: 13,
      marginBottom: 20,
      display: "inline-block"
    }
  }, "\u2190 Volver a stands"), React.createElement("div", {
    className: "mono"
  }, isNew ? "Nuevo registro" : "Editar stand", " \xB7 ", form.id), React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontSize: 40,
      fontWeight: 400,
      margin: "4px 0 28px"
    }
  }, isNew ? "Registrar stand" : form.nombre || "Sin nombre"), React.createElement("div", {
    className: "editor-2col"
  }, React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 24
    }
  }, isNew && React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "ID del stand (URL del QR)"), React.createElement("input", {
    value: form.id,
    onChange: e => update("id", e.target.value.toLowerCase().replace(/[^a-z0-9\-]/g, "")),
    maxLength: 32
  })), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Nombre del stand"), React.createElement("input", {
    value: form.nombre,
    onChange: e => update("nombre", e.target.value),
    placeholder: "Ej: Finca El Tambo",
    maxLength: 80,
    required: true
  })), React.createElement("div", {
    className: "grid-2",
    style: {
      gap: 20
    }
  }, React.createElement(SelectorMunicipio, {
    id: "st-municipio",
    valor: form.municipio,
    requerido: true,
    onCambio: (municipio, region) => setForm(f => ({
      ...f,
      municipio,
      region: region || f.region
    }))
  }), React.createElement(SelectorSubregion, {
    id: "st-region",
    valor: form.region,
    municipio: form.municipio,
    onCambio: v => update("region", v)
  })), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Direcci\xF3n"), React.createElement("input", {
    value: form.direccion,
    onChange: e => update("direccion", e.target.value),
    maxLength: 255
  })), React.createElement("div", {
    className: "grid-2",
    style: {
      gap: 20
    }
  }, React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Correo de contacto"), React.createElement("input", {
    type: "email",
    value: form.correo,
    onChange: e => update("correo", e.target.value),
    maxLength: 254
  })), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Tel\xE9fono"), React.createElement("input", {
    value: form.telefono,
    onChange: e => update("telefono", e.target.value),
    maxLength: 32,
    inputMode: "tel"
  }))), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Descripci\xF3n corta"), React.createElement("textarea", {
    value: form.descripcion,
    onChange: e => update("descripcion", e.target.value),
    rows: 3,
    maxLength: 800
  })), React.createElement("div", {
    className: "grid-2",
    style: {
      gap: 20
    }
  }, React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Propietario"), React.createElement("input", {
    value: form.propietario,
    onChange: e => update("propietario", e.target.value),
    maxLength: 120,
    placeholder: "Nombre completo"
  })), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Documento del propietario"), React.createElement("input", {
    value: form.propietario_documento,
    onChange: e => update("propietario_documento", e.target.value),
    maxLength: 32,
    inputMode: "numeric"
  }))), React.createElement("div", {
    className: "grid-2",
    style: {
      gap: 20
    }
  }, React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "NIT o RUT"), React.createElement("input", {
    value: form.nit,
    onChange: e => update("nit", e.target.value),
    maxLength: 32
  })), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Sitio web o red social"), React.createElement("input", {
    type: "url",
    value: form.sitio_web,
    onChange: e => update("sitio_web", e.target.value),
    maxLength: 255,
    placeholder: "https://\u2026"
  }))), React.createElement(SubirImagen, {
    actual: urlImagen(form.logo),
    etiqueta: "Logo del producto",
    cuadrada: true,
    ruta: form.logo,
    almacen: almacen && almacen.dir,
    onSubir: subirLogo
  }), almacen && React.createElement("div", {
    className: "ruta",
    style: {
      marginTop: -8
    }
  }, "Las im\xE1genes se guardan en ", React.createElement("strong", null, almacen.dir), " · ", "se sirven desde ", React.createElement("strong", null, almacen.url_base), !almacen.escribible && React.createElement("span", {
    style: {
      color: "var(--bad)"
    }
  }, React.createElement("br", null), "Esa carpeta NO tiene permiso de escritura: las subidas fallar\xE1n."), !almacen.protegida && React.createElement("span", {
    style: {
      color: "var(--meh)"
    }
  }, React.createElement("br", null), "Falta el .htaccess que impide ejecutar c\xF3digo ah\xED; se crear\xE1 con la pr\xF3xima subida.")), React.createElement("div", null, React.createElement("div", {
    className: "mono",
    style: {
      marginBottom: 8
    }
  }, "Ubicaci\xF3n en Nari\xF1o"), React.createElement(SelectorUbicacion, {
    lat: form.lat,
    lng: form.lng,
    municipio: form.municipio,
    alto: 300,
    onCambio: u => setForm(f => ({
      ...f,
      lat: u.lat,
      lng: u.lng,
      municipio: u.municipio || f.municipio,
      region: u.municipio && subregionDe(u.municipio) || f.region
    }))
  })), React.createElement("div", null, React.createElement("div", {
    className: "mono",
    style: {
      marginBottom: 12
    }
  }, "Color del sello"), React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap"
    }
  }, ["oklch(0.42 0.09 50)", "oklch(0.55 0.13 30)", "oklch(0.5 0.08 145)", "oklch(0.48 0.1 60)", "oklch(0.5 0.1 200)", "oklch(0.4 0.08 120)", "oklch(0.55 0.12 20)", "oklch(0.45 0.11 300)"].map(c => React.createElement("button", {
    key: c,
    type: "button",
    onClick: () => update("color", c),
    style: {
      width: 36,
      height: 36,
      borderRadius: "50%",
      background: c,
      border: form.color === c ? "2px solid var(--ink)" : "2px solid transparent",
      outline: "1px solid var(--line)",
      outlineOffset: 2
    }
  })))), React.createElement("div", {
    className: "grid-2",
    style: {
      gap: 20
    }
  }, React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Coords X (0..1)"), React.createElement("input", {
    type: "number",
    min: "0",
    max: "1",
    step: "0.01",
    value: form.coords?.x ?? 0.5,
    onChange: e => update("coords", {
      ...form.coords,
      x: parseFloat(e.target.value)
    })
  })), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Coords Y (0..1)"), React.createElement("input", {
    type: "number",
    min: "0",
    max: "1",
    step: "0.01",
    value: form.coords?.y ?? 0.5,
    onChange: e => update("coords", {
      ...form.coords,
      y: parseFloat(e.target.value)
    })
  }))), error && React.createElement("div", {
    role: "alert",
    style: {
      padding: "10px 12px",
      border: "1px solid var(--bad)",
      color: "var(--bad)",
      borderRadius: "var(--r-sm)",
      fontSize: 13
    }
  }, error), React.createElement("div", {
    className: "acciones",
    style: {
      marginTop: 8
    }
  }, React.createElement("button", {
    className: "btn btn-primary",
    onClick: save,
    disabled: busy,
    style: {
      opacity: busy ? 0.6 : 1
    }
  }, busy ? "Guardando…" : isNew ? "Registrar y generar QR →" : "Guardar cambios"), React.createElement("a", {
    href: "/admin/stands",
    "data-route": true,
    className: "btn btn-ghost"
  }, "Cancelar"), !isNew && React.createElement("label", {
    style: {
      marginLeft: "auto",
      display: "flex",
      alignItems: "center",
      gap: 8,
      color: "var(--bad)",
      fontSize: 13
    }
  }, React.createElement("input", {
    type: "checkbox",
    checked: confirmDelete,
    onChange: e => setConfirmDelete(e.target.checked)
  }), " confirmar borrar", React.createElement("button", {
    className: "btn btn-ghost",
    onClick: remove,
    disabled: !confirmDelete || busy,
    style: {
      borderColor: "var(--bad)",
      color: "var(--bad)"
    }
  }, "Eliminar")))), React.createElement("aside", {
    style: {
      position: "sticky",
      top: 24
    }
  }, React.createElement("div", {
    className: "mono",
    style: {
      marginBottom: 12
    }
  }, "Vista previa \xB7 Sello"), React.createElement("div", {
    style: {
      padding: 32,
      border: "1px dashed var(--line-2)",
      borderRadius: "var(--r-md)",
      background: "var(--paper-2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      aspectRatio: "1/1"
    }
  }, form.nombre ? React.createElement(SelloCircular, {
    stand: form,
    size: 170,
    rotation: -6
  }) : React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--ink-3)",
      fontSize: 13
    }
  }, React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontSize: 22,
      marginBottom: 4
    }
  }, "\u2014"), "Completa el nombre", React.createElement("br", null), "para ver el sello")), React.createElement("div", {
    className: "mono",
    style: {
      marginTop: 16
    }
  }, "URL del QR"), React.createElement("div", {
    style: {
      fontSize: 12,
      fontFamily: "var(--font-mono)",
      color: "var(--ink-2)",
      wordBreak: "break-all",
      marginTop: 4
    }
  }, window.location.origin, window.LMT_BASE_URL || "", "/s/", form.id))));
};
Object.assign(window, {
  AdminShell,
  LoginAdmin,
  AdminPage,
  StandsList,
  StandEditor
});
})();

/* components/QRPrint.jsx */
(function () {
const QRPoster = ({
  stand,
  variant = "vertical",
  paraImprimir = false
}) => {
  const url = standUrl(stand.id);
  return React.createElement("div", {
    className: "qr-poster",
    style: {
      width: 420,
      height: 594,
      background: "var(--paper)",
      border: "1px solid var(--line-2)",
      padding: 36,
      display: "flex",
      flexDirection: "column",
      boxShadow: "var(--shadow-2)",
      position: "relative",
      fontFamily: "var(--font-sans)"
    }
  }, [["tl"], ["tr"], ["bl"], ["br"]].map(([p], i) => {
    const pos = {
      tl: {
        top: 8,
        left: 8,
        borderTop: "1px solid var(--ink-3)",
        borderLeft: "1px solid var(--ink-3)"
      },
      tr: {
        top: 8,
        right: 8,
        borderTop: "1px solid var(--ink-3)",
        borderRight: "1px solid var(--ink-3)"
      },
      bl: {
        bottom: 8,
        left: 8,
        borderBottom: "1px solid var(--ink-3)",
        borderLeft: "1px solid var(--ink-3)"
      },
      br: {
        bottom: 8,
        right: 8,
        borderBottom: "1px solid var(--ink-3)",
        borderRight: "1px solid var(--ink-3)"
      }
    }[p];
    return React.createElement("div", {
      key: i,
      style: {
        position: "absolute",
        width: 14,
        height: 14,
        ...pos
      }
    });
  }), React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start"
    }
  }, React.createElement(Wordmark, {
    size: 14
  }), React.createElement("div", {
    className: "mono",
    style: {
      textAlign: "right"
    }
  }, "#", stand.id.toUpperCase(), React.createElement("br", null), React.createElement("span", {
    style: {
      color: "var(--ink-3)"
    }
  }, "Festival 2026"))), React.createElement("div", {
    style: {
      marginTop: 20,
      marginBottom: 16
    }
  }, React.createElement("div", {
    className: "mono"
  }, "Escanea para calificar"), React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontSize: 44,
      fontWeight: 400,
      lineHeight: 1,
      margin: "6px 0 0",
      letterSpacing: "-0.01em"
    }
  }, stand.nombre), React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--ink-2)",
      marginTop: 8
    }
  }, stand.municipio, " \xB7 ", stand.region)), React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      border: "1px solid var(--line)",
      borderRadius: "var(--r-md)",
      position: "relative",
      background: "#fff"
    }
  }, React.createElement(QRCode, {
    data: url,
    size: 240,
    fg: "#111111",
    bg: "#ffffff",
    ansioso: paraImprimir
  }), React.createElement("div", {
    className: "mono",
    style: {
      marginTop: 14,
      color: "var(--ink-2)",
      textAlign: "center",
      maxWidth: 320,
      wordBreak: "break-all"
    }
  }, url), React.createElement("div", {
    style: {
      position: "absolute",
      top: -20,
      right: -20
    }
  }, React.createElement(SelloCircular, {
    stand: stand,
    size: 80,
    rotation: 12
  }))), React.createElement("div", {
    style: {
      marginTop: 20
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8
    }
  }, React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--ink-2)"
    }
  }, "Califica. Opina. Sella tu pasaporte."), React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      fontSize: 20
    }
  }, React.createElement("span", null, "\uD83D\uDE1E"), React.createElement("span", null, "\uD83D\uDE10"), React.createElement("span", null, "\uD83D\uDE0D"))), React.createElement("div", {
    style: {
      height: 1,
      background: "var(--line)"
    }
  }), React.createElement("div", {
    className: "mono",
    style: {
      marginTop: 8,
      display: "flex",
      justifyContent: "space-between"
    }
  }, React.createElement("span", null, "Pega en el frente del stand"), React.createElement("span", null, "\xB7 14\u201420 abr \xB7 Pasto"))));
};
const QRHojas = ({
  stands
}) => {
  if (!stands || stands.length === 0) return null;
  return ReactDOM.createPortal(React.createElement("div", {
    className: "qr-imprimible"
  }, stands.map(s => React.createElement("div", {
    key: s.id,
    className: "qr-hoja"
  }, React.createElement(QRPoster, {
    stand: s,
    paraImprimir: true
  })))), document.body);
};
const esperarImagenes = (raiz, msMax = 8000) => {
  const imgs = Array.from((raiz || document).querySelectorAll("img"));
  const pendientes = imgs.filter(i => !i.complete || i.naturalWidth === 0);
  if (pendientes.length === 0) return Promise.resolve();
  return Promise.race([Promise.all(pendientes.map(img => new Promise(listo => {
    img.addEventListener("load", listo, {
      once: true
    });
    img.addEventListener("error", listo, {
      once: true
    });
  }))), new Promise(listo => setTimeout(listo, msMax))]);
};
const QRPrintView = ({
  stands
}) => {
  const [selected, setSelected] = React.useState(stands[0] ? stands[0].id : null);
  const [hojas, setHojas] = React.useState([]);
  const [preparando, setPreparando] = React.useState("");
  const stand = stands.find(s => s.id === selected) || stands[0];
  const imprimir = React.useCallback(async lista => {
    if (!lista.length) return;
    setPreparando(lista.length > 1 ? `Preparando ${lista.length} carteles…` : "Preparando el cartel…");
    setHojas(lista);
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    await esperarImagenes(document.querySelector(".qr-imprimible"));
    setPreparando("");
    window.print();
  }, []);
  React.useEffect(() => {
    const alTerminar = () => setHojas([]);
    window.addEventListener("afterprint", alTerminar);
    return () => window.removeEventListener("afterprint", alTerminar);
  }, []);
  if (!stand) {
    return React.createElement("div", {
      className: "admin-page"
    }, React.createElement("div", {
      className: "mono"
    }, "C\xF3digos QR"), React.createElement("h1", {
      style: {
        fontFamily: "var(--font-display)",
        fontStyle: "italic",
        fontSize: 36,
        fontWeight: 400,
        margin: "4px 0 18px"
      }
    }, "A\xFAn no hay stands."), React.createElement("a", {
      href: "/admin/stands/new",
      "data-route": true,
      className: "btn btn-primary"
    }, "+ Registrar el primero"));
  }
  return React.createElement("div", {
    className: "admin-page qr-print-screen"
  }, React.createElement(QRHojas, {
    stands: hojas
  }), React.createElement("div", {
    className: "mono"
  }, "C\xF3digos QR \xB7 Imprimir y pegar"), React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontSize: 40,
      fontWeight: 400,
      margin: "4px 0 22px"
    }
  }, "Carteles A5"), React.createElement("div", {
    className: "qr-layout"
  }, React.createElement("aside", null, React.createElement("div", {
    className: "mono",
    style: {
      marginBottom: 12
    }
  }, "Seleccionar stand"), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 4,
      maxHeight: 460,
      overflow: "auto",
      border: "1px solid var(--line)",
      borderRadius: "var(--r-sm)"
    }
  }, stands.map(s => React.createElement("button", {
    key: s.id,
    onClick: () => setSelected(s.id),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 12px",
      borderRadius: 0,
      background: selected === s.id ? "var(--paper-2)" : "transparent",
      textAlign: "left"
    }
  }, React.createElement("div", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: s.color,
      flexShrink: 0
    }
  }), React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: selected === s.id ? 500 : 400,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, s.nombre), React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 10
    }
  }, s.id))))), React.createElement("div", {
    style: {
      marginTop: 18,
      padding: 16,
      border: "1px solid var(--line)",
      borderRadius: "var(--r-md)"
    }
  }, React.createElement("div", {
    className: "mono",
    style: {
      marginBottom: 8
    }
  }, "Acciones"), React.createElement("button", {
    className: "btn btn-primary",
    disabled: !!preparando,
    onClick: () => imprimir([stand]),
    style: {
      width: "100%",
      justifyContent: "center",
      marginBottom: 8
    }
  }, "\uD83D\uDDA8 Imprimir este cartel"), React.createElement("button", {
    className: "btn btn-ghost",
    disabled: !!preparando,
    onClick: () => imprimir(stands),
    style: {
      width: "100%",
      justifyContent: "center",
      marginBottom: 8
    }
  }, "Imprimir todos (", stands.length, ")"), React.createElement("a", {
    href: standUrl(stand.id),
    target: "_blank",
    rel: "noopener",
    className: "btn btn-ghost",
    style: {
      width: "100%",
      justifyContent: "center",
      marginBottom: 8,
      textDecoration: "none"
    }
  }, "Probar URL del QR \u2197"), preparando && React.createElement("div", {
    className: "mono",
    role: "status",
    style: {
      color: "var(--grano)",
      marginTop: 4
    }
  }, preparando), React.createElement("div", {
    className: "nota-menor",
    style: {
      color: "var(--ink-3)",
      marginTop: 8,
      lineHeight: 1.5
    }
  }, "Un cartel A5 (148 \xD7 210 mm) por hoja. Papel offset mate recomendado.", React.createElement("br", null), "Si tu impresora tiene A4, marca \xABAjustar al papel\xBB en el di\xE1logo.", React.createElement("br", null), "Para PDF: imprimir \u2192 \xABGuardar como PDF\xBB."))), React.createElement("div", {
    className: "qr-frame",
    style: {
      background: "var(--paper-2)",
      padding: 40,
      borderRadius: "var(--r-md)",
      border: "1px solid var(--line)",
      display: "flex",
      justifyContent: "center",
      backgroundImage: "linear-gradient(45deg, var(--paper-2) 25%, transparent 25%), linear-gradient(-45deg, var(--paper-2) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--paper-2) 75%), linear-gradient(-45deg, transparent 75%, var(--paper-2) 75%)",
      backgroundSize: "16px 16px",
      backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0"
    }
  }, React.createElement(QRPoster, {
    stand: stand
  }))));
};
const ActivityLive = ({
  stands,
  comentarios
}) => {
  const standMap = Object.fromEntries(stands.map(s => [s.id, s]));
  const getEmoji = e => ({
    bueno: "😍",
    regular: "😐",
    malo: "😞"
  })[e] || "•";
  return React.createElement("div", {
    className: "admin-page"
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, React.createElement("div", {
    className: "mono"
  }, "Actividad"), React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "3px 10px",
      borderRadius: 999,
      background: "oklch(0.6 0.14 145 / 0.12)",
      color: "var(--good)"
    }
  }, React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: "var(--good)",
      animation: "pulse 2s infinite"
    }
  }), React.createElement("span", {
    className: "mono",
    style: {
      color: "var(--good)"
    }
  }, "En vivo"))), React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontSize: 40,
      fontWeight: 400,
      margin: "4px 0 22px"
    }
  }, "Votos en tiempo real"), React.createElement("div", {
    className: "grid-2",
    style: {
      gap: 22
    }
  }, React.createElement("div", {
    style: {
      border: "1px solid var(--line)",
      borderRadius: "var(--r-md)",
      padding: 18
    }
  }, React.createElement("div", {
    className: "mono",
    style: {
      marginBottom: 14
    }
  }, "\xDAltimos votos"), comentarios.length === 0 && React.createElement("div", {
    className: "mono",
    style: {
      color: "var(--ink-3)"
    }
  }, "A\xFAn no hay votos."), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, comentarios.slice(0, 8).map((c, i) => {
    const s = standMap[c.stand];
    return React.createElement("div", {
      key: i,
      style: {
        display: "flex",
        gap: 12,
        paddingBottom: 12,
        borderBottom: i < Math.min(comentarios.length, 8) - 1 ? "1px solid var(--line)" : "none",
        animation: i === 0 ? "fade-up 0.4s" : "none"
      }
    }, React.createElement("div", {
      style: {
        fontSize: 22,
        lineHeight: 1
      }
    }, getEmoji(c.emoji)), React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 500
      }
    }, s ? s.nombre : c.stand), c.texto && React.createElement("div", {
      style: {
        fontSize: 13,
        color: "var(--ink-2)",
        marginTop: 4,
        lineHeight: 1.4
      }
    }, "\"", c.texto, "\""), React.createElement("div", {
      className: "mono",
      style: {
        marginTop: 6,
        display: "flex",
        gap: 12,
        flexWrap: "wrap"
      }
    }, React.createElement("span", null, c.autor), React.createElement("span", null, "\xB7"), React.createElement("span", null, c.hora), c.compra && React.createElement("span", {
      style: {
        color: "var(--cafeto)"
      }
    }, "\xB7 Compr\xF3"))));
  }))), React.createElement("div", {
    style: {
      border: "1px solid var(--line)",
      borderRadius: "var(--r-md)",
      padding: 18
    }
  }, React.createElement("div", {
    className: "mono",
    style: {
      marginBottom: 14
    }
  }, "Ranking actual"), [...stands].sort((a, b) => calcScore(b.votos) - calcScore(a.votos)).slice(0, 8).map((s, i) => React.createElement("div", {
    key: s.id,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "10px 0",
      borderBottom: i < Math.min(stands.length, 8) - 1 ? "1px solid var(--line)" : "none"
    }
  }, React.createElement("span", {
    className: "mono",
    style: {
      width: 24,
      fontSize: 13
    }
  }, String(i + 1).padStart(2, "0")), React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 500
    }
  }, s.nombre), React.createElement("div", {
    className: "nota-menor",
    style: {
      color: "var(--ink-3)"
    }
  }, s.municipio, " \xB7 ", totalVotos(s.votos), " votos")), React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontSize: 22
    }
  }, calcScore(s.votos).toFixed(0)))))), React.createElement("div", {
    style: {
      marginTop: 24,
      padding: 18,
      border: "1px solid var(--line)",
      borderRadius: "var(--r-md)",
      background: "var(--paper)"
    }
  }, React.createElement("div", {
    className: "mono",
    style: {
      marginBottom: 10
    }
  }, "Exportar para reportes"), React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap"
    }
  }, React.createElement("a", {
    href: window.LMTApi ? window.LMTApi.urlFor("/export/votos.csv") : "#",
    className: "btn btn-ghost",
    download: true
  }, "\u2913 Votos (CSV)"), React.createElement("a", {
    href: window.LMTApi ? window.LMTApi.urlFor("/export/stands.csv") : "#",
    className: "btn btn-ghost",
    download: true
  }, "\u2913 Stands (CSV)"), React.createElement("a", {
    href: window.LMTApi ? window.LMTApi.urlFor("/export/pasaportes.csv") : "#",
    className: "btn btn-ghost",
    download: true
  }, "\u2913 Pasaportes (CSV)")), React.createElement("div", {
    className: "nota-menor",
    style: {
      color: "var(--ink-3)",
      marginTop: 8
    }
  }, "Las descargas requieren sesi\xF3n activa de administrador.")), React.createElement("style", null, `@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`));
};
Object.assign(window, {
  QRPoster,
  QRPrintView,
  ActivityLive
});
})();

/* components/VoteFlow.jsx */
(function () {
const EMOJIS = [{
  id: "malo",
  label: "Malo",
  emoji: "😞",
  color: "var(--bad)"
}, {
  id: "regular",
  label: "Regular",
  emoji: "😐",
  color: "var(--meh)"
}, {
  id: "bueno",
  label: "Excelente",
  emoji: "😍",
  color: "var(--good)"
}];
const MobileHeader = ({
  stand
}) => React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    paddingBottom: 16,
    borderBottom: "1px solid var(--line)",
    marginBottom: 16
  }
}, React.createElement("div", {
  style: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: stand.color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--paper)",
    fontFamily: "var(--font-display)",
    fontStyle: "italic",
    fontSize: 18
  }
}, (stand.nombre || "?")[0]), React.createElement("div", {
  style: {
    flex: 1,
    minWidth: 0
  }
}, React.createElement("div", {
  className: "mono",
  style: {
    fontSize: 9
  }
}, "#", stand.id.toUpperCase()), React.createElement("div", {
  style: {
    fontWeight: 600,
    fontSize: 15,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  }
}, stand.nombre)));
const VoteForm = ({
  stand,
  onComplete,
  savedEmail
}) => {
  const sec = window.LMTSecurity;
  const [data, setData] = React.useState({
    correo: savedEmail || "",
    emoji: null,
    compra: null,
    compra_valor: "",
    texto: "",
    estrellas: {
      est_innovacion: null,
      est_atencion: null,
      est_calidad: null
    }
  });
  const [needEmail, setNeedEmail] = React.useState(false);
  const [showOpt, setShowOpt] = React.useState(false);
  const [titulos, setTitulos] = React.useState(() => window.titulosEstrellas());
  React.useEffect(() => {
    const refrescar = () => setTitulos(window.titulosEstrellas());
    window.addEventListener("lmt:festival", refrescar);
    return () => window.removeEventListener("lmt:festival", refrescar);
  }, []);
  const [submitError, setSubmitError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const emailRef = React.useRef(null);
  const update = (k, v) => setData(d => ({
    ...d,
    [k]: v
  }));
  const isEmail = v => sec ? sec.isEmail((v || "").trim()) : (v || "").includes("@");
  const correoOk = isEmail(data.correo);
  React.useEffect(() => {
    if (needEmail && emailRef.current) emailRef.current.focus();
  }, [needEmail]);
  const submitVote = async (emojiId, correo) => {
    setSubmitError("");
    setSubmitting(true);
    try {
      const payload = {
        stand: stand.id,
        emoji: emojiId,
        correo,
        estrellas: data.estrellas,
        compra: data.compra,
        compra_valor: data.compra_valor,
        texto: data.texto
      };
      if (window.LMTApi && window.LMTApi.enabled) {
        const res = await window.LMTApi.submitVote(payload);
        if (res && res.perfil_token) window.LMTPerfil.guardar(correo, res.perfil_token);
      } else if (sec) {
        sec.buildVotePayload(payload);
      }
      try {
        localStorage.setItem("lmt.email", sec ? sec.normalizeEmail(correo) : correo.toLowerCase());
      } catch (_) {}
      onComplete(data);
    } catch (e) {
      const code = String(e && (e.code || e.message) || e);
      if (code.includes("ya_votaste")) setSubmitError("Ya registraste un voto para este stand con ese correo.");else if (code.includes("rate_limited")) setSubmitError("Demasiados votos seguidos. Espera un momento e intenta de nuevo.");else if (code.includes("correo_invalido")) setSubmitError("El correo no es válido.");else if (code.includes("emoji_invalido")) setSubmitError("Selecciona una calificación.");else if (code.includes("stand_no_existe")) setSubmitError("Este stand ya no está disponible.");else if (code.includes("csrf")) setSubmitError("Sesión expirada. Recarga la página y vuelve a intentar.");else setSubmitError("No fue posible registrar tu voto. Intenta de nuevo.");
      setSubmitting(false);
    }
  };
  const onEmoji = emojiId => {
    if (submitting) return;
    setSubmitError("");
    update("emoji", emojiId);
    if (correoOk) {
      submitVote(emojiId, data.correo);
    } else {
      setNeedEmail(true);
    }
  };
  const confirmFirstTime = () => {
    if (!data.emoji || !correoOk || submitting) return;
    submitVote(data.emoji, data.correo);
  };
  const switchAccount = () => {
    try {
      localStorage.removeItem("lmt.email");
    } catch (_) {}
    setData(d => ({
      ...d,
      correo: "",
      emoji: null
    }));
    setNeedEmail(false);
    setSubmitError("");
  };
  const maskedEmail = sec ? sec.maskEmail(data.correo) : data.correo;
  return React.createElement("div", {
    style: {
      animation: "fade-up 0.4s"
    }
  }, React.createElement(MobileHeader, {
    stand: stand
  }), correoOk && !needEmail && React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      padding: "8px 12px",
      marginBottom: 16,
      borderRadius: "var(--r-md)",
      background: "color-mix(in oklch, var(--good) 8%, var(--paper))",
      border: "1px solid var(--line)"
    }
  }, React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--ink-2)"
    }
  }, "\u2713 Sesi\xF3n iniciada \xB7 ", React.createElement("strong", {
    style: {
      fontWeight: 500
    }
  }, maskedEmail)), React.createElement("button", {
    onClick: switchAccount,
    className: "mono",
    style: {
      background: "none",
      border: "none",
      color: "var(--ink-3)",
      cursor: "pointer",
      textDecoration: "underline"
    }
  }, "cambiar")), React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontSize: 30,
      fontWeight: 400,
      margin: "4px 0 6px",
      lineHeight: 1.1,
      letterSpacing: "-0.01em"
    }
  }, "\xBFC\xF3mo estuvo", React.createElement("br", null), "el caf\xE9?"), React.createElement("p", {
    style: {
      fontSize: 13,
      color: "var(--ink-2)",
      marginBottom: 18
    }
  }, "Punt\xFAa lo que quieras y toca un emoji para enviar."), React.createElement("div", {
    style: {
      padding: "14px 16px",
      marginBottom: 16,
      border: "1px solid var(--line-2)",
      borderRadius: "var(--r-lg)",
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, ESTRELLA_CAMPOS.map(campo => React.createElement(EstrellasEntrada, {
    key: campo,
    id: "vf-" + campo,
    etiqueta: titulos[campo],
    valor: data.estrellas[campo],
    onCambio: v => setData(d => ({
      ...d,
      estrellas: {
        ...d.estrellas,
        [campo]: v
      }
    }))
  }))), React.createElement("div", {
    style: {
      marginBottom: 18
    }
  }, React.createElement("div", {
    className: "mono",
    style: {
      marginBottom: 8
    }
  }, "\xBFCompraste algo?"), React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, [{
    v: true,
    l: "Sí, compré"
  }, {
    v: false,
    l: "No esta vez"
  }].map(o => React.createElement("button", {
    key: String(o.v),
    type: "button",
    "aria-pressed": data.compra === o.v,
    onClick: () => setData(d => ({
      ...d,
      compra: d.compra === o.v ? null : o.v,
      compra_valor: o.v === true ? d.compra_valor : ""
    })),
    style: {
      flex: 1,
      padding: 14,
      minHeight: 48,
      border: data.compra === o.v ? "2px solid var(--ink)" : "1px solid var(--line-2)",
      borderRadius: "var(--r-md)",
      fontSize: 15,
      fontWeight: 500,
      background: data.compra === o.v ? "var(--paper-2)" : "var(--paper)"
    }
  }, o.l))), data.compra === true && React.createElement("div", {
    className: "field",
    style: {
      marginTop: 12,
      animation: "fade-up 0.25s"
    }
  }, React.createElement("label", {
    htmlFor: "vf-valor"
  }, "\xBFCu\xE1nto gastaste? (opcional)"), React.createElement("input", {
    id: "vf-valor",
    inputMode: "numeric",
    maxLength: 20,
    value: data.compra_valor,
    placeholder: "25.000",
    onChange: e => update("compra_valor", e.target.value)
  }), React.createElement("span", {
    className: "ayuda"
  }, "En pesos. Sirve para el informe de ventas del festival."))), React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, EMOJIS.map(e => {
    const selected = data.emoji === e.id;
    return React.createElement("button", {
      key: e.id,
      onClick: () => onEmoji(e.id),
      disabled: submitting,
      "aria-label": e.label,
      style: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        padding: "22px 8px",
        border: selected ? `2px solid ${e.color}` : "1px solid var(--line-2)",
        borderRadius: "var(--r-lg)",
        background: selected ? `color-mix(in oklch, ${e.color} 10%, var(--paper))` : "var(--paper)",
        transition: "all 0.15s",
        cursor: submitting ? "default" : "pointer"
      }
    }, React.createElement("span", {
      style: {
        fontSize: 40,
        lineHeight: 1
      }
    }, e.emoji), React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 500
      }
    }, e.label));
  })), submitting && React.createElement("p", {
    className: "mono",
    style: {
      textAlign: "center",
      marginTop: 18,
      color: "var(--ink-2)"
    }
  }, "Registrando tu voto\u2026"), needEmail && !submitting && React.createElement("div", {
    style: {
      animation: "fade-up 0.3s",
      marginTop: 20
    }
  }, React.createElement("div", {
    className: "mono",
    style: {
      marginBottom: 6
    }
  }, "Reg\xEDstrate para votar \xB7 una sola vez"), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Tu correo"), React.createElement("input", {
    ref: emailRef,
    type: "email",
    autoComplete: "email",
    inputMode: "email",
    maxLength: 254,
    placeholder: "nombre@correo.co",
    value: data.correo,
    onChange: e => update("correo", e.target.value),
    onKeyDown: e => {
      if (e.key === "Enter") confirmFirstTime();
    }
  })), React.createElement("p", {
    style: {
      fontSize: 12,
      color: "var(--ink-2)",
      marginTop: 6,
      lineHeight: 1.5
    }
  }, "Con tu correo creamos tu pasaporte del caf\xE9. Queda guardado en este dispositivo: la pr\xF3xima vez votas con un solo toque, sin registrarte de nuevo."), React.createElement("button", {
    className: "btn btn-primary",
    onClick: confirmFirstTime,
    disabled: !correoOk,
    style: {
      width: "100%",
      justifyContent: "center",
      padding: 14,
      marginTop: 14,
      opacity: correoOk ? 1 : 0.4
    }
  }, "Registrarme y votar \u2192")), !submitting && React.createElement("div", {
    style: {
      marginTop: 18
    }
  }, !showOpt ? React.createElement("button", {
    onClick: () => setShowOpt(true),
    className: "mono",
    style: {
      background: "none",
      border: "none",
      color: "var(--ink-2)",
      cursor: "pointer",
      padding: "6px 0",
      textDecoration: "underline"
    }
  }, "+ Agregar comentario (opcional)") : React.createElement("div", {
    style: {
      animation: "fade-up 0.3s"
    }
  }, React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Comentario (opcional, m\xE1x. 500)"), React.createElement("textarea", {
    rows: 3,
    value: data.texto,
    maxLength: 500,
    onChange: e => update("texto", e.target.value),
    placeholder: "\xBFQu\xE9 destacar\xEDas del stand?",
    style: {
      border: "1px solid var(--line-2)",
      borderRadius: "var(--r-md)",
      padding: 12
    }
  }), React.createElement("div", {
    className: "mono",
    style: {
      alignSelf: "flex-end",
      color: "var(--ink-3)"
    }
  }, data.texto.length, "/500")), React.createElement("p", {
    className: "mono",
    style: {
      color: "var(--ink-3)",
      marginTop: 6
    }
  }, "Toca un emoji arriba para enviar tu voto con esto."))), submitError && React.createElement("div", {
    role: "alert",
    style: {
      marginTop: 16,
      padding: "10px 12px",
      border: "1px solid var(--bad)",
      color: "var(--bad)",
      borderRadius: "var(--r-sm)",
      fontSize: 13
    }
  }, submitError), React.createElement("p", {
    className: "mono",
    style: {
      textAlign: "center",
      marginTop: 20,
      lineHeight: 1.6,
      color: "var(--ink-3)"
    }
  }, "Al votar aceptas el tratamiento", React.createElement("br", null), "de datos del festival."));
};
const VoteConfirm = ({
  stand,
  onGoPassport,
  onGoDashboard
}) => {
  const [stamped, setStamped] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setStamped(true), 250);
    return () => clearTimeout(t);
  }, []);
  return React.createElement("div", null, React.createElement("div", {
    className: "mono",
    style: {
      textAlign: "center",
      marginTop: 8
    }
  }, "\u2713 Voto registrado"), React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontSize: 36,
      fontWeight: 400,
      margin: "12px 0 6px",
      textAlign: "center",
      lineHeight: 1.05
    }
  }, "Tu pasaporte", React.createElement("br", null), "ha sido sellado."), React.createElement("p", {
    style: {
      fontSize: 13,
      color: "var(--ink-2)",
      textAlign: "center",
      marginTop: 8
    }
  }, stand.nombre, " \xB7 ", stand.municipio), React.createElement("div", {
    style: {
      marginTop: 24,
      aspectRatio: "1/1.3",
      background: "var(--paper-2)",
      borderRadius: "var(--r-md)",
      border: "1px solid var(--line)",
      position: "relative",
      overflow: "hidden"
    }
  }, React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      backgroundImage: "repeating-linear-gradient(var(--paper-2) 0, var(--paper-2) 23px, var(--line) 23px, var(--line) 24px)",
      opacity: 0.5
    }
  }), React.createElement("div", {
    style: {
      padding: 20,
      position: "relative",
      height: "100%"
    }
  }, React.createElement("div", {
    className: "mono"
  }, "Pasaporte \xB7 Sellado"), React.createElement("div", {
    style: {
      position: "absolute",
      top: "55%",
      left: "50%",
      "--stamp-rot": "-14deg",
      animation: stamped ? "stamp-land 0.6s cubic-bezier(.2,.8,.2,1.2) forwards" : "none",
      opacity: 0
    }
  }, React.createElement(SelloCircular, {
    stand: stand,
    size: 170,
    rotation: -14
  })))), React.createElement("div", {
    style: {
      marginTop: 24,
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, React.createElement("button", {
    className: "btn btn-primary",
    onClick: onGoPassport,
    style: {
      justifyContent: "center",
      padding: 14
    }
  }, "Ver mi pasaporte \u2192"), React.createElement("button", {
    className: "btn btn-ghost",
    onClick: onGoDashboard,
    style: {
      justifyContent: "center",
      padding: 14
    }
  }, "Ver ranking del festival")), window.LMTPerfil && window.LMTPerfil.tieneTestigo() && React.createElement("div", {
    style: {
      marginTop: 22,
      padding: "14px 16px",
      border: "1px dashed var(--line-2)",
      borderRadius: "var(--r-md)",
      background: "var(--paper-2)"
    }
  }, React.createElement("div", {
    className: "mono",
    style: {
      marginBottom: 6
    }
  }, "Opcional"), React.createElement("p", {
    style: {
      fontSize: 13,
      lineHeight: 1.6,
      color: "var(--ink-2)",
      margin: "0 0 12px"
    }
  }, "\xBFNos cuentas de d\xF3nde nos visitas? Nos ayuda a saber qui\xE9n viene al festival y a preparar mejor la pr\xF3xima edici\xF3n. Son dos minutos y ning\xFAn dato es obligatorio."), React.createElement("a", {
    href: "/perfil",
    "data-route": true,
    className: "btn btn-ghost",
    style: {
      justifyContent: "center",
      width: "100%"
    }
  }, "Completar mi perfil")));
};
const MobileVotePage = ({
  stand
}) => {
  const [done, setDone] = React.useState(false);
  const savedEmail = typeof localStorage !== "undefined" && localStorage.getItem("lmt.email") || "";
  return React.createElement("div", {
    className: "mobile-page"
  }, React.createElement("div", {
    className: "mobile-inner"
  }, !done && React.createElement(VoteForm, {
    stand: stand,
    savedEmail: savedEmail,
    onComplete: () => setDone(true)
  }), done && React.createElement(VoteConfirm, {
    stand: stand,
    onGoPassport: () => window.LMTRouter.go("/pasaporte"),
    onGoDashboard: () => window.LMTRouter.go("/festival")
  })));
};
Object.assign(window, {
  VoteForm,
  VoteConfirm,
  MobileVotePage
});
})();

/* components/Passport.jsx */
(function () {
const PassportEmpty = () => React.createElement("div", {
  className: "mobile-page"
}, React.createElement("div", {
  className: "mobile-inner",
  style: {
    textAlign: "center",
    padding: 40
  }
}, React.createElement("div", {
  className: "mono",
  style: {
    marginBottom: 8
  }
}, "A\xFAn no tienes pasaporte"), React.createElement("h2", {
  style: {
    fontFamily: "var(--font-display)",
    fontStyle: "italic",
    fontSize: 38,
    fontWeight: 400,
    margin: "0 0 16px",
    lineHeight: 1.05
  }
}, "Empieza tu traves\xEDa", React.createElement("br", null), "del caf\xE9."), React.createElement("p", {
  style: {
    color: "var(--ink-2)",
    lineHeight: 1.6,
    maxWidth: 360,
    margin: "0 auto 24px"
  }
}, "Escanea el QR de cualquier stand del festival y emite tu primer voto. Cada visita estampa una p\xE1gina en tu pasaporte."), React.createElement("a", {
  href: "/festival",
  "data-route": true,
  className: "btn btn-ghost",
  style: {
    justifyContent: "center"
  }
}, "\u2190 Ver el ranking")));
const PassportPage = ({
  stands
}) => {
  const [email, setEmail] = React.useState(() => {
    try {
      return localStorage.getItem("lmt.email") || "";
    } catch (_) {
      return "";
    }
  });
  const [data, setData] = React.useState(null);
  const [perfil, setPerfil] = React.useState(null);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [flipping, setFlipping] = React.useState(false);
  const [askingEmail, setAskingEmail] = React.useState(!email);
  const load = React.useCallback(async correo => {
    setLoading(true);
    setError("");
    try {
      const g = window.LMTPerfil && window.LMTPerfil.leer() || {};
      const t = g.correo === String(correo).toLowerCase() ? g.token : "";
      const res = await window.LMTApi.getPasaporte(correo, t);
      setData(res);
      setAskingEmail(false);
    } catch (e) {
      const code = String(e && (e.code || e.message) || e);
      if (code.includes("not_found")) setError("Aún no hay pasaporte para ese correo. Vota en cualquier stand para crearlo.");else if (code.includes("bad_email")) setError("El correo no es válido.");else setError("No fue posible cargar tu pasaporte.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);
  React.useEffect(() => {
    if (!email) return;
    let cancelado = false;
    const intentar = () => {
      if (cancelado || !window.LMTApi || !window.LMTApi.enabled) return;
      load(email);
    };
    intentar();
    window.addEventListener("lmt:auth", intentar);
    return () => {
      cancelado = true;
      window.removeEventListener("lmt:auth", intentar);
    };
  }, [email, load]);
  React.useEffect(() => {
    if (!email || !window.LMTPerfil) return;
    const guardado = window.LMTPerfil.leer();
    if (!guardado.token || guardado.correo !== String(email).toLowerCase()) {
      setPerfil(null);
      return;
    }
    let cancelado = false;
    (async () => {
      try {
        const res = await window.LMTApi.getPerfilVisitante(guardado.correo, guardado.token);
        if (!cancelado) setPerfil(res && res.perfil || null);
      } catch (_) {
        if (!cancelado) setPerfil(null);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [email, data]);
  if (askingEmail) {
    return React.createElement("div", {
      className: "mobile-page"
    }, React.createElement("div", {
      className: "mobile-inner"
    }, React.createElement("a", {
      href: "/festival",
      "data-route": true,
      style: {
        color: "var(--ink-3)",
        fontSize: 13
      }
    }, "\u2190 Volver al ranking"), React.createElement("div", {
      className: "mono",
      style: {
        marginTop: 24
      }
    }, "Mi pasaporte"), React.createElement("h2", {
      style: {
        fontFamily: "var(--font-display)",
        fontStyle: "italic",
        fontSize: 36,
        fontWeight: 400,
        margin: "6px 0 12px",
        lineHeight: 1.05
      }
    }, "Identif\xEDcate con el", React.createElement("br", null), "correo que usaste", React.createElement("br", null), "al votar."), React.createElement("form", {
      onSubmit: e => {
        e.preventDefault();
        const sec = window.LMTSecurity;
        const v = (e.target.correo.value || "").trim();
        if (!sec || !sec.isEmail(v)) {
          setError("Correo inválido.");
          return;
        }
        try {
          localStorage.setItem("lmt.email", sec.normalizeEmail(v));
        } catch (_) {}
        setEmail(v);
      }
    }, React.createElement("div", {
      className: "field",
      style: {
        marginTop: 24
      }
    }, React.createElement("label", null, "Correo"), React.createElement("input", {
      name: "correo",
      type: "email",
      inputMode: "email",
      autoComplete: "email",
      required: true,
      maxLength: 254,
      placeholder: "nombre@correo.co"
    })), error && React.createElement("div", {
      role: "alert",
      style: {
        color: "var(--bad)",
        fontSize: 13,
        marginTop: 8
      }
    }, error), React.createElement("button", {
      className: "btn btn-primary",
      type: "submit",
      style: {
        width: "100%",
        justifyContent: "center",
        padding: 14,
        marginTop: 20
      }
    }, "Ver mi pasaporte \u2192"))));
  }
  if (loading) {
    return React.createElement("div", {
      className: "mobile-page"
    }, React.createElement("div", {
      className: "mobile-inner"
    }, React.createElement("div", {
      className: "splash"
    }, "Cargando pasaporte\u2026")));
  }
  if (error || !data) {
    return React.createElement("div", {
      className: "mobile-page"
    }, React.createElement("div", {
      className: "mobile-inner",
      style: {
        textAlign: "center",
        padding: 40
      }
    }, React.createElement("div", {
      className: "mono"
    }, "Pasaporte"), React.createElement("h2", {
      style: {
        fontFamily: "var(--font-display)",
        fontStyle: "italic",
        fontSize: 32,
        fontWeight: 400,
        margin: "8px 0 16px",
        lineHeight: 1.1
      }
    }, error || "No fue posible cargar tu pasaporte."), React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 10,
        alignItems: "center"
      }
    }, React.createElement("button", {
      className: "btn btn-ghost",
      onClick: () => {
        setAskingEmail(true);
        setError("");
      }
    }, "Cambiar correo"), React.createElement("a", {
      href: "/festival",
      "data-route": true,
      className: "btn btn-primary",
      style: {
        justifyContent: "center"
      }
    }, "Volver al ranking"))));
  }
  const visitadosIds = data.visitados || [];
  const visitados = visitadosIds.map(id => stands.find(s => s.id === id)).filter(Boolean);
  if (!visitados.length) return React.createElement(PassportEmpty, null);
  const passport = {
    nombre: perfil && perfil.nombre || data.nombre || "Visitante",
    correo: data.correo || email,
    numero: data.numero || "",
    inicio: data.inicio || "",
    visitados: visitadosIds,
    valoraciones: data.valoraciones || {},
    perfil: perfil
  };
  const fondos = fondosPasaporte();
  let nHoja = 0;
  const interior = () => ({
    fondo: fondoDeHoja(nHoja++)
  });
  const pages = [{
    type: "cover",
    fondo: fondos.portada
  }, {
    type: "index",
    ...interior()
  }, ...visitados.map(s => ({
    type: "stamp",
    stand: s,
    ...interior()
  })), {
    type: "travesia",
    ...interior()
  }, {
    type: "end",
    fondo: fondos.contraportada
  }];
  return React.createElement(PassportBook, {
    passport: passport,
    pages: pages,
    visitados: visitados,
    visitadosIds: visitadosIds,
    stands: stands,
    email: email,
    page: page,
    setPage: setPage,
    flipping: flipping,
    setFlipping: setFlipping
  });
};
const PassportBook = ({
  passport,
  pages,
  visitados,
  visitadosIds,
  stands,
  page,
  setPage,
  flipping,
  setFlipping
}) => {
  const wrapRef = React.useRef(null);
  const libroRef = React.useRef(null);
  const [book3d, setBook3d] = React.useState(false);
  const [festivalTick, setFestivalTick] = React.useState(0);
  React.useEffect(() => {
    const refrescar = () => setFestivalTick(n => n + 1);
    window.addEventListener("lmt:festival", refrescar);
    return () => window.removeEventListener("lmt:festival", refrescar);
  }, []);
  const pagesKey = React.useMemo(() => visitadosIds.join(",") + "|" + stands.length, [visitadosIds, stands.length]);
  const paginasLibro = React.useMemo(() => {
    const fondos = fondosPasaporte();
    let nHoja = 0;
    const interior = () => ({
      fondo: fondoDeHoja(nHoja++)
    });
    return [{
      tipo: "portada",
      nombre: passport.nombre,
      correo: passport.correo,
      inicio: passport.inicio,
      fondo: fondos.portada
    }, Object.assign({
      tipo: "indice",
      visitados: visitados.length,
      totalStands: stands.length
    }, datosPagina(passport, stands.length), interior()), ...visitados.map((s, i) => Object.assign({
      tipo: "sello",
      indice: i,
      stand: Object.assign({}, s, {
        logo: urlImagen(s.logo) || ""
      }),
      desvio_x: desvioSello(s.id).x,
      desvio_y: desvioSello(s.id).y
    }, interior())), Object.assign({
      tipo: "travesia",
      filas: filasTravesia(passport, visitados),
      visitados: visitados.length,
      totalStands: stands.length
    }, interior()), {
      tipo: "final",
      visitados: visitados.length,
      totalStands: stands.length,
      fondo: fondos.contraportada
    }];
  }, [pagesKey, passport.nombre, passport.correo, passport.inicio, passport.numero, passport.perfil, passport.valoraciones, festivalTick]);
  const paginasRef = React.useRef(paginasLibro);
  paginasRef.current = paginasLibro;
  React.useEffect(() => {
    const cont = wrapRef.current;
    if (!cont || !window.LMTPassportBook || !window.LMTPassportBook.soportado()) return;
    const libro = window.LMTPassportBook.mount(cont, {
      paginas: paginasRef.current,
      paginaInicial: 0,
      onReady: () => setBook3d(true),
      onPageChange: i => setPage(i),
      onFallback: () => setBook3d(false)
    });
    libroRef.current = libro;
    return () => {
      if (libro) libro.destroy();
      libroRef.current = null;
      setBook3d(false);
    };
  }, [pagesKey]);
  React.useEffect(() => {
    const libro = libroRef.current;
    if (libro && libro.setPaginas) libro.setPaginas(paginasLibro, {
      mantenerIndice: true
    });
  }, [paginasLibro]);
  const go = dir => {
    const libro = libroRef.current;
    if (libro && book3d) {
      dir > 0 ? libro.siguiente() : libro.anterior();
      return;
    }
    if (flipping) return;
    const next = page + dir;
    if (next < 0 || next >= pages.length) return;
    setFlipping(true);
    setTimeout(() => {
      setPage(next);
      setFlipping(false);
    }, 380);
  };
  const total = book3d && libroRef.current ? libroRef.current.totalPaginas() : pages.length;
  const actual = pages[Math.min(page, pages.length - 1)] || pages[0];
  const resumen = actual.type === "stamp" ? `Sello: ${actual.stand.nombre}, ${actual.stand.municipio}` : actual.type === "cover" ? "Portada del pasaporte" : actual.type === "index" ? `Página de datos de ${passport.nombre}` : actual.type === "travesia" ? `Recorrido: ${visitados.length} stands sellados` : "Fin del pasaporte";
  return React.createElement("div", {
    className: "pasaporte-vista",
    style: {
      minHeight: "100dvh",
      background: "var(--ink)",
      color: "var(--paper)",
      padding: "12px 10px 24px"
    }
  }, React.createElement("div", {
    className: "mobile-inner",
    style: {
      background: "transparent",
      border: "none",
      boxShadow: "none",
      padding: 0
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      padding: "0 4px",
      color: "var(--paper-3)"
    }
  }, React.createElement("div", {
    className: "mono",
    style: {
      color: "var(--paper-3)",
      minWidth: 0,
      flex: 1,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, "Pasaporte \xB7 ", passport.nombre), React.createElement("button", {
    onClick: () => {
      try {
        localStorage.removeItem("lmt.email");
      } catch (_) {}
      window.LMTRouter.go("/");
    },
    style: {
      color: "var(--paper-3)",
      fontSize: 12,
      whiteSpace: "nowrap"
    }
  }, "Cerrar"), React.createElement(MenuPublico, {
    oscuro: true
  })), React.createElement("div", {
    className: "pasaporte-horizontal"
  }, React.createElement("div", {
    ref: wrapRef,
    className: "libro-marco",
    style: {
      marginTop: 18,
      position: "relative"
    }
  }, !book3d && React.createElement(React.Fragment, null, React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      zIndex: 1,
      borderRadius: "6px 12px 12px 6px",
      boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6), -3px 0 0 rgba(0,0,0,0.3)"
    }
  }), React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      zIndex: 1,
      borderRadius: "6px 12px 12px 6px",
      background: "var(--paper)",
      color: "var(--ink)",
      overflow: "hidden",
      transformStyle: "preserve-3d",
      transformOrigin: "left center",
      transform: flipping ? "rotateY(-12deg)" : "rotateY(0deg)",
      transition: "transform 0.5s cubic-bezier(.4,.1,.3,1)"
    }
  }, React.createElement(PassportPage_Page, {
    pageData: pages[Math.min(page, pages.length - 1)],
    passport: passport,
    visitados: visitados,
    totalSlots: Math.max(8, visitados.length),
    totalStands: stands.length
  })))), React.createElement("div", {
    role: "status",
    "aria-live": "polite",
    style: {
      position: "absolute",
      width: 1,
      height: 1,
      overflow: "hidden",
      clip: "rect(0 0 0 0)",
      whiteSpace: "nowrap"
    }
  }, "P\xE1gina ", page + 1, " de ", total, ". ", resumen), React.createElement("div", {
    className: "libro-controles",
    style: {
      marginTop: 18,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 4px"
    }
  }, React.createElement("button", {
    onClick: () => go(-1),
    disabled: page === 0,
    style: {
      width: 44,
      height: 44,
      borderRadius: "50%",
      background: "var(--paper)",
      color: "var(--ink)",
      opacity: page === 0 ? 0.3 : 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, "\u2190"), React.createElement("div", {
    className: "mono",
    style: {
      color: "var(--paper-3)"
    }
  }, String(page + 1).padStart(2, "0"), " / ", String(total).padStart(2, "0")), React.createElement("button", {
    onClick: () => go(1),
    disabled: page >= total - 1,
    style: {
      width: 44,
      height: 44,
      borderRadius: "50%",
      background: "var(--paper)",
      color: "var(--ink)",
      opacity: page >= total - 1 ? 0.3 : 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, "\u2192")), React.createElement("div", {
    className: "mono",
    style: {
      textAlign: "center",
      color: "var(--paper-3)",
      marginTop: 14,
      lineHeight: 1.6
    }
  }, visitados.length, " / ", stands.length, " stands sellados"), window.LMTPerfil && window.LMTPerfil.tieneTestigo() && React.createElement("div", {
    style: {
      textAlign: "center",
      marginTop: 16
    }
  }, React.createElement("a", {
    href: "/perfil",
    "data-route": true,
    className: "mono",
    style: {
      color: "var(--paper-3)",
      textDecoration: "underline",
      lineHeight: 2
    }
  }, "Completar mi perfil de visitante")))));
};
const DATO_VACIO = "——";
const etiquetaPerfil = (campo, valor) => {
  if (!valor) return DATO_VACIO;
  const tabla = (window.PERFIL_ETIQUETAS || {})[campo] || {};
  return tabla[valor] || valor;
};
const fechaCorta = iso => {
  if (!iso) return DATO_VACIO;
  const d = new Date(String(iso).replace(" ", "T"));
  if (isNaN(d)) return DATO_VACIO;
  const meses = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
  return String(d.getDate()).padStart(2, "0") + " " + meses[d.getMonth()] + " " + d.getFullYear();
};
const MRZ_ANCHO = 31;
const bandaMecanica = passport => {
  const limpia = (s, n) => String(s || "").toUpperCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/[^A-Z0-9]/g, "<").slice(0, n).padEnd(n, "<");
  const p = passport.perfil || {};
  const l1 = ("PC<COL" + limpia(passport.nombre, 25)).slice(0, MRZ_ANCHO).padEnd(MRZ_ANCHO, "<");
  const l2 = (limpia(passport.numero, 12) + "COL" + limpia(p.municipio || "NARINO", 16)).slice(0, MRZ_ANCHO).padEnd(MRZ_ANCHO, "<");
  return [l1, l2];
};
const retratoDe = passport => {
  const p = passport.perfil || {};
  return {
    foto: urlImagen(p.avatar) || "",
    emoji: p.avatar_emoji || ""
  };
};
const datosPagina = (passport, totalStands) => {
  const p = passport.perfil || {};
  const [mrz1, mrz2] = bandaMecanica(passport);
  return {
    nombre: passport.nombre,
    correo: passport.correo,
    numero: passport.numero || DATO_VACIO,
    sexo: etiquetaPerfil("genero", p.genero),
    edad: etiquetaPerfil("rango_edad", p.rango_edad),
    procedencia: [p.municipio, p.departamento].filter(Boolean).join(", ") || p.pais || DATO_VACIO,
    visitante: p.entidad || etiquetaPerfil("tipo_visitante", p.tipo_visitante),
    expedido: fechaCorta(passport.inicio),
    conPerfil: !!passport.perfil,
    totalStands: totalStands,
    retrato_foto: retratoDe(passport).foto,
    retrato_emoji: retratoDe(passport).emoji,
    mrz1,
    mrz2
  };
};
const CampoDato = ({
  etiqueta,
  valor,
  ancho,
  tam = 16
}) => React.createElement("div", {
  style: {
    flex: ancho || 1,
    minWidth: 0
  }
}, React.createElement("div", {
  className: "mono",
  style: {
    fontSize: 9,
    color: "var(--ink-3)",
    lineHeight: 1.4
  }
}, etiqueta), React.createElement("div", {
  style: {
    fontSize: tam,
    lineHeight: 1.2,
    marginTop: 2,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  }
}, valor));
const PaginaDatos = ({
  passport,
  totalStands
}) => {
  const p = passport.perfil || {};
  const procedencia = [p.municipio, p.departamento].filter(Boolean).join(", ") || p.pais || DATO_VACIO;
  const entidad = p.entidad || etiquetaPerfil("tipo_visitante", p.tipo_visitante);
  const [mrz1, mrz2] = bandaMecanica(passport);
  const sellos = passport.visitados.length;
  const retrato = retratoDe(passport);
  return React.createElement("div", {
    style: {
      height: "100%",
      padding: "18px 18px 0",
      display: "flex",
      flexDirection: "column"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline"
    }
  }, React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 10
    }
  }, "REP\xDABLICA DE COLOMBIA \xB7 NARI\xD1O"), React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 10,
      color: "var(--ink-3)"
    }
  }, "P\xB7CAF\xC9")), React.createElement("div", {
    style: {
      height: 1,
      background: "var(--line-2)",
      margin: "9px 0 14px"
    }
  }), React.createElement("div", {
    style: {
      display: "flex",
      gap: 15
    }
  }, React.createElement("div", {
    style: {
      width: 86,
      height: 108,
      flexShrink: 0,
      border: "1px solid var(--line-2)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--paper-2, transparent)",
      position: "relative",
      overflow: "hidden"
    }
  }, retrato.foto ? React.createElement("img", {
    src: retrato.foto,
    alt: "",
    style: {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  }) : React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontSize: 40,
      lineHeight: 1
    }
  }, retrato.emoji ? React.createElement("span", {
    style: {
      fontStyle: "normal",
      fontSize: 38
    },
    "aria-hidden": "true"
  }, retrato.emoji) : (passport.nombre || "V").trim().charAt(0).toUpperCase()), !retrato.foto && React.createElement(React.Fragment, null, React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 9,
      color: "var(--ink-3)",
      marginTop: 10
    }
  }, "SELLOS"), React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 18
    }
  }, String(sellos).padStart(2, "0")))), React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 9,
      color: "var(--ink-3)",
      lineHeight: 1.4
    }
  }, "PORTADOR / BEARER"), React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontSize: 22,
      lineHeight: 1.15,
      marginTop: 2,
      overflow: "hidden",
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical"
    }
  }, passport.nombre)), React.createElement("div", {
    style: {
      display: "flex",
      gap: 12
    }
  }, React.createElement(CampoDato, {
    etiqueta: "SEXO",
    valor: etiquetaPerfil("genero", p.genero)
  }), React.createElement(CampoDato, {
    etiqueta: "EDAD",
    valor: etiquetaPerfil("rango_edad", p.rango_edad),
    ancho: 1.3
  })))), React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, React.createElement(CampoDato, {
    etiqueta: "PROCEDENCIA",
    valor: procedencia,
    tam: 17
  })), React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, React.createElement(CampoDato, {
    etiqueta: "N\xBA DE PASAPORTE",
    valor: passport.numero || DATO_VACIO,
    tam: 18
  })), React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      marginTop: 12
    }
  }, React.createElement(CampoDato, {
    etiqueta: "EXPEDIDO",
    valor: fechaCorta(passport.inicio)
  }), React.createElement(CampoDato, {
    etiqueta: "SELLOS",
    valor: sellos + " de " + totalStands
  })), React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, React.createElement(CampoDato, {
    etiqueta: "VISITANTE",
    valor: entidad,
    tam: 15
  })), !passport.perfil && React.createElement("p", {
    style: {
      fontSize: 12,
      color: "var(--ink-3)",
      lineHeight: 1.5,
      marginTop: 14
    }
  }, "Completa tu perfil de visitante y esta hoja se llena con tus datos."), React.createElement("div", {
    style: {
      marginTop: "auto"
    }
  }, React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 9,
      color: "var(--ink-3)",
      marginBottom: 8
    }
  }, "EXPIDE \xB7 GOBERNACI\xD3N DE NARI\xD1O"), React.createElement("div", {
    style: {
      height: 1,
      background: "var(--line-2)"
    }
  }), React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 10,
      letterSpacing: "0.06em",
      lineHeight: 1.7,
      padding: "8px 0 14px",
      color: "var(--ink-2)",
      whiteSpace: "nowrap",
      overflow: "hidden"
    }
  }, mrz1, React.createElement("br", null), mrz2)));
};
const VALORACION = {
  bueno: {
    texto: "Excelente",
    token: "--good"
  },
  regular: {
    texto: "Regular",
    token: "--meh"
  },
  malo: {
    texto: "Mejorable",
    token: "--bad"
  }
};
const filasTravesia = (passport, visitados) => {
  const val = passport.valoraciones || {};
  return visitados.map((s, i) => {
    const v = VALORACION[val[s.id]] || null;
    return {
      n: String(i + 1).padStart(2, "0"),
      nombre: s.nombre,
      logo: urlImagen(s.logo) || "",
      color: s.color || "var(--grano)",
      inicial: (s.nombre || "?").trim().charAt(0).toUpperCase(),
      municipio: s.municipio || "",
      valoracion: v ? v.texto : "",
      color: "var(" + (v ? v.token : "--ink-3") + ")",
      colorPal: v ? v.token : "--ink-3"
    };
  });
};
const desvioSello = id => {
  let h = 0;
  for (let i = 0; i < String(id).length; i++) h = h * 31 + String(id).charCodeAt(i) >>> 0;
  return {
    x: h % 21 - 10,
    y: (h >> 5) % 21 - 10
  };
};
const LogoRedondo = ({
  fila,
  tam = 26
}) => React.createElement("div", {
  style: {
    width: tam,
    height: tam,
    flexShrink: 0,
    borderRadius: "50%",
    overflow: "hidden",
    border: "1px solid var(--line-2)",
    background: fila.color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }
}, fila.logo ? React.createElement("img", {
  src: fila.logo,
  alt: "",
  style: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  }
}) : React.createElement("span", {
  style: {
    fontFamily: "var(--font-display)",
    fontStyle: "italic",
    fontSize: Math.round(tam * 0.55),
    color: "var(--paper)",
    lineHeight: 1
  }
}, fila.inicial));
const PaginaTravesia = ({
  passport,
  visitados,
  totalStands
}) => {
  const filas = filasTravesia(passport, visitados);
  const faltan = Math.max(0, totalStands - filas.length);
  return React.createElement("div", {
    style: {
      height: "100%",
      padding: "22px 22px 0",
      display: "flex",
      flexDirection: "column"
    }
  }, React.createElement("div", {
    className: "mono",
    style: {
      marginBottom: 6
    }
  }, "Recorrido"), React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontSize: 28,
      fontWeight: 400,
      margin: "0 0 4px",
      lineHeight: 1
    }
  }, "Tu traves\xEDa."), React.createElement("p", {
    style: {
      fontSize: 11,
      color: "var(--ink-3)",
      lineHeight: 1.5,
      margin: "0 0 14px"
    }
  }, filas.length === 1 ? "El stand que sellaste" : `Los ${filas.length} stands que sellaste`, passport.valoraciones && Object.keys(passport.valoraciones).length ? ", con tu calificación." : "."), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 9,
      overflow: "hidden"
    }
  }, filas.map(f => React.createElement("div", {
    key: f.n,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, React.createElement("span", {
    className: "mono",
    style: {
      width: 18,
      flexShrink: 0,
      color: "var(--ink-3)"
    }
  }, f.n), React.createElement(LogoRedondo, {
    fila: f,
    tam: 26
  }), React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, React.createElement("div", {
    style: {
      fontSize: 13,
      lineHeight: 1.25,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, f.nombre), f.municipio && React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 9,
      color: "var(--ink-3)"
    }
  }, f.municipio)), f.valoracion && React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 9,
      color: f.color,
      flexShrink: 0
    }
  }, f.valoracion)))), React.createElement("div", {
    className: "mono",
    style: {
      marginTop: "auto",
      padding: "14px 0 18px",
      borderTop: "1px solid var(--line-2)"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between"
    }
  }, React.createElement("span", null, filas.length, " sellados"), React.createElement("span", null, faltan, " faltantes"))));
};
const fondosPasaporte = () => {
  const a = window.LMTFestival && window.LMTFestival.ajustes() || {};
  const p = a.pasaporte || {};
  return {
    portada: urlImagen(p.portada) || "",
    contraportada: urlImagen(p.contraportada) || "",
    hojas: (p.hojas || []).map(h => urlImagen(h)).filter(Boolean)
  };
};
const fondoDeHoja = indice => {
  const hojas = fondosPasaporte().hojas;
  if (!hojas.length) return "";
  return hojas[(indice % hojas.length + hojas.length) % hojas.length];
};
const CapaFondo = ({
  url
}) => {
  if (!url) return null;
  return React.createElement(React.Fragment, null, React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      zIndex: 0,
      backgroundImage: `url(${url})`,
      backgroundSize: "cover",
      backgroundPosition: "center"
    }
  }), React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      zIndex: 0,
      background: "var(--paper)",
      opacity: 0.78
    }
  }));
};
const PassportPage_Page = props => {
  const propio = props.pageData.type === "cover";
  return React.createElement("div", {
    style: {
      height: "100%",
      position: "relative",
      overflow: "hidden"
    }
  }, !propio && React.createElement(CapaFondo, {
    url: props.pageData.fondo || ""
  }), React.createElement("div", {
    style: {
      position: "relative",
      zIndex: 1,
      height: "100%"
    }
  }, React.createElement(PaginaContenido, props)));
};
const PaginaContenido = ({
  pageData,
  passport,
  visitados,
  totalSlots,
  totalStands
}) => {
  const fondo = pageData.fondo || "";
  const lineBg = fondo ? {} : {
    backgroundImage: "repeating-linear-gradient(var(--paper) 0, var(--paper) 26px, var(--line) 26px, var(--line) 27px)"
  };
  if (pageData.type === "cover") {
    return React.createElement("div", {
      style: {
        height: "100%",
        padding: 28,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: fondo ? `linear-gradient(rgba(44,32,24,0.55), rgba(44,32,24,0.55)), url(${fondo}) center/cover, linear-gradient(135deg, var(--grano) 0%, oklch(0.32 0.08 45) 100%)` : "linear-gradient(135deg, var(--grano) 0%, oklch(0.32 0.08 45) 100%)",
        color: "var(--paper)"
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start"
      }
    }, React.createElement("div", {
      style: {
        filter: "invert(1) hue-rotate(180deg)"
      }
    }, React.createElement(LogoTaza, {
      size: 36
    })), React.createElement("div", {
      className: "mono",
      style: {
        color: "var(--paper-3)",
        textAlign: "right"
      }
    }, "NARI\xD1O", React.createElement("br", null), "COLOMBIA")), React.createElement("div", null, React.createElement("div", {
      className: "mono",
      style: {
        color: "var(--paper-3)"
      }
    }, "Pasaporte del Caf\xE9"), React.createElement("h1", {
      style: {
        fontFamily: "var(--font-display)",
        fontStyle: "italic",
        fontSize: 48,
        fontWeight: 400,
        margin: "6px 0 0",
        lineHeight: 0.9,
        letterSpacing: "-0.02em"
      }
    }, "La Mejor", React.createElement("br", null), "Taza.")), React.createElement("div", null, React.createElement("div", {
      style: {
        height: 1,
        background: "var(--paper-3)",
        opacity: 0.3,
        marginBottom: 16
      }
    }), React.createElement("div", {
      className: "mono",
      style: {
        color: "var(--paper-3)",
        marginBottom: 4
      }
    }, "Portador"), React.createElement("div", {
      style: {
        fontFamily: "var(--font-display)",
        fontStyle: "italic",
        fontSize: 26,
        fontWeight: 400
      }
    }, passport.nombre), React.createElement("div", {
      style: {
        fontSize: 12,
        color: "var(--paper-3)",
        marginTop: 6
      }
    }, passport.correo)));
  }
  if (pageData.type === "index") {
    return React.createElement(PaginaDatos, {
      passport: passport,
      totalStands: totalStands
    });
  }
  if (pageData.type === "travesia") {
    return React.createElement(PaginaTravesia, {
      passport: passport,
      visitados: visitados,
      totalStands: totalStands
    });
  }
  if (pageData.type === "stamp") {
    const s = pageData.stand;
    const rot = (s.id.charCodeAt(s.id.length - 1) || 0) % 20 - 10;
    const desv = desvioSello(s.id);
    const logo = urlImagen(s.logo);
    return React.createElement("div", {
      style: {
        height: "100%",
        padding: 22,
        ...lineBg,
        position: "relative",
        overflow: "hidden"
      }
    }, React.createElement("div", {
      className: "mono",
      style: {
        marginBottom: 6
      }
    }, "Sello \xB7 ", s.municipio), React.createElement("h2", {
      style: {
        fontFamily: "var(--font-display)",
        fontStyle: "italic",
        fontSize: 26,
        fontWeight: 400,
        margin: "0 0 4px",
        lineHeight: 1
      }
    }, s.nombre), React.createElement("div", {
      style: {
        fontSize: 11,
        color: "var(--ink-3)"
      }
    }, s.region), logo && React.createElement("div", {
      style: {
        position: "absolute",
        top: "48%",
        left: "52%",
        transform: "translate(-50%, -50%)",
        width: 132,
        height: 132,
        borderRadius: "50%",
        overflow: "hidden",
        border: "1px solid var(--line-2)"
      }
    }, React.createElement("img", {
      src: logo,
      alt: "",
      style: {
        width: "100%",
        height: "100%",
        objectFit: "cover"
      }
    }), React.createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        borderRadius: "50%",
        background: "var(--paper)",
        opacity: 0.62
      }
    })), React.createElement("div", {
      style: {
        position: "absolute",
        top: `calc(48% + ${desv.y}px)`,
        left: `calc(52% + ${desv.x}px)`,
        transform: "translate(-50%, -50%)",
        "--stamp-rot": rot + "deg",
        animation: "stamp-land 0.6s cubic-bezier(.2,.8,.2,1.2) forwards"
      }
    }, React.createElement(SelloCircular, {
      stand: s,
      size: 150,
      rotation: rot
    })), React.createElement("div", {
      style: {
        position: "absolute",
        bottom: 22,
        left: 22,
        right: 22
      }
    }, React.createElement("div", {
      style: {
        fontSize: 11,
        color: "var(--ink-2)",
        lineHeight: 1.5,
        fontStyle: "italic",
        fontFamily: "var(--font-display)"
      }
    }, "\"", s.descripcion, "\"")));
  }
  if (pageData.type === "end") {
    return React.createElement("div", {
      style: {
        height: "100%",
        padding: 28,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        ...lineBg
      }
    }, React.createElement("div", {
      className: "mono"
    }, "Fin del pasaporte"), React.createElement("h2", {
      style: {
        fontFamily: "var(--font-display)",
        fontStyle: "italic",
        fontSize: 30,
        fontWeight: 400,
        margin: "12px 0 8px",
        lineHeight: 1
      }
    }, "Gracias por", React.createElement("br", null), "caminar el caf\xE9", React.createElement("br", null), "con nosotros."), React.createElement("div", {
      style: {
        marginTop: 20,
        padding: "12px 18px",
        border: "1px solid var(--line-2)",
        borderRadius: 999,
        fontSize: 12
      }
    }, "Vuelve el pr\xF3ximo festival"));
  }
  return null;
};
Object.assign(window, {
  PassportPage,
  datosPagina
});
})();

/* components/Dashboard.jsx */
(function () {
const PublicHeader = () => React.createElement("header", {
  style: {
    padding: "20px 32px",
    borderBottom: "1px solid var(--line)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "var(--paper)",
    flexWrap: "wrap",
    gap: 12
  }
}, React.createElement("a", {
  href: "/festival",
  "data-route": true,
  style: {
    textDecoration: "none",
    color: "inherit"
  }
}, React.createElement(Wordmark, {
  size: 16
})), React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "center",
    gap: 14
  }
}, React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "center",
    gap: 6
  }
}, React.createElement("span", {
  style: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "var(--good)",
    animation: "pulse 2s infinite"
  }
}), React.createElement("span", {
  className: "mono",
  style: {
    color: "var(--good)"
  }
}, "En vivo")), React.createElement(MenuPublico, null)));
const PublicDashboard = ({
  stands,
  comentarios,
  onDetail
}) => {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 5000);
    return () => clearInterval(t);
  }, []);
  if (!stands.length) {
    return React.createElement("div", {
      style: {
        minHeight: "100dvh",
        background: "var(--paper)"
      }
    }, React.createElement(PublicHeader, null), React.createElement("section", {
      style: {
        padding: "80px 32px",
        textAlign: "center"
      }
    }, React.createElement("div", {
      className: "mono"
    }, "Festival 2026"), React.createElement("h1", {
      style: {
        fontFamily: "var(--font-display)",
        fontStyle: "italic",
        fontSize: 64,
        fontWeight: 400,
        margin: "12px 0 16px",
        lineHeight: 1,
        letterSpacing: "-0.02em"
      }
    }, "El festival arranca pronto."), React.createElement("p", {
      style: {
        color: "var(--ink-2)",
        maxWidth: 540,
        margin: "0 auto 20px",
        fontSize: 16,
        lineHeight: 1.6
      }
    }, "A\xFAn no hay stands registrados. Si eres organizador inicia sesi\xF3n y registra el primero."), React.createElement("a", {
      href: "/admin/login",
      "data-route": true,
      className: "btn btn-primary"
    }, "Entrar como admin \u2192")));
  }
  const sorted = [...stands].sort((a, b) => calcScore(b.votos) - calcScore(a.votos));
  const top3 = sorted.slice(0, 3);
  const totalVotosAll = stands.reduce((a, s) => a + totalVotos(s.votos), 0);
  const metricas = window.LMTApi && window.LMTApi.metricas || null;
  return React.createElement("div", {
    style: {
      minHeight: "100dvh",
      background: "var(--paper)"
    }
  }, React.createElement(PublicHeader, null), React.createElement("section", {
    className: "lmt-three-wrap",
    ref: el => {
      if (el && window.LMTThree && !el.dataset.threeMounted) window.LMTThree.mount(el);
    },
    "data-three-bg": true,
    className: "seccion",
    style: {
      paddingTop: 48,
      paddingBottom: 32,
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
      gap: 36,
      alignItems: "flex-end",
      position: "relative",
      overflow: "hidden",
      minHeight: 320
    }
  }, React.createElement("div", null, React.createElement("div", {
    className: "mono"
  }, "Ranking p\xFAblico"), React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontSize: "min(96px, 12vw)",
      fontWeight: 400,
      margin: "8px 0 0",
      lineHeight: 0.9,
      letterSpacing: "-0.03em"
    }
  }, "\xBFCu\xE1l es la", React.createElement("br", null), "mejor taza de", React.createElement("br", null), React.createElement("span", {
    style: {
      color: "var(--galeras)"
    }
  }, "Nari\xF1o"), "?"), React.createElement("p", {
    style: {
      fontSize: 15,
      color: "var(--ink-2)",
      marginTop: 18,
      maxWidth: 520,
      lineHeight: 1.6
    }
  }, "El festival lo decide el p\xFAblico. Escanea el QR de cada stand, vota con un emoji y sella tu pasaporte.")), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12
    }
  }, [{
    k: totalVotosAll.toLocaleString(),
    sub: "votos totales"
  }, {
    k: metricas ? metricas.pasaportes : "—",
    sub: "pasaportes activos"
  }, {
    k: stands.length,
    sub: "stands participan"
  }, {
    k: metricas ? metricas.aprobacion + "%" : "—",
    sub: "aprobación general"
  }].map((m, i) => React.createElement("div", {
    key: i,
    style: {
      padding: 18,
      border: "1px solid var(--line)",
      borderRadius: "var(--r-md)",
      background: "var(--paper)"
    }
  }, React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 36,
      fontStyle: "italic",
      lineHeight: 1
    }
  }, m.k), React.createElement("div", {
    className: "mono",
    style: {
      marginTop: 6
    }
  }, m.sub))))), React.createElement("section", {
    style: {
      padding: "24px 32px 40px"
    }
  }, React.createElement("div", {
    className: "mono",
    style: {
      marginBottom: 14
    }
  }, "Top 3 \xB7 Podio en vivo"), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
      gap: 14,
      alignItems: "flex-end"
    }
  }, [top3[1], top3[0], top3[2]].map((s, displayIdx) => {
    if (!s) return React.createElement("div", {
      key: displayIdx
    });
    const actualRank = [2, 1, 3][displayIdx];
    const h = [180, 240, 150][displayIdx];
    return React.createElement("a", {
      key: s.id,
      href: "/festival/" + s.id,
      "data-route": true,
      style: {
        textDecoration: "none",
        color: "inherit"
      }
    }, React.createElement("div", {
      style: {
        height: h,
        background: actualRank === 1 ? "var(--ink)" : "var(--paper-2)",
        color: actualRank === 1 ? "var(--paper)" : "var(--ink)",
        border: "1px solid var(--line)",
        borderRadius: "var(--r-md)",
        padding: 18,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden"
      }
    }, React.createElement("div", {
      className: "mono",
      style: {
        color: actualRank === 1 ? "var(--paper-3)" : "var(--ink-3)"
      }
    }, "#", actualRank, " ", actualRank === 1 && "· La Mejor Taza"), React.createElement("div", null, React.createElement("div", {
      style: {
        fontFamily: "var(--font-display)",
        fontStyle: "italic",
        fontSize: actualRank === 1 ? 36 : 24,
        fontWeight: 400,
        lineHeight: 1,
        letterSpacing: "-0.01em"
      }
    }, s.nombre), React.createElement("div", {
      style: {
        fontSize: 12,
        marginTop: 6,
        opacity: 0.7
      }
    }, s.municipio), React.createElement("div", {
      style: {
        marginTop: 12,
        display: "flex",
        alignItems: "baseline",
        gap: 8
      }
    }, React.createElement("span", {
      style: {
        fontFamily: "var(--font-display)",
        fontStyle: "italic",
        fontSize: 28
      }
    }, calcScore(s.votos).toFixed(0)), React.createElement("span", {
      className: "mono",
      style: {
        color: actualRank === 1 ? "var(--paper-3)" : "var(--ink-3)"
      }
    }, "/100 \xB7 ", totalVotos(s.votos), " votos"))), actualRank === 1 && React.createElement("div", {
      style: {
        position: "absolute",
        top: 16,
        right: 16
      }
    }, React.createElement(SelloCircular, {
      stand: s,
      size: 96,
      rotation: 10
    }))));
  }))), React.createElement("section", {
    className: "seccion",
    style: {
      paddingBottom: 40,
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
      gap: 22
    }
  }, React.createElement(MapaNarino, {
    stands: stands,
    onDetail: onDetail
  }), React.createElement("div", {
    style: {
      border: "1px solid var(--line)",
      borderRadius: "var(--r-md)",
      padding: 22
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14
    }
  }, React.createElement("div", {
    className: "mono"
  }, "\xDAltimos votos"), React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: "var(--good)",
      animation: "pulse 2s infinite"
    }
  }), React.createElement("span", {
    className: "mono",
    style: {
      color: "var(--good)"
    }
  }, "Live"))), comentarios.length === 0 && React.createElement("div", {
    className: "mono",
    style: {
      color: "var(--ink-3)"
    }
  }, "A\xFAn no hay votos."), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, comentarios.slice(0, 6).map((c, i) => {
    const s = stands.find(x => x.id === c.stand);
    if (!s) return null;
    const emoji = {
      bueno: "😍",
      regular: "😐",
      malo: "😞"
    }[c.emoji] || "•";
    return React.createElement("a", {
      key: i,
      href: "/festival/" + s.id,
      "data-route": true,
      style: {
        display: "flex",
        gap: 12,
        paddingBottom: 12,
        borderBottom: i < Math.min(comentarios.length, 6) - 1 ? "1px solid var(--line)" : "none",
        textDecoration: "none",
        color: "inherit",
        animation: i === 0 ? "fade-up 0.4s" : "none"
      }
    }, React.createElement("div", {
      style: {
        fontSize: 22
      }
    }, emoji), React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 500
      }
    }, s.nombre), c.texto && React.createElement("div", {
      style: {
        fontSize: 12,
        color: "var(--ink-2)",
        marginTop: 4,
        lineHeight: 1.4,
        fontStyle: "italic",
        fontFamily: "var(--font-display)"
      }
    }, "\"", c.texto, "\""), React.createElement("div", {
      className: "mono",
      style: {
        marginTop: 6
      }
    }, c.autor, " \xB7 ", c.hora, " ", c.compra && React.createElement("span", {
      style: {
        color: "var(--cafeto)"
      }
    }, "\xB7 compr\xF3"))));
  })))), React.createElement("section", {
    className: "seccion",
    style: {
      paddingBottom: 56
    }
  }, React.createElement("div", {
    className: "mono",
    style: {
      marginBottom: 14
    }
  }, "Tabla completa \xB7 ", stands.length, " stands"), React.createElement("div", {
    style: {
      border: "1px solid var(--line)",
      borderRadius: "var(--r-md)",
      overflow: "hidden"
    }
  }, sorted.map((s, i) => React.createElement("a", {
    key: s.id,
    href: "/festival/" + s.id,
    "data-route": true,
    className: "rank-fila",
    style: {
      borderBottom: i < sorted.length - 1 ? "1px solid var(--line)" : "none"
    }
  }, React.createElement("div", {
    className: "mono rank-pos",
    style: {
      fontSize: 13
    }
  }, String(i + 1).padStart(2, "0")), React.createElement("div", {
    className: "rank-nombre"
  }, React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontSize: 20,
      letterSpacing: "-0.01em"
    }
  }, s.nombre), React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--ink-3)",
      marginTop: 2
    }
  }, (s.descripcion || "").slice(0, 80), s.descripcion && s.descripcion.length > 80 ? "…" : "")), React.createElement("div", {
    className: "rank-meta",
    style: {
      fontSize: 13
    }
  }, s.municipio), React.createElement("div", {
    className: "rank-puntaje",
    style: {
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontSize: 24
    }
  }, calcScore(s.votos).toFixed(0)), React.createElement("div", {
    className: "rank-meta",
    style: {
      fontSize: 13,
      color: "var(--ink-2)"
    }
  }, totalVotos(s.votos), " votos"), React.createElement("div", {
    className: "rank-barra"
  }, React.createElement(BarraVotos, {
    votos: s.votos
  })))))), React.createElement("footer", {
    style: {
      padding: "32px",
      borderTop: "1px solid var(--line)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 12
    }
  }, React.createElement(Wordmark, {
    size: 14
  }), React.createElement("div", {
    className: "mono",
    style: {
      color: "var(--ink-3)"
    }
  }, "Comit\xE9 del Caf\xE9 \xB7 Gobernaci\xF3n de Nari\xF1o \xB7 2026")), React.createElement("style", null, `@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`));
};
const normMuni = s => (s || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toUpperCase().trim();
const MapaNarino = ({
  stands,
  onDetail
}) => {
  const [hover, setHover] = React.useState(null);
  const mapa = window.NARINO_MAPA;
  const [vw, vh] = mapa ? mapa.viewBox.split(" ").slice(2).map(Number) : [1000, 1068];
  const byName = React.useMemo(() => {
    const idx = {};
    if (mapa) mapa.municipios.forEach(m => {
      idx[normMuni(m.nombre)] = m;
    });
    return idx;
  }, [mapa]);
  const findMuni = municipio => {
    if (!mapa) return null;
    const n = normMuni(municipio);
    if (byName[n]) return byName[n];
    return mapa.municipios.find(m => {
      const mn = normMuni(m.nombre);
      return mn.includes(n) || n.includes(mn);
    }) || null;
  };
  const activos = new Set();
  const placed = stands.map(s => {
    const muni = findMuni(s.municipio);
    if (muni) activos.add(muni.id);
    return {
      s,
      muni
    };
  });
  const ranked = [...stands].sort((a, b) => calcScore(b.votos) - calcScore(a.votos));
  const rankOf = id => ranked.findIndex(x => x.id === id) + 1;
  return React.createElement("div", {
    style: {
      border: "1px solid var(--line)",
      borderRadius: "var(--r-md)",
      padding: 22,
      position: "relative"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 14
    }
  }, React.createElement("div", {
    className: "mono"
  }, "Mapa \xB7 Nari\xF1o"), React.createElement("div", {
    className: "mono",
    style: {
      color: "var(--ink-3)"
    }
  }, stands.length, " stands ubicados")), React.createElement("div", {
    style: {
      aspectRatio: `${vw} / ${vh}`,
      position: "relative",
      background: "var(--paper-2)",
      borderRadius: "var(--r-sm)",
      overflow: "hidden",
      maxHeight: 440,
      margin: "0 auto"
    },
    className: "paper-texture"
  }, React.createElement("svg", {
    width: "100%",
    height: "100%",
    viewBox: mapa ? mapa.viewBox : "0 0 1000 1068",
    preserveAspectRatio: "xMidYMid meet",
    style: {
      position: "absolute",
      inset: 0
    }
  }, mapa && mapa.municipios.map(m => React.createElement("path", {
    key: m.id,
    d: m.d,
    fill: activos.has(m.id) ? "color-mix(in oklch, var(--galeras) 18%, var(--paper))" : "var(--paper)",
    stroke: "var(--line-2)",
    strokeWidth: "1",
    strokeLinejoin: "round"
  }, React.createElement("title", null, m.nombre)))), placed.map(({
    s,
    muni
  }) => {
    if (!muni) return null;
    const rank = rankOf(s.id);
    const size = rank === 1 ? 26 : rank <= 3 ? 20 : 14;
    const leftPct = muni.cx / vw * 100;
    const topPct = muni.cy / vh * 100;
    return (React.createElement("button", {
        key: s.id,
        onClick: () => onDetail(s.id),
        onMouseEnter: () => setHover(s.id),
        onMouseLeave: () => setHover(null),
        "aria-label": `${s.nombre} — ${s.municipio}`,
        style: {
          position: "absolute",
          left: leftPct + "%",
          top: topPct + "%",
          transform: "translate(-50%, -50%)",
          width: 44,
          height: 44,
          padding: 0,
          background: "transparent",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: hover === s.id ? 5 : 1
        }
      }, React.createElement("span", {
        style: {
          width: size,
          height: size,
          borderRadius: "50%",
          background: s.color,
          border: "2px solid var(--paper)",
          boxShadow: hover === s.id ? `0 0 0 6px ${(s.color || "").replace(")", " / 0.2)")}` : "0 2px 4px oklch(0.22 0.02 60 / 0.2)",
          transition: "box-shadow 0.2s, transform 0.2s",
          transform: hover === s.id ? "scale(1.15)" : "scale(1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--paper)",
          fontSize: 10,
          fontWeight: 600
        }
      }, rank <= 3 ? rank : ""), hover === s.id && React.createElement("div", {
        style: {
          position: "absolute",
          bottom: "calc(100% + 8px)",
          left: "50%",
          transform: "translateX(-50%)",
          background: "var(--ink)",
          color: "var(--paper)",
          padding: "8px 12px",
          borderRadius: "var(--r-sm)",
          whiteSpace: "nowrap",
          fontSize: 12,
          fontWeight: 500,
          pointerEvents: "none",
          zIndex: 10
        }
      }, s.nombre, React.createElement("div", {
        style: {
          fontSize: 10,
          opacity: 0.7,
          fontWeight: 400
        }
      }, s.municipio, " \xB7 ", calcScore(s.votos).toFixed(0), "/100")))
    );
  })));
};
const PublicDetail = ({
  stand,
  comentarios,
  allStands,
  onBack,
  onVote
}) => {
  const commentsForStand = comentarios.filter(c => c.stand === stand.id);
  const rank = [...allStands].sort((a, b) => calcScore(b.votos) - calcScore(a.votos)).findIndex(x => x.id === stand.id) + 1;
  const totalv = totalVotos(stand.votos) || 0;
  return React.createElement("div", {
    style: {
      minHeight: "100dvh",
      background: "var(--paper)"
    }
  }, React.createElement(PublicHeader, null), React.createElement("section", {
    className: "seccion",
    style: {
      paddingTop: 32,
      paddingBottom: 32,
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
      gap: 32
    }
  }, React.createElement("div", null, React.createElement("a", {
    href: "/festival",
    "data-route": true,
    style: {
      color: "var(--ink-2)",
      fontSize: 13
    }
  }, "\u2190 Volver al ranking"), React.createElement("div", {
    className: "mono",
    style: {
      marginTop: 14
    }
  }, "Posici\xF3n #", rank || "—", " \xB7 ", stand.municipio), React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontSize: "min(72px, 9vw)",
      fontWeight: 400,
      margin: "8px 0 0",
      lineHeight: 0.9,
      letterSpacing: "-0.02em"
    }
  }, stand.nombre), React.createElement("p", {
    style: {
      fontSize: 15,
      color: "var(--ink-2)",
      marginTop: 18,
      maxWidth: 540,
      lineHeight: 1.6
    }
  }, stand.descripcion), React.createElement("div", {
    style: {
      marginTop: 24,
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 14
    }
  }, [{
    k: "Calificación",
    v: calcScore(stand.votos).toFixed(0),
    sub: "/ 100"
  }, {
    k: "Votos",
    v: totalv,
    sub: "totales"
  }, {
    k: "Aprobación",
    v: totalv > 0 ? Math.round(stand.votos.bueno / totalv * 100) + "%" : "—",
    sub: "excelente"
  }].map(m => React.createElement("div", {
    key: m.k,
    style: {
      padding: 14,
      border: "1px solid var(--line)",
      borderRadius: "var(--r-md)"
    }
  }, React.createElement("div", {
    className: "mono"
  }, m.k), React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontSize: 32,
      marginTop: 6,
      lineHeight: 1
    }
  }, m.v), React.createElement("div", {
    className: "sub-metrica",
    style: {
      color: "var(--ink-3)"
    }
  }, m.sub)))), React.createElement("div", {
    style: {
      marginTop: 24,
      padding: 18,
      background: "var(--paper-2)",
      borderRadius: "var(--r-md)"
    }
  }, React.createElement("div", {
    className: "mono",
    style: {
      marginBottom: 10
    }
  }, "Distribuci\xF3n"), [{
    k: "Excelente",
    v: stand.votos.bueno,
    color: "var(--good)",
    emoji: "😍"
  }, {
    k: "Regular",
    v: stand.votos.regular,
    color: "var(--meh)",
    emoji: "😐"
  }, {
    k: "Malo",
    v: stand.votos.malo,
    color: "var(--bad)",
    emoji: "😞"
  }].map(r => {
    const pct = totalv > 0 ? r.v / totalv * 100 : 0;
    return React.createElement("div", {
      key: r.k,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "6px 0"
      }
    }, React.createElement("span", {
      style: {
        fontSize: 18
      }
    }, r.emoji), React.createElement("span", {
      style: {
        width: 80,
        fontSize: 13
      }
    }, r.k), React.createElement("div", {
      style: {
        flex: 1,
        height: 6,
        background: "var(--paper)",
        borderRadius: 999,
        overflow: "hidden"
      }
    }, React.createElement("div", {
      style: {
        width: pct + "%",
        height: "100%",
        background: r.color,
        transition: "width 0.5s"
      }
    })), React.createElement("span", {
      className: "mono",
      style: {
        width: 60,
        textAlign: "right"
      }
    }, pct.toFixed(0), "% \xB7 ", r.v));
  }))), React.createElement("aside", null, React.createElement("div", {
    style: {
      aspectRatio: "1/1.3",
      background: stand.color,
      borderRadius: "var(--r-md)",
      padding: 28,
      color: "var(--paper)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      position: "relative",
      overflow: "hidden"
    }
  }, React.createElement("div", {
    className: "mono",
    style: {
      color: "oklch(0.95 0.01 75)"
    }
  }, "#", stand.id.toUpperCase()), React.createElement("div", null, React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontSize: 40,
      lineHeight: 0.95,
      letterSpacing: "-0.02em"
    }
  }, stand.nombre), React.createElement("div", {
    style: {
      fontSize: 13,
      marginTop: 12,
      opacity: 0.85
    }
  }, stand.direccion), React.createElement("div", {
    style: {
      fontSize: 13,
      marginTop: 4,
      opacity: 0.85
    }
  }, stand.correo)), React.createElement("a", {
    href: "/s/" + stand.id,
    "data-route": true,
    className: "btn",
    style: {
      background: "var(--paper)",
      color: "var(--ink)",
      justifyContent: "center",
      padding: 14,
      textDecoration: "none"
    }
  }, "Votar este stand \u2192")), React.createElement("div", {
    style: {
      marginTop: 20
    }
  }, React.createElement("div", {
    className: "mono",
    style: {
      marginBottom: 10
    }
  }, "Comentarios recientes"), commentsForStand.length === 0 && React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--ink-3)",
      fontStyle: "italic",
      fontFamily: "var(--font-display)"
    }
  }, "A\xFAn no hay comentarios. S\xE9 el primero."), commentsForStand.map((c, i) => React.createElement("div", {
    key: i,
    style: {
      padding: "12px 0",
      borderBottom: i < commentsForStand.length - 1 ? "1px solid var(--line)" : "none"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 13,
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      lineHeight: 1.4
    }
  }, "\"", c.texto, "\""), React.createElement("div", {
    className: "mono",
    style: {
      marginTop: 6
    }
  }, c.autor, " \xB7 ", c.hora)))))));
};
Object.assign(window, {
  PublicDashboard,
  MapaNarino,
  PublicDetail,
  PublicHeader
});
})();

/* components/Recorrido.jsx */
(function () {
const RECORRIDO_COLUMNAS = {
  pc: 3,
  movil: 2
};
const columnasConfiguradas = () => {
  const a = window.LMTFestival && window.LMTFestival.ajustes() || {};
  const r = a.recorrido || {};
  return {
    pc: Math.max(1, Math.min(6, Number(r.columnas_pc) || RECORRIDO_COLUMNAS.pc)),
    movil: Math.max(1, Math.min(3, Number(r.columnas_movil) || RECORRIDO_COLUMNAS.movil))
  };
};
const TarjetaRecorrido = ({
  stand,
  visitado,
  valoracion,
  titulos
}) => {
  const logo = urlImagen(stand.logo);
  const inicial = (stand.nombre || "?").trim().charAt(0).toUpperCase();
  return React.createElement("a", {
    href: "/festival/" + stand.id,
    "data-route": true,
    "aria-label": `${stand.nombre}, ${stand.municipio}${visitado ? " — visitado" : " — sin visitar"}`,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      padding: 14,
      textDecoration: "none",
      color: "inherit",
      border: visitado ? "1px solid var(--line-2)" : "1px dashed var(--line-2)",
      borderRadius: "var(--r-md)",
      background: visitado ? "var(--paper)" : "transparent",
      filter: visitado ? "none" : "grayscale(1)",
      opacity: visitado ? 1 : 0.55,
      transition: "opacity 0.2s, filter 0.2s",
      minWidth: 0
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      minWidth: 0
    }
  }, React.createElement("div", {
    style: {
      width: 44,
      height: 44,
      borderRadius: "50%",
      flexShrink: 0,
      overflow: "hidden",
      border: "1px solid var(--line-2)",
      background: stand.color || "var(--grano)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, logo ? React.createElement("img", {
    src: logo,
    alt: "",
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  }) : React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontSize: 20,
      color: "var(--paper)"
    }
  }, inicial)), React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 500,
      lineHeight: 1.2,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, stand.nombre), React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 9,
      color: "var(--ink-3)",
      marginTop: 2
    }
  }, stand.municipio))), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 3
    }
  }, ESTRELLA_CAMPOS.map(campo => {
    const clave = ESTRELLA_CLAVES[campo];
    const mia = valoracion ? valoracion[clave] : null;
    const media = (stand.estrellas || {})[clave];
    return React.createElement(EstrellasLectura, {
      key: campo,
      etiqueta: titulos[campo],
      valor: mia != null ? mia : media,
      tam: 12
    });
  })), React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 9,
      color: visitado ? "var(--cafeto)" : "var(--ink-3)"
    }
  }, visitado ? "✓ Sellado" : "Sin sellar"));
};
const RecorridoPage = ({
  stands
}) => {
  const [pasaporte, setPasaporte] = React.useState(null);
  const [cargando, setCargando] = React.useState(true);
  const [cols, setCols] = React.useState(columnasConfiguradas);
  const [titulos, setTitulos] = React.useState(() => window.titulosEstrellas());
  React.useEffect(() => {
    const refrescar = () => {
      setCols(columnasConfiguradas());
      setTitulos(window.titulosEstrellas());
    };
    window.addEventListener("lmt:festival", refrescar);
    return () => window.removeEventListener("lmt:festival", refrescar);
  }, []);
  const correo = React.useMemo(() => {
    try {
      return localStorage.getItem("lmt.email") || "";
    } catch (_) {
      return "";
    }
  }, []);
  React.useEffect(() => {
    if (!correo) {
      setCargando(false);
      return;
    }
    let cancelado = false;
    const intentar = async () => {
      if (cancelado || !window.LMTApi || !window.LMTApi.enabled) return;
      try {
        const g = window.LMTPerfil && window.LMTPerfil.leer() || {};
        const t = g.correo === correo.toLowerCase() ? g.token : "";
        const res = await window.LMTApi.getPasaporte(correo, t);
        if (!cancelado) setPasaporte(res);
      } catch (_) {} finally {
        if (!cancelado) setCargando(false);
      }
    };
    intentar();
    window.addEventListener("lmt:auth", intentar);
    return () => {
      cancelado = true;
      window.removeEventListener("lmt:auth", intentar);
    };
  }, [correo]);
  const visitados = pasaporte && pasaporte.visitados || [];
  const misEstrellas = pasaporte && pasaporte.estrellas_mias || {};
  const setVisitados = React.useMemo(() => new Set(visitados), [visitados]);
  const ordenados = React.useMemo(() => {
    const copia = [...stands];
    copia.sort((a, b) => {
      const va = setVisitados.has(a.id) ? 0 : 1;
      const vb = setVisitados.has(b.id) ? 0 : 1;
      return va !== vb ? va - vb : a.nombre.localeCompare(b.nombre, "es");
    });
    return copia;
  }, [stands, setVisitados]);
  return React.createElement("div", {
    style: {
      minHeight: "100dvh",
      background: "var(--paper)"
    }
  }, React.createElement(PublicHeader, null), React.createElement("section", {
    className: "seccion",
    style: {
      paddingTop: 28,
      paddingBottom: 40
    }
  }, React.createElement("div", {
    className: "mono"
  }, "Mi recorrido"), React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontSize: "min(56px, 11vw)",
      fontWeight: 400,
      margin: "6px 0 8px",
      lineHeight: 1
    }
  }, "Los stands del festival."), React.createElement("p", {
    style: {
      fontSize: 14,
      color: "var(--ink-2)",
      lineHeight: 1.6,
      maxWidth: 560
    }
  }, correo ? React.createElement(React.Fragment, null, "Llevas ", React.createElement("strong", {
    style: {
      fontWeight: 500
    }
  }, visitados.length, " de ", stands.length), " sellados. Los que est\xE1n a color ya los visitaste.") : React.createElement(React.Fragment, null, "Escanea el QR de cualquier stand y vota: a partir de ah\xED, los que visites se van encendiendo aqu\xED.")), cargando && correo && React.createElement("p", {
    className: "mono",
    style: {
      marginTop: 20,
      color: "var(--ink-3)"
    }
  }, "Cargando tu recorrido\u2026"), React.createElement("div", {
    className: "recorrido-grid",
    style: {
      marginTop: 22,
      "--cols-pc": cols.pc,
      "--cols-movil": cols.movil
    }
  }, ordenados.map(s => React.createElement(TarjetaRecorrido, {
    key: s.id,
    stand: s,
    titulos: titulos,
    visitado: setVisitados.has(s.id),
    valoracion: misEstrellas[s.id] || null
  }))), !stands.length && React.createElement("p", {
    style: {
      marginTop: 24,
      color: "var(--ink-2)"
    }
  }, "Todav\xEDa no hay stands registrados.")));
};
Object.assign(window, {
  RecorridoPage,
  TarjetaRecorrido
});
})();

/* components/Promotores.jsx */
(function () {
const ESTADO_ETIQUETA = {
  pendiente: {
    texto: "Pendiente",
    color: "var(--meh)"
  },
  verificado: {
    texto: "Verificado",
    color: "var(--cafeto)"
  },
  activo: {
    texto: "Activo",
    color: "var(--good)"
  },
  rechazado: {
    texto: "Rechazado",
    color: "var(--bad)"
  },
  suspendido: {
    texto: "Suspendido",
    color: "var(--ink-3)"
  }
};
const EstadoPill = ({
  estado
}) => {
  const e = ESTADO_ETIQUETA[estado] || {
    texto: estado,
    color: "var(--ink-3)"
  };
  return React.createElement("span", {
    className: "mono",
    style: {
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: 999,
      border: `1px solid ${e.color}`,
      color: e.color,
      fontSize: 10
    }
  }, e.texto);
};
const ACCESOS = [{
  id: "password",
  titulo: "Una contraseña que yo elija",
  nota: "Lo más seguro si vas a recordarla.",
  etiqueta: "Tu contraseña",
  tipo: "password",
  ayuda: "Mínimo 8 caracteres."
}, {
  id: "documento",
  titulo: "La fecha de expedición de mi cédula",
  nota: "No hay que recordar nada nuevo: está impresa en tu documento.",
  etiqueta: "Fecha de expedición del documento",
  tipo: "date",
  ayuda: "La que aparece en tu cédula. Con eso entrarás al portal.",
  debil: true
}, {
  id: "telefono",
  titulo: "Mi número de teléfono",
  nota: "El mismo que usas siempre. Se pide dos veces para evitar erratas.",
  etiqueta: "Número de teléfono",
  tipo: "tel",
  etiqueta2: "Repite el número",
  ayuda: "Sin espacios ni guiones, como prefieras: da igual.",
  debil: true
}, {
  id: "qr",
  titulo: "Un código QR que guardo en el celular",
  nota: "El sistema genera uno único. Guárdalo: es la forma más segura si no usas correo."
}];
const ACCESO_FRASE = {
  password: "la contraseña que elegiste",
  documento: "la fecha de expedición de tu documento",
  telefono: "tu número de teléfono",
  qr: "el código QR que guardaste"
};
const qrUrlAcceso = (correo, token) => {
  const base = (window.LMT_BASE_URL || location.origin + (window.LMT_BASE_PATH || "")).replace(/\/$/, "");
  return base + "/promotor?correo=" + encodeURIComponent(correo) + "&acceso=" + encodeURIComponent(token);
};
const SelectorAcceso = ({
  metodo,
  valor,
  valor2,
  onMetodo,
  onValor,
  onValor2
}) => {
  const sel = ACCESOS.find(a => a.id === metodo) || ACCESOS[0];
  return React.createElement(React.Fragment, null, React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "in-acceso"
  }, "\xBFC\xF3mo quieres entrar al portal? *"), React.createElement("select", {
    id: "in-acceso",
    value: metodo,
    onChange: e => onMetodo(e.target.value)
  }, ACCESOS.map(a => React.createElement("option", {
    key: a.id,
    value: a.id
  }, a.titulo))), React.createElement("span", {
    className: "ayuda"
  }, sel.nota)), sel.tipo && React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "in-acceso-valor"
  }, sel.etiqueta, " *"), React.createElement("input", {
    id: "in-acceso-valor",
    type: sel.tipo,
    value: valor,
    required: true,
    maxLength: sel.tipo === "tel" ? 32 : 128,
    inputMode: sel.tipo === "tel" ? "tel" : undefined,
    autoComplete: sel.id === "password" ? "new-password" : "off",
    onChange: e => onValor(e.target.value)
  }), React.createElement("span", {
    className: "ayuda"
  }, sel.ayuda)), sel.etiqueta2 && React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "in-acceso-valor2"
  }, sel.etiqueta2, " *"), React.createElement("input", {
    id: "in-acceso-valor2",
    type: sel.tipo,
    value: valor2,
    required: true,
    maxLength: 32,
    inputMode: "tel",
    autoComplete: "off",
    onChange: e => onValor2(e.target.value)
  }), valor && valor2 && valor.replace(/\D/g, "") !== valor2.replace(/\D/g, "") && React.createElement("span", {
    className: "ayuda",
    style: {
      color: "var(--bad)"
    }
  }, "Los dos n\xFAmeros no coinciden.")), sel.id === "qr" && React.createElement("p", {
    className: "ayuda"
  }, "Al enviar la solicitud te mostraremos tu c\xF3digo. ", React.createElement("strong", {
    style: {
      fontWeight: 500
    }
  }, "Gu\xE1rdalo en ese momento"), ": por seguridad no lo podemos volver a mostrar."), sel.debil && React.createElement("p", {
    className: "ayuda",
    style: {
      color: "var(--meh)"
    }
  }, "Es c\xF3modo de recordar, pero tambi\xE9n m\xE1s f\xE1cil de adivinar que una contrase\xF1a. Cuando entres, el sistema te pedir\xE1 crear una."));
};
const PromotorRegistroPage = () => {
  const vacio = {
    nombre: "",
    email: "",
    telefono: "",
    documento: "",
    municipio: "",
    empresa: "",
    mensaje: "",
    stand_nombre: "",
    stand_region: "",
    stand_direccion: "",
    stand_descripcion: "",
    stand_nit: "",
    stand_sitio_web: "",
    acceso_metodo: "password",
    acceso_valor: "",
    acceso_valor2: ""
  };
  const [form, setForm] = React.useState(vacio);
  const [ubicacion, setUbicacion] = React.useState({
    lat: null,
    lng: null
  });
  const [logo, setLogo] = React.useState("");
  const [acepta, setAcepta] = React.useState(false);
  const [error, setError] = React.useState("");
  const [enviado, setEnviado] = React.useState(false);
  const [qrToken, setQrToken] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const set = (k, v) => setForm(f => ({
    ...f,
    [k]: v
  }));
  const subirLogo = async file => {
    const res = await window.LMTApi.subirLogoInscripcion(file);
    setLogo(res.logo || "");
  };
  const enviar = async e => {
    e.preventDefault();
    setError("");
    const sec = window.LMTSecurity;
    if (!form.nombre.trim()) {
      setError(ERRORES.nombre_invalido);
      return;
    }
    if (!sec || !sec.isEmail(form.email.trim())) {
      setError(ERRORES.email_invalido);
      return;
    }
    if (!form.municipio.trim()) {
      setError("Indica el municipio de tu stand.");
      return;
    }
    if (!acepta) {
      setError(ERRORES.debe_aceptar_tratamiento_datos);
      return;
    }
    if (form.acceso_metodo === "password" && form.acceso_valor.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (form.acceso_metodo === "documento" && !form.acceso_valor) {
      setError("Indica la fecha de expedición de tu documento.");
      return;
    }
    if (form.acceso_metodo === "telefono") {
      const a = form.acceso_valor.replace(/\D/g, ""),
        b2 = form.acceso_valor2.replace(/\D/g, "");
      if (a.length < 7) {
        setError("El número de teléfono no parece válido.");
        return;
      }
      if (a !== b2) {
        setError("Los dos números de teléfono no coinciden.");
        return;
      }
    }
    setBusy(true);
    try {
      const res = await window.LMTApi.promotorRegistro({
        ...form,
        stand_nombre: form.stand_nombre.trim() || form.empresa.trim(),
        email: sec.normalizeEmail(form.email),
        logo: logo || null,
        lat: ubicacion.lat,
        lng: ubicacion.lng,
        acepta_datos: true
      });
      if (res && res.qr_token) setQrToken(res.qr_token);
      setEnviado(true);
    } catch (err) {
      setError(mensajeError(err, "No fue posible enviar tu solicitud."));
    } finally {
      setBusy(false);
    }
  };
  if (enviado) {
    return React.createElement("div", {
      className: "mobile-page"
    }, React.createElement("div", {
      className: "mobile-inner",
      style: {
        textAlign: "center",
        padding: 40
      }
    }, React.createElement("div", {
      className: "mono"
    }, "Solicitud enviada"), React.createElement("h2", {
      style: {
        fontFamily: "var(--font-display)",
        fontStyle: "italic",
        fontSize: 36,
        fontWeight: 400,
        margin: "10px 0 16px",
        lineHeight: 1.05
      }
    }, "Ya qued\xF3", React.createElement("br", null), "registrada."), React.createElement("p", {
      style: {
        color: "var(--ink-2)",
        lineHeight: 1.65,
        marginBottom: 24
      }
    }, "El equipo organizador revisar\xE1 tu inscripci\xF3n. Cuando quede aprobada te llegar\xE1 a ", React.createElement("strong", null, form.email), " el aviso y el", React.createElement("strong", null, " c\xF3digo QR de tu stand"), ", listo para imprimir y pegar en tu puesto.", " ", "Entrar\xE1s al portal con ", ACCESO_FRASE[form.acceso_metodo] || "tu contraseña", "."), qrToken && React.createElement("div", {
      style: {
        border: "2px solid var(--ink)",
        borderRadius: "var(--r-md)",
        padding: 18,
        marginBottom: 24,
        textAlign: "center"
      }
    }, React.createElement("div", {
      className: "mono",
      style: {
        marginBottom: 10
      }
    }, "Tu c\xF3digo de acceso"), React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "center",
        marginBottom: 12
      }
    }, React.createElement(QRCode, {
      value: qrUrlAcceso(form.email, qrToken),
      size: 190
    })), React.createElement("div", {
      className: "mono ruta",
      style: {
        fontSize: 13,
        wordBreak: "break-all",
        padding: "8px 10px",
        background: "var(--paper-2)",
        borderRadius: "var(--r-sm)",
        marginBottom: 12
      }
    }, qrToken), React.createElement("p", {
      style: {
        fontSize: 13,
        color: "var(--ink-2)",
        lineHeight: 1.6,
        margin: 0
      }
    }, React.createElement("strong", null, "Gu\xE1rdalo ahora"), ": hazle una foto o escr\xEDbelo. Por seguridad no lo podemos volver a mostrar. Escanea el c\xF3digo para entrar, o escribe esas letras y n\xFAmeros como contrase\xF1a.")), React.createElement("a", {
      href: "/",
      "data-route": true,
      className: "btn btn-ghost",
      style: {
        justifyContent: "center"
      }
    }, "\u2190 Volver al inicio")));
  }
  return React.createElement("div", {
    className: "mobile-page"
  }, React.createElement("div", {
    className: "mobile-inner"
  }, React.createElement("a", {
    href: "/",
    "data-route": true,
    style: {
      color: "var(--ink-3)",
      fontSize: 13
    }
  }, "\u2190 Volver"), React.createElement("div", {
    className: "mono",
    style: {
      marginTop: 22
    }
  }, "Promotores \xB7 Inscripci\xF3n"), React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontSize: 38,
      fontWeight: 400,
      margin: "6px 0 10px",
      lineHeight: 1.05
    }
  }, "Inscribe tu stand", React.createElement("br", null), "en el festival."), React.createElement("p", {
    style: {
      color: "var(--ink-2)",
      fontSize: 14,
      lineHeight: 1.6,
      marginBottom: 26
    }
  }, "Completa los datos de tu stand. Un organizador revisar\xE1 la solicitud y te enviar\xE1 por correo tu acceso al portal y el c\xF3digo QR de tu stand, ya listo para imprimir."), React.createElement("form", {
    onSubmit: enviar,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 20
    }
  }, React.createElement(BloqueForm, {
    titulo: "Qui\xE9n eres",
    nota: "La persona responsable del stand."
  }, React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "in-nombre"
  }, "Nombre completo del propietario *"), React.createElement("input", {
    id: "in-nombre",
    value: form.nombre,
    onChange: e => set("nombre", e.target.value),
    maxLength: 120,
    required: true,
    autoComplete: "name"
  })), React.createElement("div", {
    className: "grid-2"
  }, React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "in-doc"
  }, "Documento de identidad"), React.createElement("input", {
    id: "in-doc",
    value: form.documento,
    onChange: e => set("documento", e.target.value),
    maxLength: 32,
    inputMode: "numeric"
  }), React.createElement("span", {
    className: "ayuda"
  }, "C\xE9dula del propietario, sin puntos.")), React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "in-tel"
  }, "Tel\xE9fono"), React.createElement("input", {
    id: "in-tel",
    value: form.telefono,
    onChange: e => set("telefono", e.target.value),
    maxLength: 32,
    inputMode: "tel",
    autoComplete: "tel"
  }))), React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "in-email"
  }, "Correo electr\xF3nico *"), React.createElement("input", {
    id: "in-email",
    type: "email",
    value: form.email,
    onChange: e => set("email", e.target.value),
    maxLength: 254,
    required: true,
    autoComplete: "email"
  }), React.createElement("span", {
    className: "ayuda"
  }, "Aqu\xED llegar\xE1n tu contrase\xF1a de acceso y el QR de tu stand."))), React.createElement(BloqueForm, {
    titulo: "Tu stand",
    nota: "Es lo que ver\xE1n los visitantes del festival."
  }, React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "in-empresa"
  }, "Empresa, finca o marca *"), React.createElement("input", {
    id: "in-empresa",
    value: form.empresa,
    onChange: e => set("empresa", e.target.value),
    maxLength: 120,
    required: true,
    placeholder: "Finca El Tambo"
  })), React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "in-stand-nombre"
  }, "Nombre del stand"), React.createElement("input", {
    id: "in-stand-nombre",
    value: form.stand_nombre,
    onChange: e => set("stand_nombre", e.target.value),
    maxLength: 80,
    placeholder: form.empresa || "Igual al de la empresa"
  }), React.createElement("span", {
    className: "ayuda"
  }, "D\xE9jalo vac\xEDo para usar el nombre de la empresa.")), React.createElement("div", {
    className: "grid-2"
  }, React.createElement(SelectorMunicipio, {
    id: "in-mun",
    valor: form.municipio,
    requerido: true,
    onCambio: (municipio, region) => setForm(f => ({
      ...f,
      municipio,
      stand_region: region || f.stand_region
    }))
  }), React.createElement(SelectorSubregion, {
    id: "in-region",
    valor: form.stand_region,
    municipio: form.municipio,
    onCambio: v => set("stand_region", v)
  })), React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "in-dir"
  }, "Direcci\xF3n"), React.createElement("input", {
    id: "in-dir",
    value: form.stand_direccion,
    onChange: e => set("stand_direccion", e.target.value),
    maxLength: 255,
    placeholder: "Vereda El Ingenio"
  })), React.createElement("div", {
    className: "grid-2"
  }, React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "in-nit"
  }, "NIT o RUT"), React.createElement("input", {
    id: "in-nit",
    value: form.stand_nit,
    onChange: e => set("stand_nit", e.target.value),
    maxLength: 32
  }), React.createElement("span", {
    className: "ayuda"
  }, "Si est\xE1s constituido como empresa.")), React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "in-web"
  }, "Sitio web o red social"), React.createElement("input", {
    id: "in-web",
    type: "url",
    value: form.stand_sitio_web,
    onChange: e => set("stand_sitio_web", e.target.value),
    maxLength: 255,
    placeholder: "https://\u2026",
    inputMode: "url"
  }))), React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "in-desc"
  }, "Descripci\xF3n del stand"), React.createElement("textarea", {
    id: "in-desc",
    rows: 3,
    value: form.stand_descripcion,
    onChange: e => set("stand_descripcion", e.target.value),
    maxLength: 800,
    placeholder: "Variedad, proceso, altura, historia de la finca\u2026",
    style: {
      border: "1px solid var(--line-2)",
      borderRadius: "var(--r-md)",
      padding: 12
    }
  }), React.createElement("span", {
    className: "ayuda"
  }, "Se muestra en la ficha p\xFAblica de tu stand.")), React.createElement(SubirImagen, {
    actual: logo ? urlImagen(logo) : "",
    etiqueta: "Logo de tu producto",
    cuadrada: true,
    ruta: logo,
    onSubir: subirLogo
  })), React.createElement(BloqueForm, {
    titulo: "\xBFD\xF3nde est\xE1s?",
    nota: "Toca el mapa de Nari\xF1o donde queda tu finca o tu negocio. Al marcarlo se completa solo el municipio. Es opcional, pero ayuda a los visitantes a encontrarte y al festival a saber de qu\xE9 zonas viene el caf\xE9."
  }, React.createElement(SelectorUbicacion, {
    lat: ubicacion.lat,
    lng: ubicacion.lng,
    municipio: form.municipio,
    alto: 320,
    onCambio: u => {
      setUbicacion({
        lat: u.lat,
        lng: u.lng
      });
      if (u.municipio) setForm(f => ({
        ...f,
        municipio: u.municipio,
        stand_region: subregionDe(u.municipio) || f.stand_region
      }));
    }
  })), React.createElement(BloqueForm, {
    titulo: "C\xF3mo vas a entrar",
    nota: "Por si el correo no llega: con esto entras igual."
  }, React.createElement(SelectorAcceso, {
    metodo: form.acceso_metodo,
    valor: form.acceso_valor,
    valor2: form.acceso_valor2,
    onMetodo: m => setForm(f => ({
      ...f,
      acceso_metodo: m,
      acceso_valor: "",
      acceso_valor2: ""
    })),
    onValor: v => set("acceso_valor", v),
    onValor2: v => set("acceso_valor2", v)
  })), React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "in-msg"
  }, "Mensaje para el organizador (opcional)"), React.createElement("textarea", {
    id: "in-msg",
    rows: 2,
    value: form.mensaje,
    onChange: e => set("mensaje", e.target.value),
    maxLength: 500,
    style: {
      border: "1px solid var(--line-2)",
      borderRadius: "var(--r-md)",
      padding: 12
    }
  })), React.createElement("label", {
    style: {
      display: "flex",
      gap: 10,
      alignItems: "flex-start",
      fontSize: 13,
      color: "var(--ink-2)",
      lineHeight: 1.55
    }
  }, React.createElement("input", {
    type: "checkbox",
    checked: acepta,
    onChange: e => setAcepta(e.target.checked),
    style: {
      marginTop: 3
    }
  }), React.createElement("span", null, "Autorizo a la Gobernaci\xF3n de Nari\xF1o a tratar mis datos personales con la finalidad de gestionar mi participaci\xF3n en el festival, conforme a la Ley 1581 de 2012. *")), React.createElement(Aviso, null, error), React.createElement("button", {
    className: "btn btn-primary",
    type: "submit",
    disabled: busy,
    style: {
      justifyContent: "center",
      padding: 14,
      opacity: busy ? 0.6 : 1
    }
  }, busy ? "Enviando…" : "Enviar solicitud →"), React.createElement("p", {
    className: "mono",
    style: {
      textAlign: "center",
      color: "var(--ink-3)"
    }
  }, "\xBFYa tienes acceso? ", React.createElement("a", {
    href: "/promotor",
    "data-route": true,
    style: {
      color: "var(--grano)"
    }
  }, "Entra aqu\xED")))));
};
const ACCESO_ENTRADA = {
  password: {
    etiqueta: "Contraseña",
    tipo: "password",
    ayuda: ""
  },
  documento: {
    etiqueta: "Fecha de expedición de tu documento",
    tipo: "date",
    ayuda: "La que aparece impresa en tu cédula."
  },
  telefono: {
    etiqueta: "Tu número de teléfono",
    tipo: "tel",
    ayuda: "El mismo que diste al inscribirte."
  },
  qr: {
    etiqueta: "Código de tu QR",
    tipo: "text",
    ayuda: "Escanea el QR que guardaste, o escribe aquí sus 32 caracteres."
  }
};
const PromotorLoginPage = ({
  onEntrar
}) => {
  const url = new URLSearchParams(window.location.search);
  const tokenUrl = (url.get("acceso") || "").trim();
  const [email, setEmail] = React.useState(() => (url.get("correo") || "").trim());
  const [metodo, setMetodo] = React.useState(() => tokenUrl ? "qr" : "password");
  const [password, setPassword] = React.useState(tokenUrl);
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const ent = ACCESO_ENTRADA[metodo] || ACCESO_ENTRADA.password;
  const entrar = React.useCallback(async (correo, credencial, comoEntra) => {
    setError("");
    const sec = window.LMTSecurity;
    if (!sec || !sec.isEmail((correo || "").trim())) {
      setError(ERRORES.email_invalido);
      return;
    }
    if (!credencial) {
      setError("Escribe " + (ACCESO_ENTRADA[comoEntra] || ent).etiqueta.toLowerCase() + ".");
      return;
    }
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
  const yaIntentado = React.useRef(false);
  React.useEffect(() => {
    if (yaIntentado.current || !tokenUrl || !email) return;
    yaIntentado.current = true;
    const t = setTimeout(() => entrar(email, tokenUrl, "qr"), 250);
    return () => clearTimeout(t);
  }, [tokenUrl, email, entrar]);
  return React.createElement("div", {
    className: "mobile-page"
  }, React.createElement("div", {
    className: "mobile-inner"
  }, React.createElement("a", {
    href: "/",
    "data-route": true,
    style: {
      color: "var(--ink-3)",
      fontSize: 13
    }
  }, "\u2190 Volver"), React.createElement("div", {
    className: "mono",
    style: {
      marginTop: 22
    }
  }, "Portal del promotor"), React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontSize: 38,
      fontWeight: 400,
      margin: "6px 0 22px",
      lineHeight: 1.05
    }
  }, "Entra a tu stand."), React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      entrar(email, password, metodo);
    },
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 22
    }
  }, React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "pl-email"
  }, "Usuario (tu correo)"), React.createElement("input", {
    id: "pl-email",
    type: "email",
    value: email,
    onChange: e => setEmail(e.target.value),
    maxLength: 254,
    required: true,
    autoComplete: "username"
  })), React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "pl-metodo"
  }, "\xBFCon qu\xE9 vas a entrar?"), React.createElement("select", {
    id: "pl-metodo",
    value: metodo,
    onChange: e => {
      setMetodo(e.target.value);
      setPassword("");
    }
  }, React.createElement("option", {
    value: "password"
  }, "Mi contrase\xF1a"), React.createElement("option", {
    value: "documento"
  }, "La fecha de expedici\xF3n de mi c\xE9dula"), React.createElement("option", {
    value: "telefono"
  }, "Mi n\xFAmero de tel\xE9fono"), React.createElement("option", {
    value: "qr"
  }, "El c\xF3digo de mi QR")), React.createElement("span", {
    className: "ayuda"
  }, "Lo que elegiste al inscribirte. Si te lleg\xF3 una clave por correo, es \xABMi contrase\xF1a\xBB.")), React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "pl-clave"
  }, ent.etiqueta), React.createElement("input", {
    id: "pl-clave",
    type: ent.tipo,
    value: password,
    onChange: e => setPassword(e.target.value),
    maxLength: 128,
    required: true,
    inputMode: metodo === "telefono" ? "tel" : undefined,
    autoComplete: metodo === "password" ? "current-password" : "off"
  }), ent.ayuda && React.createElement("span", {
    className: "ayuda"
  }, ent.ayuda)), React.createElement(Aviso, null, error), React.createElement("button", {
    className: "btn btn-primary",
    type: "submit",
    disabled: busy,
    style: {
      justifyContent: "center",
      padding: 14,
      opacity: busy ? 0.6 : 1
    }
  }, busy ? "Validando…" : "Entrar →")), React.createElement("p", {
    className: "mono",
    style: {
      textAlign: "center",
      color: "var(--ink-3)",
      marginTop: 24,
      lineHeight: 1.7
    }
  }, "\xBFA\xFAn no te inscribes? ", React.createElement("a", {
    href: "/inscripcion",
    "data-route": true,
    style: {
      color: "var(--grano)"
    }
  }, "Solicita tu acceso"), React.createElement("br", null), "Si perdiste tu acceso, pide al organizador que te d\xE9 uno nuevo.")));
};
const PromotorCambioClave = ({
  onListo
}) => {
  const [actual, setActual] = React.useState("");
  const [nueva, setNueva] = React.useState("");
  const [repetir, setRepetir] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const guardar = async e => {
    e.preventDefault();
    setError("");
    if (nueva !== repetir) {
      setError("Las dos contraseñas nuevas no coinciden.");
      return;
    }
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
  return React.createElement("div", {
    className: "mobile-page"
  }, React.createElement("div", {
    className: "mobile-inner"
  }, React.createElement("div", {
    className: "mono"
  }, "Primer ingreso"), React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontSize: 34,
      fontWeight: 400,
      margin: "6px 0 10px",
      lineHeight: 1.05
    }
  }, "Crea tu contrase\xF1a", React.createElement("br", null), "definitiva."), React.createElement("p", {
    style: {
      color: "var(--ink-2)",
      fontSize: 14,
      lineHeight: 1.6,
      marginBottom: 22
    }
  }, "La contrase\xF1a que te enviamos por correo es temporal. C\xE1mbiala ahora: mientras siga activa, cualquiera con acceso a tu buz\xF3n podr\xEDa entrar en tu nombre."), React.createElement("form", {
    onSubmit: guardar,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 20
    }
  }, React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Contrase\xF1a temporal"), React.createElement("input", {
    type: "password",
    value: actual,
    onChange: e => setActual(e.target.value),
    maxLength: 128,
    required: true,
    autoComplete: "current-password"
  })), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Nueva contrase\xF1a"), React.createElement("input", {
    type: "password",
    value: nueva,
    onChange: e => setNueva(e.target.value),
    maxLength: 128,
    required: true,
    autoComplete: "new-password"
  }), React.createElement("span", {
    className: "mono",
    style: {
      textTransform: "none",
      letterSpacing: 0,
      color: "var(--ink-3)",
      lineHeight: 1.5
    }
  }, "M\xEDnimo 10 caracteres, con al menos tres de: may\xFAsculas, min\xFAsculas, n\xFAmeros y s\xEDmbolos. Sin tu nombre ni tu correo.")), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Repite la nueva contrase\xF1a"), React.createElement("input", {
    type: "password",
    value: repetir,
    onChange: e => setRepetir(e.target.value),
    maxLength: 128,
    required: true,
    autoComplete: "new-password"
  })), React.createElement(Aviso, null, error), React.createElement("button", {
    className: "btn btn-primary",
    type: "submit",
    disabled: busy,
    style: {
      justifyContent: "center",
      padding: 14,
      opacity: busy ? 0.6 : 1
    }
  }, busy ? "Guardando…" : "Guardar y continuar →"))));
};
const ProductoEditor = ({
  producto,
  onGuardar,
  onBorrar,
  onFoto
}) => {
  const vacio = {
    nombre: "",
    variedad: "",
    proceso: "",
    altura_msnm: "",
    notas_cata: "",
    presentacion: "",
    precio: "",
    descripcion: "",
    publicado: true
  };
  const [form, setForm] = React.useState(producto ? {
    ...vacio,
    ...producto,
    altura_msnm: producto.altura_msnm ?? "",
    precio: producto.precio ?? ""
  } : vacio);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [ok, setOk] = React.useState("");
  const set = (k, v) => setForm(f => ({
    ...f,
    [k]: v
  }));
  const esNuevo = !producto;
  const guardar = async () => {
    setError("");
    setOk("");
    setBusy(true);
    try {
      await onGuardar({
        ...form,
        altura_msnm: form.altura_msnm === "" ? null : form.altura_msnm,
        precio: form.precio === "" ? null : form.precio
      });
      setOk(esNuevo ? "Producto agregado." : "Cambios guardados.");
      if (esNuevo) setForm(vacio);
    } catch (err) {
      setError(mensajeError(err, "No fue posible guardar el producto."));
    } finally {
      setBusy(false);
    }
  };
  return React.createElement("div", {
    style: {
      border: "1px solid var(--line)",
      borderRadius: "var(--r-md)",
      padding: 20,
      background: "var(--paper)"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      marginBottom: 16
    }
  }, React.createElement("div", {
    className: "mono"
  }, esNuevo ? "Nuevo producto" : "Producto #" + producto.id), !esNuevo && React.createElement("label", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      fontSize: 12,
      color: "var(--ink-2)"
    }
  }, React.createElement("input", {
    type: "checkbox",
    checked: !!form.publicado,
    onChange: e => set("publicado", e.target.checked)
  }), "visible al p\xFAblico")), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Nombre del producto *"), React.createElement("input", {
    value: form.nombre,
    onChange: e => set("nombre", e.target.value),
    maxLength: 120,
    placeholder: "Caturra lavado"
  })), React.createElement("div", {
    className: "grid-2",
    style: {
      gap: 14
    }
  }, React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Variedad"), React.createElement("input", {
    value: form.variedad || "",
    onChange: e => set("variedad", e.target.value),
    maxLength: 80,
    placeholder: "Caturra"
  })), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Proceso"), React.createElement("input", {
    value: form.proceso || "",
    onChange: e => set("proceso", e.target.value),
    maxLength: 80,
    placeholder: "Lavado"
  }))), React.createElement("div", {
    className: "grid-3",
    style: {
      gap: 14
    }
  }, React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Altura (msnm)"), React.createElement("input", {
    type: "number",
    min: "0",
    max: "6000",
    value: form.altura_msnm,
    onChange: e => set("altura_msnm", e.target.value)
  })), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Presentaci\xF3n"), React.createElement("input", {
    value: form.presentacion || "",
    onChange: e => set("presentacion", e.target.value),
    maxLength: 80,
    placeholder: "Bolsa 250 g"
  })), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Precio (COP)"), React.createElement("input", {
    type: "number",
    min: "0",
    step: "100",
    value: form.precio,
    onChange: e => set("precio", e.target.value)
  }))), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Notas de cata"), React.createElement("input", {
    value: form.notas_cata || "",
    onChange: e => set("notas_cata", e.target.value),
    maxLength: 500,
    placeholder: "Panela, mandarina, cacao"
  })), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Descripci\xF3n"), React.createElement("textarea", {
    rows: 3,
    value: form.descripcion || "",
    onChange: e => set("descripcion", e.target.value),
    maxLength: 1500,
    style: {
      border: "1px solid var(--line-2)",
      borderRadius: "var(--r-md)",
      padding: 12
    }
  })), !esNuevo && React.createElement(SubirImagen, {
    actual: producto.foto,
    etiqueta: "Foto del producto",
    alto: 110,
    onSubir: file => onFoto(producto.id, file)
  }), React.createElement(Aviso, null, error), React.createElement(Aviso, {
    tipo: "ok"
  }, ok), React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      alignItems: "center",
      flexWrap: "wrap"
    }
  }, React.createElement("button", {
    className: "btn btn-primary",
    onClick: guardar,
    disabled: busy,
    style: {
      opacity: busy ? 0.6 : 1
    }
  }, busy ? "Guardando…" : esNuevo ? "+ Agregar producto" : "Guardar cambios"), !esNuevo && React.createElement("button", {
    className: "btn btn-ghost",
    style: {
      borderColor: "var(--bad)",
      color: "var(--bad)"
    },
    onClick: () => {
      if (window.confirm("¿Eliminar «" + (producto.nombre || "este producto") + "»?")) onBorrar(producto.id);
    }
  }, "Eliminar"))));
};
const PromotorPortalPage = ({
  onSalir
}) => {
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
  React.useEffect(() => {
    recargar();
  }, [recargar]);
  if (cargando) return React.createElement("div", {
    className: "mobile-page"
  }, React.createElement("div", {
    className: "mobile-inner"
  }, React.createElement("div", {
    className: "splash"
  }, "Cargando\u2026")));
  if (!datos) {
    return React.createElement("div", {
      className: "mobile-page"
    }, React.createElement("div", {
      className: "mobile-inner",
      style: {
        textAlign: "center",
        padding: 40
      }
    }, React.createElement(Aviso, null, error || "No fue posible cargar tu información."), React.createElement("button", {
      className: "btn btn-ghost",
      style: {
        marginTop: 18
      },
      onClick: onSalir
    }, "Salir")));
  }
  const p = datos.promotor;
  const guardarEmpresa = async body => {
    setDatos(await window.LMTApi.guardarEmpresa(body));
  };
  const subirLogo = async file => {
    setDatos(await window.LMTApi.subirLogo(file));
  };
  const crearProducto = async b => {
    setDatos({
      ...datos,
      productos: await window.LMTApi.crearProducto(b)
    });
  };
  const actualizarProducto = async (id, b) => {
    setDatos({
      ...datos,
      productos: await window.LMTApi.actualizarProducto(id, b)
    });
  };
  const borrarProducto = async id => {
    setDatos({
      ...datos,
      productos: await window.LMTApi.borrarProducto(id)
    });
  };
  const subirFoto = async (id, file) => {
    setDatos({
      ...datos,
      productos: await window.LMTApi.subirFotoProducto(id, file)
    });
  };
  const pestanas = [{
    id: "empresa",
    label: "Mi empresa"
  }, {
    id: "productos",
    label: "Mis productos (" + datos.productos.length + ")"
  }, {
    id: "perfil",
    label: "Mis datos"
  }];
  return React.createElement("div", {
    style: {
      minHeight: "100dvh",
      background: "var(--paper-2)"
    }
  }, React.createElement("header", {
    style: {
      background: "var(--ink)",
      color: "var(--paper)",
      padding: "18px 22px"
    }
  }, React.createElement("div", {
    style: {
      maxWidth: 860,
      margin: "0 auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, React.createElement("div", {
    style: {
      filter: "invert(1)"
    }
  }, React.createElement(LogoTaza, {
    size: 30
  })), React.createElement("div", null, React.createElement("div", {
    className: "mono",
    style: {
      color: "var(--paper-3)"
    }
  }, "Portal del promotor"), React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 500
    }
  }, p.nombre))), React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14
    }
  }, React.createElement(EstadoPill, {
    estado: p.estado
  }), React.createElement("button", {
    onClick: onSalir,
    className: "mono",
    style: {
      color: "var(--paper-3)",
      textDecoration: "underline"
    }
  }, "Cerrar sesi\xF3n")))), React.createElement("div", {
    className: "portal-promotor",
    style: {
      maxWidth: 860,
      margin: "0 auto",
      padding: "0 18px 60px"
    }
  }, React.createElement("nav", {
    style: {
      display: "flex",
      gap: 6,
      borderBottom: "1px solid var(--line)",
      marginBottom: 26,
      overflowX: "auto"
    }
  }, pestanas.map(t => React.createElement("button", {
    key: t.id,
    onClick: () => setPestana(t.id),
    style: {
      padding: "14px 16px",
      fontSize: 14,
      whiteSpace: "nowrap",
      fontWeight: pestana === t.id ? 600 : 400,
      borderBottom: pestana === t.id ? "2px solid var(--grano)" : "2px solid transparent",
      color: pestana === t.id ? "var(--ink)" : "var(--ink-2)"
    }
  }, t.label))), React.createElement(Aviso, null, error), pestana === "empresa" && React.createElement(EmpresaEditor, {
    empresa: datos.empresa,
    logoUrl: urlImagen(datos.empresa && datos.empresa.logo),
    onGuardar: guardarEmpresa,
    onLogo: subirLogo
  }), pestana === "productos" && React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 20
    }
  }, datos.empresa ? React.createElement(ProductoEditor, {
    onGuardar: crearProducto
  }) : React.createElement(Aviso, {
    tipo: "info"
  }, "Guarda primero los datos de tu empresa; despu\xE9s podr\xE1s agregar productos."), datos.productos.map(prod => React.createElement(ProductoEditor, {
    key: prod.id,
    producto: {
      ...prod,
      foto: urlImagen(prod.foto)
    },
    onGuardar: b => actualizarProducto(prod.id, b),
    onBorrar: borrarProducto,
    onFoto: subirFoto
  }))), pestana === "perfil" && React.createElement(PerfilEditor, {
    promotor: p,
    onGuardar: async b => setDatos(await window.LMTApi.guardarPerfilPromotor(b))
  })));
};
const EmpresaEditor = ({
  empresa,
  logoUrl,
  onGuardar,
  onLogo
}) => {
  const vacio = {
    nombre: "",
    nit: "",
    descripcion: "",
    municipio: "",
    direccion: "",
    telefono: "",
    sitio_web: ""
  };
  const [form, setForm] = React.useState({
    ...vacio,
    ...(empresa || {})
  });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [ok, setOk] = React.useState("");
  const set = (k, v) => setForm(f => ({
    ...f,
    [k]: v
  }));
  const guardar = async e => {
    e.preventDefault();
    setError("");
    setOk("");
    setBusy(true);
    try {
      await onGuardar(form);
      setOk("Datos de la empresa guardados.");
    } catch (err) {
      setError(mensajeError(err, "No fue posible guardar la empresa."));
    } finally {
      setBusy(false);
    }
  };
  return React.createElement("form", {
    onSubmit: guardar,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 22,
      maxWidth: 640
    }
  }, React.createElement("div", null, React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontSize: 30,
      fontWeight: 400,
      margin: "0 0 6px"
    }
  }, "Los datos de tu empresa"), React.createElement("p", {
    style: {
      color: "var(--ink-2)",
      fontSize: 14,
      lineHeight: 1.6,
      margin: 0
    }
  }, "Esta informaci\xF3n se muestra a los visitantes del festival junto a tu stand.")), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Nombre de la empresa o finca *"), React.createElement("input", {
    value: form.nombre,
    onChange: e => set("nombre", e.target.value),
    maxLength: 120,
    required: true
  })), React.createElement("div", {
    className: "grid-2"
  }, React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "NIT"), React.createElement("input", {
    value: form.nit || "",
    onChange: e => set("nit", e.target.value),
    maxLength: 32
  })), React.createElement(SelectorMunicipio, {
    id: "emp-mun",
    valor: form.municipio || "",
    requerido: true,
    onCambio: municipio => set("municipio", municipio)
  })), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Direcci\xF3n"), React.createElement("input", {
    value: form.direccion || "",
    onChange: e => set("direccion", e.target.value),
    maxLength: 255
  })), React.createElement("div", {
    className: "grid-2"
  }, React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Tel\xE9fono"), React.createElement("input", {
    value: form.telefono || "",
    onChange: e => set("telefono", e.target.value),
    maxLength: 32,
    inputMode: "tel"
  })), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Sitio web"), React.createElement("input", {
    value: form.sitio_web || "",
    onChange: e => set("sitio_web", e.target.value),
    maxLength: 255,
    placeholder: "https://\u2026"
  }))), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Descripci\xF3n"), React.createElement("textarea", {
    rows: 4,
    value: form.descripcion || "",
    onChange: e => set("descripcion", e.target.value),
    maxLength: 1500,
    placeholder: "Historia de la finca, altura, familias vinculadas\u2026",
    style: {
      border: "1px solid var(--line-2)",
      borderRadius: "var(--r-md)",
      padding: 12
    }
  })), empresa ? React.createElement(SubirImagen, {
    actual: logoUrl,
    etiqueta: "Logo del producto o de la empresa",
    cuadrada: true,
    ruta: empresa && empresa.logo,
    onSubir: onLogo
  }) : React.createElement(Aviso, {
    tipo: "info"
  }, "Guarda los datos y despu\xE9s podr\xE1s subir el logo."), React.createElement(Aviso, null, error), React.createElement(Aviso, {
    tipo: "ok"
  }, ok), React.createElement("button", {
    className: "btn btn-primary",
    type: "submit",
    disabled: busy,
    style: {
      alignSelf: "flex-start",
      opacity: busy ? 0.6 : 1
    }
  }, busy ? "Guardando…" : "Guardar empresa"));
};
const PerfilEditor = ({
  promotor,
  onGuardar
}) => {
  const [form, setForm] = React.useState({
    nombre: promotor.nombre || "",
    telefono: promotor.telefono || "",
    documento: promotor.documento || "",
    municipio: promotor.municipio || ""
  });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [ok, setOk] = React.useState("");
  const set = (k, v) => setForm(f => ({
    ...f,
    [k]: v
  }));
  const guardar = async e => {
    e.preventDefault();
    setError("");
    setOk("");
    setBusy(true);
    try {
      await onGuardar(form);
      setOk("Datos actualizados.");
    } catch (err) {
      setError(mensajeError(err, "No fue posible guardar tus datos."));
    } finally {
      setBusy(false);
    }
  };
  return React.createElement("form", {
    onSubmit: guardar,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 22,
      maxWidth: 520
    }
  }, React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontSize: 30,
      fontWeight: 400,
      margin: 0
    }
  }, "Mis datos"), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Correo (usuario)"), React.createElement("input", {
    value: promotor.email,
    disabled: true,
    style: {
      color: "var(--ink-3)"
    }
  }), React.createElement("span", {
    className: "mono",
    style: {
      textTransform: "none",
      letterSpacing: 0,
      color: "var(--ink-3)"
    }
  }, "El correo no se puede cambiar: es tu usuario de acceso.")), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Nombre completo *"), React.createElement("input", {
    value: form.nombre,
    onChange: e => set("nombre", e.target.value),
    maxLength: 120,
    required: true
  })), React.createElement("div", {
    className: "grid-2"
  }, React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Tel\xE9fono"), React.createElement("input", {
    value: form.telefono,
    onChange: e => set("telefono", e.target.value),
    maxLength: 32,
    inputMode: "tel"
  })), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Documento"), React.createElement("input", {
    value: form.documento,
    onChange: e => set("documento", e.target.value),
    maxLength: 32,
    inputMode: "numeric"
  }))), React.createElement(SelectorMunicipio, {
    id: "pr-mun",
    valor: form.municipio,
    requerido: true,
    onCambio: municipio => set("municipio", municipio)
  }), React.createElement("p", {
    className: "ayuda"
  }, "Tu municipio define la regi\xF3n del stand en el mapa del festival."), React.createElement(Aviso, null, error), React.createElement(Aviso, {
    tipo: "ok"
  }, ok), React.createElement("button", {
    className: "btn btn-primary",
    type: "submit",
    disabled: busy,
    style: {
      alignSelf: "flex-start",
      opacity: busy ? 0.6 : 1
    }
  }, busy ? "Guardando…" : "Guardar"));
};
const PromotorPage = () => {
  const [promotor, setPromotor] = React.useState(() => window.LMTApi && window.LMTApi.promotor() || null);
  const [listo, setListo] = React.useState(() => !!(window.LMTApi && window.LMTApi.bootstrapDone && window.LMTApi.bootstrapDone()));
  React.useEffect(() => {
    const onAuth = () => {
      setPromotor(window.LMTApi && window.LMTApi.promotor() || null);
      setListo(true);
    };
    window.addEventListener("lmt:auth", onAuth);
    const t = setTimeout(() => setListo(true), 1500);
    return () => {
      window.removeEventListener("lmt:auth", onAuth);
      clearTimeout(t);
    };
  }, []);
  const salir = async () => {
    await window.LMTApi.promotorLogout();
    setPromotor(null);
    window.LMTRouter.go("/");
  };
  if (!listo) return React.createElement("div", {
    className: "splash"
  }, "Cargando\u2026");
  if (!promotor) return React.createElement(PromotorLoginPage, {
    onEntrar: setPromotor
  });
  if (promotor.must_change) {
    return React.createElement(PromotorCambioClave, {
      onListo: () => setPromotor(window.LMTApi && window.LMTApi.promotor() || {
        ...promotor,
        must_change: false
      })
    });
  }
  return React.createElement(PromotorPortalPage, {
    onSalir: salir
  });
};
const AdminPromotores = ({
  stands
}) => {
  const [lista, setLista] = React.useState([]);
  const [filtro, setFiltro] = React.useState("");
  const [cargando, setCargando] = React.useState(true);
  const [error, setError] = React.useState("");
  const [aviso, setAviso] = React.useState(null);
  const [ocupado, setOcupado] = React.useState(0);
  const cargar = React.useCallback(async estado => {
    setCargando(true);
    try {
      setLista(await window.LMTApi.listarPromotores(estado));
      setError("");
    } catch (err) {
      setError(mensajeError(err, "No fue posible cargar los promotores."));
    } finally {
      setCargando(false);
    }
  }, []);
  React.useEffect(() => {
    cargar(filtro);
  }, [filtro, cargar]);
  const accion = async (id, fn, exito) => {
    setOcupado(id);
    setAviso(null);
    try {
      const res = await fn();
      await cargar(filtro);
      setAviso(exito(res));
    } catch (err) {
      setAviso({
        tipo: "error",
        texto: mensajeError(err, "No fue posible completar la acción.")
      });
    } finally {
      setOcupado(0);
    }
  };
  const verificar = p => accion(p.id, () => window.LMTApi.verificarPromotor(p.id), res => res.correo_enviado ? {
    tipo: "ok",
    texto: `Verificado. La contraseña temporal salió hacia ${p.email}.`
  } : {
    tipo: "error",
    texto: `Verificado, pero el correo NO pudo enviarse. Entrega esta clave a ${p.email} por un canal seguro: ${res.clave_temporal}`
  });
  const reenviar = p => accion(p.id, () => window.LMTApi.reenviarClave(p.id), res => res.correo_enviado ? {
    tipo: "ok",
    texto: `Nueva contraseña enviada a ${p.email}. La anterior dejó de funcionar.`
  } : {
    tipo: "error",
    texto: `El correo no salió. Clave nueva para ${p.email}: ${res.clave_temporal}`
  });
  const rechazar = p => {
    const motivo = window.prompt("Motivo del rechazo (se enviará al promotor):", "");
    if (motivo === null) return;
    accion(p.id, () => window.LMTApi.rechazarPromotor(p.id, motivo, true), () => ({
      tipo: "ok",
      texto: "Solicitud rechazada."
    }));
  };
  const suspender = p => accion(p.id, () => window.LMTApi.cambiarEstadoPromotor(p.id, p.estado === "suspendido" ? "activo" : "suspendido"), () => ({
    tipo: "ok",
    texto: p.estado === "suspendido" ? "Cuenta reactivada." : "Cuenta suspendida."
  }));
  const vincular = (p, standId) => accion(p.id, () => window.LMTApi.vincularStand(p.id, standId), () => ({
    tipo: "ok",
    texto: standId ? "Promotor vinculado al stand." : "Vínculo con el stand eliminado."
  }));
  const filtros = [{
    id: "",
    label: "Todos"
  }, {
    id: "pendiente",
    label: "Pendientes"
  }, {
    id: "verificado",
    label: "Verificados"
  }, {
    id: "activo",
    label: "Activos"
  }, {
    id: "rechazado",
    label: "Rechazados"
  }];
  const pendientes = lista.filter(p => p.estado === "pendiente").length;
  return React.createElement("div", {
    className: "admin-page"
  }, React.createElement("div", {
    style: {
      marginBottom: 26
    }
  }, React.createElement("div", {
    className: "mono"
  }, "Inscripciones \xB7 ", lista.length, " registros", pendientes ? ` · ${pendientes} por revisar` : ""), React.createElement("h1", {
    className: "titulo-xl"
  }, "Promotores de stands"), React.createElement("p", {
    style: {
      color: "var(--ink-2)",
      fontSize: 14,
      lineHeight: 1.6,
      marginTop: 10,
      maxWidth: 620
    }
  }, "Al verificar una solicitud el sistema genera una contrase\xF1a temporal y la env\xEDa al correo del promotor. S\xF3lo entonces podr\xE1 entrar a cargar su empresa y sus productos.")), React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginBottom: 20,
      flexWrap: "wrap"
    }
  }, filtros.map(f => React.createElement("button", {
    key: f.id,
    onClick: () => setFiltro(f.id),
    className: "btn",
    style: {
      padding: "7px 14px",
      fontSize: 13,
      background: filtro === f.id ? "var(--ink)" : "transparent",
      color: filtro === f.id ? "var(--paper)" : "var(--ink)",
      border: "1px solid " + (filtro === f.id ? "var(--ink)" : "var(--line-2)")
    }
  }, f.label))), aviso && React.createElement(Aviso, {
    tipo: aviso.tipo
  }, aviso.texto), React.createElement(Aviso, null, error), cargando ? React.createElement("div", {
    className: "splash"
  }, "Cargando\u2026") : lista.length === 0 ? React.createElement("div", {
    style: {
      padding: 50,
      border: "1px dashed var(--line-2)",
      borderRadius: "var(--r-md)",
      textAlign: "center",
      color: "var(--ink-3)"
    }
  }, React.createElement("div", {
    className: "mono"
  }, "Sin inscripciones"), React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontSize: 26,
      color: "var(--ink)",
      margin: "8px 0 4px"
    }
  }, "Todav\xEDa nadie se ha inscrito."), React.createElement("div", {
    style: {
      fontSize: 13
    }
  }, "Comparte el enlace ", React.createElement("code", null, "/inscripcion"), " con los caficultores.")) : React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14,
      marginTop: 18
    }
  }, lista.map(p => React.createElement("div", {
    key: p.id,
    style: {
      border: "1px solid var(--line)",
      borderRadius: "var(--r-md)",
      padding: 20,
      background: "var(--paper)"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      gap: 16,
      flexWrap: "wrap",
      alignItems: "flex-start"
    }
  }, React.createElement("div", {
    style: {
      minWidth: 240,
      flex: 1
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      flexWrap: "wrap"
    }
  }, React.createElement("strong", {
    style: {
      fontSize: 16,
      fontWeight: 600
    }
  }, p.nombre), React.createElement(EstadoPill, {
    estado: p.estado
  }), p.must_change && p.estado === "verificado" && React.createElement("span", {
    className: "mono",
    style: {
      color: "var(--meh)"
    }
  }, "clave sin estrenar")), React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--ink-2)",
      marginTop: 6,
      lineHeight: 1.7
    }
  }, p.email, p.telefono ? " · " + p.telefono : "", p.municipio ? " · " + p.municipio : "", p.documento ? " · CC " + p.documento : ""), (p.empresa || p.empresa_tentativa) && React.createElement("div", {
    style: {
      fontSize: 13,
      marginTop: 4
    }
  }, React.createElement("span", {
    className: "mono"
  }, "Empresa"), " ", p.empresa || p.empresa_tentativa, p.productos > 0 ? ` · ${p.productos} producto${p.productos === 1 ? "" : "s"}` : ""), p.mensaje && React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--ink-2)",
      marginTop: 8,
      fontStyle: "italic",
      fontFamily: "var(--font-display)"
    }
  }, "\u201C", p.mensaje, "\u201D"), p.motivo && p.estado === "rechazado" && React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--bad)",
      marginTop: 8
    }
  }, "Motivo: ", p.motivo)), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      alignItems: "stretch",
      minWidth: 200,
      flex: "1 1 200px"
    }
  }, p.estado === "pendiente" && React.createElement("button", {
    className: "btn btn-primary",
    disabled: ocupado === p.id,
    onClick: () => verificar(p),
    style: {
      justifyContent: "center",
      opacity: ocupado === p.id ? 0.6 : 1
    }
  }, ocupado === p.id ? "Enviando…" : "✓ Verificar y enviar clave"), (p.estado === "verificado" || p.estado === "activo") && React.createElement("button", {
    className: "btn btn-ghost",
    disabled: ocupado === p.id,
    onClick: () => reenviar(p),
    style: {
      justifyContent: "center"
    }
  }, "Reenviar contrase\xF1a"), p.estado !== "rechazado" && React.createElement("button", {
    className: "btn btn-ghost",
    disabled: ocupado === p.id,
    onClick: () => rechazar(p),
    style: {
      justifyContent: "center",
      borderColor: "var(--bad)",
      color: "var(--bad)"
    }
  }, "Rechazar"), (p.estado === "activo" || p.estado === "suspendido") && React.createElement("button", {
    className: "btn btn-ghost",
    disabled: ocupado === p.id,
    onClick: () => suspender(p),
    style: {
      justifyContent: "center"
    }
  }, p.estado === "suspendido" ? "Reactivar" : "Suspender"), React.createElement("label", {
    className: "field",
    style: {
      marginTop: 4
    }
  }, React.createElement("span", {
    className: "mono"
  }, "Stand vinculado"), React.createElement("select", {
    value: p.stand_id || "",
    disabled: ocupado === p.id,
    onChange: e => vincular(p, e.target.value),
    style: {
      border: "1px solid var(--line-2)",
      borderRadius: "var(--r-sm)",
      padding: "7px 8px",
      background: "var(--paper)"
    }
  }, React.createElement("option", {
    value: ""
  }, "\u2014 sin vincular \u2014"), (stands || []).map(s => React.createElement("option", {
    key: s.id,
    value: s.id
  }, s.nombre))))))))));
};
const AdminCorreos = () => {
  const [lista, setLista] = React.useState([]);
  const [error, setError] = React.useState("");
  React.useEffect(() => {
    window.LMTApi.listarEmails(50).then(setLista).catch(e => setError(mensajeError(e)));
  }, []);
  const fallidos = lista.filter(e => e.estado === "fallido").length;
  return React.createElement("div", {
    className: "admin-page"
  }, React.createElement("div", {
    className: "mono"
  }, "Correo saliente \xB7 ", lista.length, " env\xEDos"), React.createElement("h1", {
    className: "titulo-xl",
    style: {
      marginBottom: 20
    }
  }, "Bit\xE1cora de correos"), fallidos > 0 && React.createElement(Aviso, null, fallidos, " env\xEDo", fallidos === 1 ? "" : "s", " fallaron. Revisa la secci\xF3n ", React.createElement("code", null, "mail"), " de", React.createElement("code", null, " api/config.php"), ": en hosting compartido suele ser necesario configurar SMTP."), React.createElement(Aviso, null, error), React.createElement("div", {
    className: "tabla-scroll",
    style: {
      border: "1px solid var(--line)",
      borderRadius: "var(--r-md)",
      marginTop: 18,
      background: "var(--paper)"
    }
  }, React.createElement("div", null, React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "150px 1fr 1fr 110px",
      padding: "12px 18px",
      background: "var(--paper-2)",
      borderBottom: "1px solid var(--line)"
    }
  }, ["Fecha", "Destinatario", "Asunto", "Estado"].map(h => React.createElement("div", {
    key: h,
    className: "mono"
  }, h))), lista.map(e => React.createElement("div", {
    key: e.id,
    style: {
      display: "grid",
      gridTemplateColumns: "150px 1fr 1fr 110px",
      padding: "12px 18px",
      borderBottom: "1px solid var(--line)",
      fontSize: 13,
      alignItems: "center"
    }
  }, React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 10
    }
  }, e.created_at), React.createElement("div", {
    style: {
      wordBreak: "break-all"
    }
  }, e.destinatario), React.createElement("div", {
    style: {
      color: "var(--ink-2)"
    }
  }, e.asunto, e.error ? ` — ${e.error}` : ""), React.createElement("div", {
    style: {
      color: e.estado === "enviado" ? "var(--good)" : "var(--bad)",
      fontWeight: 500
    }
  }, e.estado))))));
};
Object.assign(window, {
  PromotorRegistroPage,
  PromotorLoginPage,
  PromotorCambioClave,
  PromotorPortalPage,
  PromotorPage,
  AdminPromotores,
  AdminCorreos,
  EstadoPill
});
})();

/* components/Cuentas.jsx */
(function () {
const ROL_ETIQUETA = {
  propietario: {
    texto: "Propietario",
    color: "var(--galeras)",
    ayuda: "Administra el festival y las cuentas de acceso."
  },
  organizador: {
    texto: "Organizador",
    color: "var(--cafeto)",
    ayuda: "Administra el festival: stands, votos, pasaportes y promotores."
  }
};
const RolPill = ({
  rol
}) => {
  const r = ROL_ETIQUETA[rol] || {
    texto: rol,
    color: "var(--ink-3)"
  };
  return React.createElement("span", {
    className: "mono",
    style: {
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: 999,
      border: `1px solid ${r.color}`,
      color: r.color,
      fontSize: 10
    }
  }, r.texto);
};
const fechaCorta = iso => {
  if (!iso) return "—";
  const d = new Date(String(iso).replace(" ", "T") + (String(iso).endsWith("Z") ? "" : "Z"));
  if (isNaN(d.getTime())) return String(iso).slice(0, 16);
  return d.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }) + " · " + d.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit"
  });
};
const AdminCambioClave = ({
  user
}) => {
  const [actual, setActual] = React.useState("");
  const [nueva, setNueva] = React.useState("");
  const [repetir, setRepetir] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const enviar = async e => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    if (nueva.length < 10) {
      setError("La nueva contraseña debe tener al menos 10 caracteres.");
      return;
    }
    if (nueva !== repetir) {
      setError("Las dos contraseñas nuevas no coinciden.");
      return;
    }
    setBusy(true);
    try {
      await window.LMTApi.cambiarClaveAdmin(actual, nueva);
      window.LMTRouter.go("/admin");
    } catch (err) {
      setError(mensajeError(err, "No fue posible cambiar la contraseña."));
    } finally {
      setBusy(false);
    }
  };
  const salir = async () => {
    if (window.LMTApi && window.LMTApi.enabled) await window.LMTApi.signOutAdmin();
    window.LMTRouter.go("/");
  };
  return React.createElement("div", {
    style: {
      minHeight: "100dvh",
      display: "grid",
      placeItems: "center",
      padding: "24px 16px",
      background: "var(--paper-2)"
    }
  }, React.createElement("form", {
    onSubmit: enviar,
    style: {
      width: "100%",
      maxWidth: 460,
      background: "var(--paper)",
      padding: "28px 24px",
      border: "1px solid var(--line)",
      borderRadius: "var(--r-md)"
    }
  }, React.createElement("div", {
    className: "mono"
  }, "Primer acceso"), React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontWeight: 400,
      fontSize: 32,
      margin: "6px 0 12px",
      lineHeight: 1.1
    }
  }, "Cambia tu contrase\xF1a"), React.createElement("p", {
    style: {
      fontSize: 14,
      color: "var(--ink-2)",
      lineHeight: 1.6,
      margin: "0 0 22px"
    }
  }, "La contrase\xF1a que usaste lleg\xF3 por correo, as\xED que la damos por conocida. Elige una nueva para entrar al panel", user && user.email ? ` como ${user.email}` : "", "."), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 18
    }
  }, React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "cc-actual"
  }, "Contrase\xF1a que te enviamos"), React.createElement("input", {
    id: "cc-actual",
    type: "password",
    autoComplete: "current-password",
    value: actual,
    onChange: e => setActual(e.target.value),
    maxLength: 128,
    required: true
  })), React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "cc-nueva"
  }, "Contrase\xF1a nueva"), React.createElement("input", {
    id: "cc-nueva",
    type: "password",
    autoComplete: "new-password",
    value: nueva,
    onChange: e => setNueva(e.target.value),
    maxLength: 128,
    required: true
  }), React.createElement("span", {
    className: "ayuda"
  }, "M\xEDnimo 10 caracteres, con may\xFAsculas, min\xFAsculas y n\xFAmeros. Evita tu nombre, tu correo y palabras como \xABcaf\xE9\xBB o \xABfestival\xBB.")), React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "cc-repetir"
  }, "Repite la contrase\xF1a nueva"), React.createElement("input", {
    id: "cc-repetir",
    type: "password",
    autoComplete: "new-password",
    value: repetir,
    onChange: e => setRepetir(e.target.value),
    maxLength: 128,
    required: true
  })), React.createElement(Aviso, null, error), React.createElement("button", {
    className: "btn btn-primary",
    type: "submit",
    disabled: busy,
    style: {
      justifyContent: "center",
      padding: 14,
      opacity: busy ? 0.6 : 1
    }
  }, busy ? "Guardando…" : "Guardar y entrar →"), React.createElement("button", {
    type: "button",
    onClick: salir,
    className: "btn btn-ghost",
    style: {
      justifyContent: "center"
    }
  }, "Cerrar sesi\xF3n"))));
};
const AdminCuentas = ({
  user
}) => {
  const [datos, setDatos] = React.useState(null);
  const [cargando, setCargando] = React.useState(true);
  const [error, setError] = React.useState("");
  const [aviso, setAviso] = React.useState(null);
  const [ocupado, setOcupado] = React.useState(0);
  const [abierto, setAbierto] = React.useState(false);
  const [nuevo, setNuevo] = React.useState({
    nombre: "",
    email: "",
    rol: "organizador"
  });
  const [creando, setCreando] = React.useState(false);
  const cargar = React.useCallback(async () => {
    setCargando(true);
    try {
      setDatos(await window.LMTApi.listarAdmins());
      setError("");
    } catch (err) {
      setError(mensajeError(err, "No fue posible cargar las cuentas."));
    } finally {
      setCargando(false);
    }
  }, []);
  React.useEffect(() => {
    cargar();
  }, [cargar]);
  const accion = async (id, fn, exito) => {
    setOcupado(id);
    setAviso(null);
    try {
      const res = await fn();
      await cargar();
      setAviso(exito(res));
    } catch (err) {
      setAviso({
        tipo: "error",
        texto: mensajeError(err, "No fue posible completar la acción.")
      });
    } finally {
      setOcupado(0);
    }
  };
  const crear = async e => {
    if (e && e.preventDefault) e.preventDefault();
    setAviso(null);
    if (!window.LMTSecurity || !window.LMTSecurity.isEmail(nuevo.email)) {
      setAviso({
        tipo: "error",
        texto: "El correo no es válido."
      });
      return;
    }
    if (nuevo.nombre.trim().length < 3) {
      setAviso({
        tipo: "error",
        texto: "Escribe el nombre completo de la persona."
      });
      return;
    }
    setCreando(true);
    try {
      const res = await window.LMTApi.crearAdmin({
        nombre: nuevo.nombre.trim(),
        email: nuevo.email.trim().toLowerCase(),
        rol: nuevo.rol
      });
      setNuevo({
        nombre: "",
        email: "",
        rol: "organizador"
      });
      setAbierto(false);
      await cargar();
      setAviso(res.correo_enviado ? {
        tipo: "ok",
        texto: `Cuenta creada. La contraseña temporal salió hacia ${res.email || nuevo.email}.`
      } : {
        tipo: "error",
        texto: `Cuenta creada, pero el correo NO salió. Entrega esta contraseña en persona: ${res.clave_temporal}`
      });
    } catch (err) {
      setAviso({
        tipo: "error",
        texto: mensajeError(err, "No fue posible crear la cuenta.")
      });
    } finally {
      setCreando(false);
    }
  };
  const cambiarRol = (a, rol) => accion(a.id, () => window.LMTApi.actualizarAdmin(a.id, {
    nombre: a.nombre || a.email,
    rol
  }), () => ({
    tipo: "ok",
    texto: `${a.nombre || a.email} ahora es ${ROL_ETIQUETA[rol].texto.toLowerCase()}.`
  }));
  const alternarActivo = a => accion(a.id, () => window.LMTApi.actualizarAdmin(a.id, {
    nombre: a.nombre || a.email,
    activo: !a.activo
  }), () => ({
    tipo: "ok",
    texto: a.activo ? "Cuenta desactivada: ya no puede entrar." : "Cuenta reactivada."
  }));
  const reponer = a => {
    if (!window.confirm(`Se generará una contraseña nueva para ${a.email} y la actual dejará de funcionar. ¿Continuar?`)) return;
    accion(a.id, () => window.LMTApi.reponerClaveAdmin(a.id), res => res.correo_enviado ? {
      tipo: "ok",
      texto: `Contraseña nueva enviada a ${a.email}.`
    } : {
      tipo: "error",
      texto: `El correo no salió. Contraseña nueva para ${a.email}: ${res.clave_temporal}`
    });
  };
  const eliminar = a => {
    if (!window.confirm(`Eliminar la cuenta de ${a.email}. Esta acción no se puede deshacer. ¿Continuar?`)) return;
    accion(a.id, () => window.LMTApi.borrarAdmin(a.id), () => ({
      tipo: "ok",
      texto: "Cuenta eliminada."
    }));
  };
  const lista = datos && datos.lista || [];
  const yoId = datos && datos.yo && datos.yo.id || user && user.id || 0;
  const propietarios = lista.filter(a => a.rol === "propietario" && a.activo).length;
  return React.createElement("div", {
    className: "admin-page"
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      gap: 12,
      flexWrap: "wrap",
      marginBottom: 24
    }
  }, React.createElement("div", null, React.createElement("div", {
    className: "mono"
  }, "Cuentas \xB7 ", lista.length, " registradas"), React.createElement("h1", {
    className: "titulo-xl"
  }, "Administradores")), React.createElement("button", {
    className: "btn btn-primary",
    onClick: () => setAbierto(v => !v)
  }, abierto ? "Cancelar" : "+ Crear cuenta")), React.createElement("p", {
    style: {
      color: "var(--ink-2)",
      fontSize: 14,
      lineHeight: 1.6,
      margin: "0 0 20px",
      maxWidth: 640
    }
  }, "Al crear una cuenta se genera una contrase\xF1a temporal y se env\xEDa al correo de la persona. El sistema le exige cambiarla la primera vez que entra: hasta entonces no puede ver ni exportar nada."), abierto && React.createElement("form", {
    onSubmit: crear,
    style: {
      border: "1px solid var(--line)",
      borderRadius: "var(--r-md)",
      padding: 20,
      background: "var(--paper)",
      marginBottom: 24
    }
  }, React.createElement("div", {
    className: "mono",
    style: {
      marginBottom: 14
    }
  }, "Nueva cuenta"), React.createElement("div", {
    className: "grid-2",
    style: {
      gap: 16
    }
  }, React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "ac-nombre"
  }, "Nombre completo"), React.createElement("input", {
    id: "ac-nombre",
    value: nuevo.nombre,
    maxLength: 120,
    required: true,
    onChange: e => setNuevo(n => ({
      ...n,
      nombre: e.target.value
    }))
  })), React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "ac-email"
  }, "Correo institucional"), React.createElement("input", {
    id: "ac-email",
    type: "email",
    value: nuevo.email,
    maxLength: 254,
    required: true,
    autoComplete: "off",
    onChange: e => setNuevo(n => ({
      ...n,
      email: e.target.value
    }))
  }), React.createElement("span", {
    className: "ayuda"
  }, "Ah\xED llegar\xE1 la contrase\xF1a temporal."))), React.createElement("div", {
    className: "field",
    style: {
      marginTop: 16,
      maxWidth: 420
    }
  }, React.createElement("label", {
    htmlFor: "ac-rol"
  }, "Perfil"), React.createElement("select", {
    id: "ac-rol",
    value: nuevo.rol,
    onChange: e => setNuevo(n => ({
      ...n,
      rol: e.target.value
    }))
  }, React.createElement("option", {
    value: "organizador"
  }, "Organizador"), React.createElement("option", {
    value: "propietario"
  }, "Propietario")), React.createElement("span", {
    className: "ayuda"
  }, ROL_ETIQUETA[nuevo.rol].ayuda)), React.createElement("button", {
    className: "btn btn-primary",
    type: "submit",
    disabled: creando,
    style: {
      marginTop: 18
    }
  }, creando ? "Creando…" : "Crear y enviar contraseña")), aviso && React.createElement(Aviso, {
    tipo: aviso.tipo
  }, aviso.texto), React.createElement(Aviso, null, error), cargando ? React.createElement("div", {
    className: "splash"
  }, "Cargando\u2026") : React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14,
      marginTop: 18
    }
  }, lista.map(a => {
    const soyYo = a.id === yoId;
    const ultimoPropietario = a.rol === "propietario" && a.activo && propietarios <= 1;
    const bloqueado = ocupado === a.id;
    return React.createElement("div", {
      key: a.id,
      style: {
        border: "1px solid var(--line)",
        borderRadius: "var(--r-md)",
        padding: 20,
        background: "var(--paper)",
        opacity: a.activo ? 1 : 0.62
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
        alignItems: "flex-start"
      }
    }, React.createElement("div", {
      style: {
        minWidth: 220,
        flex: 1
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap"
      }
    }, React.createElement("strong", {
      style: {
        fontSize: 16,
        fontWeight: 600
      }
    }, a.nombre || a.email), React.createElement(RolPill, {
      rol: a.rol
    }), soyYo && React.createElement("span", {
      className: "mono",
      style: {
        color: "var(--ink-3)"
      }
    }, "t\xFA"), !a.activo && React.createElement("span", {
      className: "mono",
      style: {
        color: "var(--bad)"
      }
    }, "desactivada"), a.clave_sin_usar && React.createElement("span", {
      className: "mono",
      style: {
        color: "var(--meh)"
      }
    }, "clave sin estrenar")), React.createElement("div", {
      style: {
        fontSize: 13,
        color: "var(--ink-2)",
        marginTop: 6,
        lineHeight: 1.7,
        wordBreak: "break-word"
      }
    }, a.email), React.createElement("div", {
      className: "mono",
      style: {
        marginTop: 6,
        color: "var(--ink-3)"
      }
    }, "\xDAltimo acceso: ", fechaCorta(a.ultimo_acceso), " \xB7 Alta: ", fechaCorta(a.created_at))), React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        alignItems: "center"
      }
    }, React.createElement("select", {
      value: a.rol,
      disabled: bloqueado || ultimoPropietario,
      title: ultimoPropietario ? "Debe quedar al menos un propietario activo." : "Perfil de la cuenta",
      onChange: e => cambiarRol(a, e.target.value),
      style: {
        padding: "7px 10px",
        fontSize: 13
      }
    }, React.createElement("option", {
      value: "organizador"
    }, "Organizador"), React.createElement("option", {
      value: "propietario"
    }, "Propietario")), React.createElement("button", {
      className: "btn",
      disabled: bloqueado,
      onClick: () => reponer(a),
      style: {
        padding: "7px 14px",
        fontSize: 13
      }
    }, "Reponer contrase\xF1a"), React.createElement("button", {
      className: "btn",
      disabled: bloqueado || ultimoPropietario,
      onClick: () => alternarActivo(a),
      style: {
        padding: "7px 14px",
        fontSize: 13
      }
    }, a.activo ? "Desactivar" : "Reactivar"), React.createElement("button", {
      className: "btn",
      disabled: bloqueado || soyYo || ultimoPropietario,
      onClick: () => eliminar(a),
      title: soyYo ? "No puedes eliminar tu propia cuenta." : "",
      style: {
        padding: "7px 14px",
        fontSize: 13,
        color: soyYo ? "var(--ink-3)" : "var(--bad)"
      }
    }, "Eliminar"))));
  })));
};
Object.assign(window, {
  AdminCuentas,
  AdminCambioClave,
  RolPill
});
})();

/* components/Perfil.jsx */
(function () {
const OTRO_PAIS = "__otro_pais__";
const PERFIL_ETIQUETAS = {
  genero: {
    hombre: "Hombre",
    mujer: "Mujer",
    otro: "Otro",
    prefiero_no_decir: "Prefiero no decir"
  },
  rango_edad: {
    menor_18: "Menor de 18",
    "18_25": "18 a 25",
    "26_35": "26 a 35",
    "36_45": "36 a 45",
    "46_60": "46 a 60",
    mayor_60: "Mayor de 60",
    prefiero_no_decir: "Prefiero no decir"
  },
  tipo_visitante: {
    publica: "Entidad pública",
    privada: "Empresa privada",
    academica: "Institución académica",
    gremio: "Gremio o asociación",
    particular: "A título personal",
    otro: "Otro",
    prefiero_no_decir: "Prefiero no decir"
  },
  grupo_etnico: {
    indigena: "Indígena",
    afrodescendiente: "Negro, afrocolombiano o afrodescendiente",
    raizal: "Raizal del archipiélago",
    palenquero: "Palenquero de San Basilio",
    rrom: "Rrom (gitano)",
    ninguno: "Ninguno",
    prefiero_no_decir: "Prefiero no decir"
  },
  discapacidad: {
    fisica: "Física o motriz",
    visual: "Visual",
    auditiva: "Auditiva",
    intelectual: "Intelectual",
    psicosocial: "Psicosocial",
    multiple: "Múltiple",
    ninguna: "Ninguna",
    prefiero_no_decir: "Prefiero no decir"
  },
  como_se_entero: {
    redes: "Redes sociales",
    radio: "Radio",
    television: "Televisión",
    prensa: "Prensa",
    voz_a_voz: "Un amigo o familiar",
    institucion: "Una institución",
    otro: "Otro medio"
  }
};
const PERFIL_VACIO = {
  nombre: "",
  telefono: "",
  genero: "",
  rango_edad: "",
  pais: "Colombia",
  avatar: "",
  avatar_emoji: "",
  departamento: "",
  municipio: "",
  tipo_visitante: "",
  entidad: "",
  grupo_etnico: "",
  discapacidad: "",
  expectativa: "",
  como_se_entero: "",
  primera_visita: null
};
const CampoOpcion = ({
  id,
  label,
  valor,
  opciones,
  etiquetas,
  ayuda,
  onChange
}) => React.createElement("div", {
  className: "field"
}, React.createElement("label", {
  htmlFor: id
}, label), React.createElement("select", {
  id: id,
  value: valor || "",
  onChange: e => onChange(e.target.value)
}, React.createElement("option", {
  value: ""
}, "Sin responder"), (opciones || []).map(o => React.createElement("option", {
  key: o,
  value: o
}, etiquetas && etiquetas[o] || o))), ayuda && React.createElement("span", {
  className: "ayuda"
}, ayuda));
const AvatarVisitante = ({
  correo,
  token,
  foto,
  emoji,
  emojis,
  onFoto,
  onEmoji,
  onError
}) => {
  const [subiendo, setSubiendo] = React.useState(false);
  const url = urlImagen(foto);
  const subir = async archivo => {
    onError("");
    setSubiendo(true);
    try {
      const r = await window.LMTApi.subirFotoVisitante(correo, token, archivo);
      onFoto(r.avatar || "");
    } catch (e) {
      onError(mensajeError(e, "No fue posible subir la foto."));
    } finally {
      setSubiendo(false);
    }
  };
  const quitar = async () => {
    onError("");
    try {
      await window.LMTApi.borrarFotoVisitante(correo, token);
      onFoto("");
    } catch (e) {
      onError(mensajeError(e, "No fue posible quitar la foto."));
    }
  };
  return React.createElement("div", null, React.createElement("div", {
    style: {
      display: "flex",
      gap: 16,
      alignItems: "center"
    }
  }, React.createElement("div", {
    style: {
      width: 84,
      height: 84,
      flexShrink: 0,
      borderRadius: "50%",
      overflow: "hidden",
      border: "1px solid var(--line-2)",
      background: "var(--paper-2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, url ? React.createElement("img", {
    src: url,
    alt: "Tu foto",
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  }) : React.createElement("span", {
    style: {
      fontSize: 40,
      lineHeight: 1
    },
    "aria-hidden": "true"
  }, emoji || "🙂")), React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, React.createElement("label", {
    className: "btn btn-ghost",
    style: {
      justifyContent: "center",
      cursor: subiendo ? "wait" : "pointer",
      opacity: subiendo ? 0.6 : 1
    }
  }, subiendo ? "Subiendo…" : url ? "Cambiar foto" : "Subir una foto", React.createElement("input", {
    type: "file",
    accept: "image/jpeg,image/png,image/webp",
    hidden: true,
    disabled: subiendo,
    onChange: e => {
      const f = e.target.files && e.target.files[0];
      e.target.value = "";
      if (f) subir(f);
    }
  })), url && React.createElement("button", {
    type: "button",
    onClick: quitar,
    className: "mono",
    style: {
      background: "none",
      border: "none",
      color: "var(--ink-3)",
      textDecoration: "underline",
      cursor: "pointer",
      padding: "6px 0"
    }
  }, "Quitar la foto y usar un emoji"))), !url && React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, React.createElement("div", {
    className: "mono",
    style: {
      color: "var(--ink-3)",
      marginBottom: 8
    }
  }, "O elige un emoji"), React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 6
    }
  }, (emojis || []).map(e => React.createElement("button", {
    key: e,
    type: "button",
    "aria-label": "Elegir " + e,
    "aria-pressed": emoji === e,
    onClick: () => onEmoji(emoji === e ? "" : e),
    style: {
      width: 44,
      height: 44,
      fontSize: 22,
      lineHeight: 1,
      cursor: "pointer",
      borderRadius: "50%",
      background: emoji === e ? "var(--paper-2)" : "transparent",
      border: emoji === e ? "2px solid var(--ink)" : "1px solid var(--line-2)"
    }
  }, e)))), React.createElement("p", {
    className: "ayuda",
    style: {
      marginTop: 12
    }
  }, url ? "Tu foto se ve en tu pasaporte. Puedes quitarla cuando quieras." : "Nada de esto es obligatorio. Si no eliges, tu pasaporte lleva la inicial de tu nombre."));
};
const PerfilSinAcceso = () => {
  const [correo, setCorreo] = React.useState("");
  const [enviado, setEnviado] = React.useState(false);
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const pedir = async e => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    const sec = window.LMTSecurity;
    if (!sec || !sec.isEmail(correo.trim())) {
      setError("Escribe un correo válido.");
      return;
    }
    setBusy(true);
    try {
      await window.LMTApi.pedirEnlacePerfil(sec.normalizeEmail(correo));
      setEnviado(true);
    } catch (err) {
      setError(mensajeError(err, "No fue posible enviar el enlace."));
    } finally {
      setBusy(false);
    }
  };
  return React.createElement("div", {
    className: "mobile-page"
  }, React.createElement("div", {
    className: "mobile-inner"
  }, React.createElement("a", {
    href: "/festival",
    "data-route": true,
    style: {
      color: "var(--ink-3)",
      fontSize: 13
    }
  }, "\u2190 Volver"), React.createElement("div", {
    className: "mono",
    style: {
      marginTop: 22
    }
  }, "Perfil del visitante"), React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontSize: 34,
      fontWeight: 400,
      margin: "6px 0 12px",
      lineHeight: 1.05
    }
  }, "Te enviamos el", React.createElement("br", null), "enlace por correo."), enviado ? React.createElement(React.Fragment, null, React.createElement("p", {
    style: {
      color: "var(--ink-2)",
      fontSize: 14,
      lineHeight: 1.65
    }
  }, "Si ese correo particip\xF3 en el festival, en unos minutos recibir\xE1s un enlace para abrir tu perfil. Revisa tambi\xE9n la carpeta de correo no deseado."), React.createElement("a", {
    href: "/festival",
    "data-route": true,
    className: "btn btn-ghost",
    style: {
      justifyContent: "center",
      marginTop: 22
    }
  }, "Volver al festival")) : React.createElement("form", {
    onSubmit: pedir
  }, React.createElement("p", {
    style: {
      color: "var(--ink-2)",
      fontSize: 14,
      lineHeight: 1.65,
      marginBottom: 22
    }
  }, "Tu perfil se abre desde el tel\xE9fono con el que votaste. Si est\xE1s en otro dispositivo, escribe tu correo y te mandamos el enlace."), React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "pf-correo"
  }, "Tu correo"), React.createElement("input", {
    id: "pf-correo",
    type: "email",
    inputMode: "email",
    autoComplete: "email",
    value: correo,
    onChange: e => setCorreo(e.target.value),
    maxLength: 254,
    required: true
  })), React.createElement(Aviso, null, error), React.createElement("button", {
    className: "btn btn-primary",
    type: "submit",
    disabled: busy,
    style: {
      justifyContent: "center",
      padding: 14,
      width: "100%",
      marginTop: 20
    }
  }, busy ? "Enviando…" : "Enviarme el enlace"))));
};
const PerfilVisitantePage = () => {
  const params = new URLSearchParams(window.location.search);
  const guardado = window.LMTPerfil && window.LMTPerfil.leer() || {
    correo: "",
    token: ""
  };
  const correo = (params.get("correo") || guardado.correo || "").toLowerCase();
  const token = params.get("t") || guardado.token || "";
  const [form, setForm] = React.useState(PERFIL_VACIO);
  const [opciones, setOpciones] = React.useState(null);
  const [emojis, setEmojis] = React.useState([]);
  const [cargando, setCargando] = React.useState(true);
  const [acepta, setAcepta] = React.useState(false);
  const [error, setError] = React.useState("");
  const [ok, setOk] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [existia, setExistia] = React.useState(false);
  const set = (k, v) => setForm(f => ({
    ...f,
    [k]: v
  }));
  React.useEffect(() => {
    if (!correo || !token) {
      setCargando(false);
      return;
    }
    if (window.LMTPerfil) window.LMTPerfil.guardar(correo, token);
    let vivo = true;
    (async () => {
      try {
        const datos = await window.LMTApi.getPerfilVisitante(correo, token);
        if (!vivo) return;
        setOpciones(datos.opciones || null);
        setEmojis(datos.emojis || []);
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
    return () => {
      vivo = false;
    };
  }, [correo, token]);
  const guardar = async e => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    setOk("");
    if (!acepta) {
      setError("Necesitamos tu autorización para guardar estos datos.");
      return;
    }
    setBusy(true);
    try {
      await window.LMTApi.guardarPerfilVisitante(correo, token, Object.assign({}, form, {
        acepta_datos: true
      }));
      setExistia(true);
      setOk("Tus datos quedaron guardados. Gracias por ayudarnos a conocer al público del festival.");
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    } catch (err) {
      setError(mensajeError(err, "No fue posible guardar tus datos."));
    } finally {
      setBusy(false);
    }
  };
  const borrar = async () => {
    if (!window.confirm("Se borrarán todos los datos de tu perfil. Tu voto y tu pasaporte no se tocan. ¿Continuar?")) return;
    setBusy(true);
    setError("");
    setOk("");
    try {
      await window.LMTApi.borrarPerfilVisitante(correo, token);
      setForm(PERFIL_VACIO);
      setExistia(false);
      setAcepta(false);
      setOk("Tus datos fueron borrados.");
    } catch (err) {
      setError(mensajeError(err, "No fue posible borrar tus datos."));
    } finally {
      setBusy(false);
    }
  };
  if (!correo || !token) return React.createElement(PerfilSinAcceso, null);
  if (cargando) return React.createElement(Splash, null);
  const ops = opciones || {};
  return React.createElement("div", {
    className: "mobile-page"
  }, React.createElement("div", {
    className: "mobile-inner"
  }, React.createElement("a", {
    href: "/pasaporte",
    "data-route": true,
    style: {
      color: "var(--ink-3)",
      fontSize: 13
    }
  }, "\u2190 Mi pasaporte"), React.createElement("div", {
    className: "mono",
    style: {
      marginTop: 22
    }
  }, "Perfil del visitante"), React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontSize: 34,
      fontWeight: 400,
      margin: "6px 0 10px",
      lineHeight: 1.05
    }
  }, existia ? "Tus datos." : "Cuéntanos\nquién nos visita."), React.createElement("p", {
    style: {
      color: "var(--ink-2)",
      fontSize: 14,
      lineHeight: 1.65,
      marginBottom: 8
    }
  }, "Con esto sabemos qui\xE9n viene al festival y podemos preparar mejor la pr\xF3xima edici\xF3n.", React.createElement("strong", null, " Ning\xFAn dato es obligatorio"), ": responde s\xF3lo lo que quieras."), React.createElement("p", {
    className: "mono",
    style: {
      color: "var(--ink-3)",
      marginBottom: 24,
      wordBreak: "break-all"
    }
  }, correo), React.createElement(Aviso, {
    tipo: "ok"
  }, ok), React.createElement(Aviso, null, error), React.createElement("form", {
    onSubmit: guardar,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 20,
      marginTop: 8
    }
  }, React.createElement(BloqueForm, {
    titulo: "Tu retrato"
  }, React.createElement(AvatarVisitante, {
    correo: correo,
    token: token,
    foto: form.avatar,
    emoji: form.avatar_emoji,
    emojis: emojis,
    onFoto: url => setForm(f => ({
      ...f,
      avatar: url,
      avatar_emoji: ""
    })),
    onEmoji: e => setForm(f => ({
      ...f,
      avatar_emoji: e
    })),
    onError: setError
  })), React.createElement(BloqueForm, {
    titulo: "Sobre ti"
  }, React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "pf-nombre"
  }, "Nombre"), React.createElement("input", {
    id: "pf-nombre",
    value: form.nombre,
    onChange: e => set("nombre", e.target.value),
    maxLength: 120,
    autoComplete: "name"
  })), React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "pf-tel"
  }, "Tel\xE9fono"), React.createElement("input", {
    id: "pf-tel",
    value: form.telefono,
    onChange: e => set("telefono", e.target.value),
    maxLength: 32,
    inputMode: "tel",
    autoComplete: "tel"
  })), React.createElement(CampoOpcion, {
    id: "pf-genero",
    label: "G\xE9nero",
    valor: form.genero,
    opciones: ops.genero,
    etiquetas: PERFIL_ETIQUETAS.genero,
    onChange: v => set("genero", v)
  }), React.createElement(CampoOpcion, {
    id: "pf-edad",
    label: "Rango de edad",
    valor: form.rango_edad,
    opciones: ops.rango_edad,
    etiquetas: PERFIL_ETIQUETAS.rango_edad,
    onChange: v => set("rango_edad", v)
  })), React.createElement(BloqueForm, {
    titulo: "De d\xF3nde nos visitas"
  }, React.createElement("div", {
    className: "grid-2"
  }, React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "pf-pais"
  }, "Pa\xEDs"), React.createElement("select", {
    id: "pf-pais",
    value: form.pais === "" ? "" : form.pais === "Colombia" ? "Colombia" : OTRO_PAIS,
    onChange: e => setForm(f => ({
      ...f,
      pais: e.target.value === OTRO_PAIS ? "" : e.target.value,
      departamento: "",
      municipio: ""
    }))
  }, React.createElement("option", {
    value: ""
  }, "Selecciona un pa\xEDs"), React.createElement("option", {
    value: "Colombia"
  }, "Colombia"), React.createElement("option", {
    value: OTRO_PAIS
  }, "Otro pa\xEDs"))), form.pais === "Colombia" ? React.createElement(SelectorDepartamento, {
    id: "pf-dep",
    valor: form.departamento,
    onCambio: departamento => setForm(f => ({
      ...f,
      departamento,
      municipio: ""
    }))
  }) : React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "pf-pais-otro"
  }, "\xBFCu\xE1l?"), React.createElement("input", {
    id: "pf-pais-otro",
    value: form.pais,
    maxLength: 80,
    placeholder: "Ecuador",
    onChange: e => set("pais", e.target.value)
  }))), form.pais === "Colombia" && esNarino(form.departamento) ? React.createElement(SelectorMunicipio, {
    id: "pf-mun",
    valor: form.municipio,
    onCambio: municipio => set("municipio", municipio)
  }) : React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "pf-mun-texto"
  }, form.pais === "Colombia" ? "Municipio" : "Ciudad"), React.createElement("input", {
    id: "pf-mun-texto",
    value: form.municipio,
    maxLength: 80,
    disabled: form.pais === "Colombia" && !form.departamento,
    placeholder: form.pais === "Colombia" ? "Cali" : "Quito",
    onChange: e => set("municipio", e.target.value)
  }), React.createElement("span", {
    className: "ayuda"
  }, form.pais === "Colombia" && !form.departamento ? "Elige antes el departamento." : "Escríbelo como se llama; sólo los de Nariño salen de una lista."))), React.createElement(BloqueForm, {
    titulo: "Tu visita"
  }, React.createElement(CampoOpcion, {
    id: "pf-tipo",
    label: "Vienes en representaci\xF3n de",
    valor: form.tipo_visitante,
    opciones: ops.tipo_visitante,
    etiquetas: PERFIL_ETIQUETAS.tipo_visitante,
    onChange: v => set("tipo_visitante", v)
  }), React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "pf-entidad"
  }, "Nombre de la entidad o empresa"), React.createElement("input", {
    id: "pf-entidad",
    value: form.entidad,
    onChange: e => set("entidad", e.target.value),
    maxLength: 120
  }), React.createElement("span", {
    className: "ayuda"
  }, "S\xF3lo si vienes por una instituci\xF3n.")), React.createElement(CampoOpcion, {
    id: "pf-medio",
    label: "\xBFC\xF3mo te enteraste del festival?",
    valor: form.como_se_entero,
    opciones: ops.como_se_entero,
    etiquetas: PERFIL_ETIQUETAS.como_se_entero,
    onChange: v => set("como_se_entero", v)
  }), React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "pf-primera"
  }, "\xBFEs tu primera vez en el festival?"), React.createElement("select", {
    id: "pf-primera",
    value: form.primera_visita === null || form.primera_visita === undefined ? "" : form.primera_visita ? "si" : "no",
    onChange: e => set("primera_visita", e.target.value === "" ? null : e.target.value === "si")
  }, React.createElement("option", {
    value: ""
  }, "Sin responder"), React.createElement("option", {
    value: "si"
  }, "S\xED, es la primera"), React.createElement("option", {
    value: "no"
  }, "Ya hab\xEDa venido"))), React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "pf-exp"
  }, "\xBFQu\xE9 esperas del festival?"), React.createElement("textarea", {
    id: "pf-exp",
    rows: 3,
    value: form.expectativa,
    onChange: e => set("expectativa", e.target.value),
    maxLength: 500,
    style: {
      border: "1px solid var(--line-2)",
      borderRadius: "var(--r-md)",
      padding: 12
    }
  }), React.createElement("span", {
    className: "ayuda"
  }, "Lo leemos: nos sirve para armar la programaci\xF3n."))), React.createElement(BloqueForm, {
    titulo: "Enfoque diferencial",
    nota: "Estas dos preguntas son datos sensibles seg\xFAn la Ley 1581 de 2012. Las hacemos porque la Gobernaci\xF3n debe reportar con enfoque diferencial, y responderlas es siempre voluntario: puedes dejarlas sin responder o elegir \xABPrefiero no decir\xBB."
  }, React.createElement(CampoOpcion, {
    id: "pf-etnia",
    label: "\xBFPerteneces a alg\xFAn grupo \xE9tnico?",
    valor: form.grupo_etnico,
    opciones: ops.grupo_etnico,
    etiquetas: PERFIL_ETIQUETAS.grupo_etnico,
    onChange: v => set("grupo_etnico", v)
  }), React.createElement(CampoOpcion, {
    id: "pf-discapacidad",
    label: "\xBFTienes alguna discapacidad?",
    valor: form.discapacidad,
    opciones: ops.discapacidad,
    etiquetas: PERFIL_ETIQUETAS.discapacidad,
    ayuda: "Nos ayuda a preparar el recinto y la atenci\xF3n.",
    onChange: v => set("discapacidad", v)
  })), React.createElement("label", {
    style: {
      display: "flex",
      gap: 10,
      alignItems: "flex-start",
      fontSize: 13,
      color: "var(--ink-2)",
      lineHeight: 1.55
    }
  }, React.createElement("input", {
    type: "checkbox",
    checked: acepta,
    onChange: e => setAcepta(e.target.checked),
    style: {
      marginTop: 3
    }
  }), React.createElement("span", null, "Autorizo a la Gobernaci\xF3n de Nari\xF1o a tratar estos datos con fines estad\xEDsticos y de caracterizaci\xF3n del p\xFAblico del festival, conforme a la Ley 1581 de 2012. Puedo consultarlos, corregirlos o borrarlos cuando quiera desde esta misma p\xE1gina.")), React.createElement(Aviso, null, error), React.createElement("button", {
    className: "btn btn-primary",
    type: "submit",
    disabled: busy,
    style: {
      justifyContent: "center",
      padding: 14,
      opacity: busy ? 0.6 : 1
    }
  }, busy ? "Guardando…" : existia ? "Guardar cambios" : "Guardar mis datos"), existia && React.createElement("button", {
    type: "button",
    onClick: borrar,
    disabled: busy,
    className: "btn btn-ghost",
    style: {
      justifyContent: "center",
      color: "var(--bad)"
    }
  }, "Borrar mis datos"), React.createElement("a", {
    href: "/pasaporte",
    "data-route": true,
    className: "mono",
    style: {
      textAlign: "center",
      color: "var(--ink-3)",
      marginBottom: 8
    }
  }, "Volver a mi pasaporte"))));
};
Object.assign(window, {
  PerfilVisitantePage,
  PerfilSinAcceso,
  PERFIL_ETIQUETAS,
  AvatarVisitante
});
})();

/* components/Caracterizacion.jsx */
(function () {
const BarraDimension = ({
  filas,
  etiquetas,
  total
}) => {
  if (!filas || filas.length === 0) {
    return React.createElement("p", {
      style: {
        fontSize: 13,
        color: "var(--ink-3)",
        margin: 0
      }
    }, "Nadie ha respondido todav\xEDa.");
  }
  const max = Math.max(...filas.map(f => f.n), 1);
  return React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, filas.map(f => {
    const pct = total > 0 ? Math.round(f.n * 100 / total) : 0;
    return React.createElement("div", {
      key: f.valor
    }, React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        gap: 10,
        fontSize: 13,
        marginBottom: 4
      }
    }, React.createElement("span", {
      style: {
        minWidth: 0
      }
    }, etiquetas && etiquetas[f.valor] || f.valor), React.createElement("span", {
      className: "mono",
      style: {
        flex: "0 0 auto"
      }
    }, f.n, " \xB7 ", pct, "%")), React.createElement("div", {
      style: {
        height: 6,
        borderRadius: 999,
        background: "var(--paper-2)",
        overflow: "hidden"
      }
    }, React.createElement("div", {
      style: {
        width: `${f.n * 100 / max}%`,
        height: "100%",
        background: "var(--grano)"
      }
    })));
  }));
};
const TarjetaDimension = ({
  titulo,
  nota,
  children
}) => React.createElement("div", {
  style: {
    border: "1px solid var(--line)",
    borderRadius: "var(--r-md)",
    padding: 20,
    background: "var(--paper)"
  }
}, React.createElement("div", {
  className: "mono",
  style: {
    marginBottom: nota ? 4 : 14
  }
}, titulo), nota && React.createElement("p", {
  style: {
    fontSize: 12,
    color: "var(--ink-3)",
    lineHeight: 1.5,
    margin: "0 0 14px"
  }
}, nota), children);
const AdminCaracterizacion = () => {
  const [datos, setDatos] = React.useState(null);
  const [expectativas, setExpectativas] = React.useState([]);
  const [error, setError] = React.useState("");
  const [cargando, setCargando] = React.useState(true);
  React.useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const [r, e] = await Promise.all([window.LMTApi.resumenVisitantes(), window.LMTApi.expectativasVisitantes()]);
        if (!vivo) return;
        setDatos(r);
        setExpectativas(e || []);
      } catch (err) {
        if (vivo) setError(mensajeError(err, "No fue posible cargar la caracterización."));
      } finally {
        if (vivo) setCargando(false);
      }
    })();
    return () => {
      vivo = false;
    };
  }, []);
  if (cargando) return React.createElement("div", {
    className: "admin-page"
  }, React.createElement("div", {
    className: "splash"
  }, "Cargando\u2026"));
  const d = datos || {
    total: 0,
    votantes: 0,
    dimensiones: {},
    municipios: [],
    primera_visita: [],
    etiquetas: {}
  };
  const eti = d.etiquetas || {};
  const total = d.total || 0;
  const cobertura = d.votantes > 0 ? Math.round(total * 100 / d.votantes) : 0;
  const csv = window.LMTApi.urlFor("/export/visitantes.csv");
  const primera = (d.primera_visita || []).map(f => ({
    valor: String(f.valor),
    n: f.n
  }));
  return React.createElement("div", {
    className: "admin-page"
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      gap: 12,
      flexWrap: "wrap",
      marginBottom: 22
    }
  }, React.createElement("div", null, React.createElement("div", {
    className: "mono"
  }, "Visitantes \xB7 ", total, " perfiles"), React.createElement("h1", {
    className: "titulo-xl"
  }, "Caracterizaci\xF3n")), React.createElement("a", {
    className: "btn btn-ghost",
    href: csv
  }, "Descargar CSV")), React.createElement("p", {
    style: {
      color: "var(--ink-2)",
      fontSize: 14,
      lineHeight: 1.6,
      margin: "0 0 24px",
      maxWidth: 640
    }
  }, "Lo que los visitantes respondieron por su cuenta despu\xE9s de votar. Todo es voluntario, as\xED que las cifras describen a quien quiso contestar, no al total del p\xFAblico. El CSV lleva datos personales: gu\xE1rdalo donde corresponda y no lo reenv\xEDes por correo."), React.createElement(Aviso, null, error), React.createElement("div", {
    className: "grid-3",
    style: {
      marginBottom: 24
    }
  }, [{
    k: "Perfiles",
    v: total,
    sub: "completados"
  }, {
    k: "Votantes",
    v: d.votantes || 0,
    sub: "correos distintos"
  }, {
    k: "Cobertura",
    v: cobertura + "%",
    sub: "de los votantes"
  }].map(m => React.createElement("div", {
    key: m.k,
    style: {
      padding: 20,
      border: "1px solid var(--line)",
      borderRadius: "var(--r-md)",
      background: "var(--paper)"
    }
  }, React.createElement("div", {
    className: "mono"
  }, m.k), React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 40,
      fontStyle: "italic",
      lineHeight: 1,
      marginTop: 8
    }
  }, m.v), React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--ink-3)",
      marginTop: 4
    }
  }, m.sub)))), total === 0 ? React.createElement("div", {
    style: {
      padding: 50,
      border: "1px dashed var(--line-2)",
      borderRadius: "var(--r-md)",
      textAlign: "center",
      color: "var(--ink-3)"
    }
  }, React.createElement("div", {
    className: "mono"
  }, "Sin perfiles"), React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontSize: 26,
      color: "var(--ink)",
      margin: "8px 0 4px"
    }
  }, "Todav\xEDa nadie ha completado su perfil."), React.createElement("div", {
    style: {
      fontSize: 13
    }
  }, "Se les propone al terminar de votar, y es opcional.")) : React.createElement("div", {
    className: "grid-2",
    style: {
      gap: 18,
      alignItems: "start"
    }
  }, React.createElement(TarjetaDimension, {
    titulo: "G\xE9nero"
  }, React.createElement(BarraDimension, {
    filas: d.dimensiones.genero,
    etiquetas: eti.genero,
    total: total
  })), React.createElement(TarjetaDimension, {
    titulo: "Rango de edad"
  }, React.createElement(BarraDimension, {
    filas: d.dimensiones.rango_edad,
    etiquetas: eti.rango_edad,
    total: total
  })), React.createElement(TarjetaDimension, {
    titulo: "Tipo de visitante"
  }, React.createElement(BarraDimension, {
    filas: d.dimensiones.tipo_visitante,
    etiquetas: eti.tipo_visitante,
    total: total
  })), React.createElement(TarjetaDimension, {
    titulo: "C\xF3mo se enteraron"
  }, React.createElement(BarraDimension, {
    filas: d.dimensiones.como_se_entero,
    etiquetas: eti.como_se_entero,
    total: total
  })), React.createElement(TarjetaDimension, {
    titulo: "Grupo \xE9tnico",
    nota: "Dato sensible, de respuesta voluntaria."
  }, React.createElement(BarraDimension, {
    filas: d.dimensiones.grupo_etnico,
    etiquetas: eti.grupo_etnico,
    total: total
  })), React.createElement(TarjetaDimension, {
    titulo: "Discapacidad",
    nota: "Dato sensible, de respuesta voluntaria."
  }, React.createElement(BarraDimension, {
    filas: d.dimensiones.discapacidad,
    etiquetas: eti.discapacidad,
    total: total
  })), React.createElement(TarjetaDimension, {
    titulo: "Municipio de origen",
    nota: "Los 25 m\xE1s frecuentes."
  }, React.createElement(BarraDimension, {
    filas: d.municipios,
    etiquetas: null,
    total: total
  })), React.createElement(TarjetaDimension, {
    titulo: "Primera visita"
  }, React.createElement(BarraDimension, {
    filas: primera,
    etiquetas: {
      "1": "Es su primera vez",
      "0": "Ya había venido"
    },
    total: total
  }))), expectativas.length > 0 && React.createElement("div", {
    style: {
      marginTop: 28
    }
  }, React.createElement("div", {
    className: "mono",
    style: {
      marginBottom: 12
    }
  }, "Qu\xE9 esperan del festival \xB7 ", expectativas.length, " respuestas"), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, expectativas.map((e, i) => React.createElement("div", {
    key: i,
    style: {
      border: "1px solid var(--line)",
      borderRadius: "var(--r-md)",
      padding: "14px 16px",
      background: "var(--paper)"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 14,
      lineHeight: 1.6
    }
  }, e.texto), React.createElement("div", {
    className: "mono",
    style: {
      marginTop: 6,
      color: "var(--ink-3)"
    }
  }, e.municipio || "sin municipio", " \xB7 ", e.hora))))));
};
Object.assign(window, {
  AdminCaracterizacion
});
})();

/* components/Economia.jsx */
(function () {
const Cifra = ({
  etiqueta,
  valor,
  nota
}) => React.createElement("div", {
  style: {
    padding: 18,
    border: "1px solid var(--line)",
    borderRadius: "var(--r-md)",
    background: "var(--paper)"
  }
}, React.createElement("div", {
  className: "mono",
  style: {
    marginBottom: 6
  }
}, etiqueta), React.createElement("div", {
  style: {
    fontFamily: "var(--font-display)",
    fontSize: 34,
    fontStyle: "italic",
    lineHeight: 1
  }
}, valor), nota && React.createElement("div", {
  className: "mono",
  style: {
    marginTop: 6,
    color: "var(--ink-3)"
  }
}, nota));
const EconomiaPage = () => {
  const [datos, setDatos] = React.useState(null);
  const [error, setError] = React.useState("");
  React.useEffect(() => {
    let cancelado = false;
    const cargar = async () => {
      if (cancelado || !window.LMTApi || !window.LMTApi.enabled) return;
      try {
        const d = await window.LMTApi.economia();
        if (!cancelado) setDatos(d);
      } catch (e) {
        if (!cancelado) setError(mensajeError(e));
      }
    };
    cargar();
    window.addEventListener("lmt:auth", cargar);
    return () => {
      cancelado = true;
      window.removeEventListener("lmt:auth", cargar);
    };
  }, []);
  if (error) return React.createElement(AdminShell, {
    active: "economia"
  }, React.createElement(Aviso, null, error));
  if (!datos) {
    return React.createElement(AdminShell, {
      active: "economia"
    }, React.createElement("p", {
      className: "mono",
      style: {
        color: "var(--ink-3)"
      }
    }, "Cargando\u2026"));
  }
  const t = datos.total;
  const conCompras = datos.stands.filter(s => s.compras > 0);
  const maximo = Math.max(1, ...datos.stands.map(s => s.valor));
  return React.createElement(AdminShell, {
    active: "economia"
  }, React.createElement("div", {
    className: "mono"
  }, "Actividad econ\xF3mica"), React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontSize: 40,
      fontWeight: 400,
      margin: "6px 0 10px",
      lineHeight: 1
    }
  }, "Las compras del festival."), React.createElement("p", {
    style: {
      fontSize: 14,
      color: "var(--ink-2)",
      lineHeight: 1.6,
      maxWidth: 620,
      marginBottom: 22
    }
  }, "Sale de lo que declara el p\xFAblico al votar. No es la facturaci\xF3n del evento: indicar la compra y el importe es voluntario, as\xED que ", React.createElement("strong", {
    style: {
      fontWeight: 500
    }
  }, "lo real siempre es igual o m\xE1s"), ". Sirve para medir la magnitud y comparar stands."), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
      gap: 12
    }
  }, React.createElement(Cifra, {
    etiqueta: "Valor declarado",
    valor: pesos(t.valor),
    nota: `${t.con_valor} compras con importe`
  }), React.createElement(Cifra, {
    etiqueta: "Compras",
    valor: t.compras.toLocaleString("es-CO"),
    nota: `de ${t.votos.toLocaleString("es-CO")} votos`
  }), React.createElement(Cifra, {
    etiqueta: "Conversi\xF3n",
    valor: t.conversion + "%",
    nota: "votantes que compraron"
  }), React.createElement(Cifra, {
    etiqueta: "Compra media",
    valor: pesos(t.ticket),
    nota: "entre las que declararon importe"
  })), React.createElement("div", {
    className: "mono",
    style: {
      margin: "28px 0 12px"
    }
  }, "Por stand"), !conCompras.length && React.createElement("p", {
    style: {
      color: "var(--ink-2)"
    }
  }, "Todav\xEDa no hay compras registradas."), !!conCompras.length && React.createElement("div", {
    className: "tabla-scroll"
  }, React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: 13,
      minWidth: 560
    }
  }, React.createElement("thead", null, React.createElement("tr", {
    style: {
      borderBottom: "1px solid var(--line-2)"
    }
  }, ["Stand", "Compras", "Valor declarado", "Compra media", "Conversión"].map((h, i) => React.createElement("th", {
    key: h,
    className: "mono",
    style: {
      textAlign: i === 0 ? "left" : "right",
      padding: "8px 10px",
      fontWeight: 400
    }
  }, h)))), React.createElement("tbody", null, datos.stands.map(s => React.createElement("tr", {
    key: s.id,
    style: {
      borderBottom: "1px solid var(--line)"
    }
  }, React.createElement("td", {
    style: {
      padding: "10px",
      minWidth: 180
    }
  }, React.createElement("div", {
    style: {
      fontWeight: 500
    }
  }, s.nombre), React.createElement("div", {
    className: "mono",
    style: {
      fontSize: 9,
      color: "var(--ink-3)"
    }
  }, s.municipio), React.createElement("div", {
    style: {
      height: 4,
      marginTop: 6,
      background: "var(--line)",
      borderRadius: 2,
      overflow: "hidden"
    }
  }, React.createElement("div", {
    style: {
      width: s.valor / maximo * 100 + "%",
      height: "100%",
      background: "var(--cafeto)"
    }
  }))), React.createElement("td", {
    style: {
      padding: "10px",
      textAlign: "right"
    }
  }, s.compras), React.createElement("td", {
    style: {
      padding: "10px",
      textAlign: "right",
      fontWeight: 500
    }
  }, pesos(s.valor)), React.createElement("td", {
    style: {
      padding: "10px",
      textAlign: "right",
      color: "var(--ink-2)"
    }
  }, s.ticket ? pesos(s.ticket) : "—"), React.createElement("td", {
    style: {
      padding: "10px",
      textAlign: "right",
      color: "var(--ink-2)"
    }
  }, s.conversion, "%")))))));
};
Object.assign(window, {
  EconomiaPage
});
})();

/* components/Festival.jsx */
(function () {
const FondoRanura = ({
  titulo,
  ayuda,
  url,
  onSubir,
  onQuitar,
  subiendo
}) => React.createElement("div", {
  style: {
    border: "1px solid var(--line-2)",
    borderRadius: "var(--r-md)",
    padding: 14
  }
}, React.createElement("div", {
  className: "mono",
  style: {
    marginBottom: 8
  }
}, titulo), React.createElement("div", {
  style: {
    height: 130,
    borderRadius: "var(--r-sm)",
    overflow: "hidden",
    marginBottom: 10,
    border: "1px dashed var(--line-2)",
    background: "var(--paper-2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }
}, url ? React.createElement("img", {
  src: url,
  alt: "",
  style: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  }
}) : React.createElement("span", {
  className: "mono",
  style: {
    color: "var(--ink-3)",
    textAlign: "center",
    padding: 10
  }
}, "Dise\xF1o del sistema")), ayuda && React.createElement("p", {
  className: "mono",
  style: {
    color: "var(--ink-3)",
    lineHeight: 1.5,
    marginBottom: 8
  }
}, ayuda), React.createElement("div", {
  style: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap"
  }
}, React.createElement("label", {
  className: "btn btn-ghost",
  style: {
    cursor: subiendo ? "wait" : "pointer",
    opacity: subiendo ? 0.6 : 1
  }
}, subiendo ? "Subiendo…" : url ? "Cambiar" : "Subir imagen", React.createElement("input", {
  type: "file",
  accept: "image/jpeg,image/png,image/webp",
  hidden: true,
  disabled: subiendo,
  onChange: e => {
    const f = e.target.files && e.target.files[0];
    e.target.value = "";
    if (f) onSubir(f);
  }
})), url && onQuitar && React.createElement("button", {
  type: "button",
  className: "btn btn-ghost",
  onClick: onQuitar,
  style: {
    color: "var(--bad)"
  }
}, "Quitar")));
const FestivalPage = () => {
  const [aj, setAj] = React.useState(null);
  const [error, setError] = React.useState("");
  const [ok, setOk] = React.useState("");
  const [subiendo, setSubiendo] = React.useState("");
  React.useEffect(() => {
    let cancelado = false;
    const cargar = async () => {
      if (cancelado || !window.LMTApi || !window.LMTApi.enabled) return;
      try {
        const d = await window.LMTApi.festivalAjustes();
        if (!cancelado) setAj(d);
      } catch (e) {
        if (!cancelado) setError(mensajeError(e));
      }
    };
    cargar();
    window.addEventListener("lmt:auth", cargar);
    return () => {
      cancelado = true;
      window.removeEventListener("lmt:auth", cargar);
    };
  }, []);
  if (!aj) {
    return React.createElement(AdminShell, {
      active: "festival"
    }, error ? React.createElement(Aviso, null, error) : React.createElement("p", {
      className: "mono",
      style: {
        color: "var(--ink-3)"
      }
    }, "Cargando\u2026"));
  }
  const guardar = async siguiente => {
    setError("");
    setOk("");
    try {
      const d = await window.LMTApi.guardarFestivalAjustes(siguiente);
      setAj(d);
      if (window.LMTFestival) await window.LMTFestival.cargar();
      setOk("Guardado.");
    } catch (e) {
      setError(mensajeError(e));
    }
  };
  const subirFondo = async (destino, archivo) => {
    setError("");
    setOk("");
    setSubiendo(destino);
    try {
      const d = await window.LMTApi.subirFondoPasaporte(destino, archivo);
      setAj(d);
      if (window.LMTFestival) await window.LMTFestival.cargar();
      setOk("Imagen subida.");
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setSubiendo("");
    }
  };
  const quitarFondo = async (destino, indice) => {
    setError("");
    setOk("");
    try {
      const d = await window.LMTApi.quitarFondoPasaporte(destino, indice);
      setAj(d);
      if (window.LMTFestival) await window.LMTFestival.cargar();
    } catch (e) {
      setError(mensajeError(e));
    }
  };
  const hojas = aj.pasaporte && aj.pasaporte.hojas || [];
  return React.createElement(AdminShell, {
    active: "festival"
  }, React.createElement("div", {
    className: "mono"
  }, "Personalizaci\xF3n"), React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontSize: 40,
      fontWeight: 400,
      margin: "6px 0 10px",
      lineHeight: 1
    }
  }, "C\xF3mo se ve el festival."), React.createElement("p", {
    style: {
      fontSize: 14,
      color: "var(--ink-2)",
      lineHeight: 1.6,
      maxWidth: 620,
      marginBottom: 22
    }
  }, "Todo lo de aqu\xED tiene un valor que ya funciona. Lo que no toques se queda como est\xE1 y el pasaporte conserva su dise\xF1o."), React.createElement(Aviso, null, error), React.createElement(Aviso, {
    tipo: "ok"
  }, ok), React.createElement(BloqueForm, {
    titulo: "Las tres valoraciones del voto"
  }, React.createElement("p", {
    className: "mono",
    style: {
      color: "var(--ink-3)",
      lineHeight: 1.5
    }
  }, "C\xF3mo se llaman las tres estrellas que punt\xFAa el visitante. Cambiar el nombre no toca lo ya votado: sigue siendo la misma valoraci\xF3n."), React.createElement("div", {
    className: "grid-2"
  }, [["innovacion", "Primera"], ["atencion", "Segunda"], ["calidad", "Tercera"]].map(([k, orden]) => React.createElement("div", {
    className: "field",
    key: k
  }, React.createElement("label", {
    htmlFor: "fs-" + k
  }, orden, " valoraci\xF3n"), React.createElement("input", {
    id: "fs-" + k,
    maxLength: 40,
    value: aj.estrellas[k],
    onChange: e => setAj({
      ...aj,
      estrellas: {
        ...aj.estrellas,
        [k]: e.target.value
      }
    })
  }))))), React.createElement(BloqueForm, {
    titulo: "Rejilla de \xABMi recorrido\xBB"
  }, React.createElement("div", {
    className: "grid-2"
  }, [["columnas_pc", "Columnas en computador", 6], ["columnas_movil", "Columnas en móvil", 3]].map(([k, etiqueta, max]) => React.createElement("div", {
    className: "field",
    key: k
  }, React.createElement("label", {
    htmlFor: "fr-" + k
  }, etiqueta), React.createElement("select", {
    id: "fr-" + k,
    value: aj.recorrido[k],
    onChange: e => setAj({
      ...aj,
      recorrido: {
        ...aj.recorrido,
        [k]: Number(e.target.value)
      }
    })
  }, Array.from({
    length: max
  }, (_, i) => i + 1).map(n => React.createElement("option", {
    key: n,
    value: n
  }, n))))))), React.createElement("button", {
    className: "btn btn-primary",
    onClick: () => guardar(aj),
    style: {
      marginBottom: 28
    }
  }, "Guardar t\xEDtulos y columnas"), React.createElement("div", {
    className: "mono",
    style: {
      margin: "8px 0 12px"
    }
  }, "Fondos del pasaporte"), React.createElement("p", {
    style: {
      fontSize: 13,
      color: "var(--ink-2)",
      lineHeight: 1.6,
      maxWidth: 620,
      marginBottom: 16
    }
  }, "Si no subes nada, el pasaporte usa el papel que trae el sistema. Las im\xE1genes se ven ", React.createElement("strong", {
    style: {
      fontWeight: 500
    }
  }, "detr\xE1s del texto"), ", as\xED que conviene que sean claras y sin mucho detalle: una textura, no una foto."), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
      gap: 12,
      marginBottom: 20
    }
  }, React.createElement(FondoRanura, {
    titulo: "Portada",
    url: urlImagen(aj.pasaporte.portada),
    subiendo: subiendo === "portada",
    ayuda: "La tapa del pasaporte. Sobre ella va el nombre del portador en claro.",
    onSubir: f => subirFondo("portada", f),
    onQuitar: () => quitarFondo("portada")
  }), React.createElement(FondoRanura, {
    titulo: "Contraportada",
    url: urlImagen(aj.pasaporte.contraportada),
    subiendo: subiendo === "contraportada",
    ayuda: "La tapa de atr\xE1s, la que cierra el libro.",
    onSubir: f => subirFondo("contraportada", f),
    onQuitar: () => quitarFondo("contraportada")
  })), React.createElement("div", {
    className: "mono",
    style: {
      margin: "20px 0 10px"
    }
  }, "Hojas internas \xB7 ", hojas.length, " ", hojas.length === 1 ? "imagen" : "imágenes"), React.createElement("p", {
    style: {
      fontSize: 13,
      color: "var(--ink-2)",
      lineHeight: 1.6,
      maxWidth: 620,
      marginBottom: 14
    }
  }, "Se reparten en orden por las hojas de dentro. Si hay m\xE1s hojas que im\xE1genes, se repiten desde el principio, as\xED que con dos o tres ya se nota variedad sin que el pasaporte pese."), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
      gap: 10
    }
  }, hojas.map((h, i) => React.createElement("div", {
    key: h + i,
    style: {
      border: "1px solid var(--line-2)",
      borderRadius: "var(--r-sm)",
      overflow: "hidden"
    }
  }, React.createElement("img", {
    src: urlImagen(h),
    alt: "",
    style: {
      width: "100%",
      height: 96,
      objectFit: "cover",
      display: "block"
    }
  }), React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "6px 8px"
    }
  }, React.createElement("span", {
    className: "mono",
    style: {
      color: "var(--ink-3)"
    }
  }, i + 1), React.createElement("button", {
    type: "button",
    onClick: () => quitarFondo("hojas", i),
    className: "mono",
    style: {
      background: "none",
      border: "none",
      color: "var(--bad)",
      cursor: "pointer"
    }
  }, "quitar")))), React.createElement("label", {
    style: {
      border: "1px dashed var(--line-2)",
      borderRadius: "var(--r-sm)",
      minHeight: 128,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: subiendo === "hojas" ? "wait" : "pointer",
      color: "var(--ink-3)"
    },
    className: "mono"
  }, subiendo === "hojas" ? "Subiendo…" : "+ Añadir hoja", React.createElement("input", {
    type: "file",
    accept: "image/jpeg,image/png,image/webp",
    hidden: true,
    disabled: subiendo === "hojas",
    onChange: e => {
      const f = e.target.files && e.target.files[0];
      e.target.value = "";
      if (f) subirFondo("hojas", f);
    }
  }))));
};
Object.assign(window, {
  FestivalPage
});
})();

/* components/Correo.jsx */
(function () {
const CLAVE_OCULTA = "__sin_cambios__";
const NIVEL_COLOR = {
  critico: "var(--bad)",
  alto: "var(--bad)",
  medio: "var(--meh)",
  bajo: "var(--ink-3)"
};
const AvisoDiagnostico = ({
  nivel,
  children
}) => {
  const color = NIVEL_COLOR[nivel] || "var(--ink-2)";
  return React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      alignItems: "flex-start",
      padding: "12px 14px",
      borderRadius: "var(--r-sm)",
      border: `1px solid ${color}`,
      color,
      background: `color-mix(in oklch, ${color} 6%, var(--paper))`,
      fontSize: 13,
      lineHeight: 1.6
    }
  }, React.createElement("span", {
    "aria-hidden": "true",
    style: {
      flex: "0 0 auto",
      fontWeight: 700
    }
  }, nivel === "critico" ? "!" : nivel === "alto" ? "!" : "·"), React.createElement("span", null, children));
};
const TRANSPORTES = [{
  id: "smtp",
  titulo: "SMTP autenticado",
  nota: "Recomendado. El correo sale desde el buzón institucional, autenticado, y no acaba en spam."
}, {
  id: "mail",
  titulo: "Función mail() de PHP",
  nota: "Depende del servidor de correo local del hosting. Da éxito aunque el mensaje se pierda después."
}, {
  id: "log",
  titulo: "Sólo registrar en un archivo",
  nota: "NO envía nada. Sirve para probar plantillas sin molestar a nadie."
}];
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
    } finally {
      setCargando(false);
    }
  }, []);
  React.useEffect(() => {
    cargar();
  }, [cargar]);
  React.useEffect(() => {
    const u = window.LMTApi.user && window.LMTApi.user();
    if (u && u.email && !destino) setDestino(u.email);
  }, [destino]);
  const set = (k, v) => setForm(f => ({
    ...f,
    [k]: v
  }));
  const setSmtp = (k, v) => setForm(f => ({
    ...f,
    smtp: {
      ...f.smtp,
      [k]: v
    }
  }));
  const guardar = async e => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    setOk("");
    setGuardando(true);
    try {
      const d = await window.LMTApi.guardarCorreoConfig(form);
      setDatos(x => ({
        ...x,
        ...d,
        sobrescrito: x ? x.sobrescrito : []
      }));
      setForm(d.config);
      setOk("Configuración guardada. Manda una prueba para confirmar que sale.");
      await cargar();
    } catch (err) {
      setError(mensajeError(err, "No fue posible guardar la configuración."));
    } finally {
      setGuardando(false);
    }
  };
  const restablecer = async () => {
    if (!window.confirm("Se descarta lo configurado desde el panel y vuelve a mandar api/config.php. ¿Continuar?")) return;
    setGuardando(true);
    setError("");
    setOk("");
    try {
      const d = await window.LMTApi.olvidarCorreoConfig();
      setForm(d.config);
      setOk("Se restableció la configuración del archivo.");
      await cargar();
    } catch (err) {
      setError(mensajeError(err, "No fue posible restablecer."));
    } finally {
      setGuardando(false);
    }
  };
  const probar = async () => {
    setResultado(null);
    setError("");
    setProbando(true);
    try {
      setResultado(await window.LMTApi.probarCorreo(destino));
    } catch (err) {
      setError(mensajeError(err, "No fue posible ejecutar la prueba."));
    } finally {
      setProbando(false);
    }
  };
  if (cargando || !form) return React.createElement("div", {
    className: "admin-page"
  }, React.createElement("div", {
    className: "splash"
  }, "Cargando\u2026"));
  const diag = datos && datos.diagnostico || {
    avisos: [],
    historico: []
  };
  const esGmail = /(^|\.)(gmail|googlemail)\.com$/i.test(form.smtp && form.smtp.host || "");
  const sobrescrito = datos && datos.sobrescrito || [];
  return React.createElement("div", {
    className: "admin-page"
  }, React.createElement("div", {
    className: "mono"
  }, "Correo saliente"), React.createElement("h1", {
    className: "titulo-xl"
  }, "Env\xEDo de correo"), React.createElement("p", {
    style: {
      color: "var(--ink-2)",
      fontSize: 14,
      lineHeight: 1.6,
      margin: "10px 0 24px",
      maxWidth: 680
    }
  }, "De aqu\xED salen las contrase\xF1as de los promotores, el QR de su stand y los enlaces del perfil de los visitantes. Si esto no funciona, no funciona la inscripci\xF3n."), diag.avisos.length > 0 && React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      marginBottom: 24
    }
  }, diag.avisos.map((a, i) => React.createElement(AvisoDiagnostico, {
    key: i,
    nivel: a.nivel
  }, a.texto))), React.createElement("div", {
    style: {
      border: "1px solid var(--line)",
      borderRadius: "var(--r-md)",
      padding: 20,
      background: "var(--paper)",
      marginBottom: 24
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      flexWrap: "wrap"
    }
  }, React.createElement("div", {
    className: "mono"
  }, "\xBFEste servidor puede salir a internet por SMTP?"), React.createElement("button", {
    type: "button",
    className: "btn btn-ghost",
    disabled: sondando,
    onClick: async () => {
      setSondando(true);
      setSonda(null);
      try {
        setSonda(await window.LMTApi.correoSonda());
      } catch (e) {
        setError(mensajeError(e));
      } finally {
        setSondando(false);
      }
    }
  }, sondando ? "Probando…" : "Comprobar la salida")), sonda && React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, React.createElement(AvisoDiagnostico, {
    nivel: sonda.veredicto.nivel
  }, React.createElement("strong", {
    style: {
      fontWeight: 500
    }
  }, sonda.veredicto.titulo, "."), " ", sonda.veredicto.texto), React.createElement("div", {
    className: "tabla-scroll",
    style: {
      marginTop: 12
    }
  }, React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: 12
    }
  }, React.createElement("tbody", null, sonda.resultados.map(x => React.createElement("tr", {
    key: x.host + x.puerto,
    style: {
      borderBottom: "1px solid var(--line)"
    }
  }, React.createElement("td", {
    style: {
      padding: "7px 8px",
      width: 26
    }
  }, x.ok ? "✓" : "✗"), React.createElement("td", {
    className: "mono ruta",
    style: {
      padding: "7px 8px",
      whiteSpace: "nowrap"
    }
  }, x.host, ":", x.puerto), React.createElement("td", {
    style: {
      padding: "7px 8px",
      color: "var(--ink-2)"
    }
  }, x.etiqueta), React.createElement("td", {
    style: {
      padding: "7px 8px",
      textAlign: "right",
      color: x.ok ? "var(--good)" : "var(--bad)",
      whiteSpace: "nowrap"
    }
  }, x.ok ? `${x.ms} ms` : `${x.error} (${x.errno})`)))))), React.createElement("p", {
    className: "ayuda",
    style: {
      marginTop: 10
    }
  }, "PHP corre como ", React.createElement("strong", {
    style: {
      fontWeight: 500
    }
  }, sonda.usuario), ". Un rechazo instant\xE1neo (\xABConnection refused\xBB) lo produce este mismo servidor; una espera agotada es un descarte en la red del proveedor."))), React.createElement("div", {
    style: {
      border: "1px solid var(--line)",
      borderRadius: "var(--r-md)",
      padding: 20,
      background: "var(--paper)",
      marginBottom: 24
    }
  }, React.createElement("div", {
    className: "mono",
    style: {
      marginBottom: 12
    }
  }, "Probar el env\xEDo"), React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      flexWrap: "wrap",
      alignItems: "flex-end"
    }
  }, React.createElement("div", {
    className: "field",
    style: {
      flex: 1,
      minWidth: 240
    }
  }, React.createElement("label", {
    htmlFor: "co-destino"
  }, "Mandar un correo de prueba a"), React.createElement("input", {
    id: "co-destino",
    type: "email",
    value: destino,
    onChange: e => setDestino(e.target.value),
    maxLength: 254
  })), React.createElement("button", {
    className: "btn btn-primary",
    onClick: probar,
    disabled: probando || !destino
  }, probando ? "Enviando…" : "Enviar prueba")), resultado && React.createElement("div", {
    style: {
      marginTop: 16
    }
  }, React.createElement(AvisoDiagnostico, {
    nivel: resultado.entregado ? "bajo" : resultado.aceptado ? "medio" : "critico"
  }, React.createElement("strong", null, resultado.entregado ? "El servidor de correo aceptó el mensaje." : resultado.aceptado ? "Aceptado, pero no se entregó a nadie." : "No se pudo enviar."), React.createElement("br", null), resultado.pista), resultado.traza && resultado.traza.length > 0 && React.createElement("details", {
    style: {
      marginTop: 12
    },
    open: !resultado.entregado
  }, React.createElement("summary", {
    className: "mono",
    style: {
      cursor: "pointer"
    }
  }, "Di\xE1logo con el servidor (", resultado.traza.length, " l\xEDneas)"), React.createElement("pre", {
    style: {
      marginTop: 10,
      padding: 12,
      background: "var(--paper-2)",
      borderRadius: "var(--r-sm)",
      border: "1px solid var(--line)",
      fontSize: 12,
      lineHeight: 1.6,
      overflowX: "auto",
      whiteSpace: "pre-wrap",
      wordBreak: "break-word"
    }
  }, resultado.traza.join("\n"))))), React.createElement("form", {
    onSubmit: guardar,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 20
    }
  }, React.createElement(BloqueForm, {
    titulo: "C\xF3mo se env\xEDa"
  }, React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, TRANSPORTES.map(t => React.createElement("label", {
    key: t.id,
    style: {
      display: "flex",
      gap: 12,
      alignItems: "flex-start",
      padding: 12,
      cursor: "pointer",
      border: "1px solid " + (form.transport === t.id ? "var(--ink)" : "var(--line)"),
      borderRadius: "var(--r-md)",
      background: form.transport === t.id ? "var(--paper-2)" : "transparent"
    }
  }, React.createElement("input", {
    type: "radio",
    name: "transporte",
    value: t.id,
    checked: form.transport === t.id,
    onChange: () => set("transport", t.id),
    style: {
      marginTop: 3
    }
  }), React.createElement("span", null, React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: form.transport === t.id ? 600 : 400
    }
  }, t.titulo), React.createElement("span", {
    style: {
      display: "block",
      fontSize: 12,
      color: "var(--ink-3)",
      lineHeight: 1.5,
      marginTop: 2
    }
  }, t.nota)))))), React.createElement(BloqueForm, {
    titulo: "Qui\xE9n firma los mensajes"
  }, React.createElement("div", {
    className: "grid-2"
  }, React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "co-from"
  }, "Direcci\xF3n del remitente"), React.createElement("input", {
    id: "co-from",
    type: "email",
    value: form.from,
    onChange: e => set("from", e.target.value),
    maxLength: 254,
    required: true
  })), React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "co-fromname"
  }, "Nombre visible"), React.createElement("input", {
    id: "co-fromname",
    value: form.from_name,
    onChange: e => set("from_name", e.target.value),
    maxLength: 80
  }))), React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "co-replyto"
  }, "Responder a (opcional)"), React.createElement("input", {
    id: "co-replyto",
    type: "email",
    value: form.reply_to,
    onChange: e => set("reply_to", e.target.value),
    maxLength: 254
  }), React.createElement("span", {
    className: "ayuda"
  }, "Si un promotor contesta, su respuesta ir\xE1 a esta direcci\xF3n."))), form.transport === "smtp" && React.createElement(BloqueForm, {
    titulo: "Servidor SMTP",
    nota: "P\xEDdeselos a quien administra el correo institucional."
  }, React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap",
      alignItems: "center"
    }
  }, [{
    t: "Gmail · 587 TLS",
    h: "smtp.gmail.com",
    p: 587,
    s: "tls",
    usaCorreo: true
  }, {
    t: "Gmail · 465 SSL",
    h: "smtp.gmail.com",
    p: 465,
    s: "ssl",
    usaCorreo: true
  }, {
    t: "Servidor local · 25",
    h: "127.0.0.1",
    p: 25,
    s: "",
    usaCorreo: false
  }].map(o => React.createElement("button", {
    key: o.t,
    type: "button",
    className: "btn btn-ghost",
    style: {
      fontSize: 13,
      padding: "8px 14px"
    },
    onClick: () => setForm(f => ({
      ...f,
      smtp: {
        ...f.smtp,
        host: o.h,
        port: o.p,
        secure: o.s,
        user: o.usaCorreo ? f.from || f.smtp.user : ""
      }
    }))
  }, o.t))), React.createElement("span", {
    className: "ayuda"
  }, "El buz\xF3n institucional funciona sobre Gmail. Si la salida est\xE1 cerrada, \xABServidor local\xBB entrega por el correo de esta misma m\xE1quina."), React.createElement("div", {
    className: "grid-2"
  }, React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "co-host"
  }, "Servidor"), React.createElement("input", {
    id: "co-host",
    value: form.smtp.host,
    onChange: e => setSmtp("host", e.target.value),
    maxLength: 253,
    placeholder: "smtp.narino.gov.co"
  })), React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "co-port"
  }, "Puerto"), React.createElement("input", {
    id: "co-port",
    type: "number",
    min: "1",
    max: "65535",
    value: form.smtp.port,
    onChange: e => setSmtp("port", parseInt(e.target.value, 10) || 587)
  }), React.createElement("span", {
    className: "ayuda"
  }, "587 con TLS, o 465 con SSL."))), React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "co-secure"
  }, "Cifrado"), React.createElement("select", {
    id: "co-secure",
    value: form.smtp.secure,
    onChange: e => setSmtp("secure", e.target.value)
  }, React.createElement("option", {
    value: "tls"
  }, "STARTTLS (puerto 587)"), React.createElement("option", {
    value: "ssl"
  }, "SSL directo (puerto 465)"), React.createElement("option", {
    value: ""
  }, "Sin cifrar \u2014 s\xF3lo para un servidor de la propia red"))), React.createElement("div", {
    className: "grid-2"
  }, React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "co-user"
  }, "Usuario del buz\xF3n"), React.createElement("input", {
    id: "co-user",
    value: form.smtp.user,
    onChange: e => setSmtp("user", e.target.value),
    maxLength: 254,
    autoComplete: "off"
  }), esGmail && form.smtp.user && form.from && form.smtp.user.toLowerCase() !== form.from.toLowerCase() && React.createElement("span", {
    className: "ayuda",
    style: {
      color: "var(--bad)"
    }
  }, "Debe ser la misma direcci\xF3n que el remitente, o Gmail reescribir\xE1 el correo a nombre de este buz\xF3n.")), React.createElement("div", {
    className: "field"
  }, React.createElement("label", {
    htmlFor: "co-pass"
  }, "Contrase\xF1a del buz\xF3n"), React.createElement("input", {
    id: "co-pass",
    type: "password",
    autoComplete: "new-password",
    value: form.smtp.password === CLAVE_OCULTA ? "" : form.smtp.password,
    placeholder: form.smtp.password === CLAVE_OCULTA ? "Guardada — escribe sólo si la cambias" : "",
    onChange: e => setSmtp("password", e.target.value === "" ? CLAVE_OCULTA : e.target.value),
    maxLength: 200
  }), React.createElement("span", {
    className: "ayuda"
  }, "Se guarda cifrada y no vuelve a mostrarse.", esGmail && React.createElement(React.Fragment, null, " ", React.createElement("strong", null, "En Gmail no sirve la contrase\xF1a de la cuenta"), ": crea una \xABcontrase\xF1a de aplicaci\xF3n\xBB de 16 caracteres en cuenta de Google \u2192 Seguridad \u2192 Verificaci\xF3n en dos pasos \u2192 Contrase\xF1as de aplicaciones."))))), React.createElement(Aviso, {
    tipo: "ok"
  }, ok), React.createElement(Aviso, null, error), React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap"
    }
  }, React.createElement("button", {
    className: "btn btn-primary",
    type: "submit",
    disabled: guardando
  }, guardando ? "Guardando…" : "Guardar configuración"), sobrescrito.length > 0 && React.createElement("button", {
    type: "button",
    className: "btn btn-ghost",
    onClick: restablecer,
    disabled: guardando
  }, "Volver a la del archivo")), React.createElement("p", {
    className: "mono",
    style: {
      color: "var(--ink-3)",
      lineHeight: 1.7
    }
  }, sobrescrito.length > 0 ? "Esta configuración está guardada en la base de datos y pisa a la de api/config.php." : "Ahora mismo manda la configuración de api/config.php.")), diag.historico && diag.historico.length > 0 && React.createElement("div", {
    style: {
      marginTop: 28
    }
  }, React.createElement("div", {
    className: "mono",
    style: {
      marginBottom: 10
    }
  }, "Lo enviado hasta ahora"), React.createElement("div", {
    className: "tabla-scroll",
    style: {
      border: "1px solid var(--line)",
      borderRadius: "var(--r-md)",
      background: "var(--paper)"
    }
  }, React.createElement("div", null, React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 80px",
      padding: "10px 16px",
      borderBottom: "1px solid var(--line)",
      background: "var(--paper-2)"
    }
  }, ["Transporte", "Resultado", "Mensajes"].map(h => React.createElement("div", {
    key: h,
    className: "mono"
  }, h))), diag.historico.map((h, i) => React.createElement("div", {
    key: i,
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 80px",
      padding: "12px 16px",
      borderTop: i ? "1px solid var(--line)" : "none",
      fontSize: 13
    }
  }, React.createElement("div", null, h.transporte), React.createElement("div", {
    style: {
      color: h.estado === "enviado" ? h.transporte === "log" ? "var(--meh)" : "var(--good)" : "var(--bad)"
    }
  }, h.transporte === "log" && h.estado === "enviado" ? "sólo registrado, no salió" : h.estado), React.createElement("div", {
    className: "mono"
  }, h.n))))), React.createElement("p", {
    style: {
      marginTop: 12
    }
  }, React.createElement("a", {
    href: "/admin/correos",
    "data-route": true,
    style: {
      fontSize: 13,
      color: "var(--grano)"
    }
  }, "Ver la bit\xE1cora mensaje a mensaje \u2192"))));
};
Object.assign(window, {
  AdminCorreoConfig
});
})();

/* components/App.jsx */
(function () {
const PALETTES = {
  "nariño": {
    grano: "oklch(0.42 0.09 50)",
    galeras: "oklch(0.55 0.13 30)",
    cafeto: "oklch(0.5 0.08 145)",
    paper: "oklch(0.97 0.015 75)",
    ink: "oklch(0.22 0.02 60)"
  },
  "mercado": {
    grano: "oklch(0.4 0.12 30)",
    galeras: "oklch(0.6 0.17 45)",
    cafeto: "oklch(0.55 0.11 130)",
    paper: "oklch(0.96 0.025 80)",
    ink: "oklch(0.22 0.03 50)"
  }
};
const applyPalette = name => {
  const p = PALETTES[name] || PALETTES["mercado"];
  const r = document.documentElement.style;
  Object.entries(p).forEach(([k, v]) => r.setProperty("--" + k, v));
};
applyPalette("mercado");
const App = () => {
  const [route, setRoute] = React.useState(() => window.LMTRouter.current());
  const [user, setUser] = React.useState(() => window.LMTApi && window.LMTApi.user() || null);
  const [ready, setReady] = React.useState(() => !!(window.LMTApi && window.LMTApi.bootstrapDone && window.LMTApi.bootstrapDone()));
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    const off1 = window.LMTRouter.subscribe(setRoute);
    const onAuth = () => {
      setUser(window.LMTApi && window.LMTApi.user() || null);
      setReady(true);
    };
    window.addEventListener("lmt:auth", onAuth);
    const onData = () => setTick(t => t + 1);
    window.addEventListener("lmt:data", onData);
    const t = setTimeout(() => setReady(true), 1500);
    return () => {
      off1();
      window.removeEventListener("lmt:auth", onAuth);
      window.removeEventListener("lmt:data", onData);
      clearTimeout(t);
    };
  }, []);
  const stands = window.STANDS_DATA || [];
  const comentarios = window.COMENTARIOS_DEMO || [];
  if (!ready && route.path.startsWith("/admin") && route.path !== "/admin/login") {
    return React.createElement(Splash, null);
  }
  if (route.path.startsWith("/admin") && route.path !== "/admin/login") {
    if (!user || !user.admin) {
      window.LMTRouter.go("/admin/login");
      return null;
    }
    if (user.must_change) return React.createElement(AdminCambioClave, {
      user: user
    });
  }
  if (route.path === "/" || route.path === "") {
    return React.createElement(LoginAdmin, {
      onLogin: () => window.LMTRouter.go("/admin"),
      onVisitor: () => window.LMTRouter.go("/festival")
    });
  }
  if (route.path === "/festival" || route.path === "/festival/") {
    return React.createElement(PublicDashboard, {
      stands: stands,
      comentarios: comentarios,
      onDetail: id => window.LMTRouter.go("/festival/" + id)
    });
  }
  const festivalMatch = route.path.match(/^\/festival\/([a-z0-9\-]+)$/);
  if (festivalMatch) {
    const stand = stands.find(s => s.id === festivalMatch[1]);
    if (!stand) return React.createElement(NotFound, {
      back: "/festival"
    });
    return React.createElement(PublicDetail, {
      stand: stand,
      comentarios: comentarios,
      allStands: stands,
      onBack: () => window.LMTRouter.go("/festival"),
      onVote: () => window.LMTRouter.go("/s/" + stand.id)
    });
  }
  const voteMatch = route.path.match(/^\/s\/([a-z0-9\-]+)$/);
  if (voteMatch) {
    const stand = stands.find(s => s.id === voteMatch[1]);
    if (!stand) {
      if (!stands.length) return React.createElement(Splash, null);
      return React.createElement(NotFound, {
        back: "/"
      });
    }
    return React.createElement(MobileVotePage, {
      stand: stand
    });
  }
  if (route.path === "/recorrido" || route.path === "/recorrido/") {
    return React.createElement(RecorridoPage, {
      stands: stands
    });
  }
  if (route.path === "/pasaporte") {
    return React.createElement(PassportPage, {
      stands: stands
    });
  }
  if (route.path === "/inscripcion" || route.path === "/inscripcion/") {
    return React.createElement(PromotorRegistroPage, null);
  }
  if (route.path === "/promotor" || route.path === "/promotor/") {
    return React.createElement(PromotorPage, null);
  }
  if (route.path === "/perfil" || route.path === "/perfil/") {
    return React.createElement(PerfilVisitantePage, null);
  }
  if (route.path === "/admin/login") {
    return React.createElement(LoginAdmin, {
      onLogin: () => window.LMTRouter.go("/admin")
    });
  }
  if (route.path === "/admin" || route.path === "/admin/stands") {
    return React.createElement(AdminPage, {
      section: "stands",
      user: user,
      stands: stands
    });
  }
  if (route.path === "/admin/stands/new") {
    return React.createElement(AdminPage, {
      section: "editor",
      user: user,
      stands: stands,
      editingId: null
    });
  }
  const editMatch = route.path.match(/^\/admin\/stands\/([a-z0-9\-]+)\/edit$/);
  if (editMatch) {
    return React.createElement(AdminPage, {
      section: "editor",
      user: user,
      stands: stands,
      editingId: editMatch[1]
    });
  }
  if (route.path === "/admin/qr") {
    return React.createElement(AdminPage, {
      section: "qr",
      user: user,
      stands: stands
    });
  }
  if (route.path === "/admin/live") {
    return React.createElement(AdminPage, {
      section: "live",
      user: user,
      stands: stands,
      comentarios: comentarios
    });
  }
  if (route.path === "/admin/promotores") {
    return React.createElement(AdminPage, {
      section: "promotores",
      user: user,
      stands: stands
    });
  }
  if (route.path === "/admin/correos") {
    return React.createElement(AdminPage, {
      section: "correos",
      user: user,
      stands: stands
    });
  }
  if (route.path === "/admin/correo") {
    return React.createElement(AdminPage, {
      section: "correo",
      user: user,
      stands: stands
    });
  }
  if (route.path === "/admin/economia") {
    return React.createElement(EconomiaPage, null);
  }
  if (route.path === "/admin/festival") {
    return React.createElement(FestivalPage, null);
  }
  if (route.path === "/admin/caracterizacion") {
    return React.createElement(AdminPage, {
      section: "caracterizacion",
      user: user,
      stands: stands
    });
  }
  if (route.path === "/admin/cuentas") {
    if (user.rol !== "propietario") return React.createElement(NotFound, {
      back: "/admin"
    });
    return React.createElement(AdminPage, {
      section: "cuentas",
      user: user,
      stands: stands
    });
  }
  return React.createElement(NotFound, {
    back: "/"
  });
};
const Splash = () => React.createElement("div", {
  className: "splash"
}, "Cargando\u2026");
const NotFound = ({
  back
}) => React.createElement("div", {
  style: {
    minHeight: "100dvh",
    display: "grid",
    placeItems: "center",
    padding: 24,
    textAlign: "center",
    background: "var(--paper)"
  }
}, React.createElement("div", null, React.createElement("div", {
  className: "mono"
}, "404"), React.createElement("h1", {
  style: {
    fontFamily: "var(--font-display)",
    fontStyle: "italic",
    fontSize: 56,
    margin: "12px 0",
    lineHeight: 1
  }
}, "P\xE1gina no encontrada."), React.createElement("a", {
  href: back,
  "data-route": true,
  className: "btn btn-primary"
}, "\u2190 Volver al inicio")));
window.NotFound = NotFound;
window.Splash = Splash;
const waitForGlobals = () => {
  const needed = ["LoginAdmin", "AdminPage", "MobileVotePage", "PassportPage", "PublicDashboard", "PublicDetail", "PromotorRegistroPage", "PromotorPage", "AdminPromotores", "AdminCuentas", "AdminCambioClave", "PerfilVisitantePage", "AdminCaracterizacion", "AdminCorreoConfig"];
  if (needed.every(k => window[k])) {
    ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App, null));
  } else {
    setTimeout(waitForGlobals, 40);
  }
};
waitForGlobals();
})();
