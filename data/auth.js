//1.순수 SQL 사용
import { db } from '../db/database.js';

//2.sequel 사용
import SQ from 'sequelize';
import { sequelize } from '../db/databaseSequel.js';
const DataTypes = SQ.DataTypes;

//sequelize 사용 시 user 테이블 만드는 코드, users테이블이 존재하지 않을때만 테이블을 만든다!! 이미 존재한다면 define은 실행되지 않는다.
//고로 테이블 컬럼을 바꾸고 싶으면 mysql 워크벤치에서 테이블 삭제하고 해당 코드 실행시켜야함!!!
export const User = sequelize.define(
  'user',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    url: DataTypes.TEXT,
  },
  {
    //자동으로 생성되는 createAt, updateAt을 삭제할수있음
    timestamps: false,
  }
);

//<로컬 테스트용>
let users = [
  {
    id: '1',
    username: 'bob',
    password: '$2b$12$G9xf6asdglkajnsdglkasdjngalsndjg/alsdjgnaslkgunasldg',
    name: 'Bob',
    email: 'bob@gmail.com',
    url: 'https://widgetwhats.com/app/uploads/2019/11/free-profile-photo-whatsapp-1.png',
  },
  {
    id: '2',
    username: 'ellie',
    password: '$2b$12$G9xf6asdglkajnsdglkasdjngalsndjg/alsdjgnaslkgunasldg',
    name: 'Ellie',
    email: 'ekkue@gmail.com',
  },
];

//특정유저의 이름에 매칭되는 레코드 뽑아오기
export async function findByUsername(username) {
  //<로컬 테스트용>
  //return users.find(user => user.username === username);

  //<Sequelize>
  //컬럼의 username과 인자로 받은 username이 같은 레코드를 찾는 조건
  //알아서 찾은 데이터를 return 해주기떄문에 순수 SQL처럼 return[0][0]이렇게 안해도됨
  return User.findOne({ where: { username: username } });

  //<순수SQL>
  return db
    .execute('SELECT * FROM users WHERE username=?', [username])
    .then(result => result[0][0]);
}

//특정유저의 고유한 id에 매칭되는 레코드 뽑아오기
export async function findById(id) {
  //<로컬 테스트용>
  //return users.find(user => user.id === id);

  //<Sequelize>
  //User table의 프라이머리키를 기준으로 레코드를 뽑을때 쓰는 함수임
  return User.findByPk(id);

  //<순수SQL>
  return db
    .execute('SELECT * FROM users WHERE id=?', [id])
    .then(result => result[0][0]);
}

//새로운 유저 추가하기
export async function createUser(user) {
  //<로컬 테스트용>
  //Date.now()를 고유한 id로 사용하려고함!
  // const created = { ...user, id: Date.now().toString() };
  // users.push(created);
  // return created.id;

  //<Sequelize>
  //추가한 데이터의 주요키가 dataValues.id로 반환된다
  return User.create(user).then(data => {
    return data.dataValues.id;
  });

  //순수SQL
  const { username, password, name, email, url } = user;
  return db
    .execute(
      //id를 insert해주지않는이유는 스키마설정시 id는 자동증가되게 설정했기떄문이다.
      //?에 들어갈 value, 는 두번째인자의 배열안에 순서대로 명시해주면된다.
      'INSERT INTO users (username, password, name, email, url) VALUES (?,?,?,?,?)',
      [username, password, name, email, url]
    ) //추가한 데이터의 주요키가 insertId로 반환된다
    .then(result => result[0].insertId);
}
