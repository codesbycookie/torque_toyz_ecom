import Cart, { ICart } from "@db/models/cart.model.ts";
import Order from "@db/models/order.model.ts";
import Product from "@db/models/product.model.ts";
import Location from "@db/models/location.model.ts";
import { Types } from "mongoose";
import { ApiError } from "@core/errors/api.error.ts";
import { getShippingSlab } from "@modules/order/order.services.ts";
import { enhanceCart } from "./cart.util.ts";
import { enhanceOrder } from "@modules/order/order.util.ts";

export const recalculateCartPricing = async (cart: any) => {
  let subtotal = 0;
  let total_weight = 0;

  if (cart.items && cart.items.length > 0) {
    const productIds = cart.items.map((i: any) => i.product);
    const products = await Product.find({ _id: { $in: productIds } }).lean();

    for (const item of cart.items) {
      const p = products.find((prod) => String(prod._id) === String(item.product));
      if (p) {
        item.name = p.name;
        item.image = p.images?.[0] || "https://placehold.co/600x400?text=No+Image";
        item.price = p.price;
        item.weight = p.weight;

        subtotal += p.price * item.quantity;
        total_weight += p.weight * item.quantity;
      }
    }
  }

  let shipping_cost = 0;

  if (cart.shipping_address && cart.shipping_address.state) {
    const slab = await getShippingSlab(cart.shipping_address.state, total_weight);
    if (slab) {
      shipping_cost = slab.rate;
    }
  }

  cart.pricing = {
    subtotal,
    total_weight,
    shipping_cost,
    total: subtotal + shipping_cost,
  };

  await cart.save();
};

export const getCart = async (guestId: string, userId?: string) => {
  let cart;
  if (userId) {
    cart = await Cart.findOne({ user: userId, deleted: false });
  }
  if (!cart && guestId) {
    cart = await Cart.findOne({ guest_id: guestId, deleted: false });
  }

  if (!cart) {
    cart = await new Cart({
      guest_id: guestId,
      user: userId || undefined,
      items: [],
    }).save();
  }

  if (userId && !cart.user) {
    cart.user = new Types.ObjectId(userId);
    await cart.save();
  }

  await recalculateCartPricing(cart);
  return enhanceCart(cart);
};

export const addItemToCart = async (
  guestId: string,
  productId: string,
  quantity: number,
  userId?: string
) => {
  const cartRaw = await Cart.findById((await getCart(guestId, userId)).id);
  if (!cartRaw) throw new ApiError(404, "Cart not found");

  const product = await Product.findById(productId);
  if (!product || !product.active || product.deleted) {
    throw new ApiError(400, `Product ${productId} not found or inactive`);
  }

  if (product.stock < quantity) {
    throw new ApiError(400, `Insufficient stock for ${product.name}`);
  }

  const existingItem = cartRaw.items.find((i: any) => String(i.product) === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cartRaw.items.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0] || "https://placehold.co/600x400?text=No+Image",
      price: product.price,
      weight: product.weight,
      quantity,
    });
  }

  await recalculateCartPricing(cartRaw);
  return enhanceCart(cartRaw);
};

export const updateCartItemQuantity = async (
  guestId: string,
  productId: string,
  quantity: number,
  userId?: string
) => {
  const cartRaw = await Cart.findById((await getCart(guestId, userId)).id);
  if (!cartRaw) throw new ApiError(404, "Cart not found");

  const existingItem = cartRaw.items.find((i: any) => String(i.product) === productId);
  if (!existingItem) {
    throw new ApiError(404, "Item not found in cart");
  }

  if (quantity <= 0) {
    cartRaw.items = cartRaw.items.filter((i: any) => String(i.product) !== productId);
  } else {
    existingItem.quantity = quantity;
  }

  await recalculateCartPricing(cartRaw);
  return enhanceCart(cartRaw);
};

export const removeItemFromCart = async (
  guestId: string,
  productId: string,
  userId?: string
) => {
  const cartRaw = await Cart.findById((await getCart(guestId, userId)).id);
  if (!cartRaw) throw new ApiError(404, "Cart not found");

  cartRaw.items = cartRaw.items.filter((i: any) => String(i.product) !== productId);

  await recalculateCartPricing(cartRaw);
  return enhanceCart(cartRaw);
};

export const updateCartShippingAddress = async (
  guestId: string,
  shipping_address: any,
  userId?: string
) => {
  const cartRaw = await Cart.findById((await getCart(guestId, userId)).id);
  if (!cartRaw) throw new ApiError(404, "Cart not found");

  cartRaw.shipping_address = shipping_address;

  await recalculateCartPricing(cartRaw);
  return enhanceCart(cartRaw);
};

export const clearCart = async (guestId: string, userId?: string) => {
  const cartRaw = await Cart.findById((await getCart(guestId, userId)).id);
  if (!cartRaw) throw new ApiError(404, "Cart not found");

  cartRaw.items = [];
  cartRaw.shipping_address = undefined;

  await recalculateCartPricing(cartRaw);
  return enhanceCart(cartRaw);
};

export const checkoutCart = async (
  guestId: string,
  data: { payment_method: "cod" | "online"; shipping_address?: any },
  userId?: string
) => {
  const cartRaw = await Cart.findById((await getCart(guestId, userId)).id);
  if (!cartRaw) throw new ApiError(404, "Cart not found");


  console.log(cartRaw, userId)

  if (!userId && !cartRaw.user) throw new ApiError(400, "User is required for checkout");

  if (data.shipping_address) {
    cartRaw.shipping_address = {
      ...data.shipping_address,
      state: new Types.ObjectId(data.shipping_address.state as string),
    };
  }

  if (!cartRaw.shipping_address || !cartRaw.shipping_address.state) {
    throw new ApiError(400, "Shipping address is incomplete");
  }

  if (cartRaw.items.length === 0) {
    throw new ApiError(400, "Cannot checkout an empty cart");
  }

  await recalculateCartPricing(cartRaw);

  if (cartRaw.pricing.shipping_cost === 0) {
    const slab = await getShippingSlab(
      cartRaw.shipping_address.state,
      cartRaw.pricing.total_weight
    );
    if (!slab) {
      const loc = await Location.findById(cartRaw.shipping_address.state);
      if (!loc || !loc.deliverable) {
        throw new ApiError(400, "Shipping is not available for the selected location");
      }
      throw new ApiError(400, "No delivery rate available for this location/weight");
    } else {
      cartRaw.pricing.shipping_cost = slab.rate;
      cartRaw.pricing.total = cartRaw.pricing.subtotal + slab.rate;
    }
  }

  // Deduct stock for each product in cart
  for (const item of cartRaw.items) {
    const p = await Product.findById(item.product);
    if (!p || p.stock < item.quantity) {
      throw new ApiError(400, `Insufficient stock for ${item.name}`);
    }
  }

  await Promise.all(
    cartRaw.items.map((i: any) =>
      Product.findByIdAndUpdate(i.product, { $inc: { stock: -i.quantity } })
    )
  );

  // Convert Cart to placed Order
  const newOrder = await new Order({
    user: userId ? new Types.ObjectId(userId) : cartRaw.user,
    guest_id: guestId,
    items: cartRaw.items.map((i: any) => ({
      product: i.product,
      name: i.name,
      image: i.image,
      price: i.price,
      weight: i.weight,
      quantity: i.quantity,
    })),
    shipping_address: cartRaw.shipping_address,
    pricing: cartRaw.pricing,
    payment: {
      method: data.payment_method,
      status: "pending",
    },
    status: "placed",
  }).save();

  // Reset cart after converting to order
  cartRaw.items = [];
  cartRaw.shipping_address = undefined;
  await recalculateCartPricing(cartRaw);

  return enhanceOrder(newOrder);
};
