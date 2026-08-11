<?php
// router.php — para desarrollo con `php -S 127.0.0.1:8000 router.php`.
// En producción, Apache + .htaccess hace lo mismo.

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/';

// 1) Bloquear acceso directo a config y librerías
if (preg_match('#^/api/(config|lib/|routes/)#', $path)) {
    http_response_code(403);
    exit('forbidden');
}

// 2) Si no hay api/config.php, redirige al asistente (excepto para /api/* e /install.php)
if (!is_file(__DIR__ . '/api/config.php')
    && $path !== '/install.php'
    && strpos($path, '/api') !== 0) {
    if (!is_file(__DIR__ . $path)) {
        header('Location: /install.php', true, 302);
        exit;
    }
}

// 3) /api/...
if (strpos($path, '/api') === 0) {
    // Los .php reales de api/ (check.php, diag.php) se sirven tal cual, igual
    // que hace Apache. Antes el front controller se los tragaba y no había
    // forma de probarlos en desarrollo — justo los dos ficheros cuyo control
    // de acceso conviene poder verificar.
    $real = __DIR__ . $path;
    if (preg_match('#^/api/[a-z0-9_-]+\.php$#i', $path) && is_file($real)
        && basename($real) !== 'index.php' && basename($real) !== 'config.php') {
        require $real;
        return true;
    }
    require __DIR__ . '/api/index.php';
    return true;
}

// 4) Rutas de la SPA → app.php
$spaRoute = (
    $path === '/' ||
    $path === '/app.php' ||
    preg_match('#^/s/[a-z0-9\-]{2,32}/?$#', $path) ||
    preg_match('#^/admin(/.*)?$#', $path) ||
    preg_match('#^/festival(/[a-z0-9\-]+)?/?$#', $path) ||
    $path === '/pasaporte' || $path === '/pasaporte/' ||
    $path === '/inscripcion' || $path === '/inscripcion/' ||
    $path === '/promotor' || $path === '/promotor/' ||
    $path === '/perfil' || $path === '/perfil/'
);
if ($spaRoute) {
    require __DIR__ . '/app.php';
    return true;
}

// 5) Archivo estático
$file = __DIR__ . $path;
if (is_file($file)) return false;

http_response_code(404);
echo 'not found';
