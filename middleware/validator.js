import { validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  //모든에러를 한번에 내려주는것이 아니라 하나씩만 내려주고싶다면 [0]으로 내려줘도됨
  return res.status(400).json({ message: errors.array()[0].msg });
};
