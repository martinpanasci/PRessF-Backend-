'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkUpdate('Users', 
      { avatar: 'Gamer' }, 
      {} // a todos los usuarios existentes
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkUpdate('Users', 
      { avatar: null }, 
      {}
    );
  }
};
