import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class UserRoutineDayStatus extends Model {
    static associate(models) {
      UserRoutineDayStatus.belongsTo(models.UserRoutine, { foreignKey: 'user_routine_id' });
      UserRoutineDayStatus.belongsTo(models.RoutineDay, { foreignKey: 'routine_day_id' });
    }
  }

  UserRoutineDayStatus.init(
    {
      user_routine_id: DataTypes.INTEGER,
      routine_day_id: DataTypes.INTEGER,
      completed: DataTypes.BOOLEAN,
      date_completed: DataTypes.DATE
    },
    {
      sequelize,
      modelName: 'UserRoutineDayStatus',
      tableName: 'UserRoutineDayStatus'
    }
  );

  return UserRoutineDayStatus;
};
