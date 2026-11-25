# backend_for_students
Este repositorio es creado con la base minima de un microservicio con NodeJS y Express 

TENDREMOS LA SIGUIENTE DISTRIBUCIÓN DE CARPETAS DENTRO DEL PROYECTO,
RECORDAR LO VISTO EN CLASE EN DONDE CADA CARPETA NOS AYUDA A TENER UN ORDEN EN NUESTROS ARCHIVOS.

├── src/
│   ├── config/  **configuraciones del servidor
│   │   └── env.js
│   ├── controllers/
│   ├── middlewares/
│   ├── routes/
│   │   └── health.routes.js  **rutas definidas
│   ├── services/
│   ├── app.js
│   └── server.js
├── tests/
├── .env
├── .env.example
├── .gitignore
└── package.json

Utilizaremos los siguientes dependencias
-> Express
-> cors
-> helmet
-> dotenv

y dependencias de desarrollo como lo son
-> nodemon

## Conexión a PostgreSQL

La conexión se configura mediante `URL_DB` en el archivo `.env`. Copia `.env.example`
a `.env` y reemplaza el usuario, contraseña, host, puerto y nombre de la base de datos
por los de tu instalación de PostgreSQL. No compartas ni subas el archivo `.env`.

Para Render, usa la **External Database URL** que aparece en el menú **Connect** de la
base de datos; la URL interna solo funciona desde servicios Render en la misma región.
La conexión usa TLS por defecto (`DB_SSL=true`). Para una base local que no tenga SSL,
configura `DB_SSL=false`.

La aplicación prueba la conexión al iniciar y la cierra al recibir `SIGINT` o
`SIGTERM`. El módulo `src/database/postgres.database.js` exporta `client` para ejecutar
consultas; usa parámetros (`$1`, `$2`, ...) en lugar de concatenar valores en SQL.
