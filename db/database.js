import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

//createPool을 이용해서 mysql서버와 연결시킬수있다.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
});

export const db = pool.promise();
