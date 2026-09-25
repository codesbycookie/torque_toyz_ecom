import Order, { IOrderItem, IOrder } from '@db/models/order.model.ts';
import { Types } from 'mongoose';
import Product from '@db/models/product.model.ts';
import Location from '@db/models/location.model.ts';
import { dynamicFilter } from '@core/constants/dynamicfilter.constant.ts';
import { Role } from '@typings/auth.types.js';
import { ApiError } from '@core/errors/api.error.ts';
import { SOFT_DELETE, RETRIEVE, getVisibility } from './order.constant.ts';
import { enhanceOrder } from './order.util.ts';
import { orderFilterConfig } from './order.filterconfig.ts';
import { CreateOrderPayload, OrderStatus, PaymentStatus } from '@typings/order.types.ts';

export const recalculateDraftPricing = async (order: any) => {
    let subtotal = 0;
    let total_weight = 0;

    if (order.items && order.items.length > 0) {
        const productIds = order.items.map((i: any) => i.product);
        const products = await Product.find({ _id: { $in: productIds } }).lean();

        for (const item of order.items) {
            const p = products.find(prod => String(prod._id) === String(item.product));
            if (p) {
                item.name = p.name;
                item.image = p.images?.[0] || 'https://placehold.co/600x400?text=No+Image';
                item.price = p.price;
                item.weight = p.weight;
                
                subtotal += p.price * item.quantity;
                total_weight += p.weight * item.quantity;
            }
        }
    }

    let shipping_cost = 0;

    if (order.shipping_address && order.shipping_address.state && total_weight > 0) {
        const slab = await Location.findRateForWeight(order.shipping_address.state, total_weight);
        if (slab) {
            shipping_cost = slab.rate;
        }
    }

    order.pricing = {
        subtotal,
        total_weight,
        shipping_cost,
        total: subtotal + shipping_cost,
    };
    
    await order.save();
};

export const getDraftOrder = async (guestId: string, userId?: string) => {
    let order;
    if (userId) {
        order = await Order.findOne({ user: userId, status: 'in_cart', deleted: false });
    }
    if (!order && guestId) {
        order = await Order.findOne({ guest_id: guestId, status: 'in_cart', deleted: false });
    }

    if (!order) {
        order = await new Order({
            guest_id: guestId,
            user: userId || undefined,
            status: 'in_cart',
            items: [],
        }).save();
    }

    if (userId && !order.user) {
        order.user = new Types.ObjectId(userId);
        await order.save();
    }

    await recalculateDraftPricing(order);
    return enhanceOrder(order);
};

export const addItemToDraft = async (guestId: string, productId: string, quantity: number, userId?: string) => {
    const orderRaw = await Order.findById((await getDraftOrder(guestId, userId)).id);
    if (!orderRaw) throw new ApiError(404, 'Draft order not found');

    const product = await Product.findById(productId);
    if (!product || !product.active || product.deleted) {
        throw new ApiError(400, `Product ${productId} not found or inactive`);
    }
    
    if (product.stock < quantity) {
        throw new ApiError(400, `Insufficient stock for ${product.name}`);
    }

    const existingItem = orderRaw.items.find((i: any) => String(i.product) === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        orderRaw.items.push({
            product: product._id,
            name: product.name,
            image: product.images?.[0] || 'https://placehold.co/600x400?text=No+Image',
            price: product.price,
            weight: product.weight,
            quantity
        });
    }

    await recalculateDraftPricing(orderRaw);
    return enhanceOrder(orderRaw);
};

export const updateDraftItemQuantity = async (guestId: string, productId: string, quantity: number, userId?: string) => {
    const orderRaw = await Order.findById((await getDraftOrder(guestId, userId)).id);
    if (!orderRaw) throw new ApiError(404, 'Draft order not found');
    
    const existingItem = orderRaw.items.find((i: any) => String(i.product) === productId);
    if (!existingItem) {
        throw new ApiError(404, 'Item not found in draft order');
    }

    if (quantity <= 0) {
        orderRaw.items = orderRaw.items.filter((i: any) => String(i.product) !== productId);
    } else {
        existingItem.quantity = quantity;
    }

    await recalculateDraftPricing(orderRaw);
    return enhanceOrder(orderRaw);
};

export const removeItemFromDraft = async (guestId: string, productId: string, userId?: string) => {
    const orderRaw = await Order.findById((await getDraftOrder(guestId, userId)).id);
    if (!orderRaw) throw new ApiError(404, 'Draft order not found');
    orderRaw.items = orderRaw.items.filter((i: any) => String(i.product) !== productId);
    
    await recalculateDraftPricing(orderRaw);
    return enhanceOrder(orderRaw);
};

export const updateDraftShippingAddress = async (guestId: string, shipping_address: any, userId?: string) => {
    const orderRaw = await Order.findById((await getDraftOrder(guestId, userId)).id);
    if (!orderRaw) throw new ApiError(404, 'Draft order not found');
    orderRaw.shipping_address = shipping_address;
    
    await recalculateDraftPricing(orderRaw);
    return enhanceOrder(orderRaw);
};

export const clearDraft = async (guestId: string, userId?: string) => {
    const orderRaw = await Order.findById((await getDraftOrder(guestId, userId)).id);
    if (!orderRaw) throw new ApiError(404, 'Draft order not found');
    orderRaw.items = [];
    orderRaw.shipping_address = undefined;
    
    await recalculateDraftPricing(orderRaw);
    return enhanceOrder(orderRaw);
};

export const checkoutDraftOrder = async (guestId: string, data: CreateOrderPayload, userId?: string) => {
    const orderRaw = await Order.findById((await getDraftOrder(guestId, userId)).id);
    if (!orderRaw) throw new ApiError(404, 'Draft order not found');

    if (!userId && !orderRaw.user) throw new ApiError(400, 'User is required for checkout');

    if (data.shipping_address) {
        orderRaw.shipping_address = {
            ...data.shipping_address,
            state: new Types.ObjectId(data.shipping_address.state as string)
        };
    }
    if (data.payment_method) orderRaw.payment = { method: data.payment_method, status: "pending" };

    if (!orderRaw.shipping_address || !orderRaw.shipping_address.state) {
        throw new ApiError(400, 'Shipping address is incomplete');
    }
    
    if (orderRaw.items.length === 0) {
        throw new ApiError(400, 'Cannot checkout an empty order');
    }

    await recalculateDraftPricing(orderRaw);
    
    if (orderRaw.pricing.shipping_cost === 0) {
        const slab = await Location.findRateForWeight(orderRaw.shipping_address.state, orderRaw.pricing.total_weight);
        if (!slab) throw new ApiError(400, 'No delivery rate available for this location/weight');
    }

    // Deduct stock
    for (const item of orderRaw.items) {
        const p = await Product.findById(item.product);
        if (!p || p.stock < item.quantity) {
            throw new ApiError(400, `Insufficient stock for ${item.name}`);
        }
    }
    await Promise.all(
        orderRaw.items.map((i: any) => Product.findByIdAndUpdate(i.product, { $inc: { stock: -i.quantity } }))
    );

    // Update status to placed
    orderRaw.status = "placed";
    if (userId) orderRaw.user = new Types.ObjectId(userId); // ensure user is set
    await orderRaw.save();

    return enhanceOrder(orderRaw);
};

export const createOrder = async (userId: string, data: CreateOrderPayload) => {
    // snapshot product fields server-side — never trust client-sent price/weight


    const products = await Product.find({
        _id: { $in: data.items.map(i => i.product) },
        active: true,
        deleted: false
    }, 'name images price weight stock').lean();

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
        user: new Types.ObjectId(userId),
        items,
        shipping_address: data.shipping_address,
        pricing,
        status: 'placed',
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