
import { DataTypes, Model, Sequelize } from 'sequelize';
import { IUserEventAttributes } from '../interfaces/userEvent.interface';
export default (sequelize: Sequelize) => {
  class UserEvent extends Model<IUserEventAttributes> implements IUserEventAttributes {
    id?: number;
    user_id?: any;
    event_id?: any;
    status?: string | undefined;

    static associate(models: any) {
      models.User.belongsToMany(models.Event, { through: 'UserEvent', foreignKey: 'user_id' });
      models.Event.belongsToMany(models.User, { through: 'UserEvent', foreignKey: 'event_id' });    
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
    status: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'UserEvent',
  });

  return UserEvent;
};
