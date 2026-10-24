import Navbar from "./navbar";
import AppBreadcrumb from "./app-breadcrumb";
import Footer from "./footer";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <AppBreadcrumb />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}