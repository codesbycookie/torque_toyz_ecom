import { Router } from 'express';
import { authMiddleware } from '@core/middlewares/auth.middleware.js';
import { zodValidate } from '@core/middlewares/zod.validator.js';
import { addProductToWishlistSchema } from './wishlist.validator.js';

import {
  getMyWishlist,
  addProduct,
  removeProduct,
  clearWishlist,
} from './wishlist.controller.js';
import { accessControl } from '@core/middlewares/access.middleware.ts';

const router = Router();

router.use(authMiddleware);
router.use(accessControl)

router.get('/', getMyWishlist);

router.post(
  '/',
  zodValidate(addProductToWishlistSchema, 'body', 'AddProductToWishlistSchema'),
  addProduct
);

router.delete('/:productId', removeProduct);

router.delete('/', clearWishlist);

export default router;