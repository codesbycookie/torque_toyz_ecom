import { Router } from 'express';
import { authMiddleware } from '@core/middlewares/auth.middleware.ts';
import { zodValidate } from '@core/middlewares/zod.validator.js';
import {
  createCategorySchema,
  updateCategorySchema,
  setCategoryActiveStatusSchema,
} from './category.validator.js';

import {
  createCategory,
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
  setCategoryActiveStatus,
  deleteCategory,
  retrieveCategory,
  eraseCategory,
} from './category.controller.js';

const router = Router();

// public — storefront needs to browse/filter by category without login
router.get('/', getAllCategories);
router.get('/slug/:slug', getCategoryBySlug);
router.get('/:id', getCategoryById);


// protected — admin manages categories
router.use(authMiddleware);

router.post('/', zodValidate(createCategorySchema, 'body', 'CreateCategorySchema'), createCategory);
router.put('/:id', zodValidate(updateCategorySchema, 'body', 'UpdateCategorySchema'), updateCategory);
router.patch(
  '/:id/active-status',
  zodValidate(setCategoryActiveStatusSchema, 'body', 'SetCategoryActiveStatusSchema'),
  setCategoryActiveStatus
);

router.delete('/:id', deleteCategory);
router.put('/:id/retrieve', retrieveCategory);
router.delete('/:id/erase', eraseCategory);

export default router;