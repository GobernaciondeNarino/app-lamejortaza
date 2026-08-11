// Selector de ubicación sobre el mapa de Nariño.
//
// Por qué no hay Google Maps ni OpenStreetMap: cargar teselas de un tercero
// significa que cada caficultor que abra la inscripción le manda su IP a esa
// empresa, obliga a abrir la política de seguridad del sitio a dominios ajenos,
// y deja el formulario roto el día que la red institucional filtre ese dominio
// o se caiga. El repositorio ya trae los 64 municipios del DANE dibujados
// (js/narino-municipios.js), así que el mapa es nuestro, funciona sin internet
// hacia fuera y no le cuenta a nadie quién se está inscribiendo.
//
// La proyección es equirectangular y está guardada junto a los trazos, de modo
// que se convierte en los dos sentidos: un toque en el mapa da coordenadas, y
// unas coordenadas guardadas vuelven a poner el alfiler donde estaba.

const MAPA_NARINO = () => window.NARINO_MAPA || null;

const mapaDimensiones = (mapa) => {
  const [, , w, h] = (mapa.viewBox || "0 0 1000 1068").split(" ").map(Number);
  return { w, h };
};

/** SVG → geográficas. */
const puntoAGeo = (mapa, x, y) => {
  const { w, h } = mapaDimensiones(mapa);
  const b = mapa.bounds;
  return {
    lng: b.lonMin + (x / w) * (b.lonMax - b.lonMin),
    lat: b.latMax - (y / h) * (b.latMax - b.latMin),
  };
};

/** Geográficas → SVG. */
const geoAPunto = (mapa, lat, lng) => {
  const { w, h } = mapaDimensiones(mapa);
  const b = mapa.bounds;
  return {
    x: ((lng - b.lonMin) / (b.lonMax - b.lonMin)) * w,
    y: ((b.latMax - lat) / (b.latMax - b.latMin)) * h,
  };
};

/**
 * Municipio que contiene el punto.
 *
 * Se pregunta al propio trazo con isPointInFill —el navegador resuelve el
 * polígono exacto— y sólo si eso no está disponible se cae al centroide más
 * cercano, que en la costa se equivoca con facilidad.
 */
const municipioEnPunto = (svg, mapa, x, y) => {
  if (svg && svg.createSVGPoint) {
    const pt = svg.createSVGPoint();
    pt.x = x; pt.y = y;
    const trazos = svg.querySelectorAll("path[data-muni]");
    for (const path of trazos) {
      try {
        if (path.isPointInFill(pt)) {
          return mapa.municipios.find((m) => m.id === path.getAttribute("data-muni")) || null;
        }
      } catch (_) { /* navegador sin isPointInFill: se usa el respaldo */ }
    }
  }
  let mejor = null, mejorD = Infinity;
  mapa.municipios.forEach((m) => {
    const d = (m.cx - x) ** 2 + (m.cy - y) ** 2;
    if (d < mejorD) { mejorD = d; mejor = m; }
  });
  return mejor;
};

const SelectorUbicacion = ({ lat, lng, municipio, onCambio, alto = 380, soloLectura = false }) => {
  const mapa = MAPA_NARINO();
  const svgRef = React.useRef(null);
  const [aviso, setAviso] = React.useState("");
  const [buscando, setBuscando] = React.useState(false);

  if (!mapa || !mapa.bounds) {
    return (
      <Aviso tipo="info">
        El mapa no está disponible en este navegador. Puedes continuar sin marcar la ubicación.
      </Aviso>
    );
  }

  const { w, h } = mapaDimensiones(mapa);
  const tienePunto = typeof lat === "number" && typeof lng === "number" && !isNaN(lat) && !isNaN(lng);
  const punto = tienePunto ? geoAPunto(mapa, lat, lng) : null;

  const marcar = (clienteX, clienteY) => {
    if (soloLectura) return;
    const svg = svgRef.current;
    if (!svg) return;
    const caja = svg.getBoundingClientRect();
    // El SVG usa preserveAspectRatio="xMidYMid meet": hay que deshacer la
    // escala y el centrado antes de convertir a coordenadas del dibujo.
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
      municipio: muni ? muni.nombre : "",
    });
  };

  const alTocar = (e) => {
    const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
    if (t) marcar(t.clientX, t.clientY);
  };

  /** Ubicación del propio teléfono: es lo cómodo si estás en la finca. */
  const usarMiUbicacion = () => {
    if (!navigator.geolocation) { setAviso("Este navegador no puede darnos tu ubicación."); return; }
    setBuscando(true); setAviso("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBuscando(false);
        const la = pos.coords.latitude, lo = pos.coords.longitude;
        if (la < 0.2 || la > 2.9 || lo < -79.3 || lo > -76.5) {
          setAviso("Tu ubicación actual está fuera de Nariño. Marca el punto en el mapa.");
          return;
        }
        const p = geoAPunto(mapa, la, lo);
        const muni = municipioEnPunto(svgRef.current, mapa, p.x, p.y);
        onCambio({
          lat: Math.round(la * 1e6) / 1e6,
          lng: Math.round(lo * 1e6) / 1e6,
          municipio: muni ? muni.nombre : "",
        });
      },
      (err) => {
        setBuscando(false);
        setAviso(err && err.code === 1
          ? "No diste permiso para usar tu ubicación. Marca el punto en el mapa."
          : "No pudimos obtener tu ubicación. Marca el punto en el mapa.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const activo = municipio ? normMuniSimple(municipio) : "";

  return (
    <div>
      <div style={{
        position: "relative", background: "var(--paper-2)", border: "1px solid var(--line)",
        borderRadius: "var(--r-md)", overflow: "hidden",
      }}>
        <svg
          ref={svgRef}
          viewBox={mapa.viewBox}
          preserveAspectRatio="xMidYMid meet"
          role={soloLectura ? "img" : "application"}
          aria-label={soloLectura ? "Ubicación del stand en Nariño" : "Mapa de Nariño: toca para marcar la ubicación"}
          onClick={(e) => marcar(e.clientX, e.clientY)}
          onTouchEnd={alTocar}
          style={{
            display: "block", width: "100%", height: alto, maxHeight: "70dvh",
            cursor: soloLectura ? "default" : "crosshair", touchAction: "manipulation",
          }}>
          {mapa.municipios.map((m) => {
            const esActivo = activo && normMuniSimple(m.nombre) === activo;
            return (
              <path key={m.id} d={m.d} data-muni={m.id}
                fill={esActivo ? "color-mix(in oklch, var(--galeras) 26%, var(--paper))" : "var(--paper)"}
                stroke="var(--line-2)" strokeWidth="1" strokeLinejoin="round">
                <title>{m.nombre}</title>
              </path>
            );
          })}
          {punto && (
            <g transform={`translate(${punto.x} ${punto.y})`} style={{ pointerEvents: "none" }}>
              <circle r="26" fill="var(--galeras)" opacity="0.18"/>
              <circle r="9" fill="var(--galeras)" stroke="var(--paper)" strokeWidth="3"/>
            </g>
          )}
        </svg>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginTop: 10 }}>
        {!soloLectura && (
          <button type="button" className="btn btn-ghost" onClick={usarMiUbicacion} disabled={buscando}
            style={{ fontSize: 13, padding: "8px 14px" }}>
            {buscando ? "Buscando…" : "Usar mi ubicación actual"}
          </button>
        )}
        {tienePunto && !soloLectura && (
          <button type="button" className="btn btn-ghost" onClick={() => onCambio({ lat: null, lng: null, municipio })}
            style={{ fontSize: 13, padding: "8px 14px" }}>
            Quitar el punto
          </button>
        )}
        <span className="mono" style={{ color: "var(--ink-3)" }}>
          {tienePunto ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : "sin ubicación marcada"}
        </span>
      </div>
      {aviso && <Aviso tipo="info">{aviso}</Aviso>}
    </div>
  );
};

/** Normalización mínima para comparar nombres de municipio. */
const normMuniSimple = (s) =>
  String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

// ---------------------------------------------------------------------------
// Municipio y subregión: listas cerradas
//
// Antes eran campos de texto y en la base acabaron conviviendo «Centro» y
// «Centro de Nariño» como si fueran zonas distintas, con lo que ninguna
// estadística por zona valía nada. Ahora los 64 municipios y las 13 subregiones
// salen del mismo catálogo que dibuja el mapa, y la región se deduce del
// municipio: no se pueden contradecir.
// ---------------------------------------------------------------------------

const MUNICIPIOS = () => (MAPA_NARINO() || {}).municipios || [];
const SUBREGIONES = () => (MAPA_NARINO() || {}).subregiones || [];

/** Subregión del municipio, o "" si no lo reconoce. */
const subregionDe = (municipio) => {
  const clave = normMuniSimple(municipio);
  if (!clave) return "";
  const m = MUNICIPIOS().find((x) => normMuniSimple(x.nombre) === clave);
  return m ? m.subregion : "";
};

const OTRO_MUNICIPIO = "__otro__";

/**
 * Desplegable de municipios, agrupados por subregión.
 *
 * `permitirOtro` añade una salida para quien no es de Nariño —un visitante
 * puede venir de Cali o de Ecuador— y revela un campo de texto sólo entonces.
 * En los formularios de stands NO se usa: el festival es del departamento.
 */
const SelectorMunicipio = ({ id, valor, onCambio, permitirOtro = false, requerido = false, etiqueta = "Municipio" }) => {
  const munis = MUNICIPIOS();
  const enCatalogo = !!valor && munis.some((m) => normMuniSimple(m.nombre) === normMuniSimple(valor));
  const [otro, setOtro] = React.useState(!!valor && !enCatalogo);

  // Agrupados por subregión: 64 opciones en una lista plana son inmanejables
  // en un teléfono, y así se ve además a qué zona pertenece cada uno.
  const grupos = {};
  munis.forEach((m) => { (grupos[m.subregion] = grupos[m.subregion] || []).push(m); });

  const elegir = (v) => {
    if (v === OTRO_MUNICIPIO) { setOtro(true); onCambio("", ""); return; }
    setOtro(false);
    onCambio(v, subregionDe(v));
  };

  return (
    <div className="field">
      <label htmlFor={id}>{etiqueta}{requerido ? " *" : ""}</label>
      <select id={id} required={requerido && !otro}
        value={otro ? OTRO_MUNICIPIO : (enCatalogo ? valor : "")}
        onChange={(e) => elegir(e.target.value)}>
        <option value="">Selecciona un municipio</option>
        {SUBREGIONES().map((sub) => (
          <optgroup key={sub} label={sub}>
            {(grupos[sub] || []).map((m) => (
              <option key={m.divipola} value={m.nombre}>{m.nombre}</option>
            ))}
          </optgroup>
        ))}
        {permitirOtro && <option value={OTRO_MUNICIPIO}>Otro municipio (fuera de Nariño)</option>}
      </select>
      {otro && (
        <input
          id={id + "-otro"}
          value={enCatalogo ? "" : (valor || "")}
          onChange={(e) => onCambio(e.target.value, "")}
          maxLength={80}
          placeholder="Escribe el municipio"
          style={{ marginTop: 8 }}/>
      )}
    </div>
  );
};

/**
 * Desplegable de subregión. Se rellena solo al elegir municipio; sigue siendo
 * un desplegable para que, si alguien lo toca, el valor siga siendo uno de los
 * trece y no una invención.
 */
const SelectorSubregion = ({ id, valor, municipio, onCambio, etiqueta = "Región" }) => {
  const derivada = subregionDe(municipio);
  return (
    <div className="field">
      <label htmlFor={id}>{etiqueta}</label>
      <select id={id} value={valor || ""} onChange={(e) => onCambio(e.target.value)}>
        <option value="">Sin especificar</option>
        {SUBREGIONES().map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <span className="ayuda">
        {derivada
          ? `Se completa sola con el municipio: ${municipio} está en ${derivada}.`
          : "Las 13 subregiones en que se agrupa el departamento."}
      </span>
    </div>
  );
};

const DEPARTAMENTOS = () => (MAPA_NARINO() || {}).departamentos || [];

/** ¿Es Nariño? Entonces el municipio se elige de los 64; si no, se escribe. */
const esNarino = (departamento) => normMuniSimple(departamento || "") === normMuniSimple("Nariño");

/**
 * Desplegable de departamento (los 32 de Colombia y Bogotá D.C.).
 *
 * Es lo que decide de qué va el campo siguiente: elegir Nariño convierte el
 * municipio en la lista de los 64; cualquier otro lo deja como texto libre,
 * porque no tenemos el callejero del resto del país y obligar a elegir sería
 * pedirle a la gente que mienta.
 */
const SelectorDepartamento = ({ id, valor, onCambio, etiqueta = "Departamento", requerido = false }) => {
  const lista = DEPARTAMENTOS();
  const enLista = !!valor && lista.some((d) => normMuniSimple(d) === normMuniSimple(valor));
  return (
    <div className="field">
      <label htmlFor={id}>{etiqueta}{requerido ? " *" : ""}</label>
      <select id={id} required={requerido} value={enLista ? valor : ""}
        onChange={(e) => onCambio(e.target.value)}>
        <option value="">Selecciona un departamento</option>
        {lista.map((d) => <option key={d} value={d}>{d}</option>)}
      </select>
    </div>
  );
};

Object.assign(window, {
  SelectorUbicacion, geoAPunto, puntoAGeo, normMuniSimple,
  SelectorMunicipio, SelectorSubregion, subregionDe, MUNICIPIOS, SUBREGIONES,
  SelectorDepartamento, DEPARTAMENTOS, esNarino,
});
