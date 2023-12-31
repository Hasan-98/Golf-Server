
import { DataTypes, Model, Sequelize } from 'sequelize';
import { IUserEventAttributes } from '../interfaces/userEvent.interface';
export default (sequelize: Sequelize) => {
  class UserEvent extends Model<IUserEventAttributes> implements IUserEventAttributes {
    id!: number;
    content!: string;

    static associate(models: any) {
      models.User.belongsToMany(models.Event, { through: UserEvent });
      models.Event.belongsToMany(models.User, { through: UserEvent });
    }
  }

  UserEvent.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: DataTypes.INTEGER,
    event_id: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'UserEvent',
  });

  return UserEvent;
};
