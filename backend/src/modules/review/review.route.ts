import { Router } from 'express';
import { authMiddleware } from '@core/middlewares/auth.middleware.js';
// import { accessControl } from '@core/middlewares/access.middleware.js';
import { zodValidate } from '@core/middlewares/zod.validator.js';
import {
  createReviewSchema,
  updateReviewSchema,
  setReviewActiveStatusSchema,
} from './review.validator.js';

import {
  createReview,
  getAllReviews,
  getReviewsByProduct,
  getReviewById,
  updateReview,
  deleteOwnReview,
  deleteReview,
  setReviewActiveStatus,
  retrieveReview,
} from './review.controller.js';

const router = Router();

router.get('/product/:productId', getReviewsByProduct); // public — visible on product page

router.use(authMiddleware);

router.post('/', zodValidate(createReviewSchema, 'body', 'CreateReviewSchema'), createReview);

router.get('/', getAllReviews); // admin listing

router.get('/:id', getReviewById);

router.put('/:id', zodValidate(updateReviewSchema, 'body', 'UpdateReviewSchema'), updateReview);

router.delete('/:id', deleteOwnReview); // customer deletes their own review

// router.use(accessControl); — admin-only from here down
router.delete('/:id/admin', deleteReview);

router.patch(
  '/:id/active-status',
  zodValidate(setReviewActiveStatusSchema, 'body', 'SetReviewActiveStatusSchema'),
  setReviewActiveStatus
);

router.put('/:id/retrieve', retrieveReview);

export default router;