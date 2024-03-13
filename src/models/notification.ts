import { DataTypes, Sequelize, Model } from "sequelize";
import { INotificationAttributes } from "../interfaces/notification.interface";

export default (sequelize: Sequelize) => {
  class Notifcation
    extends Model<INotificationAttributes>
    implements INotificationAttributes
  {
    id!: number;
    userId!: number;
    teacherId!: number;
    message!: string;
    isRead!: boolean;
    createdAt!: Date;
    updatedAt!: Date;

    static associate(models: any) {
      Notifcation.belongsTo(models.User, {
        foreignKey: "userId",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      Notifcation.belongsTo(models.Teacher, {
        foreignKey: "teacherId",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      Notifcation.belongsTo(models.Event, {
        foreignKey: "eventId",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }

  Notifcation.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        field: "user_id",
      },
      eventId: {
        type: DataTypes.INTEGER,
        field: "event_id",
      },
      teacherId: {
        type: DataTypes.INTEGER,
        field: "teacher_id",
      },
      message: {
        type: DataTypes.STRING,
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        field: "is_read",
      },
      createdAt: {
        type: DataTypes.DATE,
        field: "created_at",
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: "updated_at",
      },
    },
    {
      sequelize,
      modelName: "notification",
    }
  );

  return Notifcation;
};
