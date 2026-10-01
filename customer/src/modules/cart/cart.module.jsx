import useCartStore from "./cart.store";
import { apiurls } from "@/core/api/api.urls";
import { apiRequest } from "@/core/api/api.request";
import { useEffect } from "react";

export const useCartModule = () => {
  const store = useCartStore();

  const getHeaders = () => {
    let cartId = useCartStore.getState().cartId;
    if (!cartId) {
      useCartStore.getState().initCartId();
      cartId = useCartStore.getState().cartId;
    }
    return { "x-cart-id": cartId };
  };

  const fetchCart = async () => {
    try {
      store.setLoading(true);
      const res = await apiRequest("get", "http://localhost:3000/api/v1/cart", {
        headers: getHeaders(),
      });
      if (res?.data) {
        store.setCart(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch cart", err);
    } finally {
      store.setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      store.setLoading(true);
      const res = await apiRequest("post", "http://localhost:3000/api/v1/cart/items", {
        headers: getHeaders(),
        data: { productId: product._id || product.id, quantity },
      });
      if (res?.data) store.setCart(res.data);
    } catch (err) {
      console.error("Failed to add to cart", err);
    } finally {
      store.setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      store.setLoading(true);
      const res = await apiRequest("put", "http://localhost:3000/api/v1/cart/items", {
        headers: getHeaders(),
        data: { productId, quantity },
      });
      if (res?.data) store.setCart(res.data);
    } catch (err) {
      console.error("Failed to update cart", err);
    } finally {
      store.setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      store.setLoading(true);
      const res = await apiRequest("delete", `http://localhost:3000/api/v1/cart/items/${productId}`, {
        headers: getHeaders(),
      });
      if (res?.data) store.setCart(res.data);
    } catch (err) {
      console.error("Failed to remove from cart", err);
    } finally {
      store.setLoading(false);
    }
  };

  const updateShippingAddress = async (shipping_address) => {
    try {
      store.setLoading(true);
      const res = await apiRequest("put", "http://localhost:3000/api/v1/cart/address", {
        headers: getHeaders(),
        data: { shipping_address },
      });
      if (res?.data) store.setCart(res.data);
    } catch (err) {
      console.error("Failed to update shipping address", err);
    } finally {
      store.setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      store.setLoading(true);
      const res = await apiRequest("delete", "http://localhost:3000/api/v1/cart", {
        headers: getHeaders(),
      });
      if (res?.data) store.setCart(res.data);
    } catch (err) {
      console.error("Failed to clear cart", err);
    } finally {
      store.setLoading(false);
    }
  };

  const checkoutDraft = async (payment_method) => {
    try {
      store.setLoading(true);
      const res = await apiRequest("post", "http://localhost:3000/api/v1/cart/checkout", {
        headers: getHeaders(),
        data: { payment_method },
      });
      if (res?.data) {
        store.setCart({ items: [], pricing: { subtotal: 0, total_weight: 0, shipping_cost: 0, total: 0 }, shipping_address: null });
        return res.data;
      }
    } catch (err) {
      console.error("Failed to checkout", err);
      throw err;
    } finally {
      store.setLoading(false);
    }
  };

  return {
    get items() {
      return store.cart.items;
    },
    get pricing() {
      return store.cart.pricing;
    },
    get cart() {
      return store.cart;
    },
    loading: store.loading,
    fetchCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateShippingAddress,
    clearCart,
    checkoutDraft,
  };
};
