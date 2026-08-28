import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiurls } from "../api/api.urls";
import { createCrud } from "../factory/entity.crud";
import { setupInterceptors } from "../api/api.service";
import { flushSync } from "react-dom";
import { uiRef } from "../bridge/ui.ref";
import { toast } from "sonner";
import handleApiError from "../errors/error.handler";
import AppLoader from "@/components/global/loader";

const AuthContext = createContext();

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthContext must be used inside <AuthProvider>");
  return ctx;
};

// ── DUMMY AUTH (no backend yet) ──────────────────────────────────────
// Swap the bodies of login/logout/hydrateUser back to the commented
// crud.* calls once the real /auths endpoints exist. Shape of `user`
// is kept identical to what the real API is expected to return, so
// nothing downstream (routes, App404 roleConfig, Layout, etc.) needs
// to change when this is swapped out.
const DUMMY_CREDENTIALS = {
  loginId: "admin@torquetoyzz.com",
  password: "admin123",
};

const DUMMY_USER = {
  _id: "dummy-user-1",
  name: "Admin User",
  email: "admin@torquetoyzz.com",
  role: "super_admin",
  unifiedPermissions: {
    products: true,
    location: true,
    users: true,
    orders: true,
    payment: true,
    category: true,
    setting: true,
  },
};

const SESSION_KEY = "dummy_auth_session";
// ──────────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const navigateRef = useRef(navigate);
  const locationRef = useRef(location);

  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);
  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Kept for when the real API is wired in — unused while login/me are dummy.
  const crud = useMemo(
    () => createCrud({ entity: "Auth", urls: apiurls.auth, store: null }),
    [],
  );

  useEffect(() => {
    setupInterceptors((message) => {
      uiRef.clearModals();
      flushSync(() => {
        setUser(null);
        setRole(null);
      });

      navigateRef.current("/");
      toast.error(message);
    });
  }, []);

  useEffect(() => {
    let mounted = true;

    const hydrateUser = async () => {
      try {
        setLoading(true);

        // ── DUMMY: restore from sessionStorage instead of GET /auths/me
        const stored = sessionStorage.getItem(SESSION_KEY);
        const res = stored ? JSON.parse(stored) : null;

        // ── REAL API (uncomment once backend exists):
        // const res = await crud.me();

        if (!mounted) return;

        if (res) {
          setUser(res);
          setRole(res.role);
        } else {
          setUser(null);
          setRole(null);
        }
      } catch {
        if (mounted) {
          setUser(null);
          setRole(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    hydrateUser();
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (data) => {
    try {
      setLoggingIn(true);

      // ── DUMMY: check against hardcoded credentials, fake a bit of latency
      await new Promise((resolve) => setTimeout(resolve, 600));

      const matches =
        data?.loginId === DUMMY_CREDENTIALS.loginId &&
        data?.password === DUMMY_CREDENTIALS.password;

      if (!matches) {
        toast.error("Invalid login ID or password");
        return;
      }

      sessionStorage.setItem(SESSION_KEY, JSON.stringify(DUMMY_USER));

      flushSync(() => {
        setUser(DUMMY_USER);
        setRole(DUMMY_USER.role);
      });

      toast.success("Login successful");
      navigate("/admin/products");

      // ── REAL API (uncomment once backend exists):
      // const res = await crud.login(data, { __options: { toast: false } });
      // if (!res) return;
      // const me = await crud.me({ __options: { toast: false } });
      // flushSync(() => {
      //   setUser(me);
      //   setRole(me.role);
      // });
      // toast.success("Login successful");
      // navigate(`/${me.role}/`);
    } catch (err) {
      return err;
    } finally {
      setLoggingIn(false);
    }
  };

  const logout = async () => {
    // ── DUMMY: just clear the local session
    sessionStorage.removeItem(SESSION_KEY);

    // ── REAL API (uncomment once backend exists):
    // try {
    //   await crud.logout();
    // } catch {
    //   toast.error("Error during logout");
    // }

    uiRef.clearModals();
    flushSync(() => {
      setUser(null);
      setRole(null);
    });

    navigate("/");
    toast.success("Logged out");
  };

  const changePassword = async (currentPassword, newPassword) => {
    // ── DUMMY: not wired to a backend yet
    toast.error("Password change isn't available yet — backend not connected.");
    return;

    // ── REAL API (uncomment once backend exists):
    // try {
    //   const res = await crud.changePassword({
    //     userId: user?._id,
    //     role: user?.role,
    //     currentPassword,
    //     newPassword,
    //   });
    //   toast.success("Password updated successfully");
    //   setTimeout(() => {
    //     logout();
    //   }, 2000);
    //   return res;
    // } catch (err) {
    //   handleApiError(err);
    // }
  };

  const adminResetPassword = async (targetId, targetRole, newPassword) => {
    // ── DUMMY: not wired to a backend yet
    toast.error("Password reset isn't available yet — backend not connected.");
    return;

    // ── REAL API (uncomment once backend exists):
    // try {
    //   const res = await crud.adminResetPassword({
    //     adminId: user?._id,
    //     adminRole: user?.role,
    //     targetId,
    //     targetRole,
    //     newPassword,
    //   });
    //   toast.success("Password reset successfully");
    //   return res;
    // } catch (err) {
    //   handleApiError(err);
    // }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userId: user?._id || null,
        isSuperAdmin: user?.role === "super_admin",
        role,
        permissions: user?.unifiedPermissions || {},
        loading,
        loggingIn,
        setLoading,
        login,
        changePassword,
        adminResetPassword,
        logout,
        setUser,
      }}
    >
      {loading ? <AppLoader /> : children}
    </AuthContext.Provider>
  );
};