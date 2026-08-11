<?php
namespace LMT;
defined('LMT_GUARD') || exit('forbidden');

/**
 * Ajustes que se cambian desde el panel, guardados en la base.
 *
 * Por qué no se escribe `api/config.php`
 * --------------------------------------
 * Sería lo más directo, y es justo lo que no se debe hacer: un fichero PHP que
 * la propia aplicación reescribe con valores que vienen de un formulario es una
 * vía de ejecución de código a un paso de distancia, y además en la mayoría de
 * los hostings el usuario del servidor web no tiene permiso de escritura ahí
 * —el ajuste fallaría en silencio justo el día del evento—. Los ajustes viven
 * en una tabla y el fichero sigue siendo la base: lo de la tabla sólo lo pisa
 * cuando existe.
 *
 * Los secretos (la contraseña del SMTP) se cifran con `app_secret`. No protege
 * frente a quien ya tiene la base Y el fichero de configuración, pero sí frente
 * a lo que de verdad pasa: un volcado de la base que acaba en un correo, en una
 * copia de seguridad compartida o en el portátil de alguien.
 */
final class Ajustes
{
    private static ?array $cache = null;

    /** Lee un grupo de ajustes ya combinado con lo que traiga config.php. */
    public static function grupo(string $nombre, array $porDefecto = []): array
    {
        $guardado = self::todo()[$nombre] ?? [];
        return self::combinar($porDefecto, is_array($guardado) ? $guardado : []);
    }

    /** Combina recursivamente: lo guardado pisa a lo del fichero, clave a clave. */
    private static function combinar(array $base, array $encima): array
    {
        foreach ($encima as $k => $v) {
            if (is_array($v) && isset($base[$k]) && is_array($base[$k])) {
                $base[$k] = self::combinar($base[$k], $v);
            } elseif ($v !== null) {
                $base[$k] = $v;
            }
        }
        return $base;
    }

    /** Qué claves están sobrescritas desde el panel (para poder decirlo en la UI). */
    public static function origen(string $nombre): array
    {
        $g = self::todo()[$nombre] ?? [];
        return is_array($g) ? self::aplanar($g) : [];
    }

    private static function aplanar(array $a, string $prefijo = ''): array
    {
        $out = [];
        foreach ($a as $k => $v) {
            $clave = $prefijo === '' ? (string) $k : $prefijo . '.' . $k;
            if (is_array($v)) $out = array_merge($out, self::aplanar($v, $clave));
            else $out[] = $clave;
        }
        return $out;
    }

    public static function guardar(string $nombre, array $valores): void
    {
        $actual = self::todo();
        $actual[$nombre] = self::combinar(
            is_array($actual[$nombre] ?? null) ? $actual[$nombre] : [],
            $valores
        );
        self::escribir($nombre, $actual[$nombre]);
        self::$cache = $actual;
    }

    /** Devuelve el grupo a su estado de fábrica (el de config.php). */
    public static function olvidar(string $nombre): void
    {
        try {
            Db::pdo()->prepare('DELETE FROM ajustes WHERE clave = :c')->execute([':c' => $nombre]);
        } catch (\Throwable $e) {
            error_log('[lmt][ajustes] ' . $e->getMessage());
        }
        self::$cache = null;
    }

    private static function escribir(string $nombre, array $valor): void
    {
        $json = json_encode($valor, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $pdo = Db::pdo();
        $driver = $pdo->getAttribute(\PDO::ATTR_DRIVER_NAME);
        $sql = $driver === 'mysql'
            ? 'INSERT INTO ajustes (clave, valor, updated_at) VALUES (:c, :v, CURRENT_TIMESTAMP)
               ON DUPLICATE KEY UPDATE valor = VALUES(valor), updated_at = CURRENT_TIMESTAMP'
            : 'INSERT INTO ajustes (clave, valor, updated_at) VALUES (:c, :v, CURRENT_TIMESTAMP)
               ON CONFLICT(clave) DO UPDATE SET valor = :v2, updated_at = CURRENT_TIMESTAMP';
        $params = [':c' => $nombre, ':v' => $json];
        if ($driver !== 'mysql') $params[':v2'] = $json;
        $pdo->prepare($sql)->execute($params);
    }

    private static function todo(): array
    {
        if (self::$cache !== null) return self::$cache;
        self::$cache = [];
        try {
            $filas = Db::pdo()->query('SELECT clave, valor FROM ajustes')->fetchAll();
            foreach ($filas as $f) {
                $v = json_decode((string) $f['valor'], true);
                if (is_array($v)) self::$cache[(string) $f['clave']] = $v;
            }
        } catch (\Throwable $e) {
            // Instalación sin migrar: se sigue con lo del fichero, que es
            // exactamente el comportamiento anterior.
            error_log('[lmt][ajustes] ' . $e->getMessage());
        }
        return self::$cache;
    }

    // ---------------------------------------------------------------------
    // Secretos
    // ---------------------------------------------------------------------

    /** Marca con la que viajan los valores cifrados dentro del JSON. */
    private const PREFIJO = 'enc:v1:';

    public static function cifrar(string $claro): string
    {
        if ($claro === '') return '';
        $clave = self::claveDerivada();
        if (function_exists('sodium_crypto_secretbox')) {
            $nonce = random_bytes(SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
            $c = sodium_crypto_secretbox($claro, $nonce, $clave);
            return self::PREFIJO . 'sodium:' . base64_encode($nonce . $c);
        }
        if (function_exists('openssl_encrypt')) {
            $iv = random_bytes(12);
            $tag = '';
            $c = openssl_encrypt($claro, 'aes-256-gcm', $clave, OPENSSL_RAW_DATA, $iv, $tag);
            if ($c !== false) return self::PREFIJO . 'gcm:' . base64_encode($iv . $tag . $c);
        }
        // Sin ninguna de las dos no se guarda en claro un secreto: mejor que el
        // operador se entere de que su PHP no puede protegerlo.
        throw new \RuntimeException('sin_cifrado_disponible');
    }

    public static function descifrar(string $valor): string
    {
        if ($valor === '' || strpos($valor, self::PREFIJO) !== 0) return $valor;
        $resto = substr($valor, strlen(self::PREFIJO));
        [$algo, $b64] = array_pad(explode(':', $resto, 2), 2, '');
        $bin = base64_decode($b64, true);
        if ($bin === false) return '';
        $clave = self::claveDerivada();
        try {
            if ($algo === 'sodium' && function_exists('sodium_crypto_secretbox_open')) {
                $n = SODIUM_CRYPTO_SECRETBOX_NONCEBYTES;
                $r = sodium_crypto_secretbox_open(substr($bin, $n), substr($bin, 0, $n), $clave);
                return $r === false ? '' : $r;
            }
            if ($algo === 'gcm' && function_exists('openssl_decrypt')) {
                $r = openssl_decrypt(substr($bin, 28), 'aes-256-gcm', $clave, OPENSSL_RAW_DATA,
                    substr($bin, 0, 12), substr($bin, 12, 16));
                return $r === false ? '' : $r;
            }
        } catch (\Throwable $e) {
            error_log('[lmt][ajustes] descifrado: ' . $e->getMessage());
        }
        return '';
    }

    public static function esCifrado(string $valor): bool
    {
        return strpos($valor, self::PREFIJO) === 0;
    }

    private static function claveDerivada(): string
    {
        $secreto = (string) Config::get('app_secret', '');
        if ($secreto === '') throw new \RuntimeException('app_secret_vacio');
        return hash_hmac('sha256', 'ajustes-v1', $secreto, true);   // 32 bytes
    }
}
