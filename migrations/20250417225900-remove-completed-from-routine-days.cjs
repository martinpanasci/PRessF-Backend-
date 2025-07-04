'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('RoutineDays', 'completed');
    await queryInterface.removeColumn('RoutineDays', 'date_completed');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('RoutineDays', 'completed', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });

    await queryInterface.addColumn('RoutineDays', 'date_completed', {
      type: Sequelize.DATE,
      allowNull: true
    });
  }
};
