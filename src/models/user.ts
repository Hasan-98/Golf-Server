import { DataTypes, Model, Sequelize } from 'sequelize';
import { IUserAttributes } from '../interfaces/user.interface';

export default (sequelize: Sequelize) => {
  class User extends Model<IUserAttributes> implements IUserAttributes {
    id!: number;
    firstName!: string;
    lastName!: string;
    email!: string;
    password!: string;
    // ...

    static associate(models: any) {
      // define association here
    }
  }

  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING

  }, {
    sequelize,
    modelName: 'User',
  });

  return User;
};
