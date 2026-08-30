<?php
defined('LMT_GUARD') || exit('forbidden');
use LMT\Db;
use LMT\Response;
use LMT\Validate;
use LMT\Security;

function register_routes_stands(\LMT\Router $r): void
{
    $r->get('/stands', function () {
        $rows = Db::pdo()->query(stand_select() . ' ORDER BY id')->fetchAll();
        $list = array_map(fn($s) => stand_row_to_api($s), $rows);
        Response::ok($list);
    });

    $r->get('/stands/:id', function (array $p) {
        $id = Validate::standId($p['id'] ?? null);
        if (!$id) Response::error(400, 'bad_id');
        $stmt = Db::pdo()->prepare(stand_select() . ' WHERE id = :id');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        if (!$row) Response::error(404, 'not_found');
        Response::ok(stand_row_to_api($row));
    });

    $r->post('/stands', function () {
        Security::requireAdmin();
        $b = Security::jsonBody();
        $stand = stand_payload($b, true);
        $stmt = Db::pdo()->prepare(
            'INSERT INTO stands (id, nombre, municipio, region, direccion, correo, descripcion,
                                 propietario, propietario_documento, nit, sitio_web, logo_path,
                                 telefono, lat, lng, numero, tipo_organizacion, tipo_organizacion_otro,
                                 actividad_cafe, actividad_cafe_otro,
                                 poblacion, poblacion_otro, linea_productiva, cert_internacional, organico, especial, promedio_taza, marca_registrada, camara_comercio, camara_comercio_numero, invima, invima_detalle, manipulacion_alimentos, presentacion, presentacion_otro,
                                 coords_x, coords_y, color)
             VALUES (:id, :nombre, :municipio, :region, :direccion, :correo, :descripcion,
                     :prop, :propdoc, :nit, :web, :logo, :tel, :lat, :lng, :numero,
                     :torg, :torgo, :act, :acto,
                     :poblacion, :poblacion_otro, :linea_productiva, :cert_internacional, :organico, :especial, :promedio_taza, :marca_registrada, :camara_comercio, :camara_comercio_numero, :invima, :invima_detalle, :manipulacion_alimentos, :presentacion, :presentacion_otro,
                     :cx, :cy, :color)'
        );
        $stmt->execute([
            ':id'          => $stand['id'],
            ':nombre'      => $stand['nombre'],
            ':municipio'   => $stand['municipio'],
            ':region'      => $stand['region'],
            ':direccion'   => $stand['direccion'],
            ':correo'      => $stand['correo'],
            ':descripcion' => $stand['descripcion'],
            ':prop'        => $stand['propietario'],
            ':propdoc'     => $stand['propietario_documento'],
            ':nit'         => $stand['nit'],
            ':web'         => $stand['sitio_web'],
            ':logo'        => $stand['logo_path'],
            ':tel'         => $stand['telefono'],
            ':lat'         => $stand['lat'],
            ':lng'         => $stand['lng'],
            ':numero'      => $stand['numero'] !== '' ? $stand['numero'] : null,
            ':torg'        => $stand['tipo_organizacion'],
            ':torgo'       => $stand['tipo_organizacion_otro'],
            ':act'         => $stand['actividad_cafe'],
            ':acto'        => $stand['actividad_cafe_otro'],
            ':poblacion' => $stand['poblacion'],
            ':poblacion_otro' => $stand['poblacion_otro'],
            ':linea_productiva' => $stand['linea_productiva'],
            ':cert_internacional' => $stand['cert_internacional'],
            ':organico' => $stand['organico'],
            ':especial' => $stand['especial'],
            ':promedio_taza' => $stand['promedio_taza'],
            ':marca_registrada' => $stand['marca_registrada'],
            ':camara_comercio' => $stand['camara_comercio'],
            ':camara_comercio_numero' => $stand['camara_comercio_numero'],
            ':invima' => $stand['invima'],
            ':invima_detalle' => $stand['invima_detalle'],
            ':manipulacion_alimentos' => $stand['manipulacion_alimentos'],
            ':presentacion' => $stand['presentacion'],
            ':presentacion_otro' => $stand['presentacion_otro'],
            ':cx'          => $stand['coords_x'],
            ':cy'          => $stand['coords_y'],
            ':color'       => $stand['color'],
        ]);
        Response::ok(['id' => $stand['id']]);
    });

    $r->put('/stands/:id', function (array $p) {
        Security::requireAdmin();
        $id = Validate::standId($p['id'] ?? null);
        if (!$id) Response::error(400, 'bad_id');
        $b = Security::jsonBody();
        $stand = stand_payload($b, false);
        // El logo se conserva si la petición no trae uno nuevo: el editor
        // manda el formulario entero y, sin el COALESCE, guardar cualquier
        // cambio de texto borraba la imagen que había subido el promotor.
        $stmt = Db::pdo()->prepare(
            'UPDATE stands SET nombre=:nombre, municipio=:municipio, region=:region,
                                direccion=:direccion, correo=:correo, descripcion=:descripcion,
                                propietario=:prop, propietario_documento=:propdoc,
                                nit=:nit, sitio_web=:web, logo_path=COALESCE(:logo, logo_path),
                                telefono=:tel, lat=:lat, lng=:lng, numero=:numero,
                                tipo_organizacion=:torg, tipo_organizacion_otro=:torgo,
                                actividad_cafe=:act, actividad_cafe_otro=:acto,
                                poblacion=:poblacion,
                                poblacion_otro=:poblacion_otro,
                                linea_productiva=:linea_productiva,
                                cert_internacional=:cert_internacional,
                                organico=:organico,
                                especial=:especial,
                                promedio_taza=:promedio_taza,
                                marca_registrada=:marca_registrada,
                                camara_comercio=:camara_comercio,
                                camara_comercio_numero=:camara_comercio_numero,
                                invima=:invima,
                                invima_detalle=:invima_detalle,
                                manipulacion_alimentos=:manipulacion_alimentos,
                                presentacion=:presentacion,
                                presentacion_otro=:presentacion_otro,
                                coords_x=:cx, coords_y=:cy, color=:color
             WHERE id=:id'
        );
        $stmt->execute([
            ':nombre'      => $stand['nombre'],
            ':municipio'   => $stand['municipio'],
            ':region'      => $stand['region'],
            ':direccion'   => $stand['direccion'],
            ':correo'      => $stand['correo'],
            ':descripcion' => $stand['descripcion'],
            ':prop'        => $stand['propietario'],
            ':propdoc'     => $stand['propietario_documento'],
            ':nit'         => $stand['nit'],
            ':web'         => $stand['sitio_web'],
            ':logo'        => $stand['logo_path'],
            ':tel'         => $stand['telefono'],
            ':lat'         => $stand['lat'],
            ':lng'         => $stand['lng'],
            ':numero'      => $stand['numero'] !== '' ? $stand['numero'] : null,
            ':torg'        => $stand['tipo_organizacion'],
            ':torgo'       => $stand['tipo_organizacion_otro'],
            ':act'         => $stand['actividad_cafe'],
            ':acto'        => $stand['actividad_cafe_otro'],
            ':poblacion' => $stand['poblacion'],
            ':poblacion_otro' => $stand['poblacion_otro'],
            ':linea_productiva' => $stand['linea_productiva'],
            ':cert_internacional' => $stand['cert_internacional'],
            ':organico' => $stand['organico'],
            ':especial' => $stand['especial'],
            ':promedio_taza' => $stand['promedio_taza'],
            ':marca_registrada' => $stand['marca_registrada'],
            ':camara_comercio' => $stand['camara_comercio'],
            ':camara_comercio_numero' => $stand['camara_comercio_numero'],
            ':invima' => $stand['invima'],
            ':invima_detalle' => $stand['invima_detalle'],
            ':manipulacion_alimentos' => $stand['manipulacion_alimentos'],
            ':presentacion' => $stand['presentacion'],
            ':presentacion_otro' => $stand['presentacion_otro'],
            ':cx'          => $stand['coords_x'],
            ':cy'          => $stand['coords_y'],
            ':color'       => $stand['color'],
            ':id'          => $id,
        ]);
        Response::ok(null);
    });

    /**
     * Logo del stand subido desde el panel. Devuelve la ruta; el editor la
     * manda después en el PUT/POST del stand. Se separa de la escritura del
     * stand porque el editor de un stand NUEVO todavía no tiene id.
     */
    $r->post('/stands/logo', function () {
        Security::requireAdmin();
        if (empty($_FILES['archivo']) || !is_array($_FILES['archivo'])) {
            Response::error(422, 'archivo_ausente');
        }
        try {
            $ruta = \LMT\Uploads::imagen($_FILES['archivo'], 'stands');
        } catch (\RuntimeException $e) {
            Response::error(422, $e->getMessage());
        }
        Response::ok([
            'logo'      => $ruta,
            'max_bytes' => \LMT\Uploads::maxBytes(),
            'max_dim'   => \LMT\Uploads::maxDim(),
        ]);
    });

    /**
     * Dónde acaban las imágenes que sube la gente.
     *
     * El organizador necesita saberlo para hacer copia de seguridad, para
     * mirarlas por FTP y para entender por qué una subida falla (carpeta llena
     * o sin permiso de escritura). Es información del servidor: sólo para
     * administración.
     */
    $r->get('/admin/uploads', function () {
        Security::requireAdmin();
        $dir = \LMT\Uploads::raiz();
        $carpetas = [];
        foreach (['stands', 'inscripciones', 'promotores', 'pasaporte', 'visitantes'] as $sub) {
            $ruta = $dir . '/' . $sub;
            $n = 0; $bytes = 0;
            if (is_dir($ruta)) {
                foreach (glob($ruta . '/*.{jpg,png,webp}', GLOB_BRACE) ?: [] as $f) {
                    $n++; $bytes += (int) @filesize($f);
                }
            }
            $carpetas[] = [
                'nombre'    => $sub,
                'ruta'      => $ruta,
                'existe'    => is_dir($ruta),
                'escribible'=> is_dir($ruta) && is_writable($ruta),
                'archivos'  => $n,
                'bytes'     => $bytes,
            ];
        }
        Response::ok([
            'dir'        => $dir,
            'escribible' => is_dir($dir) && is_writable($dir),
            'url_base'   => rtrim(Security::baseUrlPublica(), '/') . '/uploads/',
            'max_bytes'  => \LMT\Uploads::maxBytes(),
            'max_dim'    => \LMT\Uploads::maxDim(),
            'protegida'  => is_file($dir . '/.htaccess'),
            // Cuántas imágenes no puede leer el servidor web. Es la respuesta a
            // «subí el logo y sale roto»: en un hosting compartido, PHP escribe
            // con un usuario y Apache sirve los estáticos con otro.
            'permisos'   => \LMT\Uploads::auditarPermisos(),
            'carpetas'   => $carpetas,
        ]);
    });

    /**
     * Corrige los permisos de todo lo que ya está subido.
     *
     * Cambiar el código no arregla los ficheros que ya están en disco con los
     * permisos antiguos, y quien administra el festival no tiene por qué entrar
     * por SSH a hacer un chmod. Es idempotente.
     */
    $r->post('/admin/uploads/permisos', function () {
        Security::requireAdmin();
        Response::ok(\LMT\Uploads::repararPermisos() + ['permisos' => \LMT\Uploads::auditarPermisos()]);
    });

    $r->delete('/stands/:id', function (array $p) {
        Security::requireAdmin();
        $id = Validate::standId($p['id'] ?? null);
        if (!$id) Response::error(400, 'bad_id');
        $stmt = Db::pdo()->prepare('DELETE FROM stands WHERE id=:id');
        $stmt->execute([':id' => $id]);
        Response::ok(null);
    });
}

/**
 * Proyección de un stand hacia el cliente.
 *
 * El correo y la dirección del caficultor son datos de contacto de una persona
 * concreta (Ley 1581/2012) y salían en el GET /stands público: bastaba una
 * petición sin sesión para llevarse el directorio completo de participantes y
 * montar una campaña de phishing dirigida. Ahora sólo viajan si quien pregunta
 * es administrador; el resto del contenido (nombre, municipio, descripción,
 * votos) sigue siendo público porque es el propósito del festival.
 */
function stand_row_to_api(array $r): array
{
    $esAdmin = \LMT\Session::isAdminPleno();
    return [
        'id'          => $r['id'],
        'nombre'      => $r['nombre'],
        'municipio'   => $r['municipio'],
        'region'      => $r['region'] ?? '',
        'direccion'   => $esAdmin ? ($r['direccion'] ?? '') : '',
        'correo'      => $esAdmin ? ($r['correo'] ?? '') : '',
        'descripcion' => $r['descripcion'] ?? '',
        // Los mismos campos que rellena el promotor al inscribirse: un stand y
        // su promotor son la misma cosa y el panel edita lo mismo que él envió.
        // El nombre y el documento del propietario identifican a una persona,
        // así que siguen la regla del correo y la dirección.
        'propietario'           => $esAdmin ? (string) ($r['propietario'] ?? '') : '',
        'propietario_documento' => $esAdmin ? (string) ($r['propietario_documento'] ?? '') : '',
        'nit'         => (string) ($r['nit'] ?? ''),
        'sitio_web'   => (string) ($r['sitio_web'] ?? ''),
        'telefono'    => $esAdmin ? (string) ($r['telefono'] ?? '') : '',
        'logo'        => stand_ruta_publica($r['logo_path'] ?? null),
        // Caracterización del participante. Es información del emprendimiento,
        // no de la persona, así que no se esconde: sale igual en la ficha
        // pública, donde ayuda al visitante a saber qué va a encontrar.
        'tipo_organizacion'      => (string) ($r['tipo_organizacion'] ?? ''),
        'tipo_organizacion_otro' => (string) ($r['tipo_organizacion_otro'] ?? ''),
        'actividad_cafe'         => (string) ($r['actividad_cafe'] ?? ''),
        'actividad_cafe_otro'    => (string) ($r['actividad_cafe_otro'] ?? ''),
        // Número que la organización asignó en el recinto. Público: es lo que
        // el visitante busca en el mapa impreso del festival.
        'numero'                 => (string) ($r['numero'] ?? ''),
        // Ficha del participante. La población es un dato sensible de la
        // PERSONA (Ley 1581/2012) y sólo viaja al panel; el resto describe el
        // producto y sale también en la ficha pública, que es donde ayuda a
        // decidir a qué espacio ir.
        'poblacion'              => $esAdmin ? (string) ($r['poblacion'] ?? '') : '',
        'poblacion_otro'         => $esAdmin ? (string) ($r['poblacion_otro'] ?? '') : '',
        'linea_productiva'       => \LMT\Catalogos::listaDe($r['linea_productiva'] ?? null),
        'presentacion'           => \LMT\Catalogos::listaDe($r['presentacion'] ?? null),
        'presentacion_otro'      => (string) ($r['presentacion_otro'] ?? ''),
        'cert_internacional'     => stand_si_no($r['cert_internacional'] ?? null),
        'organico'               => stand_si_no($r['organico'] ?? null),
        'especial'               => stand_si_no($r['especial'] ?? null),
        'promedio_taza'          => (string) ($r['promedio_taza'] ?? ''),
        // Los requisitos administrativos son gestión interna: al público no le
        // dicen nada y delatan quién tiene los papeles al día.
        'marca_registrada'       => $esAdmin ? stand_si_no($r['marca_registrada'] ?? null) : null,
        'camara_comercio'        => $esAdmin ? stand_si_no($r['camara_comercio'] ?? null) : null,
        'camara_comercio_numero' => $esAdmin ? (string) ($r['camara_comercio_numero'] ?? '') : '',
        'invima'                 => $esAdmin ? stand_si_no($r['invima'] ?? null) : null,
        'invima_detalle'         => $esAdmin ? (string) ($r['invima_detalle'] ?? '') : '',
        'manipulacion_alimentos' => $esAdmin ? stand_si_no($r['manipulacion_alimentos'] ?? null) : null,
        // La ubicación del stand SÍ es pública: es lo que se pinta en el mapa
        // del festival y lo que un visitante necesita para llegar.
        'lat'         => isset($r['lat']) && $r['lat'] !== null ? (float) $r['lat'] : null,
        'lng'         => isset($r['lng']) && $r['lng'] !== null ? (float) $r['lng'] : null,
        'coords'      => [
            'x' => isset($r['coords_x']) ? (float)$r['coords_x'] : 0.5,
            'y' => isset($r['coords_y']) ? (float)$r['coords_y'] : 0.5,
        ],
        'color'       => $r['color'] ?? 'oklch(0.45 0.1 40)',
        'votos'       => [
            'bueno'   => (int)($r['votos_bueno']   ?? 0),
            'regular' => (int)($r['votos_regular'] ?? 0),
            'malo'    => (int)($r['votos_malo']    ?? 0),
        ],
        // Promedio de las tres valoraciones. Llega ya calculado desde la
        // consulta cuando quien pregunta las necesita (el listado y el
        // recorrido); en un stand suelto puede no venir, y entonces es null.
        'estrellas'   => [
            'innovacion' => stand_promedio($r['est_innovacion'] ?? null),
            'atencion'   => stand_promedio($r['est_atencion']   ?? null),
            'calidad'    => stand_promedio($r['est_calidad']    ?? null),
            'n'          => (int) ($r['est_n'] ?? 0),
        ],
    ];
}

/**
 * Un «sí/no» de la base tal y como lo espera el cliente.
 *
 * Devuelve true, false o null, y el null importa: significa «no contestó», que
 * no es lo mismo que «no». Un `(bool)` a secas convertiría las dos cosas en
 * false y publicaría como «no orgánico» un café del que nadie sabe nada.
 */
function stand_si_no($v): ?bool
{
    return ($v === null || $v === '') ? null : (bool) (int) $v;
}

/** Media a un decimal, o null si nadie ha puntuado todavía. */
function stand_promedio($valor): ?float
{
    if ($valor === null || $valor === '') return null;
    return round((float) $valor, 1);
}

/**
 * Las columnas de un stand, en un solo sitio.
 *
 * Ya han hecho falta tres arreglos por lo mismo: /stands y /dashboard tenían
 * cada uno su lista escrita a mano y se separaban. La última vez, el panel
 * abría el editor con el propietario y el NIT en blanco y el primer «Guardar»
 * los borraba de la base. Quien añada una columna la añade AQUÍ y aparece en
 * los dos sitios.
 */
function stand_select(string $tabla = 'stands'): string
{
    return 'SELECT id, nombre, municipio, region, direccion, correo, descripcion,
                   propietario, propietario_documento, nit, sitio_web, logo_path,
                   telefono, lat, lng, numero,
                   tipo_organizacion, tipo_organizacion_otro,
                   actividad_cafe, actividad_cafe_otro,
                   poblacion, poblacion_otro, linea_productiva, cert_internacional, organico, especial, promedio_taza, marca_registrada, camara_comercio, camara_comercio_numero, invima, invima_detalle, manipulacion_alimentos, presentacion, presentacion_otro,
                   coords_x, coords_y, color, votos_bueno, votos_regular, votos_malo'
         . stand_select_estrellas($tabla)
         . ' FROM ' . $tabla;
}

/**
 * Trozo de SELECT con las medias de estrellas por stand.
 *
 * Se calcula al vuelo y no en columnas acumuladas como los emoji: son tres
 * medias sobre miles de filas como mucho, y llevar seis contadores más al día
 * en cada voto es donde aparecen las incoherencias cuando algo falla a medias.
 */
function stand_select_estrellas(string $alias = 's'): string
{
    return ", (SELECT AVG(est_innovacion) FROM votos WHERE stand_id = {$alias}.id) AS est_innovacion"
         . ", (SELECT AVG(est_atencion)   FROM votos WHERE stand_id = {$alias}.id) AS est_atencion"
         . ", (SELECT AVG(est_calidad)    FROM votos WHERE stand_id = {$alias}.id) AS est_calidad"
         . ", (SELECT COUNT(est_calidad)  FROM votos WHERE stand_id = {$alias}.id) AS est_n";
}

function stand_payload(array $b, bool $needsId): array
{
    $id = $needsId ? Validate::standId($b['id'] ?? null) : null;
    if ($needsId && !$id) Response::error(400, 'bad_id');

    $nombre    = trim((string)($b['nombre'] ?? ''));
    if ($nombre === '' || mb_strlen($nombre, 'UTF-8') > 80) Response::error(422, 'bad_nombre');

    // Municipio contra el catálogo del DANE y región DEDUCIDA de él: así no
    // pueden contradecirse, que era el problema de tenerlos como texto libre.
    $municipio = \LMT\Territorio::municipio($b['municipio'] ?? null);
    if ($municipio === null) Response::error(422, 'bad_municipio');
    $region    = (string) \LMT\Territorio::subregion($municipio);
    // La dirección es obligatoria: el mapa marca un punto, la dirección dice a
    // qué puerta se llega. Sin ella el visitante ve una chincheta en un cerro.
    $direccion = mb_substr(trim((string)($b['direccion'] ?? '')), 0, 255, 'UTF-8');
    if ($direccion === '') Response::error(422, 'direccion_requerida');
    $descripcion = Validate::comment((string)($b['descripcion'] ?? ''), 800);
    $correo    = Validate::email($b['correo'] ?? null) ?? '';

    // Opcionales, pero si se escriben tienen que ser números: guardar null
    // porque venían mal borraba el dato sin decírselo a nadie.
    $telefono              = stand_numero_opcional($b['telefono'] ?? null, 'telefono_invalido', [Validate::class, 'telefono']);
    // Mismo criterio que en la inscripción: fuera del rectángulo de Nariño no
    // se guarda nada, porque sólo puede ser un error.
    $lat = is_numeric($b['lat'] ?? null) ? (float) $b['lat'] : null;
    $lng = is_numeric($b['lng'] ?? null) ? (float) $b['lng'] : null;
    if ($lat === null || $lng === null || $lat < 0.2 || $lat > 2.9 || $lng < -79.3 || $lng > -76.5) {
        $lat = null; $lng = null;
    }
    $propietario           = Validate::nombre($b['propietario'] ?? null, 120);
    $propietario_documento = stand_numero_opcional($b['propietario_documento'] ?? null, 'documento_invalido', [Validate::class, 'documento']);
    $nit                   = stand_numero_opcional($b['nit'] ?? null, 'nit_invalido', [Validate::class, 'documento']);
    $sitio_web             = Validate::url($b['sitio_web'] ?? null, 255);
    // null = "no toques el logo". El UPDATE lo trata con COALESCE.
    $logo_path             = stand_logo_reclamado($b['logo'] ?? null);

    // Caracterización del participante. Aquí es OPCIONAL, al revés que en la
    // inscripción: los espacios creados antes de que existieran estos campos
    // se siguen pudiendo editar sin obligar a inventarse el dato.
    [$tipo_organizacion, $tipo_organizacion_otro] = promotor_catalogo(
        $b['tipo_organizacion'] ?? null, $b['tipo_organizacion_otro'] ?? null,
        \LMT\Catalogos::ORGANIZACION, 'tipo_organizacion_invalido', false
    );
    [$actividad_cafe, $actividad_cafe_otro] = promotor_catalogo(
        $b['actividad_cafe'] ?? null, $b['actividad_cafe_otro'] ?? null,
        \LMT\Catalogos::ACTIVIDAD, 'actividad_cafe_invalida', false
    );

    // Población, línea productiva y ficha detallada. Aquí NADA es obligatorio,
    // al revés que en la inscripción: los espacios que ya existían no tienen
    // estos datos y hay que poder seguir editando su nombre sin inventárselos.
    try {
        $ficha = \LMT\Catalogos::ficha($b, false);
    } catch (\RuntimeException $e) {
        Response::error(422, $e->getMessage());
    }

    // Número del espacio en el recinto. Lo asigna la organización, así que sólo
    // se acepta desde aquí y nunca desde la inscripción pública.
    $numero = mb_substr(trim((string) ($b['numero'] ?? '')), 0, 16, 'UTF-8');
    if ($numero !== '' && !preg_match('/\A[\p{L}0-9 .\-]{1,16}\z/u', $numero)) {
        Response::error(422, 'numero_invalido');
    }

    $color = (string)($b['color'] ?? 'oklch(0.45 0.1 40)');
    if (!preg_match('/^oklch\([^)]{1,80}\)$/i', $color) && !preg_match('/^#[0-9a-f]{3,8}$/i', $color)) {
        $color = 'oklch(0.45 0.1 40)';
    }

    $cx = isset($b['coords']['x']) ? (float)$b['coords']['x'] : 0.5;
    $cy = isset($b['coords']['y']) ? (float)$b['coords']['y'] : 0.5;
    $cx = max(0.0, min(1.0, $cx));
    $cy = max(0.0, min(1.0, $cy));

    return compact(
        'id', 'nombre', 'municipio', 'region', 'direccion', 'correo', 'descripcion', 'color',
        'propietario', 'propietario_documento', 'nit', 'sitio_web', 'logo_path',
        'telefono', 'lat', 'lng', 'numero',
        'tipo_organizacion', 'tipo_organizacion_otro', 'actividad_cafe', 'actividad_cafe_otro'
    ) + ['coords_x' => $cx, 'coords_y' => $cy] + $ficha;
}

/** Ruta de imagen que se puede devolver al cliente, o null. */
/** Campo numérico opcional: vacío pasa, mal escrito no. Ver promotores.php. */
function stand_numero_opcional($valor, string $error, callable $validador): ?string
{
    if ($valor === null) return null;
    if (is_string($valor) && trim($valor) === '') return null;
    $v = $validador($valor);
    if ($v === null) Response::error(422, $error);
    return $v;
}

function stand_ruta_publica(?string $ruta): ?string
{
    if (!is_string($ruta) || $ruta === '') return null;
    // Lo que subió su promotor.
    if (preg_match('#^uploads/[a-z0-9/_-]+/[0-9a-f]{32}\.(jpg|png|webp)$#', $ruta)) return $ruta;
    // Los emblemas de ejemplo de los stands del prototipo (db/seed.sql). Van
    // en el repositorio, no en uploads/: nadie los sube ni los puede escribir,
    // así que basta con reconocer la forma exacta del nombre.
    if (preg_match('#^assets/logos/[a-z0-9-]{2,32}\.png$#', $ruta)) return $ruta;
    return null;
}

/**
 * Logo que el editor dice haber subido.
 *
 * Se acepta sólo una ruta con la forma exacta que produce Uploads::imagen() y
 * que además exista en disco: sin la comprobación, un administrador —o quien
 * le robara la sesión— podría apuntar logo_path a cualquier fichero del
 * servidor y luego pedirlo por HTTP.
 */
function stand_logo_reclamado($valor): ?string
{
    if (!is_string($valor) || $valor === '') return null;
    if (!preg_match('#^uploads/(stands|inscripciones|logos)/[0-9a-f]{32}\.(jpg|png|webp)$#', $valor)) return null;
    $abs = \LMT\Uploads::raiz() . '/' . substr($valor, strlen('uploads/'));
    return is_file($abs) ? $valor : null;
}
