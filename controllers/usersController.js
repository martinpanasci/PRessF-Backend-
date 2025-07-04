import db from "../models/index.js";
import bcrypt from "bcrypt";


// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "role", "avatar"],
    });

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json(user);
  } catch (err) {
    console.error("❌ Error al obtener perfil:", err);
    res.status(500).json({ error: "Error al obtener datos del usuario" });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  const { name, avatar } = req.body;

  try {
    const user = await db.User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    user.name = name || user.name;
    user.avatar = avatar || user.avatar;

    await user.save();

    res.json({ message: "Perfil actualizado correctamente" });
  } catch (err) {
    console.error("❌ Error al actualizar perfil:", err);
    res.status(500).json({ error: "Error al actualizar perfil" });
  }
};

// Update user password
export const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  try {
    const user = await db.User.findByPk(userId);

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Contraseña actual incorrecta" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: "✅ Contraseña actualizada correctamente" });
  } catch (err) {
    console.error("❌ Error al cambiar contraseña:", err);
    res.status(500).json({ error: "Error del servidor" });
  }
};