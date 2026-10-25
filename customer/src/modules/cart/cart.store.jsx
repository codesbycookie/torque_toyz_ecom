import { create } from "zustand";
import { persist } from "zustand/middleware";


const generateUUID = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch {}
  }
  // Safe RFC4122 v4 fallback for non-secure contexts (e.g. mobile LAN IP over HTTP)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const useCartStore = create(
  persist(
    (set) => ({
      cartId: null,
      cart: {
        items: [],
        pricing: { subtotal: 0, tax: 0, total_weight: 0, shipping_cost: 0, total: 0 },
        shipping_address: null,
      },
      loading: false,
      
      initCartId: () => {
        set((state) => {
          if (!state.cartId) {
            return { cartId: generateUUID() };
          }
          return state;
        });
      },
      
      setCart: (cartData) => set({ cart: cartData }),
      setLoading: (loading) => set({ loading }),
      
      clearCartId: () => set({ cartId: null }),
    }),
    {
      name: "torque-cart-identity",
      partialize: (state) => ({ cartId: state.cartId }), // Only persist cartId
    }
  )
);

export default useCartStore;
