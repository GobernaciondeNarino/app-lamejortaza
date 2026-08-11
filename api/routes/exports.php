<?php
defined('LMT_GUARD') || exit('forbidden');
use LMT\Db;
use LMT\Response;
use LMT\Security;

function register_routes_exports(\LMT\Router $r): void
{
    $r->get('/export/votos.csv', function () {
        Security::requireAdmin();
        export_csv_stream('votos.csv', ['id', 'stand_id', 'emoji', 'correo', 'compra', 'texto', 'created_at'],
            'SELECT id, stand_id, emoji, correo, compra, texto, created_at FROM votos ORDER BY created_at DESC');
    });

    $r->get('/export/stands.csv', function () {
        Security::requireAdmin();
        export_csv_stream('stands.csv',
            ['id', 'nombre', 'municipio', 'region', 'direccion', 'correo', 'descripcion', 'votos_bueno', 'votos_regular', 'votos_malo', 'created_at'],
            'SELECT id, nombre, municipio, region, direccion, correo, descripcion, votos_bueno, votos_regular, votos_malo, created_at FROM stands ORDER BY id');
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
