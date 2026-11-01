import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/core/contexts/auth.context";
import AppLoader from "@/components/global/loader";

export default function ProtectedRoute({ children }) {
  const { authenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AppLoader />;
  }

  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
}

