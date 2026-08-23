import {
  IconBoxSeam,
  IconBuildingCommunity,
  IconClipboardList,
  IconReceipt,
  IconGitBranch,
  IconLogout2,
  IconCalculator,
} from "@tabler/icons-react";
import Product from "../../pages/products/product"

export const appRoutes = [
  {
    path: "/admin/products",
    label: "Products",
    title: "Products",
    description: "Manage your product inventory and details.",
    icon: <IconBoxSeam className="h-5 w-5 shrink-0" />,
    element: <Product />,
  },
  ];
