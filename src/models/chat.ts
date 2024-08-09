

import { DataTypes, Model, Sequelize } from "sequelize";
import { IChatAttributes } from "../interfaces/chat.interface";

export default (sequelize: Sequelize) => {
    class Chat
    extends Model<IChatAttributes>
    implements IChatAttributes{
    id!: number;
    channel!: string;
    event!: string;
    message!: string;
    sender!: string;
    receiver!: string;
    timestamp!: Date;
  }

  Chat.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      channel: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      event: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      sender: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      receiver: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Chat",
      tableName: "messages",
      timestamps: true,
      createdAt: true,
      updatedAt: true,
    }
  );

  return Chat;
};