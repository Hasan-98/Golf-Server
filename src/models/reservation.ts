import { DataTypes, Model, Sequelize } from "sequelize";
import { IReservationAttributes } from "../interfaces/reservation.interface";
export default (sequelize: Sequelize) => {
  class Reservation
    extends Model<IReservationAttributes>
    implements IReservationAttributes
  {
    public id!: number;
    public userId!: number;
    public teacherId!: number;
    public gigId!: number;
    public status!: string;

    static associate(models: any) {
      Reservation.belongsTo(models.User, {
        foreignKey: "userId",
        as: "userReservations",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      });
      Reservation.belongsTo(models.Gigs, {
        foreignKey: "gigId",
        as: "gigReservations",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      Reservation.belongsTo(models.Teacher, {
        foreignKey: "teacherId",
        as: "teacherReservations",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      Reservation.hasMany(models.Notification, {
        foreignKey: "reservationId",
        as: "reservationNotifications",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }

  Reservation.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "user_id",
      },
      gigId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "gig_id",
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      teacherId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "teacher_id",
      },
    },
    {
      sequelize,
      modelName: "Reservation",
    }
  );

  return Reservation;
};
