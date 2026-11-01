import CopyButton from "@/components/ui/copy-button";
import { Ban, Calendar, Check, KeyRound, Mail, MapPin, Phone, Shield, User } from "lucide-react";
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

export const getAllUserAddresses = (user) => {
  if (!user) return [];
  const list = Array.isArray(user.addresses) ? [...user.addresses] : [];

  if (
    user.address &&
    (user.address.street || user.address.city || user.address.door || user.address.state)
  ) {
    const hasMatching = list.some(
      (a) =>
        a.door === user.address.door &&
        a.street === user.address.street &&
        a.city === user.address.city
    );
    if (!hasMatching) {
      list.unshift({
        ...user.address,
        label: "Primary Profile",
        name: user.name,
        phone: user.phone,
        is_default: true,
      });
    }
  }
  return list;
};

export const formatState = (state) => {
  if (!state) return "";
  if (typeof state === "object") {
    return state.state || state.name || state.code || "";
  }
  return typeof state === "string" ? state : "";
};

export const formatAddress = (address) => {
  if (!address || typeof address !== "object") return "";
  const stateStr = formatState(address.state);
  const parts = [
    address.door,
    address.street,
    address.city,
    stateStr,
  ].filter(Boolean);

  if (parts.length === 0) return "";
  const main = parts.join(", ");
  return address.pincode ? `${main} - ${address.pincode}` : main;
};

export const View = ({
  user,
  onResetPassword,
  onToggleActive,
  onViewAddresses,
  closeModal = () => {},
}) => {
  if (!user) return null;

  const primaryAddress =
    user.address ||
    (user.addresses && user.addresses.length > 0
      ? user.addresses.find((a) => a.is_default) || user.addresses[0]
      : null);
  const formattedAddress = formatAddress(primaryAddress);

  const addresses = user.addresses || [];

  const getInitials = (name = "") =>
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  const handleResetPassword = () => {
    closeModal();
    onResetPassword?.(user);
  };

  const handleToggleActive = () => {
    closeModal();
    onToggleActive?.(user);
  };

  return (
    <DialogContent className="sm:max-w-2xl w-full gap-5">
      {/* Header Profile Hero */}
      <DialogHeader className="gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-6">
          <div className="flex items-center gap-3">
            {user.profile?.url ? (
              <img
                src={user.profile.url}
                alt={user.name}
                className="size-13 rounded-full object-cover border-2 border-primary/20 shadow-xs"
              />
            ) : (
              <div className="size-13 rounded-full bg-primary/10 text-primary font-bold text-lg flex items-center justify-center border border-primary/20 shadow-xs">
                {getInitials(user.name)}
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle className="text-xl font-bold leading-tight">
                  {user.name}
                </DialogTitle>
                <Badge
                  variant={user.role === "admin" ? "default" : "secondary"}
                  className="capitalize text-[11px] font-medium"
                >
                  {user.role}
                </Badge>
                <Badge
                  variant={user.active ? "default" : "outline"}
                  className={user.active ? "bg-emerald-600 hover:bg-emerald-600/90 text-white text-[11px]" : "text-[11px]"}
                >
                  {user.active ? "Active" : "Disabled"}
                </Badge>
                {user.deleted && (
                  <Badge variant="destructive" className="text-[11px]">
                    Deleted
                  </Badge>
                )}
              </div>
              <DialogDescription className="mt-0.5 text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                <span>@{user.username || user.login_id}</span>
                <span>•</span>
                <span>
                  Login ID: <span className="font-mono text-foreground font-medium">{user.login_id}</span>
                </span>
              </DialogDescription>
            </div>
          </div>
        </div>
      </DialogHeader>

      {/* Overview Stat Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg border bg-muted/40 text-xs">
        <div>
          <span className="text-muted-foreground block text-[10px] font-medium uppercase tracking-wider">
            Role
          </span>
          <span className="font-semibold text-sm capitalize text-foreground">
            {user.role || "User"}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[10px] font-medium uppercase tracking-wider">
            Status
          </span>
          <span className="font-semibold text-sm text-foreground">
            {user.active ? "Active" : "Disabled"}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[10px] font-medium uppercase tracking-wider">
            Joined On
          </span>
          <span className="font-medium text-sm text-foreground">
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[10px] font-medium uppercase tracking-wider">
            Terms Accepted
          </span>
          <span className="font-medium text-sm text-foreground">
            {user.accepted_terms_at
              ? new Date(user.accepted_terms_at).toLocaleDateString()
              : "Pending"}
          </span>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contact Information Card */}
        <div className="rounded-lg border p-3.5 space-y-3 bg-card">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider border-b pb-2">
            <Mail className="size-4" />
            <span>Contact Information</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-muted/50">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Mail className="size-3.5 text-muted-foreground/70" /> Email
              </span>
              <span className="font-medium text-foreground truncate max-w-[190px]">
                {user.email || "—"}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-muted/50">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Phone className="size-3.5 text-muted-foreground/70" /> Phone
              </span>
              <span className="font-medium text-foreground">
                {user.phone || "—"}
              </span>
            </div>

            <div className="flex justify-between items-start py-1">
              <span className="text-muted-foreground flex items-center gap-1.5 shrink-0">
                <MapPin className="size-3.5 text-muted-foreground/70" /> Primary Address
              </span>
              <span className="font-medium text-right text-foreground max-w-[180px] leading-relaxed">
                {formattedAddress ? (
                  formattedAddress
                ) : (
                  <span className="text-muted-foreground italic">No address on file</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Security & Account Card */}
        <div className="rounded-lg border p-3.5 space-y-3 bg-card">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider border-b pb-2">
            <Shield className="size-4" />
            <span>Account & Security</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-muted/50">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <KeyRound className="size-3.5 text-muted-foreground/70" /> Login ID
              </span>
              <span className="font-mono font-medium text-foreground">
                {user.login_id}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-muted/50">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <User className="size-3.5 text-muted-foreground/70" /> Username
              </span>
              <span className="font-medium text-foreground">
                {user.username || user.login_id}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-muted/50">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Calendar className="size-3.5 text-muted-foreground/70" /> Account Created
              </span>
              <span className="font-medium text-foreground">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
              </span>
            </div>

            {user.deleted && (
              <div className="flex justify-between items-center py-1 text-destructive">
                <span className="flex items-center gap-1.5">
                  <Ban className="size-3.5" /> Deleted Date
                </span>
                <span className="font-medium">
                  {user.deletedAt ? new Date(user.deletedAt).toLocaleDateString() : "—"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Saved Addresses (if available) */}
      {addresses.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Saved Addresses ({addresses.length})
            </h4>
            {onViewAddresses && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 text-[11px] text-primary hover:text-primary gap-1 px-1.5"
                onClick={() => {
                  closeModal();
                  onViewAddresses?.(user);
                }}
              >
                <MapPin className="size-3" />
                View Addresses
              </Button>
            )}
          </div>
          <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
            {addresses.map((addr, idx) => (
              <div
                key={addr._id || idx}
                className="p-2.5 rounded-lg border bg-muted/20 flex items-start justify-between text-xs"
              >
                <div>
                  <div className="font-medium flex items-center gap-2">
                    <span>{addr.label || "Address #" + (idx + 1)}</span>
                    {addr.is_default && (
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mt-0.5">
                    {formatAddress(addr) || "—"}
                  </p>
                </div>
                {addr.phone && (
                  <span className="text-muted-foreground text-[11px]">{addr.phone}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer with actions */}
      <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-2">
        <DialogClose asChild>
          <Button variant="outline" onClick={closeModal}>
            Close
          </Button>
        </DialogClose>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onToggleActive && (
            <Button
              type="button"
              variant={user.active ? "outline" : "default"}
              size="sm"
              onClick={handleToggleActive}
              className="gap-1.5 text-xs flex-1 sm:flex-initial"
            >
              {user.active ? (
                <>
                  <Ban className="size-3.5 text-amber-500" />
                  Disable User
                </>
              ) : (
                <>
                  <Check className="size-3.5 text-emerald-500" />
                  Enable User
                </>
              )}
            </Button>
          )}

          {onResetPassword && (
            <Button
              type="button"
              size="sm"
              onClick={handleResetPassword}
              className="gap-1.5 text-xs flex-1 sm:flex-initial"
            >
              <KeyRound className="size-3.5" />
              Reset Password
            </Button>
          )}
        </div>
      </DialogFooter>
    </DialogContent>
  );
};


// Dedicated Modal to view all addresses of a user
export const ViewAddresses = ({ user, closeModal = () => {} }) => {
  if (!user) return null;
  const addresses = getAllUserAddresses(user);

  return (
    <DialogContent className="sm:max-w-[550px] gap-5">
      <DialogHeader className="gap-1.5">
        <div className="flex items-center justify-between pr-6">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="size-5 text-primary" />
            User Addresses
          </DialogTitle>
          <Badge variant="outline" className="text-xs">
            {addresses.length} address{addresses.length !== 1 ? "es" : ""}
          </Badge>
        </div>
        <DialogDescription>
          All saved shipping destinations for{" "}
          <span className="font-semibold text-foreground">{user.name}</span> ({user.login_id})
        </DialogDescription>
      </DialogHeader>

      {/* User Meta Card */}
      <div className="grid grid-cols-3 gap-3 p-3 rounded-lg border bg-muted/40 text-xs">
        <div>
          <span className="text-muted-foreground block text-[11px] font-medium uppercase tracking-wider">
            Customer
          </span>
          <span className="font-semibold text-sm text-foreground truncate block">
            {user.name}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[11px] font-medium uppercase tracking-wider">
            Phone
          </span>
          <span className="font-medium text-sm text-foreground truncate block">
            {user.phone || "—"}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[11px] font-medium uppercase tracking-wider">
            Total Saved
          </span>
          <span className="font-semibold text-sm text-foreground block">
            {addresses.length} configured
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Saved Address Cards
          </h4>
        </div>

        {addresses.length > 0 ? (
          <div className="max-h-[340px] overflow-y-auto rounded-lg border divide-y bg-card">
            {addresses.map((addr, idx) => {
              const formatted = formatAddress(addr);
              const stateStr = formatState(addr.state);
              return (
                <div
                  key={addr._id || idx}
                  className="p-3.5 hover:bg-muted/30 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded-md bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs shrink-0">
                        #{idx + 1}
                      </div>
                      <span className="font-bold text-sm text-foreground">
                        {addr.label || "Address #" + (idx + 1)}
                      </span>
                      {addr.is_default && (
                        <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-semibold py-0 px-1.5">
                          Default
                        </Badge>
                      )}
                    </div>

                    {addr.phone && (
                      <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                        <Phone className="size-3 text-muted-foreground/70" />
                        {addr.phone}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1 pl-8">
                    {addr.name && addr.name !== user.name && (
                      <p className="font-medium text-foreground">
                        Recipient: {addr.name}
                      </p>
                    )}
                    <p className="leading-relaxed text-foreground">
                      {formatted || "—"}
                    </p>
                    {stateStr && (
                      <div className="pt-0.5">
                        <Badge variant="outline" className="text-[10px] py-0">
                          State: {stateStr}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center rounded-lg border border-dashed bg-muted/20">
            <MapPin className="size-10 text-muted-foreground/40 mb-2" />
            <p className="font-medium text-sm text-foreground">No saved addresses</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              This user has not configured any shipping destinations yet.
            </p>
          </div>
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
