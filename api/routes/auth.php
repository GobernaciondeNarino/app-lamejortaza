<?php
defined('LMT_GUARD') || exit('forbidden');
use LMT\Db;
use LMT\Response;
use LMT\Validate;
use LMT\Security;
use LMT\Session;
use LMT\RateLimit;

function register_routes_auth(\LMT\Router $r): void
{
    // Datos de la sesión actual + token CSRF (lo necesita el frontend antes de
    // hacer POST). Una sesión es de administrador O de promotor, nunca de los
    // dos: `promotor` viene con null cuando quien está dentro es un admin.
    $r->get('/auth/me', function () {
        // Revalida contra la base (con caché de un minuto) para que el rol y la
        // bandera de contraseña temporal que reciba el frontend sean los de
        // ahora y no los del momento del login.
        Session::isAdmin();
        Response::ok([
            'user'     => Session::user(),
            'promotor' => Session::promotor(),
            'csrf'     => Session::csrfToken(),
        ]);
    });

    $r->post('/auth/login', function () {
        if (!RateLimit::hit('login', RateLimit::ipHash())) {
            Response::error(429, 'rate_limited');
        }

        $body  = Security::jsonBody();
        $email = Validate::email($body['email'] ?? null);
        $pwd   = $body['password'] ?? '';
        if (!$email || !is_string($pwd) || strlen($pwd) < 8 || strlen($pwd) > 128) {
            // Tiempo constante artificial para no filtrar existencia.
            usleep(random_int(150000, 350000));
            Response::error(401, 'invalid_credentials');
        }

        $pdo = Db::pdo();
        try {
            $stmt = $pdo->prepare(
                'SELECT id, email, password_hash, is_admin, rol, must_change_password
                 FROM admins WHERE email = :e LIMIT 1'
            );
            $stmt->execute([':e' => $email]);
        } catch (\Throwable $e) {
            // Instalación anterior a db/migrate.php: sin las columnas nuevas se
            // entra igual, como organizador y sin cambio de clave forzado. Que
            // falte una migración no puede dejar a nadie fuera del panel.
            $stmt = $pdo->prepare('SELECT id, email, password_hash, is_admin FROM admins WHERE email = :e LIMIT 1');
            $stmt->execute([':e' => $email]);
        }
        $row = $stmt->fetch();

        // Verificar siempre algo (mitiga timing).
        $hash = $row['password_hash'] ?? '$2y$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv';
        if (!Security::verifyPassword($pwd, $hash) || !$row) {
            usleep(random_int(150000, 350000));
            Response::error(401, 'invalid_credentials');
        }

        // Una cuenta desactivada no entra. Antes sí lo hacía —la sesión quedaba
        // sin la bandera de admin— y el panel se abría vacío en vez de decir
        // nada: el mismo mensaje que una contraseña errónea evita además
        // confirmarle a nadie que la cuenta existe.
        if (empty($row['is_admin'])) {
            usleep(random_int(150000, 350000));
            Response::error(401, 'invalid_credentials');
        }

        Session::login(
            (int) $row['id'],
            (string) $row['email'],
            true,
            !empty($row['must_change_password']),
            (string) ($row['rol'] ?? 'organizador')
        );

        try {
            $pdo->prepare('UPDATE admins SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = :id')
                ->execute([':id' => (int) $row['id']]);
        } catch (\Throwable $e) {
            // Instalación sin migrar todavía: el acceso no depende de esto.
            error_log('[lmt][auth] ultimo_acceso: ' . $e->getMessage());
        }

        Response::ok([
            'user' => Session::user(),
            'csrf' => Session::csrfToken(),
        ]);
    });

    $r->post('/auth/logout', function () {
        Session::destroy();
        Response::ok(null);
    });
}
