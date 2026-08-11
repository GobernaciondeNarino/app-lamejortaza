<?php
defined('LMT_GUARD') || exit('forbidden');

use LMT\Db;
use LMT\Response;
use LMT\Validate;
use LMT\Security;
use LMT\Session;
use LMT\Mailer;
use LMT\Correos;

/**
 * Gestión de administradores.
 *
 * Dos roles:
 *   'propietario'  — puede crear, cambiar de rol y eliminar administradores.
 *                    Es quien instaló el sistema (o quien él designe).
 *   'organizador'  — usa el panel del festival, pero no toca las cuentas.
 *
 * Se sigue el mismo camino que con los promotores: al crear una cuenta se
 * genera una contraseña temporal, se guarda sólo su hash y el texto plano viaja
 * por correo. El sistema obliga a cambiarla en el primer acceso.
 *
 * Reglas que evitan quedarse fuera del propio sistema:
 *   - Nadie puede eliminarse a sí mismo.
 *   - Siempre debe quedar al menos un propietario activo.
 */

function register_routes_administradores(\LMT\Router $r): void
{
    // El listado también es sólo del propietario: enseña qué cuentas siguen con
    // la contraseña que se envió por correo, que es justo el dato con el que
    // empezaría quien quisiera colarse. Para pintar el menú, el frontend ya
    // sabe su propio rol desde /auth/me.
    $r->get('/admin/administradores', function () {
        admin_requiere_propietario();
        $rows = Db::pdo()->query(
            'SELECT id, email, nombre, rol, is_admin, must_change_password, ultimo_acceso, created_at
             FROM admins ORDER BY id'
        )->fetchAll();
        $yo = Session::user();
        Response::ok([
            'yo'   => ['id' => $yo['id'] ?? null, 'rol' => admin_rol_actual()],
            'lista' => array_map(function ($a) {
                return [
                    'id'            => (int) $a['id'],
                    'email'         => (string) $a['email'],
                    'nombre'        => (string) ($a['nombre'] ?? ''),
                    'rol'           => (string) ($a['rol'] ?? 'organizador'),
                    'activo'        => !empty($a['is_admin']),
                    'clave_sin_usar'=> !empty($a['must_change_password']),
                    'ultimo_acceso' => $a['ultimo_acceso'] ?? null,
                    'created_at'    => $a['created_at'] ?? null,
                ];
            }, $rows),
        ]);
    });

    $r->post('/admin/administradores', function () {
        admin_requiere_propietario();
        $b = Security::jsonBody();

        $email  = Validate::email($b['email'] ?? null);
        $nombre = Validate::nombre($b['nombre'] ?? null, 120);
        $rol    = in_array($b['rol'] ?? '', ['propietario', 'organizador'], true) ? $b['rol'] : 'organizador';
        if (!$email)  Response::error(422, 'email_invalido');
        if (!$nombre) Response::error(422, 'nombre_invalido');

        $pdo = Db::pdo();
        $existe = $pdo->prepare('SELECT id FROM admins WHERE email = :e');
        $existe->execute([':e' => $email]);
        if ($existe->fetchColumn()) Response::error(409, 'admin_ya_existe');

        $clave = Security::generarClaveTemporal();
        $yo = Session::user();
        $pdo->prepare(
            'INSERT INTO admins (email, password_hash, is_admin, nombre, rol,
                                 must_change_password, creado_por, created_at)
             VALUES (:e, :h, 1, :n, :rol, 1, :por, CURRENT_TIMESTAMP)'
        )->execute([
            ':e'   => $email,
            ':h'   => Security::hashPassword($clave),
            ':n'   => $nombre,
            ':rol' => $rol,
            ':por' => $yo['id'] ?? null,
        ]);

        $pl = Correos::altaAdministrador($nombre, $email, $clave, $rol);
        $enviado = Mailer::send($email, $nombre, $pl['asunto'], $pl['html'], $pl['texto'], 'alta_admin');

        $salida = ['creado' => true, 'correo_enviado' => $enviado];
        if (!$enviado) {
            // Mismo criterio que con los promotores: si el correo no sale, la
            // clave se le devuelve a quien la puede entregar en mano. Quien ve
            // esto ya es propietario y puede regenerarla cuando quiera.
            $salida['clave_temporal'] = $clave;
        }
        Response::ok($salida);
    });

    $r->put('/admin/administradores/:id', function (array $p) {
        admin_requiere_propietario();
        $id = Validate::entero($p['id'] ?? null, 1, PHP_INT_MAX);
        if ($id === null) Response::error(400, 'bad_id');

        $b = Security::jsonBody();
        $nombre = Validate::nombre($b['nombre'] ?? null, 120);
        $rol    = in_array($b['rol'] ?? '', ['propietario', 'organizador'], true) ? $b['rol'] : null;
        $activo = Validate::bool($b['activo'] ?? null);
        if (!$nombre) Response::error(422, 'nombre_invalido');

        $pdo = Db::pdo();
        $actual = admin_por_id($pdo, $id);
        if (!$actual) Response::error(404, 'not_found');

        // Quitarle el rol o desactivar al último propietario deja el sistema sin
        // nadie que pueda administrar cuentas: se impide antes de escribir.
        $degradando = ($rol !== null && $rol !== 'propietario') || $activo === false;
        if ($actual['rol'] === 'propietario' && $degradando && admin_propietarios_activos($pdo, $id) === 0) {
            Response::error(409, 'ultimo_propietario');
        }

        $pdo->prepare(
            'UPDATE admins SET nombre = :n, rol = COALESCE(:rol, rol), is_admin = COALESCE(:act, is_admin)
             WHERE id = :id'
        )->execute([
            ':n'   => $nombre,
            ':rol' => $rol,
            ':act' => $activo === null ? null : ($activo ? 1 : 0),
            ':id'  => $id,
        ]);
        Response::ok(null);
    });

    /** Genera una contraseña nueva y la envía. Invalida la anterior. */
    $r->post('/admin/administradores/:id/clave', function (array $p) {
        admin_requiere_propietario();
        $id = Validate::entero($p['id'] ?? null, 1, PHP_INT_MAX);
        if ($id === null) Response::error(400, 'bad_id');

        $pdo = Db::pdo();
        $a = admin_por_id($pdo, $id);
        if (!$a) Response::error(404, 'not_found');

        $clave = Security::generarClaveTemporal();
        $pdo->prepare('UPDATE admins SET password_hash = :h, must_change_password = 1 WHERE id = :id')
            ->execute([':h' => Security::hashPassword($clave), ':id' => $id]);

        $pl = Correos::altaAdministrador((string) ($a['nombre'] ?: $a['email']), (string) $a['email'], $clave, (string) $a['rol'], false);
        $enviado = Mailer::send((string) $a['email'], (string) ($a['nombre'] ?? ''), $pl['asunto'], $pl['html'], $pl['texto'], 'clave_admin');

        $salida = ['correo_enviado' => $enviado];
        if (!$enviado) $salida['clave_temporal'] = $clave;
        Response::ok($salida);
    });

    $r->delete('/admin/administradores/:id', function (array $p) {
        admin_requiere_propietario();
        $id = Validate::entero($p['id'] ?? null, 1, PHP_INT_MAX);
        if ($id === null) Response::error(400, 'bad_id');

        $yo = Session::user();
        if ((int) ($yo['id'] ?? 0) === $id) Response::error(409, 'no_puedes_eliminarte');

        $pdo = Db::pdo();
        $a = admin_por_id($pdo, $id);
        if (!$a) Response::error(404, 'not_found');
        if ($a['rol'] === 'propietario' && admin_propietarios_activos($pdo, $id) === 0) {
            Response::error(409, 'ultimo_propietario');
        }

        $pdo->prepare('DELETE FROM admins WHERE id = :id')->execute([':id' => $id]);
        Response::ok(null);
    });

    /** Cambio de la propia contraseña (cualquier administrador). */
    $r->post('/auth/password', function () {
        Security::requireAdmin(true);
        $b = Security::jsonBody();
        $actual = is_string($b['password_actual'] ?? null) ? $b['password_actual'] : '';
        $nueva  = is_string($b['password_nueva'] ?? null) ? $b['password_nueva'] : '';

        $yo = Session::user();
        $pdo = Db::pdo();
        $stmt = $pdo->prepare('SELECT email, nombre, password_hash FROM admins WHERE id = :id');
        $stmt->execute([':id' => $yo['id']]);
        $row = $stmt->fetch();
        if (!$row) Response::error(401, 'unauthorized');

        if (!Security::verifyPassword($actual, (string) $row['password_hash'])) {
            usleep(random_int(150000, 350000));
            Response::error(403, 'password_actual_incorrecta');
        }
        if (hash_equals($actual, $nueva)) Response::error(422, 'password_repetida');

        $debil = Validate::passwordDebil($nueva, (string) $row['email'], (string) ($row['nombre'] ?? ''));
        if ($debil !== null) Response::error(422, $debil);

        $pdo->prepare('UPDATE admins SET password_hash = :h, must_change_password = 0 WHERE id = :id')
            ->execute([':h' => Security::hashPassword($nueva), ':id' => $yo['id']]);
        Session::marcarClaveCambiada();
        Response::ok(null);
    });
}

// -------------------------------------------------------------------------

function admin_por_id(\PDO $pdo, int $id): ?array
{
    $stmt = $pdo->prepare('SELECT id, email, nombre, rol, is_admin FROM admins WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $a = $stmt->fetch();
    return $a ?: null;
}

/** Cuántos propietarios activos quedarían excluyendo a $exceptoId. */
function admin_propietarios_activos(\PDO $pdo, int $exceptoId): int
{
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM admins WHERE rol = 'propietario' AND is_admin = 1 AND id <> :id");
    $stmt->execute([':id' => $exceptoId]);
    return (int) $stmt->fetchColumn();
}

function admin_rol_actual(): string
{
    $yo = Session::user();
    if (!$yo) return '';
    try {
        $stmt = Db::pdo()->prepare('SELECT rol FROM admins WHERE id = :id');
        $stmt->execute([':id' => $yo['id']]);
        return (string) ($stmt->fetchColumn() ?: 'organizador');
    } catch (\Throwable $e) {
        return 'organizador';
    }
}

function admin_requiere_propietario(): void
{
    Security::requireAdmin();
    if (admin_rol_actual() !== 'propietario') Response::error(403, 'requiere_propietario');
}
