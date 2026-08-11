<?php
namespace LMT;
defined('LMT_GUARD') || exit('forbidden');

final class Security
{
    /**
     * ¿La petición llegó por HTTPS?
     *
     * Detrás del proxy TLS institucional $_SERVER['HTTPS'] viene vacío y sólo
     * X-Forwarded-Proto dice la verdad. Mirar únicamente HTTPS significaba no
     * emitir nunca HSTS y, con force_https activo, entrar en un bucle de 301.
     * Las cabeceras X-Forwarded-* las puede falsear cualquiera si no hay un
     * proxy delante, así que sólo se tienen en cuenta cuando la configuración
     * declara que lo hay (`trust_proxy`).
     */
    public static function esHttps(): bool
    {
        if (!empty($_SERVER['HTTPS']) && strtolower((string) $_SERVER['HTTPS']) !== 'off') return true;
        if ((int) ($_SERVER['SERVER_PORT'] ?? 0) === 443) return true;
        if (!Config::get('trust_proxy', false)) return false;

        $proto = strtolower((string) ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? ''));
        if ($proto !== '') return explode(',', $proto)[0] === 'https';
        if (strtolower((string) ($_SERVER['HTTP_X_FORWARDED_SSL'] ?? '')) === 'on') return true;
        return false;
    }

    /**
     * URL pública base del sitio (esquema + host + subdirectorio), SIN confiar
     * en la cabecera Host.
     *
     * Host lo controla quien hace la petición. Construir enlaces con él permite
     * que un anónimo dispare un correo institucional cuyo botón "Revisar
     * solicitudes" apunte a su propio dominio: phishing al panel de
     * administración firmado por la Gobernación. Por eso el orden es:
     *   1) `public_base_url` de la configuración, si está;
     *   2) el Host de la petición SÓLO si coincide con `allowed_origins`;
     *   3) el primer `allowed_origins` como último recurso.
     */
    public static function baseUrlPublica(): string
    {
        $override = rtrim((string) Config::get('public_base_url', ''), '/');
        if ($override !== '') return $override;

        $permitidos = array_values(array_filter(array_map(
            [self::class, 'originOf'],
            (array) Config::get('allowed_origins', [])
        )));

        $scriptName = str_replace('\\', '/', (string) ($_SERVER['SCRIPT_NAME'] ?? '/api/index.php'));
        $appBase = rtrim((string) preg_replace('#/(api|install)(/[^/]*)?$#', '', $scriptName), '/');
        if ($appBase === '/' ) $appBase = '';

        $host = (string) ($_SERVER['HTTP_HOST'] ?? '');
        if (preg_match('/^[A-Za-z0-9.\-]{1,253}(:[0-9]{1,5})?$/', $host)) {
            $candidato = (self::esHttps() ? 'https' : 'http') . '://' . strtolower($host);
            if (in_array(self::originOf($candidato), $permitidos, true)) {
                return $candidato . $appBase;
            }
        }

        if ($permitidos) return $permitidos[0] . $appBase;
        // Sin lista blanca no hay forma segura de construir un enlace absoluto;
        // devolvemos sólo la ruta para que al menos sea relativa al sitio.
        return $appBase;
    }

    /** Aplica cabeceras de seguridad a toda respuesta de la API. */
    public static function applyHeaders(): void
    {
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: SAMEORIGIN');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        header('Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()');
        // La API sólo devuelve JSON, imágenes PNG (QR) y CSV: no necesita
        // ejecutar nada. Una CSP restrictiva aquí impide que una respuesta
        // reflejada se convierta en vector de ejecución.
        header("Content-Security-Policy: default-src 'none'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");

        if (self::esHttps()) {
            header('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');
        } elseif (Config::get('force_https')) {
            // El destino se construye con baseUrlPublica(), NO con Host: si no,
            // esto es un redirector abierto envenenable en caché que apunta a
            // donde quiera el atacante desde una URL legítima del dominio.
            // Sólo el origen (esquema://host) sale de la configuración; la ruta
            // es la que pidió el cliente, que ya incluye el subdirectorio.
            $origen = self::originOf(self::baseUrlPublica());
            if (strpos($origen, 'https://') !== 0) {
                Response::error(500, 'https_no_configurable');
            }
            $uri = (string) ($_SERVER['REQUEST_URI'] ?? '/');
            if ($uri === '' || $uri[0] !== '/') $uri = '/';
            header('Cache-Control: no-store');
            header('Location: ' . $origen . $uri, true, 301);
            exit;
        }
    }

    /** Devuelve el cuerpo JSON decodificado o array vacío. */
    public static function jsonBody(): array
    {
        $raw = file_get_contents('php://input') ?: '';
        if ($raw === '') return [];
        if (strlen($raw) > 65536) Response::error(413, 'payload_too_large');
        $data = json_decode($raw, true, 8);
        if (!is_array($data) || json_last_error() !== JSON_ERROR_NONE) {
            Response::error(400, 'bad_json');
        }
        // Los validadores esperan escalares. Un {"stand":["st-01"]} llegaba
        // hasta Validate::standId(), que declara ?string, y reventaba con un
        // TypeError: 500 sin autenticar y una traza en el log del servidor por
        // cada intento. Los valores no escalares se descartan de raíz.
        foreach ($data as $clave => $valor) {
            if ($valor !== null && !is_scalar($valor) && !is_array($valor)) {
                unset($data[$clave]);
            } elseif (is_array($valor)) {
                // Sólo se admiten arrays de un nivel con valores escalares
                // (p. ej. coords). Cualquier otra cosa se descarta.
                foreach ($valor as $sub) {
                    if ($sub !== null && !is_scalar($sub)) { unset($data[$clave]); break; }
                }
            }
        }
        return $data;
    }

    /**
     * En métodos no seguros exige:
     *  - Origin/Referer dentro de la lista blanca
     *  - Header X-CSRF-Token igual al token de sesión
     */
    /**
     * Normaliza una URL al "origin" (esquema://host[:puerto]) usado por el
     * navegador en el header Origin.
     */
    private static function originOf(string $url): string
    {
        $u = parse_url(trim($url));
        if (!$u || empty($u['scheme']) || empty($u['host'])) return rtrim($url, '/');
        $o = strtolower($u['scheme']) . '://' . strtolower($u['host']);
        if (!empty($u['port'])) $o .= ':' . $u['port'];
        return $o;
    }

    public static function requireCsrfAndOrigin(): void
    {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        if (in_array($method, ['GET', 'HEAD', 'OPTIONS'], true)) return;

        $allowed = (array) Config::get('allowed_origins', []);
        $allowedOrigins = array_map([self::class, 'originOf'], $allowed);

        $origin  = $_SERVER['HTTP_ORIGIN']  ?? '';
        $referer = $_SERVER['HTTP_REFERER'] ?? '';

        // Sólo se compara el ORIGEN normalizado, nunca por prefijo de cadena.
        // El fallback anterior hacía stripos($referer, 'http://127.0.0.1:8080')
        // === 0, así que un Referer de http://127.0.0.1:8080.evil.com pasaba el
        // filtro: dominio ajeno, prefijo idéntico. Comprobado explotable.
        // Origen de la propia petición. El navegador NUNCA deja que una página
        // ajena falsifique Origin: si la petición sale de evil.com, Origin dice
        // evil.com. Por eso comparar Origin con el Host de la petición es una
        // comprobación anti-CSRF válida y es la que usan Django o Rails.
        //
        // Antes sólo valía la coincidencia exacta con `allowed_origins`, y eso
        // convertía un detalle de configuración en una avería: si el sitio se
        // instaló con una URL y se accede con otra (www frente a sin www, o el
        // dominio real que nunca se añadió a la lista), TODAS las acciones
        // fallaban con origin_not_allowed mientras las lecturas seguían
        // funcionando — el síntoma exacto de "puedo ver la lista pero el botón
        // no hace nada". La lista blanca se mantiene, pero para autorizar
        // orígenes DISTINTOS del propio, que es para lo que sirve.
        $host = (string) ($_SERVER['HTTP_HOST'] ?? '');
        $propio = preg_match('/^[A-Za-z0-9.\-]{1,253}(:[0-9]{1,5})?$/', $host)
            ? (self::esHttps() ? 'https' : 'http') . '://' . strtolower($host)
            : '';

        $aceptable = function (string $url) use ($allowedOrigins, $propio): bool {
            $o = self::originOf($url);
            if ($propio !== '' && $o === $propio) return true;
            // El esquema puede diferir del detectado (proxy TLS sin trust_proxy);
            // el host es lo que de verdad decide si es el mismo sitio.
            if ($propio !== '' && parse_url($o, PHP_URL_HOST) === parse_url($propio, PHP_URL_HOST)) return true;
            return in_array($o, $allowedOrigins, true);
        };

        $ok = false;
        if ($origin !== '' && $origin !== 'null') {
            $ok = $aceptable($origin);
        } elseif ($referer !== '') {
            // Referer sólo como suplente cuando el navegador no manda Origin.
            $ok = $aceptable($referer);
        }
        if (!$ok) Response::error(403, 'origin_not_allowed');

        $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
        if (!Session::checkCsrf($token)) {
            Response::error(403, 'csrf_invalid');
        }
    }

    public static function requireAdmin(): void
    {
        if (!Session::isAdmin()) Response::error(401, 'unauthorized');
    }

    /**
     * Exige una sesión de promotor y devuelve su id.
     *
     * Por defecto RECHAZA a quien aún no ha cambiado la contraseña temporal:
     * la clave viaja por correo, así que mientras siga vigente el promotor no
     * debe poder hacer nada salvo cambiarla. Los endpoints de ese trámite
     * pasan $permitirClaveTemporal = true.
     */
    public static function requirePromotor(bool $permitirClaveTemporal = false): int
    {
        $p = Session::promotor();
        if ($p === null) Response::error(401, 'unauthorized');
        if (!$permitirClaveTemporal && $p['must_change']) {
            Response::error(403, 'password_change_required');
        }
        return $p['id'];
    }

    public static function hashPassword(string $plain): string
    {
        $pepper = (string) Config::get('pepper', '');
        $hmac = hash_hmac('sha256', $plain, $pepper, true);
        $payload = base64_encode($hmac);

        // Argon2id con 64 MiB puede fallar en un hosting compartido con el
        // límite de memoria justo: PHP 8 lanza entonces una excepción y la
        // petición muere con un 500 opaco. install.php ya tenía este respaldo;
        // el código en caliente no, así que verificar un promotor reventaba
        // justo en el servidor donde más falta hace que funcione.
        if (defined('PASSWORD_ARGON2ID')) {
            try {
                $h = @password_hash($payload, PASSWORD_ARGON2ID, [
                    'memory_cost' => 65536,
                    'time_cost'   => 4,
                    'threads'     => 2,
                ]);
                if (is_string($h) && $h !== '') return $h;
                error_log('[lmt][hash] Argon2id devolvió un valor vacío; se usa bcrypt.');
            } catch (\Throwable $e) {
                error_log('[lmt][hash] Argon2id no disponible (' . $e->getMessage() . '); se usa bcrypt.');
            }
        }

        $h = password_hash($payload, PASSWORD_BCRYPT, ['cost' => 12]);
        if (!is_string($h) || $h === '') {
            // Sin hash no se puede guardar nada: mejor fallar aquí, con un
            // código claro, que escribir una contraseña vacía en la base.
            throw new \RuntimeException('no_se_pudo_generar_el_hash');
        }
        return $h;
    }

    public static function verifyPassword(string $plain, string $hash): bool
    {
        $pepper = (string) Config::get('pepper', '');
        $hmac = hash_hmac('sha256', $plain, $pepper, true);
        return password_verify(base64_encode($hmac), $hash);
    }

    public static function constantTimeEquals(string $a, string $b): bool
    {
        return hash_equals($a, $b);
    }

    /**
     * Contraseña temporal para un promotor recién verificado.
     *
     * Va a llegar por correo y alguien la va a teclear desde el móvil, así que
     * se excluyen los caracteres que se confunden al leer (O/0, l/1/I) y se
     * agrupa con guiones. Cuatro grupos de cuatro sobre un alfabeto de 54
     * símbolos son ~92 bits de entropía: de sobra frente a fuerza bruta, y la
     * clave caduca en 72 horas de todos modos.
     */
    public static function generarClaveTemporal(): string
    {
        $minus  = 'abcdefghijkmnopqrstuvwxyz';   // sin l
        $mayus  = 'ABCDEFGHJKLMNPQRSTUVWXYZ';    // sin I ni O
        $digito = '23456789';                    // sin 0 ni 1
        $alfabeto = $minus . $mayus . $digito;

        $tomar = function (string $pool): string {
            return $pool[random_int(0, strlen($pool) - 1)];
        };

        // Garantizamos al menos un carácter de cada clase y rellenamos el resto.
        $chars = [$tomar($minus), $tomar($mayus), $tomar($digito)];
        while (count($chars) < 16) $chars[] = $tomar($alfabeto);

        // Barajado Fisher-Yates con random_int (no shuffle(), que usa un PRNG
        // no criptográfico).
        for ($i = count($chars) - 1; $i > 0; $i--) {
            $j = random_int(0, $i);
            [$chars[$i], $chars[$j]] = [$chars[$j], $chars[$i]];
        }

        return implode('-', str_split(implode('', $chars), 4));
    }
}
