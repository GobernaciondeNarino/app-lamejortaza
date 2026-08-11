// js/passport-book.js — el pasaporte como un libro de verdad, en three.js.
//
// Qué reemplaza: components/Passport.jsx mostraba UNA página dentro de un div
// con perspective y le aplicaba rotateY(-12deg) mientras "volteaba". No había
// hojas, ni lomo, ni papel doblándose: era una tarjeta inclinándose.
//
// Qué hace esto: construye hojas reales ancladas al lomo que ROTAN y a la vez
// SE DOBLAN. La flexión no es un truco de sombras: cada hoja es un plano
// segmentado cuyos vértices se recolocan por frame siguiendo una curva de
// longitud constante (el papel no se estira), con normales analíticas para que
// la luz corra por el pliegue como corre por el papel.
//
// Restricciones que condicionan el diseño:
//   - Script clásico, sin módulos: el proyecto no tiene build step.
//   - three.js llega como módulo ES y por tanto DESPUÉS de este archivo. Nada
//     puede asumir que THREE exista al evaluarse; todo entra por whenThree().
//   - El público principal escanea un QR y abre esto en un móvil de gama baja
//     con datos móviles. De ahí el render por demanda (0% de CPU en reposo),
//     el techo de texturas vivas y la ausencia de shadow maps.
//   - Si algo falla —sin WebGL, sin three.js, contexto perdido— React vuelve a
//     su render en CSS. Un adorno jamás puede dejar el pasaporte en blanco.

(function () {
  "use strict";

  var VERSION = "1.0.0";

  // Respaldos en hex por si el navegador no entiende oklch(): en ese caso
  // getComputedStyle devuelve cadena vacía o negro y la sonda no sirve.
  var RESPALDO = {
    "--paper": "#f7f0e3", "--paper-2": "#ece2ce", "--paper-3": "#ded1b6",
    "--ink": "#38322c", "--ink-2": "#5f574d", "--ink-3": "#8b8175",
    "--line": "#ddd4c4", "--line-2": "#c9bda8",
    "--grano": "#6b4f3a", "--galeras": "#a8593a", "--cafeto": "#5a7a4a",
  };

  // ---------------------------------------------------------------------
  // Utilidades de color: resolver tokens CSS (oklch incluido) a rgb usable
  // tanto en Canvas2D como en three.js.
  // ---------------------------------------------------------------------

  function cssVar(nombre) {
    try {
      var v = getComputedStyle(document.documentElement).getPropertyValue(nombre);
      return (v || "").trim();
    } catch (_) { return ""; }
  }

  // Sonda: el navegador convierte cualquier color CSS válido a rgb().
  function resolverColor(valorCss, respaldo) {
    if (!valorCss) return respaldo;
    try {
      var probe = document.createElement("span");
      probe.style.color = "";
      probe.style.color = valorCss;
      if (probe.style.color === "") return respaldo;   // el navegador lo rechazó
      probe.style.display = "none";
      document.body.appendChild(probe);
      var rgb = getComputedStyle(probe).color;
      document.body.removeChild(probe);
      if (!rgb || rgb === "rgba(0, 0, 0, 0)") return respaldo;
      return rgb;
    } catch (_) {
      return respaldo;
    }
  }

  function rgbAHex(rgb, respaldo) {
    var m = String(rgb).match(/\d+(\.\d+)?/g);
    if (!m || m.length < 3) return respaldo;
    return (Math.round(+m[0]) << 16) | (Math.round(+m[1]) << 8) | Math.round(+m[2]);
  }

  function paleta(colores) {
    var p = {};
    Object.keys(RESPALDO).forEach(function (token) {
      var pedido = colores && colores[token.replace("--", "")];
      p[token] = resolverColor(pedido || cssVar(token), RESPALDO[token]);
    });
    return p;
  }

  // ---------------------------------------------------------------------
  // Soporte
  // ---------------------------------------------------------------------

  function soportado() {
    try {
      if (typeof window.threeSoportado === "function" && !window.threeSoportado()) return false;
      if (typeof window.threeSoportado !== "function") {
        if (!window.WebGLRenderingContext) return false;
      }
      if (navigator.deviceMemory && navigator.deviceMemory < 2) return false;
      return true;
    } catch (_) {
      return false;
    }
  }

  // ---------------------------------------------------------------------
  // Dibujo de las páginas en Canvas2D
  // ---------------------------------------------------------------------

  var FUENTES_PEDIDAS = [
    'italic 400 64px "Instrument Serif"',
    '400 30px "Geist"',
    '500 22px "JetBrains Mono"',
  ];

  function familia(tipo, px) {
    if (tipo === "display") return 'italic 400 ' + px + 'px "Instrument Serif", Georgia, serif';
    if (tipo === "mono")    return '500 ' + px + 'px "JetBrains Mono", ui-monospace, monospace';
    return '400 ' + px + 'px "Geist", system-ui, sans-serif';
  }

  // Canvas2D no aplica letterSpacing de forma fiable en Safari: se avanza glifo
  // a glifo. Es lo que da el aire de sello oficial a los rótulos.
  function textoEspaciado(ctx, txt, x, y, espaciado) {
    var cur = x;
    for (var i = 0; i < txt.length; i++) {
      ctx.fillText(txt[i], cur, y);
      cur += ctx.measureText(txt[i]).width + espaciado;
    }
    return cur - x;
  }

  function anchoEspaciado(ctx, txt, espaciado) {
    var w = 0;
    for (var i = 0; i < txt.length; i++) w += ctx.measureText(txt[i]).width + espaciado;
    return w - espaciado;
  }

  // Una línea que no puede desbordar su hueco: los campos de la hoja de datos
  // van uno al lado del otro y un nombre largo se comería el de al lado.
  function recortar(ctx, txt, ancho) {
    var s = String(txt == null ? "" : txt);
    if (ctx.measureText(s).width <= ancho) return s;
    while (s.length > 1 && ctx.measureText(s + "…").width > ancho) s = s.slice(0, -1);
    return s + "…";
  }

  function parrafo(ctx, txt, x, y, ancho, alturaLinea, maxLineas) {
    var palabras = String(txt || "").split(/\s+/).filter(Boolean);
    var linea = "", lineas = [];
    for (var i = 0; i < palabras.length; i++) {
      var prueba = linea ? linea + " " + palabras[i] : palabras[i];
      if (ctx.measureText(prueba).width > ancho && linea) {
        lineas.push(linea); linea = palabras[i];
        if (maxLineas && lineas.length >= maxLineas) break;
      } else {
        linea = prueba;
      }
    }
    if (linea && (!maxLineas || lineas.length < maxLineas)) lineas.push(linea);
    if (maxLineas && lineas.length === maxLineas && palabras.length) {
      var ult = lineas[maxLineas - 1];
      while (ult && ctx.measureText(ult + "…").width > ancho) ult = ult.slice(0, -1);
      lineas[maxLineas - 1] = ult + "…";
    }
    for (var j = 0; j < lineas.length; j++) ctx.fillText(lineas[j], x, y + j * alturaLinea);
    return lineas.length * alturaLinea;
  }

  // Patrón de grano de papel: se genera UNA vez y se reutiliza en cada página.
  var patronGrano = null;
  function grano(ctx, W, H, color) {
    if (!patronGrano) {
      var c = document.createElement("canvas");
      c.width = c.height = 128;
      var g = c.getContext("2d");
      for (var i = 0; i < 900; i++) {
        g.fillStyle = "rgba(0,0,0," + (0.012 + Math.random() * 0.03).toFixed(3) + ")";
        g.fillRect(Math.random() * 128, Math.random() * 128, 1, 1);
      }
      patronGrano = c;
    }
    var pat = ctx.createPattern(patronGrano, "repeat");
    if (!pat) return;
    ctx.save(); ctx.fillStyle = pat; ctx.fillRect(0, 0, W, H); ctx.restore();
  }

  function renglones(ctx, W, H, color, k) {
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = Math.max(1, k);
    var paso = 26 * k;
    for (var y = paso * 2; y < H - paso; y += paso) {
      ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); ctx.stroke();
    }
    ctx.restore();
  }

  // La sombra de la canal es lo que hace creer en el volumen cuando el libro
  // está quieto: sin ella las hojas parecen calcomanías planas.
  function canalSombra(ctx, W, H, espejo) {
    var ancho = W * 0.13;
    var g = espejo
      ? ctx.createLinearGradient(W, 0, W - ancho, 0)
      : ctx.createLinearGradient(0, 0, ancho, 0);
    g.addColorStop(0, "rgba(0,0,0,0.24)");
    g.addColorStop(0.45, "rgba(0,0,0,0.07)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.save(); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  }

  function bordeDesgaste(ctx, W, H) {
    var g = ctx.createLinearGradient(W, 0, W * 0.86, 0);
    g.addColorStop(0, "rgba(0,0,0,0.10)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.save(); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  }

  function rectRedondo(ctx, x, y, w, h, r) {
    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); return; }
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // El logo de la taza, redibujado con primitivas: pasar el SVG por un
  // data:/blob: y un <img> es frágil en Safari y roza la CSP.
  function logoTaza(ctx, x, y, tam, color, acento) {
    var s = tam / 48;
    ctx.save();
    ctx.translate(x, y); ctx.scale(s, s);
    ctx.strokeStyle = color; ctx.lineWidth = 1.6; ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(10, 20); ctx.lineTo(10, 32);
    ctx.quadraticCurveTo(10, 38, 16, 38);
    ctx.lineTo(28, 38);
    ctx.quadraticCurveTo(34, 38, 34, 32);
    ctx.lineTo(34, 20); ctx.closePath(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(34, 24); ctx.quadraticCurveTo(40, 24, 40, 28);
    ctx.quadraticCurveTo(40, 32, 34, 32); ctx.stroke();
    ctx.strokeStyle = acento; ctx.lineWidth = 1.4;
    [16, 22, 28].forEach(function (vx) {
      ctx.beginPath();
      ctx.moveTo(vx, 12);
      ctx.quadraticCurveTo(vx - 2, 10, vx, 8);
      ctx.quadraticCurveTo(vx + 2, 6, vx, 4);
      ctx.stroke();
    });
    ctx.restore();
  }

  // Sello circular: la traducción a Canvas2D de SelloCircular (Shared.jsx).
  function selloCircular(ctx, cx, cy, r, stand, fecha, rotRad, escala, pal) {
    var color = resolverColor(stand.color, pal["--grano"]);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotRad);
    ctx.scale(escala, escala);
    if (ctx.globalCompositeOperation !== undefined) ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = 0.82;
    ctx.strokeStyle = color; ctx.fillStyle = color;

    ctx.lineWidth = r * 0.022;
    ctx.beginPath(); ctx.arc(0, 0, r * 0.96, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = r * 0.011;
    ctx.beginPath(); ctx.arc(0, 0, r * 0.84, 0, Math.PI * 2); ctx.stroke();

    // Texto en círculo, glifo a glifo (nada de textPath: no existe en Canvas2D).
    var leyenda = (stand.nombre || "").toUpperCase() + " · " + (stand.municipio || "").toUpperCase() + " · ";
    var rTexto = r * 0.90;
    ctx.font = familia("mono", r * 0.115);
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    var total = 0, i;
    for (i = 0; i < leyenda.length; i++) total += ctx.measureText(leyenda[i]).width + r * 0.03;
    var repeticiones = Math.max(1, Math.floor((2 * Math.PI * rTexto) / total));
    var completo = "";
    for (i = 0; i < repeticiones; i++) completo += leyenda;
    var anguloTotal = 0, anchos = [];
    for (i = 0; i < completo.length; i++) {
      var w = ctx.measureText(completo[i]).width + r * 0.03;
      anchos.push(w); anguloTotal += w / rTexto;
    }
    var ang = -Math.PI / 2 - anguloTotal / 2;
    ctx.save();
    for (i = 0; i < completo.length; i++) {
      var da = anchos[i] / rTexto;
      ctx.save();
      ctx.rotate(ang + da / 2);
      ctx.fillText(completo[i], 0, -rTexto);
      ctx.restore();
      ang += da;
    }
    ctx.restore();

    ctx.font = familia("mono", r * 0.13);
    textoCentradoEspaciado(ctx, "VISITADO", 0, -r * 0.14, r * 0.035);
    ctx.font = familia("display", r * 0.30);
    ctx.fillText(String(stand.nombre || "").split(" ")[0], 0, r * 0.14);
    ctx.font = familia("mono", r * 0.115);
    textoCentradoEspaciado(ctx, fecha, 0, r * 0.40, r * 0.025);

    ctx.restore();
  }

  function textoCentradoEspaciado(ctx, txt, cx, y, espaciado) {
    var w = anchoEspaciado(ctx, txt, espaciado);
    var prev = ctx.textAlign;
    ctx.textAlign = "left";
    textoEspaciado(ctx, txt, cx - w / 2, y, espaciado);
    ctx.textAlign = prev;
  }

  /**
   * Pinta una página en un canvas. Todas las medidas son fracción de la altura
   * (k = alto/1066) para que 384 px y 1024 px den exactamente el mismo diseño.
   */
  function pintarPagina(canvas, pagina, pal, fecha, ladoIzquierdo, progresoSello) {
    var ctx = canvas.getContext("2d");
    var W = canvas.width, H = canvas.height, k = H / 1066;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    ctx.globalAlpha = 1;
    if (ctx.globalCompositeOperation !== undefined) ctx.globalCompositeOperation = "source-over";

    var tipo = pagina && pagina.tipo;

    if (tipo === "portada") {
      var g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, pal["--grano"]);
      g.addColorStop(1, "#2c2018");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      grano(ctx, W, H);

      logoTaza(ctx, W * 0.09, H * 0.07, 46 * k, pal["--paper"], pal["--paper-3"]);

      ctx.fillStyle = pal["--paper-3"];
      ctx.font = familia("mono", 13 * k);
      ctx.textAlign = "right";
      textoCentradoEspaciado(ctx, "NARIÑO", W * 0.83, H * 0.085, 1.6 * k);
      textoCentradoEspaciado(ctx, "COLOMBIA", W * 0.83, H * 0.115, 1.6 * k);
      ctx.textAlign = "left";

      ctx.fillStyle = pal["--paper-3"];
      ctx.font = familia("mono", 13 * k);
      textoEspaciado(ctx, "PASAPORTE DEL CAFÉ", W * 0.09, H * 0.50, 1.6 * k);
      ctx.fillStyle = pal["--paper"];
      ctx.font = familia("display", 62 * k);
      ctx.fillText("La Mejor", W * 0.085, H * 0.585);
      ctx.fillText("Taza.", W * 0.085, H * 0.645);

      ctx.strokeStyle = "rgba(255,255,255,0.28)"; ctx.lineWidth = 1 * k;
      ctx.beginPath(); ctx.moveTo(W * 0.09, H * 0.80); ctx.lineTo(W * 0.91, H * 0.80); ctx.stroke();

      ctx.fillStyle = pal["--paper-3"];
      ctx.font = familia("mono", 12 * k);
      textoEspaciado(ctx, "PORTADOR", W * 0.09, H * 0.845, 1.6 * k);
      ctx.fillStyle = pal["--paper"];
      ctx.font = familia("display", 32 * k);
      ctx.fillText(String(pagina.nombre || "Visitante"), W * 0.085, H * 0.895);
      ctx.fillStyle = pal["--paper-3"];
      ctx.font = familia("sans", 15 * k);
      ctx.fillText(String(pagina.correo || ""), W * 0.09, H * 0.928);
      return;
    }

    // Todas las demás páginas comparten el papel.
    ctx.fillStyle = pal["--paper"]; ctx.fillRect(0, 0, W, H);
    grano(ctx, W, H);
    // La hoja de datos no lleva renglones: es una ficha, no una página para
    // escribir. Con ellos parecía un cuaderno y no el documento que imita.
    if (tipo !== "contraportada" && tipo !== "indice") renglones(ctx, W, H, pal["--line"], k);

    if (tipo === "indice") {
      // Hoja de datos, como la página del titular en un pasaporte de verdad:
      // recuadro de la foto a la izquierda, ficha a la derecha y banda de
      // lectura mecánica abajo. Antes era un índice de casillas vacías.
      var sellados = pagina.visitados | 0;

      ctx.fillStyle = pal["--ink-3"]; ctx.font = familia("mono", 12 * k);
      textoEspaciado(ctx, "REPÚBLICA DE COLOMBIA · NARIÑO", W * 0.09, H * 0.075, 1.4 * k);
      ctx.textAlign = "right";
      textoEspaciado(ctx, "P·CAFÉ", W * 0.91, H * 0.075, 1.4 * k);
      ctx.textAlign = "left";
      ctx.strokeStyle = pal["--line-2"]; ctx.lineWidth = 1 * k;
      ctx.beginPath(); ctx.moveTo(W * 0.09, H * 0.095); ctx.lineTo(W * 0.91, H * 0.095); ctx.stroke();

      // Recuadro de la foto: inicial y número de sellos.
      var fx = W * 0.09, fy = H * 0.115, fw = W * 0.24, fh = H * 0.20;
      ctx.strokeStyle = pal["--line-2"]; ctx.lineWidth = 1.5 * k;
      ctx.strokeRect(fx, fy, fw, fh);
      ctx.fillStyle = pal["--ink"]; ctx.font = familia("display", 46 * k);
      ctx.textAlign = "center";
      ctx.fillText(String(pagina.nombre || "V").trim().charAt(0).toUpperCase(), fx + fw / 2, fy + fh * 0.46);
      ctx.fillStyle = pal["--ink-3"]; ctx.font = familia("mono", 11 * k);
      textoCentradoEspaciado(ctx, "SELLOS", fx + fw / 2, fy + fh * 0.72, 1.4 * k);
      ctx.fillStyle = pal["--ink"]; ctx.font = familia("mono", 18 * k);
      ctx.fillText(("0" + sellados).slice(-2), fx + fw / 2, fy + fh * 0.92);
      ctx.textAlign = "left";

      // Ficha: etiqueta pequeña arriba, valor debajo.
      var cx = W * 0.38;
      function campo(etiqueta, valor, x, y, maxAncho) {
        ctx.fillStyle = pal["--ink-3"]; ctx.font = familia("mono", 10 * k);
        textoEspaciado(ctx, etiqueta, x, y, 1.2 * k);
        ctx.fillStyle = pal["--ink"]; ctx.font = familia("sans", 16 * k);
        ctx.fillText(recortar(ctx, String(valor == null || valor === "" ? "——" : valor), maxAncho), x, y + 21 * k);
      }
      campo("PORTADOR / BEARER", pagina.nombre, cx, H * 0.135, W * 0.53);
      campo("SEXO", pagina.sexo, cx, H * 0.195, W * 0.20);
      campo("EDAD", pagina.edad, W * 0.60, H * 0.195, W * 0.31);
      campo("PROCEDENCIA", pagina.procedencia, cx, H * 0.255, W * 0.53);
      campo("Nº DE PASAPORTE", pagina.numero, cx, H * 0.315, W * 0.53);

      campo("EXPEDIDO", pagina.expedido, W * 0.09, H * 0.395, W * 0.30);
      campo("VISITANTE", pagina.visitante, W * 0.44, H * 0.395, W * 0.47);
      campo("CONTACTO", pagina.correo, W * 0.09, H * 0.465, W * 0.55);
      campo("AVANCE", sellados + " / " + (pagina.totalStands | 0), W * 0.70, H * 0.465, W * 0.21);

      if (!pagina.conPerfil) {
        ctx.fillStyle = pal["--ink-3"]; ctx.font = familia("sans", 13 * k);
        parrafo(ctx, "Completa tu perfil de visitante y esta hoja se llena con tus datos.",
                W * 0.09, H * 0.545, W * 0.82, 18 * k, 2);
      }

      campo("AUTORIDAD EXPEDIDORA", "Gobernación de Nariño", W * 0.09, H * 0.700, W * 0.50);
      ctx.fillStyle = pal["--ink-3"]; ctx.font = familia("mono", 10 * k);
      textoEspaciado(ctx, "FIRMA", W * 0.66, H * 0.700, 1.2 * k);
      ctx.strokeStyle = pal["--line-2"]; ctx.lineWidth = 1 * k;
      if (ctx.setLineDash) ctx.setLineDash([1.5 * k, 3.5 * k]);
      ctx.beginPath(); ctx.moveTo(W * 0.66, H * 0.725); ctx.lineTo(W * 0.91, H * 0.725); ctx.stroke();
      if (ctx.setLineDash) ctx.setLineDash([]);

      // Banda de lectura mecánica.
      ctx.strokeStyle = pal["--line-2"]; ctx.lineWidth = 1 * k;
      ctx.beginPath(); ctx.moveTo(W * 0.09, H * 0.875); ctx.lineTo(W * 0.91, H * 0.875); ctx.stroke();
      ctx.fillStyle = pal["--ink-2"]; ctx.font = familia("mono", 15 * k);
      ctx.fillText(String(pagina.mrz1 || ""), W * 0.09, H * 0.915);
      ctx.fillText(String(pagina.mrz2 || ""), W * 0.09, H * 0.950);
    } else if (tipo === "sello") {
      var s = pagina.stand || {};
      ctx.fillStyle = pal["--ink-3"]; ctx.font = familia("mono", 13 * k);
      textoEspaciado(ctx, ("SELLO · " + (s.municipio || "")).toUpperCase(), W * 0.09, H * 0.09, 1.6 * k);
      ctx.fillStyle = pal["--ink"]; ctx.font = familia("display", 32 * k);
      ctx.fillText(String(s.nombre || ""), W * 0.085, H * 0.14);
      ctx.fillStyle = pal["--ink-3"]; ctx.font = familia("sans", 13 * k);
      ctx.fillText(String(s.region || ""), W * 0.09, H * 0.172);

      var rot = (((String(s.id || "x").charCodeAt(String(s.id || "x").length - 1) || 0) % 20) - 10) * Math.PI / 180;
      selloCircular(ctx, W * 0.52, H * 0.48, W * 0.34, s, fecha, rot,
                    progresoSello === undefined ? 1 : progresoSello, pal);

      ctx.fillStyle = pal["--ink-2"]; ctx.font = familia("display", 19 * k);
      parrafo(ctx, "“" + (s.descripcion || "") + "”", W * 0.09, H * 0.845, W * 0.82, 24 * k, 3);
    } else if (tipo === "final") {
      ctx.textAlign = "center";
      ctx.fillStyle = pal["--ink-3"]; ctx.font = familia("mono", 13 * k);
      textoCentradoEspaciado(ctx, "FIN DEL PASAPORTE", W * 0.5, H * 0.36, 1.6 * k);
      ctx.fillStyle = pal["--ink"]; ctx.font = familia("display", 38 * k);
      ctx.fillText("Gracias por", W * 0.5, H * 0.45);
      ctx.fillText("caminar el café", W * 0.5, H * 0.50);
      ctx.fillText("con nosotros.", W * 0.5, H * 0.55);

      ctx.font = familia("sans", 15 * k);
      var txt = "Vuelve el próximo festival";
      var wTxt = ctx.measureText(txt).width;
      ctx.strokeStyle = pal["--line-2"]; ctx.lineWidth = 1 * k;
      rectRedondo(ctx, W * 0.5 - wTxt / 2 - 22 * k, H * 0.62, wTxt + 44 * k, 42 * k, 21 * k);
      ctx.stroke();
      ctx.fillStyle = pal["--ink-2"];
      ctx.fillText(txt, W * 0.5, H * 0.648);

      ctx.fillStyle = pal["--ink-3"]; ctx.font = familia("mono", 12 * k);
      textoCentradoEspaciado(ctx, (pagina.visitados | 0) + " / " + (pagina.totalStands | 0) + " STANDS", W * 0.5, H * 0.73, 1.4 * k);
      ctx.textAlign = "left";
    } else if (tipo === "contraportada") {
      ctx.fillStyle = pal["--grano"]; ctx.fillRect(0, 0, W, H);
      grano(ctx, W, H);
      ctx.globalAlpha = 0.25;
      logoTaza(ctx, W * 0.5 - 30 * k, H * 0.45, 60 * k, pal["--paper"], pal["--paper"]);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(255,255,255,0.45)"; ctx.font = familia("mono", 12 * k);
      ctx.textAlign = "center";
      textoCentradoEspaciado(ctx, "GOBERNACIÓN DE NARIÑO · 2026", W * 0.5, H * 0.62, 1.6 * k);
      ctx.textAlign = "left";
    }

    bordeDesgaste(ctx, W, H);
    canalSombra(ctx, W, H, !!ladoIzquierdo);
  }

  // ---------------------------------------------------------------------
  // Montaje
  // ---------------------------------------------------------------------

  function mount(contenedor, opciones) {
    opciones = opciones || {};
    var cb = {
      onReady: opciones.onReady || function () {},
      onPageChange: opciones.onPageChange || function () {},
      onFlipStart: opciones.onFlipStart || function () {},
      onFallback: opciones.onFallback || function () {},
      onError: opciones.onError || function () {},
    };

    if (!contenedor || !contenedor.nodeType) { cb.onFallback("error"); return null; }
    if (contenedor.dataset.libroMontado === "1") return null;
    if (!soportado()) { cb.onFallback("sin-webgl"); return null; }

    contenedor.dataset.libroMontado = "1";

    var paginas = normalizarPaginas(opciones.paginas || []);
    var indice = Math.max(0, Math.min(paginas.length - 1, opciones.paginaInicial | 0));
    var aspecto = opciones.aspecto || 0.72;
    var fecha = opciones.fecha || "14·ABR·2026";

    var mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    var reducirMovimiento = !!(mq && mq.matches) && opciones.respetarReducedMotion !== false;

    var destruido = false, abortado = false, listo = false;
    var THREE_ = null, renderer = null, scene = null, camera = null;
    // `texturas`/`canvases` se indexan por "p"+numeroDePagina (ventana LRU).
    // `compartidas` guarda las que no pertenecen a ninguna página (canto, papel).
    var hojas = [], texturas = {}, canvases = {}, compartidas = [], ordenLRU = [];
    var sombraHoja = null, lomo = null, cantoDer = null, cantoIzq = null;
    var texturaBlanca = null, texturaVerso = null;
    var rafId = 0, sucio = false, pausado = false;
    var ro = null, io = null, debounceResize = 0, timeoutThree = 0;
    var pal = paleta(opciones.colores);
    var fuentesListas = false;
    var pendientes = [];   // llamadas hechas antes de que three.js llegara

    // Estado de animación
    var vuelo = null;      // { hoja, dir, t, dur, inicio, resolve, destino }
    // Posición del lomo dentro del lienzo (0..1). La calcula colocarCamara() y
    // la usa el gesto de toque para saber qué mitad es "avanzar".
    var lomoEnLienzo = 0.5;
    // Encuadre de la cámara. En reposo se ajusta al libro para que se lea lo
    // más grande posible; sólo se abre mientras una hoja está en el aire, que
    // es cuando hace falta ver el arco. Antes estaba fijo en el valor ancho y
    // el libro desperdiciaba un tercio de la pantalla del móvil todo el rato.
    // 1.02 = el libro casi toca los bordes del lienzo. Con 1.08 sobraba un 8 %
    // de aire alrededor todo el rato, que en un teléfono son milímetros de
    // texto legible tirados a la basura; el margen que queda es sólo el que
    // necesita la sombra del canto para no cortarse.
    var ENCUADRE_REPOSO = 1.02, ENCUADRE_VUELO = 1.42;
    var encuadre = ENCUADRE_REPOSO, encuadreObjetivo = ENCUADRE_REPOSO;
    var arrastre = null;
    var selloAnimado = {}; // páginas cuyo sello ya aterrizó

    var W = 1.0, H = W / aspecto, T = 0.0022;
    var esMovil = Math.min(window.innerWidth, window.innerHeight) < 520;
    var calidad = opciones.calidad || "auto";
    if (calidad === "auto") {
      var pocoNucleo = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
      var ahorroDatos = navigator.connection && navigator.connection.saveData;
      calidad = (pocoNucleo || ahorroDatos) ? "baja" : (esMovil ? "media" : "alta");
    }
    var SEG_X = calidad === "baja" ? 10 : (esMovil ? 14 : 24);
    var MAX_TEXTURAS = calidad === "baja" ? 4 : 6;
    var DUR_FLIP = opciones.duracionFlip !== undefined ? opciones.duracionFlip : (esMovil ? 520 : 620);
    var A_MAX_HOJA = 0.95, A_MAX_TAPA = 0.34, G_LOMO = 0.18;
    var VENTANA_ANTES = 2, VENTANA_DESPUES = 3;

    // -------------------------------------------------------------------
    // Arranque diferido: three.js llega como módulo, siempre después.
    // -------------------------------------------------------------------
    if (window.THREE) {
      iniciar(window.THREE);
    } else if (typeof window.whenThree === "function") {
      timeoutThree = setTimeout(function () {
        if (listo || destruido) return;
        abortado = true;
        limpiarContenedor();
        cb.onFallback("sin-three");
      }, 2500);
      window.whenThree(function (T3) {
        if (abortado || destruido) return;
        clearTimeout(timeoutThree);
        iniciar(T3);
      });
    } else {
      limpiarContenedor();
      cb.onFallback("sin-three");
      return null;
    }

    function limpiarContenedor() {
      try { delete contenedor.dataset.libroMontado; } catch (_) {}
    }

    function iniciar(T3) {
      try {
        THREE_ = T3;
        construir();
        listo = true;
        pendientes.forEach(function (fn) { try { fn(); } catch (_) {} });
        pendientes.length = 0;
        cargarFuentes();
        cb.onReady();
        cb.onPageChange(indice, paginas.length);
        solicitarFrame();
      } catch (e) {
        try { cb.onError(e); } catch (_) {}
        destroy();
        cb.onFallback("error");
      }
    }

    function cargarFuentes() {
      if (!document.fonts || !document.fonts.load) { fuentesListas = true; return; }
      Promise.all(FUENTES_PEDIDAS.map(function (f) {
        return document.fonts.load(f).catch(function () {});
      })).then(function () {
        if (destruido) return;
        fuentesListas = true;
        invalidarTexturas();
      });
      if (document.fonts.ready && document.fonts.ready.then) {
        document.fonts.ready.then(function () { if (!destruido) invalidarTexturas(); });
      }
    }

    // -------------------------------------------------------------------
    // Construcción de la escena
    // -------------------------------------------------------------------

    function construir() {
      var rect = contenedor.getBoundingClientRect();
      var ancho = Math.max(1, rect.width), alto = Math.max(1, rect.height);

      scene = new THREE_.Scene();
      camera = new THREE_.PerspectiveCamera(32, ancho / alto, 0.05, 40);

      var dprBase = window.devicePixelRatio || 1;
      var dpr = calidad === "baja" ? Math.min(dprBase, 1.25)
              : esMovil ? Math.min(dprBase, 1.75)
              : Math.min(dprBase, 2);

      renderer = new THREE_.WebGLRenderer({
        antialias: dpr < 1.75, alpha: true, stencil: false,
        powerPreference: "default", preserveDrawingBuffer: false,
      });
      renderer.setPixelRatio(dpr);
      renderer.setSize(ancho, alto, false);
      renderer.setClearColor(0x000000, 0);

      var canvas = renderer.domElement;
      canvas.setAttribute("aria-hidden", "true");
      canvas.tabIndex = -1;
      Object.assign(canvas.style, {
        position: "absolute", inset: "0", width: "100%", height: "100%",
        zIndex: "0", touchAction: "pan-y",
      });
      if (getComputedStyle(contenedor).position === "static") contenedor.style.position = "relative";
      contenedor.insertBefore(canvas, contenedor.firstChild);

      // Intensidades calibradas para three r155+: desde esa versión las luces
      // usan unidades físicas y la contribución difusa se divide entre π, así
      // que los valores "clásicos" (0.7 / 0.5) dejan el papel gris apagado.
      scene.add(new THREE_.AmbientLight(0xffffff, 0.86));
      var clave = new THREE_.DirectionalLight(0xfff2e0, 1.45);
      clave.position.set(-0.8, 1.2, 1.6); scene.add(clave);
      var relleno = new THREE_.DirectionalLight(0xdfe6ff, 0.45);
      relleno.position.set(1.4, -0.6, 0.9); scene.add(relleno);

      texturaBlanca = crearTexturaPlana(pal["--paper"]);
      texturaVerso = crearTexturaVerso();

      construirLomoYCantos();
      construirSombraHoja();
      construirHojas();
      colocarCamara();
      actualizarPosiciones();
      conectarEventos();
    }

    /**
     * Verso: el reverso de todas las hojas.
     *
     * Cada hoja lleva UNA página lógica en el anverso (el pasaporte se lee de
     * una en una, que es lo que cabe en un móvil). Un papel físico no puede
     * mostrar el mismo contenido por las dos caras, así que el reverso es papel
     * rayado en blanco —como los versos en blanco de un pasaporte real—. La
     * alternativa (pintar ahí la página siguiente) duplicaba el contenido: al
     * abrir el libro se veía dos veces la misma página, una de ellas espejada.
     * De paso, una sola textura compartida en vez de una por hoja.
     */
    function crearTexturaVerso() {
      var lado = Math.min(512, ladoTextura());
      var c = document.createElement("canvas");
      c.width = lado;
      c.height = Math.round(lado / aspecto);
      var ctx = c.getContext("2d");
      var k = c.height / 1066;
      ctx.fillStyle = pal["--paper"];
      ctx.fillRect(0, 0, c.width, c.height);
      grano(ctx, c.width, c.height);
      renglones(ctx, c.width, c.height, pal["--line"], k);
      bordeDesgaste(ctx, c.width, c.height);
      canalSombra(ctx, c.width, c.height, true);   // la canal va al otro lado
      var t = new THREE_.CanvasTexture(c);
      t.colorSpace = THREE_.SRGBColorSpace;
      t.generateMipmaps = false;
      t.minFilter = t.magFilter = THREE_.LinearFilter;
      compartidas.push(t);
      return t;
    }

    function crearTexturaPlana(color) {
      var c = document.createElement("canvas");
      c.width = c.height = 8;
      var g = c.getContext("2d");
      g.fillStyle = color; g.fillRect(0, 0, 8, 8);
      var t = new THREE_.CanvasTexture(c);
      t.colorSpace = THREE_.SRGBColorSpace;
      t.generateMipmaps = false;
      t.minFilter = t.magFilter = THREE_.LinearFilter;
      return t;
    }

    function construirLomoYCantos() {
      var grosor = Math.max(0.02, T * paginas.length);
      // Semicilindro abierto = el lomo redondeado clásico. El eje de
      // CylinderGeometry ya es Y (vertical, la altura de la página): NO hay que
      // rotarlo. thetaStart=PI/2 con thetaLength=PI deja la panza hacia -X, que
      // es justo el lado por el que sobresale el lomo de un pasaporte.
      var geoLomo = new THREE_.CylinderGeometry(grosor / 2, grosor / 2, H, 14, 1, true, Math.PI / 2, Math.PI);
      var matLomo = new THREE_.MeshPhongMaterial({
        color: rgbAHex(pal["--grano"], 0x6b4f3a), shininess: 8,
        specular: 0x2a2018, side: THREE_.DoubleSide,
      });
      lomo = new THREE_.Mesh(geoLomo, matLomo);
      lomo.position.set(0, 0, 0);
      scene.add(lomo);

      var texCanto = crearTexturaCanto();
      [0, 1].forEach(function (i) {
        var geo = new THREE_.BoxGeometry(W * 0.995, H * 0.995, 1);
        var mat = new THREE_.MeshLambertMaterial({ map: texCanto, color: 0xffffff });
        var m = new THREE_.Mesh(geo, mat);
        m.position.set(W / 2, 0, 0);
        m.scale.z = 0.001;
        scene.add(m);
        if (i === 0) cantoDer = m; else cantoIzq = m;
      });
    }

    function crearTexturaCanto() {
      var c = document.createElement("canvas");
      c.width = 8; c.height = 64;
      var g = c.getContext("2d");
      for (var y = 0; y < 64; y++) {
        g.fillStyle = (y % 2 === 0) ? pal["--paper-2"] : pal["--paper-3"];
        g.fillRect(0, y, 8, 1);
      }
      var t = new THREE_.CanvasTexture(c);
      t.colorSpace = THREE_.SRGBColorSpace;
      t.wrapS = t.wrapT = THREE_.RepeatWrapping;
      t.repeat.set(1, 40);
      t.generateMipmaps = false;
      t.minFilter = t.magFilter = THREE_.LinearFilter;
      compartidas.push(t);
      return t;
    }

    // Sombra proyectada de la hoja en vuelo: un plano aplanado que reutiliza la
    // misma tabla de flexión. Un shadow map costaría más que toda la escena.
    function construirSombraHoja() {
      var geo = new THREE_.PlaneGeometry(W, H, SEG_X, 1);
      geo.translate(W / 2, 0, 0);
      var mat = new THREE_.MeshBasicMaterial({
        color: 0x000000, transparent: true, opacity: 0,
        depthWrite: false, side: THREE_.DoubleSide,
      });
      sombraHoja = new THREE_.Mesh(geo, mat);
      sombraHoja.position.z = 0.0009;
      sombraHoja.renderOrder = 90;
      sombraHoja.visible = false;
      scene.add(sombraHoja);
    }

    function crearHoja() {
      var geo = new THREE_.PlaneGeometry(W, H, SEG_X, 1);
      geo.translate(W / 2, 0, 0);
      geo.clearGroups();
      geo.addGroup(0, Infinity, 0);
      geo.addGroup(0, Infinity, 1);
      geo.boundingSphere = new THREE_.Sphere(new THREE_.Vector3(W / 2, 0, 0), W * 1.15);

      var matAnverso = new THREE_.MeshLambertMaterial({ map: texturaBlanca, side: THREE_.FrontSide });
      var matReverso = new THREE_.MeshLambertMaterial({ map: texturaBlanca, side: THREE_.BackSide });
      var mesh = new THREE_.Mesh(geo, [matAnverso, matReverso]);

      var pos = geo.attributes.position;
      var yBase = new Float32Array(pos.count);
      for (var i = 0; i < pos.count; i++) yBase[i] = pos.getY(i);

      mesh.userData = {
        yBase: yBase,
        tab: new Float32Array((SEG_X + 1) * 3),
        pagina: -1,
        congelada: false,
      };
      scene.add(mesh);
      return mesh;
    }

    function construirHojas() {
      var n = Math.min(paginas.length, VENTANA_ANTES + VENTANA_DESPUES + 2);
      for (var i = 0; i < n; i++) hojas.push(crearHoja());
    }

    // -------------------------------------------------------------------
    // Texturas de página con ventana LRU
    // -------------------------------------------------------------------

    function ladoTextura() {
      var rect = contenedor.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var base = Math.round(Math.max(rect.width, 120) * dpr);
      var techo = calidad === "baja" ? 640 : 1024;
      return Math.max(384, Math.min(techo, base));
    }

    /**
     * Textura de la página n. `espejada` la devuelve invertida en horizontal,
     * que es lo que necesita el REVERSO de una hoja: al girar la hoja 180° se
     * ve su cara BackSide, y las UV no se voltean solas — sin espejar, el
     * texto de la pila izquierda sale al revés.
     * Ambas variantes comparten el mismo <canvas>: se pinta una sola vez.
     */
    function texturaDe(n, espejada) {
      if (n < 0 || n >= paginas.length) return texturaBlanca;
      var clave = (espejada ? "m" : "p") + n;
      if (texturas[clave]) { tocarLRU(n); return texturas[clave]; }

      var c = canvases["p" + n];
      if (!c) {
        var lado = ladoTextura();
        c = document.createElement("canvas");
        c.width = lado;
        c.height = Math.round(lado / aspecto);
        pintarPagina(c, paginas[n], pal, fecha, false, selloAnimado[n] === undefined ? 1 : selloAnimado[n]);
        canvases["p" + n] = c;
      }

      var t = new THREE_.CanvasTexture(c);
      t.colorSpace = THREE_.SRGBColorSpace;
      t.generateMipmaps = false;
      t.minFilter = t.magFilter = THREE_.LinearFilter;
      if (espejada) {
        t.wrapS = THREE_.RepeatWrapping;
        t.repeat.x = -1;
        t.offset.x = 1;
      }
      try { t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy()); } catch (_) {}
      t.needsUpdate = true;

      texturas[clave] = t;
      tocarLRU(n);
      podarLRU();
      return t;
    }

    function tocarLRU(n) {
      var i = ordenLRU.indexOf(n);
      if (i !== -1) ordenLRU.splice(i, 1);
      ordenLRU.push(n);
    }

    function podarLRU() {
      var vueltas = 0;
      while (ordenLRU.length > MAX_TEXTURAS && vueltas++ < ordenLRU.length) {
        var viejo = ordenLRU.shift();
        // La página actual y sus vecinas inmediatas no se liberan nunca: se
        // volverían a pedir en el mismo frame.
        if (Math.abs(viejo - indice) <= 1) { ordenLRU.push(viejo); continue; }
        ["p", "m"].forEach(function (prefijo) {
          var t = texturas[prefijo + viejo];
          if (t) { t.dispose(); delete texturas[prefijo + viejo]; }
        });
        var c = canvases["p" + viejo];
        if (c) { c.width = c.height = 1; delete canvases["p" + viejo]; }
      }
    }

    function invalidarTexturas() {
      Object.keys(canvases).forEach(function (clave) {
        var n = parseInt(clave.slice(1), 10);
        var c = canvases[clave];
        if (!c || isNaN(n) || !paginas[n]) return;
        pintarPagina(c, paginas[n], pal, fecha, false, selloAnimado[n] === undefined ? 1 : selloAnimado[n]);
        if (texturas["p" + n]) texturas["p" + n].needsUpdate = true;
        if (texturas["m" + n]) texturas["m" + n].needsUpdate = true;
      });
      solicitarFrame();
    }

    // -------------------------------------------------------------------
    // Flexión del papel
    // -------------------------------------------------------------------

    // Integra la curva de tangente a(u) = A·u² + G·e^(-8u) por trapecios. La
    // longitud del arco se conserva: el papel se dobla, no se estira.
    function tablaFlexion(A, G, tab) {
      var du = 1 / SEG_X, ds = W * du, x = 0, z = 0;
      tab[0] = 0; tab[1] = 0; tab[2] = G;
      for (var i = 1; i <= SEG_X; i++) {
        var u0 = (i - 1) * du, u1 = i * du;
        var a0 = A * u0 * u0 + G * Math.exp(-8 * u0);
        var a1 = A * u1 * u1 + G * Math.exp(-8 * u1);
        var am = (a0 + a1) * 0.5;
        x += Math.cos(am) * ds;
        z += Math.sin(am) * ds;
        tab[i * 3] = x; tab[i * 3 + 1] = z; tab[i * 3 + 2] = a1;
      }
    }

    function aplicarFlexion(mesh, A, G) {
      var d = mesh.userData;
      tablaFlexion(A, G, d.tab);
      var geo = mesh.geometry;
      var pos = geo.attributes.position, nor = geo.attributes.normal;
      for (var fila = 0; fila <= 1; fila++) {
        for (var i = 0; i <= SEG_X; i++) {
          var idx = fila * (SEG_X + 1) + i;
          var a = d.tab[i * 3 + 2];
          pos.setXYZ(idx, d.tab[i * 3], d.yBase[idx], d.tab[i * 3 + 1]);
          // Normal analítica: la deformación es cilíndrica, así que se conoce
          // exactamente. computeVertexNormals() por frame sería tirar CPU.
          nor.setXYZ(idx, -Math.sin(a), 0, Math.cos(a));
        }
      }
      pos.needsUpdate = true;
      nor.needsUpdate = true;
    }

    function aplicarFlexionSombra(A, G) {
      var geo = sombraHoja.geometry;
      var tab = new Float32Array((SEG_X + 1) * 3);
      tablaFlexion(A, G, tab);
      var pos = geo.attributes.position;
      for (var fila = 0; fila <= 1; fila++) {
        for (var i = 0; i <= SEG_X; i++) {
          var idx = fila * (SEG_X + 1) + i;
          pos.setXYZ(idx, tab[i * 3], pos.getY(idx), 0);
        }
      }
      pos.needsUpdate = true;
    }

    // -------------------------------------------------------------------
    // Colocación de hojas
    // -------------------------------------------------------------------

    // Modelo: la hoja k lleva la página k en el anverso y la k+1 en el reverso.
    // En reposo, las hojas < indice están volteadas (pila izquierda) y las
    // >= indice sin voltear (pila derecha). La página visible es el anverso de
    // la hoja `indice`.
    function actualizarPosiciones() {
      var desde = Math.max(0, indice - VENTANA_ANTES);
      var hasta = Math.min(paginas.length - 1, indice + VENTANA_DESPUES);

      for (var h = 0; h < hojas.length; h++) {
        var n = desde + h;
        var mesh = hojas[h];
        if (n > hasta) { mesh.visible = false; continue; }
        mesh.visible = true;

        var d = mesh.userData;
        if (d.pagina !== n) {
          d.pagina = n;
          mesh.material[0].map = texturaDe(n, false);
          mesh.material[1].map = texturaVerso;
          mesh.material[0].needsUpdate = true;
          mesh.material[1].needsUpdate = true;
          d.congelada = false;
        }

        var volteada = n < indice;
        mesh.rotation.y = volteada ? -Math.PI : 0;
        // Apilado: la cámara mira desde +Z, así que MÁS z = más cerca del
        // lector. En la pila derecha la página actual va arriba del todo y las
        // siguientes quedan por debajo; en la izquierda, la recién volteada
        // arriba. (Al revés, las páginas futuras taparían la actual.)
        mesh.position.z = volteada
          ? T * (VENTANA_ANTES + 1 - (indice - 1 - n))
          : T * (VENTANA_DESPUES + 1 - (n - indice));
        mesh.renderOrder = 0;

        if (vuelo && vuelo.hoja === mesh) continue;
        if (!d.congelada) {
          aplicarFlexion(mesh, 0, volteada ? -G_LOMO : G_LOMO);
          d.congelada = true;
        }
      }

      // Los bloques de canto representan las páginas que NO se instancian como
      // malla (fuera de la ventana visible). Van DETRÁS de las hojas dibujadas
      // —z negativa— porque si se solaparan con ellas el bloque se las tragaría
      // y se vería el rayado del canto por encima del texto.
      var grosorDer = T * Math.max(0, paginas.length - indice);
      var grosorIzq = T * Math.max(0, indice);
      cantoDer.scale.z = Math.max(0.001, grosorDer);
      cantoDer.position.set(W / 2, 0, -grosorDer / 2);
      cantoDer.visible = grosorDer > T * 1.5;
      cantoIzq.scale.z = Math.max(0.001, grosorIzq);
      cantoIzq.position.set(-W / 2, 0, -grosorIzq / 2);
      cantoIzq.visible = grosorIzq > T * 1.5;
    }

    /** Sólo recalcula distancia y centro; no toca el tamaño del renderer. */
    function ajustarEncuadre() {
      if (!camera) return;
      colocarCamara(true);
    }

    function colocarCamara(soloCamara) {
      var rect = contenedor.getBoundingClientRect();
      var ancho = Math.max(1, rect.width), alto = Math.max(1, rect.height);
      camera.aspect = ancho / alto;

      var modo = opciones.modoLayout || "auto";
      if (modo === "auto") modo = (ancho / alto) >= 1.25 ? "pliego" : "hoja";

      var fovRad = camera.fov * Math.PI / 180;
      // En modo "hoja" el encuadre deja aire a la izquierda del lomo a
      // propósito: si sólo se viera la página derecha, el volteo ocurriría
      // fuera de cuadro y el efecto libro no se apreciaría en el móvil, que es
      // justo donde se usa. Con 1.38 de ancho y el centro desplazado a 0.42W
      // se ve el arco de la hoja y la pila ya volteada sin que la página
      // activa deje de dominar la pantalla.
      var anchoEncuadre = modo === "pliego" ? W * 2.1 : W * encuadre;
      var distV = (H / 2) / Math.tan(fovRad / 2);
      var distH = (anchoEncuadre / 2) / (Math.tan(fovRad / 2) * camera.aspect);
      // El centro sigue al encuadre: cuanto más aire se deja, más se desplaza
      // hacia el lomo para que el arco de la hoja quepa por la izquierda.
      var aire = (encuadre - ENCUADRE_REPOSO) / Math.max(0.0001, ENCUADRE_VUELO - ENCUADRE_REPOSO);
      var cx = modo === "pliego" ? 0 : W * (0.5 - 0.10 * aire);

      // El umbral del toque tiene que caer en el LOMO, no en el centro
      // geométrico del lienzo. En modo "hoja" el lomo está al 20% del ancho:
      // partir por la mitad hacía que tocar el borde izquierdo de la página que
      // estás leyendo te llevara hacia atrás, que es justo lo contrario de lo
      // que espera quien pasa una hoja.
      lomoEnLienzo = Math.max(0.06, Math.min(0.94, (anchoEncuadre / 2 - cx) / anchoEncuadre));

      camera.position.set(cx, H * 0.045, Math.max(distV, distH) * 1.06);
      camera.lookAt(cx, 0, 0);
      camera.updateProjectionMatrix();
      if (!soloCamara) renderer.setSize(ancho, alto, false);
    }

    // -------------------------------------------------------------------
    // Animación
    // -------------------------------------------------------------------

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function hojaEn(n) {
      var desde = Math.max(0, indice - VENTANA_ANTES);
      var h = n - desde;
      return (h >= 0 && h < hojas.length) ? hojas[h] : null;
    }

    function iniciarVuelo(dir, resolver) {
      var destino = indice + dir;
      if (destino < 0 || destino >= paginas.length) { resolver(indice); return; }

      // Al avanzar vuela la hoja actual; al retroceder, la anterior.
      var nHoja = dir > 0 ? indice : indice - 1;
      var mesh = hojaEn(nHoja);
      if (!mesh) { aplicarSalto(destino); resolver(indice); return; }

      cb.onFlipStart(indice, destino);
      var esTapa = nHoja === 0 || nHoja >= paginas.length - 2;
      vuelo = {
        hoja: mesh, dir: dir, t: 0,
        dur: reducirMovimiento ? 0 : Math.max(1, DUR_FLIP),
        aMax: esTapa ? A_MAX_TAPA : A_MAX_HOJA,
        inicio: 0, destino: destino, resolve: resolver, asentando: -1,
      };
      mesh.userData.congelada = false;
      mesh.renderOrder = 100;
      mesh.material[0].polygonOffset = mesh.material[1].polygonOffset = true;
      mesh.material[0].polygonOffsetFactor = mesh.material[1].polygonOffsetFactor = -1;

      if (reducirMovimiento) {
        terminarVuelo();
        return;
      }
      sombraHoja.visible = true;
      solicitarFrame();
    }

    function aplicarSalto(n) {
      indice = Math.max(0, Math.min(paginas.length - 1, n));
      hojas.forEach(function (m) { m.userData.pagina = -1; m.userData.congelada = false; });
      actualizarPosiciones();
      cb.onPageChange(indice, paginas.length);
      solicitarFrame();
    }

    function terminarVuelo() {
      if (!vuelo) return;
      var resolver = vuelo.resolve, destino = vuelo.destino, mesh = vuelo.hoja;
      mesh.material[0].polygonOffset = mesh.material[1].polygonOffset = false;
      mesh.userData.congelada = false;
      vuelo = null;
      sombraHoja.visible = false;
      indice = destino;
      actualizarPosiciones();
      cb.onPageChange(indice, paginas.length);
      solicitarFrame();
      resolver(indice);
      procesarCola();
    }

    // El sello "aterriza" la primera vez que se llega a su página: es el mismo
    // gesto que el keyframe stamp-land del CSS, repintando la textura.
    function animarSello(n) {
      if (paginas[n] && paginas[n].tipo === "sello" && selloAnimado[n] === undefined && !reducirMovimiento) {
        selloAnimado[n] = 0;
        var t0 = performance.now();
        var paso = function () {
          if (destruido) return;
          var s = Math.min(1, (performance.now() - t0) / 380);
          var e = s < 0.6 ? 2.5 - 1.6 * (s / 0.6) : 0.9 + 0.1 * ((s - 0.6) / 0.4);
          selloAnimado[n] = e;
          var c = canvases["p" + n];
          if (c) {
            pintarPagina(c, paginas[n], pal, fecha, false, e);
            // Anverso y reverso comparten el canvas pero son dos texturas
            // distintas: hay que marcar las dos.
            if (texturas["p" + n]) texturas["p" + n].needsUpdate = true;
            if (texturas["m" + n]) texturas["m" + n].needsUpdate = true;
            solicitarFrame();
          }
          if (s < 1) requestAnimationFrame(paso);
          else selloAnimado[n] = 1;
        };
        requestAnimationFrame(paso);
      }
    }

    var cola = [];
    function encolar(dir) {
      return new Promise(function (resolve) {
        if (destruido) { resolve(indice); return; }
        if (!listo) { pendientes.push(function () { encolar(dir).then(resolve); }); return; }
        if (cola.length >= 3) { resolve(indice); return; }
        cola.push({ dir: dir, resolve: resolve });
        procesarCola();
      });
    }

    function procesarCola() {
      if (vuelo || arrastre || !cola.length) return;
      var siguiente = cola.shift();
      iniciarVuelo(siguiente.dir, function (i) {
        animarSello(i);
        siguiente.resolve(i);
      });
    }

    function tick(ahora) {
      rafId = 0;
      if (destruido || pausado) return;

      var sigueAnimando = false;

      encuadreObjetivo = vuelo ? ENCUADRE_VUELO : ENCUADRE_REPOSO;
      if (Math.abs(encuadre - encuadreObjetivo) > 0.002) {
        encuadre += (encuadreObjetivo - encuadre) * 0.18;
        ajustarEncuadre();
        sigueAnimando = true;
      } else if (encuadre !== encuadreObjetivo) {
        encuadre = encuadreObjetivo;
        ajustarEncuadre();
      }

      if (vuelo) {
        if (!vuelo.inicio) vuelo.inicio = ahora;
        var t;
        if (arrastre && arrastre.vuelo === vuelo) {
          t = arrastre.t;
          sigueAnimando = true;
        } else {
          t = Math.min(1, (ahora - vuelo.inicio) / vuelo.dur);
        }
        vuelo.t = t;

        var dirSigno = vuelo.dir > 0 ? 1 : -1;
        var theta = Math.PI * easeInOutCubic(t);
        // Convención: rotation.y negativo barre el borde libre por delante (+Z),
        // que es como se ve pasar una página de verdad.
        //   avanzar   : 0    -> -PI  (la hoja cae sobre la pila izquierda)
        //   retroceder: -PI  ->  0   (la hoja vuelve a la pila derecha)
        vuelo.hoja.rotation.y = vuelo.dir > 0 ? -theta : -(Math.PI - theta);

        // A negativo al avanzar: el borde libre queda rezagado respecto a la
        // raíz. Con el signo al revés el papel se hincha como una vela.
        var A = -dirSigno * vuelo.aMax * Math.pow(Math.sin(Math.PI * t), 0.85);
        var G = G_LOMO * (1 - t) * (vuelo.dir > 0 ? 1 : -1);
        aplicarFlexion(vuelo.hoja, A, G);
        // Por delante de las DOS pilas mientras vuela. Con T*3 quedaba a la
        // misma z que la hoja siguiente en reposo: z-fighting, y la página que
        // se estaba volteando desaparecía detrás de la que venía.
        vuelo.hoja.position.z = T * (VENTANA_DESPUES + 3);

        sombraHoja.material.opacity = 0.30 * Math.pow(Math.sin(Math.PI * t), 0.6);
        sombraHoja.rotation.y = 0;
        aplicarFlexionSombra(A * Math.cos(theta), G);
        sombraHoja.scale.x = Math.cos(theta) >= 0 ? 1 : -1;

        if (t >= 1 && !(arrastre && arrastre.vuelo === vuelo)) {
          terminarVuelo();
        } else {
          sigueAnimando = true;
        }
      }

      renderer.render(scene, camera);
      if (sigueAnimando) solicitarFrame();
    }

    function solicitarFrame() {
      if (destruido || pausado || rafId) return;
      rafId = requestAnimationFrame(tick);
    }

    // -------------------------------------------------------------------
    // Interacción
    // -------------------------------------------------------------------

    var onPointerDown, onPointerMove, onPointerUp, onKey, onVisibility, onResize,
        onContextLost, onContextRestored, onReduceMotion;

    function conectarEventos() {
      var canvas = renderer.domElement;

      onPointerDown = function (e) {
        if (opciones.arrastre === false || vuelo || destruido) return;
        arrastre = {
          x0: e.clientX, y0: e.clientY, t: 0, dir: 0,
          capturado: false, vuelo: null, t0: performance.now(),
          muestras: [],
        };
      };

      onPointerMove = function (e) {
        if (!arrastre) return;
        var dx = e.clientX - arrastre.x0, dy = e.clientY - arrastre.y0;

        if (!arrastre.capturado) {
          // Hasta superar el umbral NO se hace preventDefault: el scroll
          // vertical de la página del pasaporte tiene que seguir funcionando.
          if (Math.abs(dx) < 10 || Math.abs(dx) <= Math.abs(dy) * 1.2) return;
          arrastre.capturado = true;
          try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
          var dir = dx < 0 ? 1 : -1;
          var destino = indice + dir;
          if (destino < 0 || destino >= paginas.length) { arrastre.tope = true; }
          else {
            arrastre.dir = dir;
            iniciarVuelo(dir, function (i) { animarSello(i); });
            if (vuelo) { vuelo.inicio = -1; arrastre.vuelo = vuelo; }
          }
        }
        e.preventDefault();

        var rect = canvas.getBoundingClientRect();
        var crudo = Math.abs(dx) / (rect.width * 0.92 * 0.55);
        arrastre.t = arrastre.tope ? Math.min(1, crudo * 0.28) : Math.max(0, Math.min(1, crudo));
        arrastre.muestras.push({ x: e.clientX, t: performance.now() });
        if (arrastre.muestras.length > 5) arrastre.muestras.shift();
        solicitarFrame();
      };

      onPointerUp = function (e) {
        if (!arrastre) return;
        var a = arrastre;
        arrastre = null;

        if (!a.capturado) {
          // Tap: mitad derecha avanza, mitad izquierda retrocede.
          if (performance.now() - a.t0 < 250) {
            var rect = canvas.getBoundingClientRect();
            var rel = (e.clientX - rect.left) / Math.max(1, rect.width);
            if (rel > lomoEnLienzo) encolar(1); else encolar(-1);
          }
          return;
        }
        try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
        if (!a.vuelo || !vuelo) { solicitarFrame(); return; }

        var vel = 0;
        if (a.muestras.length >= 2) {
          var p0 = a.muestras[0], p1 = a.muestras[a.muestras.length - 1];
          var dt = Math.max(1, p1.t - p0.t);
          vel = (p1.x - p0.x) / dt;
        }
        var completar = !a.tope && (a.t > 0.35 || (Math.abs(vel) > 0.6 && (vel < 0 ? 1 : -1) === a.dir));

        if (completar) {
          vuelo.inicio = performance.now() - vuelo.dur * a.t;
        } else {
          // Revertir: se anima de vuelta a 0 y se cancela el cambio de página.
          var revertirDesde = a.t, t0 = performance.now();
          var dur = Math.max(80, vuelo.dur * a.t * 0.7);
          var vueloRev = vuelo;
          var revertir = function () {
            if (destruido || vuelo !== vueloRev) return;
            var s = Math.min(1, (performance.now() - t0) / dur);
            vueloRev.t = revertirDesde * (1 - (1 - Math.pow(1 - s, 3)));
            vueloRev.inicio = performance.now() - vueloRev.dur * vueloRev.t;
            if (s < 1) { solicitarFrame(); requestAnimationFrame(revertir); }
            else {
              var mesh = vueloRev.hoja;
              mesh.material[0].polygonOffset = mesh.material[1].polygonOffset = false;
              mesh.userData.congelada = false;
              var resolver = vueloRev.resolve;
              vuelo = null; sombraHoja.visible = false;
              actualizarPosiciones();
              solicitarFrame();
              resolver(indice);
              procesarCola();
            }
          };
          requestAnimationFrame(revertir);
          return;
        }
        solicitarFrame();
      };

      canvas.addEventListener("pointerdown", onPointerDown);
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerup", onPointerUp);
      canvas.addEventListener("pointercancel", onPointerUp);
      canvas.addEventListener("lostpointercapture", onPointerUp);

      if (opciones.teclado !== false) {
        onKey = function (e) {
          var t = e.target;
          if (t && /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(t.tagName)) return;
          if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); encolar(1); }
          else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); encolar(-1); }
          else if (e.key === "Home") { e.preventDefault(); irA(0); }
          else if (e.key === "End") { e.preventDefault(); irA(paginas.length - 1); }
        };
        if (!contenedor.hasAttribute("tabindex")) contenedor.tabIndex = 0;
        contenedor.addEventListener("keydown", onKey);
      }

      onVisibility = function () {
        if (document.hidden) pausar(); else reanudar();
      };
      document.addEventListener("visibilitychange", onVisibility);

      onResize = function () {
        clearTimeout(debounceResize);
        debounceResize = setTimeout(function () {
          if (destruido) return;
          var rect = contenedor.getBoundingClientRect();
          if (rect.width < 1 || rect.height < 1) return;
          colocarCamara();
          solicitarFrame();
        }, 120);
      };
      if ("ResizeObserver" in window) {
        ro = new ResizeObserver(onResize);
        ro.observe(contenedor);
      }
      window.addEventListener("resize", onResize);

      if ("IntersectionObserver" in window) {
        io = new IntersectionObserver(function (entradas) {
          entradas.forEach(function (en) {
            if (en.isIntersecting) reanudar(); else pausar();
          });
        }, { threshold: 0 });
        io.observe(contenedor);
      }

      onContextLost = function (e) {
        e.preventDefault();
        pausar();
        cb.onFallback("contexto-perdido");
      };
      onContextRestored = function () {
        cb.onFallback("error");   // React vuelve al CSS; remontar es cosa suya
      };
      canvas.addEventListener("webglcontextlost", onContextLost);
      canvas.addEventListener("webglcontextrestored", onContextRestored);

      if (mq && mq.addEventListener) {
        onReduceMotion = function () {
          reducirMovimiento = mq.matches && opciones.respetarReducedMotion !== false;
        };
        mq.addEventListener("change", onReduceMotion);
      }
    }

    // -------------------------------------------------------------------
    // API pública del handle
    // -------------------------------------------------------------------

    function irA(n, opts) {
      return new Promise(function (resolve) {
        if (destruido) { resolve(indice); return; }
        if (!listo) { pendientes.push(function () { irA(n, opts).then(resolve); }); return; }
        n = Math.max(0, Math.min(paginas.length - 1, n | 0));
        if (n === indice) { resolve(indice); return; }
        if (opts && opts.animar === false) { aplicarSalto(n); resolve(indice); return; }
        if (Math.abs(n - indice) === 1) { encolar(n > indice ? 1 : -1).then(resolve); return; }
        aplicarSalto(n);
        animarSello(indice);
        resolve(indice);
      });
    }

    function pausar() {
      pausado = true;
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    }

    function reanudar() {
      if (destruido) return;
      pausado = false;
      solicitarFrame();
    }

    function destroy() {
      if (destruido) return;
      destruido = true;
      abortado = true;
      if (rafId) cancelAnimationFrame(rafId);
      clearTimeout(timeoutThree);
      clearTimeout(debounceResize);
      if (ro) ro.disconnect();
      if (io) io.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      if (mq && mq.removeEventListener && onReduceMotion) mq.removeEventListener("change", onReduceMotion);
      if (onKey) contenedor.removeEventListener("keydown", onKey);

      if (renderer) {
        var canvas = renderer.domElement;
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerup", onPointerUp);
        canvas.removeEventListener("pointercancel", onPointerUp);
        canvas.removeEventListener("lostpointercapture", onPointerUp);
        canvas.removeEventListener("webglcontextlost", onContextLost);
        canvas.removeEventListener("webglcontextrestored", onContextRestored);

        hojas.forEach(function (m) {
          m.geometry.dispose();
          m.material.forEach(function (mat) { mat.dispose(); });
        });
        [sombraHoja, lomo, cantoDer, cantoIzq].forEach(function (o) {
          if (!o) return;
          o.geometry.dispose();
          if (o.material.map) o.material.map.dispose();
          o.material.dispose();
        });
        Object.keys(texturas).forEach(function (clave) {
          if (texturas[clave] && texturas[clave].dispose) texturas[clave].dispose();
        });
        compartidas.forEach(function (t) { if (t && t.dispose) t.dispose(); });
        if (texturaBlanca) texturaBlanca.dispose();
        if (texturaVerso) texturaVerso.dispose();
        // Poner el canvas a 1x1 libera el bitmap 2D de inmediato, sin esperar
        // al recolector: en Android barato son varios MB por página.
        Object.keys(canvases).forEach(function (clave) {
          var c = canvases[clave];
          if (c) { c.width = c.height = 1; }
        });
        if (scene) scene.clear();
        renderer.dispose();
        // Sin esto, navegar por el SPA acumula contextos WebGL hasta que iOS
        // empieza a matar los antiguos y otras vistas se quedan en negro.
        try { renderer.forceContextLoss(); } catch (_) {}
        if (canvas.parentNode === contenedor) contenedor.removeChild(canvas);
      }
      limpiarContenedor();
      hojas.length = 0;
    }

    return {
      irA: irA,
      siguiente: function () { return encolar(1); },
      anterior: function () { return encolar(-1); },
      paginaActual: function () { return indice; },
      totalPaginas: function () { return paginas.length; },
      setPaginas: function (nuevas, opts) {
        if (destruido) return;
        paginas = normalizarPaginas(nuevas || []);
        selloAnimado = {};
        Object.keys(texturas).forEach(function (clave) {
          texturas[clave].dispose();
          delete texturas[clave];
        });
        Object.keys(canvases).forEach(function (clave) {
          canvases[clave].width = canvases[clave].height = 1;
          delete canvases[clave];
        });
        ordenLRU.length = 0;
        hojas.forEach(function (m) { m.userData.pagina = -1; });
        if (!opts || opts.mantenerIndice !== false) indice = Math.min(indice, paginas.length - 1);
        else indice = 0;
        if (listo) { aplicarSalto(indice); }
      },
      actualizarColores: function () {
        pal = paleta(opciones.colores);
        invalidarTexturas();
      },
      redimensionar: function () { if (listo) { colocarCamara(); solicitarFrame(); } },
      pausar: pausar,
      reanudar: reanudar,
      estado: function () {
        return {
          pagina: indice, total: paginas.length,
          animando: !!vuelo, arrastrando: !!arrastre,
          degradado: !listo, calidad: calidad,
        };
      },
      destroy: destroy,
    };
  }

  // Normaliza: garantiza al menos una página y cierra con contraportada.
  function normalizarPaginas(paginas) {
    var out = Array.isArray(paginas) ? paginas.slice() : [];
    if (!out.length) out.push({ tipo: "blanca" });
    var ultima = out[out.length - 1];
    if (ultima.tipo !== "contraportada") out.push({ tipo: "contraportada" });
    return out;
  }

  window.LMTPassportBook = { version: VERSION, soportado: soportado, mount: mount };
})();
