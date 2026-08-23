import { Request, Response } from 'express';

import * as service from './review.services.ts';
import { CreateReviewPayload, UpdateReviewPayload } from '@typings/review.types.ts';
import { createStatusControllers } from '@core/constants/createstatuscontroller.constant.ts';
import sendResponse from '@core/constants/responsewrapper.constant.ts';
import { buildQuery } from '@core/constants/querybuilder.constant.ts';
import { wrapControllers } from '@core/constants/wrapcontroller.constant.ts';
import { AccessRequest } from '@core/middlewares/access.middleware.ts';

const reviewStatus = createStatusControllers(
  {
    remove: service.removeReview,
    setActiveStatus: service.setReviewActiveStatus,
    retrieve: service.retrieveReview,
  },
  'review'
);

const controllers = {
  createReview: async (req: AccessRequest<{}, {}, CreateReviewPayload>, res: Response) => {
    const userId = req.user!.id;
    const review = await service.createReview(userId, req.body);
    return sendResponse.created(res, 'Review', review);
  },

  getAllReviews: async (req: AccessRequest, res: Response) => {
    const queries = buildQuery(req);
    const result = await service.getAllReviews(queries, req.user?.role);
    return sendResponse.paginated(res, 'review', result);
  },

  getReviewsByProduct: async (req: Request<{ productId: string }>, res: Response) => {
    const { productId } = req.params;
    const result = await service.getReviewsByProduct(productId);
    return sendResponse.fetched(res, 'reviews', result);
  },

  getReviewById: async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const review = await service.getReviewById(id);
    if (!review) return sendResponse.notFound(res, 'review');
    return sendResponse.fetched(res, 'review', review);
  },

  updateReview: async (req: AccessRequest<{ id: string }, {}, UpdateReviewPayload>, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const review = await service.updateReview(id, userId, req.body);
    if (!review) return sendResponse.notFound(res, 'review');
    return sendResponse.updated(res, 'review', review);
  },

  deleteOwnReview: async (req: AccessRequest<{ id: string }>, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const review = await service.deleteOwnReview(id, userId);
    if (!review) return sendResponse.notFound(res, 'review');
    return sendResponse.deleted(res, 'review');
  },

  deleteReview: reviewStatus.softDelete,
  setReviewActiveStatus: reviewStatus.setActiveStatus,
  retrieveReview: reviewStatus.retrieve,
};

export const {
  createReview,
  getAllReviews,
  getReviewsByProduct,
  getReviewById,
  updateReview,
  deleteOwnReview,
  deleteReview,
  setReviewActiveStatus,
  retrieveReview,
} = wrapControllers(controllers);