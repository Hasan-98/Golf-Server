import { DataTypes, Model, Sequelize } from "sequelize";

export default (sequelize: Sequelize) => {
  class TeacherRating extends Model {
    id!: number;
    feedback!: string;
    rating!: number;
    teacherId!: number;
    userId!: number;

    static associate(models: any) {
      TeacherRating.belongsTo(models.Teacher, {
        foreignKey: "teacherId",
        as: "teacherRatings",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      TeacherRating.belongsTo(models.User, {
        foreignKey: "userId",
        as: "userRatings",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }

  TeacherRating.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      feedback: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      rating: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      teacherId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "TeacherRating",
    }
  );

  return TeacherRating;
};