import { Router, json } from 'express';
import { query } from 'express-validator';
import {
  getTrendingTracks,
} from '../controllers';

const router = Router();
router.use(json());

router.use(
  '/trending',
  [
    query('genre')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('genre must have a value')
      .matches(/^[a-zA-Z&\-_ ]+$/)
      .withMessage('genre can only contain letters, &, -, _ and spaces')
      .escape(),

    query('page')
      .default('1')
      .trim()
      .isInt({ gt: 0 })
      .withMessage('page can only be an integer > 0')
      .escape(),

    query('page_size')
      .default('20')
      .trim()
      .isInt({ min: 10, max: 40 })
      .withMessage('page_size can only be between 10-40')
      .escape(),

    query('time')
      .default('week')
      .trim()
      .isIn(['week', 'month', 'year', 'allTime'])
      .withMessage('time can only be week, month, year or allTime')
      .escape(),

    query('sort_by')
      .optional()
      .equals('release_date')
      .escape(),
  ],
  getTrendingTracks,
);

export default router;