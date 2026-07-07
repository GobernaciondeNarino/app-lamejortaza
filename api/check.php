<?php
// api/check.php — el archivo más simple posible. Si esto NO devuelve un
// JSON válido sino un 500, es problema del hosting (PHP no corre en api/,
// .htaccess está bloqueando, AllowOverride None, etc.) — no del código.
// BORRA este archivo cuando termines de diagnosticar.

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');
// Nota de seguridad: este endpoint es público y sin autenticación, así que
// SÓLO debe confirmar "PHP corre" sin revelar detalles del servidor. No se
// exponen rutas absolutas (DOCUMENT_ROOT), software del servidor ni la URI:
// esos datos ayudan a un atacante a hacer reconocimiento dirigido.
echo json_encode([
    'ok'          => true,
    'php_version' => PHP_VERSION,
    'sapi'        => PHP_SAPI,
    'message'     => 'PHP corre correctamente en api/.',
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
