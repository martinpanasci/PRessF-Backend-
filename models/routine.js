import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Routine extends Model {
    static associate(models) {
      Routine.hasMany(models.RoutineDay, { foreignKey: 'routine_id' });
      Routine.hasMany(models.UserRoutine, { foreignKey: 'routine_id' });
      
      
    }
  }

  Routine.init(
    {
      name: DataTypes.STRING,
      weeks: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Routine',
    }
  );

  return Routine;
};

