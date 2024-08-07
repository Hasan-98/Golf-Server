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
    postId!: number;
    reservationId!: number;
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
      Notifcation.belongsTo(models.Post, {
        foreignKey: "postId",
      });
      Notifcation.belongsTo(models.Reservation, {
        foreignKey: "reservationId",
        as: "reservationNotifications",
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
      postId: {
        type: DataTypes.INTEGER,
        field: "post_id",
        allowNull: true,
      },
      teacherId: {
        type: DataTypes.INTEGER,
        field: "teacher_id",
      },
      message: {
        type: DataTypes.STRING,
      },
      organizerId: {
        type: DataTypes.INTEGER,
        field: 'organizer_id',
      },
      reservationId: {
        type: DataTypes.INTEGER,
        field: 'reservation_id',
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
