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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  Search,
  ChevronsUpDown,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useApi } from "@/core/contexts/api.context";
import { useAuth } from "@/core/contexts/auth.context";

/**
 * Searchable Location Select Combobox
 * Uses live backend Location API search with debouncing
 */
export function SearchableLocationSelect({
  value,
  onChange,
  locations: propLocations = [],
  id = "location-select",
  placeholder = "Search or select state / region...",
  className,
}) {
  const { locations: locationsApi } = useApi();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [apiLocations, setApiLocations] = useState(null);

  // Initial load if empty
  useEffect(() => {
    if (open && (!propLocations || propLocations.length === 0)) {
      locationsApi.fetchLocations?.({ limit: 100, sortBy: "state", order: "asc" });
    }
  }, [open, propLocations, locationsApi]);

  // Live Debounced Backend Search using proper API
  useEffect(() => {
    if (!open) return;
    const trimmed = search.trim();
    if (!trimmed) {
      setApiLocations(null);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await locationsApi.fetchLocations?.({
          search: trimmed,
          limit: 50,
          sortBy: "state",
          order: "asc",
        });
        if (Array.isArray(res?.data?.items)) {
          setApiLocations(res.data.items);
        } else if (Array.isArray(res)) {
          setApiLocations(res);
        }
      } catch (err) {
        console.error("Location search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [search, open, locationsApi]);

  // Combined source list
  const sourceList = apiLocations || (propLocations && propLocations.length > 0 ? propLocations : locationsApi.list || []);

  // Filtered list (backend result or client-side filter fallback)
  const filteredList = useMemo(() => {
    if (!search.trim()) return sourceList;
    const q = search.trim().toLowerCase();
    return sourceList.filter(
      (loc) =>
        loc.state?.toLowerCase().includes(q) ||
        loc.code?.toLowerCase().includes(q)
    );
  }, [sourceList, search]);

  // Find currently selected location object
  const selectedLocation = useMemo(() => {
    if (!value) return null;
    const valStr = String(value);
    return (
      sourceList.find((l) => String(l._id || l.locationId) === valStr) ||
      (locationsApi.list || []).find((l) => String(l._id || l.locationId) === valStr) ||
      sourceList.find((l) => l.state?.toLowerCase() === valStr.toLowerCase()) ||
      null
    );
  }, [value, sourceList, locationsApi.list]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-9.5 w-full rounded-xl border border-input bg-background px-3 py-1.5 text-xs text-foreground flex items-center justify-between gap-2 shadow-2xs hover:border-primary/50 transition-all cursor-pointer text-left focus:outline-none focus:ring-1 focus:ring-ring",
            className
          )}
        >
          {selectedLocation ? (
            <div className="flex items-center gap-2 min-w-0 truncate">
              <MapPin className="size-3.5 text-primary shrink-0" />
              <span className="font-semibold text-foreground truncate">
                {selectedLocation.state}
              </span>
              {selectedLocation.code && (
                <Badge variant="outline" className="text-[10px] font-mono font-bold px-1.5 py-0">
                  {selectedLocation.code}
                </Badge>
              )}
              {selectedLocation.deliverable ? (
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold py-0 px-1.5 hidden sm:inline-flex">
                  Deliverable
                </Badge>
              ) : (
                <Badge className="bg-destructive/10 text-destructive border border-destructive/20 text-[10px] font-bold py-0 px-1.5 hidden sm:inline-flex">
                  Restricted
                </Badge>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground flex items-center gap-1.5">
              <MapPin className="size-3.5 text-muted-foreground/70" />
              <span>{placeholder}</span>
            </span>
          )}
          <ChevronsUpDown className="size-3.5 text-muted-foreground shrink-0" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[300px] sm:w-[340px] p-2 rounded-2xl border-border bg-popover shadow-xl space-y-2 z-50"
      >
        {/* Search Input Box */}
        <div className="relative">
          <Search className="size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search state name or code (e.g. TN, Maharashtra)..."
            className="h-8.5 text-xs rounded-xl pl-8 pr-7 bg-muted/30 focus-visible:ring-1"
            autoFocus
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Searching Status or Count */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
          <span>Available Delivery States</span>
          {isSearching ? (
            <span className="flex items-center gap-1 text-primary">
              <Loader2 className="size-3 animate-spin" />
              <span>Searching API...</span>
            </span>
          ) : (
            <span>{filteredList.length} locations</span>
          )}
        </div>

        {/* Scrollable Locations List */}
        <div className="max-h-56 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
          {filteredList.length > 0 ? (
            filteredList.map((loc) => {
              const locId = String(loc._id || loc.locationId);
              const isSelected = String(value) === locId || String(value) === loc.state;
              const isDeliverable = Boolean(loc.deliverable);

              return (
                <div
                  key={locId}
                  onClick={() => {
                    onChange(locId, loc);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-xs cursor-pointer transition-colors",
                    isSelected
                      ? "bg-primary/10 text-primary font-bold"
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={cn(
                        "size-4 rounded-full border flex items-center justify-center shrink-0",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/40"
                      )}
                    >
                      {isSelected && <Check className="size-2.5 stroke-[3]" />}
                    </div>
                    <span className="truncate">{loc.state}</span>
                    {loc.code && (
                      <Badge variant="outline" className="text-[10px] font-mono px-1 py-0">
                        {loc.code}
                      </Badge>
                    )}
                  </div>

                  <div className="shrink-0">
                    {isDeliverable ? (
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold py-0 px-1.5">
                        Deliverable
                      </Badge>
                    ) : (
                      <Badge className="bg-destructive/10 text-destructive border border-destructive/20 text-[10px] font-bold py-0 px-1.5">
                        Restricted
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-6 text-center space-y-1 text-muted-foreground">
              <Ban className="size-5 mx-auto text-muted-foreground/60" />
              <p className="text-xs font-medium">No locations found</p>
              <p className="text-[11px] text-muted-foreground/70">
                Try searching for another state or city name
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

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
  const api = useApi();
  const backendLocations = locations && locations.length > 0 ? locations : (api.locations?.list || []);

  useEffect(() => {
    if (isOpen && backendLocations.length === 0 && api.locations?.fetchLocations) {
      api.locations.fetchLocations({ full: true });
    }
  }, [isOpen, backendLocations.length, api.locations]);

  // Use backend locations exclusively
  const availableStates = useMemo(() => {
    return backendLocations.map((loc) => ({
      name: loc.state,
      locationId: String(loc._id),
      code: loc.code,
      deliverable: Boolean(loc.deliverable),
    }));
  }, [backendLocations]);

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

    const locMatch = backendLocations.find(
      (l) => String(l._id) === String(modalForm.state) || l.state?.trim().toLowerCase() === String(modalForm.state).trim().toLowerCase()
    );

    const resolvedStateId = locMatch ? String(locMatch._id) : modalForm.state;
    const resolvedStateName = locMatch?.state || "";

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
              <SearchableLocationSelect
                id="modal-state"
                value={modalForm.state}
                onChange={(val) => handleStateChange(val)}
                locations={backendLocations}
              />
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
  const api = useApi();
  const { user, setUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressSearch, setAddressSearch] = useState("");

  const filteredSavedAddresses = useMemo(() => {
    if (!addressSearch.trim()) return savedAddresses;
    const q = addressSearch.trim().toLowerCase();
    return savedAddresses.filter((a) => {
      const loc =
        locations.find((l) => String(l._id) === String(a.state)) ||
        locations.find(
          (l) => l.state?.trim().toLowerCase() === (a.stateName || a.state || "").trim().toLowerCase()
        );
      const stateName = loc?.state || a.stateName || a.state || "";
      const stateCode = loc?.code || "";
      const name = a.name || `${a.firstName || ""} ${a.lastName || ""}`.trim();
      const fullText = `${name} ${a.door || ""} ${a.street || ""} ${a.city || ""} ${stateName} ${stateCode} ${a.zip || a.pincode || ""}`.toLowerCase();
      return fullText.includes(q);
    });
  }, [savedAddresses, addressSearch, locations]);

  const handleSave = async (payload) => {
    if (onSaveNewAddress) {
      onSaveNewAddress(payload);
    } else if (user?._id && api.users?.saveUserAddress) {
      try {
        const updated = await api.users.saveUserAddress(user, payload);
        if (updated) setUser(updated);
        toast.success("Shipping address saved!");
      } catch (err) {
        console.error("Failed to save address:", err);
      }
    }
  };

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

        <div className="p-5 sm:p-6 space-y-5">
          {/* Quick Search across saved addresses */}
          {savedAddresses.length > 1 && (
            <div className="relative">
              <Search className="size-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                value={addressSearch}
                onChange={(e) => setAddressSearch(e.target.value)}
                placeholder="Search saved addresses by state, city, street, or recipient..."
                className="h-9 text-xs rounded-xl pl-9 pr-8 bg-muted/20 border-border/80 focus-visible:ring-1"
              />
              {addressSearch && (
                <button
                  type="button"
                  onClick={() => setAddressSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Address Cards Grid */}
          {savedAddresses.length > 0 ? (
            filteredSavedAddresses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredSavedAddresses.map((addr) => {
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
              <div className="text-center py-8 px-4 border border-dashed border-border/70 rounded-xl bg-muted/10 space-y-1">
                <p className="text-xs font-semibold text-foreground">No matching addresses found</p>
                <p className="text-[11px] text-muted-foreground">
                  Try another keyword or clear the search to view all saved destinations
                </p>
              </div>
            )
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
        onSaveAddress={handleSave}
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
