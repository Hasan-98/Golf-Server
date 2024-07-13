import { DataTypes, Model, Sequelize } from "sequelize";
import { IUserCategoryAttributes } from "../interfaces/userCategory.interface";
export default (sequelize: Sequelize) => {
  class UserCategory
    extends Model<IUserCategoryAttributes>
    implements IUserCategoryAttributes
  {
    id!: number;
    userId?: number | undefined;
    categoryId?: number | undefined;

    static associate(models: any) {
      UserCategory.belongsTo(models.User, {
        foreignKey: "userId",
        as: "userCategory",
        onDelete: "SET NULL",
      });
      UserCategory.belongsTo(models.Category, {
        foreignKey: "categoryId",
        as: "category",
        onDelete: "SET NULL",
      });
    }
  }

  UserCategory.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "category_id",
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "user_id",
      },
    },
    {
      sequelize,
      modelName: "UserCategory",
    }
  );

  return UserCategory;
};
