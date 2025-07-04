'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Routines', [
      {
        name: 'Fuerza Total 4 Semanas (FullBody)',
        weeks: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'PPL Avanzado 8 Semanas',
        weeks: 8,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Upper Lower 8 Semanas',
        weeks: 8,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Volumen Progresivo 12 Semanas (5x)',
        weeks: 12,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Routines', null, {});
  }
};
