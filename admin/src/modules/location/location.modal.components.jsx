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
import { Form } from "@/components/ui/form";
import { useAsync } from "@/core/hooks/useAsync";
import { useClearError } from "@/core/hooks/useClearError";
import { useSubmit } from "@/core/hooks/useSubmit";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { locationCreateSchema, locationEditSchema } from "./location.schema";
import LocationForm from "./location.form";

export const Create = ({ submitFn = () => {}, closeModal = () => {} } = {}) => {
  const form = useForm({
    resolver: zodResolver(locationCreateSchema),
    defaultValues: {
      state: "",
      code: "",
      deliverable: true,
      slabs: [{ min: 0, max: 5, rate: 0 }],
    },
  });

  const { run, loading, ErrorAlert, clearError } = useAsync(submitFn);
  useClearError(form, clearError);

  const onSubmit = useSubmit({ run, form, onSuccess: closeModal });

  return (
    <DialogContent className="w-xl">
      <DialogHeader>
        <DialogTitle>Create Location</DialogTitle>
        <DialogDescription>Enter details and tariff slabs for the location</DialogDescription>
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
      slabs: location?.slabs?.length
        ? location.slabs.map((s) => ({ min: s.min, max: s.max, rate: s.rate }))
        : [{ min: 0, max: 5, rate: 0 }],
    },
  });

  const { run, loading, ErrorAlert, clearError } = useAsync(submitFn);
  useClearError(form, clearError);

  const onSubmit = useSubmit({ run, form, onSuccess: closeModal });

  return (
    <DialogContent className="w-xl">
      <DialogHeader>
        <DialogTitle>Edit Location</DialogTitle>
        <DialogDescription>Update details and tariff slabs for {location?.state}</DialogDescription>
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

// Read-only. No form, no submit — just displays the slabs currently saved on the location.
export const ViewSlabs = ({ location, closeModal = () => {} }) => (
  <DialogContent className="sm:max-w-[500px]">
    <DialogHeader>
      <DialogTitle>Tariff Slabs</DialogTitle>
      <DialogDescription>Weight-based rates for {location?.state}</DialogDescription>
    </DialogHeader>

    <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
      {location?.slabs?.length ? (
        <div className="rounded-md border divide-y">
          <div className="grid grid-cols-3 px-3 py-2 text-xs font-medium text-muted-foreground">
            <span>Min (kg)</span>
            <span>Max (kg)</span>
            <span>Rate</span>
          </div>
          {location.slabs.map((s) => (
            <div key={s._id} className="grid grid-cols-3 px-3 py-2 text-sm">
              <span>{s.min}</span>
              <span>{s.max}</span>
              <span>
                <Badge variant="outline">₹{s.rate}</Badge>
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No tariff slabs configured.</p>
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