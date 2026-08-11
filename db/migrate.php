<?php
/**
 * db/migrate.php — pone al día una instalación EXISTENTE desde la consola.
 *
 * La lógica vive en db/migraciones.php, que comparte con el asistente de
 * instalación: así no hay dos versiones de la verdad sobre qué columnas debe
 * tener el esquema.
 *
 *   php db/migrate.php            # aplica los cambios
 *   php db/migrate.php --dry-run  # sólo muestra lo que haría
 *
 * Es idempotente. No borra ni renombra nada: sólo crea tablas y añade columnas.
 */

declare(strict_types=1);
if (!defined('LMT_GUARD')) define('LMT_GUARD', true);

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit("Sólo CLI.\n");
}

require __DIR__ . '/../api/lib/Config.php';
require __DIR__ . '/../api/lib/Response.php';
require __DIR__ . '/../api/lib/Db.php';
require __DIR__ . '/migraciones.php';

\LMT\Config::load(__DIR__ . '/../api/config.php');

$dryRun = in_array('--dry-run', $argv ?? [], true);
$pdo    = \LMT\Db::pdo();

echo 'Motor: ' . $pdo->getAttribute(PDO::ATTR_DRIVER_NAME) . ($dryRun ? "  (simulación)\n" : "\n");

$r = lmt_migrar($pdo, $dryRun);
foreach ($r['log'] as $linea) echo '  ' . $linea . "\n";
foreach ($r['errores'] as $e) echo '  ! ' . $e . "\n";

echo $dryRun
    ? "\nSimulación: {$r['columnas']} columnas se añadirían. Ejecuta sin --dry-run para aplicar.\n"
    : "\nListo. {$r['columnas']} columnas añadidas.\n";

exit($r['errores'] ? 1 : 0);
