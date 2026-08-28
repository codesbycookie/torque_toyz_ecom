// app.routes.tsx

import { Route, Routes } from "react-router-dom";
import Layout from "@/components/global/layout.jsx";
import { appRoutes } from "./routes";
import Login from "@/pages/login/login";
import InsiderNotFound from "@/components/global/app404";
import PublicNotFound from "@/components/global/notfound";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public – no Layout */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      {/* Protected – with Layout */}
      <Route element={<Layout />}>
        {appRoutes.map((route, index) => (
          <Route key={route.path || index} path={route.path} element={route.element} />
        ))}

        {/* Any unmatched path under the authenticated app → role-aware 404 */}
        <Route path="*" element={<InsiderNotFound />} />
      </Route>
    </Routes>
  );
}