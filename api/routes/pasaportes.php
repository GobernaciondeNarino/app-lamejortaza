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

        $correo = Validate::email(urldecode($p['correo'] ?? ''));
        if (!$correo) Response::error(400, 'bad_email');

        $stmt = Db::pdo()->prepare('SELECT correo, nombre, inicio, visitados FROM pasaportes WHERE correo = :c');
        $stmt->execute([':c' => $correo]);
        $row = $stmt->fetch();
        if (!$row) Response::error(404, 'not_found');

        $visitados = is_string($row['visitados'])
            ? (json_decode($row['visitados'], true) ?: [])
            : ($row['visitados'] ?: []);

        // Calificación propia por stand (para mostrar en el pasaporte qué
        // calificó y comentó el portador). Son datos del propio usuario.
        $vs = Db::pdo()->prepare('SELECT stand_id, emoji, compra, texto FROM votos WHERE correo = :c');
        $vs->execute([':c' => $correo]);
        $calificaciones = [];
        foreach ($vs->fetchAll() as $v) {
            $calificaciones[$v['stand_id']] = [
                'emoji'  => $v['emoji'],
                'compra' => $v['compra'] !== null ? (bool) $v['compra'] : null,
                'texto'  => $v['texto'] ?? '',
            ];
        }

        Response::ok([
            'correo'         => Validate::maskEmail($row['correo']),
            'nombre'         => $row['nombre'] ?? '',
            'inicio'         => $row['inicio'] ?? null,
            'visitados'      => array_values(array_filter($visitados, [Validate::class, 'standId'])),
            'calificaciones' => $calificaciones,
        ]);
    });
}
