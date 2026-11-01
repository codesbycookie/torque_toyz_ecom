import { Route, Routes } from "react-router-dom";
import Layout from "@/components/global/layout.jsx";
import { appRoutes } from "./routes";
import ProtectedRoute from "./protected.route";
import PublicRoute from "./public.route";
import NotFound from "@/components/global/notfound";

export default function AppRoutes() {
  const layoutRoutes = appRoutes.filter((route) => route.withLayout);
  const bareRoutes = appRoutes.filter((route) => !route.withLayout);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {layoutRoutes.map((route, index) => {
          const isIndex = route.path === "/";
          const element = route.isPublic ? (
            route.element
          ) : (
            <ProtectedRoute>{route.element}</ProtectedRoute>
          );

          return (
            <Route
              key={index}
              path={isIndex ? undefined : route.path}
              index={isIndex}
              element={element}
            />
          );
        })}
        {/* 404 Catch-All inside Layout */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {bareRoutes.map((route, index) => {
        const element = route.guestOnly ? (
          <PublicRoute>{route.element}</PublicRoute>
        ) : route.isPublic ? (
          route.element
        ) : (
          <ProtectedRoute>{route.element}</ProtectedRoute>
        );

        return (
          <Route key={index} path={route.path} element={element} />
        );
      })}
    </Routes>
  );
}
