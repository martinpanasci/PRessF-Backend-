import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class RoutineDay extends Model {
    static associate(models) {
      RoutineDay.belongsTo(models.Routine, { foreignKey: 'routine_id' });
      RoutineDay.hasMany(models.RoutineDayExercise, { foreignKey: 'routine_day_id' });
      RoutineDay.hasMany(models.UserRoutineDayStatus, { foreignKey: 'routine_day_id' });
    }
  }

  RoutineDay.init(
    {
      routine_id: DataTypes.INTEGER,
      name: DataTypes.STRING,
      day_order: DataTypes.INTEGER,
      week_number: DataTypes.INTEGER,
      // 🔥 NO incluir: completed, date_completed
    },
    {
      sequelize,
      modelName: 'RoutineDay',
    }
  );

  return RoutineDay;
};

