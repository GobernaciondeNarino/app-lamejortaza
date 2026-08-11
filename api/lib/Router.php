<?php
namespace LMT;
defined('LMT_GUARD') || exit('forbidden');

final class Router
{
    /** @var array<string, array<int, array{pattern:string, handler:callable}>> */
    private array $routes = [
        'GET' => [], 'POST' => [], 'PUT' => [], 'PATCH' => [], 'DELETE' => [],
    ];

    public function get(string $pattern, callable $h): void    { $this->routes['GET'][]    = compact('pattern', 'h'); }
    public function post(string $pattern, callable $h): void   { $this->routes['POST'][]   = compact('pattern', 'h'); }
    public function put(string $pattern, callable $h): void    { $this->routes['PUT'][]    = compact('pattern', 'h'); }
    public function patch(string $pattern, callable $h): void  { $this->routes['PATCH'][]  = compact('pattern', 'h'); }
    public function delete(string $pattern, callable $h): void { $this->routes['DELETE'][] = compact('pattern', 'h'); }

    public function dispatch(string $method, string $path): void
    {
        $candidates = $this->routes[$method] ?? [];
        foreach ($candidates as $route) {
            // preg_quote ANTES de sustituir los :parametros. Sin él, un patrón
            // con '.', '(' o '|' se interpreta como metacarácter: '/export/votos.csv'
            // casaba también con '/export/votosXcsv'. Y \A..\z en vez de ^..$
            // porque '$' acepta un salto de línea final, así que "st-01\n"
            // pasaba como id válido.
            $patron = preg_quote($route['pattern'], '#');
            // El parámetro excluye barras Y caracteres de control: con [^/]+ un
            // "st-01\n" se aceptaba como id (y \z no lo impide, porque el propio
            // parámetro se come el salto de línea).
            $patron = preg_replace('#\\\\:([a-zA-Z_][a-zA-Z0-9_]*)#', '(?P<$1>[^/\x00-\x1F\x7F]+)', $patron);
            $regex = '#\A' . $patron . '\z#';
            if (preg_match($regex, $path, $m)) {
                $params = array_filter($m, 'is_string', ARRAY_FILTER_USE_KEY);
                ($route['h'])($params);
                return;
            }
        }
        Response::error(404, 'not_found');
    }
}
