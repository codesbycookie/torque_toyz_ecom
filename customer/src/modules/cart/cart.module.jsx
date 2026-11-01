import useCartStore from "./cart.store";
import { useWishlistStore } from "@/modules/wishlist/wishlist.store";
import { apiRequest } from "@/core/api/api.request";
import {
  resolveProductId,
  getCartHeaders,
  restoreCartFromBackup,
} from "./cart.helpers";

const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:3000/api/v1";

export const useCartModule = (exported) => {
  const cartState = useCartStore((s) => s.cart);
  const loading = useCartStore((s) => s.loading);
  const cartId = useCartStore((s) => s.cartId);

  const getHeaders = () =>
    getCartHeaders(
      () => useCartStore.getState().cartId,
      () => useCartStore.getState().initCartId()
    );

  const fetchCart = async () => {
    try {
      useCartStore.getState().setLoading(true);
      const res = await apiRequest("get", `${baseUrl}/cart`, {
        headers: getHeaders(),
      });
      const data = res?.data || res;
      if (data && data.items) {
        useCartStore.getState().setCart(data);
      }
      return data;
    } catch (err) {
      console.error("Failed to fetch cart", err);
    } finally {
      useCartStore.getState().setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    const cleanProductId = resolveProductId(product);
    try {
      useCartStore.getState().setLoading(true);
      const res = await apiRequest("post", `${baseUrl}/cart/items`, {
        headers: getHeaders(),
        data: { productId: cleanProductId, quantity },
      });
      const data = res?.data || res;
      if (data && data.items) {
        useCartStore.getState().setCart(data);
      }

      // If the product was in the wishlist, remove it
      const wishlistList = useWishlistStore.getState().list || [];
      const isInWishlist =
        exported?.wishlist?.isWishlisted?.(cleanProductId) ||
        wishlistList.some((p) => String(p._id || p.id || p) === String(cleanProductId));

      if (isInWishlist && exported?.wishlist?.removeProduct) {
        try {
          await exported.wishlist.removeProduct(cleanProductId, { silent: true });
        } catch (wishlistErr) {
          console.warn("Failed to remove product from wishlist upon adding to cart", wishlistErr);
        }
      }

      return data;
    } catch (err) {
      console.error("Failed to add to cart", err);
      throw err;
    } finally {
      useCartStore.getState().setLoading(false);
    }
  };

  const updateQuantity = async (productOrId, quantity) => {
    const cleanProductId = resolveProductId(productOrId);
    try {
      useCartStore.getState().setLoading(true);
      const res = await apiRequest("put", `${baseUrl}/cart/items`, {
        headers: getHeaders(),
        data: { productId: cleanProductId, quantity },
      });
      const data = res?.data || res;
      if (data && data.items) {
        useCartStore.getState().setCart(data);
      }
      return data;
    } catch (err) {
      console.error("Failed to update cart", err);
      throw err;
    } finally {
      useCartStore.getState().setLoading(false);
    }
  };

  const removeFromCart = async (productOrId) => {
    const cleanProductId = resolveProductId(productOrId);
    try {
      useCartStore.getState().setLoading(true);
      const res = await apiRequest(
        "delete",
        `${baseUrl}/cart/items/${cleanProductId}`,
        {
          headers: getHeaders(),
        }
      );
      const data = res?.data || res;
      if (data && data.items) {
        useCartStore.getState().setCart(data);
      }
      return data;
    } catch (err) {
      console.error("Failed to remove from cart", err);
      throw err;
    } finally {
      useCartStore.getState().setLoading(false);
    }
  };

  const updateShippingAddress = async (shipping_address) => {
    try {
      useCartStore.getState().setLoading(true);
      const res = await apiRequest("put", `${baseUrl}/cart/address`, {
        headers: getHeaders(),
        data: { shipping_address },
      });
      const data = res?.data || res;
      if (data && data.items) {
        useCartStore.getState().setCart(data);
      }
      return data;
    } catch (err) {
      console.error("Failed to update shipping address", err);
      throw err;
    } finally {
      useCartStore.getState().setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      useCartStore.getState().setLoading(true);
      const res = await apiRequest("delete", `${baseUrl}/cart`, {
        headers: getHeaders(),
      });
      const data = res?.data || res;
      if (data && data.items) {
        useCartStore.getState().setCart(data);
      }
      return data;
    } catch (err) {
      console.error("Failed to clear cart", err);
    } finally {
      useCartStore.getState().setLoading(false);
    }
  };

  const checkoutDraft = async (payment_method, shipping_address) => {
    try {
      useCartStore.getState().setLoading(true);
      const res = await apiRequest("post", `${baseUrl}/cart/checkout`, {
        headers: getHeaders(),
        data: { payment_method, shipping_address },
      });
      const data = res?.data || res;
      if (data) {
        useCartStore.getState().setCart({
          items: [],
          pricing: { subtotal: 0, tax: 0, total_weight: 0, shipping_cost: 0, total: 0 },
          shipping_address: null,
        });
        return data;
      }
    } catch (err) {
      console.error("Failed to checkout", err);
      throw err;
    } finally {
      useCartStore.getState().setLoading(false);
    }
  };

  const restoreCart = async ({ orderId, cartBackup, errorMessage, shippingAddress }) => {
    return restoreCartFromBackup({
      orderId,
      cartBackup,
      errorMessage,
      shippingAddress,
      cartModule: { clearCart, addToCart, updateShippingAddress },
      ordersModule: exported?.orders,
    });
  };

  return {
    cart: cartState,
    items: cartState?.items || [],
    pricing: cartState?.pricing || {
      subtotal: 0,
      tax: 0,
      total_weight: 0,
      shipping_cost: 0,
      total: 0,
    },
    shippingAddress: cartState?.shipping_address,
    cartId,
    loading,
    fetchCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateShippingAddress,
    clearCart,
    checkoutDraft,
    restoreCart,
  };
};
