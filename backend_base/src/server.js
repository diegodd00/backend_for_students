const app = require("./app");
const env = require("./config/env");
const db = require("./database/postgres.database");

const db_test = async () => {
  try {
    await db.probarConexion();
  } catch (error) {
    console.error("Error al probar la conexión a la base de datos:", error);
  }
};

const server = app.listen(env.port, () => {
  console.log(
    `[${env.serviceName}] listening on port ${env.port}`
  );
});

db_test();

function shutdown(signal) {
  console.log(`Received ${signal}. Closing server...`);

  server.close(async (error) => {
    if (error) {
      console.error("Error closing server:", error);
      process.exitCode = 1;
      return;
    }

    try {
      await db.cerrarConexion();
      process.exitCode = 0;
    } catch (closeError) {
      console.error("Error closing PostgreSQL connection:", closeError);
      process.exitCode = 1;
    }
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
