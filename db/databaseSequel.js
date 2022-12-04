import SQ from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

export const sequelize = new SQ.Sequelize(
  process.env.DB_DATABASE_SEQUEL,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    //어떤 관계형 DB를 사용하고있는지 명시해줘야함
    dialect: 'mysql',
    // Database 실행시 로그 출력안됨
    logging: false,
  }
);
