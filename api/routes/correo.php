<?php
defined('LMT_GUARD') || exit('forbidden');

use LMT\Db;
use LMT\Response;
use LMT\Validate;
use LMT\Security;
use LMT\Config;
use LMT\Ajustes;
use LMT\Mailer;
use LMT\Correos;

/**
 * Administración del correo saliente.
 *
 * Existe porque el envío es la pieza más frágil del sistema y la única que
 * falla en silencio: el panel decía «la contraseña salió hacia…» y en el buzón
 * del promotor no había nada. Aquí el organizador puede ver qué transporte está
 * usando de verdad, cambiarlo sin tocar ficheros por FTP, mandarse una prueba a
 * sí mismo y leer el diálogo completo con el servidor cuando falla.
 *
 * Los ajustes se guardan en la tabla `ajustes` y pisan a los de api/config.php.
 * La contraseña del SMTP se guarda cifrada y no vuelve a salir de aquí.
 */

function register_routes_correo(\LMT\Router $r): void
{
    $r->get('/admin/correo', function () {
        Security::requireAdmin();
        $cfg = Mailer::cfg();
        Response::ok([
            'config'      => correo_config_publica($cfg),
            'sobrescrito' => Ajustes::origen('mail'),
            'diagnostico' => correo_diagnostico($cfg),
            'entrega_de_verdad' => Mailer::entregaDeVerdad((string) $cfg['transport']),
        ]);
    });

    $r->put('/admin/correo', function () {
        admin_requiere_propietario();
        $b = Security::jsonBody();

        $transporte = in_array($b['transport'] ?? '', ['smtp', 'mail', 'log'], true) ? $b['transport'] : null;
        if ($transporte === null) Response::error(422, 'transporte_invalido');

        $from = Validate::email($b['from'] ?? null);
        if (!$from) Response::error(422, 'remitente_invalido');
        $replyTo = ($b['reply_to'] ?? '') === '' ? '' : Validate::email($b['reply_to'] ?? null);
        if ($replyTo === null) Response::error(422, 'reply_to_invalido');

        $smtp = is_array($b['smtp'] ?? null) ? $b['smtp'] : [];
        $host = trim((string) ($smtp['host'] ?? ''));
        if ($host !== '' && !preg_match('/^[A-Za-z0-9.\-]{1,253}$/', $host)) {
            Response::error(422, 'host_invalido');
        }
        if ($transporte === 'smtp' && $host === '') Response::error(422, 'smtp_sin_host');

        $puerto = Validate::entero($smtp['port'] ?? 587, 1, 65535) ?? 587;
        $seguro = in_array($smtp['secure'] ?? '', ['tls', 'ssl', ''], true) ? (string) $smtp['secure'] : 'tls';

        $valores = [
            'transport' => $transporte,
            'from'      => $from,
            'from_name' => Validate::texto($b['from_name'] ?? '', 80),
            'reply_to'  => $replyTo,
            'smtp' => [
                'host'    => $host,
                'port'    => $puerto,
                'secure'  => $seguro,
                'user'    => Validate::texto($smtp['user'] ?? '', 254),
                'timeout' => Validate::entero($smtp['timeout'] ?? 15, 3, 120) ?? 15,
            ],
        ];

        // La contraseña sólo se toca si mandan una nueva: el formulario devuelve
        // un marcador de posición, y guardarlo tal cual borraría la buena.
        $clave = $smtp['password'] ?? null;
        if (is_string($clave) && $clave !== '' && $clave !== CORREO_CLAVE_OCULTA) {
            try {
                $valores['smtp']['password'] = Ajustes::cifrar($clave);
            } catch (\RuntimeException $e) {
                Response::error(500, 'sin_cifrado_disponible',
                    'Este PHP no tiene sodium ni openssl, así que no se puede guardar la contraseña cifrada. Ponla en api/config.php.');
            }
        }

        Ajustes::guardar('mail', $valores);
        $cfg = Mailer::cfg();
        Response::ok([
            'config'      => correo_config_publica($cfg),
            'diagnostico' => correo_diagnostico($cfg),
        ]);
    });

    /** Devuelve la configuración a la del fichero. */
    $r->delete('/admin/correo', function () {
        admin_requiere_propietario();
        Ajustes::olvidar('mail');
        $cfg = Mailer::cfg();
        Response::ok(['config' => correo_config_publica($cfg), 'diagnostico' => correo_diagnostico($cfg)]);
    });

    /**
     * Prueba de envío. Es la única forma honesta de saber si el correo
     * funciona: se manda de verdad y se devuelve el diálogo con el servidor.
     */
    $r->post('/admin/correo/prueba', function () {
        Security::requireAdmin();
        $b = Security::jsonBody();
        $destino = Validate::email($b['destino'] ?? null);
        if (!$destino) Response::error(422, 'correo_invalido');
        if (!\LMT\RateLimit::hit('correo_prueba', \LMT\RateLimit::ipHash())) {
            Response::error(429, 'rate_limited');
        }

        $cfg = Mailer::cfg();
        $pl = Correos::pruebaEnvio($destino, (string) $cfg['transport']);
        $ok = Mailer::send($destino, '', $pl['asunto'], $pl['html'], $pl['texto'], 'prueba');

        Response::ok([
            'aceptado'   => $ok,
            'transporte' => Mailer::ultimoTransporte(),
            'entregado'  => $ok && Mailer::entregaDeVerdad(Mailer::ultimoTransporte()),
            'error'      => Mailer::ultimoError(),
            'traza'      => Mailer::ultimaTraza(),
            'pista'      => correo_pista(Mailer::ultimoTransporte(), Mailer::ultimoError(), $ok, $cfg),
        ]);
    });
}

// -------------------------------------------------------------------------

const CORREO_CLAVE_OCULTA = '__sin_cambios__';

/** Configuración sin secretos, lista para pintar en el panel. */
function correo_config_publica(array $c): array
{
    $s = (array) ($c['smtp'] ?? []);
    return [
        'transport' => (string) ($c['transport'] ?? 'mail'),
        'from'      => (string) ($c['from'] ?? ''),
        'from_name' => (string) ($c['from_name'] ?? ''),
        'reply_to'  => (string) ($c['reply_to'] ?? ''),
        'smtp' => [
            'host'    => (string) ($s['host'] ?? ''),
            'port'    => (int) ($s['port'] ?? 587),
            'secure'  => (string) ($s['secure'] ?? 'tls'),
            'user'    => (string) ($s['user'] ?? ''),
            'timeout' => (int) ($s['timeout'] ?? 15),
            // Nunca sale del servidor; el formulario manda este mismo valor
            // cuando no se quiere cambiar.
            'password' => ($s['password'] ?? '') !== '' ? CORREO_CLAVE_OCULTA : '',
        ],
    ];
}

/**
 * Qué puede impedir que el correo llegue. Se comprueba lo que se puede
 * comprobar sin enviar nada.
 */
function correo_diagnostico(array $c): array
{
    $avisos = [];
    $transporte = (string) ($c['transport'] ?? 'mail');
    $from = (string) ($c['from'] ?? '');
    $dominioFrom = strtolower((string) substr(strrchr($from, '@') ?: '', 1));

    if ($transporte === 'log') {
        $avisos[] = [
            'nivel' => 'critico',
            'texto' => 'El transporte es «log»: los mensajes se escriben en un archivo del servidor y NO se envían a nadie. '
                     . 'El panel dirá que el correo salió, y no habrá salido. Cámbialo a SMTP antes del evento.',
        ];
    }

    if ($transporte === 'mail') {
        $avisos[] = [
            'nivel' => 'alto',
            'texto' => 'El transporte es «mail» (la función mail() de PHP). Devuelve éxito en cuanto el servidor local '
                     . 'acepta el mensaje, aunque después se pierda: es el caso típico de «dice enviado y no llega». '
                     . 'En hosting compartido el correo suele acabar en spam o rechazado porque sale de una IP que no '
                     . 'está autorizada a enviar en nombre de ' . ($dominioFrom ?: 'tu dominio') . '. Usa SMTP autenticado.',
        ];
        if (!function_exists('mail')) {
            $avisos[] = ['nivel' => 'critico', 'texto' => 'Además, la función mail() está deshabilitada en este PHP: no se envía nada.'];
        }
    }

    if ($transporte === 'smtp') {
        $s = (array) ($c['smtp'] ?? []);
        $host = (string) ($s['host'] ?? '');
        $esGmail = $host !== '' && (bool) preg_match('/(^|\.)(gmail\.com|googlemail\.com)$/i', $host);

        if ($esGmail) {
            $avisos[] = [
                'nivel' => 'medio',
                'texto' => 'Gmail no acepta la contraseña normal del buzón: hay que crear una '
                         . '«contraseña de aplicación» de 16 caracteres en la cuenta de Google '
                         . '(Seguridad → Verificación en dos pasos → Contraseñas de aplicaciones) '
                         . 'y pegarla aquí. Con la contraseña de siempre el servidor responde 535.',
            ];
            $usuario = strtolower((string) ($s['user'] ?? ''));
            if ($usuario !== '' && $dominioFrom !== '' && strtolower($from) !== $usuario) {
                $avisos[] = [
                    'nivel' => 'alto',
                    'texto' => "Gmail reescribe el remitente si no coincide con el buzón autenticado: "
                             . "el correo saldría como «{$usuario}» y no como «{$from}». Pon la misma "
                             . 'dirección en los dos sitios, o dala de alta como alias verificado en Gmail.',
                ];
            }
        }
        if ($host === '') {
            $avisos[] = ['nivel' => 'critico', 'texto' => 'SMTP sin servidor configurado.'];
        } else {
            if (!filter_var($host, FILTER_VALIDATE_IP) && function_exists('checkdnsrr') && !checkdnsrr($host, 'A') && !checkdnsrr($host, 'AAAA')) {
                $avisos[] = ['nivel' => 'critico', 'texto' => "El nombre «{$host}» no resuelve en DNS desde este servidor."];
            }
            $alcanzable = correo_puerto_abierto($host, (int) ($s['port'] ?? 587));
            if ($alcanzable === false) {
                $avisos[] = [
                    'nivel' => 'critico',
                    'texto' => "No se puede abrir el puerto {$s['port']} de {$host} desde este servidor. "
                             . 'Muchos hostings bloquean la salida SMTP: pide que la habiliten o usa el relé del proveedor.',
                ];
            }
            if (($s['user'] ?? '') === '') {
                $avisos[] = ['nivel' => 'medio', 'texto' => 'SMTP sin usuario: sólo funciona si el servidor acepta relé anónimo desde esta IP.'];
            }
            if (($s['secure'] ?? '') === '') {
                $avisos[] = ['nivel' => 'alto', 'texto' => 'Conexión sin cifrar: la contraseña del buzón viaja en claro por la red.'];
            }
        }
        if (($s['user'] ?? '') !== '' && $dominioFrom !== '') {
            $dominioUser = strtolower((string) substr(strrchr((string) $s['user'], '@') ?: '', 1));
            if ($dominioUser !== '' && $dominioUser !== $dominioFrom) {
                $avisos[] = [
                    'nivel' => 'medio',
                    'texto' => "El remitente es de «{$dominioFrom}» pero el buzón autenticado es de «{$dominioUser}». "
                             . 'Muchos servidores rechazan enviar en nombre de otro dominio.',
                ];
            }
        }
    }

    if ($from === '' || strpos($from, '@') === false) {
        $avisos[] = ['nivel' => 'critico', 'texto' => 'El remitente no es una dirección válida: ningún servidor aceptará el mensaje.'];
    }

    // Estadística real: qué ha pasado con lo enviado hasta ahora.
    $ultimos = [];
    try {
        $ultimos = Db::pdo()->query(
            "SELECT transporte, estado, COUNT(*) AS n FROM emails_log
             GROUP BY transporte, estado ORDER BY n DESC"
        )->fetchAll();
    } catch (\Throwable $e) { /* la bitácora es opcional para diagnosticar */ }

    return [
        'avisos'  => $avisos,
        'php_mail'=> function_exists('mail'),
        'openssl' => function_exists('openssl_encrypt'),
        'sodium'  => function_exists('sodium_crypto_secretbox'),
        'historico' => array_map(fn($f) => [
            'transporte' => (string) $f['transporte'],
            'estado'     => (string) $f['estado'],
            'n'          => (int) $f['n'],
        ], $ultimos),
    ];
}

/** ¿Se puede abrir ese puerto desde aquí? null si no se pudo comprobar. */
function correo_puerto_abierto(string $host, int $puerto): ?bool
{
    if (!function_exists('stream_socket_client')) return null;
    $fp = @stream_socket_client('tcp://' . $host . ':' . $puerto, $errno, $errstr, 4);
    if ($fp) { fclose($fp); return true; }
    return false;
}

/** Traduce el fallo a lo siguiente que hay que hacer. */
function correo_pista(string $transporte, ?string $error, bool $ok, array $cfg): string
{
    if ($transporte === 'log') {
        return 'El mensaje se guardó en el archivo de pruebas y NO se envió. Cambia el transporte a SMTP para que salga de verdad.';
    }
    if ($ok && $transporte === 'mail') {
        return 'El servidor local aceptó el mensaje, pero eso no garantiza la entrega. Si no llega en unos minutos, '
             . 'mira la carpeta de spam y después configura SMTP: es el único modo fiable.';
    }
    if ($ok) {
        return 'El servidor de correo aceptó el mensaje. Si no aparece, revisa la carpeta de spam del destinatario '
             . 'y pide a sistemas que el SPF del dominio autorice a este servidor.';
    }
    $e = (string) $error;
    if (str_contains($e, 'smtp_conexion'))        return 'No se pudo conectar con el servidor SMTP. Comprueba el nombre y el puerto, y si el hosting bloquea la salida.';
    if (str_contains($e, 'smtp_auth')) {
        $host = strtolower((string) (($cfg['smtp'] ?? [])['host'] ?? ''));
        if (str_contains($host, 'gmail') || str_contains($host, 'google')) {
            return 'Gmail rechazó las credenciales. Casi siempre es porque se puso la contraseña '
                 . 'normal de la cuenta: hace falta una «contraseña de aplicación» de 16 caracteres '
                 . '(cuenta de Google → Seguridad → Verificación en dos pasos → Contraseñas de aplicaciones).';
        }
        return 'El servidor rechazó el usuario o la contraseña del buzón.';
    }
    if (str_contains($e, 'smtp_tls'))             return 'Falló el cifrado. Prueba con el puerto 465 y «ssl», o con 587 y «tls».';
    if (str_contains($e, 'smtp_mailfrom') || str_contains($e, 'smtp_rcpt'))
        return 'El servidor no acepta ese remitente o ese destinatario. Suele ser que el buzón autenticado no puede enviar en nombre de esa dirección.';
    if (str_contains($e, 'mail_deshabilitada'))   return 'La función mail() está desactivada en este PHP. Configura SMTP.';
    if (str_contains($e, 'mail_rechazado'))       return 'El servidor local rechazó el mensaje. Configura SMTP.';
    if (str_contains($e, 'remitente_invalido'))   return 'La dirección del remitente no es válida.';
    return 'Revisa el diálogo con el servidor que aparece abajo.';
}
