import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class UserRoutine extends Model {
    static associate(models) {
      UserRoutine.belongsTo(models.User, { foreignKey: 'user_id' });
      UserRoutine.belongsTo(models.Routine, { foreignKey: 'routine_id' });
      UserRoutine.hasMany(models.UserRoutineDayStatus, { foreignKey: 'user_routine_id' });
    }
  }

  UserRoutine.init(
    {
      user_id: DataTypes.INTEGER,
      routine_id: DataTypes.INTEGER,
      assignedAt: DataTypes.DATE
    },
    {
      sequelize,
      modelName: 'UserRoutine',
      tableName: 'UserRoutines'
    }
  );

  return UserRoutine;
};
