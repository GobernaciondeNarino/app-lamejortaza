<?php
defined('LMT_GUARD') || exit('forbidden');
use LMT\Db;
use LMT\Response;
use LMT\Validate;
use LMT\RateLimit;

function register_routes_pasaportes(\LMT\Router $r): void
{
    $r->get('/pasaportes/:correo', function (array $p) {
        // El endpoint es público (auto-servicio: cada asistente consulta su
        // propio pasaporte por correo). Sin rate limit, un atacante podría
        // enumerar correos para saber quién participó y qué stands visitó
        // (datos personales — Ley 1581/2012). Limitamos por IP para blindar
        // el sondeo automatizado sin romper el uso legítimo.
        if (!RateLimit::hit('pasaporte', RateLimit::ipHash())) {
            Response::error(429, 'rate_limited');
        }

        // urldecode() aquí decodificaba POR SEGUNDA VEZ lo que el servidor ya
        // había decodificado al poblar la ruta: "%2540" acababa siendo "@".
        // Eso rompe la garantía de que un parámetro de ruta no contiene "/".
        $correo = Validate::email($p['correo'] ?? '');
        if (!$correo) Response::error(400, 'bad_email');

        // Limitar también por correo consultado, no sólo por IP: un ataque
        // dirigido contra una persona concreta es UNA petición desde cada IP.
        if (!RateLimit::hit('pasaporte_correo', hash('sha256', $correo))) {
            Response::error(429, 'rate_limited');
        }

        $stmt = Db::pdo()->prepare('SELECT correo, nombre, inicio, visitados FROM pasaportes WHERE correo = :c');
        $stmt->execute([':c' => $correo]);
        $row = $stmt->fetch();

        // Sin oráculo: un correo desconocido devuelve un pasaporte VACÍO, no un
        // 404. Distinguir ambos casos convertía este endpoint público en un
        // comprobador de "¿participó esta persona en el festival?" — dato
        // personal que no tenemos por qué confirmar a un desconocido. El
        // frontend ya muestra "aún no tienes pasaporte" cuando no hay sellos.
        if (!$row) {
            Response::ok([
                'correo'    => Validate::maskEmail($correo),
                'nombre'    => '',
                'numero'    => pasaporte_numero($correo),
                'numero_qr' => pasaporte_numero_qr($correo),
                'inicio'    => null,
                'visitados' => [],
                'valoraciones' => [],
            ]);
        }

        $visitados = is_string($row['visitados'])
            ? (json_decode($row['visitados'], true) ?: [])
            : ($row['visitados'] ?: []);

        Response::ok([
            'correo'    => Validate::maskEmail($row['correo']),
            // El nombre en claro identifica a la persona; se enmascara igual
            // que el correo salvo su inicial, suficiente para que se reconozca.
            'nombre'    => Validate::iniciales((string) ($row['nombre'] ?? '')),
            'numero'    => pasaporte_numero((string) $row['correo']),
            // El número, ya dibujado como QR para la hoja de datos. Lo dibuja
            // el servidor porque el generador vive aquí, y codifica el número
            // —no el correo—: esa hoja se enseña y se fotografía.
            'numero_qr' => pasaporte_numero_qr((string) $row['correo']),
            'inicio'    => $row['inicio'] ?? null,
            'visitados' => array_values(array_filter($visitados, [Validate::class, 'standId'])),
            // Cuándo se selló cada stand, y cuándo fue la última visita. Mismo
            // testigo que las calificaciones: la lista de stands visitados ya
            // es pública en este endpoint, pero la HORA de cada visita dice
            // dónde estuvo alguien y cuándo, y eso no lo damos a un desconocido.
            'sellado_en'    => pasaporte_sellos($correo, is_string($_GET['t'] ?? null) ? $_GET['t'] : ''),
            'ultima_visita' => pasaporte_ultima_visita($correo, is_string($_GET['t'] ?? null) ? $_GET['t'] : ''),
            // Qué puntuó en cada stand. Va SÓLO con el testigo del perfil: este
            // endpoint es público, y saber que alguien calificó un stand como
            // «malo» no es lo mismo que saber que lo visitó. Sin testigo, la
            // hoja del recorrido enseña los stands sin la calificación.
            'valoraciones' => pasaporte_valoraciones($correo, is_string($_GET['t'] ?? null) ? $_GET['t'] : ''),
            // Las tres estrellas que puso en cada stand, para «Mi recorrido».
            // Mismo testigo y mismo motivo que las valoraciones.
            'estrellas_mias' => pasaporte_estrellas($correo, is_string($_GET['t'] ?? null) ? $_GET['t'] : ''),
        ]);
    });
}

/**
 * Lo que puntuó en cada stand, indexado por stand.
 *
 * @return array<string, array{innovacion:?int,atencion:?int,calidad:?int}>
 */
function pasaporte_estrellas(string $correo, string $token): array
{
    if (!\visitante_token_valido($correo, $token)) return [];

    $q = Db::pdo()->prepare(
        'SELECT stand_id, est_innovacion, est_atencion, est_calidad
         FROM votos WHERE correo = :c'
    );
    $q->execute([':c' => $correo]);
    $out = [];
    foreach ($q->fetchAll(\PDO::FETCH_ASSOC) as $v) {
        // Un stand donde no tocó ninguna estrella no entra: si entrara, la
        // tarjeta enseñaría cero en vez de la media del festival.
        if ($v['est_innovacion'] === null && $v['est_atencion'] === null && $v['est_calidad'] === null) continue;
        $out[(string) $v['stand_id']] = [
            'innovacion' => $v['est_innovacion'] !== null ? (int) $v['est_innovacion'] : null,
            'atencion'   => $v['est_atencion']   !== null ? (int) $v['est_atencion']   : null,
            'calidad'    => $v['est_calidad']    !== null ? (int) $v['est_calidad']    : null,
        ];
    }
    return $out;
}

/**
 * Cuándo se selló cada stand, indexado por stand.
 *
 * Es la fecha que va en el sello del pasaporte. Antes la hoja llevaba una fecha
 * escrita a mano en el código, igual para todos los sellos y para todo el
 * mundo: bonita en la maqueta y falsa en cuanto alguien miraba dos hojas.
 *
 * @return array<string, string>  'Y-m-d H:i:s'; vacío si el testigo no vale
 */
function pasaporte_sellos(string $correo, string $token): array
{
    if (!\visitante_token_valido($correo, $token)) return [];

    $q = Db::pdo()->prepare('SELECT stand_id, created_at FROM votos WHERE correo = :c');
    $q->execute([':c' => $correo]);
    $out = [];
    foreach ($q->fetchAll(\PDO::FETCH_ASSOC) as $v) {
        if (empty($v['created_at'])) continue;
        $out[(string) $v['stand_id']] = (string) $v['created_at'];
    }
    return $out;
}

/** El sello más reciente. Va en la hoja de datos, como «última visita». */
function pasaporte_ultima_visita(string $correo, string $token): ?string
{
    if (!\visitante_token_valido($correo, $token)) return null;

    $q = Db::pdo()->prepare('SELECT MAX(created_at) FROM votos WHERE correo = :c');
    $q->execute([':c' => $correo]);
    $v = $q->fetchColumn();
    return $v ? (string) $v : null;
}

/**
 * El número de pasaporte dibujado como QR, en data URI.
 *
 * Codifica el NÚMERO, no el correo ni una URL con el correo dentro: la hoja de
 * datos se enseña y se fotografía, y un QR es justo lo que alguien escanea sin
 * pensar. El número ya está impreso encima en letras grandes, así que el código
 * no añade nada que no estuviera a la vista.
 */
function pasaporte_numero_qr(string $correo): ?string
{
    try {
        return 'data:image/png;base64,' . base64_encode(
            \LMT\QrCode::png(pasaporte_numero($correo), 4, 2)
        );
    } catch (\Throwable $e) {
        error_log('[lmt][pasaporte][qr] ' . $e->getMessage());
        return null;
    }
}

/**
 * Emoji que el visitante puso a cada stand, indexado por stand.
 *
 * @return array<string, string>  vacío si el testigo no vale
 */
function pasaporte_valoraciones(string $correo, string $token): array
{
    if (!\visitante_token_valido($correo, $token)) return [];

    $q = Db::pdo()->prepare('SELECT stand_id, emoji FROM votos WHERE correo = :c');
    $q->execute([':c' => $correo]);
    $out = [];
    foreach ($q->fetchAll(\PDO::FETCH_ASSOC) as $v) {
        $out[(string) $v['stand_id']] = (string) $v['emoji'];
    }
    return $out;
}

/**
 * Número de pasaporte: un código estable y legible para la página de datos.
 *
 * Sale de un hash del correo, así que la misma persona ve siempre el mismo
 * número y de él no se puede volver al correo. No identifica a nadie por sí
 * solo —es decoración con la forma de un documento real—, pero tiene que ser
 * estable o el pasaporte parecería otro cada vez que se abre.
 */
function pasaporte_numero(string $correo): string
{
    $h = strtoupper(substr(hash('sha256', 'pasaporte|' . strtolower($correo)), 0, 8));
    // Sin caracteres que se confundan al leerlos en voz alta o en una foto.
    $h = strtr($h, ['0' => 'H', 'O' => 'K', '1' => 'J', 'I' => 'L']);
    return 'NAR-' . substr($h, 0, 4) . '-' . substr($h, 4, 4);
}
