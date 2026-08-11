<?php
/**
 * tools/build-subregiones.php — añade la subregión a cada municipio del mapa.
 *
 * Municipio y región se eligen ahora de una lista cerrada, no se escriben a
 * mano: en la base convivían «Centro» y «Centro de Nariño» como si fueran
 * cosas distintas, y con eso ninguna estadística por zona vale nada.
 *
 * La fuente de los municipios es municipios.geojson (DANE 2018, 64 municipios
 * con su código DIVIPOLA). La de las subregiones es la agrupación oficial de la
 * Gobernación de Nariño en 13 subregiones. El script empareja las dos y AVISA
 * si algo no cuadra en cualquiera de los dos sentidos: si el emparejamiento no
 * es perfecto no escribe nada, porque un municipio en la subregión equivocada
 * es peor que no tener subregión.
 *
 *   php tools/build-subregiones.php             # sólo comprueba
 *   php tools/build-subregiones.php --escribir  # regenera js/narino-municipios.js
 */

declare(strict_types=1);

if (PHP_SAPI !== 'cli') { http_response_code(403); exit("Sólo CLI.\n"); }

const RAIZ = __DIR__ . '/..';

/**
 * Los 32 departamentos de Colombia más Bogotá D.C.
 *
 * No entran en el cruce con las subregiones —eso es sólo de Nariño—, pero se
 * publican con el resto del catálogo porque el perfil del visitante pregunta de
 * dónde viene y ahí también se escribían «Nariño», «nariño» y «N. de Santander»
 * como si fueran sitios distintos. Elegir el departamento es además lo que
 * decide si el municipio se elige de la lista de los 64 o se escribe.
 */
const DEPARTAMENTOS = [
    'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bogotá D.C.', 'Bolívar',
    'Boyacá', 'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó',
    'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira',
    'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío',
    'Risaralda', 'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima',
    'Valle del Cauca', 'Vaupés', 'Vichada',
];

/** Las 13 subregiones y sus municipios. */
const SUBREGIONES = [
    'Centro'             => ['Pasto', 'Chachagüí', 'La Florida', 'Nariño', 'Tangua', 'Yacuanquer'],
    'Guambuyaco'         => ['El Peñol', 'El Tambo', 'La Llanada', 'Los Andes'],
    'Juanambú'           => ['Arboleda', 'Buesaco', 'La Unión', 'San Lorenzo', 'San Pedro de Cartago'],
    'La Cordillera'      => ['Cumbitara', 'El Rosario', 'Leiva', 'Policarpa', 'Taminango'],
    'La Sabana'          => ['Guaitarilla', 'Imués', 'Ospina', 'Sapuyes', 'Túquerres'],
    'Los Abades'         => ['Providencia', 'Samaniego', 'Santacruz'],
    'Obando'             => ['Aldana', 'Contadero', 'Córdoba', 'Cuaspud', 'Cumbal', 'Funes',
                             'Guachucal', 'Gualmatán', 'Iles', 'Ipiales', 'Potosí', 'Puerres', 'Pupiales'],
    'Occidente'          => ['Ancuya', 'Consacá', 'Linares', 'Sandoná'],
    'Pacífico Sur'       => ['Francisco Pizarro', 'Tumaco'],
    'Piedemonte Costero' => ['Mallama', 'Ricaurte'],
    'Río Mayo'           => ['Albán', 'Belén', 'Colón', 'El Tablón de Gómez', 'La Cruz', 'San Bernardo', 'San Pablo'],
    'Sanquianga'         => ['El Charco', 'La Tola', 'Mosquera', 'Olaya Herrera', 'Santa Bárbara'],
    'Telembí'            => ['Barbacoas', 'Magüí Payán', 'Roberto Payán'],
];

/**
 * Municipios cuyo nombre en el DANE no coincide con el de uso corriente.
 * Se resuelven por código DIVIPOLA, que no admite discusión.
 */
const POR_DIVIPOLA = [
    '52224' => 'Obando',   // DANE «Cuaspud Carlosama» = Cuaspud
    '52427' => 'Telembí',  // DANE «Magüí» = Magüí Payán
];

/**
 * Nombres con los que la gente escribe un municipio, distintos del oficial.
 * Hacen falta para reconocer lo que ya está en la base y lo que llegue de
 * fuera; en el formulario ya no se puede escribir nada a mano.
 */
const SINONIMOS = [
    'San Juan de Pasto'          => 'Pasto',
    'Magüí Payán'                => 'Magüí',
    'Payán'                      => 'Magüí',
    'Cuaspud'                    => 'Cuaspud Carlosama',
    'Carlosama'                  => 'Cuaspud Carlosama',
    'Santa Bárbara de Iscuandé'  => 'Santa Bárbara',
    'Iscuandé'                   => 'Santa Bárbara',
    'Tumaco'                     => 'San Andrés de Tumaco',
    'Cartago'                    => 'San Pedro de Cartago',
];

function normalizar(string $s): string
{
    $s = mb_strtolower(trim($s), 'UTF-8');
    $s = strtr($s, ['á'=>'a','é'=>'e','í'=>'i','ó'=>'o','ú'=>'u','ü'=>'u','ñ'=>'n']);
    // El DANE escribe «San Andrés de Tumaco»; en la calle es Tumaco.
    $s = (string) preg_replace('/\bsan andres de\b/', '', $s);
    $s = (string) preg_replace('/\b(de|del|la|el|los|las)\b/', ' ', $s);
    return trim((string) preg_replace('/[^a-z0-9]+/', ' ', $s));
}

$archivo = RAIZ . '/js/narino-municipios.js';
$js = (string) file_get_contents($archivo);
$ini = strpos($js, '{');
$fin = strrpos($js, '}');
$mapa = json_decode(substr($js, (int) $ini, (int) $fin - (int) $ini + 1), true);
if (!is_array($mapa) || empty($mapa['municipios'])) {
    exit("No se pudo leer js/narino-municipios.js\n");
}

$indice = [];
foreach (SUBREGIONES as $sub => $munis) {
    foreach ($munis as $m) $indice[normalizar($m)] = $sub;
}

$sinAsignar = []; $usados = []; $asignados = 0;
foreach ($mapa['municipios'] as &$mu) {
    $divipola = (string) ($mu['divipola'] ?? '');
    $clave = normalizar((string) $mu['nombre']);
    $sub = POR_DIVIPOLA[$divipola] ?? ($indice[$clave] ?? null);
    if ($sub === null) {
        $sinAsignar[] = $mu['nombre'] . ' (' . $divipola . ')';
        continue;
    }
    $mu['subregion'] = $sub;
    $usados[$clave] = true;
    // Los emparejados por DIVIPOLA no casan por nombre: se marcan aparte para
    // que no aparezcan como «sobrantes» en la comprobación inversa.
    if (isset(POR_DIVIPOLA[$divipola])) {
        foreach ($indice as $k => $v) {
            if ($v === $sub && !isset($usados[$k]) && str_contains($k, explode(' ', $clave)[0])) $usados[$k] = true;
        }
    }
    $asignados++;
}
unset($mu);

$sobran = array_diff(array_keys($indice), array_keys($usados));

echo 'Municipios en el mapa: ' . count($mapa['municipios']) . "\n";
echo "Con subregión asignada: {$asignados}\n";
echo 'Subregiones: ' . count(SUBREGIONES) . "\n";
if ($sinAsignar) echo "\nSIN EMPAREJAR:\n  - " . implode("\n  - ", $sinAsignar) . "\n";
if ($sobran)     echo "\nEN LA LISTA PERO NO EN EL MAPA:\n  - " . implode("\n  - ", $sobran) . "\n";

if ($sinAsignar || $sobran) {
    exit("\nNo se escribe nada: el emparejamiento debe ser perfecto en los dos sentidos.\n");
}

if (($argv[1] ?? '') !== '--escribir') {
    exit("\nTodo cuadra. Ejecuta con --escribir para regenerar el fichero.\n");
}

// Ordenar los municipios por nombre: el desplegable se lee así, y el orden del
// geojson no significa nada.
usort($mapa['municipios'], fn($a, $b) => strcoll(
    normalizar((string) $a['nombre']), normalizar((string) $b['nombre'])
));

$salida = [
    'viewBox'       => $mapa['viewBox'],
    'bounds'        => $mapa['bounds'],
    'subregiones'   => array_keys(SUBREGIONES),
    'departamentos' => DEPARTAMENTOS,
    'municipios'    => $mapa['municipios'],
];

$cabecera = <<<TXT
// Mapa de Nariño para el navegador: los 64 municipios del DANE con su trazo
// SVG ya proyectado, su código DIVIPOLA y su SUBREGIÓN (de las 13 en que la
// Gobernación agrupa el departamento).
//
// `bounds` guarda los límites geográficos con los que se proyectaron los
// trazos, lo que permite convertir en los dos sentidos: un toque en el mapa da
// coordenadas, y unas coordenadas guardadas vuelven a poner el alfiler donde
// estaba. La proyección es equirectangular simple:
//   x = (lon - lonMin) / (lonMax - lonMin) * ancho
//   y = (latMax - lat) / (latMax - latMin) * alto
//
// Municipio y subregión se eligen de aquí y no se escriben a mano: en la base
// convivían «Centro» y «Centro de Nariño» como si fueran zonas distintas, y con
// eso ninguna estadística por zona vale nada.
//
// GENERADO por tools/build-subregiones.php desde municipios.geojson.
// No editar a mano.

TXT;

file_put_contents($archivo, $cabecera . 'window.NARINO_MAPA = '
    . json_encode($salida, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . ";\n");

echo "\nEscrito js/narino-municipios.js — 64 municipios con subregión.\n";


// ---------------------------------------------------------------------------
// El mismo catálogo, para el servidor.
//
// Sin esto la validación viviría sólo en el navegador, que es justo donde no
// vale: el municipio llega por la API y es ahí donde hay que comprobarlo. Se
// genera desde la misma fuente para que las dos copias no puedan discrepar.
// ---------------------------------------------------------------------------
$municipiosPhp = [];
foreach ($salida['municipios'] as $mu) {
    $municipiosPhp[(string) $mu['divipola']] = [
        'nombre'    => (string) $mu['nombre'],
        'subregion' => (string) $mu['subregion'],
    ];
}

// Se escribe el literal a mano en vez de usar var_export: su salida mezcla
// "array (" con corchetes al reindentar y produce PHP que no compila.
$exportarMunicipios = function (array $m): string {
    $lineas = [];
    foreach ($m as $divipola => $datos) {
        $lineas[] = sprintf(
            "        '%s' => ['nombre' => '%s', 'subregion' => '%s'],",
            $divipola,
            str_replace("'", "\\'", $datos['nombre']),
            str_replace("'", "\\'", $datos['subregion'])
        );
    }
    return "[\n" . implode("\n", $lineas) . "\n    ]";
};

$exportarMapa = function (array $m): string {
    $lineas = [];
    foreach ($m as $k => $v) {
        $lineas[] = sprintf("        '%s' => '%s',",
            str_replace("'", "\\'", (string) $k), str_replace("'", "\\'", (string) $v));
    }
    return "[\n" . implode("\n", $lineas) . "\n    ]";
};

$exportarLista = function (array $l): string {
    $lineas = array_map(fn($x) => "        '" . str_replace("'", "\\'", (string) $x) . "',", $l);
    return "[\n" . implode("\n", $lineas) . "\n    ]";
};

$php = "<?php\n"
    . "namespace LMT;\n"
    . "defined('LMT_GUARD') || exit('forbidden');\n\n"
    . "/**\n"
    . " * Municipios y subregiones de Nariño.\n"
    . " *\n"
    . " * GENERADO por tools/build-subregiones.php desde municipios.geojson (DANE) y\n"
    . " * la agrupación oficial de la Gobernación en 13 subregiones. No editar a mano:\n"
    . " * el mismo script escribe la copia que usa el navegador\n"
    . " * (js/narino-municipios.js), y las dos tienen que decir lo mismo.\n"
    . " *\n"
    . " * La región NO se acepta del cliente: se deduce del municipio. Es la única\n"
    . " * forma de que las dos no puedan contradecirse en la base.\n"
    . " */\n"
    . "final class Territorio\n{\n"
    . "    /** Código DIVIPOLA => nombre oficial y subregión. */\n"
    . "    public const MUNICIPIOS = " . $exportarMunicipios($municipiosPhp) . ";\n\n"
    . "    /** Las 13 subregiones, en el orden en que se presentan. */\n"
    . "    public const SUBREGIONES = " . $exportarLista(array_keys(SUBREGIONES)) . ";\n\n"
    . "    /** Cómo lo escribe la gente => nombre oficial. */\n"
    . "    public const SINONIMOS = " . $exportarMapa(SINONIMOS) . ";\n\n"
    . "    /** Los 32 departamentos de Colombia y Bogotá D.C. */\n"
    . "    public const DEPARTAMENTOS = " . $exportarLista(DEPARTAMENTOS) . ";\n\n"
    . <<<'CUERPO'
    /** Nombre canónico del municipio, o null si no es de Nariño. */
    public static function municipio($nombre): ?string
    {
        $f = self::buscar($nombre);
        return $f === null ? null : $f['nombre'];
    }

    /** Subregión a la que pertenece un municipio, o null si no lo reconoce. */
    public static function subregion($nombreMunicipio): ?string
    {
        $f = self::buscar($nombreMunicipio);
        return $f === null ? null : $f['subregion'];
    }

    /** @return array{nombre:string,subregion:string}|null */
    private static function buscar($nombre): ?array
    {
        $clave = self::normalizar((string) $nombre);
        if ($clave === '') return null;
        // Un sinónimo («San Juan de Pasto», «Tumaco») apunta al nombre oficial.
        foreach (self::SINONIMOS as $alias => $oficial) {
            if (self::normalizar($alias) === $clave) { $clave = self::normalizar($oficial); break; }
        }
        foreach (self::MUNICIPIOS as $m) {
            if (self::normalizar($m['nombre']) === $clave) return $m;
        }
        return null;
    }

    public static function esSubregion($nombre): bool
    {
        return in_array((string) $nombre, self::SUBREGIONES, true);
    }

    /**
     * Nombre canónico del departamento, o null si no es de Colombia.
     *
     * A diferencia del municipio del promotor, aquí null NO es un error: un
     * visitante puede venir de Ecuador y escribir su provincia. Quien llama
     * decide si lo rechaza o lo guarda tal cual.
     */
    public static function departamento($nombre): ?string
    {
        $clave = self::normalizar((string) $nombre);
        if ($clave === '') return null;
        foreach (self::DEPARTAMENTOS as $d) {
            if (self::normalizar($d) === $clave) return $d;
        }
        return null;
    }

    /** Compara nombres sin que estorben tildes, mayúsculas ni artículos. */
    public static function normalizar(string $s): string
    {
        $s = mb_strtolower(trim($s), 'UTF-8');
        $s = strtr($s, ['á'=>'a','é'=>'e','í'=>'i','ó'=>'o','ú'=>'u','ü'=>'u','ñ'=>'n']);
        $s = (string) preg_replace('/\bsan andres de\b/', '', $s);
        $s = (string) preg_replace('/\b(de|del|la|el|los|las)\b/', ' ', $s);
        return trim((string) preg_replace('/[^a-z0-9]+/', ' ', $s));
    }
}

CUERPO;

file_put_contents(RAIZ . '/api/lib/Territorio.php', $php);
echo "Escrito api/lib/Territorio.php — el mismo catálogo para el servidor.\n";
