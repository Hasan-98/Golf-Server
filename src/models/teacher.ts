// import { DataTypes, Model, Sequelize } from 'sequelize';
// import { ITeacherAttributes } from '../interfaces/teacher.interface';

// export default (sequelize : Sequelize) => {

// }
// class Teacher extends Model {
//   id!: number;
//   userId!: number;
//   firstName?: string;
//   lastName?: string;
//   aboutMyself?: string;
//   phoneNumber?: string;
//   location?: string;
//   availableTime?: string;

//   static associate(models: any) {
//     Teacher.belongsTo(models.User, { foreignKey: 'userId' });
//   }
// }

// Teacher.init({
//   id: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true,
//   },
//   userId: {
//     type: DataTypes.INTEGER,
//     unique: true,
//   },
//   firstName: DataTypes.STRING,
//   lastName: DataTypes.STRING,
//   aboutMyself: DataTypes.TEXT,
//   phoneNumber: DataTypes.STRING,
//   location: DataTypes.STRING,
//   availableTime: DataTypes.STRING,
// }, {
//   sequelize,
//   modelName: 'Teacher',
// });

// export default Teacher;
