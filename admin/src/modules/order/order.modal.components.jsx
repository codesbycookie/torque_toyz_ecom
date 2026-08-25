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


export const ViewOrder = ({ order, closeModal = () => {} }) => (
  <DialogContent className="w-xl">
    <DialogHeader>
      <DialogTitle>Order {order?.code}</DialogTitle>
      <DialogDescription>
        Placed on {order?.createdAt ? formatdate(order.createdAt) : "—"}
      </DialogDescription>
    </DialogHeader>

    <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Status</span>
        <Badge variant={ORDER_STATUS_VARIANT[order?.status] || "outline"}>{order?.status}</Badge>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Payment</span>
        <span className="text-sm">
          {order?.payment?.method?.toUpperCase()} • {order?.payment?.status}
        </span>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Items</p>
        <div className="rounded-md border divide-y">
          {order?.items?.map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2">
              <img src={item.image} alt={item.name} className="size-10 rounded object-cover" />
              <div className="flex-1">
                <p className="text-sm">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  Qty {item.quantity} • ₹{item.price} each
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Shipping Address</p>
        <p className="text-sm text-muted-foreground">
          {[order?.shipping_address?.door, order?.shipping_address?.street, order?.shipping_address?.city]
            .filter(Boolean)
            .join(", ")}
          {order?.shipping_address?.stateName ? `, ${order.shipping_address.stateName}` : ""}
          {order?.shipping_address?.pincode ? ` - ${order.shipping_address.pincode}` : ""}
        </p>
      </div>

      <div className="rounded-md border p-3 flex flex-col gap-1 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>₹{order?.pricing?.subtotal}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span>₹{order?.pricing?.shipping_cost}</span>
        </div>
        <div className="flex justify-between font-medium">
          <span>Total</span>
          <span>₹{order?.pricing?.total}</span>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Status History</p>
        <div className="flex flex-col gap-1">
          {order?.status_history?.map((h, i) => (
            <div key={i} className="flex justify-between text-xs text-muted-foreground">
              <span className="capitalize">{h.status}</span>
              <span>{h.timestamp ? formatdate(h.timestamp) : "—"}</span>
            </div>
          ))}
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