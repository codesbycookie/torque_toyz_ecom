import Order, { IOrderItem } from '@db/models/order.model.ts';
import Product from '@db/models/product.model.ts';
import Location from '@db/models/location.model.ts';
import { dynamicFilter } from '@core/constants/dynamicfilter.constant.ts';
import { Role } from '@typings/auth.types.js';
import { ApiError } from '@core/errors/api.error.ts';
import { SOFT_DELETE, RETRIEVE, getVisibility } from './order.constant.ts';
import { enhanceOrder } from './order.util.ts';
import { orderFilterConfig } from './order.filterconfig.ts';
import { CreateOrderPayload, OrderStatus, PaymentStatus } from '@typings/order.types.ts';

export const createOrder = async (userId: string, data: CreateOrderPayload) => {
    // snapshot product fields server-side — never trust client-sent price/weight


    const products = await Product.find({
        _id: { $in: data.items.map(i => i.product) },
        active: true,
        deleted: false
    }, 'name images price weight').lean();

    const productIds = new Set<string>();

    const items = data.items.map((item: any) => {
        const pid = String(item.product);
        if (productIds.has(pid)) {
            throw new ApiError(400, `Duplicate product in order: ${pid}`);
        }
        productIds.add(pid);

        const p = products.find((p) => String(p._id) === pid);
        if (!p) {
            throw new ApiError(400, `Product ${pid} not found or inactive`);
        }

        if (p.stock < item.quantity) {
            throw new ApiError(400, `Insufficient stock for ${p.name}`);
        }

        return {
            product: p._id,
            name: p.name,
            image: p.images?.[0] || 'https://placehold.co/600x400?text=No+Image',
            price: p.price,
            weight: p.weight,
            quantity: item.quantity,
        };
    });

    const subtotal = items.reduce((sum: number, i: IOrderItem) => sum + i.price * i.quantity, 0);
    const total_weight = items.reduce((sum: number, i: IOrderItem) => sum + i.weight * i.quantity, 0);

    const slab = await Location.findRateForWeight(data.shipping_address.state, total_weight);
    if (!slab) {
        throw new ApiError(400, 'No delivery rate available for this location/weight');
    }

    const pricing = {
        subtotal,
        total_weight,
        shipping_cost: slab.rate,
        total: subtotal + slab.rate,
    };

    const order = await new Order({
        user: userId,
        items,
        shipping_address: data.shipping_address,
        pricing,
        payment: { method: data.payment_method },
    }).save();

    // deduct stock only after the order is successfully created
    await Promise.all(
        items.map((i: IOrderItem) => Product.findByIdAndUpdate(i.product, { $inc: { stock: -i.quantity } }))
    );

    return enhanceOrder(order);
};

export const getAllOrders = async (queries: Record<string, unknown>, role?: Role) => {
    return dynamicFilter(Order, orderFilterConfig, queries, {
        visibility: getVisibility(role),
    });
};

export const getOrdersByUser = async (userId: string) => {
    const orders = await Order.getByUser(userId);
    return orders.map(enhanceOrder);
};

export const getOrderById = async (id: string) => {
    const order = await Order.findOne({ _id: id, deleted: false });
    if (!order) return null;
    return enhanceOrder(order);
};

export const updateOrderStatus = async (id: string, status: OrderStatus, note?: string) => {
    const updated = await Order.updateStatus(id, status, note);
    if (!updated) return null;
    return enhanceOrder(updated);
};

export const updatePaymentStatus = async (
    id: string,
    status: PaymentStatus,
    transaction_id?: string
) => {
    const updated = await Order.findOneAndUpdate(
        { _id: id, deleted: false },
        {
            $set: {
                'payment.status': status,
                ...(transaction_id && { 'payment.transaction_id': transaction_id }),
            },
        },
        { new: true }
    );
    if (!updated) return null;
    return enhanceOrder(updated);
};

export const removeOrder = async (id: string) => {
    const removed = await Order.findByIdAndUpdate(id, SOFT_DELETE, { new: true });
    if (!removed) return null;
    return enhanceOrder(removed);
};

export const retrieveOrder = async (id: string) => {
    const retrieved = await Order.findByIdAndUpdate(id, RETRIEVE, { new: true });
    if (!retrieved) return null;
    return enhanceOrder(retrieved);
};

export const setDeliveryPartnerUrl = async (id: string, url: string) => {
  const updated = await Order.findByIdAndUpdate(id, { delivery_partner_url: url }, { new: true });
  if (!updated) return null;
  return enhanceOrder(updated);
};