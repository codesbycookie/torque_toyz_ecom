import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useApi } from "@/core/contexts/api.context";
import { useLoader } from "@/core/hooks/useLoader";
import { ProductListCard } from "@/modules/product/product.components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, X } from "lucide-react";

export default function ProductsPage() {
  const api = useApi();
  const { products, wishlist } = api;
  const { loadOnly, loading: isProductsLoading } = useLoader();

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [priceRange, setPriceRange] = useState("all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Load initial data
  useEffect(() => {
    loadOnly(() => Promise.all([
      products.getAll({ limit: 20, sortBy: "createdAt", order: "desc" }),
      wishlist.fetchAll()
    ]));
  }, []);

  // Reactive module properties
  const list = products.list || [];
  const loading = products.loading || {};
  const query = products.query || {};

  const wishlistItems = wishlist.list || [];
  const wishlistedIds = wishlistItems.map((p) => p._id);

  // ─── Search (debounced) ──────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim()) {
        products.filters.search(search.trim(), { limit: 20 });
      } else if (query.search) {
        // only reset search if it was previously set
        products.fetch({ search: undefined, page: 1, limit: 20 });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // ─── Sort ────────────────────────────────────────────────
  const handleSortChange = (value) => {
    setSort(value);

    switch (value) {
      case "latest":
        products.filters.latest({ limit: 20 });
        break;
      case "oldest":
        products.filters.oldest({ limit: 20 });
        break;
      case "price-low":
        products.filters.ascending("price", { limit: 20 });
        break;
      case "price-high":
        products.filters.descending("price", { limit: 20 });
        break;
      case "name-asc":
        products.filters.ascending("name", { limit: 20 });
        break;
      case "name-desc":
        products.filters.descending("name", { limit: 20 });
        break;
      default:
        products.filters.latest({ limit: 20 });
    }
  };

  // ─── Apply Filters ───────────────────────────────────────
  const applyFilters = () => {
    const extras = { limit: 20, page: 1 };

    // Example: you can extend this when backend supports more filters
    // if (priceRange === "under-1000") extras.maxPrice = 1000;
    // if (inStockOnly) extras.inStock = true;

    // For now we just re-fetch with current sort + search
    if (search.trim()) {
      products.filters.search(search.trim(), extras);
    } else {
      products.fetch({ ...extras, sortBy: query.sortBy, order: query.order });
    }

    setIsFilterOpen(false);
  };

  const clearAll = () => {
    setSearch("");
    setSort("latest");
    setPriceRange("all");
    setInStockOnly(false);
    products.reset({ limit: 20, sortBy: "createdAt", order: "desc" });
    setIsFilterOpen(false);
  };

  const handleAddToCart = (product) => {
    api.cart.addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  const handleToggleWishlist = (product) => {
    const alreadyWishlisted = wishlistedIds.includes(product._id) || Boolean(product?.is_in_wishlist);
    wishlist.toggle(product, alreadyWishlisted);
  };

  const activeFiltersCount =
    (priceRange !== "all" ? 1 : 0) + (inStockOnly ? 1 : 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4 space-y-3">
          {/* Title + Count */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold tracking-tight">
              All Products
              {!loading.getAll && (
                <span className="text-muted-foreground font-normal text-base ml-2">
                  ({list.length})
                </span>
              )}
            </h1>
          </div>

          {/* Search + Sort + Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-9 pr-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Sort */}
            <Select value={sort} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name-asc">Name: A → Z</SelectItem>
                <SelectItem value="name-desc">Name: Z → A</SelectItem>
              </SelectContent>
            </Select>

            {/* Filters Sheet */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="relative">
                  <SlidersHorizontal className="size-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="absolute -top-2 -right-2 size-5 p-0 flex items-center justify-center text-xs"
                    >
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>

              <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                  {/* Price Range */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Price Range</Label>
                    <Select value={priceRange} onValueChange={setPriceRange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All prices</SelectItem>
                        <SelectItem value="under-1000">Under ₹1,000</SelectItem>
                        <SelectItem value="1000-5000">₹1,000 – ₹5,000</SelectItem>
                        <SelectItem value="5000-15000">₹5,000 – ₹15,000</SelectItem>
                        <SelectItem value="above-15000">Above ₹15,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* In Stock */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="in-stock" className="text-sm font-medium">
                      In stock only
                    </Label>
                    <Button
                      id="in-stock"
                      variant={inStockOnly ? "default" : "outline"}
                      size="sm"
                      onClick={() => setInStockOnly(!inStockOnly)}
                    >
                      {inStockOnly ? "On" : "Off"}
                    </Button>
                  </div>
                </div>

                <SheetFooter className="mt-8 flex gap-3">
                  <Button variant="outline" onClick={clearAll} className="flex-1">
                    Clear all
                  </Button>
                  <Button onClick={applyFilters} className="flex-1">
                    Apply filters
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Product List */}
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {loading.getAll ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-4 p-4 border-b">
                <Skeleton className="size-36 sm:size-44 rounded-lg shrink-0" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-6 w-24 mt-2" />
                  <Skeleton className="h-9 w-32 mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-muted-foreground text-lg">
              {search ? "No products match your search" : "No products found"}
            </p>
            {(search || activeFiltersCount > 0) && (
              <Button variant="link" onClick={clearAll} className="mt-2">
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden bg-card">
            {list.map((product) => (
              <ProductListCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                isWishlisted={wishlistedIds.includes(product._id) || Boolean(product?.is_in_wishlist)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}