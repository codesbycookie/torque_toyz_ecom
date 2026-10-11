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
  Circle,
  Truck,
  Package,
  PackageCheck,
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
  MessageSquare,
  Sparkles,
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

  const [showAllUpdates, setShowAllUpdates] = useState(false);
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
      toast.success(`"${item.name || product.name}" added back to cart!`);
    } catch {
      toast.error("Failed to re-add model to cart");
    }
  };

  const copyToClipboard = (text, label) => {
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
        text: `Track your scale model order delivery status:`,
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
            <Skeleton className="h-8 w-64 rounded-lg" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-28 rounded-lg" />
              <Skeleton className="h-9 w-28 rounded-lg" />
            </div>
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Skeleton className="lg:col-span-8 h-80 rounded-xl" />
            <Skeleton className="lg:col-span-4 h-80 rounded-xl" />
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
            We couldn't locate this order in your garage records. The order link may have expired or is incorrect.
          </p>
          <Button
            onClick={() => navigate("/orders")}
            variant="default"
            className="w-full mt-2 h-9 rounded-xl text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="mr-2 size-3.5" /> Return to Your Orders
          </Button>
        </div>
      </div>
    );
  }

  const orderId = orderDetails._id || orderDetails.id;
  const orderCode =
    orderDetails.code || (orderDetails._id ? orderDetails._id.slice(-8).toUpperCase() : "ORD");
  const orderDateObj = new Date(orderDetails.createdAt || orderDetails.date || Date.now());
  const orderDate = orderDateObj.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const orderDateShort = orderDateObj.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const orderTotal = Number(orderDetails.pricing?.total || orderDetails.total || 0);

  const statusLower = orderDetails.status?.toLowerCase();
  const isCancelled = statusLower === "cancelled";
  const isDelivered = statusLower === "delivered";
  const isShipped = statusLower === "shipped";
  const isConfirmed = statusLower === "confirmed";
  const canCancel = ["placed", "confirmed"].includes(statusLower);

  const items = orderDetails.items || orderDetails.products || [];

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
      label: "Ordered",
      note: historyMap.placed?.note || "Order placed & verified by Torque Toyzz",
    },
    {
      key: "confirmed",
      label: "Confirmed",
      note: historyMap.confirmed?.note || "Order confirmed & inspection prepped in garage",
    },
    {
      key: "shipped",
      label: "Shipped",
      note: historyMap.shipped?.note || "Package in transit with express courier partner",
    },
    {
      key: "delivered",
      label: "Delivered",
      note: historyMap.delivered?.note || "Package delivered to shipping destination",
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
        return (
          <Badge className="bg-primary text-primary-foreground font-semibold gap-1 text-xs">
            <CheckCircle2 className="size-3" /> Delivered
          </Badge>
        );
      case "shipped":
        return (
          <Badge className="bg-primary/80 text-primary-foreground font-semibold gap-1 text-xs">
            <Truck className="size-3" /> Dispatched
          </Badge>
        );
      case "confirmed":
        return (
          <Badge className="bg-primary/20 text-primary border border-primary/30 font-semibold gap-1 text-xs">
            <Check className="size-3" /> Confirmed
          </Badge>
        );
      case "placed":
        return (
          <Badge className="bg-primary/10 text-primary border border-primary/20 font-semibold gap-1 text-xs">
            <Clock className="size-3" /> Placed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-destructive/10 text-destructive border border-destructive/20 font-semibold gap-1 text-xs">
            <Ban className="size-3" /> Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="font-semibold text-xs capitalize">
            {status || "Processing"}
          </Badge>
        );
    }
  };

  const shippingName =
    orderDetails.shipping_address?.full_name ||
    orderDetails.shipping_address?.name ||
    (typeof orderDetails.user === "object" ? orderDetails.user?.name : String(orderDetails.user || "Customer"));

  // Build Chronological Tracking Scans for Expandable Accordion
  let trackingScans = [];
  if (Array.isArray(orderDetails.status_history) && orderDetails.status_history.length > 0) {
    trackingScans = [...orderDetails.status_history]
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
        note: entry.note || "Order checkpoint status recorded in fulfillment system",
      }))
      .reverse();
  } else {
    // Default fallback milestones
    if (isDelivered) {
      trackingScans.push({
        status: "delivered",
        title: "Delivered",
        date: formatStepDate("delivered"),
        note: "Package was handed directly to resident or left at doorstep",
      });
    }
    if (isShipped || isDelivered) {
      trackingScans.push({
        status: "shipped",
        title: "Dispatched / In Transit",
        date: formatStepDate("shipped"),
        note: "Package departed local sorting hub and is en route with express courier",
      });
    }
    if (isConfirmed || isShipped || isDelivered) {
      trackingScans.push({
        status: "confirmed",
        title: "Order Confirmed & Packaged",
        date: formatStepDate("confirmed"),
        note: "Precision collectible model inspected, bubble wrapped & boxed in Torque Garage",
      });
    }
    trackingScans.push({
      status: "placed",
      title: "Order Received",
      date: formatStepDate("placed"),
      note: "Order confirmed and verified online by customer",
    });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ─── Centered Page Container (max-w-7xl) ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Amazon Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
          <Link to="/profile" className="hover:text-primary transition-colors">
            Your Account
          </Link>
          <span>›</span>
          <Link to="/orders" className="hover:text-primary transition-colors">
            Your Orders
          </Link>
          <span>›</span>
          <span className="font-mono text-foreground font-medium">#{orderCode}</span>
          <span>›</span>
          <span className="text-foreground font-bold">
            {activeView === "invoice" ? "Order Details & Invoice" : "Track Package"}
          </span>
        </div>

        {/* Amazon Header Bar: Title, Status Badge, Order Code & Top Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border/80">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {activeView === "invoice"
                  ? "Order Details & Invoice"
                  : isDelivered
                  ? `Delivered ${orderDateShort}`
                  : isShipped
                  ? "Arriving Soon • Dispatched"
                  : isConfirmed
                  ? "Preparing for Dispatch"
                  : isCancelled
                  ? "Order Cancelled"
                  : "Order Placed"}
              </h1>
              {getStatusBadge(orderDetails.status)}
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground mt-1">
              <span>Ordered on {orderDate}</span>
              <span className="text-border">•</span>
              <span className="font-mono font-bold text-foreground">Order # {orderCode}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(orderCode, "Order Code")}
                className="hover:text-foreground cursor-pointer transition-colors p-0.5"
                title="Copy order code"
              >
                <Copy className="size-3" />
              </button>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareTracking}
              className="h-9 rounded-lg text-xs gap-1.5 font-medium cursor-pointer"
            >
              <Share2 className="size-3.5" />
              <span>Share</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="h-9 rounded-lg text-xs gap-1.5 font-medium cursor-pointer"
            >
              <Printer className="size-3.5" />
              <span>Print Invoice</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/orders")}
              className="h-9 rounded-lg text-xs gap-1.5 font-medium cursor-pointer"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Orders</span>
            </Button>
          </div>
        </div>

        {/* ─── Amazon Sub-Tabs: [ Track Package ] | [ Order Details & Invoice ] ─── */}
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
            <span>Track Package</span>
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
            <span>Order Details & Invoice</span>
          </button>
        </div>

        {/* ─── Cancelled Order Banner ─── */}
        {isCancelled && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-5 flex items-start gap-4 shadow-2xs">
            <AlertTriangle className="size-6 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-bold text-destructive text-base">Order Cancelled</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {historyMap.cancelled?.note || "This order was cancelled and inventory items have been restocked."}
              </p>
              {historyMap.cancelled?.timestamp && (
                <p className="text-xs text-muted-foreground pt-1">
                  Cancelled on: {new Date(historyMap.cancelled.timestamp).toLocaleString("en-IN")}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            VIEW 1: TRACK PACKAGE (Signature Amazon Tracking Flow)
            ════════════════════════════════════════════════════════════════════ */}
        {activeView === "tracking" && (
          <div className="space-y-6">
            {/* ─── Signature Amazon Hero Milestone Box ─── */}
            <div className="border border-border/80 rounded-xl bg-card overflow-hidden shadow-2xs">
              {/* Shaded Header Strip */}
              <div className="bg-muted/40 dark:bg-muted/20 border-b border-border/80 px-5 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 font-medium">
                  <Truck className="size-4 text-primary" />
                  <span className="text-foreground font-semibold">Package 1 of 1</span>
                  <span className="text-muted-foreground/60">•</span>
                  <span className="text-muted-foreground">
                    Carrier: <strong className="text-foreground">Express Courier Direct</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground font-mono text-[11px]">
                  <span>AWB / Tracking ID:</span>
                  <strong className="text-foreground font-bold">{orderDetails.tracking_number || orderCode}</strong>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(orderDetails.tracking_number || orderCode, "Tracking ID")}
                    className="hover:text-foreground cursor-pointer p-0.5"
                    title="Copy tracking number"
                  >
                    <Copy className="size-3" />
                  </button>
                </div>
              </div>

              {/* Box Body */}
              <div className="p-5 sm:p-6 space-y-6">
                {/* Headline status message */}
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2.5">
                    {isDelivered ? (
                      <>
                        <CheckCircle2 className="size-6 text-primary" />
                        <span>Delivered {orderDate}</span>
                      </>
                    ) : isShipped ? (
                      <>
                        <Truck className="size-6 text-primary animate-pulse" />
                        <span>On the way • Dispatched with express courier</span>
                      </>
                    ) : isConfirmed ? (
                      <>
                        <Clock className="size-6 text-primary" />
                        <span>Preparing for dispatch • Inspected in Torque Garage</span>
                      </>
                    ) : isCancelled ? (
                      <>
                        <Ban className="size-6 text-destructive" />
                        <span>Shipment Voided</span>
                      </>
                    ) : (
                      <>
                        <Package className="size-6 text-primary" />
                        <span>Order Received & Placed</span>
                      </>
                    )}
                  </h3>

                  <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
                    {isDelivered
                      ? "Package was delivered directly to your destination address or handed to resident."
                      : isShipped
                      ? "Your order has departed our fulfillment center and is in transit to your city hub."
                      : isCancelled
                      ? "This package was cancelled and the items restocked into garage inventory."
                      : "We are carefully verifying and packaging your precision scale collectible models."}
                  </p>
                </div>

                {/* ─── Amazon 4-Stage Horizontal Progress Tracker ─── */}
                {!isCancelled && (
                  <div className="pt-2 pb-6 px-2 sm:px-6">
                    <div className="relative flex items-center justify-between">
                      {/* Background Track Line */}
                      <div className="absolute left-6 right-6 top-4 sm:top-4.5 h-1.5 bg-muted rounded-full" />

                      {/* Active Fill Line */}
                      <div
                        className={cn(
                          "absolute left-6 top-4 sm:top-4.5 h-1.5 rounded-full transition-all duration-700 bg-primary",
                          isDelivered
                            ? "right-6"
                            : currentRank === 3
                            ? "w-2/3"
                            : currentRank === 2
                            ? "w-1/3"
                            : "w-0"
                        )}
                      />

                      {pipelineSteps.map((step) => {
                        const state = getStepState(step.key);
                        const isCompleted = state.status === "completed";
                        const isCurrent = state.status === "current";

                        return (
                          <div key={step.key} className="relative z-10 flex flex-col items-center">
                            <div
                              className={cn(
                                "size-8 sm:size-9 rounded-full flex items-center justify-center border-2 transition-all shadow-xs",
                                isCompleted
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : isCurrent
                                  ? "bg-background border-primary text-primary ring-4 ring-primary/20 font-bold"
                                  : "bg-background border-muted-foreground/30 text-muted-foreground"
                              )}
                            >
                              {isCompleted ? (
                                <Check className="size-4 stroke-[3]" />
                              ) : isCurrent ? (
                                <span className="size-2.5 rounded-full bg-primary animate-ping" />
                              ) : (
                                <span className="size-2 rounded-full bg-muted-foreground/40" />
                              )}
                            </div>
                            <span
                              className={cn(
                                "text-xs sm:text-sm font-semibold mt-2 text-center whitespace-nowrap",
                                isCompleted
                                  ? "text-foreground"
                                  : isCurrent
                                  ? "text-primary font-bold"
                                  : "text-muted-foreground"
                              )}
                            >
                              {step.label}
                            </span>
                            <span className="text-[11px] text-muted-foreground hidden sm:block text-center mt-0.5">
                              {state.date !== "Pending" ? state.date : ""}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Separator />

                {/* ─── Expandable "See all updates" Accordion ─── */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowAllUpdates((prev) => !prev)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    <span>{showAllUpdates ? "Hide tracking updates" : "See all tracking updates"}</span>
                    {showAllUpdates ? (
                      <ChevronUp className="size-3.5" />
                    ) : (
                      <ChevronDown className="size-3.5" />
                    )}
                  </button>

                  {showAllUpdates && (
                    <div className="mt-4 pt-4 border-t border-border/70 space-y-4">
                      <div className="relative border-l-2 border-border ml-3 space-y-5 pb-1">
                        {trackingScans.map((scan, i) => (
                          <div key={i} className="relative flex items-start pl-6 group">
                            <div className="absolute -left-[9px] top-1 size-4 rounded-full border-2 border-primary bg-background flex items-center justify-center">
                              <span className="size-1.5 rounded-full bg-primary" />
                            </div>
                            <div className="space-y-0.5 text-xs">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-foreground">{scan.title}</span>
                                <span className="text-muted-foreground text-[11px]">• {scan.date}</span>
                              </div>
                              <p className="text-muted-foreground leading-relaxed">{scan.note}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ─── 2-Column Split: Items (Left 8 Cols) | Address & Summary (Right 4 Cols) ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Shipment Items & Carrier Frame */}
              <div className="lg:col-span-8 space-y-6">
                {/* Items in this shipment */}
                <div className="border border-border/80 rounded-xl bg-card overflow-hidden shadow-2xs">
                  <div className="bg-muted/40 dark:bg-muted/20 border-b border-border/80 px-5 sm:px-6 py-3.5 flex items-center justify-between">
                    <h4 className="font-bold text-sm text-foreground">
                      Items in this shipment ({items.length} {items.length === 1 ? "model" : "models"})
                    </h4>
                    <span className="text-xs text-muted-foreground font-mono">
                      Ref: #{orderCode}
                    </span>
                  </div>

                  <div className="p-5 sm:p-6 divide-y divide-border/60">
                    {items.map((item, idx) => {
                      const prod = item.product || item;
                      const img =
                        item.image ||
                        prod.images?.[0] ||
                        prod.image ||
                        "/logo.png";
                      const slug = prod.slug || prod._id;
                      const qty = item.quantity || 1;
                      const price = Number(item.price || prod.price || 0);

                      return (
                        <div
                          key={idx}
                          className={cn(
                            "flex flex-col sm:flex-row items-start justify-between gap-5 py-4 first:pt-0 last:pb-0"
                          )}
                        >
                          <div className="flex gap-4 sm:gap-5 flex-1 min-w-0">
                            <Link
                              to={slug ? `/products/${slug}` : "#"}
                              className="size-20 sm:size-24 rounded-lg bg-white dark:bg-muted/30 border border-border/70 p-2 flex items-center justify-center shrink-0 hover:border-primary transition-colors overflow-hidden"
                            >
                              <img
                                src={img}
                                alt={item.name || prod.name}
                                className="size-full object-contain hover:scale-105 transition-transform duration-200"
                              />
                            </Link>

                            <div className="space-y-1.5 flex-1 min-w-0">
                              <Link
                                to={slug ? `/products/${slug}` : "#"}
                                className="font-medium text-sm sm:text-base text-foreground hover:text-primary transition-colors line-clamp-2 block"
                              >
                                {item.name || prod.name || "Precision Scale Model"}
                              </Link>
                              
                              <p className="text-xs text-muted-foreground">
                                Qty: <strong className="text-foreground">{qty}</strong> • ₹
                                {price.toLocaleString("en-IN", { minimumFractionDigits: 2 })} each
                              </p>

                              <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 flex-wrap">
                                <span className="inline-flex items-center gap-1 text-primary font-medium">
                                  <ShieldCheck className="size-3.5" /> Authentic Scale Collectible
                                </span>
                                <span>•</span>
                                <span>Sold by: Torque Toyzz Official</span>
                              </div>

                              <p className="text-[11px] text-muted-foreground">
                                {isDelivered
                                  ? "Eligible for return or replacement within 7 days from delivery date"
                                  : "Factory inspection passed • 1-Year limited manufacturer warranty"}
                              </p>
                            </div>
                          </div>

                          {/* Amazon Quick Action Stack */}
                          <div className="flex sm:flex-col items-center gap-2 shrink-0 w-full sm:w-44 pt-2 sm:pt-0">
                            <Button
                              size="sm"
                              onClick={() => handleBuyAgain(item)}
                              className="flex-1 sm:flex-none w-full h-8.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold gap-1.5 shadow-2xs cursor-pointer"
                            >
                              <RotateCcw className="size-3" />
                              <span>Buy it again</span>
                            </Button>

                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="flex-1 sm:flex-none w-full h-8 rounded-lg text-xs font-medium cursor-pointer"
                            >
                              <Link to={slug ? `/products/${slug}` : "#"}>
                                View your item
                              </Link>
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ─── Live Courier Feed (if available) ─── */}
                {orderDetails.delivery_partner_url && !isCancelled && (
                  <div className="border border-border/80 rounded-xl bg-card overflow-hidden shadow-2xs">
                    <div className="bg-muted/40 dark:bg-muted/20 border-b border-border/80 px-5 sm:px-6 py-3.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Truck className="size-4 text-primary" />
                        <h4 className="font-bold text-sm text-foreground">Live Courier Feed</h4>
                      </div>
                      <Button asChild variant="outline" size="sm" className="h-7 text-xs rounded-lg gap-1">
                        <a href={orderDetails.delivery_partner_url} target="_blank" rel="noopener noreferrer">
                          Open Carrier Portal <ExternalLink className="size-3" />
                        </a>
                      </Button>
                    </div>
                    <div className="p-4">
                      <div className="relative w-full h-96 bg-muted/20 rounded-lg overflow-hidden border border-border">
                        <iframe
                          src={orderDetails.delivery_partner_url}
                          title="Carrier Tracking Map"
                          className="w-full h-full border-0"
                          allow="geolocation; autoplay; clipboard-write"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Address, Order Summary & Help Actions */}
              <div className="lg:col-span-4 space-y-6">
                {/* 1. Shipping Address */}
                <div className="border border-border/80 rounded-xl bg-card overflow-hidden shadow-2xs">
                  <div className="bg-muted/40 dark:bg-muted/20 border-b border-border/80 px-4 py-3 flex items-center gap-2">
                    <MapPin className="size-4 text-primary" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                      Shipping Address
                    </h4>
                  </div>
                  <div className="p-4 space-y-1 text-xs">
                    <p className="font-bold text-sm text-foreground">{shippingName}</p>
                    {orderDetails.shipping_address ? (
                      <div className="text-muted-foreground space-y-0.5 leading-relaxed pt-1">
                        <p>
                          {[orderDetails.shipping_address.door, orderDetails.shipping_address.street]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                        <p>
                          {[
                            orderDetails.shipping_address.city,
                            typeof orderDetails.shipping_address.state === "object"
                              ? orderDetails.shipping_address.state?.name
                              : orderDetails.shipping_address.state,
                          ]
                            .filter(Boolean)
                            .join(", ")}{" "}
                          {orderDetails.shipping_address.pincode
                            ? `- ${orderDetails.shipping_address.pincode}`
                            : ""}
                        </p>
                        <p>India</p>
                        {orderDetails.user?.phone && (
                          <p className="pt-1 text-[11px]">
                            Phone: <span className="font-medium text-foreground">{orderDetails.user.phone}</span>
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Address not specified</p>
                    )}
                  </div>
                </div>

                {/* 2. Order Summary & Payment */}
                <div className="border border-border/80 rounded-xl bg-card overflow-hidden shadow-2xs">
                  <div className="bg-muted/40 dark:bg-muted/20 border-b border-border/80 px-4 py-3 flex items-center gap-2">
                    <CreditCard className="size-4 text-primary" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                      Payment & Order Summary
                    </h4>
                  </div>
                  <div className="p-4 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Item(s) Subtotal:</span>
                      <span>
                        ₹
                        {(orderDetails.pricing?.subtotal || orderTotal).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping:</span>
                      <span>
                        {orderDetails.pricing?.shipping_cost > 0
                          ? `₹${orderDetails.pricing.shipping_cost.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}`
                          : "FREE Delivery"}
                      </span>
                    </div>

                    {orderDetails.pricing?.tax > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estimated GST:</span>
                        <span>₹{orderDetails.pricing.tax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    <Separator className="my-1.5" />

                    <div className="flex justify-between font-bold text-sm">
                      <span>Grand Total:</span>
                      <span className="text-primary font-black">
                        ₹{orderTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">Payment Method:</span>
                      <Badge
                        variant={orderDetails.payment?.status === "paid" ? "secondary" : "outline"}
                        className="capitalize font-semibold text-[11px]"
                      >
                        {orderDetails.payment?.method || "Prepaid"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* 3. Need Help with This Order? (Actions & Cancellation) */}
                <div className="border border-border/80 rounded-xl bg-card overflow-hidden shadow-2xs p-4 space-y-2.5">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Order Assistance
                  </h4>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchParams({ view: "invoice" })}
                    className="w-full h-8 text-xs justify-start font-medium cursor-pointer"
                  >
                    <FileText className="size-3.5 mr-2 text-muted-foreground" />
                    View Detailed Invoice
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.print()}
                    className="w-full h-8 text-xs justify-start font-medium cursor-pointer"
                  >
                    <Printer className="size-3.5 mr-2 text-muted-foreground" />
                    Print Shipment Details
                  </Button>

                  {/* Cancel Order Action Trigger */}
                  {canCancel && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isCancelling}
                          className="w-full h-8 text-xs justify-start text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30 font-medium cursor-pointer"
                        >
                          <Ban className="size-3.5 mr-2" />
                          Cancel this Order
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
                              Are you sure you want to cancel this order? This action cannot be undone and model
                              quantities will be restocked immediately.
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
            VIEW 2: ORDER DETAILS & INVOICE (Complete Amazon Invoice Layout)
            ════════════════════════════════════════════════════════════════════ */}
        {activeView === "invoice" && (
          <div className="space-y-6">
            {/* Amazon 3-Part Information Box */}
            <div className="border border-border/80 rounded-xl bg-card overflow-hidden shadow-2xs">
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/80 p-5 sm:p-6 gap-6 md:gap-0">
                {/* 1. Shipping Address */}
                <div className="md:pr-6 space-y-1.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Shipping Address
                  </h4>
                  <p className="font-bold text-sm text-foreground pt-1">{shippingName}</p>
                  {orderDetails.shipping_address ? (
                    <div className="text-xs text-muted-foreground space-y-0.5 leading-relaxed">
                      <p>
                        {[orderDetails.shipping_address.door, orderDetails.shipping_address.street]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                      <p>
                        {[
                          orderDetails.shipping_address.city,
                          typeof orderDetails.shipping_address.state === "object"
                            ? orderDetails.shipping_address.state?.name
                            : orderDetails.shipping_address.state,
                        ]
                          .filter(Boolean)
                          .join(", ")}{" "}
                        {orderDetails.shipping_address.pincode ? `- ${orderDetails.shipping_address.pincode}` : ""}
                      </p>
                      <p>India</p>
                      {orderDetails.user?.phone && (
                        <p className="pt-1 text-[11px]">
                          Phone: <span className="font-medium text-foreground">{orderDetails.user.phone}</span>
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Address not specified</p>
                  )}
                </div>

                {/* 2. Payment Method */}
                <div className="md:px-6 space-y-1.5 pt-4 md:pt-0">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Payment Method
                  </h4>
                  <div className="pt-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <CreditCard className="size-4 text-primary" />
                      <span className="font-semibold text-sm capitalize">
                        {orderDetails.payment?.method || "Prepaid Online"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge
                        variant={orderDetails.payment?.status === "paid" ? "secondary" : "outline"}
                        className="capitalize text-[11px] font-semibold"
                      >
                        {orderDetails.payment?.status || "Confirmed"}
                      </Badge>
                    </div>
                    {orderDetails.payment?.transaction_id && (
                      <p className="text-xs text-muted-foreground font-mono text-[11px] truncate pt-0.5">
                        Ref: {orderDetails.payment.transaction_id}
                      </p>
                    )}
                  </div>
                </div>

                {/* 3. Order Summary */}
                <div className="md:pl-6 space-y-2 pt-4 md:pt-0">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Order Summary
                  </h4>
                  <div className="pt-1 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Item(s) Subtotal:</span>
                      <span>
                        ₹
                        {(orderDetails.pricing?.subtotal || orderTotal).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping:</span>
                      <span>
                        {orderDetails.pricing?.shipping_cost > 0
                          ? `₹${orderDetails.pricing.shipping_cost.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}`
                          : "FREE Delivery"}
                      </span>
                    </div>
                    {orderDetails.pricing?.tax > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estimated GST / Tax:</span>
                        <span>₹{orderDetails.pricing.tax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <Separator className="my-1.5" />
                    <div className="flex justify-between font-bold text-sm">
                      <span>Grand Total:</span>
                      <span className="text-primary font-black">
                        ₹{orderTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Itemized Invoice Table Card */}
            <div className="border border-border/80 rounded-xl bg-card overflow-hidden shadow-2xs">
              <div className="bg-muted/40 dark:bg-muted/20 border-b border-border/80 px-5 sm:px-6 py-3.5 flex items-center justify-between">
                <h4 className="font-bold text-sm text-foreground">
                  Itemized Order Breakdown
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="h-8 text-xs rounded-lg gap-1.5"
                >
                  <Printer className="size-3.5" /> Print this invoice
                </Button>
              </div>

              <div className="p-5 sm:p-6 divide-y divide-border/60">
                {items.map((item, idx) => {
                  const prod = item.product || item;
                  const img =
                    item.image ||
                    prod.images?.[0] ||
                    prod.image ||
                    "/logo.png";
                  const slug = prod.slug || prod._id;
                  const qty = item.quantity || 1;
                  const unitPrice = Number(item.price || prod.price || 0);
                  const lineTotal = unitPrice * qty;

                  return (
                    <div key={idx} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-4">
                        <Link
                          to={slug ? `/products/${slug}` : "#"}
                          className="size-16 rounded-lg bg-white dark:bg-muted/30 border border-border/70 p-1.5 flex items-center justify-center shrink-0 overflow-hidden"
                        >
                          <img
                            src={img}
                            alt={item.name || prod.name}
                            className="size-full object-contain"
                          />
                        </Link>
                        <div className="space-y-0.5">
                          <Link
                            to={slug ? `/products/${slug}` : "#"}
                            className="font-medium text-sm text-foreground hover:text-primary transition-colors line-clamp-1"
                          >
                            {item.name || prod.name || "Precision Model"}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            Qty: <strong className="text-foreground">{qty}</strong> • Unit Price: ₹
                            {unitPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-bold text-sm text-foreground">
                          ₹{lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-muted/20 dark:bg-muted/10 border-t border-border/70 p-5 sm:p-6 text-xs text-muted-foreground space-y-1">
                <p>
                  <strong>Torque Toyzz Guarantee:</strong> All precision collectible scale models come certified
                  with factory inspection and return eligibility within 7 days of package delivery.
                </p>
                <p>
                  For returns, inquiries, or warranty support, contact customer support quoting order{" "}
                  <strong className="text-foreground font-mono">#{orderCode}</strong>.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
