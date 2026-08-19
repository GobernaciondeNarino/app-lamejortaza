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
        // Opcionales, pero si se escriben tienen que ser números. Antes un
        // «CC 12.345.678» se guardaba como NULL sin decir nada y la cédula
        // desaparecía; ahora el formulario lo rechaza y se ve por qué.
        $telefono  = promotor_numero_opcional($b['telefono'] ?? null, 'telefono_invalido', [Validate::class, 'telefono']);
        $documento = promotor_numero_opcional($b['documento'] ?? null, 'documento_invalido', [Validate::class, 'documento']);
        // El municipio se resuelve contra el catálogo del DANE: lo que no sea
        // uno de los 64 de Nariño no entra. Antes era texto libre y en la base
        // acabaron «Pasto» y «San Juan de Pasto» como municipios distintos.
        $municipio = \LMT\Territorio::municipio($b['municipio'] ?? null);
        $empresa   = Validate::nombre($b['empresa'] ?? null, 120);
        $mensaje   = Validate::texto($b['mensaje'] ?? null, 500);
        $acepta    = Validate::bool($b['acepta_datos'] ?? null) === true;

        // Datos del stand. Un promotor y su stand son la misma cosa, así que el
        // formulario público pide ya todo lo que el stand necesita y al
        // verificar no hay que volver a escribirlo.
        $standNombre  = Validate::nombre($b['stand_nombre'] ?? null, 80) ?? $empresa;
        // La región NO se acepta del cliente: se deduce del municipio. Es la
        // única forma de que las dos no puedan contradecirse.
        $standRegion  = $municipio !== null ? \LMT\Territorio::subregion($municipio) : null;
        $standDir     = Validate::texto($b['stand_direccion'] ?? null, 255);
        $standDesc    = Validate::texto($b['stand_descripcion'] ?? null, 800);
        $standNit     = promotor_numero_opcional($b['stand_nit'] ?? null, 'nit_invalido', [Validate::class, 'documento']);
        $standWeb     = Validate::url($b['stand_sitio_web'] ?? null, 255);
        $logo         = promotor_logo_reclamado($b['logo'] ?? null);
        // Punto elegido en el mapa. Fuera de Nariño no se guarda: sólo puede
        // venir de un error, y un punto en otro continente ensucia el mapa del
        // festival sin que nadie se dé cuenta.
        [$standLat, $standLng] = promotor_coordenadas($b['lat'] ?? null, $b['lng'] ?? null);

        // Cómo va a entrar si el correo no llega. Ver PROMOTOR_ACCESOS.
        $accesoMetodo = in_array($b['acceso_metodo'] ?? '', PROMOTOR_ACCESOS, true)
            ? (string) $b['acceso_metodo'] : null;
        $tokenQr = null;
        $credencial = null;
        if ($accesoMetodo !== null) {
            if ($accesoMetodo === 'qr') {
                // El token lo genera el servidor: si lo eligiera el cliente,
                // «12345678…» sería una credencial válida.
                $tokenQr = promotor_token_qr();
                $credencial = $tokenQr;
            } else {
                $credencial = promotor_credencial_normalizada($accesoMetodo, $b['acceso_valor'] ?? null);
                if ($credencial === null) Response::error(422, 'acceso_valor_invalido');
                // El teléfono se pide dos veces en el formulario; que coincidan
                // se comprueba también aquí, porque el navegador no es quien
                // decide qué entra en la base.
                if ($accesoMetodo === 'telefono') {
                    $rep = promotor_credencial_normalizada('telefono', $b['acceso_valor2'] ?? null);
                    if ($rep === null || !hash_equals($credencial, $rep)) {
                        Response::error(422, 'acceso_no_coincide');
                    }
                }
            }
        }

        if (!$email)  Response::error(422, 'email_invalido');
        if (!$nombre) Response::error(422, 'nombre_invalido');
        if (!$municipio) Response::error(422, 'municipio_invalido');
        // El logo es obligatorio: es lo que identifica al stand en la tarjeta
        // de «Mi recorrido» y bajo el sello del pasaporte. Sin él esas dos
        // pantallas se ven a medias, y pedirlo después —cuando el caficultor ya
        // se fue— no lo consigue nadie.
        if (!$logo) Response::error(422, 'logo_requerido');
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
                                         stand_sitio_web, logo_path, stand_lat, stand_lng,
                                         estado, acceso_metodo, password_hash, must_change_password,
                                         acepta_datos, ip_hash,
                                         created_at, updated_at)
                 VALUES (:e, :n, :doc, :tel, :mun, :emp, :msg, :sn, :sr, :sd, :sdesc, :snit,
                         :sweb, :logo, :slat, :slng, \'pendiente\', :am, :ph, :mcp, 1, :ip,
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
                ':slat'  => $standLat,
                ':slng'  => $standLng,
                ':am'    => $accesoMetodo,
                // La credencial elegida se guarda hasheada YA, aunque la cuenta
                // siga pendiente: el login la rechaza igual mientras no esté
                // verificada, y así no hay que volver a pedírsela.
                ':ph'    => $credencial !== null ? Security::hashPassword($credencial) : null,
                // Fecha y teléfono sirven para entrar, no para quedarse: en
                // cuanto entra, el sistema le obliga a poner una clave de
                // verdad. Una contraseña que eligió él no necesita cambiarse.
                ':mcp'   => ($accesoMetodo !== null && !in_array($accesoMetodo, PROMOTOR_ACCESOS_DEBILES, true)) ? 0 : 1,
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

        // El QR se genera aquí, con el token recién creado. En la base sólo
        // queda su hash, así que ésta es la única vez que se puede dibujar.
        $qr = $tokenQr !== null ? promotor_qr_paquete($email, $tokenQr) : [];

        // Si el correo sale, el QR va dentro: quien eligió este método suele ser
        // justo quien no quiere depender del correo, pero tenerlo también en el
        // buzón le da una segunda copia que no se pierde al cerrar la pestaña.
        $adjuntos = [];
        if ($tokenQr !== null) {
            $png = promotor_qr_bytes($email, $tokenQr, 8);
            if ($png !== null) {
                $adjuntos[] = ['nombre' => 'qr-acceso.png', 'mime' => 'image/png', 'datos' => $png, 'cid' => 'qracceso'];
            }
        }

        $plantilla = Correos::solicitudRecibida($nombre, $adjuntos !== []);
        Mailer::send($email, $nombre, $plantilla['asunto'], $plantilla['html'], $plantilla['texto'], 'solicitud_recibida', $adjuntos);
        promotores_avisar_admins($nombre, $email, (string) $municipio);

        // El token del QR se devuelve UNA vez y no se vuelve a poder consultar:
        // en la base sólo queda su hash. El formulario lo enseña para que lo
        // guarde ahí mismo.
        Response::ok(array_filter([
            'recibido'      => true,
            'acceso_metodo' => $accesoMetodo,
        ], fn($v) => $v !== null) + $qr);
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
        // Con qué dice la persona que entra. El formulario lo pregunta en vez
        // de deducirlo del correo: consultar el método antes de autenticar
        // convertiría el login en un comprobador de «¿está inscrito este
        // correo?», que es justo lo que el resto del módulo evita.
        $metodo = in_array($b['acceso_metodo'] ?? '', PROMOTOR_ACCESOS, true)
            ? (string) $b['acceso_metodo'] : 'password';

        if (!$email || !is_string($pwd) || $pwd === '' || strlen($pwd) > 128) {
            usleep(random_int(150000, 350000));
            Response::error(401, 'invalid_credentials');
        }

        $pdo = Db::pdo();
        $stmt = $pdo->prepare(
            'SELECT id, email, nombre, estado, password_hash, must_change_password,
                    password_expira_at, intentos_fallidos, bloqueado_hasta, acceso_metodo
             FROM promotores WHERE email = :e LIMIT 1'
        );
        $stmt->execute([':e' => $email]);
        $row = $stmt->fetch();

        $ahora = time();
        if ($row && !empty($row['bloqueado_hasta']) && strtotime((string) $row['bloqueado_hasta']) > $ahora) {
            Response::error(429, 'cuenta_bloqueada');
        }

        // La credencial se normaliza según el método que dice usar quien entra:
        // «315 778 8990» y «3157788990» tienen que ser el mismo teléfono, y
        // «4/3/2015» la misma fecha que «2015-03-04».
        //
        // Se prueba también el valor SIN normalizar. Es lo que salva a las
        // cuentas anteriores a esto y a las que reciben la clave temporal por
        // correo: su credencial es una contraseña normal y el método que venga
        // marcado en el formulario no debería poder estropearla.
        $candidatos = [$pwd];
        $norm = promotor_credencial_normalizada($metodo, $pwd);
        if ($norm !== null && $norm !== $pwd) $candidatos[] = $norm;

        // Se verifica siempre contra algo para que el tiempo de respuesta no
        // delate si el correo existe.
        $hash = ($row && $row['password_hash']) ? (string) $row['password_hash']
              : '$2y$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv';
        $okPwd = false;
        foreach ($candidatos as $cand) {
            if (Security::verifyPassword($cand, $hash)) { $okPwd = true; break; }
        }

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

        // Mismo catálogo que en la inscripción: el municipio sólo puede ser uno
        // de los 64 de Nariño, escrito como lo escribe el DANE.
        $municipio = \LMT\Territorio::municipio($b['municipio'] ?? null);
        if ($municipio === null) Response::error(422, 'municipio_invalido');

        Db::pdo()->prepare(
            'UPDATE promotores SET nombre = :n, telefono = :tel, documento = :doc,
                                   municipio = :mun, stand_region = :reg,
                                   updated_at = CURRENT_TIMESTAMP
             WHERE id = :id'
        )->execute([
            ':n'   => $nombre,
            ':tel' => promotor_numero_opcional($b['telefono'] ?? null, 'telefono_invalido', [Validate::class, 'telefono']),
            ':doc' => promotor_numero_opcional($b['documento'] ?? null, 'documento_invalido', [Validate::class, 'documento']),
            ':mun' => $municipio,
            ':reg' => \LMT\Territorio::subregion($municipio),
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

        $municipio = \LMT\Territorio::municipio($b['municipio'] ?? null);
        if ($municipio === null) Response::error(422, 'municipio_invalido');

        $datos = [
            ':n'    => $nombre,
            ':nit'  => promotor_numero_opcional($b['nit'] ?? null, 'nit_invalido', [Validate::class, 'documento']),
            ':desc' => Validate::texto($b['descripcion'] ?? null, 1500) ?: null,
            ':mun'  => $municipio,
            ':dir'  => Validate::texto($b['direccion'] ?? null, 255) ?: null,
            ':tel'  => promotor_numero_opcional($b['telefono'] ?? null, 'telefono_invalido', [Validate::class, 'telefono']),
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
                       p.acceso_metodo,
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
        $sel = $pdo->prepare('SELECT id, email, nombre, estado, acceso_metodo, password_hash
                              FROM promotores WHERE id = :id');
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
        $sel = $pdo->prepare('SELECT id, email, nombre, estado, acceso_metodo, password_hash
                              FROM promotores WHERE id = :id');
        $sel->execute([':id' => $id]);
        $row = $sel->fetch();
        if (!$row) Response::error(404, 'not_found');
        if (in_array((string) $row['estado'], ['rechazado', 'suspendido'], true)) {
            Response::error(409, 'estado_no_permite_clave');
        }

        // Con `true`: reenviar es justamente para cuando el promotor perdió su
        // acceso y lo pide. Aquí sí se genera una credencial nueva, aunque
        // hubiera elegido método propio, y la anterior deja de valer.
        Response::ok(promotor_emitir_credenciales($pdo, $row, 'clave_promotor_reenvio', true));
    });

    /**
     * Vuelve a emitir el QR de acceso. El anterior deja de valer.
     *
     * Existe porque el QR se enseña UNA sola vez —en la base queda su hash— y
     * quien lo pierda se quedaría fuera. La otra salida, mandarle una clave por
     * correo, es exactamente lo que este método existe para evitar: el
     * organizador reemite el QR, lo enseña en pantalla o lo imprime, y se lo da
     * en mano en la feria.
     */
    $r->post('/admin/promotores/:id/qr', function (array $params) {
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

        $token = promotor_token_qr();
        // must_change_password a 0: un QR de 32 caracteres al azar ya es una
        // credencial fuerte, no una llave prestada que haya que cambiar.
        $pdo->prepare(
            'UPDATE promotores SET acceso_metodo = \'qr\', password_hash = :h, must_change_password = 0,
                                   password_expira_at = NULL, intentos_fallidos = 0, bloqueado_hasta = NULL,
                                   updated_at = CURRENT_TIMESTAMP
             WHERE id = :id'
        )->execute([':h' => Security::hashPassword($token), ':id' => $id]);

        Response::ok(promotor_qr_paquete((string) $row['email'], $token) + [
            'email'  => (string) $row['email'],
            'nombre' => (string) $row['nombre'],
        ]);
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

    // Aquí vivía PUT /admin/promotores/:id/stand, que permitía enganchar un
    // promotor a un stand cualquiera de la lista.
    //
    // Se quitó porque partía de una idea equivocada: un promotor y su stand
    // NO son dos cosas que haya que emparejar, son la misma. El stand nace al
    // aprobar la inscripción, con los datos que esa persona escribió, y a
    // partir de ahí el vínculo no es algo que se elija. Poder cambiarlo a mano
    // sólo servía para dejar dos promotores apuntando al mismo puesto, o a uno
    // que no era el suyo.
    //
    // Si un stand quedó mal, se corrige en el editor de stands.

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
function promotor_emitir_credenciales(\PDO $pdo, array $row, string $tipoCorreo, bool $forzarClave = false): array
{
    // Si el promotor eligió cómo entrar al inscribirse, se le RESPETA: generar
    // una clave temporal aquí borraría la suya y le dejaría dependiendo de un
    // correo que quizá no le llega, que es justo lo que quiso evitar. El correo
    // le confirma que ya está aprobado y le recuerda con qué entra.
    //
    // `$forzarClave` es para el botón de reenviar clave: ahí el organizador SÍ
    // quiere una credencial nueva, normalmente porque el promotor perdió la
    // suya y lo está pidiendo por teléfono.
    $metodo = (string) ($row['acceso_metodo'] ?? '');
    $conservaSuAcceso = !$forzarClave && $metodo !== '' && !empty($row['password_hash']);

    $clave = $conservaSuAcceso ? null : Security::generarClaveTemporal();
    $expira = $conservaSuAcceso ? null : date('Y-m-d H:i:s', time() + LMT_CLAVE_TEMPORAL_HORAS * 3600);
    $admin = Session::user();

    // El stand se crea AQUÍ, con lo que el promotor escribió al inscribirse.
    // Promotor y stand son la misma entidad: separarlos obligaría al
    // organizador a teclear otra vez unos datos que ya tiene delante.
    $stand = promotor_asegurar_stand($pdo, $row);

    if ($conservaSuAcceso) {
        // No se toca ni la credencial ni must_change_password: los eligió él.
        $pdo->prepare(
            'UPDATE promotores SET estado = \'verificado\', intentos_fallidos = 0, bloqueado_hasta = NULL,
                                   verificado_por = :adm, verificado_at = CURRENT_TIMESTAMP,
                                   stand_id = :sid, motivo = NULL, updated_at = CURRENT_TIMESTAMP
             WHERE id = :id'
        )->execute([
            ':adm' => $admin['id'] ?? null,
            ':sid' => $stand['id'] ?? null,
            ':id'  => (int) $row['id'],
        ]);
    } else {
        $pdo->prepare(
            'UPDATE promotores SET password_hash = :h, must_change_password = 1, password_expira_at = :exp,
                                   acceso_metodo = NULL,
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
    }

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

    $pl = Correos::credenciales(
        (string) $row['nombre'], (string) $row['email'], $clave,
        LMT_CLAVE_TEMPORAL_HORAS, $stand,
        $conservaSuAcceso ? promotor_acceso_etiqueta($metodo) : null
    );
    $enviado = Mailer::send((string) $row['email'], (string) $row['nombre'], $pl['asunto'], $pl['html'], $pl['texto'], $tipoCorreo, $adjuntos);

    $salida = [
        'estado'         => 'verificado',
        'correo_enviado' => $enviado,
        'expira_en'      => $expira,
        'stand_id'       => $stand['id'] ?? null,
        'acceso_propio'  => $conservaSuAcceso ? $metodo : null,
    ];
    if (!$enviado) {
        if ($conservaSuAcceso) {
            // Aquí no hay clave que entregar, y eso es precisamente lo bueno:
            // el promotor eligió su forma de entrar y ya puede hacerlo.
            $salida['aviso'] = 'El correo no pudo enviarse, pero este promotor ya puede entrar con '
                             . promotor_acceso_etiqueta($metodo) . '. Avísale de que su stand quedó aprobado.';
        } else {
            $salida['clave_temporal'] = $clave;
            $salida['aviso'] = 'El correo no pudo enviarse. Entrega esta clave al promotor por un canal seguro y revisa la configuración de correo.';
        }
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
                stand_nit, stand_sitio_web, logo_path, stand_lat, stand_lng,
                empresa_tentativa
         FROM promotores WHERE id = :id'
    );
    $sel->execute([':id' => $promotorId]);
    $p = $sel->fetch();
    if (!$p) return [];

    $nombreStand = (string) ($p['stand_nombre'] ?: $p['empresa_tentativa'] ?: $p['nombre']);
    // La región se vuelve a deducir aquí, no se copia: si el promotor corrige su
    // municipio más tarde, el stand queda coherente sin tocar nada más.
    $municipio   = \LMT\Territorio::municipio($p['municipio'] ?? null) ?? (string) ($p['municipio'] ?: 'Nariño');
    $region      = \LMT\Territorio::subregion($municipio) ?? ($p['stand_region'] ?: null);

    $datos = [
        ':nombre' => mb_substr($nombreStand, 0, 80, 'UTF-8'),
        ':mun'    => mb_substr($municipio, 0, 80, 'UTF-8'),
        ':reg'    => $region,
        ':dir'    => $p['stand_direccion'] ?: null,
        ':correo' => $p['email'],
        ':desc'   => $p['stand_descripcion'] ?: null,
        ':prop'   => $p['nombre'] ?: null,
        ':propdoc'=> $p['documento'] ?: null,
        ':nit'    => $p['stand_nit'] ?: null,
        ':web'    => $p['stand_sitio_web'] ?: null,
        ':logo'   => promotor_ruta_publica($p['logo_path'] ?? null),
        ':tel'    => $p['telefono'] ?: null,
        ':lat'    => $p['stand_lat'] !== null ? (float) $p['stand_lat'] : null,
        ':lng'    => $p['stand_lng'] !== null ? (float) $p['stand_lng'] : null,
    ];

    if (!empty($p['stand_id'])) {
        $pdo->prepare(
            'UPDATE stands SET nombre=:nombre, municipio=:mun, region=:reg, direccion=:dir,
                               correo=:correo, descripcion=:desc, propietario=:prop,
                               propietario_documento=:propdoc, nit=:nit, sitio_web=:web,
                               telefono=:tel, lat=COALESCE(:lat, lat), lng=COALESCE(:lng, lng),
                               logo_path=COALESCE(:logo, logo_path)
             WHERE id=:id'
        )->execute($datos + [':id' => $p['stand_id']]);
        return ['id' => (string) $p['stand_id'], 'nombre' => $datos[':nombre'], 'municipio' => $datos[':mun']];
    }

    $id = promotor_id_stand_libre($pdo, $nombreStand);
    $pdo->prepare(
        'INSERT INTO stands (id, nombre, municipio, region, direccion, correo, descripcion,
                             propietario, propietario_documento, nit, sitio_web, logo_path,
                             telefono, lat, lng, coords_x, coords_y, color)
         VALUES (:id, :nombre, :mun, :reg, :dir, :correo, :desc, :prop, :propdoc, :nit, :web,
                 :logo, :tel, :lat, :lng, 0.5, 0.5, :color)'
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
/**
 * Cómo entra un promotor que NO recibe el correo.
 * ==============================================
 *
 * El acceso normal es la clave temporal que se envía al verificar la
 * inscripción. Falla más de lo que parece: hay caficultores que dan un correo
 * que casi no abren, que lo escriben mal, o cuyo proveedor manda el mensaje a
 * spam. Cuando eso pasa se quedan fuera de su propio stand el día del evento y
 * hay que resolverlo por teléfono, uno a uno.
 *
 * Por eso, al inscribirse, cada promotor elige con qué va a entrar:
 *
 *   password    una clave que escribe él
 *   documento   la fecha de expedición de su cédula
 *   telefono    su número de teléfono, escrito dos veces
 *   qr          un código que genera el sistema y guarda en el móvil
 *
 * Sobre la fuerza de cada uno, sin adornos
 * ----------------------------------------
 * La fecha y el teléfono son credenciales DÉBILES: una fecha son unos pocos
 * miles de combinaciones y un teléfono es un dato semipúblico que además queda
 * guardado en claro en la misma ficha, porque es también un campo de contacto.
 * Se aceptan igual, porque el problema real que resuelven —quedarse fuera— es
 * más grave que el que introducen, y porque tres cosas los contienen:
 *
 *   1. Nada funciona hasta que un administrador verifica la inscripción. Antes
 *      de eso, acertar la credencial no abre nada.
 *   2. La cuenta se bloquea sola tras varios fallos (intentos_fallidos).
 *   3. Quien entra con fecha o teléfono está OBLIGADO a poner una clave de
 *      verdad antes de tocar nada. Son llaves para entrar, no para vivir con
 *      ellas.
 *
 * El QR no tiene ese problema: son 32 caracteres al azar, tanta entropía como
 * una contraseña larga. Es la mejor opción para quien no maneja correo.
 *
 * Se guarde lo que se guarde, va HASHEADO (Argon2id + pepper) en la misma
 * columna que cualquier contraseña. `acceso_metodo` sólo recuerda cuál de los
 * cuatro es, para etiquetar bien el formulario y redactar el correo.
 */
const PROMOTOR_ACCESOS = ['password', 'documento', 'telefono', 'qr'];

/** Métodos que obligan a poner una clave de verdad en cuanto entran. */
const PROMOTOR_ACCESOS_DEBILES = ['documento', 'telefono'];

/**
 * Normaliza la credencial según el método, para que al comparar dé igual cómo
 * la escriba la persona: «315 778 8990» y «3157788990» son el mismo teléfono, y
 * «4/3/2015» y «2015-03-04» la misma fecha.
 */
function promotor_credencial_normalizada(string $metodo, $valor): ?string
{
    if (!is_string($valor)) return null;
    $v = trim($valor);
    if ($v === '') return null;

    if ($metodo === 'telefono') {
        $d = preg_replace('/\D+/', '', $v) ?? '';
        // Un teléfono colombiano tiene 10 dígitos; se aceptan de 7 a 15 para no
        // dejar fuera fijos ni números con indicativo de país.
        return (strlen($d) >= 7 && strlen($d) <= 15) ? $d : null;
    }

    if ($metodo === 'documento') {
        // Se acepta ISO (del <input type=date>) y d/m/a, que es como la escribe
        // la gente aquí. Se guarda siempre en ISO.
        $f = \DateTimeImmutable::createFromFormat('!Y-m-d', $v)
          ?: \DateTimeImmutable::createFromFormat('!d/m/Y', $v)
          ?: \DateTimeImmutable::createFromFormat('!d-m-Y', $v);
        if (!$f) return null;
        $anio = (int) $f->format('Y');
        if ($anio < 1900 || $f->getTimestamp() > time()) return null;   // no hay cédulas del futuro
        return $f->format('Y-m-d');
    }

    if ($metodo === 'password') {
        return (mb_strlen($v, 'UTF-8') >= 8 && mb_strlen($v, 'UTF-8') <= 128) ? $v : null;
    }

    if ($metodo === 'qr') {
        $t = strtolower(preg_replace('/[^A-Za-z0-9]/', '', $v) ?? '');
        return strlen($t) === 32 ? $t : null;
    }

    return null;
}

/** Token del QR: 32 caracteres hexadecimales, como una contraseña larga. */
function promotor_token_qr(): string
{
    return bin2hex(random_bytes(16));
}

/**
 * URL que codifica el QR de acceso.
 *
 * Lleva el correo además del token porque el token por sí solo no identifica a
 * nadie: en la base sólo queda su hash y no se puede buscar por él. Es el QR de
 * esa persona y lo guarda ella, así que el correo no añade exposición.
 *
 * El host sale de Security::baseUrlPublica() y no de la cabecera Host: este QR
 * se guarda en el móvil y se escanea meses después; con el host manipulado
 * llevaría al sitio de otro a pedir la credencial.
 */
function promotor_qr_url(string $email, string $token): string
{
    return Security::baseUrlPublica() . '/promotor?correo=' . rawurlencode($email)
         . '&acceso=' . rawurlencode($token);
}

/**
 * PNG del QR de acceso, en bytes.
 *
 * Se genera en el SERVIDOR y no en el navegador por dos motivos: el generador
 * de QR vive aquí (no hay uno en JS) y el endpoint público /qr/{id}.png sólo
 * sabe de stands —darle texto libre lo convertiría en una fábrica de códigos
 * QR para cualquiera, que es media suplantación regalada—.
 *
 * Si la URL no cupiera en un QR (correos muy largos + subdirectorio hondo) se
 * codifica sólo el token: escanearlo no abre el portal solo, pero el código
 * sigue leyéndose y sirve para escribirlo como contraseña.
 */
function promotor_qr_bytes(string $email, string $token, int $escala = 6): ?string
{
    foreach ([promotor_qr_url($email, $token), $token] as $texto) {
        try {
            return \LMT\QrCode::png($texto, $escala, 4);
        } catch (\Throwable $e) {
            error_log('[lmt][promotores][qr-acceso] ' . $e->getMessage());
        }
    }
    return null;
}

/**
 * El QR de acceso listo para la respuesta JSON: token, URL e imagen incrustada
 * como data URI. Devuelve sólo lo que exista; si el PNG falla, el token en
 * letras basta para entrar.
 */
function promotor_qr_paquete(string $email, string $token): array
{
    $png = promotor_qr_bytes($email, $token);
    return array_filter([
        'qr_token' => $token,
        'qr_url'   => promotor_qr_url($email, $token),
        'qr_png'   => $png !== null ? 'data:image/png;base64,' . base64_encode($png) : null,
    ], fn($v) => $v !== null);
}

/** Cómo se llama cada método de cara a la persona. */
function promotor_acceso_etiqueta(?string $metodo): string
{
    return [
        'password'  => 'la contraseña que elegiste',
        'documento' => 'la fecha de expedición de tu documento',
        'telefono'  => 'tu número de teléfono',
        'qr'        => 'el código QR que guardaste',
    ][$metodo ?? ''] ?? 'la contraseña que te enviamos';
}

/**
 * Campo numérico opcional: vacío pasa, mal escrito NO pasa.
 *
 * Los validadores devuelven null tanto para «no lo puso» como para «puso algo
 * que no es un número», y guardar null en los dos casos hacía desaparecer el
 * dato sin avisar. Aquí se distinguen: sólo lo que llega vacío se queda vacío.
 */
function promotor_numero_opcional($valor, string $error, callable $validador): ?string
{
    if ($valor === null) return null;
    if (is_string($valor) && trim($valor) === '') return null;
    $v = $validador($valor);
    if ($v === null) Response::error(422, $error);
    return $v;
}

function promotor_logo_reclamado($valor): ?string
{
    if (!is_string($valor) || $valor === '') return null;
    if (!preg_match('#^uploads/inscripciones/[0-9a-f]{32}\.(jpg|png|webp)$#', $valor)) return null;
    $abs = Uploads::raiz() . '/' . substr($valor, strlen('uploads/'));
    return is_file($abs) ? $valor : null;
}

/**
 * Coordenadas del stand. Se aceptan sólo dentro del rectángulo que envuelve a
 * Nariño (con un margen): cualquier otra cosa es un error del cliente y
 * ensuciaría el mapa del festival sin que nadie lo note.
 */
function promotor_coordenadas($lat, $lng): array
{
    if (!is_numeric($lat) || !is_numeric($lng)) return [null, null];
    $la = (float) $lat; $lo = (float) $lng;
    if ($la < 0.2 || $la > 2.9 || $lo < -79.3 || $lo > -76.5) return [null, null];
    return [round($la, 6), round($lo, 6)];
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
                must_change_password, motivo, acceso_metodo,
                stand_nombre, stand_region, stand_direccion, stand_descripcion,
                stand_nit, stand_sitio_web, logo_path, stand_lat, stand_lng
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
            'acceso_metodo'     => (string) ($p['acceso_metodo'] ?? ''),
            'created_at'        => $p['created_at'] ?? null,
            'verificado_at'     => $p['verificado_at'] ?? null,
            'ultimo_acceso'     => $p['ultimo_acceso'] ?? null,
        ];
        // El borrador del stand: exactamente lo que se convertirá en stand al
        // aprobar. Se enseña para revisarlo ANTES, que es cuando se puede
        // corregir; después hay que ir al editor de stands a arreglarlo.
        $salida['stand_borrador'] = [
            'nombre'      => (string) ($p['stand_nombre'] ?: $p['empresa_tentativa'] ?: $p['nombre']),
            'municipio'   => (string) ($p['municipio'] ?? ''),
            'region'      => (string) ($p['stand_region'] ?? ''),
            'direccion'   => (string) ($p['stand_direccion'] ?? ''),
            'descripcion' => (string) ($p['stand_descripcion'] ?? ''),
            'nit'         => (string) ($p['stand_nit'] ?? ''),
            'sitio_web'   => (string) ($p['stand_sitio_web'] ?? ''),
            'correo'      => (string) $p['email'],
            'telefono'    => (string) ($p['telefono'] ?? ''),
            'propietario' => (string) $p['nombre'],
            'propietario_documento' => (string) ($p['documento'] ?? ''),
            'logo'        => promotor_ruta_publica($p['logo_path'] ?? null),
            'lat'         => $p['stand_lat'] !== null ? (float) $p['stand_lat'] : null,
            'lng'         => $p['stand_lng'] !== null ? (float) $p['stand_lng'] : null,
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
        // Con qué eligió entrar. El panel lo necesita para ofrecer «reemitir
        // el QR» sólo a quien entra con QR: a los demás no les diría nada.
        'acceso_metodo'     => (string) ($p['acceso_metodo'] ?? ''),
        'productos'         => (int) ($p['productos'] ?? 0),
        'must_change'       => (bool) $p['must_change_password'],
        'created_at'        => $p['created_at'] ?? null,
        'verificado_at'     => $p['verificado_at'] ?? null,
        'ultimo_acceso'     => $p['ultimo_acceso'] ?? null,
    ];
}
