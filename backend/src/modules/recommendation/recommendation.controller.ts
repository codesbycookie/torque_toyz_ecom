import { Request, Response } from 'express';
import * as service from './recommendation.services.ts';
import sendResponse from '@core/constants/responsewrapper.constant.ts';
import { wrapControllers } from '@core/constants/wrapcontroller.constant.ts';

const controllers = {
  getRecommendations: async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 20;
    const productId = req.query.productId as string | undefined;
    const category = req.query.category as string | undefined;
    const userId = (req as any).user?._id || (req.query.userId as string | undefined);

    let excludeCartIds: string[] | undefined;
    if (req.query.excludeCartIds) {
      if (Array.isArray(req.query.excludeCartIds)) {
        excludeCartIds = req.query.excludeCartIds as string[];
      } else if (typeof req.query.excludeCartIds === 'string') {
        excludeCartIds = (req.query.excludeCartIds as string).split(',');
      }
    }

    const products = await service.getRecommendations({
      limit,
      productId,
      category,
      userId,
      excludeCartIds,
    });

    return sendResponse.fetched(res, 'recommendations', products);
  },
};

export const { getRecommendations } = wrapControllers(controllers);
