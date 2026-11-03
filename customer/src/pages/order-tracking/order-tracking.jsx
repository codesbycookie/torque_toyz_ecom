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
  Loader2,
} from "lucide-react";
import { useApi } from "@/core/contexts/api.context";
import { useLoader } from "@/core/hooks/useLoader";
import { useBreadcrumb } from "@/core/contexts/breadcrumb.context";
import { cn } from "@/lib/utils";

export default function OrderTracking() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { setCustomBreadcrumbs } = useBreadcrumb();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeView = searchParams.get("view") || "tracking"; // "tracking" | "invoice"

  const { orders, payments } = useApi();
  const { loadOnly, loading } = useLoader();

  const [showAllUpdates, setShowAllUpdates] = useState(true);
  const [cancelReason, setCancelReason] = useState("Changed my mind");
  const [isCancelling, setIsCancelling] = useState(false);
  const [isPayingOrder, setIsPayingOrder] = useState(false);

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
    const wasPaid =
      orderDetails.payment?.status === "paid" ||
      orderDetails.payment?.status === "refund_pending";

    try {
      setIsCancelling(true);
      await orders.cancelOrder(orderId, cancelReason);
      if (wasPaid) {
        toast.success("Order cancelled successfully. Refund pending.");
      } else {
        toast.success("Order cancelled successfully");
      }
      try {
        await orders.getOne(orderId);
      } catch {
        // ignore
      }
    } catch {
      toast.error("Failed to cancel order");
    } finally {
      setIsCancelling(false);
    }
  };

  // Complete pending online payment
  const handleCompleteOrder = async () => {
    if (!orderDetails) return;
    const orderId = orderDetails._id || orderDetails.id;
    try {
      setIsPayingOrder(true);
      const isScriptLoaded = await payments.loadScript();
      if (!isScriptLoaded) {
        toast.error("Razorpay Payment Gateway failed to load. Please check your connection.");
        return;
      }

      const rzpOrder = await payments.createPaymentOrder(orderId);
      if (!rzpOrder || !rzpOrder.key_id) {
        toast.error("Online payment gateway is temporarily unavailable. Please try again later.");
        return;
      }

      const options = {
        key: rzpOrder.key_id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: "Torque Toyz",
        description: `Order #${rzpOrder.order_code || orderId.slice(-6)}`,
        order_id: rzpOrder.razorpay_order_id,
        handler: async function (response) {
          try {
            await payments.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success("Payment successful! Your order is confirmed.");
            try {
              await orders.getOne(orderId);
            } catch {
              // ignore
            }
          } catch (err) {
            console.error(err);
            toast.error("Payment verification pending. Please refresh in a moment.");
            try {
              await orders.getOne(orderId);
            } catch {
              // ignore
            }
          }
        },
        modal: {
          ondismiss: function () {
            toast.info("Payment pending. You can complete this order anytime.");
          },
        },
        prefill: {
          name: orderDetails.shipping_address?.name || "Customer",
          email: orderDetails.shipping_address?.email || "customer@torquetoyz.com",
          contact: orderDetails.shipping_address?.phone || "9999999999",
        },
        theme: {
          color: "#e11d48",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        const msg = response.error?.description || "Payment rejected";
        toast.error(`${msg}. You can try again whenever ready.`);
      });
      rzp.open();
    } catch (err) {
      console.error("Payment initialization error:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to initiate payment.");
    } finally {
      setIsPayingOrder(false);
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

  const currentOrderCode =
    orderDetails?.code ||
    (orderDetails?._id ? `ORD-${orderDetails._id.slice(-6).toUpperCase()}` : null);

  useEffect(() => {
    if (currentOrderCode) {
      setCustomBreadcrumbs([
        { label: "Home", href: "/" },
        { label: "My Profile", href: "/profile" },
        { label: "Your Orders", href: "/orders" },
        { label: `#${currentOrderCode}` },
      ]);
    }
  }, [currentOrderCode, setCustomBreadcrumbs]);

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
            We couldn't locate this order in your account. The order ID may be incorrect or you may not have permission to view it.
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
  const orderCode = currentOrderCode || "ORD";
  
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

  // Payment from model: IPayment ({ method: 'cod'|'online', status: 'pending'|'paid'|'failed'|'refunded'|'refund_pending', transaction_id })
  const payment = orderDetails.payment || {
    method: "online",
    status: "pending",
  };
  const paymentStatus = payment.status?.toLowerCase();
  const paymentMethodLabel =
    payment.method === "cod" ? "Cash on Delivery" : "Prepaid Online Payment";
  const isRefunded = paymentStatus === "refunded";
  const isRefundPending =
    isCancelled &&
    !isRefunded &&
    (paymentStatus === "refund_pending" || paymentStatus === "paid");
  const isPaymentPaid = paymentStatus === "paid" || isRefunded;
  const isOrderPaid = isPaymentPaid;
  const isPaymentPending =
    payment.method === "online" &&
    paymentStatus !== "paid" &&
    !isCancelled;

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
      subTitle: "Received & Verified",
      icon: Package,
      note: historyMap.placed?.note || "Order placed and payment verified in system",
    },
    {
      key: "confirmed",
      title: "Confirmed & Packed",
      subTitle: "Quality Checked & Boxed",
      icon: ShieldCheck,
      note: historyMap.confirmed?.note || "Precision models inspected, packed, and boxed securely",
    },
    {
      key: "shipped",
      title: "Shipped",
      subTitle: "In Transit with Courier",
      icon: Truck,
      note: historyMap.shipped?.note || "Package handed over to courier partner and is en route",
    },
    {
      key: "delivered",
      title: "Delivered",
      subTitle: "Delivered to Doorstep",
      icon: CheckCircle2,
      note: historyMap.delivered?.note || "Delivered successfully to destination address",
    },
  ];

  const progressPercent = isDelivered
    ? 100
    : currentRank === 3
    ? 66.66
    : currentRank === 2
    ? 33.33
    : 0;

  const currentMilestoneIndex = Math.min(Math.max((currentRank || 1) - 1, 0), 3);
  const activeMilestone = pipelineMilestones[currentMilestoneIndex];

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
        title: "Handed to Courier",
        date: formatCheckpointDate("shipped"),
        note: "Package departed local distribution center and is out for delivery.",
      });
    }
    if (isConfirmed || isShipped || isDelivered) {
      trackingScans.push({
        status: "confirmed",
        title: "Confirmed & Packed",
        date: formatCheckpointDate("confirmed"),
        note: "Scale models inspected, packed, and boxed securely.",
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
            <Truck className="size-3.5" /> Shipped • In Transit
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
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge className="bg-destructive/10 text-destructive border border-destructive/20 font-semibold gap-1.5 px-3 py-1 text-xs">
              <Ban className="size-3.5" /> Cancelled
            </Badge>
            {isRefunded ? (
              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-semibold gap-1.5 px-2.5 py-1 text-xs">
                <CheckCircle2 className="size-3" /> Refunded
              </Badge>
            ) : isRefundPending ? (
              <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-semibold gap-1.5 px-2.5 py-1 text-xs">
                <Clock className="size-3" /> Refund Pending
              </Badge>
            ) : null}
          </div>
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

        {/* ─── Action Bar & View Switcher ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-4 print:hidden">
          {/* View switcher tabs */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchParams({ view: "tracking" })}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer border",
                activeView === "tracking"
                  ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                  : "bg-muted/40 text-muted-foreground border-border/80 hover:text-foreground hover:bg-muted"
              )}
            >
              <Truck className="size-3.5" />
              <span>Delivery Tracking</span>
            </button>

            <button
              type="button"
              onClick={() => setSearchParams({ view: "invoice" })}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer border",
                activeView === "invoice"
                  ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                  : "bg-muted/40 text-muted-foreground border-border/80 hover:text-foreground hover:bg-muted"
              )}
            >
              <FileText className="size-3.5" />
              <span>Invoice</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {activeView === "invoice" ? (
              <Button
                size="sm"
                onClick={() => window.print()}
                className="h-8.5 rounded-xl text-xs gap-1.5 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xs cursor-pointer"
              >
                <Printer className="size-3.5" />
                <span>Print / Save as PDF</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchParams({ view: "invoice" });
                  setTimeout(() => window.print(), 250);
                }}
                className="h-8.5 rounded-xl text-xs gap-1.5 font-medium cursor-pointer hover:border-primary hover:text-primary"
              >
                <Printer className="size-3.5 text-muted-foreground" />
                <span>Print Invoice</span>
              </Button>
            )}

            {isPaymentPending && (
              <Button
                size="sm"
                disabled={isPayingOrder}
                onClick={handleCompleteOrder}
                className="h-8.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-2xs gap-1.5 cursor-pointer"
              >
                {isPayingOrder ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="size-3.5" />
                    <span>Complete Order (Pay Now)</span>
                  </>
                )}
              </Button>
            )}

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
              onClick={() => navigate("/orders")}
              className="h-8.5 rounded-xl text-xs gap-1.5 font-medium cursor-pointer"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Orders</span>
            </Button>
          </div>
        </div>

        {/* ─── Pending Payment Alert Banner ─── */}
        {isPaymentPending && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="size-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <CreditCard className="size-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">
                  Payment Incomplete
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your order is placed, but online payment of ₹{Number(pricing.total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })} has not been completed yet.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              disabled={isPayingOrder}
              onClick={handleCompleteOrder}
              className="h-9 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs gap-1.5 shadow-xs shrink-0 cursor-pointer"
            >
              {isPayingOrder ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <CreditCard className="size-3.5" />
                  <span>Complete Payment Now</span>
                </>
              )}
            </Button>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            VIEW 1: TRACKING DASHBOARD (Only rendered in tracking view)
            ════════════════════════════════════════════════════════════════════ */}
        {activeView === "tracking" && (
          <>
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
                    {isPaymentPending && (
                      <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-semibold gap-1">
                        <CreditCard className="size-3" /> Payment Pending
                      </Badge>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground">
                    {isDelivered
                      ? `Delivered on ${orderDateShort}`
                      : isShipped
                      ? "Shipped & In Transit"
                      : isConfirmed
                      ? "Checked & Packed"
                      : isCancelled
                      ? (isRefunded
                          ? "Order Cancelled • Refund Processed"
                          : isRefundPending
                          ? "Order Cancelled • Refund Pending"
                          : "Order Was Cancelled")
                      : "Order Placed & Confirmed"}
                  </h1>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
                    {isDelivered
                      ? `Package delivered safely on ${orderDateFormatted}. Your scale model collection has been updated.`
                      : isShipped
                      ? "Package is currently in transit with our logistics partner and headed toward your local hub."
                      : isCancelled
                      ? (isRefunded
                          ? `This order was cancelled and a full refund of ₹${Number(pricing.total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })} has been processed back to your original payment method.`
                          : isRefundPending
                          ? `This order was cancelled. Since payment was received, your refund of ₹${Number(pricing.total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })} is currently pending and will be processed back to your original payment method.`
                          : "This order was cancelled and inventory quantities were restored to the catalog.")
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
                <div className="p-5 sm:p-8 bg-gradient-to-b from-muted/30 via-muted/10 to-transparent border-t border-border/60">
                  {/* Stage Progress Summary Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-8 pb-4 border-b border-border/50">
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                        <span className="relative flex h-2 w-2">
                          {!isDelivered && (
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                          )}
                          <span
                            className={cn(
                              "relative inline-flex rounded-full h-2 w-2",
                              isDelivered ? "bg-emerald-500" : "bg-primary"
                            )}
                          />
                        </span>
                        {isDelivered
                          ? "Delivery Complete"
                          : `Stage ${currentRank} of 4: ${activeMilestone?.title || ""}`}
                      </span>
                      <span className="text-xs text-muted-foreground hidden md:inline">
                        {isDelivered
                          ? "Your package has been successfully delivered."
                          : activeMilestone?.subTitle}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground ml-auto">
                      <span>Fulfillment:</span>
                      <span className="font-bold text-foreground">
                        {isDelivered ? "100%" : `${Math.round((Math.max(currentRank - 1, 0) / 3) * 100)}%`}
                      </span>
                    </div>
                  </div>

                  {/* Desktop Horizontal Stepper (hidden sm:block) */}
                  <div className="hidden sm:block">
                    <div className="relative">
                      {/* Background Track: connects centers of Step 1 (12.5%) and Step 4 (87.5%) */}
                      <div className="absolute left-[12.5%] right-[12.5%] top-6 -translate-y-1/2 h-1.5 bg-muted-foreground/15 dark:bg-muted-foreground/20 rounded-full overflow-hidden">
                        {/* Dynamic Colored Active Fill Line */}
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-primary via-primary to-emerald-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>

                      {/* 4 Milestones */}
                      <div className="grid grid-cols-4 gap-2">
                        {pipelineMilestones.map((milestone, idx) => {
                          const stepState = getMilestoneState(milestone.key);
                          const isCompleted = stepState.state === "completed";
                          const isCurrent = stepState.state === "current";
                          const isPending = stepState.state === "pending";
                          const StepIcon = milestone.icon;

                          return (
                            <div key={milestone.key} className="flex flex-col items-center text-center relative z-10 group">
                              {/* Node Icon Container */}
                              <div className="relative">
                                {/* Glowing Radar Halo for Active Step */}
                                {isCurrent && (
                                  <>
                                    <div className="absolute -inset-1.5 rounded-full bg-primary/20 animate-ping opacity-60" />
                                    <div className="absolute -inset-2 rounded-full bg-primary/10 blur-xs" />
                                  </>
                                )}

                                <div
                                  className={cn(
                                    "size-12 rounded-full flex items-center justify-center transition-all duration-300 relative z-10 shadow-sm",
                                    isCompleted
                                      ? "bg-primary text-primary-foreground shadow-primary/25 border-2 border-primary"
                                      : isCurrent
                                      ? "bg-background text-primary border-2 border-primary ring-4 ring-primary/20 shadow-lg shadow-primary/20"
                                      : "bg-muted/60 text-muted-foreground border-2 border-dashed border-border"
                                  )}
                                >
                                  {isCompleted ? (
                                    <Check className="size-5 stroke-[2.5]" />
                                  ) : (
                                    <StepIcon
                                      className={cn(
                                        "size-5 transition-transform duration-300",
                                        isCurrent && "text-primary scale-110",
                                        isPending && "text-muted-foreground/50"
                                      )}
                                    />
                                  )}
                                </div>
                              </div>

                              {/* Status Badge */}
                              <div className="mt-3">
                                <span
                                  className={cn(
                                    "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide uppercase",
                                    isCompleted
                                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                      : isCurrent
                                      ? "bg-primary/15 text-primary border border-primary/30 font-bold"
                                      : "bg-muted/50 text-muted-foreground/70 border border-transparent"
                                  )}
                                >
                                  {isCompleted ? "Completed" : isCurrent ? "In Progress" : `Step ${idx + 1}`}
                                </span>
                              </div>

                              {/* Title */}
                              <span
                                className={cn(
                                  "text-xs md:text-sm font-bold mt-1.5 tracking-tight transition-colors",
                                  isCompleted ? "text-foreground" : isCurrent ? "text-primary font-black" : "text-muted-foreground/70"
                                )}
                              >
                                {milestone.title}
                              </span>

                              {/* Subtitle / Timestamp */}
                              <span className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5 max-w-[150px]">
                                {stepState.date !== "Pending" ? stepState.date : milestone.subTitle}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Mobile Vertical Connected Timeline (block sm:hidden) */}
                  <div className="block sm:hidden relative">
                    {/* Background Vertical Line */}
                    <div className="absolute left-[22px] -translate-x-1/2 top-5 bottom-5 w-1 bg-muted-foreground/15 dark:bg-muted-foreground/25 rounded-full overflow-hidden">
                      {/* Dynamic Active Vertical Fill Line */}
                      <div
                        className="w-full bg-gradient-to-b from-primary via-primary to-emerald-500 rounded-full transition-all duration-700 ease-out"
                        style={{ height: `${progressPercent}%` }}
                      />
                    </div>

                    <div className="space-y-4">
                      {pipelineMilestones.map((milestone, idx) => {
                        const stepState = getMilestoneState(milestone.key);
                        const isCompleted = stepState.state === "completed";
                        const isCurrent = stepState.state === "current";
                        const StepIcon = milestone.icon;

                        return (
                          <div key={milestone.key} className="flex items-start gap-3.5 relative z-10">
                            {/* Node Icon */}
                            <div className="relative shrink-0 mt-0.5">
                              {isCurrent && (
                                <div className="absolute -inset-1 rounded-full bg-primary/20 animate-ping opacity-75" />
                              )}
                              <div
                                className={cn(
                                  "size-11 rounded-full flex items-center justify-center transition-all shadow-xs relative z-10",
                                  isCompleted
                                    ? "bg-primary text-primary-foreground border-2 border-primary"
                                    : isCurrent
                                    ? "bg-background text-primary border-2 border-primary ring-4 ring-primary/20"
                                    : "bg-muted/70 text-muted-foreground border-2 border-dashed border-border"
                                )}
                              >
                                {isCompleted ? (
                                  <Check className="size-5 stroke-[2.5]" />
                                ) : (
                                  <StepIcon className={cn("size-5", isCurrent ? "text-primary" : "text-muted-foreground/60")} />
                                )}
                              </div>
                            </div>

                            {/* Step Info Card */}
                            <div
                              className={cn(
                                "flex-1 p-3.5 rounded-xl border transition-all",
                                isCurrent
                                  ? "bg-primary/5 border-primary/30 shadow-xs"
                                  : isCompleted
                                  ? "bg-muted/20 border-border/80"
                                  : "bg-background/40 border-border/40 opacity-70"
                              )}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span
                                  className={cn(
                                    "text-sm font-bold",
                                    isCompleted ? "text-foreground" : isCurrent ? "text-primary font-black" : "text-muted-foreground"
                                  )}
                                >
                                  {milestone.title}
                                </span>
                                <span
                                  className={cn(
                                    "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase shrink-0",
                                    isCompleted
                                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                      : isCurrent
                                      ? "bg-primary/15 text-primary border border-primary/30"
                                      : "bg-muted/60 text-muted-foreground/70"
                                  )}
                                >
                                  {isCompleted ? "Done" : isCurrent ? "Active" : `Step ${idx + 1}`}
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-2 mt-1 text-xs text-muted-foreground">
                                <span>{milestone.subTitle}</span>
                                {stepState.date !== "Pending" && (
                                  <span className="font-medium text-foreground text-[11px] shrink-0">
                                    {stepState.date}
                                  </span>
                                )}
                              </div>

                              {isCurrent && milestone.note && (
                                <p className="mt-2 text-xs text-muted-foreground/90 bg-background/80 p-2 rounded-lg border border-border/60">
                                  {milestone.note}
                                </p>
                              )}
                            </div>
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
              <div
                className={cn(
                  "rounded-2xl border p-5 sm:p-6 flex items-start gap-4 shadow-2xs",
                  isRefunded
                    ? "border-emerald-500/30 bg-emerald-500/10"
                    : isRefundPending
                    ? "border-amber-500/30 bg-amber-500/10"
                    : "border-destructive/30 bg-destructive/10"
                )}
              >
                {isRefunded ? (
                  <CheckCircle2 className="size-6 text-emerald-500 shrink-0 mt-0.5" />
                ) : isRefundPending ? (
                  <Clock className="size-6 text-amber-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="size-6 text-destructive shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3
                      className={cn(
                        "font-bold text-base",
                        isRefunded
                          ? "text-emerald-600 dark:text-emerald-400"
                          : isRefundPending
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-destructive"
                      )}
                    >
                      Order Cancelled
                    </h3>
                    {isRefunded ? (
                      <Badge className="bg-emerald-600 text-white font-bold text-xs gap-1">
                        <CheckCircle2 className="size-3" /> Refunded
                      </Badge>
                    ) : isRefundPending ? (
                      <Badge className="bg-amber-500 text-white font-bold text-xs">
                        Refund Pending
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {isRefunded
                      ? `This order was cancelled successfully and a full refund of ₹${Number(pricing.total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })} has been processed to your original payment method${payment.transaction_id ? ` (Transaction ID: ${payment.transaction_id})` : ""}.`
                      : isRefundPending
                      ? `This order was cancelled successfully. Your payment refund of ₹${Number(pricing.total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })} is currently pending and will be credited to your account / original payment method within 5–7 business days.`
                      : (historyMap.cancelled?.note ||
                        "This order has been cancelled and the items have been restocked.")}
                  </p>
                  {historyMap.cancelled?.timestamp && (
                    <p className="text-xs text-muted-foreground pt-1">
                      Cancellation recorded: {new Date(historyMap.cancelled.timestamp).toLocaleString("en-IN")}
                    </p>
                  )}
                </div>
              </div>
            )}

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
                        <div className="flex sm:flex-col items-center gap-2 shrink-0 sm:w-36 pt-1 sm:pt-0">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="w-full h-8.5 rounded-xl text-xs font-medium hover:border-primary hover:text-primary cursor-pointer gap-1.5"
                          >
                            <Link to={prodId ? `/products/${prodId}` : "#"}>
                              <ExternalLink className="size-3" />
                              <span>View Model</span>
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
                    <span>Secure packaging to prevent damage in transit.</span>
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
                    ) : pricing?.is_free_delivery ? (
                      <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold">
                        FREE Delivery
                      </Badge>
                    ) : (
                      <span className="font-medium text-foreground">₹0.00</span>
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
                        isRefunded
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                          : isPaymentPaid
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {paymentMethodLabel} ({isRefunded ? "Refunded" : isRefundPending ? "Refund Pending" : (payment.status || "pending")})
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
                  <span>Need Help?</span>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchParams({ view: "invoice" })}
                    className="w-full h-8.5 text-xs justify-start font-medium rounded-xl cursor-pointer"
                  >
                    <FileText className="size-3.5 mr-2 text-primary" />
                    <span>View Invoice</span>
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
                              Are you sure you want to cancel this order? This cannot be undone.
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
        </>
      )}

        {/* ════════════════════════════════════════════════════════════════════
            VIEW 2: PRINTABLE PDF INVOICE
            ════════════════════════════════════════════════════════════════════ */}
        {activeView === "invoice" && (
          <div className="space-y-6 printable-invoice-wrapper">
            <div className="printable-invoice-card rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs print:border-none print:shadow-none print:bg-white print:text-black">
              {/* Header with Torque Toyzz Logo & Invoice Metadata */}
              <div className="p-6 sm:p-8 border-b border-border/70 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 print:border-b-2 print:border-black/20 print:p-0 print:pb-6">
                <div className="flex items-center gap-4">
                  <img
                    src="/logo.png"
                    alt="Torque Toyzz"
                    className="h-16 sm:h-20 w-auto object-contain"
                  />
                  <div>
                    <h2 className="text-2xl font-black text-foreground print:text-black tracking-tight">
                      Torque Toyzz
                    </h2>
                    <p className="text-xs text-muted-foreground print:text-gray-600 mt-0.5">
                      Precision Diecast & RC Hypercars
                    </p>
                    <p className="text-xs text-muted-foreground print:text-gray-600">
                      support@torquetoyzz.com • www.torquetoyzz.com
                    </p>
                  </div>
                </div>

                <div className="sm:text-right space-y-1 text-xs">
                  <Badge className="bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider px-2.5 py-0.5 print:bg-black print:text-white">
                    Invoice
                  </Badge>
                  <p className="font-mono font-bold text-base text-foreground print:text-black pt-1">
                    #{orderCode}
                  </p>
                  <p className="text-muted-foreground print:text-gray-600">
                    Order Date: {orderDateFormatted}
                  </p>
                </div>
              </div>

              {/* Customer & Order Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 sm:p-8 border-b border-border/70 text-xs print:border-b print:border-black/10 print:p-0 print:py-6">
                <div className="space-y-1.5">
                  <span className="font-bold text-muted-foreground print:text-gray-500 uppercase text-[11px] tracking-wider block">
                    Deliver To:
                  </span>
                  <p className="font-bold text-sm text-foreground print:text-black">{customerName}</p>
                  <div className="text-muted-foreground print:text-gray-700 space-y-0.5 leading-relaxed">
                    {shippingAddress.door && <p>{shippingAddress.door}</p>}
                    {shippingAddress.street && <p>{shippingAddress.street}</p>}
                    <p>
                      {[shippingAddress.city, stateDisplay].filter(Boolean).join(", ")}
                      {shippingAddress.pincode ? ` - ${shippingAddress.pincode}` : ""}
                    </p>
                    <p>India</p>
                    {customerPhone && (
                      <p className="pt-1">
                        <span className="font-semibold text-foreground print:text-black">Phone:</span> {customerPhone}
                      </p>
                    )}
                    {customerEmail && (
                      <p>
                        <span className="font-semibold text-foreground print:text-black">Email:</span> {customerEmail}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 sm:text-right">
                  <span className="font-bold text-muted-foreground print:text-gray-500 uppercase text-[11px] tracking-wider block">
                    Order & Payment Details:
                  </span>
                  <div className="space-y-1 leading-relaxed text-muted-foreground print:text-gray-700">
                    <p>
                      <span className="font-semibold text-foreground print:text-black">Payment Method: </span>
                      <span className="capitalize">{paymentMethodLabel}</span>
                    </p>
                    <p>
                      <span className="font-semibold text-foreground print:text-black">Payment Status: </span>
                      <span className={cn(
                        "capitalize font-medium",
                        isRefunded && "text-emerald-600 dark:text-emerald-400 font-bold"
                      )}>
                        {isRefunded ? "Refunded" : isRefundPending ? "Refund Pending" : (payment.status || "Pending")}
                      </span>
                    </p>
                    {payment.transaction_id && (
                      <p className="font-mono text-[11px]">
                        <span className="font-semibold text-foreground print:text-black">Transaction ID: </span>
                        {payment.transaction_id}
                      </p>
                    )}
                    <p>
                      <span className="font-semibold text-foreground print:text-black">Order Status: </span>
                      <span className="capitalize font-semibold text-primary print:text-black">{status}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="p-6 sm:p-8 space-y-4 print:p-0 print:py-6">
                <h4 className="font-bold text-sm text-foreground print:text-black uppercase tracking-wider text-[11px]">
                  Purchased Items
                </h4>

                <div className="w-full overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-border/70 print:border-b-2 print:border-black/20 text-muted-foreground print:text-gray-600 font-semibold uppercase text-[10px] tracking-wider">
                        <th className="py-2.5 pr-4">#</th>
                        <th className="py-2.5 pr-4">Item Description</th>
                        <th className="py-2.5 px-4 text-center">Qty</th>
                        <th className="py-2.5 px-4 text-right">Price</th>
                        <th className="py-2.5 pl-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 print:divide-black/10">
                      {items.map((item, idx) => {
                        const prod = typeof item.product === "object" && item.product !== null ? item.product : {};
                        const qty = Number(item.quantity || 1);
                        const unitPrice = Number(item.price || prod.price || 0);
                        const lineTotal = unitPrice * qty;

                        return (
                          <tr key={idx} className="text-foreground print:text-black">
                            <td className="py-3 pr-4 text-muted-foreground print:text-gray-500 font-mono">{idx + 1}</td>
                            <td className="py-3 pr-4">
                              <p className="font-bold text-foreground print:text-black">
                                {item.name || prod.name || "Precision Scale Model"}
                              </p>
                              {prod.scale && (
                                <span className="text-[11px] text-muted-foreground print:text-gray-500">
                                  Scale: {prod.scale}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center font-medium">{qty}</td>
                            <td className="py-3 px-4 text-right font-mono text-muted-foreground print:text-gray-700">
                              ₹{unitPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 pl-4 text-right font-bold font-mono">
                              ₹{lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-border/70 print:border-t print:border-black/20 pt-4 flex justify-end">
                  <div className="space-y-2 text-xs w-full max-w-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground print:text-gray-600">Subtotal:</span>
                      <span className="font-medium text-foreground print:text-black font-mono">
                        ₹{Number(pricing.subtotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground print:text-gray-600">Shipping:</span>
                      <span className="font-medium text-foreground print:text-black">
                        {Number(pricing.shipping_cost || 0) > 0
                          ? `₹${Number(pricing.shipping_cost).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                          : "FREE"}
                      </span>
                    </div>
                    <div className="border-t border-border/70 print:border-t-2 print:border-black/30 pt-2 flex justify-between font-black text-base text-primary print:text-black">
                      <span>Total Amount:</span>
                      <span className="font-mono">
                        ₹{Number(pricing.total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoice Footer (on screen: note + print button; in print: note only) */}
              <div className="bg-muted/30 border-t border-border/70 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground print:bg-white print:border-t print:border-black/10 print:p-0 print:pt-6 print:text-gray-500">
                <p>Thank you for shopping with Torque Toyzz! For questions, email support@torquetoyzz.com</p>
                <Button
                  size="sm"
                  onClick={() => window.print()}
                  className="rounded-xl text-xs gap-1.5 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xs cursor-pointer print:hidden"
                >
                  <Printer className="size-3.5" /> Print / Save as PDF
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
