import Cart, { ICart } from "@db/models/cart.model.ts";
import Order from "@db/models/order.model.ts";
import Product from "@db/models/product.model.ts";
import Location from "@db/models/location.model.ts";
import Setting from "@db/models/setting.model.ts";
import Wishlist from "@db/models/wishlist.model.ts";
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
  const isFreeDelivery = await Setting.get("free_delivery");

  if (!isFreeDelivery && cart.shipping_address && cart.shipping_address.state) {
    const slab = await getShippingSlab(cart.shipping_address.state, total_weight);
    if (slab) {
      shipping_cost = slab.rate;
    }
  }

  const settingGst = await Setting.get("gst_percentage");
  const gstRate = typeof settingGst === "number" ? settingGst : 18;
  const tax = Math.round(subtotal * (gstRate / 100) * 100) / 100;

  cart.pricing = {
    subtotal,
    tax,
    total_weight,
    shipping_cost,
    is_free_delivery: Boolean(isFreeDelivery),
    total: Math.round((subtotal + shipping_cost + tax) * 100) / 100,
  };

  await cart.save();
};

export const getCart = async (guestId: string, userId?: string) => {
  let cart: any = null;

  if (userId && guestId) {
    const userCart = await Cart.findOne({ user: userId, deleted: false });
    const guestCart = await Cart.findOne({ guest_id: guestId, deleted: false });

    if (guestCart && userCart && String(guestCart._id) !== String(userCart._id)) {
      // Merge items from guestCart into userCart if guestCart has items
      if (guestCart.items && guestCart.items.length > 0) {
        for (const gItem of guestCart.items) {
          const existing = userCart.items.find(
            (uItem: any) => String(uItem.product) === String(gItem.product)
          );
          if (existing) {
            existing.quantity += gItem.quantity;
          } else {
            userCart.items.push(gItem);
          }
          if (userId) {
            try {
              await Wishlist.removeProduct(userId, String(gItem.product));
            } catch {}
          }
        }
        guestCart.items = [];
        await guestCart.save();
        await userCart.save();
      }
      cart = userCart;
    } else if (guestCart && !userCart) {
      guestCart.user = new Types.ObjectId(userId);
      await guestCart.save();
      if (guestCart.items && guestCart.items.length > 0) {
        for (const gItem of guestCart.items) {
          try {
            await Wishlist.removeProduct(userId, String(gItem.product));
          } catch {}
        }
      }
      cart = guestCart;
    } else if (userCart) {
      cart = userCart;
    }
  } else if (userId) {
    cart = await Cart.findOne({ user: userId, deleted: false });
  } else if (guestId) {
    cart = await Cart.findOne({ guest_id: guestId, deleted: false });
  }

  if (!cart) {
    cart = await new Cart({
      guest_id: guestId || undefined,
      user: userId ? new Types.ObjectId(userId) : undefined,
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

const resolveCleanProductId = (productId: any): string => {
  if (!productId) return "";
  if (typeof productId === "string") return productId;
  if (typeof productId === "object") {
    return String(productId._id || productId.id || productId.product || "");
  }
  return String(productId);
};

export const addItemToCart = async (
  guestId: string,
  productId: any,
  quantity: number,
  userId?: string
) => {
  const cleanProductId = resolveCleanProductId(productId);
  if (!cleanProductId) {
    throw new ApiError(400, "Invalid product ID");
  }

  const cartObj = await getCart(guestId, userId);
  const cartRaw = await Cart.findById(cartObj._id || cartObj.id);
  if (!cartRaw) throw new ApiError(404, "Cart not found");

  const product = await Product.findById(cleanProductId);
  if (!product || !product.active || product.deleted) {
    throw new ApiError(400, `Product ${cleanProductId} not found or inactive`);
  }

  if (product.stock < quantity) {
    throw new ApiError(400, `Insufficient stock for ${product.name}`);
  }

  const existingItem = cartRaw.items.find((i: any) => String(i.product) === cleanProductId);
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

  if (userId) {
    try {
      await Wishlist.removeProduct(userId, cleanProductId);
    } catch {
      // Ignore if wishlist removal fails
    }
  }

  return enhanceCart(cartRaw);
};

export const updateCartItemQuantity = async (
  guestId: string,
  productId: any,
  quantity: number,
  userId?: string
) => {
  const cleanProductId = resolveCleanProductId(productId);

  const cartObj = await getCart(guestId, userId);
  const cartRaw = await Cart.findById(cartObj._id || cartObj.id);
  if (!cartRaw) throw new ApiError(404, "Cart not found");

  const existingItem = cartRaw.items.find((i: any) => String(i.product) === cleanProductId);
  if (!existingItem) {
    throw new ApiError(404, "Item not found in cart");
  }

  if (quantity <= 0) {
    cartRaw.items = cartRaw.items.filter((i: any) => String(i.product) !== cleanProductId);
  } else {
    existingItem.quantity = quantity;
  }

  await recalculateCartPricing(cartRaw);
  return enhanceCart(cartRaw);
};

export const removeItemFromCart = async (
  guestId: string,
  productId: any,
  userId?: string
) => {
  const cleanProductId = resolveCleanProductId(productId);

  const cartObj = await getCart(guestId, userId);
  const cartRaw = await Cart.findById(cartObj._id || cartObj.id);
  if (!cartRaw) throw new ApiError(404, "Cart not found");

  cartRaw.items = cartRaw.items.filter((i: any) => String(i.product) !== cleanProductId);

  await recalculateCartPricing(cartRaw);
  return enhanceCart(cartRaw);
};

export const resolveLocationObjectId = async (stateVal: any): Promise<Types.ObjectId> => {
  if (!stateVal) {
    throw new ApiError(400, "Shipping address state is required");
  }

  const str = String(stateVal).trim();
  if (Types.ObjectId.isValid(str) && String(new Types.ObjectId(str)) === str) {
    return new Types.ObjectId(str);
  }

  // Lookup by exact state name
  const loc = await Location.findOne({
    state: { $regex: new RegExp(`^${str}$`, "i") },
  });
  if (loc) {
    return loc._id as Types.ObjectId;
  }

  // Lookup by state prefix
  const locPrefix = await Location.findOne({
    state: { $regex: new RegExp(`^${str}`, "i") },
  });
  if (locPrefix) {
    return locPrefix._id as Types.ObjectId;
  }

  throw new ApiError(400, `Invalid location state: "${str}" could not be resolved`);
};

export const updateCartShippingAddress = async (
  guestId: string,
  shipping_address: any,
  userId?: string
) => {
  const cartObj = await getCart(guestId, userId);
  const cartRaw = await Cart.findById(cartObj._id || cartObj.id);
  if (!cartRaw) throw new ApiError(404, "Cart not found");

  if (shipping_address) {
    const resolvedState = await resolveLocationObjectId(shipping_address.state);
    cartRaw.shipping_address = {
      ...shipping_address,
      state: resolvedState,
    };
  } else {
    cartRaw.shipping_address = undefined;
  }

  await recalculateCartPricing(cartRaw);
  return enhanceCart(cartRaw);
};

export const clearCart = async (guestId: string, userId?: string) => {
  const cartObj = await getCart(guestId, userId);
  const cartRaw = await Cart.findById(cartObj._id || cartObj.id);
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
  const cartObj = await getCart(guestId, userId);
  const cartRaw = await Cart.findById(cartObj._id || cartObj.id);
  if (!cartRaw) throw new ApiError(404, "Cart not found");

  if (!userId && !cartRaw.user) throw new ApiError(400, "User is required for checkout");

  if (data.shipping_address) {
    const rawState = data.shipping_address.state || cartRaw.shipping_address?.state;
    let resolvedState: Types.ObjectId | undefined;
    if (rawState) {
      resolvedState = await resolveLocationObjectId(rawState);
    }
    cartRaw.shipping_address = {
      ...((cartRaw.shipping_address as any)?.toObject ? (cartRaw.shipping_address as any).toObject() : cartRaw.shipping_address),
      ...data.shipping_address,
      ...(resolvedState ? { state: resolvedState } : {}),
    };
  }

  if (!cartRaw.shipping_address || !cartRaw.shipping_address.state) {
    throw new ApiError(400, "Shipping address is incomplete");
  }

  if (cartRaw.items.length === 0) {
    throw new ApiError(400, "Cannot checkout an empty cart");
  }

  await recalculateCartPricing(cartRaw);

  const isFreeDelivery = await Setting.get("free_delivery");
  if (!isFreeDelivery && cartRaw.pricing.shipping_cost === 0) {
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
      cartRaw.pricing.is_free_delivery = false;
      cartRaw.pricing.total = Math.round((cartRaw.pricing.subtotal + (cartRaw.pricing.tax || 0) + slab.rate) * 100) / 100;
    }
  } else if (isFreeDelivery) {
    cartRaw.pricing.shipping_cost = 0;
    cartRaw.pricing.is_free_delivery = true;
    cartRaw.pricing.total = Math.round((cartRaw.pricing.subtotal + (cartRaw.pricing.tax || 0)) * 100) / 100;
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
