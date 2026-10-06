import Order, { IOrderItem, IOrder } from "@db/models/order.model.ts";
import { Types } from "mongoose";
import Product from "@db/models/product.model.ts";
import Location from "@db/models/location.model.ts";
import Setting from "@db/models/setting.model.ts";
import { dynamicFilter } from "@core/constants/dynamicfilter.constant.ts";
import { Role } from "@typings/auth.types.js";
import { ApiError } from "@core/errors/api.error.ts";
import { getVisibility } from "./order.constant.ts";
import { enhanceOrder } from "./order.util.ts";
import { orderFilterConfig } from "./order.filterconfig.ts";
import { CreateOrderPayload, OrderStatus, PaymentStatus } from "@typings/order.types.ts";

export const getShippingSlab = async (stateId: any, totalWeight: number) => {
  let slab = await Location.findRateForWeight(stateId, totalWeight);
  if (!slab) {
    const targetId = typeof stateId === "object" && stateId !== null && "_id" in stateId ? stateId._id : stateId;
    const loc = await Location.findOne({ _id: targetId, deliverable: true });
    if (loc && loc.slabs && loc.slabs.length > 0) {
      const sorted = [...loc.slabs].sort((a, b) => b.max - a.max);
      if (totalWeight > sorted[0].max) {
        slab = sorted[0];
      }
    }
  }
  return slab;
};

export const createOrder = async (userId: string, data: CreateOrderPayload) => {
  const products = await Product.find(
    {
      _id: { $in: data.items.map((i) => i.product) },
      active: true,
      deleted: false,
    },
    "name images price weight stock"
  ).lean();

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
      image: p.images?.[0] || "https://placehold.co/600x400?text=No+Image",
      price: p.price,
      weight: p.weight,
      quantity: item.quantity,
    };
  });

  const subtotal = items.reduce((sum: number, i: IOrderItem) => sum + i.price * i.quantity, 0);
  const total_weight = items.reduce((sum: number, i: IOrderItem) => sum + i.weight * i.quantity, 0);

  const slab = await getShippingSlab(data.shipping_address.state, total_weight);
  if (!slab) {
    const loc = await Location.findById(data.shipping_address.state);
    if (!loc || !loc.deliverable) {
      throw new ApiError(400, "Shipping is not available for the selected location");
    }
    throw new ApiError(400, "No delivery rate available for this location/weight");
  }

  const settingGst = await Setting.get("gst_percentage");
  const gstRate = typeof settingGst === "number" ? settingGst : 18;
  const tax = Math.round(subtotal * (gstRate / 100) * 100) / 100;

  const pricing = {
    subtotal,
    tax,
    total_weight,
    shipping_cost: slab.rate,
    total: Math.round((subtotal + slab.rate + tax) * 100) / 100,
  };

  const order = await Order.createOrder({
    user: new Types.ObjectId(userId),
    items,
    shipping_address: data.shipping_address,
    pricing,
    status: "placed",
    payment: { method: data.payment_method },
  });

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

export const getOrdersByUser = async (user: any, queries: Record<string, unknown>) => {
  return dynamicFilter(Order, orderFilterConfig, { user: user?.id || user?._id, ...queries, deleted: false }, {
    visibility: getVisibility(user?.role),
  });
};

export const getOrderById = async (id: string) => {
  const query = Types.ObjectId.isValid(id)
    ? { $or: [{ _id: id }, { code: id }], deleted: false }
    : { code: id, deleted: false };
  const order = await Order.findOne(query);
  if (!order) return null;
  return enhanceOrder(order);
};

export const updateOrderStatus = async (id: string, status: OrderStatus, note?: string) => {
  const query = Types.ObjectId.isValid(id)
    ? { $or: [{ _id: id }, { code: id }], deleted: false }
    : { code: id, deleted: false };
  const existingOrder = await Order.findOne(query);

  if (!existingOrder) return null;

  // Restock products if order status is transitioning to cancelled
  if (status === "cancelled" && existingOrder.status !== "cancelled") {
    await Promise.all(
      existingOrder.items.map((i: IOrderItem) =>
        Product.findByIdAndUpdate(i.product, { $inc: { stock: i.quantity } })
      )
    );
  }

  const updated = await Order.updateStatus(existingOrder._id, status, note);
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
        "payment.status": status,
        ...(transaction_id && { "payment.transaction_id": transaction_id }),
      },
    },
    { new: true }
  );
  if (!updated) return null;
  return enhanceOrder(updated);
};

export const removeOrder = async (id: string) => {
  const removed = await Order.removeOrder(id);
  if (!removed) return null;
  return enhanceOrder(removed);
};

export const retrieveOrder = async (id: string) => {
  const retrieved = await Order.retrieveOrder(id);
  if (!retrieved) return null;
  return enhanceOrder(retrieved);
};

export const setDeliveryPartnerUrl = async (id: string, url: string) => {
  const updated = await Order.updateDeliveryPartnerUrl(id, url);
  if (!updated) return null;
  return enhanceOrder(updated);
};