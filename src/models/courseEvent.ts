

import { DataTypes, Model, Sequelize } from "sequelize";
import { ICourseEventAttributes } from "../interfaces/courseEvent.interface";

export default (sequelize: Sequelize) => {
    class CourseEvent
    extends Model<ICourseEventAttributes>
    implements ICourseEventAttributes{
    id!: number;
    name!: string;
    address!: string;
    holes!: any;
  }

  CourseEvent.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      holes: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      prefecture: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
        sequelize,
        modelName: "CourseEvent",
    }
  );

  return CourseEvent;
};