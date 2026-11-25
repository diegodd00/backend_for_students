const bcrypt = require("bcrypt");
const db = require("../database/postgres.database");

const USER_COLUMNS =
  "id, username, email, role_id, is_active, created_at, updated_at";
const ALLOWED_FIELDS = new Set([
  "username",
  "email",
  "password",
  "role_id",
  "is_active",
]);

function parseId(value) {
  return typeof value === "string" && /^[1-9]\d*$/.test(value)
    ? value
    : null;
}

function handleDatabaseError(res, error) {
  if (error.code === "23505") {
    return res.status(409).json({
      status: "error",
      message: "El username o email ya está registrado",
    });
  }
  if (error.code === "23503") {
    return res.status(400).json({
      status: "error",
      message: "El role_id no corresponde a un rol existente",
    });
  }

  console.error("Error en el CRUD de usuarios:", error);
  return res.status(500).json({
    status: "error",
    message: "Error interno al procesar la solicitud",
  });
}

function validateUserFields(body, { creating = false } = {}) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "El cuerpo de la solicitud debe ser un objeto JSON";
  }

  const keys = Object.keys(body);
  const unknownFields = keys.filter((key) => !ALLOWED_FIELDS.has(key));
  if (unknownFields.length) {
    return `Campos no permitidos: ${unknownFields.join(", ")}`;
  }
  if (creating && ["username", "email", "password", "role_id"].some(
    (key) => !Object.prototype.hasOwnProperty.call(body, key)
  )) {
    return "username, email, password y role_id son obligatorios";
  }
  if (!creating && keys.length === 0) {
    return "Debe enviar al menos un campo para actualizar";
  }

  for (const key of ["username", "email", "password"]) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      if (typeof body[key] !== "string" || body[key].trim() === "") {
        return `${key} debe ser una cadena no vacía`;
      }
    }
  }
  if (body.username && body.username.trim().length > 30) {
    return "username no puede exceder 30 caracteres";
  }
  if (body.email && body.email.trim().length > 254) {
    return "email no puede exceder 254 caracteres";
  }
  if (
    body.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())
  ) {
    return "email no tiene un formato válido";
  }
  if (Object.prototype.hasOwnProperty.call(body, "password")) {
    if (body.password.length < 8) {
      return "password debe tener al menos 8 caracteres";
    }
    if (Buffer.byteLength(body.password, "utf8") > 72) {
      return "password no puede exceder 72 bytes";
    }
  }
  if (Object.prototype.hasOwnProperty.call(body, "role_id")) {
    if (!Number.isSafeInteger(body.role_id) || body.role_id < 1) {
      return "role_id debe ser un entero positivo";
    }
  }
  if (
    Object.prototype.hasOwnProperty.call(body, "is_active") &&
    typeof body.is_active !== "boolean"
  ) {
    return "is_active debe ser booleano";
  }

  return null;
}

async function getUsuarios(req, res) {
  try {
    const { rows } = await db.query(
      `SELECT ${USER_COLUMNS} FROM users ORDER BY id`
    );
    return res.json({ total: rows.length, data: rows });
  } catch (error) {
    return handleDatabaseError(res, error);
  }
}

async function getUsuarioById(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({
      status: "error",
      message: "El id debe ser un entero positivo",
    });
  }

  try {
    const { rows } = await db.query(
      `SELECT ${USER_COLUMNS} FROM users WHERE id = $1`,
      [id]
    );
    if (!rows[0]) {
      return res.status(404).json({
        status: "error",
        message: `Usuario con id ${id} no encontrado`,
      });
    }
    return res.json({ data: rows[0] });
  } catch (error) {
    return handleDatabaseError(res, error);
  }
}

async function crearUsuario(req, res) {
  const validationError = validateUserFields(req.body, { creating: true });
  if (validationError) {
    return res.status(400).json({ status: "error", message: validationError });
  }

  try {
    const passwordHash = await bcrypt.hash(req.body.password, 12);
    const { rows } = await db.query(
      `INSERT INTO users (username, email, password_hash, role_id)
       VALUES ($1, $2, $3, $4)
       RETURNING ${USER_COLUMNS}`,
      [
        req.body.username.trim(),
        req.body.email.trim(),
        passwordHash,
        req.body.role_id,
      ]
    );
    return res.status(201).json({
      status: "success",
      message: "Usuario creado exitosamente",
      data: rows[0],
    });
  } catch (error) {
    return handleDatabaseError(res, error);
  }
}

async function actualizarUsuario(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({
      status: "error",
      message: "El id debe ser un entero positivo",
    });
  }

  const validationError = validateUserFields(req.body);
  if (validationError) {
    return res.status(400).json({ status: "error", message: validationError });
  }

  try {
    const columns = {
      username: "username",
      email: "email",
      password: "password_hash",
      role_id: "role_id",
      is_active: "is_active",
    };
    const values = [];
    const assignments = [];

    for (const [field, column] of Object.entries(columns)) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        let value = req.body[field];
        if (field === "password") {
          value = await bcrypt.hash(value, 12);
        } else if (field === "username" || field === "email") {
          value = value.trim();
        }
        values.push(value);
        assignments.push(`${column} = $${values.length}`);
      }
    }

    values.push(id);
    const { rows } = await db.query(
      `UPDATE users SET ${assignments.join(", ")}
       WHERE id = $${values.length}
       RETURNING ${USER_COLUMNS}`,
      values
    );
    if (!rows[0]) {
      return res.status(404).json({
        status: "error",
        message: `Usuario con id ${id} no encontrado`,
      });
    }
    return res.json({
      status: "success",
      message: "Usuario actualizado exitosamente",
      data: rows[0],
    });
  } catch (error) {
    return handleDatabaseError(res, error);
  }
}

async function eliminarUsuario(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({
      status: "error",
      message: "El id debe ser un entero positivo",
    });
  }

  try {
    const { rows } = await db.query(
      `DELETE FROM users WHERE id = $1 RETURNING ${USER_COLUMNS}`,
      [id]
    );
    if (!rows[0]) {
      return res.status(404).json({
        status: "error",
        message: `Usuario con id ${id} no encontrado`,
      });
    }
    return res.json({
      status: "success",
      message: "Usuario eliminado exitosamente",
      data: rows[0],
    });
  } catch (error) {
    if (error.code === "23503") {
      return res.status(409).json({
        status: "error",
        message: "No se puede eliminar el usuario porque tiene un empleado asociado",
      });
    }
    return handleDatabaseError(res, error);
  }
}

module.exports = {
  getUsuarios,
  getUsuarioById,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
};