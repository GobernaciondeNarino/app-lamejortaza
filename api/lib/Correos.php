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

    /**
     * El pie de la marca, el mismo que se ve bajo el logotipo en la web.
     *
     * Se lee de los ajustes en vez de dejarlo escrito aquí para que cambiar el
     * año no obligue a tocar dos sitios y acabar con un correo que anuncia una
     * edición distinta de la que se está celebrando. Se lee de `Ajustes`
     * directamente y no de `festival_ajustes()` porque los correos también
     * salen desde el instalador y desde la línea de comandos, donde las rutas
     * HTTP no están cargadas.
     */
    private static function pieMarca(): string
    {
        $marca = Ajustes::grupo('festival', ['marca' => ['pie' => 'Festival · Nariño 2026']])['marca'] ?? [];
        $pie = trim((string) ($marca['pie'] ?? ''));
        return $pie !== '' ? $pie : 'Festival · Nariño 2026';
    }

    private static function envoltura(string $titulo, string $contenidoHtml): string
    {
        $t   = self::h($titulo);
        $pie = self::h(self::pieMarca());
        return <<<HTML
<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>{$t}</title></head>
<body style="margin:0;padding:0;background:#f2ece0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2ece0;padding:24px 12px;">
<tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fbf7ef;border:1px solid #e0d6c2;border-radius:10px;overflow:hidden;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#2c2620;">
    <tr><td style="background:#2c2620;padding:22px 28px;color:#f2ece0;">
      <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#c9b99a;">{$pie}</div>
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
    /**
     * `$conQrAcceso` añade el bloque del código QR con el que va a entrar. Va
     * INCRUSTADO (cid:qracceso), no como enlace: el promotor lo abre en el
     * móvil y tiene que poder verlo sin descargar nada, y así el propio buzón
     * le queda de copia de seguridad del código que se enseña una sola vez en
     * pantalla. Quien envía adjunta la imagen con Mailer::send(..., $adjuntos).
     */
    public static function solicitudRecibida(string $nombre, bool $conQrAcceso = false): array
    {
        $n = self::h($nombre);

        $bloqueQr = '';
        $textoQr  = '';
        if ($conQrAcceso) {
            $bloqueQr = <<<HTML
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e0d6c2;border-radius:8px;margin:0 0 18px;">
  <tr><td style="padding:18px;" align="center">
    <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#8a7c68;">Tu código de acceso</div>
    <img src="cid:qracceso" alt="Código QR de acceso" width="200" height="200" style="display:block;margin:12px auto 8px;width:200px;height:200px;"/>
    <div style="font-size:13px;color:#6d6154;line-height:1.6;">
      Guarda esta imagen. Escanéala para entrar al portal cuando tu espacio quede aprobado.
    </div>
  </td></tr>
</table>
HTML;
            $textoQr = "Tu codigo de acceso viaja como imagen adjunta en este mismo correo (qr-acceso.png).\n"
                . "Guardala: al escanearla entraras al portal cuando tu espacio quede aprobado.\n\n";
        }

        $cierre = $conQrAcceso
            ? 'Cuando quede aprobada te avisaremos por este mismo correo y te enviaremos el '
              . '<strong>código QR de tu espacio</strong>, listo para imprimir.'
            : 'Cuando quede aprobada te enviaremos a este mismo correo tu <strong>contraseña de acceso</strong> '
              . 'para que completes el perfil de tu empresa y cargues tus productos.';

        $html = self::envoltura('Solicitud recibida', <<<HTML
<p style="font-size:16px;margin:0 0 14px;">Hola {$n},</p>
<p style="font-size:15px;line-height:1.65;margin:0 0 14px;">
  Recibimos tu solicitud para inscribirte como <strong>promotor de espacio</strong> del festival.
  Un administrador la revisará en los próximos días hábiles.
</p>
{$bloqueQr}
<p style="font-size:15px;line-height:1.65;margin:0 0 14px;">
  {$cierre}
</p>
<p style="font-size:14px;color:#6d6154;line-height:1.6;margin:18px 0 0;">
  No necesitas hacer nada más por ahora.
</p>
HTML);
        $textoCierre = $conQrAcceso
            ? "Cuando quede aprobada te avisaremos por este mismo correo y te enviaremos el codigo QR\nde tu espacio, listo para imprimir.\n\n"
            : "Cuando quede aprobada te enviaremos a este mismo correo tu contraseña de acceso para que\ncompletes el perfil de tu empresa y cargues tus productos.\n\n";
        $texto = "Hola {$nombre},\n\n"
            . "Recibimos tu solicitud para inscribirte como promotor de espacio del festival La Mejor Taza.\n"
            . "Un administrador la revisará en los próximos días hábiles.\n\n"
            . $textoQr
            . $textoCierre
            . "No necesitas hacer nada más por ahora.\n";
        return ['asunto' => 'Recibimos tu solicitud — La Mejor Taza', 'html' => $html, 'texto' => $texto];
    }

    /**
     * El correo importante: bienvenida + credenciales + QR del stand.
     *
     * El QR va INCRUSTADO (cid:qrstand), no como enlace: el promotor lo recibe
     * en el móvil y tiene que poder verlo sin descargar nada. Quien envía
     * adjunta la imagen con Mailer::send(..., $adjuntos).
     */
    /**
     * Bienvenida con el acceso y el QR del stand.
     *
     * `$accesoPropio` llega con una frase («la contraseña que elegiste», «tu
     * número de teléfono»…) cuando el promotor eligió cómo entrar al
     * inscribirse. En ese caso NO hay clave temporal que enviar y el correo
     * sólo se lo recuerda: decirle un secreto que ya tiene, y hacerlo por
     * correo, sería peor que no decírselo.
     */
    public static function credenciales(string $nombre, string $email, ?string $clave, int $horasVigencia, array $stand = [], ?string $accesoPropio = null): array
    {
        $n = self::h($nombre);
        $e = self::h($email);
        $c = self::h((string) $clave);
        $url = self::h(self::baseUrl() . '/promotor');

        $bloqueStand = '';
        $textoStand  = '';
        if (!empty($stand['id'])) {
            $sn = self::h((string) ($stand['nombre'] ?? ''));
            $sm = self::h((string) ($stand['municipio'] ?? ''));
            $su = self::h(self::baseUrl() . '/s/' . $stand['id']);
            $sid = self::h(strtoupper((string) $stand['id']));
            $bloqueStand = <<<HTML
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e0d6c2;border-radius:8px;margin:0 0 18px;">
  <tr><td style="padding:18px;" align="center">
    <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#8a7c68;">Tu espacio · {$sid}</div>
    <div style="font-size:19px;font-family:Georgia,serif;font-style:italic;margin:4px 0 2px;">{$sn}</div>
    <div style="font-size:13px;color:#6d6154;margin-bottom:14px;">{$sm}</div>
    <img src="cid:qrstand" alt="Código QR del espacio {$sn}" width="200" height="200" style="display:block;margin:0 auto;border:8px solid #fff;background:#fff;border-radius:6px;">
    <div style="font-size:12px;color:#6d6154;margin-top:12px;line-height:1.6;">
      Imprime este código y pégalo en tu espacio.<br>
      Cada visitante que lo escanee podrá calificarte y sellar su pasaporte.
    </div>
    <div style="font-size:11px;color:#8a7c68;margin-top:8px;word-break:break-all;">{$su}</div>
  </td></tr>
</table>
HTML;
            $textoStand = "\nTU ESPACIO: {$stand['nombre']} ({$stand['id']})\n"
                . "Enlace para el QR: " . self::baseUrl() . '/s/' . $stand['id'] . "\n"
                . "El código QR va adjunto a este correo: imprímelo y pégalo en tu espacio.\n";
        }

        // Dos correos distintos según de dónde salga su acceso.
        if ($accesoPropio !== null) {
            $a = self::h($accesoPropio);
            $bloqueClave = <<<HTML
<div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#8a7c68;">Cómo entras</div>
<div style="font-size:15px;margin-top:4px;line-height:1.6;">Con <strong>{$a}</strong>, la que elegiste al inscribirte.</div>
HTML;
            $bloqueAviso = <<<HTML
<p style="font-size:14px;line-height:1.65;color:#6d6154;margin:0 0 8px;">
  No te mandamos ninguna contraseña porque no hace falta: al inscribirte elegiste cómo entrar
  y eso sigue funcionando. Si lo perdiste, escribe al equipo organizador y te damos un acceso nuevo.
</p>
HTML;
            $textoClave = "Cómo entras: con {$accesoPropio}, la que elegiste al inscribirte.\n";
            $textoAviso = "No te mandamos ninguna contraseña porque no hace falta. Si perdiste tu acceso,\n"
                        . "escribe al equipo organizador y te damos uno nuevo.\n";
        } else {
            $bloqueClave = <<<HTML
<div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#8a7c68;">Contraseña temporal</div>
<div style="font-family:Consolas,Menlo,monospace;font-size:21px;letter-spacing:1px;margin-top:4px;color:#8a3b1e;">{$c}</div>
HTML;
            $bloqueAviso = <<<HTML
<p style="font-size:14px;line-height:1.65;color:#6d6154;margin:0 0 8px;">
  <strong>Importante:</strong> esta contraseña caduca en {$horasVigencia} horas y el sistema te
  pedirá cambiarla la primera vez que entres. No la compartas con nadie: quien la tenga puede
  modificar la información de tu espacio.
</p>
HTML;
            $textoClave = "Contraseña temporal: {$clave}\n";
            $textoAviso = "IMPORTANTE: esta contraseña caduca en {$horasVigencia} horas y deberás cambiarla la\n"
                        . "primera vez que entres. No la compartas con nadie.\n";
        }

        $html = self::envoltura('Bienvenido al festival', <<<HTML
<p style="font-size:16px;margin:0 0 14px;">Hola {$n},</p>
<p style="font-size:15px;line-height:1.65;margin:0 0 18px;">
  <strong>Bienvenido al Festival del Café de Nariño.</strong> Tu inscripción como
  promotor fue verificada y tu espacio ya está registrado. Nos alegra tenerte en
  esta edición.
</p>
{$bloqueStand}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e0d6c2;border-radius:8px;margin:0 0 18px;">
  <tr><td style="padding:16px 18px;">
    <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#8a7c68;">Usuario</div>
    <div style="font-size:15px;margin:2px 0 14px;">{$e}</div>
    {$bloqueClave}
  </td></tr>
</table>
<p style="margin:0 0 22px;">
  <a href="{$url}" style="display:inline-block;background:#2c2620;color:#f2ece0;text-decoration:none;padding:13px 24px;border-radius:999px;font-size:15px;">Entrar al portal del promotor</a>
</p>
{$bloqueAviso}
<p style="font-size:14px;line-height:1.65;color:#6d6154;margin:0;">
  Si no solicitaste esta inscripción, avisa al equipo organizador y no uses este acceso.
</p>
HTML);
        $texto = "Hola {$nombre},\n\n"
            . "BIENVENIDO AL FESTIVAL DEL CAFÉ DE NARIÑO.\n"
            . "Tu inscripción como promotor fue verificada y tu espacio ya está registrado.\n"
            . $textoStand
            . "\nUsuario: {$email}\n"
            . $textoClave
            . "\nEntra aquí: " . self::baseUrl() . "/promotor\n\n"
            . $textoAviso
            . "\nSi no solicitaste esta inscripción, avisa al equipo organizador y no uses este acceso.\n";
        return ['asunto' => 'Bienvenido — tu acceso y el QR de tu espacio', 'html' => $html, 'texto' => $texto];
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
  Revisamos tu solicitud para participar como promotor de espacio y por ahora no fue aprobada.
</p>
{$bloqueMotivo}
<p style="font-size:15px;line-height:1.65;margin:0;">
  Si crees que se trata de un error o quieres aportar más información, responde al equipo
  organizador del festival y con gusto revisamos tu caso de nuevo.
</p>
HTML);
        $texto = "Hola {$nombre},\n\n"
            . "Revisamos tu solicitud para participar como promotor de espacio del festival La Mejor Taza\n"
            . "y por ahora no fue aprobada.\n"
            . ($motivo !== '' ? "\nMotivo: {$motivo}\n" : '')
            . "\nSi crees que se trata de un error, comunícate con el equipo organizador.\n";
        return ['asunto' => 'Sobre tu solicitud de promotor — La Mejor Taza', 'html' => $html, 'texto' => $texto];
    }

    /**
     * Alta (o reposición de clave) de una cuenta de administración.
     *
     * Sirve para los dos casos porque el cuerpo es el mismo: usuario, clave
     * temporal y aviso de que hay que cambiarla. Sólo cambia el encabezado,
     * para que quien ya tenía cuenta no crea que le crearon otra.
     */
    public static function altaAdministrador(string $nombre, string $email, string $clave, string $rol, bool $esNueva = true): array
    {
        $n = self::h($nombre);
        $e = self::h($email);
        $c = self::h($clave);
        $url = self::h(self::baseUrl() . '/admin');
        $rolTexto = $rol === 'propietario'
            ? 'Propietario — además del panel del festival, puedes crear y administrar otras cuentas.'
            : 'Organizador — tienes acceso al panel del festival: espacios, votos, pasaportes y promotores.';
        $rt = self::h($rolTexto);

        $entrada = $esNueva
            ? 'Te creamos una cuenta de administración en <strong>La Mejor Taza</strong>, la plataforma del Festival del Café de Nariño.'
            : 'Restablecimos la contraseña de tu cuenta de administración en <strong>La Mejor Taza</strong>. La anterior ya no funciona.';
        $titulo = $esNueva ? 'Tu cuenta de administración' : 'Tu nueva contraseña';

        $html = self::envoltura($titulo, <<<HTML
<p style="font-size:16px;margin:0 0 14px;">Hola {$n},</p>
<p style="font-size:15px;line-height:1.65;margin:0 0 18px;">{$entrada}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e0d6c2;border-radius:8px;margin:0 0 18px;">
  <tr><td style="padding:16px 18px;">
    <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#8a7c68;">Usuario</div>
    <div style="font-size:15px;margin:2px 0 14px;">{$e}</div>
    <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#8a7c68;">Contraseña temporal</div>
    <div style="font-family:Consolas,Menlo,monospace;font-size:21px;letter-spacing:1px;margin:4px 0 14px;color:#8a3b1e;">{$c}</div>
    <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#8a7c68;">Perfil</div>
    <div style="font-size:14px;line-height:1.6;margin-top:2px;color:#4a4136;">{$rt}</div>
  </td></tr>
</table>
<p style="margin:0 0 22px;">
  <a href="{$url}" style="display:inline-block;background:#2c2620;color:#f2ece0;text-decoration:none;padding:13px 24px;border-radius:999px;font-size:15px;">Entrar al panel</a>
</p>
<p style="font-size:14px;line-height:1.65;color:#6d6154;margin:0 0 8px;">
  <strong>Importante:</strong> el sistema te pedirá cambiar esta contraseña la primera vez que entres.
  Una cuenta de administración ve los datos personales de visitantes y promotores: no compartas el acceso
  con nadie y no reutilices una contraseña que ya uses en otro sitio.
</p>
<p style="font-size:14px;line-height:1.65;color:#6d6154;margin:0;">
  Si no esperabas este correo, avisa al equipo organizador antes de usar el acceso.
</p>
HTML);

        $entradaTexto = $esNueva
            ? "Te creamos una cuenta de administración en La Mejor Taza, la plataforma del\nFestival del Café de Nariño.\n"
            : "Restablecimos la contraseña de tu cuenta de administración en La Mejor Taza.\nLa anterior ya no funciona.\n";
        $texto = "Hola {$nombre},\n\n"
            . $entradaTexto
            . "\nUsuario: {$email}\n"
            . "Contraseña temporal: {$clave}\n"
            . "Perfil: {$rolTexto}\n\n"
            . "Entra aquí: " . self::baseUrl() . "/admin\n\n"
            . "IMPORTANTE: el sistema te pedirá cambiarla la primera vez que entres. Una cuenta de\n"
            . "administración ve datos personales de visitantes y promotores: no compartas el acceso.\n\n"
            . "Si no esperabas este correo, avisa al equipo organizador antes de usarlo.\n";

        return [
            'asunto' => $esNueva
                ? 'Tu cuenta de administración — La Mejor Taza'
                : 'Nueva contraseña de administración — La Mejor Taza',
            'html'   => $html,
            'texto'  => $texto,
        ];
    }

    /**
     * Enlace al perfil del visitante.
     *
     * Es la vía de recuperación: quien votó desde otro teléfono no lleva el
     * testigo encima, y el buzón es la única prueba real de que ese correo es
     * suyo. El enlace no caduca por sí mismo, así que el texto avisa de que no
     * conviene reenviarlo.
     */
    public static function enlacePerfil(string $email, string $url): array
    {
        $e = self::h($email);
        $u = self::h($url);
        $html = self::envoltura('Tu perfil de visitante', <<<HTML
<p style="font-size:16px;margin:0 0 14px;">Hola,</p>
<p style="font-size:15px;line-height:1.65;margin:0 0 18px;">
  Aquí tienes el enlace para completar o modificar tus datos como visitante del
  <strong>Festival del Café de Nariño</strong>. Todo lo que nos cuentes es voluntario y nos
  sirve para saber quién nos visita y mejorar las próximas ediciones.
</p>
<p style="margin:0 0 20px;">
  <a href="{$u}" style="display:inline-block;background:#2c2620;color:#f2ece0;text-decoration:none;padding:13px 24px;border-radius:999px;font-size:15px;">Abrir mi perfil</a>
</p>
<p style="font-size:12px;color:#8a7c68;word-break:break-all;margin:0 0 18px;">{$u}</p>
<p style="font-size:14px;line-height:1.65;color:#6d6154;margin:0 0 8px;">
  Este enlace abre <strong>tu</strong> perfil ({$e}) sin pedir contraseña: no lo reenvíes a nadie.
  Desde ahí también puedes borrar tus datos cuando quieras.
</p>
<p style="font-size:14px;line-height:1.65;color:#6d6154;margin:0;">
  Si no pediste este enlace, ignora este mensaje: no se ha modificado nada.
</p>
HTML);
        $texto = "Hola,\n\n"
            . "Aquí tienes el enlace para completar o modificar tus datos como visitante del\n"
            . "Festival del Café de Nariño. Todo es voluntario.\n\n"
            . $url . "\n\n"
            . "Este enlace abre TU perfil ({$email}) sin pedir contraseña: no lo reenvíes.\n"
            . "Desde ahí también puedes borrar tus datos cuando quieras.\n\n"
            . "Si no pediste este enlace, ignora este mensaje: no se ha modificado nada.\n";
        return ['asunto' => 'Tu perfil de visitante — La Mejor Taza', 'html' => $html, 'texto' => $texto];
    }

    /** Mensaje de prueba del panel: si esto llega, el correo funciona. */
    public static function pruebaEnvio(string $destino, string $transporte): array
    {
        $d = self::h($destino);
        $t = self::h($transporte);
        $cuando = self::h(date('d/m/Y H:i'));
        $html = self::envoltura('Prueba de correo', <<<HTML
<p style="font-size:16px;margin:0 0 14px;">Si estás leyendo esto, el correo saliente funciona.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e0d6c2;border-radius:8px;margin:0 0 18px;">
  <tr><td style="padding:16px 18px;font-size:14px;line-height:1.7;color:#4a4136;">
    <strong>Destinatario:</strong> {$d}<br>
    <strong>Transporte:</strong> {$t}<br>
    <strong>Enviado:</strong> {$cuando}
  </td></tr>
</table>
<p style="font-size:14px;line-height:1.65;color:#6d6154;margin:0;">
  Este mensaje lo generó la prueba del panel de La Mejor Taza. Si llegó a la carpeta de correo
  no deseado, pide a quien administra el dominio que autorice a este servidor en el registro SPF:
  mientras no lo haga, las contraseñas de los promotores acabarán en spam.
</p>
HTML);
        $texto = "Si estás leyendo esto, el correo saliente funciona.\n\n"
            . "Destinatario: {$destino}\nTransporte: {$transporte}\nEnviado: " . date('d/m/Y H:i') . "\n\n"
            . "Si llegó a spam, pide que se autorice a este servidor en el SPF del dominio.\n";
        return ['asunto' => 'Prueba de correo — La Mejor Taza', 'html' => $html, 'texto' => $texto];
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
