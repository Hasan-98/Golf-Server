import { DataTypes, Model, Sequelize } from "sequelize";
import { ISchedulesAttributes } from "../interfaces/schedules.interface";

export default (sequelize: Sequelize) => {
  class Schedules
    extends Model<ISchedulesAttributes>
    implements ISchedulesAttributes
  {
    id!: number;
    teacherId?: number;
    startDate?: String;
    endDate?: String;
    static associate(models: any) {
      Schedules.belongsTo(models.Teacher, {
        foreignKey: "teacherId",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      Schedules.hasMany(models.Shifts, {
        foreignKey: "scheduleId",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }
  Schedules.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      teacherId: {
        type: DataTypes.INTEGER,
        field: "teacher_id",
      },
      startDate: {
        type: DataTypes.STRING,
        field: "start_date",
      },
      endDate: {
        type: DataTypes.STRING,
        field: "end_date",
      },
    },
    {
      sequelize,
      modelName: "schedules",
    }
  );
  return Schedules;
};
