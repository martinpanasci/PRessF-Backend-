'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      UPDATE "Users"
      SET role = 'admin'
      WHERE email = 'superuser@fitapp.com';
    `);

    await queryInterface.sequelize.query(`
      UPDATE "Users"
      SET role = 'user'
      WHERE role IS NULL;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      UPDATE "Users"
      SET role = NULL;
    `);
  }
};
