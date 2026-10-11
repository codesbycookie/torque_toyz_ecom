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
  ChevronRight,
  HelpCircle,
  Phone,
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
            We couldn't locate this order in your garage records. The order link may have expired or is incorrect.
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
      label: "Order Placed",
      subLabel: "Verified online",
      icon: Package,
      note: historyMap.placed?.note || "Order placed & verified by Torque Toyzz",
    },
    {
      key: "confirmed",
      label: "Boxed & Ready",
      subLabel: "Inspected in garage",
      icon: ShieldCheck,
      note: historyMap.confirmed?.note || "Order confirmed & inspection prepped in garage",
    },
    {
      key: "shipped",
      label: "Dispatched",
      subLabel: "In carrier transit",
      icon: Truck,
      note: historyMap.shipped?.note || "Package in transit with express courier partner",
    },
    {
      key: "delivered",
      label: "Delivered",
      subLabel: "At your doorstep",
      icon: CheckCircle2,
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
          <Badge className="bg-primary text-primary-foreground font-semibold gap-1.5 px-2.5 py-0.5 text-xs">
            <CheckCircle2 className="size-3.5" /> Delivered
          </Badge>
        );
      case "shipped":
        return (
          <Badge className="bg-primary/80 text-primary-foreground font-semibold gap-1.5 px-2.5 py-0.5 text-xs">
            <Truck className="size-3.5" /> In Transit
          </Badge>
        );
      case "confirmed":
        return (
          <Badge className="bg-primary/20 text-primary border border-primary/30 font-semibold gap-1.5 px-2.5 py-0.5 text-xs">
            <Check className="size-3.5" /> Confirmed
          </Badge>
        );
      case "placed":
        return (
          <Badge className="bg-primary/10 text-primary border border-primary/20 font-semibold gap-1.5 px-2.5 py-0.5 text-xs">
            <Clock className="size-3.5" /> Placed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-destructive/10 text-destructive border border-destructive/20 font-semibold gap-1.5 px-2.5 py-0.5 text-xs">
            <Ban className="size-3.5" /> Cancelled
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

  // Build Chronological Tracking Scans for Live Log
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
    if (isDelivered) {
      trackingScans.push({
        status: "delivered",
        title: "Delivered",
        date: formatStepDate("delivered"),
        note: "Package was safely delivered to your shipping address and confirmed.",
      });
    }
    if (isShipped || isDelivered) {
      trackingScans.push({
        status: "shipped",
        title: "Dispatched / Out for Delivery",
        date: formatStepDate("shipped"),
        note: "Package departed local logistics hub and is en route with express carrier.",
      });
    }
    if (isConfirmed || isShipped || isDelivered) {
      trackingScans.push({
        status: "confirmed",
        title: "Quality Inspected & Packaged",
        date: formatStepDate("confirmed"),
        note: "Scale models inspected, bubble-wrapped in reinforced Torque Garage packaging.",
      });
    }
    trackingScans.push({
      status: "placed",
      title: "Order Placed & Verified",
      date: formatStepDate("placed"),
      note: "Payment authorized and order entry registered in system.",
    });
  }

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
              {activeView === "invoice" ? "Invoice" : "Delivery Tracker"}
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
              <span>All Orders</span>
            </Button>
          </div>
        </div>

        {/* ─── Hero Header & Status Banner ─── */}
        <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
          {/* Top Headline Strip */}
          <div className="p-6 sm:p-8 border-b border-border/70 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  Order #{orderCode}
                </span>
                {getStatusBadge(orderDetails.status)}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
                {isDelivered
                  ? `Delivered on ${orderDateShort}`
                  : isShipped
                  ? "Dispatched & In Transit"
                  : isConfirmed
                  ? "Boxed & Preparing for Courier"
                  : isCancelled
                  ? "Order Cancelled"
                  : "Order Received & Verified"}
              </h1>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
                {isDelivered
                  ? `Package was delivered directly to your doorstep on ${orderDate}. All items have passed garage verification.`
                  : isShipped
                  ? "Your order has been handed to our express courier partner and is en route to your city sorting hub."
                  : isCancelled
                  ? "This order was cancelled and scale model allocations were released back to garage inventory."
                  : "We have registered your order and our collectors are preparing precision models for factory inspection."}
              </p>
            </div>

            {/* AWB & Dispatch Badge */}
            <div className="bg-muted/40 dark:bg-muted/20 border border-border/80 rounded-xl p-4 shrink-0 space-y-2 text-xs md:min-w-[240px]">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Courier Partner</span>
                <strong className="text-foreground font-semibold">Express Carrier</strong>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>AWB / Tracking ID</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-foreground">
                  <span>{orderDetails.tracking_number || orderCode}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(orderDetails.tracking_number || orderCode, "Tracking ID")}
                    className="hover:text-primary transition-colors cursor-pointer"
                    title="Copy Tracking ID"
                  >
                    <Copy className="size-3" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-muted-foreground pt-1 border-t border-border/60">
                <span>Package Date</span>
                <span className="text-foreground">{orderDateShort}</span>
              </div>
            </div>
          </div>

          {/* ─── 4-Stage Visual Delivery Stepper ─── */}
          {!isCancelled && (
            <div className="p-6 sm:p-8 bg-muted/10">
              <div className="relative">
                {/* Connecting Track Line */}
                <div className="hidden sm:block absolute left-[10%] right-[10%] top-5 h-1 bg-border rounded-full" />

                {/* Active Colored Fill Line */}
                <div
                  className={cn(
                    "hidden sm:block absolute left-[10%] top-5 h-1 rounded-full transition-all duration-700 bg-primary",
                    isDelivered
                      ? "right-[10%]"
                      : currentRank === 3
                      ? "w-[60%]"
                      : currentRank === 2
                      ? "w-[30%]"
                      : "w-0"
                  )}
                />

                {/* 4 Pipeline Step Nodes */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-2">
                  {pipelineSteps.map((step) => {
                    const state = getStepState(step.key);
                    const isCompleted = state.status === "completed";
                    const isCurrent = state.status === "current";
                    const StepIcon = step.icon;

                    return (
                      <div key={step.key} className="flex flex-col items-center text-center relative z-10 group">
                        <div
                          className={cn(
                            "size-10 sm:size-11 rounded-2xl flex items-center justify-center border-2 transition-all shadow-xs",
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
                            <StepIcon className="size-4.5 text-muted-foreground/60" />
                          )}
                        </div>

                        <span
                          className={cn(
                            "text-xs sm:text-sm font-bold mt-2.5",
                            isCompleted
                              ? "text-foreground"
                              : isCurrent
                              ? "text-primary font-extrabold"
                              : "text-muted-foreground"
                          )}
                        >
                          {step.label}
                        </span>

                        <span className="text-[11px] text-muted-foreground hidden sm:block mt-0.5">
                          {state.date !== "Pending" ? state.date : step.subLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── Cancelled Order Banner ─── */}
        {isCancelled && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 sm:p-6 flex items-start gap-4 shadow-2xs">
            <AlertTriangle className="size-6 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-bold text-destructive text-base">Order Was Cancelled</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {historyMap.cancelled?.note ||
                  "This order was cancelled and inventory quantities were restored to the catalog."}
              </p>
              {historyMap.cancelled?.timestamp && (
                <p className="text-xs text-muted-foreground pt-1">
                  Cancellation processed on: {new Date(historyMap.cancelled.timestamp).toLocaleString("en-IN")}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ─── Navigation Tabs: [ Delivery Journey ] | [ Invoice & Details ] ─── */}
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
            <span>Delivery Tracking & Package</span>
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
            <span>Official Invoice & Summary</span>
          </button>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            VIEW 1: TRACKING & DASHBOARD
            ════════════════════════════════════════════════════════════════════ */}
        {activeView === "tracking" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Left 8 Columns: Live Activity Timeline & Scale Model Showcase */}
            <div className="lg:col-span-8 space-y-6">

              {/* 1. Live Checkpoint Journey Log */}
              <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
                <div className="bg-muted/40 dark:bg-muted/20 border-b border-border/70 px-5 sm:px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Clock className="size-4 text-primary" />
                    <h3 className="font-bold text-sm text-foreground">
                      Live Delivery Checkpoints
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAllUpdates((prev) => !prev)}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{showAllUpdates ? "Collapse History" : "Expand All Checkpoints"}</span>
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
                                      Latest Update
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

              {/* 2. Shipment Items Showcase Card */}
              <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
                <div className="bg-muted/40 dark:bg-muted/20 border-b border-border/70 px-5 sm:px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="size-4 text-primary" />
                    <h3 className="font-bold text-sm text-foreground">
                      Scale Models in Shipment ({items.length} {items.length === 1 ? "item" : "items"})
                    </h3>
                  </div>
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
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 py-5 first:pt-0 last:pb-0"
                      >
                        <div className="flex gap-4 sm:gap-5 flex-1 min-w-0">
                          <Link
                            to={slug ? `/products/${slug}` : "#"}
                            className="size-20 sm:size-24 rounded-xl bg-background border border-border/80 p-2 flex items-center justify-center shrink-0 hover:border-primary transition-all overflow-hidden shadow-2xs"
                          >
                            <img
                              src={img}
                              alt={item.name || prod.name}
                              className="size-full object-contain hover:scale-105 transition-transform duration-300"
                            />
                          </Link>

                          <div className="space-y-1.5 flex-1 min-w-0">
                            <Link
                              to={slug ? `/products/${slug}` : "#"}
                              className="font-bold text-sm sm:text-base text-foreground hover:text-primary transition-colors line-clamp-1 block"
                            >
                              {item.name || prod.name || "Precision Diecast Scale Model"}
                            </Link>

                            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                              <span>
                                Qty: <strong className="text-foreground font-semibold">{qty}</strong>
                              </span>
                              <span>•</span>
                              <span>
                                ₹{price.toLocaleString("en-IN", { minimumFractionDigits: 2 })} each
                              </span>
                            </div>

                            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-0.5">
                              <span className="inline-flex items-center gap-1 text-primary font-semibold">
                                <ShieldCheck className="size-3.5" /> Certified Authentic Scale Collectible
                              </span>
                              <span>•</span>
                              <span>Torque Toyzz Garage Guaranteed</span>
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
                            <Link to={slug ? `/products/${slug}` : "#"}>
                              View Item Details
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
                    <span>Every model comes packed in reinforced shock-proof bubble wrapping.</span>
                  </div>
                  <span className="hidden sm:inline font-medium text-foreground">7-Day Return Policy</span>
                </div>
              </div>

              {/* 3. Live Courier Feed Iframe (if delivery_partner_url exists) */}
              {orderDetails.delivery_partner_url && !isCancelled && (
                <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
                  <div className="bg-muted/40 dark:bg-muted/20 border-b border-border/80 px-5 sm:px-6 py-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Truck className="size-4 text-primary" />
                      <h4 className="font-bold text-sm text-foreground">Live Logistics Portal</h4>
                    </div>
                    <Button asChild variant="outline" size="sm" className="h-7 text-xs rounded-lg gap-1">
                      <a href={orderDetails.delivery_partner_url} target="_blank" rel="noopener noreferrer">
                        Carrier Tracking <ExternalLink className="size-3" />
                      </a>
                    </Button>
                  </div>
                  <div className="p-4">
                    <div className="relative w-full h-96 bg-muted/20 rounded-xl overflow-hidden border border-border">
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

            {/* Right 4 Columns: Destination, Billing, Garage Assistance */}
            <div className="lg:col-span-4 space-y-6">

              {/* 1. Shipping Destination Card */}
              <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
                <div className="bg-muted/40 dark:bg-muted/20 border-b border-border/80 px-5 py-3.5 flex items-center gap-2">
                  <MapPin className="size-4 text-primary" />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Shipping Destination
                  </h4>
                </div>
                <div className="p-5 space-y-1.5 text-xs">
                  <p className="font-bold text-sm text-foreground">{shippingName}</p>
                  {orderDetails.shipping_address ? (
                    <div className="text-muted-foreground space-y-1 leading-relaxed pt-1">
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
                      <p className="font-medium text-foreground">India</p>
                      {orderDetails.user?.phone && (
                        <p className="pt-1.5 text-[11px] flex items-center gap-1.5 border-t border-border/60">
                          <Phone className="size-3 text-primary" />
                          <span>Contact: <strong className="text-foreground">{orderDetails.user.phone}</strong></span>
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Address details not recorded</p>
                  )}
                </div>
              </div>

              {/* 2. Order Financial Breakdown Card */}
              <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
                <div className="bg-muted/40 dark:bg-muted/20 border-b border-border/80 px-5 py-3.5 flex items-center gap-2">
                  <CreditCard className="size-4 text-primary" />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Payment & Summary
                  </h4>
                </div>
                <div className="p-5 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Item(s) Subtotal:</span>
                    <span className="font-medium text-foreground">
                      ₹
                      {(orderDetails.pricing?.subtotal || orderTotal).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Shipping:</span>
                    {orderDetails.pricing?.shipping_cost > 0 ? (
                      <span className="font-medium text-foreground">
                        ₹{orderDetails.pricing.shipping_cost.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    ) : (
                      <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold">
                        FREE Delivery
                      </Badge>
                    )}
                  </div>

                  {orderDetails.pricing?.tax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estimated GST (18%):</span>
                      <span className="font-medium text-foreground">
                        ₹{orderDetails.pricing.tax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}

                  <Separator className="my-2" />

                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-foreground">Grand Total:</span>
                    <span className="text-base font-black text-primary">
                      ₹{orderTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Payment Status:</span>
                    <Badge
                      className={cn(
                        "capitalize font-semibold text-[10px]",
                        orderDetails.payment?.status === "paid"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {orderDetails.payment?.method || "Prepaid"} • {orderDetails.payment?.status || "Authorized"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* 3. Garage Assistance & Cancellation Card */}
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
                    <span>View Formal Tax Invoice</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(orderCode, "Order ID")}
                    className="w-full h-8.5 text-xs justify-start font-medium rounded-xl cursor-pointer"
                  >
                    <Copy className="size-3.5 mr-2 text-muted-foreground" />
                    <span>Copy Order ID (#{orderCode})</span>
                  </Button>

                  {/* Cancel Button if eligible */}
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
                          <span>Cancel Order</span>
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
                              Are you sure you want to cancel this order? This action will restock all scale models back to the garage collection.
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
              {/* Invoice Header */}
              <div className="p-6 sm:p-8 border-b border-border/70 flex flex-col sm:flex-row justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-black text-foreground tracking-tight">
                    Torque Toyzz
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Precision Diecast & RC Automotive Collectibles
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
                  <p className="text-muted-foreground">Date: {orderDate}</p>
                </div>
              </div>

              {/* Bill to & Ship to */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8 border-b border-border/70 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-muted-foreground uppercase text-[11px] tracking-wider">
                    Customer / Delivery To
                  </span>
                  <p className="font-bold text-sm text-foreground">{shippingName}</p>
                  {orderDetails.shipping_address && (
                    <div className="text-muted-foreground space-y-0.5">
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
                    </div>
                  )}
                </div>

                <div className="space-y-1 md:text-right">
                  <span className="font-bold text-muted-foreground uppercase text-[11px] tracking-wider">
                    Payment Details
                  </span>
                  <p className="font-semibold text-foreground capitalize">
                    {orderDetails.payment?.method || "Prepaid Online"}
                  </p>
                  <p className="text-muted-foreground capitalize">
                    Status: {orderDetails.payment?.status || "Captured"}
                  </p>
                  {orderDetails.payment?.transaction_id && (
                    <p className="font-mono text-[11px] text-muted-foreground">
                      Txn: {orderDetails.payment.transaction_id}
                    </p>
                  )}
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div className="p-6 sm:p-8 space-y-4">
                <h4 className="font-bold text-sm text-foreground">
                  Order Breakdown
                </h4>
                <div className="divide-y divide-border/60">
                  {items.map((item, idx) => {
                    const prod = item.product || item;
                    const qty = item.quantity || 1;
                    const unitPrice = Number(item.price || prod.price || 0);
                    const lineTotal = unitPrice * qty;

                    return (
                      <div key={idx} className="flex items-center justify-between py-3.5 text-xs first:pt-0 last:pb-0">
                        <div className="space-y-0.5">
                          <p className="font-bold text-foreground">
                            {item.name || prod.name || "Scale Model"}
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

                {/* Totals */}
                <div className="space-y-2 text-xs max-w-xs ml-auto pt-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium">
                      ₹
                      {(orderDetails.pricing?.subtotal || orderTotal).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping Cost:</span>
                    <span>
                      {orderDetails.pricing?.shipping_cost > 0
                        ? `₹${orderDetails.pricing.shipping_cost.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}`
                        : "FREE"}
                    </span>
                  </div>
                  {orderDetails.pricing?.tax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">GST (18%):</span>
                      <span>₹{orderDetails.pricing.tax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-black text-base text-primary">
                    <span>Total Amount:</span>
                    <span>₹{orderTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Invoice Footer Strip */}
              <div className="bg-muted/30 border-t border-border/70 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                <p>This is a computer-generated tax invoice and requires no physical signature.</p>
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
