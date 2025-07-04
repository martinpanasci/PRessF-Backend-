'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const groups = {
      pecho: ['Bench Press', 'Incline Dumbbell Press', 'Chest Fly'],
      espalda: ['Lat Pulldown', 'Barbell Row', 'Pull-Up'],
      hombro: ['Overhead Press', 'Lateral Raise', 'Front Raise'],
      bicep: ['Barbell Curl', 'Hammer Curl', 'Preacher Curl'],
      tricep: ['Triceps Pushdown', 'Overhead Extension', 'Dips'],
      antebrazo: ['Wrist Curl', 'Reverse Curl'],
      abdomen: ['Crunch', 'Leg Raise', 'Plank'],
      gluteo: ['Hip Thrust', 'Glute Bridge'],
      isquios: ['Romanian Deadlift', 'Leg Curl'],
      cuadriceps: ['Squat', 'Leg Press', 'Lunge'],
      gemelo: ['Standing Calf Raise', 'Seated Calf Raise']
    };

    const yt = 'https://www.youtube.com/watch?v=example';

    const exercises = [];

    for (const [grupo, lista] of Object.entries(groups)) {
      lista.forEach(name => {
        exercises.push({
          name: name,
          ytlink: yt,
          description: `Ejercicio para ${grupo}`,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });
    }

    await queryInterface.bulkInsert('Exercises', exercises);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Exercises', null, {});
  }
};
