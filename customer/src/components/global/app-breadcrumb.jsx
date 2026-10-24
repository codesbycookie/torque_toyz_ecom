import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useBreadcrumb } from "@/core/contexts/breadcrumb.context";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function AppBreadcrumb() {
  const location = useLocation();
  const { customBreadcrumbs } = useBreadcrumb();
  const pathname = location.pathname;

  // Do not render breadcrumbs on home, checkout, or auth flows
  const HIDDEN_ROUTES = [
    "/",
    "/checkout",
    "/login",
    "/register",
    "/forgot-password",
    "/verify-otp",
    "/reset-password",
  ];
  if (!pathname || HIDDEN_ROUTES.includes(pathname)) {
    return null;
  }

  let items = [];

  if (customBreadcrumbs && Array.isArray(customBreadcrumbs) && customBreadcrumbs.length > 0) {
    items = customBreadcrumbs;
  } else {
    // Generate intelligent default hierarchy based on routes
    if (pathname === "/products") {
      items = [
        { label: "Home", href: "/" },
        { label: "Products" },
      ];
    } else if (pathname.startsWith("/products/")) {
      const slug = pathname.replace("/products/", "");
      const formattedSlug = decodeURIComponent(slug)
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      items = [
        { label: "Home", href: "/" },
        { label: "Products", href: "/products" },
        { label: formattedSlug },
      ];
    } else if (pathname === "/cart") {
      items = [
        { label: "Home", href: "/" },
        { label: "Shopping Cart" },
      ];
    } else if (pathname === "/checkout") {
      items = [
        { label: "Home", href: "/" },
        { label: "Shopping Cart", href: "/cart" },
        { label: "Checkout" },
      ];
    } else if (pathname === "/orders") {
      items = [
        { label: "Home", href: "/" },
        { label: "My Profile", href: "/profile" },
        { label: "Your Orders" },
      ];
    } else if (pathname.startsWith("/orders/")) {
      const id = pathname.replace("/orders/", "");
      items = [
        { label: "Home", href: "/" },
        { label: "My Profile", href: "/profile" },
        { label: "Your Orders", href: "/orders" },
        { label: `Order #${id.slice(-6).toUpperCase()}` },
      ];
    } else if (pathname === "/profile") {
      items = [
        { label: "Home", href: "/" },
        { label: "My Profile" },
      ];
    } else if (pathname === "/settings") {
      items = [
        { label: "Home", href: "/" },
        { label: "My Profile", href: "/profile" },
        { label: "Account Settings" },
      ];
    } else if (pathname === "/wishlist") {
      items = [
        { label: "Home", href: "/" },
        { label: "Wishlist" },
      ];
    } else {
      // Dynamic fallback for any nested route
      const segments = pathname.split("/").filter(Boolean);
      items = [{ label: "Home", href: "/" }];
      let accumulatedPath = "";
      segments.forEach((seg, idx) => {
        accumulatedPath += `/${seg}`;
        const label = decodeURIComponent(seg)
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
        if (idx === segments.length - 1) {
          items.push({ label });
        } else {
          items.push({ label, href: accumulatedPath });
        }
      });
    }
  }

  if (items.length <= 1) return null;

  return (
    <div className="w-full bg-transparent print:hidden transition-all duration-200">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5">
        <Breadcrumb>
          <BreadcrumbList className="gap-1 sm:gap-1.5 text-xs text-muted-foreground/80 font-medium">
            {items.map((item, index) => {
              const isLast = index === items.length - 1;
              return (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <BreadcrumbSeparator className="[&>svg]:size-3 opacity-40" />
                  )}
                  <BreadcrumbItem>
                    {isLast || !item.href ? (
                      <BreadcrumbPage className="line-clamp-1 max-w-[200px] sm:max-w-xs md:max-w-md font-semibold text-foreground text-xs">
                        {item.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild className="hover:text-primary transition-colors text-xs text-muted-foreground/75 font-medium">
                        <Link to={item.href}>{item.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}
