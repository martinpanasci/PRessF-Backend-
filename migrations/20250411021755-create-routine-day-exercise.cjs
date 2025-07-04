'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('RoutineDayExercises', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      routine_day_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'RoutineDays',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      exercise_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Exercises',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      substitute_1_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Exercises',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      substitute_2_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Exercises',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      intensity: {
        type: Sequelize.STRING
      },
      warm_up_sets: {
        type: Sequelize.INTEGER
      },
      working_sets: {
        type: Sequelize.INTEGER
      },
      reps: {
        type: Sequelize.STRING
      },
      rpe_early: {
        type: Sequelize.STRING
      },
      rpe_last: {
        type: Sequelize.STRING
      },
      rest: {
        type: Sequelize.STRING
      },
      notes: {
        type: Sequelize.TEXT
      },
      sets_weights: {
        type: Sequelize.JSON
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('RoutineDayExercises');
  }
};