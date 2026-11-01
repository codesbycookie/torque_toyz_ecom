import CopyButton from "@/components/ui/copy-button";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import formatdate from "@/core/utils/formatdate.util";
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
import {
  ORDER_STATUSES,
  ORDER_STATUS_STYLES,
  PAYMENT_STATUS_STYLES,
  getStatusItemState,
  getCancelLabel,
  isRefundEligible,
  isRefundPending,
} from "./order.schema";
import {
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  Mail,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  ShoppingBag,
  Truck,
  User,
  XCircle,
  Receipt,
} from "lucide-react";

export const formatLocationState = (state, stateName) => {
  if (stateName) return stateName;
  if (!state) return "";
  if (typeof state === "object") {
    return state.state || state.name || state.code || "";
  }
  return typeof state === "string" ? state : "";
};

export const formatShippingAddress = (address) => {
  if (!address || typeof address !== "object") return "";
  const stateStr = formatLocationState(address.state, address.stateName);
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

const getStatusIcon = (status) => {
  switch (status) {
    case "placed":
      return <Clock className="size-3.5" />;
    case "confirmed":
      return <CheckCircle2 className="size-3.5" />;
    case "shipped":
      return <Truck className="size-3.5" />;
    case "delivered":
      return <CheckCircle2 className="size-3.5" />;
    case "cancelled":
      return <XCircle className="size-3.5" />;
    default:
      return <Clock className="size-3.5" />;
  }
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

export const ChangeOrderStatus = ({
  order,
  initialStatus,
  submitFn = () => { },
  closeModal = () => { },
}) => {
  const [status, setStatus] = useState(initialStatus || order?.status || "");
  const [trackingUrl, setTrackingUrl] = useState(order?.delivery_partner_url || "");
  const [submitting, setSubmitting] = useState(false);

  if (!order) return null;

  const handleSubmit = async () => {
    const isUnchanged =
      status === order.status && trackingUrl.trim() === (order.delivery_partner_url || "");
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
        <DialogTitle className="flex items-center gap-2 text-lg">
          <RefreshCw className="size-5 text-primary" />
          Change Order Status
        </DialogTitle>
        <DialogDescription>
          Update fulfillment status for order{" "}
          <span className="font-mono font-semibold text-foreground">{order.code}</span>
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-2">
        {order.status === "cancelled" && (
          <div className="flex items-center gap-2 p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300 text-xs font-medium">
            <XCircle className="size-4 shrink-0" />
            <span>This order is cancelled. Once cancelled, no status can be changed.</span>
          </div>
        )}
        <div className="flex justify-between items-center p-3 rounded-lg bg-muted/40 border text-sm">
          <span className="text-muted-foreground font-medium">Current Status</span>
          <Badge className={ORDER_STATUS_STYLES[order.status] || "bg-secondary text-secondary-foreground"}>
            {order.status}
          </Badge>
        </div>

        <div className="space-y-2">
          <Label htmlFor="statusSelect" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            New Status
          </Label>
          <Select value={status} onValueChange={setStatus} disabled={order.status === "cancelled"}>
            <SelectTrigger id="statusSelect" className="w-full">
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
            <Label htmlFor="trackingUrl" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tracking / Courier URL <span className="text-destructive">*</span>
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
              Customers will see this tracking link in their order dashboard.
            </p>
          </div>
        )}
      </div>

      <DialogFooter className="mt-4 gap-2">
        <DialogClose asChild>
          <Button variant="outline" size="default">
            Cancel
          </Button>
        </DialogClose>
        <Button
          size="default"
          disabled={submitting || order.status === "cancelled" || (status === order.status && trackingUrl.trim() === (order.delivery_partner_url || ""))}
          onClick={handleSubmit}
        >
          {submitting ? "Updating..." : "Update Status"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export const ApproveInitiateRefund = ({
  order,
  submitFn,
  closeModal = () => {},
}) => {
  const [reason, setReason] = useState("Refund approved by admin");
  const [loading, setLoading] = useState(false);

  if (!order) return null;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      if (submitFn) {
        await submitFn(order._id, reason.trim() || "Refund approved by admin");
      }
      closeModal();
    } catch (err) {
      console.error("Refund submission failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const customerName =
    (typeof order.user === "object" ? order.user?.name : null) ||
    order.shipping_address?.name ||
    (order.guest_id ? `Guest (${order.guest_id.slice(0, 8)})` : "Guest Customer");

  const customerEmail =
    (typeof order.user === "object" ? order.user?.email : null) ||
    order.shipping_address?.email;

  const customerPhone =
    (typeof order.user === "object" ? order.user?.phone : null) ||
    order.shipping_address?.phone;

  const totalAmount = Number(order.pricing?.total || 0).toFixed(2);
  const paymentMethod = order.payment?.method || "online";
  const transactionId = order.payment?.transaction_id || "";

  return (
    <DialogContent className="max-w-md w-[95vw] p-5 sm:p-6">
      <DialogHeader>
        <div className="flex items-center justify-between gap-2">
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Approve & Initiate Refund
          </DialogTitle>
          <Badge variant="outline" className="font-mono text-xs">
            {order.code}
          </Badge>
        </div>
        <DialogDescription className="text-xs text-muted-foreground mt-1">
          Review payment details and process the refund request.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        <div className="rounded-xl border bg-muted/30 p-3.5 space-y-2.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Order Status:</span>
            <Badge className={ORDER_STATUS_STYLES[order.status] || "bg-secondary text-secondary-foreground"}>
              {order.status}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Payment Status:</span>
            <Badge className={PAYMENT_STATUS_STYLES[order.payment?.status] || "bg-secondary text-secondary-foreground"}>
              {order.payment?.status || "pending"}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Customer:</span>
            <span className="font-medium text-foreground truncate max-w-[200px]">{customerName}</span>
          </div>
          {(customerEmail || customerPhone) && (
            <div className="flex justify-between items-center text-[11px] text-muted-foreground">
              <span>Contact:</span>
              <span className="truncate max-w-[200px]">{customerEmail || customerPhone}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Payment Method:</span>
            <span className="font-mono uppercase text-foreground">{paymentMethod}</span>
          </div>
          {transactionId && (
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-muted-foreground">Transaction ID:</span>
              <span className="font-mono text-foreground">{transactionId}</span>
            </div>
          )}
          <div className="border-t pt-2 mt-2 flex justify-between items-center">
            <span className="font-semibold text-foreground">Total Refund Amount:</span>
            <span className="text-base font-bold text-rose-600 dark:text-rose-400">
              ₹{totalAmount}
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="refund-reason" className="text-xs font-medium">
            Refund Reason / Note
          </Label>
          <Input
            id="refund-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Order cancelled, item defective, customer requested"
            className="text-xs"
            disabled={loading}
          />
          <p className="text-[11px] text-muted-foreground">
            This reason is recorded in payment transactions and order history.
          </p>
        </div>

        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-[11px] text-amber-900 dark:text-amber-200">
          This action will initiate the gateway refund (or mark offline payment refunded), set payment status to <strong className="font-semibold">refunded</strong>, and set order status to <strong className="font-semibold">cancelled</strong>.
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t flex flex-col sm:flex-row items-center justify-between">
          <DialogClose asChild>
            <Button type="button" variant="outline" size="default" disabled={loading} onClick={closeModal} className="w-full sm:w-auto">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            variant="destructive"
            size="default"
            disabled={loading}
            className="w-full sm:w-auto font-medium"
          >
            {loading ? "Processing Refund..." : "Approve & Initiate Refund"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export const ViewOrder = ({
  order,
  onOpenChangeStatus,
  onOpenRefund,
  closeModal = () => { },
}) => {
  if (!order) return null;

  const customerName =
    (typeof order.user === "object" ? order.user?.name : null) ||
    order.shipping_address?.name ||
    (order.guest_id ? `Guest (${order.guest_id.slice(0, 8)})` : "Guest Customer");

  const customerEmail =
    (typeof order.user === "object" ? order.user?.email : null) ||
    order.shipping_address?.email;

  const customerPhone =
    (typeof order.user === "object" ? order.user?.phone : null) ||
    order.shipping_address?.phone;

  const customerLoginId =
    typeof order.user === "object" ? (order.user?.login_id || order.user?.username) : null;

  const formattedAddress = formatShippingAddress(order.shipping_address);

  const totalItems = order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
  const totalWeight = order.pricing?.total_weight ?? (
    order.items?.reduce((sum, item) => sum + (Number(item.weight || 0) * (item.quantity || 1)), 0) || 0
  );

  const handleOpenChangeStatus = () => {
    closeModal();
    onOpenChangeStatus?.(order, order.status);
  };

  return (
    <DialogContent className="sm:max-w-4xl w-full max-h-[88vh] overflow-y-auto p-6 gap-6">
      {/* Header */}
      <DialogHeader className="gap-2 border-b pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-6">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-2xl font-bold tracking-tight font-mono">
                  {order.code}
                </DialogTitle>
                <CopyButton text={order.code} label="Order ID" />
              </div>
              <Badge
                className={`flex items-center gap-1.5 px-2.5 py-0.5 text-xs ${ORDER_STATUS_STYLES[order.status] || "bg-secondary text-secondary-foreground"
                  }`}
              >
                {getStatusIcon(order.status)}
                {order.status}
              </Badge>
              <Badge
                className={`px-2.5 py-0.5 text-xs ${PAYMENT_STATUS_STYLES[order.payment?.status] || "bg-secondary text-secondary-foreground"
                  }`}
              >
                Payment: {order.payment?.status || "pending"}
              </Badge>
            </div>
            <DialogDescription className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="size-3.5" />
              Placed on {order.createdAt ? formatdate(order.createdAt) : "—"}
              {(order.guest_id && !order.user) && <span>• (Guest Order)</span>}
            </DialogDescription>
          </div>

          <div className="flex items-center gap-2">
            {onOpenRefund && isRefundPending(order) && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  closeModal();
                  onOpenRefund(order);
                }}
                className="text-xs font-medium"
              >
                Approve & Initiate Refund
              </Button>
            )}
            {onOpenChangeStatus && order.status !== "cancelled" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenChangeStatus}
                className="gap-1.5 text-xs font-medium"
              >
                <RefreshCw className="size-3.5" />
                Change Status
              </Button>
            )}
          </div>
        </div>
      </DialogHeader>

      {isRefundPending(order) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs">
          <div>
            <div className="font-semibold">Action Required: Pending Refund</div>
            <p className="text-amber-800/90 dark:text-amber-300/90 mt-0.5">
              This order was cancelled but the paid amount of ₹{Number(order.pricing?.total || 0).toFixed(2)} is pending refund.
            </p>
          </div>
          {onOpenRefund && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                closeModal();
                onOpenRefund(order);
              }}
              className="shrink-0 text-xs font-medium"
            >
              Approve & Initiate Refund
            </Button>
          )}
        </div>
      )}

      {order.status === "cancelled" && !isRefundPending(order) && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-200 text-xs font-medium">
          <XCircle className="size-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>This order has been cancelled. Cancelled orders are final and their status cannot be modified.</span>
        </div>
      )}

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border bg-muted/30 p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Receipt className="size-3.5 text-primary" />
            <span>Grand Total</span>
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground">
            ₹{Number(order.pricing?.total || 0).toFixed(2)}
          </div>
        </div>

        <div className="rounded-xl border bg-muted/30 p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <ShoppingBag className="size-3.5 text-primary" />
            <span>Items & Weight</span>
          </div>
          <div className="text-sm font-semibold text-foreground">
            {totalItems} item{totalItems !== 1 ? "s" : ""}
            <span className="text-xs text-muted-foreground font-normal ml-1">
              ({totalWeight} kg)
            </span>
          </div>
        </div>

        <div className="rounded-xl border bg-muted/30 p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <CreditCard className="size-3.5 text-primary" />
            <span>Payment Mode</span>
          </div>
          <div className="text-sm font-semibold uppercase text-foreground">
            {order.payment?.method || "COD"}
          </div>
        </div>

        <div className="rounded-xl border bg-muted/30 p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Truck className="size-3.5 text-primary" />
            <span>Fulfillment</span>
          </div>
          <div className="text-sm font-semibold capitalize text-foreground flex items-center gap-1">
            {order.status}
          </div>
        </div>
      </div>

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Items & History) - 7 cols */}
        <div className="lg:col-span-7 space-y-5">
          {/* Items Card */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Package className="size-3.5 text-primary" />
                Ordered Items ({order.items?.length || 0})
              </h4>
              <span className="text-xs text-muted-foreground">
                Total Qty: <strong className="text-foreground">{totalItems}</strong>
              </span>
            </div>

            <div className="space-y-3 divide-y">
              {order.items?.map((item, i) => (
                <div key={i} className={`flex gap-3.5 items-center ${i > 0 ? "pt-3" : ""}`}>
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="size-14 rounded-lg object-cover border bg-muted shrink-0"
                    />
                  ) : (
                    <div className="size-14 rounded-lg bg-muted flex items-center justify-center border shrink-0">
                      <Package className="size-6 text-muted-foreground/60" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground line-clamp-1" title={item.name}>
                      {item.name || "Product"}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>
                        Qty: <strong className="text-foreground font-medium">{item.quantity || 1}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Rate: <strong className="text-foreground font-medium">₹{Number(item.price || 0).toFixed(2)}</strong>
                      </span>
                      {item.weight ? (
                        <>
                          <span>•</span>
                          <span>{item.weight} kg</span>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-foreground">
                      ₹{(Number(item.price || 0) * (item.quantity || 1)).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Courier & Tracking URL Card */}
          {order.delivery_partner_url && (
            <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300 font-semibold text-sm">
                  <Truck className="size-4" />
                  Delivery Tracking
                </div>
                <a
                  href={order.delivery_partner_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-600 dark:text-sky-400 hover:underline"
                >
                  Track Shipment
                  <ExternalLink className="size-3" />
                </a>
              </div>
              <p className="text-xs text-muted-foreground font-mono truncate" title={order.delivery_partner_url}>
                {order.delivery_partner_url}
              </p>
            </div>
          )}

          {/* Status History Timeline Card */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b pb-2.5">
              <Clock className="size-3.5 text-primary" />
              Order Timeline & History
            </h4>

            {(!order.status_history || order.status_history.length === 0) ? (
              <p className="text-xs text-muted-foreground py-2 text-center">
                No milestone history recorded yet.
              </p>
            ) : (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {order.status_history.map((h, i) => (
                  <div key={i} className="relative group">
                    <span className="absolute -left-6 top-1 size-3 rounded-full border-2 border-background bg-primary ring-2 ring-primary/20" />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`capitalize text-[11px] font-semibold ${ORDER_STATUS_STYLES[h.status] || ""
                            }`}
                        >
                          {h.status}
                        </Badge>
                        {h.note && (
                          <span className="text-xs text-muted-foreground italic">
                            ({h.note})
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {h.timestamp ? formatdate(h.timestamp) : "—"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Customer, Shipping & Pricing) - 5 cols */}
        <div className="lg:col-span-5 space-y-5">
          {/* Customer Details Card */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b pb-2.5">
              <User className="size-3.5 text-primary" />
              Customer Information
            </h4>

            <div className="flex items-center gap-3 pt-1">
              {order.user?.profile?.url ? (
                <img
                  src={order.user.profile.url}
                  alt={customerName}
                  className="size-11 rounded-full object-cover border border-primary/20 shadow-xs shrink-0"
                />
              ) : (
                <div className="size-11 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center border border-primary/20 shrink-0 text-sm">
                  {getInitials(customerName)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-semibold truncate text-foreground">
                    {customerName}
                  </span>
                  {order.user?.role && (
                    <Badge variant="outline" className="text-[10px] uppercase font-mono px-1.5 py-0">
                      {order.user.role}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground font-mono mt-0.5">
                  {order.user?.username && <span>@{order.user.username}</span>}
                  {order.user?.username && (order.user?.login_id || customerLoginId) && <span>•</span>}
                  {(order.user?.login_id || customerLoginId) && (
                    <span className="inline-flex items-center gap-1 bg-muted/60 px-1.5 py-0.5 rounded text-[11px]">
                      <span>ID: {order.user?.login_id || customerLoginId}</span>
                      <CopyButton
                        text={order.user?.login_id || customerLoginId}
                        label="User Login ID"
                        className="size-4"
                        iconClassName="size-3"
                      />
                    </span>
                  )}
                  {order.user?._id && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <span>UID: {String(order.user._id).slice(0, 8)}...</span>
                      <CopyButton
                        text={order.user._id}
                        label="User Database ID"
                        className="size-4"
                        iconClassName="size-3"
                      />
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t text-xs">
              {customerEmail && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="size-3.5 shrink-0 text-muted-foreground/70" />
                  <a
                    href={`mailto:${customerEmail}`}
                    className="truncate hover:text-foreground hover:underline"
                  >
                    {customerEmail}
                  </a>
                </div>
              )}
              {customerPhone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="size-3.5 shrink-0 text-muted-foreground/70" />
                  <a
                    href={`tel:${customerPhone}`}
                    className="hover:text-foreground hover:underline"
                  >
                    {customerPhone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address Card */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b pb-2.5">
              <MapPin className="size-3.5 text-primary" />
              Shipping Destination
            </h4>

            {formattedAddress ? (
              <div className="text-sm leading-relaxed text-foreground flex items-start gap-2.5">
                <MapPin className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                <p>{formattedAddress}</p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                No delivery address specified.
              </p>
            )}
          </div>

          {/* Pricing Summary Card */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b pb-2.5">
              <Receipt className="size-3.5 text-primary" />
              Financial Breakdown
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Items Subtotal</span>
                <span className="font-medium text-foreground">
                  ₹{Number(order.pricing?.subtotal || 0).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center text-muted-foreground">
                <span>Shipping Fee</span>
                <span className="font-medium text-foreground">
                  {Number(order.pricing?.shipping_cost || 0) === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">FREE</span>
                  ) : (
                    `₹${Number(order.pricing?.shipping_cost || 0).toFixed(2)}`
                  )}
                </span>
              </div>

              {Number(order.pricing?.tax || 0) > 0 && (
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Taxes & GST</span>
                  <span className="font-medium text-foreground">
                    ₹{Number(order.pricing?.tax || 0).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="border-t pt-2.5 mt-2 flex justify-between items-baseline">
                <span className="text-sm font-bold text-foreground">Total Paid / Payable</span>
                <span className="text-lg font-bold text-primary">
                  ₹{Number(order.pricing?.total || 0).toFixed(2)}
                </span>
              </div>

              {order.payment?.transaction_id && (
                <div className="border-t pt-2 mt-1 flex justify-between items-center text-[11px] text-muted-foreground">
                  <span>Transaction ID:</span>
                  <span className="font-mono font-medium text-foreground">
                    {order.payment.transaction_id}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <DialogFooter className="mt-2 pt-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-auto flex flex-wrap items-center gap-2">
          {onOpenRefund && isRefundEligible(order) && (
            <Button
              variant="destructive"
              size="default"
              onClick={() => {
                closeModal();
                onOpenRefund(order);
              }}
              className="w-full sm:w-auto font-medium"
            >
              Approve & Initiate Refund
            </Button>
          )}
          {onOpenChangeStatus && order.status !== "cancelled" && (
            <Button
              variant="default"
              size="default"
              onClick={handleOpenChangeStatus}
              className="gap-2 w-full sm:w-auto"
            >
              <RefreshCw className="size-4" />
              Update Fulfillment Status
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
