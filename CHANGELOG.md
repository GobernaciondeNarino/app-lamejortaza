# Historial de versiones

Este archivo existe para una cosa concreta: **saber a qué punto volver** si algo
del festival no funciona el día del evento. Cada versión anota el commit exacto
en el que empieza y el procedimiento de reversión, incluida la parte que el
`git revert` no toca (la base de datos).

---

## v2.0.0 — Estrellas, recorrido y actividad económica

**Empieza en:** el commit inmediatamente posterior a `6896fba`
**Punto de reversión (v1.x estable):** `6896fba`

Es la versión con la que se abre al público. Lo que trae:

### El voto
- Tres valoraciones de **1 a 5 estrellas** —Innovación, Atención, Calidad— con
  los títulos configurables desde el panel. Son opcionales: el voto de un toque
  sigue funcionando igual.
- La pregunta **«¿Compraste algo?» deja de estar plegada**. Estaba escondida
  bajo «agregar comentario» y casi nadie la abría, así que no había datos de
  compra que informar. Al decir que sí aparece el importe.
- Estrellas y compra van **antes** de los emoji, porque tocar un emoji envía el
  voto: lo que quedara debajo no llegaría a rellenarse nunca.

### El público
- **Menú hamburguesa** con Inicio, Mi pasaporte, Mi recorrido y Mi perfil, en el
  tablero y en el pasaporte.
- **Mi recorrido** (`/recorrido`), módulo nuevo: todos los stands en una rejilla,
  los visitados a color y el resto apagados, con las valoraciones. El número de
  columnas en computador y en móvil se configura desde el panel.
- **La portada es de la ciudadanía.** Antes pedía correo institucional y
  contraseña nada más entrar, que es lo primero que ve alguien que acaba de
  escanear un QR. El acceso de administradores y promotores sigue estando, ahora
  plegado abajo.

### El pasaporte
- El **logo del stand** en círculo: pequeño delante de cada nombre en la hoja del
  recorrido, y grande al centro en cada hoja de sello, con el sello encima
  desplazado al azar (estable por stand, no baila al pasar la hoja).
- **Fondos configurables**: portada, contraportada y las hojas internas. Las
  internas se reparten en orden y se repiten si hay más hojas que imágenes. Sin
  subir nada, se conserva el diseño del sistema.

### El panel
- **Actividad económica** (`/admin/economia`): compras totales del evento y
  desglose por stand, con valor declarado, compra media y conversión.
- **Personalización** (`/admin/festival`): títulos de las estrellas, columnas del
  recorrido y fondos del pasaporte.

### Base de datos
Cuatro columnas nuevas en `votos`, todas opcionales y con valor nulo por defecto:

| Columna | Para qué |
|---|---|
| `est_innovacion` | Valoración 1-5 |
| `est_atencion`   | Valoración 1-5 |
| `est_calidad`    | Valoración 1-5 |
| `compra_valor`   | Importe declarado, en pesos enteros |

Las añade `php db/migrate.php`, que las deduce del esquema. **No borra ni
modifica nada de lo que ya había.**

### Cómo revertir

```bash
# 1. Volver el código a la última v1.x
git checkout 6896fba -- .
# o, si la v2 ya está en la rama y se quiere deshacer entera:
git revert --no-commit 6896fba..HEAD && git commit -m "Volver a la v1.x"
```

**La base de datos no hay que tocarla.** Las cuatro columnas nuevas se quedan
donde están y la v1.x las ignora: nunca las lee ni las escribe. Quitarlas sería
perder los datos de compras y valoraciones que ya se hubieran recogido, y no
haría falta para nada.

Los **ajustes** de la v2 (títulos, columnas, fondos) viven en la tabla `ajustes`
bajo la clave `festival`. La v1.x tampoco los mira. Si se quiere limpiar:

```sql
DELETE FROM ajustes WHERE clave = 'festival';
```

Las imágenes de fondo quedan en `uploads/pasaporte/`. Borrarlas es seguro una vez
limpiada esa fila.

---

## v1.x — Base del festival

**Último commit:** `6896fba`

Inscripción de promotores con verificación por correo, pasaporte con libro en
three.js, votación por emoji, mapa de los 64 municipios de Nariño con sus 13
subregiones, caracterización de visitantes (Ley 1581/2012), impresión de QR,
administración de cuentas, módulo de correo saliente y asistente de instalación.
