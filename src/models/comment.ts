import { DataTypes, Model, Sequelize } from 'sequelize';
import { ICommenttAttributes } from '../interfaces/comment.interface';
export default (sequelize: Sequelize) => {
  class Comment extends Model<ICommenttAttributes> implements ICommenttAttributes {
    id!: number;
    content!: string;

    static associate(models: any) {
      Comment.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      Comment.belongsTo(models.Event, { foreignKey: 'eventId', as: 'event' });
      Comment.hasMany(models.Reply, { foreignKey: 'commentId', as: 'replies' });
    }
  }

  Comment.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    content: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'Comment',
  });

  return Comment;
};
