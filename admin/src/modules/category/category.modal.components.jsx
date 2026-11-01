import formatdate from "@/core/utils/formatdate.util";
import CopyButton from "@/components/ui/copy-button";
import { Calendar, Clock, FileText, FolderTree, Layers, Pencil, Power, Tag } from "lucide-react";
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

export const View = ({
  category,
  onEdit,
  onToggleActive,
  closeModal = () => {},
}) => {
  if (!category) return null;

  const handleEdit = () => {
    closeModal();
    onEdit?.(category);
  };

  const handleToggle = () => {
    closeModal();
    onToggleActive?.(category._id, category.active);
  };

  return (
    <DialogContent className="sm:max-w-2xl w-full max-h-[88vh] overflow-y-auto p-6 gap-6">
      {/* Header */}
      <DialogHeader className="gap-2 border-b pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-6">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
              <Layers className="size-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle className="text-xl font-bold tracking-tight">
                  {category.name}
                </DialogTitle>
                <Badge
                  className={
                    category.active
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs font-semibold"
                      : "bg-muted text-muted-foreground text-xs"
                  }
                >
                  {category.active ? "Active" : "Inactive"}
                </Badge>
                {category.deleted && (
                  <Badge variant="destructive" className="text-xs">
                    Deleted
                  </Badge>
                )}
              </div>
              <DialogDescription className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono flex items-center gap-1">
                  <span>/{category.slug}</span>
                  <CopyButton
                    text={category.slug}
                    label="Slug"
                    className="size-4"
                    iconClassName="size-3"
                  />
                </span>
                <span>•</span>
                <span className="font-mono flex items-center gap-1">
                  <span>ID: {category._id}</span>
                  <CopyButton
                    text={category._id}
                    label="Category ID"
                    className="size-4"
                    iconClassName="size-3"
                  />
                </span>
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="gap-1.5 text-xs font-medium"
              >
                <Pencil className="size-3.5" />
                Edit Category
              </Button>
            )}
          </div>
        </div>
      </DialogHeader>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border bg-muted/30 p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Power className="size-3.5 text-primary" />
            <span>Status</span>
          </div>
          <div className="text-sm font-semibold capitalize text-foreground flex items-center gap-1">
            {category.active ? "Active" : "Inactive"}
          </div>
        </div>

        <div className="rounded-xl border bg-muted/30 p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Tag className="size-3.5 text-primary" />
            <span>URL Slug</span>
          </div>
          <div className="text-xs font-mono font-semibold text-foreground truncate flex items-center gap-1">
            <span className="truncate">{category.slug}</span>
            <CopyButton
              text={category.slug}
              label="Slug"
              className="size-4"
              iconClassName="size-3"
            />
          </div>
        </div>

        <div className="rounded-xl border bg-muted/30 p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Calendar className="size-3.5 text-primary" />
            <span>Created</span>
          </div>
          <div className="text-xs font-medium text-foreground">
            {category.createdAt ? formatdate(category.createdAt) : "—"}
          </div>
        </div>

        <div className="rounded-xl border bg-muted/30 p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Clock className="size-3.5 text-primary" />
            <span>Updated</span>
          </div>
          <div className="text-xs font-medium text-foreground">
            {category.updatedAt ? formatdate(category.updatedAt) : "—"}
          </div>
        </div>
      </div>

      {/* Description & Details Cards - col-6 col-6 in 1 row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Description Card */}
        <div className="rounded-xl border bg-card p-4 space-y-3 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b pb-2.5">
              <FileText className="size-3.5 text-primary" />
              Category Description
            </h4>
            <div className="pt-2 text-sm text-foreground/90 leading-relaxed">
              {category.description ? (
                <p>{category.description}</p>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No description provided for this category.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* System & Metadata Card */}
        <div className="rounded-xl border bg-card p-4 space-y-3 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b pb-2.5">
              <FolderTree className="size-3.5 text-primary" />
              Metadata & Identifiers
            </h4>

            <div className="space-y-2.5 text-xs pt-2">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Database ID</span>
                <div className="flex items-center gap-1 font-mono text-[11px] text-foreground">
                  <span className="truncate max-w-[140px]">{category._id}</span>
                  <CopyButton
                    text={category._id}
                    label="Database ID"
                    className="size-4"
                    iconClassName="size-3"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-muted-foreground border-t pt-2">
                <span>URL Path</span>
                <span className="font-mono text-[11px] text-foreground">
                  /category/{category.slug}
                </span>
              </div>

              <div className="flex justify-between items-center text-muted-foreground border-t pt-2">
                <span>Catalog Visibility</span>
                <span className="font-medium text-foreground">
                  {category.active ? "Publicly Visible" : "Hidden from Storefront"}
                </span>
              </div>

              {category.deleted && (
                <div className="flex justify-between items-center text-destructive border-t pt-2">
                  <span>Deleted At</span>
                  <span className="font-medium">
                    {category.deletedAt ? formatdate(category.deletedAt) : "—"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <DialogFooter className="mt-2 pt-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-auto flex items-center gap-2">
          {onEdit && (
            <Button
              variant="default"
              size="default"
              onClick={handleEdit}
              className="gap-2 w-full sm:w-auto"
            >
              <Pencil className="size-4" />
              Edit Category
            </Button>
          )}
          {onToggleActive && (
            <Button
              variant={category.active ? "outline" : "secondary"}
              size="default"
              onClick={handleToggle}
              className="gap-2 w-full sm:w-auto"
            >
              <Power className="size-4" />
              {category.active ? "Deactivate" : "Activate"}
            </Button>
          )}
        </div>

        <DialogClose asChild>
          <Button variant="outline" size="default" onClick={closeModal} className="w-full sm:w-auto">
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