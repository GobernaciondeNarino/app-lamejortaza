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

    /** Los dos catálogos, para pintarlos o para comprobarlos desde una prueba. */
    public static function todos(): array
    {
        return [
            'organizacion' => self::ORGANIZACION,
            'actividad'    => self::ACTIVIDAD,
        ];
    }
}
