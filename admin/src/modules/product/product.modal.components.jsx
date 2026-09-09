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
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAsync } from "@/core/hooks/useAsync";
import { useClearError } from "@/core/hooks/useClearError";
import { useSubmit } from "@/core/hooks/useSubmit";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoader } from "@/core/hooks/useLoader";
import { useEffect } from "react";
import {
  productCreateSchema,
  productEditSchema,
  productStockSchema,
} from "./product.schema";
import ProductForm from "./product.form";

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

export const View = ({ product, closeModal = () => { } }) => {
  if (!product) return null;

  return (
    <DialogContent className="sm:max-w-2xl w-full">
      <DialogHeader>
        <DialogTitle className="text-xl">{product.name}</DialogTitle>
        <DialogDescription>
          Code: <span className="font-mono">{product.code}</span> · Slug:{" "}
          <span className="font-mono">{product.slug}</span>
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Images
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {(product.images || []).map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`${product.name} ${i + 1}`}
                className="size-full aspect-square rounded-md object-cover border"
              />
            ))}
          </div>

          {product.description && (
            <>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground pt-2">
                Description
              </h4>
              <p className="text-sm text-muted-foreground">
                {product.description}
              </p>
            </>
          )}
        </div>

        <div className="space-y-3 text-sm">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Details
          </h4>

          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-muted-foreground">Price</span>
            <span className="font-semibold">
              ₹{Number(product.price).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-muted-foreground">Stock</span>
            <span className="font-medium">{product.stock}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-muted-foreground">Weight</span>
            <span className="font-medium">{product.weight} kg</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-muted-foreground">Status</span>
            <Badge variant={product.active ? "default" : "outline"}>
              {product.active ? "Active" : "Inactive"}
            </Badge>
          </div>

          {product.deleted && (
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Deleted At</span>
              <span className="font-medium">
                {product.deletedAt
                  ? new Date(product.deletedAt).toLocaleDateString()
                  : "-"}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">Created</span>
            <span className="font-medium">
              {product.createdAt
                ? new Date(product.createdAt).toLocaleDateString()
                : "-"}
            </span>
          </div>
        </div>
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
    <DialogContent className="w-xl">
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
        <DialogTitle>Update Stock</DialogTitle>
        <DialogDescription>
          Update available stock for {product?.name}. Current stock:{" "}
          {product?.stock ?? 0}.
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form
          className="grid gap-4 py-2"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter stock" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          {ErrorAlert}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              type="submit"
              loading={loading}
              loadingText="Updating stock.."
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
    <DialogContent className="w-xl">
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