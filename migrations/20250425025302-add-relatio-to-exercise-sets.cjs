'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Agrega la columna user_routine_id
    await queryInterface.addColumn('ExerciseSets', 'user_routine_id', {
      type: Sequelize.INTEGER,
      allowNull: false, // Recomendado para integridad, si vas a migrar datos existentes pone true primero
      references: {
        model: 'UserRoutines',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Quita la columna si se hace rollback
    await queryInterface.removeColumn('ExerciseSets', 'user_routine_id');
  }
};
