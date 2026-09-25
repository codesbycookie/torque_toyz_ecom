import { Request, Response } from "express";

import * as service from "./order.services.ts";
import { CreateOrderPayload } from "@typings/order.types.ts";
import { createStatusControllers } from "@core/constants/createstatuscontroller.constant.ts";
import sendResponse from "@core/constants/responsewrapper.constant.ts";
import { buildQuery } from "@core/constants/querybuilder.constant.ts";
import { wrapControllers } from "@core/constants/wrapcontroller.constant.ts";
import { AccessRequest } from "@core/middlewares/access.middleware.ts";

const orderStatus = createStatusControllers(
  {
    remove: service.removeOrder,
    retrieve: service.retrieveOrder,
  },
  "order",
);

const controllers = {
  createOrder: async (
    req: AccessRequest<{}, {}, CreateOrderPayload>,
    res: Response,
  ) => {
    const userId = req.user!.id;
    const order = await service.createOrder(userId, req.body);
    return sendResponse.created(res, "Order", order);
  },

  getAllOrders: async (req: AccessRequest, res: Response) => {
    const queries = buildQuery(req);
    const result = await service.getAllOrders(queries, req.user?.role);
    return sendResponse.paginated(res, "order", result);
  },

  getMyOrders: async (req: AccessRequest, res: Response) => {
    const userId = req.user!.id;
    const orders = await service.getOrdersByUser(userId);
    return sendResponse.fetched(res, "orders", orders);
  },

  getOrderById: async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const order = await service.getOrderById(id);
    if (!order) return sendResponse.notFound(res, "order");
    return sendResponse.fetched(res, "order", order);
  },

  updateOrderStatus: async (
    req: Request<{ id: string }, {}, { status: string; note?: string }>,
    res: Response,
  ) => {
    const { id } = req.params;
    const { status, note } = req.body;
    const order = await service.updateOrderStatus(id, status as any, note);
    if (!order) return sendResponse.notFound(res, "order");
    return sendResponse.updated(res, "order", order);
  },
  setDeliveryPartnerUrl: async (
    req: Request<{ id: string }, {}, { url: string }>,
    res: Response,
  ) => {
    const { id } = req.params;
    const { url } = req.body;
    const order = await service.setDeliveryPartnerUrl(id, url);
    if (!order) return sendResponse.notFound(res, "order");
    return sendResponse.updated(res, "order", order);
  },

  updatePaymentStatus: async (
    req: Request<
      { id: string },
      {},
      { status: string; transaction_id?: string }
    >,
    res: Response,
  ) => {
    const { id } = req.params;
    const { status, transaction_id } = req.body;
    const order = await service.updatePaymentStatus(
      id,
      status as any,
      transaction_id,
    );
    if (!order) return sendResponse.notFound(res, "order");
    return sendResponse.updated(res, "order", order);
  },

  deleteOrder: orderStatus.softDelete,
  retrieveOrder: orderStatus.retrieve,

  getDraft: async (req: Request, res: Response) => {
    const guestId = (req.headers['x-cart-id'] as string) || '';
    if (!guestId) return sendResponse.badRequest(res, 'x-cart-id header is required');
    const userId = (req as any).user?.id;
    const order = await service.getDraftOrder(guestId, userId);
    return sendResponse.fetched(res, "draft order", order);
  },

  addItemToDraft: async (req: Request, res: Response) => {
    const guestId = (req.headers['x-cart-id'] as string) || '';
    if (!guestId) return sendResponse.badRequest(res, 'x-cart-id header is required');
    const { productId, quantity } = req.body;
    if (!productId || !quantity) return sendResponse.badRequest(res, 'productId and quantity required');
    const userId = (req as any).user?.id;
    const order = await service.addItemToDraft(guestId, productId, Number(quantity), userId);
    return sendResponse.updated(res, "draft order", order);
  },

  updateDraftQuantity: async (req: Request, res: Response) => {
    const guestId = (req.headers['x-cart-id'] as string) || '';
    if (!guestId) return sendResponse.badRequest(res, 'x-cart-id header is required');
    const { productId, quantity } = req.body;
    if (!productId || quantity === undefined) return sendResponse.badRequest(res, 'productId and quantity required');
    const userId = (req as any).user?.id;
    const order = await service.updateDraftItemQuantity(guestId, productId, Number(quantity), userId);
    return sendResponse.updated(res, "draft order", order);
  },

  removeDraftItem: async (req: Request, res: Response) => {
    const guestId = (req.headers['x-cart-id'] as string) || '';
    if (!guestId) return sendResponse.badRequest(res, 'x-cart-id header is required');
    const { productId } = req.params;
    if (!productId) return sendResponse.badRequest(res, 'productId parameter required');
    const userId = (req as any).user?.id;
    const order = await service.removeItemFromDraft(guestId, productId as string, userId);
    return sendResponse.updated(res, "draft order", order);
  },

  updateDraftAddress: async (req: Request, res: Response) => {
    const guestId = (req.headers['x-cart-id'] as string) || '';
    if (!guestId) return sendResponse.badRequest(res, 'x-cart-id header is required');
    const { shipping_address } = req.body;
    const userId = (req as any).user?.id;
    const order = await service.updateDraftShippingAddress(guestId, shipping_address, userId);
    return sendResponse.updated(res, "draft order", order);
  },

  clearDraft: async (req: Request, res: Response) => {
    const guestId = (req.headers['x-cart-id'] as string) || '';
    if (!guestId) return sendResponse.badRequest(res, 'x-cart-id header is required');
    const userId = (req as any).user?.id;
    const order = await service.clearDraft(guestId, userId);
    return sendResponse.updated(res, "draft order", order);
  },

  checkoutDraft: async (req: Request, res: Response) => {
    const guestId = (req.headers['x-cart-id'] as string) || '';
    if (!guestId) return sendResponse.badRequest(res, 'x-cart-id header is required');
    const userId = (req as any).user?.id;
    const order = await service.checkoutDraftOrder(guestId, req.body, userId);
    return sendResponse.updated(res, "order placed", order);
  }
};

export const {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  setDeliveryPartnerUrl,
  deleteOrder,
  retrieveOrder,
  getDraft,
  addItemToDraft,
  updateDraftQuantity,
  removeDraftItem,
  updateDraftAddress,
  clearDraft,
  checkoutDraft
} = wrapControllers(controllers);
