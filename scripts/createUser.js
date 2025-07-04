// server/scripts/createUser.js
import 'dotenv/config.js';
import bcrypt from 'bcrypt';
import db from '../models/index.js';

const createUser = async () => {
  try {
    const { EMAIL, NAME, PASSWORD } = process.env;

    if (!EMAIL || !NAME || !PASSWORD) {
      console.error('Faltan variables de entorno EMAIL, NAME o PASSWORD');
      process.exit(1);
    }

    const existingUser = await db.User.findOne({ where: { email: EMAIL } });
    if (existingUser) {
      console.log('El usuario ya existe.');
      return;
    }    
    const hashedPassword = await bcrypt.hash(PASSWORD, 10);

    await db.User.create({
      email: EMAIL,
      name: NAME,
      password: hashedPassword,
      role: 'user', // o 'admin' si preferís
    });

    console.log('Usuario creado con éxito.');
  } catch (error) {
    console.error('Error al crear el usuario:', error);
  }
};

createUser();
