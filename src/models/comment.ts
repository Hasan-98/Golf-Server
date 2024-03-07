import { DataTypes, Model, Sequelize } from "sequelize";
import { ICommenttAttributes } from "../interfaces/comment.interface";
export default (sequelize: Sequelize) => {
  class Comment
    extends Model<ICommenttAttributes>
    implements ICommenttAttributes
  {
    id!: number;
    content!: string;

    static associate(models: any) {
      Comment.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      Comment.belongsTo(models.Event, {
        foreignKey: "eventId",
        as: "event",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      Comment.belongsTo(models.Post, {
        foreignKey: "postId",
        as: "PostComments",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }

  Comment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      content: DataTypes.TEXT,
      userId: DataTypes.INTEGER,
      eventId: DataTypes.INTEGER,
      postId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Comment",
    }
  );

  return Comment;
};
