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

/** Construye la URL pública de votación de un stand, respetando la config. */
function qr_stand_url(string $id): string
{
    $base = rtrim((string) Config::get('public_base_url', ''), '/');
    if ($base === '') {
        $origins = (array) Config::get('allowed_origins', []);
        $base = rtrim((string) ($origins[0] ?? ''), '/');
    }
    if ($base === '') {
        $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $base = $scheme . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost');
    }
    return $base . '/s/' . $id;
}
