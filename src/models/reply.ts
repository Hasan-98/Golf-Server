import { DataTypes, Model, Sequelize } from 'sequelize';
import { IReplyAttributes } from '../interfaces/reply.interface';
export default (sequelize: Sequelize) => {
  class Reply extends Model<IReplyAttributes> implements IReplyAttributes {
    id!: number;
    content!: string;

    static associate(models: any) {
      Reply.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      Reply.belongsTo(models.Comment, { foreignKey: 'commentId', as: 'comment' });
    }
  }

  Reply.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    content: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'Reply',
  });

  return Reply;
};
