import { Request, Response } from 'express';

import * as service from './wishlist.services.ts';
import sendResponse from '@core/constants/responsewrapper.constant.ts';
import { wrapControllers } from '@core/constants/wrapcontroller.constant.ts';

const controllers = {
  getMyWishlist: async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const wishlist = await service.getWishlistByUser(userId);
    if (!wishlist) return sendResponse.notFound(res, 'wishlist');
    return sendResponse.fetched(res, 'wishlist', wishlist);
  },

  addProduct: async (req: Request<{}, {}, { product: string }>, res: Response) => {
    const userId = req.user!.id;
    const { product } = req.body;
    const wishlist = await service.addProduct(userId, product);
    return sendResponse.updated(res, 'wishlist', wishlist);
  },

  removeProduct: async (req: Request<{ productId: string }>, res: Response) => {
    const userId = req.user!.id;
    const { productId } = req.params;
    const wishlist = await service.removeProduct(userId, productId);
    if (!wishlist) return sendResponse.notFound(res, 'wishlist');
    return sendResponse.updated(res, 'wishlist', wishlist);
  },

  clearWishlist: async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const wishlist = await service.clearWishlist(userId);
    if (!wishlist) return sendResponse.notFound(res, 'wishlist');
    return sendResponse.updated(res, 'wishlist', wishlist);
  },
};

export const { getMyWishlist, addProduct, removeProduct, clearWishlist } =
  wrapControllers(controllers);