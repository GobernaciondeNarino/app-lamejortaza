# La Mejor Taza

**Pasaporte digital del café de Nariño** — votación pública con QR, libreta
de sellos y dashboard en tiempo real para el Festival del Café 2026 de la
Gobernación de Nariño.

> Frontend estático (React + Three.js, sin build step) sobre un backend
> **PHP 8 + PDO** con MySQL/MariaDB o SQLite. Toda la capa de seguridad
> (sesiones, CSRF, rate limiting, validación) vive en el servidor.

**Versión 2.1.0.** Qué trae cada versión y —lo que de verdad importa el día del
evento— **cómo volver atrás**, en [CHANGELOG.md](CHANGELOG.md). La versión
desplegada se consulta en `/api/health` con sesión de administrador.

---

## Tabla de contenido

1. [Funcionalidades](#1-funcionalidades)
   - [Promotores de stands](#1bis-promotores-de-stands)
   - [Cuentas de administración](#1ter-cuentas-de-administración)
   - [Perfil del visitante](#1quater-perfil-del-visitante)
   - [Correo saliente](#1quinquies-correo-saliente)
   - [Mi recorrido](#1sexies-mi-recorrido)
   - [Actividad económica](#1septies-actividad-económica)
   - [Personalización](#1octies-personalización)
2. [Arquitectura](#2-arquitectura)
3. [Requisitos](#3-requisitos)
4. [Instalación local](#4-instalación-local)
5. [Configuración](#5-configuración)
6. [Base de datos](#6-base-de-datos)
7. [Seguridad](#7-seguridad)
8. [API HTTP](#8-api-http)
9. [Animaciones con Three.js](#9-animaciones-con-threejs)
10. [Despliegue en producción](#10-despliegue-en-producción)
11. [Estructura del repositorio](#11-estructura-del-repositorio)
12. [Roadmap](#12-roadmap)

---

## 1. Funcionalidades

### Rutas reales (no mockup)

| URL                                  | Audiencia | Qué hace                                                  |
| ------------------------------------ | --------- | --------------------------------------------------------- |
| `/`                                  | Público   | Dashboard: podio, mapa, ranking, votos en vivo.           |
| `/festival/{standId}`                | Público   | Detalle del stand + botón "Votar este stand →".           |
| `/s/{standId}`                       | Móvil     | **Página real de votación** que abre el QR del stand.     |
| `/pasaporte`                         | Móvil     | Libreta del usuario con sus sellos reales, como libro 3D. |
| `/recorrido`                         | Público   | **Mi recorrido**: todos los stands, los visitados a color. |
| `/inscripcion`                       | Público   | **Inscripción de promotores de stand** (solicitud).       |
| `/promotor`                          | Promotor  | Portal: acceso, cambio de clave, empresa y productos.     |
| `/admin/login`                       | Admin     | Login del organizador.                                    |
| `/admin` · `/admin/stands`           | Admin     | Lista y métricas (gating real).                           |
| `/admin/stands/new`                  | Admin     | Crear stand (POST `/api/stands`).                         |
| `/admin/stands/{id}/edit`            | Admin     | Editar / borrar (PUT/DELETE `/api/stands/{id}`).          |
| `/admin/qr`                          | Admin     | Carteles A5 imprimibles con el QR del stand.              |
| `/admin/live`                        | Admin     | Actividad y ranking en tiempo real.                       |
| `/admin/promotores`                  | Admin     | **Verificar inscripciones** y enviar la clave por correo. |
| `/admin/economia`                    | Admin     | **Actividad económica**: compras del evento y por stand.  |
| `/admin/festival`                    | Admin     | **Personalización**: títulos, columnas y fondos.          |
| `/admin/correos`                     | Admin     | Bitácora de correo saliente (¿salió la clave?).           |
| `/install.php`                       | One-shot  | Asistente de instalación (auto-bloquea al terminar).      |
| `/api/...`                           | Backend   | Front controller PHP (auth, stands, votos, pasaportes).   |

### Administrador
- Autenticación real (cookie `HttpOnly + Secure + SameSite=Strict` +
  CSRF + Argon2id + pepper).
- **CRUD real** de stands. El editor llama a la API y refresca el
  dashboard.
- Generación de carteles A5 con QR único.
- Botón "Cerrar sesión" real.
- Las rutas `/admin/*` están **gated**: si no hay sesión válida, la SPA
  redirige a `/admin/login` y la API rechaza con `401 unauthorized`.

### Usuario · móvil (al escanear el QR)
- El QR apunta a `https://tu-sitio/s/{standId}`. Al abrir, la app
  reconoce el stand y muestra el formulario a pantalla completa
  (sin marco de teléfono — esto **no es una demo**).
- Valoraciones en estrellas → ¿compraste? → emoji (que envía) → comentario.
- El voto se guarda en la tabla `votos`, los agregados en `stands`
  se incrementan, y el correo se sella en la tabla `pasaportes`.

**Tres valoraciones de 1 a 5 estrellas** —Innovación, Atención y Calidad por
defecto, con los títulos configurables— y la pregunta **«¿Compraste algo?»** van
**antes** de los emoji. El orden no es estético: tocar un emoji **envía** el
voto, así que cualquier cosa que quede debajo no llegaría a rellenarse nunca.
Las estrellas son opcionales; el voto de un toque sigue funcionando igual.

La compra estaba plegada bajo «agregar comentario» y casi nadie la abría, de
modo que no había datos que informar. Ahora se ve, y al decir «sí» aparece el
importe. Decir «no» lo borra: un importe colgando de un «no compré» es una
contradicción que acaba cuadrando mal en el informe.
- Tras votar, el correo queda en `localStorage.lmt.email` y la app
  navega a `/pasaporte`.

### Pasaporte (`/pasaporte`)
- Si hay correo guardado, carga la libreta directamente.
- Si no, pide el correo y consulta `/api/pasaportes/{correo}`.
- Portada, **hoja de datos**, una página por sello visitado, **hoja del
  recorrido** y cierre.
- Botón "Cerrar" limpia el correo del dispositivo.

**La hoja de datos** es la primera página interior, y está hecha a imagen de la
página del titular de un pasaporte de verdad: recuadro con la inicial y el
número de sellos, ficha con portador, sexo, edad, procedencia y número de
pasaporte, autoridad expedidora y la banda de lectura mecánica abajo. Antes ahí
había un índice de casillas vacías que no decía nada del visitante.

Los datos salen de su perfil, y **sólo se piden si este navegador guarda el
testigo del perfil** (ver más abajo): sin él la hoja se dibuja igual pero con lo
que ya es público —nombre en iniciales y correo enmascarado— e invita a
completarlo. **El grupo étnico y la discapacidad no aparecen nunca en esta
hoja**: se preguntan para caracterizar al público, son datos sensibles y esta
página se enseña y se fotografía.

El número de pasaporte (`NAR-XXXX-XXXX`) es un hash del correo: estable para la
misma persona y no reversible.

**La hoja del recorrido** («Tu travesía») va **al final**, después de los sellos:
ahí ya hay algo que resumir. Lista cada stand visitado con su número, su nombre,
su municipio y **la calificación que el visitante le puso** —Excelente, Regular
o Mejorable—, y cierra con sellados / faltantes. Al principio del pasaporte no
era más que una columna de casillas vacías.

Las calificaciones **también van detrás del testigo**: `/api/pasaportes/{correo}`
es público, y que alguien visitara un stand no es lo mismo que saber que lo
calificó de «mejorable». Sin testigo la hoja se ve igual, con los stands pero
sin las notas.

Lo pintan dos vistas —el render en CSS y el libro 3D, que dibuja en canvas— a
partir de **un único `datosPagina()`**, para que no puedan acabar diciendo cosas
distintas de la misma persona. El perfil llega después de montar el libro, así
que la hoja se repinta con `setPaginas` sin tirar el contexto WebGL.

En el pasaporte, cada stand lleva **su logo en círculo**: pequeño delante del
nombre en la hoja del recorrido, y grande al centro en la hoja de sello, con el
sello encima **descolocado**. El desvío sale del identificador del stand y no de
`Math.random()`: tiene que ser el mismo cada vez que se abre esa página, o el
sello bailaría al pasar la hoja adelante y atrás, que es justo lo que un sello de
tinta no hace. Bajo el sello va un velo de papel, porque un logo oscuro se traga
la tinta y no se lee ni una cosa ni la otra.

### Público
- Hero animado con un campo 3D de granos de café (Three.js, respeta
  `prefers-reduced-motion`).
- Polling cada 5 s al `/api/dashboard`. Cualquier voto nuevo aparece
  en el feed en vivo y mueve el ranking.
- **Menú hamburguesa** con Inicio, Mi pasaporte, Mi recorrido y Mi perfil. Está
  en el tablero y en el pasaporte, y es el mismo componente: dos copias acaban
  siendo dos menús que no dicen lo mismo. Se cierra al elegir, al tocar fuera y
  con Escape.

**La portada (`/`) es de la ciudadanía.** Antes pedía correo institucional y
contraseña nada más entrar, que es lo primero que veía alguien que acababa de
escanear un QR en la plaza. Ahora ofrece entrar al festival, al recorrido o al
pasaporte, y el acceso de administradores y promotores queda **plegado abajo**
tras un botón. Quien va directo a `/admin/login` lo encuentra ya abierto: ahí ya
sabe a qué viene.

---

## 1.bis. Promotores de stands

Módulo completo de inscripción para quienes exhiben en el festival.

**Flujo:**

1. El caficultor entra a `/inscripcion` y envía **todos los datos de su stand**
   —él y su stand son la misma cosa—: nombre y documento del propietario,
   teléfono, empresa, nombre del stand, municipio, región, dirección, NIT,
   sitio web, descripción, el **logo de su producto** (cuadrado, máx.
   1600×1600 px y 3 MB) y la **ubicación marcada en el mapa de Nariño**. Queda
   `pendiente`. Recibe un acuse por correo; los administradores reciben un aviso.

   El formulario público y el alta interna (`/admin/stands/new`) piden **los
   mismos trece datos**; sólo el identificador del stand, el color de su sello y
   su posición dentro del recinto son internos, porque el promotor no puede
   saberlos. Hay una prueba que lo comprueba en los dos sentidos abriendo ambos
   formularios en un navegador.

   El mapa es propio: los 64 municipios del DANE ya vienen dibujados en
   `js/narino-municipios.js`. No se cargan teselas de Google ni de
   OpenStreetMap, que obligarían a abrir la política de seguridad a dominios
   ajenos y le contarían a un tercero quién se está inscribiendo. Al tocar el
   mapa se rellena solo el municipio (el navegador resuelve qué polígono
   contiene el punto), y desde un teléfono en la finca el botón «usar mi
   ubicación» lo hace en un toque.

   **Municipio y región no se escriben: se eligen.** Cuando eran texto libre, en
   la base acabaron conviviendo «Pasto» y «San Juan de Pasto» como municipios
   distintos, y regiones inventadas que no cuadraban con su municipio. Ahora el
   municipio es un desplegable con los 64 del DANE agrupados por subregión, y
   **la región no se acepta del cliente en ningún endpoint**: el servidor la
   deduce del municipio, así que las dos no pueden contradecirse. Lo que ya
   estaba mal se arregla solo al migrar (`db/migrate.php`), que normaliza los
   municipios reconocidos y recalcula su región.

   El catálogo vive en un único sitio y se genera:

   ```
   php tools/build-subregiones.php --escribir
   ```

   escribe `js/narino-municipios.js` (para el navegador) y `api/lib/Territorio.php`
   (para el servidor). **Los dos se versionan** —el hosting compartido no ejecuta
   build— y el generador se niega a escribir si el cruce entre los 64 municipios
   y las 13 subregiones oficiales no es perfecto en los dos sentidos.
2. Un organizador la revisa en `/admin/promotores` y pulsa
   **«Verificar y enviar clave»**. En ese momento —y sólo entonces— el sistema
   genera una contraseña temporal fuerte, guarda su hash (Argon2id + pepper),
   **crea el stand** con los datos de la inscripción y envía un correo de
   bienvenida con el usuario, la contraseña en claro y **el QR del stand
   incrustado** como imagen, listo para imprimir. El servidor no vuelve a
   conocer la contraseña.
3. El promotor entra en `/promotor` con su correo y esa clave. El sistema le
   **obliga a cambiarla** antes de dejarle hacer nada más; ahí pasa a `activo`.
   La clave temporal caduca a las 72 horas.
4. Ya dentro, completa su perfil, los datos de su **empresa** y sus
   **productos**, con logo y fotos.
5. El administrador puede vincularlo a un stand, suspenderlo, rechazarlo o
   reenviarle una clave nueva (que invalida la anterior).

**Estados:** `pendiente → verificado → activo`, y `rechazado` / `suspendido`.

**Si el correo no sale** (hosting sin MTA, SMTP mal configurado), la respuesta
de «verificar» devuelve la clave al administrador para que la entregue por otro
medio, y lo avisa en pantalla. `/admin/correos` muestra la bitácora de envíos:
es el primer sitio donde mirar si un promotor dice que no le llegó nada.

**Configura el correo antes del evento.** Con `transport = 'mail'` muchos
hostings compartidos marcan el mensaje como spam o directamente no lo envían.
Lo recomendado es `transport = 'smtp'` con las credenciales del dominio
institucional (ver `api/config.example.php`).

---

## 1.ter. Cuentas de administración

`/admin/cuentas` — sólo visible para el perfil **propietario**.

Dos perfiles:

| Perfil | Puede |
|---|---|
| `propietario` | Todo el panel **y** crear, cambiar de perfil, reponer contraseñas y dar de baja cuentas. |
| `organizador` | El panel del festival: stands, votos, pasaportes, promotores, visitantes. No toca las cuentas. |

Al crear una cuenta se genera una contraseña temporal, se guarda sólo su hash y
el texto plano viaja por correo. **El sistema obliga a cambiarla en el primer
acceso**: hasta que no se cambie, la API rechaza cualquier otra ruta con
`password_change_required`. El perfil y esa bandera se revalidan contra la base
como mucho una vez por minuto, así que degradar a alguien o reponerle la clave
surte efecto sin esperar a que caduque su cookie.

Dos reglas impiden quedarse fuera del propio sistema: nadie puede eliminarse a
sí mismo y siempre debe quedar al menos un propietario activo.

El primer propietario es el administrador que crea el asistente de instalación.
En instalaciones anteriores lo asigna `db/migrate.php` a la cuenta más antigua.

---

## 1.quater. Perfil del visitante

`/perfil` — caracterización **voluntaria** del público, que se ofrece al
terminar de votar y desde el pasaporte.

Recoge: nombre y teléfono, género, rango de edad, país / departamento /
municipio de origen, si visita en representación de una entidad pública,
privada, académica, un gremio o a título personal, cómo se enteró del festival,
si es su primera vez, qué espera del evento y —en un bloque aparte— grupo
étnico y situación de discapacidad.

**Retrato: foto o emoji.** El visitante puede subir su foto o elegir un emoji de
una lista cerrada de 30. El emoji no es un adorno: mucha gente no quiere poner su
cara en algo que se enseña en una pantalla en la plaza, y sin alternativa lo que
hacen es dejarlo vacío. Con un emoji se identifican igual y nadie tiene que
decidir entre su privacidad y aparecer. Sin ninguno de los dos, el pasaporte usa
la inicial del nombre.

La foto se sube por su propia ruta (`POST /api/visitantes/foto`) y no en el
`PUT` del perfil: guardarla ahí la borraría cada vez que alguien cambia otro
campo del formulario. Subir una foto sustituye al emoji —quien pone su cara ya
eligió— y **borrar el perfil borra también el archivo del disco**: dejarlo
huérfano sería incumplir el derecho de supresión con la excusa de que «en la
base ya no está».

Los emojis salen de un catálogo cerrado en el servidor. Un campo de texto libre
aquí sería una vía para colar cualquier cosa en un sitio donde luego se pinta
sin escapar, en el canvas del pasaporte.

**País, departamento y municipio van encadenados.** El país es un desplegable
(Colombia u «otro país», que abre un campo de texto); si es Colombia aparece el
departamento con los 32 más Bogotá D.C.; y sólo si el departamento es **Nariño**
el municipio pasa a ser la lista de los 64 del DANE. Fuera de Nariño se escribe,
porque no tenemos el callejero del resto del país y obligar a elegir sería pedir
que se mienta. Cambiar un eslabón limpia los de abajo: si no, quedaba «Pasto»
colgando de «Valle del Cauca». El servidor guarda el nombre oficial cuando
reconoce el departamento y lo deja tal cual cuando no (un visitante de Ecuador
escribe su provincia).

**Cómo se prueba que un perfil es tuyo.** El visitante no tiene contraseña, así
que el correo por sí solo no abre nada: si bastara con escribirlo, cualquiera
podría leer a qué grupo étnico pertenece un vecino. Al votar, el servidor emite
un `HMAC-SHA256(app_secret, 'perfil|' + correo)` que viaja al navegador de quien
acaba de demostrar —en el mismo acto de votar— que controla ese correo, y se
guarda ahí. Sin ese testigo no se lee ni se escribe nada. Quien cambie de
teléfono pide el enlace desde `/perfil`: llega a su buzón, que es la prueba de
propiedad de verdad. Ese envío responde igual exista o no el correo, para que no
sirva de censo de asistentes.

**Ley 1581 de 2012.** El grupo étnico y la discapacidad son datos sensibles: van
en un bloque que explica por qué se preguntan, todas las listas admiten
«Prefiero no decir» y ninguna respuesta es obligatoria. Sin la casilla de
autorización no se guarda nada, y el visitante puede **borrar su perfil entero**
desde la misma página sin perder su voto ni su pasaporte.

El panel lo resume en `/admin/caracterización` — sólo agregados, nunca correos
ni nombres— y lo exporta completo en `api/export/visitantes.csv`, que sí lleva
datos personales y es responsabilidad de quien lo descarga.

---

## 1.quinquies. Correo saliente

`/admin/correo` — configuración, diagnóstico y prueba real.

De aquí salen las contraseñas de los promotores, el QR de su stand y los enlaces
del perfil de los visitantes. Es la pieza más frágil del sistema y la única que
falla **en silencio**, así que el panel es explícito sobre lo que está pasando:

| Transporte | Qué hace |
|---|---|
| `smtp` | Envío autenticado contra el servidor institucional. **Es el recomendado.** |
| `mail` | La función `mail()` de PHP. Devuelve éxito en cuanto el servidor local acepta el mensaje: eso **no** es entrega. |
| `log` | Escribe el mensaje en un archivo y **no envía nada**. Sólo para desarrollo. |

Si «el sistema dice que envió el correo pero no llega», la causa está casi
siempre en esa tabla: con `log` no salió nunca, y con `mail` sale de una IP que
no está autorizada a enviar en nombre del dominio del remitente, así que el
servidor de destino lo descarta o lo manda a spam. El panel avisa de las dos
cosas en rojo, deja mandarse una prueba de verdad y enseña el diálogo completo
con el servidor SMTP cuando falla, con la contraseña tapada.

**La contraseña de aplicación se limpia sola.** Google la enseña en cuatro grupos
de cuatro —`abcd efgh ijkl mnop`— y quien la copia se lleva los espacios. El
servidor SMTP espera los 16 caracteres seguidos, así que con espacios responde
`535` y parece que la clave está mal cuando lo único que sobra son tres blancos.
Se quitan al guardar: pégala como venga.

**La sonda de salida** (*Panel → Correo → «Comprobar la salida»*) prueba a la vez
Gmail por 587, 465 y 25, y el servidor de correo de la propia máquina, y dice qué
hacer con lo que contesten. Existe porque el diagnóstico anterior sólo sabía
decir «no se puede abrir el puerto», y con eso el administrador se iba a discutir
con el proveedor sin saber si el problema era suyo. La diferencia clave:

| Lo que responde | Quién lo hace | Qué significa |
|---|---|---|
| **Connection refused** (errno 111), al instante | Este mismo servidor | Una regla de cortafuegos local. Se arregla en casa. |
| **Connection timed out** (errno 110), tras varios segundos | La red del proveedor | Un descarte silencioso en el camino. Hay que pedirlo. |

Si `nc -zv smtp.gmail.com 587` conecta desde la consola pero PHP recibe
`Connection refused`, el filtro **distingue por usuario**: la consola corre como
root y PHP no. Es la configuración típica de un hosting que permite la salida
SMTP sólo a root. La sonda dice con qué usuario corre PHP y el comando para
comprobarlo.

**Salida de emergencia:** relevar por el servidor de correo de la propia máquina
(`127.0.0.1:25`, sin cifrar) — hay un botón en el panel. Es una conexión local,
así que ninguna regla de salida la toca. Requiere que el SPF del dominio autorice
la IP del servidor, o los mensajes acabarán en spam.

**«Network is unreachable» aunque `nc` sí conecte.** Si desde la consola del
servidor `nc -zv smtp.gmail.com 587` conecta y aun así el envío falla con
`errno 101`, no es el hosting: es IPv6. `smtp.gmail.com` publica registros A y
AAAA; PHP resolvía, se quedaba con la **primera** dirección y ahí acababa su
intento, mientras que `nc` recorre la lista entera. En un servidor sin ruta IPv6
—lo normal en hosting compartido— esa primera podía ser la IPv6, y el
diagnóstico acusaba al proveedor de bloquear una salida que no bloqueaba.

Ahora el cliente resuelve el host a mano y **prueba todas las direcciones, IPv4
primero**, con el certificado validado contra el nombre (`peer_name`) aunque se
conecte por IP. La traza dice qué dirección usó, así que el fallo se ve de un
vistazo. El diagnóstico del panel usa exactamente las mismas direcciones y en el
mismo orden que el envío real.

**El remitente del festival es `hosting@narino.gov.co`, un buzón sobre Gmail**
(Google Workspace). Eso impone tres cosas, y el panel las comprueba y las avisa:

- Servidor `smtp.gmail.com`, puerto `587` con STARTTLS (o `465` con SSL directo).
  El botón «Rellenar para Gmail» del panel pone los tres de una vez.
- **Contraseña de aplicación**, no la del correo. Con la cuenta normal Google
  rechaza la autenticación aunque la clave sea correcta; hay que generar una de
  16 caracteres en la configuración de seguridad de la cuenta.
- El remitente **tiene que ser el mismo buzón autenticado**. Si `from` y `user`
  no coinciden, Gmail reescribe el remitente o rechaza el envío; el diagnóstico
  lo señala antes de que alguien se pase la tarde buscando el fallo.

La configuración se guarda en la tabla `ajustes` y **pisa a la de
`api/config.php`** clave a clave, así que se cambia desde el navegador sin FTP.
No se reescribe `config.php` a propósito: un fichero PHP que la aplicación
regenera con datos de un formulario está a un paso de ser ejecución de código, y
además el usuario del servidor web casi nunca puede escribir ahí. La contraseña
del SMTP se guarda cifrada (libsodium, o AES-256-GCM) con una clave derivada de
`app_secret`, y no vuelve a salir del servidor.

El asistente de instalación tiene un paso dedicado (5·Correo) que configura
**y envía una prueba** antes de dar la instalación por terminada.

---

## 1.sexies. Mi recorrido

`/recorrido` — todos los stands del festival en una rejilla, público.

Los que el visitante ya selló salen **a color**; el resto quedan apagados, como
una colección a medio llenar. Responde a «¿cuáles me faltan?», que es una
pregunta que el ranking no contesta porque ahí lo que manda es quién va ganando.

Cada tarjeta lleva el logo del stand, su nombre, su municipio y las tres
valoraciones: **la que puso el visitante** si votó ahí, y **la media del
festival** si no. Enseñar la media en los que faltan es lo que ayuda a decidir a
cuál ir.

Los sellados se ordenan primero. El **número de columnas** se configura por
separado para computador y para móvil desde *Panel → Personalización*: en una
pantalla de sala caben cuatro y en un teléfono a veces conviene una sola.

Sin correo guardado la página sigue teniendo sentido —es el catálogo de stands—
y explica que votando se van encendiendo.

---

## 1.septies. Actividad económica

`/admin/economia` — cuánto se movió en el festival y en qué stands.

Sale de lo que declara el público al votar. La página **lo dice en su primera
línea**: no es la facturación del evento, porque indicar la compra y el importe
es voluntario, así que lo real siempre es igual o más. Sirve para medir la
magnitud y comparar stands, no para cuadrar caja.

Total y por stand: número de compras, valor declarado, compra media y conversión
(qué porcentaje de quienes votaron acabó comprando). La **compra media se divide
entre las compras QUE TRAEN IMPORTE**, no entre todas: quien dice «sí compré»
pero no escribe cuánto hundiría la media si contara como una compra de cero.

El importe se acepta como lo escribe la gente —`25.000`, `$ 25 000`, `25,000`—
porque el campo se rellena de pie en un stand y con una mano. Se guarda en pesos
enteros, con un tope de 50 millones: sin él, un dedo pegado al teclado numérico
convierte el informe en un disparate.

---

## 1.octies. Personalización

`/admin/festival` — lo que el organizador cambia sin tocar código.

- **Títulos de las tres valoraciones.** Cambiar el nombre no toca lo ya votado:
  las claves son las columnas de la base y siguen siendo la misma valoración.
- **Columnas de «Mi recorrido»**, por separado en computador (1-6) y móvil (1-3).
- **Fondos del pasaporte**: portada, contraportada y hojas internas.

Las hojas internas se reparten **en orden** y se **repiten** cuando se acaban: con
dos imágenes y ocho sellos, cada una sale cuatro veces y siempre la misma en la
misma hoja. Con dos o tres ya se nota variedad sin que el pasaporte pese en el
móvil de un visitante.

Sobre cada fondo va un velo —de papel en las hojas, oscuro en la portada, donde
el texto es claro— para que lo escrito se siga leyendo. **Si no se sube nada, el
pasaporte conserva el diseño del sistema**, que es lo que se ve hoy.

Todo se guarda en la tabla `ajustes` bajo la clave `festival`, y el cliente lo
lee una sola vez al arrancar: lo pinta media interfaz y pedirlo en cada
componente sería una ráfaga de peticiones para algo que no cambia durante la
visita.

---

## 2. Arquitectura

```
            QR impreso /s/{standId}
                       │
                       ▼
┌──────────────────────────────────┐
│ Frontend estático                │
│ - React via Babel Standalone     │
│ - Three.js (hero animado)        │
│ - js/api.js → fetch(/api/…)      │
└──────────┬───────────────────────┘
           │ HTTPS
           ▼
┌──────────────────────────────────┐
│ Backend PHP (api/)               │
│ - index.php = front controller   │
│ - Sesiones HttpOnly + CSRF       │
│ - PDO con sentencias preparadas  │
│ - Rate limiting por IP / correo  │
│ - Validación estricta            │
└──────────┬───────────────────────┘
           ▼
   MySQL/MariaDB · SQLite
   ┌─ admins      ─ stands
   ├─ votos       ─ pasaportes
   └─ rate_limits
```

---

## 2.bis. Compilar los componentes

El proyecto no usa `npm` en producción, pero el JSX se precompila una vez:

```bash
node tools/build-components.mjs      # genera js/components.build.js
```

Ese archivo **se versiona**: el hosting compartido no ejecuta ningún build, así
que tiene que llegar hecho en el despliegue. Si falta, `app.php` cae al modo
Babel-en-el-navegador (funciona, pero descarga 3 MB y obliga a permitir
`unsafe-eval`) y avisa por consola. Si tocas un `.jsx` y no regeneras, `app.php`
también lo detecta comparando fechas y lo dice por consola.

El compilador usa el propio `js/vendor/babel.min.js` del repositorio: no hace
falta instalar nada con npm.

---

## 3. Requisitos

- **PHP 8.1 o superior** con las extensiones `pdo`, `pdo_mysql` (o
  `pdo_sqlite`), `json`, `mbstring`, `intl` (recomendado para `Normalizer`).
- **MySQL 8 / MariaDB 10.5+** (recomendado en producción) **o** SQLite 3.35+.
- Servidor web con soporte de `.htaccess` (Apache, LiteSpeed) o un bloque
  `try_files` equivalente en Nginx (ver §10).
- Para el desarrollador: Git, opcionalmente `composer` (no requerido).

---

## 4. Instalación local

### 4.1. Asistente de instalación web (recomendado)

`install.php` es un asistente al estilo WordPress: comprueba el entorno, pide
los datos de la base y del administrador, escribe `api/config.php`, crea (o
**actualiza**) las tablas, configura y **prueba el correo**, y se autobloquea al
terminar.

```bash
git clone https://github.com/GobernaciondeNarino/la-mejor-taza.git
cd la-mejor-taza

# Servidor de desarrollo (PHP 8 ya trae uno)
php -S 127.0.0.1:8000 router.php
```

Abre <http://127.0.0.1:8000/install.php> (o entra a `/`, que redirige
automáticamente cuando no hay `api/config.php`). Pasos:

1. **Entorno** — versión de PHP, extensiones (`pdo`, `pdo_mysql`/`pdo_sqlite`,
   `mbstring`, `json`), Argon2id y permisos de `api/` y `db/`. Aparte, avisa de
   lo que no bloquea pero se echa en falta, diciendo **qué módulo se queda
   cojo**: sin `gd` los logos no se reducen ni se les quitan los EXIF (las fotos
   de móvil llevan GPS dentro), sin `sodium`/`openssl` no se puede guardar la
   contraseña del SMTP desde el panel, y sin `uploads/` escribible ningún
   promotor podrá subir su logo.
2. **Base de datos** — MySQL/MariaDB o SQLite. Para MySQL pide host, puerto,
   **nombre de la base**, **usuario** y **contraseña**; si la base no existe, la
   crea con `utf8mb4`.
3. **Administrador** — URL del sitio, correo y contraseña (mínimo 12). Aquí
   también puedes desmarcar el seed de los 8 stands de ejemplo. La cuenta que se
   crea aquí queda con perfil **propietario**: es quien podrá crear las demás.
4. **Instalando** — genera `pepper` y `app_secret` aleatorios, escribe
   `api/config.php` con `'installed' => true` y un `reinstall_token`, aplica el
   esquema, **actualiza una base que ya existiera** (misma rutina que
   `db/migrate.php`: añade las columnas que falten a las tablas que ya están, que
   es lo que `CREATE TABLE IF NOT EXISTS` no hace) y crea el administrador.
5. **Correo** — transporte, remitente y credenciales del SMTP, y **envía una
   prueba de verdad**. Es el único paso que comprueba algo que no se puede
   comprobar solo: descubrir el día del festival que las contraseñas de los
   promotores nunca salieron no es una opción. Se puede saltar y hacerlo después
   desde *Panel → Correo*.
6. **Listo** — lista de verificación con lo que falta (borrar `install.php`, si
   el correo quedó probado, si las URLs limpias responden), enlaces a por dónde
   empezar y el `reinstall_token`.

> Mientras `api/config.php` no exista, `install.php` se ejecuta libremente.
> En cuanto existe, el asistente se autobloquea — la única forma de
> reabrirlo es:
> - borrar `api/config.php`, **o**
> - llamar `install.php?reinstall={token}` con el token guardado en el
>   propio config.

Cuando termines, **borra** `install.php` del servidor (no hace falta en
producción).

**Para actualizar una instalación que ya está en marcha** puedes volver a pasar
el asistente con `install.php?reinstall={token}` —conserva los datos y sólo
añade lo que falte— o ejecutar `php db/migrate.php` desde la consola, que hace
exactamente lo mismo sin tocar la configuración ni el administrador.

### 4.2. Instalación manual (sin wizard)

Si prefieres no usar el asistente:

```bash
# A) SQLite — rápido para desarrollo
php -r "\$p=new PDO('sqlite:db/la-mejor-taza.sqlite');
        \$p->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        \$p->exec(file_get_contents('db/schema.sqlite.sql'));
        \$p->exec(file_get_contents('db/seed.sql'));
        echo 'OK\n';"

# B) MySQL/MariaDB
mysql -u root -p < db/schema.mysql.sql
mysql -u root -p -e "
  CREATE USER 'lmt_app'@'localhost' IDENTIFIED BY 'CAMBIAR_EN_PRODUCCION';
  GRANT SELECT, INSERT, UPDATE, DELETE ON la_mejor_taza.* TO 'lmt_app'@'localhost';
  FLUSH PRIVILEGES;
"
mysql -u lmt_app -p la_mejor_taza < db/seed.sql

# Config + administrador
cp api/config.example.php api/config.php
$EDITOR api/config.php   # ajusta el DSN, pepper y app_secret
php db/create-admin.php admin@lamejortaza.co 'TuContraseñaMuyLarga'
```

---

## 5. Configuración

`api/config.php` está en `.gitignore` — nunca lo commits.

```php
return [
    'db' => [
        'dsn'      => 'mysql:host=127.0.0.1;dbname=la_mejor_taza;charset=utf8mb4',
        'user'     => 'lmt_app',
        'password' => '…',
        // SQLite alternativo:
        // 'dsn' => 'sqlite:' . __DIR__ . '/../db/la-mejor-taza.sqlite',
    ],
    'pepper'     => '64 hex (genera con random_bytes)',
    'app_secret' => '64 hex (otro distinto)',
    'session' => [
        'name'     => 'lmt_sid',
        'lifetime' => 28800,
        'secure'   => true,        // exige HTTPS
        'samesite' => 'Strict',
    ],
    'allowed_origins' => [
        'https://lamejortaza.co',
    ],
    'rate_limits' => [
        'login'      => ['window' => 600, 'max' => 5],
        'vote'       => ['window' => 60,  'max' => 1],
        'vote_email' => ['window' => 600, 'max' => 12],
        'global'     => ['window' => 60,  'max' => 120],
    ],
    'force_https' => true,
    'debug'       => false,
];
```

Generar `pepper` y `app_secret`:

```bash
php -r "echo bin2hex(random_bytes(32)) . PHP_EOL;"   # ejecuta dos veces
```

> Si cambias el `pepper` en producción, **invalidas todos los hashes
> existentes**. Hay que rotar contraseñas o migrar.

---

## 6. Base de datos

### 6.1. Tablas

| Tabla         | Función                                                   |
| ------------- | --------------------------------------------------------- |
| `admins`      | Cuentas de organizadores (Argon2id + pepper) y su perfil (`propietario` / `organizador`). |
| `stands`      | Stands del festival, datos del propietario y agregados de votos por emoji. |
| `votos`       | Un voto por (stand, correo). FK a stands. Índice único.   |
| `pasaportes`  | Stands visitados por correo. JSON de ids.                 |
| `promotores`  | Inscripciones, credenciales y borrador de los datos del stand. |
| `empresas`    | Empresa de cada promotor.                                  |
| `productos`   | Cafés que expone cada promotor.                            |
| `visitantes`  | Caracterización voluntaria del público (Ley 1581/2012).    |
| `emails_log`  | Bitácora de correos salientes.                             |
| `ajustes`     | Configuración editable desde el panel (correo). Pisa a `api/config.php`. |
| `rate_limits` | Ventanas fijas por (bucket, hash) para limitar requests.  |

Esquema completo en [`db/schema.mysql.sql`](db/schema.mysql.sql) y
[`db/schema.sqlite.sql`](db/schema.sqlite.sql).

### 6.1.bis. Actualizar una instalación existente

`CREATE TABLE IF NOT EXISTS` no toca una tabla que ya existe, así que volver a
pasar el esquema **no** añade las columnas nuevas. Para eso está el migrador,
que es idempotente y se puede ejecutar tantas veces como haga falta:

```bash
php db/migrate.php --dry-run   # enseña lo que haría, sin tocar nada
php db/migrate.php             # lo aplica
```

**Las columnas que faltan las deduce del propio `db/schema.<motor>.sql`**, no de
una lista escrita a mano. Antes había esa lista y había que acordarse de
ampliarla cada vez que el esquema crecía; no nos acordamos, y una instalación
sobre la base del año pasado moría con `table admins has no column named
is_admin`. Ahora la fuente de verdad es una sola: cualquier columna que se añada
al esquema se migra sin tocar el migrador. Salta lo que no se puede añadir con
`ALTER TABLE` (claves primarias, `UNIQUE`, autoincrementales) y afloja el
`NOT NULL` sin valor por defecto, que no se puede aplicar a una tabla con filas.

Además crea las tablas que falten (`visitantes`, `ajustes`, `emails_log`…),
asigna el perfil `propietario` a la cuenta de administración más antigua y
**normaliza municipio y región** de los stands contra el catálogo del DANE. Ejecútalo **antes** de subir el código nuevo o justo después; mientras
tanto el login sigue funcionando (cae a un `SELECT` reducido), pero el módulo de
cuentas y el de visitantes no.

### 6.2. Seed

```bash
mysql -u lmt_app -p la_mejor_taza < db/seed.sql
# o, en SQLite:
php -r "(new PDO('sqlite:db/la-mejor-taza.sqlite'))->exec(file_get_contents('db/seed.sql'));"
```

### 6.3. Mantenimiento

- Limpiar la tabla `rate_limits` periódicamente (un cron diario o mensual
  basta — la lógica reescribe la fila automáticamente, pero la tabla
  crece con cada nueva IP):

  ```sql
  DELETE FROM rate_limits
  WHERE window_start < UNIX_TIMESTAMP(NOW() - INTERVAL 7 DAY);
  ```

- Backups: `mysqldump --single-transaction` (MySQL) o copia atómica del
  archivo `.sqlite`.

---

## 7. Seguridad

### Capas en el servidor

| Riesgo                            | Mitigación                                                    |
| --------------------------------- | ------------------------------------------------------------- |
| SQLi                              | PDO + sentencias preparadas + `ATTR_EMULATE_PREPARES = false`. |
| XSS persistido                    | `Validate::comment()` quita HTML/control chars; CSP estricta. |
| CSRF                              | Sesión + `X-CSRF-Token` + lista blanca de Origin/Referer.     |
| Session fixation / robo de cookie | Cookie `HttpOnly; Secure; SameSite=Strict` con `path` acotado al subdirectorio, `regenerate_id`, huella por User-Agent. |
| Revocación de administradores     | `Session::isAdmin()` revalida `is_admin` contra la base cada 60 s: quitar el permiso expulsa de verdad. |
| Brute force login                 | 5 intentos / 10 min por IP, hashing constante incluso en fallo. |
| Spam de votos                     | 1 voto / min / IP / stand, 12 / 10 min / correo, índice único en DB. |
| Robo de hashes                    | Argon2id (`memory_cost=65536, time_cost=4, threads=2`) + pepper HMAC-SHA256 separado. |
| Filtración de errores             | `display_errors=0`, mensajes públicos genéricos, detalles a `error_log`. |
| Accesos directos a `config.php`   | `.htaccess` con `Require all denied` + ruta privada.          |
| Sniffing / MITM                   | HSTS (1 año), `force_https`, cabeceras `X-Content-Type-Options`. |
| Clickjacking                      | `X-Frame-Options: SAMEORIGIN`, CSP `frame-ancestors 'self'`.  |
| PII en logs / dashboard           | Correo enmascarado en usuario **y dominio** (`ju****@a****.gov.co`); nombre reducido a inicial. |
| Datos de contacto de los stands   | `correo` y `direccion` sólo viajan si la sesión es de administrador. |
| Enumeración de participantes      | `/pasaportes/{correo}` responde igual exista o no (sin 404 delator) + límite por IP y por correo. |
| Inyección de fórmulas en CSV      | Serialización CSV propia (RFC 4180, sin el `escape` de `fputcsv`) + prefijo `'` en celdas peligrosas. |
| Cabecera `Host` manipulada        | Los enlaces de correos y QR salen de `Security::baseUrlPublica()`, que sólo acepta hosts de `allowed_origins`. |
| Webshell vía subida de imágenes   | Tipo real por `getimagesize` + `finfo`, extensión derivada del tipo, nombre aleatorio, **re-codificación con GD** (destruye polyglots y EXIF) y `.htaccess` que apaga el motor de scripts. |
| Fuerza bruta contra promotores    | 8 intentos → bloqueo de 15 min por cuenta, además del límite por IP. |
| Contraseñas débiles de promotor   | Mínimo 10 caracteres, 3 clases, y rechazo de su propio nombre/correo **comparando sin tildes y palabra por palabra**. |
| Carrera en el rate limit          | Incremento atómico (`ON DUPLICATE KEY` / `ON CONFLICT`) y decisión sobre el valor ya escrito. |
| Ficheros sensibles servibles      | `db/.htaccess` niega la carpeta entera (base SQLite y bitácora de correo); `api/config.php` se escribe con permisos `0600`. |
| Reinstalación no autorizada       | `install_incomplete()` **falla cerrado**: ante un fallo de base de datos NO reabre el asistente. La recuperación exige crear `api/.permitir-reinstalacion` por FTP/SSH. |

### Capas en el navegador

- **CSP como cabecera HTTP** (no en `<meta>`, donde el navegador ignora
  `frame-ancestors` y la protección contra clickjacking sería ficticia), con
  **nonce por petición** para los dos scripts en línea.
- **Cero dependencias externas en tiempo de ejecución.** React, three.js y las
  tipografías se sirven desde el propio dominio. Antes venían de `unpkg.com` y
  `fonts.googleapis.com`: si esa CDN no era alcanzable —una red institucional
  filtrada basta— la aplicación entera se quedaba en «Cargando…», y Google
  recibía la IP de cada visitante del festival (dato personal, Ley 1581/2012).
- **JSX precompilado** (`js/components.build.js`, generado por
  `tools/build-components.mjs`). Con ello la CSP puede prohibir `eval` y el
  visitante deja de descargar 3 MB de Babel en su móvil.
  **Tras tocar cualquier `.jsx` hay que regenerarlo**; `app.php` avisa por
  consola si el bundle quedó viejo.
- `js/security.js`: validación cliente espejo del servidor + rate limit
  local de 60 s por stand.
- React escapa por defecto los textos.

### Riesgo residual conocido

`/pasaportes/{correo}` es de autoservicio por diseño: quien conozca el correo
exacto de una persona puede confirmar en una petición que participó y qué
stands visitó. La respuesta ya es idéntica para correos inexistentes y hay
límite por IP y por correo, pero eliminarlo del todo exigiría verificar la
propiedad del buzón (enlace mágico), lo que cambia el flujo del visitante.
Queda documentado como decisión de producto, no como olvido.

### Origen permitido

`api/config.php → allowed_origins` se compara contra `Origin` o `Referer`
en cualquier `POST/PUT/DELETE`. Añade allí cada dominio donde corra el
front antes de salir a producción.

---

## 8. API HTTP

Todas las respuestas usan `application/json` y la forma:

```jsonc
{ "ok": true,  "data": <payload> }       // éxito
{ "ok": false, "error": "code", "message": null }   // error
```

| Método  | Ruta                          | Auth         | Notas                              |
| ------- | ----------------------------- | ------------ | ---------------------------------- |
| `GET`   | `/api/auth/me`                | público      | Devuelve usuario (o null) + CSRF.  |
| `POST`  | `/api/auth/login`             | público      | Body: `{email, password}`.         |
| `POST`  | `/api/auth/logout`            | público      | Cierra sesión.                     |
| `GET`   | `/api/stands`                 | público      | Lista todos los stands.            |
| `GET`   | `/api/stands/:id`             | público      |                                    |
| `POST`  | `/api/stands`                 | admin        | Body: stand completo.              |
| `PUT`   | `/api/stands/:id`             | admin        | Reemplaza campos.                  |
| `DELETE`| `/api/stands/:id`             | admin        | CASCADE borra votos.               |
| `GET`   | `/api/votos?limit=20`         | público      | Últimos N votos (correos enmascarados). |
| `POST`  | `/api/votos`                  | público*     | Validado server-side; índice único.|
| `DELETE`| `/api/votos/{id}`             | admin        | Modera comentarios; ajusta agregados. |
| `GET`   | `/api/pasaportes/{correo}`    | público      | Correo viene URL-encoded.          |
| `GET`   | `/api/dashboard`              | público      | Stands + votos + métricas.         |
| `GET`   | `/api/health`                 | público      | Versión PHP, BD alcanzable, contadores. |
| `GET`   | `/api/export/votos.csv`       | admin        | CSV con BOM UTF-8 (Excel).         |
| `GET`   | `/api/export/stands.csv`      | admin        | CSV con BOM UTF-8.                 |
| `GET`   | `/api/export/pasaportes.csv`  | admin        | CSV con BOM UTF-8.                 |
| `GET`   | `/api/export/visitantes.csv`  | admin        | Caracterización con datos personales. |
| **Promotores** | | | |
| `POST`  | `/api/promotores/registro`    | público*     | Inscripción con todos los datos del stand. |
| `POST`  | `/api/promotores/logo-inscripcion` | público* | Logo antes de tener cuenta. Límite propio por IP. |
| `POST`  | `/api/promotores/login`       | público*     | |
| `POST`  | `/api/promotores/password`    | promotor     | Cambio obligatorio de la clave temporal. |
| `GET/PUT` | `/api/promotores/perfil`, `/empresa`, `/productos` | promotor | |
| `GET`   | `/api/admin/promotores`       | admin        | Listado y detalle de inscripciones. |
| `POST`  | `/api/admin/promotores/:id/verificar` | admin | Crea el stand y envía clave + QR. |
| **Cuentas** | | | |
| `GET/POST` | `/api/admin/administradores` | propietario | Listar y crear cuentas.           |
| `PUT/DELETE` | `/api/admin/administradores/:id` | propietario | Perfil, alta/baja, borrado.  |
| `POST`  | `/api/admin/administradores/:id/clave` | propietario | Repone la contraseña.       |
| `POST`  | `/api/auth/password`          | admin        | Cambio de la propia contraseña.    |
| **Visitantes** | | | |
| `GET`   | `/api/visitantes/opciones`    | público      | Catálogos del formulario.          |
| `GET/PUT/DELETE` | `/api/visitantes/perfil` | testigo   | `correo` + `t` (HMAC emitido al votar). |
| `POST`  | `/api/visitantes/enlace`      | público*     | Manda el enlace del perfil al buzón. |
| `GET`   | `/api/admin/visitantes/resumen` | admin      | Sólo agregados, sin correos.       |
| `GET`   | `/api/admin/visitantes/expectativas` | admin | Texto libre, últimas 100.          |
| **Correo** | | | |
| `GET`   | `/api/admin/correo`           | admin        | Configuración efectiva + diagnóstico. |
| `PUT/DELETE` | `/api/admin/correo`      | propietario  | Guardar o volver a la del archivo. |
| `POST`  | `/api/admin/correo/prueba`    | admin        | Envía una prueba y devuelve el diálogo SMTP. |
| `GET`   | `/api/admin/uploads`          | admin        | Dónde se guardan las imágenes y si la carpeta es escribible. |
| **QR** | | | |
| `GET`   | `/api/qr/{id}.png`            | público      | PNG del QR de un stand.            |

> \* No requiere usuario, pero **sí** CSRF + Origin permitido.

`POST /api/votos` devuelve `{ "perfil_token": "..." }`: es el testigo con el que
ese correo puede abrir y editar su perfil de visitante.

### Ejemplo: emitir voto

```bash
# 1. Obtener CSRF (y la cookie)
curl -c c.txt http://127.0.0.1:8000/api/auth/me

# 2. Enviar voto
curl -b c.txt -H "Content-Type: application/json" \
     -H "X-CSRF-Token: $(jq -r .data.csrf < <(curl -s -b c.txt http://127.0.0.1:8000/api/auth/me))" \
     -H "Origin: http://127.0.0.1:8000" \
     -d '{"stand":"st-08","emoji":"bueno","correo":"yo@correo.co","compra":true}' \
     http://127.0.0.1:8000/api/votos
```

---

## 9. Animaciones con Three.js

### El pasaporte como libro (`js/passport-book.js`)

`/pasaporte` ya no inclina una tarjeta con CSS: monta un libro real en three.js.
Cada hoja es un plano segmentado anclado al lomo cuyos vértices se recolocan por
frame siguiendo una curva de **longitud constante** — el papel se dobla, no se
estira— con normales analíticas para que la luz corra por el pliegue. Hay lomo
redondeado, bloques de canto que dan grosor, sombra proyectada de la hoja en
vuelo y arrastre con el dedo para pasar página a medio camino.

Detalles que importan en el móvil de un visitante:

- **Render por demanda**: no hay `requestAnimationFrame` permanente. En reposo
  el consumo es cero.
- **Ventana LRU de texturas** (6, o 4 en calidad baja): con 20 sellos el
  consumo de memoria de GPU no crece.
- **Sin shadow maps**: las sombras son geometría barata y gradientes horneados
  en la textura.
- **Degradación**: sin WebGL, sin three.js o si se pierde el contexto, React
  vuelve al render en CSS de siempre y los botones ←/→ siguen funcionando. El
  3D es una capa de presentación, nunca el mecanismo de navegación.
- `prefers-reduced-motion` mantiene el libro pero quita el barrido.

three.js se auto-hospeda como **módulo ES** (`js/vendor/three.module.min.js`,
r167) porque desde r160 ya no se publica el build UMD. Como los módulos se
ejecutan después de los scripts clásicos, `js/three-loader.js` expone
`window.whenThree(cb)` y `window.threeSoportado()`: ningún consumidor puede
asumir que `THREE` exista al evaluarse.

### Fondo de granos (`js/three-background.js`)

`js/three-background.js` monta una escena WebGL detrás del hero del
dashboard usando los tokens CSS (`--grano`, `--galeras`, `--cafeto`).

- Granos de café 3D flotando en órbitas suaves.
- Capa de "vapor" con `THREE.Points`.
- Niebla exponencial fundiendo bordes.
- Parallax con el ratón.
- Pausa en `visibilitychange` y un solo frame con `prefers-reduced-motion`.

```html
<section data-three-bg>…</section>
```

Cualquier elemento con `data-three-bg` se monta automáticamente. También:

```jsx
<section ref={(el) => el && window.LMTThree && window.LMTThree.mount(el)} />
```

`mount(el)` devuelve `{ destroy() }` para liberar el contexto WebGL.

---

## 10. Despliegue en producción

### Apache

`firebase.json` ya no se usa. La configuración vive en los `.htaccess`:

- `/.htaccess` — cabeceras globales (HSTS, X-Frame-Options,
  Permissions-Policy), bloqueo de archivos sensibles, rewrites para `/`
  y `/s/{id}` → la SPA.
- `/api/.htaccess` — front controller en `index.php`, bloqueo directo a
  `lib/`, `routes/`, `config.php`.

Sube todo el repo (excepto lo de `.gitignore`) al docroot. Mueve idealmente
`api/config.php` y `db/*.sqlite` **fuera** del docroot y ajusta los
require/DSN.

### Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name lamejortaza.co;
    root /var/www/la-mejor-taza;
    index "La Mejor Taza.html";

    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    location ~ ^/api(/.*)?$ {
        try_files $uri /api/index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }

    location ~ ^/(api/(config|lib|routes)|db|\.git) { return 403; }

    location ~ ^/s/[a-z0-9\-]{2,32}/?$ { try_files /La%20Mejor%20Taza.html =404; }
    location = / { try_files /La%20Mejor%20Taza.html =404; }
}
```

### TLS

Imprescindible (HSTS, cookies `Secure`). Usa Let's Encrypt:

```bash
certbot --nginx -d lamejortaza.co -d www.lamejortaza.co
```

---

## 11. Estructura del repositorio

```
la-mejor-taza/
├── app.php                    # SPA renderizada por PHP (inyecta <base> y LMT_BOOTSTRAP)
├── index.html                 # redirección a app.php
├── router.php                 # router para `php -S` en desarrollo
├── .htaccess                  # cabeceras globales + rewrites
├── components/                # JSX precompilado a js/components.build.js
│   ├── Shared.jsx             # Logo, sello, QR, avisos, SubirImagen, BloqueForm
│   ├── Admin.jsx              # login + AdminShell + StandsList + StandEditor
│   ├── QRPrint.jsx            # cartel A5 + hojas de impresión + actividad
│   ├── VoteFlow.jsx           # MobileVotePage real (full-screen)
│   ├── Passport.jsx           # PassportPage real (libreta del usuario)
│   ├── Dashboard.jsx          # PublicDashboard + MapaNarino + PublicDetail
│   ├── Promotores.jsx         # inscripción, portal del promotor, revisión
│   ├── Mapa.jsx               # selector de ubicación sobre el mapa de Nariño
│   ├── Cuentas.jsx            # cuentas de administración + cambio de clave
│   ├── Correo.jsx             # configuración, diagnóstico y prueba de envío
│   ├── Perfil.jsx             # perfil del visitante (/perfil)
│   └── Caracterizacion.jsx    # resumen del público en el panel
├── js/
│   ├── router.js              # router cliente (pushState + popstate)
│   ├── api.js                 # cliente del backend PHP (fetch + CSRF)
│   ├── security.js            # validación cliente, mascarado, rate-limit
│   └── three-background.js    # escena Three.js (granos flotantes)
├── styles/tokens.css          # design tokens
├── install.php                # asistente de instalación (estilo WordPress)
├── api/
│   ├── .htaccess              # bloqueo + front controller
│   ├── index.php              # bootstrap + router
│   ├── config.example.php     # plantilla (la genera install.php)
│   ├── lib/
│   │   ├── Config.php         # carga de config inmutable
│   │   ├── Db.php             # PDO singleton + tx()
│   │   ├── Response.php       # JSON helpers
│   │   ├── Session.php        # sesiones endurecidas + CSRF
│   │   ├── Validate.php       # email, standId, comentario, etc.
│   │   ├── RateLimit.php      # ventanas fijas en DB
│   │   ├── Security.php       # cabeceras, hash, CSRF/Origin
│   │   ├── QrCode.php         # QR en PHP puro (sin dependencias)
│   │   ├── Mailer.php         # SMTP / mail() / log, con adjuntos incrustados
│   │   ├── Correos.php        # plantillas HTML+texto de cada correo
│   │   ├── Uploads.php        # imágenes: valida, recodifica y guarda
│   │   ├── Ajustes.php        # config editable desde el panel, con secretos cifrados
│   │   ├── Territorio.php     # GENERADO: los 64 municipios y sus 13 subregiones
│   │   └── Router.php
│   └── routes/
│       ├── auth.php
│       ├── stands.php
│       ├── votos.php
│       ├── pasaportes.php
│       ├── dashboard.php
│       ├── exports.php
│       ├── qr.php
│       ├── promotores.php
│       ├── administradores.php
│       ├── visitantes.php
│       └── correo.php
├── db/
│   ├── schema.mysql.sql
│   ├── schema.sqlite.sql
│   ├── seed.sql
│   ├── migraciones.php        # columnas que faltan, deducidas del esquema
│   ├── migrate.php            # actualiza una instalación ya existente
│   └── create-admin.php       # CLI para crear/actualizar admins
├── CHANGELOG.md               # versiones y cómo revertir cada una
├── tools/
│   ├── build-components.mjs   # JSX → js/components.build.js
│   └── build-subregiones.php  # catálogo → Territorio.php + narino-municipios.js
└── README.md
```

---

## 12. Despliegue en subdirectorio

Si la app vive bajo una ruta (p. ej. `https://cisna.narino.gov.co/lamejortaza/`):

- Sube todo el repo dentro de esa carpeta del docroot.
- `app.php` calcula el `<base href>` correcto leyendo `SCRIPT_NAME`,
  por lo que `js/`, `styles/` y `/api/` resuelven a
  `/lamejortaza/...` automáticamente.
- El `.htaccess` está escrito en formato relativo (sin paths absolutos),
  así que funciona igual en raíz que en cualquier subdirectorio.
- El asistente de instalación pone en `allowed_origins` la URL exacta
  que ingreses en el paso "URL del sitio". **Esa URL debe coincidir
  con la que ven los navegadores** o los POST devolverán
  `403 origin_not_allowed`.
- En `api/config.php`, deja `'session' => ['secure' => true]` cuando
  el sitio se sirve por HTTPS (cookies sólo viajan por TLS).

### Antes de abrir al público

- [ ] `node tools/build-components.mjs` ejecutado y `js/components.build.js` subido.
- [ ] `api/lib/Territorio.php` y `js/narino-municipios.js` presentes en el
      servidor. Se generan, pero **se versionan**: sin el primero, `api/index.php`
      hace un `require` que no existe y toda la API responde con un 500.
- [ ] `api/config.php` con permisos `600` y `debug => false`.
- [ ] `mail.transport` en `smtp` y probado: verifica un promotor de prueba y
      confirma en `/admin/correos` que el envío sale como `enviado`.
- [ ] `allowed_origins` con el dominio real (y **sin** `localhost`).
- [ ] `trust_proxy => true` sólo si hay un balanceador TLS delante.
- [ ] **Borrar `install.php`, `api/check.php` y `api/diag.php`** del servidor.
- [ ] Comprobar que `curl https://tu-sitio/db/la-mejor-taza.sqlite` devuelve 403
      y que `curl https://tu-sitio/api/config.php` no muestra nada.
- [ ] `uploads/` escribible por PHP y con su `.htaccess` presente.

### Verificación rápida tras instalar

```bash
# 1. Health check (no requiere CSRF). Debe ser 200 con db_reachable=true.
curl https://tu-sitio/lamejortaza/api/health

# 2. Auth/me. Debe ser 200 con user:null + csrf.
curl https://tu-sitio/lamejortaza/api/auth/me

# 3. Refresh profundo del SPA. Debe ser 200 (no 404) y traer LMT_BOOTSTRAP.
curl -I https://tu-sitio/lamejortaza/admin/login
curl -I https://tu-sitio/lamejortaza/s/st-08
```

### "Después de instalar veo 404 en `/admin/login` / `/s/{id}`"

**Buena noticia**: la API ya **no depende de `mod_rewrite`**. El cliente
JS llama directamente a `/lamejortaza/api/index.php?path=auth/me`, que
funciona aunque `AllowOverride` esté en `None`.

Para los **deep links de la SPA** (`/admin/login`, `/s/{id}`, etc.) sí
necesitas que Apache enrute esas URLs hacia `app.php`. Hay tres niveles
de fallback:

1. **`mod_rewrite`** activo + `AllowOverride All` (preferido).
2. **`FallbackResource /app.php`** — Apache 2.2.16+, no requiere
   `mod_rewrite` pero sí `AllowOverride FileInfo`.
3. Si nada de lo anterior funciona, los visitantes pueden seguir
   votando porque las URLs de los QR funcionan vía `app.php`
   directamente y el `index.php` raíz sirve el dashboard.

Diagnóstico rápido — visita en el navegador:
```
https://tu-sitio/lamejortaza/api/index.php?path=health
```

- 200 con JSON `{"ok":true,"data":{...,"db_reachable":true}}` → la API
  funciona perfectamente, no tienes ningún problema crítico. Si las
  URLs `/admin/login` aún 404'an, es sólo cuestión de cosmética: pide
  al hosting que active `mod_rewrite` o `AllowOverride All`.
- 404 / página de error del hosting → ni siquiera el front controller
  PHP está accesible. Verifica que subiste `api/index.php` y que el
  hosting permite ejecutar `.php`.

### "POST /api/votos devuelve `origin_not_allowed`"

Edita `api/config.php` y agrega tu URL real (sin barra final) en
`allowed_origins`:

```php
'allowed_origins' => [
    'https://cisna.narino.gov.co/lamejortaza',
],
```

## 13. Roadmap

- [ ] Endpoint `/api/qr/{standId}.png` que genere el PNG con
      `endroid/qr-code` (composer).
- [ ] Migrar `MapaNarino` SVG estilizado a `municipios.geojson` con
      Leaflet/MapLibre.
- [ ] WebSockets / SSE para feed live (hoy es polling 5 s).
- [ ] Doble factor (TOTP) para administradores.
- [ ] Exportes CSV / XLSX para informes de la Gobernación.
- [ ] Tests E2E (Playwright) para el flujo voto → pasaporte → dashboard.

---

**Comité del Café · Gobernación de Nariño · 2026**
