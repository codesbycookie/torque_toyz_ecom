import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
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
  Truck,
  Package,
  ExternalLink,
  AlertTriangle,
  CreditCard,
  MapPin,
  Clock,
  ArrowLeft,
  Ban,
  RotateCcw,
  Copy,
  Printer,
  ChevronDown,
  ChevronUp,
  Share2,
  FileText,
  ShieldCheck,
  Check,
  Phone,
  Mail,
  Weight,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { useApi } from "@/core/contexts/api.context";
import { useLoader } from "@/core/hooks/useLoader";
import { cn } from "@/lib/utils";

export default function OrderTracking() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeView = searchParams.get("view") || "tracking"; // "tracking" | "invoice"

  const { orders, cart } = useApi();
  const { loadOnly, loading } = useLoader();

  const [showAllUpdates, setShowAllUpdates] = useState(true);
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

  const handleBuyAgain = async (item) => {
    const product = item.product || item;
    try {
      await cart.addToCart(product, 1);
      toast.success(`"${item.name || product.name}" added back to your cart!`);
    } catch {
      toast.error("Failed to re-add item to cart");
    }
  };

  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard`);
  };

  const handleShareTracking = () => {
    const url = window.location.href;
    const currentCode =
      orderDetails?.code ||
      (orderDetails?._id ? orderDetails._id.slice(-8).toUpperCase() : "ORD");
    if (navigator.share) {
      navigator.share({
        title: `Track Order #${currentCode} | Torque Toyzz`,
        text: `Track delivery status for order #${currentCode}:`,
        url,
      }).catch(() => {
        copyToClipboard(url, "Tracking link");
      });
    } else {
      copyToClipboard(url, "Tracking link");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <Skeleton className="h-4 w-48 rounded" />
          <div className="flex justify-between items-center pb-3 border-b border-border/80">
            <Skeleton className="h-9 w-64 rounded-xl" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-28 rounded-xl" />
              <Skeleton className="h-9 w-28 rounded-xl" />
            </div>
          </div>
          <Skeleton className="h-56 w-full rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Skeleton className="lg:col-span-8 h-96 rounded-2xl" />
            <Skeleton className="lg:col-span-4 h-96 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4 p-8 rounded-2xl border border-border/80 bg-card shadow-2xs">
          <div className="size-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto shadow-2xs">
            <Package className="size-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Order Not Found</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We couldn't locate this order in your garage records. The order ID may be incorrect or you may not have permission to view it.
          </p>
          <Button
            onClick={() => navigate("/orders")}
            className="w-full mt-2 h-9 rounded-xl text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="mr-2 size-3.5" /> Return to Your Orders
          </Button>
        </div>
      </div>
    );
  }

  // ─── Extract Data Strictly Matching Backend IOrder Model ───────────────────
  const orderId = orderDetails._id || orderDetails.id;
  const orderCode =
    orderDetails.code || (orderDetails._id ? `ORD-${orderDetails._id.slice(-6).toUpperCase()}` : "ORD");
  
  const orderCreatedAt = orderDetails.createdAt ? new Date(orderDetails.createdAt) : new Date();
  const orderUpdatedAt = orderDetails.updatedAt ? new Date(orderDetails.updatedAt) : null;
  const orderDateFormatted = orderCreatedAt.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const orderDateShort = orderCreatedAt.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const status = (orderDetails.status || "placed").toLowerCase();
  const isPlaced = status === "placed";
  const isConfirmed = status === "confirmed";
  const isShipped = status === "shipped";
  const isDelivered = status === "delivered";
  const isCancelled = status === "cancelled";
  const canCancel = ["placed", "confirmed"].includes(status);

  // Status History array directly from backend model: IStatusEntry[]
  const statusHistory = Array.isArray(orderDetails.status_history)
    ? orderDetails.status_history
    : [];

  const historyMap = {};
  statusHistory.forEach((entry) => {
    if (entry.status) {
      historyMap[entry.status.toLowerCase()] = entry;
    }
  });

  // Items from model: IOrderItem[]
  const items = Array.isArray(orderDetails.items) ? orderDetails.items : [];

  // Pricing from model: IPricing
  const pricing = orderDetails.pricing || {
    subtotal: 0,
    tax: 0,
    total_weight: 0,
    shipping_cost: 0,
    total: 0,
  };
  const totalWeightKg = Number(pricing.total_weight || 0);

  // Shipping Address from model: IShippingAddress
  const shippingAddress = orderDetails.shipping_address || {};
  const stateDisplay =
    typeof shippingAddress.state === "object" && shippingAddress.state !== null
      ? shippingAddress.state.state || shippingAddress.state.name || shippingAddress.state.code || ""
      : String(shippingAddress.state || "");
  const stateCode =
    typeof shippingAddress.state === "object" && shippingAddress.state !== null
      ? shippingAddress.state.code || ""
      : "";

  // User from model: populated with 'name email phone'
  const user = typeof orderDetails.user === "object" && orderDetails.user !== null ? orderDetails.user : {};
  const customerName = user.name || "Customer";
  const customerPhone = user.phone || "";
  const customerEmail = user.email || "";

  // Payment from model: IPayment ({ method: 'cod'|'online', status: 'pending'|'paid'|'failed'|'refunded', transaction_id })
  const payment = orderDetails.payment || {
    method: "online",
    status: "pending",
  };
  const paymentMethodLabel =
    payment.method === "cod" ? "Cash on Delivery" : "Prepaid Online Payment";
  const isPaymentPaid = payment.status === "paid";

  // Delivery Partner URL from model: string
  const deliveryPartnerUrl = orderDetails.delivery_partner_url || "";

  // 4 Pipeline Milestones matching the exact backend OrderStatus progression
  const statusRankMap = {
    placed: 1,
    confirmed: 2,
    shipped: 3,
    delivered: 4,
  };
  const currentRank = statusRankMap[status] || (isCancelled ? 0 : 1);

  const formatCheckpointDate = (statusKey) => {
    const entry = historyMap[statusKey];
    if (entry?.timestamp) {
      return new Date(entry.timestamp).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    if (statusKey === "placed" && orderDetails.createdAt) {
      return new Date(orderDetails.createdAt).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return "Pending";
  };

  const pipelineMilestones = [
    {
      key: "placed",
      title: "Order Placed",
      subTitle: "Verified in system",
      icon: Package,
      note: historyMap.placed?.note || "Order registered and payment verified",
    },
    {
      key: "confirmed",
      title: "Confirmed & Boxed",
      subTitle: "Garage inspection",
      icon: ShieldCheck,
      note: historyMap.confirmed?.note || "Precision models inspected and prepared for courier",
    },
    {
      key: "shipped",
      title: "Dispatched",
      subTitle: "With courier partner",
      icon: Truck,
      note: historyMap.shipped?.note || "Package handed to courier and en route",
    },
    {
      key: "delivered",
      title: "Delivered",
      subTitle: "At doorstep",
      icon: CheckCircle2,
      note: historyMap.delivered?.note || "Delivered successfully to shipping destination",
    },
  ];

  const getMilestoneState = (key) => {
    const rank = statusRankMap[key];
    if (isCancelled) {
      return historyMap[key]
        ? { state: "completed", date: formatCheckpointDate(key) }
        : { state: "cancelled", date: "Cancelled" };
    }
    if (rank < currentRank) {
      return { state: "completed", date: formatCheckpointDate(key) };
    }
    if (rank === currentRank) {
      return {
        state: isDelivered ? "completed" : "current",
        date: formatCheckpointDate(key),
      };
    }
    return { state: "pending", date: "Pending" };
  };

  // Build Chronological Tracking Scans Log from status_history
  let trackingScans = [];
  if (statusHistory.length > 0) {
    trackingScans = [...statusHistory]
      .map((entry) => ({
        status: entry.status,
        title: entry.status ? entry.status.charAt(0).toUpperCase() + entry.status.slice(1) : "Update",
        date: entry.timestamp
          ? new Date(entry.timestamp).toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Recent",
        note: entry.note || "Order status recorded in Torque fulfillment system",
      }))
      .reverse();
  } else {
    if (isDelivered) {
      trackingScans.push({
        status: "delivered",
        title: "Delivered",
        date: formatCheckpointDate("delivered"),
        note: "Package safely delivered to resident at designated destination address.",
      });
    }
    if (isShipped || isDelivered) {
      trackingScans.push({
        status: "shipped",
        title: "Dispatched with Carrier",
        date: formatCheckpointDate("shipped"),
        note: "Package departed local distribution center and is out for delivery.",
      });
    }
    if (isConfirmed || isShipped || isDelivered) {
      trackingScans.push({
        status: "confirmed",
        title: "Confirmed & Boxed",
        date: formatCheckpointDate("confirmed"),
        note: "Scale models inspected and packed in reinforced garage packaging.",
      });
    }
    trackingScans.push({
      status: "placed",
      title: "Order Placed",
      date: formatCheckpointDate("placed"),
      note: "Order recorded and verified online by customer.",
    });
  }

  const getStatusBadge = (s) => {
    switch (s?.toLowerCase()) {
      case "delivered":
        return (
          <Badge className="bg-primary text-primary-foreground font-semibold gap-1.5 px-3 py-1 text-xs">
            <CheckCircle2 className="size-3.5" /> Delivered
          </Badge>
        );
      case "shipped":
        return (
          <Badge className="bg-primary/80 text-primary-foreground font-semibold gap-1.5 px-3 py-1 text-xs">
            <Truck className="size-3.5" /> Dispatched • In Transit
          </Badge>
        );
      case "confirmed":
        return (
          <Badge className="bg-primary/20 text-primary border border-primary/30 font-semibold gap-1.5 px-3 py-1 text-xs">
            <Check className="size-3.5" /> Confirmed
          </Badge>
        );
      case "placed":
        return (
          <Badge className="bg-primary/10 text-primary border border-primary/20 font-semibold gap-1.5 px-3 py-1 text-xs">
            <Clock className="size-3.5" /> Placed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-destructive/10 text-destructive border border-destructive/20 font-semibold gap-1.5 px-3 py-1 text-xs">
            <Ban className="size-3.5" /> Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="font-semibold text-xs capitalize">
            {s || "Processing"}
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ─── Breadcrumbs & Action Bar ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
            <Link to="/profile" className="hover:text-primary transition-colors">
              Your Account
            </Link>
            <span>›</span>
            <Link to="/orders" className="hover:text-primary transition-colors">
              Your Orders
            </Link>
            <span>›</span>
            <span className="font-mono text-foreground font-semibold">#{orderCode}</span>
            <span>›</span>
            <span className="text-foreground font-bold">
              {activeView === "invoice" ? "Official Invoice" : "Live Delivery Tracking"}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareTracking}
              className="h-8.5 rounded-xl text-xs gap-1.5 font-medium cursor-pointer"
            >
              <Share2 className="size-3.5 text-primary" />
              <span>Share</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="h-8.5 rounded-xl text-xs gap-1.5 font-medium cursor-pointer"
            >
              <Printer className="size-3.5 text-muted-foreground" />
              <span>Print</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/orders")}
              className="h-8.5 rounded-xl text-xs gap-1.5 font-medium cursor-pointer"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Orders</span>
            </Button>
          </div>
        </div>

        {/* ─── Hero Delivery Tracker Card ─── */}
        <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
          {/* Header Strip with Order Code, Live Status & Metadata */}
          <div className="p-6 sm:p-8 border-b border-border/70 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  Order Reference:
                </span>
                <span className="font-mono font-extrabold text-foreground text-sm">
                  #{orderCode}
                </span>
                {getStatusBadge(orderDetails.status)}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground">
                {isDelivered
                  ? `Delivered on ${orderDateShort}`
                  : isShipped
                  ? "Dispatched & In Transit"
                  : isConfirmed
                  ? "Inspected & Boxed in Garage"
                  : isCancelled
                  ? "Order Was Cancelled"
                  : "Order Placed & Confirmed"}
              </h1>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
                {isDelivered
                  ? `Package delivered safely on ${orderDateFormatted}. Your scale model collection has been updated.`
                  : isShipped
                  ? "Package is currently in transit with our logistics partner and headed toward your local hub."
                  : isCancelled
                  ? "This order was cancelled and inventory quantities were restored to the catalog."
                  : "Your order is confirmed and our technicians are inspecting precision models prior to boxing."}
              </p>
            </div>

            {/* Logistics & Dispatch Summary Pill */}
            <div className="bg-muted/40 dark:bg-muted/20 border border-border/80 rounded-xl p-4 shrink-0 space-y-2 text-xs md:min-w-[260px]">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Order Placed</span>
                <span className="text-foreground font-semibold">{orderDateShort}</span>
              </div>
              
              {totalWeightKg > 0 && (
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Weight className="size-3 text-primary" /> Total Weight
                  </span>
                  <span className="text-foreground font-semibold">{totalWeightKg} kg</span>
                </div>
              )}

              <div className="flex items-center justify-between text-muted-foreground">
                <span>Payment Method</span>
                <span className="text-foreground font-semibold uppercase">{payment.method}</span>
              </div>

              <div className="flex items-center justify-between text-muted-foreground pt-1 border-t border-border/60">
                <span>Order Total</span>
                <strong className="text-primary font-bold text-sm">
                  ₹{Number(pricing.total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </strong>
              </div>
            </div>
          </div>

          {/* ─── 4-Stage Visual Delivery Stepper ─── */}
          {!isCancelled && (
            <div className="p-6 sm:p-8 bg-muted/10">
              <div className="relative">
                {/* Background Connecting Line */}
                <div className="hidden sm:block absolute left-[12%] right-[12%] top-5.5 h-1 bg-border rounded-full" />

                {/* Active Colored Fill Line */}
                <div
                  className={cn(
                    "hidden sm:block absolute left-[12%] top-5.5 h-1 rounded-full transition-all duration-700 bg-primary",
                    isDelivered
                      ? "right-[12%]"
                      : currentRank === 3
                      ? "w-[50%]"
                      : currentRank === 2
                      ? "w-[25%]"
                      : "w-0"
                  )}
                />

                {/* Milestones */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-2">
                  {pipelineMilestones.map((milestone) => {
                    const stepState = getMilestoneState(milestone.key);
                    const isCompleted = stepState.state === "completed";
                    const isCurrent = stepState.state === "current";
                    const StepIcon = milestone.icon;

                    return (
                      <div key={milestone.key} className="flex flex-col items-center text-center relative z-10">
                        <div
                          className={cn(
                            "size-11 sm:size-12 rounded-2xl flex items-center justify-center border-2 transition-all shadow-xs",
                            isCompleted
                              ? "bg-primary border-primary text-primary-foreground"
                              : isCurrent
                              ? "bg-background border-primary text-primary ring-4 ring-primary/20 font-bold"
                              : "bg-background border-border text-muted-foreground"
                          )}
                        >
                          {isCompleted ? (
                            <Check className="size-5 stroke-[2.5]" />
                          ) : isCurrent ? (
                            <StepIcon className="size-5 text-primary animate-pulse" />
                          ) : (
                            <StepIcon className="size-5 text-muted-foreground/60" />
                          )}
                        </div>

                        <span
                          className={cn(
                            "text-xs sm:text-sm font-bold mt-2.5",
                            isCompleted
                              ? "text-foreground"
                              : isCurrent
                              ? "text-primary font-black"
                              : "text-muted-foreground"
                          )}
                        >
                          {milestone.title}
                        </span>

                        <span className="text-[11px] text-muted-foreground hidden sm:block mt-0.5">
                          {stepState.date !== "Pending" ? stepState.date : milestone.subTitle}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── Cancelled Order Notice ─── */}
        {isCancelled && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 sm:p-6 flex items-start gap-4 shadow-2xs">
            <AlertTriangle className="size-6 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-bold text-destructive text-base">Order Cancelled</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {historyMap.cancelled?.note ||
                  "This order has been cancelled and model stock has been replenished back to the garage collection."}
              </p>
              {historyMap.cancelled?.timestamp && (
                <p className="text-xs text-muted-foreground pt-1">
                  Cancellation recorded: {new Date(historyMap.cancelled.timestamp).toLocaleString("en-IN")}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ─── View Switcher Tabs: Tracking vs Invoice ─── */}
        <div className="flex items-center gap-6 border-b border-border/80 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setSearchParams({ view: "tracking" })}
            className={cn(
              "pb-3 pt-1 transition-all flex items-center gap-2 cursor-pointer border-b-2",
              activeView === "tracking"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            <Truck className="size-4" />
            <span>Delivery Tracking</span>
          </button>

          <button
            type="button"
            onClick={() => setSearchParams({ view: "invoice" })}
            className={cn(
              "pb-3 pt-1 transition-all flex items-center gap-2 cursor-pointer border-b-2",
              activeView === "invoice"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            <FileText className="size-4" />
            <span>Tax Invoice Details</span>
          </button>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            VIEW 1: TRACKING DASHBOARD
            ════════════════════════════════════════════════════════════════════ */}
        {activeView === "tracking" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Left 8 Cols: Checkpoints, Models, Courier Map */}
            <div className="lg:col-span-8 space-y-6">

              {/* 1. Live Checkpoint Journey Log from status_history */}
              <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
                <div className="bg-muted/40 dark:bg-muted/20 border-b border-border/70 px-5 sm:px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Clock className="size-4 text-primary" />
                    <h3 className="font-bold text-sm text-foreground">
                      Status History & Delivery Checkpoints
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAllUpdates((prev) => !prev)}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{showAllUpdates ? "Collapse Logs" : "Expand Logs"}</span>
                    {showAllUpdates ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                  </button>
                </div>

                {showAllUpdates && (
                  <div className="p-5 sm:p-6">
                    <div className="relative border-l-2 border-border/80 ml-4 sm:ml-5 space-y-6 pb-2">
                      {trackingScans.map((scan, i) => {
                        const isLatest = i === 0 && !isCancelled;
                        return (
                          <div key={i} className="relative flex items-start pl-6 group">
                            <div
                              className={cn(
                                "absolute -left-[9px] top-1 size-4 rounded-full border-2 bg-background flex items-center justify-center transition-all",
                                isLatest
                                  ? "border-primary ring-4 ring-primary/20"
                                  : "border-muted-foreground/50"
                              )}
                            >
                              <span
                                className={cn(
                                  "size-1.5 rounded-full",
                                  isLatest ? "bg-primary" : "bg-muted-foreground/60"
                                )}
                              />
                            </div>

                            <div className="space-y-1 text-xs flex-1">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm text-foreground">
                                    {scan.title}
                                  </span>
                                  {isLatest && (
                                    <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] py-0 px-1.5 font-bold">
                                      Latest Milestone
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-muted-foreground text-[11px] font-medium">
                                  {scan.date}
                                </span>
                              </div>
                              <p className="text-muted-foreground leading-relaxed">
                                {scan.note}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Items List from backend items: IOrderItem[] */}
              <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
                <div className="bg-muted/40 dark:bg-muted/20 border-b border-border/70 px-5 sm:px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="size-4 text-primary" />
                    <h3 className="font-bold text-sm text-foreground">
                      Ordered Models ({items.length} {items.length === 1 ? "item" : "items"})
                    </h3>
                  </div>
                  {totalWeightKg > 0 && (
                    <span className="text-xs text-muted-foreground">
                      Package Weight: <strong className="text-foreground">{totalWeightKg} kg</strong>
                    </span>
                  )}
                </div>

                <div className="p-5 sm:p-6 divide-y divide-border/60">
                  {items.map((item, idx) => {
                    const prod = typeof item.product === "object" && item.product !== null ? item.product : {};
                    const prodId = prod._id || item.product;
                    const img =
                      item.image ||
                      prod.images?.[0] ||
                      prod.image ||
                      "/logo.png";
                    const qty = Number(item.quantity || 1);
                    const price = Number(item.price || prod.price || 0);
                    const weight = Number(item.weight || prod.weight || 0);

                    return (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 py-5 first:pt-0 last:pb-0"
                      >
                        <div className="flex gap-4 sm:gap-5 flex-1 min-w-0">
                          <Link
                            to={prodId ? `/products/${prodId}` : "#"}
                            className="size-20 sm:size-24 rounded-xl bg-background border border-border/80 p-2 flex items-center justify-center shrink-0 hover:border-primary transition-all overflow-hidden shadow-2xs"
                          >
                            <img
                              src={img}
                              alt={item.name}
                              className="size-full object-contain hover:scale-105 transition-transform duration-300"
                            />
                          </Link>

                          <div className="space-y-1.5 flex-1 min-w-0">
                            <Link
                              to={prodId ? `/products/${prodId}` : "#"}
                              className="font-bold text-sm sm:text-base text-foreground hover:text-primary transition-colors line-clamp-1 block"
                            >
                              {item.name || "Precision Collectible Scale Model"}
                            </Link>

                            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                              <span>
                                Qty: <strong className="text-foreground font-semibold">{qty}</strong>
                              </span>
                              <span>•</span>
                              <span>
                                ₹{price.toLocaleString("en-IN", { minimumFractionDigits: 2 })} each
                              </span>
                              {weight > 0 && (
                                <>
                                  <span>•</span>
                                  <span>{weight} kg per unit</span>
                                </>
                              )}
                            </div>

                            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-0.5">
                              <span className="inline-flex items-center gap-1 text-primary font-semibold">
                                <ShieldCheck className="size-3.5" /> Certified Precision Collectible
                              </span>
                              <span>•</span>
                              <span>Authenticity Guaranteed</span>
                            </div>
                          </div>
                        </div>

                        {/* Item Quick Actions */}
                        <div className="flex sm:flex-col items-center gap-2 shrink-0 sm:w-40 pt-1 sm:pt-0">
                          <Button
                            size="sm"
                            onClick={() => handleBuyAgain(item)}
                            className="w-full h-8.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold gap-1.5 shadow-2xs cursor-pointer"
                          >
                            <RotateCcw className="size-3" />
                            <span>Buy Again</span>
                          </Button>

                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="w-full h-8 rounded-xl text-xs font-medium cursor-pointer"
                          >
                            <Link to={prodId ? `/products/${prodId}` : "#"}>
                              View Model
                            </Link>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-muted/20 border-t border-border/70 p-4 px-5 sm:px-6 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-primary shrink-0" />
                    <span>Reinforced garage packaging ensures zero transit damage.</span>
                  </div>
                  <span className="hidden sm:inline font-medium text-foreground">7-Day Return Guarantee</span>
                </div>
              </div>

              {/* 3. Live Courier Feed (if delivery_partner_url exists) */}
              {deliveryPartnerUrl && !isCancelled && (
                <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
                  <div className="bg-muted/40 dark:bg-muted/20 border-b border-border/80 px-5 sm:px-6 py-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Truck className="size-4 text-primary" />
                      <h4 className="font-bold text-sm text-foreground">Live Courier Feed</h4>
                    </div>
                    <Button asChild variant="outline" size="sm" className="h-7 text-xs rounded-lg gap-1">
                      <a href={deliveryPartnerUrl} target="_blank" rel="noopener noreferrer">
                        Carrier Portal <ExternalLink className="size-3" />
                      </a>
                    </Button>
                  </div>
                  <div className="p-4">
                    <div className="relative w-full h-96 bg-muted/20 rounded-xl overflow-hidden border border-border">
                      <iframe
                        src={deliveryPartnerUrl}
                        title="Carrier Tracking Map"
                        className="w-full h-full border-0"
                        allow="geolocation; autoplay; clipboard-write"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right 4 Cols: Address, Payment & Financial Summary */}
            <div className="lg:col-span-4 space-y-6">

              {/* 1. Destination Address Card from shipping_address & user */}
              <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
                <div className="bg-muted/40 dark:bg-muted/20 border-b border-border/80 px-5 py-3.5 flex items-center gap-2">
                  <MapPin className="size-4 text-primary" />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Delivery Destination
                  </h4>
                </div>
                <div className="p-5 space-y-2 text-xs">
                  <p className="font-bold text-sm text-foreground">{customerName}</p>

                  <div className="text-muted-foreground space-y-0.5 leading-relaxed">
                    {shippingAddress.door && <p>{shippingAddress.door}</p>}
                    {shippingAddress.street && <p>{shippingAddress.street}</p>}
                    <p>
                      {[shippingAddress.city, stateDisplay].filter(Boolean).join(", ")}
                      {shippingAddress.pincode ? ` - ${shippingAddress.pincode}` : ""}
                    </p>
                    <p className="font-medium text-foreground">India</p>
                  </div>

                  {(customerPhone || customerEmail) && (
                    <div className="pt-2 border-t border-border/60 space-y-1 text-[11px] text-muted-foreground">
                      {customerPhone && (
                        <p className="flex items-center gap-1.5">
                          <Phone className="size-3 text-primary" />
                          <span>Phone: <strong className="text-foreground">{customerPhone}</strong></span>
                        </p>
                      )}
                      {customerEmail && (
                        <p className="flex items-center gap-1.5">
                          <Mail className="size-3 text-primary" />
                          <span>Email: <strong className="text-foreground">{customerEmail}</strong></span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Pricing & Payment Breakdown from pricing & payment */}
              <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
                <div className="bg-muted/40 dark:bg-muted/20 border-b border-border/80 px-5 py-3.5 flex items-center gap-2">
                  <CreditCard className="size-4 text-primary" />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Payment & Charges
                  </h4>
                </div>
                <div className="p-5 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Items Subtotal:</span>
                    <span className="font-medium text-foreground">
                      ₹{Number(pricing.subtotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Shipping Cost:</span>
                    {Number(pricing.shipping_cost || 0) > 0 ? (
                      <span className="font-medium text-foreground">
                        ₹{Number(pricing.shipping_cost).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    ) : (
                      <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold">
                        FREE Delivery
                      </Badge>
                    )}
                  </div>

                  {Number(pricing.tax || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estimated GST (18%):</span>
                      <span className="font-medium text-foreground">
                        ₹{Number(pricing.tax).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}

                  <Separator className="my-2" />

                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-foreground">Total Paid:</span>
                    <span className="text-base font-black text-primary">
                      ₹{Number(pricing.total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Payment Mode:</span>
                    <Badge
                      className={cn(
                        "capitalize font-semibold text-[10px]",
                        isPaymentPaid
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {paymentMethodLabel} ({payment.status || "pending"})
                    </Badge>
                  </div>

                  {payment.transaction_id && (
                    <p className="text-[10px] text-muted-foreground font-mono truncate">
                      Txn ID: {payment.transaction_id}
                    </p>
                  )}
                </div>
              </div>

              {/* 3. Garage Assistance & Order Cancellation */}
              <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <HelpCircle className="size-4 text-primary" />
                  <span>Garage Assistance</span>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchParams({ view: "invoice" })}
                    className="w-full h-8.5 text-xs justify-start font-medium rounded-xl cursor-pointer"
                  >
                    <FileText className="size-3.5 mr-2 text-primary" />
                    <span>View Official Tax Invoice</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(orderCode, "Order Reference")}
                    className="w-full h-8.5 text-xs justify-start font-medium rounded-xl cursor-pointer"
                  >
                    <Copy className="size-3.5 mr-2 text-muted-foreground" />
                    <span>Copy Order ID (#{orderCode})</span>
                  </Button>

                  {/* Cancel Button if eligible according to backend logic */}
                  {canCancel && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isCancelling}
                          className="w-full h-8.5 text-xs justify-start text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl font-medium cursor-pointer"
                        >
                          <Ban className="size-3.5 mr-2" />
                          <span>Cancel this Order</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-2xl border-border bg-popover shadow-xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-destructive flex items-center gap-2">
                            <Ban className="size-5" />
                            Cancel Order #{orderCode}?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="space-y-3 pt-2">
                            <span>
                              Are you sure you want to cancel this order? This will restock the scale models back to the garage collection.
                            </span>
                            <div className="space-y-1.5 text-left pt-2">
                              <label className="text-xs font-semibold text-foreground">
                                Reason for Cancellation:
                              </label>
                              <Select value={cancelReason} onValueChange={setCancelReason}>
                                <SelectTrigger className="h-9 text-xs rounded-xl">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border border-border shadow-xl">
                                  <SelectItem value="Changed my mind" className="text-xs">
                                    Changed my mind
                                  </SelectItem>
                                  <SelectItem value="Ordered by mistake" className="text-xs">
                                    Ordered by mistake
                                  </SelectItem>
                                  <SelectItem value="Found a better price elsewhere" className="text-xs">
                                    Found a better price elsewhere
                                  </SelectItem>
                                  <SelectItem value="Delivery time is too long" className="text-xs">
                                    Delivery time is too long
                                  </SelectItem>
                                  <SelectItem value="Other reason" className="text-xs">
                                    Other reason
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl text-xs">Keep Order</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleCancelOrder}
                            className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-bold"
                          >
                            Confirm Cancellation
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            VIEW 2: FORMAL TAX INVOICE
            ════════════════════════════════════════════════════════════════════ */}
        {activeView === "invoice" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
              {/* Header with Torque Toyzz & Invoice Code */}
              <div className="p-6 sm:p-8 border-b border-border/70 flex flex-col sm:flex-row justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-black text-foreground tracking-tight">
                    Torque Toyzz
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Precision Scale Automotive Collectibles & Racing Garage
                  </p>
                  <p className="text-xs text-muted-foreground">GSTIN: 33AAAAA0000A1Z5</p>
                </div>

                <div className="sm:text-right space-y-1 text-xs">
                  <Badge className="bg-primary text-primary-foreground font-semibold text-xs">
                    Tax Invoice
                  </Badge>
                  <p className="font-mono font-bold text-sm text-foreground pt-1">
                    Invoice #{orderCode}
                  </p>
                  <p className="text-muted-foreground">Order Date: {orderDateFormatted}</p>
                </div>
              </div>

              {/* Customer & Payment details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8 border-b border-border/70 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-muted-foreground uppercase text-[11px] tracking-wider">
                    Billed & Shipped To:
                  </span>
                  <p className="font-bold text-sm text-foreground">{customerName}</p>
                  <div className="text-muted-foreground space-y-0.5">
                    {shippingAddress.door && <p>{shippingAddress.door}</p>}
                    {shippingAddress.street && <p>{shippingAddress.street}</p>}
                    <p>
                      {[shippingAddress.city, stateDisplay].filter(Boolean).join(", ")}
                      {shippingAddress.pincode ? ` - ${shippingAddress.pincode}` : ""}
                    </p>
                    <p>India</p>
                    {customerPhone && <p>Phone: {customerPhone}</p>}
                    {customerEmail && <p>Email: {customerEmail}</p>}
                  </div>
                </div>

                <div className="space-y-1 md:text-right">
                  <span className="font-bold text-muted-foreground uppercase text-[11px] tracking-wider">
                    Payment Method & Transaction:
                  </span>
                  <p className="font-semibold text-foreground capitalize">
                    {paymentMethodLabel}
                  </p>
                  <p className="text-muted-foreground capitalize">
                    Payment Status: {payment.status || "Authorized"}
                  </p>
                  {payment.transaction_id && (
                    <p className="font-mono text-[11px] text-muted-foreground">
                      Transaction Ref: {payment.transaction_id}
                    </p>
                  )}
                  {totalWeightKg > 0 && (
                    <p className="text-muted-foreground pt-1">
                      Consignment Weight: {totalWeightKg} kg
                    </p>
                  )}
                </div>
              </div>

              {/* Itemized Table */}
              <div className="p-6 sm:p-8 space-y-4">
                <h4 className="font-bold text-sm text-foreground">
                  Purchased Items
                </h4>
                <div className="divide-y divide-border/60">
                  {items.map((item, idx) => {
                    const prod = typeof item.product === "object" && item.product !== null ? item.product : {};
                    const qty = Number(item.quantity || 1);
                    const unitPrice = Number(item.price || prod.price || 0);
                    const lineTotal = unitPrice * qty;

                    return (
                      <div key={idx} className="flex items-center justify-between py-3.5 text-xs first:pt-0 last:pb-0">
                        <div className="space-y-0.5">
                          <p className="font-bold text-foreground">
                            {item.name || prod.name || "Precision Scale Model"}
                          </p>
                          <p className="text-muted-foreground">
                            Qty: {qty} × ₹{unitPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div className="font-bold text-sm text-foreground">
                          ₹{lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator />

                {/* Financial Summary */}
                <div className="space-y-2 text-xs max-w-xs ml-auto pt-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium text-foreground">
                      ₹{Number(pricing.subtotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping:</span>
                    <span>
                      {Number(pricing.shipping_cost || 0) > 0
                        ? `₹${Number(pricing.shipping_cost).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                        : "FREE"}
                    </span>
                  </div>
                  {Number(pricing.tax || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">GST (18%):</span>
                      <span>₹{Number(pricing.tax).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-black text-base text-primary">
                    <span>Grand Total:</span>
                    <span>₹{Number(pricing.total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Invoice Footer */}
              <div className="bg-muted/30 border-t border-border/70 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                <p>Torque Toyzz certified tax invoice. System generated.</p>
                <Button
                  size="sm"
                  onClick={() => window.print()}
                  className="rounded-xl text-xs gap-1.5 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xs"
                >
                  <Printer className="size-3.5" /> Print Tax Invoice
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
