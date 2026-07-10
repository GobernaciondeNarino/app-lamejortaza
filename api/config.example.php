<?php
defined('LMT_GUARD') || exit('forbidden');
// api/config.example.php
// Copia a `config.php` y rellena los valores. `config.php` está en .gitignore.

return [
    // Base de datos: MySQL/MariaDB recomendado en producción.
    // Para desarrollo rápido puedes usar SQLite con DSN sqlite:/ruta/db.sqlite
    'db' => [
        'dsn'      => 'mysql:host=127.0.0.1;dbname=la_mejor_taza;charset=utf8mb4',
        'user'     => 'lmt_app',
        'password' => 'CAMBIAR_EN_PRODUCCION',
        // Para SQLite descomentar y comentar las anteriores:
        // 'dsn'      => 'sqlite:' . __DIR__ . '/../db/la-mejor-taza.sqlite',
        // 'user'     => null,
        // 'password' => null,
    ],

    // Pimienta para hashes adicionales (NUNCA cambiar en caliente sin migrar).
    // Genera con: php -r "echo bin2hex(random_bytes(32));"
    'pepper' => 'CAMBIAR_POR_64_HEX_CARACTERES',

    // Secret para HMAC de tokens y CSRF cuando no hay sesión.
    'app_secret' => 'CAMBIAR_POR_64_HEX_CARACTERES',

    // Cookie / sesión.
    'session' => [
        'name'     => 'lmt_sid',
        'lifetime' => 60 * 60 * 8,   // 8 horas
        'secure'   => true,           // requiere HTTPS en producción
        'samesite' => 'Strict',
        'path'     => '/',
        'domain'   => '',             // dejar vacío = host actual
    ],

    // Origen permitido (para chequeo de Origin/Referer en POST/PUT/DELETE).
    // Lista blanca; usa el dominio real en producción.
    'allowed_origins' => [
        'https://lamejortaza.co',
        'http://localhost:8000',
        'http://127.0.0.1:8000',
    ],

    // URL pública base del sitio, usada por api/qr/{id}.png para el enlace del
    // QR ({base}/s/{id}).
    // RECOMENDADO: déjalo VACÍO. Así se deriva automáticamente del request e
    // incluye el subdirectorio donde vive la app (p. ej. /lamejortaza), igual
    // que el frontend. Si lo defines, DEBE ser la URL completa CON subdirectorio
    // (p. ej. 'https://tic.narino.gov.co/lamejortaza'), sin barra final.
    'public_base_url' => '',

    // Rate limits por IP (segundos / max hits).
    'rate_limits' => [
        'login'      => ['window' => 600, 'max' => 5],   // 5 intentos / 10 min
        'vote'       => ['window' => 60,  'max' => 1],   // 1 voto / min / IP / stand
        'vote_email' => ['window' => 600, 'max' => 12],  // 12 votos / 10 min / correo
        'pasaporte'  => ['window' => 60,  'max' => 20],  // 20 consultas / min / IP (anti-enumeración)
        'registro'   => ['window' => 3600,'max' => 5],   // 5 registros de expositor / hora / IP
        'global'     => ['window' => 60,  'max' => 120], // anti-flood
    ],

    // Token para el endpoint de diagnóstico api/diag.php. Déjalo vacío para
    // MANTENER DIAG CERRADO en producción (recomendado). Para diagnosticar,
    // pon aquí un valor secreto y llama a: api/diag.php?token=EL_TOKEN
    // Genera con: php -r "echo bin2hex(random_bytes(16));"
    'diag_token' => '',

    // Forzar HTTPS (envía 301 a https://). Apaga si haces dev local sin TLS.
    'force_https' => false,

    // Modo debug (NUNCA true en producción).
    'debug' => false,
];
