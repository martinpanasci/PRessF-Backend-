'use strict';

function getRandomFloat(min, max, decimals = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Buscá los UserRoutines existentes
  const [userRoutines] = await queryInterface.sequelize.query(`
    SELECT id, routine_id FROM "UserRoutines";
  `);

  // 2. Buscá los RoutineDayExercises y conectalos con su routine_id
  const [rdeRows] = await queryInterface.sequelize.query(`
    SELECT rde.id, rd.routine_id
    FROM "RoutineDayExercises" rde
    JOIN "RoutineDays" rd ON rde.routine_day_id = rd.id;
  `);

  // 3. Armá un mapa: routine_id -> user_routine_id
  const routineToUserRoutine = {};
  userRoutines.forEach(ur => {
    routineToUserRoutine[ur.routine_id] = ur.id;
  });

    const sets = [];
  rdeRows.forEach((rde) => {
    const userRoutineId = routineToUserRoutine[rde.routine_id];
    if (!userRoutineId) return; // salteá si no encuentra relación

    const numSets = Math.floor(Math.random() * 3) + 2;
    for (let i = 1; i <= numSets; i++) {
      sets.push({
        routine_day_exercise_id: rde.id,
        set_number: i,
        reps: Math.floor(Math.random() * 4) + 8,
        weight: getRandomFloat(20, 100),
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        user_routine_id: userRoutineId, // 👈 Ahora sí, real
      });
    }
  });

    console.log(`✅ Se crearán ${sets.length} sets`);

    await queryInterface.bulkInsert('ExerciseSets', sets);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ExerciseSets', null, {});
  }
};
