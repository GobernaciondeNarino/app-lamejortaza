<?php
defined('LMT_GUARD') || exit('forbidden');
use LMT\Db;
use LMT\Response;
use LMT\Config;
use LMT\QrCode;

function register_routes_qr(\LMT\Router $r): void
{
    // GET /qr/{standId}.png — PNG del código QR que apunta a la URL pública de
    // votación del stand ({base}/s/{id}). Generado en el servidor (PHP puro),
    // útil para imprimir sin depender de JavaScript. Público: un QR no es
    // información sensible y facilita generar carteles desde cualquier flujo.
    $r->get('/qr/:file', function (array $p) {
        $file = (string) ($p['file'] ?? '');
        if (!preg_match('/^([a-z0-9\-]{2,32})\.png$/', $file, $mm)) {
            Response::error(404, 'not_found');
        }
        $id = $mm[1];

        // El stand debe existir (evita generar QR de ids inventados).
        $stmt = Db::pdo()->prepare('SELECT 1 FROM stands WHERE id = :id');
        $stmt->execute([':id' => $id]);
        if (!$stmt->fetchColumn()) Response::error(404, 'stand_no_existe');

        $scale = isset($_GET['scale']) ? max(2, min(20, (int) $_GET['scale'])) : 8;

        $url = qr_stand_url($id);

        try {
            $png = QrCode::png($url, $scale, 4);
        } catch (\Throwable $e) {
            error_log('[lmt][qr] ' . $e->getMessage());
            Response::error(500, 'qr_error');
        }

        header('Content-Type: image/png');
        header('Cache-Control: public, max-age=3600');
        header('Content-Length: ' . strlen($png));
        header('Content-Disposition: inline; filename="qr-' . $id . '.png"');
        echo $png;
        exit;
    });
}

/**
 * Construye la URL pública de votación de un stand: {base}/s/{id}.
 *
 * Por defecto se deriva del request — igual que el frontend (standUrl) — para
 * que el enlace incluya SIEMPRE el subdirectorio donde corre la app
 * (p. ej. https://host/lamejortaza/s/{id}), sin depender de configuración.
 * Sólo `public_base_url` la sobreescribe, y en ese caso DEBE incluir el
 * subdirectorio si la app vive en uno.
 */
function qr_stand_url(string $id): string
{
    // 1) Override explícito (debe incluir el subdirectorio si aplica).
    $override = rtrim((string) Config::get('public_base_url', ''), '/');
    if ($override !== '') {
        return $override . '/s/' . $id;
    }

    // 2) Derivar del request (esquema + host + ruta base de la app).
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
    $scheme = $https ? 'https' : 'http';
    $host   = $_SERVER['HTTP_HOST'] ?? 'localhost';

    // Ruta base = directorio que contiene /api/. SCRIPT_NAME suele ser
    // "/<subdir>/api/index.php"; quitamos el sufijo "/api/<archivo>.php".
    $scriptName = str_replace('\\', '/', (string) ($_SERVER['SCRIPT_NAME'] ?? '/api/index.php'));
    $appBase = rtrim((string) preg_replace('#/api/[^/]*$#', '', $scriptName), '/');

    return $scheme . '://' . $host . $appBase . '/s/' . $id;
}
