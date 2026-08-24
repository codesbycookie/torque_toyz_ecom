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
import { Input } from "@/components/ui/input";
import { useAsync } from "@/core/hooks/useAsync";
import { useClearError } from "@/core/hooks/useClearError";
import { useSubmit } from "@/core/hooks/useSubmit";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { locationCreateSchema, locationEditSchema, slabsFormSchema } from "./location.schema";
import LocationForm from "./location.form";

export const Create = ({ submitFn = () => {}, closeModal = () => {} } = {}) => {
  const form = useForm({
    resolver: zodResolver(locationCreateSchema),
    defaultValues: { state: "", code: "", deliverable: true },
  });

  const { run, loading, ErrorAlert, clearError } = useAsync(submitFn);
  useClearError(form, clearError);

  const onSubmit = useSubmit({ run, form, onSuccess: closeModal });

  return (
    <DialogContent className="w-xl">
      <DialogHeader>
        <DialogTitle>Create Location</DialogTitle>
        <DialogDescription>Enter details of the location</DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form className="grid gap-4 py-2" onSubmit={form.handleSubmit(onSubmit)}>
          <LocationForm form={form} />
          {ErrorAlert}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" loading={loading} loadingText="Saving the location..">
              Save
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export const Edit = ({ location, submitFn = () => {}, closeModal = () => {} } = {}) => {
  const form = useForm({
    resolver: zodResolver(locationEditSchema),
    defaultValues: {
      state: location?.state || "",
      code: location?.code || "",
      deliverable: location?.deliverable ?? true,
    },
  });

  const { run, loading, ErrorAlert, clearError } = useAsync(submitFn);
  useClearError(form, clearError);

  const onSubmit = useSubmit({ run, form, onSuccess: closeModal });

  return (
    <DialogContent className="w-xl">
      <DialogHeader>
        <DialogTitle>Edit Location</DialogTitle>
        <DialogDescription>Update details of {location?.state}</DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form className="grid gap-4 py-2" onSubmit={form.handleSubmit(onSubmit)}>
          <LocationForm form={form} />
          {ErrorAlert}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" loading={loading} loadingText="Saving the location..">
              Save
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export const Delete = ({ id, name, closeModal = () => {}, onConfirm = () => {} }) => (
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Are you sure you want to delete {name}?</DialogTitle>
      <DialogDescription>
        This will permanently remove the location and its tariff slabs. This cannot be undone.
      </DialogDescription>
    </DialogHeader>

    <DialogFooter>
      <DialogClose asChild>
        <Button variant="outline">Cancel</Button>
      </DialogClose>
      <Button
        variant="destructive"
        onClick={() => {
          onConfirm(id);
          closeModal();
        }}
      >
        Delete
      </Button>
    </DialogFooter>
  </DialogContent>
);

export const DeliverableStatus = ({ id, status, submitFn, closeModal, exported }) => {
  const actionLabel = status ? "Mark Non-Deliverable" : "Mark Deliverable";

  const onConfirm = async () => {
    await submitFn(id, { deliverable: !status });
    closeModal();
  };

  return (
    <DialogContent className="sm:max-w-[425px] pe-10">
      <DialogHeader>
        <DialogTitle>{actionLabel}</DialogTitle>
        <DialogDescription>
          {status ? (
            <>
              This will mark the location as <strong>non-deliverable</strong>.
              <br />
              Orders will no longer be shippable here.
            </>
          ) : (
            <>
              This will mark the location as <strong>deliverable</strong>.
              <br />
              Orders can be shipped here again.
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

export const ManageSlabs = ({ location, submitFn = () => {}, closeModal = () => {} }) => {
  const form = useForm({
    resolver: zodResolver(slabsFormSchema),
    defaultValues: {
      slabs: location?.slabs?.length
        ? location.slabs.map((s) => ({ min: s.min, max: s.max, rate: s.rate }))
        : [{ min: 0, max: 5, rate: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "slabs" });
  const { run, loading, ErrorAlert, clearError } = useAsync(submitFn);
  useClearError(form, clearError);

  const onSubmit = useSubmit({
    run,
    form,
    transform: (values) => ({ slabs: values.slabs }),
    onSuccess: closeModal,
  });

  return (
    <DialogContent className="w-xl">
      <DialogHeader>
        <DialogTitle>Manage Tariff Slabs</DialogTitle>
        <DialogDescription>Weight-based rates for {location?.state}</DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form className="grid gap-4 py-2" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end">
                <FormField
                  control={form.control}
                  name={`slabs.${index}.min`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`slabs.${index}.max`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`slabs.${index}.rate`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rate</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={fields.length === 1}
                  onClick={() => remove(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-fit"
            onClick={() => append({ min: 0, max: 0, rate: 0 })}
          >
            <Plus className="size-4" /> Add Slab
          </Button>

          {ErrorAlert}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" loading={loading} loadingText="Saving slabs..">
              Save Slabs
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};