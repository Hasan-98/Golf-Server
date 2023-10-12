import { DataTypes, Model, Sequelize } from 'sequelize';
import { IUserAttributes } from '../interfaces/user.interface';
export default (sequelize: Sequelize) => {
  class User extends Model<IUserAttributes> implements IUserAttributes {
    id!: number;
    nickName!: string;
    email!: string;
    password!: string;
    token!: string;
    // ...

    static associate(models: any) {
      User.hasMany(models.Event, { foreignKey: 'creatorId', as: 'createdEvents' });
      User.belongsToMany(models.Event, { through: 'UserEvent', as: 'participatedEvents' });
      User.hasMany(models.Comment, { foreignKey: 'userId', as: 'comments' });
      User.hasMany(models.Reply, { foreignKey: 'userId', as: 'replies' });
      User.hasMany(models.Like, { foreignKey: 'userId', as: 'likes' });
    }
  }

  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nickName: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    token : DataTypes.STRING

  }, {
    sequelize,
    modelName: 'User',
  });

  return User;
};
