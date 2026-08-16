<?php
namespace LMT;
defined('LMT_GUARD') || exit('forbidden');

use PDO;

final class RateLimit
{
    /**
     * Límites de reserva, por si el bucket no está en api/config.php.
     *
     * Hace falta porque config.php es del administrador y NO gana claves al
     * actualizar: un límite nuevo que sólo estuviera en config.example.php
     * quedaría sin efecto en toda instalación ya existente —y sin efecto aquí
     * significa sin límite ninguno, que es peor que no haberlo añadido—. Lo que
     * ponga el administrador manda; esto sólo cubre el hueco.
     */
    private const RESERVA = [
        'login'                 => ['window' => 600,  'max' => 5],
        'vote'                  => ['window' => 60,   'max' => 1],
        'vote_email'            => ['window' => 600,  'max' => 12],
        'pasaporte'             => ['window' => 60,   'max' => 20],
        'pasaporte_correo'      => ['window' => 3600, 'max' => 10],
        'promotor_registro'     => ['window' => 3600, 'max' => 5],
        'promotor_login'        => ['window' => 900,  'max' => 15],
        'promotor_upload'       => ['window' => 3600, 'max' => 60],
        'promotor_logo_publico' => ['window' => 3600, 'max' => 10],
        'perfil_visitante'      => ['window' => 600,  'max' => 30],
        'foto_visitante'        => ['window' => 3600, 'max' => 12],
        'perfil_enlace'         => ['window' => 3600, 'max' => 10],
        'perfil_enlace_correo'  => ['window' => 3600, 'max' => 3],
        'correo_prueba'         => ['window' => 600,  'max' => 10],
        'global'                => ['window' => 60,   'max' => 120],
    ];

    /**
     * Rate limit por (clave, ventana). Devuelve true si la solicitud es permitida.
     * Implementación: contador en DB con ventana fija. Suficiente para feria/POS.
     */
    public static function hit(string $bucket, string $subject): bool
    {
        $cfg = Config::get('rate_limits', []);
        $rule = $cfg[$bucket] ?? self::RESERVA[$bucket] ?? null;
        if (!$rule) return true;

        $window = (int)$rule['window'];
        $max    = (int)$rule['max'];
        $now    = time();
        $key    = hash('sha256', $bucket . '|' . $subject);

        $pdo = Db::pdo();

        try {
            // Incremento ATÓMICO: se escribe primero y se decide después con el
            // valor ya persistido.
            //
            // La versión anterior hacía SELECT, decidía en PHP y luego UPDATE.
            // Entre el SELECT y el UPDATE no había nada: N peticiones
            // simultáneas leían todas el mismo contador y todas pasaban. Con
            // 200 intentos de login en paralelo se probaban 200 contraseñas en
            // la ventana que debía permitir 5.
            $driver = $pdo->getAttribute(\PDO::ATTR_DRIVER_NAME);
            if ($driver === 'mysql') {
                $sql = 'INSERT INTO rate_limits (id, bucket, hits, window_start)
                        VALUES (:id, :b, 1, :ws)
                        ON DUPLICATE KEY UPDATE
                          hits = IF(:now1 - window_start >= :win1, 1, hits + 1),
                          window_start = IF(:now2 - window_start >= :win2, :now3, window_start)';
                $pdo->prepare($sql)->execute([
                    ':id' => $key, ':b' => $bucket, ':ws' => $now,
                    ':now1' => $now, ':win1' => $window,
                    ':now2' => $now, ':win2' => $window, ':now3' => $now,
                ]);
            } else {
                $sql = 'INSERT INTO rate_limits (id, bucket, hits, window_start)
                        VALUES (:id, :b, 1, :ws)
                        ON CONFLICT(id) DO UPDATE SET
                          hits = CASE WHEN :now1 - rate_limits.window_start >= :win1 THEN 1 ELSE rate_limits.hits + 1 END,
                          window_start = CASE WHEN :now2 - rate_limits.window_start >= :win2 THEN :now3 ELSE rate_limits.window_start END';
                $pdo->prepare($sql)->execute([
                    ':id' => $key, ':b' => $bucket, ':ws' => $now,
                    ':now1' => $now, ':win1' => $window,
                    ':now2' => $now, ':win2' => $window, ':now3' => $now,
                ]);
            }

            $sel = $pdo->prepare('SELECT hits FROM rate_limits WHERE id = :id');
            $sel->execute([':id' => $key]);
            $hits = (int) $sel->fetchColumn();

            return $hits <= $max;
        } catch (\Throwable $e) {
            // Antes devolvía Config::debug(), es decir false en producción: un
            // fallo de permisos sobre la tabla convertía el 100% del tráfico en
            // 429, incluido el login del administrador, y el mensaje de error
            // apuntaba al sitio equivocado. Ahora se distingue el bucket:
            // en los que protegen credenciales se sigue cerrando, y en el resto
            // se deja pasar para no tumbar la feria entera por una tabla rota.
            error_log('[lmt][ratelimit][' . $bucket . '] ' . $e->getMessage());
            return !in_array($bucket, ['login', 'promotor_login', 'promotor_registro'], true);
        }
    }

    public static function ipHash(): string
    {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        return hash_hmac('sha256', $ip, (string) Config::get('app_secret', ''));
    }
}
