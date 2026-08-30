<?php
namespace LMT;
defined('LMT_GUARD') || exit('forbidden');

/**
 * Catálogos cerrados de la inscripción de espacios.
 *
 * Por qué se guarda una clave y no la frase
 * -----------------------------------------
 * «Sociedades por Acciones Simplificadas S.A.S.» es lo que lee quien se
 * inscribe; lo que se guarda es `sas`. Si se guardara la frase, el día que
 * alguien corrija una tilde o cambie un paréntesis la base tendría dos
 * organizaciones distintas que son la misma, y cualquier conteo por tipo
 * dejaría de valer — que es exactamente lo que ya pasó con los municipios
 * antes de cerrarlos contra el catálogo del DANE.
 *
 * Las frases viven en el JSX, que es donde va lo que se lee. Aquí están las
 * claves, que es lo que decide qué entra en la base. Una prueba comprueba que
 * las dos listas tengan las mismas claves: separar presentación de validación
 * sólo funciona si algo avisa cuando se separan de más.
 */
final class Catalogos
{
    /** Qué tipo de organización es quien se inscribe. */
    public const ORGANIZACION = [
        'persona_natural',
        'sas',
        'limitada',
        'civil',
        'unipersonal',
        'comunidades_indigenas',
        'anonima',
        'utilidad_comun',
        'fundacion',
        'comandita_simple',
        'corporacion',
        'no_formalizada',
        'otro',
    ];

    /**
     * Grupo o tipo de población. Una sola opción.
     *
     * Es un dato sensible en el sentido de la Ley 1581 de 2012 —pertenencia
     * étnica, discapacidad, condición de víctima—, así que sale de un catálogo
     * cerrado con salida explícita («Ninguna de las anteriores») y se pide
     * junto a la autorización de tratamiento, nunca antes.
     */
    public const POBLACION = [
        'urbana',
        'rural',
        'indigena',
        'afrodescendiente',
        'rrom',
        'victima',
        'discapacidad',
        'adulto_mayor',
        'estudiante',
        'ninguna',
        'otro',
    ];

    /** Línea productiva. Selección MÚLTIPLE. */
    public const LINEA_PRODUCTIVA = [
        'cafes_especiales',
        'transformacion',
        'economia_circular',
    ];

    /** Presentación del producto. Selección MÚLTIPLE. */
    public const PRESENTACION = [
        'grano',
        'molido',
        'instantaneo',
        'descafeinado',
        'capsulas',
        'otros',
    ];

    /** Vínculo con la cadena de valor del café. */
    public const ACTIVIDAD = [
        'tostado_marca_propia',
        'transformador',
        'distribuidor',
        'barista',
        'proveedor',
        'artesanias',
        'servicios',
        'organizacion',
        'otro',
    ];

    /**
     * Valida contra un catálogo. Devuelve null si no está en la lista.
     *
     * Se compara con `in_array` estricto y no con un `switch` laxo porque el
     * cliente puede mandar `0`, que en PHP se parece a cualquier cadena si uno
     * se descuida con la comparación.
     */
    public static function valor($value, array $catalogo): ?string
    {
        if (!is_string($value)) return null;
        $v = trim($value);
        return in_array($v, $catalogo, true) ? $v : null;
    }

    /**
     * Un campo de catálogo con su «Otro: ____». Devuelve [clave, detalle].
     *
     * El detalle sólo se guarda cuando la clave es 'otro'. Si no, quien elige
     * «Fundaciones» después de haber escrito algo en el campo abierto se
     * llevaría los dos datos a la base y el informe contaría una cosa distinta
     * de la que se eligió. Y «Otro» sin decir cuál tampoco entra: no es una
     * caracterización, es un hueco con otro nombre.
     *
     * `$obligatorio` distingue la inscripción —donde estos campos se exigen—
     * del editor del panel, donde un espacio creado antes de que existieran
     * estos campos se tiene que poder seguir editando.
     *
     * Lanza RuntimeException con el código de error, como Uploads: la clase no
     * conoce el transporte y quien la llama decide cómo responder.
     */
    public static function par($clave, $detalle, array $catalogo, string $error, bool $obligatorio): array
    {
        $v = self::valor($clave, $catalogo);
        if ($v === null) {
            $vacio = $clave === null || (is_string($clave) && trim($clave) === '');
            if ($vacio && !$obligatorio) return [null, null];
            throw new \RuntimeException($error);
        }
        if ($v !== 'otro') return [$v, null];

        $texto = Validate::nombre($detalle, 120);
        if ($texto === null) throw new \RuntimeException('detalle_requerido');
        return [$v, $texto];
    }

    /**
     * Selección múltiple contra un catálogo. Devuelve JSON o null si va vacía.
     *
     * Se guarda como JSON y no como una columna por opción porque las listas
     * cambian entre ediciones del festival —«economía circular» no existía el
     * año pasado— y cada cambio significaría una migración. Y no como texto
     * separado por comas porque entonces buscar 'grano' encontraría también
     * 'grano molido' el día que alguien añada esa opción.
     *
     * El orden se normaliza al del catálogo: así dos respuestas iguales se
     * guardan igual, y comparar o agrupar en un informe funciona.
     */
    public static function multiple($valores, array $catalogo, string $error, bool $obligatorio): ?string
    {
        if (!is_array($valores)) $valores = [];
        $limpio = [];
        foreach ($catalogo as $clave) {
            if (in_array($clave, $valores, true)) $limpio[] = $clave;
        }
        if ($limpio === []) {
            if ($obligatorio) throw new \RuntimeException($error);
            return null;
        }
        return json_encode($limpio, JSON_UNESCAPED_UNICODE);
    }

    /** Lee de vuelta un JSON de selección múltiple. Siempre una lista. */
    public static function listaDe($json): array
    {
        if (!is_string($json) || $json === '') return [];
        $v = json_decode($json, true);
        return is_array($v) ? array_values(array_filter($v, 'is_string')) : [];
    }

    /**
     * Un «sí / no» que distingue el «no» del «no contestó».
     *
     * `Validate::bool()` devuelve null en los dos casos, y eso convierte «este
     * café NO es orgánico» en «no sabemos si es orgánico»: son cosas distintas
     * y la segunda no se puede publicar como la primera. Aquí null sólo
     * sobrevive cuando el campo es opcional y de verdad viene vacío.
     */
    public static function siNo($valor, string $error, bool $obligatorio): ?int
    {
        if ($valor === true  || $valor === 1 || $valor === '1' || $valor === 'true')  return 1;
        if ($valor === false || $valor === 0 || $valor === '0' || $valor === 'false') return 0;
        if ($obligatorio) throw new \RuntimeException($error);
        return null;
    }

    /**
     * La ficha del participante, leída de un cuerpo JSON.
     *
     * Devuelve el array de columna => valor, listo para bindear. Está aquí y no
     * repetido en las dos rutas porque la inscripción pública y el editor del
     * panel guardan EXACTAMENTE los mismos campos: con dos copias, la primera
     * vez que se añada una casilla una de las dos se queda sin ella y el
     * espacio pierde el dato en cuanto un organizador le da a «Guardar».
     *
     * `$exigir` distingue la inscripción —donde cuatro respuestas son
     * obligatorias porque son requisitos de participación— del editor, donde un
     * espacio creado antes de que existieran estos campos se tiene que poder
     * seguir editando sin inventarse nada.
     *
     * Lanza RuntimeException con el código de error; quien llama decide cómo
     * responderlo.
     */
    public static function ficha(array $b, bool $exigir): array
    {
        // El orden importa: se valida de arriba abajo, en el MISMO orden en que
        // están los campos en el formulario. Si no, a quien se deja sin marcar
        // la casilla de la marca registrada se le contesta que falta el INVIMA
        // —tres preguntas más abajo— y se pone a buscar el error donde no está.
        [$poblacion, $poblacionOtro] = self::par(
            $b['poblacion'] ?? null, $b['poblacion_otro'] ?? null,
            self::POBLACION, 'poblacion_invalida', $exigir
        );
        $linea = self::multiple($b['linea_productiva'] ?? null, self::LINEA_PRODUCTIVA, 'linea_productiva_requerida', false);

        $certInternacional = self::siNo($b['cert_internacional'] ?? null, '', false);
        $organico          = self::siNo($b['organico'] ?? null, '', false);
        $especial          = self::siNo($b['especial'] ?? null, '', false);
        $promedioTaza      = Validate::texto($b['promedio_taza'] ?? null, 40);

        $marca  = self::siNo($b['marca_registrada'] ?? null, 'marca_registrada_requerida', $exigir);

        $camara = self::siNo($b['camara_comercio'] ?? null, 'camara_comercio_requerido', $exigir);
        // El número sólo se guarda si la respuesta fue que sí. Si no, quien
        // marque «sí», lo escriba y luego rectifique a «no» dejaría en la base
        // un certificado que el propio formulario dice que no tiene.
        $camaraNumero = $camara === 1 ? Validate::texto($b['camara_comercio_numero'] ?? null, 60) : '';

        $invima = self::siNo($b['invima'] ?? null, 'invima_requerido', $exigir);
        $invimaDetalle = $invima === 1 ? Validate::parrafos($b['invima_detalle'] ?? null, 800) : '';

        $manipulacion = self::siNo($b['manipulacion_alimentos'] ?? null, 'manipulacion_requerida', $exigir);

        $presentacionJson = self::multiple(
            $b['presentacion'] ?? null, self::PRESENTACION, 'presentacion_requerida', $exigir
        );
        $presentacionOtro = in_array('otros', self::listaDe($presentacionJson), true)
            ? Validate::texto($b['presentacion_otro'] ?? null, 120)
            : '';

        return [
            'poblacion'              => $poblacion,
            'poblacion_otro'         => $poblacionOtro,
            'linea_productiva'       => $linea,
            'cert_internacional'     => $certInternacional,
            'organico'               => $organico,
            'especial'               => $especial,
            'promedio_taza'          => self::vacioANull($promedioTaza),
            'marca_registrada'       => $marca,
            'camara_comercio'        => $camara,
            'camara_comercio_numero' => self::vacioANull($camaraNumero),
            'invima'                 => $invima,
            'invima_detalle'         => self::vacioANull($invimaDetalle),
            'manipulacion_alimentos' => $manipulacion,
            'presentacion'           => $presentacionJson,
            'presentacion_otro'      => self::vacioANull($presentacionOtro),
        ];
    }

    /** Las columnas de la ficha, en el orden en que las devuelve ficha(). */
    public static function camposFicha(): array
    {
        return array_keys(self::ficha([], false));
    }

    private static function vacioANull(?string $v): ?string
    {
        return ($v === null || $v === '') ? null : $v;
    }

    /** Los catálogos, para pintarlos o para comprobarlos desde una prueba. */
    public static function todos(): array
    {
        return [
            'organizacion'     => self::ORGANIZACION,
            'actividad'        => self::ACTIVIDAD,
            'poblacion'        => self::POBLACION,
            'linea_productiva' => self::LINEA_PRODUCTIVA,
            'presentacion'     => self::PRESENTACION,
        ];
    }
}
