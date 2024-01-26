import { DataTypes, Model, Sequelize } from "sequelize";
import { ITeamMemberAttributes } from "../interfaces/teamMember.interface";

export default (sequelize: Sequelize) => {
  class TeamMember
    extends Model<ITeamMemberAttributes>
    implements ITeamMemberAttributes
  {
    id!: number;
    userId!: number;
    teamId!: number;

    static associate(models: any) {
      TeamMember.belongsTo(models.User, { foreignKey: "userId", as: "users" });
      TeamMember.belongsTo(models.Team, { foreignKey: "teamId", as: "members" });
    }
  }
  TeamMember.init(
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
      teamId: {
        type: DataTypes.INTEGER,
        field: "team_id",
      },
    },
    {
      sequelize,
      modelName: "TeamMember",
    }
  );
  return TeamMember;
};
