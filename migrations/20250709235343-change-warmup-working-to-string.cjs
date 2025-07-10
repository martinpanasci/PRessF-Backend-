'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('RoutineDayExercises', 'warm_up_sets', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn('RoutineDayExercises', 'working_sets', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('RoutineDayExercises', 'warm_up_sets', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.changeColumn('RoutineDayExercises', 'working_sets', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  }
};