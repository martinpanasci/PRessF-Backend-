'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const [routines] = await queryInterface.sequelize.query(`SELECT id, name, weeks FROM "Routines";`);
    const days = [];

    for (const routine of routines) {
      const { id: routineId, name, weeks } = routine;

      let structure = [];

      if (name.includes('FullBody')) {
        structure = ['Fullbody A', 'Fullbody B', 'Fullbody C'];
      } else if (name.includes('PPL')) {
        structure = ['Push Day', 'Pull Day', 'Legs Day'];
      } else if (name.includes('Upper Lower')) {
        structure = ['Upper A', 'Lower A', 'Upper B', 'Lower B'];
      } else {
        structure = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'];
      }

      for (let week = 1; week <= weeks; week++) {
        structure.forEach((baseName, index) => {
          days.push({
            routine_id: routineId,
            name: `${baseName} - Week ${week}`,
            day_order: index + 1,
            week_number: week,          
            createdAt: new Date(),
            updatedAt: new Date()
          });
        });
      }
    }

    await queryInterface.bulkInsert('RoutineDays', days);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('RoutineDays', null, {});
  }
};
