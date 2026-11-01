import { createContext, useContext, useEffect } from "react";
import { useProductModule } from "@/modules/product/product.module";
import { useCategoryModule } from "@/modules/category/category.module";
import { useCartModule } from "@/modules/cart/cart.module";
import { useWishlistModule } from "@/modules/wishlist/wishlist.module";
import { useOrderModule } from "@/modules/order/order.module";
import { useUserModule } from "@/modules/user/user.module";
import { usePaymentModule } from "@/modules/payment/payment.module";
import { useLocationModule } from "@/modules/location/location.module";
import { useSettingModule } from "@/modules/setting/setting.module";
import { useHomeModule } from "@/modules/home/home.module";

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
  const categoryModule = useCategoryModule(exported);
  const cartModule = useCartModule(exported);
  const wishlistModule = useWishlistModule(exported);
  const orderModule = useOrderModule(exported);
  const userModule = useUserModule(exported);
  const paymentModule = usePaymentModule(exported);
  const locationModule = useLocationModule(exported);
  const settingModule = useSettingModule(exported);
  const homeModule = useHomeModule(exported);

  useEffect(() => {
    settingModule.fetchPublic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  Object.assign(exported, {
    // Singular aliases
    product: productModule,
    category: categoryModule,
    cart: cartModule,
    wishlist: wishlistModule,
    order: orderModule,
    user: userModule,
    payment: paymentModule,
    location: locationModule,
    setting: settingModule,
    home: homeModule,

    // Plural aliases
    products: productModule,
    categories: categoryModule,
    orders: orderModule,
    users: userModule,
    payments: paymentModule,
    locations: locationModule,
    settings: settingModule,

    // Module name aliases
    productModule,
    categoryModule,
    cartModule,
    wishlistModule,
    orderModule,
    userModule,
    paymentModule,
    locationModule,
    settingModule,
    homeModule,
  });

  return (
    <ApiContext.Provider value={{ ...exported }}>
      {children}
    </ApiContext.Provider>
  );
};
