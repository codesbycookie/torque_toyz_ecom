import { Request, Response } from 'express';

import * as service from './category.services.ts';
import { CreateCategoryPayload, UpdateCategoryPayload } from '@typings/category.types.ts';
import sendResponse from '@core/constants/responsewrapper.constant.ts';
import { buildQuery } from '@core/constants/querybuilder.constant.ts';
import { wrapControllers } from '@core/constants/wrapcontroller.constant.ts';
import { AccessRequest } from '@core/middlewares/access.middleware.ts';

const controllers = {
  createCategory: async (req: Request<{}, {}, CreateCategoryPayload>, res: Response) => {
    const category = await service.createCategory(req.body);
    return sendResponse.created(res, 'Category', category);
  },

  getAllCategories: async (req: AccessRequest, res: Response) => {
    const queries = buildQuery(req);
    const result = await service.getAllCategories(queries, req.user?.role);
    return sendResponse.paginated(res, 'category', result);
  },

  getCategoryById: async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const category = await service.getCategoryById(id);
    if (!category) return sendResponse.notFound(res, 'category');
    return sendResponse.fetched(res, 'category', category);
  },

  getCategoryBySlug: async (req: Request<{ slug: string }>, res: Response) => {
    const { slug } = req.params;
    const category = await service.getCategoryBySlug(slug);
    if (!category) return sendResponse.notFound(res, 'category');
    return sendResponse.fetched(res, 'category', category);
  },

  updateCategory: async (req: Request<{ id: string }, {}, UpdateCategoryPayload>, res: Response) => {
    const { id } = req.params;
    const category = await service.updateCategory(id, req.body);
    if (!category) return sendResponse.notFound(res, 'category');
    return sendResponse.updated(res, 'category', category);
  },

  setCategoryActiveStatus: async (req: Request<{ id: string }, {}, { active: boolean }>, res: Response) => {
    const { id } = req.params;
    const { active } = req.body;
    const category = await service.setCategoryActiveStatus(id, active);
    if (!category) return sendResponse.notFound(res, 'category');
    return sendResponse.updated(res, 'category', category);
  },

  eraseCategory: async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const category = await service.eraseCategory(id);
    if (!category) return sendResponse.notFound(res, 'category');
    return sendResponse.deleted(res, 'category');
  },
};

export const {
  createCategory,
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
  setCategoryActiveStatus,
  eraseCategory,
} = wrapControllers(controllers);