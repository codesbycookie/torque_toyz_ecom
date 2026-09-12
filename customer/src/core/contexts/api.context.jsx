import { createContext, useContext } from "react";
import { useProductModule } from "@/modules/product/product.module";
// import other modules later when ready
// import { useCartModule } from "@/modules/cart/cart.module";
// import { useWishlistModule } from "@/modules/wishlist/wishlist.module";
// import { useUserModule } from "@/modules/user/user.module";

const ApiContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useApi = () => {
  const ctx = useContext(ApiContext);
  if (!ctx) {
    throw new Error("ApiContext must be used inside <ApiProvider>");
  }
  return ctx;
};

export const ApiProvider = ({ children }) => {
  const exported = {};

  const productModule = useProductModule(exported);
  // const cartModule = useCartModule(exported);
  // const wishlistModule = useWishlistModule(exported);
  // const userModule = useUserModule(exported);

  Object.assign(exported, {
    products: productModule,
    // cart: cartModule,
    // wishlist: wishlistModule,
    // users: userModule,
  });

  return (
    <ApiContext.Provider value={{ ...exported }}>
      {children}
    </ApiContext.Provider>
  );
};