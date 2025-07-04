import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Exercise extends Model {
    static associate(models) {
      Exercise.hasMany(models.RoutineDayExercise, { foreignKey: 'exercise_id' });
    }
  }

  Exercise.init(
    {
      name: DataTypes.STRING,
      ytlink: DataTypes.STRING,
      description: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: 'Exercise',
    }
  );

  return Exercise;
};
