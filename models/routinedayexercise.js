import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class RoutineDayExercise extends Model {
    static associate(models) {
      RoutineDayExercise.belongsTo(models.RoutineDay, { foreignKey: 'routine_day_id' });
      RoutineDayExercise.belongsTo(models.Exercise, { foreignKey: 'exercise_id' });
      RoutineDayExercise.belongsTo(models.Exercise, { foreignKey: 'substitute_1_id', as: 'Sub1' });
      RoutineDayExercise.belongsTo(models.Exercise, { foreignKey: 'substitute_2_id', as: 'Sub2' });
      RoutineDayExercise.hasMany(models.ExerciseSet, { foreignKey: 'routine_day_exercise_id' });
    }
  }

  RoutineDayExercise.init(
    {
      routine_day_id: DataTypes.INTEGER,
      exercise_id: DataTypes.INTEGER,
      substitute_1_id: DataTypes.INTEGER,
      substitute_2_id: DataTypes.INTEGER,
      intensity: DataTypes.STRING,
      warm_up_sets: DataTypes.STRING,
      working_sets: DataTypes.STRING,
      reps: DataTypes.STRING,
      rpe_early: DataTypes.STRING,
      rpe_last: DataTypes.STRING,
      rest: DataTypes.STRING,
      notes: DataTypes.TEXT,
      sets_weights: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: 'RoutineDayExercise',
    }
  );

  return RoutineDayExercise;
};
