import Login from "@/pages/login/login";
// import Register from "@/pages/register/register";
import ProductDetail from "@/pages/product-detail/product-detail";
import Home from "@/pages/home/home";
import Product from "@/pages/product/product";

export const appRoutes = [
  {
    path: "/",
    element: <Home />,
    withLayout: true,
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
  },
  // {
  //   path: "/register",
  //   element: <Register />,
  //   withLayout: false,
  // },
  {
    path:"/products",
    element:<Product/>,
    withLayout:true
  }
];