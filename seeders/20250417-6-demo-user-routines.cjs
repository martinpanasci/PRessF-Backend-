'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const [superuser] = await queryInterface.sequelize.query(
      `SELECT id FROM "Users" WHERE email = 'superuser@fitapp.com';`
    );

    const [routines] = await queryInterface.sequelize.query(
      `SELECT id FROM "Routines";`
    );

    await queryInterface.bulkInsert('UserRoutines', [
      {
        user_id: superuser[0].id,
        routine_id: routines[0].id,
        assignedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: superuser[0].id,
        routine_id: routines[1].id,
        assignedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('UserRoutines', null, {});
  }
};
