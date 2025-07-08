import db from "../models/index.js";
const {
  Routine,
  RoutineDay,
  UserRoutine,
  UserRoutineDayStatus,
  RoutineDayExercise,
  Exercise,
  ExerciseSet,
} = db;
import XLSX from "xlsx";
import jwt from "jsonwebtoken";

// Esta función obtiene todas las rutinas disponibles en la base de datos
export const getAllRoutines = async (req, res) => {
  try {
    const userId = req.user.id; // asumimos que tu middleware de auth mete req.user

    // Buscar todas las rutinas asignadas a este usuario
    const userRoutines = await UserRoutine.findAll({
      where: { user_id: userId },
      include: {
        model: Routine,
        attributes: ["id", "name", "weeks"],
        include: [{
          model: RoutineDay,
          attributes: ["id"],
        }]
      },
    });
    
    // El mapping final:
    const routines = userRoutines.map((ur) => ({
      id: ur.Routine.id,
      name: ur.Routine.name,
      weeks: ur.Routine.weeks,
      days: ur.Routine.RoutineDays?.length ?? 0,
    }));

    res.json(routines);
  } catch (error) {
    console.error("❌ Error al obtener rutinas:", error);
    res.status(500).json({ error: "Error al obtener rutinas" });
  }
};

// Esta función obtiene una rutina específica por su ID y la enriquece con el estado de los días
export const getRoutineById = async (req, res) => {
  try {
    const { id: routineId } = req.params;
    const userId = req.user.id;

    // Buscar si el usuario tiene asignada la rutina
    const userRoutine = await UserRoutine.findOne({
      where: { user_id: userId, routine_id: routineId },
    });

    if (!userRoutine) {
      // 🚨 No tiene acceso
      return res.status(403).json({ error: "No tenés acceso a esta rutina." });
    }

    const routine = await Routine.findByPk(routineId, {
      attributes: ["id", "name", "weeks"],
      include: [
        {
          model: RoutineDay,
          attributes: ["id", "name", "week_number", "day_order"],
          order: [
            ["week_number", "ASC"],
            ["day_order", "ASC"],
          ],
        },
      ],
    });

    if (!routine) {
      return res.status(404).json({ error: "Rutina no encontrada" });
    }    

    const dayStatuses = await UserRoutineDayStatus.findAll({
      where: { user_routine_id: userRoutine?.id || 0 },
      attributes: ["routine_day_id", "completed", "date_completed"],
    });

    const statusMap = {};
    dayStatuses.forEach((status) => {
      statusMap[status.routine_day_id] = {
        completed: status.completed,
        date_completed: status.date_completed,
      };
    });

    const enrichedDays = routine.RoutineDays.map((day) => ({
      ...day.dataValues,
      ...statusMap[day.id],
    }));

    const uniqueDays = new Set(enrichedDays.map((day) => day.day_order));
    const daysPerWeek = uniqueDays.size;

    res.json({
      id: routine.id,
      name: routine.name,
      weeks: routine.weeks,
      daysPerWeek,
      days: enrichedDays,
    });
  } catch (error) {
    console.error("❌ Error al obtener rutina por ID:", error);
    res.status(500).json({ error: "Error al obtener la rutina" });
  }
};

// Esta función obtiene los días de una rutina específica y sus ejercicios SOLO para el usuario logueado
export const getRoutineLoads = async (req, res) => {
  try {
    const { id: routineId } = req.params;
    const userId = req.user.id; // Asume que usás requireAuth y lo pusiste en req.user

    // 1. Buscá el userRoutineId correcto
    const userRoutine = await UserRoutine.findOne({
      where: { user_id: userId, routine_id: routineId }
    });
    if (!userRoutine) {
      return res.status(403).json({ error: "No tenés acceso a esta rutina" });
    }

    // 2. Ahora traé los días, los ejercicios y solo los sets que coinciden con ese user_routine_id
    const days = await RoutineDay.findAll({
      where: { routine_id: routineId },
      order: [
        ["week_number", "ASC"],
        ["day_order", "ASC"],
      ],
      include: {
        model: RoutineDayExercise,
        include: [
          { model: Exercise, attributes: ["name"] },
          {
            model: ExerciseSet,
            where: { user_routine_id: userRoutine.id }, // 👈 FILTRA por el user_routine_id
            required: false, // Para que muestre aunque aún no haya sets cargados
            order: [["set_number", "ASC"]]
          }
        ],
      },
    });
    // “🔧 Pendiente: separar presentación del backend y mover formato al frontend”.
    const result = days.map((day) => ({
      day: day.name,
      exercises: day.RoutineDayExercises.map((rde) => ({
        id: rde.exercise_id,
        name: rde.Exercise?.name || "Sin nombre",
        sets: rde.ExerciseSets.map((set) => `${set.reps} x ${set.weight}kg`), //🔧🔧🔧
      })),
    }));

    res.json(result);
  } catch (err) {
    console.error("❌ Error al obtener loads:", err);
    res.status(500).json({ error: "Error al obtener los datos de carga" });
  }
};


// Esta función obtiene los días de una rutina específica SOLO si es del usuario logueado
export const getRoutineDays = async (req, res) => {
  try {
    const { id } = req.params;        // id = routineId
    const userId = req.user.id;       // asumiendo requireAuth

    // 1. Chequear que el user tiene la rutina asignada
    const userRoutine = await db.UserRoutine.findOne({
      where: { user_id: userId, routine_id: id }
    });

    if (!userRoutine) {
      return res.status(403).json({ error: "No tenés acceso a esta rutina" });
    }

    // 2. Si la tiene, devolvé los días
    const days = await db.RoutineDay.findAll({
      where: { routine_id: id },
      order: [
        ["week_number", "ASC"],
        ["day_order", "ASC"],
      ],
      attributes: ["id", "name", "week_number", "day_order"],
    });

    res.json(days);
  } catch (err) {
    console.error("❌ Error obteniendo días de rutina:", err);
    res.status(500).json({ error: "Error obteniendo días" });
  }
};


// Esta función obtiene los detalles de un día específico de la rutina
export const getRoutineDayDetails = async (req, res) => {
  try {
    const { idday } = req.params;
    const userId = req.user.id;

    // 1. Buscá el día y su rutina
    const day = await db.RoutineDay.findByPk(idday, {
      attributes: ["id", "name", "routine_id"], // <-- Traé routine_id también
      include: {
        model: db.RoutineDayExercise,
        include: [
          { model: db.Exercise, as: "Exercise", attributes: ["id", "name", "ytlink"] },
          { model: db.Exercise, as: "Sub1", attributes: ["id", "name", "ytlink"] },
          { model: db.Exercise, as: "Sub2", attributes: ["id", "name", "ytlink"] },
        ],
      },
      order: [[db.RoutineDayExercise, "id", "ASC"]],
    });

    if (!day) return res.status(404).json({ error: "Día no encontrado" });

    // 2. Chequeá si la rutina está asignada al usuario
    const userRoutine = await db.UserRoutine.findOne({
      where: { user_id: userId, routine_id: day.routine_id }
    });

    if (!userRoutine) {
      return res.status(403).json({ error: "No tenés acceso a este día de rutina" });
    }

    // 3. Armá el response como antes
    const exercises = day.RoutineDayExercises.map((rde) => ({
      name: rde.Exercise?.name || "Ejercicio",
      ytlink: rde.Exercise?.ytlink || "",
      intensity: rde.intensity,
      warmUpSets: rde.warm_up_sets,
      workingSets: rde.working_sets,
      reps: rde.reps,
      rpe: {
        early: rde.rpe_early,
        last: rde.rpe_last,
      },
      rest: rde.rest,
      notes: rde.notes,
      substitutions: [rde.Sub1, rde.Sub2].filter(Boolean).map((s) => ({
        name: s.name,
        ytlink: s.ytlink,
      })),
    }));

    res.json({ name: day.name, exercises });
  } catch (error) {
    console.error("❌ Error en getRoutineDayDetails:", error);
    res.status(500).json({ error: "Error interno" });
  }
};


// Esta función guarda los sets de ejercicios en la base de datos
export const saveExerciseSets = async (req, res) => {
  try {
    const { routine_day_id, data } = req.body;
    const userId = req.user.id;

    // Buscar el día para sacar el routine_id
    const routineDay = await db.RoutineDay.findByPk(routine_day_id);
    if (!routineDay) return res.status(400).json({ error: "Día inválido." });

    // Conseguí el UserRoutine correcto
    const userRoutine = await db.UserRoutine.findOne({
      where: { user_id: userId, routine_id: routineDay.routine_id }
    });
    if (!userRoutine) return res.status(403).json({ error: "No tenés esa rutina." });

    // Buscar los ejercicios de ese día
    const dayExercises = await db.RoutineDayExercise.findAll({
      where: { routine_day_id },
      include: [{ model: db.Exercise }]
    });

    const exerciseMap = {};
    dayExercises.forEach((rde) => {
      if (rde.Exercise?.name) {
        exerciseMap[rde.Exercise.name] = rde.id;
      }
    });
    const exerciseSetIds = Object.values(exerciseMap);

    // BORRAR sets SOLO de este user_routine_id y routine_day_exercise_id
    await db.ExerciseSet.destroy({
      where: {
        routine_day_exercise_id: exerciseSetIds,
        user_routine_id: userRoutine.id
      }
    });

    // Si no hay datos, resetear estado y salir
    if (!data?.length) {
      // Usamos upsert para cubrir caso donde no existe el registro aún
      await db.UserRoutineDayStatus.upsert({
        user_routine_id: userRoutine.id,
        routine_day_id,
        completed: false,
        date_completed: null
      });
      return res.json({ message: "✔️ Datos eliminados y estado reseteado." });
    }

    // Insertar nuevos sets
    const setsToInsert = [];
    const now = new Date();
    data.forEach((set) => {
      const routine_day_exercise_id = exerciseMap[set.exercise_name];
      if (!routine_day_exercise_id) return;
      setsToInsert.push({
        routine_day_exercise_id,
        set_number: set.set_number,
        reps: set.reps,
        weight: set.weight,
        user_routine_id: userRoutine.id,
        date: now,            // <-- importante: registrar la fecha del set
        createdAt: now,
        updatedAt: now,
      });
    });

    await db.ExerciseSet.bulkCreate(setsToInsert);

    // Marcar el día como completado (usá upsert por si no existe el status)
    await db.UserRoutineDayStatus.upsert({
      user_routine_id: userRoutine.id,
      routine_day_id,
      completed: true,
      date_completed: new Date()
    });

    res.status(200).json({ message: "✅ Sets guardados y estado actualizado." });
  } catch (error) {
    console.error("❌ Error en saveExerciseSets:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};


// Esta función verifica si un día tiene sets asociados
export const checkDayHasSets = async (req, res) => {
  try {
    const { idday } = req.params;
    const userId = req.user.id;

    // Buscá routine_id de este día
    const routineDay = await db.RoutineDay.findByPk(idday);
    if (!routineDay) return res.json({ hasData: false });

    // Buscá el userRoutine correcto
    const userRoutine = await db.UserRoutine.findOne({
      where: { user_id: userId, routine_id: routineDay.routine_id }
    });
    if (!userRoutine) return res.json({ hasData: false });

    // Buscá todos los ejercicios de ese día
    const exercises = await db.RoutineDayExercise.findAll({
      where: { routine_day_id: idday },
      attributes: ["id"]
    });
    const ids = exercises.map((e) => e.id);

    if (!ids.length) return res.json({ hasData: false });

    const count = await db.ExerciseSet.count({
      where: {
        routine_day_exercise_id: ids,
        user_routine_id: userRoutine.id
      }
    });

    res.json({ hasData: count > 0 });
  } catch (error) {
    console.error("❌ Error en checkDayHasSets:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};


// Esta función importa la rutina desde un archivo Excel y la guarda en la DB
export const importRoutineFromExcel = async (req, res) => {
  try {
    // 1. OBTENER user_id desde el token JWT en la cookie
    let userId;
    const token = req.cookies?.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        return res.status(403).json({ error: "Token inválido" });
      }
    } else {
      return res.status(401).json({ error: "No autenticado" });
    }

    // 1. Leer el archivo excel recibido
    const file = req.file;
    const workbook = XLSX.read(file.buffer, { type: "buffer" });

    // Hoja de rutina principal
    const sheetName = workbook.SheetNames.includes("Nueva rutina")
      ? "Nueva rutina"
      : workbook.SheetNames[0]; // fallback si la renombran
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Hoja de ejercicios disponibles (opcional)
    let ejerciciosDisponibles = {};
    if (workbook.SheetNames.includes("Ejercicios disponibles")) {
      const ejerciciosSheet = XLSX.utils.sheet_to_json(
        workbook.Sheets["Ejercicios disponibles"]
      );
      for (const ex of ejerciciosSheet) {
        if (ex["Nombre ejercicio"]) {
          ejerciciosDisponibles[ex["Nombre ejercicio"].trim().toLowerCase()] = {
            description: ex["Descripcion"] || "",
            ytlink: ex["Video link"] || "",
          };
        }
      }
    }

    // Calcular semanas máximas por rutina:
    const rutinaSemanas = {};
    for (const row of rows) {
      if (!row["Rutina"]) continue; // <-- Valida campo antes de trim()
      const rutina = row["Rutina"].trim();
      const semana = Number(row["Semana"]) || 1;
      rutinaSemanas[rutina] = Math.max(rutinaSemanas[rutina] || 1, semana);
    }

    // Mapas para evitar duplicados y relacionar rápidamente
    const routineMap = new Map();
    const dayMap = new Map();
    const exerciseMap = new Map();

    for (const row of rows) {
      // Validar campos obligatorios ANTES de cualquier uso:
      if (
        !row["Rutina"] ||
        !row["Semana"] ||
        !row["Día"] ||
        !row["Día Nombre"] ||
        !row["Ejercicio"]
      ) {
        
        continue;
      }

      // --- Routine
      const routineName = row["Rutina"].trim();
      let routineId = routineMap.get(routineName);

      if (!routineId) {
        // Buscar o crear Routine
        let routine = await Routine.findOne({ where: { name: routineName } });
        if (!routine) {
          routine = await Routine.create({
            name: routineName,
            weeks: rutinaSemanas[routineName],
          });
        }
        routineId = routine.id;
        routineMap.set(routineName, routineId);
      }

      // --- RoutineDay
      const dayKey = `${routineName}_${row["Semana"]}_${row["Día"]}_${row["Día Nombre"]}`;
      let routineDayId = dayMap.get(dayKey);
      if (!routineDayId) {
        // Buscar o crear RoutineDay
        let routineDay = await RoutineDay.findOne({
          where: {
            routine_id: routineId,
            name: row["Día Nombre"],
            week_number: Number(row["Semana"]),
            day_order: Number(row["Día"]),
          },
        });
        if (!routineDay) {
          routineDay = await RoutineDay.create({
            routine_id: routineId,
            name: row["Día Nombre"],
            week_number: Number(row["Semana"]),
            day_order: Number(row["Día"]),
          });
        }
        routineDayId = routineDay.id;
        dayMap.set(dayKey, routineDayId);
      }

      // --- Exercise principal y sustitutos
      const getOrCreateExercise = async (exName, videoLink) => {
        if (!exName) return null;
        const nameKey = exName.trim().toLowerCase();
        if (exerciseMap.has(nameKey)) return exerciseMap.get(nameKey);

        // Buscar en hoja ejercicios
        let exData = ejerciciosDisponibles[nameKey] || {};
        let description = exData.description || "";
        let ytlink = exData.ytlink || videoLink || "";

        // Buscar en DB
        let exercise = await Exercise.findOne({ where: { name: exName } });
        if (!exercise) {
          exercise = await Exercise.create({
            name: exName,
            description,
            ytlink,
          });
        }
        exerciseMap.set(nameKey, exercise.id);
        return exercise.id;
      };

      // Principal
      const exerciseId = await getOrCreateExercise(
        row["Ejercicio"],
        row["Video Link"]
      );
      // Sub 1 y Sub 2
      const sub1Id = await getOrCreateExercise(
        row["Sub 1"],
        row["Sub 1 Video"]
      );
      const sub2Id = await getOrCreateExercise(
        row["Sub 2"],
        row["Sub 2 Video"]
      );

      // --- RoutineDayExercise
      await RoutineDayExercise.create({
        routine_day_id: routineDayId,
        exercise_id: exerciseId,
        substitute_1_id: sub1Id,
        substitute_2_id: sub2Id,
        intensity: "", // puedes ajustar si lo agregás al excel
        warm_up_sets: Number(row["Series Calent"]) || 0,
        working_sets: Number(row["Series Efectivas"]) || 0,
        reps: row["Reps"] || "",
        rpe_early: row["RPE Inicial"] || "",
        rpe_last: row["RPE Final"] || "",
        rest: row["Descanso"] || "",
        notes: row["Notas"] || "",
      });
      // Relacioná la rutina con el usuario (si no existe ya)
      const exists = await UserRoutine.findOne({
        where: { user_id: userId, routine_id: routineId },
      });
      if (!exists) {
        await UserRoutine.create({
          user_id: userId,
          routine_id: routineId,
          assignedAt: new Date(),
        });
      }
    }

    res.json({ message: "✅ Rutina importada correctamente." });
  } catch (err) {
    console.error("❌ Error al importar rutina:", err);
    res.status(500).json({ error: "Error interno al importar rutina." });
  }
};


// Esta función actualiza el nombre de una rutina
export const updateRoutineName = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name } = req.body;

    // Confirmar que la rutina le pertenece al usuario
    const userRoutine = await db.UserRoutine.findOne({
      where: { user_id: userId, routine_id: id }
    });
    if (!userRoutine) return res.status(403).json({ error: "No autorizado" });

    const routine = await db.Routine.findByPk(id);
    if (!routine) return res.status(404).json({ error: "No encontrada" });

    routine.name = name;
    await routine.save();

    res.json({ message: "Nombre actualizado", name });
  } catch (err) {
    console.error("❌ Error actualizando nombre de rutina:", err);
    res.status(500).json({ error: "Error interno" });
  }
};


// Esta función elimina una rutina y su relación con el usuario
export const deleteRoutine = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Buscar si la rutina está asignada al usuario
    const userRoutine = await db.UserRoutine.findOne({
      where: { user_id: userId, routine_id: id }
    });
    if (!userRoutine) return res.status(403).json({ error: "No autorizado" });

    // Borra la relación UserRoutine
    await userRoutine.destroy();

    // Si no hay más usuarios con la rutina, la borrás toda:
    const count = await db.UserRoutine.count({ where: { routine_id: id } });
    if (count === 0) {
      await db.Routine.destroy({ where: { id } });
      // Si querés, borrá también RoutineDay, etc, en cascada.
    }

    res.json({ message: "Rutina eliminada" });
  } catch (err) {
    console.error("❌ Error al borrar rutina:", err);
    res.status(500).json({ error: "Error interno" });
  }
};
