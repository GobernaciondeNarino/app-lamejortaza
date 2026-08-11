<?php
namespace LMT;
defined('LMT_GUARD') || exit('forbidden');

/**
 * Plantillas de los correos que envía el módulo de promotores.
 *
 * Cada plantilla devuelve ['asunto', 'html', 'texto']. El HTML va con estilos
 * en línea y una tabla de una columna porque los clientes de correo (Outlook
 * institucional incluido) ignoran <style> y CSS moderno. Todo dato variable
 * pasa por htmlspecialchars: el nombre de un promotor lo escribe el propio
 * promotor y acaba dentro de un correo que abre un funcionario.
 */
final class Correos
{
    /**
     * URL pública de la app, con subdirectorio incluido.
     *
     * Delega en Security::baseUrlPublica(), que NO confía en la cabecera Host:
     * estos enlaces viajan dentro de correos institucionales y un Host
     * manipulado convertía el aviso a los administradores en phishing con el
     * membrete de la Gobernación.
     */
    public static function baseUrl(): string
    {
        return Security::baseUrlPublica();
    }

    private static function h(string $s): string
    {
        return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    private static function envoltura(string $titulo, string $contenidoHtml): string
    {
        $t = self::h($titulo);
        return <<<HTML
<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>{$t}</title></head>
<body style="margin:0;padding:0;background:#f2ece0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2ece0;padding:24px 12px;">
<tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fbf7ef;border:1px solid #e0d6c2;border-radius:10px;overflow:hidden;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#2c2620;">
    <tr><td style="background:#2c2620;padding:22px 28px;color:#f2ece0;">
      <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#c9b99a;">Festival · Nariño 2026</div>
      <div style="font-size:26px;font-style:italic;font-family:Georgia,serif;margin-top:4px;">La Mejor Taza</div>
    </td></tr>
    <tr><td style="padding:28px;">{$contenidoHtml}</td></tr>
    <tr><td style="padding:18px 28px;background:#f2ece0;border-top:1px solid #e0d6c2;font-size:11px;color:#6d6154;line-height:1.6;">
      Mensaje automático de La Mejor Taza — Gobernación de Nariño. Por favor no respondas a este correo.<br>
      Tus datos se tratan conforme a la Ley 1581 de 2012 de protección de datos personales.
    </td></tr>
  </table>
</td></tr></table>
</body></html>
HTML;
    }

    /** Acuse de recibo de la solicitud de inscripción. */
    public static function solicitudRecibida(string $nombre): array
    {
        $n = self::h($nombre);
        $html = self::envoltura('Solicitud recibida', <<<HTML
<p style="font-size:16px;margin:0 0 14px;">Hola {$n},</p>
<p style="font-size:15px;line-height:1.65;margin:0 0 14px;">
  Recibimos tu solicitud para inscribirte como <strong>promotor de stand</strong> del festival.
  Un administrador la revisará en los próximos días hábiles.
</p>
<p style="font-size:15px;line-height:1.65;margin:0 0 14px;">
  Cuando quede aprobada te enviaremos a este mismo correo tu <strong>contraseña de acceso</strong>
  para que completes el perfil de tu empresa y cargues tus productos.
</p>
<p style="font-size:14px;color:#6d6154;line-height:1.6;margin:18px 0 0;">
  No necesitas hacer nada más por ahora.
</p>
HTML);
        $texto = "Hola {$nombre},\n\n"
            . "Recibimos tu solicitud para inscribirte como promotor de stand del festival La Mejor Taza.\n"
            . "Un administrador la revisará en los próximos días hábiles.\n\n"
            . "Cuando quede aprobada te enviaremos a este mismo correo tu contraseña de acceso para que\n"
            . "completes el perfil de tu empresa y cargues tus productos.\n\n"
            . "No necesitas hacer nada más por ahora.\n";
        return ['asunto' => 'Recibimos tu solicitud — La Mejor Taza', 'html' => $html, 'texto' => $texto];
    }

    /** El correo importante: credenciales tras la verificación del admin. */
    public static function credenciales(string $nombre, string $email, string $clave, int $horasVigencia): array
    {
        $n = self::h($nombre);
        $e = self::h($email);
        $c = self::h($clave);
        $url = self::h(self::baseUrl() . '/promotor');
        $html = self::envoltura('Tu acceso de promotor', <<<HTML
<p style="font-size:16px;margin:0 0 14px;">Hola {$n},</p>
<p style="font-size:15px;line-height:1.65;margin:0 0 18px;">
  Tu inscripción como promotor fue <strong>verificada</strong>. Ya puedes entrar y registrar
  los datos de tu empresa y de tus productos.
</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e0d6c2;border-radius:8px;margin:0 0 18px;">
  <tr><td style="padding:16px 18px;">
    <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#8a7c68;">Usuario</div>
    <div style="font-size:15px;margin:2px 0 14px;">{$e}</div>
    <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#8a7c68;">Contraseña temporal</div>
    <div style="font-family:Consolas,Menlo,monospace;font-size:21px;letter-spacing:1px;margin-top:4px;color:#8a3b1e;">{$c}</div>
  </td></tr>
</table>
<p style="margin:0 0 22px;">
  <a href="{$url}" style="display:inline-block;background:#2c2620;color:#f2ece0;text-decoration:none;padding:13px 24px;border-radius:999px;font-size:15px;">Entrar al portal del promotor</a>
</p>
<p style="font-size:14px;line-height:1.65;color:#6d6154;margin:0 0 8px;">
  <strong>Importante:</strong> esta contraseña caduca en {$horasVigencia} horas y el sistema te
  pedirá cambiarla la primera vez que entres. No la compartas con nadie: quien la tenga puede
  modificar la información de tu empresa.
</p>
<p style="font-size:14px;line-height:1.65;color:#6d6154;margin:0;">
  Si no solicitaste esta inscripción, avisa al equipo organizador y no uses este acceso.
</p>
HTML);
        $texto = "Hola {$nombre},\n\n"
            . "Tu inscripción como promotor del festival La Mejor Taza fue verificada.\n\n"
            . "Usuario: {$email}\n"
            . "Contraseña temporal: {$clave}\n\n"
            . "Entra aquí: " . self::baseUrl() . "/promotor\n\n"
            . "IMPORTANTE: esta contraseña caduca en {$horasVigencia} horas y deberás cambiarla la\n"
            . "primera vez que entres. No la compartas con nadie.\n\n"
            . "Si no solicitaste esta inscripción, avisa al equipo organizador y no uses este acceso.\n";
        return ['asunto' => 'Tu acceso de promotor — La Mejor Taza', 'html' => $html, 'texto' => $texto];
    }

    public static function rechazo(string $nombre, string $motivo): array
    {
        $n = self::h($nombre);
        $bloqueMotivo = $motivo !== ''
            ? '<p style="font-size:15px;line-height:1.65;margin:0 0 14px;"><strong>Motivo:</strong> ' . self::h($motivo) . '</p>'
            : '';
        $html = self::envoltura('Sobre tu solicitud', <<<HTML
<p style="font-size:16px;margin:0 0 14px;">Hola {$n},</p>
<p style="font-size:15px;line-height:1.65;margin:0 0 14px;">
  Revisamos tu solicitud para participar como promotor de stand y por ahora no fue aprobada.
</p>
{$bloqueMotivo}
<p style="font-size:15px;line-height:1.65;margin:0;">
  Si crees que se trata de un error o quieres aportar más información, responde al equipo
  organizador del festival y con gusto revisamos tu caso de nuevo.
</p>
HTML);
        $texto = "Hola {$nombre},\n\n"
            . "Revisamos tu solicitud para participar como promotor de stand del festival La Mejor Taza\n"
            . "y por ahora no fue aprobada.\n"
            . ($motivo !== '' ? "\nMotivo: {$motivo}\n" : '')
            . "\nSi crees que se trata de un error, comunícate con el equipo organizador.\n";
        return ['asunto' => 'Sobre tu solicitud de promotor — La Mejor Taza', 'html' => $html, 'texto' => $texto];
    }

    /** Aviso al administrador de que hay una solicitud esperando. */
    public static function avisoAdmin(string $nombreProm, string $emailProm, string $municipio): array
    {
        $n = self::h($nombreProm);
        $e = self::h($emailProm);
        $m = self::h($municipio !== '' ? $municipio : 'sin especificar');
        $url = self::h(self::baseUrl() . '/admin/promotores');
        $html = self::envoltura('Nueva solicitud de promotor', <<<HTML
<p style="font-size:15px;line-height:1.65;margin:0 0 14px;">Hay una nueva solicitud de inscripción de promotor pendiente de revisión.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e0d6c2;border-radius:8px;margin:0 0 18px;">
  <tr><td style="padding:16px 18px;font-size:15px;line-height:1.8;">
    <strong>{$n}</strong><br>{$e}<br><span style="color:#6d6154;">Municipio: {$m}</span>
  </td></tr>
</table>
<p style="margin:0;"><a href="{$url}" style="display:inline-block;background:#2c2620;color:#f2ece0;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:15px;">Revisar solicitudes</a></p>
HTML);
        $texto = "Nueva solicitud de promotor pendiente de revisión.\n\n"
            . "{$nombreProm}\n{$emailProm}\nMunicipio: {$municipio}\n\n"
            . "Revísala en: " . self::baseUrl() . "/admin/promotores\n";
        return ['asunto' => 'Nueva solicitud de promotor — La Mejor Taza', 'html' => $html, 'texto' => $texto];
    }
}
