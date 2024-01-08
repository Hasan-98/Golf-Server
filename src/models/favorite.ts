import { DataTypes, Sequelize, Model } from "sequelize";
import { IFavoriteAttributes } from "../interfaces/favourite.interface";

export default (sequelize: Sequelize) => {
    class Favorite extends Model<IFavoriteAttributes> implements IFavoriteAttributes {
        id!: number;
        userId!: number;
        teacherId!: number;


        static associate(models: any) {
            Favorite.belongsTo(models.User, { foreignKey: 'userId' });
            Favorite.belongsTo(models.Teacher, { foreignKey: 'teacherId' });
        }
    }


    Favorite.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            field: 'user_id'
        },
        teacherId: {
            type: DataTypes.INTEGER,
            field: 'teacher_id'
        },
    }, {
        sequelize,
        modelName: 'favorite',
    });

    return Favorite;
}