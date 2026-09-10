import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, Search, User } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-8">
        
        {/* Logo & Desktop Nav */}
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-8 flex items-center space-x-2">
            <span className="font-extrabold sm:inline-block text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              TorqueToyz
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link to="/products/cars" className="transition-colors hover:text-primary text-muted-foreground font-semibold">
              Cars
            </Link>
            <Link to="/products/bikes" className="transition-colors hover:text-primary text-muted-foreground font-semibold">
              Bikes
            </Link>
            <Link to="/products/accessories" className="transition-colors hover:text-primary text-muted-foreground font-semibold">
              Accessories
            </Link>
          </nav>
        </div>

        {/* Mobile Nav Toggle & Logo */}
        <div className="flex flex-1 items-center md:hidden">
          <Button variant="ghost" size="icon" className="mr-2">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-extrabold text-xl tracking-tighter text-primary">
              TorqueToyz
            </span>
          </Link>
        </div>

        {/* Right Section: Search & Icons */}
        <div className="flex flex-1 items-center justify-end space-x-4">
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
            <Link to="/login">
              <Button variant="ghost" size="icon" className="rounded-full hidden sm:flex">
                <User className="h-5 w-5" />
                <span className="sr-only">Account</span>
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="rounded-full relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-primary"></span>
              <span className="sr-only">Cart</span>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
