import { DataTypes, Model, Sequelize } from 'sequelize';
import { IPostAttributes } from '../interfaces/post.interface';

export default (sequelize: Sequelize) => {
    class Post extends Model<IPostAttributes> implements IPostAttributes {
        id!: number;
        userId!: number;
        category?: string | undefined;
        tags?: string | undefined;
        mediaFile?: string[] | undefined;


        static associate(models: any) {
            Post.belongsTo(models.User, { foreignKey: 'userId', as: 'posts' });

        }
    }
    Post.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            unique: true,
            field: 'user_id'
        },
        category: {
            type: DataTypes.STRING,
            field: 'category'
        },
        tags: {
            type: DataTypes.STRING,
            field: 'tags'
        },
        mediaFile: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            field: 'media_file'
        },

    }, {
        sequelize,
        modelName: 'Post',
    });
    return Post;
}