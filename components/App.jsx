// Raíz del SPA: paleta, tabla de rutas y montaje de React.
// Vive aquí (y no incrustado en app.php) para que el compilador de JSX
// pueda precompilarlo junto al resto de componentes.

const PALETTES = {
  "nariño":  { grano: "oklch(0.42 0.09 50)", galeras: "oklch(0.55 0.13 30)", cafeto: "oklch(0.5 0.08 145)",  paper: "oklch(0.97 0.015 75)", ink: "oklch(0.22 0.02 60)" },
  "mercado": { grano: "oklch(0.4 0.12 30)",  galeras: "oklch(0.6 0.17 45)",  cafeto: "oklch(0.55 0.11 130)", paper: "oklch(0.96 0.025 80)", ink: "oklch(0.22 0.03 50)" },
};
const applyPalette = (name) => {
  const p = PALETTES[name] || PALETTES["mercado"];
  const r = document.documentElement.style;
  Object.entries(p).forEach(([k, v]) => r.setProperty("--" + k, v));
};
// Paleta del diseño aprobado (handoff Claude Design): "mercado".
applyPalette("mercado");

const App = () => {
  const [route, setRoute] = React.useState(() => window.LMTRouter.current());
  const [user, setUser]   = React.useState(() => (window.LMTApi && window.LMTApi.user()) || null);
  const [ready, setReady] = React.useState(() => !!(window.LMTApi && window.LMTApi.bootstrapDone && window.LMTApi.bootstrapDone()));
  const [, setTick]       = React.useState(0);

  React.useEffect(() => {
    const off1 = window.LMTRouter.subscribe(setRoute);
    const onAuth = () => {
      setUser((window.LMTApi && window.LMTApi.user()) || null);
      setReady(true);
    };
    window.addEventListener("lmt:auth", onAuth);
    const onData = () => setTick((t) => t + 1);
    window.addEventListener("lmt:data", onData);
    // Safety: si LMTApi nunca dispara auth (API caída), igualmente desbloquear UI tras 1.5s.
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

  // Hasta que termine el bootstrap, no decidimos si redirigir a login (evita parpadeo).
  if (!ready && route.path.startsWith("/admin") && route.path !== "/admin/login") {
    return <Splash/>;
  }

  // Auth gate para /admin/*
  if (route.path.startsWith("/admin") && route.path !== "/admin/login") {
    if (!user || !user.admin) {
      window.LMTRouter.go("/admin/login");
      return null;
    }
    // Contraseña que llegó por correo: el panel no se abre hasta cambiarla.
    // El backend rechaza igualmente el resto de rutas, esto sólo evita
    // enseñar una pantalla que respondería 403 en cada consulta.
    if (user.must_change) return <AdminCambioClave user={user}/>;
  }

  // 1. Pantalla de inicio (landing) — login de organizadores + entrada de visitante.
  //    El QR de los stands lleva directo a /s/{id}, sin pasar por aquí.
  if (route.path === "/" || route.path === "") {
    return <LoginAdmin
      onLogin={() => window.LMTRouter.go("/admin")}
      onVisitor={() => window.LMTRouter.go("/festival")}/>;
  }

  // 1b. Dashboard público del festival
  if (route.path === "/festival" || route.path === "/festival/") {
    return <PublicDashboard
      stands={stands}
      comentarios={comentarios}
      onDetail={(id) => window.LMTRouter.go("/festival/" + id)}/>;
  }

  // 2. Detalle público de stand
  const festivalMatch = route.path.match(/^\/festival\/([a-z0-9\-]+)$/);
  if (festivalMatch) {
    const stand = stands.find((s) => s.id === festivalMatch[1]);
    if (!stand) return <NotFound back="/festival"/>;
    return <PublicDetail stand={stand} comentarios={comentarios} allStands={stands}
      onBack={() => window.LMTRouter.go("/festival")}
      onVote={() => window.LMTRouter.go("/s/" + stand.id)}/>;
  }

  // 3. Voto desde QR — mobile real
  const voteMatch = route.path.match(/^\/s\/([a-z0-9\-]+)$/);
  if (voteMatch) {
    const stand = stands.find((s) => s.id === voteMatch[1]);
    if (!stand) {
      // Stand puede no estar aún si la primera carga aún no llegó
      if (!stands.length) return <Splash/>;
      return <NotFound back="/"/>;
    }
    return <MobileVotePage stand={stand}/>;
  }

  // 4. Pasaporte del usuario (real)
  if (route.path === "/pasaporte") {
    return <PassportPage stands={stands}/>;
  }

  // 4b. Promotores de stands: inscripción pública y portal privado.
  if (route.path === "/inscripcion" || route.path === "/inscripcion/") {
    return <PromotorRegistroPage/>;
  }
  if (route.path === "/promotor" || route.path === "/promotor/") {
    return <PromotorPage/>;
  }

  // 4c. Perfil del visitante: caracterización voluntaria tras votar.
  if (route.path === "/perfil" || route.path === "/perfil/") {
    return <PerfilVisitantePage/>;
  }

  // 5. Admin login
  if (route.path === "/admin/login") {
    return <LoginAdmin onLogin={() => window.LMTRouter.go("/admin")}/>;
  }

  // 6. Admin home → stands
  if (route.path === "/admin" || route.path === "/admin/stands") {
    return <AdminPage section="stands" user={user} stands={stands}/>;
  }
  if (route.path === "/admin/stands/new") {
    return <AdminPage section="editor" user={user} stands={stands} editingId={null}/>;
  }
  const editMatch = route.path.match(/^\/admin\/stands\/([a-z0-9\-]+)\/edit$/);
  if (editMatch) {
    return <AdminPage section="editor" user={user} stands={stands} editingId={editMatch[1]}/>;
  }
  if (route.path === "/admin/qr") {
    return <AdminPage section="qr" user={user} stands={stands}/>;
  }
  if (route.path === "/admin/live") {
    return <AdminPage section="live" user={user} stands={stands} comentarios={comentarios}/>;
  }
  if (route.path === "/admin/promotores") {
    return <AdminPage section="promotores" user={user} stands={stands}/>;
  }
  if (route.path === "/admin/correos") {
    return <AdminPage section="correos" user={user} stands={stands}/>;
  }
  if (route.path === "/admin/caracterizacion") {
    return <AdminPage section="caracterizacion" user={user} stands={stands}/>;
  }
  if (route.path === "/admin/cuentas") {
    if (user.rol !== "propietario") return <NotFound back="/admin"/>;
    return <AdminPage section="cuentas" user={user} stands={stands}/>;
  }

  return <NotFound back="/"/>;
};

const Splash = () => (<div className="splash">Cargando…</div>);

const NotFound = ({ back }) => (
  <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 24, textAlign: "center", background: "var(--paper)" }}>
    <div>
      <div className="mono">404</div>
      <h1 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 56, margin: "12px 0", lineHeight: 1 }}>Página no encontrada.</h1>
      <a href={back} data-route className="btn btn-primary">← Volver al inicio</a>
    </div>
  </div>
);

window.NotFound = NotFound;
window.Splash = Splash;

const waitForGlobals = () => {
  const needed = ["LoginAdmin", "AdminPage", "MobileVotePage", "PassportPage", "PublicDashboard", "PublicDetail",
                  "PromotorRegistroPage", "PromotorPage", "AdminPromotores", "AdminCuentas", "AdminCambioClave",
                  "PerfilVisitantePage", "AdminCaracterizacion"];
  if (needed.every((k) => window[k])) {
    ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
  } else {
    setTimeout(waitForGlobals, 40);
  }
};
waitForGlobals();
