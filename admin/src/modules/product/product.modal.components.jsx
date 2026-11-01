import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAsync } from "@/core/hooks/useAsync";
import { useClearError } from "@/core/hooks/useClearError";
import { useSubmit } from "@/core/hooks/useSubmit";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoader } from "@/core/hooks/useLoader";
import { useEffect, useState } from "react";
import CopyButton from "@/components/ui/copy-button";
import formatdate from "@/core/utils/formatdate.util";
import {
  productCreateSchema,
  productEditSchema,
  productStockSchema,
  productUISettingsSchema,
} from "./product.schema";
import ProductForm, { BadgesInput } from "./product.form";
import { Switch } from "@/components/ui/switch";
import { useSettingStore } from "@/modules/setting/setting.store";

import { Pencil, Star, Trash2 } from "lucide-react";
import { safeId } from "@/core/utils/normalize-id";
import { Separator } from "@/components/ui/separator";

const toProductFormData = (values) => {
  const images = values.images || [];
  const uploadedImages = images.filter((image) => image instanceof File);

  if (uploadedImages.length === 0) {
    return values;
  }

  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    if (key !== "images" && value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  images.forEach((image) => {
    if (image instanceof File) formData.append("images", image);
    else formData.append("existingImages", image);
  });

  return formData;
};

// ─── View Reviews ─────────────────────────────────────────────
export const ViewReviews = ({
  product,
  onDeleteReview,
  closeModal = () => { },
}) => {
  const reviews = product?.reviews || [];
  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map(
    (star) => reviews.filter((r) => r.rating === star).length
  );

  const getReviewerName = (review) => {
    if (typeof review.user === "object" && review.user?.name) {
      return review.user.name;
    }
    return "Anonymous";
  };

  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const avatarPalette = [
    "bg-rose-100 text-rose-700",
    "bg-amber-100 text-amber-700",
    "bg-emerald-100 text-emerald-700",
    "bg-sky-100 text-sky-700",
    "bg-violet-100 text-violet-700",
    "bg-fuchsia-100 text-fuchsia-700",
  ];
  const getAvatarColor = (name = "") => {
    const sum = name
      .split("")
      .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return avatarPalette[sum % avatarPalette.length];
  };

  return (
    <DialogContent className="sm:max-w-3xl w-full max-h-[85vh] overflow-y-auto p-0 gap-0">
      <DialogHeader className="px-6 pt-6 pb-2">
        <DialogTitle className="text-lg">
          Reviews — {product?.name}
        </DialogTitle>
      </DialogHeader>

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center px-6">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-1">
            <Star className="size-5 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-medium">No reviews yet</p>
          <p className="text-xs text-muted-foreground max-w-[220px]">
            Reviews for this product will show up here once customers leave
            feedback.
          </p>
        </div>
      ) : (
        <>
          {/* Rating summary */}
          <div className="flex items-center gap-6 px-6 py-5">
            <div className="flex flex-col items-center shrink-0">
              <span className="text-4xl font-semibold tracking-tight">
                {avgRating.toFixed(1)}
              </span>
              <div className="flex items-center gap-0.5 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-3.5 ${i < Math.round(avgRating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/25"
                      }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground mt-1.5">
                {reviews.length} review{reviews.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map((star, idx) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-2.5">
                    {star}
                  </span>
                  <Star className="size-3 fill-amber-400 text-amber-400 shrink-0" />
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{
                        width: `${reviews.length
                          ? (ratingCounts[idx] / reviews.length) * 100
                          : 0
                          }%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-4 text-right">
                    {ratingCounts[idx]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Review list */}
          <div className="px-6 py-5 space-y-5">
            {reviews.map((review) => {
              const name = getReviewerName(review);
              return (
                <div
                  key={review._id}
                  className="group flex gap-3 -mx-2 px-2 py-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-medium ${getAvatarColor(
                      name
                    )}`}
                  >
                    {getInitials(name) || "?"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{name}</p>
                      <span className="flex items-center gap-0.5 text-xs font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                        <Star className="size-2.5 fill-amber-500 text-amber-500" />
                        {review.rating}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto shrink-0">
                        {review.createdAt
                          ? new Date(review.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })
                          : "-"}
                      </span>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-6 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onDeleteReview?.(review)}
                        aria-label={`Delete review by ${name}`}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>

                    {review.comment && (
                      <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}


      <DialogFooter className="px-6 py-4">
        <DialogClose asChild>
          <Button variant="outline" onClick={closeModal}>
            Close
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};



// ─── Delete Review ────────────────────────────────────────────
export const DeleteReview = ({
  product,
  review,
  submitFn = () => { },
  closeModal = () => { },
}) => (
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Delete this review?</DialogTitle>
      <DialogDescription>
        Review by <strong>{review?.userName}</strong> on{" "}
        <strong>{product?.name}</strong> will be removed permanently.
      </DialogDescription>
    </DialogHeader>

    <DialogFooter>
      <DialogClose asChild>
        <Button variant="outline">Cancel</Button>
      </DialogClose>
      <Button
        variant="destructive"
        onClick={() => {
          submitFn();
          closeModal();
        }}
      >
        Delete
      </Button>
    </DialogFooter>
  </DialogContent>
);

export const View = ({
  product,
  closeModal = () => { },
  onEdit,
  onUISettings,
  onReviews,
}) => {
  if (!product) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const images = Array.isArray(product.images) ? product.images : [];
  const currentImage = images[activeImageIndex] || images[0];

  const actualPrice = product.ui?.actual_price ?? product.price ?? 0;
  const slashPrice = product.ui?.slash_price ?? 0;
  const hasDiscount = Number(slashPrice) > Number(actualPrice) && Number(actualPrice) > 0;
  const discountPercent = hasDiscount
    ? Math.round(((slashPrice - actualPrice) / slashPrice) * 100)
    : null;

  const categoryName =
    typeof product.category === "object"
      ? product.category?.name || "-"
      : product.category || "-";

  const reviews = Array.isArray(product.reviews) ? product.reviews : [];
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  const badges = Array.isArray(product.ui?.badges) ? product.ui.badges : [];

  const handleEdit = () => {
    closeModal();
    if (onEdit) onEdit();
  };

  const handleUISettings = () => {
    closeModal();
    if (onUISettings) onUISettings();
  };

  const handleReviews = () => {
    closeModal();
    if (onReviews) onReviews();
  };

  return (
    <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <DialogHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b">
          <div className="space-y-1">
            <DialogTitle className="text-xl font-bold tracking-tight">
              {product.name}
            </DialogTitle>
            <DialogDescription className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono flex items-center gap-1">
                <span>Code: {product.code || "—"}</span>
                {product.code && (
                  <CopyButton
                    text={product.code}
                    label="Product Code"
                    className="size-4"
                    iconClassName="size-3"
                  />
                )}
              </span>
              <span>•</span>
              <span className="font-mono flex items-center gap-1">
                <span>Slug: {product.slug || "—"}</span>
                {product.slug && (
                  <CopyButton
                    text={product.slug}
                    label="Slug"
                    className="size-4"
                    iconClassName="size-3"
                  />
                )}
              </span>
              <span>•</span>
              <span className="font-mono flex items-center gap-1">
                <span>ID: {safeId(product._id)}</span>
                <CopyButton
                  text={safeId(product._id)}
                  label="Product ID"
                  className="size-4"
                  iconClassName="size-3"
                />
              </span>
            </DialogDescription>
          </div>

          <div className="flex items-center gap-2">
            {onUISettings && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleUISettings}
                className="text-xs font-medium"
              >
                UI Settings
              </Button>
            )}
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="text-xs font-medium"
              >
                Edit Product
              </Button>
            )}
          </div>
        </div>
      </DialogHeader>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-1">
        <div className="rounded-xl border bg-muted/30 p-3 space-y-1">
          <span className="text-xs font-medium text-muted-foreground block">
            Selling Price
          </span>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-base font-semibold text-foreground">
              ₹{Number(actualPrice).toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                ₹{Number(slashPrice).toFixed(2)}
              </span>
            )}
            {discountPercent !== null && (
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                {discountPercent}% OFF
              </span>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-muted/30 p-3 space-y-1">
          <span className="text-xs font-medium text-muted-foreground block">
            Inventory
          </span>
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-foreground">
              {product.stock ?? 0} units
            </span>
            <Badge
              variant={product.stock <= 0 ? "destructive" : "outline"}
              className={`text-[10px] px-1.5 py-0 font-normal ${
                product.stock > 0 && product.stock <= (Number(useSettingStore.getState().current?.low_stock_threshold ?? 10))
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                  : ""
              }`}
            >
              {product.stock <= 0
                ? "Out of Stock"
                : product.stock <= (Number(useSettingStore.getState().current?.low_stock_threshold ?? 10))
                ? "Need more stock"
                : "In Stock"}
            </Badge>
          </div>
        </div>

        <div className="rounded-xl border bg-muted/30 p-3 space-y-1">
          <span className="text-xs font-medium text-muted-foreground block">
            Category
          </span>
          <div className="text-sm font-semibold truncate text-foreground">
            {categoryName}
          </div>
        </div>

        <div className="rounded-xl border bg-muted/30 p-3 space-y-1">
          <span className="text-xs font-medium text-muted-foreground block">
            Visibility Status
          </span>
          <div>
            <Badge
              variant={product.active ? "default" : "outline"}
              className="text-xs font-normal"
            >
              {product.active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main 2-column Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-2">
        {/* Left Column: Image Gallery & Description */}
        <div className="space-y-4">
          {/* Image Display */}
          <div className="rounded-xl border bg-card p-3 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Product Media ({images.length})
              </span>
              {images.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  Image {activeImageIndex + 1} of {images.length}
                </span>
              )}
            </div>

            {currentImage ? (
              <div className="space-y-2">
                <div className="aspect-video w-full rounded-lg border bg-muted/20 overflow-hidden flex items-center justify-center">
                  <img
                    src={currentImage}
                    alt={product.name}
                    className="size-full object-contain"
                  />
                </div>

                {images.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative size-14 rounded-md border overflow-hidden shrink-0 transition-all ${
                          idx === activeImageIndex
                            ? "ring-2 ring-primary border-primary"
                            : "opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={img}
                          alt=""
                          className="size-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-video w-full rounded-lg border border-dashed flex items-center justify-center text-xs text-muted-foreground">
                No images uploaded
              </div>
            )}
          </div>

          {/* Description */}
          <div className="rounded-xl border bg-card p-3.5 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block border-b pb-2">
              Description
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {product.description || "No description provided."}
            </p>
          </div>
        </div>

        {/* Right Column: Merchandising, Reviews, Specs */}
        <div className="space-y-4">
          {/* Merchandising & UI Display */}
          <div className="rounded-xl border bg-card p-3.5 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block border-b pb-2">
              Merchandising & UI Display
            </span>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b">
                <span className="text-muted-foreground">Trending Showcase</span>
                <Badge
                  variant={product.ui?.is_trending ? "secondary" : "outline"}
                  className="text-xs font-normal"
                >
                  {product.ui?.is_trending ? "Trending Active" : "Not Trending"}
                </Badge>
              </div>

              <div className="flex items-center justify-between py-1 border-b">
                <span className="text-muted-foreground">Slash MRP</span>
                <span className="font-mono font-medium">
                  {slashPrice > 0 ? `₹${Number(slashPrice).toFixed(2)}` : "—"}
                </span>
              </div>

              <div className="py-1">
                <span className="text-muted-foreground block mb-1.5">
                  Assigned Badges ({badges.length})
                </span>
                {badges.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {badges.map((badge, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-xs font-normal"
                      >
                        {badge}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground italic">
                    No promotional badges assigned
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Specs & Reviews */}
          <div className="rounded-xl border bg-card p-3.5 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block border-b pb-2">
              Specifications & Feedback
            </span>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b">
                <span className="text-muted-foreground">Shipping Weight</span>
                <span className="font-medium">{product.weight ?? 0} kg</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b">
                <span className="text-muted-foreground">Customer Reviews</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                    {avgRating && ` (${avgRating} / 5.0)`}
                  </span>
                  {onReviews && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleReviews}
                      className="h-6 px-2 text-[11px]"
                    >
                      View
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between py-1 border-b">
                <span className="text-muted-foreground">Created At</span>
                <span className="font-medium text-foreground">
                  {product.createdAt ? formatdate(product.createdAt) : "—"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-medium text-foreground">
                  {product.updatedAt ? formatdate(product.updatedAt) : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <DialogFooter className="pt-2">
        <DialogClose asChild>
          <Button variant="outline" onClick={closeModal}>
            Close
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export const ViewImages = ({ product, closeModal = () => { } }) => {
  if (!product) return null;
  const images = product.images || [];

  return (
    <DialogContent className="sm:max-w-2xl w-full max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Images — {product.name}</DialogTitle>
        <DialogDescription>
          {images.length} image{images.length !== 1 ? "s" : ""} available
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
        {images.length === 0 ? (
          <p className="text-sm text-muted-foreground col-span-full text-center py-8">
            No images available for this product.
          </p>
        ) : (
          images.map((src, i) => (
            <a
              key={i}
              href={src}
              target="_blank"
              rel="noreferrer"
              className="relative aspect-square rounded-md overflow-hidden border block hover:opacity-90 transition-opacity cursor-pointer"
            >
              <img
                src={src}
                alt={`${product.name} ${i + 1}`}
                className="size-full object-cover"
              />
            </a>
          ))
        )}
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline" onClick={closeModal}>
            Close
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export const Create = ({ submitFn = () => { }, closeModal = () => { }, exported } = {}) => {
  const form = useForm({
    resolver: zodResolver(productCreateSchema),
    defaultValues: {
      name: "",
      description: "",
      images: [],
      category: "",
      stock: 0,
      price: 0,
      weight: 0,
      active: true,
    },
  });

  const { createPreset } = useLoader();
  const loadCategories = createPreset(exported?.categories);

  const { run, loading, ErrorAlert, clearError } = useAsync(submitFn);

  useClearError(form, clearError);

  const onSubmit = useSubmit({
    run,
    form,
    transform: toProductFormData,
    onSuccess: closeModal,
  });

  useEffect(() => {
    if (exported?.categories) loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create Product</DialogTitle>
        <DialogDescription>Enter details of the product</DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form
          className="grid gap-4 py-2"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <ProductForm form={form} categories={exported?.categories?.state || []} />
          {ErrorAlert}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              type="submit"
              loading={loading}
              loadingText="Saving the product.."
            >
              Save
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export const UpdateStock = ({
  product,
  submitFn = () => { },
  closeModal = () => { },
} = {}) => {
  const form = useForm({
    resolver: zodResolver(productStockSchema),
    defaultValues: {
      stock: product?.stock ?? 0,
      price: product?.price ?? 0,
    },
  });

  const { run, loading, ErrorAlert, clearError } = useAsync(submitFn);

  useClearError(form, clearError);

  const onSubmit = useSubmit({
    run,
    form,
    onSuccess: closeModal,
  });

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Update Stock & Rate</DialogTitle>
        <DialogDescription>
          Update available stock and rate for {product?.name}. Current stock:{" "}
          {product?.stock ?? 0}, current rate: ₹{Number(product?.price ?? 0).toFixed(2)}.
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form
          className="grid gap-4 py-2"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter stock" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rate</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        ₹
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-6"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {ErrorAlert}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              type="submit"
              loading={loading}
              loadingText="Updating..."
            >
              Save
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export const Edit = ({
  product,
  submitFn = () => { },
  closeModal = () => { },
  exported,
} = {}) => {
  const form = useForm({
    resolver: zodResolver(productEditSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      images: product?.images || [],
      category: product?.category?._id || product?.category || "",
      stock: product?.stock ?? 0,
      price: product?.price ?? 0,
      weight: product?.weight ?? 0,
      active: product?.active ?? true,
    },
  });

  const { createPreset } = useLoader();
  const loadCategories = createPreset(exported?.categories);

  const { run, loading, ErrorAlert, clearError } = useAsync(submitFn);

  useClearError(form, clearError);

  const onSubmit = useSubmit({
    run,
    form,
    transform: toProductFormData,
    onSuccess: closeModal,
  });

  useEffect(() => {
    if (exported?.categories) loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogDescription>Update details of {product?.name}</DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form
          className="grid gap-4 py-2"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <ProductForm form={form} categories={exported?.categories?.state || []} />
          {ErrorAlert}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              type="submit"
              loading={loading}
              loadingText="Saving the product.."
            >
              Save
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export const Delete = ({
  id,
  name,
  closeModal = () => { },
  submitFn = () => { },
}) => (
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Are you sure you want to delete {name}?</DialogTitle>
      <DialogDescription>
        This will be stored as deleted, this product record can be retrieved by
        Admin.
      </DialogDescription>
    </DialogHeader>

    <DialogFooter>
      <DialogClose asChild>
        <Button variant="outline">Cancel</Button>
      </DialogClose>
      <Button
        variant="destructive"
        onClick={() => {
          submitFn(id);
          closeModal();
        }}
      >
        Delete
      </Button>
    </DialogFooter>
  </DialogContent>
);

export const Erase = ({ id, submitFn, closeModal }) => (
  <DialogContent className="sm:max-w-[425px] pe-10">
    <DialogHeader>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogDescription>
        <strong>Note:</strong> This operation is Permenent Delete. All the data
        related to this product will be lost.
      </DialogDescription>
    </DialogHeader>

    <DialogFooter>
      <DialogClose asChild>
        <Button variant="outline">Cancel</Button>
      </DialogClose>
      <Button
        onClick={() => {
          submitFn(id);
          closeModal();
        }}
        variant="success"
      >
        Delete Permanently
      </Button>
    </DialogFooter>
  </DialogContent>
);

export const Retrieve = ({ id, submitFn, closeModal }) => (
  <DialogContent className="sm:max-w-[425px] pe-10">
    <DialogHeader>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogDescription>
        <strong>Note:</strong> this operation is retrieve All the data related
        to this product will be back.
      </DialogDescription>
    </DialogHeader>

    <DialogFooter>
      <DialogClose asChild>
        <Button variant="outline">Cancel</Button>
      </DialogClose>
      <Button
        onClick={() => {
          submitFn(id);
          closeModal();
        }}
        variant="destructive"
      >
        Retrieve
      </Button>
    </DialogFooter>
  </DialogContent>
);

export const ActiveStatus = ({
  id,
  status,
  submitFn,
  closeModal,
  exported,
}) => {
  const actionLabel = status ? "Deactivate" : "Activate";

  const onConfirm = async () => {
    await submitFn(id, { active: !status });
    closeModal();
  };

  return (
    <DialogContent className="sm:max-w-[425px] pe-10">
      <DialogHeader>
        <DialogTitle>{actionLabel} Product</DialogTitle>

        <DialogDescription>
          {status ? (
            <>
              This will <strong>deactivate</strong> the Product.
              <br />
              It will no longer be visible for sale.
            </>
          ) : (
            <>
              This will <strong>activate</strong> the Product.
              <br />
              It will become available again.
            </>
          )}
        </DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline" disabled={exported?.loading?.edit}>
            Cancel
          </Button>
        </DialogClose>

        <Button
          variant={status ? "destructive" : "default"}
          onClick={onConfirm}
          disabled={exported?.loading?.edit}
        >
          {exported?.loading?.edit ? "Updating..." : actionLabel}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

// ─── Product UI Settings ──────────────────────────────────────
export const ProductUISettings = ({
  product,
  submitFn = () => { },
  closeModal = () => { },
} = {}) => {
  const form = useForm({
    resolver: zodResolver(productUISettingsSchema),
    defaultValues: {
      slash_price: product?.ui?.slash_price ?? 0,
      actual_price: product?.ui?.actual_price ?? product?.price ?? 0,
      badges: Array.isArray(product?.ui?.badges) ? product.ui.badges : [],
      is_trending: Boolean(product?.ui?.is_trending),
    },
  });

  const { run, loading, ErrorAlert, clearError } = useAsync(submitFn);

  useClearError(form, clearError);

  const onSubmit = useSubmit({
    run,
    form,
    transform: (values) => ({
      ui: values,
      price: Number(values.actual_price) || 0,
    }),
    onSuccess: closeModal,
  });

  const actualPrice = Number(form.watch("actual_price")) || 0;
  const slashPrice = Number(form.watch("slash_price")) || 0;
  const discountPercent =
    slashPrice > actualPrice && actualPrice > 0
      ? Math.round(((slashPrice - actualPrice) / slashPrice) * 100)
      : null;

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Product UI Settings</DialogTitle>
        <DialogDescription>
          Configure promotional prices, badges, and trends for {product?.name}
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form
          className="grid gap-4 py-2"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="actual_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selling Price</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        ₹
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-6"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slash_price"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Slash Price (MRP)</FormLabel>
                    {discountPercent !== null && (
                      <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        ₹
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-6"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="badges"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Badges</FormLabel>
                <FormControl>
                  <BadgesInput
                    value={field.value || []}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_trending"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-3.5">
                <div className="space-y-0.5">
                  <FormLabel>Trending Product</FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Highlight this product with a trending badge.
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={Boolean(field.value)}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {ErrorAlert}

          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              type="submit"
              loading={loading}
              loadingText="Saving UI settings..."
            >
              Save Settings
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};
