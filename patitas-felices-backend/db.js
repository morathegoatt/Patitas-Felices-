require('dotenv').config();
const { Pool } = require('pg');

/**
 * Configuración del Pool de conexiones a PostgreSQL.
 * Utiliza variables de entorno para mantener las credenciales seguras.
 */
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false // Requerido para conexiones externas seguras (Render -> Supabase)
  }
});

// Listener para errores inesperados en clientes inactivos del pool
pool.on('error', (err, client) => {
  console.error('Error crítico en el pool de conexiones de PostgreSQL', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool, // Exportamos la instancia directa para transacciones complejas (BEGIN/COMMIT)
};