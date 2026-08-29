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
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAsync } from "@/core/hooks/useAsync";
import { useClearError } from "@/core/hooks/useClearError";
import { useSubmit } from "@/core/hooks/useSubmit";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "./user.schema";
import { Badge } from "@/components/ui/badge"; // add to existing imports

export const View = ({ user, closeModal = () => {} }) => {
  if (!user) return null;

  const address = user.address || {};
  const fullAddress = [
    address.door,
    address.street,
    address.city,
    address.state,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <DialogContent className="sm:max-w-2xl w-full">
      <DialogHeader>
        <DialogTitle className="text-xl">{user.name}</DialogTitle>
        <DialogDescription>
          Login ID: <span className="font-mono">{user.login_id}</span>
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
        <div className="space-y-3 text-sm">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Contact
          </h4>

          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{user.email}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-muted-foreground">Phone</span>
            <span className="font-medium">{user.phone}</span>
          </div>

          <div className="flex justify-between items-start py-2">
            <span className="text-muted-foreground">Address</span>
            <span className="font-medium text-right max-w-[220px]">
              {fullAddress || "-"}
              {address.pincode ? ` - ${address.pincode}` : ""}
            </span>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Account
          </h4>

          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-muted-foreground">Role</span>
            <Badge variant={user.role === "admin" ? "default" : "outline"}>
              {user.role}
            </Badge>
          </div>

          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-muted-foreground">Status</span>
            <Badge variant={user.active ? "default" : "outline"}>
              {user.active ? "Active" : "Inactive"}
            </Badge>
          </div>

          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-muted-foreground">Accepted Terms</span>
            <span className="font-medium">
              {user.accepted_terms_at
                ? new Date(user.accepted_terms_at).toLocaleDateString()
                : "Not accepted"}
            </span>
          </div>

          {user.deleted && (
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Deleted At</span>
              <span className="font-medium">
                {user.deletedAt
                  ? new Date(user.deletedAt).toLocaleDateString()
                  : "-"}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">Joined</span>
            <span className="font-medium">
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
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
export const ResetPassword = ({
  user,
  submitFn = () => {},
  closeModal = () => {},
} = {}) => {
  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
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
        <DialogTitle>Reset Password</DialogTitle>
        <DialogDescription>
          Set a new password for {user?.name}.
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form
          className="grid gap-4 py-2"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          {ErrorAlert}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" loading={loading} loadingText="Resetting..">
              Reset Password
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export const DisableUser = ({
  id,
  name,
  status,
  submitFn = () => {},
  closeModal = () => {},
}) => {
  const actionLabel = status ? "Disable" : "Enable";

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>
          {actionLabel} {name}?
        </DialogTitle>
        <DialogDescription>
          {status ? (
            <>
              This will <strong>disable</strong> the user. They will no longer
              be able to log in.
            </>
          ) : (
            <>
              This will <strong>enable</strong> the user, restoring their
              access.
            </>
          )}
        </DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button
          variant={status ? "destructive" : "default"}
          onClick={() => {
            submitFn(id, { active: !status });
            closeModal();
          }}
        >
          {actionLabel}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

// Soft delete
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
        This will be stored as deleted. This user record can be retrieved by
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

// Permanent erase
export const Erase = ({
  id,
  name,
  closeModal = () => {},
  submitFn = () => {},
}) => (
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Permanently erase {name}?</DialogTitle>
      <DialogDescription>
        This action cannot be undone. The user record will be permanently
        removed.
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
        Erase Permanently
      </Button>
    </DialogFooter>
  </DialogContent>
);

// Retrieve soft-deleted user
export const Retrieve = ({
  id,
  name,
  closeModal = () => {},
  submitFn = () => {},
}) => (
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Retrieve {name}?</DialogTitle>
      <DialogDescription>
        This will restore the user and mark them as active again.
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
      >
        Retrieve
      </Button>
    </DialogFooter>
  </DialogContent>
);
