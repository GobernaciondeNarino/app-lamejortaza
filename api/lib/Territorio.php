<?php
namespace LMT;
defined('LMT_GUARD') || exit('forbidden');

/**
 * Municipios y subregiones de Nariño.
 *
 * GENERADO por tools/build-subregiones.php desde municipios.geojson (DANE) y
 * la agrupación oficial de la Gobernación en 13 subregiones. No editar a mano:
 * el mismo script escribe la copia que usa el navegador
 * (js/narino-municipios.js), y las dos tienen que decir lo mismo.
 *
 * La región NO se acepta del cliente: se deduce del municipio. Es la única
 * forma de que las dos no puedan contradecirse en la base.
 */
final class Territorio
{
    /** Código DIVIPOLA => nombre oficial y subregión. */
    public const MUNICIPIOS = [
        '52019' => ['nombre' => 'Albán', 'subregion' => 'Río Mayo'],
        '52022' => ['nombre' => 'Aldana', 'subregion' => 'Obando'],
        '52036' => ['nombre' => 'Ancuya', 'subregion' => 'Occidente'],
        '52418' => ['nombre' => 'Los Andes', 'subregion' => 'Guambuyaco'],
        '52051' => ['nombre' => 'Arboleda', 'subregion' => 'Juanambú'],
        '52079' => ['nombre' => 'Barbacoas', 'subregion' => 'Telembí'],
        '52083' => ['nombre' => 'Belén', 'subregion' => 'Río Mayo'],
        '52110' => ['nombre' => 'Buesaco', 'subregion' => 'Juanambú'],
        '52240' => ['nombre' => 'Chachagüí', 'subregion' => 'Centro'],
        '52250' => ['nombre' => 'El Charco', 'subregion' => 'Sanquianga'],
        '52203' => ['nombre' => 'Colón', 'subregion' => 'Río Mayo'],
        '52207' => ['nombre' => 'Consacá', 'subregion' => 'Occidente'],
        '52210' => ['nombre' => 'Contadero', 'subregion' => 'Obando'],
        '52215' => ['nombre' => 'Córdoba', 'subregion' => 'Obando'],
        '52378' => ['nombre' => 'La Cruz', 'subregion' => 'Río Mayo'],
        '52224' => ['nombre' => 'Cuaspud Carlosama', 'subregion' => 'Obando'],
        '52227' => ['nombre' => 'Cumbal', 'subregion' => 'Obando'],
        '52233' => ['nombre' => 'Cumbitara', 'subregion' => 'La Cordillera'],
        '52381' => ['nombre' => 'La Florida', 'subregion' => 'Centro'],
        '52520' => ['nombre' => 'Francisco Pizarro', 'subregion' => 'Pacífico Sur'],
        '52287' => ['nombre' => 'Funes', 'subregion' => 'Obando'],
        '52317' => ['nombre' => 'Guachucal', 'subregion' => 'Obando'],
        '52320' => ['nombre' => 'Guaitarilla', 'subregion' => 'La Sabana'],
        '52323' => ['nombre' => 'Gualmatán', 'subregion' => 'Obando'],
        '52352' => ['nombre' => 'Iles', 'subregion' => 'Obando'],
        '52354' => ['nombre' => 'Imués', 'subregion' => 'La Sabana'],
        '52356' => ['nombre' => 'Ipiales', 'subregion' => 'Obando'],
        '52405' => ['nombre' => 'Leiva', 'subregion' => 'La Cordillera'],
        '52411' => ['nombre' => 'Linares', 'subregion' => 'Occidente'],
        '52385' => ['nombre' => 'La Llanada', 'subregion' => 'Guambuyaco'],
        '52427' => ['nombre' => 'Magüí', 'subregion' => 'Telembí'],
        '52435' => ['nombre' => 'Mallama', 'subregion' => 'Piedemonte Costero'],
        '52473' => ['nombre' => 'Mosquera', 'subregion' => 'Sanquianga'],
        '52480' => ['nombre' => 'Nariño', 'subregion' => 'Centro'],
        '52490' => ['nombre' => 'Olaya Herrera', 'subregion' => 'Sanquianga'],
        '52506' => ['nombre' => 'Ospina', 'subregion' => 'La Sabana'],
        '52001' => ['nombre' => 'Pasto', 'subregion' => 'Centro'],
        '52254' => ['nombre' => 'El Peñol', 'subregion' => 'Guambuyaco'],
        '52540' => ['nombre' => 'Policarpa', 'subregion' => 'La Cordillera'],
        '52560' => ['nombre' => 'Potosí', 'subregion' => 'Obando'],
        '52565' => ['nombre' => 'Providencia', 'subregion' => 'Los Abades'],
        '52573' => ['nombre' => 'Puerres', 'subregion' => 'Obando'],
        '52585' => ['nombre' => 'Pupiales', 'subregion' => 'Obando'],
        '52612' => ['nombre' => 'Ricaurte', 'subregion' => 'Piedemonte Costero'],
        '52621' => ['nombre' => 'Roberto Payán', 'subregion' => 'Telembí'],
        '52256' => ['nombre' => 'El Rosario', 'subregion' => 'La Cordillera'],
        '52678' => ['nombre' => 'Samaniego', 'subregion' => 'Los Abades'],
        '52685' => ['nombre' => 'San Bernardo', 'subregion' => 'Río Mayo'],
        '52687' => ['nombre' => 'San Lorenzo', 'subregion' => 'Juanambú'],
        '52693' => ['nombre' => 'San Pablo', 'subregion' => 'Río Mayo'],
        '52694' => ['nombre' => 'San Pedro de Cartago', 'subregion' => 'Juanambú'],
        '52683' => ['nombre' => 'Sandoná', 'subregion' => 'Occidente'],
        '52696' => ['nombre' => 'Santa Bárbara', 'subregion' => 'Sanquianga'],
        '52699' => ['nombre' => 'Santacruz', 'subregion' => 'Los Abades'],
        '52720' => ['nombre' => 'Sapuyes', 'subregion' => 'La Sabana'],
        '52258' => ['nombre' => 'El Tablón de Gómez', 'subregion' => 'Río Mayo'],
        '52260' => ['nombre' => 'El Tambo', 'subregion' => 'Guambuyaco'],
        '52786' => ['nombre' => 'Taminango', 'subregion' => 'La Cordillera'],
        '52788' => ['nombre' => 'Tangua', 'subregion' => 'Centro'],
        '52390' => ['nombre' => 'La Tola', 'subregion' => 'Sanquianga'],
        '52835' => ['nombre' => 'San Andrés de Tumaco', 'subregion' => 'Pacífico Sur'],
        '52838' => ['nombre' => 'Túquerres', 'subregion' => 'La Sabana'],
        '52399' => ['nombre' => 'La Unión', 'subregion' => 'Juanambú'],
        '52885' => ['nombre' => 'Yacuanquer', 'subregion' => 'Centro'],
    ];

    /** Las 13 subregiones, en el orden en que se presentan. */
    public const SUBREGIONES = [
        'Centro',
        'Guambuyaco',
        'Juanambú',
        'La Cordillera',
        'La Sabana',
        'Los Abades',
        'Obando',
        'Occidente',
        'Pacífico Sur',
        'Piedemonte Costero',
        'Río Mayo',
        'Sanquianga',
        'Telembí',
    ];

    /** Cómo lo escribe la gente => nombre oficial. */
    public const SINONIMOS = [
        'San Juan de Pasto' => 'Pasto',
        'Magüí Payán' => 'Magüí',
        'Payán' => 'Magüí',
        'Cuaspud' => 'Cuaspud Carlosama',
        'Carlosama' => 'Cuaspud Carlosama',
        'Santa Bárbara de Iscuandé' => 'Santa Bárbara',
        'Iscuandé' => 'Santa Bárbara',
        'Tumaco' => 'San Andrés de Tumaco',
        'Cartago' => 'San Pedro de Cartago',
    ];

    /** Los 32 departamentos de Colombia y Bogotá D.C. */
    public const DEPARTAMENTOS = [
        'Amazonas',
        'Antioquia',
        'Arauca',
        'Atlántico',
        'Bogotá D.C.',
        'Bolívar',
        'Boyacá',
        'Caldas',
        'Caquetá',
        'Casanare',
        'Cauca',
        'Cesar',
        'Chocó',
        'Córdoba',
        'Cundinamarca',
        'Guainía',
        'Guaviare',
        'Huila',
        'La Guajira',
        'Magdalena',
        'Meta',
        'Nariño',
        'Norte de Santander',
        'Putumayo',
        'Quindío',
        'Risaralda',
        'San Andrés y Providencia',
        'Santander',
        'Sucre',
        'Tolima',
        'Valle del Cauca',
        'Vaupés',
        'Vichada',
    ];

    /** Nombre canónico del municipio, o null si no es de Nariño. */
    public static function municipio($nombre): ?string
    {
        $f = self::buscar($nombre);
        return $f === null ? null : $f['nombre'];
    }

    /** Subregión a la que pertenece un municipio, o null si no lo reconoce. */
    public static function subregion($nombreMunicipio): ?string
    {
        $f = self::buscar($nombreMunicipio);
        return $f === null ? null : $f['subregion'];
    }

    /** @return array{nombre:string,subregion:string}|null */
    private static function buscar($nombre): ?array
    {
        $clave = self::normalizar((string) $nombre);
        if ($clave === '') return null;
        // Un sinónimo («San Juan de Pasto», «Tumaco») apunta al nombre oficial.
        foreach (self::SINONIMOS as $alias => $oficial) {
            if (self::normalizar($alias) === $clave) { $clave = self::normalizar($oficial); break; }
        }
        foreach (self::MUNICIPIOS as $m) {
            if (self::normalizar($m['nombre']) === $clave) return $m;
        }
        return null;
    }

    public static function esSubregion($nombre): bool
    {
        return in_array((string) $nombre, self::SUBREGIONES, true);
    }

    /**
     * Nombre canónico del departamento, o null si no es de Colombia.
     *
     * A diferencia del municipio del promotor, aquí null NO es un error: un
     * visitante puede venir de Ecuador y escribir su provincia. Quien llama
     * decide si lo rechaza o lo guarda tal cual.
     */
    public static function departamento($nombre): ?string
    {
        $clave = self::normalizar((string) $nombre);
        if ($clave === '') return null;
        foreach (self::DEPARTAMENTOS as $d) {
            if (self::normalizar($d) === $clave) return $d;
        }
        return null;
    }

    /** Compara nombres sin que estorben tildes, mayúsculas ni artículos. */
    public static function normalizar(string $s): string
    {
        $s = mb_strtolower(trim($s), 'UTF-8');
        $s = strtr($s, ['á'=>'a','é'=>'e','í'=>'i','ó'=>'o','ú'=>'u','ü'=>'u','ñ'=>'n']);
        $s = (string) preg_replace('/\bsan andres de\b/', '', $s);
        $s = (string) preg_replace('/\b(de|del|la|el|los|las)\b/', ' ', $s);
        return trim((string) preg_replace('/[^a-z0-9]+/', ' ', $s));
    }
}
