import { ArrowRight, MapPin, Pencil, Scale } from "lucide-react";
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

export const Create = ({ submitFn = () => { }, closeModal = () => { } } = {}) => {
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

export const Edit = ({ location, submitFn = () => { }, closeModal = () => { } } = {}) => {
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

export const Delete = ({ id, name, closeModal = () => { }, submitFn = () => { } }) => (
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
          submitFn(id);
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

  const submit = async () => {
    await submitFn(id, { active: !status }); // 👈 was { deliverable: !status }
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
          onClick={submit}
          disabled={exported?.loading?.edit}
        >
          {exported?.loading?.edit ? "Updating..." : actionLabel}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

// Displays weight-based tariff slabs with modern styling and direct edit shortcuts.
export const ViewSlabs = ({ location, onEdit, closeModal = () => { } }) => {
  const slabs = location?.slabs || [];

  const handleEdit = () => {
    closeModal();
    onEdit?.(location);
  };

  return (
    <DialogContent className="sm:max-w-[520px] gap-5">
      <DialogHeader className="gap-1.5">
        <div className="flex items-center justify-between pr-6">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="size-5 text-primary" />
            Tariff Slabs
          </DialogTitle>
          <Badge variant={location?.deliverable ? "default" : "outline"}>
            {location?.deliverable ? "Deliverable" : "Non-deliverable"}
          </Badge>
        </div>
        <DialogDescription>
          Weight-based shipping tariff slabs configured for {location?.state || "this location"}.
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-3 gap-3 p-3 rounded-lg border bg-muted/40 text-xs">
        <div>
          <span className="text-muted-foreground block text-[11px] font-medium uppercase tracking-wider">
            State
          </span>
          <span className="font-semibold text-sm text-foreground truncate block">
            {location?.state || "—"}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[11px] font-medium uppercase tracking-wider">
            Code
          </span>
          <span className="font-mono font-medium text-sm text-foreground block">
            {location?.code || "—"}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[11px] font-medium uppercase tracking-wider">
            Total Slabs
          </span>
          <span className="font-semibold text-sm text-foreground block">
            {slabs.length} configured
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Weight Brackets & Rates
          </h4>
          <div className="flex items-center gap-2">
            {slabs.length > 0 && (
              <span className="text-[11px] text-muted-foreground">
                {slabs.length} tier{slabs.length !== 1 ? "s" : ""}
              </span>
            )}

          </div>
        </div>

        {slabs.length > 0 ? (
          <div className="max-h-[300px] overflow-y-auto rounded-lg border divide-y bg-card">
            {slabs.map((s, idx) => (
              <div
                key={s._id || idx}
                className="flex items-center justify-between px-3.5 py-2.5 hover:bg-muted/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="size-7 rounded-md bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs shrink-0">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-medium text-sm text-foreground">
                      <span>{s.min} kg</span>
                      <ArrowRight className="size-3 text-muted-foreground" />
                      <span>{s.max} kg</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground block">
                      Weight bracket
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-semibold text-sm text-foreground">
                      ₹{Number(s.rate).toFixed(2)}
                    </div>
                    <span className="text-[11px] text-muted-foreground block">
                      delivery rate
                    </span>
                  </div>


                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center rounded-lg border border-dashed bg-muted/20">
            <Scale className="size-10 text-muted-foreground/40 mb-2" />
            <p className="font-medium text-sm text-foreground">No tariff slabs configured</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              No weight-based delivery rates are set for this location.
            </p>
            {onEdit && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 gap-1.5 text-xs"
                onClick={handleEdit}
              >
                <Pencil className="size-3.5" />
                Add Tariff Slabs
              </Button>
            )}
          </div>
        )}
      </div>

      <DialogFooter className="">
        <DialogClose asChild>
          <Button variant="outline" onClick={closeModal}>
            Close
          </Button>
        </DialogClose>

      </DialogFooter>
    </DialogContent>
  );
};