import Order, { IOrder } from '@db/models/order.model.ts';
import productModel from '@db/models/product.model.ts';
import Wishlist from '@db/models/wishlist.model.ts';
import Review from '@db/models/review.model.ts';
import { QueryFilter } from 'mongoose';

interface DateRange {
    from?: string;
    to?: string;
}

const buildDateMatch = (range: DateRange) => {
    const match: Record<string, any> = { deleted: false };
    if (range.from || range.to) {
        match.createdAt = {};
        if (range.from) match.createdAt.$gte = new Date(range.from);
        if (range.to) match.createdAt.$lte = new Date(range.to);
    }
    return match;
};

export const getRevenueSummary = async (range: DateRange) => {
    const match = { ...buildDateMatch(range), status: { $ne: 'cancelled' } };

    const [result] = await Order.aggregate([
        { $match: match },
        {
            $group: {
                _id: null,
                total_revenue: { $sum: '$pricing.total' },
                total_orders: { $sum: 1 },
                avg_order_value: { $avg: '$pricing.total' },
            },
        },
        { $project: { _id: 0 } },
    ]);

    return result ?? { total_revenue: 0, total_orders: 0, avg_order_value: 0 };
};

export const getRevenueByMonth = async (range: DateRange) => {
    const match = { ...buildDateMatch(range), status: { $ne: 'cancelled' } };

    return Order.aggregate([
        { $match: match },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                revenue: { $sum: '$pricing.total' },
                orders: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
        { $project: { month: '$_id', revenue: 1, orders: 1, _id: 0 } },
    ]);
};

export const getOrderStatusBreakdown = async (range: DateRange) => {
    const match = buildDateMatch(range);

    return Order.aggregate([
        { $match: match },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { status: '$_id', count: 1, _id: 0 } },
    ]);
};

export const getTopProducts = async (range: DateRange, limit = 10) => {
    const match = { ...buildDateMatch(range), status: { $ne: 'cancelled' } };

    return Order.aggregate([
        { $match: match },
        { $unwind: '$items' },
        {
            $group: {
                _id: '$items.product',
                name: { $first: '$items.name' },
                units_sold: { $sum: '$items.quantity' },
                revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            },
        },
        { $sort: { units_sold: -1 } },
        { $limit: limit },
        { $project: { product: '$_id', name: 1, units_sold: 1, revenue: 1, _id: 0 } },
    ]);
};

export const getRevenueByLocation = async (range: DateRange) => {
    const match = { ...buildDateMatch(range), status: { $ne: 'cancelled' } };

    return Order.aggregate([
        { $match: match },
        {
            $group: {
                _id: '$shipping_address.state',
                orders: { $sum: 1 },
                revenue: { $sum: '$pricing.total' },
            },
        },
        {
            $lookup: {
                from: 'locations',
                localField: '_id',
                foreignField: '_id',
                as: 'location',
            },
        },
        { $unwind: { path: '$location', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                state: '$location.state',
                code: '$location.code',
                orders: 1,
                revenue: 1,
                _id: 0,
            },
        },
        { $sort: { revenue: -1 } },
    ]);
};

// ── Customer insights ──────────────────────────────────────────────

export const getCustomerInsights = async (range: DateRange) => {
    const match = { ...buildDateMatch(range), status: { $ne: 'cancelled' } };

    const byUser = await Order.aggregate([
        { $match: match },
        {
            $group: {
                _id: '$user',
                orders: { $sum: 1 },
                total_spent: { $sum: '$pricing.total' },
            },
        },
    ]);

    const repeat_customers = byUser.filter((u) => u.orders > 1).length;
    const new_customers = byUser.filter((u) => u.orders === 1).length;

    const top_spenders = [...byUser].sort((a, b) => b.total_spent - a.total_spent).slice(0, 10);

    const topSpenderIds = top_spenders.map((u) => u._id);
    const users = await Order.db.model('User').find(
        { _id: { $in: topSpenderIds } },
        'name login_id'
    );
    const userMap = new Map(users.map((u: any) => [u._id.toString(), u]));

    return {
        total_customers: byUser.length,
        repeat_customers,
        new_customers,
        repeat_rate: byUser.length ? Math.round((repeat_customers / byUser.length) * 1000) / 10 : 0,
        top_spenders: top_spenders.map((u) => ({
            user: u._id,
            name: userMap.get(u._id.toString())?.name,
            login_id: userMap.get(u._id.toString())?.login_id,
            orders: u.orders,
            total_spent: u.total_spent,
        })),
    };
};

// ── Inventory velocity ──────────────────────────────────────────────

export const getInventoryVelocity = async (range: DateRange, days = 30) => {
    const match = { ...buildDateMatch(range), status: { $ne: 'cancelled' } };

    const sold = await Order.aggregate([
        { $match: match },
        { $unwind: '$items' },
        {
            $group: {
                _id: '$items.product',
                units_sold: { $sum: '$items.quantity' },
            },
        },
    ]);

    const soldMap = new Map(sold.map((s) => [s._id.toString(), s.units_sold]));

    const products = await productModel.find({ active: true, deleted: false }).select('name code stock');

    const velocity = products.map((p: any) => {
        const units_sold = soldMap.get(p._id.toString()) ?? 0;
        const daily_rate = units_sold / days;
        // null = no recent sales, can't estimate a runway
        const days_of_stock_remaining = daily_rate > 0 ? Math.round(p.stock / daily_rate) : null;

        return {
            product: p._id,
            name: p.name,
            code: p.code,
            stock: p.stock,
            units_sold,
            days_of_stock_remaining,
        };
    });

    return {
        fastest_moving: [...velocity].sort((a, b) => b.units_sold - a.units_sold).slice(0, 10),
        slow_moving: [...velocity]
            .filter((v) => v.units_sold === 0)
            .sort((a, b) => b.stock - a.stock)
            .slice(0, 10),
    };
};

// ── Delivery performance ─────────────────────────────────────────────

export const getDeliveryPerformance = async (range: DateRange) => {
    const match: QueryFilter<IOrder> = {
        ...buildDateMatch(range),
        status: 'delivered',
    };

    const orders = await Order.find(match).select('status_history');

    const durations: number[] = [];

    for (const order of orders) {
        const placed = order.status_history.find((s) => s.status === 'placed')?.timestamp;
        const delivered = order.status_history.find((s) => s.status === 'delivered')?.timestamp;

        if (placed && delivered) {
            const hours = (delivered.getTime() - placed.getTime()) / (1000 * 60 * 60);
            durations.push(hours);
        }
    }

    if (durations.length === 0) {
        return { average_hours: 0, average_days: 0, delivered_count: 0 };
    }

    const avgHours = durations.reduce((sum, h) => sum + h, 0) / durations.length;

    return {
        average_hours: Math.round(avgHours * 10) / 10,
        average_days: Math.round((avgHours / 24) * 10) / 10,
        delivered_count: durations.length,
    };
};

// ── Cancellation / refund rate ───────────────────────────────────────

export const getCancellationRefundRate = async (range: DateRange) => {
    const match = buildDateMatch(range);

    const [totals] = await Order.aggregate([
        { $match: match },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                cancelled: {
                    $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
                },
                refunded: {
                    $sum: { $cond: [{ $eq: ['$payment.status', 'refunded'] }, 1, 0] },
                },
            },
        },
        { $project: { _id: 0 } },
    ]);

    if (!totals || totals.total === 0) {
        return { total: 0, cancelled: 0, refunded: 0, cancellation_rate: 0, refund_rate: 0 };
    }

    return {
        total: totals.total,
        cancelled: totals.cancelled,
        refunded: totals.refunded,
        cancellation_rate: Math.round((totals.cancelled / totals.total) * 1000) / 10,
        refund_rate: Math.round((totals.refunded / totals.total) * 1000) / 10,
    };
};

// ── Peak hours/days ───────────────────────────────────────────────────

export const getPeakTimes = async (range: DateRange) => {
    const match = buildDateMatch(range);

    const byHour = await Order.aggregate([
        { $match: match },
        { $group: { _id: { $hour: '$createdAt' }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $project: { hour: '$_id', orders: 1, _id: 0 } },
    ]);

    const byWeekday = await Order.aggregate([
        { $match: match },
        { $group: { _id: { $dayOfWeek: '$createdAt' }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $project: { weekday: '$_id', orders: 1, _id: 0 } }, // 1=Sunday..7=Saturday (Mongo convention)
    ]);

    return { by_hour: byHour, by_weekday: byWeekday };
};

export const getMostWishlistedProducts = async (range: DateRange, limit: number = 10) => {
    const match = buildDateMatch(range);
    const result = await Wishlist.aggregate([
        { $match: match },
        { $unwind: '$products' },
        {
            $group: {
                _id: '$products',
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: limit },
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                as: 'product'
            }
        },
        { $unwind: '$product' },
        {
            $project: {
                _id: 1,
                name: '$product.name',
                count: 1
            }
        }
    ]);
    return result;
};

export const getMostReviewedProducts = async (range: DateRange, limit: number = 10) => {
    const match = buildDateMatch(range);
    const result = await Review.aggregate([
        { $match: match },
        {
            $group: {
                _id: '$product',
                count: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        },
        { $sort: { count: -1 } },
        { $limit: limit },
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                as: 'productDetails'
            }
        },
        { $unwind: '$productDetails' },
        {
            $project: {
                _id: 1,
                name: '$productDetails.name',
                count: 1,
                avgRating: { $round: ['$avgRating', 1] }
            }
        }
    ]);
    return result;
};