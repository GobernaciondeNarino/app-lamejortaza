<?php
defined('LMT_GUARD') || exit('forbidden');
use LMT\Db;
use LMT\Response;

function register_routes_health(\LMT\Router $r): void
{
    // GET /api/health — comprobación de vida.
    //
    // SIN sesión sólo responde si la aplicación está en pie. La versión
    // anterior publicaba a cualquiera la versión exacta de PHP, el motor de
    // base de datos, SCRIPT_NAME y los conteos de stands y votos: un mapa para
    // elegir exploits y, de paso, la curva de participación del festival en
    // tiempo real. El detalle sigue estando, pero sólo para administradores.
    $r->get('/health', function () {
        $esAdmin = \LMT\Session::isAdmin();
        $vivo = false;
        try {
            Db::pdo()->query('SELECT 1');
            $vivo = true;
        } catch (\Throwable $e) {
            error_log('[lmt][health] ' . $e->getMessage());
        }

        if (!$esAdmin) {
            Response::ok(['ok' => $vivo, 'estado' => $vivo ? 'operativo' : 'degradado']);
        }

        $info = [
            'ok'           => $vivo,
            'php'          => PHP_VERSION,
            'argon2id'     => defined('PASSWORD_ARGON2ID'),
            'db_driver'    => null,
            'db_reachable' => $vivo,
            'stands'       => null,
            'votos'        => null,
            'promotores'   => null,
            'request_uri'  => $_SERVER['REQUEST_URI']  ?? null,
            'script_name'  => $_SERVER['SCRIPT_NAME']  ?? null,
            'https'        => \LMT\Security::esHttps(),
        ];
        try {
            $pdo = Db::pdo();
            $info['db_driver']  = $pdo->getAttribute(\PDO::ATTR_DRIVER_NAME);
            $info['stands']     = (int) $pdo->query('SELECT COUNT(*) FROM stands')->fetchColumn();
            $info['votos']      = (int) $pdo->query('SELECT COUNT(*) FROM votos')->fetchColumn();
            $info['promotores'] = (int) $pdo->query('SELECT COUNT(*) FROM promotores')->fetchColumn();
        } catch (\Throwable $e) {
            $info['db_error'] = 'unreachable';
        }
        Response::ok($info);
    });
}
