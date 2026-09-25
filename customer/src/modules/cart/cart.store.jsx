import { create } from "zustand";
import { persist } from "zustand/middleware";


const useCartStore = create(
  persist(
    (set) => ({
      cartId: null,
      cart: {
        items: [],
        pricing: { subtotal: 0, total_weight: 0, shipping_cost: 0, total: 0 },
        shipping_address: null,
      },
      loading: false,
      
      initCartId: () => {
        set((state) => {
          if (!state.cartId) {
            return { cartId: crypto.randomUUID() };
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
