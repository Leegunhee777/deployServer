import jwt from 'jsonwebtoken';
import * as userRepository from '../data/auth.js';
import { jwtSecretKey } from '../controller/auth.js';

const AUTH_ERROR = { message: 'Authentication Error' };

export const isAuth = async (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!(authHeader && authHeader.startsWith('Bearer '))) {
    return res.status(401).json(AUTH_ERROR);
  }

  const token = authHeader.split(' ')[1];
  //유효성에 토큰만료까지도 체크해줌
  jwt.verify(token, jwtSecretKey, async (error, decoded) => {
    if (error) {
      return res.status(401).json(AUTH_ERROR);
    }
    //상단에서 verify를 통해 jwt에 대한 인증 유효성검사를 하였기때문에!!
    //findById를 통해 추가적으로 확인하는 과정은 생략해도 전혀 지장이없는 로직임
    const user = await userRepository.findById(decoded.id);
    if (!user) {
      return res.status(401).json(AUTH_ERROR);
    }

    //서버의 미들웨어에서 자체적으로!!! req에 커스텀으로 userId라는 키값과 token 키값을 추가해줌
    //다음 미들웨어에서 쉽게 해당 정보를 이용할수있도록 하기위함임
    req.userId = user.id;
    req.token = token;
    next();
  });
};
