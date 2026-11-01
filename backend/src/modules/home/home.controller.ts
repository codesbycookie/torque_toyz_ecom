import { Response } from 'express';
import { AuthRequest } from '@core/middlewares/auth.middleware.ts';
import sendResponse from '@core/constants/responsewrapper.constant.ts';
import { wrapControllers } from '@core/constants/wrapcontroller.constant.ts';
import * as service from './home.services.ts';

const controllers = {
  getHomeData: async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    const data = await service.getHomePageData(userId);
    return sendResponse.success(res, 'Home data retrieved successfully', data);
  },
};

export const { getHomeData } = wrapControllers(controllers);

