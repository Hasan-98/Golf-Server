import { DataTypes, Model, Sequelize } from "sequelize";
import { ICategoryAttributes } from "../interfaces/category.interface";
export default (sequelize: Sequelize) => {
  class Category
    extends Model<ICategoryAttributes>
    implements ICategoryAttributes
  {
    id!: number;
    userId?: number | undefined;
    categoryName!: string;
    adminId?: number | undefined;

    static associate(models: any) {
      Category.belongsTo(models.User, {
        foreignKey: "adminId",
        as: "adminDetails",
        onDelete: "SET NULL",
      });
      Category.belongsTo(models.User, {
        foreignKey: "userId",
        as: "userDetails",
        onDelete: "SET NULL",
      });
    }
  }

  Category.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      adminId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "admin_id",
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "user_id",
      },
      categoryName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "category_name",
      },
    },
    {
      sequelize,
      modelName: "Category",
    }
  );

  return Category;
};
