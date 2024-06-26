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
    teamId!: number;
    scorePerShot!: string;
    handiCapPerShot!: string;
    totalScore!: number;
    handiCapValue!: number;
    netValue!: number;
    driverContest?: string;
    nearPinContest?: string;

    static associate(models: any) {
      ScoreCard.belongsTo(models.User, {
        foreignKey: "userId",
        as: "userScoreCard",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      ScoreCard.belongsTo(models.Event, {
        foreignKey: "eventId",
        as: "eventScoreCard",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      ScoreCard.belongsTo(models.Team, {
        foreignKey: "teamId",
        as: "teamCard",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
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
      teamId: {
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
      driverContest: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      nearPinContest: {
        type: DataTypes.STRING,
        allowNull: true,
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
