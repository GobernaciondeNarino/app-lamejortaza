-- La Mejor Taza — Esquema MySQL/MariaDB
-- Crea la base, el usuario y las tablas.
-- Uso: mysql -u root -p < db/schema.mysql.sql
-- (revisa contraseñas y nombres antes de ejecutar)

CREATE DATABASE IF NOT EXISTS la_mejor_taza
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE la_mejor_taza;

-- Usuario de aplicación (cambiar la contraseña en producción)
-- CREATE USER IF NOT EXISTS 'lmt_app'@'localhost'
--   IDENTIFIED BY 'CAMBIAR_EN_PRODUCCION';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON la_mejor_taza.* TO 'lmt_app'@'localhost';
-- FLUSH PRIVILEGES;

-- Administradores -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(254) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_admin      TINYINT(1) NOT NULL DEFAULT 1,
  nombre        VARCHAR(120) DEFAULT NULL,
  rol           ENUM('propietario','organizador') NOT NULL DEFAULT 'organizador',
  must_change_password TINYINT(1) NOT NULL DEFAULT 0,
  ultimo_acceso DATETIME DEFAULT NULL,
  creado_por    INT UNSIGNED DEFAULT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_admin_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stands --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stands (
  id            VARCHAR(32) PRIMARY KEY,
  -- Número que la organización asigna al espacio en el recinto («12», «A-14»).
  -- Sólo se usa en la plataforma si TODOS los espacios lo tienen: con la mitad
  -- puestos, el público vería unos con número de feria y otros con el código
  -- interno y no sabría cuál buscar en el mapa impreso. Ver stand_numeracion().
  numero        VARCHAR(16) DEFAULT NULL,
  nombre        VARCHAR(80) NOT NULL,
  municipio     VARCHAR(80) NOT NULL,
  region        VARCHAR(80) DEFAULT NULL,
  direccion     VARCHAR(255) DEFAULT NULL,
  correo        VARCHAR(254) DEFAULT NULL,
  descripcion   TEXT DEFAULT NULL,
  coords_x      DECIMAL(6,5) DEFAULT 0.5,
  coords_y      DECIMAL(6,5) DEFAULT 0.5,
  color         VARCHAR(80) DEFAULT 'oklch(0.45 0.1 40)',
  -- Un stand y su promotor son la misma cosa: estos campos vienen del
  -- formulario de inscripción y se copian aquí al verificarlo.
  propietario   VARCHAR(120) DEFAULT NULL,
  propietario_documento VARCHAR(32) DEFAULT NULL,
  nit           VARCHAR(32)  DEFAULT NULL,
  sitio_web     VARCHAR(255) DEFAULT NULL,
  logo_path     VARCHAR(255) DEFAULT NULL,
  telefono      VARCHAR(32)  DEFAULT NULL,
  -- Caracterización del participante. Se guarda la CLAVE del catálogo, no la
  -- frase: ver api/lib/Catalogos.php. El campo `_otro` sólo se llena cuando la
  -- clave es 'otro', y es lo que hace que «Otro» siga siendo un dato y no un
  -- agujero en el informe.
  tipo_organizacion       VARCHAR(40)  DEFAULT NULL,
  tipo_organizacion_otro  VARCHAR(120) DEFAULT NULL,
  actividad_cafe          VARCHAR(40)  DEFAULT NULL,
  actividad_cafe_otro     VARCHAR(120) DEFAULT NULL,
  -- Grupo o tipo de población. Dato sensible (Ley 1581/2012): catálogo cerrado
  -- y con salida explícita («ninguna»).
  poblacion              VARCHAR(40)  DEFAULT NULL,
  poblacion_otro         VARCHAR(120) DEFAULT NULL,
  -- Selección múltiple, guardada como JSON. Ver Catalogos::multiple().
  linea_productiva       VARCHAR(255) DEFAULT NULL,
  -- Ficha detallada del producto. Los «sí/no» son 0, 1 o NULL, y NULL significa
  -- «no contestó», que no es lo mismo que «no»: publicar un café como no
  -- orgánico porque nadie rellenó la casilla sería inventarse el dato.
  cert_internacional     TINYINT(1)   DEFAULT NULL,
  organico               TINYINT(1)   DEFAULT NULL,
  especial               TINYINT(1)   DEFAULT NULL,
  promedio_taza          VARCHAR(40)  DEFAULT NULL,
  marca_registrada       TINYINT(1)   DEFAULT NULL,
  camara_comercio        TINYINT(1)   DEFAULT NULL,
  camara_comercio_numero VARCHAR(60)  DEFAULT NULL,
  invima                 TINYINT(1)   DEFAULT NULL,
  invima_detalle         VARCHAR(800) DEFAULT NULL,
  manipulacion_alimentos TINYINT(1)   DEFAULT NULL,
  presentacion           VARCHAR(255) DEFAULT NULL,
  presentacion_otro      VARCHAR(120) DEFAULT NULL,
  -- Ubicación geográfica del stand, elegida en el mapa de la inscripción.
  lat           DECIMAL(9,6) DEFAULT NULL,
  lng           DECIMAL(9,6) DEFAULT NULL,
  votos_bueno   INT UNSIGNED NOT NULL DEFAULT 0,
  votos_regular INT UNSIGNED NOT NULL DEFAULT 0,
  votos_malo    INT UNSIGNED NOT NULL DEFAULT 0,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Votos ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS votos (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  stand_id   VARCHAR(32) NOT NULL,
  emoji      ENUM('bueno','regular','malo') NOT NULL,
  correo     VARCHAR(254) NOT NULL,
  -- Tres valoraciones de 1 a 5. Nulas si el visitante no las tocó: el voto de
  -- un toque sigue siendo válido sin ellas.
  est_innovacion TINYINT UNSIGNED DEFAULT NULL,
  est_atencion   TINYINT UNSIGNED DEFAULT NULL,
  est_calidad    TINYINT UNSIGNED DEFAULT NULL,
  compra     TINYINT(1) DEFAULT NULL,
  -- Cuánto gastó, si dijo que sí. Se guarda en pesos enteros.
  compra_valor BIGINT UNSIGNED DEFAULT NULL,
  texto      VARCHAR(500) DEFAULT NULL,
  ip_hash    CHAR(64) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_voto_stand FOREIGN KEY (stand_id) REFERENCES stands(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_vote_per_stand_email (stand_id, correo),
  KEY idx_votos_created_at (created_at),
  KEY idx_votos_stand (stand_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pasaportes ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pasaportes (
  correo    VARCHAR(254) PRIMARY KEY,
  nombre    VARCHAR(120) DEFAULT NULL,
  inicio    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  visitados JSON NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Rate limits ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rate_limits (
  id           CHAR(64) PRIMARY KEY,
  bucket       VARCHAR(64) NOT NULL,
  hits         INT UNSIGNED NOT NULL DEFAULT 0,
  window_start INT UNSIGNED NOT NULL,
  KEY idx_rate_window (window_start)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Promotores de stands ------------------------------------------------------
-- Ciclo de vida: pendiente -> verificado -> activo, o rechazado / suspendido.
-- `password_hash` es NULL mientras el administrador no verifique la solicitud:
-- la clave temporal se genera y se envía por correo en ese momento.
CREATE TABLE IF NOT EXISTS promotores (
  id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email                VARCHAR(254) NOT NULL,
  nombre               VARCHAR(120) NOT NULL,
  documento            VARCHAR(32)  DEFAULT NULL,
  telefono             VARCHAR(32)  DEFAULT NULL,
  municipio            VARCHAR(80)  DEFAULT NULL,
  empresa_tentativa    VARCHAR(120) DEFAULT NULL,
  mensaje              VARCHAR(500) DEFAULT NULL,
  -- Borrador del stand tal y como lo escribió el promotor al inscribirse. Se
  -- copia a `stands` cuando el administrador verifica; a partir de ahí manda
  -- la fila de `stands` y esto queda como registro de lo que pidió.
  stand_nombre         VARCHAR(80)  DEFAULT NULL,
  stand_region         VARCHAR(80)  DEFAULT NULL,
  stand_direccion      VARCHAR(255) DEFAULT NULL,
  stand_descripcion    VARCHAR(800) DEFAULT NULL,
  stand_nit            VARCHAR(32)  DEFAULT NULL,
  stand_sitio_web      VARCHAR(255) DEFAULT NULL,
  -- Caracterización del participante. Ver api/lib/Catalogos.php.
  tipo_organizacion       VARCHAR(40)  DEFAULT NULL,
  tipo_organizacion_otro  VARCHAR(120) DEFAULT NULL,
  actividad_cafe          VARCHAR(40)  DEFAULT NULL,
  actividad_cafe_otro     VARCHAR(120) DEFAULT NULL,
  -- Grupo o tipo de población. Dato sensible (Ley 1581/2012): catálogo cerrado
  -- y con salida explícita («ninguna»).
  poblacion              VARCHAR(40)  DEFAULT NULL,
  poblacion_otro         VARCHAR(120) DEFAULT NULL,
  -- Selección múltiple, guardada como JSON. Ver Catalogos::multiple().
  linea_productiva       VARCHAR(255) DEFAULT NULL,
  -- Ficha detallada del producto. Los «sí/no» son 0, 1 o NULL, y NULL significa
  -- «no contestó», que no es lo mismo que «no»: publicar un café como no
  -- orgánico porque nadie rellenó la casilla sería inventarse el dato.
  cert_internacional     TINYINT(1)   DEFAULT NULL,
  organico               TINYINT(1)   DEFAULT NULL,
  especial               TINYINT(1)   DEFAULT NULL,
  promedio_taza          VARCHAR(40)  DEFAULT NULL,
  marca_registrada       TINYINT(1)   DEFAULT NULL,
  camara_comercio        TINYINT(1)   DEFAULT NULL,
  camara_comercio_numero VARCHAR(60)  DEFAULT NULL,
  invima                 TINYINT(1)   DEFAULT NULL,
  invima_detalle         VARCHAR(800) DEFAULT NULL,
  manipulacion_alimentos TINYINT(1)   DEFAULT NULL,
  presentacion           VARCHAR(255) DEFAULT NULL,
  presentacion_otro      VARCHAR(120) DEFAULT NULL,
  logo_path            VARCHAR(255) DEFAULT NULL,
  stand_lat            DECIMAL(9,6) DEFAULT NULL,
  stand_lng            DECIMAL(9,6) DEFAULT NULL,
  estado               ENUM('pendiente','verificado','activo','rechazado','suspendido')
                       NOT NULL DEFAULT 'pendiente',
  -- Cómo eligió entrar el promotor al inscribirse. Sólo dice CUÁL es su
  -- credencial, para poder etiquetar bien el formulario de acceso y redactar
  -- el correo; el secreto en sí vive hasheado en password_hash como cualquier
  -- otra contraseña, sea una clave, una fecha, un teléfono o el token del QR.
  acceso_metodo        ENUM('password','documento','telefono','qr') DEFAULT NULL,
  password_hash        VARCHAR(255) DEFAULT NULL,
  must_change_password TINYINT(1) NOT NULL DEFAULT 1,
  password_expira_at   DATETIME DEFAULT NULL,
  intentos_fallidos    INT UNSIGNED NOT NULL DEFAULT 0,
  bloqueado_hasta      DATETIME DEFAULT NULL,
  ultimo_acceso        DATETIME DEFAULT NULL,
  stand_id             VARCHAR(32) DEFAULT NULL,
  verificado_por       INT UNSIGNED DEFAULT NULL,
  verificado_at        DATETIME DEFAULT NULL,
  motivo               VARCHAR(255) DEFAULT NULL,
  acepta_datos         TINYINT(1) NOT NULL DEFAULT 0,
  ip_hash              CHAR(64) DEFAULT NULL,
  created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_promotor_email (email),
  KEY idx_promotor_estado (estado),
  CONSTRAINT fk_promotor_stand FOREIGN KEY (stand_id) REFERENCES stands(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Empresa del promotor (una por promotor) -----------------------------------
CREATE TABLE IF NOT EXISTS empresas (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  promotor_id  INT UNSIGNED NOT NULL,
  nombre       VARCHAR(120) NOT NULL,
  nit          VARCHAR(32)  DEFAULT NULL,
  descripcion  VARCHAR(1500) DEFAULT NULL,
  municipio    VARCHAR(80)  DEFAULT NULL,
  direccion    VARCHAR(255) DEFAULT NULL,
  telefono     VARCHAR(32)  DEFAULT NULL,
  sitio_web    VARCHAR(255) DEFAULT NULL,
  logo_path    VARCHAR(255) DEFAULT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_empresa_promotor (promotor_id),
  CONSTRAINT fk_empresa_promotor FOREIGN KEY (promotor_id) REFERENCES promotores(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Productos del promotor ----------------------------------------------------
CREATE TABLE IF NOT EXISTS productos (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  promotor_id  INT UNSIGNED NOT NULL,
  nombre       VARCHAR(120) NOT NULL,
  variedad     VARCHAR(80)  DEFAULT NULL,
  proceso      VARCHAR(80)  DEFAULT NULL,
  altura_msnm  INT UNSIGNED DEFAULT NULL,
  notas_cata   VARCHAR(500) DEFAULT NULL,
  presentacion VARCHAR(80)  DEFAULT NULL,
  precio       DECIMAL(12,2) DEFAULT NULL,
  descripcion  VARCHAR(1500) DEFAULT NULL,
  foto_path    VARCHAR(255) DEFAULT NULL,
  publicado    TINYINT(1) NOT NULL DEFAULT 1,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_producto_promotor (promotor_id),
  CONSTRAINT fk_producto_promotor FOREIGN KEY (promotor_id) REFERENCES promotores(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Caracterización de visitantes ---------------------------------------------
-- Datos que el propio visitante aporta OPCIONALMENTE desde su perfil. Sirven
-- para el informe de caracterización del evento; ninguno es obligatorio y
-- todos admiten "prefiero no decir", como exige tratar datos sensibles
-- (Ley 1581/2012, art. 6: etnia y discapacidad son categorías especiales).
CREATE TABLE IF NOT EXISTS visitantes (
  correo             VARCHAR(254) PRIMARY KEY,
  nombre             VARCHAR(120) DEFAULT NULL,
  telefono           VARCHAR(32)  DEFAULT NULL,
  -- Retrato del visitante. Dos formas, y sólo una a la vez: una foto que sube
  -- (avatar_path) o un emoji que elige (avatar_emoji). El emoji existe porque
  -- mucha gente no quiere poner su cara en un sitio público, y sin alternativa
  -- lo que hacen es dejarlo vacío.
  avatar_path        VARCHAR(255) DEFAULT NULL,
  avatar_emoji       VARCHAR(16)  DEFAULT NULL,
  -- Autenticación OPCIONAL. Escribir el correo basta para abrir el pasaporte,
  -- el recorrido y el perfil: en una feria la gente llega, vota y quiere ver su
  -- libreta sin inventarse una contraseña, y obligar a una era perder a la
  -- mitad del público. Quien quiera cerrar su perfil pone una clave desde
  -- dentro y a partir de ahí se le exige. Va hasheada como cualquier otra.
  acceso_hash        VARCHAR(255) DEFAULT NULL,
  genero             ENUM('hombre','mujer','otro','prefiero_no_decir') DEFAULT NULL,
  rango_edad         ENUM('menor_18','18_25','26_35','36_45','46_60','mayor_60','prefiero_no_decir') DEFAULT NULL,
  pais               VARCHAR(80)  DEFAULT NULL,
  departamento       VARCHAR(80)  DEFAULT NULL,
  municipio          VARCHAR(80)  DEFAULT NULL,
  tipo_visitante     ENUM('publica','privada','academica','gremio','particular','otro','prefiero_no_decir') DEFAULT NULL,
  entidad            VARCHAR(120) DEFAULT NULL,
  grupo_etnico       ENUM('indigena','afrodescendiente','raizal','palenquero','rrom','ninguno','prefiero_no_decir') DEFAULT NULL,
  discapacidad       ENUM('fisica','visual','auditiva','intelectual','psicosocial','multiple','ninguna','prefiero_no_decir') DEFAULT NULL,
  expectativa        VARCHAR(500) DEFAULT NULL,
  como_se_entero     ENUM('redes','radio','television','prensa','voz_a_voz','institucion','otro') DEFAULT NULL,
  primera_visita     TINYINT(1) DEFAULT NULL,
  acepta_datos       TINYINT(1) NOT NULL DEFAULT 0,
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_visitante_municipio (municipio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ajustes que se cambian desde el panel (correo, etc.). Lo que hay aquí pisa a
-- api/config.php clave a clave; si la fila no existe, manda el fichero.
CREATE TABLE IF NOT EXISTS ajustes (
  clave      VARCHAR(64) NOT NULL PRIMARY KEY,
  valor      TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bitácora de correos salientes ---------------------------------------------
-- Sirve para que el administrador sepa si la clave llegó a salir del servidor
-- (el envío de correo es el punto más frágil de un hosting compartido).
CREATE TABLE IF NOT EXISTS emails_log (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  destinatario  VARCHAR(254) NOT NULL,
  asunto        VARCHAR(255) NOT NULL,
  tipo          VARCHAR(40)  NOT NULL,
  transporte    VARCHAR(20)  NOT NULL,
  estado        ENUM('enviado','fallido') NOT NULL,
  error         VARCHAR(500) DEFAULT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_email_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
