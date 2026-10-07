import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, Search, User, Heart, X, Package, Settings, Home, ShoppingBag } from "lucide-react";
import { useAuth } from "@/core/contexts/auth.context";
import { useApi } from "@/core/contexts/api.context";
import { useEcom } from "@/core/contexts/ecom.context";

export default function Navbar() {
  const { user } = useAuth();
  const api = useApi();
  const ecom = useEcom();
  const bannerText = ecom?.bannerText;
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    api.cart.fetchCart();
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "Products", path: "/products", icon: ShoppingBag },
    { name: "Wishlist", path: "/wishlist", icon: Heart },
    { name: "Orders", path: "/orders", icon: Package },
    { name: "Profile", path: user ? "/profile" : "/login", icon: User },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      {bannerText && (
        <div className="bg-primary text-primary-foreground py-1.5 px-4 text-center text-xs font-semibold tracking-wide">
          {bannerText}
        </div>
      )}
      <div className="container mx-auto flex h-16 items-center px-4 md:px-8">

        {/* Logo & Desktop Nav */}
        <div className="mr-4 hidden md:flex items-center">
          <Link to="/" className="mr-8 flex items-center space-x-2">
            <span className="font-extrabold sm:inline-block text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              TorqueToyz
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              to="/products"
              className={`transition-colors hover:text-primary font-semibold ${
                location.pathname === "/products" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Products
            </Link>
            <Link
              to="/wishlist"
              className={`transition-colors hover:text-primary font-semibold ${
                location.pathname === "/wishlist" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Wishlist
            </Link>
            <Link
              to="/orders"
              className={`transition-colors hover:text-primary font-semibold ${
                location.pathname === "/orders" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Orders
            </Link>
            {user && (
              <Link
                to="/profile"
                className={`transition-colors hover:text-primary font-semibold ${
                  location.pathname === "/profile" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Profile
              </Link>
            )}
          </nav>
        </div>

        {/* Mobile Nav Toggle & Logo */}
        <div className="flex flex-1 items-center md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-extrabold text-xl tracking-tighter text-primary">
              TorqueToyz
            </span>
          </Link>
        </div>

        {/* Right Section: Search & Icons */}
        <div className="flex flex-1 items-center justify-end space-x-3">
          <div className="hidden flex-1 md:flex justify-end">
            <div className="relative w-full max-w-sm group">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="search"
                placeholder="Search products..."
                className="flex h-9 w-full rounded-full border border-input bg-transparent px-9 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <nav className="flex items-center space-x-1">
            <Link to="/wishlist">
              <Button variant="ghost" size="icon" className="rounded-full relative">
                <Heart className="h-5 w-5" />
                <span className="sr-only">Wishlist</span>
              </Button>
            </Link>

            <Link to="/cart">
              <Button variant="ghost" size="icon" className="rounded-full relative">
                <ShoppingCart className="h-5 w-5" />
                {api.cart.items.length > 0 && (
                  <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {api.cart.items.length}
                  </span>
                )}
                <span className="sr-only">Cart</span>
              </Button>
            </Link>

            <Link to={user ? "/profile" : "/login"}>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">Account</span>
              </Button>
            </Link>
          </nav>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 pt-2 pb-4 space-y-2 shadow-lg">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
