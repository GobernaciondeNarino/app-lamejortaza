<?php
defined('LMT_GUARD') || exit('forbidden');
use LMT\Db;
use LMT\Response;
use LMT\Security;

/**
 * Descargas para informes.
 *
 * Cada cifra que enseña el panel tiene aquí su archivo: el organizador rinde
 * cuentas con tablas, no con capturas de pantalla, y una cifra que no se puede
 * descargar hay que copiarla a mano (y se copia mal).
 *
 * Todas identifican al espacio por su id Y por su número/nombre: con sólo el
 * nombre, dos espacios que se llamen parecido no se distinguen en una hoja de
 * cálculo; con sólo el id, nadie sabe de quién es la fila «ST-07».
 *
 * Todo exige sesión de administrador. Las que llevan datos personales
 * (visitantes, votos con correo, promotores) lo dicen en el panel junto al
 * botón: guardarlas es una decisión sobre datos personales (Ley 1581/2012).
 */
function register_routes_exports(\LMT\Router $r): void
{
    $r->get('/export/votos.csv', function () {
        Security::requireAdmin();
        $num = export_numeracion();
        $rows = Db::pdo()->query(
            'SELECT v.id, v.stand_id, s.nombre AS stand_nombre, s.numero AS stand_numero, v.emoji,
                    v.est_innovacion, v.est_atencion, v.est_calidad,
                    v.correo, v.compra, v.compra_valor, v.texto, v.created_at
             FROM votos v LEFT JOIN stands s ON s.id = v.stand_id
             ORDER BY v.created_at DESC'
        );
        export_csv_filas('votos.csv',
            ['id', 'stand_id', 'stand_identificador', 'stand_nombre', 'emoji', 'calificacion',
             'est_innovacion', 'est_atencion', 'est_calidad', 'correo', 'compra', 'compra_valor', 'texto', 'created_at'],
            (function () use ($rows, $num) {
                while ($v = $rows->fetch()) {
                    yield [
                        $v['id'], $v['stand_id'], export_identificador($v['stand_id'], $v['stand_numero'], $num),
                        $v['stand_nombre'], $v['emoji'], EXPORT_CALIFICACION[$v['emoji']] ?? '',
                        $v['est_innovacion'], $v['est_atencion'], $v['est_calidad'],
                        $v['correo'], $v['compra'], $v['compra_valor'], $v['texto'], $v['created_at'],
                    ];
                }
            })());
    });

    $r->get('/export/stands.csv', function () {
        Security::requireAdmin();
        $num = export_numeracion();
        $ficha = \LMT\Catalogos::camposFicha();
        $columnas = array_merge(
            ['id', 'numero', 'identificador', 'nombre', 'municipio', 'region', 'direccion', 'correo', 'telefono',
             'propietario', 'nit', 'sitio_web', 'descripcion',
             'tipo_organizacion', 'tipo_organizacion_otro', 'actividad_cafe', 'actividad_cafe_otro'],
            array_values(array_diff($ficha, ['tipo_organizacion', 'tipo_organizacion_otro', 'actividad_cafe', 'actividad_cafe_otro'])),
            ['votos_bueno', 'votos_regular', 'votos_malo', 'created_at']
        );
        $rows = Db::pdo()->query('SELECT * FROM stands ORDER BY id');
        export_csv_filas('stands.csv', $columnas, (function () use ($rows, $columnas, $num) {
            while ($s = $rows->fetch()) {
                $s['identificador'] = export_identificador($s['id'], $s['numero'] ?? null, $num);
                yield array_map(fn($c) => $s[$c] ?? '', $columnas);
            }
        })());
    });

    /**
     * El ranking tal y como se ve en el panel y en el tablero público: mismo
     * puntaje (Excelente vale 100, Regular 50, Malo 0) y mismo orden.
     */
    $r->get('/export/ranking.csv', function () {
        Security::requireAdmin();
        export_csv_filas('ranking.csv',
            ['posicion', 'id', 'identificador', 'nombre', 'municipio', 'region',
             'votos_excelente', 'votos_regular', 'votos_malo', 'votos_total', 'puntaje', 'aprobacion_pct',
             'est_innovacion', 'est_atencion', 'est_calidad', 'valoraciones_con_estrellas'],
            export_ranking());
    });

    /** Las cifras sueltas del panel (las tarjetas de arriba de cada sección). */
    $r->get('/export/resumen.csv', function () {
        Security::requireAdmin();
        export_csv_filas('resumen.csv', ['indicador', 'valor', 'detalle'], export_resumen());
    });

    $r->get('/export/economia.csv', function () {
        Security::requireAdmin();
        $pdo = Db::pdo();
        $num = export_numeracion();
        $total = $pdo->query(
            'SELECT COUNT(*) AS votos,
                    SUM(CASE WHEN compra = 1 THEN 1 ELSE 0 END) AS compras,
                    SUM(CASE WHEN compra = 1 THEN compra_valor ELSE 0 END) AS valor,
                    COUNT(compra_valor) AS con_valor
             FROM votos'
        )->fetch(\PDO::FETCH_ASSOC) ?: [];
        $filas = $pdo->query(
            'SELECT s.id, s.numero, s.nombre, s.municipio,
                    COUNT(v.id) AS votos,
                    SUM(CASE WHEN v.compra = 1 THEN 1 ELSE 0 END) AS compras,
                    SUM(CASE WHEN v.compra = 1 THEN v.compra_valor ELSE 0 END) AS valor,
                    COUNT(v.compra_valor) AS con_valor
             FROM stands s LEFT JOIN votos v ON v.stand_id = s.id
             GROUP BY s.id, s.numero, s.nombre, s.municipio
             ORDER BY valor DESC, compras DESC, s.nombre'
        )->fetchAll(\PDO::FETCH_ASSOC);
        $salida = [];
        foreach ($filas as $f) {
            $e = economia_fila($f);
            $salida[] = [$f['id'], export_identificador($f['id'], $f['numero'], $num), $f['nombre'], $f['municipio'],
                         $e['votos'], $e['compras'], $e['con_valor'], $e['valor'], $e['ticket'], $e['conversion']];
        }
        // La fila de total va al final y marcada: quien sume la columna en la
        // hoja de cálculo tiene que poder excluirla.
        $t = economia_fila($total);
        $salida[] = ['TOTAL', '', 'Todo el festival', '', $t['votos'], $t['compras'], $t['con_valor'], $t['valor'], $t['ticket'], $t['conversion']];
        export_csv_filas('economia.csv',
            ['id', 'identificador', 'nombre', 'municipio', 'votos', 'compras', 'compras_con_valor',
             'valor_declarado_cop', 'ticket_promedio_cop', 'conversion_pct'],
            $salida);
    });

    /**
     * Caracterización agregada: una fila por respuesta y dimensión, sin
     * ningún dato personal. `?dimension=genero` descarga sólo una.
     */
    $r->get('/export/caracterizacion.csv', function () {
        Security::requireAdmin();
        $pdo = Db::pdo();
        $sola = isset($_GET['dimension']) && is_string($_GET['dimension']) ? $_GET['dimension'] : '';
        $total = (int) $pdo->query('SELECT COUNT(*) FROM visitantes')->fetchColumn();
        $pct = fn(int $n) => $total > 0 ? round($n * 100 / $total, 1) : 0;
        $filas = [];
        $dimensiones = array_keys(VISITANTE_OPCIONES);
        $nombres = EXPORT_DIMENSIONES;
        foreach ($dimensiones as $campo) {
            if ($sola !== '' && $sola !== $campo) continue;
            // $campo sale de una constante del propio código, no del cliente.
            foreach ($pdo->query("SELECT $campo AS valor, COUNT(*) AS n FROM visitantes
                                  WHERE $campo IS NOT NULL AND $campo <> '' GROUP BY $campo ORDER BY n DESC")->fetchAll() as $f) {
                $filas[] = [$nombres[$campo] ?? $campo, $f['valor'], VISITANTE_ETIQUETAS[$campo][$f['valor']] ?? $f['valor'], (int) $f['n'], $pct((int) $f['n'])];
            }
        }
        if ($sola === '' || $sola === 'municipio') {
            // Todos, no los 25 de la pantalla: el recorte es para que quepa.
            foreach ($pdo->query("SELECT municipio AS valor, COUNT(*) AS n FROM visitantes
                                  WHERE municipio IS NOT NULL AND municipio <> '' GROUP BY municipio ORDER BY n DESC, municipio")->fetchAll() as $f) {
                $filas[] = [$nombres['municipio'], $f['valor'], $f['valor'], (int) $f['n'], $pct((int) $f['n'])];
            }
        }
        if ($sola === '' || $sola === 'primera_visita') {
            foreach ($pdo->query('SELECT primera_visita AS valor, COUNT(*) AS n FROM visitantes
                                  WHERE primera_visita IS NOT NULL GROUP BY primera_visita')->fetchAll() as $f) {
                $filas[] = [$nombres['primera_visita'], $f['valor'], (int) $f['valor'] === 1 ? 'Es su primera vez' : 'Ya había venido', (int) $f['n'], $pct((int) $f['n'])];
            }
        }
        if ($sola !== '' && !$filas && !isset($nombres[$sola])) Response::error(422, 'dimension_invalida');
        export_csv_filas($sola !== '' ? "caracterizacion-$sola.csv" : 'caracterizacion.csv',
            ['dimension', 'valor', 'etiqueta', 'personas', 'porcentaje_de_perfiles'], $filas);
    });

    /** Lo que el público espera del festival, sin correos ni nombres. */
    $r->get('/export/expectativas.csv', function () {
        Security::requireAdmin();
        export_csv_stream('expectativas.csv', ['expectativa', 'municipio', 'created_at'],
            "SELECT expectativa, municipio, created_at FROM visitantes
             WHERE expectativa IS NOT NULL AND expectativa <> '' ORDER BY created_at DESC");
    });

    // Caracterización de visitantes. Lleva datos sensibles (grupo étnico,
    // discapacidad), así que sólo lo descarga un administrador que ya cambió su
    // contraseña temporal —lo exige Security::requireAdmin()— y el fichero es
    // responsabilidad de quien lo guarda.
    $r->get('/export/visitantes.csv', function () {
        Security::requireAdmin();
        export_csv_stream('visitantes.csv',
            ['correo', 'nombre', 'telefono', 'genero', 'rango_edad', 'pais', 'departamento',
             'municipio', 'tipo_visitante', 'entidad', 'grupo_etnico', 'discapacidad',
             'expectativa', 'como_se_entero', 'primera_visita', 'created_at', 'updated_at'],
            'SELECT correo, nombre, telefono, genero, rango_edad, pais, departamento,
                    municipio, tipo_visitante, entidad, grupo_etnico, discapacidad,
                    expectativa, como_se_entero, primera_visita, created_at, updated_at
             FROM visitantes ORDER BY created_at DESC');
    });

    $r->get('/export/pasaportes.csv', function () {
        Security::requireAdmin();
        export_csv_stream('pasaportes.csv', ['correo', 'nombre', 'inicio', 'visitados'],
            'SELECT correo, nombre, inicio, visitados FROM pasaportes ORDER BY inicio DESC');
    });

    /**
     * Inscripciones de promotores con su caracterización. Sin credenciales ni
     * nada que sirva para entrar: ni hashes, ni métodos de acceso, ni IP.
     */
    $r->get('/export/promotores.csv', function () {
        Security::requireAdmin();
        $num = export_numeracion();
        $ficha = \LMT\Catalogos::camposFicha();
        $columnas = array_merge(
            ['id', 'estado', 'nombre', 'email', 'telefono', 'documento', 'municipio', 'empresa_tentativa',
             'stand_nombre', 'stand_id', 'stand_identificador', 'stand_direccion', 'stand_nit', 'stand_sitio_web'],
            $ficha,
            ['motivo', 'created_at', 'verificado_at', 'ultimo_acceso']
        );
        $sel = implode(', ', array_map(fn($c) => 'p.' . $c, array_diff($columnas, ['stand_identificador'])));
        $rows = Db::pdo()->query("SELECT $sel, s.numero AS stand_numero FROM promotores p
                                  LEFT JOIN stands s ON s.id = p.stand_id ORDER BY p.created_at DESC");
        export_csv_filas('promotores.csv', $columnas, (function () use ($rows, $columnas, $num) {
            while ($p = $rows->fetch()) {
                $p['stand_identificador'] = $p['stand_id'] ? export_identificador($p['stand_id'], $p['stand_numero'], $num) : '';
                yield array_map(fn($c) => $p[$c] ?? '', $columnas);
            }
        })());
    });

    /** Bitácora de correos: a quién, qué, cuándo y si salió. */
    $r->get('/export/correos.csv', function () {
        Security::requireAdmin();
        export_csv_stream('correos.csv', ['created_at', 'destinatario', 'tipo', 'asunto', 'transporte', 'estado', 'error'],
            'SELECT created_at, destinatario, tipo, asunto, transporte, estado, error FROM emails_log ORDER BY created_at DESC');
    });
}

/** Cómo se llama cada calificación en los informes. */
const EXPORT_CALIFICACION = ['bueno' => 'Excelente', 'regular' => 'Regular', 'malo' => 'Malo'];

/** Nombre legible de cada dimensión de la caracterización. */
const EXPORT_DIMENSIONES = [
    'genero' => 'Género', 'rango_edad' => 'Rango de edad', 'tipo_visitante' => 'Tipo de visitante',
    'como_se_entero' => 'Cómo se enteraron', 'grupo_etnico' => 'Grupo étnico', 'discapacidad' => 'Discapacidad',
    'municipio' => 'Municipio de origen', 'primera_visita' => 'Primera visita',
];

/**
 * ¿Tienen número de recinto TODOS los espacios? La misma regla de todo o nada
 * que la plataforma (ver numeroDeEspacio en Shared.jsx): el informe enseña el
 * identificador que ve el público, no otro.
 */
function export_numeracion(): bool
{
    $r = Db::pdo()->query("SELECT COUNT(*) AS total,
                                  SUM(CASE WHEN numero IS NOT NULL AND numero <> '' THEN 1 ELSE 0 END) AS con
                           FROM stands")->fetch(\PDO::FETCH_ASSOC) ?: [];
    return (int) ($r['total'] ?? 0) > 0 && (int) $r['total'] === (int) $r['con'];
}

function export_identificador($id, $numero, bool $numeracionCompleta): string
{
    $n = trim((string) $numero);
    return ($numeracionCompleta && $n !== '') ? $n : strtoupper((string) $id);
}

/** Filas del ranking, en el mismo orden que el panel. */
function export_ranking(): array
{
    $num = export_numeracion();
    $filas = Db::pdo()->query(
        'SELECT s.id, s.numero, s.nombre, s.municipio, s.region, s.votos_bueno, s.votos_regular, s.votos_malo'
        . stand_select_estrellas('s') . ' FROM stands s'
    )->fetchAll(\PDO::FETCH_ASSOC);
    foreach ($filas as &$f) {
        $b = (int) $f['votos_bueno']; $rg = (int) $f['votos_regular']; $m = (int) $f['votos_malo'];
        $f['total'] = $b + $rg + $m;
        $f['puntaje'] = ($b * 100 + $rg * 50) / max(1, $f['total']);
    }
    unset($f);
    usort($filas, fn($a, $b) => [$b['puntaje'], $b['total'], $a['nombre']] <=> [$a['puntaje'], $a['total'], $b['nombre']]);
    $salida = [];
    foreach ($filas as $i => $f) {
        $prom = fn($v) => $v === null ? '' : round((float) $v, 2);
        $salida[] = [
            $i + 1, $f['id'], export_identificador($f['id'], $f['numero'], $num), $f['nombre'], $f['municipio'], $f['region'],
            (int) $f['votos_bueno'], (int) $f['votos_regular'], (int) $f['votos_malo'], $f['total'],
            round($f['puntaje'], 1), $f['total'] > 0 ? round($f['votos_bueno'] * 100 / $f['total'], 1) : 0,
            $prom($f['est_innovacion']), $prom($f['est_atencion']), $prom($f['est_calidad']), (int) $f['est_n'],
        ];
    }
    return $salida;
}

/** Las cifras sueltas de cada pantalla del panel, con la fecha de corte. */
function export_resumen(): array
{
    $pdo = Db::pdo();
    $uno = fn(string $sql) => (int) $pdo->query($sql)->fetchColumn();
    $espacios = $uno('SELECT COUNT(*) FROM stands');
    $votos    = $uno('SELECT COUNT(*) FROM votos');
    $bueno    = $uno("SELECT COUNT(*) FROM votos WHERE emoji = 'bueno'");
    $votantes = $uno('SELECT COUNT(DISTINCT correo) FROM votos');
    $perfiles = $uno('SELECT COUNT(*) FROM visitantes');
    $eco = economia_fila($pdo->query(
        'SELECT COUNT(*) AS votos, SUM(CASE WHEN compra = 1 THEN 1 ELSE 0 END) AS compras,
                SUM(CASE WHEN compra = 1 THEN compra_valor ELSE 0 END) AS valor, COUNT(compra_valor) AS con_valor
         FROM votos')->fetch(\PDO::FETCH_ASSOC) ?: []);
    $filas = [
        ['Fecha de corte', date('Y-m-d H:i:s'), 'Hora del servidor'],
        ['Espacios registrados', $espacios, 'Espacios'],
        ['Votos totales', $votos, 'Espacios / Actividad'],
        ['Aprobación general (%)', $votos > 0 ? (int) round($bueno * 100 / $votos) : 0, 'Votos «Excelente» sobre el total'],
        ['Pasaportes activos', $uno('SELECT COUNT(*) FROM pasaportes'), 'Espacios'],
        ['Votantes (correos distintos)', $votantes, 'Visitantes'],
        ['Perfiles de visitante completados', $perfiles, 'Visitantes'],
        ['Cobertura de la caracterización (%)', $votantes > 0 ? (int) round($perfiles * 100 / $votantes) : 0, 'Perfiles sobre votantes'],
        ['Compras declaradas', $eco['compras'], 'Actividad económica'],
        ['Valor declarado (COP)', $eco['valor'], 'Actividad económica · lo real es igual o más'],
        ['Ticket promedio (COP)', $eco['ticket'], 'Sobre las compras que traen importe'],
        ['Conversión (%)', $eco['conversion'], 'Votos que dicen haber comprado'],
    ];
    foreach ($pdo->query('SELECT estado, COUNT(*) AS n FROM promotores GROUP BY estado ORDER BY estado')->fetchAll() as $f) {
        $filas[] = ['Promotores · ' . $f['estado'], (int) $f['n'], 'Promotores'];
    }
    foreach ($pdo->query('SELECT estado, COUNT(*) AS n FROM emails_log GROUP BY estado ORDER BY estado')->fetchAll() as $f) {
        $filas[] = ['Correos · ' . $f['estado'], (int) $f['n'], 'Bitácora'];
    }
    return $filas;
}

/**
 * Como export_csv_stream(), pero con filas ya calculadas en PHP (agregados,
 * columnas derivadas) en vez de una consulta.
 */
function export_csv_filas(string $filename, array $columns, iterable $filas): void
{
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Cache-Control: no-store, no-cache, must-revalidate');
    $out = fopen('php://output', 'w');
    fwrite($out, "\xEF\xBB\xBF");
    csv_escribir_fila($out, array_map('csv_safe_cell', $columns));
    foreach ($filas as $fila) {
        csv_escribir_fila($out, array_map(function ($v) {
            if (is_array($v)) $v = json_encode($v, JSON_UNESCAPED_UNICODE);
            if (is_bool($v))  $v = $v ? '1' : '0';
            return csv_safe_cell((string) ($v ?? ''));
        }, array_values($fila)));
    }
    fclose($out);
    exit;
}

function export_csv_stream(string $filename, array $columns, string $sql): void
{
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Cache-Control: no-store, no-cache, must-revalidate');

    $out = fopen('php://output', 'w');
    // BOM para que Excel reconozca UTF-8
    fwrite($out, "\xEF\xBB\xBF");
    csv_escribir_fila($out, array_map('csv_safe_cell', $columns));
    $stmt = Db::pdo()->query($sql);
    while ($row = $stmt->fetch()) {
        $line = [];
        foreach ($columns as $col) {
            $v = $row[$col] ?? '';
            if (is_array($v)) $v = json_encode($v, JSON_UNESCAPED_UNICODE);
            if (is_bool($v))  $v = $v ? '1' : '0';
            $line[] = csv_safe_cell((string) $v);
        }
        csv_escribir_fila($out, $line);
    }
    fclose($out);
    exit;
}

/**
 * Serializa una fila en CSV RFC 4180 puro, sin usar fputcsv().
 *
 * fputcsv() acepta un carácter de "escape" (aquí se le pasaba '\\') que NO
 * forma parte del estándar CSV: al encontrarlo antes de una comilla deja de
 * duplicarla, y el entrecomillado de la celda se rompe. Con eso, un comentario
 * como  hola \",=1+1,x  se partía en varias celdas y  =1+1  quedaba como
 * fórmula viva, saltándose por completo el apostrofo defensivo de
 * csv_safe_cell(). PHP 8.4 permite `escape: ""` para desactivarlo, pero
 * escribir la fila a mano es explícito y funciona en cualquier versión.
 */
function csv_escribir_fila($handle, array $campos): void
{
    $celdas = [];
    foreach ($campos as $campo) {
        // Comillas siempre: elimina toda ambigüedad y es CSV válido.
        $celdas[] = '"' . str_replace('"', '""', (string) $campo) . '"';
    }
    fwrite($handle, implode(',', $celdas) . "\r\n");
}

/**
 * Neutraliza la inyección de fórmulas (CSV/Formula Injection). Datos de texto
 * libre (comentarios, nombres) controlados por el usuario podrían empezar con
 * `=`, `+`, `-`, `@` o tabuladores y ser interpretados como fórmula cuando un
 * funcionario abre el CSV en Excel/LibreOffice/Sheets, permitiendo exfiltración
 * o ejecución. Anteponer un apóstrofo fuerza que la celda se trate como texto.
 * Ref: OWASP "CSV Injection".
 */
function csv_safe_cell(string $value): string
{
    if ($value === '') return $value;
    // strpbrk($value[0], ...) buscaba el primer carácter DENTRO del conjunto,
    // que es lo mismo, pero se lee al revés y es fácil romperlo al editar.
    // Comparación directa: más claro y sin sorpresas con bytes multibyte.
    if (strpos("=+-@\t\r|", $value[0]) !== false) {
        return "'" . $value;
    }
    return $value;
}
