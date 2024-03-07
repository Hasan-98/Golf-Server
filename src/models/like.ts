import { DataTypes, Model, Sequelize } from "sequelize";
import { ILikeAttributes } from "../interfaces/like.interface";

export default (sequelize: Sequelize) => {
  class Like extends Model<ILikeAttributes> implements ILikeAttributes {
    id!: number;

    static associate(models: any) {
      Like.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      Like.belongsTo(models.Event, {
        foreignKey: "eventId",
        as: "event",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      Like.belongsTo(models.Post, {
        foreignKey: "postId",
        as: "PostLikes",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }

  Like.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      counter: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      userId: DataTypes.INTEGER,
      eventId: DataTypes.INTEGER,
      postId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Like",
    }
  );

  return Like;
};
