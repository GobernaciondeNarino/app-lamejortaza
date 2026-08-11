<?php
namespace LMT;
defined('LMT_GUARD') || exit('forbidden');

/**
 * Recepción de imágenes (logo de empresa y fotos de producto).
 *
 * Una carpeta de subidas es la vía de entrada favorita para colocar una
 * webshell, así que aquí no se confía en NADA que venga del cliente:
 *
 *  - El nombre original se descarta por completo; el fichero se guarda con un
 *    nombre aleatorio y la extensión se deduce del tipo de imagen detectado.
 *  - El tipo se detecta con getimagesize() y finfo, nunca con $_FILES['type']
 *    (lo pone el navegador) ni con la extensión.
 *  - Si GD está disponible la imagen se RE-CODIFICA. Eso destruye cualquier
 *    carga útil escondida en los metadatos (el clásico polyglot GIF/PHP) y de
 *    paso quita los EXIF, que en fotos de móvil llevan coordenadas GPS —
 *    dato personal que no tenemos por qué almacenar (Ley 1581/2012).
 *  - La carpeta recibe un .htaccess que apaga cualquier motor de scripts.
 */
final class Uploads
{
    private const TIPOS = [
        IMAGETYPE_JPEG => ['ext' => 'jpg',  'mime' => 'image/jpeg'],
        IMAGETYPE_PNG  => ['ext' => 'png',  'mime' => 'image/png'],
        IMAGETYPE_WEBP => ['ext' => 'webp', 'mime' => 'image/webp'],
    ];

    public static function maxBytes(): int
    {
        $cfg = (array) Config::get('uploads', []);
        return max(65536, (int) ($cfg['max_bytes'] ?? 3 * 1024 * 1024));
    }

    private static function maxDim(): int
    {
        $cfg = (array) Config::get('uploads', []);
        return max(320, min(4000, (int) ($cfg['max_dim'] ?? 1600)));
    }

    /** Raíz absoluta donde viven las subidas. */
    public static function raiz(): string
    {
        $cfg = (array) Config::get('uploads', []);
        $dir = (string) ($cfg['dir'] ?? '');
        if ($dir === '') $dir = dirname(__DIR__, 2) . '/uploads';
        return rtrim($dir, '/');
    }

    /**
     * Valida y almacena una imagen subida.
     *
     * @param array  $file  entrada de $_FILES
     * @param string $sub   subcarpeta relativa (se normaliza; sólo [a-z0-9/_-])
     * @return string ruta relativa a la raíz del sitio, p.ej. "uploads/promotores/7/ab12.jpg"
     * @throws \RuntimeException con un código de error estable como mensaje
     */
    public static function imagen(array $file, string $sub): string
    {
        $err = (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE);
        if ($err === UPLOAD_ERR_INI_SIZE || $err === UPLOAD_ERR_FORM_SIZE) throw new \RuntimeException('archivo_muy_grande');
        if ($err === UPLOAD_ERR_NO_FILE) throw new \RuntimeException('archivo_ausente');
        if ($err !== UPLOAD_ERR_OK) throw new \RuntimeException('subida_fallida');

        $tmp = (string) ($file['tmp_name'] ?? '');
        if ($tmp === '' || !is_uploaded_file($tmp)) throw new \RuntimeException('archivo_invalido');

        $size = (int) ($file['size'] ?? 0);
        if ($size <= 0 || $size > self::maxBytes()) throw new \RuntimeException('archivo_muy_grande');

        // Tipo real de la imagen. getimagesize devuelve false para cualquier
        // cosa que no sea una imagen que la propia PHP sepa decodificar.
        $info = @getimagesize($tmp);
        if (!is_array($info) || empty($info[2])) throw new \RuntimeException('no_es_imagen');
        $tipo = (int) $info[2];
        if (!isset(self::TIPOS[$tipo])) throw new \RuntimeException('formato_no_permitido');

        [$ancho, $alto] = [(int) $info[0], (int) $info[1]];
        if ($ancho < 16 || $alto < 16) throw new \RuntimeException('imagen_muy_pequena');
        if ($ancho > 8000 || $alto > 8000) throw new \RuntimeException('imagen_muy_grande');

        // Segunda opinión independiente sobre el tipo MIME.
        if (class_exists('\finfo')) {
            $fi = new \finfo(FILEINFO_MIME_TYPE);
            $mime = (string) $fi->file($tmp);
            if ($mime !== self::TIPOS[$tipo]['mime']) throw new \RuntimeException('formato_no_permitido');
        }

        $ext  = self::TIPOS[$tipo]['ext'];
        $dir  = self::prepararDirectorio($sub);
        $rel  = self::subRelativa($sub);
        $name = bin2hex(random_bytes(16)) . '.' . $ext;
        $destino = $dir . '/' . $name;

        if (!self::recodificar($tmp, $destino, $tipo, $ancho, $alto)) {
            // Sin GD: guardamos el original tal cual, pero ya validado como
            // imagen real y con nombre y extensión controlados por nosotros.
            if (!@move_uploaded_file($tmp, $destino)) throw new \RuntimeException('no_se_pudo_guardar');
        }
        @chmod($destino, 0640);

        return 'uploads/' . $rel . '/' . $name;
    }

    /** Re-codifica con GD. Devuelve false si GD no está disponible. */
    private static function recodificar(string $origen, string $destino, int $tipo, int $ancho, int $alto): bool
    {
        if (!function_exists('imagecreatefromjpeg')) return false;
        $src = null;
        try {
            if ($tipo === IMAGETYPE_JPEG)      $src = @imagecreatefromjpeg($origen);
            elseif ($tipo === IMAGETYPE_PNG)   $src = @imagecreatefrompng($origen);
            elseif ($tipo === IMAGETYPE_WEBP && function_exists('imagecreatefromwebp')) $src = @imagecreatefromwebp($origen);
            if (!$src) return false;

            $max = self::maxDim();
            $escala = min(1.0, $max / max($ancho, $alto));
            $nw = max(1, (int) round($ancho * $escala));
            $nh = max(1, (int) round($alto * $escala));

            $dst = imagecreatetruecolor($nw, $nh);
            if (!$dst) return false;
            if ($tipo === IMAGETYPE_PNG || $tipo === IMAGETYPE_WEBP) {
                imagealphablending($dst, false);
                imagesavealpha($dst, true);
                $transparente = imagecolorallocatealpha($dst, 0, 0, 0, 127);
                imagefilledrectangle($dst, 0, 0, $nw, $nh, $transparente);
            }
            imagecopyresampled($dst, $src, 0, 0, 0, 0, $nw, $nh, $ancho, $alto);

            $ok = false;
            if ($tipo === IMAGETYPE_JPEG)      $ok = imagejpeg($dst, $destino, 85);
            elseif ($tipo === IMAGETYPE_PNG)   $ok = imagepng($dst, $destino, 6);
            elseif ($tipo === IMAGETYPE_WEBP)  $ok = function_exists('imagewebp') ? imagewebp($dst, $destino, 85) : false;
            imagedestroy($dst);
            return (bool) $ok;
        } catch (\Throwable $e) {
            error_log('[lmt][uploads] ' . $e->getMessage());
            return false;
        } finally {
            if ($src) @imagedestroy($src);
        }
    }

    /** Normaliza la subcarpeta: sin traversal, sin sorpresas. */
    private static function subRelativa(string $sub): string
    {
        $sub = strtolower(trim($sub, '/'));
        $sub = preg_replace('#[^a-z0-9/_-]+#', '', $sub) ?? '';
        $sub = preg_replace('#/{2,}#', '/', $sub) ?? '';
        $partes = array_values(array_filter(explode('/', $sub), fn($p) => $p !== '' && $p !== '.' && $p !== '..'));
        if (!$partes) throw new \RuntimeException('destino_invalido');
        return implode('/', $partes);
    }

    private static function prepararDirectorio(string $sub): string
    {
        $raiz = self::raiz();
        $dir = $raiz . '/' . self::subRelativa($sub);
        if (!is_dir($dir) && !@mkdir($dir, 0750, true) && !is_dir($dir)) {
            throw new \RuntimeException('no_se_pudo_crear_directorio');
        }
        self::protegerRaiz($raiz);
        return $dir;
    }

    /**
     * Escribe (una vez) el .htaccess que impide ejecutar código en la carpeta.
     * Cada directiva va envuelta en <IfModule> porque en hosts con
     * AllowOverride restrictivo una directiva desconocida devuelve un 500.
     */
    private static function protegerRaiz(string $raiz): void
    {
        $ht = $raiz . '/.htaccess';
        if (is_file($ht)) return;
        $contenido = <<<HT
# Generado por La Mejor Taza. No editar a mano.
# Esta carpeta sólo contiene imágenes subidas por promotores: aquí NUNCA debe
# ejecutarse código, pase lo que pase con la validación de la subida.

<IfModule mod_php.c>
  php_flag engine off
</IfModule>
<IfModule mod_php7.c>
  php_flag engine off
</IfModule>
<IfModule mod_php8.c>
  php_flag engine off
</IfModule>

<IfModule mod_mime.c>
  RemoveHandler .php .phtml .php3 .php4 .php5 .php7 .php8 .phps .cgi .pl .py .jsp .asp .shtml
  RemoveType .php .phtml .php3 .php4 .php5 .php7 .php8 .phps
</IfModule>

<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set Content-Security-Policy "default-src 'none'; img-src 'self'; sandbox"
  Header set Content-Disposition "inline"
</IfModule>

<IfModule mod_authz_core.c>
  <FilesMatch "(?i)\.(php|phtml|phar|cgi|pl|py|jsp|asp|sh|htaccess)$">
    Require all denied
  </FilesMatch>
</IfModule>
HT;
        @file_put_contents($ht, $contenido);
    }

    /**
     * Borra una imagen previamente almacenada. Sólo acepta rutas con la forma
     * exacta que produce imagen(); cualquier otra cosa se ignora en silencio.
     */
    public static function borrar(?string $rutaRelativa): void
    {
        if (!is_string($rutaRelativa) || $rutaRelativa === '') return;
        if (!preg_match('#^uploads/([a-z0-9/_-]+/[0-9a-f]{32}\.(?:jpg|png|webp))$#', $rutaRelativa, $m)) return;
        // La ruta guardada es la ruta WEB ("uploads/..."); el prefijo se
        // reemplaza por la raíz real configurada, que puede estar en otro sitio.
        $real = realpath(self::raiz() . '/' . $m[1]);
        $raiz = realpath(self::raiz());
        if ($real && $raiz && strpos($real, $raiz . '/') === 0 && is_file($real)) {
            @unlink($real);
        }
    }
}
