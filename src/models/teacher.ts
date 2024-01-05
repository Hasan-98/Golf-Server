import { DataTypes, Model, Sequelize } from 'sequelize';
import { ITeacherAttributes } from '../interfaces/teacher.interface';

export default (sequelize: Sequelize) => {
  class Teacher extends Model<ITeacherAttributes> implements ITeacherAttributes {
    id!: number;
    userId!: number;
    firstName?: string;
    lastName?: string;
    aboutMyself?: string;
    phoneNumber?: string;
    location?: string;

    static associate(models: any) {
      Teacher.belongsTo(models.User, { foreignKey: 'userId' });
      Teacher.hasMany(models.Schedules, { foreignKey: 'teacherId' });
    }
  }
  Teacher.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      unique: true,
      field: 'user_id'
    },
    firstName: {
      type: DataTypes.STRING,
      field: 'first_name'
    },
    lastName: {
      type: DataTypes.STRING,
      field: 'last_name'
    },
    aboutMyself: {
      type: DataTypes.STRING,
      field: 'about_my_self'
    },
    phoneNumber: {
      type: DataTypes.STRING,
      field: 'phone_number'
    },
    location: {
      type: DataTypes.STRING,
      field: 'location'
    },
  }, {
    sequelize,
    modelName: 'Teacher',
  });
  return Teacher;
}