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