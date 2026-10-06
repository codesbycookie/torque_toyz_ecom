import { Router } from 'express';
import { authMiddleware } from '@core/middlewares/auth.middleware.js';
// import { accessControl } from '@core/middlewares/access.middleware.js'; // admin-only, ideally
import { zodValidate } from '@core/middlewares/zod.validator.js';
import { dateRangeQuerySchema } from './analytics.validator.js';

import {
    getRevenueSummary,
    getRevenueByMonth,
    getOrderStatusBreakdown,
    getTopProducts,
    getRevenueByLocation,
    getCustomerInsights,
    getDeliveryPerformance,
    getCancellationRefundRate,
    getPeakTimes,
    getInventoryVelocity,
    getMostWishlistedProducts,
    getMostReviewedProducts,
    getCancelledPaidOrders,
} from './analytics.controller.js';

const router = Router();

router.use(authMiddleware);

// router.use(accessControl); // should be admin-only — analytics shouldn't be user-facing

router.get(
    '/revenue-summary',
    zodValidate(dateRangeQuerySchema, 'query', 'DateRangeQuerySchema'),
    getRevenueSummary
);

router.get(
    '/revenue-by-month',
    zodValidate(dateRangeQuerySchema, 'query', 'DateRangeQuerySchema'),
    getRevenueByMonth
);

router.get(
    '/order-status-breakdown',
    zodValidate(dateRangeQuerySchema, 'query', 'DateRangeQuerySchema'),
    getOrderStatusBreakdown
);

router.get(
    '/top-products',
    zodValidate(dateRangeQuerySchema, 'query', 'DateRangeQuerySchema'),
    getTopProducts
);

router.get(
    '/revenue-by-location',
    zodValidate(dateRangeQuerySchema, 'query', 'DateRangeQuerySchema'),
    getRevenueByLocation
);

router.get(
    '/customer-insights',
    zodValidate(dateRangeQuerySchema, 'query', 'DateRangeQuerySchema'),
    getCustomerInsights
);

router.get(
    '/inventory-velocity',
    zodValidate(dateRangeQuerySchema, 'query', 'DateRangeQuerySchema'),
    getInventoryVelocity
);

router.get(
    '/delivery-performance',
    zodValidate(dateRangeQuerySchema, 'query', 'DateRangeQuerySchema'),
    getDeliveryPerformance
);

router.get(
    '/cancellation-refund-rate',
    zodValidate(dateRangeQuerySchema, 'query', 'DateRangeQuerySchema'),
    getCancellationRefundRate
);

router.get(
    '/peak-times',
    zodValidate(dateRangeQuerySchema, 'query', 'DateRangeQuerySchema'),
    getPeakTimes
);

router.get(
    '/most-wishlisted',
    zodValidate(dateRangeQuerySchema, 'query', 'DateRangeQuerySchema'),
    getMostWishlistedProducts
);

router.get(
    '/most-reviewed',
    zodValidate(dateRangeQuerySchema, 'query', 'DateRangeQuerySchema'),
    getMostReviewedProducts
);

router.get(
    '/cancelled-paid-orders',
    zodValidate(dateRangeQuerySchema, 'query', 'DateRangeQuerySchema'),
    getCancelledPaidOrders
);

router.get(
    '/pending-refunds',
    zodValidate(dateRangeQuerySchema, 'query', 'DateRangeQuerySchema'),
    getCancelledPaidOrders
);

export default router;