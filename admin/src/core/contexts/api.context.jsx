import { createContext, useContext } from 'react';
import { useProductModule } from "../../modules/product/product.module";
import { useLocationModule } from "../../modules/location/location.module";

const ApiContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useApi = () => {
  const ctx = useContext(ApiContext);
  if (!ctx) {
    throw new Error('ApiContext must be used inside <ApiProvider>');
  }
  return ctx;
};

export const ApiProvider = ({ children }) => {
  const exported = {};

  const productModule = useProductModule(exported);
  const locationModule = useLocationModule(exported);

  Object.assign(exported, {
    products: productModule,
    locations: locationModule,
  });

  return <ApiContext.Provider value={{ ...exported }}>{children}</ApiContext.Provider>;
};