<?php
namespace LMT;
defined('LMT_GUARD') || exit('forbidden');

final class Validate
{
    /**
     * Los validadores aceptan `mixed` a propósito. Con la firma `?string` un
     * cuerpo JSON como {"stand":["st-01"]} provocaba un TypeError y un 500 sin
     * autenticar, con traza en el log por cada intento. Un validador debe ser
     * una función total: para cualquier entrada, o un valor válido o null.
     */
    public static function email($value): ?string
    {
        if (!is_string($value)) return null;
        $value = trim(strtolower($value));
        if (strlen($value) < 5 || strlen($value) > 254) return null;
        if (!filter_var($value, FILTER_VALIDATE_EMAIL)) return null;
        // Doble chequeo con regex conservadora
        if (!preg_match('/\A[a-z0-9._%+\-]{1,64}@[a-z0-9.\-]{1,253}\.[a-z]{2,}\z/i', $value)) return null;
        return $value;
    }

    public static function standId($value): ?string
    {
        if (!is_string($value)) return null;
        $value = trim($value);
        if (!preg_match('/\A[a-z0-9\-]{2,32}\z/', $value)) return null;
        return $value;
    }

    public static function emoji($value): ?string
    {
        if (!is_string($value)) return null;
        return in_array($value, ['bueno', 'regular', 'malo'], true) ? $value : null;
    }

    /** Sanitiza texto libre: NFC, sin caracteres de control, longitud máxima. */
    public static function comment($value, int $max = 500): string
    {
        if (!is_scalar($value)) return '';
        $value = (string) $value;
        // function_exists() NO ve los métodos estáticos de una clase: el
        // chequeo anterior daba false incluso con la extensión intl cargada, y
        // la normalización NFC prometida en el comentario nunca ocurría.
        if (class_exists('\Normalizer')) {
            $value = \Normalizer::normalize($value, \Normalizer::FORM_C) ?: $value;
        }
        // Controles C0 y DEL.
        $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $value) ?? '';
        // Caracteres invisibles y de control bidireccional. Sobrevivían al
        // filtro anterior y llegaban al feed público y al CSV que abre un
        // funcionario: RLO/LRO permiten mostrar un texto al revés del que se
        // almacena (suplantación visual y evasión de moderación), y los
        // separadores de línea U+2028/2029 rompen el CSV.
        $value = preg_replace('/[\x{200B}-\x{200F}\x{202A}-\x{202E}\x{2060}-\x{2064}\x{2066}-\x{2069}\x{FEFF}\x{2028}\x{2029}]/u', '', $value) ?? '';
        $value = preg_replace('/\s+/u', ' ', $value) ?? '';
        $value = trim($value);
        if (mb_strlen($value, 'UTF-8') > $max) {
            $value = mb_substr($value, 0, $max, 'UTF-8');
        }
        return $value;
    }

    public static function bool($value): ?bool
    {
        if (is_bool($value)) return $value;
        if ($value === 1 || $value === '1' || $value === 'true') return true;
        if ($value === 0 || $value === '0' || $value === 'false') return false;
        return null;
    }

    /**
     * Texto corto de una línea: recorta, limpia controles y aplica un máximo.
     * Devuelve '' cuando no hay valor utilizable — quien llame decide si eso
     * es un error o simplemente un campo opcional vacío.
     */
    public static function texto($value, int $max = 120): string
    {
        if (!is_scalar($value)) return '';
        return self::comment((string) $value, $max);
    }

    /**
     * Un secreto tal y como se pega desde otra pantalla.
     *
     * Google enseña la contraseña de aplicación en cuatro grupos de cuatro
     * —«abcd efgh ijkl mnop»— y quien la copia se lleva los espacios. El SMTP
     * espera los 16 caracteres seguidos y con espacios responde
     * «535 Username and Password not accepted», que es exactamente el error de
     * una contraseña equivocada: nadie sospecha de tres blancos.
     *
     * Quitar sólo `\s` no basta. Copiar de una página web arrastra también
     * caracteres INVISIBLES —espacio de ancho cero, marcas de dirección, BOM—
     * que no son espacios para la expresión regular y sí rompen la
     * autenticación igual, con el mismo error y sin nada que ver en pantalla.
     * Aquí se van todos: ninguno puede formar parte de una contraseña de
     * verdad, y un carácter que no se ve no se puede depurar a ojo.
     */
    public static function secreto($value): string
    {
        if (!is_scalar($value)) return '';
        $v = (string) $value;
        if (class_exists('\Normalizer')) {
            $v = \Normalizer::normalize($v, \Normalizer::FORM_C) ?: $v;
        }
        // Controles C0, DEL y C1.
        $v = preg_replace('/[\x00-\x1F\x7F]|\x{0080}-\x{009F}/u', '', $v) ?? $v;
        // Invisibles: ancho cero, unión/separación, marcas bidi, BOM.
        $v = preg_replace('/[\x{200B}-\x{200F}\x{202A}-\x{202E}\x{2060}-\x{2064}\x{2066}-\x{2069}\x{FEFF}]/u', '', $v) ?? $v;
        // Cualquier espacio, incluidos los que no son el 0x20 de toda la vida.
        $v = preg_replace('/[\s\x{00A0}\x{1680}\x{2000}-\x{200A}\x{2028}\x{2029}\x{202F}\x{205F}\x{3000}]+/u', '', $v) ?? $v;
        return $v;
    }

    /**
     * Texto largo que SÍ conserva los saltos de párrafo.
     *
     * `texto()` aplasta todos los espacios en uno solo, que es lo correcto para
     * un nombre o una dirección y lo peor posible para un texto legal: la
     * política de tratamiento de datos que el organizador pega en el panel se
     * convertiría en un ladrillo de una sola línea. Aquí se limpia lo mismo
     * —controles, invisibles, bidi— pero las líneas se respetan.
     */
    public static function parrafos($value, int $max = 8000): string
    {
        if (!is_scalar($value)) return '';
        $v = str_replace(["\r\n", "\r"], "\n", (string) $value);
        // Se trocea por líneas y cada una pasa por el saneado de siempre. Así
        // el filtro de caracteres peligrosos es exactamente el mismo, sin una
        // segunda copia que se pueda quedar atrás.
        $lineas = array_map(fn($l) => self::comment($l, $max), explode("\n", $v));
        // Nunca más de dos saltos seguidos: separar párrafos, no dejar huecos.
        $out = preg_replace("/\n{3,}/", "\n\n", implode("\n", $lineas)) ?? '';
        $out = trim($out);
        return mb_strlen($out, 'UTF-8') > $max ? mb_substr($out, 0, $max, 'UTF-8') : $out;
    }

    /** Nombre de persona o de empresa. null si está vacío o pasa del máximo. */
    public static function nombre($value, int $max = 120): ?string
    {
        $v = self::texto($value, $max + 1);
        if ($v === '' || mb_strlen($v, 'UTF-8') > $max) return null;
        return $v;
    }

    /**
     * Teléfono: SÓLO dígitos, y se guardan sólo dígitos.
     *
     * Se aceptan los separadores al escribir —«315 778 8990», «(2) 731 4455»—
     * y se descartan al guardar. La forma en que cada persona escribe su
     * número no es un dato: lo único que importa es el número, y guardarlo tal
     * cual metía en la base el mismo teléfono de cuatro maneras distintas, que
     * luego no cuadra al buscar ni al comparar.
     *
     * De 7 a 15 dígitos: cabe un fijo de Pasto y un móvil con indicativo de
     * país, y no cabe una cédula tecleada en la casilla equivocada.
     */
    public static function telefono($value): ?string
    {
        if (!is_scalar($value)) return null;
        $v = trim((string) $value);
        if ($v === '') return null;
        // Sólo se descartan separadores; una letra invalida el campo entero,
        // porque casi siempre significa que ahí va otra cosa.
        if (!preg_match('/\A[0-9+()\-. ]{7,32}\z/', $v)) return null;
        $d = preg_replace('/\D+/', '', $v) ?? '';
        return (strlen($d) >= 7 && strlen($d) <= 15) ? $d : null;
    }

    /**
     * Documento de identidad o NIT: SÓLO dígitos, y se guardan sólo dígitos.
     *
     * Mismo criterio que el teléfono. Una cédula se escribe con puntos, sin
     * puntos o con espacios, y un NIT con el dígito de verificación separado
     * por un guion; todo eso son formas de escribir el mismo número. Se
     * conserva el dígito de verificación —es parte del NIT—, sólo desaparece
     * el guion.
     */
    public static function documento($value): ?string
    {
        if (!is_scalar($value)) return null;
        $v = trim((string) $value);
        if ($v === '') return null;
        if (!preg_match('/\A[0-9.\- ]{4,32}\z/', $v)) return null;
        $d = preg_replace('/\D+/', '', $v) ?? '';
        return (strlen($d) >= 4 && strlen($d) <= 20) ? $d : null;
    }

    /** URL http/https. Rechaza javascript:, data: y demás esquemas. */
    public static function url($value, int $max = 255): ?string
    {
        if (!is_scalar($value)) return null;
        $v = trim((string) $value);
        if ($v === '') return null;
        if (mb_strlen($v, 'UTF-8') > $max) return null;
        if (!preg_match('#^https?://#i', $v)) return null;
        if (!filter_var($v, FILTER_VALIDATE_URL)) return null;
        // Sin caracteres de control ni espacios que permitan camuflar destinos.
        if (preg_match('/[\x00-\x20"\'<>]/', $v)) return null;
        return $v;
    }

    /** Entero dentro de un rango. null si no es un entero válido. */
    public static function entero($value, int $min, int $max): ?int
    {
        if (is_bool($value) || $value === null || $value === '') return null;
        if (!is_numeric($value)) return null;
        $n = (int) $value;
        if ((string) $n !== (string) (int) (float) $value) {
            // Descarta "1.5" o notación exponencial disfrazada de entero.
            if ((float) $value != (float) $n) return null;
        }
        if ($n < $min || $n > $max) return null;
        return $n;
    }

    /** Precio en pesos: no negativo y con dos decimales como mucho. */
    public static function precio($value): ?float
    {
        if ($value === null || $value === '') return null;
        if (!is_numeric($value)) return null;
        $f = round((float) $value, 2);
        if ($f < 0 || $f > 99999999.99) return null;
        return $f;
    }

    /**
     * Política de contraseña para promotores. Devuelve null si es aceptable,
     * o un código de error estable si no lo es.
     */
    public static function passwordDebil(string $pwd, string $email = '', string $nombre = ''): ?string
    {
        $len = strlen($pwd);
        if ($len < 10)  return 'password_corta';
        if ($len > 128) return 'password_larga';
        $clases = 0;
        if (preg_match('/[a-z]/u', $pwd)) $clases++;
        if (preg_match('/[A-Z]/u', $pwd)) $clases++;
        if (preg_match('/[0-9]/', $pwd))  $clases++;
        if (preg_match('/[^a-zA-Z0-9]/u', $pwd)) $clases++;
        if ($clases < 3) return 'password_simple';

        // La comparación se hace sin tildes y palabra por palabra. Con el
        // nombre completo y con tildes, "Chalparizan99!" pasaba el filtro
        // siendo justo el apellido de quien la elegía.
        $bajo = self::plegarAscii($pwd);
        $propias = [];
        if ($email !== '') {
            foreach (preg_split('/[^a-z0-9]+/', self::plegarAscii(explode('@', $email)[0])) ?: [] as $t) {
                $propias[] = $t;
            }
        }
        foreach (preg_split('/[^a-z0-9]+/', self::plegarAscii($nombre)) ?: [] as $t) {
            $propias[] = $t;
        }
        foreach ($propias as $propio) {
            if (strlen($propio) >= 4 && str_contains($bajo, $propio)) return 'password_predecible';
        }

        foreach (['lamejortaza', 'mejortaza', 'contrasena', 'password', 'narino', 'pasto',
                  '123456', 'qwerty', 'festival', 'cafe', 'admin', 'promotor'] as $comun) {
            if (str_contains($bajo, $comun)) return 'password_predecible';
        }
        return null;
    }

    /**
     * Minúsculas sin tildes ni diéresis. Comparar contraseñas contra nombres
     * propios en español exige esto: "Chalparizán" y "chalparizan" son la
     * misma palabra para quien elige la clave, aunque no lo sean para strpos.
     */
    public static function plegarAscii(string $s): string
    {
        $s = mb_strtolower(trim($s), 'UTF-8');
        $mapa = [
            'á'=>'a','à'=>'a','ä'=>'a','â'=>'a','ã'=>'a','å'=>'a',
            'é'=>'e','è'=>'e','ë'=>'e','ê'=>'e',
            'í'=>'i','ì'=>'i','ï'=>'i','î'=>'i',
            'ó'=>'o','ò'=>'o','ö'=>'o','ô'=>'o','õ'=>'o',
            'ú'=>'u','ù'=>'u','ü'=>'u','û'=>'u',
            'ñ'=>'n','ç'=>'c',
        ];
        return strtr($s, $mapa);
    }

    /** "María Chalparizán" -> "María C." — reconocible por su dueño, no por un tercero. */
    public static function iniciales(string $nombre): string
    {
        $nombre = self::comment($nombre, 120);
        if ($nombre === '') return '';
        $partes = preg_split('/\s+/u', $nombre) ?: [];
        if (count($partes) === 1) return $partes[0];
        return $partes[0] . ' ' . mb_strtoupper(mb_substr($partes[1], 0, 1, 'UTF-8'), 'UTF-8') . '.';
    }

    /**
     * Enmascara un correo para mostrarlo en público (feed de votos, pasaporte).
     *
     * Antes conservaba el dominio ENTERO: con "ju****@alcaldiapasto.gov.co" y
     * un directorio institucional, reidentificar a la persona es inmediato. Se
     * mantiene sólo el TLD y la inicial del dominio, que basta para que alguien
     * reconozca su propio correo sin que sirva para reidentificar a terceros.
     */
    public static function maskEmail(string $email): string
    {
        if (!self::email($email)) return '';
        [$user, $domain] = explode('@', $email);
        $head = mb_substr($user, 0, min(2, mb_strlen($user)));
        $userMask = $head . str_repeat('*', max(1, mb_strlen($user) - mb_strlen($head)));

        $partes = explode('.', $domain);
        $tld = count($partes) > 1 ? implode('.', array_slice($partes, -($partes[count($partes) - 2] === 'gov' || $partes[count($partes) - 2] === 'com' ? 2 : 1))) : '';
        $etiqueta = $partes[0];
        $domMask = mb_substr($etiqueta, 0, 1) . str_repeat('*', max(1, mb_strlen($etiqueta) - 1));

        return $userMask . '@' . $domMask . ($tld !== '' ? '.' . $tld : '');
    }
}
