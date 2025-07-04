// File: server/routes/routinesRouter.js
import express from "express";
import { requireAuth } from "../middlewares/authMiddleware.js";
import upload from '../middlewares/uploadExcelMiddleware.js';

import {
  getAllRoutines,
  getRoutineById,
  getRoutineLoads,
  getRoutineDays,
  getRoutineDayDetails,
  saveExerciseSets,  
  checkDayHasSets,
  importRoutineFromExcel,  
  updateRoutineName,
  deleteRoutine,
} from "../controllers/routinesController.js";

const router = express.Router();

// 🔐 Aplica middleware a todas las rutas
router.use(requireAuth);

// GET /routines
router.get("/", getAllRoutines); 
router.get("/:id", getRoutineById);
router.get("/:id/loads", getRoutineLoads);
router.get("/:id/days", getRoutineDays);
router.get("/:id/details/:idday/day", getRoutineDayDetails);
router.get('/:idday/check-sets', checkDayHasSets);

// POST para guardar sets de ejercicios
router.post("/save", saveExerciseSets);
router.post('/import-excel', upload.single('file'), importRoutineFromExcel);

// PATCH para editar nombre
router.patch("/:id", updateRoutineName);

// DELETE para borrar
router.delete("/:id", deleteRoutine);

export default router;
