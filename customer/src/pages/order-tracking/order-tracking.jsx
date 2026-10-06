import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  CheckCircle2,
  Circle,
  Truck,
  Package,
  PackageCheck,
  Loader2,
  ExternalLink,
  AlertTriangle,
  CreditCard,
  MapPin,
  Clock,
  ArrowLeft,
  XCircle,
  Ban,
} from "lucide-react";
import { useApi } from "@/core/contexts/api.context";
import { useLoader } from "@/core/hooks/useLoader";

export default function OrderTracking() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { orders } = useApi();
  const { loadOnly, loading } = useLoader();

  const [cancelReason, setCancelReason] = useState("Changed my mind");
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (id) {
      loadOnly(async () => {
        try {
          await orders.getOne(id);
        } catch {
          orders.setCurrent(null);
        }
      });
    }
  }, [id]);

  const orderDetails = orders.current;

  const handleCancelOrder = async () => {
    if (!orderDetails) return;
    const orderId = orderDetails._id || orderDetails.id;
    try {
      setIsCancelling(true);
      await orders.cancelOrder(orderId, cancelReason);
      toast.success("Order cancelled successfully");
    } catch {
      toast.error("Failed to cancel order");
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="container mx-auto p-6 max-w-2xl text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold">Order Not Found</h2>
        <p className="text-muted-foreground">
          We couldn't locate the order details. Please verify the order link or try again.
        </p>
        <Button onClick={() => navigate("/orders")} variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Order History
        </Button>
      </div>
    );
  }

  const statusLower = orderDetails.status?.toLowerCase();
  const isCancelled = statusLower === "cancelled";
  const canCancel = ["placed", "confirmed"].includes(statusLower);

  // Build status history lookup map
  const historyMap = {};
  if (Array.isArray(orderDetails.status_history)) {
    orderDetails.status_history.forEach((h) => {
      if (h.status) {
        historyMap[h.status.toLowerCase()] = h;
      }
    });
  }

  const formatStepDate = (statusKey, defaultDate) => {
    const historyEntry = historyMap[statusKey];
    if (historyEntry?.timestamp) {
      return new Date(historyEntry.timestamp).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    if (statusKey === "placed" && (orderDetails.createdAt || orderDetails.date)) {
      return new Date(orderDetails.createdAt || orderDetails.date).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return defaultDate || "Pending";
  };

  const statusRankMap = {
    placed: 1,
    confirmed: 2,
    shipped: 3,
    delivered: 4,
  };

  const currentRank = statusRankMap[statusLower] || (isCancelled ? 0 : 1);

  const pipelineSteps = [
    {
      key: "placed",
      label: "Order Placed",
      icon: <Package className="h-5 w-5" />,
      note: historyMap.placed?.note || "Order received by store",
    },
    {
      key: "confirmed",
      label: "Confirmed & Processing",
      icon: <PackageCheck className="h-5 w-5" />,
      note: historyMap.confirmed?.note || "Order is being packed and prepared",
    },
    {
      key: "shipped",
      label: "Shipped",
      icon: <Truck className="h-5 w-5" />,
      note: historyMap.shipped?.note || "Order is on its way",
    },
    {
      key: "delivered",
      label: "Delivered",
      icon: <CheckCircle2 className="h-5 w-5" />,
      note: historyMap.delivered?.note || "Package delivered to destination",
    },
  ];

  const getStepState = (stepKey) => {
    const stepRank = statusRankMap[stepKey];
    if (isCancelled) {
      return historyMap[stepKey]
        ? { status: "completed", date: formatStepDate(stepKey) }
        : { status: "pending", date: "Cancelled" };
    }
    if (stepRank < currentRank) {
      return { status: "completed", date: formatStepDate(stepKey) };
    }
    if (stepRank === currentRank) {
      return {
        status: orderDetails.status === "delivered" ? "completed" : "current",
        date: formatStepDate(stepKey),
      };
    }
    return { status: "pending", date: "Pending" };
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">Delivered</Badge>;
      case "shipped":
        return <Badge className="bg-blue-600 hover:bg-blue-700 text-white">Shipped</Badge>;
      case "confirmed":
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-black">Confirmed</Badge>;
      case "placed":
        return <Badge className="bg-sky-600 hover:bg-sky-700 text-white">Order Placed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status || "Processing"}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl animate-in fade-in zoom-in duration-500 space-y-6">
      {/* Page Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              Order #{orderDetails.code || orderDetails._id || orderDetails.id}
            </h1>
            {getStatusBadge(orderDetails.status)}
          </div>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> Placed on{" "}
            {new Date(orderDetails.createdAt || orderDetails.date).toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate("/orders")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
          </Button>

          {/* Cancel Order Dialog Trigger */}
          {canCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2" disabled={isCancelling}>
                  <Ban className="h-4 w-4" /> Cancel Order
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                    <XCircle className="h-5 w-5" /> Cancel Order #{orderDetails.code || orderDetails._id}?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-3 pt-2">
                    <span>
                      Are you sure you want to cancel this order? This action cannot be undone and item quantities will be restocked.
                    </span>
                    <div className="space-y-1.5 text-left pt-2">
                      <label className="text-xs font-semibold text-foreground">Reason for Cancellation:</label>
                      <Select value={cancelReason} onValueChange={setCancelReason}>
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Changed my mind">Changed my mind</SelectItem>
                          <SelectItem value="Ordered by mistake">Ordered by mistake</SelectItem>
                          <SelectItem value="Incorrect shipping address">Incorrect shipping address</SelectItem>
                          <SelectItem value="Found a better price elsewhere">Found a better price elsewhere</SelectItem>
                          <SelectItem value="Delivery time is too long">Delivery time is too long</SelectItem>
                          <SelectItem value="Other">Other reason</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Order</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelOrder}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Confirm Cancellation
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Cancelled Alert Banner */}
      {isCancelled && (
        <Card className="border-destructive/40 bg-destructive/10">
          <CardContent className="pt-6 flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive text-lg">Order Cancelled</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {historyMap.cancelled?.note || "This order was cancelled."}
              </p>
              {historyMap.cancelled?.timestamp && (
                <p className="text-xs text-muted-foreground mt-2">
                  Cancelled at: {new Date(historyMap.cancelled.timestamp).toLocaleString("en-IN")}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Carrier Tracking Feed */}
      {orderDetails.delivery_partner_url && !isCancelled && (
        <Card className="overflow-hidden border-primary/30 shadow-md">
          <CardHeader className="bg-muted/30 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" /> Live Delivery Partner Tracking
              </CardTitle>
              <CardDescription>
                Embedded live tracking feed from carrier partner
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
              <a href={orderDetails.delivery_partner_url} target="_blank" rel="noopener noreferrer">
                Open in New Tab <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </a>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative w-full h-[500px] bg-muted/20">
              <iframe
                src={orderDetails.delivery_partner_url}
                title="Delivery Partner Live Tracking"
                className="w-full h-full border-0 rounded-b-xl"
                allow="geolocation; autoplay; clipboard-write"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tracking Status</CardTitle>
              <CardDescription>Live timeline of your shipment status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative border-l-2 border-muted ml-4 space-y-8 pb-4 mt-2">
                {pipelineSteps.map((step) => {
                  const state = getStepState(step.key);
                  const isCompleted = state.status === "completed";
                  const isCurrent = state.status === "current";

                  return (
                    <div key={step.key} className="relative flex items-start pl-8 group">
                      <div
                        className={`absolute -left-[17px] top-1 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background transition-colors ${
                          isCompleted
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : isCurrent
                            ? "border-primary text-primary ring-4 ring-primary/20"
                            : "border-muted text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : isCurrent ? (
                          <Circle className="h-3 w-3 fill-primary" />
                        ) : (
                          <Circle className="h-3 w-3 fill-muted" />
                        )}
                      </div>

                      <div className="flex-1 bg-muted/30 p-4 rounded-xl space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div className="flex items-center gap-2">
                            <span className={isCurrent ? "text-primary" : isCompleted ? "text-emerald-600" : "text-muted-foreground"}>
                              {step.icon}
                            </span>
                            <h4 className={`font-semibold ${state.status === "pending" ? "text-muted-foreground" : ""}`}>
                              {step.label}
                            </h4>
                          </div>
                          <span className={`text-xs font-medium ${isCurrent ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                            {state.date}
                          </span>
                        </div>
                        {step.note && state.status !== "pending" && (
                          <p className="text-xs text-muted-foreground pt-1">{step.note}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Items Ordered</CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {(orderDetails.items || orderDetails.products || []).map((item, idx) => {
                const prod = item.product || item;
                const quantity = item.quantity || 1;
                const price = item.price || prod.price || 0;

                return (
                  <div key={idx} className="flex items-center space-x-4 py-3 first:pt-0 last:pb-0">
                    <div className="h-16 w-16 bg-muted rounded-lg overflow-hidden shrink-0 border">
                      <img
                        src={item.image || prod.images?.[0] || prod.image || "https://placehold.co/150"}
                        alt={item.name || prod.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{item.name || prod.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Qty: {quantity} × ₹{price.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="font-semibold text-sm">
                      ₹{(price * quantity).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{(orderDetails.pricing?.subtotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GST / Tax</span>
                <span>₹{(orderDetails.pricing?.tax || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {orderDetails.pricing?.shipping_cost > 0
                    ? `₹${orderDetails.pricing.shipping_cost.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                    : "Free"}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total Amount</span>
                <span className="text-primary">
                  ₹{(orderDetails.pricing?.total || orderDetails.total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1.5 text-muted-foreground">
              <p className="font-medium text-foreground">
                {typeof orderDetails.user === "object" ? orderDetails.user?.name : String(orderDetails.user || "Customer")}
              </p>
              {orderDetails.shipping_address && (
                <>
                  <p>
                    {[orderDetails.shipping_address.door, orderDetails.shipping_address.street, orderDetails.shipping_address.city]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  <p>
                    {typeof orderDetails.shipping_address.state === "object"
                      ? orderDetails.shipping_address.state?.state || orderDetails.shipping_address.state?.name || orderDetails.shipping_address.state?.code || ""
                      : String(orderDetails.shipping_address.state || "")}{" "}
                    {orderDetails.shipping_address.pincode ? `- ${orderDetails.shipping_address.pincode}` : ""}
                  </p>
                </>
              )}
              {orderDetails.user?.phone && <p className="text-xs pt-1">Phone: {orderDetails.user.phone}</p>}
            </CardContent>
          </Card>

          {orderDetails.payment && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" /> Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Method</span>
                  <span className="font-semibold uppercase">{orderDetails.payment.method}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Payment Status</span>
                  <Badge variant={orderDetails.payment.status === "paid" ? "default" : "outline"} className="capitalize">
                    {orderDetails.payment.status}
                  </Badge>
                </div>
                {orderDetails.payment.transaction_id && (
                  <div className="flex justify-between items-center text-xs pt-1 border-t">
                    <span className="text-muted-foreground">Transaction ID</span>
                    <span className="font-mono text-[11px] truncate max-w-[150px]">{orderDetails.payment.transaction_id}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
