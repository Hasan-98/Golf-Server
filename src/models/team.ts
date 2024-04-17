import { DataTypes, Model, Sequelize } from "sequelize";
import { ITeamAttributes } from "../interfaces/team.interface";

export default (sequelize: Sequelize) => {
  class Team extends Model<ITeamAttributes> implements ITeamAttributes {
    id!: number;
    eventId!: number;
    name!: string;
    membersPerTeam?: number | undefined;
    teamImage?: string | undefined;
    static associate(models: any) {
      Team.belongsTo(models.Event, {
        foreignKey: "eventId",
        as: "teams",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      Team.hasMany(models.TeamMember, {
        foreignKey: "teamId",
        as: "members",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      Team.hasOne(models.ScoreCard, {
        foreignKey: "teamId",
        as: "teamCard",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }
  Team.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      eventId: {
        type: DataTypes.INTEGER,
        field: "event_id",
      },
      name: {
        type: DataTypes.STRING,
        field: "name",
      },
      membersPerTeam: {
        type: DataTypes.INTEGER,
        field: "members_per_team",
      },
      teamImage: {
        type: DataTypes.STRING,
        field: "team_image",
      },
    },
    {
      sequelize,
      modelName: "Team",
    }
  );
  return Team;
};
