import express from 'express';
import 'express-async-errors';
import * as tweetController from '../controller/tweet.js';
import { validate } from '../middleware/validator.js';
import { body } from 'express-validator';
import { isAuth } from '../middleware/auth.js';
const router = express.Router();

// GET /tweets
// GET /tweets?username=:username
router.get('/', isAuth, tweetController.getTweets);

// GET /tweets/:id
router.get('/:id', isAuth, tweetController.getTweet);

// POST /tweeets
router.post(
  '/',
  isAuth,
  [
    body('text')
      .trim()
      .isLength({ min: 3 })
      .withMessage('text should be at least 3 charactoers'),
    validate,
  ],
  tweetController.createTweet
);

// PUT /tweets/:id
router.put(
  '/:id',
  isAuth,
  [
    body('text')
      .trim()
      .isLength({ min: 3 })
      .withMessage('text should be at least 3 charactoers'),
    validate,
  ],
  tweetController.updateTweet
);

// DELETE /tweets/:id
router.delete('/:id', isAuth, tweetController.deleteTweet);

export default router;
