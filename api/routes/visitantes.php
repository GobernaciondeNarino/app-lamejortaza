<?php
defined('LMT_GUARD') || exit('forbidden');

use LMT\Db;
use LMT\Response;
use LMT\Validate;
use LMT\Security;
use LMT\Config;
use LMT\RateLimit;
use LMT\Mailer;
use LMT\Correos;

/**
 * Perfil del visitante.
 *
 * Quien vota deja su correo y nada más. Este módulo le ofrece —siempre de
 * forma voluntaria— completar unos datos que permiten caracterizar al público
 * del festival: de dónde viene, si asiste por una entidad, grupo étnico, si
 * tiene alguna discapacidad, qué espera del evento.
 *
 * Cómo se prueba que el perfil es tuyo
 * ------------------------------------
 * El visitante no tiene contraseña, así que el correo por sí solo no puede
 * abrir un perfil: si bastara con escribirlo, cualquiera podría leer a qué
 * grupo étnico pertenece un vecino. Al votar se emite un testigo
 *
 *     HMAC-SHA256(app_secret, 'perfil|' + correo)
 *
 * que viaja al navegador de quien acaba de demostrar que controla ese correo
 * en el mismo acto de votar, y se guarda ahí. Sin el testigo no se lee ni se
 * escribe nada. Quien lo pierda (otro teléfono, otro navegador) puede pedir el
 * enlace por correo: llega al buzón, que es la prueba de propiedad de verdad.
 *
 * Ley 1581 de 2012
 * ----------------
 * El grupo étnico y la discapacidad son datos sensibles: su tratamiento exige
 * autorización explícita y NUNCA puede ser obligatorio. Por eso todo campo
 * admite 'prefiero_no_decir', nada es obligatorio, la casilla de autorización
 * se pide aparte y el visitante puede borrar su perfil entero.
 */

/** Catálogos cerrados: lo que no esté aquí no entra en la base. */
const VISITANTE_OPCIONES = [
    'genero'         => ['hombre', 'mujer', 'otro', 'prefiero_no_decir'],
    'rango_edad'     => ['menor_18', '18_25', '26_35', '36_45', '46_60', 'mayor_60', 'prefiero_no_decir'],
    'tipo_visitante' => ['publica', 'privada', 'academica', 'gremio', 'particular', 'otro', 'prefiero_no_decir'],
    'grupo_etnico'   => ['indigena', 'afrodescendiente', 'raizal', 'palenquero', 'rrom', 'ninguno', 'prefiero_no_decir'],
    'discapacidad'   => ['fisica', 'visual', 'auditiva', 'intelectual', 'psicosocial', 'multiple', 'ninguna', 'prefiero_no_decir'],
    'como_se_entero' => ['redes', 'radio', 'television', 'prensa', 'voz_a_voz', 'institucion', 'otro'],
];

/**
 * Emojis que puede elegir el visitante como retrato.
 *
 * Es un catálogo cerrado a propósito: los que tienen que ver con el café, la
 * montaña y la gente del festival. Suficiente para reconocerse sin abrir la
 * puerta a cualquier carácter.
 */
const VISITANTE_EMOJIS = [
    '☕', '🫖', '🍵', '🌱', '🌿', '🌰', '🏔️', '🌋', '🌄', '🌻',
    '😀', '😎', '🤠', '🥸', '🤓', '🧑‍🌾', '👩‍🌾', '👨‍🌾', '🧑‍🍳', '👵',
    '🐝', '🦜', '🐞', '🦋', '🐈', '🐕', '⭐', '🔥', '❤️', '🎒',
];

function register_routes_visitantes(\LMT\Router $r): void
{
    /** Catálogos para pintar el formulario sin duplicar las listas en el JS. */
    $r->get('/visitantes/opciones', function () {
        Response::ok(['opciones' => VISITANTE_OPCIONES, 'emojis' => VISITANTE_EMOJIS]);
    });

    /**
     * La puerta del ciudadano: correo dentro, testigo fuera.
     *
     * Escribir el correo basta. Es una decisión del festival y conviene decir
     * en qué consiste: quien conozca el correo de otra persona puede abrir su
     * pasaporte y su caracterización. Se acepta porque la alternativa —una
     * contraseña para todo el mundo— dejaba fuera a la mayor parte del público
     * de una feria de dos días, y porque quien quiera cerrarlo tiene la clave
     * opcional a un toque dentro de su propio perfil (PUT /visitantes/clave).
     *
     * Con clave puesta, esto ya no la abre: hay que escribirla.
     */
    $r->post('/visitantes/acceso', function () {
        $b = Security::jsonBody();
        $correo = Validate::email($b['correo'] ?? null);
        $clave  = is_string($b['clave'] ?? null) ? $b['clave'] : '';
        if (!$correo) Response::error(422, 'correo_invalido');
        // Dos límites: uno por IP, contra quien pruebe correos en serie, y otro
        // por correo, contra quien pruebe claves de una persona concreta desde
        // muchas IP.
        if (!RateLimit::hit('perfil_acceso', RateLimit::ipHash())) Response::error(429, 'rate_limited');
        if (!RateLimit::hit('perfil_acceso_correo', hash('sha256', $correo))) Response::error(429, 'rate_limited');

        $stmt = Db::pdo()->prepare('SELECT acceso_hash FROM visitantes WHERE correo = :c');
        $stmt->execute([':c' => $correo]);
        $hash = (string) ($stmt->fetchColumn() ?: '');

        if ($hash !== '') {
            // Sin clave no es un error todavía: el formulario aún no sabía que
            // este perfil la tenía. Se le pide y vuelve.
            if ($clave === '') Response::ok(['protegido' => true, 'token' => null]);
            if (!Security::verifyPassword($clave, $hash)) {
                usleep(random_int(150000, 350000));
                Response::error(403, 'clave_incorrecta');
            }
        }

        Response::ok(['protegido' => $hash !== '', 'token' => visitante_token($correo)]);
    });

    /**
     * Poner, cambiar o quitar la clave opcional del perfil.
     *
     * Quien ya tiene una debe escribirla para tocarla, aunque traiga testigo
     * válido: hasta que hubo clave, el testigo se conseguía con sólo el correo,
     * y quedan por ahí testigos viejos en otros navegadores. Aceptarlos aquí
     * dejaría la protección abierta desde fuera justo el día que se pone.
     */
    $r->put('/visitantes/clave', function () {
        $b = Security::jsonBody();
        $correo = Validate::email($b['correo'] ?? null);
        $token  = is_string($b['token'] ?? null) ? $b['token'] : '';
        if (!$correo) Response::error(422, 'correo_invalido');
        if (!RateLimit::hit('perfil_visitante', RateLimit::ipHash())) Response::error(429, 'rate_limited');
        if (!visitante_token_valido($correo, $token)) Response::error(403, 'token_invalido');

        $actual = is_string($b['clave_actual'] ?? null) ? $b['clave_actual'] : '';
        $nueva  = is_string($b['clave_nueva'] ?? null) ? trim($b['clave_nueva']) : '';

        $pdo  = Db::pdo();
        $stmt = $pdo->prepare('SELECT acceso_hash FROM visitantes WHERE correo = :c');
        $stmt->execute([':c' => $correo]);
        $hash = (string) ($stmt->fetchColumn() ?: '');

        if ($hash !== '' && !Security::verifyPassword($actual, $hash)) {
            usleep(random_int(150000, 350000));
            Response::error(403, 'clave_incorrecta');
        }
        if ($nueva !== '' && (mb_strlen($nueva, 'UTF-8') < 6 || mb_strlen($nueva, 'UTF-8') > 128)) {
            Response::error(422, 'clave_corta');
        }

        $nuevoHash = $nueva === '' ? null : Security::hashPassword($nueva);
        $upd = $pdo->prepare('UPDATE visitantes SET acceso_hash = :h, updated_at = CURRENT_TIMESTAMP
                              WHERE correo = :c');
        $upd->execute([':h' => $nuevoHash, ':c' => $correo]);
        if ($upd->rowCount() === 0 && $nuevoHash !== null) {
            // Todavía no hay fila: se crea sólo con la clave y sin autorización
            // de tratamiento, que es lo correcto —proteger el perfil no autoriza
            // a tratar datos sensibles— y el formulario la pedirá cuando toque.
            $pdo->prepare('INSERT INTO visitantes (correo, acceso_hash, acepta_datos, updated_at)
                           VALUES (:c, :h, 0, CURRENT_TIMESTAMP)')
                ->execute([':c' => $correo, ':h' => $nuevoHash]);
        }

        Response::ok(['protegido' => $nuevoHash !== null]);
    });

    $r->get('/visitantes/perfil', function () {
        $correo = Validate::email($_GET['correo'] ?? null);
        $token  = is_string($_GET['t'] ?? null) ? $_GET['t'] : '';
        if (!$correo) Response::error(422, 'correo_invalido');
        if (!RateLimit::hit('perfil_visitante', RateLimit::ipHash())) Response::error(429, 'rate_limited');
        if (!visitante_token_valido($correo, $token)) Response::error(403, 'token_invalido');

        $stmt = Db::pdo()->prepare('SELECT * FROM visitantes WHERE correo = :c');
        $stmt->execute([':c' => $correo]);
        $row = $stmt->fetch();

        Response::ok([
            'correo'   => $correo,
            'perfil'   => $row ? visitante_publico($row) : null,
            // Va también fuera del perfil porque quien todavía no tiene fila no
            // tiene perfil que mirar, y la pantalla necesita saberlo igual.
            'protegido' => $row ? !empty($row['acceso_hash']) : false,
            'opciones' => VISITANTE_OPCIONES,
            'emojis'   => VISITANTE_EMOJIS,
        ]);
    });

    $r->put('/visitantes/perfil', function () {
        $b = Security::jsonBody();
        $correo = Validate::email($b['correo'] ?? null);
        $token  = is_string($b['token'] ?? null) ? $b['token'] : '';
        if (!$correo) Response::error(422, 'correo_invalido');
        if (!RateLimit::hit('perfil_visitante', RateLimit::ipHash())) Response::error(429, 'rate_limited');
        if (!visitante_token_valido($correo, $token)) Response::error(403, 'token_invalido');

        // Sin autorización no se guarda nada: es lo que exige la ley para los
        // datos sensibles y no tiene sentido guardar el resto "a medias".
        if (Validate::bool($b['acepta_datos'] ?? null) !== true) {
            Response::error(422, 'debe_aceptar_tratamiento_datos');
        }

        $datos = [
            ':c'   => $correo,
            ':nom' => Validate::nombre($b['nombre'] ?? null, 120),
            ':tel' => Validate::telefono($b['telefono'] ?? null),
            ':gen' => visitante_opcion('genero', $b['genero'] ?? null),
            ':edad'=> visitante_opcion('rango_edad', $b['rango_edad'] ?? null),
            ':pais'=> visitante_texto($b['pais'] ?? null, 80),
            ':dep' => visitante_departamento($b['departamento'] ?? null),
            // Si el municipio es de Nariño se guarda con el nombre del DANE; si
            // el visitante viene de fuera, se acepta tal cual (texto libre). Así
            // el informe agregado no parte «Pasto» y «San Juan de Pasto» en dos.
            ':mun' => visitante_municipio($b['municipio'] ?? null),
            ':tipo'=> visitante_opcion('tipo_visitante', $b['tipo_visitante'] ?? null),
            ':ent' => visitante_texto($b['entidad'] ?? null, 120),
            ':etn' => visitante_opcion('grupo_etnico', $b['grupo_etnico'] ?? null),
            ':dis' => visitante_opcion('discapacidad', $b['discapacidad'] ?? null),
            ':exp' => visitante_texto($b['expectativa'] ?? null, 500),
            ':como'=> visitante_opcion('como_se_entero', $b['como_se_entero'] ?? null),
            ':prim'=> ($p = Validate::bool($b['primera_visita'] ?? null)) === null ? null : ($p ? 1 : 0),
            // Emoji del avatar. La foto NO se toca aquí: se sube por su propia
            // ruta y guardarla en este PUT la borraría cada vez que alguien
            // cambia cualquier otro campo del formulario.
            ':emoji' => visitante_emoji($b['avatar_emoji'] ?? null),
        ];

        $pdo = Db::pdo();
        $driver = $pdo->getAttribute(\PDO::ATTR_DRIVER_NAME);
        $columnas = 'correo, nombre, telefono, avatar_emoji, genero, rango_edad, pais, departamento, municipio,
                     tipo_visitante, entidad, grupo_etnico, discapacidad, expectativa,
                     como_se_entero, primera_visita, acepta_datos, updated_at';
        $valores  = ':c, :nom, :tel, :emoji, :gen, :edad, :pais, :dep, :mun, :tipo, :ent, :etn, :dis,
                     :exp, :como, :prim, 1, CURRENT_TIMESTAMP';
        $asigna   = 'nombre=:nom, telefono=:tel, avatar_emoji=:emoji, genero=:gen, rango_edad=:edad, pais=:pais,
                     departamento=:dep, municipio=:mun, tipo_visitante=:tipo, entidad=:ent,
                     grupo_etnico=:etn, discapacidad=:dis, expectativa=:exp,
                     como_se_entero=:como, primera_visita=:prim, acepta_datos=1,
                     updated_at=CURRENT_TIMESTAMP';

        if ($driver === 'mysql') {
            // Con la emulación de prepares desactivada un marcador con nombre no
            // se puede repetir, así que el UPDATE de MySQL no vuelve a nombrarlos:
            // reutiliza con VALUES() lo que traía el INSERT.
            $sql = "INSERT INTO visitantes ($columnas) VALUES ($valores)
                    ON DUPLICATE KEY UPDATE
                      nombre=VALUES(nombre), telefono=VALUES(telefono),
                      avatar_emoji=VALUES(avatar_emoji), genero=VALUES(genero),
                      rango_edad=VALUES(rango_edad), pais=VALUES(pais),
                      departamento=VALUES(departamento), municipio=VALUES(municipio),
                      tipo_visitante=VALUES(tipo_visitante), entidad=VALUES(entidad),
                      grupo_etnico=VALUES(grupo_etnico), discapacidad=VALUES(discapacidad),
                      expectativa=VALUES(expectativa), como_se_entero=VALUES(como_se_entero),
                      primera_visita=VALUES(primera_visita), acepta_datos=1,
                      updated_at=CURRENT_TIMESTAMP";
        } else {
            $sql = "INSERT INTO visitantes ($columnas) VALUES ($valores)
                    ON CONFLICT(correo) DO UPDATE SET $asigna";
        }
        $pdo->prepare($sql)->execute($datos);

        $stmt = $pdo->prepare('SELECT * FROM visitantes WHERE correo = :c');
        $stmt->execute([':c' => $correo]);
        Response::ok(['perfil' => visitante_publico($stmt->fetch() ?: [])]);
    });

    /**
     * Foto del visitante.
     *
     * Va aparte del PUT del perfil por dos motivos: una subida es multipart y
     * no cabe en el cuerpo JSON, y porque guardarla en cada guardado del
     * formulario la borraría cada vez que alguien cambia otro campo.
     *
     * Sin sesión, así que además del testigo lleva su propio límite por IP: es
     * el único punto donde un anónimo con un testigo válido puede escribir
     * archivos en el servidor.
     */
    $r->post('/visitantes/foto', function () {
        $correo = Validate::email($_POST['correo'] ?? null);
        $token  = is_string($_POST['token'] ?? null) ? $_POST['token'] : '';
        if (!$correo) Response::error(422, 'correo_invalido');
        if (!RateLimit::hit('foto_visitante', RateLimit::ipHash())) Response::error(429, 'rate_limited');
        if (!visitante_token_valido($correo, $token)) Response::error(403, 'token_invalido');
        if (empty($_FILES['archivo']) || !is_array($_FILES['archivo'])) {
            Response::error(422, 'archivo_ausente');
        }

        try {
            $ruta = \LMT\Uploads::imagen($_FILES['archivo'], 'visitantes');
        } catch (\RuntimeException $e) {
            Response::error(422, $e->getMessage());
        }

        $pdo = Db::pdo();
        // La foto manda sobre el emoji: quien sube su cara ya eligió.
        $anterior = $pdo->prepare('SELECT avatar_path FROM visitantes WHERE correo = :c');
        $anterior->execute([':c' => $correo]);
        $vieja = (string) ($anterior->fetchColumn() ?: '');

        $upd = $pdo->prepare('UPDATE visitantes SET avatar_path = :p, avatar_emoji = NULL,
                                                    updated_at = CURRENT_TIMESTAMP
                              WHERE correo = :c');
        $upd->execute([':p' => $ruta, ':c' => $correo]);
        if ($upd->rowCount() === 0) {
            // Todavía no hay fila: se crea con la foto y sin autorización, que
            // es lo correcto —subir una foto no autoriza a tratar datos
            // sensibles— y el formulario la pedirá cuando toque.
            $pdo->prepare('INSERT INTO visitantes (correo, avatar_path, acepta_datos, updated_at)
                           VALUES (:c, :p, 0, CURRENT_TIMESTAMP)')
                ->execute([':c' => $correo, ':p' => $ruta]);
        }

        visitante_borrar_foto($vieja);
        Response::ok(['avatar' => visitante_ruta_publica($ruta)]);
    });

    /** Quitar la foto y volver al emoji (o a la inicial). */
    $r->delete('/visitantes/foto', function () {
        $b = Security::jsonBody();
        $correo = Validate::email($b['correo'] ?? null);
        $token  = is_string($b['token'] ?? null) ? $b['token'] : '';
        if (!$correo) Response::error(422, 'correo_invalido');
        if (!RateLimit::hit('perfil_visitante', RateLimit::ipHash())) Response::error(429, 'rate_limited');
        if (!visitante_token_valido($correo, $token)) Response::error(403, 'token_invalido');

        $pdo = Db::pdo();
        $sel = $pdo->prepare('SELECT avatar_path FROM visitantes WHERE correo = :c');
        $sel->execute([':c' => $correo]);
        $vieja = (string) ($sel->fetchColumn() ?: '');

        $pdo->prepare('UPDATE visitantes SET avatar_path = NULL, updated_at = CURRENT_TIMESTAMP
                       WHERE correo = :c')->execute([':c' => $correo]);
        visitante_borrar_foto($vieja);
        Response::ok(null);
    });

    /** Derecho de supresión (Ley 1581/2012, art. 8). */
    $r->delete('/visitantes/perfil', function () {
        $b = Security::jsonBody();
        $correo = Validate::email($b['correo'] ?? null);
        $token  = is_string($b['token'] ?? null) ? $b['token'] : '';
        if (!$correo) Response::error(422, 'correo_invalido');
        if (!RateLimit::hit('perfil_visitante', RateLimit::ipHash())) Response::error(429, 'rate_limited');
        if (!visitante_token_valido($correo, $token)) Response::error(403, 'token_invalido');

        // Borrar el perfil tiene que llevarse la foto del disco. Dejar el
        // archivo huérfano sería incumplir el derecho de supresión con la
        // excusa de que «en la base ya no está»: el retrato sigue siendo suyo
        // y sigue estando accesible por su URL.
        $pdo = Db::pdo();
        $sel = $pdo->prepare('SELECT avatar_path FROM visitantes WHERE correo = :c');
        $sel->execute([':c' => $correo]);
        $foto = (string) ($sel->fetchColumn() ?: '');

        $pdo->prepare('DELETE FROM visitantes WHERE correo = :c')->execute([':c' => $correo]);
        visitante_borrar_foto($foto);
        Response::ok(null);
    });

    /**
     * Reenvío del enlace al propio buzón. Responde lo mismo haya o no votos con
     * ese correo: si distinguiera, serviría para averiguar quién asistió.
     */
    $r->post('/visitantes/enlace', function () {
        $b = Security::jsonBody();
        $correo = Validate::email($b['correo'] ?? null);
        if (!$correo) Response::error(422, 'correo_invalido');
        if (!RateLimit::hit('perfil_enlace', RateLimit::ipHash())) Response::error(429, 'rate_limited');
        if (!RateLimit::hit('perfil_enlace_correo', hash('sha256', $correo))) Response::error(429, 'rate_limited');

        $stmt = Db::pdo()->prepare('SELECT 1 FROM votos WHERE correo = :c LIMIT 1');
        $stmt->execute([':c' => $correo]);
        if ($stmt->fetchColumn()) {
            $url = Security::baseUrlPublica() . '/perfil?correo=' . rawurlencode($correo)
                 . '&t=' . rawurlencode(visitante_token($correo));
            $pl = Correos::enlacePerfil($correo, $url);
            Mailer::send($correo, '', $pl['asunto'], $pl['html'], $pl['texto'], 'enlace_perfil');
        }
        Response::ok(['enviado' => true]);
    });

    // ---------------------------------------------------------------------
    // Administración
    // ---------------------------------------------------------------------

    /** Caracterización agregada. Nunca devuelve correos ni nombres. */
    $r->get('/admin/visitantes/resumen', function () {
        Security::requireAdmin();
        $pdo = Db::pdo();

        $total = (int) $pdo->query('SELECT COUNT(*) FROM visitantes')->fetchColumn();
        $votantes = (int) $pdo->query('SELECT COUNT(DISTINCT correo) FROM votos')->fetchColumn();

        $dimensiones = [];
        foreach (array_keys(VISITANTE_OPCIONES) as $campo) {
            // $campo sale de una constante del propio código, no del cliente.
            $filas = $pdo->query(
                "SELECT $campo AS valor, COUNT(*) AS n FROM visitantes
                 WHERE $campo IS NOT NULL AND $campo <> '' GROUP BY $campo ORDER BY n DESC"
            )->fetchAll();
            $dimensiones[$campo] = array_map(
                fn($f) => ['valor' => (string) $f['valor'], 'n' => (int) $f['n']],
                $filas
            );
        }

        $municipios = $pdo->query(
            "SELECT municipio AS valor, COUNT(*) AS n FROM visitantes
             WHERE municipio IS NOT NULL AND municipio <> ''
             GROUP BY municipio ORDER BY n DESC, municipio LIMIT 25"
        )->fetchAll();

        $primera = $pdo->query(
            'SELECT primera_visita AS valor, COUNT(*) AS n FROM visitantes
             WHERE primera_visita IS NOT NULL GROUP BY primera_visita'
        )->fetchAll();

        Response::ok([
            'total'       => $total,
            'votantes'    => $votantes,
            'dimensiones' => $dimensiones,
            'municipios'  => array_map(fn($f) => ['valor' => (string) $f['valor'], 'n' => (int) $f['n']], $municipios),
            'primera_visita' => array_map(fn($f) => ['valor' => (int) $f['valor'], 'n' => (int) $f['n']], $primera),
            'etiquetas'   => VISITANTE_ETIQUETAS,
        ]);
    });

    /** Expectativas en texto libre: se leen a mano, así que van aparte. */
    $r->get('/admin/visitantes/expectativas', function () {
        Security::requireAdmin();
        $stmt = Db::pdo()->query(
            "SELECT expectativa, municipio, created_at FROM visitantes
             WHERE expectativa IS NOT NULL AND expectativa <> ''
             ORDER BY created_at DESC LIMIT 100"
        );
        Response::ok(array_map(fn($f) => [
            'texto'     => (string) $f['expectativa'],
            'municipio' => (string) ($f['municipio'] ?? ''),
            'hora'      => relative_time($f['created_at']),
        ], $stmt->fetchAll()));
    });
}

// -------------------------------------------------------------------------

/** Etiquetas legibles de cada código. Las usa el panel y el CSV. */
const VISITANTE_ETIQUETAS = [
    'genero' => [
        'hombre' => 'Hombre', 'mujer' => 'Mujer', 'otro' => 'Otro',
        'prefiero_no_decir' => 'Prefiere no decir',
    ],
    'rango_edad' => [
        'menor_18' => 'Menor de 18', '18_25' => '18 a 25', '26_35' => '26 a 35',
        '36_45' => '36 a 45', '46_60' => '46 a 60', 'mayor_60' => 'Mayor de 60',
        'prefiero_no_decir' => 'Prefiere no decir',
    ],
    'tipo_visitante' => [
        'publica' => 'Entidad pública', 'privada' => 'Empresa privada',
        'academica' => 'Institución académica', 'gremio' => 'Gremio o asociación',
        'particular' => 'A título personal', 'otro' => 'Otro',
        'prefiero_no_decir' => 'Prefiere no decir',
    ],
    'grupo_etnico' => [
        'indigena' => 'Indígena', 'afrodescendiente' => 'Negro, afrocolombiano',
        'raizal' => 'Raizal', 'palenquero' => 'Palenquero', 'rrom' => 'Rrom (gitano)',
        'ninguno' => 'Ninguno', 'prefiero_no_decir' => 'Prefiere no decir',
    ],
    'discapacidad' => [
        'fisica' => 'Física o motriz', 'visual' => 'Visual', 'auditiva' => 'Auditiva',
        'intelectual' => 'Intelectual', 'psicosocial' => 'Psicosocial',
        'multiple' => 'Múltiple', 'ninguna' => 'Ninguna',
        'prefiero_no_decir' => 'Prefiere no decir',
    ],
    'como_se_entero' => [
        'redes' => 'Redes sociales', 'radio' => 'Radio', 'television' => 'Televisión',
        'prensa' => 'Prensa', 'voz_a_voz' => 'Voz a voz', 'institucion' => 'Una institución',
        'otro' => 'Otro medio',
    ],
];

/**
 * Testigo de propiedad del perfil.
 *
 * Va ligado al correo y al app_secret de la instalación: no se puede fabricar
 * desde fuera ni sirve el de un correo para otro.
 */
function visitante_token(string $correo): string
{
    $secreto = (string) Config::get('app_secret', '');
    return rtrim(strtr(base64_encode(
        hash_hmac('sha256', 'perfil|' . strtolower($correo), $secreto, true)
    ), '+/', '-_'), '=');
}

function visitante_token_valido(string $correo, string $token): bool
{
    if ($token === '') return false;
    return Security::constantTimeEquals(visitante_token($correo), $token);
}

/** Valor de un catálogo cerrado, o null. */
function visitante_opcion(string $campo, $valor): ?string
{
    if (!is_string($valor) || $valor === '') return null;
    return in_array($valor, VISITANTE_OPCIONES[$campo] ?? [], true) ? $valor : null;
}

function visitante_texto($valor, int $max): ?string
{
    if (!is_string($valor)) return null;
    $v = Validate::texto($valor, $max);
    return $v === '' ? null : $v;
}

/**
 * Municipio del visitante. A diferencia del promotor, aquí no es obligatorio
 * que sea de Nariño —vienen visitantes de todo el país—, pero cuando sí lo es
 * se normaliza al nombre oficial para que las cifras agregadas cuadren.
 */
function visitante_municipio($valor): ?string
{
    $libre = visitante_texto($valor, 80);
    if ($libre === null) return null;
    return \LMT\Territorio::municipio($libre) ?? $libre;
}

/**
 * Departamento del visitante, con el mismo criterio: si es uno de los 33 de
 * Colombia se guarda con su nombre oficial; si viene de fuera, tal cual.
 */
function visitante_departamento($valor): ?string
{
    $libre = visitante_texto($valor, 80);
    if ($libre === null) return null;
    return \LMT\Territorio::departamento($libre) ?? $libre;
}

/**
 * Emoji del avatar, o null.
 *
 * Sólo se aceptan los de la lista: un campo de texto libre aquí sería una vía
 * para colar cualquier cosa en un sitio donde luego se pinta sin escapar en el
 * canvas del pasaporte. Con un catálogo cerrado no hay nada que discutir.
 */
function visitante_emoji($valor): ?string
{
    if (!is_string($valor) || $valor === '') return null;
    return in_array($valor, VISITANTE_EMOJIS, true) ? $valor : null;
}

/**
 * Borra del disco una foto que ya no se usa.
 *
 * Sólo toca lo que está dentro de uploads/visitantes: la ruta viene de la base,
 * pero comprobarlo cuesta tres líneas y evita que un valor manipulado en la
 * base llegue a borrar cualquier archivo del servidor.
 */
function visitante_borrar_foto(?string $rel): void
{
    $rel = is_string($rel) ? trim($rel) : '';
    if ($rel === '' || !preg_match('#^uploads/visitantes/[a-f0-9]{32}\.(jpg|png|webp)$#', $rel)) return;
    $abs = dirname(__DIR__, 2) . '/' . $rel;
    if (is_file($abs)) @unlink($abs);
}

/** Ruta pública de la foto, o cadena vacía. */
function visitante_ruta_publica($rel): string
{
    $rel = is_string($rel) ? trim($rel) : '';
    if ($rel === '') return '';
    return ltrim($rel, '/');
}

function visitante_publico(array $v): array
{
    return [
        'nombre'         => (string) ($v['nombre'] ?? ''),
        'telefono'       => (string) ($v['telefono'] ?? ''),
        'avatar'         => visitante_ruta_publica($v['avatar_path'] ?? null),
        'avatar_emoji'   => (string) ($v['avatar_emoji'] ?? ''),
        'genero'         => (string) ($v['genero'] ?? ''),
        'rango_edad'     => (string) ($v['rango_edad'] ?? ''),
        'pais'           => (string) ($v['pais'] ?? ''),
        'departamento'   => (string) ($v['departamento'] ?? ''),
        'municipio'      => (string) ($v['municipio'] ?? ''),
        'tipo_visitante' => (string) ($v['tipo_visitante'] ?? ''),
        'entidad'        => (string) ($v['entidad'] ?? ''),
        'grupo_etnico'   => (string) ($v['grupo_etnico'] ?? ''),
        'discapacidad'   => (string) ($v['discapacidad'] ?? ''),
        'expectativa'    => (string) ($v['expectativa'] ?? ''),
        'como_se_entero' => (string) ($v['como_se_entero'] ?? ''),
        'primera_visita' => isset($v['primera_visita']) && $v['primera_visita'] !== null
            ? (bool) $v['primera_visita'] : null,
        // Si tiene clave, no cuál es: el hash no sale nunca de aquí.
        'protegido'      => !empty($v['acceso_hash']),
        'actualizado'    => (string) ($v['updated_at'] ?? ''),
    ];
}
