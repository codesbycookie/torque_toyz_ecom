

import { createContext, useContext } from 'react';
import { useDepartmentModule } from '@/modules/department';
import { useServiceModule } from '@/modules/service';   
import { useProductModule } from '@/modules/products';
import { useBillModule } from '@/modules/bill';
import { useBranchModule } from '@/modules/branch';
import { useInventoryProductModule } from '@/modules/inventory-product';
import { useSearchModule } from '@/modules/search';
import { useBranchAdminModule } from "@/modules/branch-admin";
import { useShopAdminModule } from "@/modules/shop-admin";
import { useStaffModule } from "@/modules/staff-admin";
import { useDepartmentAdminModule } from "@/modules/department-admin";
import { useOrderModule } from "@/modules/order/order.module";



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



    Object.assign(exported, {
 });

    



    return <ApiContext.Provider value={{ ...exported }}>{children}</ApiContext.Provider>;
};
