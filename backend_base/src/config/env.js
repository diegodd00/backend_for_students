//Importamos la librería dotenv para poder leer las variables de entorno desde un archivo .env
require("dotenv").config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 3000,
  URL_DB: process.env.URL_DB,
  dbSsl: process.env.DB_SSL !== "false",
  serviceName:
    process.env.SERVICE_NAME || "First Microservice - Backend for Students",
};

//Funcion que exportamos para poder usar las variables de entorno en otros archivos
module.exports = env;
