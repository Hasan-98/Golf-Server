import { DataTypes, Model, Sequelize } from "sequelize";
import { IGigsAttributes } from "../interfaces/gigs.interface";
export default (sequelize: Sequelize) => {
  class Gigs extends Model<IGigsAttributes> implements IGigsAttributes {
    public id!: number;
    public teacherId!: number;
    public description!: string;
    public price!: number;
    public title!: string;
    public imageUrl!: string;

    static associate(models: any) {
      Gigs.belongsTo(models.Teacher, {
        foreignKey: "teacherId",
        as: "teacherGigs",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }

  Gigs.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      teacherId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "teacher_id",
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "image_url",
      },
    },
    {
      sequelize,
      modelName: "Gigs",
    }
  );

  return Gigs;
};
