import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import formatdate from "@/core/utils/formatdate.util";
import { useState } from "react";
import { toast } from "sonner";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ORDER_STATUSES, ORDER_STATUS_VARIANT, ORDER_STATUS_STYLES, PAYMENT_STATUS_STYLES, getStatusItemState, getCancelLabel } from "./order.schema";

export const ChangeOrderStatus = ({
  order,
  initialStatus,
  submitFn = () => {},
  closeModal = () => {},
}) => {
  const [status, setStatus] = useState(initialStatus || order?.status || "");
  const [trackingUrl, setTrackingUrl] = useState(order?.delivery_partner_url || "");
  const [submitting, setSubmitting] = useState(false);

  if (!order) return null;

  const handleSubmit = async () => {
    const isUnchanged = status === order.status && trackingUrl.trim() === (order.delivery_partner_url || "");
    if (isUnchanged) {
      closeModal();
      return;
    }
    if (status === "shipped" && !trackingUrl.trim()) {
      toast.error("Please enter a tracking URL for shipped orders");
      return;
    }
    try {
      setSubmitting(true);
      await submitFn(order, status, trackingUrl.trim());
      closeModal();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-md w-full">
      <DialogHeader>
        <DialogTitle>Change Order Status</DialogTitle>
        <DialogDescription>
          Update the status for order{" "}
          <span className="font-medium font-mono">{order.code}</span>
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-2">
        <div className="flex justify-between items-center py-2 border-b text-sm">
          <span className="text-muted-foreground">Current Status</span>
          <Badge className={ORDER_STATUS_STYLES[order.status] || "bg-secondary text-secondary-foreground"}>
            {order.status}
          </Badge>
        </div>

        <div className="space-y-2">
          <span className="text-sm font-medium text-muted-foreground">New Status</span>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map((s) => {
                const { disabled, isCurrent } = getStatusItemState(order.status, s);
                const label = s === "cancelled" ? getCancelLabel(order.payment?.status) : s;
                return (
                  <SelectItem key={s} value={s} disabled={disabled} className="capitalize">
                    {label} {isCurrent ? "(Current)" : ""}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {status === "shipped" && (
          <div className="space-y-2 pt-2 animate-in fade-in duration-300">
            <Label htmlFor="trackingUrl" className="text-sm font-medium">
              Tracking URL (Delivery Partner URL) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="trackingUrl"
              type="url"
              placeholder="https://courier-tracking.com/track/..."
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              This link will be embedded in an iframe on the customer's tracking page.
            </p>
          </div>
        )}
      </div>

      <DialogFooter className="mt-4 gap-2">
        <DialogClose asChild>
          <Button variant="outline" size="lg">
            Cancel
          </Button>
        </DialogClose>
        <Button
          size="lg"
          disabled={submitting || (status === order.status && trackingUrl.trim() === (order.delivery_partner_url || ""))}
          onClick={handleSubmit}
        >
          {submitting ? "Updating..." : "Update Status"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export const ViewOrder = ({ order, closeModal = () => {} }) => {
  if (!order) return null;

  return (
    <>
      <DialogContent className="sm:max-w-3xl w-full">
        <DialogHeader>
          <DialogTitle className="text-xl">Order {order.code}</DialogTitle>
          <DialogDescription>
            Placed on {order.createdAt ? formatdate(order.createdAt) : "—"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
          {/* Left – Items + Shipping Address */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Order Items
              </h4>

              <div className="space-y-4">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex gap-5 items-start">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="size-28 rounded-lg object-cover border shadow-sm"
                      />
                    )}
                    <div className="space-y-2">
                      <div className="text-lg font-semibold">
                        {item.name || "-"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Quantity:{" "}
                        <span className="font-medium text-foreground">
                          {item.quantity || 1}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Unit Price:{" "}
                        <span className="font-medium text-foreground">
                          ₹{Number(item.price || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Weight:{" "}
                        <span className="font-medium text-foreground">
                          {item.weight || 0} kg
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Shipping Address
              </h4>
              <p className="text-sm text-muted-foreground">
                {[
                  order.shipping_address?.door,
                  order.shipping_address?.street,
                  order.shipping_address?.city,
                ]
                  .filter(Boolean)
                  .join(", ")}
                {order.shipping_address?.stateName
                  ? `, ${order.shipping_address.stateName}`
                  : ""}
                {order.shipping_address?.pincode
                  ? ` - ${order.shipping_address.pincode}`
                  : ""}
              </p>
            </div>
          </div>

          {/* Right – Order Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Order Information
            </h4>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  className={ORDER_STATUS_STYLES[order.status] || "bg-secondary text-secondary-foreground"}
                >
                  {order.status}
                </Badge>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium uppercase text-xs">
                  {order.payment?.method}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Payment Status</span>
                <Badge
                  className={PAYMENT_STATUS_STYLES[order.payment?.status] || "bg-secondary text-secondary-foreground"}
                >
                  {order.payment?.status}
                </Badge>
              </div>

              {order.delivery_partner_url && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">
                    Delivery Tracking
                  </span>
                  <a
                    href={order.delivery_partner_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2 text-xs truncate max-w-[180px]"
                  >
                    Track Shipment
                  </a>
                </div>
              )}

              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₹{order.pricing?.subtotal}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">GST / Tax</span>
                <span className="font-medium">
                  ₹{order.pricing?.tax || 0}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  ₹{order.pricing?.shipping_cost}
                </span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Total</span>
                <span className="text-base font-semibold">
                  ₹{order.pricing?.total}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Status History
              </h4>
              <div className="space-y-1">
                {order.status_history?.map((h, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center py-2 border-b text-sm last:border-b-0"
                  >
                    <span className="capitalize text-muted-foreground">
                      {h.status}
                    </span>
                    <span className="text-xs">
                      {h.timestamp ? formatdate(h.timestamp) : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline" size="lg" onClick={closeModal}>
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </>
  );
};
