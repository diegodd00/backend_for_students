const db = require("../database/postgres.database");

const EMPLOYEE_COLUMNS =
  "id, user_id, first_name, last_name, phone, address, job_title, hired_at, is_active, created_at, updated_at";
const ALLOWED_FIELDS = new Set([
  "user_id",
  "first_name",
  "last_name",
  "phone",
  "address",
  "job_title",
  "hired_at",
  "is_active",
]);
const NULLABLE_STRING_FIELDS = new Set(["phone", "address", "job_title"]);
const MAX_BIGINT = 9223372036854775807n;

function parseId(value) {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return null;
  if (value.length > 19) return null;
  return BigInt(value) <= MAX_BIGINT ? value : null;
}

function isPositiveId(value) {
  if (typeof value === "number") {
    return Number.isSafeInteger(value) && value > 0;
  }
  return (
    typeof value === "string" &&
    /^[1-9]\d*$/.test(value) &&
    value.length <= 19 &&
    BigInt(value) <= MAX_BIGINT
  );
}

function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  if (value.startsWith("0000-")) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validateEmployee(body, { creating = false } = {}) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "El cuerpo de la solicitud debe ser un objeto JSON";
  }

  const keys = Object.keys(body);
  const unknownFields = keys.filter((key) => !ALLOWED_FIELDS.has(key));
  if (unknownFields.length) {
    return `Campos no permitidos: ${unknownFields.join(", ")}`;
  }
  if (
    creating &&
    ["user_id", "first_name", "last_name"].some(
      (key) => !Object.prototype.hasOwnProperty.call(body, key)
    )
  ) {
    return "user_id, first_name y last_name son obligatorios";
  }
  if (!creating && keys.length === 0) {
    return "Debe enviar al menos un campo para actualizar";
  }
  if (
    Object.prototype.hasOwnProperty.call(body, "user_id") &&
    !isPositiveId(body.user_id)
  ) {
    return "user_id debe ser un entero positivo";
  }
  for (const [field, maxLength] of [
    ["first_name", 100],
    ["last_name", 100],
    ["phone", 20],
    ["job_title", 60],
  ]) {
    if (!Object.prototype.hasOwnProperty.call(body, field)) continue;
    const value = body[field];
    if (NULLABLE_STRING_FIELDS.has(field) && value === null) continue;
    if (typeof value !== "string" || !value.trim()) {
      return `${field} debe ser una cadena no vacía${NULLABLE_STRING_FIELDS.has(field) ? " o null" : ""}`;
    }
    if (value.trim().length > maxLength) {
      return `${field} no puede exceder ${maxLength} caracteres`;
    }
  }
  if (
    Object.prototype.hasOwnProperty.call(body, "address") &&
    body.address !== null &&
    typeof body.address !== "string"
  ) {
    return "address debe ser una cadena o null";
  }
  if (
    Object.prototype.hasOwnProperty.call(body, "hired_at") &&
    !isValidDate(body.hired_at)
  ) {
    return "hired_at debe ser una fecha válida con formato YYYY-MM-DD";
  }
  if (
    Object.prototype.hasOwnProperty.call(body, "is_active") &&
    typeof body.is_active !== "boolean"
  ) {
    return "is_active debe ser booleano";
  }

  return null;
}

function handleDatabaseError(res, error) {
  if (error.code === "23505") {
    return res.status(409).json({
      status: "error",
      message: "Ya existe un empleado asociado a ese usuario",
    });
  }
  if (error.code === "23503") {
    return res.status(400).json({
      status: "error",
      message: "user_id no corresponde a un usuario existente",
    });
  }

  console.error("Error en el CRUD de empleados:", error);
  return res.status(500).json({
    status: "error",
    message: "Error interno al procesar la solicitud",
  });
}

async function getEmployees(req, res) {
  try {
    const { rows } = await db.query(
      `SELECT ${EMPLOYEE_COLUMNS} FROM employees ORDER BY id`
    );
    return res.json({ total: rows.length, data: rows });
  } catch (error) {
    return handleDatabaseError(res, error);
  }
}

async function getEmployeeById(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({
      status: "error",
      message: "El id debe ser un entero positivo",
    });
  }

  try {
    const { rows } = await db.query(
      `SELECT ${EMPLOYEE_COLUMNS} FROM employees WHERE id = $1`,
      [id]
    );
    if (!rows[0]) {
      return res.status(404).json({
        status: "error",
        message: `Empleado con id ${id} no encontrado`,
      });
    }
    return res.json({ data: rows[0] });
  } catch (error) {
    return handleDatabaseError(res, error);
  }
}

async function createEmployee(req, res) {
  const validationError = validateEmployee(req.body, { creating: true });
  if (validationError) {
    return res.status(400).json({ status: "error", message: validationError });
  }

  const fields = [
    "user_id",
    "first_name",
    "last_name",
    "phone",
    "address",
    "job_title",
    "hired_at",
    "is_active",
  ];
  const values = fields
    .filter((field) => Object.prototype.hasOwnProperty.call(req.body, field))
    .map((field) => {
      const value = req.body[field];
      return typeof value === "string" && field !== "hired_at"
        ? value.trim()
        : value;
    });
  const columns = fields.filter((field) =>
    Object.prototype.hasOwnProperty.call(req.body, field)
  );
  const placeholders = values.map((_, index) => `$${index + 1}`);

  try {
    const { rows } = await db.query(
      `INSERT INTO employees (${columns.join(", ")})
       VALUES (${placeholders.join(", ")})
       RETURNING ${EMPLOYEE_COLUMNS}`,
      values
    );
    return res.status(201).json({
      status: "success",
      message: "Empleado creado exitosamente",
      data: rows[0],
    });
  } catch (error) {
    return handleDatabaseError(res, error);
  }
}

async function updateEmployee(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({
      status: "error",
      message: "El id debe ser un entero positivo",
    });
  }

  const validationError = validateEmployee(req.body);
  if (validationError) {
    return res.status(400).json({ status: "error", message: validationError });
  }

  try {
    const values = [];
    const assignments = [];
    for (const field of ALLOWED_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        let value = req.body[field];
        if (typeof value === "string" && field !== "hired_at") {
          value = value.trim();
        }
        values.push(value);
        assignments.push(`${field} = $${values.length}`);
      }
    }
    values.push(id);

    const { rows } = await db.query(
      `UPDATE employees SET ${assignments.join(", ")}
       WHERE id = $${values.length}
       RETURNING ${EMPLOYEE_COLUMNS}`,
      values
    );
    if (!rows[0]) {
      return res.status(404).json({
        status: "error",
        message: `Empleado con id ${id} no encontrado`,
      });
    }
    return res.json({
      status: "success",
      message: "Empleado actualizado exitosamente",
      data: rows[0],
    });
  } catch (error) {
    return handleDatabaseError(res, error);
  }
}

async function deleteEmployee(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({
      status: "error",
      message: "El id debe ser un entero positivo",
    });
  }

  try {
    const { rows } = await db.query(
      `DELETE FROM employees WHERE id = $1 RETURNING ${EMPLOYEE_COLUMNS}`,
      [id]
    );
    if (!rows[0]) {
      return res.status(404).json({
        status: "error",
        message: `Empleado con id ${id} no encontrado`,
      });
    }
    return res.json({
      status: "success",
      message: "Empleado eliminado exitosamente",
      data: rows[0],
    });
  } catch (error) {
    return handleDatabaseError(res, error);
  }
}

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};