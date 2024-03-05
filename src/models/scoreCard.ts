import { DataTypes, Model, Sequelize } from "sequelize";
import { IScoreCardAttributes } from "../interfaces/scoreCard.interface";
export default (sequelize: Sequelize) => {
  class ScoreCard
    extends Model<IScoreCardAttributes>
    implements IScoreCardAttributes
  {
    id!: number;
    userId!: number;
    eventId!: number;
    scorePerShot!: string;
    handiCapPerShot!: string;
    totalScore!: number;
    handiCapValue!: number;
    netValue!: number;

    static associate(models: any) {
      ScoreCard.belongsTo(models.User, {
        foreignKey: "userId",
        as: "userScoreCard",
      });
      ScoreCard.belongsTo(models.Event, {
        foreignKey: "eventId",
        as: "eventScoreCard",
      });
    }
  }

  ScoreCard.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      eventId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      scorePerShot: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      handiCapPerShot: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      totalScore: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      handiCapValue: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      netValue: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "ScoreCard",
    }
  );

  return ScoreCard;
};
