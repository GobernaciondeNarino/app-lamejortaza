// Configuración → Interfaz — /admin/configuracion/interfaz
//
// Colores, letra, logotipos, iconos y textos de las tres áreas: plataforma
// (lo que ve el público), administrador (este panel) y pasaporte.
//
// Todo se edita sobre un BORRADOR y se aplica al pulsar «Guardar»: cambiar el
// color del fondo del panel mientras se está usando el panel, tecla a tecla,
// es la forma más rápida de dejarlo ilegible a mitad de una elección. La vista
// previa de al lado enseña cómo va a quedar sin tocar nada de lo real.
//
// Si aun así se guarda algo ilegible, `?tema=original` en la URL abre la
// aplicación con el aspecto de fábrica para poder deshacerlo.

// Mismas proporciones que Interfaz::DERIVADOS en el servidor: la vista previa
// tiene que enseñar lo mismo que luego se va a ver.
const INTERFAZ_DERIVADOS = {
  "paper-2": ["paper", "ink", 0.05],
  "paper-3": ["paper", "ink", 0.12],
  "line":    ["paper", "ink", 0.16],
  "line-2":  ["paper", "ink", 0.25],
  "ink-2":   ["ink", "paper", 0.24],
  "ink-3":   ["ink", "paper", 0.48],
};

const hexARgb = (h) => [1, 3, 5].map((i) => parseInt(String(h).slice(i, i + 2), 16));
const mezclarHex = (a, b, p) => {
  const ca = hexARgb(a), cb = hexARgb(b);
  return "#" + ca.map((v, i) => Math.round(v * (1 - p) + cb[i] * p).toString(16).padStart(2, "0")).join("");
};
const esHex = (v) => /^#[0-9a-f]{6}$/i.test(String(v || ""));

/** Contraste WCAG (1 a 21). 4,5 es el mínimo para texto normal. */
const contrasteHex = (a, b) => {
  const lum = (h) => {
    const c = hexARgb(h).map((v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const la = lum(a), lb = lum(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

const copiaProfunda = (v) => JSON.parse(JSON.stringify(v));
const comoMapaI = (v) => (v && typeof v === "object" && !Array.isArray(v)) ? v : {};

/** Lo editable de la respuesta del servidor, en la forma del borrador. */
const borradorDe = (aj) => {
  const areas = {};
  Object.keys(aj.areas || {}).forEach((a) => {
    const x = aj.areas[a] || {};
    areas[a] = { colores: { ...comoMapaI(x.colores) }, fuentes: { ...comoMapaI(x.fuentes) }, nombre: x.nombre !== false };
  });
  return { areas, iconos: { ...comoMapaI(aj.iconos) }, textos: { ...comoMapaI(aj.textos) } };
};

/**
 * El borrador tal y como lo espera el servidor: mapas de UN nivel
 * («plataforma.paper» => «#…»). La API descarta lo que venga más anidado.
 */
const cuerpoPlano = (b) => {
  const colores = {}, fuentes = {}, nombre = {};
  Object.keys(b.areas).forEach((a) => {
    Object.entries(b.areas[a].colores).forEach(([k, v]) => { colores[a + "." + k] = v; });
    Object.entries(b.areas[a].fuentes).forEach(([k, v]) => { fuentes[a + "." + k] = v; });
    nombre[a] = b.areas[a].nombre;
  });
  return { colores, fuentes, nombre, iconos: b.iconos, textos: b.textos };
};

const InterfazPage = () => {
  const [datos, setDatos] = React.useState(null);
  const [borrador, setBorrador] = React.useState(null);
  const [area, setArea] = React.useState("plataforma");
  const [error, setError] = React.useState("");
  const [ok, setOk] = React.useState("");
  const [guardando, setGuardando] = React.useState(false);

  const recibir = (d, mensaje) => {
    setDatos(d);
    setBorrador(borradorDe(d.ajustes));
    // Lo guardado se ve al momento en toda la aplicación, sin recargar.
    if (window.LMTInterfaz && d.publico) window.LMTInterfaz.aplicar(d.publico);
    if (mensaje) setOk(mensaje);
  };

  React.useEffect(() => {
    let vivo = true;
    const cargar = async () => {
      if (!window.LMTApi || !window.LMTApi.enabled) return;
      try { const d = await window.LMTApi.interfazAdmin(); if (vivo) recibir(d); }
      catch (e) { if (vivo) setError(mensajeError(e)); }
    };
    cargar();
    window.addEventListener("lmt:auth", cargar);
    return () => { vivo = false; window.removeEventListener("lmt:auth", cargar); };
  }, []);

  if (!datos || !borrador) {
    return <div>{error ? <Aviso>{error}</Aviso> : <p className="mono" style={{ color: "var(--ink-3)" }}>Cargando…</p>}</div>;
  }

  const cat = datos.catalogo;
  const guardado = borradorDe(datos.ajustes);
  const sucio = JSON.stringify(guardado) !== JSON.stringify(borrador);

  const accion = async (fn, mensaje) => {
    setError(""); setOk("");
    try { recibir(await fn(), mensaje); }
    catch (e) { setError(mensajeError(e)); }
  };

  const guardar = async () => {
    setGuardando(true);
    await accion(() => window.LMTApi.guardarInterfaz(cuerpoPlano(borrador)), "Guardado. Ya se ve así en toda la aplicación.");
    setGuardando(false);
  };

  const descartar = () => { setBorrador(copiaProfunda(guardado)); setError(""); setOk(""); };

  const cambiarArea = (campo, valor) => setBorrador((b) => ({
    ...b, areas: { ...b.areas, [area]: { ...b.areas[area], [campo]: valor } },
  }));

  const nombreArea = (a) => (cat.areas.find((x) => x.clave === a) || {}).etiqueta || a;

  return (
    <div>
      <div className="mono">Interfaz</div>
      <h1 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 40, fontWeight: 400, margin: "6px 0 10px", lineHeight: 1 }}>
        Colores, letra y textos.
      </h1>
      <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6, maxWidth: 680, marginBottom: 8 }}>
        Tres áreas: la <strong style={{ fontWeight: 500 }}>plataforma</strong> que ve el público, este
        <strong style={{ fontWeight: 500 }}> panel de administración</strong> y el <strong style={{ fontWeight: 500 }}>pasaporte</strong>.
        Lo que pongas en la plataforma vale también para las otras dos mientras no les pongas otra cosa.
        Los cambios no se aplican hasta que pulses «Guardar».
      </p>
      <p className="ayuda" style={{ maxWidth: 680, marginBottom: 20 }}>
        Si una combinación deja el panel ilegible, abre la dirección con <code>?tema=original</code> al
        final (por ejemplo <code>/admin/configuracion/interfaz?tema=original</code>): se verá con el
        aspecto de fábrica y podrás deshacerla.
      </p>

      <div role="tablist" aria-label="Área" style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
        {cat.areas.map((a) => (
          <button key={a.clave} type="button" role="tab" aria-selected={area === a.clave}
            onClick={() => setArea(a.clave)}
            className={"btn " + (area === a.clave ? "btn-primary" : "btn-ghost")}>
            {a.etiqueta}
          </button>
        ))}
      </div>

      <Aviso>{error}</Aviso>
      <Aviso tipo="ok">{ok}</Aviso>

      <div className="interfaz-rejilla">
        <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
          <BloqueColores cat={cat} area={area} borrador={borrador}
            onCambio={(colores) => cambiarArea("colores", colores)}/>
          <BloqueFuentes cat={cat} area={area} borrador={borrador} propias={datos.ajustes.fuentes_propias}
            onCambio={(fuentes) => cambiarArea("fuentes", fuentes)}/>
          <BloqueLogo area={area} nombreArea={nombreArea(area)} ajustes={datos.ajustes}
            nombre={borrador.areas[area].nombre}
            onNombre={(v) => cambiarArea("nombre", v)}
            onSubir={(file) => accion(() => window.LMTApi.subirLogoInterfaz(area, file), "Logotipo guardado.")}
            onQuitar={() => accion(() => window.LMTApi.quitarLogoInterfaz(area), "Logotipo quitado.")}/>
          <BloqueTextos cat={cat} area={area} borrador={borrador}
            onCambio={(textos) => setBorrador((b) => ({ ...b, textos }))}/>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" className="btn btn-ghost"
              onClick={() => {
                if (!confirm(`¿Volver a los colores y la letra de fábrica en «${nombreArea(area)}»?`)) return;
                accion(() => window.LMTApi.restaurarInterfaz("apariencia", area), "Colores y letra de fábrica restaurados.");
              }}>
              Colores y letra de fábrica en esta área
            </button>
            <button type="button" className="btn btn-ghost"
              onClick={() => {
                if (!confirm(`¿Volver a los textos de fábrica en «${nombreArea(area)}»?`)) return;
                accion(() => window.LMTApi.restaurarInterfaz("textos", area), "Textos de fábrica restaurados.");
              }}>
              Textos de fábrica en esta área
            </button>
          </div>
        </div>

        <div className="interfaz-lateral">
          <VistaPrevia cat={cat} area={area} borrador={borrador} ajustes={datos.ajustes}/>
        </div>
      </div>

      <h2 className="mono" style={{ margin: "36px 0 12px", fontSize: 12 }}>Para todas las áreas</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <BloqueIconos cat={cat} borrador={borrador}
          onCambio={(iconos) => setBorrador((b) => ({ ...b, iconos }))}
          onRestaurar={() => accion(() => window.LMTApi.restaurarInterfaz("iconos", ""), "Iconos de fábrica restaurados.")}/>
        <BloqueFuentesPropias cat={cat} propias={datos.ajustes.fuentes_propias}
          onSubir={(file, nombre) => accion(() => window.LMTApi.subirFuenteInterfaz(file, nombre), "Fuente subida. Ya puedes elegirla en «Letra».")}
          onQuitar={(id) => accion(() => window.LMTApi.quitarFuenteInterfaz(id), "Fuente quitada.")}/>
        <BloqueFavicon favicon={datos.ajustes.favicon}
          onSubir={(file) => accion(() => window.LMTApi.subirLogoInterfaz("favicon", file), "Icono de la pestaña guardado.")}
          onQuitar={() => accion(() => window.LMTApi.quitarLogoInterfaz("favicon"), "Icono de la pestaña quitado.")}/>
      </div>

      {/* La barra de guardar se queda a la vista mientras haya algo pendiente:
          con un formulario tan largo, el botón al final no lo encuentra nadie. */}
      <div className={"interfaz-guardar" + (sucio ? " pendiente" : "")}>
        <span className="mono" style={{ color: sucio ? "var(--ink)" : "var(--ink-3)" }}>
          {sucio ? "Hay cambios sin guardar" : "Todo guardado"}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="btn btn-ghost" disabled={!sucio || guardando} onClick={descartar}>Descartar</button>
          <button type="button" className="btn btn-primary" disabled={!sucio || guardando} onClick={guardar}
            style={{ opacity: !sucio || guardando ? 0.6 : 1 }}>
            {guardando ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};

/** El valor efectivo de un color en un área, y de dónde sale. */
const colorEfectivo = (cat, borrador, area, clave) => {
  const propio = borrador.areas[area].colores[clave];
  if (propio) return { valor: propio, origen: "propio" };
  if (area !== "plataforma") {
    const base = borrador.areas.plataforma.colores[clave];
    if (base) return { valor: base, origen: "plataforma" };
  }
  return { valor: (cat.colores.find((c) => c.clave === clave) || {}).defecto || "#000000", origen: "fabrica" };
};

const BloqueColores = ({ cat, area, borrador, onCambio }) => {
  const colores = borrador.areas[area].colores;
  const poner = (k, v) => {
    const siguiente = { ...colores };
    if (v) siguiente[k] = v.toLowerCase(); else delete siguiente[k];
    onCambio(siguiente);
  };
  const papel = colorEfectivo(cat, borrador, area, "paper").valor;
  const tinta = colorEfectivo(cat, borrador, area, "ink").valor;
  const grano = colorEfectivo(cat, borrador, area, "grano").valor;
  const cTexto = contrasteHex(papel, tinta);
  const cAcento = contrasteHex(papel, grano);

  return (
    <BloqueForm titulo="Colores"
      nota="El fondo y el texto definen también los tonos intermedios (bordes, superficies, texto secundario): se calculan solos para que combinen.">
      <div className="interfaz-colores">
        {cat.colores.map((c) => {
          const ef = colorEfectivo(cat, borrador, area, c.clave);
          return (
            <div key={c.clave} className="interfaz-color">
              <input type="color" id={`ic-${c.clave}`} value={ef.valor}
                onChange={(e) => poner(c.clave, e.target.value)}
                aria-label={c.etiqueta}/>
              <div style={{ minWidth: 0, flex: 1 }}>
                <label htmlFor={`ic-${c.clave}`} style={{ fontSize: 13, display: "block" }}>{c.etiqueta}</label>
                <input className="ruta" value={colores[c.clave] || ""} placeholder={ef.valor}
                  aria-label={`${c.etiqueta} en hexadecimal`}
                  onChange={(e) => {
                    const v = e.target.value.trim();
                    if (v === "") poner(c.clave, "");
                    else if (esHex(v)) poner(c.clave, v);
                  }}
                  style={{ border: "none", borderBottom: "1px solid var(--line)", background: "transparent", width: 90, padding: "2px 0" }}/>
                <div className="ayuda">
                  {ef.origen === "propio"
                    ? <button type="button" onClick={() => poner(c.clave, "")}
                        style={{ padding: 0, color: "var(--grano)", textDecoration: "underline", fontSize: 12 }}>
                        {area === "plataforma" ? "volver al de fábrica" : "usar el de la plataforma"}
                      </button>
                    : (ef.origen === "plataforma" ? "igual que la plataforma" : "de fábrica")}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {cTexto < 4.5 && (
        <Aviso>
          El texto sobre este fondo tiene un contraste de {cTexto.toFixed(1)}:1 y el mínimo para leer
          con comodidad es 4,5:1. Con sol, en el recinto, se leerá peor todavía.
        </Aviso>
      )}
      {cTexto >= 4.5 && cAcento < 3 && (
        <Aviso tipo="info">
          El acento principal apenas se distingue del fondo ({cAcento.toFixed(1)}:1): los enlaces y
          botones resaltados costarán de ver.
        </Aviso>
      )}
    </BloqueForm>
  );
};

/** La pila de fuentes de un valor («geist», «propia:…»), para la muestra. */
const pilaFuente = (cat, propias, valor, rol) => {
  if (!valor) return null;
  const f = cat.fuentes.find((x) => x.clave === valor);
  if (f) return f.pila;
  const m = /^propia:([0-9a-f]{12})$/.exec(valor);
  if (m) return `"LMT Propia ${m[1]}", ${rol === "display" ? "Georgia, serif" : rol === "mono" ? "ui-monospace, monospace" : "system-ui, sans-serif"}`;
  return null;
};

const fuenteEfectiva = (cat, borrador, propias, area, rol) => {
  const propio = borrador.areas[area].fuentes[rol];
  if (propio) return { valor: propio, origen: "propio" };
  if (area !== "plataforma" && borrador.areas.plataforma.fuentes[rol]) {
    return { valor: borrador.areas.plataforma.fuentes[rol], origen: "plataforma" };
  }
  return { valor: (cat.roles.find((r) => r.clave === rol) || {}).defecto, origen: "fabrica" };
};

const BloqueFuentes = ({ cat, area, borrador, propias, onCambio }) => {
  const fuentes = borrador.areas[area].fuentes;
  const heredado = area === "plataforma" ? "De fábrica" : "La misma que la plataforma";
  const muestras = { display: "La mejor taza de Nariño", sans: "Recorre los espacios, prueba y vota.", mono: "Espacio 12 · Pasto" };
  return (
    <BloqueForm titulo="Letra"
      nota="Las de fábrica y las del sistema no se descargan de ningún servicio externo. Para una tipografía institucional, súbela en «Fuentes propias» (abajo) y aparecerá en estas listas.">
      {cat.roles.map((r) => {
        const ef = fuenteEfectiva(cat, borrador, propias, area, r.clave);
        return (
          <div key={r.clave} className="field">
            <label htmlFor={`if-${r.clave}`}>{r.etiqueta}</label>
            <select id={`if-${r.clave}`} value={fuentes[r.clave] || ""}
              onChange={(e) => {
                const siguiente = { ...fuentes };
                if (e.target.value) siguiente[r.clave] = e.target.value; else delete siguiente[r.clave];
                onCambio(siguiente);
              }}>
              <option value="">{heredado}</option>
              {cat.fuentes.map((f) => <option key={f.clave} value={f.clave}>{f.etiqueta}</option>)}
              {propias.map((f) => <option key={f.id} value={"propia:" + f.id}>{f.nombre} (propia)</option>)}
            </select>
            <div style={{
              fontFamily: pilaFuente(cat, propias, ef.valor, r.clave) || undefined,
              fontStyle: r.clave === "display" ? "italic" : "normal",
              fontSize: r.clave === "display" ? 26 : (r.clave === "mono" ? 12 : 15),
              textTransform: r.clave === "mono" ? "uppercase" : "none",
              letterSpacing: r.clave === "mono" ? "0.04em" : 0,
              marginTop: 6, color: "var(--ink-2)",
            }}>
              {muestras[r.clave]}
            </div>
          </div>
        );
      })}
    </BloqueForm>
  );
};

const BloqueLogo = ({ area, nombreArea, ajustes, nombre, onNombre, onSubir, onQuitar }) => {
  const ref = React.useRef(null);
  const [busy, setBusy] = React.useState(false);
  const propio = ajustes.areas[area].logo;
  const heredado = area !== "plataforma" ? ajustes.areas.plataforma.logo : "";
  const visible = propio || heredado;
  const elegir = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setBusy(true);
    try { await onSubir(f); } finally { setBusy(false); if (ref.current) ref.current.value = ""; }
  };
  return (
    <BloqueForm titulo="Logotipo"
      nota={`Sustituye a la taza dibujada en la cabecera de «${nombreArea}». Mejor un PNG con fondo transparente, más ancho que alto.`}>
      <div style={{
        display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
        padding: 12, border: "1px dashed var(--line-2)", borderRadius: "var(--r-md)", background: "var(--paper-2)",
      }}>
        <div style={{ height: 56, minWidth: 56, display: "flex", alignItems: "center" }}>
          {visible
            ? <img src={urlImagen(visible)} alt="Logotipo actual" style={{ maxHeight: 56, maxWidth: 220, objectFit: "contain" }}/>
            : <LogoTaza size={48}/>}
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 8 }}>
            {propio ? "Logotipo propio de esta área."
              : heredado ? "Usa el logotipo de la plataforma."
              : "La taza de fábrica."}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => ref.current && ref.current.click()}>
              {busy ? "Subiendo…" : (propio ? "Cambiar" : "Subir logotipo")}
            </button>
            {propio && (
              <button type="button" className="btn btn-ghost" onClick={onQuitar}>Quitar</button>
            )}
          </div>
          <div className="ayuda" style={{ marginTop: 6 }}>{ayudaImagen(false)}</div>
          <input ref={ref} type="file" accept="image/png,image/webp,image/jpeg" onChange={elegir} style={{ display: "none" }}/>
        </div>
      </div>
      <label style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14 }}>
        <input type="checkbox" checked={nombre} onChange={(e) => onNombre(e.target.checked)} disabled={!propio}/>
        Mostrar el nombre del festival junto al logotipo
      </label>
      {!propio && <span className="ayuda">Sólo se puede ocultar cuando esta área tiene su propio logotipo: la taza sola no dice de qué se trata.</span>}
    </BloqueForm>
  );
};

const BloqueTextos = ({ cat, area, borrador, onCambio }) => {
  const [filtro, setFiltro] = React.useState("");
  const lista = cat.textos.filter((t) => t.area === area);
  const q = filtro.trim().toLowerCase();
  const visibles = q
    ? lista.filter((t) => (t.etiqueta + " " + t.seccion + " " + t.defecto + " " + (borrador.textos[t.clave] || "")).toLowerCase().includes(q))
    : lista;
  const secciones = [];
  visibles.forEach((t) => { if (!secciones.includes(t.seccion)) secciones.push(t.seccion); });
  const poner = (k, v) => {
    const siguiente = { ...borrador.textos };
    if (v === "") delete siguiente[k]; else siguiente[k] = v;
    onCambio(siguiente);
  };
  const cambiados = lista.filter((t) => borrador.textos[t.clave]).length;

  return (
    <BloqueForm titulo={`Textos · ${cambiados} de ${lista.length} cambiados`}
      nota="Vacío = el texto de fábrica, que se ve en gris dentro del campo. En títulos y párrafos, un salto de línea parte la frase, *así* pinta una palabra con el color de acento y **así** la pone en negrita.">
      <div className="field">
        <label htmlFor="it-buscar">Buscar</label>
        <input id="it-buscar" value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder="Ej: pasaporte, voto, título…"/>
      </div>
      {secciones.map((sec) => (
        <div key={sec} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="mono" style={{ color: "var(--ink)", borderBottom: "1px solid var(--line)", paddingBottom: 4 }}>{sec}</div>
          {visibles.filter((t) => t.seccion === sec).map((t) => {
            const valor = borrador.textos[t.clave] || "";
            const id = "it-" + t.clave.replace(/\./g, "-");
            const Campo = t.tipo === "linea" ? "input" : "textarea";
            return (
              <div key={t.clave} className="field">
                <label htmlFor={id}>{t.etiqueta}</label>
                <Campo id={id} value={valor} maxLength={t.max} placeholder={t.defecto}
                  rows={t.tipo === "linea" ? undefined : Math.min(6, Math.max(2, t.defecto.split("\n").length + (t.tipo === "parrafo" ? 1 : 0)))}
                  onChange={(e) => poner(t.clave, t.tipo === "linea" ? e.target.value.replace(/\n/g, " ") : e.target.value)}/>
                {valor && (
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
                    {t.tipo === "titulo"
                      ? <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 20, lineHeight: 1.1 }}>{pintarTexto(valor)}</div>
                      : <span/>}
                    <button type="button" onClick={() => poner(t.clave, "")}
                      style={{ padding: 0, color: "var(--grano)", textDecoration: "underline", fontSize: 12 }}>
                      volver al de fábrica
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
      {!visibles.length && <p className="ayuda">Ningún texto coincide con «{filtro}».</p>}
    </BloqueForm>
  );
};

const BloqueIconos = ({ cat, borrador, onCambio, onRestaurar }) => {
  const poner = (k, v) => {
    const siguiente = { ...borrador.iconos };
    if (v.trim() === "") delete siguiente[k]; else siguiente[k] = v.trim();
    onCambio(siguiente);
  };
  return (
    <BloqueForm titulo="Iconos"
      nota="Un emoji o un símbolo por casilla. Son caracteres y no imágenes: se ven en cualquier teléfono sin descargar nada. Los nombres de las calificaciones y del menú están en Textos → Plataforma.">
      <div className="interfaz-iconos">
        {cat.iconos.map((i) => (
          <div key={i.clave} className="field">
            <label htmlFor={"ii-" + i.clave}>{i.etiqueta}</label>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span aria-hidden="true" style={{ fontSize: 26, width: 34, textAlign: "center" }}>{borrador.iconos[i.clave] || i.defecto}</span>
              <input id={"ii-" + i.clave} value={borrador.iconos[i.clave] || ""} placeholder={i.defecto}
                maxLength={16} onChange={(e) => poner(i.clave, e.target.value)} style={{ width: 70 }}/>
            </div>
          </div>
        ))}
      </div>
      <div>
        <button type="button" className="btn btn-ghost" onClick={() => { if (confirm("¿Volver a los iconos de fábrica?")) onRestaurar(); }}>
          Iconos de fábrica
        </button>
      </div>
    </BloqueForm>
  );
};

const BloqueFuentesPropias = ({ cat, propias, onSubir, onQuitar }) => {
  const ref = React.useRef(null);
  const [nombre, setNombre] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const lleno = propias.length >= (cat.max_fuentes || 6);
  const elegir = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setBusy(true);
    try { await onSubir(f, nombre.trim()); setNombre(""); }
    finally { setBusy(false); if (ref.current) ref.current.value = ""; }
  };
  return (
    <BloqueForm titulo="Fuentes propias"
      nota="Para usar la tipografía institucional. Formatos: .woff2 (el más ligero), .woff, .ttf u .otf, hasta 2 MB. Comprueba que la licencia de la fuente permite usarla en una web.">
      {propias.length > 0 && (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {propias.map((f) => (
            <li key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap",
              padding: "8px 12px", border: "1px solid var(--line)", borderRadius: "var(--r-sm)" }}>
              <span style={{ fontFamily: `"LMT Propia ${f.id}", var(--font-sans)`, fontSize: 18 }}>{f.nombre}</span>
              <button type="button" className="btn btn-ghost" style={{ padding: "6px 12px" }}
                onClick={() => { if (confirm(`¿Quitar «${f.nombre}»? Las áreas que la usen vuelven a la letra de fábrica.`)) onQuitar(f.id); }}>
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}
      {lleno
        ? <p className="ayuda">Ya hay {propias.length} fuentes: quita alguna para subir otra.</p>
        : (
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
            <div className="field" style={{ flex: 1, minWidth: 180 }}>
              <label htmlFor="ifp-nombre">Nombre (opcional)</label>
              <input id="ifp-nombre" value={nombre} maxLength={60} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Montserrat"/>
            </div>
            <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => ref.current && ref.current.click()}>
              {busy ? "Subiendo…" : "Subir fuente"}
            </button>
            <input ref={ref} type="file" accept=".woff2,.woff,.ttf,.otf,font/woff2,font/woff,font/ttf,font/otf" onChange={elegir} style={{ display: "none" }}/>
          </div>
        )}
    </BloqueForm>
  );
};

const BloqueFavicon = ({ favicon, onSubir, onQuitar }) => {
  const ref = React.useRef(null);
  const [busy, setBusy] = React.useState(false);
  const elegir = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setBusy(true);
    try { await onSubir(f); } finally { setBusy(false); if (ref.current) ref.current.value = ""; }
  };
  return (
    <BloqueForm titulo="Icono de la pestaña"
      nota="El que se ve en la pestaña del navegador y al guardar la página en la pantalla de inicio del teléfono. Cuadrado, PNG, de al menos 192×192 px. Se aplica al recargar la página.">
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <img src={favicon ? urlImagen(favicon) : urlImagen("favicon.svg")} alt="Icono actual"
          style={{ width: 40, height: 40, objectFit: "contain", border: "1px solid var(--line)", borderRadius: 8, background: "var(--paper)" }}/>
        <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => ref.current && ref.current.click()}>
          {busy ? "Subiendo…" : (favicon ? "Cambiar" : "Subir icono")}
        </button>
        {favicon && <button type="button" className="btn btn-ghost" onClick={onQuitar}>Quitar</button>}
        <input ref={ref} type="file" accept="image/png,image/webp,image/jpeg" onChange={elegir} style={{ display: "none" }}/>
      </div>
    </BloqueForm>
  );
};

/**
 * Cómo va a quedar el área con lo que hay en el borrador. Se pinta con las
 * mismas variables CSS que la aplicación, pero puestas SÓLO en esta caja: lo
 * de fuera sigue con lo guardado.
 */
const VistaPrevia = ({ cat, area, borrador, ajustes }) => {
  const c = (k) => colorEfectivo(cat, borrador, area, k).valor;
  const vars = {};
  cat.colores.forEach((x) => { vars["--" + x.clave] = c(x.clave); });
  Object.keys(INTERFAZ_DERIVADOS).forEach((k) => {
    const [de, hacia, p] = INTERFAZ_DERIVADOS[k];
    vars["--" + k] = mezclarHex(c(de), c(hacia), p);
  });
  cat.roles.forEach((r) => {
    const ef = fuenteEfectiva(cat, borrador, ajustes.fuentes_propias, area, r.clave);
    const pila = pilaFuente(cat, ajustes.fuentes_propias, ef.valor, r.clave);
    if (pila) vars["--font-" + r.clave] = pila;
  });
  const t = (k, d) => {
    const v = borrador.textos[k];
    return v && v.trim() ? v : d;
  };
  const ic = (k, d) => borrador.iconos[k] || d;
  const logo = ajustes.areas[area].logo || ajustes.areas.plataforma.logo;
  const conNombre = ajustes.areas[area].logo ? borrador.areas[area].nombre
    : (ajustes.areas.plataforma.logo ? borrador.areas.plataforma.nombre : true);

  return (
    <div style={{ position: "sticky", top: 16 }}>
      <div className="mono" style={{ marginBottom: 8 }}>Vista previa · {(cat.areas.find((a) => a.clave === area) || {}).etiqueta}</div>
      <div style={{
        ...vars, background: "var(--paper)", color: "var(--ink)", fontFamily: "var(--font-sans)",
        border: "1px solid var(--line-2)", borderRadius: "var(--r-md)", padding: 18,
        display: "flex", flexDirection: "column", gap: 12, boxShadow: "var(--shadow-2)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {logo
            ? <img src={urlImagen(logo)} alt="" style={{ height: 28, maxWidth: 140, objectFit: "contain" }}/>
            : <LogoTaza size={28}/>}
          {conNombre && (
            <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 18 }}>
              {t("plataforma.marca.nombre", "La Mejor Taza")}
            </div>
          )}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--ink-3)" }}>
          {area === "admin" ? t("admin.menu.rotulo", "Admin · Festival 2026")
            : area === "pasaporte" ? t("pasaporte.portada.rotulo", "Pasaporte del Café")
            : t("plataforma.inicio.rotulo", "Ranking público")}
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 30, lineHeight: 1 }}>
          {pintarTexto(area === "admin" ? t("admin.espacios.titulo", "Espacios del festival")
            : area === "pasaporte" ? t("pasaporte.vacio.titulo", "Empieza tu travesía\ndel café.")
            : t("plataforma.inicio.titulo", "¿Cuál es la\nmejor taza de\n*Nariño*?"))}
        </div>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "var(--ink-2)" }}>
          Texto secundario sobre el fondo, con un <a href="#" onClick={(e) => e.preventDefault()} style={{ color: "var(--grano)" }}>enlace</a>.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span className="btn btn-primary" style={{ pointerEvents: "none" }}>Botón principal</span>
          <span className="btn btn-ghost" style={{ pointerEvents: "none" }}>Secundario</span>
        </div>
        <div style={{ padding: 12, background: "var(--paper-2)", border: "1px solid var(--line)", borderRadius: "var(--r-sm)" }}>
          <div style={{ display: "flex", justifyContent: "space-around", fontSize: 26 }}>
            <span title="Malo">{ic("voto.malo", "😞")}</span>
            <span title="Regular">{ic("voto.regular", "😐")}</span>
            <span title="Excelente">{ic("voto.bueno", "😍")}</span>
          </div>
          <div style={{ display: "flex", height: 5, borderRadius: 999, overflow: "hidden", marginTop: 10 }}>
            <div style={{ width: "55%", background: "var(--good)" }}/>
            <div style={{ width: "30%", background: "var(--meh)" }}/>
            <div style={{ width: "15%", background: "var(--bad)" }}/>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["grano", "galeras", "cafeto"].map((k) => (
            <span key={k} style={{ flex: 1, height: 18, borderRadius: 4, background: `var(--${k})` }}/>
          ))}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { InterfazPage, contrasteHex, mezclarHex });
