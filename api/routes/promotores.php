<?php
defined('LMT_GUARD') || exit('forbidden');

use LMT\Db;
use LMT\Response;
use LMT\Validate;
use LMT\Security;
use LMT\Session;
use LMT\RateLimit;
use LMT\Mailer;
use LMT\Correos;
use LMT\Uploads;

/**
 * Módulo de inscripción de promotores de stands.
 *
 * Flujo completo:
 *   1. El promotor se inscribe desde una página pública (POST /promotores/registro).
 *      Queda en estado 'pendiente'. No recibe ninguna credencial todavía.
 *   2. Un administrador revisa la solicitud y la verifica
 *      (POST /admin/promotores/{id}/verificar). En ese momento —y sólo en ese—
 *      se genera una contraseña temporal, se guarda su hash y el texto plano
 *      viaja por correo al promotor. El servidor no vuelve a conocerla.
 *   3. El promotor entra con usuario (su correo) y esa contraseña. El sistema le
 *      obliga a cambiarla antes de dejarle hacer nada más; ahí pasa a 'activo'.
 *   4. Ya dentro, completa su perfil, los datos de su empresa y sus productos,
 *      con logo y fotos.
 *
 * Nota sobre las horas: `password_expira_at` y `bloqueado_hasta` se escriben y
 * se comparan en PHP en formato 'Y-m-d H:i:s' (UTC del servidor) en lugar de
 * delegar en el motor, porque MySQL y SQLite difieren en el manejo de fechas.
 */

const LMT_CLAVE_TEMPORAL_HORAS = 72;
const LMT_LOGIN_MAX_INTENTOS   = 8;
const LMT_LOGIN_BLOQUEO_MIN    = 15;

function register_routes_promotores(\LMT\Router $r): void
{
    // ---------------------------------------------------------------------
    // Público
    // ---------------------------------------------------------------------

    /**
     * Inscripción. Responde SIEMPRE lo mismo exista o no el correo: si
     * distinguiera, cualquiera podría averiguar qué caficultores están
     * inscritos probando correos (dato personal, Ley 1581/2012).
     */
    $r->post('/promotores/registro', function () {
        if (!RateLimit::hit('promotor_registro', RateLimit::ipHash())) {
            Response::error(429, 'rate_limited');
        }

        $b = Security::jsonBody();

        $email     = Validate::email($b['email'] ?? null);
        $nombre    = Validate::nombre($b['nombre'] ?? null, 120);
        $telefono  = Validate::telefono($b['telefono'] ?? null);
        $documento = Validate::documento($b['documento'] ?? null);
        $municipio = Validate::nombre($b['municipio'] ?? null, 80);
        $empresa   = Validate::nombre($b['empresa'] ?? null, 120);
        $mensaje   = Validate::texto($b['mensaje'] ?? null, 500);
        $acepta    = Validate::bool($b['acepta_datos'] ?? null) === true;

        // Datos del stand. Un promotor y su stand son la misma cosa, así que el
        // formulario público pide ya todo lo que el stand necesita y al
        // verificar no hay que volver a escribirlo.
        $standNombre  = Validate::nombre($b['stand_nombre'] ?? null, 80) ?? $empresa;
        $standRegion  = Validate::nombre($b['stand_region'] ?? null, 80);
        $standDir     = Validate::texto($b['stand_direccion'] ?? null, 255);
        $standDesc    = Validate::texto($b['stand_descripcion'] ?? null, 800);
        $standNit     = Validate::documento($b['stand_nit'] ?? null);
        $standWeb     = Validate::url($b['stand_sitio_web'] ?? null, 255);
        $logo         = promotor_logo_reclamado($b['logo'] ?? null);

        if (!$email)  Response::error(422, 'email_invalido');
        if (!$nombre) Response::error(422, 'nombre_invalido');
        if (!$acepta) Response::error(422, 'debe_aceptar_tratamiento_datos');

        $pdo = Db::pdo();
        $existe = $pdo->prepare('SELECT id, nombre, estado FROM promotores WHERE email = :e LIMIT 1');
        $existe->execute([':e' => $email]);
        $previo = $existe->fetch();

        if ($previo) {
            // Ya hay solicitud. No lo decimos por la respuesta; se lo contamos
            // por correo a quien de verdad es dueño de esa cuenta.
            $plantilla = Correos::solicitudRecibida((string) $previo['nombre']);
            Mailer::send($email, (string) $previo['nombre'], $plantilla['asunto'], $plantilla['html'], $plantilla['texto'], 'solicitud_duplicada');
            Response::ok(['recibido' => true]);
        }

        try {
            $ins = $pdo->prepare(
                'INSERT INTO promotores (email, nombre, documento, telefono, municipio,
                                         empresa_tentativa, mensaje, stand_nombre, stand_region,
                                         stand_direccion, stand_descripcion, stand_nit,
                                         stand_sitio_web, logo_path, estado, acepta_datos, ip_hash,
                                         created_at, updated_at)
                 VALUES (:e, :n, :doc, :tel, :mun, :emp, :msg, :sn, :sr, :sd, :sdesc, :snit,
                         :sweb, :logo, \'pendiente\', 1, :ip,
                         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
            );
            $ins->execute([
                ':e'     => $email,
                ':n'     => $nombre,
                ':doc'   => $documento,
                ':tel'   => $telefono,
                ':mun'   => $municipio,
                ':emp'   => $empresa,
                ':msg'   => $mensaje !== '' ? $mensaje : null,
                ':sn'    => $standNombre,
                ':sr'    => $standRegion,
                ':sd'    => $standDir !== '' ? $standDir : null,
                ':sdesc' => $standDesc !== '' ? $standDesc : null,
                ':snit'  => $standNit,
                ':sweb'  => $standWeb,
                ':logo'  => $logo,
                ':ip'    => RateLimit::ipHash(),
            ]);
        } catch (\PDOException $e) {
            // Carrera con otra petición sobre el mismo correo: mismo desenlace
            // visible que el camino "ya existe".
            if ($e->getCode() === '23000' || str_contains((string) $e->getMessage(), 'UNIQUE')) {
                Response::ok(['recibido' => true]);
            }
            throw $e;
        }

        $plantilla = Correos::solicitudRecibida($nombre);
        Mailer::send($email, $nombre, $plantilla['asunto'], $plantilla['html'], $plantilla['texto'], 'solicitud_recibida');
        promotores_avisar_admins($nombre, $email, (string) $municipio);

        Response::ok(['recibido' => true]);
    });

    /**
     * Logo del producto durante la INSCRIPCIÓN, es decir, sin sesión.
     *
     * Aceptar ficheros de un anónimo es lo más delicado del módulo. Se apoya en
     * tres cosas: Uploads::imagen() decide el tipo por el contenido y
     * re-codifica la imagen (lo que destruye cualquier carga útil escondida),
     * el nombre es aleatorio, y este endpoint tiene su propio límite por IP.
     * Los ficheros van a uploads/inscripciones/ hasta que se verifique la
     * solicitud; los de solicitudes que nunca se aprueban se pueden borrar sin
     * riesgo (ver db/limpiar-inscripciones.php).
     */
    $r->post('/promotores/logo-inscripcion', function () {
        if (!RateLimit::hit('promotor_logo_publico', RateLimit::ipHash())) {
            Response::error(429, 'rate_limited');
        }
        $ruta = promotor_guardar_imagen('inscripciones');
        Response::ok([
            'logo'      => $ruta,
            'max_bytes' => Uploads::maxBytes(),
            'max_dim'   => Uploads::maxDim(),
        ]);
    });

    $r->post('/promotores/login', function () {
        if (!RateLimit::hit('promotor_login', RateLimit::ipHash())) {
            Response::error(429, 'rate_limited');
        }

        $b     = Security::jsonBody();
        $email = Validate::email($b['email'] ?? null);
        $pwd   = $b['password'] ?? '';

        if (!$email || !is_string($pwd) || strlen($pwd) < 8 || strlen($pwd) > 128) {
            usleep(random_int(150000, 350000));
            Response::error(401, 'invalid_credentials');
        }

        $pdo = Db::pdo();
        $stmt = $pdo->prepare(
            'SELECT id, email, nombre, estado, password_hash, must_change_password,
                    password_expira_at, intentos_fallidos, bloqueado_hasta
             FROM promotores WHERE email = :e LIMIT 1'
        );
        $stmt->execute([':e' => $email]);
        $row = $stmt->fetch();

        $ahora = time();
        if ($row && !empty($row['bloqueado_hasta']) && strtotime((string) $row['bloqueado_hasta']) > $ahora) {
            Response::error(429, 'cuenta_bloqueada');
        }

        // Se verifica siempre contra algo para que el tiempo de respuesta no
        // delate si el correo existe.
        $hash = ($row && $row['password_hash']) ? (string) $row['password_hash']
              : '$2y$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv';
        $okPwd = Security::verifyPassword($pwd, $hash);

        if (!$row || !$row['password_hash'] || !$okPwd) {
            if ($row) promotores_registrar_fallo($pdo, (int) $row['id'], (int) $row['intentos_fallidos']);
            usleep(random_int(150000, 350000));
            Response::error(401, 'invalid_credentials');
        }

        $estado = (string) $row['estado'];
        if ($estado === 'rechazado')  Response::error(403, 'solicitud_rechazada');
        if ($estado === 'suspendido') Response::error(403, 'cuenta_suspendida');
        if ($estado === 'pendiente')  Response::error(403, 'pendiente_de_verificacion');

        $debeCambiar = !empty($row['must_change_password']);
        if ($debeCambiar && !empty($row['password_expira_at'])
            && strtotime((string) $row['password_expira_at']) < $ahora) {
            Response::error(403, 'password_expirada');
        }

        $pdo->prepare(
            'UPDATE promotores SET intentos_fallidos = 0, bloqueado_hasta = NULL,
                                   ultimo_acceso = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
             WHERE id = :id'
        )->execute([':id' => (int) $row['id']]);

        Session::loginPromotor((int) $row['id'], (string) $row['email'], $debeCambiar);

        Response::ok([
            'promotor' => [
                'id'          => (int) $row['id'],
                'email'       => (string) $row['email'],
                'nombre'      => (string) $row['nombre'],
                'estado'      => $estado,
                'must_change' => $debeCambiar,
            ],
            'csrf' => Session::csrfToken(),
        ]);
    });

    $r->post('/promotores/logout', function () {
        Session::destroy();
        Response::ok(null);
    });

    /** Estado de la sesión de promotor (lo consulta el SPA al arrancar). */
    $r->get('/promotores/me', function () {
        $p = Session::promotor();
        if ($p === null) {
            Response::ok(['promotor' => null, 'csrf' => Session::csrfToken()]);
        }
        $stmt = Db::pdo()->prepare('SELECT id, email, nombre, estado FROM promotores WHERE id = :id');
        $stmt->execute([':id' => $p['id']]);
        $row = $stmt->fetch();
        if (!$row || in_array((string) $row['estado'], ['rechazado', 'suspendido', 'pendiente'], true)) {
            // La cuenta cambió de estado mientras la sesión seguía viva.
            Session::destroy();
            Response::ok(['promotor' => null, 'csrf' => Session::csrfToken()]);
        }
        Response::ok([
            'promotor' => [
                'id'          => (int) $row['id'],
                'email'       => (string) $row['email'],
                'nombre'      => (string) $row['nombre'],
                'estado'      => (string) $row['estado'],
                'must_change' => $p['must_change'],
            ],
            'csrf' => Session::csrfToken(),
        ]);
    });

    /** Cambio de contraseña. Único trámite permitido con la clave temporal. */
    $r->post('/promotores/password', function () {
        $id = Security::requirePromotor(true);
        $b  = Security::jsonBody();

        $actual = $b['password_actual'] ?? '';
        $nueva  = $b['password_nueva'] ?? '';
        if (!is_string($actual) || !is_string($nueva)) Response::error(422, 'password_invalida');

        $pdo = Db::pdo();
        $stmt = $pdo->prepare('SELECT email, nombre, password_hash, estado FROM promotores WHERE id = :id');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        if (!$row || !$row['password_hash']) Response::error(401, 'unauthorized');

        if (!Security::verifyPassword($actual, (string) $row['password_hash'])) {
            usleep(random_int(150000, 350000));
            Response::error(403, 'password_actual_incorrecta');
        }
        if (hash_equals($actual, $nueva)) Response::error(422, 'password_repetida');

        $debil = Validate::passwordDebil($nueva, (string) $row['email'], (string) $row['nombre']);
        if ($debil !== null) Response::error(422, $debil);

        // Cambiar la clave pasa la cuenta a 'activo': ya es el promotor, y no el
        // correo, quien controla el acceso.
        $nuevoEstado = (string) $row['estado'] === 'verificado' ? 'activo' : (string) $row['estado'];
        $pdo->prepare(
            'UPDATE promotores SET password_hash = :h, must_change_password = 0,
                                   password_expira_at = NULL, estado = :st,
                                   updated_at = CURRENT_TIMESTAMP
             WHERE id = :id'
        )->execute([
            ':h'  => Security::hashPassword($nueva),
            ':st' => $nuevoEstado,
            ':id' => $id,
        ]);

        Session::marcarClaveCambiada();
        Response::ok(['estado' => $nuevoEstado]);
    });

    // ---------------------------------------------------------------------
    // Zona del promotor autenticado
    // ---------------------------------------------------------------------

    $r->get('/promotores/perfil', function () {
        $id = Security::requirePromotor();
        Response::ok(promotor_perfil_completo($id));
    });

    $r->put('/promotores/perfil', function () {
        $id = Security::requirePromotor();
        $b  = Security::jsonBody();

        $nombre = Validate::nombre($b['nombre'] ?? null, 120);
        if (!$nombre) Response::error(422, 'nombre_invalido');

        Db::pdo()->prepare(
            'UPDATE promotores SET nombre = :n, telefono = :tel, documento = :doc,
                                   municipio = :mun, updated_at = CURRENT_TIMESTAMP
             WHERE id = :id'
        )->execute([
            ':n'   => $nombre,
            ':tel' => Validate::telefono($b['telefono'] ?? null),
            ':doc' => Validate::documento($b['documento'] ?? null),
            ':mun' => Validate::nombre($b['municipio'] ?? null, 80),
            ':id'  => $id,
        ]);
        Response::ok(promotor_perfil_completo($id));
    });

    /** Alta o actualización de la empresa (siempre una sola por promotor). */
    $r->put('/promotores/empresa', function () {
        $id = Security::requirePromotor();
        $b  = Security::jsonBody();

        $nombre = Validate::nombre($b['nombre'] ?? null, 120);
        if (!$nombre) Response::error(422, 'nombre_empresa_invalido');

        $datos = [
            ':n'    => $nombre,
            ':nit'  => Validate::documento($b['nit'] ?? null),
            ':desc' => Validate::texto($b['descripcion'] ?? null, 1500) ?: null,
            ':mun'  => Validate::nombre($b['municipio'] ?? null, 80),
            ':dir'  => Validate::texto($b['direccion'] ?? null, 255) ?: null,
            ':tel'  => Validate::telefono($b['telefono'] ?? null),
            ':web'  => Validate::url($b['sitio_web'] ?? null, 255),
            ':pid'  => $id,
        ];

        $pdo = Db::pdo();
        $existe = $pdo->prepare('SELECT id FROM empresas WHERE promotor_id = :pid');
        $existe->execute([':pid' => $id]);

        if ($existe->fetchColumn()) {
            $pdo->prepare(
                'UPDATE empresas SET nombre = :n, nit = :nit, descripcion = :desc, municipio = :mun,
                                     direccion = :dir, telefono = :tel, sitio_web = :web,
                                     updated_at = CURRENT_TIMESTAMP
                 WHERE promotor_id = :pid'
            )->execute($datos);
        } else {
            $pdo->prepare(
                'INSERT INTO empresas (promotor_id, nombre, nit, descripcion, municipio, direccion,
                                       telefono, sitio_web, created_at, updated_at)
                 VALUES (:pid, :n, :nit, :desc, :mun, :dir, :tel, :web,
                         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
            )->execute($datos);
        }
        Response::ok(promotor_perfil_completo($id));
    });

    $r->get('/promotores/productos', function () {
        $id = Security::requirePromotor();
        Response::ok(promotor_productos($id));
    });

    $r->post('/promotores/productos', function () {
        $id = Security::requirePromotor();
        $b  = Security::jsonBody();
        $p  = promotor_producto_payload($b);

        $pdo = Db::pdo();
        $n = (int) $pdo->query('SELECT COUNT(*) FROM productos WHERE promotor_id = ' . (int) $id)->fetchColumn();
        if ($n >= 30) Response::error(422, 'limite_productos');

        $pdo->prepare(
            'INSERT INTO productos (promotor_id, nombre, variedad, proceso, altura_msnm, notas_cata,
                                    presentacion, precio, descripcion, publicado, created_at, updated_at)
             VALUES (:pid, :n, :var, :proc, :alt, :notas, :pres, :precio, :desc, :pub,
                     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
        )->execute([':pid' => $id] + $p);

        Response::ok(promotor_productos($id));
    });

    $r->put('/promotores/productos/:id', function (array $params) {
        $pid = Security::requirePromotor();
        $id  = Validate::entero($params['id'] ?? null, 1, PHP_INT_MAX);
        if ($id === null) Response::error(400, 'bad_id');

        $p = promotor_producto_payload(Security::jsonBody());

        // El WHERE lleva promotor_id: sin eso, cualquier promotor podría editar
        // el producto de otro con sólo cambiar el id de la URL (IDOR).
        $stmt = Db::pdo()->prepare(
            'UPDATE productos SET nombre = :n, variedad = :var, proceso = :proc, altura_msnm = :alt,
                                  notas_cata = :notas, presentacion = :pres, precio = :precio,
                                  descripcion = :desc, publicado = :pub, updated_at = CURRENT_TIMESTAMP
             WHERE id = :id AND promotor_id = :pid'
        );
        $stmt->execute($p + [':id' => $id, ':pid' => $pid]);
        if ($stmt->rowCount() === 0) {
            // O no existe, o es de otro promotor. No distinguimos.
            Response::error(404, 'not_found');
        }
        Response::ok(promotor_productos($pid));
    });

    $r->delete('/promotores/productos/:id', function (array $params) {
        $pid = Security::requirePromotor();
        $id  = Validate::entero($params['id'] ?? null, 1, PHP_INT_MAX);
        if ($id === null) Response::error(400, 'bad_id');

        $pdo = Db::pdo();
        $sel = $pdo->prepare('SELECT foto_path FROM productos WHERE id = :id AND promotor_id = :pid');
        $sel->execute([':id' => $id, ':pid' => $pid]);
        $row = $sel->fetch();
        if (!$row) Response::error(404, 'not_found');

        $pdo->prepare('DELETE FROM productos WHERE id = :id AND promotor_id = :pid')
            ->execute([':id' => $id, ':pid' => $pid]);
        Uploads::borrar($row['foto_path'] ?? null);

        Response::ok(promotor_productos($pid));
    });

    /** Logo de la empresa (multipart/form-data, campo "archivo"). */
    $r->post('/promotores/logo', function () {
        $pid = Security::requirePromotor();
        if (!RateLimit::hit('promotor_upload', 'p' . $pid)) Response::error(429, 'rate_limited');

        $pdo = Db::pdo();
        $sel = $pdo->prepare('SELECT id, logo_path FROM empresas WHERE promotor_id = :pid');
        $sel->execute([':pid' => $pid]);
        $empresa = $sel->fetch();
        if (!$empresa) Response::error(409, 'registra_la_empresa_primero');

        $ruta = promotor_guardar_imagen('promotores/' . $pid);
        $pdo->prepare('UPDATE empresas SET logo_path = :l, updated_at = CURRENT_TIMESTAMP WHERE promotor_id = :pid')
            ->execute([':l' => $ruta, ':pid' => $pid]);
        Uploads::borrar($empresa['logo_path'] ?? null);

        Response::ok(promotor_perfil_completo($pid));
    });

    /** Foto de un producto (multipart/form-data, campo "archivo"). */
    $r->post('/promotores/productos/:id/foto', function (array $params) {
        $pid = Security::requirePromotor();
        $id  = Validate::entero($params['id'] ?? null, 1, PHP_INT_MAX);
        if ($id === null) Response::error(400, 'bad_id');
        if (!RateLimit::hit('promotor_upload', 'p' . $pid)) Response::error(429, 'rate_limited');

        $pdo = Db::pdo();
        $sel = $pdo->prepare('SELECT foto_path FROM productos WHERE id = :id AND promotor_id = :pid');
        $sel->execute([':id' => $id, ':pid' => $pid]);
        $prod = $sel->fetch();
        if (!$prod) Response::error(404, 'not_found');

        $ruta = promotor_guardar_imagen('promotores/' . $pid);
        $pdo->prepare('UPDATE productos SET foto_path = :f, updated_at = CURRENT_TIMESTAMP WHERE id = :id AND promotor_id = :pid')
            ->execute([':f' => $ruta, ':id' => $id, ':pid' => $pid]);
        Uploads::borrar($prod['foto_path'] ?? null);

        Response::ok(promotor_productos($pid));
    });

    // ---------------------------------------------------------------------
    // Zona del administrador
    // ---------------------------------------------------------------------

    $r->get('/admin/promotores', function () {
        Security::requireAdmin();
        $estado = isset($_GET['estado']) && is_string($_GET['estado']) ? $_GET['estado'] : '';
        $validos = ['pendiente', 'verificado', 'activo', 'rechazado', 'suspendido'];

        $sql = 'SELECT p.id, p.email, p.nombre, p.documento, p.telefono, p.municipio,
                       p.empresa_tentativa, p.mensaje, p.estado, p.stand_id, p.created_at,
                       p.verificado_at, p.ultimo_acceso, p.must_change_password, p.motivo,
                       e.nombre AS empresa_nombre,
                       (SELECT COUNT(*) FROM productos pr WHERE pr.promotor_id = p.id) AS productos
                FROM promotores p
                LEFT JOIN empresas e ON e.promotor_id = p.id';
        $args = [];
        if (in_array($estado, $validos, true)) {
            $sql .= ' WHERE p.estado = :st';
            $args[':st'] = $estado;
        }
        $sql .= ' ORDER BY CASE p.estado WHEN \'pendiente\' THEN 0 ELSE 1 END, p.created_at DESC';

        $stmt = Db::pdo()->prepare($sql);
        $stmt->execute($args);
        Response::ok(array_map('promotor_fila_admin', $stmt->fetchAll()));
    });

    $r->get('/admin/promotores/:id', function (array $params) {
        Security::requireAdmin();
        $id = Validate::entero($params['id'] ?? null, 1, PHP_INT_MAX);
        if ($id === null) Response::error(400, 'bad_id');
        $detalle = promotor_perfil_completo($id, true);
        if ($detalle === null) Response::error(404, 'not_found');
        Response::ok($detalle);
    });

    /**
     * Verificación: el paso que el cliente pidió explícitamente. Genera la
     * contraseña temporal y la manda por correo.
     */
    $r->post('/admin/promotores/:id/verificar', function (array $params) {
        Security::requireAdmin();
        $id = Validate::entero($params['id'] ?? null, 1, PHP_INT_MAX);
        if ($id === null) Response::error(400, 'bad_id');

        $pdo = Db::pdo();
        $sel = $pdo->prepare('SELECT id, email, nombre, estado FROM promotores WHERE id = :id');
        $sel->execute([':id' => $id]);
        $row = $sel->fetch();
        if (!$row) Response::error(404, 'not_found');
        if (in_array((string) $row['estado'], ['verificado', 'activo'], true)) {
            Response::error(409, 'ya_verificado');
        }

        Response::ok(promotor_emitir_credenciales($pdo, $row, 'clave_promotor'));
    });

    /**
     * Reenvío: genera una contraseña NUEVA (la anterior deja de servir) y la
     * vuelve a enviar. Se usa cuando el correo no llegó o la clave caducó.
     */
    $r->post('/admin/promotores/:id/reenviar-clave', function (array $params) {
        Security::requireAdmin();
        $id = Validate::entero($params['id'] ?? null, 1, PHP_INT_MAX);
        if ($id === null) Response::error(400, 'bad_id');

        $pdo = Db::pdo();
        $sel = $pdo->prepare('SELECT id, email, nombre, estado FROM promotores WHERE id = :id');
        $sel->execute([':id' => $id]);
        $row = $sel->fetch();
        if (!$row) Response::error(404, 'not_found');
        if (in_array((string) $row['estado'], ['rechazado', 'suspendido'], true)) {
            Response::error(409, 'estado_no_permite_clave');
        }

        Response::ok(promotor_emitir_credenciales($pdo, $row, 'clave_promotor_reenvio'));
    });

    $r->post('/admin/promotores/:id/rechazar', function (array $params) {
        Security::requireAdmin();
        $id = Validate::entero($params['id'] ?? null, 1, PHP_INT_MAX);
        if ($id === null) Response::error(400, 'bad_id');

        $b = Security::jsonBody();
        $motivo = Validate::texto($b['motivo'] ?? null, 255);
        $avisar = Validate::bool($b['avisar'] ?? null) !== false;

        $pdo = Db::pdo();
        $sel = $pdo->prepare('SELECT id, email, nombre FROM promotores WHERE id = :id');
        $sel->execute([':id' => $id]);
        $row = $sel->fetch();
        if (!$row) Response::error(404, 'not_found');

        // Al rechazar se revoca cualquier credencial que existiera.
        $pdo->prepare(
            'UPDATE promotores SET estado = \'rechazado\', motivo = :m, password_hash = NULL,
                                   password_expira_at = NULL, must_change_password = 1,
                                   updated_at = CURRENT_TIMESTAMP
             WHERE id = :id'
        )->execute([':m' => $motivo !== '' ? $motivo : null, ':id' => $id]);

        $entregado = null;
        if ($avisar) {
            $pl = Correos::rechazo((string) $row['nombre'], $motivo);
            $entregado = Mailer::send((string) $row['email'], (string) $row['nombre'], $pl['asunto'], $pl['html'], $pl['texto'], 'rechazo');
        }
        Response::ok(['estado' => 'rechazado', 'correo_enviado' => $entregado]);
    });

    /** Suspender o reactivar una cuenta ya verificada. */
    $r->post('/admin/promotores/:id/estado', function (array $params) {
        Security::requireAdmin();
        $id = Validate::entero($params['id'] ?? null, 1, PHP_INT_MAX);
        if ($id === null) Response::error(400, 'bad_id');

        $b = Security::jsonBody();
        $nuevo = is_string($b['estado'] ?? null) ? $b['estado'] : '';
        if (!in_array($nuevo, ['activo', 'suspendido'], true)) Response::error(422, 'estado_invalido');

        $pdo = Db::pdo();
        $sel = $pdo->prepare('SELECT estado, password_hash FROM promotores WHERE id = :id');
        $sel->execute([':id' => $id]);
        $row = $sel->fetch();
        if (!$row) Response::error(404, 'not_found');
        if ($nuevo === 'activo' && empty($row['password_hash'])) {
            // Reactivar a alguien sin credenciales lo dejaría en un limbo:
            // el estado permitiría entrar pero no habría con qué.
            Response::error(409, 'sin_credenciales');
        }

        $pdo->prepare('UPDATE promotores SET estado = :st, updated_at = CURRENT_TIMESTAMP WHERE id = :id')
            ->execute([':st' => $nuevo, ':id' => $id]);
        Response::ok(['estado' => $nuevo]);
    });

    /** Vincula (o desvincula, con stand=null) el promotor a un stand. */
    $r->put('/admin/promotores/:id/stand', function (array $params) {
        Security::requireAdmin();
        $id = Validate::entero($params['id'] ?? null, 1, PHP_INT_MAX);
        if ($id === null) Response::error(400, 'bad_id');

        $b = Security::jsonBody();
        $standRaw = $b['stand_id'] ?? null;
        $stand = $standRaw === null || $standRaw === '' ? null : Validate::standId(is_string($standRaw) ? $standRaw : null);
        if ($standRaw !== null && $standRaw !== '' && $stand === null) Response::error(422, 'stand_invalido');

        $pdo = Db::pdo();
        if ($stand !== null) {
            $chk = $pdo->prepare('SELECT 1 FROM stands WHERE id = :s');
            $chk->execute([':s' => $stand]);
            if (!$chk->fetchColumn()) Response::error(404, 'stand_no_existe');
        }

        $stmt = $pdo->prepare('UPDATE promotores SET stand_id = :s, updated_at = CURRENT_TIMESTAMP WHERE id = :id');
        $stmt->execute([':s' => $stand, ':id' => $id]);
        if ($stmt->rowCount() === 0) {
            $chk = $pdo->prepare('SELECT 1 FROM promotores WHERE id = :id');
            $chk->execute([':id' => $id]);
            if (!$chk->fetchColumn()) Response::error(404, 'not_found');
        }
        Response::ok(['stand_id' => $stand]);
    });

    /** Bitácora de correos: ¿salió del servidor la clave que enviamos? */
    $r->get('/admin/emails', function () {
        Security::requireAdmin();
        $limit = isset($_GET['limit']) ? max(1, min(100, (int) $_GET['limit'])) : 30;
        $stmt = Db::pdo()->prepare(
            'SELECT id, destinatario, asunto, tipo, transporte, estado, error, created_at
             FROM emails_log ORDER BY id DESC LIMIT :lim'
        );
        $stmt->bindValue(':lim', $limit, \PDO::PARAM_INT);
        $stmt->execute();
        Response::ok($stmt->fetchAll());
    });

    // ---------------------------------------------------------------------
    // Vitrina pública: empresas y productos de promotores activos
    // ---------------------------------------------------------------------
    $r->get('/vitrina', function () {
        $stmt = Db::pdo()->query(
            'SELECT p.id AS promotor_id, p.municipio AS promotor_municipio, p.stand_id,
                    e.nombre, e.descripcion, e.municipio, e.sitio_web, e.logo_path
             FROM promotores p
             INNER JOIN empresas e ON e.promotor_id = p.id
             WHERE p.estado = \'activo\'
             ORDER BY e.nombre'
        );
        $empresas = $stmt->fetchAll();
        if (!$empresas) Response::ok([]);

        $ids = array_map(fn($e) => (int) $e['promotor_id'], $empresas);
        $marcas = implode(',', array_fill(0, count($ids), '?'));
        $prodStmt = Db::pdo()->prepare(
            "SELECT promotor_id, id, nombre, variedad, proceso, altura_msnm, notas_cata,
                    presentacion, precio, descripcion, foto_path
             FROM productos WHERE publicado = 1 AND promotor_id IN ($marcas)
             ORDER BY nombre"
        );
        $prodStmt->execute($ids);

        $porPromotor = [];
        foreach ($prodStmt->fetchAll() as $p) {
            $porPromotor[(int) $p['promotor_id']][] = promotor_producto_publico($p);
        }

        Response::ok(array_map(function ($e) use ($porPromotor) {
            $pid = (int) $e['promotor_id'];
            return [
                'empresa'     => (string) $e['nombre'],
                'descripcion' => (string) ($e['descripcion'] ?? ''),
                'municipio'   => (string) ($e['municipio'] ?: $e['promotor_municipio'] ?: ''),
                'sitio_web'   => (string) ($e['sitio_web'] ?? ''),
                'logo'        => promotor_ruta_publica($e['logo_path'] ?? null),
                'stand_id'    => $e['stand_id'] ?? null,
                'productos'   => $porPromotor[$pid] ?? [],
            ];
        }, $empresas));
    });
}

// -------------------------------------------------------------------------
// Auxiliares
// -------------------------------------------------------------------------

/**
 * Genera una clave temporal, la guarda hasheada y la envía por correo.
 *
 * Si el correo NO sale (hosting sin MTA, SMTP mal configurado) devolvemos la
 * clave al administrador en la respuesta para que pueda entregarla por otro
 * medio. Es una decisión consciente: el administrador ya puede regenerarla
 * cuando quiera, así que no gana ningún privilegio nuevo, y la alternativa
 * —dejar al promotor sin acceso y sin diagnóstico— es peor en una feria.
 * Cuando el envío sí funciona, la clave nunca vuelve al cliente.
 */
function promotor_emitir_credenciales(\PDO $pdo, array $row, string $tipoCorreo): array
{
    $clave = Security::generarClaveTemporal();
    $expira = date('Y-m-d H:i:s', time() + LMT_CLAVE_TEMPORAL_HORAS * 3600);
    $admin = Session::user();

    // El stand se crea AQUÍ, con lo que el promotor escribió al inscribirse.
    // Promotor y stand son la misma entidad: separarlos obligaría al
    // organizador a teclear otra vez unos datos que ya tiene delante.
    $stand = promotor_asegurar_stand($pdo, $row);

    $pdo->prepare(
        'UPDATE promotores SET password_hash = :h, must_change_password = 1, password_expira_at = :exp,
                               estado = \'verificado\', intentos_fallidos = 0, bloqueado_hasta = NULL,
                               verificado_por = :adm, verificado_at = CURRENT_TIMESTAMP,
                               stand_id = :sid, motivo = NULL, updated_at = CURRENT_TIMESTAMP
         WHERE id = :id'
    )->execute([
        ':h'   => Security::hashPassword($clave),
        ':exp' => $expira,
        ':adm' => $admin['id'] ?? null,
        ':sid' => $stand['id'] ?? null,
        ':id'  => (int) $row['id'],
    ]);

    // QR del stand incrustado en el correo. Si falla la generación no se
    // aborta el envío: la clave es lo imprescindible, el QR es una comodidad
    // y el organizador siempre lo puede reimprimir desde /admin/qr.
    $adjuntos = [];
    if (!empty($stand['id'])) {
        try {
            $adjuntos[] = [
                'nombre' => 'qr-' . $stand['id'] . '.png',
                'mime'   => 'image/png',
                'datos'  => \LMT\QrCode::png(Security::baseUrlPublica() . '/s/' . $stand['id'], 8, 4),
                'cid'    => 'qrstand',
            ];
        } catch (\Throwable $e) {
            error_log('[lmt][promotores][qr] ' . $e->getMessage());
        }
    }

    $pl = Correos::credenciales((string) $row['nombre'], (string) $row['email'], $clave, LMT_CLAVE_TEMPORAL_HORAS, $stand);
    $enviado = Mailer::send((string) $row['email'], (string) $row['nombre'], $pl['asunto'], $pl['html'], $pl['texto'], $tipoCorreo, $adjuntos);

    $salida = [
        'estado'         => 'verificado',
        'correo_enviado' => $enviado,
        'expira_en'      => $expira,
        'stand_id'       => $stand['id'] ?? null,
    ];
    if (!$enviado) {
        $salida['clave_temporal'] = $clave;
        $salida['aviso'] = 'El correo no pudo enviarse. Entrega esta clave al promotor por un canal seguro y revisa la configuración de correo.';
    }
    return $salida;
}

/**
 * Devuelve el stand del promotor, creándolo a partir del borrador de la
 * inscripción si todavía no existe. Idempotente: si ya está vinculado, sólo
 * refresca los datos que el promotor aportó.
 */
function promotor_asegurar_stand(\PDO $pdo, array $row): array
{
    $promotorId = (int) $row['id'];
    $sel = $pdo->prepare(
        'SELECT stand_id, nombre, documento, telefono, municipio, email,
                stand_nombre, stand_region, stand_direccion, stand_descripcion,
                stand_nit, stand_sitio_web, logo_path, empresa_tentativa
         FROM promotores WHERE id = :id'
    );
    $sel->execute([':id' => $promotorId]);
    $p = $sel->fetch();
    if (!$p) return [];

    $nombreStand = (string) ($p['stand_nombre'] ?: $p['empresa_tentativa'] ?: $p['nombre']);
    $municipio   = (string) ($p['municipio'] ?: 'Nariño');

    $datos = [
        ':nombre' => mb_substr($nombreStand, 0, 80, 'UTF-8'),
        ':mun'    => mb_substr($municipio, 0, 80, 'UTF-8'),
        ':reg'    => $p['stand_region'] ?: null,
        ':dir'    => $p['stand_direccion'] ?: null,
        ':correo' => $p['email'],
        ':desc'   => $p['stand_descripcion'] ?: null,
        ':prop'   => $p['nombre'] ?: null,
        ':propdoc'=> $p['documento'] ?: null,
        ':nit'    => $p['stand_nit'] ?: null,
        ':web'    => $p['stand_sitio_web'] ?: null,
        ':logo'   => promotor_ruta_publica($p['logo_path'] ?? null),
    ];

    if (!empty($p['stand_id'])) {
        $pdo->prepare(
            'UPDATE stands SET nombre=:nombre, municipio=:mun, region=:reg, direccion=:dir,
                               correo=:correo, descripcion=:desc, propietario=:prop,
                               propietario_documento=:propdoc, nit=:nit, sitio_web=:web,
                               logo_path=COALESCE(:logo, logo_path)
             WHERE id=:id'
        )->execute($datos + [':id' => $p['stand_id']]);
        return ['id' => (string) $p['stand_id'], 'nombre' => $datos[':nombre'], 'municipio' => $datos[':mun']];
    }

    $id = promotor_id_stand_libre($pdo, $nombreStand);
    $pdo->prepare(
        'INSERT INTO stands (id, nombre, municipio, region, direccion, correo, descripcion,
                             propietario, propietario_documento, nit, sitio_web, logo_path,
                             coords_x, coords_y, color)
         VALUES (:id, :nombre, :mun, :reg, :dir, :correo, :desc, :prop, :propdoc, :nit, :web,
                 :logo, 0.5, 0.5, :color)'
    )->execute($datos + [':id' => $id, ':color' => promotor_color_stand($id)]);

    return ['id' => $id, 'nombre' => $datos[':nombre'], 'municipio' => $datos[':mun']];
}

/** Identificador legible y libre para el stand, derivado del nombre. */
function promotor_id_stand_libre(\PDO $pdo, string $nombre): string
{
    $base = Validate::plegarAscii($nombre);
    $base = preg_replace('/[^a-z0-9]+/', '-', $base) ?? '';
    $base = trim((string) $base, '-');
    if (mb_strlen($base) < 2) $base = 'stand';
    $base = mb_substr($base, 0, 24, 'UTF-8');

    $chk = $pdo->prepare('SELECT 1 FROM stands WHERE id = :id');
    foreach (array_merge([''], range(2, 60)) as $sufijo) {
        $id = $sufijo === '' ? $base : $base . '-' . $sufijo;
        $chk->execute([':id' => $id]);
        if (!$chk->fetchColumn()) return $id;
    }
    return 'stand-' . bin2hex(random_bytes(4));
}

/** Color estable derivado del id, para que cada stand se distinga en el mapa. */
function promotor_color_stand(string $id): string
{
    $tono = hexdec(substr(md5($id), 0, 2)) % 360;
    return 'oklch(0.48 0.1 ' . $tono . ')';
}

/** Suma un intento fallido y bloquea la cuenta si se pasa del umbral. */
function promotores_registrar_fallo(\PDO $pdo, int $id, int $intentosPrevios): void
{
    $intentos = $intentosPrevios + 1;
    if ($intentos >= LMT_LOGIN_MAX_INTENTOS) {
        $pdo->prepare(
            'UPDATE promotores SET intentos_fallidos = 0, bloqueado_hasta = :b, updated_at = CURRENT_TIMESTAMP
             WHERE id = :id'
        )->execute([
            ':b'  => date('Y-m-d H:i:s', time() + LMT_LOGIN_BLOQUEO_MIN * 60),
            ':id' => $id,
        ]);
        return;
    }
    $pdo->prepare('UPDATE promotores SET intentos_fallidos = :i, updated_at = CURRENT_TIMESTAMP WHERE id = :id')
        ->execute([':i' => $intentos, ':id' => $id]);
}

/** Avisa por correo a los administradores de que hay solicitud pendiente. */
function promotores_avisar_admins(string $nombre, string $email, string $municipio): void
{
    try {
        $admins = Db::pdo()->query('SELECT email FROM admins WHERE is_admin = 1 LIMIT 5')->fetchAll();
        if (!$admins) return;
        $pl = Correos::avisoAdmin($nombre, $email, $municipio);
        foreach ($admins as $a) {
            Mailer::send((string) $a['email'], '', $pl['asunto'], $pl['html'], $pl['texto'], 'aviso_admin');
        }
    } catch (\Throwable $e) {
        // Que falle el aviso interno no puede tumbar la inscripción del ciudadano.
        error_log('[lmt][promotores][aviso] ' . $e->getMessage());
    }
}

/** Normaliza y valida el cuerpo de un producto. */
function promotor_producto_payload(array $b): array
{
    $nombre = Validate::nombre($b['nombre'] ?? null, 120);
    if (!$nombre) Response::error(422, 'nombre_producto_invalido');

    $altura = array_key_exists('altura_msnm', $b) && $b['altura_msnm'] !== '' && $b['altura_msnm'] !== null
        ? Validate::entero($b['altura_msnm'], 0, 6000) : null;
    if (array_key_exists('altura_msnm', $b) && $b['altura_msnm'] !== '' && $b['altura_msnm'] !== null && $altura === null) {
        Response::error(422, 'altura_invalida');
    }

    $precio = array_key_exists('precio', $b) && $b['precio'] !== '' && $b['precio'] !== null
        ? Validate::precio($b['precio']) : null;
    if (array_key_exists('precio', $b) && $b['precio'] !== '' && $b['precio'] !== null && $precio === null) {
        Response::error(422, 'precio_invalido');
    }

    $publicado = Validate::bool($b['publicado'] ?? null);

    return [
        ':n'      => $nombre,
        ':var'    => Validate::nombre($b['variedad'] ?? null, 80),
        ':proc'   => Validate::nombre($b['proceso'] ?? null, 80),
        ':alt'    => $altura,
        ':notas'  => Validate::texto($b['notas_cata'] ?? null, 500) ?: null,
        ':pres'   => Validate::nombre($b['presentacion'] ?? null, 80),
        ':precio' => $precio,
        ':desc'   => Validate::texto($b['descripcion'] ?? null, 1500) ?: null,
        ':pub'    => $publicado === false ? 0 : 1,
    ];
}

/** Recibe el fichero del campo "archivo" y lo almacena ya saneado. */
function promotor_guardar_imagen(string $sub): string
{
    if (empty($_FILES['archivo']) || !is_array($_FILES['archivo'])) {
        Response::error(422, 'archivo_ausente');
    }
    try {
        return Uploads::imagen($_FILES['archivo'], $sub);
    } catch (\RuntimeException $e) {
        Response::error(422, $e->getMessage());
    }
    return ''; // inalcanzable: Response::error termina la petición
}

/**
 * Valida la referencia al logo que el formulario de inscripción dice haber
 * subido. Sólo se acepta una ruta con la forma exacta que produce
 * Uploads::imagen() dentro de uploads/inscripciones/ y que además EXISTA: si no
 * se comprobara, cualquiera podría apuntar a un fichero arbitrario del disco.
 */
function promotor_logo_reclamado($valor): ?string
{
    if (!is_string($valor) || $valor === '') return null;
    if (!preg_match('#^uploads/inscripciones/[0-9a-f]{32}\.(jpg|png|webp)$#', $valor)) return null;
    $abs = Uploads::raiz() . '/' . substr($valor, strlen('uploads/'));
    return is_file($abs) ? $valor : null;
}

/** Ruta de imagen lista para el cliente, o null si no hay o no es válida. */
function promotor_ruta_publica(?string $ruta): ?string
{
    if (!is_string($ruta) || $ruta === '') return null;
    return preg_match('#^uploads/[a-z0-9/_-]+/[0-9a-f]{32}\.(jpg|png|webp)$#', $ruta) ? $ruta : null;
}

function promotor_producto_publico(array $p): array
{
    return [
        'id'           => (int) $p['id'],
        'nombre'       => (string) $p['nombre'],
        'variedad'     => (string) ($p['variedad'] ?? ''),
        'proceso'      => (string) ($p['proceso'] ?? ''),
        'altura_msnm'  => isset($p['altura_msnm']) && $p['altura_msnm'] !== null ? (int) $p['altura_msnm'] : null,
        'notas_cata'   => (string) ($p['notas_cata'] ?? ''),
        'presentacion' => (string) ($p['presentacion'] ?? ''),
        'precio'       => isset($p['precio']) && $p['precio'] !== null ? (float) $p['precio'] : null,
        'descripcion'  => (string) ($p['descripcion'] ?? ''),
        'foto'         => promotor_ruta_publica($p['foto_path'] ?? null),
    ];
}

function promotor_productos(int $promotorId): array
{
    $stmt = Db::pdo()->prepare(
        'SELECT id, nombre, variedad, proceso, altura_msnm, notas_cata, presentacion,
                precio, descripcion, foto_path, publicado
         FROM productos WHERE promotor_id = :pid ORDER BY id'
    );
    $stmt->execute([':pid' => $promotorId]);
    return array_map(function ($p) {
        return promotor_producto_publico($p) + ['publicado' => (bool) $p['publicado']];
    }, $stmt->fetchAll());
}

/**
 * Perfil + empresa + productos. $paraAdmin añade los campos de gestión.
 * Devuelve null si el promotor no existe (sólo posible desde la vista admin).
 */
function promotor_perfil_completo(int $promotorId, bool $paraAdmin = false): ?array
{
    $pdo = Db::pdo();
    $stmt = $pdo->prepare(
        'SELECT id, email, nombre, documento, telefono, municipio, estado, stand_id,
                empresa_tentativa, mensaje, created_at, verificado_at, ultimo_acceso,
                must_change_password, motivo
         FROM promotores WHERE id = :id'
    );
    $stmt->execute([':id' => $promotorId]);
    $p = $stmt->fetch();
    if (!$p) return null;

    $emp = $pdo->prepare(
        'SELECT nombre, nit, descripcion, municipio, direccion, telefono, sitio_web, logo_path
         FROM empresas WHERE promotor_id = :pid'
    );
    $emp->execute([':pid' => $promotorId]);
    $e = $emp->fetch();

    $salida = [
        'promotor' => [
            'id'          => (int) $p['id'],
            'email'       => (string) $p['email'],
            'nombre'      => (string) $p['nombre'],
            'documento'   => (string) ($p['documento'] ?? ''),
            'telefono'    => (string) ($p['telefono'] ?? ''),
            'municipio'   => (string) ($p['municipio'] ?? ''),
            'estado'      => (string) $p['estado'],
            'stand_id'    => $p['stand_id'] ?? null,
            'must_change' => (bool) $p['must_change_password'],
        ],
        'empresa' => $e ? [
            'nombre'      => (string) $e['nombre'],
            'nit'         => (string) ($e['nit'] ?? ''),
            'descripcion' => (string) ($e['descripcion'] ?? ''),
            'municipio'   => (string) ($e['municipio'] ?? ''),
            'direccion'   => (string) ($e['direccion'] ?? ''),
            'telefono'    => (string) ($e['telefono'] ?? ''),
            'sitio_web'   => (string) ($e['sitio_web'] ?? ''),
            'logo'        => promotor_ruta_publica($e['logo_path'] ?? null),
        ] : null,
        'productos' => promotor_productos($promotorId),
    ];

    if ($paraAdmin) {
        $salida['gestion'] = [
            'empresa_tentativa' => (string) ($p['empresa_tentativa'] ?? ''),
            'mensaje'           => (string) ($p['mensaje'] ?? ''),
            'motivo'            => (string) ($p['motivo'] ?? ''),
            'created_at'        => $p['created_at'] ?? null,
            'verificado_at'     => $p['verificado_at'] ?? null,
            'ultimo_acceso'     => $p['ultimo_acceso'] ?? null,
        ];
    }
    return $salida;
}

function promotor_fila_admin(array $p): array
{
    return [
        'id'                => (int) $p['id'],
        'email'             => (string) $p['email'],
        'nombre'            => (string) $p['nombre'],
        'documento'         => (string) ($p['documento'] ?? ''),
        'telefono'          => (string) ($p['telefono'] ?? ''),
        'municipio'         => (string) ($p['municipio'] ?? ''),
        'empresa_tentativa' => (string) ($p['empresa_tentativa'] ?? ''),
        'empresa'           => (string) ($p['empresa_nombre'] ?? ''),
        'mensaje'           => (string) ($p['mensaje'] ?? ''),
        'motivo'            => (string) ($p['motivo'] ?? ''),
        'estado'            => (string) $p['estado'],
        'stand_id'          => $p['stand_id'] ?? null,
        'productos'         => (int) ($p['productos'] ?? 0),
        'must_change'       => (bool) $p['must_change_password'],
        'created_at'        => $p['created_at'] ?? null,
        'verificado_at'     => $p['verificado_at'] ?? null,
        'ultimo_acceso'     => $p['ultimo_acceso'] ?? null,
    ];
}
