const express = require("express");
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employee.controller");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     EmployeeV2:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *           example: 10
 *         user_id:
 *           type: integer
 *           format: int64
 *           example: 5
 *         first_name:
 *           type: string
 *           maxLength: 100
 *           example: Ana
 *         last_name:
 *           type: string
 *           maxLength: 100
 *           example: González
 *         phone:
 *           type: string
 *           maxLength: 20
 *           nullable: true
 *           example: "5551234567"
 *         address:
 *           type: string
 *           nullable: true
 *           example: Calle Principal 123
 *         job_title:
 *           type: string
 *           maxLength: 60
 *           nullable: true
 *           example: Gerente
 *         hired_at:
 *           type: string
 *           format: date
 *           example: "2026-01-15"
 *         is_active:
 *           type: boolean
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     CrearEmployeeV2:
 *       type: object
 *       required:
 *         - user_id
 *         - first_name
 *         - last_name
 *       properties:
 *         user_id:
 *           type: integer
 *           format: int64
 *           minimum: 1
 *           description: Usuario existente al que se asociará el empleado. Un usuario solo puede tener un empleado.
 *           example: 5
 *         first_name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *         last_name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *         phone:
 *           type: string
 *           maxLength: 20
 *           nullable: true
 *         address:
 *           type: string
 *           nullable: true
 *         job_title:
 *           type: string
 *           maxLength: 60
 *           nullable: true
 *         hired_at:
 *           type: string
 *           format: date
 *           description: Si se omite, la base de datos usa la fecha actual.
 *         is_active:
 *           type: boolean
 *           description: Si se omite, la base de datos usa true.
 *     ActualizarEmployeeV2:
 *       type: object
 *       minProperties: 1
 *       properties:
 *         user_id:
 *           type: integer
 *           format: int64
 *           minimum: 1
 *         first_name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *         last_name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *         phone:
 *           type: string
 *           maxLength: 20
 *           nullable: true
 *         address:
 *           type: string
 *           nullable: true
 *         job_title:
 *           type: string
 *           maxLength: 60
 *           nullable: true
 *         hired_at:
 *           type: string
 *           format: date
 *         is_active:
 *           type: boolean
 *     RespuestaEmployeeV2:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *           example: Empleado creado exitosamente
 *         data:
 *           $ref: '#/components/schemas/EmployeeV2'
 *     RespuestaEmployeesV2:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 1
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EmployeeV2'
 *     ErrorEmployeeV2:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: error
 *         message:
 *           type: string
 *           example: Empleado no encontrado
 */

/**
 * @swagger
 * /api/v2/employees:
 *   get:
 *     operationId: getEmployees
 *     summary: Listar empleados
 *     tags:
 *       - Employees
 *     responses:
 *       200:
 *         description: Lista de empleados.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespuestaEmployeesV2'
 *       500:
 *         description: Error interno al consultar empleados.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEmployeeV2'
 */
router.get("/", getEmployees);

/**
 * @swagger
 * /api/v2/employees/{id}:
 *   get:
 *     operationId: getEmployeeById
 *     summary: Obtener empleado por ID
 *     tags:
 *       - Employees
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           format: int64
 *           minimum: 1
 *         example: 10
 *     responses:
 *       200:
 *         description: Empleado encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/EmployeeV2'
 *       400:
 *         description: ID no válido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEmployeeV2'
 *       404:
 *         description: Empleado no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEmployeeV2'
 *       500:
 *         description: Error interno al consultar el empleado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEmployeeV2'
 */
router.get("/:id", getEmployeeById);

/**
 * @swagger
 * /api/v2/employees:
 *   post:
 *     operationId: createEmployee
 *     summary: Crear empleado
 *     description: Asocia un empleado con un usuario existente. Cada usuario puede tener un solo empleado.
 *     tags:
 *       - Employees
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CrearEmployeeV2'
 *     responses:
 *       201:
 *         description: Empleado creado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespuestaEmployeeV2'
 *       400:
 *         description: Datos no válidos o el usuario indicado no existe.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEmployeeV2'
 *       409:
 *         description: El usuario ya tiene un empleado asociado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEmployeeV2'
 *       500:
 *         description: Error interno al crear el empleado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEmployeeV2'
 */
router.post("/", createEmployee);

/**
 * @swagger
 * /api/v2/employees/{id}:
 *   put:
 *     operationId: updateEmployee
 *     summary: Actualizar empleado
 *     description: Actualiza parcialmente los campos enviados.
 *     tags:
 *       - Employees
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           format: int64
 *           minimum: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActualizarEmployeeV2'
 *     responses:
 *       200:
 *         description: Empleado actualizado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespuestaEmployeeV2'
 *       400:
 *         description: ID o datos no válidos; también puede indicar que el usuario no existe.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEmployeeV2'
 *       404:
 *         description: Empleado no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEmployeeV2'
 *       409:
 *         description: El usuario ya está asociado a otro empleado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEmployeeV2'
 *       500:
 *         description: Error interno al actualizar el empleado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEmployeeV2'
 */
router.put("/:id", updateEmployee);

/**
 * @swagger
 * /api/v2/employees/{id}:
 *   delete:
 *     operationId: deleteEmployee
 *     summary: Eliminar empleado
 *     description: Elimina el registro del empleado, pero no elimina el usuario asociado.
 *     tags:
 *       - Employees
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           format: int64
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Empleado eliminado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespuestaEmployeeV2'
 *       400:
 *         description: ID no válido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEmployeeV2'
 *       404:
 *         description: Empleado no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEmployeeV2'
 *       500:
 *         description: Error interno al eliminar el empleado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorEmployeeV2'
 */
router.delete("/:id", deleteEmployee);

module.exports = router;