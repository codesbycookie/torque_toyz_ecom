export const resolveProductId = (target) => {
  if (!target) return "";
  if (typeof target === "string") return target;
  if (typeof target.product === "string") return target.product;
  if (target.product && typeof target.product === "object") {
    return String(target.product._id || target.product.id || "");
  }
  return String(target._id || target.id || "");
};

export const getCartHeaders = (getCartIdState, initCartId) => {
  let cartId = getCartIdState?.();
  if (!cartId) {
    try {
      initCartId?.();
      cartId = getCartIdState?.();
    } catch {}
  }
  return { "x-cart-id": cartId || "guest-session" };
};

export const restoreCartFromBackup = async ({
  orderId,
  cartBackup,
  errorMessage,
  shippingAddress,
  cartModule,
  ordersModule,
}) => {
  try {
    if (orderId && ordersModule?.cancelOrder) {
      await ordersModule.cancelOrder(orderId, errorMessage || "Online payment incomplete");
    }

    // Ensure backend cart is cleared first to prevent quantity duplication
    await cartModule.clearCart();

    if (cartBackup && cartBackup.length > 0) {
      for (const item of cartBackup) {
        const productId = resolveProductId(item);
        if (productId) {
          await cartModule.addToCart(productId, item.quantity);
        }
      }
    }

    if (shippingAddress) {
      await cartModule.updateShippingAddress(shippingAddress);
    }
  } catch (err) {
    console.error("Failed to restore cart from backup:", err);
  }
};
