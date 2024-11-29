import { DataTypes, Model, Sequelize } from "sequelize";
import { IShiftAttributes } from "../interfaces/shifts.interface";

export default (sequelize: Sequelize) => {
  class Shifts extends Model<IShiftAttributes> implements IShiftAttributes {
    id!: number;
    scheduleId?: number | undefined;
    startTime?: String | undefined;
    endTime?: String | undefined;
    day?: String | undefined;
    isBooked?: Boolean | undefined;
    status?: string | undefined;
    date?: string | undefined;
    bookedBy?: number | undefined;
    static associate(models: any) {
      Shifts.belongsTo(models.Schedules, {
        foreignKey: "scheduleId",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      Shifts.belongsTo(models.User, {
        as: "bookedShifts",
        foreignKey: "bookedBy",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }
  Shifts.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      scheduleId: {
        type: DataTypes.INTEGER,
        field: "schedule_id",
      },
      day: {
        type: DataTypes.STRING,
        field: "day",
      },
      startTime: {
        type: DataTypes.STRING,
        field: "start_time",
      },
      endTime: {
        type: DataTypes.STRING,
        field: "end_time",
      },
      date: {
        type: DataTypes.STRING,
        field: "date",
      },
      isBooked: {
        type: DataTypes.BOOLEAN,
        field: "is_booked",
        defaultValue: false,
      },
      status: {
        type: DataTypes.STRING,
        field: "status",
      },
      bookedBy: {
        type: DataTypes.INTEGER,
        field: "booked_by",
      },
    },
    {
      sequelize,
      modelName: "shifts",
    }
  );
  return Shifts;
};
