const db = require("../database/postgres.database");

const ROLE_COLUMNS = "id, name, description";
const ALLOWED_FIELDS = new Set(["name", "description"]);

function parseId(value) {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return null;
  if (value.length > 5) return null;
  return BigInt(value) <= 32767n ? value : null;
}

function validateRole(body, { creating = false } = {}) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "El cuerpo de la solicitud debe ser un objeto JSON";
  }

  const keys = Object.keys(body);
  const unknownFields = keys.filter((key) => !ALLOWED_FIELDS.has(key));
  if (unknownFields.length) {
    return `Campos no permitidos: ${unknownFields.join(", ")}`;
  }
  if (creating && !Object.prototype.hasOwnProperty.call(body, "name")) {
    return "name es obligatorio";
  }
  if (!creating && keys.length === 0) {
    return "Debe enviar al menos un campo para actualizar";
  }
  if (Object.prototype.hasOwnProperty.call(body, "name")) {
    if (typeof body.name !== "string" || !body.name.trim()) {
      return "name debe ser una cadena no vacía";
    }
    if (body.name.trim().length > 30) {
      return "name no puede exceder 30 caracteres";
    }
  }
  if (
    Object.prototype.hasOwnProperty.call(body, "description") &&
    body.description !== null &&
    typeof body.description !== "string"
  ) {
    return "description debe ser una cadena o null";
  }

  return null;
}

function handleDatabaseError(res, error) {
  if (error.code === "23505") {
    return res.status(409).json({
      status: "error",
      message: "Ya existe un rol con ese nombre",
    });
  }
  if (error.code === "23503") {
    return res.status(409).json({
      status: "error",
      message: "No se puede eliminar el rol porque hay usuarios asociados",
    });
  }

  console.error("Error en el CRUD de roles:", error);
  return res.status(500).json({
    status: "error",
    message: "Error interno al procesar la solicitud",
  });
}

async function getRoles(req, res) {
  try {
    const { rows } = await db.query(
      `SELECT ${ROLE_COLUMNS} FROM roles ORDER BY id`
    );
    return res.json({ total: rows.length, data: rows });
  } catch (error) {
    return handleDatabaseError(res, error);
  }
}

async function getRoleById(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({
      status: "error",
      message: "El id debe ser un entero positivo",
    });
  }

  try {
    const { rows } = await db.query(
      `SELECT ${ROLE_COLUMNS} FROM roles WHERE id = $1`,
      [id]
    );
    if (!rows[0]) {
      return res.status(404).json({
        status: "error",
        message: `Rol con id ${id} no encontrado`,
      });
    }
    return res.json({ data: rows[0] });
  } catch (error) {
    return handleDatabaseError(res, error);
  }
}

async function createRole(req, res) {
  const validationError = validateRole(req.body, { creating: true });
  if (validationError) {
    return res.status(400).json({ status: "error", message: validationError });
  }

  try {
    const { rows } = await db.query(
      `INSERT INTO roles (name, description)
       VALUES ($1, $2)
       RETURNING ${ROLE_COLUMNS}`,
      [req.body.name.trim(), req.body.description ?? null]
    );
    return res.status(201).json({
      status: "success",
      message: "Rol creado exitosamente",
      data: rows[0],
    });
  } catch (error) {
    return handleDatabaseError(res, error);
  }
}

async function updateRole(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({
      status: "error",
      message: "El id debe ser un entero positivo",
    });
  }

  const validationError = validateRole(req.body);
  if (validationError) {
    return res.status(400).json({ status: "error", message: validationError });
  }

  try {
    const values = [];
    const assignments = [];
    for (const field of ["name", "description"]) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        values.push(
          field === "name" ? req.body[field].trim() : req.body[field]
        );
        assignments.push(`${field} = $${values.length}`);
      }
    }
    values.push(id);

    const { rows } = await db.query(
      `UPDATE roles SET ${assignments.join(", ")}
       WHERE id = $${values.length}
       RETURNING ${ROLE_COLUMNS}`,
      values
    );
    if (!rows[0]) {
      return res.status(404).json({
        status: "error",
        message: `Rol con id ${id} no encontrado`,
      });
    }
    return res.json({
      status: "success",
      message: "Rol actualizado exitosamente",
      data: rows[0],
    });
  } catch (error) {
    return handleDatabaseError(res, error);
  }
}

async function deleteRole(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({
      status: "error",
      message: "El id debe ser un entero positivo",
    });
  }

  try {
    const { rows } = await db.query(
      `DELETE FROM roles WHERE id = $1 RETURNING ${ROLE_COLUMNS}`,
      [id]
    );
    if (!rows[0]) {
      return res.status(404).json({
        status: "error",
        message: `Rol con id ${id} no encontrado`,
      });
    }
    return res.json({
      status: "success",
      message: "Rol eliminado exitosamente",
      data: rows[0],
    });
  } catch (error) {
    return handleDatabaseError(res, error);
  }
}

module.exports = {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
};