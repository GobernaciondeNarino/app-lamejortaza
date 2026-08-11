<?php
namespace LMT;
defined('LMT_GUARD') || exit('forbidden');

use PDO;

/**
 * Envío de correo sin dependencias externas.
 *
 * El módulo de promotores necesita entregar una contraseña temporal por correo
 * cuando el administrador verifica una solicitud. En el hosting compartido de
 * la Gobernación el envío es la parte más frágil de todo el sistema, así que
 * hay tres transportes y todos dejan rastro en `emails_log`:
 *
 *   'mail' — función mail() de PHP. Funciona si el hosting tiene un MTA local.
 *   'smtp' — socket directo con STARTTLS o TLS implícito y AUTH LOGIN/PLAIN.
 *            Es la opción recomendada: el correo sale autenticado desde el
 *            dominio institucional y no acaba en la carpeta de spam.
 *   'log'  — no envía nada; escribe el mensaje completo en un fichero. Para
 *            desarrollo y para diagnosticar plantillas sin molestar a nadie.
 *
 * Sin configuración `mail` en config.php el transporte por defecto es 'mail'.
 */
final class Mailer
{
    /** Caracteres prohibidos en cabeceras: cortan el mensaje e inyectan otras. */
    private static function sanitizeHeader(string $value): string
    {
        // Elimina CR, LF y NUL — el vector clásico de inyección de cabeceras.
        $value = str_replace(["\r", "\n", "\0"], '', $value);
        return trim($value);
    }

    /** Codifica una cabecera con caracteres no ASCII (RFC 2047). */
    private static function encodeHeader(string $value): string
    {
        $value = self::sanitizeHeader($value);
        if ($value === '' || preg_match('/^[\x20-\x7E]*$/', $value)) return $value;
        return '=?UTF-8?B?' . base64_encode($value) . '?=';
    }

    /** Dirección validada; devuelve '' si no es un correo aceptable. */
    private static function addr(string $email): string
    {
        $clean = self::sanitizeHeader($email);
        return Validate::email($clean) ?? '';
    }

    private static function cfg(): array
    {
        $c = (array) Config::get('mail', []);
        return $c + [
            'transport' => 'mail',
            'from'      => 'no-reply@localhost',
            'from_name' => 'La Mejor Taza',
            'reply_to'  => '',
            'log_file'  => '',
            'smtp'      => [],
        ];
    }

    /**
     * Ruta del fichero de bitácora del transporte 'log'.
     *
     * Ese fichero contiene los mensajes ENTEROS, incluidas las contraseñas
     * temporales de los promotores. Si cae dentro del document root, un GET a
     * /db/correo-salida.log entrega las credenciales a cualquiera. Por eso:
     *   1) se prefiere el directorio temporal del sistema, fuera del sitio;
     *   2) si el operador fija `mail.log_file` a mano se respeta, pero se crea
     *      con permisos 0600 y acompañado de un .htaccess de denegación;
     *   3) el nombre lleva un sufijo derivado de app_secret para que no sea
     *      adivinable aunque acabe siendo servible.
     */
    private static function rutaLog(array $cfg): string
    {
        $sufijo = substr(hash_hmac('sha256', 'mail-log', (string) Config::get('app_secret', '')), 0, 12);
        $indicado = (string) ($cfg['log_file'] ?? '');
        if ($indicado !== '') return $indicado;

        $tmp = sys_get_temp_dir();
        if ($tmp && is_dir($tmp) && is_writable($tmp)) {
            return rtrim($tmp, '/') . '/lmt-correo-' . $sufijo . '.log';
        }
        return dirname(__DIR__, 2) . '/db/correo-salida-' . $sufijo . '.log';
    }

    /**
     * Envía un correo con partes texto y HTML.
     *
     * @param string $tipo etiqueta para la bitácora (p.ej. 'clave_promotor')
     * @return bool true si el transporte aceptó el mensaje.
     */
    public static function send(string $to, string $toName, string $subject, string $html, string $text, string $tipo = 'generico'): bool
    {
        $cfg  = self::cfg();
        $dest = self::addr($to);
        if ($dest === '') {
            self::registrar($to, $subject, $tipo, (string) $cfg['transport'], false, 'destinatario_invalido');
            return false;
        }

        $from = self::addr((string) $cfg['from']);
        if ($from === '') {
            // Sin remitente válido ningún MTA aceptará el mensaje.
            self::registrar($dest, $subject, $tipo, (string) $cfg['transport'], false, 'remitente_invalido');
            return false;
        }

        $subject   = self::sanitizeHeader($subject);
        $boundary  = 'lmt-' . bin2hex(random_bytes(12));
        $fromName  = self::encodeHeader((string) $cfg['from_name']);
        $toHeader  = ($toName !== '' ? self::encodeHeader($toName) . ' ' : '') . '<' . $dest . '>';

        $headers = [
            'MIME-Version: 1.0',
            'From: ' . ($fromName !== '' ? $fromName . ' ' : '') . '<' . $from . '>',
            'Date: ' . date('r'),
            'Message-ID: <' . bin2hex(random_bytes(16)) . '@' . self::hostname($from) . '>',
            'X-Mailer: La Mejor Taza',
            'Auto-Submitted: auto-generated',
            'Content-Type: multipart/alternative; boundary="' . $boundary . '"',
        ];
        $replyTo = self::addr((string) $cfg['reply_to']);
        if ($replyTo !== '') $headers[] = 'Reply-To: <' . $replyTo . '>';

        $body = self::cuerpoMime($boundary, $text, $html);

        $transport = (string) $cfg['transport'];
        $ok = false;
        $error = null;
        try {
            if ($transport === 'log') {
                $ok = self::porLog($cfg, $toHeader, $subject, $headers, $body);
            } elseif ($transport === 'smtp') {
                $ok = self::porSmtp($cfg, $from, $dest, $toHeader, $subject, $headers, $body, $error);
            } else {
                $transport = 'mail';
                $ok = self::porMail($toHeader, $subject, $headers, $body, $from, $error);
            }
        } catch (\Throwable $e) {
            $ok = false;
            $error = $e->getMessage();
            error_log('[lmt][mailer] ' . $e->getMessage());
        }

        self::registrar($dest, $subject, $tipo, $transport, $ok, $error);
        return $ok;
    }

    private static function hostname(string $from): string
    {
        $parts = explode('@', $from);
        return $parts[1] ?? 'localhost';
    }

    private static function cuerpoMime(string $boundary, string $text, string $html): string
    {
        $nl = "\r\n";
        $out  = '--' . $boundary . $nl;
        $out .= 'Content-Type: text/plain; charset=UTF-8' . $nl;
        $out .= 'Content-Transfer-Encoding: base64' . $nl . $nl;
        $out .= chunk_split(base64_encode($text), 76, $nl) . $nl;
        $out .= '--' . $boundary . $nl;
        $out .= 'Content-Type: text/html; charset=UTF-8' . $nl;
        $out .= 'Content-Transfer-Encoding: base64' . $nl . $nl;
        $out .= chunk_split(base64_encode($html), 76, $nl) . $nl;
        $out .= '--' . $boundary . '--' . $nl;
        return $out;
    }

    private static function porMail(string $toHeader, string $subject, array $headers, string $body, string $from, ?string &$error): bool
    {
        if (!function_exists('mail')) {
            $error = 'mail_deshabilitada';
            return false;
        }
        // El destinatario va en el argumento, no en las cabeceras.
        $hdr = implode("\r\n", $headers);
        $ok = @mail($toHeader, self::encodeHeader($subject), $body, $hdr, '-f' . $from);
        if (!$ok) $error = 'mail_rechazado';
        return (bool) $ok;
    }

    private static function porLog(array $cfg, string $toHeader, string $subject, array $headers, string $body): bool
    {
        $file = self::rutaLog($cfg);
        $dir = dirname($file);
        if (!is_dir($dir)) @mkdir($dir, 0700, true);
        // Si el log acabó dentro del sitio, al menos que la carpeta niegue el
        // acceso por HTTP (cinturón además del tirante de db/.htaccess).
        if (strpos(realpath($dir) ?: $dir, dirname(__DIR__, 2)) === 0 && !is_file($dir . '/.htaccess')) {
            @file_put_contents($dir . '/.htaccess', "<IfModule mod_authz_core.c>\n  Require all denied\n</IfModule>\n");
        }
        $nuevo = !is_file($file);
        $dump = str_repeat('=', 72) . "\n"
              . 'FECHA: ' . date('c') . "\n"
              . 'PARA: ' . $toHeader . "\n"
              . 'ASUNTO: ' . $subject . "\n"
              . implode("\n", $headers) . "\n\n"
              . $body . "\n";
        $ok = @file_put_contents($file, $dump, FILE_APPEND | LOCK_EX) !== false;
        // Sólo el usuario del servidor web: en hosting compartido 0644 significa
        // que los demás inquilinos leen las contraseñas temporales.
        if ($ok && $nuevo) @chmod($file, 0600);
        return $ok;
    }

    /**
     * Cliente SMTP mínimo pero correcto: EHLO, STARTTLS opcional, AUTH
     * LOGIN/PLAIN, MAIL FROM/RCPT TO/DATA con dot-stuffing.
     */
    private static function porSmtp(array $cfg, string $from, string $dest, string $toHeader, string $subject, array $headers, string $body, ?string &$error): bool
    {
        $s = (array) ($cfg['smtp'] ?? []);
        $host    = (string) ($s['host'] ?? '');
        $port    = (int)    ($s['port'] ?? 587);
        $secure  = strtolower((string) ($s['secure'] ?? 'tls')); // 'tls' | 'ssl' | ''
        $user    = (string) ($s['user'] ?? '');
        $pass    = (string) ($s['password'] ?? '');
        $timeout = max(5, (int) ($s['timeout'] ?? 15));
        if ($host === '') { $error = 'smtp_sin_host'; return false; }

        $ctx = stream_context_create(['ssl' => [
            'verify_peer'       => true,
            'verify_peer_name'  => true,
            'allow_self_signed' => false,
            'SNI_enabled'       => true,
        ]]);
        $dsn = ($secure === 'ssl' ? 'ssl://' : 'tcp://') . $host . ':' . $port;
        $fp = @stream_socket_client($dsn, $errno, $errstr, $timeout, STREAM_CLIENT_CONNECT, $ctx);
        if (!$fp) { $error = 'smtp_conexion: ' . $errstr; return false; }
        stream_set_timeout($fp, $timeout);

        $leer = function () use ($fp): array {
            $data = '';
            while (($line = fgets($fp, 515)) !== false) {
                $data .= $line;
                // La última línea de una respuesta multilínea usa espacio tras el código.
                if (strlen($line) >= 4 && $line[3] === ' ') break;
            }
            return [(int) substr($data, 0, 3), $data];
        };
        $decir = function (string $cmd) use ($fp, $leer): array {
            fwrite($fp, $cmd . "\r\n");
            return $leer();
        };

        try {
            [$code] = $leer();
            if ($code !== 220) { $error = 'smtp_saludo_' . $code; return false; }

            $ehloHost = self::hostname($from);
            [$code, $resp] = $decir('EHLO ' . $ehloHost);
            if ($code !== 250) { $error = 'smtp_ehlo_' . $code; return false; }

            if ($secure === 'tls') {
                [$code] = $decir('STARTTLS');
                if ($code !== 220) { $error = 'smtp_starttls_' . $code; return false; }
                $cryptoOk = @stream_socket_enable_crypto(
                    $fp, true,
                    STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT | STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT
                );
                if (!$cryptoOk) { $error = 'smtp_tls_fallido'; return false; }
                [$code, $resp] = $decir('EHLO ' . $ehloHost);
                if ($code !== 250) { $error = 'smtp_ehlo2_' . $code; return false; }
            }

            if ($user !== '') {
                if (stripos($resp, 'AUTH') !== false && stripos($resp, 'PLAIN') !== false) {
                    [$code] = $decir('AUTH PLAIN ' . base64_encode("\0" . $user . "\0" . $pass));
                } else {
                    [$code] = $decir('AUTH LOGIN');
                    if ($code !== 334) { $error = 'smtp_auth_' . $code; return false; }
                    [$code] = $decir(base64_encode($user));
                    if ($code !== 334) { $error = 'smtp_auth_usuario_' . $code; return false; }
                    [$code] = $decir(base64_encode($pass));
                }
                if ($code !== 235) { $error = 'smtp_auth_rechazado_' . $code; return false; }
            }

            [$code] = $decir('MAIL FROM:<' . $from . '>');
            if ($code !== 250) { $error = 'smtp_mailfrom_' . $code; return false; }
            [$code] = $decir('RCPT TO:<' . $dest . '>');
            if ($code !== 250 && $code !== 251) { $error = 'smtp_rcpt_' . $code; return false; }
            [$code] = $decir('DATA');
            if ($code !== 354) { $error = 'smtp_data_' . $code; return false; }

            $mensaje = implode("\r\n", array_merge($headers, [
                'To: ' . $toHeader,
                'Subject: ' . self::encodeHeader($subject),
            ])) . "\r\n\r\n" . $body;
            // Dot-stuffing: una línea que empiece por '.' terminaría el DATA.
            $mensaje = preg_replace('/^\./m', '..', $mensaje);
            fwrite($fp, $mensaje . "\r\n.\r\n");
            [$code] = $leer();
            if ($code !== 250) { $error = 'smtp_envio_' . $code; return false; }

            $decir('QUIT');
            return true;
        } finally {
            @fclose($fp);
        }
    }

    /** Deja rastro del intento. Nunca revienta el flujo que la llamó. */
    private static function registrar(string $dest, string $asunto, string $tipo, string $transporte, bool $ok, ?string $error): void
    {
        try {
            Db::pdo()->prepare(
                'INSERT INTO emails_log (destinatario, asunto, tipo, transporte, estado, error, created_at)
                 VALUES (:d, :a, :t, :tr, :e, :err, CURRENT_TIMESTAMP)'
            )->execute([
                ':d'   => mb_substr($dest, 0, 254, 'UTF-8'),
                ':a'   => mb_substr($asunto, 0, 255, 'UTF-8'),
                ':t'   => mb_substr($tipo, 0, 40, 'UTF-8'),
                ':tr'  => mb_substr($transporte, 0, 20, 'UTF-8'),
                ':e'   => $ok ? 'enviado' : 'fallido',
                ':err' => $error === null ? null : mb_substr($error, 0, 500, 'UTF-8'),
            ]);
        } catch (\Throwable $e) {
            error_log('[lmt][mailer][log] ' . $e->getMessage());
        }
    }
}
