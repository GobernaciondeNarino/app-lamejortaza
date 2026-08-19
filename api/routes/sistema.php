<?php
defined('LMT_GUARD') || exit('forbidden');

use LMT\Db;
use LMT\Response;
use LMT\Security;
use LMT\Session;
use LMT\Uploads;

/**
 * Puesta a cero del festival.
 * =========================
 *
 * Entre montar el sistema y abrir al público hay semanas de pruebas: stands de
 * ejemplo, inscripciones de mentira, votos para ver si el pasaporte sella.
 * Nada de eso puede quedar el día del evento, y borrarlo tabla por tabla desde
 * phpMyAdmin es justo la clase de trabajo en la que alguien se lleva por
 * delante la cuenta del administrador.
 *
 * Reglas que hacen esto seguro de ofrecer desde un panel:
 *
 *   1. Sólo el PROPIETARIO. No es una tarea de organizador.
 *   2. Hay que escribir una frase exacta. Un botón de «borrar todo» detrás de
 *      un `confirm()` se pulsa sin leer; escribir BORRAR TODO no.
 *   3. Las cuentas de administración NO se tocan nunca. Si se borraran, el
 *      sistema se quedaría sin nadie que pueda entrar a arreglarlo.
 *   4. Se elige QUÉ borrar. Lo normal antes de abrir es tirar los votos y
 *      dejar los stands, y eso no debería obligar a rehacer el catálogo.
 *   5. Devuelve cuántas filas cayó cada tabla, para que se vea qué pasó.
 *
 * Las imágenes de los stands y promotores borrados también se van: dejarlas es
 * guardar la cara de gente que pidió irse.
 */

/** Lo que se puede vaciar, y qué arrastra cada cosa. */
const SISTEMA_AMBITOS = ['votos', 'visitantes', 'promotores', 'stands', 'correos'];

const SISTEMA_FRASE = 'BORRAR TODO';

function register_routes_sistema(\LMT\Router $r): void
{
    /** Qué hay ahora mismo en la base. Es lo que se va a borrar. */
    $r->get('/admin/sistema/inventario', function () {
        admin_requiere_propietario();
        Response::ok(['inventario' => sistema_inventario(), 'frase' => SISTEMA_FRASE]);
    });

    $r->post('/admin/sistema/reiniciar', function () {
        admin_requiere_propietario();
        $b = Security::jsonBody();

        // La frase se compara tal cual, sin normalizar espacios ni mayúsculas:
        // el punto es que haya que leerla y escribirla.
        if (!is_string($b['confirmacion'] ?? null) || $b['confirmacion'] !== SISTEMA_FRASE) {
            Response::error(422, 'confirmacion_incorrecta');
        }

        $pedidos = is_array($b['ambitos'] ?? null) ? $b['ambitos'] : [];
        $ambitos = array_values(array_intersect(SISTEMA_AMBITOS, $pedidos));
        if (!$ambitos) Response::error(422, 'nada_que_borrar');

        $antes = sistema_inventario();
        $log = sistema_borrar($ambitos);

        // Quién lo hizo y qué se llevó: esto no puede pasar en silencio.
        $yo = Session::user();
        error_log('[lmt][sistema] puesta a cero por ' . ($yo['email'] ?? '?')
            . ' — ámbitos: ' . implode(',', $ambitos)
            . ' — ' . json_encode($log, JSON_UNESCAPED_UNICODE));

        Response::ok([
            'ambitos'    => $ambitos,
            'borrado'    => $log,
            'antes'      => $antes,
            'inventario' => sistema_inventario(),
        ]);
    });
}

/** Cuántas filas hay en cada cosa que se puede vaciar. */
function sistema_inventario(): array
{
    $pdo = Db::pdo();
    $n = function (string $tabla) use ($pdo): int {
        try { return (int) $pdo->query('SELECT COUNT(*) FROM ' . $tabla)->fetchColumn(); }
        catch (\Throwable $e) { return 0; }
    };
    return [
        'stands'      => $n('stands'),
        'votos'       => $n('votos'),
        'pasaportes'  => $n('pasaportes'),
        'promotores'  => $n('promotores'),
        'empresas'    => $n('empresas'),
        'productos'   => $n('productos'),
        'visitantes'  => $n('visitantes'),
        'correos'     => $n('emails_log'),
        // Las cuentas se cuentan para dejar claro que NO se tocan.
        'admins'      => $n('admins'),
    ];
}

/**
 * Vacía lo pedido. Devuelve tabla => filas borradas.
 *
 * El orden importa: primero lo que cuelga de otra cosa. Y todo va dentro de una
 * transacción, porque una puesta a cero a medias —stands borrados y votos
 * huérfanos apuntando a ellos— es peor que no haber empezado.
 */
function sistema_borrar(array $ambitos): array
{
    $log = [];
    $fotos = [];

    // Las rutas de las imágenes hay que leerlas ANTES de borrar las filas.
    if (in_array('stands', $ambitos, true)) {
        $fotos = array_merge($fotos, sistema_rutas('SELECT logo_path FROM stands'));
    }
    if (in_array('promotores', $ambitos, true)) {
        $fotos = array_merge($fotos, sistema_rutas('SELECT logo_path FROM promotores'));
        $fotos = array_merge($fotos, sistema_rutas('SELECT logo_path FROM empresas'));
        $fotos = array_merge($fotos, sistema_rutas('SELECT foto_path FROM productos'));
    }
    if (in_array('visitantes', $ambitos, true)) {
        $fotos = array_merge($fotos, sistema_rutas('SELECT avatar_path FROM visitantes'));
    }

    Db::tx(function (\PDO $pdo) use ($ambitos, &$log) {
        $borrar = function (string $sql, string $clave) use ($pdo, &$log) {
            try {
                $st = $pdo->prepare($sql);
                $st->execute();
                $log[$clave] = ($log[$clave] ?? 0) + $st->rowCount();
            } catch (\Throwable $e) {
                error_log('[lmt][sistema] ' . $clave . ': ' . $e->getMessage());
            }
        };

        // Votos y pasaportes van juntos: un pasaporte es la suma de sus votos,
        // y dejarlo sin ellos enseñaría sellos que ya no existen.
        if (in_array('votos', $ambitos, true)) {
            $borrar('DELETE FROM votos', 'votos');
            $borrar('DELETE FROM pasaportes', 'pasaportes');
            // Los contadores de cada stand vuelven a cero: viven en la fila del
            // stand, no en la tabla de votos, y si no se ponen a mano el
            // ranking seguiría enseñando los votos de las pruebas.
            $borrar('UPDATE stands SET votos_bueno = 0, votos_regular = 0, votos_malo = 0', 'contadores');
        }
        if (in_array('visitantes', $ambitos, true)) {
            $borrar('DELETE FROM visitantes', 'visitantes');
        }
        if (in_array('promotores', $ambitos, true)) {
            $borrar('DELETE FROM productos', 'productos');
            $borrar('DELETE FROM empresas', 'empresas');
            $borrar('DELETE FROM promotores', 'promotores');
        }
        if (in_array('stands', $ambitos, true)) {
            // Sin stands no puede haber votos ni pasaportes: se van también
            // aunque no se hubieran pedido, o quedarían apuntando a la nada.
            $borrar('DELETE FROM votos', 'votos');
            $borrar('DELETE FROM pasaportes', 'pasaportes');
            $borrar('UPDATE promotores SET stand_id = NULL', 'promotores_sin_stand');
            $borrar('DELETE FROM stands', 'stands');
        }
        if (in_array('correos', $ambitos, true)) {
            $borrar('DELETE FROM emails_log', 'correos');
        }
        // Los contadores de límite de peticiones se van siempre: son de las
        // pruebas y su único efecto es dejar bloqueado a alguien sin motivo.
        $borrar('DELETE FROM rate_limits', 'rate_limits');
    });

    foreach (array_unique($fotos) as $ruta) Uploads::borrar($ruta);
    if ($fotos) $log['imagenes'] = count(array_unique($fotos));

    return $log;
}

/** @return string[] rutas no vacías de una consulta de una sola columna. */
function sistema_rutas(string $sql): array
{
    try {
        $filas = Db::pdo()->query($sql)->fetchAll(\PDO::FETCH_COLUMN);
        return array_values(array_filter(array_map('strval', $filas ?: []), fn($v) => $v !== ''));
    } catch (\Throwable $e) {
        return [];
    }
}
