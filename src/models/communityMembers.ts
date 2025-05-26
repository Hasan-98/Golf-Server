import { DataTypes, Model, Sequelize } from "sequelize";
import { ICommunityMembersAttributes } from "../interfaces/communityMembers.interface";

export default (sequelize: Sequelize) => {
  class CommunityMembers
    extends Model<ICommunityMembersAttributes>
    implements ICommunityMembersAttributes
  {
    id!: number;
    displayName!: string;
    activityRegionAbroad!: string;
    averageScore!: string;
    gender!: string;
    email!: string;
    phone!: string;
    furigana!: string;
    activityRegion!: string;
    photo!: string;
    businessCard!: string;
    fullName!: string;

    static associate(models: any) {
      // define associations here
    }
  }

  CommunityMembers.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      displayName: {
        type: DataTypes.TEXT,
        field: "display_name",
      },
      activityRegionAbroad: {
        type: DataTypes.TEXT,
        field: "activity_region_abroad",
      },
      averageScore: {
        type: DataTypes.TEXT,
        field: "average_score",
      },
      gender: {
        type: DataTypes.TEXT,
        field: "gender",
      },
      email: {
        type: DataTypes.TEXT,
        field: "email",
      },
      phone: {
        type: DataTypes.TEXT,
        field: "phone",
      },
      furigana: {
        type: DataTypes.TEXT,
        field: "furigana",
      },
      activityRegion: {
        type: DataTypes.TEXT,
        field: "activity_region",
      },
      photo: {
        type: DataTypes.TEXT,
        field: "photo",
      },
      businessCard: {
        type: DataTypes.TEXT,
        field: "business_card",
      },
      fullName: {
        type: DataTypes.TEXT,
        field: "full_name",
      },
    },
    {
      sequelize,
      modelName: "CommunityMembers",
    }
  );

  return CommunityMembers;
};
