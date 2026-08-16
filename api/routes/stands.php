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
                                 telefono, lat, lng, coords_x, coords_y, color)
             VALUES (:id, :nombre, :municipio, :region, :direccion, :correo, :descripcion,
                     :prop, :propdoc, :nit, :web, :logo, :tel, :lat, :lng, :cx, :cy, :color)'
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
                                telefono=:tel, lat=:lat, lng=:lng,
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
        foreach (['stands', 'inscripciones', 'promotores'] as $sub) {
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
            'carpetas'   => $carpetas,
        ]);
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
                   telefono, lat, lng,
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
    $direccion = mb_substr(trim((string)($b['direccion'] ?? '')), 0, 255, 'UTF-8');
    $descripcion = Validate::comment((string)($b['descripcion'] ?? ''), 800);
    $correo    = Validate::email($b['correo'] ?? null) ?? '';

    $telefono              = Validate::telefono($b['telefono'] ?? null);
    // Mismo criterio que en la inscripción: fuera del rectángulo de Nariño no
    // se guarda nada, porque sólo puede ser un error.
    $lat = is_numeric($b['lat'] ?? null) ? (float) $b['lat'] : null;
    $lng = is_numeric($b['lng'] ?? null) ? (float) $b['lng'] : null;
    if ($lat === null || $lng === null || $lat < 0.2 || $lat > 2.9 || $lng < -79.3 || $lng > -76.5) {
        $lat = null; $lng = null;
    }
    $propietario           = Validate::nombre($b['propietario'] ?? null, 120);
    $propietario_documento = Validate::documento($b['propietario_documento'] ?? null);
    $nit                   = Validate::documento($b['nit'] ?? null);
    $sitio_web             = Validate::url($b['sitio_web'] ?? null, 255);
    // null = "no toques el logo". El UPDATE lo trata con COALESCE.
    $logo_path             = stand_logo_reclamado($b['logo'] ?? null);

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
        'telefono', 'lat', 'lng'
    ) + ['coords_x' => $cx, 'coords_y' => $cy];
}

/** Ruta de imagen que se puede devolver al cliente, o null. */
function stand_ruta_publica(?string $ruta): ?string
{
    if (!is_string($ruta) || $ruta === '') return null;
    return preg_match('#^uploads/[a-z0-9/_-]+/[0-9a-f]{32}\.(jpg|png|webp)$#', $ruta) ? $ruta : null;
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
