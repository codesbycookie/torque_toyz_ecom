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
import Location from "../../pages/location/location"
import User from "../../pages/user/user"
import Payment from "../../pages/payment/payment"
import Order from "../../pages/order/order"

export const appRoutes = [
  {
    path: "/admin/products",
    label: "Products",
    title: "Products",
    description: "Manage your product inventory and details.",
    icon: <IconBoxSeam className="h-5 w-5 shrink-0" />,
    element: <Product />,
  },
   {
    path: "/admin/location",
    label: "Location",
    title: "Location",
    description: "Manage your location details.",
    icon: <IconBuildingCommunity className="h-5 w-5 shrink-0" />,
    element: <Location />,
  },
   {
    path: "/admin/users",
    label: "Users",
    title: "Users",
    description: "Manage your user accounts and permissions.",
    icon: <IconBuildingCommunity className="h-5 w-5 shrink-0" />,
    element: <User />,
  },
  {
  path: "/admin/order",
  label: "Orders",
  title: "Orders",
  description: "View and manage customer orders.",
  icon: <IconClipboardList className="h-5 w-5 shrink-0" />,
  element: <Order />,
  },
  {
  path: "/admin/payment",
  label: "payment",
  title: "payment",
  description: "View and manage payment history.",
  icon: <IconClipboardList className="h-5 w-5 shrink-0" />,
  element: <Payment />,
  },
  ];
