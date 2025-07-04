import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      
    }
  }

  User.init(
    {
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'user',
      },
      avatar: {
        type: DataTypes.STRING,
        defaultValue: "Gamer", // 👈 será el nombre usado para buscar la imagen
      },
    },
    {
      sequelize,
      modelName: 'User',
    }
    
  );

  return User;
};
