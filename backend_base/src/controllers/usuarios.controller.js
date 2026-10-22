
const supabase = require("../config/supabase");
const bcrypt = require("bcryptjs");

// GET /api/v1/usuarios
const getUsuarios = async (req, res) => {
  const { data, error } = await supabase
    .from("usuarios")
    .select("id, nombre, email, edad, username, created_at")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error al consultar usuarios:", error.message);
    return res.status(500).json({
      status: "error",
      message: "No se pudieron consultar los usuarios",
    });
  }

  return res.json({
    total: data.length,
    data,
  });
};

// GET /api/v1/usuarios/:id
const getUsuarioById = async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      status: "error",
      message: "El ID debe ser un entero positivo",
    });
  }

  const { data, error } = await supabase
    .from("usuarios")
    .select("id, nombre, email, edad, username, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error al consultar usuario:", error.message);
    return res.status(500).json({
      status: "error",
      message: "No se pudo consultar el usuario",
    });
  }

  if (!data) {
    return res.status(404).json({
      status: "error",
      message: `Usuario con id ${id} no encontrado`,
    });
  }

  return res.json(data);
};

// POST /api/v1/usuarios
const crearUsuario = async (req, res) => {
  const { nombre, email, edad, username, password } = req.body;

  if (
    typeof nombre !== "string" ||
    typeof email !== "string" ||
    typeof username !== "string" ||
    typeof password !== "string" ||
    nombre.trim() === "" ||
    email.trim() === "" ||
    username.trim() === "" ||
    password.length < 8 ||
    edad === undefined ||
    edad === null ||
    edad === ""
  ) {
    return res.status(400).json({
      status: "error",
      message:
        "Ingresa nombre, email, edad, username y password. La contraseña debe tener al menos 8 caracteres.",
    });
  }

  const edadNumero = Number(edad);

  if (!Number.isInteger(edadNumero) || edadNumero < 1 || edadNumero > 120) {
    return res.status(400).json({
      status: "error",
      message: "La edad debe ser un entero entre 1 y 120",
    });
  }

  const nombreLimpio = nombre.trim();
  const emailLimpio = email.trim().toLowerCase();
  const usernameLimpio = username.trim();

  const passwordHash = await bcrypt.hash(password, 12);

  const { data, error } = await supabase
    .from("usuarios")
    .insert({
      nombre: nombreLimpio,
      email: emailLimpio,
      edad: edadNumero,
      username: usernameLimpio,
      password_hash: passwordHash,
    })
    .select("id, nombre, email, edad, username, created_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        status: "error",
        message: "El email o el nombre de usuario ya está registrado",
      });
    }

    console.error("Error al crear usuario:", error.message);
    return res.status(500).json({
      status: "error",
      message: "No se pudo crear el usuario",
    });
  }

  return res.status(201).json({
    status: "success",
    message: "Usuario creado exitosamente",
    data,
  });
};

// PUT /api/v1/usuarios/:id
const actualizarUsuario = async (req, res) => {
  const id = Number(req.params.id);
  const { nombre, email, edad, username } = req.body;

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      status: "error",
      message: "El ID debe ser un entero positivo",
    });
  }

  const cambios = {};

  if (nombre !== undefined) {
    if (typeof nombre !== "string" || nombre.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "El nombre no puede estar vacío",
      });
    }
    cambios.nombre = nombre.trim();
  }

  if (email !== undefined) {
    if (typeof email !== "string" || email.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "El email no puede estar vacío",
      });
    }
    cambios.email = email.trim().toLowerCase();
  }

  if (username !== undefined) {
    if (typeof username !== "string" || username.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "El username no puede estar vacío",
      });
    }
    cambios.username = username.trim();
  }

  if (edad !== undefined) {
    const edadNumero = Number(edad);

    if (!Number.isInteger(edadNumero) || edadNumero < 1 || edadNumero > 120) {
      return res.status(400).json({
        status: "error",
        message: "La edad debe ser un entero entre 1 y 120",
      });
    }
    cambios.edad = edadNumero;
  }

  if (Object.keys(cambios).length === 0) {
    return res.status(400).json({
      status: "error",
      message: "Debes enviar al menos un campo para actualizar",
    });
  }

  const { data, error } = await supabase
    .from("usuarios")
    .update(cambios)
    .eq("id", id)
    .select("id, nombre, email, edad, username, created_at")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        status: "error",
        message: "El email o el nombre de usuario ya está registrado",
      });
    }

    console.error("Error al actualizar usuario:", error.message);
    return res.status(500).json({
      status: "error",
      message: "No se pudo actualizar el usuario",
    });
  }

  if (!data) {
    return res.status(404).json({
      status: "error",
      message: `Usuario con id ${id} no encontrado`,
    });
  }

  return res.json({
    status: "success",
    message: "Usuario actualizado exitosamente",
    data,
  });
};

// DELETE /api/v1/usuarios/:id
const eliminarUsuario = async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      status: "error",
      message: "El ID debe ser un entero positivo",
    });
  }

  const { data, error } = await supabase
    .from("usuarios")
    .delete()
    .eq("id", id)
    .select("id, nombre, email, edad, username, created_at")
    .maybeSingle();

  if (error) {
    console.error("Error al eliminar usuario:", error.message);
    return res.status(500).json({
      status: "error",
      message: "No se pudo eliminar el usuario",
    });
  }

  if (!data) {
    return res.status(404).json({
      status: "error",
      message: `Usuario con id ${id} no encontrado`,
    });
  }

  return res.json({
    status: "success",
    message: "Usuario eliminado exitosamente",
    data,
  });
};

module.exports = {
  getUsuarios,
  getUsuarioById,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
};
