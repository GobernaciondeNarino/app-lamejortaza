<?php
namespace LMT;
defined('LMT_GUARD') || exit('forbidden');

/**
 * La apariencia de la aplicación: colores, letra, logotipo, iconos y textos.
 *
 * Tres áreas, porque son tres públicos distintos y el organizador puede querer
 * tratarlas distinto:
 *
 *   plataforma  lo que ve el público: portada, ranking, voto, recorrido,
 *               inscripción y perfil. Es la BASE: lo que se ponga aquí vale
 *               también para las otras dos mientras no digan otra cosa.
 *   admin       el panel de administración.
 *   pasaporte   la página del pasaporte y el libro 3D.
 *
 * Qué NO se acepta, y por qué
 * ---------------------------
 * Nada de lo que llega del formulario acaba tal cual en el CSS. Los colores
 * tienen que ser `#rrggbb`, la letra sale de un catálogo cerrado o de un
 * archivo subido por el propio panel (y validado por su firma binaria), y los
 * nombres de familia los pone el servidor. Un campo de texto libre dentro de
 * una hoja de estilos es una puerta: con `}` y `url(…)` se inyectan reglas, y
 * con `</style>` se sale del bloque a HTML. Aquí no hay por dónde.
 *
 * Los textos se guardan como texto plano. React los escapa al pintarlos, y el
 * único «formato» es el que interpreta el componente `Texto`: saltos de línea,
 * `*acento*` y `**negrita**`. No hay HTML que filtrar porque no se acepta HTML.
 */
final class Interfaz
{
    public const AREAS = [
        'plataforma' => 'Plataforma',
        'admin'      => 'Administrador',
        'pasaporte'  => 'Pasaporte',
    ];

    /**
     * Colores configurables y su valor de fábrica.
     *
     * Los de fábrica viven en styles/tokens.css en oklch; éstos son su
     * equivalente en sRGB, que es lo que entiende un selector de color. Sólo
     * sirven para enseñar de dónde se parte: si nadie toca un color, el CSS
     * no se reescribe y manda el oklch original.
     */
    public const COLORES = [
        // El fondo y el texto se invierten en las zonas oscuras (la portada, la
        // página del pasaporte, los botones principales): el «texto» es allí
        // el fondo. Lo dice la etiqueta para que nadie se sorprenda.
        'paper'   => ['Fondo (y texto sobre oscuro)',  '#fbf0e0'],
        'ink'     => ['Texto (y fondos oscuros)',      '#26160e'],
        'grano'   => ['Acento principal',              '#7c271c'],
        'galeras' => ['Acento secundario',             '#cf5604'],
        'cafeto'  => ['Acento verde',                  '#5c7e34'],
        'good'    => ['Calificación «Excelente»',      '#419547'],
        'meh'     => ['Calificación «Regular» y estrellas', '#c79e41'],
        'bad'     => ['Calificación «Malo»',           '#cf4040'],
    ];

    /**
     * Tonos que se DERIVAN del fondo y del texto.
     *
     * Superficies, bordes y textos secundarios no se piden uno a uno: con doce
     * selectores de color el resultado casi nunca combina, y un fondo oscuro con
     * los bordes de fábrica se ve roto. Se calculan mezclando fondo y texto en
     * las mismas proporciones que guardan los de fábrica.
     *
     * [base, hacia, proporción de «hacia»]
     */
    private const DERIVADOS = [
        'paper-2' => ['paper', 'ink', 0.05],
        'paper-3' => ['paper', 'ink', 0.12],
        'line'    => ['paper', 'ink', 0.16],
        'line-2'  => ['paper', 'ink', 0.25],
        'ink-2'   => ['ink', 'paper', 0.24],
        'ink-3'   => ['ink', 'paper', 0.48],
    ];

    /**
     * Tipografías. Las tres primeras son las de fábrica y van en el propio
     * servidor (styles/fonts.css); el resto son de sistema: no se descargan,
     * así que no hay CDN de terceros ni IP de visitantes viajando a ninguna
     * parte. Para una tipografía institucional está la subida de archivo.
     */
    public const FUENTES = [
        'instrument-serif' => ['Instrument Serif (títulos de fábrica)', '"Instrument Serif", "Cormorant Garamond", Georgia, serif'],
        'geist'            => ['Geist (texto de fábrica)',             '"Geist", "Inter", -apple-system, BlinkMacSystemFont, sans-serif'],
        'jetbrains-mono'   => ['JetBrains Mono (datos de fábrica)',     '"JetBrains Mono", ui-monospace, "SF Mono", monospace'],
        'georgia'          => ['Georgia (serif clásica)',              'Georgia, "Times New Roman", serif'],
        'palatino'         => ['Palatino (serif de libro)',            '"Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif'],
        'sistema'          => ['La del sistema (la del teléfono)',     'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'],
        'verdana'          => ['Verdana (muy legible)',                'Verdana, Geneva, sans-serif'],
        'trebuchet'        => ['Trebuchet MS',                         '"Trebuchet MS", "Lucida Grande", sans-serif'],
        'mono-sistema'     => ['Monoespaciada del sistema',            'ui-monospace, "SF Mono", Menlo, Consolas, monospace'],
    ];

    /** Los tres papeles de la letra y la fuente que trae cada uno. */
    public const ROLES_FUENTE = [
        'display' => ['Títulos',          'instrument-serif'],
        'sans'    => ['Texto',            'geist'],
        'mono'    => ['Rótulos y datos',  'jetbrains-mono'],
    ];

    /** Respaldo de cada papel para una fuente subida que no llegue a cargar. */
    private const RESPALDO_FUENTE = [
        'display' => 'Georgia, serif',
        'sans'    => 'system-ui, sans-serif',
        'mono'    => 'ui-monospace, monospace',
    ];

    public const MAX_FUENTES_PROPIAS = 6;

    /**
     * Iconos. Son caracteres (un emoji, un símbolo), no imágenes: se ven en
     * cualquier teléfono sin descargar nada y no hay archivo que validar.
     */
    public const ICONOS = [
        'voto.malo'      => ['Voto «Malo»',        '😞'],
        'voto.regular'   => ['Voto «Regular»',     '😐'],
        'voto.bueno'     => ['Voto «Excelente»',   '😍'],
        'menu.inicio'    => ['Menú · Inicio',       '◆'],
        'menu.pasaporte' => ['Menú · Mi pasaporte', '❖'],
        'menu.recorrido' => ['Menú · Mi recorrido', '◈'],
        'menu.perfil'    => ['Menú · Mi perfil',    '◉'],
    ];

    /**
     * Textos editables.
     *
     * clave => [área, sección, etiqueta, texto de fábrica, máximo, tipo]
     *
     *   tipo 'linea'   una línea: botones, rótulos, nombres.
     *   tipo 'titulo'  admite saltos de línea y los marcadores *acento* y
     *                  **negrita**, que es como están hechos los titulares.
     *   tipo 'parrafo' texto corrido; admite saltos y **negrita**.
     *
     * El texto de fábrica está TAMBIÉN en el componente que lo pinta (es lo que
     * se ve si nadie cambia nada). tools/check-textos.php comprueba que los dos
     * digan lo mismo y que no haya claves huérfanas en ninguno de los lados.
     */
    public const TEXTOS = [
        // ── Plataforma ──────────────────────────────────────────────────
        'plataforma.marca.nombre'          => ['plataforma', 'Marca', 'Nombre junto al logotipo', 'La Mejor Taza', 40, 'linea'],
        'plataforma.portada.rotulo'        => ['plataforma', 'Portada', 'Rótulo sobre el titular', 'La Mejor Taza · Festival 2026', 60, 'linea'],
        'plataforma.portada.titulo'        => ['plataforma', 'Portada', 'Titular', "El pasaporte\ndel café\n*nariñense*.", 120, 'titulo'],
        'plataforma.portada.texto'         => ['plataforma', 'Portada', 'Párrafo bajo el titular', 'Recorre los stands, prueba los cafés y vota. Tu pasaporte se va sellando con cada visita, y entre todos decidimos cuál es la mejor taza de Nariño.', 400, 'parrafo'],
        'plataforma.portada.promotor'      => ['plataforma', 'Portada', 'Pregunta a los promotores', '¿Tienes un espacio en el festival?', 80, 'linea'],
        'plataforma.bienvenida.rotulo'     => ['plataforma', 'Portada', 'Rótulo de la bienvenida', 'Festival 2026 · Nariño', 60, 'linea'],
        'plataforma.bienvenida.titulo'     => ['plataforma', 'Portada', 'Título de la bienvenida', "Bienvenido al\nfestival.", 120, 'titulo'],
        'plataforma.bienvenida.texto'      => ['plataforma', 'Portada', 'Párrafo de la bienvenida', 'No necesitas cuenta ni contraseña: entra, mira el ranking en vivo y vota en los espacios que visites.', 400, 'parrafo'],
        'plataforma.bienvenida.boton'      => ['plataforma', 'Portada', 'Botón de entrada', 'Entrar al festival →', 40, 'linea'],
        'plataforma.inicio.rotulo'         => ['plataforma', 'Ranking', 'Rótulo del ranking', 'Ranking público', 60, 'linea'],
        'plataforma.inicio.titulo'         => ['plataforma', 'Ranking', 'Titular del ranking', "¿Cuál es la\nmejor taza de\n*Nariño*?", 120, 'titulo'],
        'plataforma.inicio.texto'          => ['plataforma', 'Ranking', 'Párrafo del ranking', 'El festival lo decide el público. Escanea el QR de cada stand, vota con un emoji y sella tu pasaporte.', 400, 'parrafo'],
        'plataforma.espera.rotulo'         => ['plataforma', 'Ranking', 'Rótulo sin espacios registrados', 'Festival 2026', 60, 'linea'],
        'plataforma.espera.titulo'         => ['plataforma', 'Ranking', 'Título sin espacios registrados', 'El festival arranca pronto.', 120, 'titulo'],
        'plataforma.espera.texto'          => ['plataforma', 'Ranking', 'Párrafo sin espacios registrados', 'Aún no hay stands registrados. Si eres organizador inicia sesión y registra el primero.', 400, 'parrafo'],
        'plataforma.voto.titulo'           => ['plataforma', 'Voto', 'Pregunta del voto', "¿Cómo estuvo\nel café?", 120, 'titulo'],
        'plataforma.voto.texto'            => ['plataforma', 'Voto', 'Indicación bajo la pregunta', 'Puntúa lo que quieras y toca un emoji para enviar.', 200, 'parrafo'],
        'plataforma.voto.malo'             => ['plataforma', 'Voto', 'Nombre del voto malo', 'Malo', 24, 'linea'],
        'plataforma.voto.regular'          => ['plataforma', 'Voto', 'Nombre del voto regular', 'Regular', 24, 'linea'],
        'plataforma.voto.bueno'            => ['plataforma', 'Voto', 'Nombre del voto excelente', 'Excelente', 24, 'linea'],
        'plataforma.sellado.titulo'        => ['plataforma', 'Voto', 'Título tras votar', "Tu pasaporte\nha sido sellado.", 120, 'titulo'],
        'plataforma.recorrido.titulo'      => ['plataforma', 'Recorrido', 'Título del recorrido', 'Los stands del festival.', 120, 'titulo'],
        'plataforma.recorrido.vacio'       => ['plataforma', 'Recorrido', 'Párrafo antes del primer voto', 'Escanea el QR de cualquier espacio y vota: a partir de ahí, los que visites se van encendiendo aquí.', 400, 'parrafo'],
        'plataforma.perfil.titulo'         => ['plataforma', 'Perfil', 'Título del perfil (primera vez)', "Cuéntanos\nquién nos visita.", 120, 'titulo'],
        'plataforma.perfil.texto'          => ['plataforma', 'Perfil', 'Párrafo del perfil', 'Con esto sabemos quién viene al festival y podemos preparar mejor la próxima edición. **Ningún dato es obligatorio**: responde sólo lo que quieras.', 400, 'parrafo'],
        'plataforma.inscripcion.titulo'    => ['plataforma', 'Inscripción', 'Título de la inscripción', "Inscribe tu espacio\nen el festival.", 120, 'titulo'],
        'plataforma.inscripcion.texto'     => ['plataforma', 'Inscripción', 'Párrafo de la inscripción', 'Completa los datos de tu espacio. Un organizador revisará la solicitud y te enviará por correo tu acceso al portal y el código QR de tu espacio, ya listo para imprimir.', 600, 'parrafo'],
        'plataforma.cartel.rotulo'         => ['plataforma', 'Carteles QR', 'Rótulo bajo el número del espacio', 'Festival 2026', 40, 'linea'],
        'plataforma.menu.inicio'           => ['plataforma', 'Menú', 'Menú · Inicio', 'Inicio', 24, 'linea'],
        'plataforma.menu.pasaporte'        => ['plataforma', 'Menú', 'Menú · Mi pasaporte', 'Mi pasaporte', 24, 'linea'],
        'plataforma.menu.recorrido'        => ['plataforma', 'Menú', 'Menú · Mi recorrido', 'Mi recorrido', 24, 'linea'],
        'plataforma.menu.perfil'           => ['plataforma', 'Menú', 'Menú · Mi perfil', 'Mi perfil', 24, 'linea'],

        // ── Pasaporte ──────────────────────────────────────────────────
        'pasaporte.vacio.rotulo'           => ['pasaporte', 'Sin pasaporte', 'Rótulo', 'Aún no tienes pasaporte', 60, 'linea'],
        'pasaporte.vacio.titulo'           => ['pasaporte', 'Sin pasaporte', 'Título', "Empieza tu travesía\ndel café.", 120, 'titulo'],
        'pasaporte.vacio.texto'            => ['pasaporte', 'Sin pasaporte', 'Párrafo', 'Escanea el QR de cualquier stand del festival y emite tu primer voto. Cada visita estampa una página en tu pasaporte.', 400, 'parrafo'],
        'pasaporte.portada.lugar'          => ['pasaporte', 'Portada', 'Lugar (esquina superior)', "NARIÑO\nCOLOMBIA", 60, 'titulo'],
        'pasaporte.portada.rotulo'         => ['pasaporte', 'Portada', 'Rótulo sobre el título', 'Pasaporte del Café', 40, 'linea'],
        'pasaporte.portada.titulo'         => ['pasaporte', 'Portada', 'Título de la portada', "La Mejor\nTaza.", 40, 'titulo'],
        'pasaporte.portada.portador'       => ['pasaporte', 'Portada', 'Rótulo del portador', 'Portador', 30, 'linea'],
        'pasaporte.datos.encabezado'       => ['pasaporte', 'Hoja de datos', 'Encabezado oficial', "REPÚBLICA DE COLOMBIA\nDEPARTAMENTO DE NARIÑO", 80, 'titulo'],
        'pasaporte.final.rotulo'           => ['pasaporte', 'Última hoja', 'Rótulo', 'Fin del pasaporte', 40, 'linea'],
        'pasaporte.final.titulo'           => ['pasaporte', 'Última hoja', 'Despedida', "Gracias por\ncaminar el café\ncon nosotros.", 90, 'titulo'],
        'pasaporte.final.nota'             => ['pasaporte', 'Última hoja', 'Nota final', 'Vuelve el próximo festival', 40, 'linea'],

        // ── Administrador ──────────────────────────────────────────────
        'admin.menu.rotulo'                => ['admin', 'Menú', 'Rótulo del menú lateral', 'Admin · Festival 2026', 40, 'linea'],
        'admin.acceso.rotulo'              => ['admin', 'Acceso', 'Rótulo del acceso', 'Acceso · Organizadores', 40, 'linea'],
        'admin.acceso.enlace'              => ['admin', 'Acceso', 'Enlace para desplegar el acceso', '¿Eres administrador o promotor? Entra aquí', 80, 'linea'],
        'admin.espacios.titulo'            => ['admin', 'Espacios', 'Título de Espacios', 'Espacios del festival', 60, 'linea'],
        'admin.espacios.vacio'             => ['admin', 'Espacios', 'Sin espacios registrados', 'Registra el primero.', 60, 'linea'],
        'admin.promotores.titulo'          => ['admin', 'Promotores', 'Título', 'Promotores de espacios', 60, 'linea'],
        'admin.promotores.texto'           => ['admin', 'Promotores', 'Párrafo', 'Al verificar una solicitud el sistema genera una contraseña temporal y la envía al correo del promotor. Sólo entonces podrá entrar a cargar su empresa y sus productos.', 400, 'parrafo'],
        'admin.economia.titulo'            => ['admin', 'Actividad económica', 'Título', 'Las compras del festival.', 60, 'linea'],
        'admin.personalizacion.titulo'     => ['admin', 'Configuración', 'Título de Personalización', 'Cómo se ve el festival.', 60, 'linea'],
    ];

    // ---------------------------------------------------------------------
    // Lectura
    // ---------------------------------------------------------------------

    /** Estructura vacía: todo «como viene de fábrica». */
    public static function porDefecto(): array
    {
        $areas = [];
        foreach (array_keys(self::AREAS) as $a) {
            $areas[$a] = ['colores' => [], 'fuentes' => [], 'logo' => '', 'nombre' => true];
        }
        return [
            'areas'           => $areas,
            'iconos'          => [],
            'favicon'         => '',
            'fuentes_propias' => [],
            'textos'          => [],
        ];
    }

    /** Lo guardado, limpio y completo. */
    public static function ajustes(): array
    {
        $g = Ajustes::grupo('interfaz', self::porDefecto());
        // Se vuelve a pasar por el normalizador al leer: si alguien retocó la
        // fila a mano, o una versión futura quita una clave, a la hoja de
        // estilos no llega nada que no haya pasado el filtro.
        return self::normalizar($g);
    }

    /**
     * Lo que necesita el navegador de cualquier visitante: el CSS del tema,
     * los textos cambiados, los iconos y los logotipos. Nada más.
     */
    public static function publico(?array $aj = null): array
    {
        $aj ??= self::ajustes();
        $logos = []; $nombre = [];
        foreach (array_keys(self::AREAS) as $a) {
            $logos[$a]  = $aj['areas'][$a]['logo'];
            $nombre[$a] = (bool) $aj['areas'][$a]['nombre'];
        }
        return [
            'css'     => self::css($aj),
            'textos'  => (object) $aj['textos'],
            'iconos'  => (object) $aj['iconos'],
            'logos'   => $logos,
            'nombre'  => $nombre,
            'favicon' => $aj['favicon'],
        ];
    }

    /** El catálogo para el panel: qué se puede cambiar y qué trae cada cosa. */
    public static function catalogo(): array
    {
        $textos = [];
        foreach (self::TEXTOS as $k => [$area, $seccion, $etiqueta, $defecto, $max, $tipo]) {
            $textos[] = compact('area', 'seccion', 'etiqueta', 'defecto', 'max', 'tipo') + ['clave' => $k];
        }
        $colores = [];
        foreach (self::COLORES as $k => [$etiqueta, $defecto]) $colores[] = ['clave' => $k, 'etiqueta' => $etiqueta, 'defecto' => $defecto];
        $fuentes = [];
        foreach (self::FUENTES as $k => [$etiqueta, $pila]) $fuentes[] = ['clave' => $k, 'etiqueta' => $etiqueta, 'pila' => $pila];
        $roles = [];
        foreach (self::ROLES_FUENTE as $k => [$etiqueta, $defecto]) $roles[] = ['clave' => $k, 'etiqueta' => $etiqueta, 'defecto' => $defecto];
        $iconos = [];
        foreach (self::ICONOS as $k => [$etiqueta, $defecto]) $iconos[] = ['clave' => $k, 'etiqueta' => $etiqueta, 'defecto' => $defecto];
        $areas = [];
        foreach (self::AREAS as $k => $etiqueta) $areas[] = ['clave' => $k, 'etiqueta' => $etiqueta];
        return compact('areas', 'colores', 'fuentes', 'roles', 'iconos', 'textos')
            + ['max_fuentes' => self::MAX_FUENTES_PROPIAS];
    }

    // ---------------------------------------------------------------------
    // Escritura
    // ---------------------------------------------------------------------

    /**
     * Aplica lo que manda el panel sobre lo que hay.
     *
     * El cuerpo llega PLANO —`colores: {"plataforma.paper": "#…"}`— porque
     * Security::jsonBody() sólo admite un nivel de anidación (descarta el resto
     * a propósito) y un `areas.plataforma.colores.paper` se quedaba por el
     * camino sin error ninguno: el panel decía «guardado» y no guardaba.
     *
     * Sólo toca las secciones que vienen en el cuerpo. Los logotipos, el
     * favicon y las fuentes subidas NO se cambian por aquí: tienen sus propias
     * rutas de subida, y así un formulario viejo abierto en otra pestaña no
     * puede borrar un logo que se subió después.
     */
    public static function aplicar(array $actual, array $b): array
    {
        $nuevo = $actual;
        foreach (array_keys(self::AREAS) as $a) {
            if (array_key_exists('colores', $b)) {
                $nuevo['areas'][$a]['colores'] = self::colores(self::deArea($b['colores'], $a));
            }
            if (array_key_exists('fuentes', $b)) {
                $nuevo['areas'][$a]['fuentes'] = self::fuentes(self::deArea($b['fuentes'], $a), $actual['fuentes_propias']);
            }
            if (is_array($b['nombre'] ?? null) && array_key_exists($a, $b['nombre'])) {
                $nuevo['areas'][$a]['nombre'] = (bool) $b['nombre'][$a];
            }
        }
        if (array_key_exists('iconos', $b)) $nuevo['iconos'] = self::iconos($b['iconos']);
        if (array_key_exists('textos', $b)) $nuevo['textos'] = self::textos($b['textos']);
        return self::normalizar($nuevo);
    }

    /** De un mapa plano «área.clave» => valor, lo de un área sin el prefijo. */
    private static function deArea($v, string $area): array
    {
        $out = [];
        if (!is_array($v)) return $out;
        $prefijo = $area . '.';
        foreach ($v as $k => $x) {
            if (is_string($k) && strpos($k, $prefijo) === 0) $out[substr($k, strlen($prefijo))] = $x;
        }
        return $out;
    }

    /** Guarda reemplazando: quitar un texto tiene que quitarlo de verdad. */
    public static function guardar(array $aj): void
    {
        Ajustes::reemplazar('interfaz', self::normalizar($aj));
    }

    /** Colores: sólo claves conocidas y sólo `#rrggbb`. Vacío = de fábrica. */
    public static function colores($v): array
    {
        $out = [];
        if (!is_array($v)) return $out;
        foreach (array_keys(self::COLORES) as $k) {
            $hex = self::hex($v[$k] ?? null);
            if ($hex !== null) $out[$k] = $hex;
        }
        return $out;
    }

    /** `#abc` o `#aabbcc` → `#aabbcc` en minúsculas. Cualquier otra cosa, null. */
    public static function hex($v): ?string
    {
        if (!is_string($v)) return null;
        $v = strtolower(trim($v));
        if (preg_match('/^#([0-9a-f])([0-9a-f])([0-9a-f])$/', $v, $m)) {
            return '#' . $m[1] . $m[1] . $m[2] . $m[2] . $m[3] . $m[3];
        }
        return preg_match('/^#[0-9a-f]{6}$/', $v) ? $v : null;
    }

    private static function fuentes($v, array $propias): array
    {
        $out = [];
        if (!is_array($v)) return $out;
        $ids = array_column($propias, 'id');
        foreach (array_keys(self::ROLES_FUENTE) as $rol) {
            $f = is_string($v[$rol] ?? null) ? $v[$rol] : '';
            if (isset(self::FUENTES[$f])) {
                $out[$rol] = $f;
            } elseif (preg_match('/^propia:([0-9a-f]{12})$/', $f, $m) && in_array($m[1], $ids, true)) {
                $out[$rol] = $f;
            }
        }
        return $out;
    }

    /**
     * Un icono: uno o dos caracteres visibles (un emoji puede ocupar varios
     * puntos de código). Se quitan controles e invisibles, salvo el «unidor»
     * U+200D, sin el que 👩‍🌾 se parte en dos dibujos.
     */
    public static function icono($v): string
    {
        if (!is_scalar($v)) return '';
        $s = (string) $v;
        $s = preg_replace('/[\x00-\x1F\x7F]/u', '', $s) ?? '';
        $s = preg_replace('/[\x{200B}\x{200C}\x{200E}\x{200F}\x{202A}-\x{202E}\x{2060}-\x{2064}\x{2066}-\x{2069}\x{FEFF}\x{2028}\x{2029}]/u', '', $s) ?? '';
        $s = trim($s);
        if ($s === '') return '';
        if (function_exists('grapheme_strlen')) {
            $g = grapheme_strlen($s);
            if ($g === false || $g === null || $g > 2) return '';
        }
        return mb_strlen($s, 'UTF-8') <= 16 ? $s : '';
    }

    private static function iconos($v): array
    {
        $out = [];
        if (!is_array($v)) return $out;
        foreach (array_keys(self::ICONOS) as $k) {
            $i = self::icono($v[$k] ?? '');
            if ($i !== '' && $i !== self::ICONOS[$k][1]) $out[$k] = $i;
        }
        return $out;
    }

    /**
     * Textos: sólo claves del catálogo, con su máximo. Vacío, o igual al de
     * fábrica, no se guarda: así un cambio futuro del texto de fábrica llega a
     * quien nunca lo tocó.
     */
    public static function textos($v): array
    {
        $out = [];
        if (!is_array($v)) return $out;
        foreach (self::TEXTOS as $k => [, , , $defecto, $max, $tipo]) {
            if (!array_key_exists($k, $v)) continue;
            $t = $tipo === 'linea' ? Validate::texto($v[$k], $max) : Validate::parrafos($v[$k], $max);
            if ($t !== '' && $t !== $defecto) $out[$k] = $t;
        }
        return $out;
    }

    /**
     * Vuelve a pasar todo por los filtros y rellena lo que falte.
     *
     * Pública porque app.php la usa sobre la fila leída directamente de la
     * base: allí no se puede pasar por Db::pdo(), que ante un fallo de
     * conexión responde con JSON y cortaría la página entera.
     */
    public static function normalizar(array $g): array
    {
        $base = self::porDefecto();
        $propias = [];
        foreach ((array) ($g['fuentes_propias'] ?? []) as $f) {
            if (!is_array($f)) continue;
            $id = (string) ($f['id'] ?? '');
            $archivo = (string) ($f['archivo'] ?? '');
            $formato = (string) ($f['formato'] ?? '');
            if (!preg_match('/^[0-9a-f]{12}$/', $id)) continue;
            if (!Uploads::esFuente($archivo)) continue;
            if (!in_array($formato, ['woff2', 'woff', 'truetype', 'opentype'], true)) continue;
            $propias[] = [
                'id'      => $id,
                'nombre'  => Validate::texto($f['nombre'] ?? '', 60) ?: 'Fuente propia',
                'archivo' => $archivo,
                'formato' => $formato,
            ];
            if (count($propias) >= self::MAX_FUENTES_PROPIAS) break;
        }
        $base['fuentes_propias'] = $propias;

        foreach (array_keys(self::AREAS) as $a) {
            $ga = (array) ($g['areas'][$a] ?? []);
            $base['areas'][$a] = [
                'colores' => self::colores($ga['colores'] ?? []),
                'fuentes' => self::fuentes($ga['fuentes'] ?? [], $propias),
                'logo'    => Uploads::esImagen((string) ($ga['logo'] ?? '')) ? (string) $ga['logo'] : '',
                'nombre'  => array_key_exists('nombre', $ga) ? (bool) $ga['nombre'] : true,
            ];
        }
        $base['iconos']  = self::iconos($g['iconos'] ?? []);
        $base['textos']  = self::textos($g['textos'] ?? []);
        $base['favicon'] = Uploads::esImagen((string) ($g['favicon'] ?? '')) ? (string) $g['favicon'] : '';
        return $base;
    }

    // ---------------------------------------------------------------------
    // Hoja de estilos
    // ---------------------------------------------------------------------

    /**
     * El CSS del tema. Cadena vacía si nadie cambió nada.
     *
     * `:root` lleva la plataforma y `:root[data-area="…"]` lo que el panel o
     * el pasaporte cambien encima. El atributo lo pone app.php en la primera
     * respuesta (según la URL) y el enrutador al navegar, así que no hay un
     * parpadeo con los colores de fábrica antes de los propios.
     */
    public static function css(?array $aj = null): string
    {
        $aj ??= self::ajustes();
        $partes = [];

        foreach ($aj['fuentes_propias'] as $f) {
            $partes[] = '@font-face{font-family:"' . self::familiaPropia($f['id']) . '";'
                . 'src:url("' . $f['archivo'] . '") format("' . $f['formato'] . '");'
                . 'font-display:swap;}';
        }

        $plataforma = $aj['areas']['plataforma'];
        $reglaBase = self::variables($plataforma['colores'], [], $plataforma['fuentes'], $aj);
        if ($reglaBase !== '') $partes[] = ':root{' . $reglaBase . '}';

        foreach (['admin', 'pasaporte'] as $a) {
            $area = $aj['areas'][$a];
            $regla = self::variables($area['colores'], $plataforma['colores'], $area['fuentes'], $aj);
            if ($regla !== '') $partes[] = ':root[data-area="' . $a . '"]{' . $regla . '}';
        }
        return implode("\n", $partes);
    }

    /**
     * Declaraciones de un área.
     *
     * $propios   lo que cambia esta área.
     * $heredados lo que ya cambió la plataforma (vacío para la plataforma):
     *            hace falta para recalcular los derivados cuando el área
     *            cambia sólo el fondo o sólo el texto.
     */
    private static function variables(array $propios, array $heredados, array $fuentes, array $aj): string
    {
        $d = [];
        foreach ($propios as $k => $hex) $d['--' . $k] = $hex;

        // Los derivados se recalculan si ESTA área tocó el fondo o el texto.
        if (isset($propios['paper']) || isset($propios['ink'])) {
            $efectivo = [
                'paper' => $propios['paper'] ?? $heredados['paper'] ?? self::COLORES['paper'][1],
                'ink'   => $propios['ink']   ?? $heredados['ink']   ?? self::COLORES['ink'][1],
            ];
            foreach (self::DERIVADOS as $k => [$de, $hacia, $p]) {
                $d['--' . $k] = self::mezclar($efectivo[$de], $efectivo[$hacia], $p);
            }
        }

        foreach ($fuentes as $rol => $f) {
            $d['--font-' . $rol] = self::pila($f, $rol, $aj);
        }

        $s = '';
        foreach ($d as $k => $v) $s .= $k . ':' . $v . ';';
        return $s;
    }

    public static function familiaPropia(string $id): string
    {
        return 'LMT Propia ' . $id;
    }

    /** La pila de fuentes de un papel. */
    private static function pila(string $f, string $rol, array $aj): string
    {
        if (isset(self::FUENTES[$f])) return self::FUENTES[$f][1];
        if (preg_match('/^propia:([0-9a-f]{12})$/', $f, $m)) {
            return '"' . self::familiaPropia($m[1]) . '", ' . self::RESPALDO_FUENTE[$rol];
        }
        return self::FUENTES[self::ROLES_FUENTE[$rol][1]][1];
    }

    /** Mezcla lineal en sRGB: suficiente para superficies y bordes. */
    public static function mezclar(string $a, string $b, float $p): string
    {
        $ca = self::rgb($a); $cb = self::rgb($b);
        $out = '#';
        for ($i = 0; $i < 3; $i++) {
            $out .= str_pad(dechex((int) round($ca[$i] * (1 - $p) + $cb[$i] * $p)), 2, '0', STR_PAD_LEFT);
        }
        return $out;
    }

    /** @return int[] */
    private static function rgb(string $hex): array
    {
        return [hexdec(substr($hex, 1, 2)), hexdec(substr($hex, 3, 2)), hexdec(substr($hex, 5, 2))];
    }

    /** Contraste WCAG entre dos colores (1 a 21). */
    public static function contraste(string $a, string $b): float
    {
        $l = function (string $hex): float {
            $c = array_map(function (int $v): float {
                $s = $v / 255;
                return $s <= 0.03928 ? $s / 12.92 : (($s + 0.055) / 1.055) ** 2.4;
            }, self::rgb($hex));
            return 0.2126 * $c[0] + 0.7152 * $c[1] + 0.0722 * $c[2];
        };
        $la = $l($a); $lb = $l($b);
        return (max($la, $lb) + 0.05) / (min($la, $lb) + 0.05);
    }

    /**
     * El área de una ruta de la SPA. Vive aquí para que app.php y el
     * enrutador del navegador decidan lo mismo (ver areaDeRuta en Shared.jsx).
     */
    public static function areaDeRuta(string $ruta): string
    {
        $r = '/' . trim($ruta, '/');
        if ($r === '/admin' || strpos($r, '/admin/') === 0) return 'admin';
        if ($r === '/pasaporte') return 'pasaporte';
        return 'plataforma';
    }
}
