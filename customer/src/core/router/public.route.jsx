import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/core/contexts/auth.context";
import AppLoader from "@/components/global/loader";

export default function PublicRoute({ children }) {
  const { authenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AppLoader />;
  }

  if (authenticated) {
    const targetPath = location.state?.from?.pathname;
    const isAuthTarget =
      targetPath &&
      ["/login", "/register", "/forgot-password"].includes(targetPath);
    const destination =
      !isAuthTarget && location.state?.from
        ? `${location.state.from.pathname || ""}${location.state.from.search || ""}`
        : "/";
    return <Navigate to={destination || "/"} replace />;
  }

  return children ? children : <Outlet />;
}

