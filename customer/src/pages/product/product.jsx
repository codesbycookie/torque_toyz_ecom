import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useApi } from "@/core/contexts/api.context";
import { useLoader } from "@/core/hooks/useLoader";
import {
  AmazonProductCard,
  AmazonProductCardSkeleton,
  ProductListCard,
} from "@/modules/product/product.components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  SlidersHorizontal,
  X,
  Star,
  LayoutGrid,
  List,
  RotateCcw,
  Check,
  PackageOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Sort options mapped to backend sortBy & order
const SORT_OPTIONS = [
  { value: "latest", label: "Featured / Newest", sortBy: "createdAt", order: "desc" },
  { value: "price-low", label: "Price: Low to High", sortBy: "price", order: "asc" },
  { value: "price-high", label: "Price: High to Low", sortBy: "price", order: "desc" },
  { value: "name-asc", label: "Name: A → Z", sortBy: "name", order: "asc" },
  { value: "name-desc", label: "Name: Z → A", sortBy: "name", order: "desc" },
  { value: "oldest", label: "Oldest First", sortBy: "createdAt", order: "asc" },
];

// Price brackets for quick selection
const PRICE_BRACKETS = [
  { id: "all", label: "All Prices", min: undefined, max: undefined },
  { id: "under-500", label: "Under ₹500", min: 0, max: 500 },
  { id: "500-1000", label: "₹500 – ₹1,000", min: 500, max: 1000 },
  { id: "1000-2500", label: "₹1,000 – ₹2,500", min: 1000, max: 2500 },
  { id: "2500-5000", label: "₹2,500 – ₹5,000", min: 2500, max: 5000 },
  { id: "above-5000", label: "Above ₹5,000", min: 5000, max: undefined },
];

// Helper to generate Amazon-style pagination page numbers
function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}

export default function ProductsPage() {
  const { products, categories, wishlist, cart } = useApi();
  const { loadOnly, loading: isProductsLoading } = useLoader();

  const [searchParams, setSearchParams] = useSearchParams();
  const searchParam = searchParams.get("search") || "";
  const categoryParam = searchParams.get("category") || "all";

  // Filter & Query States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12); // 12 items per page for clean 3x4 / 4x3 grid
  const [sort, setSort] = useState("latest");
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedPriceBracket, setSelectedPriceBracket] = useState("all");
  const [customMinPrice, setCustomMinPrice] = useState("");
  const [customMaxPrice, setCustomMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const productsTopRef = useRef(null);

  // Store data directly from modules
  const list = products.list || [];
  const categoriesList = categories.list || [];
  const pagination = products.pagination || {
    page: 1,
    limit: pageSize,
    total: 0,
    pages: 1,
    hasNext: false,
    hasPrev: false,
  };
  const loading = products.loading || {};
  const wishlistItems = wishlist.list || [];
  const wishlistedIds = wishlistItems.map((p) => p._id);

  // Fetch backend categories and wishlist on mount using module methods
  useEffect(() => {
    categories.getAll({ limit: 100, active: true });
    wishlist.fetchAll();
  }, []);

  // Primary function to query backend with filters & pagination
  const fetchBackendProducts = useCallback(
    (pageNumber = 1, overrides = {}) => {
      const activeSortKey = overrides.sort ?? sort;
      const sortConfig =
        SORT_OPTIONS.find((s) => s.value === activeSortKey) || SORT_OPTIONS[0];

      const activeBracket = overrides.priceBracket ?? selectedPriceBracket;
      let minP = undefined;
      let maxP = undefined;

      if (activeBracket === "custom") {
        const minVal = overrides.customMin ?? customMinPrice;
        const maxVal = overrides.customMax ?? customMaxPrice;
        if (minVal !== "") minP = Number(minVal);
        if (maxVal !== "") maxP = Number(maxVal);
      } else if (activeBracket !== "all") {
        const b = PRICE_BRACKETS.find((x) => x.id === activeBracket);
        if (b) {
          if (b.min !== undefined) minP = b.min;
          if (b.max !== undefined) maxP = b.max;
        }
      }

      const activeCat =
        overrides.category !== undefined ? overrides.category : selectedCategory;
      const activeSearch =
        overrides.search !== undefined ? overrides.search : searchParam;
      const activeStock =
        overrides.inStockOnly !== undefined ? overrides.inStockOnly : inStockOnly;
      const activeLimit = overrides.pageSize ?? pageSize;

      const queryParams = {
        page: pageNumber,
        limit: activeLimit,
        sortBy: sortConfig.sortBy,
        order: sortConfig.order,
        search: activeSearch.trim() || undefined,
        category: activeCat !== "all" ? activeCat : undefined,
        minPrice: minP,
        maxPrice: maxP,
        inStock: activeStock ? "true" : undefined,
      };

      loadOnly(() => products.fetch(queryParams));
    },
    [
      sort,
      selectedPriceBracket,
      customMinPrice,
      customMaxPrice,
      selectedCategory,
      searchParam,
      inStockOnly,
      pageSize,
    ]
  );

  // Sync with URL parameter changes (search & category from navbar)
  useEffect(() => {
    setSelectedCategory(categoryParam);
    setCurrentPage(1);
    fetchBackendProducts(1, { category: categoryParam, search: searchParam });
  }, [searchParam, categoryParam]);

  // Page change handler
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages || newPage === currentPage) return;
    setCurrentPage(newPage);
    fetchBackendProducts(newPage);

    // Smooth scroll to top of products grid
    productsTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Sort change handler
  const handleSortChange = (newSort) => {
    setSort(newSort);
    setCurrentPage(1);
    fetchBackendProducts(1, { sort: newSort });
  };

  // Category change handler
  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    setCurrentPage(1);
    fetchBackendProducts(1, { category: catId });
  };

  // Price bracket change handler
  const handlePriceBracketChange = (bracketId) => {
    setSelectedPriceBracket(bracketId);
    setCustomMinPrice("");
    setCustomMaxPrice("");
    setCurrentPage(1);
    fetchBackendProducts(1, {
      priceBracket: bracketId,
      customMin: "",
      customMax: "",
    });
  };

  // Custom price submit
  const handleApplyCustomPrice = (e) => {
    e?.preventDefault();
    setSelectedPriceBracket("custom");
    setCurrentPage(1);
    fetchBackendProducts(1, {
      priceBracket: "custom",
      customMin: customMinPrice,
      customMax: customMaxPrice,
    });
  };

  // Stock toggle handler
  const handleStockToggle = (checked) => {
    const val = Boolean(checked);
    setInStockOnly(val);
    setCurrentPage(1);
    fetchBackendProducts(1, { inStockOnly: val });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCategory("all");
    setSelectedPriceBracket("all");
    setCustomMinPrice("");
    setCustomMaxPrice("");
    setInStockOnly(false);
    setSort("latest");
    setCurrentPage(1);
    setIsMobileFilterOpen(false);

    if (searchParam) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("search");
      setSearchParams(nextParams);
    }

    fetchBackendProducts(1, {
      search: "",
      category: "all",
      priceBracket: "all",
      customMin: "",
      customMax: "",
      inStockOnly: false,
      sort: "latest",
    });
  };

  const handleAddToCart = async (product) => {
    return cart.addToCart(product, 1);
  };

  const handleToggleWishlist = (product) => {
    const alreadyWishlisted =
      wishlistedIds.includes(product._id) || Boolean(product?.is_in_wishlist);
    wishlist.toggle(product, alreadyWishlisted);
  };

  // Count active filters
  const activeFiltersCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (selectedPriceBracket !== "all" ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (searchParam ? 1 : 0);

  // Reusable Left Side Filter & Sort Panel
  const FilterPanel = () => (
    <div className="space-y-6 text-sm">
      {/* 1. Header with Active Filter Count & Reset */}
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-2 font-bold text-foreground text-base tracking-tight">
          <SlidersHorizontal className="size-4 text-primary" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border border-primary/20 font-semibold text-xs px-2 py-0.5"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-primary hover:underline font-medium cursor-pointer"
          >
            Clear all
          </button>
        )}
      </div>

      {/* 3. Department / Category (from backend) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-xs tracking-wider uppercase text-foreground/80">
            Category
          </h4>
          {selectedCategory !== "all" && (
            <button
              onClick={() => handleCategoryChange("all")}
              className="text-[11px] text-muted-foreground hover:text-primary cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        <div className="space-y-1">
          <button
            onClick={() => handleCategoryChange("all")}
            className={cn(
              "w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center justify-between transition-colors cursor-pointer",
              selectedCategory === "all"
                ? "bg-primary/10 text-primary font-semibold border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            )}
          >
            <span>All Categories</span>
          </button>

          {(showAllCategories ? categoriesList : categoriesList.slice(0, 6)).map((cat) => {
            const catId = cat._id || cat.slug || cat.id;
            const isSelected = selectedCategory === catId;
            return (
              <button
                key={catId}
                onClick={() => handleCategoryChange(catId)}
                className={cn(
                  "w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center justify-between transition-colors cursor-pointer",
                  isSelected
                    ? "bg-primary/10 text-primary font-semibold border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                <span className="line-clamp-1">{cat.name}</span>
              </button>
            );
          })}

          {categoriesList.length > 6 && (
            <button
              type="button"
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="text-[11px] text-primary hover:underline font-medium pt-1 px-2.5 cursor-pointer block"
            >
              {showAllCategories ? "Show less" : `+ ${categoriesList.length - 6} more`}
            </button>
          )}
        </div>
      </div>

      <Separator />

      {/* 4. Price Brackets & Custom Range */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-xs tracking-wider uppercase text-foreground/80">
            Price Range
          </h4>
          {selectedPriceBracket !== "all" && (
            <button
              onClick={() => handlePriceBracketChange("all")}
              className="text-[11px] text-muted-foreground hover:text-primary cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="space-y-1">
          {PRICE_BRACKETS.map((bracket) => {
            const isSelected = selectedPriceBracket === bracket.id;
            return (
              <button
                key={bracket.id}
                onClick={() => handlePriceBracketChange(bracket.id)}
                className={cn(
                  "w-full text-left px-2 py-1 rounded-md text-xs transition-colors cursor-pointer",
                  isSelected
                    ? "bg-primary/10 text-primary font-semibold border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                {bracket.label}
              </button>
            );
          })}
        </div>

        {/* Custom Price Range Inputs */}
        <form onSubmit={handleApplyCustomPrice} className="pt-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                ₹
              </span>
              <Input
                type="number"
                placeholder="Min"
                className="pl-5 text-xs h-8"
                value={customMinPrice}
                onChange={(e) => setCustomMinPrice(e.target.value)}
              />
            </div>
            <span className="text-muted-foreground text-xs">–</span>
            <div className="relative flex-1">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                ₹
              </span>
              <Input
                type="number"
                placeholder="Max"
                className="pl-5 text-xs h-8"
                value={customMaxPrice}
                onChange={(e) => setCustomMaxPrice(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              size="sm"
              className="h-8 px-2.5 text-xs font-medium cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Go
            </Button>
          </div>
        </form>
      </div>

      <Separator />

      {/* 5. Availability (In Stock) */}
      <div className="space-y-2.5">
        <h4 className="font-semibold text-xs tracking-wider uppercase text-foreground/80">
          Availability
        </h4>

        <div className="space-y-2">
          <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer select-none">
            <Checkbox
              checked={inStockOnly}
              onCheckedChange={handleStockToggle}
            />
            <span>Include In-Stock Only</span>
          </label>
        </div>
      </div>
    </div>
  );

  const totalResults = pagination.total || list.length;
  const startItem = pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const endItem = pagination.total > 0 ? Math.min(pagination.page * pagination.limit, pagination.total) : list.length;

  return (
    <div className="min-h-screen bg-background text-foreground" ref={productsTopRef}>
      {/* ─── Main Content Container (2:8 Ratio) ─────────────────── */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 lg:gap-8 items-start">
          {/* 
            =======================================================
            LEFT COLUMN: FULL SORTING AND FILTERING (2:8 RATIO)
            2 columns out of 10 = Exactly 2:8 ratio!
            ======================================================= 
          */}
          <aside className="hidden lg:block lg:col-span-2">
            <div className="bg-card border border-border/80 rounded-xl p-4 shadow-2xs">
              <FilterPanel />
            </div>
          </aside>

          {/* 
            =======================================================
            RIGHT COLUMN: AMAZON-STYLE PRODUCTS GRID (2:8 RATIO)
            8 columns out of 10 = Exactly 2:8 ratio!
            ======================================================= 
          */}
          <main className="col-span-1 lg:col-span-8 min-w-0 space-y-4">
            {/* Top Toolbar in Right Column */}
            <div className="bg-card border border-border/70 rounded-xl p-3 sm:p-4 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Results Count & Mobile View Toggle */}
                <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
                  <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                    {totalResults > 0 ? (
                      <>
                        Showing <strong className="text-foreground font-semibold">{startItem}–{endItem}</strong> of{" "}
                        <strong className="text-foreground font-semibold">{totalResults}</strong> results
                      </>
                    ) : (
                      "0 results"
                    )}
                  </span>

                  {/* Mobile Grid vs List View Toggle */}
                  <div className="flex sm:hidden items-center border rounded-lg overflow-hidden bg-background p-0.5 shrink-0">
                    <button
                      type="button"
                      aria-label="Grid View"
                      onClick={() => setViewMode("grid")}
                      className={cn(
                        "p-1.5 rounded transition-colors cursor-pointer",
                        viewMode === "grid"
                          ? "bg-primary/10 text-primary shadow-2xs font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <LayoutGrid className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="List View"
                      onClick={() => setViewMode("list")}
                      className={cn(
                        "p-1.5 rounded transition-colors cursor-pointer",
                        viewMode === "list"
                          ? "bg-primary/10 text-primary shadow-2xs font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <List className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* Right controls: Mobile Filter Button, Top Sort Select, Desktop View Switch */}
                <div className="flex items-center gap-2 justify-between sm:justify-end w-full sm:w-auto">

                  {/* Mobile Filter Sheet Trigger (visible on < lg) */}
                  <div className="lg:hidden flex-1 sm:flex-initial">
                    <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9 w-full sm:w-auto relative cursor-pointer font-medium text-xs">
                          <SlidersHorizontal className="size-3.5 mr-1.5 text-primary" />
                          Filters
                          {activeFiltersCount > 0 && (
                            <Badge
                              variant="secondary"
                              className="ml-1.5 bg-primary text-primary-foreground font-bold text-[10px] size-4 p-0 flex items-center justify-center rounded-full"
                            >
                              {activeFiltersCount}
                            </Badge>
                          )}
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="left" className="w-[85vw] sm:max-w-md overflow-y-auto no-scrollbar p-6">
                        <SheetHeader className="mb-4 text-left">
                          <SheetTitle className="text-lg">Sort &amp; Filter</SheetTitle>
                        </SheetHeader>
                        <FilterPanel />
                        <SheetFooter className="mt-6 flex flex-row gap-2 pt-4 border-t">
                          <Button
                            variant="outline"
                            onClick={clearAllFilters}
                            className="flex-1 text-xs cursor-pointer"
                          >
                            Reset all
                          </Button>
                          <Button
                            onClick={() => setIsMobileFilterOpen(false)}
                            className="flex-1 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cursor-pointer"
                          >
                            Show Results
                          </Button>
                        </SheetFooter>
                      </SheetContent>
                    </Sheet>
                  </div>

                  {/* Quick Sort Dropdown */}
                  <Select value={sort} onValueChange={handleSortChange}>
                    <SelectTrigger className="h-9 flex-1 sm:w-44 text-xs bg-background cursor-pointer font-medium">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs cursor-pointer">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Desktop Grid vs List View Toggle */}
                  <div className="hidden sm:flex items-center border rounded-lg overflow-hidden bg-background p-0.5 shrink-0">
                    <button
                      type="button"
                      aria-label="Grid View"
                      onClick={() => setViewMode("grid")}
                      className={cn(
                        "p-1.5 rounded transition-colors cursor-pointer",
                        viewMode === "grid"
                          ? "bg-primary/10 text-primary shadow-2xs font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <LayoutGrid className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="List View"
                      onClick={() => setViewMode("list")}
                      className={cn(
                        "p-1.5 rounded transition-colors cursor-pointer",
                        viewMode === "list"
                          ? "bg-primary/10 text-primary shadow-2xs font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <List className="size-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filter Chips Bar */}
              {activeFiltersCount > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t text-xs">
                  <span className="text-muted-foreground mr-1 text-[11px] font-medium">Active:</span>

                  {searchParam && (
                    <Badge variant="secondary" className="gap-1 pr-1 bg-primary/10 text-primary border border-primary/20 font-normal">
                      <span>Search: "{searchParam}"</span>
                      <button
                        onClick={() => {
                          const nextParams = new URLSearchParams(searchParams);
                          nextParams.delete("search");
                          setSearchParams(nextParams);
                        }}
                        className="hover:text-destructive cursor-pointer"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  )}

                  {selectedCategory !== "all" && (
                    <Badge variant="secondary" className="gap-1 pr-1 bg-primary/10 text-primary border border-primary/20 font-normal">
                      <span>
                        Category:{" "}
                        {categoriesList.find((c) => (c._id || c.slug || c.id) === selectedCategory)?.name || "Selected"}
                      </span>
                      <button
                        onClick={() => handleCategoryChange("all")}
                        className="hover:text-destructive cursor-pointer"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  )}

                  {selectedPriceBracket !== "all" && (
                    <Badge variant="secondary" className="gap-1 pr-1 bg-primary/10 text-primary border border-primary/20 font-normal">
                      <span>
                        Price:{" "}
                        {selectedPriceBracket === "custom"
                          ? `₹${customMinPrice || 0} - ₹${customMaxPrice || "Any"}`
                          : PRICE_BRACKETS.find((b) => b.id === selectedPriceBracket)?.label}
                      </span>
                      <button
                        onClick={() => handlePriceBracketChange("all")}
                        className="hover:text-destructive cursor-pointer"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  )}

                  {inStockOnly && (
                    <Badge variant="secondary" className="gap-1 pr-1 bg-primary/10 text-primary border border-primary/20 font-normal">
                      <span>In Stock</span>
                      <button
                        onClick={() => handleStockToggle(false)}
                        className="hover:text-destructive cursor-pointer"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  )}

                  <button
                    onClick={clearAllFilters}
                    className="text-primary hover:underline text-[11px] ml-1 font-semibold cursor-pointer"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Products Render Area */}
            {loading.getAll ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                {Array.from({ length: pageSize }).map((_, i) => (
                  <AmazonProductCardSkeleton key={i} />
                ))}
              </div>
            ) : list.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 px-4 text-center border border-dashed rounded-xl bg-card">
                <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <PackageOpen className="size-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-foreground mb-1">
                  No products found
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mb-5">
                  We couldn't find any items matching your selected filters. Try adjusting your
                  search or filter criteria.
                </p>
                <Button
                  onClick={clearAllFilters}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs"
                >
                  <RotateCcw className="size-3.5 mr-1.5" />
                  Reset all filters
                </Button>
              </div>
            ) : (
              <>
                {viewMode === "grid" ? (
                  /* Amazon Grid Type Structure (driven 100% by backend data) */
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                    {list.map((product) => (
                      <AmazonProductCard
                        key={product._id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onToggleWishlist={handleToggleWishlist}
                        isWishlisted={
                          wishlistedIds.includes(product._id) ||
                          Boolean(product?.is_in_wishlist)
                        }
                      />
                    ))}
                  </div>
                ) : (
                  /* Amazon Horizontal List View (Alternative toggle) */
                  <div className="border border-border/80 rounded-xl overflow-hidden bg-card divide-y divide-border/60">
                    {list.map((product) => (
                      <ProductListCard
                        key={product._id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onToggleWishlist={handleToggleWishlist}
                        isWishlisted={
                          wishlistedIds.includes(product._id) ||
                          Boolean(product?.is_in_wishlist)
                        }
                      />
                    ))}
                  </div>
                )}

                {/* ─── Backend Pagination Controls ────────────────────────── */}
                {pagination.pages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-2 border-t">
                    <div className="text-xs text-muted-foreground">
                      Showing{" "}
                      <span className="font-semibold text-foreground">
                        {startItem}
                      </span>
                      –
                      <span className="font-semibold text-foreground">
                        {endItem}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-foreground">
                        {pagination.total}
                      </span>{" "}
                      products
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!pagination.hasPrev || loading.getAll}
                        onClick={() => handlePageChange(pagination.page - 1)}
                        className="h-8 text-xs cursor-pointer select-none"
                      >
                        <ChevronLeft className="size-4 mr-1" />
                        Previous
                      </Button>

                      {/* Page Numbers */}
                      <div className="flex items-center gap-1">
                        {getPageNumbers(pagination.page, pagination.pages).map((p, idx) =>
                          p === "..." ? (
                            <span
                              key={`dots-${idx}`}
                              className="px-2 text-xs text-muted-foreground select-none"
                            >
                              ...
                            </span>
                          ) : (
                            <Button
                              key={p}
                              variant={pagination.page === p ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(p)}
                              disabled={loading.getAll}
                              className={cn(
                                "size-8 p-0 text-xs cursor-pointer select-none",
                                pagination.page === p &&
                                  "bg-primary text-primary-foreground font-bold hover:bg-primary/90"
                              )}
                            >
                              {p}
                            </Button>
                          )
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!pagination.hasNext || loading.getAll}
                        onClick={() => handlePageChange(pagination.page + 1)}
                        className="h-8 text-xs cursor-pointer select-none"
                      >
                        Next
                        <ChevronRight className="size-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}