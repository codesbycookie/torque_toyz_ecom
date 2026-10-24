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
import { setupInterceptors, resetLogoutState } from "../api/api.service";
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
  const [loggingIn, setLoggingIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const crud = useMemo(
    () => createCrud({ entity: "Auth", urls: apiurls.auth, store: null }),
    [],
  );

  const otpCrud = useMemo(
    () => createCrud({ entity: "Otp", urls: apiurls.otps, store: null }),
    [],
  );

  useEffect(() => {
    setupInterceptors((message) => {
      uiRef.clearModals?.();
      flushSync(() => {
        setUser(null);
      });

      const currentPath = locationRef.current?.pathname;
      const isPublicAuthPage =
        currentPath === "/login" ||
        currentPath === "/register" ||
        currentPath === "/forgot-password";

      if (!isPublicAuthPage) {
        navigateRef.current("/login");
        toast.error(message);
      }
    });
  }, []);

  useEffect(() => {
    let mounted = true;

    const hydrateUser = async () => {
      try {
        setLoading(true);
        const res = await crud.me({ __options: { toast: false, silent: true } });

        if (!mounted) return;

        if (res) {
          setUser(res);
        } else {
          setUser(null);
        }
      } catch {
        if (mounted) {
          setUser(null);
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

      const res = await crud.login(data, { __options: { toast: false } });
      if (!res) return;

      const me = await crud.me({ __options: { toast: false, silent: true } });

      flushSync(() => {
        setUser(me);
      });

      resetLogoutState();
      toast.success("Login successful");
      navigate("/");
    } catch (err) {
      return err;
    } finally {
      setLoggingIn(false);
    }
  };

  const register = async (data) => {
    try {
      setLoggingIn(true);

      const res = await crud.register(data, { __options: { toast: false } });
      if (!res) return;

      const me = await crud.me({ __options: { toast: false, silent: true } });

      flushSync(() => {
        setUser(me);
      });

      toast.success("Registration successful");
      navigate("/");
    } catch (err) {
      return err;
    } finally {
      setLoggingIn(false);
    }
  };

  const logout = async () => {
    try {
      await crud.logout();
    } catch {
      toast.error("Error during logout");
    }

    uiRef.clearModals?.();
    flushSync(() => {
      setUser(null);
    });

    navigate("/");
    toast.success("Logged out");
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await crud.changePassword({
        userId: user?._id,
        currentPassword,
        newPassword,
      });
      toast.success("Password updated successfully");
      setTimeout(() => {
        logout();
      }, 2000);
      return res;
    } catch (err) {
      handleApiError(err);
    }
  };

  const sendPasswordResetOtp = async (email) => {
    try {
      const res = await otpCrud.send({
        email,
        purpose: "password_reset",
      });
      toast.success("Verification code sent to your email!");
      return res;
    } catch (err) {
      handleApiError(err);
      throw err;
    }
  };

  const verifyPasswordResetOtp = async (email, code) => {
    try {
      const res = await otpCrud.verify({
        email,
        code,
        purpose: "password_reset",
      });
      toast.success("Code verified successfully!");
      return res;
    } catch (err) {
      handleApiError(err);
      throw err;
    }
  };

  const resetPassword = async (email, code, newPassword) => {
    try {
      const res = await crud.resetPassword({
        email,
        code,
        newPassword,
      });
      toast.success("Password reset successfully! Please sign in.");
      return res;
    } catch (err) {
      handleApiError(err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authenticated: !!user,
        user,
        user_id: user?._id || null,
        loading,
        loggingIn,
        setLoading,
        login,
        register,
        changePassword,
        sendPasswordResetOtp,
        verifyPasswordResetOtp,
        resetPassword,
        logout,
        setUser,
      }}
    >
      {loading ? <AppLoader /> : children}
    </AuthContext.Provider>
  );
};
