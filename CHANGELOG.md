# Historial de versiones

Este archivo existe para una cosa concreta: **saber a qué punto volver** si algo
del festival no funciona el día del evento. Cada versión anota el commit exacto
en el que empieza y el procedimiento de reversión, incluida la parte que el
`git revert` no toca (la base de datos).

---

## v2.7.3 — Gmail: AUTH LOGIN antes que AUTH PLAIN

**Punto de reversión (v2.7.2):** `06c570b`

### El fallo

Gmail rechazaba el envío con **«535 Username and Password not accepted»** aunque
la contraseña de aplicación fuera correcta. El mismo buzón, con las mismas
credenciales y en el mismo servidor, **sí funcionaba desde el proyecto
`app-eventos`**. Ese contraste es lo que descartó la contraseña y señaló al
código.

### La causa

Los dos proyectos eligen distinto método de autenticación, y Gmail anuncia ambos:

```
250-AUTH LOGIN PLAIN XOAUTH2 PLAIN-CLIENTTOKEN OAUTHBEARER XOAUTH
```

| Proyecto | Elegía | Resultado |
| --- | --- | --- |
| `app-eventos` | `AUTH LOGIN`, con `PLAIN` de respaldo | funciona |
| `la-mejor-taza` | `AUTH PLAIN`, con `LOGIN` de respaldo | 535 |

Con una contraseña de aplicación, Gmail rechaza `AUTH PLAIN` y acepta
`AUTH LOGIN` con esas mismas credenciales. Y como el error es idéntico al de una
clave equivocada, todo apuntaba a la contraseña.

Se comprobó midiendo lo que el cliente transmite de verdad contra un servidor
SMTP de prueba: el `AUTH PLAIN` iba perfectamente formado —`\0usuario\0clave`,
21 y 16 caracteres—. El formato no era el problema; el método sí.

### La corrección

- **`AUTH LOGIN` primero**, `PLAIN` sólo si el servidor no ofrece LOGIN, y un
  error explícito si no ofrece ninguno de los dos.
- Los métodos se leen de la línea `250-AUTH …` en vez de buscar palabras sueltas
  por toda la respuesta. El anuncio de Gmail incluye `PLAIN-CLIENTTOKEN`, y un
  `stripos` de «PLAIN» daba por ofrecido un método que no era ese.
- La traza dice ahora con cuál se autenticó, que es lo que permite verlo sin
  adivinar.

### El instalador guardaba la contraseña sin limpiar

`instalar_guardar_correo()` cifraba lo que llegaba tal cual, sin quitar espacios
ni caracteres invisibles — el panel sí lo hacía desde la v2.7.2. Una instalación
nueva podía nacer con la clave inservible. Ahora usa el mismo
`Validate::secreto()`.

### Comprobado

Cuatro comprobaciones nuevas en `suite.sh`: que el envío se acepta, que
autentica con `AUTH LOGIN`, que no cae a `PLAIN` habiendo `LOGIN`, y que la
contraseña no aparece en la traza. Más el instalador de punta a punta.

### Cómo volver atrás

```bash
git revert --no-commit 06c570b..HEAD && git commit -m "Volver a v2.7.2"
```

Nada que deshacer en la base.

---

## v2.7.2 — La contraseña del buzón: se limpia entera y se puede comprobar

**Punto de reversión (v2.7.1):** `363ebec`

### Qué se comprobó

La contraseña **sí se guardaba bien**. Los cuatro grupos de cuatro que enseña
Google —«abcd efgh ijkl mnop»— entraban con 19 caracteres y quedaban 16 en la
base, cifrados, y volvían a salir intactos para el AUTH. Eso ya funcionaba.

### El hueco que sí había

El limpiado quitaba `\s`, y eso deja pasar los caracteres **invisibles** que
arrastra un copiar-pegar desde una página web: espacio de ancho cero (U+200B),
BOM, marcas de dirección. Con uno de ellos dentro se guardaban 17 caracteres y
el servidor respondía **«535 Username and Password not accepted»** — el mismo
error exacto que con una contraseña equivocada, y sin nada que ver en pantalla
que permitiera distinguirlos.

Ahora hay `Validate::secreto()`, que quita todo espacio (incluidos el duro, el
fino y el ideográfico), todo invisible y todo carácter de control. Una
contraseña con símbolos legítimos no se toca. Y una que quede vacía después de
limpiar se rechaza en vez de guardarse en blanco.

### Y lo que faltaba: poder verlo

El panel no decía nada de la clave guardada más allá de que existía, así que
«está mal escrita» y «se coló un carácter que no se ve» eran indistinguibles
desde fuera. Ahora, bajo el campo:

> **Guardada · 16 caracteres**

En verde si son los 16 que espera una contraseña de aplicación de Google, en
rojo con «Gmail espera 16» si no. Y el diagnóstico añade un aviso cuando la
longitud no cuadra, o cuando no hay ninguna contraseña guardada.

La longitud no es la contraseña ni ayuda a adivinarla —la de Google son 16
siempre—, sólo la ve un administrador, y es lo único que convierte un 535 mudo
en algo que se puede leer.

### Comprobado

Ocho comprobaciones nuevas en `suite.sh`: los cuatro grupos de cuatro, el
espacio duro, el de ancho cero, una clave ya limpia, una de sólo espacios, que
no cambiarla conserva la que había, que nunca sale del servidor, y que el aviso
de los 16 aparece cuando toca.

### Cómo volver atrás

```bash
git revert --no-commit 363ebec..HEAD && git commit -m "Volver a v2.7.1"
```

Nada que deshacer en la base. Las contraseñas guardadas siguen valiendo.

---

## v2.7.1 — «Quitar» una hoja del pasaporte ahora quita

**Punto de reversión (v2.7.0):** `96857cc`

### El fallo

En *Personalización → Hojas internas*, pulsar **«quitar»** respondía que sí y no
quitaba nada. Recargar la página seguía enseñando la misma hoja.

La causa estaba en `Ajustes::combinar()`, que mezcla lo guardado en la base con
lo que trae `config.php` **clave a clave y recursivamente**. Para un conjunto de
ajustes con nombre —`estrellas`, `marca`, `smtp`— eso es exactamente lo que hace
falta: lo guardado pisa a lo del fichero sin borrar lo que nadie tocó.

Para una **lista** no significa nada. `pasaporte.hojas` es una lista, y mezclarla
por índice hace que una lista más corta no pueda pisar a una más larga:

| Guardado | Se quiere dejar | Quedaba |
| --- | --- | --- |
| `[A, B, C]` | `[A, B]` | `[A, B, C]` — C sobrevivía en el índice 2 |
| `[A, B, C]` | `[A, C]` | `[A, C, C]` — además duplicaba |
| `[A]` | `[]` | `[A]` — el bucle no llegaba a ejecutarse |

Por eso el endpoint contestaba `200 ok`: por su parte había hecho el trabajo, y
lo que fallaba era el guardado.

### La corrección

`combinar()` ahora **reemplaza una lista entera** en vez de mezclarla elemento a
elemento (`array_is_list()`, PHP 8.1+). Los arrays asociativos se siguen
mezclando igual que siempre, que es lo que no debía cambiar.

Es un arreglo en la capa de ajustes, no en la ruta: cualquier ajuste que sea una
lista habría tenido el mismo problema.

### Comprobado

Siete comprobaciones nuevas en `suite.sh` («Fondos del pasaporte»): subir dos
hojas, quitar una, quitar la última, índice fuera de rango, destino desconocido,
y la portada —que es un valor suelto, no una lista— aparte.

### Cómo volver atrás

```bash
git revert --no-commit 96857cc..HEAD && git commit -m "Volver a v2.7.0"
```

Nada que deshacer en la base. Si alguna instalación quedó con hojas que no se
pudieron quitar, al actualizar se quitan pulsando «quitar» otra vez.

---

## v2.7.0 — La ficha del participante

**Punto de reversión (v2.6.0):** `55ba1df`

### El formulario habla del producto, no del puesto

«Nombre del espacio» pasa a **«Nombre del producto»** y «Descripción del
espacio» a **«Descripción del producto»**, en la inscripción pública y en el
alta interna. Es lo que se estaba escribiendo ahí desde el principio.

### Quién participa

Un desplegable obligatorio con **once grupos o tipos de población** —de «Urbana»
a «Estudiante», con «Ninguna de las anteriores» y un «Otro» abierto—. Es un dato
sensible en el sentido de la Ley 1581 de 2012 (pertenencia étnica, discapacidad,
condición de víctima), así que sale de un catálogo cerrado, tiene salida
explícita, se pide en el mismo formulario donde se autoriza el tratamiento y
**no viaja a la ficha pública**: sólo lo ve el panel.

### Línea productiva

Selección múltiple: cafés especiales de origen, transformación agroindustrial y
derivados, economía circular y subproductos.

### Información detallada

Nueve preguntas más sobre el producto y los papeles:

| Pregunta | |
| --- | --- |
| ¿Certificaciones internacionales? | opcional |
| ¿Es orgánico? | opcional |
| ¿Es especial? | opcional |
| Promedio de taza | opcional |
| ¿Marca registrada ante la SIC? | **obligatoria** |
| ¿Certificado de Cámara de Comercio? | **obligatoria** (+ número si la respuesta es sí) |
| ¿Acreditación sanitaria INVIMA? | **obligatoria** (+ tipo y número si es sí) |
| ¿Certificado de manipulación de alimentos? | **obligatoria** |
| Presentación del producto | **obligatoria**, múltiple, con «Otros» abierto |

Los cuatro obligatorios son requisitos de participación, no información de
relleno: preguntarlos después, cuando ya se armó el recinto, no sirve de nada.

Dos decisiones que importan:

- **Un «sí/no» tiene tres estados.** No hay nada premarcado y `null` significa
  «no contestó», que se guarda distinto de «no». Con «No» por defecto el
  formulario contestaría por la persona, y publicar un café como **no** orgánico
  porque nadie tocó la casilla es inventarse el dato.
- **Los campos condicionales se limpian.** Quien marca «sí» al certificado de
  Cámara de Comercio, escribe el número y luego rectifica a «no» no deja en la
  base un certificado que el propio formulario dice que no tiene.

Las selecciones múltiples se guardan como JSON y **con el orden del catálogo**,
no como llegaron: así dos respuestas iguales se guardan igual y agrupar por
presentación en un informe funciona.

### Los errores señalan el campo que falta

Las validaciones corren en el mismo orden en que están los campos en pantalla. A
quien se deja sin marcar la marca registrada se le dice eso, y no que falta el
INVIMA —tres preguntas más abajo—, que es lo que le pondría a buscar el error
donde no está.

### El panel edita lo mismo

Los mismos campos están en el editor de espacios, ahí **todos opcionales**: los
espacios creados antes de que existieran se tienen que poder seguir editando sin
inventarles una respuesta. Todo viaja de la inscripción al espacio al aprobar, y
la ficha de revisión gana un bloque **«Requisitos»** con los cuatro en verde o
rojo, que es justo lo que hay que mirar antes de aprobar.

### Número del espacio

El editor gana **«Número del espacio»**: el que la organización asigna en el
recinto («12», «A-14»). La regla es **todo o nada** — ese número manda en toda
la plataforma sólo si lo tienen TODOS los espacios; si falta en alguno, se sigue
enseñando el código del sistema (`#ST-01`). Con la mitad puestos, el público
vería unos con número de feria y otros con el código interno, sin saber cuál
buscar en el mapa impreso.

El campo dice cuántos faltan, contando lo que hay escrito en ese momento: sin
ese aviso, quien numere tres espacios y no vea ningún cambio pensaría que el
campo no sirve.

### Privacidad

De los campos nuevos, **la población y los cuatro requisitos administrativos
sólo viajan al panel**. Los rasgos del producto —orgánico, especial,
certificaciones, presentación, línea productiva— sí son públicos: es lo que
ayuda al visitante a decidir a qué espacio ir.

### Migración

`php db/migrate.php` añade **31 columnas** —quince a `stands`, quince a
`promotores` y `stands.numero`— sin tocar nada de lo que ya había. Lo anterior
se queda sin ficha, que es lo correcto: no hay dato que inventarle.

### Cómo volver atrás

```bash
git revert --no-commit 55ba1df..HEAD && git commit -m "Volver a v2.6.0"
```

Las columnas nuevas se quedan en la base y no molestan: la v2.6.0 no las lee.
Los números de espacio ya asignados se conservan; simplemente dejan de usarse.

---

## v2.6.0 — Espacios, y quién los ocupa

**Punto de reversión (v2.5.0):** `fbb95ae`

### «Stand» pasa a llamarse «Espacio»

Sólo en lo que se lee. Las rutas (`/admin/stands`), las columnas de la base
(`stands`, `stand_id`), los identificadores del código y el CSV exportado se
quedan exactamente como están: renombrarlos habría obligado a migrar la base y
a reimprimir los QR, y no cambia nada de lo que ve nadie. Lo que cambia es el
panel, los formularios, los correos, el instalador y el contador del pasaporte.

### El formulario de inscripción pregunta quién eres

Tres campos nuevos, los tres obligatorios:

- **Dirección.** Antes era opcional. El mapa marca una zona; la dirección es lo
  que lleva a la puerta, y sin ella una chincheta en un cerro no sirve de nada.
- **¿Qué tipo de organización eres?** Trece opciones, de «Persona Natural» a
  «Organización no formalizada», más «Otro» con su campo abierto.
- **¿Cuál es tu actividad o vínculo con la cadena de valor del café?** Nueve
  opciones, de «Productor de café tostado con marca propia» a «Organización o
  asociación cafetera», más «Otro».

Los dos desplegables **guardan una clave, no la frase** (`sas`, `barista`). Si
se guardara el texto, corregir una tilde crearía un tipo de organización nuevo
y cualquier conteo por tipo dejaría de valer — que es exactamente lo que ya
pasó con los municipios antes de cerrarlos contra el catálogo del DANE. Elegir
«Otro» sin decir cuál no se acepta: «otro» a secas no caracteriza a nadie.

Los mismos campos están en el alta interna del panel, ahí opcionales, para que
un espacio creado antes de que existieran se pueda seguir editando. Todo viaja
de la inscripción al espacio al aprobar, y la ficha de revisión lo enseña
antes de decidir.

### Política de tratamiento de datos, editable

Junto a la casilla de autorización hay ahora un enlace que abre el aviso
completo en una ventana. Va en una ventana y no fuera porque la autorización se
firma en ese formulario: salir a leerla significaba perder lo escrito.

El texto y el enlace a la política de la Gobernación **se editan desde *Panel →
Personalización***. Quien tiene que poder cambiar un aviso de habeas data es el
área jurídica, no quien despliega, y un texto desactualizado ahí no es un
detalle de redacción. El enlace se valida: sólo `http(s)`, para que un
`javascript:` no acabe en un enlace que pulsa el público.

### Coordenadas escritas a mano

El selector de ubicación gana dos campos, latitud y longitud, en los dos
formularios. **La chincheta se mueve mientras se teclea**, no al salir del
campo: quien pega unas coordenadas de un GPS quiere ver ahí mismo si cayeron
donde debían. El municipio se deduce del punto, igual que al tocar el mapa, y
si el par cae fuera de Nariño se avisa en vez de guardarlo.

### El logo se encuadra al subirlo

Después de subirlo se abre un recuadro con el círculo del sello dibujado
encima: se arrastra para centrarlo y hay una barra para agrandarlo o
reducirlo. Al aplicar, **la imagen se rehace y se vuelve a subir**.

Se rehace en lugar de guardar «zoom 1,4 · 8 % a la izquierda» porque el logo se
pinta en cinco sitios —la tarjeta del recorrido, la ficha, el sello del
pasaporte en CSS, el mismo sello en el lienzo de Three.js y el cartel del QR— y
dos de ellos no son HTML. Guardar el encuadre obligaría a llevar ese cálculo a
los cinco, y el que se olvidara enseñaría otra imagen.

### El nombre de la edición se configura

«Festival · Nariño 2026», el renglón bajo el logotipo, sale ahora de los
ajustes: se cambia desde *Personalización* y afecta a toda la aplicación y a la
cabecera de los correos que salen del sistema, que antes lo tenían escrito
aparte.

### Un fallo que la prueba pilló

`mapStand()` en `js/api.js` es una lista blanca: lo que no se nombre ahí no
llega al cliente. Los campos nuevos no estaban, así que el editor del panel los
abría vacíos y el primer «Guardar» los borraba de la base. Es la tercera vez
que pasa lo mismo con esa función (ya ocurrió con el propietario y con el NIT);
queda anotado en el propio código.

### Migración

`php db/migrate.php` añade ocho columnas —cuatro a `stands` y cuatro a
`promotores`— sin tocar nada de lo que ya había. Los espacios y las
inscripciones anteriores se quedan sin caracterización, que es lo correcto: no
hay dato que inventarles.

### Cómo volver atrás

```bash
git revert --no-commit fbb95ae..HEAD && git commit -m "Volver a v2.5.0"
```

Las ocho columnas nuevas se quedan en la base y no molestan: la v2.5.0 no las
lee. Los ajustes de marca y de política viven en la tabla `ajustes` bajo la
clave `festival`; al revertir se ignoran y todo vuelve a los textos de fábrica.
Los logos ya encuadrados se quedan encuadrados — son archivos normales.

---

## v2.5.0 — Los datos entran bien y el festival se camina

**Punto de reversión (v2.4.0):** `8c84b92`

### Las imágenes que se subían y no se veían

Los logos se guardaban con permisos `0640` y las carpetas con `0750`. En un
hosting compartido —Plesk, cPanel— **PHP escribe con un usuario y Apache sirve
los archivos estáticos con otro**, así que la subida terminaba bien y el
navegador recibía un 403: la previsualización salía rota y no había forma de
distinguirlo de «no se subió». Ahora van a `0644` y `0755`, que es lo que
corresponde a imágenes públicas a las que se llega por su URL.

Eso arregla las subidas nuevas. Para las que ya estaban, el panel gana
**«Corregir permisos de las imágenes»**, que las repasa todas y dice cuántas
no pudo cambiar. Y las previsualizaciones ahora distinguen los tres casos: sin
imagen, cargando, y **subida pero el servidor no la entrega**.

### El voto sólo se hace en el stand

La ficha de un stand (`/festival/{id}`) tenía un botón «Votar este stand». Con
él, el pasaporte se llenaba entero desde el sofá y el festival dejaba de ser un
recorrido. Ese botón ya no está: **se vota escaneando el QR pegado en el
puesto**, y la ficha lo explica en vez de esconderlo.

A cambio, la ficha enseña lo que sí tiene sentido mirar desde casa: contacto,
dónde queda en el mapa, la votación de todo el festival y —si esta persona ya
votó ahí— la suya, cada una con su título.

### El formulario de inscripción

- **Documento, teléfono y NIT sólo aceptan números**, y se guardan sólo
  dígitos. Se filtra al escribir, no al enviar: un aviso al final obliga a
  volver arriba, y en un formulario largo rellenado en el móvil eso es media
  inscripción perdida. Un campo mal escrito ya no se guarda como vacío sin
  decir nada.
- **El logo pasa a ser obligatorio.** Es lo que identifica al stand en «Mi
  recorrido» y bajo el sello del pasaporte; pedirlo después, cuando el
  caficultor ya se fue, no lo consigue nadie.

### Aprobar una inscripción

Aprobar crea el stand tal cual, y hasta ahora eso se veía después, ya
publicado. Ahora hay un paso intermedio: **«Revisar la inscripción»** enseña la
ficha completa —la persona, el stand que va a nacer, el logo y el punto en el
mapa— y desde ahí se aprueba.

Y **desaparece «Stand vinculado»**, el desplegable que dejaba enganchar un
promotor a cualquier stand de la lista. Partía de una idea equivocada: un
promotor y su stand no son dos cosas que emparejar, son la misma. El vínculo lo
crea la aprobación; poder cambiarlo a mano sólo servía para dejar dos
promotores en el mismo puesto.

### Empezar de cero

Nueva sección del panel (`/admin/sistema`), sólo para el **propietario**: borra
los datos de ejemplo y de las pruebas para dejar el festival limpio antes de
abrir. Se elige qué se va —votos, visitantes, promotores, stands, bitácora—,
se ve cuánto hay de cada cosa antes de decidir y **hay que escribir
`BORRAR TODO`**: un botón detrás de un «¿estás seguro?» se pulsa sin leer.

**Las cuentas de administración no se tocan nunca.** Si se borraran, nadie
podría volver a entrar a arreglarlo.

### Y lo pequeño

- El voto pregunta **«¿Cómo te pareció nuestro espacio?»** justo encima de los
  emoji, que es lo que envía el voto.
- Tras votar —y también cuando ya se había votado ahí— aparece **«Regresar a
  ver mi recorrido»**. El mensaje de «ya votaste» dejaba a la persona parada en
  una pantalla sin salida.
- En el ranking del teléfono, **el municipio y el número de votos ya no se
  pisan**: compartían la misma celda de la rejilla y se dibujaban uno encima
  del otro.
- El mapa dice **«establecimientos / fincas»** en vez de «stands ubicados».
- La personalización del pasaporte gana **«Guardar y aplicar al pasaporte»**,
  que confirma qué fondos quedaron puestos, y un enlace para ir a mirarlo.
- Arreglado un `className` duplicado en el tablero que hacía que la clase del
  fondo animado no llegara nunca al DOM.

### Base de datos

Ninguna columna nueva. Endpoints nuevos: `POST /api/admin/uploads/permisos`,
`GET /api/admin/sistema/inventario` y `POST /api/admin/sistema/reiniciar` (los
dos últimos, sólo propietario). Retirado `PUT /api/admin/promotores/:id/stand`.

Para revertir a la v2.4.0: `git checkout 8c84b92 -- .`. La base no se toca. Los
permisos corregidos se quedan como están, que es lo correcto en cualquier
versión.

---

## v2.4.0 — El pasaporte, hoja por hoja

**Punto de reversión (v2.3.0):** `6860ffb`

### La hoja del sello

Debajo del sello va ahora **la votación de esa persona en ese stand**: las tres
valoraciones en estrellas, tal como las puso. Si votó de un toque, sin
estrellas, sale el veredicto del emoji. Abajo, una línea con **la fecha y la
hora reales del sello**.

Esa fecha antes estaba **escrita a mano en el código** —`14·ABR·2026`, la misma
para todos los stands y para todo el mundo—. Bonita en la maqueta y falsa en
cuanto alguien miraba dos hojas seguidas. Ahora sale de la hora del voto.

### La hoja de datos

Rehecha con la forma de la página del titular de un pasaporte: número del
documento arriba en el color del sello, **apellidos y nombres separados**,
ciudad de origen, nacionalidad, expedición y validez, última visita, sellos,
correo registrado, la firma del portador y el número dibujado como código QR.
Debajo, la banda de lectura mecánica en el formato de verdad
(`P<COL` + apellidos + `<<` + nombres).

**La foto que el visitante subió en su perfil se ve aquí**, en el recuadro del
retrato. Sin foto, el rayado de «aquí falta una imagen» con su emoji o sus
iniciales, y el rótulo `FOTOGRAFÍA` debajo.

El perfil guarda **un solo campo de nombre**, así que partirlo en nombres y
apellidos es una convención: la mitad de atrás, redondeando hacia abajo, son
apellidos. Acierta con los repartos habituales (2+2, 2+1, 1+1) y nunca deja el
campo vacío. En la base sigue habiendo un nombre y nada más.

**Ya no aparecen sexo, edad ni tipo de visitante**: no caben en esta
disposición y siguen estando en «Mi perfil», que es de quien los escribió.

### El texto de las hojas internas

Subido. Y donde de verdad estaba el problema: **el libro 3D dibujaba con
cuerpos de 6 px**. Las hojas del canvas se medían en porcentajes de su alto y
el render CSS en píxeles, dos sistemas distintos para el mismo diseño, y el
canvas se había quedado a la mitad. Ahora las dos vistas se describen en **las
mismas medidas** —un diseño de 380×528 que se escala entero—, así que un cuerpo
de letra decidido una vez significa lo mismo en las dos y en cualquier teléfono.

De paso, eso arregla un fallo que se veía en pantallas pequeñas: la hoja de
datos cabía en un teléfono de 390 px y se salía por abajo en uno de 360,
perdiendo la firma y la banda mecánica.

`/pasaporte?libro=0` deja a la vista el render CSS, que es el camino que toma un
navegador sin WebGL. Sin una forma de pedirlo a propósito, esa vista sólo se
comprobaba el día que fallaba en el teléfono de alguien.

### Logos de ejemplo

Los ocho stands de `db/seed.sql` traen su emblema: grano, volcán, hoja,
montañas, ola, gota, taza y sol, cada uno en el color con el que ya se sellaba.
Los genera `php tools/logos-ejemplo.php` —PNG a mano, sin GD ni Composer, igual
que el generador de QR— y **se versionan** en `assets/logos/`, porque el
despliegue no ejecuta scripts.

`php db/migrate.php` se los pone a una instalación que ya venía funcionando,
sólo a esos ocho ids y **sólo si no tienen logo**: un stand real con imagen
propia no se toca.

### Base de datos

Ninguna columna nueva. `/api/pasaportes/{correo}` devuelve tres campos más
—`sellado_en`, `ultima_visita` y `numero_qr`—; los dos primeros van con el
testigo del perfil, como las calificaciones: la lista de stands visitados ya es
pública en ese endpoint, pero **la hora de cada visita** dice dónde estuvo
alguien y cuándo.

Para revertir a la v2.3.0: `git checkout 6860ffb -- .`. La base no se toca. Los
logos de ejemplo quedan asignados en `stands.logo_path`; para quitarlos:

```sql
UPDATE stands SET logo_path = NULL WHERE logo_path LIKE 'assets/logos/%';
```

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
