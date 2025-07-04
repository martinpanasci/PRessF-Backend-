'use strict';

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getDistinctExercises(allExercises, usedIds, count = 1) {
  return allExercises
    .filter(ex => !usedIds.includes(ex.id))
    .sort(() => 0.5 - Math.random())
    .slice(0, count);
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const [days] = await queryInterface.sequelize.query(
      `SELECT id, name, routine_id FROM "RoutineDays";`
    );

    const [exercises] = await queryInterface.sequelize.query(
      `SELECT id FROM "Exercises";`
    );

    const assignments = [];

    // 1. Agrupar días por rutina
    const routinesMap = {};
    days.forEach(day => {
      if (!routinesMap[day.routine_id]) routinesMap[day.routine_id] = [];
      routinesMap[day.routine_id].push(day);
    });

    // 2. Alternar entre advanced y no advanced
    const routineIds = Object.keys(routinesMap);
    routineIds.forEach((routineId, i) => {
      const isAdvanced = i % 2 === 0;
      const daysInRoutine = routinesMap[routineId];

      daysInRoutine.forEach(day => {
        const numExercises = getRandomInt(6, 10);
        const shuffledExercises = [...exercises]
          .sort(() => 0.5 - Math.random())
          .slice(0, numExercises);

        shuffledExercises.forEach(ex => {
          const substitutes = getDistinctExercises(exercises, [ex.id], 2);
          const substitute_1 = substitutes[0]?.id || null;
          const substitute_2 = substitutes[1]?.id || null;

          const totalSets = isAdvanced ? getRandomInt(3, 4) : 2;
          const weightsArray = [];

          for (let set = 1; set <= totalSets; set++) {
            weightsArray.push({
              set,
              reps: isAdvanced ? getRandomInt(8, 10) : getRandomInt(12, 15),
              weight: parseFloat((Math.random() * 50 + 20).toFixed(1))
            });
          }

          assignments.push({
            routine_day_id: day.id,
            exercise_id: ex.id,
            substitute_1_id: substitute_1,
            substitute_2_id: substitute_2,
            intensity: isAdvanced ? 'RIR 2' : '',
            warm_up_sets: isAdvanced ? getRandomInt(1, 2) : 0,
            working_sets: totalSets,
            reps: isAdvanced ? '8-10' : '12-15',
            rpe_early: isAdvanced ? '7-8' : '',
            rpe_last: isAdvanced ? '9-10' : '',
            rest: isAdvanced ? '~90s' : '',
            notes: isAdvanced ? 'Cuidar técnica y controlar excéntrico' : '',
            sets_weights: JSON.stringify(weightsArray),
            createdAt: new Date(),
            updatedAt: new Date()
          });
        });
      });
    });

    console.log(`✅ Total de ejercicios asignados: ${assignments.length}`);

    try {
      await queryInterface.bulkInsert('RoutineDayExercises', assignments);
    } catch (error) {
      console.error('❌ Error insertando RoutineDayExercises:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('RoutineDayExercises', null, {});
  }
};
