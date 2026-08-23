import { Request, Response } from 'express';

import * as service from './order.services.ts';
import { CreateOrderPayload } from '@typings/order.types.ts';
import { createStatusControllers } from '@core/constants/createstatuscontroller.constant.ts';
import sendResponse from '@core/constants/responsewrapper.constant.ts';
import { buildQuery } from '@core/constants/querybuilder.constant.ts';
import { wrapControllers } from '@core/constants/wrapcontroller.constant.ts';
import { AccessRequest } from '@core/middlewares/access.middleware.ts';

const orderStatus = createStatusControllers(
    {
        remove: service.removeOrder,
        retrieve: service.retrieveOrder,
    },
    'order'
);

const controllers = {
    createOrder: async (req: AccessRequest<{}, {}, CreateOrderPayload>, res: Response) => {
        const userId = req.user!.id;
        const order = await service.createOrder(userId, req.body);
        return sendResponse.created(res, 'Order', order);
    },

    getAllOrders: async (req: AccessRequest, res: Response) => {
        const queries = buildQuery(req);
        const result = await service.getAllOrders(queries, req.user?.role);
        return sendResponse.paginated(res, 'order', result);
    },

    getMyOrders: async (req: AccessRequest, res: Response) => {
        const userId = req.user!.id;
        const orders = await service.getOrdersByUser(userId);
        return sendResponse.fetched(res, 'orders', orders);
    },

    getOrderById: async (req: Request<{ id: string }>, res: Response) => {
        const { id } = req.params;
        const order = await service.getOrderById(id);
        if (!order) return sendResponse.notFound(res, 'order');
        return sendResponse.fetched(res, 'order', order);
    },

    updateOrderStatus: async (
        req: Request<{ id: string }, {}, { status: string; note?: string }>,
        res: Response
    ) => {
        const { id } = req.params;
        const { status, note } = req.body;
        const order = await service.updateOrderStatus(id, status as any, note);
        if (!order) return sendResponse.notFound(res, 'order');
        return sendResponse.updated(res, 'order', order);
    },

    updatePaymentStatus: async (
        req: Request<{ id: string }, {}, { status: string; transaction_id?: string }>,
        res: Response
    ) => {
        const { id } = req.params;
        const { status, transaction_id } = req.body;
        const order = await service.updatePaymentStatus(id, status as any, transaction_id);
        if (!order) return sendResponse.notFound(res, 'order');
        return sendResponse.updated(res, 'order', order);
    },

    deleteOrder: orderStatus.softDelete,
    retrieveOrder: orderStatus.retrieve,
};

export const {
    createOrder,
    getAllOrders,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
    updatePaymentStatus,
    deleteOrder,
    retrieveOrder,
} = wrapControllers(controllers);