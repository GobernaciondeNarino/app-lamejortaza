<?php
/**
 * La Mejor Taza — Asistente de instalación (estilo WordPress)
 *
 * Pasos:
 *   1. Bienvenida + chequeo del entorno (PHP, extensiones, permisos).
 *   2. Datos de la base de datos (MySQL/MariaDB o SQLite).
 *   3. Datos del administrador y del sitio.
 *   4. Ejecución (escribe config.php, crea esquema, seed opcional, alta admin).
 *   5. Correo saliente: se configura Y SE PRUEBA de verdad antes de terminar.
 *   6. Confirmación y enlace al panel.
 *
 * Cuando termina, el archivo se autobloquea: si `api/config.php` existe
 * con la marca `'installed' => true`, el instalador rehúsa volver a correr
 * salvo que pases `?reinstall=<token>` con un token presente en el config.
 */

declare(strict_types=1);
if (!defined('LMT_GUARD')) define('LMT_GUARD', true);

ini_set('display_errors', '0');
error_reporting(E_ALL);
mb_internal_encoding('UTF-8');

// ---------------------------------------------------------------------------
// Constantes y rutas
// ---------------------------------------------------------------------------
define('LMT_ROOT', __DIR__);
define('LMT_CONFIG_PATH', LMT_ROOT . '/api/config.php');
define('LMT_SCHEMA_MYSQL', LMT_ROOT . '/db/schema.mysql.sql');
define('LMT_SCHEMA_SQLITE', LMT_ROOT . '/db/schema.sqlite.sql');
define('LMT_SEED', LMT_ROOT . '/db/seed.sql');

session_name('lmt_install');
session_start();
if (empty($_SESSION['_csrf'])) {
    $_SESSION['_csrf'] = bin2hex(random_bytes(32));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function h(?string $s): string { return htmlspecialchars((string)$s, ENT_QUOTES | ENT_HTML5, 'UTF-8'); }

function csrf(): string { return (string) ($_SESSION['_csrf'] ?? ''); }

function check_csrf(): void {
    $sent = $_POST['_csrf'] ?? '';
    if (!is_string($sent) || !hash_equals(csrf(), $sent)) {
        http_response_code(403);
        render_error('Token CSRF inválido. Recarga la página e intenta de nuevo.');
        exit;
    }
}

function go(int $step, array $extra = []): void {
    $url = basename(__FILE__) . '?step=' . $step;
    foreach ($extra as $k => $v) $url .= '&' . urlencode((string)$k) . '=' . urlencode((string)$v);
    header('Location: ' . $url, true, 303);
    exit;
}

function is_installed(): bool {
    if (!is_file(LMT_CONFIG_PATH)) return false;
    try {
        $cfg = include LMT_CONFIG_PATH;
        return is_array($cfg) && !empty($cfg['installed']);
    } catch (\Throwable $e) {
        return false;
    }
}

function reinstall_token_ok(): bool {
    if (!is_file(LMT_CONFIG_PATH)) return false;
    try {
        $cfg = include LMT_CONFIG_PATH;
        $expected = $cfg['reinstall_token'] ?? '';
        $sent = $_GET['reinstall'] ?? '';
        return is_string($sent) && $sent !== '' && is_string($expected) && $expected !== '' && hash_equals($expected, $sent);
    } catch (\Throwable $e) {
        return false;
    }
}

/**
 * Detecta si la instalación quedó "a medias": config.php existe e `installed`
 * es true, pero la tabla `admins` quedó vacía. En ese caso permitimos
 * re-ejecutar el wizard sin pedir el reinstall_token (porque sería absurdo
 * exigir un token cuando ni siquiera hay un admin que lo conozca).
 *
 * OJO — FALLA CERRADO. La versión anterior devolvía true desde el catch: con
 * eso, CUALQUIER fallo de base de datos (corte transitorio, contraseña rotada
 * por el proveedor, timeout bajo la carga de la feria) reabría el asistente
 * completo a un anónimo, que podía recorrerlo, insertar su propio
 * administrador y reescribir api/config.php apuntando a una base suya. Toma de
 * control total del sistema sin ninguna credencial previa.
 *
 * Ahora "no puedo comprobarlo" significa "no abro". La recuperación legítima
 * de una instalación realmente a medias sigue siendo posible, pero exige
 * demostrar acceso al servidor creando el fichero centinela por FTP/SSH:
 *     api/.permitir-reinstalacion
 */
function install_incomplete(): bool {
    if (!is_file(LMT_CONFIG_PATH)) return false;
    if (!is_file(LMT_ROOT . '/api/.permitir-reinstalacion')) return false;
    try {
        $cfg = @include LMT_CONFIG_PATH;
        if (!is_array($cfg) || empty($cfg['db']['dsn'])) return false;
        $pdo = new PDO($cfg['db']['dsn'], $cfg['db']['user'] ?? null, $cfg['db']['password'] ?? null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 3,
        ]);
        $count = (int) $pdo->query("SELECT COUNT(*) FROM admins WHERE password_hash IS NOT NULL AND LENGTH(password_hash) >= 20")->fetchColumn();
        return $count === 0;
    } catch (\Throwable $e) {
        // No se pudo verificar => NO se abre el instalador.
        return false;
    }
}

function valid_email(?string $v): ?string {
    if ($v === null) return null;
    $v = trim(strtolower($v));
    if (strlen($v) < 5 || strlen($v) > 254) return null;
    return filter_var($v, FILTER_VALIDATE_EMAIL) ? $v : null;
}

function pdo_for(array $db): PDO {
    return new PDO($db['dsn'], $db['user'] ?? null, $db['password'] ?? null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
}

function build_dsn(string $driver, array $f): array {
    if ($driver === 'mysql') {
        $host = $f['host'] !== '' ? $f['host'] : '127.0.0.1';
        $port = (int)($f['port'] ?? 3306) ?: 3306;
        return [
            'dsn'      => sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $host, $port, $f['name']),
            'user'     => $f['user'],
            'password' => $f['password'],
            'driver'   => 'mysql',
        ];
    }
    $path = $f['path'] !== '' ? $f['path'] : LMT_ROOT . '/db/la-mejor-taza.sqlite';
    return [
        'dsn'      => 'sqlite:' . $path,
        'user'     => null,
        'password' => null,
        'driver'   => 'sqlite',
        'path'     => $path,
    ];
}

/** Divide un script SQL en sentencias respetando comillas y comentarios -- y bloque /* * /. */
function sql_statements(string $sql): array {
    $sql = preg_replace('!/\*.*?\*/!s', '', $sql);
    $lines = preg_split('/\r?\n/', $sql);
    $clean = [];
    foreach ($lines as $line) {
        $t = ltrim($line);
        if ($t === '' || strpos($t, '--') === 0) continue;
        $clean[] = $line;
    }
    $sql = implode("\n", $clean);
    $stmts = [];
    $buf = '';
    $len = strlen($sql);
    $inStr = null;
    for ($i = 0; $i < $len; $i++) {
        $c = $sql[$i];
        if ($inStr !== null) {
            $buf .= $c;
            if ($c === $inStr && ($i === 0 || $sql[$i - 1] !== '\\')) $inStr = null;
            continue;
        }
        if ($c === '"' || $c === "'") { $inStr = $c; $buf .= $c; continue; }
        if ($c === ';') {
            $t = trim($buf);
            if ($t !== '') $stmts[] = $t;
            $buf = '';
            continue;
        }
        $buf .= $c;
    }
    $t = trim($buf);
    if ($t !== '') $stmts[] = $t;
    return $stmts;
}

function hash_password(string $plain, string $pepper): string {
    $hmac = hash_hmac('sha256', $plain, $pepper, true);
    $payload = base64_encode($hmac);
    // Probar Argon2id, pero hacer fallback robusto a bcrypt si por
    // memoria/threads/PHP-config falla y devuelve false.
    if (defined('PASSWORD_ARGON2ID')) {
        try {
            $h = @password_hash($payload, PASSWORD_ARGON2ID, [
                'memory_cost' => 65536, 'time_cost' => 4, 'threads' => 2,
            ]);
            if (is_string($h) && $h !== '') return $h;
        } catch (\Throwable $e) { /* cae a bcrypt */ }
    }
    $h = password_hash($payload, PASSWORD_BCRYPT, ['cost' => 12]);
    if (!is_string($h) || $h === '') {
        throw new \RuntimeException('No se pudo generar el hash de la contraseña.');
    }
    return $h;
}

function write_config(array $db, string $pepper, string $appSecret, string $reinstallToken, string $siteUrl): bool {
    $dbBlock = $db['driver'] === 'sqlite'
        ? "        'dsn'      => 'sqlite:' . __DIR__ . '/../db/' . " . var_export(basename($db['path']), true) . ",\n"
          . "        'user'     => null,\n        'password' => null,\n"
        : sprintf(
            "        'dsn'      => %s,\n        'user'     => %s,\n        'password' => %s,\n",
            var_export($db['dsn'], true),
            var_export($db['user'], true),
            var_export($db['password'], true)
          );

    // Detectar HTTPS para configurar cookies seguras y forzar TLS sólo si tiene sentido.
    $isHttps = (
        (!empty($_SERVER['HTTPS']) && strtolower((string)$_SERVER['HTTPS']) !== 'off')
        || (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && strtolower((string)$_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https')
        || stripos($siteUrl, 'https://') === 0
    );
    $secureCookie = $isHttps ? 'true' : 'false';
    $forceHttps   = $isHttps ? 'true' : 'false';

    $allowed = "[\n";
    if ($siteUrl !== '') {
        $allowed .= "        " . var_export(rtrim($siteUrl, '/'), true) . ",\n";
    }
    $allowed .= "        'http://localhost:8000',\n";
    $allowed .= "        'http://127.0.0.1:8000',\n";
    $allowed .= "    ]";

    // Remitente por defecto: no-reply@<dominio del sitio>. Casi ningún MTA
    // acepta un From de otro dominio, así que adivinarlo bien evita que el
    // primer correo con credenciales se pierda sin explicación.
    $hostSitio = parse_url($siteUrl !== '' ? $siteUrl : ('http://' . ($_SERVER['HTTP_HOST'] ?? 'localhost')), PHP_URL_HOST);
    if (!is_string($hostSitio) || $hostSitio === '') $hostSitio = 'localhost';
    $mailFrom = var_export('no-reply@' . preg_replace('/^www\./i', '', $hostSitio), true);

    $php = <<<PHP
<?php
// api/config.php — generado por install.php. NO COMMITEAR.
// Para reinstalar: borra este archivo y ejecuta install.php otra vez, o pasa
// el valor de 'reinstall_token' (más abajo) como ?reinstall=... en la URL del
// instalador. Ese token NO se repite aquí en claro a propósito: este archivo
// se ha servido por HTTP en más de un hosting mal configurado.
defined('LMT_GUARD') || exit('forbidden');
return [
    'installed'        => true,
    'installed_at'     => '%s',
    'reinstall_token'  => %s,

    'db' => [
%s    ],

    'pepper'     => %s,
    'app_secret' => %s,

    'session' => [
        'name'     => 'lmt_sid',
        'lifetime' => 28800,
        'secure'   => {$secureCookie},
        'samesite' => 'Strict',
        // Vacío = se deriva del subdirectorio donde vive la app, para no
        // enviar la cookie a las demás aplicaciones del mismo dominio.
        'path'     => '',
        'domain'   => '',
    ],

    'allowed_origins' => %s,

    'rate_limits' => [
        'login'             => ['window' => 600,  'max' => 5],
        'vote'              => ['window' => 60,   'max' => 1],
        'vote_email'        => ['window' => 600,  'max' => 12],
        'pasaporte'         => ['window' => 60,   'max' => 20],
        'pasaporte_correo'  => ['window' => 3600, 'max' => 10],
        'promotor_registro' => ['window' => 3600, 'max' => 5],
        'promotor_login'    => ['window' => 900,  'max' => 15],
        'promotor_upload'   => ['window' => 3600, 'max' => 60],
        'promotor_logo_publico' => ['window' => 3600, 'max' => 10], // logos en la inscripción (sin sesión)
        'perfil_visitante'  => ['window' => 600,  'max' => 30],
        'perfil_enlace'     => ['window' => 3600, 'max' => 10],
        'perfil_enlace_correo' => ['window' => 3600, 'max' => 3],
        'correo_prueba'     => ['window' => 600,  'max' => 10],
        'global'            => ['window' => 60,   'max' => 120],
    ],

    // Correo saliente: lo usa el módulo de promotores para entregar la
    // contraseña temporal cuando el administrador verifica una inscripción.
    // En hosting compartido la función mail() suele acabar en spam o estar
    // capada; para producción cambia 'transport' a 'smtp' y rellena el bloque.
    'mail' => [
        'transport' => 'mail',
        'from'      => {$mailFrom},
        'from_name' => 'La Mejor Taza — Festival',
        'reply_to'  => '',
        'log_file'  => '',   // vacío = fuera del document root (recomendado)
        'smtp' => [
            'host'     => '',
            'port'     => 587,
            'secure'   => 'tls',
            'user'     => '',
            'password' => '',
            'timeout'  => 15,
        ],
    ],

    // Imágenes que suben los promotores (logo de empresa, fotos de producto).
    'uploads' => [
        'dir'       => __DIR__ . '/../uploads',
        'max_bytes' => 3145728,
        'max_dim'   => 1600,
    ],

    'diag_token'  => '',
    'trust_proxy' => {$forceHttps},
    'force_https' => {$forceHttps},
    'debug'       => false,
];
PHP;
    $rendered = sprintf(
        $php,
        date('c'),
        var_export($reinstallToken, true),
        $dbBlock,
        var_export($pepper, true),
        var_export($appSecret, true),
        $allowed,
    );

    @mkdir(dirname(LMT_CONFIG_PATH), 0775, true);
    $ok = (bool) @file_put_contents(LMT_CONFIG_PATH, $rendered, LOCK_EX);
    // Contiene pepper, app_secret, el DSN y la contraseña de la base. En
    // hosting compartido 0644 significa que los demás inquilinos del servidor
    // pueden leerlo; con app_secret se falsifican sesiones y rate limits.
    if ($ok) @chmod(LMT_CONFIG_PATH, 0600);
    return $ok;
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------
function head(string $title, int $current = 0): void { ?>
<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title><?= h($title) ?> · La Mejor Taza</title>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles/tokens.css"/>
<style>
  body { background: var(--paper-2); margin: 0; min-height: 100vh; display:flex; align-items: center; justify-content: center; padding: 32px 16px; }
  .card { width: 100%; max-width: 720px; background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-md); box-shadow: var(--shadow-2); overflow: hidden; }
  .card header { padding: 28px 32px; background: var(--ink); color: var(--paper); display: flex; justify-content: space-between; align-items: center; }
  .card header h1 { font-family: var(--font-display); font-style: italic; font-weight: 400; margin: 0; font-size: 28px; letter-spacing: -0.01em; }
  .card header .mono { color: var(--paper-3); }
  .card .body { padding: 32px; }
  .steps { display: flex; gap: 6px; padding: 14px 32px; border-bottom: 1px solid var(--line); background: var(--paper-2); font-size: 12px; }
  .steps span { padding: 4px 10px; border-radius: 999px; color: var(--ink-3); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.06em; font-size: 10px; }
  .steps span.is-current { background: var(--ink); color: var(--paper); }
  .steps span.is-done { background: var(--cafeto); color: var(--paper); }
  h2 { font-family: var(--font-display); font-style: italic; font-weight: 400; margin: 0 0 8px; font-size: 32px; letter-spacing: -0.01em; }
  p { margin: 6px 0 16px; color: var(--ink-2); font-size: 14px; line-height: 1.6; }
  label { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-3); font-weight: 500; margin-bottom: 6px; }
  input[type=text], input[type=email], input[type=password], input[type=number], select {
    width: 100%; padding: 10px 12px; border: 1px solid var(--line-2); border-radius: var(--r-sm); font-size: 14px; font-family: inherit; color: var(--ink); background: var(--paper);
  }
  input:focus, select:focus { outline: 2px solid var(--ink); outline-offset: -1px; }
  .row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media (max-width: 560px) { .row, .grid-2 { grid-template-columns: 1fr; } }
  .hint { display: block; font-size: 12px; line-height: 1.5; color: var(--ink-3); margin-top: 6px; text-transform: none; letter-spacing: 0; }
  fieldset legend { font-size: 10px; }
  .field { margin-bottom: 18px; }
  .actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 24px; }
  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 18px; border-radius: 999px; font-size: 14px; font-weight: 500; border: 1px solid transparent; cursor: pointer; }
  .btn-primary { background: var(--ink); color: var(--paper); }
  .btn-primary:hover { background: var(--grano); }
  .btn-ghost { background: transparent; border-color: var(--line-2); color: var(--ink); }
  .btn-ghost:hover { background: var(--paper-2); }
  .alert { padding: 12px 14px; border-radius: var(--r-sm); font-size: 13px; margin-bottom: 20px; line-height: 1.5; }
  .alert-error { background: oklch(0.95 0.04 25); color: var(--bad); border: 1px solid oklch(0.85 0.06 25); }
  .alert-ok { background: oklch(0.95 0.05 145); color: var(--good); border: 1px solid oklch(0.85 0.08 145); }
  .alert-info { background: var(--paper-2); color: var(--ink-2); border: 1px solid var(--line); }
  .checks { font-family: var(--font-mono); font-size: 12px; }
  .checks li { list-style: none; padding: 8px 0; border-bottom: 1px dashed var(--line); display: flex; justify-content: space-between; }
  .checks .ok { color: var(--good); }
  .checks .ko { color: var(--bad); }
  .driver-toggle { display: flex; gap: 8px; margin-bottom: 20px; }
  .driver-toggle label { display: flex; align-items: center; gap: 8px; padding: 8px 14px; border: 1px solid var(--line-2); border-radius: 999px; cursor: pointer; text-transform: none; letter-spacing: 0; color: var(--ink); font-size: 13px; }
  .driver-toggle input[type=radio] { accent-color: var(--ink); }
  .footer-note { margin-top: 28px; padding-top: 20px; border-top: 1px solid var(--line); font-size: 12px; color: var(--ink-3); line-height: 1.6; }
  .pwd-strength { font-size: 11px; color: var(--ink-3); margin-top: 6px; }
  .copy { font-family: var(--font-mono); background: var(--paper-2); border: 1px solid var(--line); padding: 10px; border-radius: var(--r-sm); font-size: 12px; word-break: break-all; }
</style>
</head>
<body>
<div class="card">
  <header>
    <h1>La Mejor Taza</h1>
    <span class="mono">Asistente de instalación</span>
  </header>
  <?php if ($current > 0): ?>
  <nav class="steps">
    <?php foreach (['1·Entorno', '2·Base de datos', '3·Administrador', '4·Instalando', '5·Correo', '6·Listo'] as $i => $label): ?>
      <?php $idx = $i + 1; $cls = $idx === $current ? 'is-current' : ($idx < $current ? 'is-done' : ''); ?>
      <span class="<?= h($cls) ?>"><?= h($label) ?></span>
    <?php endforeach; ?>
  </nav>
  <?php endif; ?>
  <div class="body">
<?php }

function tail(): void { ?>
  </div>
</div>
</body>
</html>
<?php }

function render_error(string $message): void {
    head('Error', 0);
    echo '<div class="alert alert-error">' . h($message) . '</div>';
    echo '<a class="btn btn-ghost" href="' . h(basename(__FILE__)) . '">← Volver al inicio</a>';
    tail();
}

// ---------------------------------------------------------------------------
// Bloqueo si ya está instalado (excepto si venimos de terminar el flujo).
// ---------------------------------------------------------------------------
$justFinished = !empty($_SESSION['done']) && in_array((int)($_GET['step'] ?? 0), [5, 6], true);
// Si la instalación es incompleta (sin admin), dejamos pasar al wizard
// aunque `installed=true`. Es la única forma sensata de recuperarse.
$incomplete = install_incomplete();
if (is_installed() && !reinstall_token_ok() && !$justFinished && !$incomplete) {
    head('Ya instalado', 0);
    ?>
    <div class="alert alert-ok">
      <strong>¡La Mejor Taza ya está instalada!</strong><br>
      Si necesitas reinstalar, borra <code>api/config.php</code> y vuelve a ejecutar este asistente.
    </div>
    <p>Por seguridad, también puedes borrar el archivo <code>install.php</code> después de la instalación.</p>
    <?php
      $baseHere = rtrim(dirname($_SERVER['SCRIPT_NAME'] ?? '/'), '/');
    ?>
    <div class="actions">
      <a class="btn btn-primary" href="<?= h($baseHere) ?>/">Ir al sitio →</a>
    </div>
    <?php
    tail();
    exit;
}

// ---------------------------------------------------------------------------
// Procesamiento
// ---------------------------------------------------------------------------
$step = (int)($_GET['step'] ?? 1);
if ($step < 1 || $step > 6) $step = 1;
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'POST') {
    check_csrf();

    if ($step === 2) {
        $driver = ($_POST['driver'] ?? 'mysql') === 'sqlite' ? 'sqlite' : 'mysql';
        $form = [
            'driver'   => $driver,
            'host'     => trim((string)($_POST['host'] ?? '127.0.0.1')),
            'port'     => (int)($_POST['port'] ?? 3306),
            'name'     => trim((string)($_POST['name'] ?? '')),
            'user'     => (string)($_POST['user'] ?? ''),
            'password' => (string)($_POST['password'] ?? ''),
            'path'     => trim((string)($_POST['path'] ?? '')),
        ];
        $errors = [];
        if ($driver === 'mysql') {
            if ($form['name'] === '' || !preg_match('/^[A-Za-z0-9_\-]{1,64}$/', $form['name']))
                $errors[] = 'Nombre de base de datos inválido (sólo letras, números, guión y guión bajo).';
            if ($form['user'] === '') $errors[] = 'Usuario de base de datos requerido.';
            if ($form['port'] < 1 || $form['port'] > 65535) $errors[] = 'Puerto inválido.';
        } else {
            if ($form['path'] === '') $form['path'] = LMT_ROOT . '/db/la-mejor-taza.sqlite';
            $dir = dirname($form['path']);
            if (!is_dir($dir) && !@mkdir($dir, 0775, true))
                $errors[] = 'No se puede crear el directorio para la base SQLite: ' . h($dir);
            if (!is_writable($dir))
                $errors[] = 'El directorio para la base SQLite no es escribible: ' . h($dir);
        }

        $db = build_dsn($driver, $form);

        // Probar conexión
        if (!$errors) {
            try {
                if ($driver === 'mysql') {
                    // Conectar sin dbname para crear si no existe.
                    $admin = new PDO(
                        sprintf('mysql:host=%s;port=%d;charset=utf8mb4', $form['host'] ?: '127.0.0.1', $form['port']),
                        $form['user'], $form['password'],
                        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
                    );
                    $admin->exec('CREATE DATABASE IF NOT EXISTS `' . str_replace('`', '', $form['name']) . '` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
                    pdo_for($db); // segunda conexión ya con dbname
                } else {
                    pdo_for($db);
                }
            } catch (\Throwable $e) {
                // El mensaje crudo de PDO revela puertos y hosts internos a quien pruebe
                // DSNs a ciegas. Al operador le basta con el motivo y el log del servidor.
                error_log('[lmt][install] ' . $e->getMessage());
                $errors[] = 'No se pudo conectar a la base de datos. Revisa host, puerto, usuario y contraseña. El detalle quedó en el log de errores del servidor.';
            }
        }

        if ($errors) {
            $_SESSION['flash_errors'] = $errors;
            $_SESSION['db_form'] = $form;
            go(2);
        }
        $_SESSION['db'] = $db + ['form' => $form];
        go(3);
    }

    if ($step === 3) {
        if (empty($_SESSION['db'])) go(2);
        $site = trim((string)($_POST['site_url'] ?? ''));
        $email = valid_email($_POST['admin_email'] ?? '');
        $pwd = (string)($_POST['admin_password'] ?? '');
        $pwd2 = (string)($_POST['admin_password_confirm'] ?? '');

        $errors = [];
        if (!$email) $errors[] = 'Correo de administrador inválido.';
        if (mb_strlen($pwd) < 12) $errors[] = 'La contraseña debe tener al menos 12 caracteres.';
        if ($pwd !== $pwd2) $errors[] = 'Las contraseñas no coinciden.';
        if ($site !== '' && !preg_match('#^https?://[^/]+#', $site)) $errors[] = 'La URL del sitio debe empezar por http:// o https://';

        if ($errors) {
            $_SESSION['flash_errors'] = $errors;
            $_SESSION['admin_form'] = ['email' => (string)($_POST['admin_email'] ?? ''), 'site' => $site];
            go(3);
        }
        $_SESSION['admin'] = ['email' => $email, 'password' => $pwd, 'site_url' => $site];
        $_SESSION['seed'] = !empty($_POST['seed']);
        go(4);
    }

    if ($step === 4) {
        if (empty($_SESSION['db']) || empty($_SESSION['admin'])) go(2);

        // Si ya hay un config.php previo de un intento fallido, reusamos su
        // pepper/app_secret/reinstall_token para no romper sesiones existentes.
        $existing = null;
        if (is_file(LMT_CONFIG_PATH)) {
            try { $existing = include LMT_CONFIG_PATH; } catch (\Throwable $e) { $existing = null; }
        }

        $stepLog = []; // bitácora para mostrar al usuario si algo falla
        try {
            $db = $_SESSION['db'];
            $admin = $_SESSION['admin'];

            // Secretos: nuevos, o reutilizados si ya existían.
            $pepper = (is_array($existing) && !empty($existing['pepper']))
                ? (string) $existing['pepper'] : bin2hex(random_bytes(32));
            $appSecret = (is_array($existing) && !empty($existing['app_secret']))
                ? (string) $existing['app_secret'] : bin2hex(random_bytes(32));
            $reinstallToken = (is_array($existing) && !empty($existing['reinstall_token']))
                ? (string) $existing['reinstall_token'] : bin2hex(random_bytes(16));

            // 1) Conexión a la BD
            $pdo = pdo_for($db);
            $stepLog[] = '✓ Conexión a la BD';

            // 2) Esquema
            $schema = $db['driver'] === 'mysql' ? LMT_SCHEMA_MYSQL : LMT_SCHEMA_SQLITE;
            $sql = file_get_contents($schema);
            if (!$sql) throw new RuntimeException('No se pudo leer ' . basename($schema));
            if ($db['driver'] === 'mysql') {
                $sql = preg_replace('/^\s*CREATE DATABASE.*?;\s*/ims', '', $sql);
                $sql = preg_replace('/^\s*USE\s+\S+\s*;\s*/im', '', $sql);
            } else {
                $pdo->exec('PRAGMA foreign_keys = ON');
            }
            foreach (sql_statements($sql) as $stmt) {
                if (trim($stmt) !== '') $pdo->exec($stmt);
            }
            $stepLog[] = '✓ Esquema creado';

            // 3) Seed opcional (sólo si tabla vacía)
            if (!empty($_SESSION['seed'])) {
                $count = (int) $pdo->query('SELECT COUNT(*) FROM stands')->fetchColumn();
                if ($count === 0) {
                    foreach (sql_statements((string) file_get_contents(LMT_SEED)) as $stmt) {
                        if (trim($stmt) !== '') $pdo->exec($stmt);
                    }
                    $stepLog[] = '✓ Datos de ejemplo cargados';
                } else {
                    $stepLog[] = '· Seed omitido (ya hay ' . $count . ' stands)';
                }
            }

            // 4) Hash de contraseña — esto puede fallar por memoria/Argon2id.
            try {
                $hash = hash_password($admin['password'], $pepper);
            } catch (\Throwable $e) {
                throw new RuntimeException('Hash de contraseña: ' . $e->getMessage());
            }
            if (!is_string($hash) || strlen($hash) < 20) {
                throw new RuntimeException('Hash de contraseña inválido (vacío o muy corto). Revisa memory_limit de PHP.');
            }
            $stepLog[] = '✓ Hash de contraseña generado (' . strlen($hash) . ' bytes)';

            // 5) Insertar / actualizar administrador.
            if ($db['driver'] === 'mysql') {
                $st = $pdo->prepare(
                    'INSERT INTO admins (email, password_hash, is_admin) VALUES (:e, :h, 1)
                     ON DUPLICATE KEY UPDATE password_hash = :h2, is_admin = 1'
                );
                $st->execute([':e' => $admin['email'], ':h' => $hash, ':h2' => $hash]);
            } else {
                $st = $pdo->prepare(
                    'INSERT INTO admins (email, password_hash, is_admin) VALUES (:e, :h, 1)
                     ON CONFLICT(email) DO UPDATE SET password_hash = excluded.password_hash, is_admin = 1'
                );
                $st->execute([':e' => $admin['email'], ':h' => $hash]);
            }
            $stepLog[] = '✓ Insert/upsert admin ejecutado';

            // 6) VERIFICAR — si esto falla, avisamos al usuario en lugar de
            //    dejarlo "instalado" sin admin como pasó antes.
            $verify = $pdo->prepare('SELECT id, email, is_admin, LENGTH(password_hash) AS hl FROM admins WHERE email = :e LIMIT 1');
            $verify->execute([':e' => $admin['email']]);
            $row = $verify->fetch();
            if (!$row) {
                throw new RuntimeException('El admin no se guardó (SELECT post-INSERT vacío). Revisa permisos del usuario MySQL en la tabla admins.');
            }
            if ((int)($row['hl'] ?? 0) < 20) {
                throw new RuntimeException('El admin existe pero el hash quedó vacío.');
            }
            $stepLog[] = '✓ Admin verificado: ' . $admin['email'] . ' (id=' . $row['id'] . ')';

            // 7) SÓLO ahora escribimos config.php con installed=true.
            if (!write_config($db, $pepper, $appSecret, $reinstallToken, $admin['site_url'] ?: '')) {
                throw new RuntimeException('Admin OK pero no se pudo escribir api/config.php (revisa permisos del directorio api/).');
            }
            $stepLog[] = '✓ api/config.php escrito';

            $_SESSION['done'] = [
                'email' => $admin['email'],
                'reinstall_token' => $reinstallToken,
                'log' => $stepLog,
            ];
            unset($_SESSION['db'], $_SESSION['admin'], $_SESSION['seed'], $_SESSION['db_form'], $_SESSION['admin_form']);
            go(5);
        } catch (\Throwable $e) {
            $msg = 'Falló en este paso: ' . $e->getMessage();
            if ($stepLog) $msg .= "\n\nProgreso antes del fallo:\n" . implode("\n", $stepLog);
            $_SESSION['flash_errors'] = [$msg];
            go(3);
        }
    }
}

// ---------------------------------------------------------------------------
// Paso 5 — Correo saliente
//
// Se configura Y SE PRUEBA aquí, antes de dar la instalación por buena. El
// envío es la única pieza que falla en silencio: con el transporte de pruebas
// el panel dice «la contraseña salió hacia…» y no ha salido nada. Que el
// instalador obligue a mandarse un correo real ahorra descubrirlo el día del
// festival, con los caficultores esperando su clave.
// ---------------------------------------------------------------------------
$correoResultado = $_SESSION['correo_resultado'] ?? null;
unset($_SESSION['correo_resultado']);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $step === 5) {
    check_csrf();
    $accion = (string) ($_POST['accion'] ?? 'guardar');
    $mail = [
        'transport' => in_array($_POST['transport'] ?? '', ['smtp', 'mail', 'log'], true) ? $_POST['transport'] : 'smtp',
        'from'      => valid_email($_POST['from'] ?? null) ?? '',
        'from_name' => mb_substr(trim((string) ($_POST['from_name'] ?? '')), 0, 80),
        'smtp' => [
            'host'    => preg_replace('/[^A-Za-z0-9.\-]/', '', (string) ($_POST['host'] ?? '')) ?? '',
            'port'    => max(1, min(65535, (int) ($_POST['port'] ?? 587))),
            'secure'  => in_array($_POST['secure'] ?? '', ['tls', 'ssl', ''], true) ? (string) $_POST['secure'] : 'tls',
            'user'    => mb_substr(trim((string) ($_POST['user'] ?? '')), 0, 254),
            'password' => (string) ($_POST['password'] ?? ''),
            'timeout' => 15,
        ],
    ];
    $_SESSION['correo_form'] = $mail;

    if ($accion === 'saltar') { go(6); }

    if ($mail['from'] === '') {
        $_SESSION['flash_errors'] = ['La dirección del remitente no es válida.'];
        go(5);
    }
    if ($mail['transport'] === 'smtp' && $mail['smtp']['host'] === '') {
        $_SESSION['flash_errors'] = ['Falta el servidor SMTP.'];
        go(5);
    }

    try {
        instalar_guardar_correo($mail);
        if ($accion === 'probar') {
            $destino = valid_email($_POST['destino'] ?? null);
            if (!$destino) {
                $_SESSION['flash_errors'] = ['Escribe una dirección válida para la prueba.'];
                go(5);
            }
            $_SESSION['correo_resultado'] = instalar_probar_correo($destino);
        } else {
            $_SESSION['correo_resultado'] = ['guardado' => true];
        }
    } catch (\Throwable $e) {
        $_SESSION['flash_errors'] = ['No se pudo guardar la configuración de correo: ' . $e->getMessage()];
    }
    go(5);
}

/** Carga el runtime de la app (ya hay config.php) para reutilizar Mailer. */
function instalar_runtime(): void {
    static $listo = false;
    if ($listo) return;
    foreach (['Config', 'Response', 'Db', 'Validate', 'Ajustes', 'Mailer', 'Correos'] as $c) {
        require_once LMT_ROOT . '/api/lib/' . $c . '.php';
    }
    \LMT\Config::load(LMT_CONFIG_PATH);
    $listo = true;
}

function instalar_guardar_correo(array $mail): void {
    instalar_runtime();
    $clave = (string) $mail['smtp']['password'];
    unset($mail['smtp']['password']);
    if ($clave !== '') {
        try { $mail['smtp']['password'] = \LMT\Ajustes::cifrar($clave); }
        catch (\Throwable $e) { throw new RuntimeException('este PHP no tiene sodium ni openssl para guardar la contraseña cifrada'); }
    }
    \LMT\Ajustes::guardar('mail', $mail);
}

function instalar_probar_correo(string $destino): array {
    instalar_runtime();
    $cfg = \LMT\Mailer::cfg();
    $pl = \LMT\Correos::pruebaEnvio($destino, (string) $cfg['transport']);
    $ok = \LMT\Mailer::send($destino, '', $pl['asunto'], $pl['html'], $pl['texto'], 'prueba_instalacion');
    return [
        'aceptado'   => $ok,
        'entregado'  => $ok && \LMT\Mailer::entregaDeVerdad(\LMT\Mailer::ultimoTransporte()),
        'transporte' => \LMT\Mailer::ultimoTransporte(),
        'error'      => \LMT\Mailer::ultimoError(),
        'traza'      => \LMT\Mailer::ultimaTraza(),
        'destino'    => $destino,
    ];
}

// ---------------------------------------------------------------------------
// Render por paso
// ---------------------------------------------------------------------------
$flash = $_SESSION['flash_errors'] ?? [];
unset($_SESSION['flash_errors']);

if ($step === 1) {
    head('Bienvenida', 1);
    ?>
    <?php if (!empty($incomplete)): ?>
      <div class="alert alert-error" style="white-space:pre-wrap;">
        <strong>Instalación incompleta detectada.</strong>
        Existe <code>api/config.php</code> pero la tabla <code>admins</code> está vacía o no se puede leer. Re-ejecuta el wizard para completar la creación del administrador (los demás datos se preservan si ya existen).
      </div>
    <?php endif; ?>
    <h2>Vamos a instalar el sistema.</h2>
    <p>Este asistente te guiará en pocos pasos: comprobaremos el entorno, conectaremos la base de datos, crearemos el administrador y dejaremos el sitio listo para servir tu festival.</p>

    <?php
    // Comprobaciones
    $checks = [
        ['PHP ≥ 8.1',                version_compare(PHP_VERSION, '8.1.0', '>='), PHP_VERSION],
        ['Extensión pdo',            extension_loaded('pdo'), extension_loaded('pdo') ? 'sí' : 'no'],
        ['Extensión pdo_mysql',      extension_loaded('pdo_mysql'), extension_loaded('pdo_mysql') ? 'sí' : 'no'],
        ['Extensión pdo_sqlite',     extension_loaded('pdo_sqlite'), extension_loaded('pdo_sqlite') ? 'sí' : 'no'],
        ['Extensión mbstring',       extension_loaded('mbstring'), extension_loaded('mbstring') ? 'sí' : 'no'],
        ['Extensión json',           extension_loaded('json'), extension_loaded('json') ? 'sí' : 'no'],
        ['Argon2id disponible',      defined('PASSWORD_ARGON2ID'), defined('PASSWORD_ARGON2ID') ? 'sí' : 'fallback bcrypt'],
        ['Directorio api/ escribible', is_writable(LMT_ROOT . '/api') || is_writable(LMT_ROOT), is_writable(LMT_ROOT . '/api') ? 'sí' : 'no'],
        ['Directorio db/ escribible',  is_writable(LMT_ROOT . '/db') || is_writable(LMT_ROOT), is_writable(LMT_ROOT . '/db') ? 'sí' : 'no'],
    ];
    $blocked = false;
    foreach ($checks as $c) {
        if (!$c[1] && in_array($c[0], ['PHP ≥ 8.1', 'Extensión pdo', 'Extensión json', 'Extensión mbstring'], true)) $blocked = true;
        // pdo_mysql O pdo_sqlite — basta uno
    }
    if (!extension_loaded('pdo_mysql') && !extension_loaded('pdo_sqlite')) $blocked = true;
    ?>
    <ul class="checks">
      <?php foreach ($checks as $c): ?>
        <li><span><?= h($c[0]) ?></span><span class="<?= $c[1] ? 'ok' : 'ko' ?>"><?= h($c[2]) ?></span></li>
      <?php endforeach; ?>
    </ul>

    <?php if ($blocked): ?>
      <div class="alert alert-error" style="margin-top:20px;">El entorno no cumple los requisitos mínimos. Ajusta tu PHP / extensiones y recarga.</div>
    <?php endif; ?>

    <form method="get" class="actions">
      <input type="hidden" name="step" value="2">
      <button class="btn btn-primary" type="submit" <?= $blocked ? 'disabled' : '' ?>>Continuar →</button>
    </form>
    <div class="footer-note">Al finalizar, borra <code>install.php</code> del servidor por seguridad.</div>
    <?php
    tail();
    exit;
}

if ($step === 2) {
    head('Base de datos', 2);
    $form = $_SESSION['db_form'] ?? [];
    $driver = $form['driver'] ?? 'mysql';
    ?>
    <h2>Datos de la base de datos.</h2>
    <p>Necesitamos un usuario de MySQL/MariaDB con permisos para crear (o usar) la base de datos. Si prefieres SQLite — útil para desarrollo o demos pequeñas — selecciónalo abajo.</p>

    <?php foreach ($flash as $err): ?>
      <div class="alert alert-error" style="white-space:pre-wrap;"><?= h($err) ?></div>
    <?php endforeach; ?>

    <form method="post" action="?step=2">
      <input type="hidden" name="_csrf" value="<?= h(csrf()) ?>">

      <div class="driver-toggle">
        <label><input type="radio" name="driver" value="mysql" <?= $driver === 'mysql' ? 'checked' : '' ?> onclick="document.getElementById('mysql').style.display='block';document.getElementById('sqlite').style.display='none';"> MySQL / MariaDB</label>
        <label><input type="radio" name="driver" value="sqlite" <?= $driver === 'sqlite' ? 'checked' : '' ?> onclick="document.getElementById('mysql').style.display='none';document.getElementById('sqlite').style.display='block';"> SQLite</label>
      </div>

      <div id="mysql" style="display:<?= $driver === 'mysql' ? 'block' : 'none' ?>;">
        <div class="row">
          <div class="field">
            <label>Servidor (host)</label>
            <input type="text" name="host" value="<?= h($form['host'] ?? '127.0.0.1') ?>" autocomplete="off">
          </div>
          <div class="field">
            <label>Puerto</label>
            <input type="number" name="port" value="<?= h((string)($form['port'] ?? 3306)) ?>" min="1" max="65535">
          </div>
        </div>
        <div class="field">
          <label>Nombre de la base de datos</label>
          <input type="text" name="name" value="<?= h($form['name'] ?? 'la_mejor_taza') ?>" placeholder="la_mejor_taza" autocomplete="off">
          <div class="pwd-strength">Si no existe, intentaremos crearla con UTF-8 (utf8mb4).</div>
        </div>
        <div class="field">
          <label>Usuario MySQL</label>
          <input type="text" name="user" value="<?= h($form['user'] ?? '') ?>" autocomplete="off">
        </div>
        <div class="field">
          <label>Contraseña MySQL</label>
          <input type="password" name="password" value="" autocomplete="new-password">
        </div>
      </div>

      <div id="sqlite" style="display:<?= $driver === 'sqlite' ? 'block' : 'none' ?>;">
        <div class="field">
          <label>Ruta del archivo SQLite</label>
          <input type="text" name="path" value="<?= h($form['path'] ?? (LMT_ROOT . '/db/la-mejor-taza.sqlite')) ?>" placeholder="<?= h(LMT_ROOT) ?>/db/la-mejor-taza.sqlite">
          <div class="pwd-strength">Si el archivo no existe lo creamos. El directorio debe ser escribible por PHP.</div>
        </div>
      </div>

      <div class="actions">
        <a class="btn btn-ghost" href="?step=1">← Volver</a>
        <button class="btn btn-primary" type="submit">Probar y continuar →</button>
      </div>
    </form>
    <?php
    tail();
    exit;
}

if ($step === 3) {
    if (empty($_SESSION['db'])) go(2);
    head('Administrador', 3);
    $form = $_SESSION['admin_form'] ?? [];
    $defaultSite = (function () {
        $proto = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        return $proto . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost');
    })();
    ?>
    <h2>Cuenta de administrador.</h2>
    <p>Esta cuenta podrá registrar stands, generar QR e imprimir carteles. Puedes crear más administradores luego con <code>php db/create-admin.php</code>.</p>

    <?php foreach ($flash as $err): ?>
      <div class="alert alert-error" style="white-space:pre-wrap;"><?= h($err) ?></div>
    <?php endforeach; ?>

    <form method="post" action="?step=3">
      <input type="hidden" name="_csrf" value="<?= h(csrf()) ?>">

      <div class="field">
        <label>URL del sitio</label>
        <input type="text" name="site_url" value="<?= h($form['site'] ?? $defaultSite) ?>" placeholder="https://lamejortaza.co">
      </div>

      <div class="field">
        <label>Correo del administrador</label>
        <input type="email" name="admin_email" value="<?= h($form['email'] ?? '') ?>" required maxlength="254" autocomplete="username">
      </div>

      <div class="row">
        <div class="field">
          <label>Contraseña (mínimo 12)</label>
          <input type="password" name="admin_password" required minlength="12" maxlength="128" autocomplete="new-password">
        </div>
        <div class="field">
          <label>Confirmar contraseña</label>
          <input type="password" name="admin_password_confirm" required minlength="12" maxlength="128" autocomplete="new-password">
        </div>
      </div>

      <div class="field">
        <label style="display:flex;align-items:center;gap:8px;text-transform:none;letter-spacing:0;color:var(--ink);">
          <input type="checkbox" name="seed" value="1" checked>
          Cargar 8 stands de ejemplo (recomendado para probar la app)
        </label>
      </div>

      <div class="actions">
        <a class="btn btn-ghost" href="?step=2">← Volver</a>
        <button class="btn btn-primary" type="submit">Instalar →</button>
      </div>
    </form>
    <?php
    tail();
    exit;
}

if ($step === 4) {
    // El paso 4 sólo se renderiza si llegan por GET (refresh tras error). Forzamos POST automático.
    head('Instalando…', 4);
    ?>
    <h2>Aplicando cambios.</h2>
    <p>Pulsa el botón si no se procesa automáticamente.</p>
    <form method="post" action="?step=4" id="run">
      <input type="hidden" name="_csrf" value="<?= h(csrf()) ?>">
      <div class="actions"><button class="btn btn-primary" type="submit">Ejecutar instalación</button></div>
    </form>
    <script>document.getElementById('run').submit();</script>
    <?php
    tail();
    exit;
}

if ($step === 5) {
    if (empty($_SESSION['done'])) go(1);
    head('Correo saliente', 5);

    $f = $_SESSION['correo_form'] ?? null;
    if (!$f) {
        // Punto de partida: lo que quedó escrito en api/config.php.
        $cfgArchivo = @include LMT_CONFIG_PATH;
        $m = is_array($cfgArchivo) ? (array) ($cfgArchivo['mail'] ?? []) : [];
        $f = [
            'transport' => 'smtp',
            'from'      => (string) ($m['from'] ?? ''),
            'from_name' => (string) ($m['from_name'] ?? 'La Mejor Taza — Festival'),
            'smtp' => ['host' => (string) ($m['smtp']['host'] ?? ''), 'port' => 587, 'secure' => 'tls', 'user' => '', 'password' => ''],
        ];
    }
    $emailAdmin = (string) ($_SESSION['done']['email'] ?? '');
    ?>
    <h2>Configura el correo saliente.</h2>
    <p>De aquí salen las contraseñas de los promotores y el código QR de su stand. Es la pieza que
       más falla y la única que falla <em>en silencio</em>: conviene comprobarla ahora, no el día del festival.</p>

    <?php if (!empty($flash)): ?>
      <div class="alert alert-error" style="white-space:pre-wrap;"><?= h(implode("\n", $flash)) ?></div>
    <?php endif; ?>

    <?php if ($correoResultado && !empty($correoResultado['guardado'])): ?>
      <div class="alert alert-ok">Configuración guardada. Manda una prueba para confirmar que sale de verdad.</div>
    <?php elseif ($correoResultado): ?>
      <?php if (!empty($correoResultado['entregado'])): ?>
        <div class="alert alert-ok">
          <strong>El servidor de correo aceptó el mensaje</strong> para <?= h($correoResultado['destino']) ?>.
          Revisa la bandeja (y la carpeta de spam). Si llegó, ya puedes terminar.
        </div>
      <?php elseif (!empty($correoResultado['aceptado'])): ?>
        <div class="alert alert-error">
          <strong>No se envió a nadie.</strong> El transporte «<?= h($correoResultado['transporte']) ?>» sólo escribe
          el mensaje en un archivo del servidor. Elige SMTP para que salga de verdad.
        </div>
      <?php else: ?>
        <div class="alert alert-error">
          <strong>No se pudo enviar.</strong> <?= h((string) $correoResultado['error']) ?>
        </div>
      <?php endif; ?>
      <?php if (!empty($correoResultado['traza'])): ?>
        <details style="margin:-6px 0 18px;">
          <summary class="mono" style="cursor:pointer;">Diálogo con el servidor</summary>
          <pre style="white-space:pre-wrap;word-break:break-word;background:var(--paper-2);border:1px solid var(--line);border-radius:8px;padding:12px;font-size:12px;line-height:1.6;overflow-x:auto;"><?= h(implode("\n", $correoResultado['traza'])) ?></pre>
        </details>
      <?php endif; ?>
    <?php endif; ?>

    <form method="post" action="install.php?step=5">
      <input type="hidden" name="_csrf" value="<?= h(csrf()) ?>">

      <div class="field">
        <label>¿Cómo se envía?</label>
        <select name="transport">
          <option value="smtp" <?= $f['transport'] === 'smtp' ? 'selected' : '' ?>>SMTP autenticado — recomendado</option>
          <option value="mail" <?= $f['transport'] === 'mail' ? 'selected' : '' ?>>Función mail() de PHP — poco fiable en hosting compartido</option>
          <option value="log"  <?= $f['transport'] === 'log'  ? 'selected' : '' ?>>Sólo registrar en un archivo — NO envía nada</option>
        </select>
      </div>

      <div class="grid-2">
        <div class="field">
          <label>Dirección del remitente</label>
          <input type="email" name="from" value="<?= h($f['from']) ?>" required placeholder="no-reply@narino.gov.co">
        </div>
        <div class="field">
          <label>Nombre visible</label>
          <input type="text" name="from_name" value="<?= h($f['from_name']) ?>" maxlength="80">
        </div>
      </div>

      <fieldset style="border:1px solid var(--line);border-radius:10px;padding:16px;margin:18px 0;">
        <legend class="mono" style="padding:0 8px;">Servidor SMTP</legend>
        <div class="grid-2">
          <div class="field">
            <label>Servidor</label>
            <input type="text" name="host" value="<?= h((string) $f['smtp']['host']) ?>" placeholder="smtp.narino.gov.co">
          </div>
          <div class="field">
            <label>Puerto</label>
            <input type="number" name="port" value="<?= h((string) $f['smtp']['port']) ?>" min="1" max="65535">
          </div>
        </div>
        <div class="grid-2">
          <div class="field">
            <label>Cifrado</label>
            <select name="secure">
              <option value="tls" <?= $f['smtp']['secure'] === 'tls' ? 'selected' : '' ?>>STARTTLS (587)</option>
              <option value="ssl" <?= $f['smtp']['secure'] === 'ssl' ? 'selected' : '' ?>>SSL directo (465)</option>
              <option value=""    <?= $f['smtp']['secure'] === ''    ? 'selected' : '' ?>>Sin cifrar</option>
            </select>
          </div>
          <div class="field">
            <label>Usuario del buzón</label>
            <input type="text" name="user" value="<?= h((string) $f['smtp']['user']) ?>" autocomplete="off">
          </div>
        </div>
        <div class="field">
          <label>Contraseña del buzón</label>
          <input type="password" name="password" value="" autocomplete="new-password">
          <span class="hint">Se guarda cifrada en la base de datos, no en el archivo de configuración.</span>
        </div>
      </fieldset>

      <div class="field">
        <label>Mandarme una prueba a</label>
        <input type="email" name="destino" value="<?= h($emailAdmin) ?>">
        <span class="hint">Se envía de verdad. Es la única forma de saber si funciona.</span>
      </div>

      <div class="actions" style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap;">
        <button class="btn btn-primary" type="submit" name="accion" value="probar">Guardar y enviar prueba</button>
        <button class="btn btn-ghost" type="submit" name="accion" value="guardar">Sólo guardar</button>
        <button class="btn btn-ghost" type="submit" name="accion" value="saltar">Configurarlo después →</button>
      </div>
      <p class="hint" style="margin-top:14px;">
        Todo esto se puede cambiar más adelante desde <strong>Panel → Correo</strong>, sin tocar archivos.
      </p>
    </form>
    <?php
    tail();
    exit;
}

if ($step === 6) {
    $done = $_SESSION['done'] ?? null;
    if (!$done) go(1);
    head('Listo', 6);
    ?>
    <h2>¡Listo! El festival está servido.</h2>
    <div class="alert alert-ok">
      Cuenta de administrador creada para <strong><?= h($done['email']) ?></strong>.
    </div>
    <p>Para reforzar la seguridad, borra ahora el archivo <code>install.php</code> del servidor. Mientras exista, está protegido por la cookie + token CSRF y por la marca <code>installed</code> en <code>api/config.php</code>, pero lo limpio es eliminarlo.</p>
    <div class="footer-note">
      <strong>Token de reinstalación</strong><br>
      Si alguna vez necesitas reabrir el asistente sin borrar <code>api/config.php</code>, usa esta URL una sola vez:
      <div class="copy" style="margin-top:8px;">install.php?reinstall=<?= h($done['reinstall_token']) ?></div>
      Está guardado dentro de <code>api/config.php</code>; cámbialo si te preocupa.
    </div>
    <?php
      $base = rtrim(dirname($_SERVER['SCRIPT_NAME'] ?? '/'), '/');
      $base = $base === '' ? '' : $base;
    ?>
    <div class="alert alert-info" style="margin-top:18px;">
      <strong>Verifica que las URLs limpias funcionan.</strong><br>
      Antes de cerrar este asistente, abre en otra pestaña:<br>
      <code><?= h(($_SERVER['REQUEST_SCHEME'] ?? 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? '') . $base) ?>/api/auth/me</code><br>
      Debe responder un JSON con <code>"ok": true</code>. Si te devuelve 404, tu Apache necesita
      <code>mod_rewrite</code> habilitado y <code>AllowOverride All</code> sobre esta carpeta
      (consulta a tu hosting o revisa el README).
    </div>
    <div class="actions" style="margin-top:24px;">
      <a class="btn btn-primary" href="<?= h($base) ?>/">Ir al sitio →</a>
    </div>
    <?php
    // Limpiar el flag para que un reload no muestre datos viejos.
    unset($_SESSION['done']);
    tail();
    exit;
}
