// ../server/seeders/20250411-1-users-seeder.cjs

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Users', [
      {
        name: 'Martín Superuser',
        email: 'superuser@fitapp.com',
        password: 'hashed_superpass_123', // reemplazar por hash real si querés
        createdAt: new Date(),
        updatedAt: new Date(),        
      },
      {
        name: 'Valentina López',
        email: 'valen@fitapp.com',
        password: 'hashed_abc',
        createdAt: new Date(),
        updatedAt: new Date(),        
      },
      {
        name: 'Cane Di Franco',
        email: 'cane@fitapp.com',
        password: 'hashed_xyz',
        createdAt: new Date(),
        updatedAt: new Date(),        
      },
      {
        name: 'Marcos Torres',
        email: 'marcos@fitapp.com',
        password: 'hashed_pass',
        createdAt: new Date(),
        updatedAt: new Date(),        
      },
      {
        name: 'Alex Jiménez',
        email: 'alex@fitapp.com',
        password: 'hashed_pwd',
        createdAt: new Date(),
        updatedAt: new Date(),        
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
