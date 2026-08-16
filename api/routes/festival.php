<?php
defined('LMT_GUARD') || exit('forbidden');

use LMT\Ajustes;
use LMT\Response;
use LMT\Security;
use LMT\Validate;

/**
 * Ajustes de presentación del festival.
 *
 * Son los que el organizador cambia sin tocar código: cómo se llaman las tres
 * valoraciones, cuántas columnas tiene la rejilla del recorrido en PC y en
 * móvil, y qué imágenes se usan de fondo en el pasaporte.
 *
 * La lectura es PÚBLICA porque el navegador de cualquier visitante necesita
 * estos valores para pintar el formulario de voto y el recorrido. No hay nada
 * personal aquí: son etiquetas y números. La escritura es de administración.
 */

/** Lo que trae el sistema si nadie ha configurado nada. */
function festival_por_defecto(): array
{
    return [
        'estrellas' => [
            // Las claves NO se tocan: son las columnas de la base. Lo que el
            // organizador cambia es cómo se llaman de cara al público.
            'innovacion' => 'Innovación',
            'atencion'   => 'Atención',
            'calidad'    => 'Calidad',
        ],
        'recorrido' => [
            'columnas_pc'    => 3,
            'columnas_movil' => 2,
        ],
        'pasaporte' => [
            // Rutas públicas de las imágenes de fondo. Vacío = el diseño que
            // trae el sistema, que es el que se ve si nadie sube nada.
            'portada'       => '',
            'contraportada' => '',
            'hojas'         => [],
        ],
    ];
}

function festival_ajustes(): array
{
    return Ajustes::grupo('festival', festival_por_defecto());
}

function register_routes_festival(\LMT\Router $r): void
{
    $r->get('/festival/ajustes', function () {
        Response::ok(festival_ajustes());
    });

    $r->put('/admin/festival/ajustes', function () {
        Security::requireAdmin();
        $b   = Security::jsonBody();
        $act = festival_ajustes();

        foreach (['innovacion', 'atencion', 'calidad'] as $k) {
            $v = Validate::texto($b['estrellas'][$k] ?? null, 40);
            if ($v !== null && $v !== '') $act['estrellas'][$k] = $v;
        }

        // Entre 1 y 6 columnas: por debajo no es una rejilla y por encima las
        // tarjetas se quedan sin sitio para el nombre del stand.
        foreach (['columnas_pc' => 6, 'columnas_movil' => 3] as $k => $max) {
            if (isset($b['recorrido'][$k])) {
                $n = (int) $b['recorrido'][$k];
                $act['recorrido'][$k] = max(1, min($max, $n));
            }
        }

        Ajustes::guardar('festival', $act);
        Response::ok(festival_ajustes());
    });

    /**
     * Fondos del pasaporte. Se suben como cualquier otra imagen del sistema
     * (se validan y recodifican) y se guardan sus rutas en los ajustes.
     *
     * `destino` dice para qué hoja es: portada, contraportada o una más del
     * montón de hojas internas.
     */
    $r->post('/admin/festival/fondo', function () {
        Security::requireAdmin();
        $destino = (string) ($_POST['destino'] ?? 'hojas');
        if (!in_array($destino, ['portada', 'contraportada', 'hojas'], true)) {
            Response::error(422, 'destino_invalido');
        }
        if (empty($_FILES['archivo']) || !is_array($_FILES['archivo'])) {
            Response::error(422, 'archivo_ausente');
        }
        try {
            $ruta = \LMT\Uploads::imagen($_FILES['archivo'], 'pasaporte');
        } catch (\RuntimeException $e) {
            Response::error(422, $e->getMessage());
        }

        $act = festival_ajustes();
        if ($destino === 'hojas') {
            $hojas = $act['pasaporte']['hojas'];
            // Un tope sensato: más de 20 fondos no aporta variedad y sí peso
            // de descarga en el móvil de un visitante.
            if (count($hojas) >= 20) Response::error(422, 'demasiadas_hojas');
            $hojas[] = $ruta;
            $act['pasaporte']['hojas'] = $hojas;
        } else {
            $act['pasaporte'][$destino] = $ruta;
        }
        Ajustes::guardar('festival', $act);
        Response::ok(festival_ajustes());
    });

    /** Quita un fondo. Volver a cero es volver al diseño que trae el sistema. */
    $r->delete('/admin/festival/fondo', function () {
        Security::requireAdmin();
        $b       = Security::jsonBody();
        $destino = (string) ($b['destino'] ?? '');
        $act     = festival_ajustes();

        if ($destino === 'portada' || $destino === 'contraportada') {
            $act['pasaporte'][$destino] = '';
        } elseif ($destino === 'hojas') {
            $i = isset($b['indice']) ? (int) $b['indice'] : -1;
            $hojas = array_values($act['pasaporte']['hojas']);
            if ($i < 0 || $i >= count($hojas)) Response::error(422, 'indice_invalido');
            array_splice($hojas, $i, 1);
            $act['pasaporte']['hojas'] = $hojas;
        } else {
            Response::error(422, 'destino_invalido');
        }
        Ajustes::guardar('festival', $act);
        Response::ok(festival_ajustes());
    });

    /**
     * Actividad económica del festival.
     *
     * Lo que de verdad quiere saber quien organiza: cuánto se movió, en qué
     * stands y qué proporción de visitantes acabó comprando. Sólo agregados —el
     * detalle de quién compró qué está en los votos y no hace falta aquí.
     */
    $r->get('/admin/economia', function () {
        Security::requireAdmin();
        $pdo = \LMT\Db::pdo();

        $total = $pdo->query(
            'SELECT COUNT(*) AS votos,
                    SUM(CASE WHEN compra = 1 THEN 1 ELSE 0 END) AS compras,
                    SUM(CASE WHEN compra = 0 THEN 1 ELSE 0 END) AS sin_compra,
                    SUM(CASE WHEN compra = 1 THEN compra_valor ELSE 0 END) AS valor,
                    COUNT(compra_valor) AS con_valor
             FROM votos'
        )->fetch(\PDO::FETCH_ASSOC) ?: [];

        $filas = $pdo->query(
            'SELECT s.id, s.nombre, s.municipio,
                    COUNT(v.id) AS votos,
                    SUM(CASE WHEN v.compra = 1 THEN 1 ELSE 0 END) AS compras,
                    SUM(CASE WHEN v.compra = 1 THEN v.compra_valor ELSE 0 END) AS valor,
                    COUNT(v.compra_valor) AS con_valor
             FROM stands s
             LEFT JOIN votos v ON v.stand_id = s.id
             GROUP BY s.id, s.nombre, s.municipio
             ORDER BY valor DESC, compras DESC, s.nombre'
        )->fetchAll(\PDO::FETCH_ASSOC);

        Response::ok([
            'total' => economia_fila($total),
            'stands' => array_map(function (array $f) {
                return economia_fila($f) + [
                    'id'        => (string) $f['id'],
                    'nombre'    => (string) $f['nombre'],
                    'municipio' => (string) ($f['municipio'] ?? ''),
                ];
            }, $filas),
        ]);
    });
}

/**
 * Cifras derivadas de una fila de compras.
 *
 * `ticket` sale de dividir entre los votos QUE TRAEN IMPORTE, no entre todas
 * las compras: quien dice «sí compré» pero no escribe cuánto hundiría la media
 * si contara como una compra de cero pesos.
 */
function economia_fila(array $f): array
{
    $votos    = (int) ($f['votos'] ?? 0);
    $compras  = (int) ($f['compras'] ?? 0);
    $valor    = (int) ($f['valor'] ?? 0);
    $conValor = (int) ($f['con_valor'] ?? 0);
    return [
        'votos'      => $votos,
        'compras'    => $compras,
        'con_valor'  => $conValor,
        'valor'      => $valor,
        'ticket'     => $conValor > 0 ? (int) round($valor / $conValor) : 0,
        'conversion' => $votos > 0 ? round($compras * 100 / $votos, 1) : 0.0,
    ];
}
