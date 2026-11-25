const { Pool } = require("pg");
const env = require("../config/env");

const pool = new Pool({
  connectionString: env.URL_DB,
  ssl: env.dbSsl
  ? {
      ca: require("fs").readFileSync(
        require("path").join(__dirname, "../../certs/supabase-prod-ca.crt"),
        "utf8"
      ),
      rejectUnauthorized: true,
    }
  : false,
});

let closePromise;
let connectionStarted = false;

function validarUrlDb() {
  if (!env.URL_DB) {
    throw new Error("Falta configurar URL_DB en el archivo .env");
  }
}

function query(...args) {
  validarUrlDb();
  connectionStarted = true;
  return pool.query(...args);
}

function connect(...args) {
  validarUrlDb();
  connectionStarted = true;
  return pool.connect(...args);
}

async function conectar() {
  await query("SELECT 1");
}

async function probarConexion() {
  const resultado = await query("SELECT NOW() AS fecha");
  console.log("Conexión a PostgreSQL exitosa:", resultado.rows[0].fecha);
}

async function cerrarConexion() {
  if (connectionStarted && !closePromise) {
    closePromise = pool.end();
  }
  await closePromise;
}

pool.on("error", (error) => {
  console.error("Error inesperado en el pool de PostgreSQL:", error);
});

module.exports = {
  pool,
  client: pool,
  query,
  connect,
  conectar,
  probarConexion,
  cerrarConexion,
};
