import { useEffect, useState, useRef, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Home,
  ShoppingCart,
  Menu,
  Search,
  User,
  Heart,
  X,
  Package,
  Settings,
  ShoppingBag,
  LogOut,
  ChevronDown,
  ChevronRight,
  Flame,
  ArrowUpRight,
  Sparkles,
  Car,
  Compass,
  Zap,
  ShieldCheck,
  Layers,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/core/contexts/auth.context";
import { useApi } from "@/core/contexts/api.context";
import { useEcom } from "@/core/contexts/ecom.context";
import { cn } from "@/lib/utils";
import { ThemeToggle, ThemeSegmented } from "@/components/global/theme-toggle";

// Curated trending queries for command autocomplete
const POPULAR_SEARCHES = [
  "Nissan Skyline GT-R R34",
  "Porsche 911 GT3 RS",
  "1:18 Diecast Models",
  "RC Drift Cars 4WD",
  "Formula 1 Diecast",
  "Lamborghini Aventador SVJ",
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const api = useApi();
  const ecom = useEcom();
  const location = useLocation();
  const navigate = useNavigate();

  // Search & Command states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isMobileCommandOpen, setIsMobileCommandOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    try {
      const dismissedUntil = localStorage.getItem("torque_announcement_dismissed_until");
      if (dismissedUntil) {
        const expiry = Number(dismissedUntil);
        if (!Number.isNaN(expiry) && Date.now() < expiry) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  });

  const searchContainerRef = useRef(null);
  const inputRef = useRef(null);
  const mobileSearchContainerRef = useRef(null);
  const mobileInputRef = useRef(null);
  const navbarRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  // Store lists accessed strictly via useApi()
  const categoriesList = api.categories?.list?.length
    ? api.categories.list
    : api.home?.data?.categories || [];
  const productsList = api.products?.list?.length
    ? api.products.list
    : api.home?.data?.products || [];
  const cartItemCount = user ? (api.cart?.items?.length || 0) : 0;
  const wishlistItemCount = user ? (api.wishlist?.list?.length || 0) : 0;
  const announcementBanner = api.home?.data?.announcementBanner;

  // Dynamically compute exact pixel height of fixed navbar (excluding open drawer)
  useEffect(() => {
    const updateHeight = () => {
      if (navbarRef.current) {
        const headerEl = navbarRef.current;
        const bannerH = headerEl.querySelector(".navbar-banner")?.offsetHeight || 0;
        const mainH = headerEl.querySelector(".navbar-main")?.offsetHeight || 0;
        const mobileSearchH = headerEl.querySelector(".navbar-mobile-search")?.offsetHeight || 0;
        const total = bannerH + mainH + mobileSearchH;
        if (total > 0) setHeaderHeight(total);
      }
    };

    updateHeight();
    const ro = new ResizeObserver(updateHeight);
    if (navbarRef.current) ro.observe(navbarRef.current);
    window.addEventListener("resize", updateHeight);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [announcementBanner, bannerDismissed]);

  // Synchronize banner dismissal state with 1-day localStorage expiration
  useEffect(() => {
    try {
      const dismissedUntil = localStorage.getItem("torque_announcement_dismissed_until");
      const dismissedText = localStorage.getItem("torque_announcement_dismissed_text");
      if (dismissedUntil) {
        const expiry = Number(dismissedUntil);
        if (!Number.isNaN(expiry) && Date.now() < expiry) {
          if (!dismissedText || dismissedText === announcementBanner) {
            setBannerDismissed(true);
            return;
          }
        }
      }
      setBannerDismissed(false);
    } catch {
      setBannerDismissed(false);
    }
  }, [announcementBanner]);

  const handleDismissBanner = () => {
    try {
      const ONE_DAY_MS = 24 * 60 * 60 * 1000;
      const expiry = Date.now() + ONE_DAY_MS;
      localStorage.setItem("torque_announcement_dismissed_until", String(expiry));
      if (announcementBanner) {
        localStorage.setItem("torque_announcement_dismissed_text", announcementBanner);
      }
    } catch {
      // ignore
    }
    setBannerDismissed(true);
  };

  // Initial fetch for store data strictly through unified home API
  useEffect(() => {
    if (location.pathname !== "/" && !api.home?.data?.categories?.length) {
      api.home?.fetchHomeData?.();
    }
    if (user?._id) {
      api.cart?.fetchCart?.();
      api.wishlist?.fetchAll?.();
    }
  }, [user?._id, location.pathname]);

  // Track scroll for subtle dynamic elevation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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
  }, [location.search, location.pathname]);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setIsCommandOpen(false);
    setIsMobileCommandOpen(false);
  }, [location.pathname, location.search]);

  // Auto-close dropdowns & mobile menu on touch/click anywhere outside or on scroll
  useEffect(() => {
    const handleOutsideInteraction = (e) => {
      // If touch/click is outside the entire navbar
      if (navbarRef.current && !navbarRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
        setIsCommandOpen(false);
        setIsMobileCommandOpen(false);
      } else {
        // If inside navbar, still close command palettes when clicking outside their containers
        if (
          searchContainerRef.current &&
          !searchContainerRef.current.contains(e.target)
        ) {
          setIsCommandOpen(false);
        }
        if (
          mobileSearchContainerRef.current &&
          !mobileSearchContainerRef.current.contains(e.target)
        ) {
          setIsMobileCommandOpen(false);
        }
      }
    };

    const handleScrollClose = () => {
      if (mobileMenuOpen || isCommandOpen || isMobileCommandOpen) {
        setMobileMenuOpen(false);
        setIsCommandOpen(false);
        setIsMobileCommandOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsideInteraction);
    document.addEventListener("touchstart", handleOutsideInteraction, { passive: true });
    document.addEventListener("mousedown", handleOutsideInteraction);
    window.addEventListener("scroll", handleScrollClose, { passive: true });

    return () => {
      document.removeEventListener("pointerdown", handleOutsideInteraction);
      document.removeEventListener("touchstart", handleOutsideInteraction);
      document.removeEventListener("mousedown", handleOutsideInteraction);
      window.removeEventListener("scroll", handleScrollClose);
    };
  }, [mobileMenuOpen, isCommandOpen, isMobileCommandOpen]);

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
        setIsMobileCommandOpen(false);
        inputRef.current?.blur();
        mobileInputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Submit search (Amazon style)
  const handleSearchSubmit = (e) => {
    e?.preventDefault?.();
    setIsCommandOpen(false);
    setIsMobileCommandOpen(false);
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
    setIsMobileCommandOpen(false);
    const params = new URLSearchParams();
    params.set("search", query);
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    navigate(`/products?${params.toString()}`);
  };

  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId);
    setIsCommandOpen(false);
    setIsMobileCommandOpen(false);
    const params = new URLSearchParams();
    if (catId !== "all") params.set("category", catId);
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    navigate(`/products${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handleSelectProduct = (product) => {
    setIsCommandOpen(false);
    setIsMobileCommandOpen(false);
    if (product?.slug) {
      navigate(`/products/${product.slug}`);
    } else if (product?._id) {
      navigate(`/products/${product._id}`);
    } else {
      handleSelectSearch(product.name);
    }
  };

  const handleNavigate = (path) => {
    setIsCommandOpen(false);
    setIsMobileCommandOpen(false);
    navigate(path);
  };

  // Filter products for live suggestions
  const matchingProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return productsList
      .filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.scale?.toLowerCase().includes(q)
      )
      .slice(0, 4);
  }, [productsList, searchQuery]);

  const selectedCategoryName =
    selectedCategory === "all"
      ? "All"
      : categoriesList.find((c) => (c._id || c.id) === selectedCategory)?.name ||
        "All";

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
    <>
      <header
        ref={navbarRef}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-200 border-b",
        isScrolled
          ? "bg-background/95 backdrop-blur-xl border-border/80 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)]"
          : "bg-background/90 backdrop-blur-md border-border/60 shadow-xs"
      )}
    >
      {/* ─── TOP ANNOUNCEMENT TICKER BANNER ─── */}
      {announcementBanner && !bannerDismissed && (
        <div className="navbar-banner bg-primary text-primary-foreground text-xs py-2 px-4 font-semibold tracking-wide text-center flex items-center justify-center gap-2 border-b border-primary-foreground/15 shadow-2xs select-none relative">
          <span className="truncate max-w-[90vw]">{announcementBanner}</span>
          <button
            type="button"
            onClick={handleDismissBanner}
            aria-label="Dismiss banner"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-primary-foreground/80 hover:text-primary-foreground cursor-pointer rounded transition-colors"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* ─── MAIN NAVBAR: HORIZONTAL LAYOUT ─── */}
      <div className="navbar-main container mx-auto flex h-16 sm:h-17 items-center justify-between px-3 sm:px-6 lg:px-8 gap-2 sm:gap-4 lg:gap-6">
        {/* Left: Brand Logo & Title */}
        <Link
          to="/"
          className="flex items-center gap-2 sm:gap-2.5 group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl py-1"
          aria-label="Torque Toyzz Home"
        >
          <img
            src="/logo.png"
            alt="Torque Toyzz"
            className="h-9 sm:h-11 w-auto object-contain group-hover:scale-105 transition-transform duration-200 shrink-0"
          />
          <div className="flex flex-col text-left">
            <span className="font-heading font-extrabold text-base sm:text-lg lg:text-xl tracking-tight text-foreground select-none leading-none">
              Torque <span className="text-primary">Toyzz</span>
            </span>
            <span className="text-[8.5px] sm:text-[10px] tracking-wider uppercase font-semibold text-muted-foreground group-hover:text-primary transition-colors duration-200 mt-0.5 sm:mt-1 select-none leading-none">
              Engineered for Fun
            </span>
          </div>
        </Link>

        {/* ─── CENTER: INTEGRATED COMMAND SEARCH BAR ─── */}
        <div
          ref={searchContainerRef}
          className="relative hidden md:flex flex-1 max-w-xl lg:max-w-2xl xl:max-w-3xl mx-2 lg:mx-4"
        >
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-stretch w-full h-10.5 rounded-xl border border-border/80 bg-card/60 hover:border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25 shadow-xs transition-all overflow-hidden"
          >
            {/* Left: Category Selector */}
            <div className="shrink-0 border-r border-border/80 bg-muted/40 hover:bg-muted/70 transition-colors flex items-center">
              <Select
                value={selectedCategory}
                onValueChange={(val) => setSelectedCategory(val)}
              >
                <SelectTrigger
                  aria-label="Select Category"
                  className="h-full border-0 rounded-none bg-transparent shadow-none px-3 py-0 text-xs font-medium text-foreground/85 focus-visible:ring-0 focus:outline-none max-w-[120px] gap-1 cursor-pointer data-[state=open]:bg-muted"
                >
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent
                  align="start"
                  className="w-56 rounded-xl border border-border shadow-2xl z-50 bg-popover/95 backdrop-blur-xl p-1"
                >
                  <SelectItem value="all" className="text-xs font-medium cursor-pointer">
                    All
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

            {/* Middle: Command Search Input */}
            <div className="relative flex-1 flex items-center min-w-0 bg-background/90">
              <Search className="absolute left-3.5 size-4 text-muted-foreground pointer-events-none" />
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
                  selectedCategoryName === "All"
                    ? "Search diecast supercars, RC drift, 1:18, brands..."
                    : `Search in ${selectedCategoryName}...`
                }
                className="w-full h-full pl-10 pr-14 text-xs sm:text-sm bg-transparent text-foreground placeholder:text-muted-foreground/60 outline-none font-normal"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    inputRef.current?.focus();
                  }}
                  className="absolute right-3.5 text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded transition-colors"
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              ) : (
                <kbd className="hidden lg:inline-flex absolute right-3 pointer-events-none items-center gap-0.5 rounded-md border border-border bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground shadow-2xs">
                  ⌘K
                </kbd>
              )}
            </div>

            {/* Right: Modern Search Action Button */}
            <button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 sm:px-5 flex items-center justify-center gap-1.5 shrink-0 transition-all cursor-pointer font-heading font-semibold text-xs tracking-wide active:scale-98 shadow-sm group"
              aria-label="Search"
            >
              <Search className="size-3.5 stroke-[2.4] group-hover:scale-110 transition-transform" />
              <span className="hidden xl:inline text-xs font-semibold">
                Search
              </span>
            </button>
          </form>

          {/* Connected Command Autocomplete Dropdown */}
          {isCommandOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl border border-border/80 bg-popover/98 backdrop-blur-2xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-98 duration-150">
              <Command className="bg-transparent">
                <CommandList className="max-h-[390px] p-2 text-foreground">
                  {/* 1. Live Matching Products */}
                  {matchingProducts.length > 0 && (
                    <CommandGroup heading="Matching Scale Models" className="text-muted-foreground font-semibold">
                      {matchingProducts.map((item) => (
                        <CommandItem
                          key={item._id}
                          onSelect={() => handleSelectProduct(item)}
                          className="flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-muted/80 transition-colors"
                        >
                          <img
                            src={
                              item.images?.[0] ||
                              item.image ||
                              "/cars/gt3_rs.jpg"
                            }
                            alt={item.name}
                            className="size-10 rounded-lg object-cover bg-muted border border-border/70 shrink-0"
                          />
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-xs font-bold text-foreground truncate">
                              {item.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {item.scale || item.brand || "Scale Model"} • {item.category?.name || "General"}
                            </p>
                          </div>
                          <span className="text-xs font-mono font-black text-primary shrink-0 pl-2">
                            ₹{Number(item.price || 0).toLocaleString()}
                          </span>
                        </CommandItem>
                      ))}
                      <CommandSeparator className="my-1.5" />
                    </CommandGroup>
                  )}

                  {/* 2. Trending Searches */}
                  <CommandGroup heading="Trending Searches" className="text-muted-foreground font-semibold">
                    {POPULAR_SEARCHES.map((query) => (
                      <CommandItem
                        key={query}
                        onSelect={() => handleSelectSearch(query)}
                        className="flex items-center justify-between text-xs py-2 px-2.5 rounded-xl cursor-pointer hover:bg-muted/80"
                      >
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          <Flame className="size-3.5 text-primary" />
                          <span>{query}</span>
                        </div>
                        <ArrowUpRight className="size-3 text-muted-foreground" />
                      </CommandItem>
                    ))}
                  </CommandGroup>

                  <CommandSeparator className="my-1.5" />

                  {/* 3. Browse Categories */}
                  <CommandGroup heading="Explore Categories" className="text-muted-foreground font-semibold">
                    {categoriesList.slice(0, 5).map((cat) => (
                      <CommandItem
                        key={cat._id || cat.id}
                        onSelect={() => handleSelectCategory(cat._id || cat.id)}
                        className="flex items-center justify-between text-xs py-2 px-2.5 rounded-xl cursor-pointer hover:bg-muted/80"
                      >
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          <Car className="size-3.5 text-muted-foreground" />
                          <span>{cat.name}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          Category
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>

                  <CommandSeparator className="my-1.5" />

                  {/* 4. Quick Navigation */}
                  <CommandGroup heading="Quick Navigation" className="text-muted-foreground font-semibold">
                    <CommandItem
                      onSelect={() => handleNavigate("/")}
                      className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl cursor-pointer hover:bg-muted/80"
                    >
                      <div className="flex items-center gap-2 text-foreground">
                        <Home className="size-3.5 text-muted-foreground" />
                        <span>Home</span>
                      </div>
                      <CommandShortcut>Home</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                      onSelect={() => handleNavigate("/products")}
                      className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl cursor-pointer hover:bg-muted/80"
                    >
                      <div className="flex items-center gap-2 text-foreground">
                        <Compass className="size-3.5 text-muted-foreground" />
                        <span>All Products Catalog</span>
                      </div>
                      <CommandShortcut>Catalog</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                      onSelect={() => handleNavigate("/cart")}
                      className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl cursor-pointer hover:bg-muted/80"
                    >
                      <div className="flex items-center gap-2 text-foreground">
                        <ShoppingCart className="size-3.5 text-muted-foreground" />
                        <span>Shopping Cart ({cartItemCount})</span>
                      </div>
                      <CommandShortcut>Cart</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                      onSelect={() => handleNavigate("/wishlist")}
                      className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl cursor-pointer hover:bg-muted/80"
                    >
                      <div className="flex items-center gap-2 text-foreground">
                        <Heart className="size-3.5 text-muted-foreground" />
                        <span>Wishlist ({wishlistItemCount})</span>
                      </div>
                      <CommandShortcut>Wishlist</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                      onSelect={() => handleNavigate("/orders")}
                      className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl cursor-pointer hover:bg-muted/80"
                    >
                      <div className="flex items-center gap-2 text-foreground">
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

        {/* ─── RIGHT SECTION: MODERN MODULAR ACTIONS ─── */}
        <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 shrink-0">
          {/* Home Link */}
          <Link
            to="/"
            className={cn(
              "hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors group",
              location.pathname === "/"
                ? "text-primary bg-primary/10 font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            )}
          >
            <Home className="size-4 group-hover:text-primary transition-colors" />
            <span>Home</span>
          </Link>

          {/* Orders */}
          <Link
            to="/orders"
            className={cn(
              "hidden xl:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors group",
              location.pathname.startsWith("/orders") && "text-foreground bg-muted/60"
            )}
          >
            <Package className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <span>Orders</span>
          </Link>

          {/* User Account / Sign In */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hidden sm:flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-muted/60 transition-colors cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary group">
                  <Avatar className="size-8 sm:size-8.5 bg-primary/10 text-primary border border-primary/20 shadow-xs">
                    {user.profile?.url && <AvatarImage src={user.profile.url} alt={user.name} className="object-cover" />}
                    <AvatarFallback className="font-semibold text-xs bg-primary/10 text-primary">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-semibold text-foreground leading-tight truncate max-w-[105px]">
                      {user.name?.split(" ")[0] || "Account"}
                    </span>
                    <span className="text-[10px] text-muted-foreground leading-none flex items-center gap-0.5 group-hover:text-primary transition-colors mt-0.5">
                      My Account
                      <ChevronDown className="size-3 text-muted-foreground/70 group-hover:text-primary transition-colors" />
                    </span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 p-2 rounded-2xl shadow-2xl border border-border bg-popover/98 backdrop-blur-xl text-foreground"
              >
                <DropdownMenuLabel className="font-normal px-2 py-1.5">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none text-foreground font-heading">
                      {user.name || "Customer"}
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
                    className="flex items-center gap-2 cursor-pointer rounded-xl text-xs font-medium py-2 hover:bg-muted hover:text-foreground"
                  >
                    <User className="size-4 text-muted-foreground" />
                    <span>My Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/orders"
                    className="flex items-center gap-2 cursor-pointer rounded-xl text-xs font-medium py-2 hover:bg-muted hover:text-foreground"
                  >
                    <Package className="size-4 text-muted-foreground" />
                    <span>Your Orders</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/wishlist"
                    className="flex items-center gap-2 cursor-pointer rounded-xl text-xs font-medium py-2 hover:bg-muted hover:text-foreground"
                  >
                    <Heart className="size-4 text-muted-foreground" />
                    <span>Wishlist</span>
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
                    className="flex items-center gap-2 cursor-pointer rounded-xl text-xs font-medium py-2 hover:bg-muted hover:text-foreground"
                  >
                    <Settings className="size-4 text-muted-foreground" />
                    <span>Account Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  onClick={logout}
                  className="flex items-center gap-2 cursor-pointer rounded-xl text-xs font-medium py-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <LogOut className="size-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/login"
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-foreground/90 hover:text-foreground hover:bg-muted/60 transition-colors group"
            >
              <User className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-[10px] text-muted-foreground leading-tight">
                  Welcome
                </span>
                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors leading-none">
                  Sign In
                </span>
              </div>
              <span className="lg:hidden text-xs font-semibold">Sign In</span>
            </Link>
          )}

          {/* Wishlist Button with Badge (Desktop & Tablet) */}
          <Link to="/wishlist" aria-label="Wishlist" className="hidden sm:inline-flex">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-xl size-9 sm:size-10 relative text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all group cursor-pointer",
                location.pathname === "/wishlist" && "text-primary bg-primary/10"
              )}
            >
              <Heart className="size-4.5 transition-transform group-hover:scale-110 group-hover:text-primary" />
              {wishlistItemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-xs animate-in zoom-in-50">
                  {wishlistItemCount > 99 ? "99+" : wishlistItemCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Dark / Light Mode Toggle */}
          <ThemeToggle className="hidden sm:inline-flex" />

          {/* Cart Button */}
          <Link
            to="/cart"
            className={cn(
              "flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition-all relative group cursor-pointer active:scale-95 border",
              location.pathname === "/cart"
                ? "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                : "bg-muted/40 hover:bg-muted/80 text-foreground border-border/70 hover:border-border"
            )}
            aria-label="Cart"
          >
            <div className="relative flex items-center justify-center">
              <ShoppingCart
                className={cn(
                  "size-4.5 transition-transform group-hover:scale-105",
                  location.pathname === "/cart"
                    ? "text-primary-foreground"
                    : "text-foreground group-hover:text-primary"
                )}
              />
              {cartItemCount > 0 && (
                <span
                  className={cn(
                    "absolute -top-2 -right-2.5 flex min-w-4.5 h-4.5 px-1 items-center justify-center rounded-full text-[9px] font-mono font-bold shadow-xs",
                    location.pathname === "/cart"
                      ? "bg-neutral-950 text-white ring-1 ring-white/30"
                      : "bg-primary text-primary-foreground shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                  )}
                >
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline text-xs font-semibold font-heading tracking-tight">
              Cart
            </span>
          </Link>

          {/* Mobile Menu Hamburger Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-xl size-9 text-muted-foreground hover:text-foreground hover:bg-muted/70"
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              setIsMobileCommandOpen(false);
            }}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* ─── MOBILE SEARCH BAR: ALWAYS VISIBLE OUTSIDE HAMBURGER ─── */}
      <div className="navbar-mobile-search md:hidden w-full border-t border-border/40 bg-background/95 backdrop-blur-md px-3 sm:px-6 py-2">
        <div ref={mobileSearchContainerRef} className="relative w-full">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-stretch w-full h-10 rounded-xl border border-border/80 bg-card/60 hover:border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25 shadow-xs transition-all overflow-hidden"
          >
            {/* Left: Category Selector */}
            <div className="shrink-0 border-r border-border/80 bg-muted/40 hover:bg-muted/70 transition-colors flex items-center">
              <Select
                value={selectedCategory}
                onValueChange={(val) => setSelectedCategory(val)}
              >
                <SelectTrigger
                  aria-label="Select Category"
                  className="h-full border-0 rounded-none bg-transparent shadow-none px-2.5 py-0 text-xs font-medium text-foreground/85 focus-visible:ring-0 focus:outline-none max-w-[85px] sm:max-w-[110px] gap-1 cursor-pointer data-[state=open]:bg-muted"
                >
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent
                  align="start"
                  className="w-56 rounded-xl border border-border shadow-2xl z-50 bg-popover/95 backdrop-blur-xl p-1"
                >
                  <SelectItem value="all" className="text-xs font-medium cursor-pointer">
                    All
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

            {/* Middle: Command Search Input */}
            <div className="relative flex-1 flex items-center min-w-0 bg-background/90">
              <Search className="absolute left-3 size-3.5 text-muted-foreground pointer-events-none" />
              <input
                ref={mobileInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsMobileCommandOpen(true);
                }}
                onFocus={() => {
                  setIsMobileCommandOpen(true);
                  setMobileMenuOpen(false);
                }}
                placeholder={
                  selectedCategoryName === "All"
                    ? "Search diecast, RC cars..."
                    : `Search in ${selectedCategoryName}...`
                }
                className="w-full h-full pl-8.5 pr-8 text-xs bg-transparent text-foreground placeholder:text-muted-foreground/60 outline-none font-normal"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    mobileInputRef.current?.focus();
                  }}
                  className="absolute right-2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded transition-colors"
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Right: Search Action Button */}
            <button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-3.5 flex items-center justify-center shrink-0 transition-all cursor-pointer font-heading font-semibold text-xs active:scale-95 shadow-sm"
              aria-label="Search"
            >
              <Search className="size-3.5 stroke-[2.4]" />
            </button>
          </form>

          {/* Connected Command Autocomplete Dropdown */}
          {isMobileCommandOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl border border-border/80 bg-popover/98 backdrop-blur-2xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-98 duration-150">
              <Command className="bg-transparent">
                <CommandList className="max-h-[300px] p-2 text-foreground overflow-y-auto">
                  {/* Matching Products */}
                  {matchingProducts.length > 0 && (
                    <CommandGroup heading="Matching Scale Models" className="text-muted-foreground font-semibold">
                      {matchingProducts.map((item) => (
                        <CommandItem
                          key={item._id}
                          onSelect={() => handleSelectProduct(item)}
                          className="flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-muted/80 transition-colors"
                        >
                          <img
                            src={
                              item.images?.[0] ||
                              item.image ||
                              "/cars/gt3_rs.jpg"
                            }
                            alt={item.name}
                            className="size-10 rounded-lg object-cover bg-muted border border-border/70 shrink-0"
                          />
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-xs font-bold text-foreground truncate">
                              {item.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {item.scale || item.brand || "Scale Model"} • {item.category?.name || "General"}
                            </p>
                          </div>
                          <span className="text-xs font-mono font-black text-primary shrink-0 pl-2">
                            ₹{Number(item.price || 0).toLocaleString()}
                          </span>
                        </CommandItem>
                      ))}
                      <CommandSeparator className="my-1.5" />
                    </CommandGroup>
                  )}

                  {/* Trending Searches */}
                  <CommandGroup heading="Trending Searches" className="text-muted-foreground font-semibold">
                    {POPULAR_SEARCHES.map((query) => (
                      <CommandItem
                        key={query}
                        onSelect={() => handleSelectSearch(query)}
                        className="flex items-center justify-between text-xs py-2 px-2.5 rounded-xl cursor-pointer hover:bg-muted/80"
                      >
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          <Flame className="size-3.5 text-primary" />
                          <span>{query}</span>
                        </div>
                        <ArrowUpRight className="size-3 text-muted-foreground" />
                      </CommandItem>
                    ))}
                  </CommandGroup>

                  <CommandSeparator className="my-1.5" />

                  {/* Browse Categories */}
                  <CommandGroup heading="Explore Categories" className="text-muted-foreground font-semibold">
                    {categoriesList.slice(0, 5).map((cat) => (
                      <CommandItem
                        key={cat._id || cat.id}
                        onSelect={() => handleSelectCategory(cat._id || cat.id)}
                        className="flex items-center justify-between text-xs py-2 px-2.5 rounded-xl cursor-pointer hover:bg-muted/80"
                      >
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          <Car className="size-3.5 text-muted-foreground" />
                          <span>{cat.name}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          Category
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          )}
        </div>
      </div>

      {/* ─── MOBILE BACKDROP OVERLAY (TOUCH OUTSIDE TO CLOSE) ─── */}
      {mobileMenuOpen && (
        <div
          style={{ top: `${headerHeight}px` }}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in-0 duration-150"
          onClick={() => setMobileMenuOpen(false)}
          onTouchStart={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ─── MOBILE DRAWER MENU ─── */}
      {mobileMenuOpen && (
        <div
          style={{
            top: `${headerHeight}px`,
            maxHeight: `calc(100vh - ${headerHeight}px)`
          }}
          className="fixed left-0 right-0 z-50 md:hidden border-t border-border bg-background/98 backdrop-blur-2xl px-4 py-4 space-y-4 shadow-2xl animate-in slide-in-from-top-2 duration-200 overflow-y-auto"
        >

          {/* Quick Categories Scroll */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
              Categories
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
              <button
                onClick={() => handleSelectCategory("all")}
                className={cn(
                  "px-3 py-1.5 rounded-lg shrink-0 font-bold uppercase text-[11px]",
                  selectedCategory === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                All Categories
              </button>
              {categoriesList.map((cat) => (
                <button
                  key={cat._id || cat.id}
                  onClick={() => handleSelectCategory(cat._id || cat.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg shrink-0 font-bold uppercase text-[11px]",
                    selectedCategory === (cat._id || cat.id)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Navigation Links */}
          <div className="space-y-1 pt-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors",
                location.pathname === "/"
                  ? "text-primary bg-primary/10 font-bold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <Home className="size-4.5 text-primary" />
                <span>Home</span>
              </div>
              <ChevronRight className="size-4 opacity-50" />
            </Link>

            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="size-4.5 text-primary" />
                <span>All Products Catalog</span>
              </div>
              <ChevronRight className="size-4 opacity-50" />
            </Link>

            <Link
              to="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <div className="flex items-center gap-3">
                <ShoppingCart className="size-4.5 text-primary" />
                <span>Shopping Cart ({cartItemCount})</span>
              </div>
              <ChevronRight className="size-4 opacity-50" />
            </Link>

            <Link
              to="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <div className="flex items-center gap-3">
                <Heart className="size-4.5 text-primary" />
                <span>Wishlist ({wishlistItemCount})</span>
              </div>
              <ChevronRight className="size-4 opacity-50" />
            </Link>

            <Link
              to="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <div className="flex items-center gap-3">
                <Package className="size-4.5 text-primary" />
                <span>Track Orders</span>
              </div>
              <ChevronRight className="size-4 opacity-50" />
            </Link>

            {user && (
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <div className="flex items-center gap-3">
                  <User className="size-4.5 text-primary" />
                  <span>My Profile</span>
                </div>
                <ChevronRight className="size-4 opacity-50" />
              </Link>
            )}
          </div>

          {/* Mobile Theme Preference */}
          <div className="pt-3 pb-1 border-t border-border space-y-2 px-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground px-1">
              Appearance
            </span>
            <ThemeSegmented fullWidth />
          </div>

          {/* Mobile User Profile Footer */}
          <div className="pt-2 border-t border-border flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5">
                  <Avatar className="size-8 bg-primary text-primary-foreground">
                    {user.profile?.url && <AvatarImage src={user.profile.url} alt={user.name} className="object-cover" />}
                    <AvatarFallback className="font-bold text-xs bg-primary text-primary-foreground">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-xs font-semibold leading-tight text-foreground font-heading">
                      {user.name || "Customer"}
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
                  className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive h-8 rounded-lg"
                >
                  <LogOut className="size-3.5 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/login" className="w-full">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-semibold tracking-wide rounded-xl h-10 shadow-md">
                  <User className="size-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
      </header>

      {/* Dynamic spacer matching fixed navbar height to prevent page content overlap */}
      <div
        style={{ height: headerHeight > 0 ? `${headerHeight}px` : undefined }}
        className={cn(
          "w-full shrink-0",
          !headerHeight && (announcementBanner && !bannerDismissed ? "h-28 sm:h-26" : "h-26 sm:h-17")
        )}
        aria-hidden="true"
      />
    </>
  );
}
