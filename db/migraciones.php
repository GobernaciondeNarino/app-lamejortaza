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
 * Columnas que debería tener cada tabla, LEÍDAS DEL PROPIO FICHERO DE ESQUEMA.
 *
 * Antes esto era una lista escrita a mano y había que acordarse de ampliarla
 * cada vez que el esquema crecía. No nos acordamos: una instalación sobre la
 * base del año pasado moría con «table admins has no column named is_admin».
 * Ahora la fuente de verdad es una sola —db/schema.<motor>.sql— y cualquier
 * columna que se añada allí se migra sin tocar este archivo.
 *
 * @return array<string, array<string, string>>  tabla => [columna => definición]
 */
function lmt_columnas_nuevas(string $driver = 'sqlite'): array
{
    $mapa = [];
    foreach (lmt_sentencias_esquema($driver) as $sentencia) {
        if (!preg_match('/^CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"]?(\w+)[`"]?\s*\((.*)\)/is', $sentencia, $m)) {
            continue;
        }
        [$tabla, $cuerpo] = [$m[1], $m[2]];
        // Quitar la cola de opciones de MySQL (ENGINE=..., por ejemplo) que
        // queda pegada al último paréntesis.
        foreach (lmt_partir_columnas($cuerpo) as $linea) {
            $def = lmt_definicion_columna($linea, $driver);
            if ($def !== null) $mapa[$tabla][$def[0]] = $def[1];
        }
    }
    return $mapa;
}

/**
 * Parte el cuerpo de un CREATE TABLE por comas, respetando los paréntesis:
 * `DECIMAL(9,6)` y `CHECK (rol IN ('a','b'))` llevan comas dentro.
 *
 * @return string[]
 */
function lmt_partir_columnas(string $cuerpo): array
{
    $partes = []; $actual = ''; $nivel = 0; $comilla = '';
    $n = strlen($cuerpo);
    for ($i = 0; $i < $n; $i++) {
        $c = $cuerpo[$i];
        if ($comilla !== '') {
            if ($c === $comilla) $comilla = '';
        } elseif ($c === "'" || $c === '"' || $c === '`') {
            $comilla = $c;
        } elseif ($c === '(') {
            $nivel++;
        } elseif ($c === ')') {
            if ($nivel === 0) break;   // paréntesis que cierra el CREATE TABLE
            $nivel--;
        } elseif ($c === ',' && $nivel === 0) {
            $partes[] = trim($actual); $actual = ''; continue;
        }
        $actual .= $c;
    }
    if (trim($actual) !== '') $partes[] = trim($actual);
    return $partes;
}

/**
 * Convierte una línea del CREATE TABLE en [columna, definición-para-ALTER], o
 * null si no es una columna que se pueda añadir después.
 *
 * @return array{0: string, 1: string}|null
 */
function lmt_definicion_columna(string $linea, string $driver): ?array
{
    $linea = trim((string) preg_replace('/\s+/', ' ', $linea));
    if ($linea === '') return null;

    // Restricciones de tabla, no columnas.
    if (preg_match('/^(PRIMARY|UNIQUE|FOREIGN|CONSTRAINT|KEY|INDEX|CHECK|FULLTEXT|SPATIAL)\b/i', $linea)) return null;

    if (!preg_match('/^[`"]?(\w+)[`"]?\s+(.+)$/s', $linea, $m)) return null;
    [$col, $tipo] = [$m[1], $m[2]];

    // Ni SQLite ni MySQL aceptan añadir una clave primaria o autoincremental
    // con ALTER TABLE, y una UNIQUE sobre una tabla con datos puede fallar.
    if (preg_match('/\b(PRIMARY KEY|AUTOINCREMENT|AUTO_INCREMENT|UNIQUE)\b/i', $tipo)) return null;

    // NOT NULL sin valor por defecto revienta al añadirla a una tabla con
    // filas: no habría qué poner en las que ya están. Se añade permisiva; la
    // aplicación siempre escribe el valor.
    if (preg_match('/\bNOT NULL\b/i', $tipo) && !preg_match('/\bDEFAULT\b/i', $tipo)) {
        $tipo = (string) preg_replace('/\bNOT NULL\b/i', '', $tipo);
    }
    // SQLite tampoco admite CURRENT_TIMESTAMP como defecto en ALTER TABLE.
    if ($driver === 'sqlite' && preg_match('/DEFAULT\s+CURRENT_TIMESTAMP/i', $tipo)) {
        $tipo = (string) preg_replace('/\s*(NOT NULL\s*)?DEFAULT\s+CURRENT_TIMESTAMP/i', '', $tipo);
    }

    $tipo = trim((string) preg_replace('/\s+/', ' ', $tipo));
    return $tipo === '' ? null : [$col, $tipo];
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

    foreach (lmt_columnas_nuevas($driver) as $tabla => $cols) {
        $actuales = lmt_columnas($pdo, $driver, $tabla);
        if ($actuales === null) {
            $log[] = "- {$tabla}: no existe todavía (la crea el esquema base).";
            continue;
        }
        foreach ($cols as $col => $tipo) {
            if (in_array($col, $actuales, true)) continue;
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

    // Normalizar municipio y región de lo que ya está guardado.
    if (!$dryRun) {
        $r = lmt_normalizar_territorio($pdo);
        foreach ($r['log'] as $l) $log[] = $l;
        foreach ($r['errores'] as $e) $errores[] = $e;
    }

    return ['log' => $log, 'tablas' => $tablas, 'columnas' => $columnas, 'errores' => $errores];
}

/**
 * Pone municipio y región en su forma canónica.
 *
 * Cuando eran campos de texto libre, en la base acabaron conviviendo «Pasto» y
 * «San Juan de Pasto» como municipios distintos, y «Centro» junto a «Centro de
 * Nariño» como si fueran dos zonas. Ahora que se eligen de una lista, lo que ya
 * está guardado hay que arreglarlo: si no, las estadísticas por zona siguen sin
 * valer nada y el mapa deja fuera stands que sí tienen municipio.
 *
 * Sólo toca las filas cuyo municipio se reconoce; lo que no esté en el catálogo
 * del DANE se deja como está, para que nadie pierda un dato por una corrección
 * automática. Es idempotente.
 */
function lmt_normalizar_territorio(PDO $pdo): array
{
    $log = []; $errores = [];
    $ruta = __DIR__ . '/../api/lib/Territorio.php';
    if (!is_file($ruta)) return ['log' => [], 'errores' => []];
    require_once $ruta;

    $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);

    // Stands: municipio canónico y región DEDUCIDA de él.
    if (lmt_columnas($pdo, $driver, 'stands') !== null) {
        try {
            $filas = $pdo->query('SELECT id, municipio, region FROM stands')->fetchAll(PDO::FETCH_ASSOC);
            $upd = $pdo->prepare('UPDATE stands SET municipio = :m, region = :r WHERE id = :id');
            $n = 0; $sinReconocer = [];
            foreach ($filas as $f) {
                $muni = \LMT\Territorio::municipio($f['municipio'] ?? '');
                if ($muni === null) { $sinReconocer[] = (string) $f['municipio']; continue; }
                $sub = (string) \LMT\Territorio::subregion($muni);
                if ($muni === ($f['municipio'] ?? '') && $sub === ($f['region'] ?? '')) continue;
                $upd->execute([':m' => $muni, ':r' => $sub, ':id' => $f['id']]);
                $n++;
            }
            if ($n > 0) $log[] = "· {$n} stands con municipio y región normalizados.";
            if ($sinReconocer) {
                $log[] = '· Municipios que no están en el catálogo de Nariño (se dejan como están): '
                       . implode(', ', array_unique($sinReconocer));
            }
        } catch (\Throwable $e) {
            $errores[] = 'Normalizando stands: ' . $e->getMessage();
        }
    }

    // Visitantes: sólo el nombre del municipio. Un visitante puede venir de
    // fuera de Nariño, así que aquí no se deduce ninguna región.
    if (lmt_columnas($pdo, $driver, 'visitantes') !== null) {
        try {
            $filas = $pdo->query("SELECT correo, municipio FROM visitantes WHERE municipio IS NOT NULL AND municipio <> ''")
                         ->fetchAll(PDO::FETCH_ASSOC);
            $upd = $pdo->prepare('UPDATE visitantes SET municipio = :m WHERE correo = :c');
            $n = 0;
            foreach ($filas as $f) {
                $muni = \LMT\Territorio::municipio($f['municipio']);
                if ($muni === null || $muni === $f['municipio']) continue;
                $upd->execute([':m' => $muni, ':c' => $f['correo']]);
                $n++;
            }
            if ($n > 0) $log[] = "· {$n} visitantes con el municipio normalizado.";
        } catch (\Throwable $e) {
            $errores[] = 'Normalizando visitantes: ' . $e->getMessage();
        }
    }

    return ['log' => $log, 'errores' => $errores];
}
