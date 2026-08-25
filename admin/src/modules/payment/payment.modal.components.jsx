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

const statusVariant = {
  created: "secondary",
  paid: "default",
  failed: "destructive",
  refunded: "outline",
};

export const View = ({ payment, closeModal = () => {} }) => {
  if (!payment) return null;

  const order = payment.order || {};

  return (
    <DialogContent className="sm:max-w-3xl w-full">
      <DialogHeader>
        <DialogTitle className="text-xl">Payment Details</DialogTitle>
        <DialogDescription>
          Razorpay Order: <span className="font-mono">{payment.razorpay_order_id}</span>
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
        {/* Left – Order Item */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Order Item
          </h4>

          <div className="flex gap-5 items-start">
            {order.image && (
              <img
                src={order.image}
                alt={order.name}
                className="size-28 rounded-lg object-cover border shadow-sm"
              />
            )}
            <div className="space-y-2">
              <div className="text-lg font-semibold">{order.name || "-"}</div>
              <div className="text-sm text-muted-foreground">
                Quantity: <span className="font-medium text-foreground">{order.quantity || 1}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Unit Price: <span className="font-medium text-foreground">₹{Number(order.price || 0).toFixed(2)}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Weight: <span className="font-medium text-foreground">{order.weight || 0} kg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right – Payment Info */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Payment Information
          </h4>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Razorpay Order ID</span>
              <span className="font-mono text-xs">{payment.razorpay_order_id}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Payment ID</span>
              <span className="font-mono text-xs">
                {payment.razorpay_payment_id || "-"}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Amount Paid</span>
              <span className="text-base font-semibold">
                {payment.currency || "INR"} {Number(payment.amount).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={statusVariant[payment.status] || "secondary"} className="text-sm px-3 py-1">
                {payment.status}
              </Badge>
            </div>

            {payment.failure_reason && (
              <div className="flex justify-between items-start py-2">
                <span className="text-muted-foreground">Failure Reason</span>
                <span className="text-right max-w-[260px] text-destructive font-medium">
                  {payment.failure_reason}
                </span>
              </div>
            )}
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
  );
};