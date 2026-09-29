// Configuración — /admin/configuracion/*
//
// Seis pantallas que antes eran seis entradas sueltas del menú, cuando todas
// responden a la misma pregunta: cómo está montado el festival, no qué está
// pasando en él. Juntas, el menú lateral se queda con lo del día a día
// —espacios, promotores, QR, actividad, visitantes— y lo que se toca una vez
// al montar el evento vive detrás de una sola puerta.
//
// Cada pestaña conserva la URL que tenía (`alias`): hay enlaces a /admin/correo
// en el asistente de instalación, en el README y en los correos de aviso, y
// romperlos no aporta nada. La URL nueva es la que usa la barra de pestañas.
//
// El orden no es el alfabético ni el de la petición: va de lo que más se toca a
// lo que menos, y «Empezar de cero» al final. Una acción destructiva nunca
// debería ser la pestaña a la que se llega por defecto.

const CONFIG_PESTANAS = [
  { id: "festival", etiqueta: "Personalización", sub: "Títulos, columnas y fondos",
    ruta: "/admin/configuracion/personalizacion", alias: ["/admin/festival"] },
  { id: "interfaz", etiqueta: "Interfaz", sub: "Colores, letra y textos",
    ruta: "/admin/configuracion/interfaz", alias: ["/admin/interfaz"] },
  { id: "correo", etiqueta: "Correo", sub: "Envío y pruebas",
    ruta: "/admin/configuracion/correo", alias: ["/admin/correo"] },
  { id: "correos", etiqueta: "Bitácora", sub: "Mensajes enviados",
    ruta: "/admin/configuracion/bitacora", alias: ["/admin/correos"] },
  { id: "cuentas", etiqueta: "Administradores", sub: "Cuentas de acceso",
    ruta: "/admin/configuracion/administradores", alias: ["/admin/cuentas"], propietario: true },
  { id: "sistema", etiqueta: "Empezar de cero", sub: "Borrar datos de prueba",
    ruta: "/admin/configuracion/sistema", alias: ["/admin/sistema"], propietario: true },
];

/** La pestaña que corresponde a una ruta, o null si la ruta no es de aquí. */
const pestanaConfigPorRuta = (ruta) => {
  const limpia = String(ruta || "").replace(/\/+$/, "");
  if (limpia === "/admin/configuracion") return CONFIG_PESTANAS[0];
  return CONFIG_PESTANAS.find((p) => p.ruta === limpia || p.alias.includes(limpia)) || null;
};

/** Las pestañas que puede ver esta cuenta. */
const pestanasVisibles = (user) =>
  CONFIG_PESTANAS.filter((p) => !p.propietario || (user && user.rol === "propietario"));

const ConfiguracionShell = ({ tab, user, children }) => {
  const visibles = pestanasVisibles(user);
  const actual = CONFIG_PESTANAS.find((p) => p.id === tab);
  return (
    <AdminShell active="configuracion" user={user}>
      <div className="admin-page config-page">
        <div className="mono">Configuración</div>
        {/* Una barra de pestañas y no un desplegable: son seis, caben, y
            verlas todas a la vez es lo que dice qué se puede configurar. En el
            móvil se desplaza en horizontal, como el menú lateral. */}
        <nav className="config-pestanas" aria-label="Secciones de configuración">
          {visibles.map((p) => (
            <a key={p.id} href={p.ruta} data-route
              aria-current={p.id === tab ? "page" : undefined}
              className={"config-pestana" + (p.id === tab ? " activa" : "")}>
              <span>{p.etiqueta}</span>
              <span className="mono config-pestana-sub">{p.sub}</span>
            </a>
          ))}
        </nav>
        <div className="config-cuerpo" data-pestana={actual ? actual.id : ""}>
          {children}
        </div>
      </div>
    </AdminShell>
  );
};

/** La pantalla de cada pestaña. Las páginas son las de siempre, sin cambios. */
const ConfiguracionPage = ({ tab, user }) => {
  let cuerpo;
  if (tab === "festival")      cuerpo = <FestivalPage/>;
  else if (tab === "interfaz") cuerpo = <InterfazPage/>;
  else if (tab === "correo")   cuerpo = <AdminCorreoConfig/>;
  else if (tab === "correos")  cuerpo = <AdminCorreos/>;
  else if (tab === "cuentas")  cuerpo = <AdminCuentas user={user}/>;
  else if (tab === "sistema")  cuerpo = <SistemaPage/>;
  else cuerpo = <div>—</div>;
  return <ConfiguracionShell tab={tab} user={user}>{cuerpo}</ConfiguracionShell>;
};

Object.assign(window, {
  CONFIG_PESTANAS, pestanaConfigPorRuta, pestanasVisibles,
  ConfiguracionShell, ConfiguracionPage,
});
