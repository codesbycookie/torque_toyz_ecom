import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useAsync } from "@/core/hooks/useAsync";
import { useClearError } from "@/core/hooks/useClearError";
import { useSubmit } from "@/core/hooks/useSubmit";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categoryCreateSchema, categoryEditSchema } from "./category.schema";
import CategoryForm from "./category.form";

export const Create = ({ submitFn = () => {}, closeModal = () => {} } = {}) => {
  const form = useForm({
    resolver: zodResolver(categoryCreateSchema),
    defaultValues: { name: "", description: "", active: true },
  });

  const { run, loading, ErrorAlert, clearError } = useAsync(submitFn);
  useClearError(form, clearError);
  const onSubmit = useSubmit({ run, form, onSuccess: closeModal });

  return (
    <DialogContent className="w-xl">
      <DialogHeader>
        <DialogTitle>Create Category</DialogTitle>
        <DialogDescription>Enter details of the category</DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form className="grid gap-4 py-2" onSubmit={form.handleSubmit(onSubmit)}>
          <CategoryForm form={form} />
          {ErrorAlert}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" loading={loading} loadingText="Saving the category..">
              Save
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export const Edit = ({ category, submitFn = () => {}, closeModal = () => {} } = {}) => {
  const form = useForm({
    resolver: zodResolver(categoryEditSchema),
    defaultValues: {
      name: category?.name || "",
      description: category?.description || "",
      active: category?.active ?? true,
    },
  });

  const { run, loading, ErrorAlert, clearError } = useAsync(submitFn);
  useClearError(form, clearError);
  const onSubmit = useSubmit({ run, form, onSuccess: closeModal });

  return (
    <DialogContent className="w-xl">
      <DialogHeader>
        <DialogTitle>Edit Category</DialogTitle>
        <DialogDescription>Update details of {category?.name}</DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form className="grid gap-4 py-2" onSubmit={form.handleSubmit(onSubmit)}>
          <CategoryForm form={form} />
          {ErrorAlert}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" loading={loading} loadingText="Saving the category..">
              Save
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export const Delete = ({ id, name, closeModal = () => {}, submitFn = () => {} }) => (
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Are you sure you want to delete {name}?</DialogTitle>
      <DialogDescription>
        This will be stored as deleted, this category record can be retrieved by Admin.
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
        <strong>Note:</strong> This operation is Permenent Delete. All the data related to this category
        will be lost.
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
        <strong>Note:</strong> this operation is retrieve All the data related to this category will be
        back.
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

export const View = ({ category, closeModal = () => {} }) => {
  if (!category) return null;

  return (
    <DialogContent className="sm:max-w-lg w-full">
      <DialogHeader>
        <DialogTitle className="text-xl">{category.name}</DialogTitle>
        <DialogDescription>
          Slug: <span className="font-mono">{category.slug}</span>
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3 text-sm py-2">
        {category.description && (
          <>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Description
            </h4>
            <p className="text-muted-foreground">{category.description}</p>
          </>
        )}

        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-muted-foreground">Status</span>
          <Badge variant={category.active ? "default" : "outline"}>
            {category.active ? "Active" : "Inactive"}
          </Badge>
        </div>

        {category.deleted && (
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-muted-foreground">Deleted At</span>
            <span className="font-medium">
              {category.deletedAt ? new Date(category.deletedAt).toLocaleDateString() : "-"}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center py-2">
          <span className="text-muted-foreground">Created</span>
          <span className="font-medium">
            {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : "-"}
          </span>
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

export const ActiveStatus = ({ id, status, submitFn, closeModal, exported }) => {
  const actionLabel = status ? "Deactivate" : "Activate";

  const onConfirm = async () => {
    await submitFn(id, { active: !status });
    closeModal();
  };

  return (
    <DialogContent className="sm:max-w-[425px] pe-10">
      <DialogHeader>
        <DialogTitle>{actionLabel} Category</DialogTitle>

        <DialogDescription>
          {status ? (
            <>
              This will <strong>deactivate</strong> the Category.
              <br />
              It will no longer be usable for new products.
            </>
          ) : (
            <>
              This will <strong>activate</strong> the Category.
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