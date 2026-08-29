import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter as Router } from "react-router-dom";
import { UIProvider } from "@/core/contexts/ui.context";
import { ApiProvider } from "@/core/contexts/api.context";
import ScrollToTop from "@/core/utils/scrolltotop.util";
import "./app.css";
import AppRoutes from "@/core/router/app.routes";
import { AuthProvider, useAuth } from "@/core/contexts/auth.context";

export default function App() {
  return (
    <Router>
      <AuthProvider>
      <UIProvider>
        <ApiProvider>
          <ScrollToTop />
          <Toaster />
          <AppRoutes />
        </ApiProvider>
      </UIProvider>
    </AuthProvider>
    </Router>
  );
}