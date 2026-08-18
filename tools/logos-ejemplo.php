<?php
declare(strict_types=1);

/**
 * Genera los logos de ejemplo de los stands del prototipo.
 *
 *   php tools/logos-ejemplo.php     → escribe assets/logos/st-01.png … st-08.png
 *
 * Por qué existe: sin logo, la hoja de sello del pasaporte y las tarjetas de
 * «Mi recorrido» se ven a medias, y quien enseña el sistema antes del evento
 * —o lo prueba con la base de ejemplo— no llega a ver cómo queda de verdad. Los
 * caficultores suben el suyo al inscribirse; estos son sólo para los ocho
 * stands de `db/seed.sql`.
 *
 * Sin GD y sin Composer, igual que el generador de QR: en un hosting compartido
 * la extensión de imágenes es justo la que puede no estar. El PNG se arma a
 * mano (truecolor, filtro None, zlib con gzcompress) y el dibujo se hace
 * muestreando cada píxel 3×3, que es lo que le quita el borde de sierra.
 *
 * Los PNG resultantes SE VERSIONAN: el despliegue no ejecuta scripts.
 */

const LADO    = 256;   // píxeles del PNG final
const MUESTRA = 3;     // submuestreo por eje (3×3 = 9 muestras por píxel)

/** Papel de fondo, el mismo tono crema del resto de la interfaz. */
const PAPEL = [0xF6, 0xEE, 0xE1];

/**
 * Los ocho stands de ejemplo, con el color con el que ya se sellan en el
 * pasaporte y el emblema que les toca. El color va en RGB porque el de la base
 * está en oklch y traducirlo aquí sería arrastrar un conversor de espacios de
 * color para ocho valores fijos.
 */
const STANDS = [
    'st-01' => ['color' => [0x7A, 0x4A, 0x28], 'marca' => 'grano'],
    'st-02' => ['color' => [0x8E, 0x3F, 0x2E], 'marca' => 'volcan'],
    'st-03' => ['color' => [0x4B, 0x6B, 0x3A], 'marca' => 'hoja'],
    'st-04' => ['color' => [0x8A, 0x5C, 0x22], 'marca' => 'montanas'],
    'st-05' => ['color' => [0x2E, 0x6B, 0x7A], 'marca' => 'ola'],
    'st-06' => ['color' => [0x3F, 0x6B, 0x45], 'marca' => 'gota'],
    'st-07' => ['color' => [0x7E, 0x4B, 0x2A], 'marca' => 'taza'],
    'st-08' => ['color' => [0x9A, 0x3E, 0x3A], 'marca' => 'sol'],
];

$destino = dirname(__DIR__) . '/assets/logos';
if (!is_dir($destino) && !mkdir($destino, 0755, true) && !is_dir($destino)) {
    fwrite(STDERR, "No se pudo crear $destino\n");
    exit(1);
}

foreach (STANDS as $id => $cfg) {
    $png = dibujar($cfg['color'], $cfg['marca']);
    file_put_contents($destino . '/' . $id . '.png', $png);
    echo "  + assets/logos/$id.png (" . strlen($png) . " bytes)\n";
}
echo "Listo. " . count(STANDS) . " logos.\n";

// -------------------------------------------------------------------------
// Dibujo
// -------------------------------------------------------------------------

/**
 * Compone el logo: papel, aro exterior, emblema al centro.
 *
 * Cada píxel se resuelve muestreando MUESTRA² puntos y promediando. Es fuerza
 * bruta —589.824 muestras por logo— pero corre en menos de un segundo y evita
 * arrastrar un rasterizador para ocho imágenes.
 */
function dibujar(array $rgb, string $marca): string
{
    $filas = [];
    $paso = 1.0 / MUESTRA;
    for ($y = 0; $y < LADO; $y++) {
        $fila = "\x00";                       // filtro None
        for ($x = 0; $x < LADO; $x++) {
            $r = 0.0; $g = 0.0; $b = 0.0;
            for ($sy = 0; $sy < MUESTRA; $sy++) {
                for ($sx = 0; $sx < MUESTRA; $sx++) {
                    // Coordenadas normalizadas a [-1, 1] con el centro en 0.
                    $u = (($x + ($sx + 0.5) * $paso) / LADO) * 2 - 1;
                    $v = (($y + ($sy + 0.5) * $paso) / LADO) * 2 - 1;
                    $c = color($u, $v, $rgb, $marca);
                    $r += $c[0]; $g += $c[1]; $b += $c[2];
                }
            }
            $n = MUESTRA * MUESTRA;
            $fila .= chr((int) round($r / $n)) . chr((int) round($g / $n)) . chr((int) round($b / $n));
        }
        $filas[] = $fila;
    }
    return png(implode('', $filas));
}

/** Color de un punto del lienzo. El orden de las capas es el de arriba abajo. */
function color(float $u, float $v, array $rgb, string $marca): array
{
    $d = sqrt($u * $u + $v * $v);

    // Fuera del disco: transparente no existe en este PNG, así que papel.
    if ($d > 0.98) return PAPEL;

    $tinta = $rgb;
    $suave = mezclar($rgb, PAPEL, 0.82);      // el tono claro del interior

    // Aro exterior y filete interior, como el borde de una etiqueta de café.
    if ($d > 0.90) return $tinta;
    if ($d > 0.86) return PAPEL;
    if ($d > 0.83) return $tinta;
    if ($d > 0.80) return PAPEL;

    $fondo = $suave;
    return emblema($u, $v, $marca) ? $tinta : $fondo;
}

/** ¿El punto cae dentro del emblema? */
function emblema(float $u, float $v, string $marca): bool
{
    switch ($marca) {
        case 'grano':
            // Grano de café: elipse girada 30° con la hendidura al medio.
            [$a, $b] = girar($u, $v, M_PI / 6);
            $dentro = ($a * $a) / 0.20 + ($b * $b) / 0.34 <= 1;
            if (!$dentro) return false;
            // La hendidura es una curva, no una recta: recta parecía una
            // aceituna partida.
            return abs($a - 0.18 * $b * $b * 3) > 0.035;

        case 'volcan':
            // Cono con la cima recortada y una columna de humo.
            if ($v > -0.05 && $v < 0.42 && abs($u) <= 0.10 + ($v + 0.05) * 1.05) {
                return abs($u) > 0.0 || true;
            }
            if ($v >= 0.42 && $v < 0.50 && abs($u) < 0.60) return true;   // suelo
            return $v <= -0.12 && $v > -0.52 && abs($u - 0.13 * sin($v * 9)) < 0.045;

        case 'hoja':
            // Hoja: intersección de dos círculos, con la nervadura en blanco.
            $c1 = sqrt(($u + 0.34) ** 2 + $v * $v);
            $c2 = sqrt(($u - 0.34) ** 2 + $v * $v);
            if ($c1 > 0.62 || $c2 > 0.62) return false;
            if (abs($u) < 0.022) return false;                      // nervadura
            for ($k = -2; $k <= 2; $k++) {                          // nervios
                if (abs($v - $u * 1.5 - $k * 0.20) < 0.016) return false;
            }
            return true;

        case 'montanas':
            if ($v >= 0.40 && $v < 0.48 && abs($u) < 0.62) return true;
            $m1 = $v > -0.08 && $v < 0.40 && abs($u + 0.20) <= ($v + 0.08) * 0.85;
            $m2 = $v > -0.30 && $v < 0.40 && abs($u - 0.22) <= ($v + 0.30) * 0.62;
            return $m1 || $m2;

        case 'ola':
            // Tres olas: seno con grosor constante, recortadas por un círculo
            // para que no acaben en un corte vertical seco a media altura.
            if ($u * $u + $v * $v > 0.36) return false;
            for ($k = -1; $k <= 1; $k++) {
                $y = $k * 0.30 + 0.16 * sin($u * 7.2);
                if (abs($v - $y) < 0.055) return true;
            }
            return false;

        case 'gota':
            // Gota: círculo abajo, punta arriba.
            if (sqrt($u * $u + ($v - 0.16) ** 2) <= 0.40) return true;
            return $v < 0.16 && $v > -0.52 && abs($u) <= (($v + 0.52) / 0.68) * 0.40;

        case 'taza':
            // Taza vista de lado, con asa y vapor.
            $tazaX = abs($u) <= 0.34 - ($v > 0 ? $v * 0.22 : 0);
            if ($v > -0.06 && $v < 0.34 && $tazaX) return true;
            if ($v >= 0.34 && $v < 0.42 && abs($u) < 0.44) return true;      // platillo
            $asa = sqrt(($u - 0.40) ** 2 + ($v - 0.08) ** 2);
            if ($asa < 0.19 && $asa > 0.13 && $u > 0.30) return true;
            for ($k = -1; $k <= 1; $k++) {                                   // vapor
                if ($v <= -0.16 && $v > -0.52 && abs($u - $k * 0.17 - 0.05 * sin($v * 12)) < 0.035) return true;
            }
            return false;

        case 'sol':
        default:
            if (sqrt($u * $u + $v * $v) <= 0.26) return true;
            $ang = atan2($v, $u);
            $d = sqrt($u * $u + $v * $v);
            if ($d < 0.34 || $d > 0.58) return false;
            $sector = fmod($ang + M_PI * 4, M_PI / 6) / (M_PI / 6);
            return $sector < 0.45;
    }
}

/** Gira el punto (u,v) el ángulo dado. */
function girar(float $u, float $v, float $rad): array
{
    return [$u * cos($rad) - $v * sin($rad), $u * sin($rad) + $v * cos($rad)];
}

/** Mezcla dos colores: 0 = todo $a, 1 = todo $b. */
function mezclar(array $a, array $b, float $t): array
{
    return [
        (int) round($a[0] + ($b[0] - $a[0]) * $t),
        (int) round($a[1] + ($b[1] - $a[1]) * $t),
        (int) round($a[2] + ($b[2] - $a[2]) * $t),
    ];
}

// -------------------------------------------------------------------------
// PNG (truecolor, sin GD)
// -------------------------------------------------------------------------

function png(string $crudo): string
{
    $ihdr = pack('N', LADO) . pack('N', LADO)
          . chr(8)   // 8 bits por canal
          . chr(2)   // color type 2 = RGB
          . chr(0) . chr(0) . chr(0);
    return "\x89PNG\r\n\x1a\n"
         . trozo('IHDR', $ihdr)
         . trozo('IDAT', gzcompress($crudo, 9))
         . trozo('IEND', '');
}

function trozo(string $tipo, string $datos): string
{
    return pack('N', strlen($datos)) . $tipo . $datos . pack('N', crc32($tipo . $datos));
}
