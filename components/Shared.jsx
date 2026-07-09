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
    fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-3)",
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
const QRCode = ({ data = "st-01", size = 140, bg = "#ffffff" }) => {
  const raw = String(data == null ? "" : data);
  const m = raw.match(/\/s\/([a-z0-9\-]{2,32})/i);
  const standId = m ? m[1] : raw;

  const path = "/qr/" + encodeURIComponent(standId) + ".png";
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
      loading="lazy"
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

Object.assign(window, { LogoTaza, Wordmark, MontanasSilueta, SelloCircular, Placeholder, QRCode, BarraVotos, calcScore, totalVotos, standUrl });
