import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import tweetsRouter from './router/tweets.js';
import authRouter from './router/auth.js';
import dotenv from 'dotenv';

import { initSocket } from './connection/socket.js';
import { db } from './db/database.js';
import { sequelize } from './db/databaseSequel.js';

dotenv.config();
// console.log(process.env);
const app = express();

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(morgan('tiny'));

app.use('/tweets', tweetsRouter);
app.use('/auth', authRouter);

app.use((req, res, next) => {
  res.sendStatus(404);
});

app.use((error, req, res, next) => {
  console.error(error);
  res.sendStatus(500);
});

//소켓 사용하기 전 원래 코드
//1.app.listen(8080);

//2.썡 SQL사용시 db connection
/* 
  db.getConnection()
   .then(connection => {
     // console.log(connection);

     //db connection 후에 서버 open
     const server = app.listen(8080);
     //소켓사용을 위한것
     initSocket(server);
   })
   .catch(error => {
     console.log(error);

   });
*/

//3. sequelize 사용시 db connection
sequelize.sync().then(client => {
  console.log(`Server is Started!!! ${new Date()}`);
  const server = app.listen(process.env.SERVER_PORT);
  //소켓사용을 위한것
  initSocket(server);
});
