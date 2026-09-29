<?php
// app.php — shell SPA renderizado por PHP.
// Calcula el `base href` correcto sin importar si la app vive en la raíz
// (https://lamejortaza.co/) o en un subdirectorio (https://host/lamejortaza/).

declare(strict_types=1);
if (!defined('LMT_GUARD')) define('LMT_GUARD', true);

$scriptDir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/'));
$scriptDir = rtrim($scriptDir, '/');
$base = $scriptDir === '' ? '' : $scriptDir;
$baseHref = ($base === '' ? '/' : $base . '/');

// Si aún no se ha instalado, manda al asistente.
if (!is_file(__DIR__ . '/api/config.php')) {
    header('Location: ' . $baseHref . 'install.php', true, 302);
    exit;
}

// Si llega un error grave (config corrupto, fs read-only…) no reventamos.
set_exception_handler(function (\Throwable $e) use ($baseHref) {
    error_log('[lmt][app] ' . $e->getMessage());
    http_response_code(500);
    header('Content-Type: text/html; charset=utf-8');
    echo '<!doctype html><meta charset="utf-8"><title>Error</title>';
    echo '<style>body{font-family:system-ui;padding:48px;color:#222;background:#f6efe2}';
    echo 'h1{font-style:italic;font-family:Georgia,serif;font-weight:400;font-size:36px;margin:0 0 12px}';
    echo 'a{color:#a8593a}</style>';
    echo '<h1>Algo salió mal en el servidor.</h1>';
    echo '<p>Vuelve a intentarlo en unos segundos. Si persiste, avisa al organizador del festival.</p>';
    echo '<p><a href="' . htmlspecialchars($baseHref) . '">← Volver al inicio</a></p>';
    exit;
});

header('Content-Type: text/html; charset=utf-8');
// Si llegamos vía ErrorDocument 404 (hosts sin mod_rewrite), forzamos 200
// porque el SPA decidirá la ruta y mostrará el contenido apropiado.
http_response_code(200);
header('Cache-Control: no-store, must-revalidate');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Permissions-Policy: camera=(), microphone=(), geolocation=(self), interest-cohort=()');

$cfg = include __DIR__ . '/api/config.php';
$secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
if ($secure) header('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');

// ---------------------------------------------------------------------------
// Apariencia (Configuración → Interfaz)
// ---------------------------------------------------------------------------
// El tema va incrustado en esta primera respuesta y no se pide después por
// AJAX: pedirlo después es pintar primero con los colores de fábrica y cambiar
// a los propios medio segundo más tarde, delante del visitante.
//
// La fila se lee con una conexión propia y todo va dentro de un try: Db::pdo()
// responde con JSON cuando la base no contesta, y aquí eso sustituiría la
// página entera. Sin base, la aplicación arranca con el aspecto de fábrica.
//
// `?tema=original` se salta los colores y la letra. Es la salida de emergencia
// si alguien guarda una combinación ilegible y ya no puede leer el panel para
// deshacerla.
$rutaSpa = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
if ($base !== '' && strpos($rutaSpa, $base) === 0) $rutaSpa = substr($rutaSpa, strlen($base)) ?: '/';
$temaOriginal = (($_GET['tema'] ?? '') === 'original');
$interfaz = null;
try {
    require_once __DIR__ . '/api/lib/Validate.php';
    require_once __DIR__ . '/api/lib/Config.php';
    require_once __DIR__ . '/api/lib/Uploads.php';
    require_once __DIR__ . '/api/lib/Interfaz.php';
    $db = (array) ($cfg['db'] ?? []);
    $pdo = new PDO((string) ($db['dsn'] ?? ''), $db['user'] ?? null, $db['password'] ?? null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT => 3,
    ]);
    $st = $pdo->prepare('SELECT valor FROM ajustes WHERE clave = :c');
    $st->execute([':c' => 'interfaz']);
    $guardado = json_decode((string) ($st->fetchColumn() ?: '[]'), true);
    $interfaz = \LMT\Interfaz::publico(\LMT\Interfaz::normalizar(is_array($guardado) ? $guardado : []));
    $pdo = null;
} catch (\Throwable $e) {
    error_log('[lmt][app] interfaz: ' . $e->getMessage());
}
$area = class_exists('LMT\\Interfaz') ? \LMT\Interfaz::areaDeRuta($rutaSpa) : 'plataforma';
// Nada de lo que hay en el CSS lo escribe una persona (ver Interfaz::css), pero
// un `</` no tiene nada que hacer dentro de un <style> y no cuesta cerrarlo.
$temaCss = ($interfaz && !$temaOriginal) ? str_replace('</', '<\\/', (string) $interfaz['css']) : '';
$nombreMarca = 'La Mejor Taza';
if ($interfaz && isset($interfaz['textos']->{'plataforma.marca.nombre'})) {
    $nombreMarca = (string) $interfaz['textos']->{'plataforma.marca.nombre'};
}
$favicon = ($interfaz && $interfaz['favicon'] !== '') ? $interfaz['favicon'] : '';

$bootstrap = [
    'base'    => $base,
    // Apuntamos directo al front controller PHP. Funciona con o sin
    // mod_rewrite — el cliente añade `?path=...` con la ruta deseada.
    'apiBase' => $base . '/api/index.php',
    'siteName'=> 'La Mejor Taza',
    // Límites reales de las imágenes, para que el formulario anuncie los del
    // servidor y no una cifra escrita a mano que se queda desfasada cuando el
    // operador cambia api/config.php.
    'uploads' => [
        'maxBytes' => max(65536, (int) ($cfg['uploads']['max_bytes'] ?? 3 * 1024 * 1024)),
        'maxDim'   => max(320, min(4000, (int) ($cfg['uploads']['max_dim'] ?? 1600))),
    ],
    // Textos, iconos y logotipos de Configuración → Interfaz. El CSS no va
    // aquí: ya está en el <style id="lmt-tema"> de la cabecera.
    'interfaz' => $interfaz ? array_diff_key($interfaz, ['css' => 1]) : null,
    'temaOriginal' => $temaOriginal,
];

// ---------------------------------------------------------------------------
// Cómo se cargan los componentes
// ---------------------------------------------------------------------------
// Si existe el bundle precompilado (js/components.build.js, generado por
// tools/build-components.mjs y versionado en el repo) el navegador ejecuta
// JavaScript normal: nada de Babel, nada de transpilar en el móvil del
// visitante, y la CSP puede prohibir eval.
//
// Si no existe —desarrollo, o alguien tocó un .jsx y no regeneró— caemos al
// modo Babel en el navegador. Funciona igual, pero descarga 3 MB y obliga a
// permitir 'unsafe-eval', así que avisamos por consola.
$bundle      = __DIR__ . '/js/components.build.js';
$usarBundle  = is_file($bundle);
$bundleVersion = $usarBundle ? (string) filemtime($bundle) : '';

// El mismo orden que tools/build-components.mjs (cada archivo usa lo que
// publican los anteriores). La lista se había quedado atrás —faltaban
// Recorrido, Economía, Personalización y Sistema— y el modo sin bundle
// arrancaba con pantallas que no existían.
$componentes = ['Shared', 'Mapa', 'Admin', 'QRPrint', 'VoteFlow', 'Passport', 'Dashboard', 'Recorrido',
                'Promotores', 'Cuentas', 'Perfil', 'Caracterizacion', 'Economia', 'Festival', 'Sistema',
                'Correo', 'Interfaz', 'Configuracion', 'App'];

// ¿El bundle quedó viejo respecto a algún .jsx? Es el único fallo de este
// esquema y es silencioso, así que lo detectamos explícitamente.
$bundleObsoleto = false;
if ($usarBundle) {
    foreach ($componentes as $c) {
        $jsx = __DIR__ . '/components/' . $c . '.jsx';
        if (is_file($jsx) && filemtime($jsx) > filemtime($bundle)) { $bundleObsoleto = true; break; }
    }
}

// Nonce por petición: con él la CSP puede autorizar exactamente los dos
// scripts en línea de esta página y descartar 'unsafe-inline' (en CSP nivel 3
// la presencia de un nonce hace que 'unsafe-inline' se ignore; lo dejamos sólo
// como red de seguridad para navegadores antiguos).
$nonce = base64_encode(random_bytes(16));

$csp = "default-src 'self'; "
     . "script-src 'self' 'nonce-" . $nonce . "' 'unsafe-inline'" . ($usarBundle ? '' : " 'unsafe-eval'") . '; '
     // Los componentes usan estilos en línea de React de punta a punta: quitar
     // 'unsafe-inline' aquí exigiría reescribir toda la interfaz a hojas de estilo.
     . "style-src 'self' 'unsafe-inline'; "
     . "font-src 'self' data:; "
     . "img-src 'self' data: blob:; "
     . "connect-src 'self'; "
     . "frame-ancestors 'self'; "
     . "base-uri 'self'; "
     . "form-action 'self'; "
     . "object-src 'none'";
// La CSP va como cabecera HTTP: en <meta> el navegador ignora frame-ancestors
// (y con ello la protección contra clickjacking que se creía tener).
header('Content-Security-Policy: ' . $csp);
?>
<!doctype html>
<html lang="es" data-area="<?= htmlspecialchars($area, ENT_QUOTES) ?>">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
<meta name="referrer" content="strict-origin-when-cross-origin"/>
<meta name="color-scheme" content="light"/>
<base href="<?= htmlspecialchars($baseHref, ENT_QUOTES) ?>"/>
<title><?= htmlspecialchars($nombreMarca, ENT_QUOTES) ?> — Pasaporte del Café de Nariño</title>
<?php if ($favicon !== ''): ?>
<link rel="icon" href="<?= htmlspecialchars($favicon, ENT_QUOTES) ?>"/>
<link rel="apple-touch-icon" href="<?= htmlspecialchars($favicon, ENT_QUOTES) ?>"/>
<?php else: ?>
<link rel="icon" href="favicon.svg" type="image/svg+xml"/>
<link rel="apple-touch-icon" href="favicon.svg"/>
<?php endif; ?>
<meta name="theme-color" content="#38322c"/>
<!-- Tipografías servidas desde este mismo dominio: ni la CDN de Google recibe
     la IP de los visitantes, ni la interfaz depende de que sea alcanzable. -->
<link rel="stylesheet" href="styles/fonts.css"/>
<link rel="stylesheet" href="styles/tokens.css"/>
<!-- Configuración → Interfaz. Va DESPUÉS de tokens.css: a igual especificidad
     gana la última regla, y así lo propio pisa a lo de fábrica. -->
<style id="lmt-tema"><?= $temaCss ?></style>
<style>
  /* min-height, NO height. Con `height: 100%` el elemento html quedaba fijado
     a la altura de la ventana y, al llevar además overflow-x: hidden, recortaba
     todo lo que sobrara en vertical: en un teléfono la página simplemente no se
     desplazaba y el panel de administración se quedaba en la primera pantalla.
     Con min-height el documento crece con su contenido y vuelve a haber scroll. */
  html, body { min-height: 100%; }
  body { overflow-x: hidden; }
  #root { min-height: 100dvh; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-thumb { background: var(--line-2); border-radius: 999px; }
  ::-webkit-scrollbar-track { background: transparent; }
  .lmt-three-wrap { position: relative; }
  .lmt-three-wrap > *:not(canvas) { position: relative; z-index: 1; }
  /* Vista mobile-first para /s/{id} y /pasaporte sobre desktop: ancho cómodo, fondo papel */
  .mobile-page { min-height: 100dvh; background: var(--paper); }
  .mobile-page .mobile-inner { max-width: 460px; margin: 0 auto; padding: 24px 20px 32px; }
  @media (min-width: 720px) {
    .mobile-page { padding-top: 32px; padding-bottom: 32px; background: var(--paper-2); }
    .mobile-page .mobile-inner { background: var(--paper); border-radius: var(--r-md); border: 1px solid var(--line); box-shadow: var(--shadow-2); padding: 28px 24px 36px; }
  }
  .splash { display:flex;align-items:center;justify-content:center;height:100dvh;color:var(--ink-3);font-family:var(--font-mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase; }
</style>
</head>
<body>
<div id="root"><div class="splash">Cargando…</div></div>

<script nonce="<?= htmlspecialchars($nonce, ENT_QUOTES) ?>">
window.LMT_BOOTSTRAP = <?= json_encode($bootstrap, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
window.LMT_BASE_URL  = window.LMT_BOOTSTRAP.base;
window.LMT_API_BASE  = window.LMT_BOOTSTRAP.apiBase;
</script>

<!-- Utilidades de seguridad -->
<script src="js/security.js"></script>

<!-- Geometría de los 64 municipios de Nariño (TopoJSON pre-proyectado a paths
     SVG; sin dependencias en runtime). Expone window.NARINO_MAPA. -->
<script src="js/narino-municipios.js"></script>

<!-- three.js (animaciones) — auto-hospedado para no depender de CDNs externas.
     Desde r160 el único build soportado es un módulo ES, y los módulos corren
     después de los scripts clásicos: js/three-loader.js expone whenThree() para
     que los consumidores esperen sin condiciones de carrera. -->
<script src="js/three-loader.js"></script>
<script type="module" nonce="<?= htmlspecialchars($nonce, ENT_QUOTES) ?>">
  import * as THREE from "./js/vendor/three.module.min.js";
  window.THREE = THREE;
  window.dispatchEvent(new CustomEvent("lmt:three-ready"));
</script>
<script src="js/three-background.js"></script>
<script src="js/passport-book.js"></script>

<!-- Cliente del backend PHP + router del SPA -->
<script src="js/router.js"></script>
<script src="js/api.js"></script>

<!-- React — builds de PRODUCCIÓN auto-hospedadas. Antes se cargaban las de
     desarrollo desde unpkg.com: más pesadas, más lentas, y con la aplicación
     entera dependiendo de que una CDN de terceros estuviera disponible. -->
<script src="js/vendor/react.production.min.js"></script>
<script src="js/vendor/react-dom.production.min.js"></script>

<?php if ($usarBundle): ?>
<!-- Componentes precompilados (tools/build-components.mjs). -->
<script src="js/components.build.js?v=<?= htmlspecialchars($bundleVersion, ENT_QUOTES) ?>"></script>
<?php if ($bundleObsoleto): ?>
<script nonce="<?= htmlspecialchars($nonce, ENT_QUOTES) ?>">
console.warn("[lmt] js/components.build.js es más antiguo que algún .jsx. " +
            "Regenera el bundle con: node tools/build-components.mjs");
</script>
<?php endif; ?>
<?php else: ?>
<!-- Sin bundle: Babel transpila en el navegador. Sirve para desarrollo, pero
     descarga ~3 MB y obliga a permitir 'unsafe-eval' en la CSP. Antes de
     desplegar ejecuta: node tools/build-components.mjs -->
<script src="js/vendor/babel.min.js"></script>
<?php foreach ($componentes as $c): ?>
<script type="text/babel" src="components/<?= $c ?>.jsx"></script>
<?php endforeach; ?>
<script nonce="<?= htmlspecialchars($nonce, ENT_QUOTES) ?>">
console.warn("[lmt] Falta js/components.build.js: se está transpilando JSX en el navegador. " +
            "Genera el bundle con: node tools/build-components.mjs");
</script>
<?php endif; ?>
</body>
</html>
