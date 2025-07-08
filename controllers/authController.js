// File: server/controllers/authController.js
import db from "../models/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// login user
export const loginUser = async (req, res) => {
  const { email, password, remember } = req.body;

  try {
    const user = await db.User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: "Usuario no encontrado" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "4h",
    });

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        maxAge: remember ? 10 * 24 * 60 * 60 * 1000 : 4 * 60 * 60 * 1000,
      })
      .json({ message: "Login exitoso", name: user.name });
  } catch (err) {
    console.error("❌ Error login:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// get user from token
export const getUserFromToken = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "No autenticado" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await db.User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    return res.status(403).json({ error: "Token inválido" });
  }
};


// logout user
export const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  }).json({ message: "Sesión cerrada" });
};

// register user
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Faltan datos.' });
      }

    const existing = await db.User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "El correo ya está en uso." });
    }

    const hashedPass = await bcrypt.hash(password, 10);

    await db.User.create({
      name,
      email,
      password: hashedPass,
      role: "user",
    });

    res.status(201).json({ message: "Usuario registrado correctamente" });
  } catch (err) {
    console.error("❌ Error al registrar:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
