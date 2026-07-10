<?php
// db/migrate-roles.php
// Migración idempotente para el módulo de expositores (3 roles).
// Añade a `admins`: role, estado, nombre.  A `stands`: estado, owner.
// Los registros existentes quedan como admin/activo (via DEFAULT), sin tocar
// datos. Seguro de correr varias veces.
//
// Uso (desde la raíz del proyecto):
//   php db/migrate-roles.php

declare(strict_types=1);
if (!defined('LMT_GUARD')) define('LMT_GUARD', true);
if (PHP_SAPI !== 'cli') { fwrite(STDERR, "Sólo CLI.\n"); exit(1); }

require __DIR__ . '/../api/lib/Config.php';
require __DIR__ . '/../api/lib/Response.php';
require __DIR__ . '/../api/lib/Db.php';
\LMT\Config::load(__DIR__ . '/../api/config.php');

$pdo = \LMT\Db::pdo();
$driver = $pdo->getAttribute(\PDO::ATTR_DRIVER_NAME);

/** ¿Existe la columna en la tabla? (mysql/sqlite) */
function col_exists(\PDO $pdo, string $driver, string $table, string $col): bool
{
    if ($driver === 'sqlite') {
        foreach ($pdo->query("PRAGMA table_info(" . $table . ")") as $r) {
            if (strcasecmp($r['name'], $col) === 0) return true;
        }
        return false;
    }
    // mysql
    $st = $pdo->prepare(
        "SELECT COUNT(*) FROM information_schema.columns
         WHERE table_schema = DATABASE() AND table_name = :t AND column_name = :c"
    );
    $st->execute([':t' => $table, ':c' => $col]);
    return (int) $st->fetchColumn() > 0;
}

function add_col(\PDO $pdo, string $driver, string $table, string $col, string $ddl): void
{
    if (col_exists($pdo, $driver, $table, $col)) {
        echo "  = $table.$col ya existe\n";
        return;
    }
    $pdo->exec("ALTER TABLE $table ADD COLUMN $ddl");
    echo "  + $table.$col agregada\n";
}

echo "Driver: $driver\n";
echo "admins:\n";
add_col($pdo, $driver, 'admins', 'role',   "role VARCHAR(16) NOT NULL DEFAULT 'admin'");
add_col($pdo, $driver, 'admins', 'estado', "estado VARCHAR(16) NOT NULL DEFAULT 'activo'");
add_col($pdo, $driver, 'admins', 'nombre', "nombre VARCHAR(120) DEFAULT NULL");
echo "stands:\n";
add_col($pdo, $driver, 'stands', 'estado', "estado VARCHAR(16) NOT NULL DEFAULT 'activo'");
add_col($pdo, $driver, 'stands', 'owner',  "owner VARCHAR(254) DEFAULT NULL");

// Asegurar coherencia de los registros existentes (por si el DEFAULT no aplicó).
$pdo->exec("UPDATE admins SET role   = 'admin'  WHERE role   IS NULL OR role   = ''");
$pdo->exec("UPDATE admins SET estado = 'activo' WHERE estado IS NULL OR estado = ''");
$pdo->exec("UPDATE stands SET estado = 'activo' WHERE estado IS NULL OR estado = ''");

// Índices útiles para las consultas de estado (idempotentes).
try { $pdo->exec("CREATE INDEX IF NOT EXISTS idx_stands_estado ON stands(estado)"); } catch (\Throwable $e) {}
try { $pdo->exec("CREATE INDEX IF NOT EXISTS idx_admins_estado ON admins(estado)"); } catch (\Throwable $e) {}

echo "Migración completa.\n";
