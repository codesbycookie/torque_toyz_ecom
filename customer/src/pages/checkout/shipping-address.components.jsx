'use client';

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  User,
  Phone,
  Mail,
  Building,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Edit3,
  ArrowRight,
} from "lucide-react";

/**
 * Shipping Address Input Form (Step 2 of Checkout)
 * Built to match the precision garage design aesthetic of Torque Toyzz.
 */
export function ShippingAddressForm({
  formData,
  onInputChange,
  locations = [],
  selectedLocation,
  isStateDeliverable,
  onStateChange,
  onSubmit,
  isUpdating,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
        {/* Header Strip */}
        <div className="bg-muted/40 dark:bg-muted/20 border-b border-border/80 px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs shrink-0 shadow-2xs">
              2
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                Shipping Destination & Contact
              </h2>
              <p className="text-xs text-muted-foreground">
                Enter your delivery address for reinforced scale model dispatch
              </p>
            </div>
          </div>

          <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs font-semibold self-start sm:self-auto gap-1.5 px-2.5 py-1">
            <Truck className="size-3.5" />
            <span>Express Courier Logistics</span>
          </Badge>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {/* Section 1: Recipient Information */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 pb-1 border-b border-border/50">
              <User className="size-3.5 text-primary" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                01 / Recipient Information
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs font-medium text-foreground">
                  First Name <span className="text-primary font-bold">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={onInputChange}
                  required
                  placeholder="e.g. Bruce"
                  className="h-10 text-xs sm:text-sm rounded-xl bg-background border-border/80 focus-visible:ring-primary/30"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs font-medium text-foreground">
                  Last Name <span className="text-primary font-bold">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={onInputChange}
                  required
                  placeholder="e.g. Wayne"
                  className="h-10 text-xs sm:text-sm rounded-xl bg-background border-border/80 focus-visible:ring-primary/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-foreground">
                  Email Address <span className="text-muted-foreground text-[10px]">(for tracking links)</span>
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@domain.com"
                    value={formData.email}
                    onChange={onInputChange}
                    className="h-10 text-xs sm:text-sm rounded-xl bg-background border-border/80 pl-9 focus-visible:ring-primary/30"
                  />
                  <Mail className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-medium text-foreground">
                  Phone Number <span className="text-muted-foreground text-[10px]">(for delivery updates)</span>
                </Label>
                <div className="relative">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={onInputChange}
                    className="h-10 text-xs sm:text-sm rounded-xl bg-background border-border/80 pl-9 focus-visible:ring-primary/30"
                  />
                  <Phone className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Address & Region */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 pb-1 border-b border-border/50">
              <MapPin className="size-3.5 text-primary" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                02 / Delivery Address & Logistics
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5 sm:col-span-1">
                <Label htmlFor="door" className="text-xs font-medium text-foreground">
                  Door / Flat / House No.
                </Label>
                <div className="relative">
                  <Input
                    id="door"
                    placeholder="e.g. Flat 402, B-Block"
                    value={formData.door}
                    onChange={onInputChange}
                    className="h-10 text-xs sm:text-sm rounded-xl bg-background border-border/80 pl-9 focus-visible:ring-primary/30"
                  />
                  <Building className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="street" className="text-xs font-medium text-foreground">
                  Street / Area / Landmark <span className="text-primary font-bold">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="street"
                    placeholder="e.g. 100 Feet Road, Indiranagar"
                    value={formData.street}
                    onChange={onInputChange}
                    required
                    className="h-10 text-xs sm:text-sm rounded-xl bg-background border-border/80 pl-9 focus-visible:ring-primary/30"
                  />
                  <Navigation className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-xs font-medium text-foreground">
                  City / Town <span className="text-primary font-bold">*</span>
                </Label>
                <Input
                  id="city"
                  placeholder="e.g. Bengaluru"
                  value={formData.city}
                  onChange={onInputChange}
                  required
                  className="h-10 text-xs sm:text-sm rounded-xl bg-background border-border/80 focus-visible:ring-primary/30"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="state" className="text-xs font-medium text-foreground">
                  State / Region <span className="text-primary font-bold">*</span>
                </Label>
                <Select value={formData.state} onValueChange={onStateChange}>
                  <SelectTrigger
                    id="state"
                    className="h-10 text-xs sm:text-sm rounded-xl bg-background border-border/80 focus:ring-primary/30"
                  >
                    <SelectValue placeholder="Select Destination State" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border bg-popover shadow-lg max-h-60">
                    {locations.map((loc) => (
                      <SelectItem
                        key={loc._id}
                        value={loc._id}
                        className="text-xs sm:text-sm py-2 cursor-pointer"
                      >
                        <div className="flex items-center justify-between w-full gap-2">
                          <span>{loc.state}</span>
                          {!loc.deliverable && (
                            <span className="text-[10px] text-destructive font-semibold">
                              (Restricted)
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="zip" className="text-xs font-medium text-foreground">
                  PIN Code (6 Digits) <span className="text-primary font-bold">*</span>
                </Label>
                <Input
                  id="zip"
                  placeholder="e.g. 560038"
                  value={formData.zip}
                  onChange={onInputChange}
                  maxLength={6}
                  required
                  className="h-10 text-xs sm:text-sm font-mono rounded-xl bg-background border-border/80 focus-visible:ring-primary/30"
                />
              </div>
            </div>
          </div>

          {/* Deliverability Status Feedback */}
          {formData.state && !isStateDeliverable && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs leading-relaxed">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Logistics Restriction for {selectedLocation?.state}</p>
                <p className="text-destructive/90 text-[11px] pt-0.5">
                  Our fragile express logistics partners cannot deliver precision scale models to this state currently. Please select an alternate address.
                </p>
              </div>
            </div>
          )}

          {formData.state && isStateDeliverable && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 text-foreground text-xs leading-relaxed">
              <CheckCircle2 className="size-4 shrink-0 text-primary mt-0.5" />
              <div>
                <p className="font-bold text-foreground">
                  Delivery Route Active to {selectedLocation?.state}
                </p>
                <p className="text-muted-foreground text-[11px] pt-0.5">
                  Pre-inspected scale models are sealed in anti-shock garage boxes and shipped with end-to-end milestone tracking.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CTA Submit Button */}
      <Button
        type="submit"
        disabled={isUpdating || !formData.state || !isStateDeliverable}
        className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-xs transition-all gap-2 cursor-pointer"
      >
        {isUpdating ? "Saving Shipping Address..." : "Continue to Payment & Order Review"}
        <ArrowRight className="size-4" />
      </Button>
    </form>
  );
}

/**
 * Confirmed Shipping Address Card (Step 3 Summary)
 * Matches the Delivery Destination card from order-tracking.jsx
 */
export function ShippingAddressConfirmedCard({
  formData,
  selectedLocation,
  onEditAddress,
}) {
  const customerName = `${formData.firstName} ${formData.lastName}`.trim() || "Customer";
  const stateLabel = selectedLocation?.state || formData.state || "";

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
          <span>Change Address</span>
        </Button>
      </div>

      <div className="p-5 sm:p-6 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="font-bold text-sm sm:text-base text-foreground">
            {customerName}
          </span>
          {stateLabel && (
            <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
              {stateLabel}
            </Badge>
          )}
        </div>

        <div className="text-xs text-muted-foreground space-y-0.5 leading-relaxed">
          {formData.door && <p>{formData.door}</p>}
          {formData.street && <p>{formData.street}</p>}
          <p>
            {[formData.city, stateLabel].filter(Boolean).join(", ")}
            {formData.zip ? ` - ${formData.zip}` : ""}
          </p>
          <p className="font-medium text-foreground">India</p>
        </div>

        <div className="pt-2 border-t border-border/60 flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
          {formData.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="size-3 text-primary" />
              <span>{formData.phone}</span>
            </div>
          )}
          {formData.email && (
            <div className="flex items-center gap-1.5">
              <Mail className="size-3 text-primary" />
              <span>{formData.email}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
