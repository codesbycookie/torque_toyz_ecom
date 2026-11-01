import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Search,
  X,
  LayoutGrid,
  List as ListIcon,
  Table2,
  ShoppingCart,
  Trash2,
  Star,
  Loader2,
  ArrowRight,
  Zap,
  Wallet,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { TableRow, TableCell } from '@/components/ui/table';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Config: paths                                                      */
/* ------------------------------------------------------------------ */
export const PRODUCT_PATH = (p) => `/products/${p?.slug || p?._id || p}`;
export const SHOP_PATH = '/products';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
export const money = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

import { resolveProductImage } from "@/modules/product/product.components";

export const getImage = (p) => {
  const i = p.images?.[0] || p.image || p.thumbnail || p.imageUrl;
  const str = typeof i === 'string' ? i : i?.url || i?.secure_url || '';
  return resolveProductImage(str, p._id || p.name || 0);
};

export const CHECK_CLS =
  'size-4.5 rounded-[4px] border-[#d1d5db] bg-white data-[state=checked]:border-[#b81d24] data-[state=checked]:bg-[#b81d24] data-[state=checked]:text-white';

export const brandBg = {
  backgroundImage:
    'repeating-conic-gradient(rgba(255,255,255,.06) 0% 25%, transparent 0% 50%), linear-gradient(135deg, #b81d24 0%, #a1181e 55%, #6e0f14 100%)',
  backgroundSize: '34px 34px, 100% 100%',
};

export const css = `
@keyframes wl-rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes wl-bar{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}
@keyframes wl-lines{from{background-position:0 0}to{background-position:-240px 0}}
@keyframes wl-shine{from{transform:translateX(-120%) skewX(-20deg)}to{transform:translateX(260%) skewX(-20deg)}}
@keyframes wl-beat{0%,100%{transform:scale(1)}50%{transform:scale(1.18)}}
@keyframes wl-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
.wl-rise{animation:wl-rise .55s cubic-bezier(.2,.8,.2,1) backwards}
.wl-bar{animation:wl-bar .35s cubic-bezier(.2,.8,.2,1) backwards}
.wl-lines{animation:wl-lines 2.6s linear infinite}
.wl-float{animation:wl-float 3.6s ease-in-out infinite}
.wl-beat{animation:wl-beat 1.6s ease-in-out infinite}
.wl-shine{position:relative;overflow:hidden}
.wl-shine:not(:disabled)::after{content:"";position:absolute;inset:0 auto 0 0;width:40%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent);animation:wl-shine 2.8s ease-in-out infinite}
.wl-stagger>*{animation:wl-rise .5s cubic-bezier(.2,.8,.2,1) backwards}
${Array.from(
  { length: 12 },
  (_, i) => `.wl-stagger>*:nth-child(${i + 1}){animation-delay:${i * 0.05}s}`
).join('')}
@media (prefers-reduced-motion:reduce){.wl-rise,.wl-bar,.wl-lines,.wl-float,.wl-beat,.wl-shine::after,.wl-stagger>*{animation:none!important}}
`;

export function useCountUp(target, ms = 700) {
  const [v, setV] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setV(target);
      from.current = target;
      return undefined;
    }
    const start = performance.now();
    const a = from.current;
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / ms);
      setV(a + (target - a) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

export function useLeave(onRemove, id) {
  const [leaving, setLeaving] = useState(false);
  const run = async (e) => {
    e?.stopPropagation?.();
    setLeaving(true);
    await new Promise((r) => setTimeout(r, 220));
    try {
      await onRemove(id);
    } finally {
      setLeaving(false);
    }
  };
  return [leaving, run];
}

/* ------------------------------------------------------------------ */
/*  Summary header                                                     */
/* ------------------------------------------------------------------ */
export function Stat({ icon: Icon, value, label }) {
  return (
    <div className="rounded-xl bg-white/15 px-3 py-2.5 backdrop-blur sm:px-4 sm:py-3">
      <div className="flex items-center gap-1.5 text-white/80">
        <Icon className="size-3.5" />
        <span className="truncate text-[11px] font-semibold sm:text-xs">{label}</span>
      </div>
      <p className="mt-0.5 truncate text-lg font-extrabold tracking-tight text-white sm:text-2xl">{value}</p>
    </div>
  );
}

export function WishlistSummaryHeader({
  totalCount,
  inStockCount,
  totalValue,
  selectedCount,
  onMoveAllInStockToCart,
  isMovingAll,
  onClearAll,
}) {
  const total = Math.round(useCountUp(totalCount));
  const stock = Math.round(useCountUp(inStockCount));
  const value = useCountUp(totalValue, 900);

  return (
    <section
      className="relative mb-6 overflow-hidden rounded-2xl p-5 text-white shadow-[0_12px_40px_-12px_rgba(184,29,36,.45)] sm:p-8"
      style={brandBg}
    >
      <style>{css}</style>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {[22, 50, 78].map((top, i) => (
          <div
            key={top}
            className="wl-lines absolute left-0 h-[2px] w-full opacity-60"
            style={{
              top: `${top}%`,
              animationDuration: `${2 + i * 0.8}s`,
              backgroundImage:
                'repeating-linear-gradient(90deg, rgba(255,255,255,.28) 0 60px, transparent 60px 180px)',
            }}
          />
        ))}
      </div>

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">
            <Heart className="wl-beat size-3.5 fill-white" />
            <span>Saved gear</span>
            {selectedCount > 0 && (
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold text-[#b81d24]">
                {selectedCount} selected
              </span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
            My Wishlist
          </h1>
          <p className="mt-1 max-w-md text-sm text-white/90">
            Products you've saved for later. Move them to the cart when you're ready to buy.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-white p-2 shadow-lg">
          <Button
            type="button"
            size="sm"
            onClick={onMoveAllInStockToCart}
            disabled={isMovingAll || inStockCount === 0}
            className="wl-shine gap-1.5 rounded-lg bg-[#b81d24] text-xs font-bold text-white hover:bg-[#a1181e] active:scale-[0.97] disabled:opacity-60"
          >
            {isMovingAll ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Zap className="size-3.5" />
            )}
            {isMovingAll ? 'Moving...' : 'Move all in-stock to cart'}
          </Button>
          {onClearAll}
        </div>
      </div>

      <div className="relative mt-6 grid grid-cols-3 gap-2 sm:gap-3">
        <Stat icon={Heart} label="Saved" value={total} />
        <Stat icon={Package} label="In stock" value={stock} />
        <Stat icon={Wallet} label="Total value" value={money(value)} />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Controls bar                                                       */
/* ------------------------------------------------------------------ */
const triggerCls =
  'h-10 w-full rounded-xl border-transparent bg-[#eef0f4] text-sm font-medium text-[#111827] focus:border-[#b81d24] focus:ring-2 focus:ring-[#b81d24]/15';

const modes = [
  ['grid', LayoutGrid, 'Grid'],
  ['list', ListIcon, 'List'],
  ['table', Table2, 'Table'],
];

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
  allSelected,
  onToggleSelectAll,
  totalItems,
}) {
  return (
    <div className="mb-6 space-y-3 rounded-2xl border border-[#e5e7eb] bg-white p-3 shadow-sm sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="group relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-[#9ca3af] transition-colors group-focus-within:text-[#b81d24]" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search your wishlist"
            aria-label="Search wishlist"
            className="h-11 rounded-xl border-transparent bg-[#eef0f4] pl-10 pr-10 text-sm font-medium placeholder:text-[#9ca3af] focus-visible:border-[#b81d24] focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#b81d24]/15"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-[#6b7280] hover:bg-[#e5e7eb] hover:text-[#111827]"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div
          role="tablist"
          aria-label="View mode"
          className="inline-flex shrink-0 self-start rounded-xl bg-[#eef0f4] p-1 sm:self-auto"
        >
          {modes.map(([m, Icon, label]) => {
            const active = viewMode === m;
            return (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={`${label} view`}
                onClick={() => onViewModeChange(m)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                  active
                    ? 'bg-white text-[#b81d24] shadow-sm'
                    : 'text-[#6b7280] hover:text-[#111827]'
                }`}
              >
                <Icon className="size-4" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
          <SelectTrigger
            className={`${triggerCls} col-span-2 sm:col-span-1`}
            aria-label="Category"
          >
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={stockFilter} onValueChange={onStockFilterChange}>
          <SelectTrigger className={triggerCls} aria-label="Stock">
            <SelectValue placeholder="Stock" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stock</SelectItem>
            <SelectItem value="in_stock">In stock</SelectItem>
            <SelectItem value="low_stock">Low stock</SelectItem>
            <SelectItem value="out_of_stock">Out of stock</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className={triggerCls} aria-label="Sort by">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="price_low">Price: low to high</SelectItem>
            <SelectItem value="price_high">Price: high to low</SelectItem>
            <SelectItem value="name_asc">Name: A to Z</SelectItem>
            <SelectItem value="rating_high">Top rated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between border-t border-[#e5e7eb] pt-3">
        <label className="inline-flex cursor-pointer select-none items-center gap-2.5 text-sm font-medium text-[#374151]">
          <Checkbox
            checked={allSelected}
            onCheckedChange={onToggleSelectAll}
            className={CHECK_CLS}
          />
          Select all
        </label>
        <span className="rounded-full bg-[#fae8e8] px-2.5 py-0.5 text-xs font-bold text-[#8b151b]">
          {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Batch bar                                                          */
/* ------------------------------------------------------------------ */
export function WishlistBatchBar({
  selectedCount,
  selectedTotalValue,
  onMoveSelectedToCart,
  onRemoveSelected,
  onClearSelection,
  isProcessing,
}) {
  if (!selectedCount) return null;
  return (
    <div className="wl-bar fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:bottom-6 sm:px-4 sm:pb-0">
      <div className="mx-auto flex max-w-2xl flex-col gap-3 rounded-2xl bg-[#111827] p-3 text-white shadow-2xl ring-1 ring-white/10 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-[#b81d24] text-sm font-extrabold">
            {selectedCount}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold">
              {selectedCount === 1 ? '1 item selected' : `${selectedCount} items selected`}
            </p>
            <p className="text-xs text-white/60">Total {money(selectedTotalValue)}</p>
          </div>
          <button
            type="button"
            onClick={onClearSelection}
            aria-label="Clear selection"
            className="ml-auto grid size-8 place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-white sm:hidden"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={onMoveSelectedToCart}
            disabled={isProcessing}
            className="wl-shine h-10 flex-1 gap-1.5 rounded-xl bg-[#b81d24] font-bold text-white hover:bg-[#a1181e] active:scale-[0.97] sm:flex-none"
          >
            {isProcessing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ShoppingCart className="size-4" />
            )}
            Move to cart
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onRemoveSelected}
            disabled={isProcessing}
            className="h-10 gap-1.5 rounded-xl border-white/20 bg-transparent font-semibold text-white hover:bg-white/10 hover:text-white"
          >
            <Trash2 className="size-4" />
            Remove
          </Button>
          <button
            type="button"
            onClick={onClearSelection}
            aria-label="Clear selection"
            className="hidden size-9 place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-white sm:grid"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Exact Amazon-Style Grid Card (as on product page)                  */
/* ------------------------------------------------------------------ */
export function WishlistGridCard({
  product,
  isSelected,
  onToggleSelect,
  onAddToCart,
  onRemove,
  isAddingToCart,
}) {
  const navigate = useNavigate();
  const [leaving, remove] = useLeave(onRemove, product._id);

  const firstImage = getImage(product);
  const ui = product.ui || {};
  const price = Number(ui.actual_price || product.price || 0);
  const slashPrice = Number(ui.slash_price || 0);
  const hasDiscount = slashPrice > price;
  const discountPercent = hasDiscount ? Math.round(((slashPrice - price) / slashPrice) * 100) : 0;
  const isTrending = Boolean(ui.is_trending);
  const customBadges = Array.isArray(ui.badges) ? ui.badges.filter(Boolean) : [];
  const isOutOfStock = product.stock <= 0;

  const reviews = product.reviews || [];
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
        ).toFixed(1)
      : null;
  const isChoice = (Number(avgRating) >= 4.2 && reviews.length >= 2) || product.featured;

  const handleCardClick = () => {
    navigate(PRODUCT_PATH(product));
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'group relative flex flex-row sm:flex-col justify-between h-auto sm:h-full bg-card hover:bg-card/95 border rounded-xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer',
        isSelected
          ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
          : 'border-border/70 hover:border-primary/50',
        leaving && 'scale-95 opacity-0'
      )}
    >
      {/* Media Area (Left on mobile, Top on desktop) */}
      <div className="relative w-32 xs:w-36 sm:w-full shrink-0 aspect-square overflow-hidden bg-muted/20 dark:bg-muted/10 p-2.5 sm:p-4 flex items-center justify-center border-r sm:border-r-0 sm:border-b border-border/40">
        {firstImage ? (
          <img
            src={firstImage}
            alt={product.name}
            className="size-full object-contain transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground text-xs">
            No image available
          </div>
        )}

        {/* Selection Checkbox on Top Left (above badges) */}
        <div
          className="absolute top-2 left-2 z-10 flex items-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="rounded-md bg-white/95 dark:bg-neutral-900/90 p-1 shadow-sm backdrop-blur-xs border border-border/60">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelect?.(product._id)}
              aria-label={`Select ${product.name}`}
              className={CHECK_CLS}
            />
          </div>
        </div>

        {/* Badges on Bottom Left of Image */}
        <div className="absolute bottom-2 left-2 flex flex-col gap-1 items-start z-1 max-w-[80%]">
          {isOutOfStock ? (
            <Badge variant="destructive" className="text-[10px] font-medium px-1.5 py-0">
              Out of stock
            </Badge>
          ) : product.stock > 0 && product.stock <= 5 ? (
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-medium px-1.5 py-0"
            >
              Only {product.stock} left
            </Badge>
          ) : null}
          {isTrending && (
            <span className="bg-amber-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-sm tracking-wide shadow-xs uppercase">
              Trending
            </span>
          )}
          {customBadges.slice(0, 2).map((b, idx) => (
            <span key={idx} className="bg-primary text-primary-foreground text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-sm tracking-wide shadow-xs uppercase truncate max-w-full">
              {b}
            </span>
          ))}
          {!isTrending && customBadges.length === 0 && isChoice && (
            <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-sm tracking-wide shadow-xs uppercase">
              Featured Pick
            </span>
          )}
        </div>

        {/* Wishlist Heart Button on Top Right (clicking removes from wishlist) */}
        <button
          type="button"
          aria-label="Remove from wishlist"
          title="Remove from wishlist"
          className="absolute top-2 right-2 size-8 rounded-full bg-background/90 hover:bg-background backdrop-blur-sm shadow-xs border border-border/80 flex items-center justify-center text-primary transition-transform hover:scale-110 active:scale-95 z-2"
          onClick={remove}
        >
          <Heart className="size-4 fill-primary text-primary" />
        </button>
      </div>

      {/* Product Details (Right on mobile, Bottom on desktop) */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-2 min-w-0">
        <div className="space-y-1 sm:space-y-1.5">
          {/* Category */}
          {product.category?.name && (
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground line-clamp-1">
              {product.category.name}
            </p>
          )}

          {/* Title */}
          <h3 className="font-semibold text-xs sm:text-[15px] leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Star Rating */}
          <div className="flex items-center gap-1.5 text-xs pt-0.5">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'size-3 sm:size-3.5',
                    avgRating && i < Math.round(Number(avgRating))
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-muted-foreground/30 fill-muted-foreground/10'
                  )}
                />
              ))}
            </div>
            {avgRating ? (
              <span className="text-muted-foreground font-medium text-[11px]">
                {avgRating} ({reviews.length})
              </span>
            ) : (
              <span className="text-muted-foreground/60 text-[11px]">(New)</span>
            )}
          </div>

          {/* Price & MRP Block */}
          <div className="pt-1 space-y-0.5">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                ₹{price.toLocaleString('en-IN')}
              </span>
              {mrp > price && (
                <span className="text-xs text-muted-foreground line-through">
                  ₹{mrp.toLocaleString('en-IN')}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="text-xs font-semibold text-primary">
                  ({discountPercent}% off)
                </span>
              )}
            </div>

            {/* Delivery Promise */}
            <p className="text-[11px] text-muted-foreground">
              <span className="font-semibold text-primary">FREE delivery</span> available
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-1.5 sm:pt-2">
          <Button
            type="button"
            size="sm"
            disabled={isOutOfStock || isAddingToCart}
            className="w-full rounded-full bg-primary hover:bg-primary/90 active:bg-primary/95 text-primary-foreground font-semibold text-xs sm:text-sm shadow-xs border border-transparent transition-transform active:scale-[0.98] h-8 sm:h-9"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart?.(product);
            }}
          >
            {isAddingToCart ? (
              <>
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
                Adding...
              </>
            ) : (
              <>
                <ShoppingCart className="size-3.5 mr-1.5" />
                {isOutOfStock ? 'Out of stock' : 'Add to cart'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Exact List Card (Matching ProductListCard from product page)      */
/* ------------------------------------------------------------------ */
export function WishlistListCard({
  product,
  isSelected,
  onToggleSelect,
  onAddToCart,
  onRemove,
  isAddingToCart,
}) {
  const navigate = useNavigate();
  const [leaving, remove] = useLeave(onRemove, product._id);

  const firstImage = getImage(product);
  const ui = product.ui || {};
  const price = Number(ui.actual_price || product.price || 0);
  const isOutOfStock = product.stock <= 0;

  const reviews = product.reviews || [];
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
        ).toFixed(1)
      : null;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-card p-4 sm:p-5 transition-all hover:bg-muted/40 cursor-pointer',
        isSelected && 'ring-2 ring-primary border-primary bg-primary/5',
        leaving && 'scale-95 opacity-0'
      )}
      onClick={() => navigate(PRODUCT_PATH(product))}
    >
      <div className="flex gap-4 sm:gap-6 items-start sm:items-center">
        {/* Checkbox */}
        <div className="shrink-0 pt-1 sm:pt-0" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect?.(product._id)}
            aria-label={`Select ${product.name}`}
            className={CHECK_CLS}
          />
        </div>

        {/* Image */}
        <div className="shrink-0 w-28 sm:w-36 md:w-40">
          <div className="aspect-square rounded-lg overflow-hidden bg-muted/40 border border-border/60 flex items-center justify-center p-2">
            {firstImage ? (
              <img
                src={firstImage}
                alt={product.name}
                className="size-full object-contain transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <span className="text-xs text-muted-foreground">No image</span>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
          <div className="space-y-1.5">
            {/* Category */}
            {product.category?.name && (
              <Badge variant="secondary" className="text-xs font-normal">
                {product.category.name}
              </Badge>
            )}

            <h3 className="font-semibold text-[15px] sm:text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            {avgRating && (
              <div className="flex items-center gap-1.5 pt-0.5">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">{avgRating}</span>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'size-3.5',
                          i < Math.round(Number(avgRating))
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-muted-foreground/30'
                        )}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  ({reviews.length} reviews)
                </span>
              </div>
            )}

            <div className="pt-1">
              <span className="text-xl font-semibold tracking-tight text-foreground">
                ₹{price.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="text-sm">
              {isOutOfStock ? (
                <Badge variant="destructive" className="font-normal">
                  Out of stock
                </Badge>
              ) : product.stock < 10 ? (
                <span className="text-amber-600 font-medium">Only {product.stock} left</span>
              ) : (
                <span className="text-emerald-600 font-medium">In stock</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-5"
              disabled={isOutOfStock || isAddingToCart}
              onClick={() => onAddToCart?.(product)}
            >
              {isAddingToCart ? (
                <>
                  <Loader2 className="size-4 mr-1.5 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingCart className="size-4 mr-1.5" />
                  Add to cart
                </>
              )}
            </Button>

            <Button
              size="icon"
              variant="outline"
              className="size-9 rounded-full text-primary hover:text-primary hover:bg-primary/10"
              onClick={remove}
              title="Remove from wishlist"
            >
              <Heart className="size-4 fill-primary" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Table row                                                          */
/* ------------------------------------------------------------------ */
export function WishlistTableRow({
  product,
  isSelected,
  onToggleSelect,
  onAddToCart,
  onRemove,
  isAddingToCart,
}) {
  const [leaving, remove] = useLeave(onRemove, product._id);
  const firstImage = getImage(product);
  const ui = product.ui || {};
  const price = Number(ui.actual_price || product.price || 0);
  const isOutOfStock = product.stock <= 0;

  const reviews = product.reviews || [];
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
        ).toFixed(1)
      : null;

  return (
    <TableRow
      className={cn(
        'transition-all duration-300',
        isSelected ? 'bg-primary/5 hover:bg-primary/5' : 'hover:bg-muted/40',
        leaving && 'opacity-0'
      )}
    >
      <TableCell className="text-center">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect?.(product._id)}
          aria-label={`Select ${product.name}`}
          className={CHECK_CLS}
        />
      </TableCell>
      <TableCell>
        <div className="size-14 rounded-lg overflow-hidden bg-muted/40 border border-border/60 flex items-center justify-center p-1">
          {firstImage ? (
            <img
              src={firstImage}
              alt={product.name}
              className="size-full object-contain"
              loading="lazy"
            />
          ) : (
            <span className="text-[10px] text-muted-foreground">No img</span>
          )}
        </div>
      </TableCell>
      <TableCell className="max-w-[260px]">
        <Link
          to={PRODUCT_PATH(product)}
          className="line-clamp-1 font-semibold text-foreground hover:text-primary transition-colors"
        >
          {product.name}
        </Link>
        <div className="mt-0.5 flex items-center gap-2">
          {product.category?.name && (
            <span className="text-xs font-semibold text-primary">{product.category.name}</span>
          )}
          {avgRating && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              {avgRating} ({reviews.length})
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="font-bold text-foreground">
        ₹{price.toLocaleString('en-IN')}
      </TableCell>
      <TableCell>
        {isOutOfStock ? (
          <Badge variant="destructive" className="text-[10px] font-medium">
            Out of stock
          </Badge>
        ) : product.stock <= 5 ? (
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-medium"
          >
            Only {product.stock} left
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-medium">
            In stock
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            disabled={isOutOfStock || isAddingToCart}
            onClick={() => onAddToCart?.(product)}
            className="h-8 text-xs font-semibold px-3"
          >
            <ShoppingCart className="size-3.5 mr-1.5" />
            Add to cart
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={remove}
            className="size-8 text-primary hover:text-destructive hover:bg-destructive/10"
            title="Remove from wishlist"
          >
            <Heart className="size-4 fill-primary" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty state                                                        */
/* ------------------------------------------------------------------ */
export function WishlistEmptyState() {
  return (
    <div className="wl-rise flex flex-col items-center rounded-2xl border border-t-[3.5px] border-border/80 border-t-primary bg-card px-6 py-14 text-center shadow-xs sm:py-20">
      <div className="wl-float mb-5 grid size-20 place-items-center rounded-full bg-primary/10 text-primary">
        <Heart className="wl-beat size-9 fill-primary" />
      </div>
      <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
        Your wishlist is empty
      </h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Tap the heart on any RC car or part to save it here. You can find it here anytime.
      </p>
      <Button
        asChild
        className="wl-shine group mt-6 h-11 gap-2 rounded-xl bg-primary px-6 font-bold text-primary-foreground shadow-md hover:bg-primary/90 active:scale-[0.98]"
      >
        <Link to={SHOP_PATH}>
          Browse products
          <ArrowRight className="size-4.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Skeleton (Matches AmazonProductCardSkeleton)                       */
/* ------------------------------------------------------------------ */
export function WishlistSkeleton({ viewMode = 'grid' }) {
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/70 overflow-hidden bg-card p-0 flex flex-row sm:flex-col justify-between h-auto sm:h-full"
          >
            <Skeleton className="w-32 xs:w-36 sm:w-full aspect-square shrink-0 rounded-none" />
            <div className="p-3 sm:p-3.5 space-y-2 flex-1 min-w-0">
              <Skeleton className="h-2.5 sm:h-3 w-1/3" />
              <Skeleton className="h-3.5 sm:h-4 w-4/5" />
              <Skeleton className="h-2.5 sm:h-3 w-1/4" />
              <Skeleton className="h-4 sm:h-5 w-1/2 mt-1 sm:mt-2" />
              <Skeleton className="h-8 sm:h-9 w-full rounded-full mt-2 sm:mt-3" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl border border-border/80 bg-card p-4"
        >
          <Skeleton className="size-20 shrink-0 rounded-lg sm:size-28" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <Skeleton className="hidden h-9 w-32 rounded-lg sm:block" />
        </div>
      ))}
    </div>
  );
}
