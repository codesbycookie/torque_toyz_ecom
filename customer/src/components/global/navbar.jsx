import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Menu,
  Search,
  User,
  Heart,
  X,
  Package,
  Settings,
  Home,
  ShoppingBag,
  LogOut,
  ChevronDown,
  ChevronRight,
  Flame,
  ArrowUpRight,
  Sparkles,
  Car,
  Clock,
  Compass,
} from "lucide-react";
import {
  Command,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/core/contexts/auth.context";
import { useApi } from "@/core/contexts/api.context";
import { useEcom } from "@/core/contexts/ecom.context";
import { cn } from "@/lib/utils";

// Curated trending queries for command autocomplete
const POPULAR_SEARCHES = [
  "Nissan Skyline GT-R R34",
  "Porsche 911 GT3 RS",
  "1:18 Diecast Models",
  "RC Drift Cars 4WD",
  "Formula 1 Diecast",
  "Lamborghini Aventador",
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const api = useApi();
  const ecom = useEcom();
  const bannerText = ecom?.bannerText;
  const location = useLocation();
  const navigate = useNavigate();

  // Search & Command states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Store lists
  const categoriesList = api.categories?.list || [];
  const productsList = api.products?.list || [];
  const cartItemCount = api.cart?.items?.length || 0;
  const wishlistItemCount = api.wishlist?.list?.length || 0;

  // Fetch initial cart, wishlist, categories
  useEffect(() => {
    api.cart?.fetchCart?.();
    api.wishlist?.fetchAll?.();
    api.categories?.getAll?.({ limit: 50, active: true });
  }, []);

  // Sync search input & category with URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("search");
    const cat = params.get("category");

    if (q) setSearchQuery(q);
    else if (location.pathname !== "/products") setSearchQuery("");

    if (cat) setSelectedCategory(cat);
    else setSelectedCategory("all");
  }, [location]);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setIsCommandOpen(false);
  }, [location]);

  // Click outside listener for command palette
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      ) {
        setIsCommandOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global ⌘K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setIsCommandOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Submit search (Amazon style)
  const handleSearchSubmit = (e) => {
    e?.preventDefault?.();
    setIsCommandOpen(false);
    const q = searchQuery.trim();
    const cat = selectedCategory;

    const params = new URLSearchParams();
    if (q) params.set("search", q);
    if (cat && cat !== "all") params.set("category", cat);

    const queryString = params.toString();
    navigate(`/products${queryString ? `?${queryString}` : ""}`);
  };

  const handleSelectSearch = (query) => {
    setSearchQuery(query);
    setIsCommandOpen(false);
    const params = new URLSearchParams();
    params.set("search", query);
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    navigate(`/products?${params.toString()}`);
  };

  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId);
    setIsCommandOpen(false);
    const params = new URLSearchParams();
    if (catId !== "all") params.set("category", catId);
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    navigate(`/products${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handleSelectProduct = (product) => {
    setIsCommandOpen(false);
    if (product?._id) {
      navigate(`/products/${product.slug || product._id}`);
    } else {
      handleSelectSearch(product.name);
    }
  };

  const handleNavigate = (path) => {
    setIsCommandOpen(false);
    navigate(path);
  };

  // Filter products for live suggestions
  const matchingProducts = searchQuery.trim()
    ? productsList
        .filter((p) =>
          p.name?.toLowerCase().includes(searchQuery.toLowerCase().trim())
        )
        .slice(0, 4)
    : [];

  const selectedCategoryName =
    selectedCategory === "all"
      ? "All Toyzz"
      : categoriesList.find((c) => (c._id || c.id) === selectedCategory)?.name ||
        "All Toyzz";

  // Initials for avatar
  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "TT";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/85 shadow-2xs">
      {/* Main Navbar with Amazon-Style Horizontal Command Layout */}
      <div className="container mx-auto flex h-18 items-center justify-between px-3 sm:px-6 lg:px-8 gap-2 sm:gap-4">
        {/* Left: Brand Logo & Title */}
        <Link
          to="/"
          className="flex items-center gap-2.5 sm:gap-3 group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl p-1"
        >
          <div className="relative size-10 sm:size-12 rounded-xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 p-1 border border-border/80 shadow-md ring-1 ring-white/5 group-hover:border-primary/60 group-hover:ring-primary/30 transition-all duration-300 flex items-center justify-center overflow-hidden">
            <img
              src="/logo.png"
              alt="Torque Toyzz"
              className="w-full h-full object-contain filter group-hover:scale-108 transition-transform duration-300 drop-shadow-sm"
            />
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1 font-black text-lg sm:text-2xl tracking-tighter uppercase leading-none">
              <span className="text-foreground">TORQUE</span>
              <span className="text-primary italic font-black">TOYZZ</span>
            </div>
            <span className="text-[8.5px] sm:text-[9.5px] uppercase tracking-[0.22em] font-extrabold text-muted-foreground group-hover:text-primary transition-colors duration-200 mt-1">
              Engineered for Fun
            </span>
          </div>
        </Link>

        {/* ========================================================
            AMAZON-STYLE HORIZONTAL COMMAND SEARCH BAR
            Takes the primary middle width:
            [ Category Dropdown ▼ | Command Input (⌘K) | 🔍 Search Button ]
            ======================================================== */}
        <div
          ref={searchContainerRef}
          className="relative hidden md:flex flex-1 max-w-xl lg:max-w-2xl xl:max-w-3xl mx-2 lg:mx-6"
        >
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-stretch w-full h-10.5 rounded-xl border border-border/80 bg-card/60 hover:border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25 shadow-2xs transition-all overflow-hidden"
          >
            {/* Left: Amazon Category Selector (shadcn Select) */}
            <div className="shrink-0 border-r border-border/80 bg-muted/60 hover:bg-muted/90 transition-colors flex items-center">
              <Select
                value={selectedCategory}
                onValueChange={(val) => setSelectedCategory(val)}
              >
                <SelectTrigger
                  aria-label="Select Category"
                  className="h-full border-0 rounded-none bg-transparent shadow-none px-3 py-0 text-xs font-semibold text-foreground focus-visible:ring-0 focus:outline-none max-w-[135px] gap-1 cursor-pointer data-[state=open]:bg-muted"
                >
                  <SelectValue placeholder="All Toyzz" />
                </SelectTrigger>
                <SelectContent
                  align="start"
                  className="w-52 rounded-xl border border-border shadow-xl z-50 bg-popover/95 backdrop-blur-md"
                >
                  <SelectItem value="all" className="text-xs font-medium cursor-pointer">
                    All Toyzz
                  </SelectItem>
                  {categoriesList.map((cat) => (
                    <SelectItem
                      key={cat._id || cat.id}
                      value={cat._id || cat.id}
                      className="text-xs font-medium cursor-pointer"
                    >
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Middle: Command Input */}
            <div className="relative flex-1 flex items-center min-w-0 bg-background/80">
              <Search className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsCommandOpen(true);
                }}
                onFocus={() => setIsCommandOpen(true)}
                placeholder={
                  selectedCategoryName === "All Toyzz"
                    ? "Search diecast models, RC cars, brands, scales..."
                    : `Search in ${selectedCategoryName}...`
                }
                className="w-full h-full pl-9 pr-14 text-xs sm:text-sm bg-transparent text-foreground placeholder:text-muted-foreground/70 outline-none"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    inputRef.current?.focus();
                  }}
                  className="absolute right-3 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              ) : (
                <kbd className="hidden lg:inline-flex absolute right-3 pointer-events-none items-center gap-0.5 rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground shadow-2xs">
                  ⌘K
                </kbd>
              )}
            </div>

            {/* Right: Signature Brand Red Search Button */}
            <button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 sm:px-5 flex items-center justify-center shrink-0 transition-colors cursor-pointer group"
              aria-label="Search"
            >
              <Search className="size-4.5 stroke-[2.5] group-hover:scale-110 transition-transform" />
            </button>
          </form>

          {/* Connected Command Autocomplete Dropdown */}
          {isCommandOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl border border-border/80 bg-popover/95 backdrop-blur-xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-98 duration-150">
              <Command className="bg-transparent">
                <CommandList className="max-h-[380px] p-2">
                  {/* 1. Matching Products if query is typed */}
                  {matchingProducts.length > 0 && (
                    <CommandGroup heading="Matching Products">
                      {matchingProducts.map((item) => (
                        <CommandItem
                          key={item._id}
                          onSelect={() => handleSelectProduct(item)}
                          className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                        >
                          <img
                            src={
                              item.images?.[0] ||
                              item.image ||
                              "/logo.png"
                            }
                            alt={item.name}
                            className="size-9 rounded-md object-cover bg-muted border border-border shrink-0"
                          />
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-xs font-semibold text-foreground truncate">
                              {item.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {item.scale || item.brand || "Torque Collectible"}
                            </p>
                          </div>
                          <span className="text-xs font-bold text-primary shrink-0">
                            ₹{Number(item.price || 0).toLocaleString()}
                          </span>
                        </CommandItem>
                      ))}
                      <CommandSeparator className="my-1.5" />
                    </CommandGroup>
                  )}

                  {/* 2. Trending Searches */}
                  <CommandGroup heading="Trending Searches">
                    {POPULAR_SEARCHES.map((query) => (
                      <CommandItem
                        key={query}
                        onSelect={() => handleSelectSearch(query)}
                        className="flex items-center justify-between text-xs py-2 px-2.5 rounded-lg cursor-pointer hover:bg-muted/80"
                      >
                        <div className="flex items-center gap-2 text-foreground">
                          <Flame className="size-3.5 text-primary" />
                          <span>{query}</span>
                        </div>
                        <ArrowUpRight className="size-3 text-muted-foreground" />
                      </CommandItem>
                    ))}
                  </CommandGroup>

                  <CommandSeparator className="my-1.5" />

                  {/* 3. Browse Categories */}
                  <CommandGroup heading="Explore Categories">
                    {categoriesList.slice(0, 5).map((cat) => (
                      <CommandItem
                        key={cat._id || cat.id}
                        onSelect={() => handleSelectCategory(cat._id || cat.id)}
                        className="flex items-center justify-between text-xs py-2 px-2.5 rounded-lg cursor-pointer hover:bg-muted/80"
                      >
                        <div className="flex items-center gap-2 text-foreground">
                          <Car className="size-3.5 text-muted-foreground" />
                          <span>{cat.name}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          Category
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>

                  <CommandSeparator className="my-1.5" />

                  {/* 4. Quick Navigation */}
                  <CommandGroup heading="Quick Navigation">
                    <CommandItem
                      onSelect={() => handleNavigate("/products")}
                      className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg cursor-pointer hover:bg-muted/80"
                    >
                      <div className="flex items-center gap-2">
                        <Compass className="size-3.5 text-muted-foreground" />
                        <span>All Products Catalog</span>
                      </div>
                      <CommandShortcut>Catalog</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                      onSelect={() => handleNavigate("/cart")}
                      className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg cursor-pointer hover:bg-muted/80"
                    >
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="size-3.5 text-muted-foreground" />
                        <span>Shopping Cart ({cartItemCount})</span>
                      </div>
                      <CommandShortcut>Cart</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                      onSelect={() => handleNavigate("/wishlist")}
                      className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg cursor-pointer hover:bg-muted/80"
                    >
                      <div className="flex items-center gap-2">
                        <Heart className="size-3.5 text-muted-foreground" />
                        <span>My Wishlist ({wishlistItemCount})</span>
                      </div>
                      <CommandShortcut>Wishlist</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                      onSelect={() => handleNavigate("/orders")}
                      className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg cursor-pointer hover:bg-muted/80"
                    >
                      <div className="flex items-center gap-2">
                        <Package className="size-3.5 text-muted-foreground" />
                        <span>Track Orders</span>
                      </div>
                      <CommandShortcut>Orders</CommandShortcut>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          )}
        </div>

        {/* Right Section: Amazon-Style Returns & Orders, Account, Wishlist, Cart */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          {/* Returns & Orders (Amazon Style) */}
          <Link
            to="/orders"
            className="hidden xl:flex flex-col text-left px-2.5 py-1 rounded-lg hover:bg-muted/70 transition-colors"
          >
            <span className="text-[10px] text-muted-foreground leading-tight">
              Returns &amp;
            </span>
            <span className="text-xs font-bold text-foreground leading-tight">
              Orders
            </span>
          </Link>

          {/* User Account / Sign In (Amazon Style) */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  <Avatar className="size-8 bg-primary/10 text-primary border border-primary/20">
                    <AvatarFallback className="font-bold text-xs bg-primary/10 text-primary">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:flex flex-col">
                    <span className="text-[10px] text-muted-foreground leading-tight">
                      Hello, {user.name?.split(" ")[0] || "Collector"}
                    </span>
                    <span className="text-xs font-bold text-foreground leading-tight flex items-center gap-0.5">
                      Account &amp; Lists
                      <ChevronDown className="size-3 text-muted-foreground" />
                    </span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 p-2 rounded-xl shadow-xl border border-border"
              >
                <DropdownMenuLabel className="font-normal px-2 py-1.5">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none text-foreground">
                      {user.name || "Collector"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem asChild>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 cursor-pointer rounded-lg text-xs font-medium py-2"
                  >
                    <User className="size-4 text-muted-foreground" />
                    <span>Your Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/orders"
                    className="flex items-center gap-2 cursor-pointer rounded-lg text-xs font-medium py-2"
                  >
                    <Package className="size-4 text-muted-foreground" />
                    <span>Your Orders</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/wishlist"
                    className="flex items-center gap-2 cursor-pointer rounded-lg text-xs font-medium py-2"
                  >
                    <Heart className="size-4 text-muted-foreground" />
                    <span>Your Wishlist</span>
                    {wishlistItemCount > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-auto text-[10px] px-1.5 py-0 bg-primary/10 text-primary font-bold"
                      >
                        {wishlistItemCount}
                      </Badge>
                    )}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 cursor-pointer rounded-lg text-xs font-medium py-2"
                  >
                    <Settings className="size-4 text-muted-foreground" />
                    <span>Account Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  onClick={logout}
                  className="flex items-center gap-2 cursor-pointer rounded-lg text-xs font-medium py-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <LogOut className="size-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/login"
              className="flex flex-col text-left px-2 sm:px-2.5 py-1 rounded-lg hover:bg-muted/70 transition-colors"
            >
              <span className="text-[10px] text-muted-foreground leading-tight">
                Hello, sign in
              </span>
              <span className="text-xs font-bold text-foreground leading-tight flex items-center gap-0.5">
                Account &amp; Lists
                <ChevronDown className="size-3 text-muted-foreground hidden sm:inline" />
              </span>
            </Link>
          )}

          {/* Wishlist Button with Badge */}
          <Link to="/wishlist">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-full size-9 sm:size-10 relative text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors",
                location.pathname === "/wishlist" && "text-primary bg-primary/10"
              )}
              aria-label="Wishlist"
            >
              <Heart className="size-5" />
              {wishlistItemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-xs animate-in zoom-in-50">
                  {wishlistItemCount > 99 ? "99+" : wishlistItemCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Amazon-Style Cart Button with Prominent Count */}
          <Link
            to="/cart"
            className={cn(
              "flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl hover:bg-muted/70 transition-colors relative group",
              location.pathname === "/cart" && "bg-primary/10"
            )}
            aria-label="Cart"
          >
            <div className="relative">
              <ShoppingCart className="size-6 text-foreground group-hover:text-primary transition-colors" />
              <span className="absolute -top-1.5 -right-2 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground shadow-xs animate-in zoom-in-50">
                {cartItemCount > 99 ? "99+" : cartItemCount}
              </span>
            </div>
            <span className="text-xs font-extrabold text-foreground hidden md:inline-block">
              Cart
            </span>
          </Link>

          {/* Mobile Menu Hamburger Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full size-9 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>



      {/* 4. Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/98 backdrop-blur-xl px-4 py-4 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
          {/* Mobile Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search diecast, RC cars..."
              className="h-10 w-full rounded-xl border border-border bg-muted/50 pl-10 pr-4 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </form>

          {/* Quick Categories Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
            <button
              onClick={() => handleSelectCategory("all")}
              className={cn(
                "px-3 py-1.5 rounded-lg shrink-0 font-medium",
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground font-bold"
                  : "bg-muted text-muted-foreground"
              )}
            >
              All Toyzz
            </button>
            {categoriesList.map((cat) => (
              <button
                key={cat._id || cat.id}
                onClick={() => handleSelectCategory(cat._id || cat.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg shrink-0 font-medium",
                  selectedCategory === (cat._id || cat.id)
                    ? "bg-primary text-primary-foreground font-bold"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Mobile Navigation Links */}
          <div className="space-y-1 pt-1">
            <Link
              to="/products"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="size-4.5" />
                <span>All Products</span>
              </div>
              <ChevronRight className="size-4 opacity-50" />
            </Link>

            <Link
              to="/wishlist"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <div className="flex items-center gap-3">
                <Heart className="size-4.5" />
                <span>Wishlist ({wishlistItemCount})</span>
              </div>
              <ChevronRight className="size-4 opacity-50" />
            </Link>

            <Link
              to="/orders"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <div className="flex items-center gap-3">
                <Package className="size-4.5" />
                <span>Orders</span>
              </div>
              <ChevronRight className="size-4 opacity-50" />
            </Link>

            {user && (
              <Link
                to="/profile"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <div className="flex items-center gap-3">
                  <User className="size-4.5" />
                  <span>Profile</span>
                </div>
                <ChevronRight className="size-4 opacity-50" />
              </Link>
            )}
          </div>

          {/* Mobile User Profile Footer */}
          <div className="pt-2 border-t border-border flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5">
                  <Avatar className="size-8 bg-primary/10 text-primary">
                    <AvatarFallback className="font-bold text-xs bg-primary/10 text-primary">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-xs font-semibold leading-tight text-foreground">
                      {user.name || "Collector"}
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-tight">
                      {user.email}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive h-8"
                >
                  <LogOut className="size-3.5 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/login" className="w-full">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl h-10">
                  <User className="size-4 mr-2" />
                  Sign In to Account
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
