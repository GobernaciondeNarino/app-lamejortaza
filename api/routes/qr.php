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
        // Privada, no compartida: el contenido depende de la configuración del
        // sitio y no queremos que un proxy sirva a otros una versión que se
        // generó en circunstancias distintas.
        header('Cache-Control: private, max-age=600');
        header('Vary: Host');
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
    // El host NO puede salir de la cabecera Host: estos QR se imprimen y se
    // pegan en los stands. Con Host manipulado (y la respuesta cacheada
    // públicamente durante una hora) se generaban carteles con el sello de la
    // Gobernación que llevaban al sitio del atacante a recolectar correos.
    // Security::baseUrlPublica() sólo acepta el host si está en allowed_origins.
    return \LMT\Security::baseUrlPublica() . '/s/' . $id;
}
