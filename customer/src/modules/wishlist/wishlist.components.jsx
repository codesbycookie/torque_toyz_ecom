import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ShoppingCart,
  Trash2,
  Star,
  Search,
  X,
  LayoutGrid,
  List,
  AlignJustify,
  Heart,
  ShoppingBag,
  Sparkles,
  PackageCheck,
  AlertCircle,
  ExternalLink,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Wishlist Summary Header Component ─────────────────────────────
export function WishlistSummaryHeader({
  totalCount,
  inStockCount,
  totalValue,
  selectedCount,
  onMoveAllInStockToCart,
  onClearAll,
  isMovingAll,
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-card via-card to-muted/40 p-6 md:p-8 shadow-xs mb-8">
      <div className="absolute -right-12 -top-12 size-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        {/* Left Stats */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center rounded-lg bg-rose-500/10 p-2 text-rose-500 dark:bg-rose-500/20">
              <Heart className="size-5 fill-rose-500" />
            </span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              My Saved Items
            </h1>
            <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-semibold rounded-full">
              {totalCount} {totalCount === 1 ? "item" : "items"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground max-w-xl">
            Manage your personal wishlist, keep track of price drops, and easily move items to your cart when you're ready to buy.
          </p>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <div className="flex items-center gap-2 text-xs font-medium bg-background/80 backdrop-blur-xs px-3 py-1.5 rounded-lg border">
              <PackageCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span>In Stock: <strong className="text-foreground">{inStockCount}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium bg-background/80 backdrop-blur-xs px-3 py-1.5 rounded-lg border">
              <Sparkles className="size-4 text-amber-500" />
              <span>Total Saved Value: <strong className="text-foreground">₹{totalValue.toLocaleString("en-IN")}</strong></span>
            </div>
          </div>
        </div>

        {/* Right Batch Header Actions */}
        {totalCount > 0 && (
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {inStockCount > 0 && (
              <Button
                onClick={onMoveAllInStockToCart}
                disabled={isMovingAll}
                className="gap-2 font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              >
                <ShoppingCart className="size-4" />
                {isMovingAll ? "Moving items..." : `Move All In-Stock (${inStockCount})`}
              </Button>
            )}
            {onClearAll}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Controls & Filter Bar ─────────────────────────────────────────
export function WishlistControlsBar({
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
  categoryFilter,
  onCategoryFilterChange,
  categories = [],
  stockFilter,
  onStockFilterChange,
  sortBy,
  onSortByChange,
  isSelectionMode,
  onToggleSelectionMode,
  allSelected,
  onToggleSelectAll,
  totalItems,
}) {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-card p-3 rounded-xl border shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search saved products..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-8 bg-background h-9 text-sm"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns & View Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          {categories.length > 0 && (
            <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
              <SelectTrigger className="h-9 text-xs w-[140px] bg-background">
                <Filter className="size-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Stock Filter */}
          <Select value={stockFilter} onValueChange={onStockFilterChange}>
            <SelectTrigger className="h-9 text-xs w-[130px] bg-background">
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Availability</SelectItem>
              <SelectItem value="in_stock">In Stock Only</SelectItem>
              <SelectItem value="low_stock">Low Stock</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Selector */}
          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className="h-9 text-xs w-[150px] bg-background">
              <ArrowUpDown className="size-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newly Added</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
              <SelectItem value="name_asc">Name: A to Z</SelectItem>
              <SelectItem value="rating_high">Highest Rated</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode Switcher */}
          <div className="flex items-center rounded-lg border bg-muted/50 p-0.5">
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="icon"
                    className="size-8 rounded-md"
                    onClick={() => onViewModeChange("grid")}
                  >
                    <LayoutGrid className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Grid View</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="icon"
                    className="size-8 rounded-md"
                    onClick={() => onViewModeChange("list")}
                  >
                    <List className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Detailed List View</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === "table" ? "secondary" : "ghost"}
                    size="icon"
                    className="size-8 rounded-md"
                    onClick={() => onViewModeChange("table")}
                  >
                    <AlignJustify className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Compact Table View</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Select All / Batch Toggle Bar */}
      {totalItems > 0 && (
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2 cursor-pointer select-none" onClick={onToggleSelectAll}>
              <Checkbox checked={allSelected} onCheckedChange={onToggleSelectAll} id="select-all-wishlist" />
              <label htmlFor="select-all-wishlist" className="text-xs font-medium cursor-pointer text-muted-foreground hover:text-foreground">
                Select All ({totalItems})
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Batch Action Floating Banner ──────────────────────────────────
export function WishlistBatchBar({
  selectedCount,
  selectedTotalValue,
  onMoveSelectedToCart,
  onRemoveSelected,
  onClearSelection,
  isProcessing,
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-xl animate-in slide-in-from-bottom-5 duration-200">
      <div className="flex items-center justify-between gap-4 bg-foreground text-background dark:bg-card dark:text-card-foreground p-3.5 px-5 rounded-2xl shadow-2xl border border-border/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs">
            {selectedCount}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight">
              {selectedCount} {selectedCount === 1 ? "item" : "items"} selected
            </span>
            <span className="text-xs opacity-80">
              Total: ₹{selectedTotalValue.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={onMoveSelectedToCart}
            disabled={isProcessing}
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium h-8 px-3 gap-1.5"
          >
            <ShoppingCart className="size-3.5" />
            Move to Cart
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={onRemoveSelected}
            disabled={isProcessing}
            className="text-xs font-medium h-8 px-3 gap-1.5"
          >
            <Trash2 className="size-3.5" />
            Remove
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={onClearSelection}
            className="size-8 rounded-full text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Wishlist Card - Grid Mode (e-commerce style) ──────────────────
export function WishlistGridCard({
  product,
  isSelected,
  onToggleSelect,
  onAddToCart,
  onRemove,
  isAddingToCart,
}) {
  const navigate = useNavigate();

  const images = product.images || [];
  const firstImage = images[0];
  const hoverImage = images[1];
  const href = `/products/${product.slug || product._id}`;

  const price = Number(product.price || 0);
  // Optional: only shows if your product has an original/MRP price field
  const mrp = Number(product.mrp || product.compare_price || 0);
  const hasDiscount = mrp > price && price > 0;
  const discountPct = hasDiscount ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const reviews = product.reviews || [];
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
        ).toFixed(1)
      : null;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card transition-all duration-300",
        "hover:-translate-y-0.5 hover:shadow-xl hover:border-foreground/20",
        isSelected && "ring-2 ring-primary border-primary"
      )}
    >
      {/* ── Image ─────────────────────────────────────────── */}
      <div className="relative aspect-square w-full overflow-hidden bg-white dark:bg-muted/30">
        <button
          type="button"
          onClick={() => navigate(href)}
          aria-label={`View ${product.name}`}
          className="flex size-full items-center justify-center p-5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
        >
          {firstImage ? (
            <>
              <img
                src={firstImage}
                alt={product.name}
                loading="lazy"
                className={cn(
                  "absolute inset-0 m-auto size-[calc(100%-2.5rem)] object-contain transition-all duration-500",
                  hoverImage
                    ? "group-hover:opacity-0"
                    : "group-hover:scale-105",
                  isOutOfStock && "opacity-50 grayscale"
                )}
              />
              {hoverImage && (
                <img
                  src={hoverImage}
                  alt=""
                  loading="lazy"
                  className={cn(
                    "absolute inset-0 m-auto size-[calc(100%-2.5rem)] object-contain opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105",
                    isOutOfStock && "grayscale"
                  )}
                />
              )}
            </>
          ) : (
            <span className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
              <ShoppingBag className="size-7 text-muted-foreground/40" />
              No image
            </span>
          )}
        </button>

        {/* Out-of-stock label */}
        {isOutOfStock && (
          <span className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 bg-foreground/80 py-1 text-center text-[11px] font-semibold uppercase tracking-widest text-background">
            Currently unavailable
          </span>
        )}

        {/* Discount ribbon */}
        {hasDiscount && !isOutOfStock && (
          <span className="absolute left-0 top-9 rounded-r-md bg-rose-600 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
            {discountPct}% OFF
          </span>
        )}

        {/* Select checkbox: always visible when selected / on touch, hover on desktop */}
        <div
          className={cn(
            "absolute left-2 top-2 z-10 transition-opacity",
            isSelected
              ? "opacity-100"
              : "opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100"
          )}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(product._id)}
            aria-label={`Select ${product.name}`}
            className="size-5 rounded-md border-muted-foreground/50 bg-background shadow-sm data-[state=checked]:bg-primary"
          />
        </div>

        {/* Remove */}
        <div className="absolute right-2 top-2 z-10">
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  aria-label="Remove from wishlist"
                  className="size-8 rounded-full bg-background/95 shadow-sm transition-colors hover:bg-destructive hover:text-destructive-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(product._id);
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remove from wishlist</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Image dots (only when there are multiple images) */}
        {images.length > 1 && (
          <div className="pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {images.slice(0, 3).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1 rounded-full bg-foreground/25 transition-all duration-300",
                  i === 0
                    ? "w-4 bg-foreground/60 group-hover:w-1.5 group-hover:bg-foreground/25"
                    : i === 1
                    ? "w-1.5 group-hover:w-4 group-hover:bg-foreground/60"
                    : "w-1.5"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Details ───────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-2 p-3.5 sm:p-4">
        <div className="space-y-1">
          {product.category?.name && (
            <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {product.category.name}
            </span>
          )}

          <Link
            to={href}
            title={product.name}
            className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-foreground transition-colors hover:text-primary"
          >
            {product.name}
          </Link>
        </div>

        {/* Rating chip */}
        {avgRating && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-0.5 rounded bg-emerald-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
              {avgRating}
              <Star className="size-3 fill-white" />
            </span>
            <span className="text-xs text-muted-foreground">
              ({reviews.length.toLocaleString("en-IN")})
            </span>
          </div>
        )}

        {/* Price block */}
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-xl font-bold tracking-tight text-foreground">
            ₹{price.toLocaleString("en-IN")}
          </span>
          {hasDiscount && (
            <>
              <span className="text-xs text-muted-foreground line-through">
                ₹{mrp.toLocaleString("en-IN")}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {discountPct}% off
              </span>
            </>
          )}
        </div>

        {/* Availability line */}
        <p
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            isOutOfStock
              ? "text-destructive"
              : isLowStock
              ? "text-rose-600 dark:text-rose-400"
              : "text-emerald-600 dark:text-emerald-400"
          )}
        >
          {isOutOfStock ? (
            "Out of stock"
          ) : isLowStock ? (
            `Only ${product.stock} left, order soon`
          ) : (
            <>
              <CheckCircle2 className="size-3.5" />
              In stock
            </>
          )}
        </p>

        {/* Action */}
        <Button
          disabled={isOutOfStock || isAddingToCart}
          onClick={() => onAddToCart(product)}
          className="mt-auto w-full gap-2 rounded-lg font-semibold shadow-sm"
        >
          {isAddingToCart ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ShoppingCart className="size-4" />
          )}
          {isOutOfStock ? "Unavailable" : isAddingToCart ? "Adding..." : "Add to Cart"}
        </Button>
      </div>
    </article>
  );
}

// ─── Wishlist Card - Detailed List Mode ─────────────────────────────
export function WishlistListCard({
  product,
  isSelected,
  onToggleSelect,
  onAddToCart,
  onRemove,
  isAddingToCart,
}) {
  const navigate = useNavigate();
  const firstImage = product.images?.[0];
  const price = Number(product.price || 0);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const reviews = product.reviews || [];
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
        ).toFixed(1)
      : null;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border transition-all hover:shadow-md p-4 sm:p-5",
        isSelected && "ring-2 ring-primary border-primary bg-primary/5"
      )}
    >
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
        {/* Checkbox & Thumbnail */}
        <div className="flex items-center gap-3 shrink-0">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(product._id)}
            className="size-5 rounded-md"
          />

          <div
            className="size-24 sm:size-28 rounded-xl bg-muted/40 border overflow-hidden cursor-pointer flex items-center justify-center p-2 shrink-0"
            onClick={() => navigate(`/products/${product.slug || product._id}`)}
          >
            {firstImage ? (
              <img
                src={firstImage}
                alt={product.name}
                className="size-full object-contain transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <ShoppingBag className="size-6 text-muted-foreground/40" />
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            {product.category?.name && (
              <Badge variant="secondary" className="text-[10px] font-normal">
                {product.category.name}
              </Badge>
            )}

            {isOutOfStock ? (
              <Badge variant="destructive" className="text-[10px] font-semibold">
                Out of stock
              </Badge>
            ) : isLowStock ? (
              <Badge className="bg-amber-500 text-white text-[10px] font-semibold">
                Low Stock ({product.stock})
              </Badge>
            ) : (
              <Badge className="bg-emerald-600 text-white text-[10px] font-semibold">
                In Stock
              </Badge>
            )}
          </div>

          <Link
            to={`/products/${product.slug || product._id}`}
            className="font-semibold text-base line-clamp-1 hover:text-primary transition-colors block"
          >
            {product.name}
          </Link>

          {product.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 max-w-xl">
              {product.description}
            </p>
          )}

          {avgRating && (
            <div className="flex items-center gap-1.5 pt-1">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold">{avgRating}</span>
              <span className="text-[11px] text-muted-foreground">({reviews.length} reviews)</span>
            </div>
          )}
        </div>

        {/* Price & Actions Right */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 shrink-0">
          <div className="text-left sm:text-right">
            <span className="text-xl font-bold tracking-tight text-foreground block">
              ₹{price.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              disabled={isOutOfStock || isAddingToCart}
              onClick={() => onAddToCart(product)}
              className="gap-1.5 text-xs font-semibold px-4 h-9 shadow-2xs"
            >
              <ShoppingCart className="size-4" />
              Add to Cart
            </Button>

            <Button
              size="icon"
              variant="outline"
              onClick={() => onRemove(product._id)}
              className="size-9 text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── Wishlist Table Row Mode ────────────────────────────────────────
export function WishlistTableRow({
  product,
  isSelected,
  onToggleSelect,
  onAddToCart,
  onRemove,
  isAddingToCart,
}) {
  const navigate = useNavigate();
  const firstImage = product.images?.[0];
  const price = Number(product.price || 0);
  const isOutOfStock = product.stock <= 0;

  return (
    <TableRow className={cn(isSelected && "bg-primary/5")}>
      <TableCell className="w-[40px] text-center">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(product._id)}
          className="size-4 rounded-[4px]"
        />
      </TableCell>
      <TableCell className="w-[80px]">
        <div
          className="size-14 rounded-lg bg-muted/40 border overflow-hidden cursor-pointer flex items-center justify-center p-1"
          onClick={() => navigate(`/products/${product.slug || product._id}`)}
        >
          {firstImage ? (
            <img src={firstImage} alt={product.name} className="size-full object-contain" />
          ) : (
            <ShoppingBag className="size-4 text-muted-foreground" />
          )}
        </div>
      </TableCell>
      <TableCell className="font-medium max-w-xs">
        <Link
          to={`/products/${product.slug || product._id}`}
          className="font-semibold text-sm hover:text-primary transition-colors line-clamp-1"
        >
          {product.name}
        </Link>
        {product.category?.name && (
          <span className="text-[11px] text-muted-foreground block">{product.category.name}</span>
        )}
      </TableCell>
      <TableCell className="font-semibold text-sm">
        ₹{price.toLocaleString("en-IN")}
      </TableCell>
      <TableCell>
        {isOutOfStock ? (
          <Badge variant="destructive" className="text-[10px]">Out of stock</Badge>
        ) : (
          <Badge className="bg-emerald-600 text-white text-[10px]">In stock</Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            disabled={isOutOfStock || isAddingToCart}
            onClick={() => onAddToCart(product)}
            className="gap-1.5 text-xs font-medium h-8 px-3"
          >
            <ShoppingCart className="size-3.5" />
            Add to Cart
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onRemove(product._id)}
            className="size-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ─── Wishlist Empty State ─────────────────────────────────────────
export function WishlistEmptyState() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl border border-dashed bg-card/50">
      <div className="relative mb-5">
        <div className="size-20 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
          <Heart className="size-10 fill-rose-500/20 stroke-[1.5]" />
        </div>
        <span className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
          <Sparkles className="size-4" />
        </span>
      </div>

      <h2 className="text-xl font-bold tracking-tight mb-1">Your Wishlist is Empty</h2>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        Explore our collection and click the heart icon on any product to save your favorites for later!
      </p>

      <Button
        size="lg"
        onClick={() => navigate("/products")}
        className="gap-2 font-semibold px-6 shadow-md"
      >
        <ShoppingBag className="size-4" />
        Browse Products
      </Button>
    </div>
  );
}

// ─── Wishlist Skeleton Loader ─────────────────────────────────────
export function WishlistSkeleton({ viewMode = "grid" }) {
  if (viewMode === "table") {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3 border rounded-lg bg-card">
            <Skeleton className="size-5 rounded-md" />
            <Skeleton className="size-14 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/5" />
            </div>
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-xl bg-card">
            <Skeleton className="size-24 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            <Skeleton className="h-9 w-32 rounded-lg self-end" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border bg-card">
          <Skeleton className="aspect-square w-full rounded-none" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}