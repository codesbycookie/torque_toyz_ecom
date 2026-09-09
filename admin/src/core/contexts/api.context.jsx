import { createContext, useContext } from "react";
import { useProductModule } from "../../modules/product/product.module";
import { useLocationModule } from "../../modules/location/location.module";
import { useUserModule } from "@/modules/user";
import { useOrderModule } from "../../modules/order/order.module";
import { usePaymentModule } from "../../modules/payment/payment.module";
import { useCategoryModule } from "../../modules/category/category.module";
import { useSettingModule } from "@/modules/setting";
import { useDashboardModule } from "@/modules/dashboard/dashboard.module";
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
  const locationModule = useLocationModule(exported);
  const userModule = useUserModule(exported);
  const orderModule = useOrderModule(exported);
  const paymentModule = usePaymentModule(exported);
  const categoryModule = useCategoryModule(exported);
  const settingModule = useSettingModule(exported);
  const dashboardModule = useDashboardModule(exported);
  
  Object.assign(exported, {
    products: productModule,
    locations: locationModule,
    users: userModule,
    order: orderModule,
    payments: paymentModule,
    categories: categoryModule,
    settings: settingModule,
  });

  return (
    <ApiContext.Provider value={{ ...exported }}>
      {children}
    </ApiContext.Provider>
  );
};
