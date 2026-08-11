// GENERADO POR tools/build-components.mjs — NO EDITAR A MANO.
// Fuente: components/Shared.jsx, components/Admin.jsx, components/QRPrint.jsx, components/VoteFlow.jsx, components/Passport.jsx, components/Dashboard.jsx, components/Promotores.jsx, components/App.jsx
// Regenerar tras tocar cualquier .jsx:  node tools/build-components.mjs
// Huella de las fuentes: 171d649d49f3319a
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
    fontSize: 10,
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
  bg = "#ffffff"
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
    loading: "lazy"
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
  standUrl
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
    id: "correos",
    label: "Correos",
    sub: "Bitácora",
    path: "/admin/correos"
  }];
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
  }, user ? user.email : "—"), React.createElement("button", {
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
  }, "La Mejor Taza \xB7 Admin")), React.createElement("div", null, React.createElement("h1", {
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
  }, "Registra los stands del festival, genera c\xF3digos QR para cada uno y sigue en tiempo real la votaci\xF3n de los visitantes.")), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      alignItems: "flex-start"
    }
  }, React.createElement("button", {
    type: "button",
    onClick: onVisitor || (() => window.LMTRouter.go("/festival")),
    className: "btn",
    style: {
      background: "var(--paper)",
      color: "var(--ink)",
      padding: "12px 20px"
    }
  }, "Entrar como visitante \u2192"), React.createElement("span", {
    className: "mono",
    style: {
      color: "var(--paper-3)"
    }
  }, "Ver stands, ranking y votaci\xF3n del festival"), React.createElement("div", {
    style: {
      height: 1,
      background: "var(--paper-3)",
      opacity: 0.25,
      width: "100%",
      margin: "12px 0 4px"
    }
  }), React.createElement("span", {
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
  }, "Ya tengo acceso \u2192")))), React.createElement("form", {
    onSubmit: handleLogin,
    className: "split-form"
  }, React.createElement("div", {
    className: "mono"
  }, "Acceso \xB7 Organizadores"), React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontStyle: "italic",
      fontSize: 40,
      fontWeight: 400,
      margin: "8px 0 28px"
    }
  }, "Iniciar sesi\xF3n"), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 22
    }
  }, React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Correo institucional"), React.createElement("input", {
    type: "email",
    autoComplete: "username",
    value: email,
    onChange: e => setEmail(e.target.value),
    maxLength: 254,
    required: true
  })), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Contrase\xF1a"), React.createElement("input", {
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
      marginTop: 6,
      justifyContent: "center",
      padding: 14,
      opacity: busy ? 0.6 : 1
    }
  }, busy ? "Validando…" : "Entrar al panel →"), React.createElement("div", {
    className: "mono",
    style: {
      textAlign: "center",
      color: "var(--ink-3)"
    }
  }, window.LMTApi && window.LMTApi.enabled ? "API conectada" : "API no disponible"))));
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
  const update = (k, v) => setForm(f => ({
    ...f,
    [k]: v
  }));
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
  }, React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Municipio"), React.createElement("input", {
    value: form.municipio,
    onChange: e => update("municipio", e.target.value),
    placeholder: "La Uni\xF3n",
    maxLength: 80,
    required: true
  })), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Regi\xF3n"), React.createElement("input", {
    value: form.region,
    onChange: e => update("region", e.target.value),
    placeholder: "Norte de Nari\xF1o",
    maxLength: 80
  }))), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Direcci\xF3n"), React.createElement("input", {
    value: form.direccion,
    onChange: e => update("direccion", e.target.value),
    maxLength: 255
  })), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Correo de contacto"), React.createElement("input", {
    type: "email",
    value: form.correo,
    onChange: e => update("correo", e.target.value),
    maxLength: 254
  })), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Descripci\xF3n corta"), React.createElement("textarea", {
    value: form.descripcion,
    onChange: e => update("descripcion", e.target.value),
    rows: 3,
    maxLength: 800
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
  variant = "vertical"
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
    bg: "#ffffff"
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
const QRPrintView = ({
  stands
}) => {
  const [selected, setSelected] = React.useState(stands[0] ? stands[0].id : null);
  const [printAll, setPrintAll] = React.useState(false);
  const stand = stands.find(s => s.id === selected) || stands[0];
  React.useEffect(() => {
    if (!printAll) return;
    const t = setTimeout(() => {
      window.print();
      setPrintAll(false);
    }, 250);
    return () => clearTimeout(t);
  }, [printAll]);
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
  }, React.createElement("style", null, `
        @media print {
          @page { size: A5; margin: 0; }
          body { background: #fff !important; }
          .qr-print-screen aside, .qr-print-screen .mono, .qr-print-screen h1, .qr-print-screen .qr-frame, .lmt-admin-aside { display: none !important; }
          .qr-print-screen { padding: 0 !important; }
          .qr-print-page { display: block !important; page-break-after: always; padding: 0; background: #fff; }
          .qr-poster { box-shadow: none !important; border: none !important; transform: none !important; margin: 0 auto; }
          aside, header { display: none !important; }
        }
      `), React.createElement("div", {
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
    onClick: () => window.print(),
    style: {
      width: "100%",
      justifyContent: "center",
      marginBottom: 8
    }
  }, "\uD83D\uDDA8 Imprimir este cartel"), React.createElement("button", {
    className: "btn btn-ghost",
    onClick: () => setPrintAll(true),
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
  }, "Probar URL del QR \u2197"), React.createElement("div", {
    className: "nota-menor",
    style: {
      color: "var(--ink-3)",
      marginTop: 8,
      lineHeight: 1.5
    }
  }, "Cartel A5 \xB7 148 \xD7 210 mm \xB7 Papel offset mate recomendado.", React.createElement("br", null), "Para PDF: imprimir \u2192 \"Guardar como PDF\"."))), React.createElement("div", {
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
  }, printAll ? stands.map(s => React.createElement("div", {
    key: s.id,
    className: "qr-print-page"
  }, React.createElement(QRPoster, {
    stand: s
  }))) : React.createElement(QRPoster, {
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
    texto: ""
  });
  const [needEmail, setNeedEmail] = React.useState(false);
  const [showOpt, setShowOpt] = React.useState(false);
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
        compra: data.compra,
        texto: data.texto
      };
      if (window.LMTApi && window.LMTApi.enabled) {
        await window.LMTApi.submitVote(payload);
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
      marginBottom: 20
    }
  }, "Toca para calificar."), React.createElement("div", {
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
    className: "mono",
    style: {
      marginBottom: 10
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
    onClick: () => update("compra", o.v),
    style: {
      flex: 1,
      padding: 12,
      border: data.compra === o.v ? "2px solid var(--ink)" : "1px solid var(--line-2)",
      borderRadius: "var(--r-md)",
      fontSize: 14,
      fontWeight: 500,
      background: data.compra === o.v ? "var(--paper-2)" : "var(--paper)"
    }
  }, o.l))), React.createElement("div", {
    className: "field",
    style: {
      marginTop: 16
    }
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
  }, "Ver ranking del festival")));
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
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [flipping, setFlipping] = React.useState(false);
  const [askingEmail, setAskingEmail] = React.useState(!email);
  const load = React.useCallback(async correo => {
    setLoading(true);
    setError("");
    try {
      const res = await window.LMTApi.getPasaporte(correo);
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
    nombre: data.nombre || "Visitante",
    correo: data.correo || email,
    inicio: data.inicio || "",
    visitados: visitadosIds
  };
  const pages = [{
    type: "cover"
  }, {
    type: "index"
  }, ...visitados.map(s => ({
    type: "stamp",
    stand: s
  })), {
    type: "end"
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
  const pagesKey = React.useMemo(() => visitadosIds.join(",") + "|" + stands.length, [visitadosIds, stands.length]);
  React.useEffect(() => {
    const cont = wrapRef.current;
    if (!cont || !window.LMTPassportBook || !window.LMTPassportBook.soportado()) return;
    const libro = window.LMTPassportBook.mount(cont, {
      paginas: [{
        tipo: "portada",
        nombre: passport.nombre,
        correo: passport.correo,
        inicio: passport.inicio
      }, {
        tipo: "indice",
        visitados: visitados.length,
        totalSlots: Math.max(8, visitados.length),
        totalStands: stands.length
      }, ...visitados.map((s, i) => ({
        tipo: "sello",
        indice: i,
        stand: s
      })), {
        tipo: "final",
        visitados: visitados.length,
        totalStands: stands.length
      }],
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
  const resumen = actual.type === "stamp" ? `Sello: ${actual.stand.nombre}, ${actual.stand.municipio}` : actual.type === "cover" ? "Portada del pasaporte" : actual.type === "index" ? "Índice de la travesía" : "Fin del pasaporte";
  return React.createElement("div", {
    style: {
      minHeight: "100dvh",
      background: "var(--ink)",
      color: "var(--paper)",
      padding: "16px 16px 28px"
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
      padding: "0 4px",
      color: "var(--paper-3)"
    }
  }, React.createElement("a", {
    href: "/festival",
    "data-route": true,
    style: {
      color: "var(--paper-3)",
      fontSize: 13
    }
  }, "\u2190 Salir"), React.createElement("div", {
    className: "mono",
    style: {
      color: "var(--paper-3)"
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
      fontSize: 12
    }
  }, "Cerrar")), React.createElement("div", {
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
  }, visitados.length, " / ", stands.length, " stands sellados"))));
};
const PassportPage_Page = ({
  pageData,
  passport,
  totalSlots,
  totalStands
}) => {
  const lineBg = {
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
        background: "linear-gradient(135deg, var(--grano) 0%, oklch(0.32 0.08 45) 100%)",
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
    return React.createElement("div", {
      style: {
        height: "100%",
        padding: 22,
        ...lineBg
      }
    }, React.createElement("div", {
      className: "mono",
      style: {
        marginBottom: 6
      }
    }, "\xCDndice"), React.createElement("h2", {
      style: {
        fontFamily: "var(--font-display)",
        fontStyle: "italic",
        fontSize: 28,
        fontWeight: 400,
        margin: "0 0 16px",
        lineHeight: 1
      }
    }, "Tu traves\xEDa."), React.createElement("p", {
      style: {
        fontSize: 12,
        color: "var(--ink-2)",
        marginBottom: 16,
        lineHeight: 1.5
      }
    }, "Cada stand visitado sella una p\xE1gina. Colecci\xF3nalos todos."), React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, [...Array(totalSlots)].map((_, i) => {
      const visitado = i < passport.visitados.length;
      return React.createElement("div", {
        key: i,
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 13
        }
      }, React.createElement("span", {
        className: "mono",
        style: {
          width: 20
        }
      }, String(i + 1).padStart(2, "0")), React.createElement("span", {
        style: {
          flex: 1,
          borderBottom: "1px dotted var(--line-2)",
          height: 14
        }
      }), React.createElement("span", {
        style: {
          fontSize: 16
        }
      }, visitado ? "●" : "○"));
    })), React.createElement("div", {
      className: "mono",
      style: {
        position: "absolute",
        bottom: 22,
        left: 22,
        right: 22
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between"
      }
    }, React.createElement("span", null, passport.visitados.length, " sellados"), React.createElement("span", null, Math.max(0, totalStands - passport.visitados.length), " faltantes"))));
  }
  if (pageData.type === "stamp") {
    const s = pageData.stand;
    const rot = (s.id.charCodeAt(s.id.length - 1) || 0) % 20 - 10;
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
    }, s.region), React.createElement("div", {
      style: {
        position: "absolute",
        top: "48%",
        left: "52%",
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
  PassportPage
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
    gap: 18,
    flexWrap: "wrap"
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
}, "En vivo")), React.createElement("a", {
  href: "/pasaporte",
  "data-route": true,
  className: "btn btn-ghost",
  style: {
    padding: "6px 14px",
    fontSize: 13
  }
}, "Mi pasaporte"), React.createElement("a", {
  href: "/admin",
  "data-route": true,
  className: "mono",
  style: {
    color: "var(--ink-3)"
  }
}, "Admin")));
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
  PublicDetail
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
  stand_no_existe: "Ese stand no existe."
};
const mensajeError = (e, porDefecto) => {
  const code = String(e && (e.code || e.message) || e || "");
  for (const k of Object.keys(ERRORES)) if (code.includes(k)) return ERRORES[k];
  return porDefecto || "Ocurrió un error. Inténtalo de nuevo.";
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
const PromotorRegistroPage = () => {
  const vacio = {
    nombre: "",
    email: "",
    telefono: "",
    documento: "",
    municipio: "",
    empresa: "",
    mensaje: ""
  };
  const [form, setForm] = React.useState(vacio);
  const [acepta, setAcepta] = React.useState(false);
  const [error, setError] = React.useState("");
  const [enviado, setEnviado] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const set = (k, v) => setForm(f => ({
    ...f,
    [k]: v
  }));
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
    if (!acepta) {
      setError(ERRORES.debe_aceptar_tratamiento_datos);
      return;
    }
    setBusy(true);
    try {
      await window.LMTApi.promotorRegistro({
        ...form,
        email: sec.normalizeEmail(form.email),
        acepta_datos: true
      });
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
    }, "El equipo organizador revisar\xE1 tu inscripci\xF3n. Cuando quede aprobada te llegar\xE1 a ", React.createElement("strong", null, form.email), " tu contrase\xF1a para entrar al portal y cargar la informaci\xF3n de tu empresa y tus productos."), React.createElement("a", {
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
  }, "Completa tus datos. Un organizador revisar\xE1 la solicitud y te enviar\xE1 por correo el acceso al portal, donde podr\xE1s registrar tu empresa y tus productos."), React.createElement("form", {
    onSubmit: enviar,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 20
    }
  }, React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Nombre completo *"), React.createElement("input", {
    value: form.nombre,
    onChange: e => set("nombre", e.target.value),
    maxLength: 120,
    required: true,
    autoComplete: "name"
  })), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Correo electr\xF3nico *"), React.createElement("input", {
    type: "email",
    value: form.email,
    onChange: e => set("email", e.target.value),
    maxLength: 254,
    required: true,
    autoComplete: "email"
  }), React.createElement("span", {
    className: "mono",
    style: {
      textTransform: "none",
      letterSpacing: 0,
      color: "var(--ink-3)"
    }
  }, "Aqu\xED llegar\xE1 tu contrase\xF1a de acceso.")), React.createElement("div", {
    className: "grid-2"
  }, React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Tel\xE9fono"), React.createElement("input", {
    value: form.telefono,
    onChange: e => set("telefono", e.target.value),
    maxLength: 32,
    inputMode: "tel",
    autoComplete: "tel"
  })), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Documento"), React.createElement("input", {
    value: form.documento,
    onChange: e => set("documento", e.target.value),
    maxLength: 32,
    inputMode: "numeric"
  }))), React.createElement("div", {
    className: "grid-2"
  }, React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Municipio"), React.createElement("input", {
    value: form.municipio,
    onChange: e => set("municipio", e.target.value),
    maxLength: 80,
    placeholder: "Sandon\xE1"
  })), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Empresa o finca"), React.createElement("input", {
    value: form.empresa,
    onChange: e => set("empresa", e.target.value),
    maxLength: 120,
    placeholder: "Finca El Tambo"
  }))), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Cu\xE9ntanos de tu caf\xE9 (opcional)"), React.createElement("textarea", {
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
const PromotorLoginPage = ({
  onEntrar
}) => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const entrar = async e => {
    e.preventDefault();
    setError("");
    const sec = window.LMTSecurity;
    if (!sec || !sec.isEmail(email.trim())) {
      setError(ERRORES.email_invalido);
      return;
    }
    if (!password) {
      setError("Escribe tu contraseña.");
      return;
    }
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
  }, "Entra con el acceso", React.createElement("br", null), "que te lleg\xF3 al correo."), React.createElement("form", {
    onSubmit: entrar,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 22
    }
  }, React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Usuario (tu correo)"), React.createElement("input", {
    type: "email",
    value: email,
    onChange: e => setEmail(e.target.value),
    maxLength: 254,
    required: true,
    autoComplete: "username"
  })), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Contrase\xF1a"), React.createElement("input", {
    type: "password",
    value: password,
    onChange: e => setPassword(e.target.value),
    maxLength: 128,
    required: true,
    autoComplete: "current-password"
  })), React.createElement(Aviso, null, error), React.createElement("button", {
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
  }, "Solicita tu acceso"), React.createElement("br", null), "Si perdiste la contrase\xF1a, pide al organizador que te la reenv\xEDe.")));
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
const SubirImagen = ({
  actual,
  onSubir,
  etiqueta,
  alto = 120
}) => {
  const ref = React.useRef(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const elegir = async e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setError("");
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
      background: "var(--paper-2)"
    }
  }, actual ? React.createElement("img", {
    src: actual,
    alt: etiqueta,
    style: {
      height: alto,
      width: alto,
      objectFit: "cover",
      borderRadius: "var(--r-sm)",
      background: "var(--paper)"
    }
  }) : React.createElement(Placeholder, {
    width: alto,
    height: alto,
    label: "sin imagen"
  }), React.createElement("div", {
    style: {
      flex: 1
    }
  }, React.createElement("button", {
    type: "button",
    className: "btn btn-ghost",
    disabled: busy,
    onClick: () => ref.current && ref.current.click()
  }, busy ? "Subiendo…" : actual ? "Cambiar imagen" : "Subir imagen"), React.createElement("div", {
    className: "mono",
    style: {
      marginTop: 8,
      color: "var(--ink-3)",
      textTransform: "none",
      letterSpacing: 0
    }
  }, "JPG, PNG o WEBP \xB7 m\xE1x. 3 MB"), React.createElement("input", {
    ref: ref,
    type: "file",
    accept: "image/jpeg,image/png,image/webp",
    onChange: elegir,
    style: {
      display: "none"
    }
  }))), React.createElement(Aviso, null, error));
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
  const base = (window.LMT_BASE_URL || "").replace(/\/$/, "");
  const urlImagen = r => r ? base + "/" + r : null;
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
  })), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Municipio"), React.createElement("input", {
    value: form.municipio || "",
    onChange: e => set("municipio", e.target.value),
    maxLength: 80
  }))), React.createElement("div", {
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
    etiqueta: "Logo de la empresa",
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
  }))), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Municipio"), React.createElement("input", {
    value: form.municipio,
    onChange: e => set("municipio", e.target.value),
    maxLength: 80
  })), React.createElement(Aviso, null, error), React.createElement(Aviso, {
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
  const needed = ["LoginAdmin", "AdminPage", "MobileVotePage", "PassportPage", "PublicDashboard", "PublicDetail", "PromotorRegistroPage", "PromotorPage", "AdminPromotores"];
  if (needed.every(k => window[k])) {
    ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App, null));
  } else {
    setTimeout(waitForGlobals, 40);
  }
};
waitForGlobals();
})();
