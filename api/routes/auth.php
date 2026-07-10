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
    // Datos del usuario actual + token CSRF (lo necesita el frontend antes de hacer POST).
    $r->get('/auth/me', function () {
        $user = Session::user();
        Response::ok([
            'user' => $user,
            'csrf' => Session::csrfToken(),
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

        $stmt = Db::pdo()->prepare('SELECT id, email, password_hash, is_admin, role, estado, nombre FROM admins WHERE email = :e LIMIT 1');
        $stmt->execute([':e' => $email]);
        $row = $stmt->fetch();

        // Verificar siempre algo (mitiga timing).
        $hash = $row['password_hash'] ?? '$2y$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv';
        if (!Security::verifyPassword($pwd, $hash) || !$row) {
            usleep(random_int(150000, 350000));
            Response::error(401, 'invalid_credentials');
        }

        // Compat: cuentas antiguas sin `role` se tratan como admin activo.
        $role   = $row['role']   ?: 'admin';
        $estado = $row['estado'] ?: 'activo';

        // Un expositor rechazado no puede entrar; pendiente/activo sí (para ver
        // su estado). Los admin deben estar activos.
        if ($estado === 'rechazado') {
            Response::error(403, 'cuenta_rechazada');
        }

        Session::login((int)$row['id'], (string)$row['email'], (string)$role, (string)$estado, $row['nombre'] ?? null);
        Response::ok([
            'user' => Session::user(),
            'csrf' => Session::csrfToken(),
        ]);
    });

    // Auto-registro de expositor: crea la cuenta (pendiente) + su stand
    // (pendiente). Queda a la espera de que un admin lo apruebe.
    $r->post('/auth/registro-expositor', function () {
        if (!RateLimit::hit('registro', RateLimit::ipHash())) {
            Response::error(429, 'rate_limited');
        }
        $b = Security::jsonBody();

        $email  = Validate::email($b['email'] ?? null);
        $pwd    = $b['password'] ?? '';
        $nombre = trim((string) ($b['nombre'] ?? ''));
        if (!$email)                                                     Response::error(422, 'correo_invalido');
        if (!is_string($pwd) || strlen($pwd) < 12 || strlen($pwd) > 128) Response::error(422, 'password_debil');
        if ($nombre === '' || mb_strlen($nombre, 'UTF-8') > 120)         Response::error(422, 'nombre_invalido');

        $pdo = Db::pdo();

        // El correo no puede estar en uso (admin o expositor).
        $ex = $pdo->prepare('SELECT 1 FROM admins WHERE email = :e LIMIT 1');
        $ex->execute([':e' => $email]);
        if ($ex->fetchColumn()) Response::error(409, 'correo_en_uso');

        // Generar un id de stand único.
        $standId = null;
        for ($i = 0; $i < 6; $i++) {
            $cand = 'st-' . bin2hex(random_bytes(3));
            $c = $pdo->prepare('SELECT 1 FROM stands WHERE id = :id');
            $c->execute([':id' => $cand]);
            if (!$c->fetchColumn()) { $standId = $cand; break; }
        }
        if (!$standId) Response::error(500, 'id_no_generado');

        // Validar los datos del stand (reusa la validación existente).
        $standInput = is_array($b['stand'] ?? null) ? $b['stand'] : [];
        $standInput['id'] = $standId;
        $stand = stand_payload($standInput, true);

        $hash = Security::hashPassword($pwd);

        try {
            \LMT\Db::tx(function (\PDO $pdo) use ($email, $hash, $nombre, $stand) {
                $pdo->prepare(
                    "INSERT INTO admins (email, password_hash, is_admin, role, estado, nombre)
                     VALUES (:e, :h, 0, 'expositor', 'pendiente', :n)"
                )->execute([':e' => $email, ':h' => $hash, ':n' => $nombre]);

                $pdo->prepare(
                    "INSERT INTO stands (id, nombre, municipio, region, direccion, correo, descripcion,
                                         coords_x, coords_y, color, estado, owner)
                     VALUES (:id, :nombre, :municipio, :region, :direccion, :correo, :descripcion,
                             :cx, :cy, :color, 'pendiente', :owner)"
                )->execute([
                    ':id' => $stand['id'], ':nombre' => $stand['nombre'], ':municipio' => $stand['municipio'],
                    ':region' => $stand['region'], ':direccion' => $stand['direccion'], ':correo' => $stand['correo'],
                    ':descripcion' => $stand['descripcion'], ':cx' => $stand['coords_x'], ':cy' => $stand['coords_y'],
                    ':color' => $stand['color'], ':owner' => $email,
                ]);
            });
        } catch (\PDOException $e) {
            if ($e->getCode() === '23000') Response::error(409, 'correo_en_uso');
            throw $e;
        }

        Response::ok(['pendiente' => true, 'stand_id' => $stand['id']]);
    });

    $r->post('/auth/logout', function () {
        Session::destroy();
        Response::ok(null);
    });
}
