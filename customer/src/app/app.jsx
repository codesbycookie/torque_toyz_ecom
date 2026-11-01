import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter as Router } from "react-router-dom";
import { UIProvider } from "@/core/contexts/ui.context";
import { ApiProvider } from "@/core/contexts/api.context";
import { EcomProvider } from "@/core/contexts/ecom.context";
import ScrollToTop from "@/core/utils/scrolltotop.util";
import "./app.css";
import AppRoutes from "@/core/router/app.routes";
import { AuthProvider } from "@/core/contexts/auth.context";
import { BreadcrumbProvider } from "@/core/contexts/breadcrumb.context";
import { ThemeProvider } from "next-themes";

export default function App() {
  // Purge any unauthorized localStorage keys on startup
  useEffect(() => {
    try {
      const allowedKeys = new Set([
        "access_token",
        "theme",
        "torque_announcement_dismissed_until",
        "torque_announcement_dismissed_text",
      ]);
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !allowedKeys.has(key)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch {
      // ignore
    }
  }, []);
  return (
    <Router>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <UIProvider>
            <ApiProvider>
              <EcomProvider>
                <BreadcrumbProvider>
                  <ScrollToTop />
                  <Toaster />
                  <AppRoutes />
                </BreadcrumbProvider>
              </EcomProvider>
            </ApiProvider>
          </UIProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}