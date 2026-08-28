// app.routes.tsx

import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "@/components/global/layout.jsx";
import { appRoutes } from "./routes";
import Login from "@/pages/login/login";
import InsiderNotFound from "@/components/global/app404";
import { useAuth } from "@/core/contexts/auth.context";

function AuthenticatedLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Layout />;
}

function NotFoundByAuth() {
  const { user } = useAuth();

  return user ? <InsiderNotFound /> : <Navigate to="/" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      <Route path="/admin" element={<AuthenticatedLayout />}>
        {appRoutes.map((route, index) => (
          <Route
            key={route.path || index}
            path={route.path.replace(/^\/admin\/?/, "")}
            element={route.element}
          />
        ))}
        <Route path="*" element={<InsiderNotFound />} />
      </Route>

      <Route path="*" element={<NotFoundByAuth />} />
    </Routes>
  );
}