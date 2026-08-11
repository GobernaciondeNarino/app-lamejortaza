<?php
/**
 * db/migraciones.php — poner al día el esquema, sin importar quién lo pida.
 *
 * Lo usan dos sitios: `db/migrate.php` desde la consola y el asistente de
 * instalación desde el navegador. Vive aparte porque el caso que de verdad
 * duele es actualizar una instalación que YA tiene datos del festival: los
 * ficheros db/schema.*.sql usan CREATE TABLE IF NOT EXISTS, así que crean las
 * tablas nuevas pero no añaden ni una columna a las que ya existen, y la
 * aplicación empieza a fallar con errores de SQL que no dicen nada.
 *
 * Todo lo de aquí es idempotente: se puede ejecutar tantas veces como haga
 * falta. No borra ni renombra nada — sólo crea tablas y añade columnas.
 */

declare(strict_types=1);
defined('LMT_GUARD') || exit('forbidden');

/**
 * Columnas que se han ido añadiendo a tablas que ya existían.
 * El tipo se declara por motor porque SQLite y MySQL no comparten sintaxis.
 */
function lmt_columnas_nuevas(): array
{
    return [
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
}

/** Columnas actuales de una tabla, o null si la tabla no existe. */
function lmt_columnas(PDO $pdo, string $driver, string $tabla): ?array
{
    try {
        if ($driver === 'sqlite') {
            $filas = $pdo->query('PRAGMA table_info(' . $tabla . ')')->fetchAll(PDO::FETCH_ASSOC);
            if (!$filas) return null;
            return array_map(fn($f) => (string) $f['name'], $filas);
        }
        $filas = $pdo->query("SHOW COLUMNS FROM `{$tabla}`")->fetchAll(PDO::FETCH_ASSOC);
        return array_map(fn($f) => (string) $f['Field'], $filas);
    } catch (\Throwable $e) {
        return null;
    }
}

/** Sentencias del fichero de esquema, listas para ejecutar una a una. */
function lmt_sentencias_esquema(string $driver): array
{
    $archivo = $driver === 'mysql' ? __DIR__ . '/schema.mysql.sql' : __DIR__ . '/schema.sqlite.sql';
    $sql = (string) @file_get_contents($archivo);
    if ($sql === '') return [];
    if ($driver === 'mysql') {
        // En una instalación gestionada la base ya existe y el usuario de la
        // aplicación no suele tener permiso para crearla ni para cambiar de una
        // a otra.
        $sql = preg_replace('/^\s*CREATE DATABASE.*?;\s*/ims', '', $sql) ?? $sql;
        $sql = preg_replace('/^\s*USE\s+\S+\s*;\s*/im', '', $sql) ?? $sql;
    }
    $sql = preg_replace('!/\*.*?\*/!s', '', $sql) ?? $sql;
    $sql = preg_replace('/^\s*--.*$/m', '', $sql) ?? $sql;
    return array_values(array_filter(array_map('trim', explode(';', $sql))));
}

/**
 * Aplica el esquema y las columnas que falten.
 *
 * @return array{log: string[], tablas: int, columnas: int, errores: string[]}
 */
function lmt_migrar(PDO $pdo, bool $dryRun = false): array
{
    $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
    $log = []; $errores = []; $tablas = 0; $columnas = 0;

    foreach (lmt_sentencias_esquema($driver) as $sentencia) {
        if ($dryRun) { $tablas++; continue; }
        try {
            $pdo->exec($sentencia);
            $tablas++;
        } catch (\Throwable $e) {
            $errores[] = substr((string) preg_replace('/\s+/', ' ', $sentencia), 0, 70) . ' → ' . $e->getMessage();
        }
    }
    $log[] = "Esquema base aplicado ({$tablas} sentencias).";

    foreach (lmt_columnas_nuevas() as $tabla => $cols) {
        $actuales = lmt_columnas($pdo, $driver, $tabla);
        if ($actuales === null) {
            $log[] = "- {$tabla}: no existe todavía (la crea el esquema base).";
            continue;
        }
        foreach ($cols as $col => $tipos) {
            if (in_array($col, $actuales, true)) continue;
            $tipo = $tipos[$driver] ?? $tipos['sqlite'];
            $ddl = $driver === 'mysql'
                ? "ALTER TABLE `{$tabla}` ADD COLUMN `{$col}` {$tipo}"
                : "ALTER TABLE {$tabla} ADD COLUMN {$col} {$tipo}";
            $log[] = "+ {$tabla}.{$col}";
            if ($dryRun) { $columnas++; continue; }
            try { $pdo->exec($ddl); $columnas++; }
            catch (\Throwable $e) { $errores[] = "{$tabla}.{$col}: " . $e->getMessage(); }
        }
    }

    // El administrador más antiguo pasa a 'propietario': es quien puede crear y
    // quitar a los demás. Sin esto, una instalación que viene de una versión
    // anterior se queda sin nadie con permiso para administrar cuentas.
    if (!$dryRun) {
        try {
            $cols = lmt_columnas($pdo, $driver, 'admins') ?? [];
            if (in_array('rol', $cols, true)) {
                $hay = (int) $pdo->query("SELECT COUNT(*) FROM admins WHERE rol = 'propietario'")->fetchColumn();
                $total = (int) $pdo->query('SELECT COUNT(*) FROM admins')->fetchColumn();
                if ($hay === 0 && $total > 0) {
                    $pdo->exec("UPDATE admins SET rol = 'propietario' WHERE id = (SELECT id FROM (SELECT MIN(id) AS id FROM admins) t)");
                    $log[] = "· El administrador más antiguo queda como 'propietario'.";
                }
            }
        } catch (\Throwable $e) {
            $errores[] = 'No se pudo marcar al propietario: ' . $e->getMessage();
        }
    }

    return ['log' => $log, 'tablas' => $tablas, 'columnas' => $columnas, 'errores' => $errores];
}
