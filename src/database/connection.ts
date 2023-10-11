import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: 'localhost',
    dialect: 'mysql',
  }
);

//sequelize.sync({ force: false });
//sequelize.authenticate();

(async () => {
  try {
    await sequelize.sync();
    console.log('Connection has been established successfully.');
  } catch (error : any) {
    console.error('Unable to connect to the database:', error);
  }
})();

export default sequelize;
