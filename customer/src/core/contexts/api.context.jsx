import { createContext, useContext } from "react";
import { useProductModule } from "@/modules/product/product.module";
import { useCartModule } from "@/modules/cart/cart.module";
import { useWishlistModule } from "@/modules/wishlist/wishlist.module";
import { useOrderModule } from "@/modules/order/order.module";
import { useUserModule } from "@/modules/user/user.module";
import { usePaymentModule } from "@/modules/payment/payment.module";
import { useLocationModule } from "@/modules/location/location.module";

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
  const cartModule = useCartModule(exported);
  const wishlistModule = useWishlistModule(exported);
  const orderModule = useOrderModule(exported);
  const userModule = useUserModule(exported);
  const paymentModule = usePaymentModule(exported);
  const locationModule = useLocationModule(exported);

  Object.assign(exported, {
    // Singular aliases
    product: productModule,
    cart: cartModule,
    wishlist: wishlistModule,
    order: orderModule,
    user: userModule,
    payment: paymentModule,
    location: locationModule,

    // Plural aliases
    products: productModule,
    orders: orderModule,
    users: userModule,
    payments: paymentModule,
    locations: locationModule,

    // Module name aliases
    productModule,
    cartModule,
    wishlistModule,
    orderModule,
    userModule,
    paymentModule,
    locationModule,
  });

  return (
    <ApiContext.Provider value={{ ...exported }}>
      {children}
    </ApiContext.Provider>
  );
};