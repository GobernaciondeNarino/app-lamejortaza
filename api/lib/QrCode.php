<?php
namespace LMT;
defined('LMT_GUARD') || exit('forbidden');

/**
 * Generador de códigos QR en PHP puro — sin Composer, sin GD, sin llamadas
 * externas. Pensado para un entorno de feria con conectividad irregular y
 * requisitos de privacidad (ningún dato sale a un servicio de terceros).
 *
 *  - Modo byte (UTF-8), nivel de corrección de errores M (~15%).
 *  - Versiones 1–10 (hasta 213 bytes; de sobra para una URL de stand).
 *  - Salida: PNG monocromo generado con zlib nativo (gzcompress).
 *
 * Referencia: ISO/IEC 18004. Implementación validada por round-trip
 * (generar → decodificar) en la suite de tests.
 */
final class QrCode
{
    /** Nivel M: [ec_codewords_por_bloque, [[num_bloques, data_codewords_por_bloque], ...]] */
    private const EC_M = [
        1  => [10, [[1, 16]]],
        2  => [16, [[1, 28]]],
        3  => [26, [[1, 44]]],
        4  => [18, [[2, 32]]],
        5  => [24, [[2, 43]]],
        6  => [16, [[4, 27]]],
        7  => [18, [[4, 31]]],
        8  => [22, [[2, 38], [2, 39]]],
        9  => [22, [[3, 36], [2, 37]]],
        10 => [26, [[4, 43], [1, 44]]],
    ];

    /** Capacidad en bytes (modo byte, nivel M) por versión. */
    private const CAP_M = [1 => 14, 2 => 26, 3 => 42, 4 => 62, 5 => 84, 6 => 106, 7 => 122, 8 => 152, 9 => 180, 10 => 213];

    /** Centros de patrones de alineación por versión. */
    private const ALIGN = [
        1 => [], 2 => [6, 18], 3 => [6, 22], 4 => [6, 26], 5 => [6, 30],
        6 => [6, 34], 7 => [6, 22, 38], 8 => [6, 24, 42], 9 => [6, 26, 46], 10 => [6, 28, 50],
    ];

    /** Bits de relleno (remainder) por versión. */
    private const REMAINDER = [1 => 0, 2 => 7, 3 => 7, 4 => 7, 5 => 7, 6 => 7, 7 => 0, 8 => 0, 9 => 0, 10 => 0];

    /** @var int[] Tabla exp de GF(256). */
    private static array $expT = [];
    /** @var int[] Tabla log de GF(256). */
    private static array $logT = [];

    /**
     * Devuelve el PNG (bytes) del código QR que codifica $text.
     *
     * @param int $scale  píxeles por módulo.
     * @param int $margin  módulos de zona tranquila (quiet zone).
     */
    public static function png(string $text, int $scale = 8, int $margin = 4): string
    {
        [$matrix, $size] = self::build($text);
        return self::renderPng($matrix, $size, max(1, $scale), max(0, $margin));
    }

    /** Construye la matriz de módulos (true = oscuro). @return array{0: array<int,array<int,bool>>, 1: int} */
    public static function build(string $text): array
    {
        self::initGf();

        $version = self::pickVersion($text);
        $size = 17 + 4 * $version;

        $dataCodewords = self::encodeData($text, $version);
        $finalCodewords = self::interleave($dataCodewords, $version);

        // Bitstream final (con bits de relleno).
        $bits = '';
        foreach ($finalCodewords as $cw) {
            $bits .= str_pad(decbin($cw), 8, '0', STR_PAD_LEFT);
        }
        $bits .= str_repeat('0', self::REMAINDER[$version]);

        // Elegir la máscara con menor penalización.
        $best = null;
        $bestPenalty = PHP_INT_MAX;
        $bestMask = 0;
        for ($mask = 0; $mask < 8; $mask++) {
            $m = self::placeAll($size, $version, $bits, $mask);
            $p = self::penalty($m, $size);
            if ($p < $bestPenalty) {
                $bestPenalty = $p;
                $best = $m;
                $bestMask = $mask;
            }
        }
        // Volver a colocar la info de formato para la máscara ganadora ya está
        // incluida en placeAll; $best ya es la matriz final.
        return [$best, $size];
    }

    // ---- Selección de versión ------------------------------------------------

    private static function pickVersion(string $text): int
    {
        $len = strlen($text);
        foreach (self::CAP_M as $v => $cap) {
            if ($len <= $cap) return $v;
        }
        throw new \RuntimeException('texto demasiado largo para QR versión <= 10');
    }

    // ---- Codificación de datos ----------------------------------------------

    /** @return int[] codewords de datos (sin ECC), rellenados a la capacidad. */
    private static function encodeData(string $text, int $version): array
    {
        [$ecPerBlock, $blocks] = self::EC_M[$version];
        $totalData = 0;
        foreach ($blocks as [$n, $d]) $totalData += $n * $d;

        $ccBits = $version <= 9 ? 8 : 16;

        $bits = '0100'; // modo byte
        $bits .= str_pad(decbin(strlen($text)), $ccBits, '0', STR_PAD_LEFT);
        for ($i = 0, $L = strlen($text); $i < $L; $i++) {
            $bits .= str_pad(decbin(ord($text[$i])), 8, '0', STR_PAD_LEFT);
        }

        $capacityBits = $totalData * 8;
        // Terminador (hasta 4 ceros).
        $bits .= str_repeat('0', min(4, $capacityBits - strlen($bits)));
        // Alinear a byte.
        if (strlen($bits) % 8 !== 0) {
            $bits .= str_repeat('0', 8 - (strlen($bits) % 8));
        }
        // Bytes de relleno alternos.
        $pad = ['11101100', '00010001'];
        $i = 0;
        while (strlen($bits) < $capacityBits) {
            $bits .= $pad[$i % 2];
            $i++;
        }

        $codewords = [];
        for ($i = 0; $i < $capacityBits; $i += 8) {
            $codewords[] = bindec(substr($bits, $i, 8));
        }
        return $codewords;
    }

    /** Intercala data + ECC por bloques según la estructura de la versión. */
    private static function interleave(array $dataCodewords, int $version): array
    {
        [$ecPerBlock, $blocks] = self::EC_M[$version];

        $dataBlocks = [];
        $ecBlocks = [];
        $pos = 0;
        foreach ($blocks as [$n, $d]) {
            for ($b = 0; $b < $n; $b++) {
                $block = array_slice($dataCodewords, $pos, $d);
                $pos += $d;
                $dataBlocks[] = $block;
                $ecBlocks[] = self::rsEncode($block, $ecPerBlock);
            }
        }

        $result = [];
        // Data codewords intercalados por columnas.
        $maxData = max(array_map('count', $dataBlocks));
        for ($i = 0; $i < $maxData; $i++) {
            foreach ($dataBlocks as $block) {
                if (isset($block[$i])) $result[] = $block[$i];
            }
        }
        // ECC codewords intercalados por columnas.
        for ($i = 0; $i < $ecPerBlock; $i++) {
            foreach ($ecBlocks as $block) {
                if (isset($block[$i])) $result[] = $block[$i];
            }
        }
        return $result;
    }

    // ---- Reed-Solomon en GF(256) --------------------------------------------

    private static function initGf(): void
    {
        if (self::$expT) return;
        $exp = array_fill(0, 512, 0);
        $log = array_fill(0, 256, 0);
        $x = 1;
        for ($i = 0; $i < 255; $i++) {
            $exp[$i] = $x;
            $log[$x] = $i;
            $x <<= 1;
            if ($x & 0x100) $x ^= 0x11d; // polinomio primitivo
        }
        for ($i = 255; $i < 512; $i++) $exp[$i] = $exp[$i - 255];
        self::$expT = $exp;
        self::$logT = $log;
    }

    private static function gfMul(int $a, int $b): int
    {
        if ($a === 0 || $b === 0) return 0;
        return self::$expT[self::$logT[$a] + self::$logT[$b]];
    }

    /** Polinomio generador para $degree codewords de ECC. */
    private static function rsGenerator(int $degree): array
    {
        $g = [1];
        for ($i = 0; $i < $degree; $i++) {
            $next = array_fill(0, count($g) + 1, 0);
            foreach ($g as $j => $coef) {
                $next[$j] ^= $coef;
                $next[$j + 1] ^= self::gfMul($coef, self::$expT[$i]);
            }
            $g = $next;
        }
        return $g;
    }

    /** @param int[] $data @return int[] codewords de ECC. */
    private static function rsEncode(array $data, int $ecCount): array
    {
        $gen = self::rsGenerator($ecCount);
        $res = array_merge($data, array_fill(0, $ecCount, 0));
        for ($i = 0, $n = count($data); $i < $n; $i++) {
            $coef = $res[$i];
            if ($coef === 0) continue;
            for ($j = 0, $g = count($gen); $j < $g; $j++) {
                $res[$i + $j] ^= self::gfMul($gen[$j], $coef);
            }
        }
        return array_slice($res, count($data), $ecCount);
    }

    // ---- Colocación en la matriz --------------------------------------------

    /** Construye la matriz completa para una máscara dada (incluye formato). */
    private static function placeAll(int $size, int $version, string $bits, int $mask): array
    {
        $m = array_fill(0, $size, array_fill(0, $size, null));   // null = libre
        $reserved = array_fill(0, $size, array_fill(0, $size, false));

        self::placeFinder($m, $reserved, 0, 0, $size);
        self::placeFinder($m, $reserved, $size - 7, 0, $size);
        self::placeFinder($m, $reserved, 0, $size - 7, $size);
        self::placeAlignment($m, $reserved, $version);
        self::placeTiming($m, $reserved, $size);

        // Módulo oscuro fijo.
        $m[$size - 8][8] = true;
        $reserved[$size - 8][8] = true;

        self::reserveFormat($reserved, $size);
        if ($version >= 7) self::reserveVersion($reserved, $size);

        self::placeData($m, $reserved, $size, $bits, $mask);

        self::placeFormat($m, $size, $mask);
        if ($version >= 7) self::placeVersion($m, $size, $version);

        // Convertir cualquier null residual a false (no debería quedar).
        for ($r = 0; $r < $size; $r++) {
            for ($c = 0; $c < $size; $c++) {
                if ($m[$r][$c] === null) $m[$r][$c] = false;
            }
        }
        return $m;
    }

    private static function placeFinder(array &$m, array &$res, int $row, int $col, int $size): void
    {
        for ($r = -1; $r <= 7; $r++) {
            for ($c = -1; $c <= 7; $c++) {
                $rr = $row + $r;
                $cc = $col + $c;
                if ($rr < 0 || $rr >= $size || $cc < 0 || $cc >= $size) continue;
                $dark = ($r >= 0 && $r <= 6 && ($c === 0 || $c === 6))
                    || ($c >= 0 && $c <= 6 && ($r === 0 || $r === 6))
                    || ($r >= 2 && $r <= 4 && $c >= 2 && $c <= 4);
                $m[$rr][$cc] = $dark;
                $res[$rr][$cc] = true;
            }
        }
    }

    private static function placeAlignment(array &$m, array &$res, int $version): void
    {
        $centers = self::ALIGN[$version];
        foreach ($centers as $r) {
            foreach ($centers as $c) {
                if ($res[$r][$c]) continue; // solapa con finder
                for ($dr = -2; $dr <= 2; $dr++) {
                    for ($dc = -2; $dc <= 2; $dc++) {
                        $dark = max(abs($dr), abs($dc)) !== 1;
                        $m[$r + $dr][$c + $dc] = $dark;
                        $res[$r + $dr][$c + $dc] = true;
                    }
                }
            }
        }
    }

    private static function placeTiming(array &$m, array &$res, int $size): void
    {
        for ($i = 8; $i < $size - 8; $i++) {
            $val = ($i % 2 === 0);
            if (!$res[6][$i]) { $m[6][$i] = $val; $res[6][$i] = true; }
            if (!$res[$i][6]) { $m[$i][6] = $val; $res[$i][6] = true; }
        }
    }

    private static function reserveFormat(array &$res, int $size): void
    {
        for ($i = 0; $i <= 8; $i++) {
            $res[8][$i] = true;
            $res[$i][8] = true;
        }
        for ($i = 0; $i < 8; $i++) {
            $res[8][$size - 1 - $i] = true;
            $res[$size - 1 - $i][8] = true;
        }
    }

    private static function reserveVersion(array &$res, int $size): void
    {
        for ($r = 0; $r < 6; $r++) {
            for ($c = $size - 11; $c < $size - 8; $c++) {
                $res[$r][$c] = true;
                $res[$c][$r] = true;
            }
        }
    }

    private static function placeData(array &$m, array $res, int $size, string $bits, int $mask): void
    {
        $len = strlen($bits);
        $idx = 0;
        $col = $size - 1;
        $up = true;
        while ($col > 0) {
            if ($col === 6) $col--; // saltar columna de timing
            for ($i = 0; $i < $size; $i++) {
                $row = $up ? ($size - 1 - $i) : $i;
                for ($k = 0; $k < 2; $k++) {
                    $c = $col - $k;
                    if ($res[$row][$c]) continue;
                    $bit = $idx < $len ? ($bits[$idx] === '1') : false;
                    $idx++;
                    if (self::maskBit($mask, $row, $c)) $bit = !$bit;
                    $m[$row][$c] = $bit;
                }
            }
            $col -= 2;
            $up = !$up;
        }
    }

    private static function maskBit(int $mask, int $r, int $c): bool
    {
        switch ($mask) {
            case 0: return ($r + $c) % 2 === 0;
            case 1: return $r % 2 === 0;
            case 2: return $c % 3 === 0;
            case 3: return ($r + $c) % 3 === 0;
            case 4: return (intdiv($r, 2) + intdiv($c, 3)) % 2 === 0;
            case 5: return (($r * $c) % 2) + (($r * $c) % 3) === 0;
            case 6: return ((($r * $c) % 2) + (($r * $c) % 3)) % 2 === 0;
            case 7: return ((($r + $c) % 2) + (($r * $c) % 3)) % 2 === 0;
        }
        return false;
    }

    // ---- Información de formato y versión (BCH) ------------------------------

    private static function placeFormat(array &$m, int $size, int $mask): void
    {
        // Nivel M = 0b00. Datos de formato de 5 bits: (ec<<3)|mask.
        $ec = 0b00;
        $data = ($ec << 3) | $mask;
        $bch = $data;
        $g = 0b10100110111;
        $tmp = $data << 10;
        for ($i = 14; $i >= 10; $i--) {
            if (($tmp >> $i) & 1) $tmp ^= $g << ($i - 10);
        }
        $format = (($data << 10) | ($tmp & 0x3FF)) ^ 0b101010000010010;

        $bitsArr = [];
        for ($i = 14; $i >= 0; $i--) $bitsArr[] = ($format >> $i) & 1;

        // Copia 1 (alrededor del finder superior-izquierdo).
        $coords1 = [
            [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
            [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
        ];
        // Copia 2 (repartida en los otros dos finders).
        $coords2 = [
            [$size - 1, 8], [$size - 2, 8], [$size - 3, 8], [$size - 4, 8],
            [$size - 5, 8], [$size - 6, 8], [$size - 7, 8],
            [8, $size - 8], [8, $size - 7], [8, $size - 6], [8, $size - 5],
            [8, $size - 4], [8, $size - 3], [8, $size - 2], [8, $size - 1],
        ];
        foreach ($coords1 as $i => [$r, $c]) $m[$r][$c] = (bool) $bitsArr[$i];
        foreach ($coords2 as $i => [$r, $c]) $m[$r][$c] = (bool) $bitsArr[$i];
    }

    private static function placeVersion(array &$m, int $size, int $version): void
    {
        $g = 0b1111100100101;
        $tmp = $version << 12;
        for ($i = 17; $i >= 12; $i--) {
            if (($tmp >> $i) & 1) $tmp ^= $g << ($i - 12);
        }
        $bch = ($version << 12) | ($tmp & 0xFFF);
        $bitsArr = [];
        for ($i = 17; $i >= 0; $i--) $bitsArr[] = ($bch >> $i) & 1;

        $idx = 0;
        for ($c = 0; $c < 6; $c++) {
            for ($r = $size - 11; $r < $size - 8; $r++) {
                $bit = (bool) $bitsArr[17 - $idx];
                $m[$r][$c] = $bit;
                $m[$c][$r] = $bit;
                $idx++;
            }
        }
    }

    // ---- Penalización de máscaras -------------------------------------------

    private static function penalty(array $m, int $size): int
    {
        $penalty = 0;

        // Regla 1: corridas de 5+ del mismo color (filas y columnas).
        for ($r = 0; $r < $size; $r++) {
            $run = 1;
            for ($c = 1; $c < $size; $c++) {
                if ($m[$r][$c] === $m[$r][$c - 1]) {
                    $run++;
                } else {
                    if ($run >= 5) $penalty += 3 + ($run - 5);
                    $run = 1;
                }
            }
            if ($run >= 5) $penalty += 3 + ($run - 5);
        }
        for ($c = 0; $c < $size; $c++) {
            $run = 1;
            for ($r = 1; $r < $size; $r++) {
                if ($m[$r][$c] === $m[$r - 1][$c]) {
                    $run++;
                } else {
                    if ($run >= 5) $penalty += 3 + ($run - 5);
                    $run = 1;
                }
            }
            if ($run >= 5) $penalty += 3 + ($run - 5);
        }

        // Regla 2: bloques 2x2 del mismo color.
        for ($r = 0; $r < $size - 1; $r++) {
            for ($c = 0; $c < $size - 1; $c++) {
                $v = $m[$r][$c];
                if ($v === $m[$r][$c + 1] && $v === $m[$r + 1][$c] && $v === $m[$r + 1][$c + 1]) {
                    $penalty += 3;
                }
            }
        }

        // Regla 3: patrón 1:1:3:1:1 (finder-like) en filas y columnas.
        $pat1 = [true, false, true, true, true, false, true, false, false, false, false];
        $pat2 = [false, false, false, false, true, false, true, true, true, false, true];
        for ($r = 0; $r < $size; $r++) {
            for ($c = 0; $c < $size - 10; $c++) {
                $ok1 = true; $ok2 = true;
                for ($k = 0; $k < 11; $k++) {
                    if ($m[$r][$c + $k] !== $pat1[$k]) $ok1 = false;
                    if ($m[$r][$c + $k] !== $pat2[$k]) $ok2 = false;
                }
                if ($ok1 || $ok2) $penalty += 40;
            }
        }
        for ($c = 0; $c < $size; $c++) {
            for ($r = 0; $r < $size - 10; $r++) {
                $ok1 = true; $ok2 = true;
                for ($k = 0; $k < 11; $k++) {
                    if ($m[$r + $k][$c] !== $pat1[$k]) $ok1 = false;
                    if ($m[$r + $k][$c] !== $pat2[$k]) $ok2 = false;
                }
                if ($ok1 || $ok2) $penalty += 40;
            }
        }

        // Regla 4: proporción de módulos oscuros.
        $dark = 0;
        for ($r = 0; $r < $size; $r++) {
            for ($c = 0; $c < $size; $c++) {
                if ($m[$r][$c]) $dark++;
            }
        }
        $total = $size * $size;
        $ratio = ($dark * 100) / $total;
        $prev = (int) (floor($ratio / 5) * 5);
        $next = $prev + 5;
        $penalty += min(abs($prev - 50), abs($next - 50)) / 5 * 10;

        return (int) $penalty;
    }

    // ---- Render PNG (sin GD) -------------------------------------------------

    private static function renderPng(array $m, int $size, int $scale, int $margin): string
    {
        $dim = ($size + 2 * $margin) * $scale;

        // Construir filas de píxeles (1 bit por píxel, 0 = negro, 1 = blanco).
        // Usamos escala de grises de 1 bit con filtro None por fila.
        $bytesPerRow = (int) ceil($dim / 8);
        $raw = '';
        for ($y = 0; $y < $dim; $y++) {
            $my = intdiv($y, $scale) - $margin;
            $row = "\x00"; // filtro None
            $acc = 0; $bitcount = 0; $line = '';
            for ($x = 0; $x < $dim; $x++) {
                $mx = intdiv($x, $scale) - $margin;
                $dark = ($my >= 0 && $my < $size && $mx >= 0 && $mx < $size) ? $m[$my][$mx] : false;
                $bit = $dark ? 0 : 1; // 0 negro, 1 blanco
                $acc = ($acc << 1) | $bit;
                $bitcount++;
                if ($bitcount === 8) { $line .= chr($acc); $acc = 0; $bitcount = 0; }
            }
            if ($bitcount > 0) { $acc <<= (8 - $bitcount); $line .= chr($acc); }
            $raw .= $row . $line;
        }

        $ihdr = pack('N', $dim) . pack('N', $dim) . chr(1) . chr(0) . chr(0) . chr(0) . chr(0);
        $png = "\x89PNG\r\n\x1a\n";
        $png .= self::pngChunk('IHDR', $ihdr);
        $png .= self::pngChunk('IDAT', gzcompress($raw, 9));
        $png .= self::pngChunk('IEND', '');
        return $png;
    }

    private static function pngChunk(string $type, string $data): string
    {
        return pack('N', strlen($data)) . $type . $data
            . pack('N', crc32($type . $data));
    }
}
