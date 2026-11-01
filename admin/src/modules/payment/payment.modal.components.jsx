import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import formatdate from "@/core/utils/formatdate.util";
import CopyButton from "@/components/ui/copy-button";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Hash,
  Mail,
  Package,
  Phone,
  Receipt,
  RefreshCw,
  ShoppingBag,
  User,
  XCircle,
  ShieldCheck,
  Building,
} from "lucide-react";

export const PAYMENT_STATUS_STYLES = {
  paid: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-semibold capitalize",
  created: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-semibold capitalize",
  failed: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 font-semibold capitalize",
  refunded: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30 font-semibold capitalize",
};

const getStatusIcon = (status) => {
  switch (status) {
    case "paid":
      return <CheckCircle2 className="size-3.5" />;
    case "created":
      return <Clock className="size-3.5" />;
    case "failed":
      return <XCircle className="size-3.5" />;
    case "refunded":
      return <RefreshCw className="size-3.5" />;
    default:
      return <CreditCard className="size-3.5" />;
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

export const View = ({ payment, onRefund, closeModal = () => { } }) => {
  if (!payment) return null;

  const order = payment.order && typeof payment.order === "object" ? payment.order : null;
  const customer = order?.user && typeof order.user === "object" ? order.user : null;
  const items = Array.isArray(order?.items) ? order.items : [];
  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const customerName =
    customer?.name ||
    order?.shipping_address?.name ||
    (order?.guest_id ? `Guest (${order.guest_id.slice(0, 8)})` : "Customer");

  const orderCode = order?.code || (typeof payment.order === "string" ? payment.order : "—");
  const isPaid = payment.status === "paid";

  const handleRefund = () => {
    closeModal();
    onRefund?.(payment);
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
                  {payment.razorpay_order_id}
                </DialogTitle>
                <CopyButton text={payment.razorpay_order_id} label="Razorpay Order ID" />
              </div>
              <Badge
                className={`flex items-center gap-1.5 px-2.5 py-0.5 text-xs ${PAYMENT_STATUS_STYLES[payment.status] || "bg-secondary text-secondary-foreground"
                  }`}
              >
                {getStatusIcon(payment.status)}
                {payment.status}
              </Badge>
              <Badge variant="outline" className="text-xs uppercase font-mono px-2 py-0.5">
                {payment.currency || "INR"}
              </Badge>
            </div>
            <DialogDescription className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="size-3.5" />
              Created on {payment.createdAt ? formatdate(payment.createdAt) : "—"}
            </DialogDescription>
          </div>

          <div className="flex items-center gap-2">
            {isPaid && onRefund && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefund}
                className="gap-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
              >
                <RefreshCw className="size-3.5" />
                Initiate Refund
              </Button>
            )}
          </div>
        </div>
      </DialogHeader>

      {/* Failure Alert Banner (if failed or failure_reason exists) */}
      {payment.failure_reason && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold">Payment Failure Notice:</span>
            <p className="font-mono">{payment.failure_reason}</p>
          </div>
        </div>
      )}

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border bg-muted/30 p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Receipt className="size-3.5 text-primary" />
            <span>Amount</span>
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground">
            ₹{Number(payment.amount || 0).toFixed(2)}
          </div>
        </div>

        <div className="rounded-xl border bg-muted/30 p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <CreditCard className="size-3.5 text-primary" />
            <span>Status</span>
          </div>
          <div className="text-sm font-semibold capitalize text-foreground flex items-center gap-1">
            {payment.status}
          </div>
        </div>

        <div className="rounded-xl border bg-muted/30 p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Hash className="size-3.5 text-primary" />
            <span>Payment ID</span>
          </div>
          <div className="text-xs font-mono font-semibold text-foreground flex items-center gap-1 truncate">
            <span className="truncate">{payment.razorpay_payment_id || "Pending"}</span>
            {payment.razorpay_payment_id && (
              <CopyButton text={payment.razorpay_payment_id} label="Payment ID" className="size-4" iconClassName="size-3" />
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-muted/30 p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <ShoppingBag className="size-3.5 text-primary" />
            <span>Linked Order</span>
          </div>
          <div className="text-sm font-mono font-semibold text-foreground flex items-center gap-1 truncate">
            <span className="truncate">{orderCode}</span>
            {orderCode !== "—" && (
              <CopyButton text={orderCode} label="Order Code" className="size-4" iconClassName="size-3" />
            )}
          </div>
        </div>
      </div>

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Linked Order & Purchased Items) - 7 cols */}
        <div className="lg:col-span-7 space-y-5">
          {/* Order Overview & Items */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2.5">
              <div className="flex items-center gap-2">
                <Package className="size-3.5 text-primary" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Order Items ({items.length})
                </h4>
              </div>
              {order?.status && (
                <Badge variant="outline" className="text-[11px] capitalize">
                  Order: {order.status}
                </Badge>
              )}
            </div>

            {items.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                <Package className="size-8 mx-auto text-muted-foreground/40 mb-2" />
                <p>Order details will populate upon sync.</p>
                <div className="mt-1 font-mono text-foreground font-medium flex items-center justify-center gap-1">
                  <span>Ref: {orderCode}</span>
                  {orderCode !== "—" && <CopyButton text={orderCode} label="Order Ref" className="size-4" iconClassName="size-3" />}
                </div>
              </div>
            ) : (
              <div className="space-y-3 divide-y">
                {items.map((item, i) => (
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
            )}
          </div>
        </div>

        {/* Right Column (Gateway Details) - 5 cols */}
        <div className="lg:col-span-5 space-y-5">
          {/* Gateway Identifiers Card */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b pb-2.5">
              <ShieldCheck className="size-3.5 text-primary" />
              Gateway Verification
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Gateway</span>
                <span className="font-semibold text-foreground">Razorpay</span>
              </div>

              <div className="flex justify-between items-center py-1 border-t">
                <span className="text-muted-foreground">Razorpay Order</span>
                <div className="flex items-center gap-1 font-mono text-[11px] text-foreground">
                  <span className="truncate max-w-[150px]">{payment.razorpay_order_id}</span>
                  <CopyButton text={payment.razorpay_order_id} label="Razorpay Order ID" className="size-4" iconClassName="size-3" />
                </div>
              </div>

              <div className="flex justify-between items-center py-1 border-t">
                <span className="text-muted-foreground">Payment ID</span>
                <div className="flex items-center gap-1 font-mono text-[11px] text-foreground">
                  <span className="truncate max-w-[150px]">{payment.razorpay_payment_id || "—"}</span>
                  {payment.razorpay_payment_id && (
                    <CopyButton text={payment.razorpay_payment_id} label="Payment ID" className="size-4" iconClassName="size-3" />
                  )}
                </div>
              </div>

              {payment.razorpay_signature && (
                <div className="flex justify-between items-center py-1 border-t">
                  <span className="text-muted-foreground">Signature</span>
                  <div className="flex items-center gap-1 font-mono text-[11px] text-foreground">
                    <span className="truncate max-w-[150px]">{payment.razorpay_signature.slice(0, 12)}...</span>
                    <CopyButton text={payment.razorpay_signature} label="Signature" className="size-4" iconClassName="size-3" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Row: Customer Details & Financial Breakdown (col-6 col-6) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Customer Details Card (col-6) */}
        <div className="rounded-xl border bg-card p-4 space-y-3 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b pb-2.5">
              <User className="size-3.5 text-primary" />
              Customer Details
            </h4>

            <div className="flex items-center gap-3 pt-3">
              {customer?.profile?.url ? (
                <img
                  src={customer.profile.url}
                  alt={customerName}
                  className="size-11 rounded-full object-cover border border-primary/20 shrink-0"
                />
              ) : (
                <div className="size-11 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center border border-primary/20 shrink-0 text-sm">
                  {getInitials(customerName)}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold truncate text-foreground">
                  {customerName}
                </div>
                {customer?.login_id && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono mt-0.5">
                    <span>ID: {customer.login_id}</span>
                    <CopyButton text={customer.login_id} label="Customer ID" className="size-4" iconClassName="size-3" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {(customer?.email || customer?.phone) ? (
            <div className="space-y-1.5 pt-3 border-t text-xs">
              {customer.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="size-3.5 shrink-0" />
                  <a href={`mailto:${customer.email}`} className="truncate hover:text-foreground hover:underline">
                    {customer.email}
                  </a>
                </div>
              )}
              {customer.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="size-3.5 shrink-0" />
                  <a href={`tel:${customer.phone}`} className="hover:text-foreground hover:underline">
                    {customer.phone}
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="pt-2 text-xs text-muted-foreground italic border-t">
              No additional contact details available.
            </div>
          )}
        </div>

        {/* Financial Breakdown Card (col-6) */}
        <div className="rounded-xl border bg-card p-4 space-y-3 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b pb-2.5">
              <Receipt className="size-3.5 text-primary" />
              Financial Breakdown
            </h4>

            <div className="space-y-2.5 text-xs pt-2">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Currency</span>
                <span className="font-semibold text-foreground uppercase">{payment.currency || "INR"}</span>
              </div>

              <div className="flex justify-between items-center text-muted-foreground">
                <span>Payment Status</span>
                <span className="capitalize font-semibold text-foreground">{payment.status}</span>
              </div>

              <div className="flex justify-between items-center text-muted-foreground">
                <span>Captured Total</span>
                <span className="font-semibold text-foreground">₹{Number(payment.amount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-2.5 flex justify-between items-baseline">
            <span className="text-sm font-bold text-foreground">Total Paid</span>
            <span className="text-xl font-bold text-primary">₹{Number(payment.amount || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <DialogFooter className="mt-2 pt-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-auto">
          {isPaid && onRefund && (
            <Button
              variant="destructive"
              size="default"
              onClick={handleRefund}
              className="gap-2 w-full sm:w-auto"
            >
              <RefreshCw className="size-4" />
              Initiate Refund
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

export const Refund = ({
  payment,
  closeModal = () => { },
  submitFn = () => { },
}) => {
  if (!payment) return null;

  return (
    <DialogContent className="sm:max-w-md w-full">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-lg text-destructive">
          <RefreshCw className="size-5" />
          Initiate Payment Refund
        </DialogTitle>
        <DialogDescription>
          Are you sure you want to refund this payment?
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3 py-2 text-sm">
        <div className="p-3.5 rounded-xl border border-destructive/20 bg-destructive/5 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Refund Amount</span>
            <span className="text-base font-bold text-foreground">
              {payment.currency || "INR"} {Number(payment.amount).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center border-t pt-2 text-xs">
            <span className="text-muted-foreground">Razorpay Order</span>
            <span className="font-mono font-medium text-foreground">{payment.razorpay_order_id}</span>
          </div>

          {payment.razorpay_payment_id && (
            <div className="flex justify-between items-center border-t pt-2 text-xs">
              <span className="text-muted-foreground">Payment ID</span>
              <span className="font-mono font-medium text-foreground">{payment.razorpay_payment_id}</span>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          This will trigger a refund through Razorpay and update the order payment status to refunded.
        </p>
      </div>

      <DialogFooter className="mt-4 gap-2">
        <DialogClose asChild>
          <Button variant="outline" size="default">
            Cancel
          </Button>
        </DialogClose>
        <Button
          variant="destructive"
          size="default"
          onClick={() => {
            try {
              submitFn(payment.order?._id || payment.order || payment._id);
            } finally {
              closeModal();
            }
          }}
        >
          Confirm & Refund
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};
