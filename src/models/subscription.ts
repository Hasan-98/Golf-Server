import { DataTypes, Model, Sequelize } from "sequelize";
import { ISubscriptionAttributes } from "../interfaces/subscription.interface";

export default (sequelize: Sequelize) => {
  class Subscription
    extends Model<ISubscriptionAttributes>
    implements ISubscriptionAttributes
  {
    id!: number;
    content!: string;

    static associate(models: any) {
    }
  }

  Subscription.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      fee: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

    },
    {
      sequelize,
      modelName: "Subscription",
    }
  );

  return Subscription;
};
