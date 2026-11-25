//Librerias necesarias para crear la API
const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const env = require("./config/env");

//Archivos de rutas para los endpoints de la API
const healthRoutes = require("./routes/health.routes");
const userRoutes = require("./routes/usuarios.routes");
const userV2Routes = require("./routes/usuarios.v2.routes");
const rolesRoutes = require("./routes/roles.routes");
const employeeRoutes = require("./routes/employee.routes");

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentación',
      version: '1.0.0',
      description: 'Documentación de mi API en Express',
    },
    servers: [
      {
        url: `http://localhost:${env.port || 3000}`,
        description: 'Servidor Local'
      },
    ],
  },
  // Rutas donde Swagger buscará los comentarios JSDoc
  // Asegúrate de que las rutas coincidan con la estructura de tu proyecto
  apis: [
    path.join(__dirname, "routes", "*.js").split(path.sep).join("/"),
    path.join(__dirname, "app.js").split(path.sep).join("/"),
    path.join(__dirname, "server.js").split(path.sep).join("/"),
  ],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
// Montar la interfaz de Swagger en /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

//Ruta de prueba para verificar que la API está funcionando correctamente
app.use("/api/v1/health", healthRoutes);

//Especificamos la ruta para los endpoints de usuarios
app.use("/api/v1/usuarios", userRoutes);
app.use("/api/v2/usuarios", userV2Routes);
app.use("/api/v2/roles", rolesRoutes);
app.use("/api/v2/employees", employeeRoutes);

//Manejamos los errores 404 para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: "NOT_FOUND",
    message: "Endpoint not found",
  });
});

module.exports = app;
