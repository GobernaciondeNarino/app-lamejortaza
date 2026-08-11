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
                'inicio'    => null,
                'visitados' => [],
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
            'inicio'    => $row['inicio'] ?? null,
            'visitados' => array_values(array_filter($visitados, [Validate::class, 'standId'])),
        ]);
    });
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
