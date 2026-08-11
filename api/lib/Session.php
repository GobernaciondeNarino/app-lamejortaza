<?php
namespace LMT;
defined('LMT_GUARD') || exit('forbidden');

final class Session
{
    public static function start(): void
    {
        if (session_status() === PHP_SESSION_ACTIVE) return;

        $cfg = Config::get('session', []);
        $secure = !empty($cfg['secure']) || Security::esHttps();

        // La cookie se limita al subdirectorio donde vive la app. Con path '/'
        // el identificador de sesión viaja también a las demás aplicaciones
        // alojadas en el mismo dominio institucional, que no tienen por qué
        // verlo. Si el operador fija 'path' a mano, se respeta.
        $path = (string) ($cfg['path'] ?? '');
        if ($path === '') {
            $script = str_replace('\\', '/', (string) ($_SERVER['SCRIPT_NAME'] ?? '/'));
            $base = rtrim((string) preg_replace('#/(api|install)(/[^/]*)?$#', '', $script), '/');
            $path = $base === '' ? '/' : $base . '/';
        }

        session_name($cfg['name'] ?? 'lmt_sid');
        session_set_cookie_params([
            'lifetime' => (int)($cfg['lifetime'] ?? 28800),
            'path'     => $path,
            'domain'   => $cfg['domain'] ?? '',
            'secure'   => $secure,
            'httponly' => true,
            'samesite' => $cfg['samesite'] ?? 'Strict',
        ]);
        // Endurecer (algunas directivas están deprecadas a partir de PHP 8.4)
        @ini_set('session.use_strict_mode', '1');
        @ini_set('session.use_only_cookies', '1');
        @ini_set('session.cookie_httponly', '1');
        @ini_set('session.use_trans_sid', '0');
        if (PHP_VERSION_ID < 80400) {
            @ini_set('session.sid_length', '64');
            @ini_set('session.sid_bits_per_character', '6');
        }

        session_start();

        // Detección básica de fijación: bind a UA + IP-prefix.
        $fp = self::fingerprint();
        if (empty($_SESSION['_fp'])) {
            $_SESSION['_fp'] = $fp;
        } elseif (!hash_equals($_SESSION['_fp'], $fp)) {
            self::destroy();
            session_start();
            $_SESSION['_fp'] = $fp;
        }

        // Rotación periódica del id (cada 30 min) para mitigar robo de cookie.
        $now = time();
        if (empty($_SESSION['_rotated_at']) || $now - (int)$_SESSION['_rotated_at'] > 1800) {
            session_regenerate_id(true);
            $_SESSION['_rotated_at'] = $now;
        }
    }

    public static function login(int $userId, string $email, bool $admin): void
    {
        session_regenerate_id(true);
        // Una sesión sólo puede ser de un actor: entrar como administrador
        // cierra cualquier sesión de promotor que hubiera en este navegador.
        unset($_SESSION['_pid'], $_SESSION['_pemail'], $_SESSION['_pmust']);
        $_SESSION['_uid']     = $userId;
        $_SESSION['_email']   = $email;
        $_SESSION['_admin']   = $admin;
        $_SESSION['_login_at']= time();
        $_SESSION['_csrf']    = bin2hex(random_bytes(32));
    }

    /**
     * Inicia sesión de PROMOTOR. Deliberadamente no toca _uid ni _admin: un
     * promotor jamás debe poder pasar por administrador, ni siquiera si alguien
     * confunde las comprobaciones más adelante.
     */
    public static function loginPromotor(int $promotorId, string $email, bool $debeCambiarClave): void
    {
        session_regenerate_id(true);
        unset($_SESSION['_uid'], $_SESSION['_email'], $_SESSION['_admin']);
        $_SESSION['_pid']     = $promotorId;
        $_SESSION['_pemail']  = $email;
        $_SESSION['_pmust']   = $debeCambiarClave;
        $_SESSION['_login_at']= time();
        $_SESSION['_csrf']    = bin2hex(random_bytes(32));
    }

    /** @return array{id:int,email:string,must_change:bool}|null */
    public static function promotor(): ?array
    {
        if (empty($_SESSION['_pid'])) return null;
        return [
            'id'          => (int) $_SESSION['_pid'],
            'email'       => (string) ($_SESSION['_pemail'] ?? ''),
            'must_change' => !empty($_SESSION['_pmust']),
        ];
    }

    public static function promotorId(): ?int
    {
        return empty($_SESSION['_pid']) ? null : (int) $_SESSION['_pid'];
    }

    /** Tras cambiar la contraseña se levanta la bandera sin rehacer el login. */
    public static function marcarClaveCambiada(): void
    {
        if (!empty($_SESSION['_pid'])) $_SESSION['_pmust'] = false;
    }

    public static function destroy(): void
    {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 3600,
                $params['path'], $params['domain'],
                $params['secure'], $params['httponly']
            );
        }
        session_destroy();
    }

    public static function user(): ?array
    {
        if (empty($_SESSION['_uid'])) return null;
        return [
            'id'    => (int)$_SESSION['_uid'],
            'email' => (string)$_SESSION['_email'],
            'admin' => !empty($_SESSION['_admin']),
        ];
    }

    /**
     * ¿La sesión actual es de un administrador vigente?
     *
     * No basta con mirar la bandera de la sesión: quitarle is_admin a alguien
     * en la base no lo expulsaba, y seguía teniendo acceso a los tres CSV
     * completos durante las 8 horas de vida de la cookie. Se revalida contra
     * la base como mucho una vez por minuto, que en un panel de administración
     * es un coste despreciable y cierra la ventana de revocación.
     */
    public static function isAdmin(): bool
    {
        if (empty($_SESSION['_admin']) || empty($_SESSION['_uid'])) return false;

        $ahora = time();
        if (!empty($_SESSION['_admin_check']) && $ahora - (int) $_SESSION['_admin_check'] < 60) {
            return true;
        }
        try {
            $stmt = Db::pdo()->prepare('SELECT is_admin FROM admins WHERE id = :id');
            $stmt->execute([':id' => (int) $_SESSION['_uid']]);
            $fila = $stmt->fetch();
            if (!$fila || empty($fila['is_admin'])) {
                self::destroy();
                return false;
            }
        } catch (\Throwable $e) {
            // Si la base no responde no expulsamos a nadie (la petición fallará
            // igualmente más adelante), pero tampoco marcamos como revalidado.
            error_log('[lmt][session] ' . $e->getMessage());
            return true;
        }
        $_SESSION['_admin_check'] = $ahora;
        return true;
    }

    public static function csrfToken(): string
    {
        if (empty($_SESSION['_csrf'])) {
            $_SESSION['_csrf'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['_csrf'];
    }

    public static function checkCsrf(?string $sent): bool
    {
        if ($sent === null || $sent === '') return false;
        $expected = $_SESSION['_csrf'] ?? '';
        return $expected !== '' && hash_equals($expected, $sent);
    }

    /**
     * Huella de la sesión: SÓLO el User-Agent.
     *
     * Antes incluía el prefijo /24 de la IP. En una feria eso hacía justo lo
     * contrario de lo previsto: dentro del recinto todos comparten la misma IP
     * (no distingue a nadie), y en datos móviles con CGNAT el prefijo cambia
     * solo cada pocos minutos, destruyendo la sesión de un visitante que estaba
     * a mitad de votar. Coste real alto, beneficio real nulo.
     *
     * El User-Agent sigue elevando el listón de la fijación de sesión sin
     * romperle nada a nadie: cambia sólo cuando el usuario actualiza el
     * navegador, y entonces volver a entrar es aceptable.
     */
    private static function fingerprint(): string
    {
        $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $secret = (string) Config::get('app_secret', '');
        return hash_hmac('sha256', $ua, $secret);
    }
}
