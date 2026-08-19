// Dashboard público (/) y detalle (/festival/{id}).

const PublicHeader = () => (
  <header style={{
    padding: "20px 32px", borderBottom: "1px solid var(--line)",
    display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--paper)", flexWrap: "wrap", gap: 12,
  }}>
    <a href="/festival" data-route style={{ textDecoration: "none", color: "inherit" }}><Wordmark size={16}/></a>
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--good)", animation: "pulse 2s infinite" }}/>
        <span className="mono" style={{ color: "var(--good)" }}>En vivo</span>
      </div>
      {/* Todo lo del visitante cabe en el menú. Antes eran enlaces sueltos que
          en un teléfono se partían en dos filas, y «Admin» no pinta nada en la
          cabecera del público: se entra desde la portada. */}
      <MenuPublico/>
    </div>
  </header>
);

const PublicDashboard = ({ stands, comentarios, onDetail }) => {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 5000);
    return () => clearInterval(t);
  }, []);

  if (!stands.length) {
    return (
      <div style={{ minHeight: "100dvh", background: "var(--paper)" }}>
        <PublicHeader/>
        <section style={{ padding: "80px 32px", textAlign: "center" }}>
          <div className="mono">Festival 2026</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 64, fontWeight: 400, margin: "12px 0 16px", lineHeight: 1, letterSpacing: "-0.02em" }}>
            El festival arranca pronto.
          </h1>
          <p style={{ color: "var(--ink-2)", maxWidth: 540, margin: "0 auto 20px", fontSize: 16, lineHeight: 1.6 }}>
            Aún no hay stands registrados. Si eres organizador inicia sesión y registra el primero.
          </p>
          <a href="/admin/login" data-route className="btn btn-primary">Entrar como admin →</a>
        </section>
      </div>
    );
  }

  const sorted = [...stands].sort((a, b) => calcScore(b.votos) - calcScore(a.votos));
  const top3 = sorted.slice(0, 3);
  const totalVotosAll = stands.reduce((a, s) => a + totalVotos(s.votos), 0);
  const metricas = (window.LMTApi && window.LMTApi.metricas) || null;

  return (
    <div style={{ minHeight: "100dvh", background: "var(--paper)" }}>
      <PublicHeader/>
      {/* Lo primero que ve quien llega sin identificarse. Con el correo puesto
          no aparece: el ranking y el mapa se ven sin escribir nada y la portada
          no es un muro. */}
      <InvitacionCorreo/>

      {/* Una sola `className`: estaba dos veces y la segunda pisaba a la
          primera, así que `lmt-three-wrap` no llegaba nunca al DOM. */}
      <section className="lmt-three-wrap seccion" data-three-bg
               ref={(el) => { if (el && window.LMTThree && !el.dataset.threeMounted) window.LMTThree.mount(el); }}
               style={{ paddingTop: 48, paddingBottom: 32, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 36, alignItems: "flex-end", position: "relative", overflow: "hidden", minHeight: 320 }}>
        <div>
          <div className="mono">Ranking público</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "min(96px, 12vw)", fontWeight: 400, margin: "8px 0 0", lineHeight: 0.9, letterSpacing: "-0.03em" }}>
            ¿Cuál es la<br/>mejor taza de<br/><span style={{ color: "var(--galeras)" }}>Nariño</span>?
          </h1>
          <p style={{ fontSize: 15, color: "var(--ink-2)", marginTop: 18, maxWidth: 520, lineHeight: 1.6 }}>
            El festival lo decide el público. Escanea el QR de cada stand, vota con un emoji y sella tu pasaporte.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { k: totalVotosAll.toLocaleString(), sub: "votos totales" },
            { k: (metricas ? metricas.pasaportes : "—"), sub: "pasaportes activos" },
            { k: stands.length, sub: "stands participan" },
            { k: (metricas ? metricas.aprobacion + "%" : "—"), sub: "aprobación general" },
          ].map((m, i) => (
            <div key={i} style={{ padding: 18, border: "1px solid var(--line)", borderRadius: "var(--r-md)", background: "var(--paper)" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 36, fontStyle: "italic", lineHeight: 1 }}>{m.k}</div>
              <div className="mono" style={{ marginTop: 6 }}>{m.sub}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "24px 32px 40px" }}>
        <div className="mono" style={{ marginBottom: 14 }}>Top 3 · Podio en vivo</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 14, alignItems: "flex-end" }}>
          {[top3[1], top3[0], top3[2]].map((s, displayIdx) => {
            if (!s) return <div key={displayIdx}/>;
            const actualRank = [2, 1, 3][displayIdx];
            const h = [180, 240, 150][displayIdx];
            return (
              <a key={s.id} href={"/festival/" + s.id} data-route style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{
                  height: h, background: actualRank === 1 ? "var(--ink)" : "var(--paper-2)",
                  color: actualRank === 1 ? "var(--paper)" : "var(--ink)",
                  border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: 18,
                  display: "flex", flexDirection: "column", justifyContent: "space-between",
                  position: "relative", overflow: "hidden",
                }}>
                  <div className="mono" style={{ color: actualRank === 1 ? "var(--paper-3)" : "var(--ink-3)" }}>
                    #{actualRank} {actualRank === 1 && "· La Mejor Taza"}
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: actualRank === 1 ? 36 : 24, fontWeight: 400, lineHeight: 1, letterSpacing: "-0.01em" }}>
                      {s.nombre}
                    </div>
                    <div style={{ fontSize: 12, marginTop: 6, opacity: 0.7 }}>{s.municipio}</div>
                    <div style={{ marginTop: 12, display: "flex", alignItems: "baseline", gap: 8 }}>
                      <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 28 }}>{calcScore(s.votos).toFixed(0)}</span>
                      <span className="mono" style={{ color: actualRank === 1 ? "var(--paper-3)" : "var(--ink-3)" }}>/100 · {totalVotos(s.votos)} votos</span>
                    </div>
                  </div>
                  {actualRank === 1 && (
                    <div style={{ position: "absolute", top: 16, right: 16 }}>
                      <SelloCircular stand={s} size={96} rotation={10}/>
                    </div>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      </section>

      <section className="seccion" style={{ paddingBottom: 40, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 22 }}>
        <MapaNarino stands={stands} onDetail={onDetail}/>
        <div style={{ border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div className="mono">Últimos votos</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--good)", animation: "pulse 2s infinite" }}/>
              <span className="mono" style={{ color: "var(--good)" }}>Live</span>
            </div>
          </div>
          {comentarios.length === 0 && (
            <div className="mono" style={{ color: "var(--ink-3)" }}>Aún no hay votos.</div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {comentarios.slice(0, 6).map((c, i) => {
              const s = stands.find((x) => x.id === c.stand);
              if (!s) return null;
              const emoji = { bueno: "😍", regular: "😐", malo: "😞" }[c.emoji] || "•";
              return (
                <a key={i} href={"/festival/" + s.id} data-route style={{
                  display: "flex", gap: 12, paddingBottom: 12,
                  borderBottom: i < Math.min(comentarios.length, 6) - 1 ? "1px solid var(--line)" : "none",
                  textDecoration: "none", color: "inherit",
                  animation: i === 0 ? "fade-up 0.4s" : "none",
                }}>
                  <div style={{ fontSize: 22 }}>{emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{s.nombre}</div>
                    {c.texto && (
                      <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 4, lineHeight: 1.4, fontStyle: "italic", fontFamily: "var(--font-display)" }}>
                        "{c.texto}"
                      </div>
                    )}
                    <div className="mono" style={{ marginTop: 6 }}>
                      {c.autor} · {c.hora} {c.compra && <span style={{ color: "var(--cafeto)" }}>· compró</span>}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section className="seccion" style={{ paddingBottom: 56 }}>
        <div className="mono" style={{ marginBottom: 14 }}>Tabla completa · {stands.length} stands</div>
        <div style={{ border: "1px solid var(--line)", borderRadius: "var(--r-md)", overflow: "hidden" }}>
          {sorted.map((s, i) => (
            <a key={s.id} href={"/festival/" + s.id} data-route className="rank-fila" style={{
              borderBottom: i < sorted.length - 1 ? "1px solid var(--line)" : "none",
            }}>
              <div className="mono rank-pos" style={{ fontSize: 13 }}>{String(i + 1).padStart(2, "0")}</div>
              <div className="rank-nombre">
                <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 20, letterSpacing: "-0.01em" }}>{s.nombre}</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{(s.descripcion || "").slice(0, 80)}{s.descripcion && s.descripcion.length > 80 ? "…" : ""}</div>
              </div>
              {/* Municipio y votos son DOS celdas distintas de la rejilla. Con
                  la misma clase, en móvil las dos caían en el mismo área y se
                  dibujaban una encima de la otra. */}
              <div className="rank-meta rank-municipio" style={{ fontSize: 13 }}>{s.municipio}</div>
              <div className="rank-puntaje" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 24 }}>{calcScore(s.votos).toFixed(0)}</div>
              <div className="rank-meta rank-votos" style={{ fontSize: 13, color: "var(--ink-2)" }}>{totalVotos(s.votos)} votos</div>
              <div className="rank-barra"><BarraVotos votos={s.votos}/></div>
            </a>
          ))}
        </div>
      </section>

      <footer style={{ padding: "32px", borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <Wordmark size={14}/>
        <div className="mono" style={{ color: "var(--ink-3)" }}>
          Comité del Café · Gobernación de Nariño · 2026
        </div>
      </footer>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </div>
  );
};

// Normaliza un nombre de municipio para emparejar (sin acentos, mayúsculas).
const normMuni = (s) => (s || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toUpperCase().trim();

const MapaNarino = ({ stands, onDetail }) => {
  const [hover, setHover] = React.useState(null);
  const mapa = window.NARINO_MAPA;
  const [vw, vh] = mapa ? mapa.viewBox.split(" ").slice(2).map(Number) : [1000, 1068];

  // Índice de municipios por nombre normalizado (para ubicar cada stand).
  const byName = React.useMemo(() => {
    const idx = {};
    if (mapa) mapa.municipios.forEach((m) => { idx[normMuni(m.nombre)] = m; });
    return idx;
  }, [mapa]);

  const findMuni = (municipio) => {
    if (!mapa) return null;
    const n = normMuni(municipio);
    if (byName[n]) return byName[n];
    // "Pasto" ⊂ "San Juan de Pasto", etc.
    return mapa.municipios.find((m) => { const mn = normMuni(m.nombre); return mn.includes(n) || n.includes(mn); }) || null;
  };

  const activos = new Set();
  const placed = stands.map((s) => {
    const muni = findMuni(s.municipio);
    if (muni) activos.add(muni.id);
    return { s, muni };
  });

  const ranked = [...stands].sort((a, b) => calcScore(b.votos) - calcScore(a.votos));
  const rankOf = (id) => ranked.findIndex((x) => x.id === id) + 1;

  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: 22, position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <div className="mono">Mapa · Nariño</div>
        <div className="mono" style={{ color: "var(--ink-3)" }}>{stands.length} establecimientos / fincas</div>
      </div>
      <div style={{ aspectRatio: `${vw} / ${vh}`, position: "relative", background: "var(--paper-2)", borderRadius: "var(--r-sm)", overflow: "hidden", maxHeight: 440, margin: "0 auto" }} className="paper-texture">
        <svg width="100%" height="100%" viewBox={mapa ? mapa.viewBox : "0 0 1000 1068"} preserveAspectRatio="xMidYMid meet" style={{ position: "absolute", inset: 0 }}>
          {mapa && mapa.municipios.map((m) => (
            <path key={m.id} d={m.d}
              fill={activos.has(m.id) ? "color-mix(in oklch, var(--galeras) 18%, var(--paper))" : "var(--paper)"}
              stroke="var(--line-2)" strokeWidth="1" strokeLinejoin="round">
              <title>{m.nombre}</title>
            </path>
          ))}
        </svg>
        {placed.map(({ s, muni }) => {
          if (!muni) return null;
          const rank = rankOf(s.id);
          const size = rank === 1 ? 26 : rank <= 3 ? 20 : 14;
          const leftPct = (muni.cx / vw) * 100;
          const topPct = (muni.cy / vh) * 100;
          return (
            // El punto sigue siendo pequeño (es un mapa: si crece, tapa el
            // municipio de al lado), pero el BOTÓN mide 44px transparentes
            // alrededor. Con 14px de área táctil, en un teléfono se acierta a
            // otro stand o a ninguno.
            <button
              key={s.id}
              onClick={() => onDetail(s.id)}
              onMouseEnter={() => setHover(s.id)}
              onMouseLeave={() => setHover(null)}
              aria-label={`${s.nombre} — ${s.municipio}`}
              style={{
                position: "absolute",
                left: leftPct + "%",
                top: topPct + "%",
                transform: "translate(-50%, -50%)",
                width: 44, height: 44, padding: 0,
                background: "transparent", border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                zIndex: hover === s.id ? 5 : 1,
              }}
            >
              <span style={{
                width: size, height: size, borderRadius: "50%",
                background: s.color, border: "2px solid var(--paper)",
                boxShadow: hover === s.id ? `0 0 0 6px ${(s.color || "").replace(")", " / 0.2)")}` : "0 2px 4px oklch(0.22 0.02 60 / 0.2)",
                transition: "box-shadow 0.2s, transform 0.2s",
                transform: hover === s.id ? "scale(1.15)" : "scale(1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--paper)", fontSize: 10, fontWeight: 600,
              }}>
                {rank <= 3 ? rank : ""}
              </span>
              {hover === s.id && (
                <div style={{ position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)", background: "var(--ink)", color: "var(--paper)", padding: "8px 12px", borderRadius: "var(--r-sm)", whiteSpace: "nowrap", fontSize: 12, fontWeight: 500, pointerEvents: "none", zIndex: 10 }}>
                  {s.nombre}
                  <div style={{ fontSize: 10, opacity: 0.7, fontWeight: 400 }}>{s.municipio} · {calcScore(s.votos).toFixed(0)}/100</div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Ficha del stand. Se MIRA, no se vota.
 *
 * Antes esta pantalla llevaba un botón «Votar este stand», y con él el
 * pasaporte se podía llenar entero desde el sofá. El festival existe para que
 * la gente camine el recinto: el voto sólo se abre escaneando el QR que está
 * pegado en el puesto, y aquí se explica en vez de esconderlo.
 *
 * Lo que sí enseña: cómo contactar y dónde queda, la votación de todo el
 * festival y —si esta persona ya votó— la suya, cada una con su título.
 */
const PublicDetail = ({ stand, comentarios, allStands, onBack, onVote }) => {
  // Sólo los que escribieron algo: un voto sin comentario aparecía como un par
  // de comillas vacías con su hora, que no le dice nada a nadie.
  const commentsForStand = comentarios.filter((c) => c.stand === stand.id && (c.texto || "").trim());
  const rank = [...allStands].sort((a, b) => calcScore(b.votos) - calcScore(a.votos)).findIndex((x) => x.id === stand.id) + 1;
  const totalv = totalVotos(stand.votos) || 0;
  const titulos = window.titulosEstrellas();

  // Lo que esta persona votó aquí. Llega del pasaporte y sólo con su testigo:
  // el endpoint es público y la calificación de alguien no lo es.
  const [mio, setMio] = React.useState(null);
  React.useEffect(() => {
    const correo = (window.LMTPerfil && window.LMTPerfil.correoConocido()) || "";
    if (!correo) return;
    let vivo = true;
    const intentar = async () => {
      if (!vivo || !window.LMTApi || !window.LMTApi.enabled) return;
      try {
        const t = (window.LMTPerfil && window.LMTPerfil.testigoDe(correo)) || "";
        const p = await window.LMTApi.getPasaporte(correo, t);
        if (!vivo) return;
        setMio({
          visitado: (p.visitados || []).indexOf(stand.id) >= 0,
          estrellas: (p.estrellas_mias || {})[stand.id] || null,
          emoji: (p.valoraciones || {})[stand.id] || "",
          cuando: (p.sellado_en || {})[stand.id] || "",
        });
      } catch (_) { /* sin pasaporte todavía: la ficha se ve igual */ }
    };
    intentar();
    window.addEventListener("lmt:auth", intentar);
    return () => { vivo = false; window.removeEventListener("lmt:auth", intentar); };
  }, [stand.id]);

  const contacto = [
    stand.direccion && { k: "Dirección", v: stand.direccion },
    (stand.municipio || stand.region) && { k: "Dónde", v: [stand.municipio, stand.region].filter(Boolean).join(" · ") },
    stand.correo && { k: "Correo", v: stand.correo, href: "mailto:" + stand.correo },
    stand.telefono && { k: "Teléfono", v: stand.telefono, href: "tel:" + stand.telefono },
    stand.sitio_web && { k: "Sitio web", v: stand.sitio_web, href: stand.sitio_web },
  ].filter(Boolean);

  return (
    <div style={{ minHeight: "100dvh", background: "var(--paper)" }}>
      <PublicHeader/>
      <section className="seccion" style={{ paddingTop: 32, paddingBottom: 32, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 32 }}>
        <div>
          <a href="/festival" data-route style={{ color: "var(--ink-2)", fontSize: 13 }}>← Volver al ranking</a>
          <div className="mono" style={{ marginTop: 14 }}>Posición #{rank || "—"} · {stand.municipio}</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "min(72px, 9vw)", fontWeight: 400, margin: "8px 0 0", lineHeight: 0.9, letterSpacing: "-0.02em" }}>
            {stand.nombre}
          </h1>
          <p style={{ fontSize: 15, color: "var(--ink-2)", marginTop: 18, maxWidth: 540, lineHeight: 1.6 }}>{stand.descripcion}</p>
          {/* auto-fit: en un teléfono, tres columnas fijas parten «Calificación»
              en dos líneas y descuadran las tres tarjetas. */}
          <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 130px), 1fr))", gap: 14 }}>
            {[
              { k: "Calificación", v: calcScore(stand.votos).toFixed(0), sub: "/ 100" },
              { k: "Votos", v: totalv, sub: "totales" },
              { k: "Aprobación", v: totalv > 0 ? Math.round(stand.votos.bueno / totalv * 100) + "%" : "—", sub: "excelente" },
            ].map((m) => (
              <div key={m.k} style={{ padding: 14, border: "1px solid var(--line)", borderRadius: "var(--r-md)" }}>
                <div className="mono">{m.k}</div>
                <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 32, marginTop: 6, lineHeight: 1 }}>{m.v}</div>
                <div className="sub-metrica" style={{ color: "var(--ink-3)" }}>{m.sub}</div>
              </div>
            ))}
          </div>
          {/* Las tres valoraciones de todo el festival, con los títulos que
              haya puesto el organizador. */}
          <div style={{ marginTop: 24, padding: 18, border: "1px solid var(--line)", borderRadius: "var(--r-md)" }}>
            <div className="mono" style={{ marginBottom: 10 }}>Votación del festival</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 340 }}>
              {ESTRELLA_CAMPOS.map((campo) => (
                <EstrellasLectura key={campo} etiqueta={titulos[campo]} tam={16}
                  valor={(stand.estrellas || {})[ESTRELLA_CLAVES[campo]]}/>
              ))}
            </div>
            <div className="mono" style={{ marginTop: 10, color: "var(--ink-3)" }}>
              {(stand.estrellas && stand.estrellas.n) || 0} personas puntuaron con estrellas
            </div>
          </div>

          {/* Y la de quien está mirando, si votó aquí. */}
          {mio && mio.visitado && (
            <div style={{ marginTop: 16, padding: 18, border: "1px solid var(--cafeto)", borderRadius: "var(--r-md)", background: "var(--paper-2)" }}>
              <div className="mono" style={{ marginBottom: 10, color: "var(--cafeto)" }}>✓ Mi votación</div>
              {mio.estrellas ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 340 }}>
                  {ESTRELLA_CAMPOS.map((campo) => (
                    <EstrellasLectura key={campo} etiqueta={titulos[campo]} tam={16}
                      valor={mio.estrellas[ESTRELLA_CLAVES[campo]]}/>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: "var(--ink-2)" }}>
                  Votaste con un toque, sin estrellas.
                </div>
              )}
              {mio.emoji && (
                <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 8 }}>
                  Tu calificación: <strong style={{ fontWeight: 500 }}>
                    {{ bueno: "Excelente", regular: "Regular", malo: "Mejorable" }[mio.emoji] || mio.emoji}
                  </strong>
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: 24, padding: 18, background: "var(--paper-2)", borderRadius: "var(--r-md)" }}>
            <div className="mono" style={{ marginBottom: 10 }}>Distribución</div>
            {[
              { k: "Excelente", v: stand.votos.bueno, color: "var(--good)", emoji: "😍" },
              { k: "Regular", v: stand.votos.regular, color: "var(--meh)", emoji: "😐" },
              { k: "Malo", v: stand.votos.malo, color: "var(--bad)", emoji: "😞" },
            ].map((r) => {
              const pct = totalv > 0 ? (r.v / totalv) * 100 : 0;
              return (
                <div key={r.k} style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 0" }}>
                  <span style={{ fontSize: 18 }}>{r.emoji}</span>
                  <span style={{ width: 80, fontSize: 13 }}>{r.k}</span>
                  <div style={{ flex: 1, height: 6, background: "var(--paper)", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ width: pct + "%", height: "100%", background: r.color, transition: "width 0.5s" }}/>
                  </div>
                  <span className="mono" style={{ width: 60, textAlign: "right" }}>{pct.toFixed(0)}% · {r.v}</span>
                </div>
              );
            })}
          </div>
        </div>
        <aside>
          {/* Sin el botón de votar, la proporción fija dejaba medio bloque de
              color vacío. Crece con lo que tenga dentro. */}
          <div style={{ minHeight: 260, background: stand.color, borderRadius: "var(--r-md)", padding: 28, color: "var(--paper)", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 24, position: "relative", overflow: "hidden" }}>
            <div className="mono" style={{ color: "oklch(0.95 0.01 75)" }}>#{stand.id.toUpperCase()}</div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 40, lineHeight: 0.95, letterSpacing: "-0.02em" }}>{stand.nombre}</div>
              <div style={{ fontSize: 13, marginTop: 12, opacity: 0.85 }}>{stand.direccion}</div>
              <div style={{ fontSize: 13, marginTop: 4, opacity: 0.85 }}>{stand.correo}</div>
            </div>
            {/* Aquí iba «Votar este stand». Se quitó a propósito: con él el
                pasaporte se llenaba entero sin pisar el recinto. */}
            <div style={{
              background: "rgba(255,255,255,0.15)", borderRadius: "var(--r-sm)",
              padding: "12px 14px", fontSize: 13, lineHeight: 1.55,
            }}>
              {mio && mio.visitado
                ? "Ya sellaste este stand en tu pasaporte."
                : "Para votar, escanea el código QR que está en el puesto. Así el sello dice que estuviste ahí."}
            </div>
          </div>

          {contacto.length > 0 && (
            <div style={{ marginTop: 20, border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: 18 }}>
              <div className="mono" style={{ marginBottom: 10 }}>Contacto</div>
              {contacto.map((c) => (
                <div key={c.k} style={{ display: "flex", gap: 10, padding: "5px 0", fontSize: 13, alignItems: "baseline" }}>
                  <span className="mono" style={{ color: "var(--ink-3)", flex: "0 0 80px" }}>{c.k}</span>
                  <span style={{ flex: 1, minWidth: 0, wordBreak: "break-word" }}>
                    {c.href
                      ? <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noopener" style={{ color: "var(--cafeto)" }}>{c.v}</a>
                      : c.v}
                  </span>
                </div>
              ))}
            </div>
          )}

          {typeof stand.lat === "number" && typeof stand.lng === "number" && (
            <div style={{ marginTop: 20 }}>
              <div className="mono" style={{ marginBottom: 10 }}>Dónde queda</div>
              <SelectorUbicacion lat={stand.lat} lng={stand.lng} municipio={stand.municipio}
                alto={260} soloLectura onCambio={() => {}}/>
            </div>
          )}

          <div style={{ marginTop: 20 }}>
            <div className="mono" style={{ marginBottom: 10 }}>Comentarios recientes</div>
            {commentsForStand.length === 0 && (
              <div style={{ fontSize: 13, color: "var(--ink-3)", fontStyle: "italic", fontFamily: "var(--font-display)" }}>
                Aún no hay comentarios. Sé el primero.
              </div>
            )}
            {commentsForStand.map((c, i) => (
              <div key={i} style={{ padding: "12px 0", borderBottom: i < commentsForStand.length - 1 ? "1px solid var(--line)" : "none" }}>
                <div style={{ fontSize: 13, fontFamily: "var(--font-display)", fontStyle: "italic", lineHeight: 1.4 }}>"{c.texto}"</div>
                <div className="mono" style={{ marginTop: 6 }}>{c.autor} · {c.hora}</div>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
};

Object.assign(window, { PublicDashboard, MapaNarino, PublicDetail, PublicHeader });
