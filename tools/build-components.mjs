// tools/build-components.mjs — compila components/*.jsx a un único
// js/components.build.js que el navegador ejecuta como JavaScript normal.
//
// Por qué existe: app.php cargaba React, ReactDOM y Babel desde unpkg.com y
// transpilaba el JSX en el navegador en cada visita. Eso significaba (a) que
// la app entera se quedaba en blanco si la CDN no era alcanzable —una red
// institucional filtrada basta—, (b) 3 MB de Babel descargados por un visitante
// que sólo quiere votar desde el móvil con datos móviles, y (c) una CSP obligada
// a permitir 'unsafe-eval'. Con el bundle precompilado no hace falta nada de eso.
//
// Uso:   node tools/build-components.mjs
// Salida: js/components.build.js  (SE VERSIONA: el hosting compartido no
//         ejecuta build; el fichero tiene que llegar hecho en el deploy)
//
// No necesita npm: usa el propio js/vendor/babel.min.js que ya se auto-hospeda.

import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');

// El orden importa: cada archivo publica sus componentes en window y los
// siguientes los usan. App.jsx va al final porque monta React.
const ARCHIVOS = [
  'components/Shared.jsx',
  'components/Admin.jsx',
  'components/QRPrint.jsx',
  'components/VoteFlow.jsx',
  'components/Passport.jsx',
  'components/Dashboard.jsx',
  'components/Promotores.jsx',
  'components/App.jsx',
];

const SALIDA = 'js/components.build.js';

function cargarBabel() {
  const codigo = readFileSync(join(RAIZ, 'js/vendor/babel.min.js'), 'utf8');
  const ctx = createContext({ self: {}, window: {}, console, setTimeout, clearTimeout, process });
  ctx.self = ctx;
  ctx.global = ctx;
  runInContext(codigo, ctx, { filename: 'babel.min.js' });
  const babel = ctx.Babel || ctx.babel || (ctx.window && ctx.window.Babel);
  if (!babel || typeof babel.transform !== 'function') {
    throw new Error('No se pudo inicializar Babel desde js/vendor/babel.min.js');
  }
  return babel;
}

const babel = cargarBabel();
const partes = [];
let lineas = 0;

for (const rel of ARCHIVOS) {
  const ruta = join(RAIZ, rel);
  const fuente = readFileSync(ruta, 'utf8');
  const { code } = babel.transform(fuente, {
    presets: [['react', { runtime: 'classic' }]],
    filename: rel,
    compact: false,
    comments: false,
  });
  // Cada archivo va en su propia IIFE para no compartir el ámbito de módulo:
  // los .jsx declaran `const` con nombres que se repiten entre archivos
  // (ERRORES, vacio…) y concatenarlos en crudo provocaría redeclaraciones.
  partes.push(`/* ${rel} */\n(function () {\n${code}\n})();`);
  lineas += code.split('\n').length;
}

const cabecera = `// GENERADO POR tools/build-components.mjs — NO EDITAR A MANO.
// Fuente: ${ARCHIVOS.join(', ')}
// Regenerar tras tocar cualquier .jsx:  node tools/build-components.mjs
// Marca de tiempo de las fuentes: ${ARCHIVOS.map((f) => statSync(join(RAIZ, f)).mtimeMs.toFixed(0)).join(',')}
`;

writeFileSync(join(RAIZ, SALIDA), cabecera + partes.join('\n\n') + '\n', 'utf8');

const bytes = statSync(join(RAIZ, SALIDA)).size;
console.log(`${SALIDA} generado — ${ARCHIVOS.length} archivos, ${lineas} líneas, ${(bytes / 1024).toFixed(1)} KB`);
