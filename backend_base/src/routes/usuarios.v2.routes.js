const express = require("express");
const {
  getUsuarios,
  getUsuarioById,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} = require("../controllers/usuarios.v2.controller");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UsuarioV2:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *           example: 1
 *         username:
 *           type: string
 *           maxLength: 30
 *           example: ana28
 *         email:
 *           type: string
 *           format: email
 *           maxLength: 254
 *           example: ana@example.com
 *         role_id:
 *           type: integer
 *           example: 2
 *         is_active:
 *           type: boolean
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *       description: La respuesta nunca incluye la contraseña ni su hash.
 *     CrearUsuarioV2:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *         - role_id
 *       properties:
 *         username:
 *           type: string
 *           minLength: 1
 *           maxLength: 30
 *           example: ana28
 *         email:
 *           type: string
 *           format: email
 *           minLength: 1
 *           maxLength: 254
 *           example: ana@example.com
 *         password:
 *           type: string
 *           format: password
 *           minLength: 8
 *           maxLength: 72
 *           example: "ClaveSegura123"
 *         role_id:
 *           type: integer
 *           minimum: 1
 *           example: 2
 *     ActualizarUsuarioV2:
 *       type: object
 *       minProperties: 1
 *       properties:
 *         username:
 *           type: string
 *           minLength: 1
 *           maxLength: 30
 *         email:
 *           type: string
 *           format: email
 *           minLength: 1
 *           maxLength: 254
 *         password:
 *           type: string
 *           format: password
 *           minLength: 8
 *           maxLength: 72
 *         role_id:
 *           type: integer
 *           minimum: 1
 *         is_active:
 *           type: boolean
 *     RespuestaUsuarioV2:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *           example: Usuario creado exitosamente
 *         data:
 *           $ref: '#/components/schemas/UsuarioV2'
 *     RespuestaUsuariosV2:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 1
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/UsuarioV2'
 *     ErrorUsuarioV2:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: error
 *         message:
 *           type: string
 *           example: Usuario no encontrado
 */

/**
 * @swagger
 * /api/v2/usuarios:
 *   get:
 *     operationId: getUsuariosV2
 *     summary: Listar usuarios
 *     description: Devuelve los usuarios sin exponer contraseñas ni hashes.
 *     tags:
 *       - Usuarios v2
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespuestaUsuariosV2'
 *       500:
 *         description: Error interno al consultar los usuarios.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUsuarioV2'
 */
router.get("/", getUsuarios);

/**
 * @swagger
 * /api/v2/usuarios/{id}:
 *   get:
 *     operationId: getUsuarioByIdV2
 *     summary: Obtener usuario por ID
 *     tags:
 *       - Usuarios v2
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Identificador entero positivo del usuario.
 *         schema:
 *           type: integer
 *           format: int64
 *           minimum: 1
 *         example: 1
 *     responses:
 *       200:
 *         description: Usuario encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/UsuarioV2'
 *       400:
 *         description: El ID no es un entero positivo.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUsuarioV2'
 *       404:
 *         description: No existe un usuario con ese ID.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUsuarioV2'
 *       500:
 *         description: Error interno al consultar el usuario.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUsuarioV2'
 */
router.get("/:id", getUsuarioById);

/**
 * @swagger
 * /api/v2/usuarios:
 *   post:
 *     operationId: crearUsuarioV2
 *     summary: Crear usuario
 *     description: Crea un usuario y almacena la contraseña como hash bcrypt.
 *     tags:
 *       - Usuarios v2
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CrearUsuarioV2'
 *     responses:
 *       201:
 *         description: Usuario creado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespuestaUsuarioV2'
 *       400:
 *         description: Datos inválidos o rol inexistente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUsuarioV2'
 *       409:
 *         description: El username o email ya está registrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUsuarioV2'
 *       500:
 *         description: Error interno al crear el usuario.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUsuarioV2'
 */
router.post("/", crearUsuario);

/**
 * @swagger
 * /api/v2/usuarios/{id}:
 *   put:
 *     operationId: actualizarUsuarioV2
 *     summary: Actualizar usuario
 *     description: Actualiza parcialmente los campos enviados. Debe enviarse al menos uno.
 *     tags:
 *       - Usuarios v2
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Identificador entero positivo del usuario.
 *         schema:
 *           type: integer
 *           format: int64
 *           minimum: 1
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActualizarUsuarioV2'
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespuestaUsuarioV2'
 *       400:
 *         description: ID o datos enviados no válidos; también puede indicar un rol inexistente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUsuarioV2'
 *       404:
 *         description: No existe un usuario con ese ID.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUsuarioV2'
 *       409:
 *         description: El username o email ya está registrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUsuarioV2'
 *       500:
 *         description: Error interno al actualizar el usuario.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUsuarioV2'
 */
router.put("/:id", actualizarUsuario);

/**
 * @swagger
 * /api/v2/usuarios/{id}:
 *   delete:
 *     operationId: eliminarUsuarioV2
 *     summary: Eliminar usuario
 *     description: El usuario no se elimina si tiene un empleado asociado.
 *     tags:
 *       - Usuarios v2
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Identificador entero positivo del usuario.
 *         schema:
 *           type: integer
 *           format: int64
 *           minimum: 1
 *         example: 1
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespuestaUsuarioV2'
 *       400:
 *         description: El ID no es un entero positivo.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUsuarioV2'
 *       404:
 *         description: No existe un usuario con ese ID.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUsuarioV2'
 *       409:
 *         description: El usuario tiene un empleado asociado y no se puede eliminar.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUsuarioV2'
 *       500:
 *         description: Error interno al eliminar el usuario.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUsuarioV2'
 */
router.delete("/:id", eliminarUsuario);

module.exports = router;
