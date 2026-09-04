import {
  IconBoxSeam,
  IconBuildingCommunity,
  IconUsers,
  IconClipboardList,
  IconCreditCard,
  IconCategory,
  IconSettings,
  IconLogout2,
  IconLayoutDashboard,
} from "@tabler/icons-react";

import Dashboard from "../../pages/dashboard/dashboard";

import Product from "../../pages/products/product";
import Location from "../../pages/location/location";
import User from "../../pages/user/user";
import Payment from "../../pages/payment/payment";
import Order from "../../pages/order/order";
import Category from "../../pages/category/category";
import Setting from "@/pages/setting/setting";

// Login is NOT here
export const adminRoutes = {
  role: 'admin',
  routes: [
    {
      path: "/admin/",
      label: "Dashboard",
      title: "Dashboard",
      description: "Overview of your analytics and store performance.",
      icon: <IconLayoutDashboard className="h-5 w-5 shrink-0" />,
      element: <Dashboard />,
    }, {
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
      icon: <IconUsers className="h-5 w-5 shrink-0" />,
      element: <User />,
    },

    {
      path: "/admin/orders",
      label: "Orders",
      title: "Orders",
      description: "View and manage customer orders.",
      icon: <IconClipboardList className="h-5 w-5 shrink-0" />,
      element: <Order />,
    },
    {
      path: "/admin/payment",
      label: "Payment",
      title: "Payment",
      description: "View and manage payment history.",
      icon: <IconCreditCard className="h-5 w-5 shrink-0" />,
      element: <Payment />,
    },
    {
      path: "/admin/category",
      label: "Category",
      title: "Category",
      description: "View and manage categories.",
      icon: <IconCategory className="h-5 w-5 shrink-0" />,
      element: <Category />,
    },
    {
      path: "/admin/setting",
      label: "Settings",
      title: "Settings",
      description: "View and manage Settings.",
      icon: <IconSettings className="h-5 w-5 shrink-0" />,
      element: <Setting />,
    },
  ],
  logout: {
    label: "Logout",
    title: "Sign Out",
    description: "Securely sign out of your administrator account.",
    icon: <IconLogout2 className="h-5 w-5 shrink-0" />,
    path: "/",
  },
};