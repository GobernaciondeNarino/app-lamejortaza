# Historial de versiones

Este archivo existe para una cosa concreta: **saber a qué punto volver** si algo
del festival no funciona el día del evento. Cada versión anota el commit exacto
en el que empieza y el procedimiento de reversión, incluida la parte que el
`git revert` no toca (la base de datos).

---

## v2.3.0 — Con el correo basta

**Punto de reversión (v2.2.0):** `cd4488f`

### El ciudadano entra con su correo

Para ver el pasaporte, el recorrido o el perfil basta con **escribir el
correo**. No hay contraseña, no hay que esperar un enlace, no hay que haber
votado antes desde ese mismo teléfono. Antes, el perfil sólo se abría con el
testigo que dejaba el voto en el navegador; quien cambiaba de teléfono o
navegaba en privado se quedaba fuera de sus propios datos.

Y **el tablero lo pide arriba del todo**: quien llega sin identificarse ve una
franja con un campo de correo y qué gana escribiéndolo. Con el correo puesto
desaparece —el ranking y el mapa se ven sin escribir nada, la portada no es un
muro— y votar pasa a ser un solo toque.

**Qué significa exactamente, sin adornos:** quien conozca el correo de otra
persona puede abrir su pasaporte y su caracterización. Es una decisión
consciente. La alternativa —una contraseña para todo el mundo— dejaba fuera a
la mayor parte del público de una feria de dos días, y quien quiera cerrar su
perfil tiene la clave a un toque.

### La clave del perfil, opcional

Dentro de «Mi perfil» hay ahora un bloque **Protección de tu perfil**: se pone
una clave y a partir de ese momento se pide en las tres pantallas, además del
correo. Se cambia y se quita desde el mismo sitio, escribiendo la actual.

Tres detalles que no se ven pero sostienen esto:

- **Votar deja de entregar el testigo** si esa persona puso clave. Votar
  demuestra que tienes ese correo a mano, no que seas quien decidió cerrarlo.
- **Cambiar o quitar la clave exige la clave actual**, aunque se traiga un
  testigo válido: hasta que hubo clave el testigo se conseguía con el correo, y
  quedan testigos viejos en otros navegadores.
- **El enlace al buzón sigue siendo la recuperación** y salta la clave a
  propósito: llegar al buzón es la prueba de propiedad de verdad.

La puerta tiene dos límites: uno por IP, generoso —en la feria una familia
entera entra desde el mismo wifi— y otro **por correo**, estrecho, que es el
que frena a quien prueba claves de una persona concreta desde muchas IP.

### El QR del promotor se genera de verdad

Elegir «código QR» al inscribirse enseñaba **el QR del stand `st-01`**, el
mismo para todo el mundo: el componente que lo pintaba sólo sabía construir
`/qr/{stand}.png` y además se le pasaba el dato con el nombre equivocado. El
promotor guardaba un código que no era el suyo.

Ahora el PNG lo dibuja el servidor con el token recién creado y viaja
incrustado en la respuesta. En pantalla se ve el código, el token en letras y
un botón para **guardarlo en el teléfono**; si el correo sale, va también
adjunto al mensaje de «solicitud recibida», que le deja una segunda copia en el
buzón.

No se ha abierto ningún endpoint que convierta texto libre en un QR: eso sería
una fábrica de códigos para cualquiera, y media suplantación regalada.

El panel gana **«Reemitir código QR»** para los promotores que entran así. El
QR se enseña una sola vez —en la base sólo queda su hash— y sin esto, perderlo
dejaba a un caficultor fuera de su propio stand.

### Base de datos

Una columna nueva en `visitantes` (`acceso_hash`), opcional y nula por defecto.
La añade `php db/migrate.php`, que la deduce del esquema.

Para revertir a la v2.2.0: `git checkout cd4488f -- .`. La base no se toca: sin
`acceso_hash` el flujo vuelve a ser el anterior, y la columna se queda ahí sin
que nadie la lea. Si además se quiere que las claves de perfil dejen de existir:

```sql
UPDATE visitantes SET acceso_hash = NULL;
```

---

## v2.2.0 — El promotor elige cómo entrar

**Punto de reversión (v2.1.0):** `3296f88`

El acceso de un promotor dependía de que le llegara un correo, y eso falla más
de lo que parece: correos que casi no se abren, escritos mal, o que el proveedor
manda a spam. El caficultor se quedaba fuera de su propio stand el día del
evento y había que resolverlo por teléfono, uno a uno.

Ahora, al inscribirse, elige con qué va a entrar:

| Método | Fuerza | Para quién |
|---|---|---|
| Contraseña propia | Alta | Quien la va a recordar |
| Fecha de expedición de la cédula | **Baja** | Quien no quiere recordar nada nuevo |
| Teléfono (escrito dos veces) | **Baja** | Igual, y aún más fácil |
| Código QR | Alta | **Quien no maneja correo** |

**La fecha y el teléfono son credenciales débiles y la interfaz lo dice.** Una
fecha son unos miles de combinaciones y un teléfono es un dato semipúblico que
además queda en claro en la misma ficha, porque es también un campo de contacto.
Se aceptan porque quedarse fuera es peor, y porque tres cosas los contienen:
nada funciona hasta que un administrador aprueba la inscripción; la cuenta se
bloquea sola tras varios fallos; y quien entra así está **obligado a poner una
contraseña de verdad** antes de tocar nada.

El QR no tiene ese problema: 32 caracteres al azar, tanta entropía como una
contraseña larga. Se enseña **una sola vez** al terminar la inscripción —en la
base sólo queda su hash— y escanearlo abre el portal directamente.

Se guarde lo que se guarde, va hasheado (Argon2id + pepper) como cualquier
contraseña. Aprobar la inscripción **ya no genera una clave temporal** si el
promotor eligió método propio: el correo se lo recuerda en vez de mandarle un
secreto que ya tiene. «Reenviar clave» sigue generando una nueva, que es para lo
que sirve.

Una columna nueva en `promotores` (`acceso_metodo`), opcional. La añade
`php db/migrate.php`. Los promotores ya inscritos siguen entrando con su clave
de siempre: sin `acceso_metodo`, el flujo es exactamente el anterior.

Para revertir a la v2.1.0: `git checkout 3296f88 -- .`. La base no se toca.

---

## v2.1.0 — Retrato del visitante y diagnóstico de la salida SMTP

**Punto de reversión (v2.0.0):** `436e69d`

- **Retrato en el perfil**: foto propia o un emoji de una lista cerrada de 30.
  Aparece en el recuadro de la hoja de datos del pasaporte, donde en un
  documento real va la foto. Sin ninguno de los dos, la inicial del nombre.
- **La contraseña de aplicación de Gmail se limpia sola**: Google la enseña en
  cuatro grupos de cuatro y quien la copia se lleva los espacios; el SMTP espera
  16 caracteres seguidos y con espacios responde 535.
- **Sonda de salida SMTP** en el panel: prueba Gmail por 587, 465 y 25 y el
  servidor de correo local, y distingue un rechazo del propio servidor
  («Connection refused», inmediato) de un bloqueo del proveedor («timed out»).
- **Relé por el servidor local** en un botón, como salida cuando el hosting
  cierra el SMTP hacia fuera.
- **Rate limits con valores de reserva en el código.** `api/config.php` es del
  administrador y no gana claves al actualizar: un límite nuevo que sólo
  estuviera en el ejemplo quedaba sin efecto, y sin efecto significaba **sin
  límite ninguno**.

Dos columnas nuevas en `visitantes` (`avatar_path`, `avatar_emoji`), opcionales.
Las añade `php db/migrate.php`.

Para revertir a la v2.0.0: `git checkout 436e69d -- .`. La base no se toca; las
fotos quedan en `uploads/visitantes/` y pueden borrarse a mano.

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
