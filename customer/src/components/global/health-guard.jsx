import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function BackendHealthGuard({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // Skip health guard if already on the health check page
    if (location.pathname === "/health-check" || hasCheckedRef.current) {
      return;
    }
    hasCheckedRef.current = true;

    const pingHealth = async () => {
      try {
        const baseUrl =
          import.meta.env.VITE_BASE_URL || "http://192.168.29.100:3000/api/v1";
        const res = await axios.get(`${baseUrl}/health`, { timeout: 3500 });
        if (res.status !== 200 || res.data?.status !== "ok") {
          navigate("/health-check", {
            state: { from: location },
            replace: true,
          });
        }
      } catch {
        // Backend is down, route to health check page
        navigate("/health-check", {
          state: { from: location },
          replace: true,
        });
      }
    };

    pingHealth();
  }, [location, navigate]);

  return children;
}

