'use client';

import { useState, useEffect, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Truck,
  Phone,
  Mail,
  Building,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Edit3,
  ArrowRight,
  Plus,
  Trash2,
  Check,
  Ban,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * Standard list of all 36 Indian States & Union Territories
 */
export const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

/**
 * Dialog Popup for Adding or Editing an Address
 */
export function AddressModalDialog({
  isOpen,
  onOpenChange,
  onSaveAddress,
  locations = [],
  initialData = null,
}) {
  // Resolve all 36 Indian states cleanly mapped to backend locations where available
  const availableStates = useMemo(() => {
    return INDIAN_STATES.map((stateName) => {
      const locMatch =
        locations.find(
          (l) => l.state?.trim().toLowerCase() === stateName.toLowerCase()
        ) ||
        locations.find((l) =>
          l.state?.trim().toLowerCase().startsWith(stateName.toLowerCase())
        );

      return {
        name: stateName,
        locationId: locMatch ? String(locMatch._id) : stateName,
        deliverable: locMatch ? locMatch.deliverable : true,
      };
    });
  }, [locations]);

  const getInitialForm = (data) => {
    const rawName = data?.name || data?.full_name || "";
    const nameParts = rawName.trim().split(" ");
    const firstName = data?.firstName || (nameParts.length > 0 ? nameParts[0] : "");
    const lastName = data?.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "");

    let stateVal = "";
    if (data?.state) {
      const raw = typeof data.state === "object" ? String(data.state._id || "") : String(data.state);
      const matched = availableStates.find(
        (s) => String(s.locationId) === raw || s.name.toLowerCase() === raw.toLowerCase()
      );
      stateVal = matched ? matched.locationId : raw;
    } else if (data?.stateName) {
      const matched = availableStates.find(
        (s) => s.name.toLowerCase() === data.stateName.toLowerCase()
      );
      stateVal = matched ? matched.locationId : "";
    }

    const zipVal = data?.zip ?? data?.pincode ?? "";

    return {
      label: data?.label || "Home",
      firstName: firstName || "",
      lastName: lastName || "",
      email: data?.email || "",
      phone: data?.phone || "",
      door: data?.door || "",
      street: data?.street || "",
      city: data?.city || "",
      state: stateVal || "",
      zip: zipVal ? String(zipVal) : "",
      isDefault: Boolean(data?.isDefault ?? data?.is_default ?? false),
    };
  };

  const [modalForm, setModalForm] = useState(() => getInitialForm(initialData));

  // Synchronize form values whenever modal opens or editing address changes
  useEffect(() => {
    if (isOpen) {
      setModalForm(getInitialForm(initialData));
    }
  }, [isOpen, initialData, availableStates]);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setModalForm((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleStateChange = (val) => {
    setModalForm((prev) => ({ ...prev, state: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !modalForm.firstName.trim() ||
      !modalForm.lastName.trim() ||
      !modalForm.street.trim() ||
      !modalForm.city.trim() ||
      !modalForm.state ||
      !modalForm.zip.trim()
    ) {
      toast.error("Please fill in all required address fields.");
      return;
    }

    if (!/^\d{6}$/.test(modalForm.zip.trim())) {
      toast.error("PIN Code must be exactly 6 digits.");
      return;
    }

    const existingId = initialData?.id || initialData?._id;
    const assignedId = existingId || `addr_${Date.now()}`;
    const fullName = `${modalForm.firstName.trim()} ${modalForm.lastName.trim()}`.trim();

    const matchedState = availableStates.find(
      (s) => String(s.locationId) === String(modalForm.state) || s.name.toLowerCase() === modalForm.state.toLowerCase()
    );
    const resolvedStateId = matchedState?.locationId || modalForm.state;
    const resolvedStateName = matchedState?.name || "";

    const payload = {
      id: assignedId,
      _id: assignedId,
      label: modalForm.label.trim() || "Home",
      firstName: modalForm.firstName.trim(),
      lastName: modalForm.lastName.trim(),
      name: fullName,
      full_name: fullName,
      email: modalForm.email.trim(),
      phone: modalForm.phone.trim(),
      door: modalForm.door.trim(),
      street: modalForm.street.trim(),
      city: modalForm.city.trim(),
      state: resolvedStateId,
      stateName: resolvedStateName,
      zip: modalForm.zip.trim(),
      pincode: Number(modalForm.zip.trim()),
      isDefault: modalForm.isDefault,
      is_default: modalForm.isDefault,
    };

    onSaveAddress(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-xl w-[95vw] sm:w-full rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => {
          // Prevent accidental dialog closing / collapsing when interacting with select dropdowns or clicking outside
          e.preventDefault();
        }}
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader className="pb-2 border-b border-border/70">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <MapPin className="size-4.5" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold">
                {initialData ? "Edit Shipping Address" : "Add New Shipping Address"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Enter the delivery address and recipient details
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Label selector */}
          <div className="space-y-1.5">
            <Label htmlFor="label" className="text-xs font-medium">
              Address Label
            </Label>
            <div className="flex items-center gap-2 flex-wrap">
              {["Home", "Office", "Other"].map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => setModalForm((prev) => ({ ...prev, label: tag }))}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer",
                    modalForm.label === tag
                      ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                      : "border-border/80 bg-muted/30 text-muted-foreground hover:border-primary/40"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Recipient names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="firstName" className="text-xs font-medium">
                First Name <span className="text-primary font-bold">*</span>
              </Label>
              <Input
                id="firstName"
                value={modalForm.firstName}
                onChange={handleChange}
                required
                placeholder="e.g. Bruce"
                className="h-9.5 text-xs rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName" className="text-xs font-medium">
                Last Name <span className="text-primary font-bold">*</span>
              </Label>
              <Input
                id="lastName"
                value={modalForm.lastName}
                onChange={handleChange}
                required
                placeholder="e.g. Wayne"
                className="h-9.5 text-xs rounded-xl"
              />
            </div>
          </div>

          {/* Contact email & phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={modalForm.email}
                  onChange={handleChange}
                  placeholder="bruce@waynecorp.com"
                  className="h-9.5 text-xs rounded-xl pl-8"
                />
                <Mail className="size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-medium">
                Phone Number <span className="text-primary font-bold">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="phone"
                  type="tel"
                  value={modalForm.phone}
                  onChange={handleChange}
                  required
                  placeholder="9876543210"
                  className="h-9.5 text-xs rounded-xl pl-8"
                />
                <Phone className="size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Door & Street */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="space-y-1.5 sm:col-span-1">
              <Label htmlFor="door" className="text-xs font-medium">
                Flat / Door No.
              </Label>
              <div className="relative">
                <Input
                  id="door"
                  value={modalForm.door}
                  onChange={handleChange}
                  placeholder="e.g. Flat 101"
                  className="h-9.5 text-xs rounded-xl pl-8"
                />
                <Building className="size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="street" className="text-xs font-medium">
                Street / Area / Landmark <span className="text-primary font-bold">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="street"
                  value={modalForm.street}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 100 Feet Road, Indiranagar"
                  className="h-9.5 text-xs rounded-xl pl-8"
                />
                <Navigation className="size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* City, State, PIN Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="city" className="text-xs font-medium">
                City / Town <span className="text-primary font-bold">*</span>
              </Label>
              <Input
                id="city"
                value={modalForm.city}
                onChange={handleChange}
                required
                placeholder="e.g. Bengaluru"
                className="h-9.5 text-xs rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="modal-state" className="text-xs font-medium">
                State / Region <span className="text-primary font-bold">*</span>
              </Label>
              <Select value={modalForm.state} onValueChange={handleStateChange}>
                <SelectTrigger id="modal-state" className="h-9.5 text-xs rounded-xl">
                  <SelectValue placeholder="Select State / UT" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border bg-popover shadow-lg max-h-56">
                  {availableStates.map((st) => (
                    <SelectItem key={st.name} value={st.locationId} className="text-xs py-1.5 cursor-pointer">
                      {st.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="zip" className="text-xs font-medium">
                PIN Code <span className="text-primary font-bold">*</span>
              </Label>
              <Input
                id="zip"
                value={modalForm.zip}
                onChange={handleChange}
                maxLength={6}
                required
                placeholder="560038"
                className="h-9.5 text-xs font-mono rounded-xl"
              />
            </div>
          </div>

          {/* Checkbox: Set as default */}
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground select-none pt-1">
            <input
              type="checkbox"
              id="isDefault"
              checked={modalForm.isDefault}
              onChange={handleChange}
              className="size-4 rounded border-border accent-primary cursor-pointer"
            />
            <span>Set as default shipping address</span>
          </label>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="rounded-xl text-xs h-9 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-9 gap-1.5 cursor-pointer"
            >
              <Check className="size-3.5" />
              <span>{initialData ? "Update Address" : "Save Address"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Single Selectable Address Card
 */
export function SavedAddressCard({
  address,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  locations = [],
  showDeliverability = false,
}) {
  const loc =
    locations.find((l) => String(l._id) === String(address?.state)) ||
    locations.find(
      (l) =>
        l.state?.trim().toLowerCase() ===
        (address?.stateName || address?.state || "").trim().toLowerCase()
    );
  const stateLabel = address?.stateName || loc?.state || "State";
  const isDeliverable = loc ? loc.deliverable : true;

  const fullName = address?.name || [address?.firstName, address?.lastName].filter(Boolean).join(" ") || "Saved Contact";

  return (
    <div
      onClick={() => onSelect(address)}
      className={cn(
        "relative rounded-xl border p-4.5 transition-all cursor-pointer flex flex-col justify-between gap-3 text-left group",
        isSelected
          ? showDeliverability && !isDeliverable
            ? "border-destructive bg-destructive/5 ring-1.5 ring-destructive shadow-xs"
            : "border-primary bg-primary/5 ring-1.5 ring-primary shadow-xs"
          : "border-border/80 bg-card hover:border-primary/50 hover:bg-muted/30"
      )}
    >
      <div className="space-y-2.5">
        {/* Top Header: Radio mark, Tag, and Optional Deliverability Pill (checkout only) */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "size-4.5 rounded-full border flex items-center justify-center transition-all",
                isSelected
                  ? showDeliverability && !isDeliverable
                    ? "border-destructive bg-destructive text-destructive-foreground"
                    : "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground/60 group-hover:border-primary"
              )}
            >
              {isSelected && <Check className="size-3 stroke-[3]" />}
            </div>

            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5",
                isSelected ? "border-primary/40 text-primary" : "text-muted-foreground"
              )}
            >
              {address?.label || "Home"}
            </Badge>

            {address?.isDefault && (
              <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-semibold py-0 px-1.5">
                Default
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {showDeliverability && (
              isDeliverable ? (
                <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-semibold gap-1 py-0.5 px-2">
                  <Truck className="size-3" />
                  <span>Deliverable</span>
                </Badge>
              ) : (
                <Badge className="bg-destructive/10 text-destructive border border-destructive/20 text-[10px] font-bold gap-1 py-0.5 px-2">
                  <Ban className="size-3" />
                  <span>Not Deliverable</span>
                </Badge>
              )
            )}

            {/* Quick edit */}
            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(address);
                }}
                title="Edit address"
                className="size-6.5 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <Edit3 className="size-3" />
              </button>
            )}

            {/* Delete button */}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(address.id || address._id);
                }}
                title="Remove address"
                className="size-6.5 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              >
                <Trash2 className="size-3" />
              </button>
            )}
          </div>
        </div>

        {/* Recipient Details */}
        <div>
          <h4 className="font-bold text-sm text-foreground leading-snug">
            {fullName}
          </h4>
          {address?.phone && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 pt-0.5">
              <Phone className="size-3 text-primary shrink-0" />
              <span>{address.phone}</span>
            </p>
          )}
        </div>

        {/* Formatted Address Lines */}
        <div className="text-xs text-muted-foreground space-y-0.5 leading-relaxed">
          {address?.door && <p className="truncate">{address.door}</p>}
          {address?.street && <p className="line-clamp-2">{address.street}</p>}
          <p className="font-medium text-foreground">
            {[address?.city, stateLabel].filter(Boolean).join(", ")}
            {address?.zip ? ` - ${address.zip}` : address?.pincode ? ` - ${address.pincode}` : ""}
          </p>
        </div>
      </div>

      {/* Warning banner if not deliverable (CHECKOUT ONLY) */}
      {showDeliverability && !isDeliverable && (
        <div className="pt-2 border-t border-destructive/30 flex items-center gap-1.5 text-[11px] font-medium text-destructive">
          <AlertCircle className="size-3.5 shrink-0" />
          <span>We do not deliver to this state yet.</span>
        </div>
      )}

      {/* Footer hint */}
      <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
        <span
          className={cn(
            "text-[11px] font-semibold",
            isSelected
              ? showDeliverability && !isDeliverable
                ? "text-destructive"
                : "text-primary"
              : "text-muted-foreground group-hover:text-primary"
          )}
        >
          {isSelected
            ? showDeliverability && !isDeliverable
              ? "Selected (Not Deliverable)"
              : "Selected Delivery Destination"
            : "Click to Select This Address"}
        </span>
        <ArrowRight className="size-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  );
}

/**
 * Main Shipping Address Component for Step 2 of Checkout
 * Uses clean card selection and modal popup for adding new addresses.
 */
export function ShippingAddressManager({
  savedAddresses = [],
  selectedAddress,
  onSelectAddress,
  onDeleteAddress,
  onSaveNewAddress,
  locations = [],
  onSubmit,
  isUpdating,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const selectedLoc = useMemo(() => {
    if (!selectedAddress) return null;
    return (
      locations.find((l) => String(l._id) === String(selectedAddress.state)) ||
      locations.find(
        (l) =>
          l.state?.trim().toLowerCase() ===
          (selectedAddress.stateName || selectedAddress.state || "").trim().toLowerCase()
      ) ||
      null
    );
  }, [locations, selectedAddress]);

  const isSelectedDeliverable = selectedLoc ? selectedLoc.deliverable : true;

  const handleOpenAddModal = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (addr) => {
    setEditingAddress(addr);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
        {/* Header Strip */}
        <div className="bg-muted/40 dark:bg-muted/20 border-b border-border/80 px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs shrink-0 shadow-2xs">
              2
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                Shipping Destination
              </h2>
              <p className="text-xs text-muted-foreground">
                Select your delivery address for reinforced scale model packaging
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleOpenAddModal}
            className="h-8.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs gap-1.5 font-bold shadow-2xs cursor-pointer self-start sm:self-auto"
          >
            <Plus className="size-3.5" />
            <span>Add New Address</span>
          </Button>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {/* Address Cards Grid */}
          {savedAddresses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedAddresses.map((addr) => {
                const addrId = addr.id || addr._id;
                const isSelected = (selectedAddress?.id || selectedAddress?._id) === addrId;
                return (
                  <SavedAddressCard
                    key={addrId}
                    address={addr}
                    isSelected={isSelected}
                    onSelect={onSelectAddress}
                    onEdit={handleOpenEditModal}
                    onDelete={onDeleteAddress}
                    locations={locations}
                    showDeliverability={true}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 px-4 border border-dashed border-border/80 rounded-2xl bg-muted/20 space-y-3">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <MapPin className="size-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">No Delivery Addresses Found</h3>
                <p className="text-xs text-muted-foreground pt-1 max-w-sm mx-auto">
                  Add a delivery address to verify route logistics and proceed with checkout.
                </p>
              </div>
              <Button
                type="button"
                onClick={handleOpenAddModal}
                className="h-9 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold gap-1.5 cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Add Your First Address</span>
              </Button>
            </div>
          )}

          {/* Active Deliverability Callout */}
          {selectedAddress && (
            <div>
              {!isSelectedDeliverable ? (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs leading-relaxed animate-in fade-in duration-200">
                  <AlertCircle className="size-4.5 shrink-0 mt-0.5 text-destructive" />
                  <div className="space-y-1">
                    <p className="font-bold text-sm">
                      Logistics Restriction: Delivery Not Available to {selectedLoc?.state || "Selected State"}
                    </p>
                    <p className="text-destructive/90 text-xs">
                      We do not deliver to this location yet. You cannot proceed to payment with this address. Please choose another address or add a deliverable destination.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 text-foreground text-xs leading-relaxed animate-in fade-in duration-200">
                  <CheckCircle2 className="size-4.5 shrink-0 text-primary mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-foreground">
                      Delivery Route Active to {selectedLoc?.state || "Destination"}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Delivery is available for this address.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CTA Submit Button (DISABLED / NOT PROCEEDABLE when not deliverable or no address selected) */}
      <Button
        type="button"
        onClick={onSubmit}
        disabled={isUpdating || !selectedAddress || !isSelectedDeliverable}
        className={cn(
          "w-full h-12 rounded-xl font-bold text-sm shadow-xs transition-all gap-2 cursor-pointer",
          !isSelectedDeliverable && selectedAddress
            ? "bg-destructive/80 hover:bg-destructive text-destructive-foreground opacity-90 cursor-not-allowed"
            : "bg-primary hover:bg-primary/90 text-primary-foreground"
        )}
      >
        {isUpdating
          ? "Securing Shipping Destination..."
          : !selectedAddress
          ? "Please Select an Address to Continue"
          : !isSelectedDeliverable
          ? "Cannot Proceed - Destination Not Deliverable"
          : "Continue to Payment & Order Review"}
        <ArrowRight className="size-4" />
      </Button>

      {/* Address Dialog Modal */}
      <AddressModalDialog
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSaveAddress={onSaveNewAddress}
        locations={locations}
        initialData={editingAddress}
      />
    </div>
  );
}

/**
 * Confirmed Shipping Address Card (Step 3 Summary)
 */
export function ShippingAddressConfirmedCard({
  address,
  selectedLocation,
  onEditAddress,
}) {
  const customerName =
    address?.name ||
    [address?.firstName, address?.lastName].filter(Boolean).join(" ") ||
    "Customer";
  const stateLabel = selectedLocation?.state || address?.stateName || address?.state || "";

  return (
    <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
      <div className="bg-muted/40 dark:bg-muted/20 border-b border-border/80 px-5 sm:px-6 py-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-primary" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
            Delivery Destination
          </h3>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onEditAddress}
          className="h-8 rounded-xl text-xs gap-1.5 font-medium hover:border-primary hover:text-primary cursor-pointer"
        >
          <Edit3 className="size-3 text-primary" />
          <span>Change Destination</span>
        </Button>
      </div>

      <div className="p-5 sm:p-6 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm sm:text-base text-foreground">
              {customerName}
            </span>
            {address?.label && (
              <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">
                {address.label}
              </Badge>
            )}
          </div>

          {stateLabel && (
            <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
              {stateLabel}
            </Badge>
          )}
        </div>

        <div className="text-xs text-muted-foreground space-y-0.5 leading-relaxed">
          {address?.door && <p>{address.door}</p>}
          {address?.street && <p>{address.street}</p>}
          <p>
            {[address?.city, stateLabel].filter(Boolean).join(", ")}
            {address?.zip ? ` - ${address.zip}` : address?.pincode ? ` - ${address.pincode}` : ""}
          </p>
          <p className="font-medium text-foreground">India</p>
        </div>

        <div className="pt-2 border-t border-border/60 flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
          {address?.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="size-3 text-primary" />
              <span>{address.phone}</span>
            </div>
          )}
          {address?.email && (
            <div className="flex items-center gap-1.5">
              <Mail className="size-3 text-primary" />
              <span>{address.email}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
