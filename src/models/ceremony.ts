import { DataTypes, Model, Sequelize } from "sequelize";
import { ICeremonyAttributes } from "../interfaces/ceremony.interface";
export default (sequelize: Sequelize) => {
  class Ceremony
    extends Model<ICeremonyAttributes>
    implements ICeremonyAttributes
  {
    id!: number;
    userId?: number | undefined;
    eventId!: number;
    eventInfo!: string;
    ceremonyImages!: JSON;

    static associate(models: any) {
      Ceremony.belongsTo(models.User, {
        foreignKey: "userId",
        as: "userDetails",
        onDelete: "CASCADE",
      });
      Ceremony.belongsTo(models.Event, {
        foreignKey: "eventId",
        as: "eventDetails",
        onDelete: "CASCADE",
      });
    }
  }

  Ceremony.init(
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
      eventId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "event_id",
      },
      eventInfo: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "event_info",
      },
      ceremonyImages: {
        type: DataTypes.JSON,
        allowNull: true,
        field: "ceremony_images",
      },
    },
    {
      sequelize,
      modelName: "Ceremony",
    }
  );

  return Ceremony;
};
