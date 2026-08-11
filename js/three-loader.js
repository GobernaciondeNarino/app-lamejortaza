// js/three-loader.js — puente entre el three.js moderno (módulo ES) y el resto
// de scripts del sitio, que son <script> clásicos sin build step.
//
// Por qué existe: desde r160 three.js ya no publica el build UMD
// (build/three.min.js) que definía la global THREE. El build soportado es un
// módulo ES. Los módulos se ejecutan SIEMPRE después de los scripts clásicos,
// así que js/three-background.js y js/passport-book.js no pueden asumir que
// window.THREE ya exista cuando se evalúan.
//
// Este archivo se carga como script clásico ANTES que ellos y expone
// window.whenThree(cb): invoca cb(THREE) de inmediato si ya está disponible, o
// lo encola hasta que app.php termine de importar el módulo y dispare
// "lmt:three-ready". Si three.js no llega a cargar (red, CSP, navegador viejo)
// el callback simplemente nunca corre y cada consumidor mantiene su fallback.

(function () {
  var EVENT = "lmt:three-ready";
  var pendientes = [];
  var resuelto = false;

  function resolver() {
    if (resuelto || !window.THREE) return;
    resuelto = true;
    var cola = pendientes;
    pendientes = [];
    cola.forEach(function (cb) {
      try { cb(window.THREE); } catch (e) { console.error("[three-loader]", e); }
    });
  }

  window.addEventListener(EVENT, resolver);

  window.whenThree = function (cb) {
    if (typeof cb !== "function") return;
    if (window.THREE) { resolver(); try { cb(window.THREE); } catch (e) { console.error("[three-loader]", e); } return; }
    pendientes.push(cb);
  };

  // ¿Puede este navegador con este dispositivo mover una escena 3D? Los
  // consumidores lo consultan para decidir si degradan a la versión en CSS
  // antes siquiera de esperar a que el módulo cargue.
  window.threeSoportado = function () {
    try {
      if (!window.WebGLRenderingContext) return false;
      var c = document.createElement("canvas");
      var gl = c.getContext("webgl2") || c.getContext("webgl") || c.getContext("experimental-webgl");
      if (!gl) return false;
      var perder = gl.getExtension("WEBGL_lose_context");
      if (perder) perder.loseContext();
      return true;
    } catch (_) {
      return false;
    }
  };
})();
