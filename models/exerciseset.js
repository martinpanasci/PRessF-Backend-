import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class ExerciseSet extends Model {
    static associate(models) {
      ExerciseSet.belongsTo(models.RoutineDayExercise, { foreignKey: 'routine_day_exercise_id' });
      ExerciseSet.belongsTo(models.UserRoutine, { foreignKey: 'user_routine_id' });
    }
  }

  ExerciseSet.init(
    {
      routine_day_exercise_id: DataTypes.INTEGER,
      user_routine_id: DataTypes.INTEGER,
      set_number: DataTypes.INTEGER,
      reps: DataTypes.INTEGER,
      weight: DataTypes.DECIMAL,
      date: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'ExerciseSet',
    }
  );

  return ExerciseSet;
};
