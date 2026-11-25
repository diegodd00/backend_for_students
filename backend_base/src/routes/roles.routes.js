const express = require("express");
const {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} = require("../controllers/role.controller");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     RoleV2:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           maxLength: 30
 *           example: manager
 *         description:
 *           type: string
 *           nullable: true
 *           example: Manages employees and products
 *     CrearRoleV2:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 30
 *           example: manager
 *         description:
 *           type: string
 *           nullable: true
 *           example: Manages employees and products
 *     ActualizarRoleV2:
 *       type: object
 *       minProperties: 1
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 30
 *         description:
 *           type: string
 *           nullable: true
 *     RespuestaRoleV2:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *           example: Rol creado exitosamente
 *         data:
 *           $ref: '#/components/schemas/RoleV2'
 *     RespuestaRolesV2:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 1
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/RoleV2'
 *     ErrorRoleV2:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: error
 *         message:
 *           type: string
 *           example: Rol no encontrado
 */

/**
 * @swagger
 * /api/v2/roles:
 *   get:
 *     operationId: getRoles
 *     summary: Listar roles
 *     tags:
 *       - Roles
 *     responses:
 *       200:
 *         description: Lista de roles.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespuestaRolesV2'
 *       500:
 *         description: Error interno al consultar roles.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorRoleV2'
 */
router.get("/", getRoles);

/**
 * @swagger
 * /api/v2/roles/{id}:
 *   get:
 *     operationId: getRoleById
 *     summary: Obtener rol por ID
 *     tags:
 *       - Roles
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Identificador entero positivo del rol.
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 1
 *     responses:
 *       200:
 *         description: Rol encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/RoleV2'
 *       400:
 *         description: ID no válido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorRoleV2'
 *       404:
 *         description: Rol no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorRoleV2'
 *       500:
 *         description: Error interno al consultar el rol.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorRoleV2'
 */
router.get("/:id", getRoleById);

/**
 * @swagger
 * /api/v2/roles:
 *   post:
 *     operationId: createRole
 *     summary: Crear rol
 *     tags:
 *       - Roles
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CrearRoleV2'
 *     responses:
 *       201:
 *         description: Rol creado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespuestaRoleV2'
 *       400:
 *         description: Datos de entrada no válidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorRoleV2'
 *       409:
 *         description: Ya existe un rol con ese nombre.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorRoleV2'
 *       500:
 *         description: Error interno al crear el rol.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorRoleV2'
 */
router.post("/", createRole);

/**
 * @swagger
 * /api/v2/roles/{id}:
 *   put:
 *     operationId: updateRole
 *     summary: Actualizar rol
 *     description: Actualiza parcialmente el nombre o la descripción.
 *     tags:
 *       - Roles
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActualizarRoleV2'
 *     responses:
 *       200:
 *         description: Rol actualizado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespuestaRoleV2'
 *       400:
 *         description: ID o datos no válidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorRoleV2'
 *       404:
 *         description: Rol no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorRoleV2'
 *       409:
 *         description: Ya existe un rol con ese nombre.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorRoleV2'
 *       500:
 *         description: Error interno al actualizar el rol.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorRoleV2'
 */
router.put("/:id", updateRole);

/**
 * @swagger
 * /api/v2/roles/{id}:
 *   delete:
 *     operationId: deleteRole
 *     summary: Eliminar rol
 *     description: No se puede eliminar un rol que tenga usuarios asociados.
 *     tags:
 *       - Roles
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Rol eliminado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespuestaRoleV2'
 *       400:
 *         description: ID no válido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorRoleV2'
 *       404:
 *         description: Rol no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorRoleV2'
 *       409:
 *         description: Hay usuarios asociados al rol.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorRoleV2'
 *       500:
 *         description: Error interno al eliminar el rol.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorRoleV2'
 */
router.delete("/:id", deleteRole);

module.exports = router;