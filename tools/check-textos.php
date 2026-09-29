<?php
// tools/check-textos.php — los textos editables del panel y los del código,
// ¿dicen lo mismo?
//
// Cada texto que se puede cambiar en Configuración → Interfaz tiene su texto
// de fábrica escrito DOS veces: en el catálogo de api/lib/Interfaz.php (lo que
// el panel enseña como «lo que trae el sistema») y en el componente que lo
// pinta (lo que se ve si nadie lo cambia). Si se corrige uno y no el otro, el
// panel promete un texto y la página enseña otro. Este script lo detecta.
//
// Uso:   php tools/check-textos.php
// Sale con código 1 si encuentra algo.

declare(strict_types=1);
if (!defined('LMT_GUARD')) define('LMT_GUARD', true);

$raiz = dirname(__DIR__);
require $raiz . '/api/lib/Interfaz.php';

use LMT\Interfaz;

$archivos = array_merge(glob($raiz . '/components/*.jsx') ?: [], [$raiz . '/js/passport-book.js']);

// Una cadena de JS entre comillas dobles, con sus escapes (\n, \", \u…).
$cadena = '"((?:[^"\\\\]|\\\\.)*)"';
$patrones = [
    'texto' => [
        '/<Texto\s+k="([^"]+)"\s+d=\{?' . $cadena . '\}?\s*\/>/u',
        '/\b(?:texto|t|lineas)\(\s*"([^"]+)"\s*,\s*' . $cadena . '\s*\)/u',
    ],
    'icono' => [
        '/\bicono\(\s*"([^"]+)"\s*,\s*' . $cadena . '\s*\)/u',
    ],
];

$usos = ['texto' => [], 'icono' => []];
foreach ($archivos as $f) {
    $src = (string) file_get_contents($f);
    foreach ($patrones as $tipo => $lista) {
        foreach ($lista as $re) {
            preg_match_all($re, $src, $m, PREG_SET_ORDER | PREG_OFFSET_CAPTURE);
            foreach ($m as $x) {
                $linea = substr_count(substr($src, 0, $x[0][1]), "\n") + 1;
                $valor = json_decode('"' . $x[2][0] . '"');
                $usos[$tipo][] = [
                    'clave' => $x[1][0],
                    'defecto' => is_string($valor) ? $valor : $x[2][0],
                    'donde' => str_replace($raiz . '/', '', $f) . ':' . $linea,
                ];
            }
        }
    }
}

$errores = [];
$catalogos = [
    'texto' => array_map(fn($t) => $t[3], Interfaz::TEXTOS),
    'icono' => array_map(fn($t) => $t[1], Interfaz::ICONOS),
];

foreach ($usos as $tipo => $lista) {
    $vistas = [];
    foreach ($lista as $u) {
        $vistas[$u['clave']] = true;
        if (!array_key_exists($u['clave'], $catalogos[$tipo])) {
            $errores[] = "{$u['donde']}: «{$u['clave']}» no está en el catálogo de Interfaz.php";
        } elseif ($catalogos[$tipo][$u['clave']] !== $u['defecto']) {
            $errores[] = "{$u['donde']}: «{$u['clave']}» dice " . json_encode($u['defecto'], JSON_UNESCAPED_UNICODE)
                . ' y el catálogo ' . json_encode($catalogos[$tipo][$u['clave']], JSON_UNESCAPED_UNICODE);
        }
    }
    foreach (array_keys($catalogos[$tipo]) as $clave) {
        if (!isset($vistas[$clave])) $errores[] = "Interfaz.php: «{$clave}» ($tipo) no se usa en ningún componente";
    }
}

if ($errores) {
    fwrite(STDERR, implode("\n", $errores) . "\n");
    fwrite(STDERR, count($errores) . " diferencia(s).\n");
    exit(1);
}
printf("Textos e iconos al día: %d usos de %d textos y %d iconos.\n",
    count($usos['texto']) + count($usos['icono']), count(Interfaz::TEXTOS), count(Interfaz::ICONOS));
