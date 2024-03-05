import { DataTypes, Model, Sequelize } from 'sequelize';
import { IUserAttributes } from '../interfaces/user.interface';
export default (sequelize: Sequelize) => {
  class User extends Model<IUserAttributes> implements IUserAttributes {
    id!: number;
    nickName!: string;
    email!: string;
    password!: string;
    token!: string;
    imageUrl?: string;
    // ...

    static associate(models: any) {
      User.hasMany(models.Event, { foreignKey: 'creatorId', as: 'createdEvents' });
      User.belongsToMany(models.Event, { through: 'UserEvent', as: 'participatedEvents' });
      User.hasMany(models.Comment, { foreignKey: 'userId', as: 'comments' });
      User.hasMany(models.Like, { foreignKey: 'userId', as: 'likes' });
      User.hasOne(models.Teacher, { foreignKey: 'userId', as: 'teacher' });
      User.hasMany(models.Shifts, { as: 'bookedShifts', foreignKey: 'bookedBy' });
      User.belongsToMany(models.Teacher, { through: models.Favorite, as: 'favoriteTeachers' });
      User.hasMany(models.Post, { foreignKey: 'userId', as: 'posts' });
      User.hasMany(models.TeamMember, { foreignKey: 'userId', as: 'users' });
      User.hasMany(models.ScoreCard, { foreignKey: 'userId', as: 'userScoreCard' });
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
    token: DataTypes.STRING,
    imageUrl: {
      type: DataTypes.STRING,
      field: 'image_url'
    },
  }, {
    sequelize,
    modelName: 'User',
  });

  return User;
};
