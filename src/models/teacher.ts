import { DataTypes, Model, Sequelize } from "sequelize";
import { ITeacherAttributes } from "../interfaces/teacher.interface";

export default (sequelize: Sequelize) => {
  class Teacher
    extends Model<ITeacherAttributes>
    implements ITeacherAttributes
  {
    id!: number;
    userId!: number;
    firstName?: string;
    lastName?: string;
    aboutMyself?: string;
    phoneNumber?: string;
    location?: string;
    // rating?: any;
    // hourlyRate?: number;

    static associate(models: any) {
      Teacher.belongsTo(models.User, {
        foreignKey: "userId",
        as: "teacher",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      Teacher.hasMany(models.Schedules, {
        foreignKey: "teacherId",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      Teacher.belongsToMany(models.User, {
        through: models.Favorite,
        as: "favoritedByUsers",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }
  Teacher.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        unique: true,
        field: "user_id",
      },
      firstName: {
        type: DataTypes.STRING,
        field: "first_name",
      },
      lastName: {
        type: DataTypes.STRING,
        field: "last_name",
      },
      aboutMyself: {
        type: DataTypes.STRING,
        field: "about_my_self",
      },
      phoneNumber: {
        type: DataTypes.STRING,
        field: "phone_number",
      },
      location: {
        type: DataTypes.STRING,
        field: "location",
      },
      rating: {
        type: DataTypes.DECIMAL(10, 2),
        field: "rating",
      },
      hourlyRate: {
        type: DataTypes.INTEGER,
        field: "hourly_rate",
      },
    },
    {
      sequelize,
      modelName: "Teacher",
    }
  );
  return Teacher;
};
