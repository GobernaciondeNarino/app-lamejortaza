-- La Mejor Taza — Esquema SQLite (alternativa para desarrollo local).
-- Uso: sqlite3 db/la-mejor-taza.sqlite < db/schema.sqlite.sql

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS admins (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_admin      INTEGER NOT NULL DEFAULT 1,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stands (
  id            TEXT PRIMARY KEY,
  nombre        TEXT NOT NULL,
  municipio     TEXT NOT NULL,
  region        TEXT,
  direccion     TEXT,
  correo        TEXT,
  descripcion   TEXT,
  coords_x      REAL DEFAULT 0.5,
  coords_y      REAL DEFAULT 0.5,
  color         TEXT DEFAULT 'oklch(0.45 0.1 40)',
  votos_bueno   INTEGER NOT NULL DEFAULT 0,
  votos_regular INTEGER NOT NULL DEFAULT 0,
  votos_malo    INTEGER NOT NULL DEFAULT 0,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS votos (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  stand_id   TEXT NOT NULL,
  emoji      TEXT NOT NULL CHECK (emoji IN ('bueno','regular','malo')),
  correo     TEXT NOT NULL,
  compra     INTEGER,
  texto      TEXT,
  ip_hash    TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (stand_id) REFERENCES stands(id) ON DELETE CASCADE,
  UNIQUE (stand_id, correo)
);
CREATE INDEX IF NOT EXISTS idx_votos_created_at ON votos(created_at);
CREATE INDEX IF NOT EXISTS idx_votos_stand ON votos(stand_id);

CREATE TABLE IF NOT EXISTS pasaportes (
  correo    TEXT PRIMARY KEY,
  nombre    TEXT,
  inicio    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  visitados TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS rate_limits (
  id           TEXT PRIMARY KEY,
  bucket       TEXT NOT NULL,
  hits         INTEGER NOT NULL DEFAULT 0,
  window_start INTEGER NOT NULL
);

-- Promotores de stands ------------------------------------------------------
-- Ciclo de vida: pendiente -> verificado -> activo, o rechazado / suspendido.
-- `password_hash` es NULL mientras el administrador no verifique la solicitud:
-- la clave temporal se genera y se envía por correo en ese momento.
CREATE TABLE IF NOT EXISTS promotores (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  email                TEXT NOT NULL UNIQUE,
  nombre               TEXT NOT NULL,
  documento            TEXT,
  telefono             TEXT,
  municipio            TEXT,
  empresa_tentativa    TEXT,
  mensaje              TEXT,
  estado               TEXT NOT NULL DEFAULT 'pendiente'
                       CHECK (estado IN ('pendiente','verificado','activo','rechazado','suspendido')),
  password_hash        TEXT,
  must_change_password INTEGER NOT NULL DEFAULT 1,
  password_expira_at   DATETIME,
  intentos_fallidos    INTEGER NOT NULL DEFAULT 0,
  bloqueado_hasta      DATETIME,
  ultimo_acceso        DATETIME,
  stand_id             TEXT REFERENCES stands(id) ON DELETE SET NULL,
  verificado_por       INTEGER,
  verificado_at        DATETIME,
  motivo               TEXT,
  acepta_datos         INTEGER NOT NULL DEFAULT 0,
  ip_hash              TEXT,
  created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_promotor_estado ON promotores(estado);

-- Empresa del promotor (una por promotor) -----------------------------------
CREATE TABLE IF NOT EXISTS empresas (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  promotor_id INTEGER NOT NULL UNIQUE REFERENCES promotores(id) ON DELETE CASCADE,
  nombre      TEXT NOT NULL,
  nit         TEXT,
  descripcion TEXT,
  municipio   TEXT,
  direccion   TEXT,
  telefono    TEXT,
  sitio_web   TEXT,
  logo_path   TEXT,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Productos del promotor ----------------------------------------------------
CREATE TABLE IF NOT EXISTS productos (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  promotor_id  INTEGER NOT NULL REFERENCES promotores(id) ON DELETE CASCADE,
  nombre       TEXT NOT NULL,
  variedad     TEXT,
  proceso      TEXT,
  altura_msnm  INTEGER,
  notas_cata   TEXT,
  presentacion TEXT,
  precio       REAL,
  descripcion  TEXT,
  foto_path    TEXT,
  publicado    INTEGER NOT NULL DEFAULT 1,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_producto_promotor ON productos(promotor_id);

-- Bitácora de correos salientes ---------------------------------------------
CREATE TABLE IF NOT EXISTS emails_log (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  destinatario TEXT NOT NULL,
  asunto       TEXT NOT NULL,
  tipo         TEXT NOT NULL,
  transporte   TEXT NOT NULL,
  estado       TEXT NOT NULL CHECK (estado IN ('enviado','fallido')),
  error        TEXT,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_email_created ON emails_log(created_at);
