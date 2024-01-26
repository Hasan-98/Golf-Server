import { DataTypes, Model, Sequelize } from "sequelize";
import { ITeamAttributes } from "../interfaces/team.interface";

export default (sequelize: Sequelize) => {
  class Team extends Model<ITeamAttributes> implements ITeamAttributes {
    id!: number;
    eventId!: number;
    name!: string;
    membersPerTeam?: number | undefined;
    static associate(models: any) {
      Team.belongsTo(models.Event, { foreignKey: "eventId", as: "teams" });
      Team.hasMany(models.TeamMember, { foreignKey: "teamId", as: "members" });
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
    },
    {
      sequelize,
      modelName: "Team",
    }
  );
  return Team;
};
