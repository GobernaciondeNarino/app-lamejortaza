<?php
defined('LMT_GUARD') || exit('forbidden');
use LMT\Db;
use LMT\Response;
use LMT\Validate;
use LMT\Security;
use LMT\Session;

function register_routes_expositores(\LMT\Router $r): void
{
    // --- Expositor: su propio stand (cualquier estado) + estado de cuenta ---
    $r->get('/mi-stand', function () {
        $u = Session::user();
        if (!$u || ($u['role'] ?? '') !== 'expositor') Response::error(401, 'unauthorized');

        $stmt = Db::pdo()->prepare(
            'SELECT id, nombre, municipio, region, direccion, correo, descripcion,
                    coords_x, coords_y, color, votos_bueno, votos_regular, votos_malo, estado, owner
             FROM stands WHERE owner = :o LIMIT 1'
        );
        $stmt->execute([':o' => $u['email']]);
        $row = $stmt->fetch();
        Response::ok([
            'estado_cuenta' => $u['estado'] ?? 'pendiente',
            'nombre'        => $u['nombre'] ?? '',
            'stand'         => $row ? stand_row_to_api($row) : null,
        ]);
    });

    // --- Admin: todos los stands (gestión), con estado y dueño ---
    $r->get('/admin/stands', function () {
        Security::requireAdmin();
        $rows = Db::pdo()->query(
            "SELECT id, nombre, municipio, region, direccion, correo, descripcion,
                    coords_x, coords_y, color, votos_bueno, votos_regular, votos_malo, estado, owner
             FROM stands ORDER BY CASE estado WHEN 'pendiente' THEN 0 WHEN 'activo' THEN 1 ELSE 2 END, id"
        )->fetchAll();
        $list = array_map(function ($s) {
            $api = stand_row_to_api($s);
            $api['owner'] = $s['owner'] ?? null;
            return $api;
        }, $rows);
        Response::ok($list);
    });

    // --- Admin: bandeja de aprobaciones (stands pendientes + su expositor) ---
    $r->get('/admin/aprobaciones', function () {
        Security::requireAdmin();
        $rows = Db::pdo()->query(
            "SELECT s.id, s.nombre, s.municipio, s.region, s.direccion, s.correo, s.descripcion,
                    s.coords_x, s.coords_y, s.color, s.votos_bueno, s.votos_regular, s.votos_malo,
                    s.estado, s.owner, s.created_at,
                    a.nombre AS exp_nombre, a.email AS exp_email
             FROM stands s
             LEFT JOIN admins a ON a.email = s.owner
             WHERE s.estado = 'pendiente'
             ORDER BY s.created_at ASC"
        )->fetchAll();
        $list = array_map(function ($s) {
            $api = stand_row_to_api($s);
            $api['owner']      = $s['owner'] ?? null;
            $api['creado']     = $s['created_at'] ?? null;
            $api['expositor']  = ['nombre' => $s['exp_nombre'] ?? '', 'email' => $s['exp_email'] ?? $s['owner']];
            return $api;
        }, $rows);
        Response::ok($list);
    });

    // --- Admin: aprobar un stand (y activar su cuenta de expositor) ---
    $r->post('/stands/:id/aprobar', function (array $p) {
        Security::requireAdmin();
        $id = Validate::standId($p['id'] ?? null);
        if (!$id) Response::error(400, 'bad_id');
        \LMT\Db::tx(function (\PDO $pdo) use ($id) {
            $st = $pdo->prepare('SELECT owner FROM stands WHERE id = :id');
            $st->execute([':id' => $id]);
            $row = $st->fetch();
            if (!$row) return;
            $pdo->prepare("UPDATE stands SET estado = 'activo' WHERE id = :id")->execute([':id' => $id]);
            if (!empty($row['owner'])) {
                $pdo->prepare("UPDATE admins SET estado = 'activo' WHERE email = :e AND role = 'expositor'")
                    ->execute([':e' => $row['owner']]);
            }
        });
        Response::ok(null);
    });

    // --- Admin: rechazar un stand (y su cuenta de expositor) ---
    $r->post('/stands/:id/rechazar', function (array $p) {
        Security::requireAdmin();
        $id = Validate::standId($p['id'] ?? null);
        if (!$id) Response::error(400, 'bad_id');
        \LMT\Db::tx(function (\PDO $pdo) use ($id) {
            $st = $pdo->prepare('SELECT owner FROM stands WHERE id = :id');
            $st->execute([':id' => $id]);
            $row = $st->fetch();
            if (!$row) return;
            $pdo->prepare("UPDATE stands SET estado = 'rechazado' WHERE id = :id")->execute([':id' => $id]);
            if (!empty($row['owner'])) {
                $pdo->prepare("UPDATE admins SET estado = 'rechazado' WHERE email = :e AND role = 'expositor'")
                    ->execute([':e' => $row['owner']]);
            }
        });
        Response::ok(null);
    });
}
