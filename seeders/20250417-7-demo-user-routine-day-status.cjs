'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Buscar user_routine_id
    const [routines] = await queryInterface.sequelize.query(`
      SELECT id FROM "Routines" WHERE name = 'Fuerza Total 4 Semanas (FullBody)';
    `);
    
    const routineId = routines[0]?.id;
    
    const [userRoutines] = await queryInterface.sequelize.query(`
      SELECT id FROM "UserRoutines" WHERE routine_id = ${routineId} ORDER BY id LIMIT 1;
    `);
    
    const userRoutineId = userRoutines[0]?.id;

    // Buscar días por nombre exacto
    const [routineDays] = await queryInterface.sequelize.query(`
      SELECT id, name FROM "RoutineDays"
      WHERE name IN ('Fullbody A - Week 1', 'Fullbody B - Week 1');
    `);

    console.log('🔍 userRoutineId:', userRoutineId);
    console.log('🔍 routineDays:', routineDays);

    const statusEntries = routineDays.map(day => ({
      user_routine_id: userRoutineId,
      routine_day_id: day.id,
      completed: true,
      date_completed: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await queryInterface.bulkInsert('UserRoutineDayStatus', statusEntries);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('UserRoutineDayStatus', null, {});
  }
};
