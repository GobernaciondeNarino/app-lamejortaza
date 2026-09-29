<?php
defined('LMT_GUARD') || exit('forbidden');

use LMT\Interfaz;
use LMT\Response;
use LMT\Security;
use LMT\Uploads;

/**
 * Configuración → Interfaz: colores, letra, logotipos, iconos y textos.
 *
 * La lectura pública devuelve sólo lo que pinta la página (el CSS ya armado,
 * los textos cambiados, iconos y logotipos). app.php lo incrusta en la primera
 * respuesta para que no haya parpadeo; esta ruta sirve para refrescarlo sin
 * recargar, por ejemplo justo después de guardar desde el panel.
 */
function register_routes_interfaz(\LMT\Router $r): void
{
    $r->get('/interfaz', function () {
        Response::ok(Interfaz::publico());
    });

    /** Todo lo guardado más el catálogo de lo que se puede cambiar. */
    $r->get('/admin/interfaz', function () {
        Security::requireAdmin();
        Response::ok(interfaz_respuesta());
    });

    $r->put('/admin/interfaz', function () {
        Security::requireAdmin();
        $b = Security::jsonBody();
        Interfaz::guardar(Interfaz::aplicar(Interfaz::ajustes(), $b));
        Response::ok(interfaz_respuesta());
    });

    /**
     * Devuelve a fábrica una parte: los colores y la letra de un área, sus
     * textos, o los iconos. Los logotipos se quitan con su propia ruta.
     */
    $r->post('/admin/interfaz/restaurar', function () {
        Security::requireAdmin();
        $b = Security::jsonBody();
        $que  = (string) ($b['que'] ?? '');
        $area = (string) ($b['area'] ?? '');
        $aj = Interfaz::ajustes();

        if ($que === 'apariencia' && isset(Interfaz::AREAS[$area])) {
            $aj['areas'][$area]['colores'] = [];
            $aj['areas'][$area]['fuentes'] = [];
        } elseif ($que === 'textos' && isset(Interfaz::AREAS[$area])) {
            foreach (array_keys($aj['textos']) as $k) {
                if ((Interfaz::TEXTOS[$k][0] ?? '') === $area) unset($aj['textos'][$k]);
            }
        } elseif ($que === 'iconos') {
            $aj['iconos'] = [];
        } else {
            Response::error(422, 'destino_invalido');
        }
        Interfaz::guardar($aj);
        Response::ok(interfaz_respuesta());
    });

    /**
     * Logotipo de un área, o el icono de la pestaña del navegador. Pasa por
     * la misma validación y recodificación que cualquier otra imagen.
     */
    $r->post('/admin/interfaz/logo', function () {
        Security::requireAdmin();
        $destino = (string) ($_POST['destino'] ?? '');
        if (!isset(Interfaz::AREAS[$destino]) && $destino !== 'favicon') Response::error(422, 'destino_invalido');
        if (empty($_FILES['archivo']) || !is_array($_FILES['archivo'])) Response::error(422, 'archivo_ausente');
        try {
            $ruta = Uploads::imagen($_FILES['archivo'], 'interfaz');
        } catch (\RuntimeException $e) {
            Response::error(422, $e->getMessage());
        }
        $aj = Interfaz::ajustes();
        $anterior = $destino === 'favicon' ? $aj['favicon'] : $aj['areas'][$destino]['logo'];
        if ($destino === 'favicon') $aj['favicon'] = $ruta;
        else $aj['areas'][$destino]['logo'] = $ruta;
        Interfaz::guardar($aj);
        // El archivo anterior ya no lo usa nadie: la ruta es aleatoria y sólo
        // la conocía este ajuste. Dejarlo sería acumular logos huérfanos.
        interfaz_borrar_si_huerfano($anterior);
        Response::ok(interfaz_respuesta());
    });

    $r->delete('/admin/interfaz/logo', function () {
        Security::requireAdmin();
        $b = Security::jsonBody();
        $destino = (string) ($b['destino'] ?? '');
        if (!isset(Interfaz::AREAS[$destino]) && $destino !== 'favicon') Response::error(422, 'destino_invalido');
        $aj = Interfaz::ajustes();
        $anterior = $destino === 'favicon' ? $aj['favicon'] : $aj['areas'][$destino]['logo'];
        if ($destino === 'favicon') $aj['favicon'] = '';
        else $aj['areas'][$destino]['logo'] = '';
        Interfaz::guardar($aj);
        interfaz_borrar_si_huerfano($anterior);
        Response::ok(interfaz_respuesta());
    });

    /** Una fuente propia (woff2, woff, ttf u otf). */
    $r->post('/admin/interfaz/fuente', function () {
        Security::requireAdmin();
        if (empty($_FILES['archivo']) || !is_array($_FILES['archivo'])) Response::error(422, 'archivo_ausente');
        $aj = Interfaz::ajustes();
        if (count($aj['fuentes_propias']) >= Interfaz::MAX_FUENTES_PROPIAS) Response::error(422, 'demasiadas_fuentes');

        // El nombre es sólo la etiqueta que ve el organizador en la lista. El
        // nombre de familia del CSS lo pone el servidor.
        $nombre = \LMT\Validate::texto($_POST['nombre'] ?? '', 60);
        if ($nombre === '') {
            $original = (string) (($_FILES['archivo']['name'] ?? '') ?: 'Fuente propia');
            $nombre = \LMT\Validate::texto(preg_replace('/\.[a-z0-9]{2,5}$/i', '', $original), 60) ?: 'Fuente propia';
        }
        try {
            $f = Uploads::fuente($_FILES['archivo'], 'interfaz/fuentes');
        } catch (\RuntimeException $e) {
            Response::error(422, $e->getMessage());
        }
        $aj['fuentes_propias'][] = [
            'id'      => bin2hex(random_bytes(6)),
            'nombre'  => $nombre,
            'archivo' => $f['archivo'],
            'formato' => $f['formato'],
        ];
        Interfaz::guardar($aj);
        Response::ok(interfaz_respuesta());
    });

    /**
     * Quita una fuente propia. Las áreas que la usaban vuelven a la de
     * fábrica en el mismo paso: una referencia a una fuente que ya no existe
     * dejaría el texto con la letra de respaldo sin que nadie supiera por qué.
     */
    $r->delete('/admin/interfaz/fuente', function () {
        Security::requireAdmin();
        $b  = Security::jsonBody();
        $id = (string) ($b['id'] ?? '');
        $aj = Interfaz::ajustes();
        $quitada = null;
        $aj['fuentes_propias'] = array_values(array_filter($aj['fuentes_propias'], function ($f) use ($id, &$quitada) {
            if ($f['id'] === $id) { $quitada = $f; return false; }
            return true;
        }));
        if ($quitada === null) Response::error(404, 'no_encontrado');
        foreach (array_keys(Interfaz::AREAS) as $a) {
            foreach ($aj['areas'][$a]['fuentes'] as $rol => $valor) {
                if ($valor === 'propia:' . $id) unset($aj['areas'][$a]['fuentes'][$rol]);
            }
        }
        Interfaz::guardar($aj);
        Uploads::borrar($quitada['archivo']);
        Response::ok(interfaz_respuesta());
    });
}

function interfaz_respuesta(): array
{
    $aj = Interfaz::ajustes();
    return [
        'ajustes'  => [
            'areas'           => $aj['areas'],
            'iconos'          => (object) $aj['iconos'],
            'textos'          => (object) $aj['textos'],
            'favicon'         => $aj['favicon'],
            'fuentes_propias' => $aj['fuentes_propias'],
        ],
        'publico'  => Interfaz::publico($aj),
        'catalogo' => Interfaz::catalogo(),
    ];
}

/** Borra un archivo de la interfaz si ningún otro ajuste lo sigue usando. */
function interfaz_borrar_si_huerfano(string $ruta): void
{
    if ($ruta === '') return;
    $aj = Interfaz::ajustes();
    $enUso = [$aj['favicon']];
    foreach ($aj['areas'] as $a) $enUso[] = $a['logo'];
    if (!in_array($ruta, $enUso, true)) Uploads::borrar($ruta);
}
