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
import formatdate from "@/core/utils/formatdate.util";
import { ORDER_STATUS_VARIANT } from "./order.schema";

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
                    <div className="text-lg font-semibold">{item.name || "-"}</div>
                    <div className="text-sm text-muted-foreground">
                      Quantity:{" "}
                      <span className="font-medium text-foreground">{item.quantity || 1}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Unit Price:{" "}
                      <span className="font-medium text-foreground">
                        ₹{Number(item.price || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Weight:{" "}
                      <span className="font-medium text-foreground">{item.weight || 0} kg</span>
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
              {[order.shipping_address?.door, order.shipping_address?.street, order.shipping_address?.city]
                .filter(Boolean)
                .join(", ")}
              {order.shipping_address?.stateName ? `, ${order.shipping_address.stateName}` : ""}
              {order.shipping_address?.pincode ? ` - ${order.shipping_address.pincode}` : ""}
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
              <Badge variant={ORDER_STATUS_VARIANT[order.status] || "outline"} className="text-sm px-3 py-1">
                {order.status}
              </Badge>
            </div>

            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="font-medium uppercase text-xs">{order.payment?.method}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Payment Status</span>
              <Badge variant={order.payment?.status === "paid" ? "default" : "outline"}>
                {order.payment?.status}
              </Badge>
            </div>

            {order.delivery_partner_url && (
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Delivery Tracking</span>
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
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium">₹{order.pricing?.shipping_cost}</span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">Total</span>
              <span className="text-base font-semibold">₹{order.pricing?.total}</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Status History
            </h4>
            <div className="space-y-1">
              {order.status_history?.map((h, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b text-sm last:border-b-0">
                  <span className="capitalize text-muted-foreground">{h.status}</span>
                  <span className="text-xs">{h.timestamp ? formatdate(h.timestamp) : "—"}</span>
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