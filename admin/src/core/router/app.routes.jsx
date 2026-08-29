// app.routes.tsx

import { Route, Routes } from "react-router-dom";
import Layout from "@/components/global/layout.jsx";
import { adminRoutes } from "./routes";
import Login from "@/pages/login/login";
import InsiderNotFound from "@/components/global/app404";
import ProtectedRoute from "./protected.route";
import { getRelativePath } from "../utils/helper.utils";
import PublicRoute from "./public.route";
import PublicNotFound from "@/components/global/notfound";


export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path={`/${adminRoutes.role}/*`}
        element={<Layout routes={adminRoutes.routes} logoutComponent={adminRoutes.logout} />}
      >
        {adminRoutes.routes.map((route, index) => {
          const basePath = `/${adminRoutes.role}`;
          const isIndex = route.path === basePath || route.path === `${basePath}/`;
          return (
            <Route
              key={index}
              {...(isIndex ? { index: true } : { path: getRelativePath(route.path, basePath) })}
              element={
                <ProtectedRoute allowedRoles={[adminRoutes.role]}>
                  {route.element}
                </ProtectedRoute>
              }
            />
          );
        })}
        <Route path="*" element={<InsiderNotFound />} />
      </Route>

      <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="*" element={<PublicNotFound />} />
    </Routes>
  );
}