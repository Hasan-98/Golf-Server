import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import bodyParser from 'body-parser';
import session from 'express-session';
require('dotenv').config();
require('./auth/passport');

require('./models/index');

import middlewares from './middlewares';
import user from './router/router';

const app: any = express();
// const http = require('http');
// const server = http.createServer(app);
// const io = require('socket.io')(server);
// app.set('io', io);
const jwtSecret = process.env.JWT_SECRET || 'secret';
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: jwtSecret,
  resave: false,
  saveUninitialized: false
}));
app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api', user);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export { app}