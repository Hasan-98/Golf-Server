'use strict';

import User from './user'
const env = "development";
const config = require(__dirname + '/../config/config.js')[env];
import { Sequelize } from "sequelize";

const sequelize : Sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
sequelize.sync();

  (async () => {
    try {
      await sequelize.sync();
      console.log('Connection has been established successfully.');
    } catch (error : any) {
      console.error('Unable to connect to the database:', error);
    }
  })();

const models = { 
    User: User(sequelize ) ,
};


Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

export { models };