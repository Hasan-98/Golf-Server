import { DataTypes, Model, Sequelize } from "sequelize";
import { IPostAttributes } from "../interfaces/post.interface";

export default (sequelize: Sequelize) => {
  class Post extends Model<IPostAttributes> implements IPostAttributes {
    id!: number;
    userId!: number;
    category?: string | undefined;
    tags?: string | undefined;
    mediaFile?: JSON;
    text?: string | undefined;

    static associate(models: any) {
      Post.belongsTo(models.User, {
        foreignKey: "userId",
        as: "posts",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      Post.hasMany(models.Like, {
        foreignKey: "postId",
        as: "PostLikes",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      Post.hasMany(models.Comment, {
        foreignKey: "postId",
        as: "PostComments",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }
  Post.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      text: {
        type: DataTypes.STRING,
        field: "text",
      },
      userId: {
        type: DataTypes.INTEGER,
        field: "user_id",
      },
      category: {
        type: DataTypes.STRING,
        field: "category",
      },
      tags: {
        type: DataTypes.STRING,
        field: "tags",
      },
      mediaFile: {
        type: DataTypes.JSON,
        field: "media_file",
      },
    },
    {
      sequelize,
      modelName: "Post",
    }
  );
  return Post;
};
