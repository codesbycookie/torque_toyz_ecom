import { Request, Response } from 'express';

import * as service from './analytics.services.ts';
import sendResponse from '@core/constants/responsewrapper.constant.ts';
import { wrapControllers } from '@core/constants/wrapcontroller.constant.ts';

const getRange = (req: Request) => ({
    from: req.query.from as string | undefined,
    to: req.query.to as string | undefined,
});

const controllers = {
    getRevenueSummary: async (req: Request, res: Response) => {
        const summary = await service.getRevenueSummary(getRange(req));
        return sendResponse.fetched(res, 'revenue summary', summary);
    },

    getRevenueByMonth: async (req: Request, res: Response) => {
        const data = await service.getRevenueByMonth(getRange(req));
        return sendResponse.fetched(res, 'monthly revenue', data);
    },

    getOrderStatusBreakdown: async (req: Request, res: Response) => {
        const data = await service.getOrderStatusBreakdown(getRange(req));
        return sendResponse.fetched(res, 'order status breakdown', data);
    },

    getTopProducts: async (req: Request, res: Response) => {
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const data = await service.getTopProducts(getRange(req), limit);
        return sendResponse.fetched(res, 'top products', data);
    },

    getRevenueByLocation: async (req: Request, res: Response) => {
        const data = await service.getRevenueByLocation(getRange(req));
        return sendResponse.fetched(res, 'revenue by location', data);
    },
    getCustomerInsights: async (req: Request, res: Response) => {
        const data = await service.getCustomerInsights(getRange(req));
        return sendResponse.fetched(res, 'customer insights', data);
    },

    getInventoryVelocity: async (req: Request, res: Response) => {
        const days = req.query.days ? Number(req.query.days) : 30;
        const data = await service.getInventoryVelocity(getRange(req), days);
        return sendResponse.fetched(res, 'inventory velocity', data);
    },

    getDeliveryPerformance: async (req: Request, res: Response) => {
        const data = await service.getDeliveryPerformance(getRange(req));
        return sendResponse.fetched(res, 'delivery performance', data);
    },

    getCancellationRefundRate: async (req: Request, res: Response) => {
        const data = await service.getCancellationRefundRate(getRange(req));
        return sendResponse.fetched(res, 'cancellation and refund rate', data);
    },

    getPeakTimes: async (req: Request, res: Response) => {
        const data = await service.getPeakTimes(getRange(req));
        return sendResponse.fetched(res, 'peak order times', data);
    },

};

export const {
    getRevenueSummary,
    getRevenueByMonth,
    getOrderStatusBreakdown,
    getTopProducts,
    getRevenueByLocation,
    getCustomerInsights,
    getInventoryVelocity,
    getDeliveryPerformance,
    getCancellationRefundRate,
    getPeakTimes,
} = wrapControllers(controllers);