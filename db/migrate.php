<?php
/**
 * db/migrate.php — pone al día una instalación EXISTENTE.
 *
 * Los ficheros db/schema.*.sql usan CREATE TABLE IF NOT EXISTS, así que crean
 * las tablas nuevas pero NO añaden columnas a las tablas que ya existen. En una
 * base que lleva datos del festival eso deja el esquema a medias y la
 * aplicación falla con errores de SQL opacos.
 *
 * Este script hace las dos cosas y es idempotente: se puede ejecutar tantas
 * veces como haga falta.
 *
 *   php db/migrate.php            # aplica los cambios
 *   php db/migrate.php --dry-run  # sólo muestra lo que haría
 *
 * No borra ni renombra nada: sólo crea tablas y añade columnas.
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

\LMT\Config::load(__DIR__ . '/../api/config.php');

$dryRun = in_array('--dry-run', $argv ?? [], true);
$pdo    = \LMT\Db::pdo();
$driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);

echo "Motor: {$driver}" . ($dryRun ? "  (simulación)\n" : "\n");

/** Columnas existentes de una tabla, o null si la tabla no existe. */
function columnas(PDO $pdo, string $driver, string $tabla): ?array
{
    try {
        if ($driver === 'sqlite') {
            $filas = $pdo->query("PRAGMA table_info(" . $tabla . ")")->fetchAll(PDO::FETCH_ASSOC);
            if (!$filas) return null;
            return array_map(fn($f) => (string) $f['name'], $filas);
        }
        $filas = $pdo->query("SHOW COLUMNS FROM `{$tabla}`")->fetchAll(PDO::FETCH_ASSOC);
        return array_map(fn($f) => (string) $f['Field'], $filas);
    } catch (\Throwable $e) {
        return null;
    }
}

// ---------------------------------------------------------------------------
// 1. Tablas nuevas: se aplica el esquema completo (IF NOT EXISTS es inocuo).
// ---------------------------------------------------------------------------
$archivo = $driver === 'mysql' ? __DIR__ . '/schema.mysql.sql' : __DIR__ . '/schema.sqlite.sql';
$sql = (string) file_get_contents($archivo);
if ($driver === 'mysql') {
    $sql = preg_replace('/^\s*CREATE DATABASE.*?;\s*/ims', '', $sql) ?? $sql;
    $sql = preg_replace('/^\s*USE\s+\S+\s*;\s*/im', '', $sql) ?? $sql;
}
$sql = preg_replace('!/\*.*?\*/!s', '', $sql) ?? $sql;
$sql = preg_replace('/^\s*--.*$/m', '', $sql) ?? $sql;

$creadas = 0;
foreach (array_filter(array_map('trim', explode(';', $sql))) as $sentencia) {
    if ($sentencia === '') continue;
    if ($dryRun) { $creadas++; continue; }
    try {
        $pdo->exec($sentencia);
        $creadas++;
    } catch (\Throwable $e) {
        echo "  ! " . substr(preg_replace('/\s+/', ' ', $sentencia) ?? '', 0, 70) . " → " . $e->getMessage() . "\n";
    }
}
echo "Esquema base aplicado ({$creadas} sentencias).\n";

// ---------------------------------------------------------------------------
// 2. Columnas añadidas a tablas que ya existían.
//    El tipo se declara por motor porque SQLite y MySQL no comparten sintaxis.
// ---------------------------------------------------------------------------
$columnasNuevas = [
    'stands' => [
        'propietario'           => ['mysql' => 'VARCHAR(120) DEFAULT NULL',  'sqlite' => 'TEXT'],
        'propietario_documento' => ['mysql' => 'VARCHAR(32) DEFAULT NULL',   'sqlite' => 'TEXT'],
        'nit'                   => ['mysql' => 'VARCHAR(32) DEFAULT NULL',   'sqlite' => 'TEXT'],
        'sitio_web'             => ['mysql' => 'VARCHAR(255) DEFAULT NULL',  'sqlite' => 'TEXT'],
        'logo_path'             => ['mysql' => 'VARCHAR(255) DEFAULT NULL',  'sqlite' => 'TEXT'],
        'telefono'              => ['mysql' => 'VARCHAR(32) DEFAULT NULL',   'sqlite' => 'TEXT'],
        'lat'                   => ['mysql' => 'DECIMAL(9,6) DEFAULT NULL',  'sqlite' => 'REAL'],
        'lng'                   => ['mysql' => 'DECIMAL(9,6) DEFAULT NULL',  'sqlite' => 'REAL'],
    ],
    'admins' => [
        'nombre'               => ['mysql' => 'VARCHAR(120) DEFAULT NULL', 'sqlite' => 'TEXT'],
        'rol'                  => ['mysql' => "VARCHAR(20) NOT NULL DEFAULT 'organizador'", 'sqlite' => "TEXT NOT NULL DEFAULT 'organizador'"],
        'must_change_password' => ['mysql' => 'TINYINT(1) NOT NULL DEFAULT 0', 'sqlite' => 'INTEGER NOT NULL DEFAULT 0'],
        'ultimo_acceso'        => ['mysql' => 'DATETIME DEFAULT NULL', 'sqlite' => 'DATETIME'],
        'creado_por'           => ['mysql' => 'INT UNSIGNED DEFAULT NULL', 'sqlite' => 'INTEGER'],
    ],
    'promotores' => [
        'stand_nombre'      => ['mysql' => 'VARCHAR(80) DEFAULT NULL',  'sqlite' => 'TEXT'],
        'stand_region'      => ['mysql' => 'VARCHAR(80) DEFAULT NULL',  'sqlite' => 'TEXT'],
        'stand_direccion'   => ['mysql' => 'VARCHAR(255) DEFAULT NULL', 'sqlite' => 'TEXT'],
        'stand_descripcion' => ['mysql' => 'VARCHAR(800) DEFAULT NULL', 'sqlite' => 'TEXT'],
        'stand_nit'         => ['mysql' => 'VARCHAR(32) DEFAULT NULL',  'sqlite' => 'TEXT'],
        'stand_sitio_web'   => ['mysql' => 'VARCHAR(255) DEFAULT NULL', 'sqlite' => 'TEXT'],
        'logo_path'         => ['mysql' => 'VARCHAR(255) DEFAULT NULL', 'sqlite' => 'TEXT'],
        'stand_lat'         => ['mysql' => 'DECIMAL(9,6) DEFAULT NULL', 'sqlite' => 'REAL'],
        'stand_lng'         => ['mysql' => 'DECIMAL(9,6) DEFAULT NULL', 'sqlite' => 'REAL'],
    ],
];

$añadidas = 0;
foreach ($columnasNuevas as $tabla => $cols) {
    $actuales = columnas($pdo, $driver, $tabla);
    if ($actuales === null) {
        echo "  - {$tabla}: no existe todavía (la crea el esquema base).\n";
        continue;
    }
    foreach ($cols as $col => $tipos) {
        if (in_array($col, $actuales, true)) continue;
        $tipo = $tipos[$driver] ?? $tipos['sqlite'];
        $ddl = $driver === 'mysql'
            ? "ALTER TABLE `{$tabla}` ADD COLUMN `{$col}` {$tipo}"
            : "ALTER TABLE {$tabla} ADD COLUMN {$col} {$tipo}";
        echo "  + {$tabla}.{$col}\n";
        if (!$dryRun) {
            try { $pdo->exec($ddl); $añadidas++; }
            catch (\Throwable $e) { echo "    ! " . $e->getMessage() . "\n"; }
        } else {
            $añadidas++;
        }
    }
}

// El primer administrador pasa a ser 'propietario': es quien puede crear y
// quitar a los demás. Sin esto, una instalación existente se queda sin nadie
// con permiso para administrar administradores.
if (!$dryRun) {
    try {
        $cols = columnas($pdo, $driver, 'admins') ?? [];
        if (in_array('rol', $cols, true)) {
            $hay = (int) $pdo->query("SELECT COUNT(*) FROM admins WHERE rol = 'propietario'")->fetchColumn();
            if ($hay === 0) {
                $pdo->exec("UPDATE admins SET rol = 'propietario' WHERE id = (SELECT id FROM (SELECT MIN(id) AS id FROM admins) t)");
                echo "  · El administrador más antiguo queda como 'propietario'.\n";
            }
        }
    } catch (\Throwable $e) {
        echo "  ! No se pudo marcar al propietario: " . $e->getMessage() . "\n";
    }
}

echo $dryRun
    ? "\nSimulación: {$añadidas} columnas se añadirían. Ejecuta sin --dry-run para aplicar.\n"
    : "\nListo. {$añadidas} columnas añadidas.\n";
