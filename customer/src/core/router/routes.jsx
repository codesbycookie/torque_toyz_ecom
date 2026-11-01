import Login from "@/pages/login/login";
import Register from "@/pages/register/register";
import ForgotPassword from "@/pages/forgot-password/forgot-password";
import ProductDetail from "@/pages/product-detail/product-detail";
import Home from "@/pages/home/home";
import Product from "@/pages/product/product";
import Profile from "@/pages/profile/profile";
import Wishlist from "@/pages/wishlist/wishlist";
import Settings from "@/pages/settings/settings";
import Cart from "@/pages/cart/cart";
import Orders from "@/pages/orders/orders";
import OrderTracking from "@/pages/order-tracking/order-tracking";
import Checkout from "@/pages/checkout/checkout";
import NotFound from "@/components/global/notfound";

export const appRoutes = [
  {
    path: "/",
    element: <Home />,
    withLayout: true,
    isPublic: true,
  },
  {
    path: "/products/:slug",
    element: <ProductDetail />,
    withLayout: true,
  },
  {
    path: "/login",
    element: <Login />,
    withLayout: false,
    guestOnly: true,
  },
  {
    path: "/register",
    element: <Register />,
    withLayout: false,
    guestOnly: true,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
    withLayout: false,
    guestOnly: true,
  },
  {
    path: "/products",
    element: <Product />,
    withLayout: true,
  },
  {
    path: "/profile",
    element: <Profile />,
    withLayout: true,
  },
  {
    path: "/wishlist",
    element: <Wishlist />,
    withLayout: true,
  },
  {
    path: "/settings",
    element: <Settings />,
    withLayout: true,
  },
  {
    path: "/cart",
    element: <Cart />,
    withLayout: true,
  },
  {
    path: "/orders",
    element: <Orders />,
    withLayout: true,
  },
  {
    path: "/orders/:id",
    element: <OrderTracking />,
    withLayout: true,
  },
  {
    path: "/checkout",
    element: <Checkout />,
    withLayout: true,
  },
  {
    path: "/404",
    element: <NotFound />,
    withLayout: true,
    isPublic: true,
  },
];
