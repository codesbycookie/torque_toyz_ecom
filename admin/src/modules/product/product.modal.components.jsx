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
import { FormControl, FormField, FormItem, FormLabel,Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAsync } from "@/core/hooks/useAsync";
import { useClearError } from "@/core/hooks/useClearError";
import { useSubmit } from "@/core/hooks/useSubmit";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  productCreateSchema,
  productEditSchema,
  productStockSchema,
} from "./product.schema";
import ProductForm from "./product.form";


export const View = ({ product, closeModal = () => {} }) => {
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
              <p className="text-sm text-muted-foreground">{product.description}</p>
            </>
          )}
        </div>

        <div className="space-y-3 text-sm">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Details
          </h4>

          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-muted-foreground">Price</span>
            <span className="font-semibold">₹{Number(product.price).toFixed(2)}</span>
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
                {product.deletedAt ? new Date(product.deletedAt).toLocaleDateString() : "-"}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">Created</span>
            <span className="font-medium">
              {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : "-"}
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
export const Create = ({ submitFn = () => {}, closeModal = () => {} } = {}) => {
  const form = useForm({
    resolver: zodResolver(productCreateSchema),
    defaultValues: {
      name: "",
      description: "",
      stock: 0,
      active: true,
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
          <ProductForm form={form} />
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
  submitFn = () => {},
  closeModal = () => {},
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
  submitFn = () => {},
  closeModal = () => {},
} = {}) => {
  const form = useForm({
    resolver: zodResolver(productEditSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      stock: product?.stock ?? 0,
      price: product?.price ?? 0,
      weight: product?.weight ?? 0,
      active: product?.active ?? true,
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
          <ProductForm form={form} />
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
  closeModal = () => {},
  submitFn = () => {},
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
