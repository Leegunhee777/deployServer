import * as userRepository from '../data/auth.js';
import { db } from '../db/database.js';

//2.sequel 사용
import { User } from '../data/auth.js';
import SQ from 'sequelize';
import { sequelize } from '../db/databaseSequel.js';
const DataTypes = SQ.DataTypes;
const Sequelize = SQ.Sequelize;

//sequelize 사용 시 tweets 테이블 만드는 코드, tweets테이블이 존재하지 않을때만 테이블을 만든다!! 이미 존재한다면 define은 실행되지 않는다.
//고로 테이블 컬럼을 바꾸고 싶으면 mysql 워크벤치에서 테이블 삭제하고 해당 코드 실행시켜야함!!!
const Tweets = sequelize.define('tweets', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

//이렇게만하면 자동으로 외래키를 만들어줌, Tweets는 User에 종속된다
//그럼 User테이블의 고유키를 참조하는
//Tweets 테이블에 userId라는 외래키가 자동으로 만들어진다.
//User 테이블의 컬럼id가 고유키이기때문에 (User+id)이기떄문에 Tweets의 외래키 네이밍은 userId라는 이름으로 컬럼이 자동으로 생성된다.
Tweets.belongsTo(User, { as: 'user' });

//<로컬 테스트용>
let tweets = [
  {
    id: '1',
    text: '드림코더분들 화이팅!',
    createdAt: new Date().toString(),
    userId: '1',
  },
];

//모든 트윗메세지 가져오기,  작성한 사용자 정보포함  전부!!!
export async function getAll() {
  //<로컬 테스트용>
  // return Promise.all(
  //   tweets.map(async tweet => {
  //     const { username, name, url } = await userRepository.findById(
  //       tweet.userId
  //     );
  //     return { ...tweet, username, name, url };
  //   })
  // );

  //<Sequelize>
  return Tweets.findAll({
    attributes: [
      'id',
      'text',
      'createdAt',
      'userId',
      [Sequelize.col('user.name'), 'name'],
      [Sequelize.col('user.username'), 'username'],
      [Sequelize.col('user.url'), 'url'],
    ],
    include: {
      model: User,
      as: 'user',
      attributes: [],
    },
    order: [['createdAt', 'DESC']],
  });

  //<순수SQL>
  return db
    .execute(
      'SELECT tw.id, tw.text, tw.createdAt, tw.userId, us.username, us.name, us.url FROM tweets as tw JOIN users as us ON tw.userId=us.id ORDER BY tw.createdAt DESC'
    )
    .then(result => result[0]);
}

// 모든 트윗, 작성한 사용자 정보포함 가져오기 단 (인자로 받은 특정 유저네임이 작성한것에 대해서!)
export async function getAllByUsername(username) {
  //<로컬 테스트용>
  // return getAll().then(tweets => {
  //   return tweets.filter(tweet => tweet.username === username);
  // });

  //<Sequelize>
  return Tweets.findAll({
    attributes: [
      'id',
      'text',
      'createdAt',
      'userId',
      [Sequelize.col('user.name'), 'name'],
      [Sequelize.col('user.username'), 'username'],
      [Sequelize.col('user.url'), 'url'],
    ],
    include: {
      model: User,
      as: 'user',
      attributes: [],
      where: { username },
    },
    order: [['createdAt', 'DESC']],
  });

  //<순수SQL>
  return db
    .execute(
      'SELECT tw.id, tw.text, tw.createdAt, tw.userId, us.username, us.name, us.url FROM tweets as tw JOIN users as us ON tw.userId=us.id WHERE username=? ORDER BY tw.createdAt DESC',
      [username]
    )
    .then(result => result[0]);
}

//특정트윗가져오기!!!작성한 사용자 정보포함!!! 단!!!(인자로 받은 특정트윗의 고유id를 기준)
export async function getById(id) {
  //<로컬 테스트용>
  // const found = tweets.find(tweet => tweet.id === id);
  // if (!found) {
  //   return null;
  // }
  // const { username, name, url } = await userRepository.findById(found.userId);
  // return { ...found, username, name, url };

  //<Sequelize>
  return Tweets.findOne({
    attributes: [
      'id',
      'text',
      'createdAt',
      'userId',
      [Sequelize.col('user.name'), 'name'],
      [Sequelize.col('user.username'), 'username'],
      [Sequelize.col('user.url'), 'url'],
    ],
    include: {
      model: User,
      as: 'user',
      attributes: [],
    },
    where: { id },
  });

  //<순수SQL>
  return db
    .execute(
      'SELECT tw.id, tw.text, tw.createdAt, tw.userId, us.username, us.name, us.url FROM tweets as tw JOIN users as us ON tw.userId=us.id WHERE tw.id=? ORDER BY tw.createdAt DESC',
      [id]
    )
    .then(result => result[0][0]);
}

export async function create(text, userId) {
  //<로컬 테스트용>
  // const tweet = {
  //   id: Date.now().toString(),
  //   text,
  //   createdAt: new Date(),
  //   userId,
  // };
  // tweets = [tweet, ...tweets];
  // return getById(tweet.id);
  //<Sequelize>
  return Tweets.create({ text, userId }).then(data => {
    //추가한 데이터의 주요키가 dataValues.id로 반환된다
    return getById(data.dataValues.id);
  });

  //<순수SQL>
  return (
    db
      .execute('INSERT INTO tweets (text, createdAt, userId) VALUES(?,?,?)', [
        text,
        new Date(),
        userId,
      ]) //tweets테이블에 데이터를추가하면 result[0]에서 추가한 데이터에 대한 부분적인 정보를 읽을수있으며 inserId를 통해 해당 레코드의 primary key에 대한 값을 받을수있다.
      //해당 primary key와 getById함수를 이용해서 해당 tweet 정보 + 유저의 정보를 가져와서 리턴해준다!
      .then(result => getById(result[0].insertId))
  );
}

export async function update(id, text) {
  //<로컬 테스트용>
  // const tweet = tweets.find(tweet => tweet.id === id);
  // if (tweet) {
  //   tweet.text = text;
  // }
  // return getById(tweet.id);

  //<Sequelize>
  return Tweets.findByPk(id, {
    attributes: [
      'id',
      'text',
      'createdAt',
      'userId',
      [Sequelize.col('user.name'), 'name'],
      [Sequelize.col('user.username'), 'username'],
      [Sequelize.col('user.url'), 'url'],
    ],
    include: {
      model: User,
      as: 'user',
      attributes: [],
    },
  }).then(tweet => {
    //뽑아온 레코드를 바로 업데이트하고 save할수있다 아주 매력터지는 sequelize의 기능
    tweet.text = text;
    //save()를하먄 해당 레코드 DB정보가 업데이트된다. 업데이트된 레코들 반환해준다
    return tweet.save();
  });
  //<순수SQL>
  return (
    db
      .execute('UPDATE tweets SET text=? WHERE id=?', [text, id])
      //해당 tweet 정보 + 유저의 정보를 가져와서 리턴해준다!
      .then(() => getById(id))
  );
}

export async function remove(id) {
  //<로컬 테스트용>
  // tweets = tweets.filter(tweet => tweet.id !== id);

  //<Sequelize>
  return Tweets.findByPk(id).then(tweet => {
    //특정 레코드 삭제
    tweet.destroy();
  });

  //<순수SQL>
  return db.execute('DELETE FROM tweets WHERE id=?', [id]);
}
