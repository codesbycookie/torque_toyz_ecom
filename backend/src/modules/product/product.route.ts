import { Router } from 'express';
import { upload } from '@config/cloudinary.config.ts';
import { parseProductUpload } from '@core/middlewares/uploadparser.middleware.ts';
import { authMiddleware } from '@core/middlewares/auth.middleware.js';
import { optionalAuthMiddleware } from '@core/middlewares/optionalAuth.middleware.ts';
// import { accessControl } from '@core/middlewares/access.middleware.js';
import { zodValidate } from '@core/middlewares/zod.validator.js';
import {
  createProductSchema,
  updateProductSchema,
  setProductActiveStatusSchema,
} from './product.validator.js';

import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  setProductActiveStatus,
  retrieveProduct,
  eraseProduct,
  getProductBySlug,
} from './product.controller.js';

const router = Router();


// router.use(accessControl);


router.get('/', optionalAuthMiddleware, getAllProducts);
router.get('/:id', optionalAuthMiddleware, getProductById);
router.get('/slug/:slug', optionalAuthMiddleware, getProductBySlug);
router.get('/:slug', optionalAuthMiddleware, getProductBySlug);

router.use(authMiddleware);

router.post(
  '/',
  upload.array('images', 5),
  parseProductUpload,
  zodValidate(createProductSchema, 'body', 'CreateProductSchema'),
  createProduct
);

router.put(
  '/:id',
  upload.array('images', 5),
  parseProductUpload,
  zodValidate(updateProductSchema, 'body', 'UpdateProductSchema'),
  updateProduct
);

router.delete('/:id', deleteProduct);

router.patch(
  '/:id/active-status',
  zodValidate(setProductActiveStatusSchema, 'body', 'SetProductActiveStatusSchema'),
  setProductActiveStatus
);

router.put('/:id/retrieve', retrieveProduct);

router.delete('/:id/erase', eraseProduct);

export default router;