import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basename = path.basename(__filename);
const db = {};

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT,
    logging: false
  }
);

// Carga dinámica de modelos
const modelFiles = fs
  .readdirSync(__dirname)
  .filter(
    (file) =>
      file !== basename &&
      file.endsWith('.js') &&
      !file.endsWith('.test.js')
  );

for (const file of modelFiles) {
  const modelPath = path.join(__dirname, file);
  const modelUrl = new URL(`file://${modelPath.replace(/\\/g, '/')}`);
  const { default: model } = await import(modelUrl);
  const definedModel = model(sequelize, DataTypes);
  db[definedModel.name] = definedModel;
}

// Asignar relaciones
for (const modelName in db) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
