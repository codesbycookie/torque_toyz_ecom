import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Ban,
  Search,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Copy,
  ExternalLink,
  ShoppingBag,
  ArrowRight,
  MapPin,
  Car,
  SlidersHorizontal,
  X,
  Check,
  Calendar,
  FileText,
  Loader2,
} from "lucide-react";
import { useApi } from "@/core/contexts/api.context";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Sort options mapped to backend sortBy & order
const SORT_OPTIONS = [
  { value: "latest", label: "Newest First", sortBy: "createdAt", order: "desc" },
  { value: "oldest", label: "Oldest First", sortBy: "createdAt", order: "asc" },
  { value: "price-high", label: "Total: High to Low", sortBy: "pricing.total", order: "desc" },
  { value: "price-low", label: "Total: Low to High", sortBy: "pricing.total", order: "asc" },
];

// Status filters
const STATUS_OPTIONS = [
  { id: "all", label: "All Orders" },
  { id: "placed", label: "Order Placed" },
  { id: "confirmed", label: "Confirmed" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

// Time period filters
const TIME_OPTIONS = [
  { id: "all", label: "All Time" },
  { id: "30days", label: "Last 30 Days" },
  { id: "3months", label: "Past 3 Months" },
  { id: "2026", label: "Year 2026" },
];

export default function Orders() {
  const navigate = useNavigate();
  const { orders, cart } = useApi();

  const orderList = orders.list || [];
  const isLoading = Boolean(orders.loading);
  const pagination = orders.pagination || {
    page: 1,
    limit: 10,
    total: orderList.length,
    pages: 1,
  };

  // Filter & Query States
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedTime, setSelectedTime] = useState("all");
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState("Changed my mind");
  const [reorderingOrderId, setReorderingOrderId] = useState(null);

  const ordersTopRef = useRef(null);

  // Primary function to query backend with filters & pagination
  const fetchBackendOrders = useCallback(
    (pageNumber = 1, overrides = {}) => {
      const activeSortKey = overrides.sort ?? sort;
      const sortConfig =
        SORT_OPTIONS.find((s) => s.value === activeSortKey) || SORT_OPTIONS[0];

      const activeStatus =
        overrides.status !== undefined ? overrides.status : selectedStatus;
      const activeSearch =
        overrides.search !== undefined ? overrides.search : search;

      const queryParams = {
        page: pageNumber,
        limit: 10,
        sortBy: sortConfig.sortBy,
        order: sortConfig.order,
        search: activeSearch.trim() || undefined,
        status: activeStatus !== "all" ? activeStatus : undefined,
      };

      orders.getMine(queryParams);
    },
    [sort, selectedStatus, search]
  );

  // Initial load
  useEffect(() => {
    fetchBackendOrders(1);
  }, []);

  // Page change handler
  const handlePageChange = (newPage) => {
    if (newPage < 1 || (pagination && newPage > pagination.pages) || newPage === currentPage)
      return;
    setCurrentPage(newPage);
    fetchBackendOrders(newPage);
    ordersTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Sort change handler
  const handleSortChange = (newSort) => {
    setSort(newSort);
    setCurrentPage(1);
    fetchBackendOrders(1, { sort: newSort });
  };

  // Status filter handler
  const handleStatusChange = (statusId) => {
    setSelectedStatus(statusId);
    setCurrentPage(1);
    fetchBackendOrders(1, { status: statusId });
  };

  // Search handler
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBackendOrders(1, { search });
  };

  const handleClearSearch = () => {
    setSearch("");
    setCurrentPage(1);
    fetchBackendOrders(1, { search: "" });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearch("");
    setSelectedStatus("all");
    setSelectedTime("all");
    setSort("latest");
    setCurrentPage(1);

    fetchBackendOrders(1, {
      search: "",
      status: "all",
      sort: "latest",
    });
  };

  // Cancel order
  const handleCancelOrder = async (orderId) => {
    try {
      setCancellingOrderId(orderId);
      const targetOrder = orderList.find((o) => (o._id || o.id) === orderId);
      const wasPaid =
        targetOrder?.payment?.status === "paid" ||
        targetOrder?.payment?.status === "refund_pending" ||
        (targetOrder?.payment?.method === "online" && targetOrder?.payment?.status !== "failed");

      await orders.cancelOrder(orderId, cancelReason);
      if (wasPaid) {
        toast.success("Order cancelled successfully. Refund pending.");
      } else {
        toast.success("Order cancelled successfully");
      }
      fetchBackendOrders(currentPage);
    } catch {
      toast.error("Failed to cancel order");
    } finally {
      setCancellingOrderId(null);
    }
  };

  // Buy Again: Adds EVERY product in the order into the cart
  const handleBuyAgain = async (order) => {
    const items = Array.isArray(order?.items) ? order.items : [];
    if (items.length === 0) {
      toast.error("No models found in this order to re-add to cart");
      return;
    }

    const orderId = order._id || order.id;
    try {
      setReorderingOrderId(orderId);
      let successCount = 0;
      let totalUnits = 0;

      for (const item of items) {
        const product = item.product || item;
        const qty = Number(item.quantity) || 1;
        try {
          await cart.addToCart(product, qty);
          successCount++;
          totalUnits += qty;
        } catch (err) {
          console.error("Failed to re-add item to cart:", item, err);
        }
      }

      if (successCount > 0) {
        const orderRef = order.code || (orderId ? `#${String(orderId).slice(-6)}` : "");
        toast.success(
          `Added all ${items.length} ${items.length === 1 ? "model" : "models"} (${totalUnits} ${totalUnits === 1 ? "unit" : "units"}) from order ${orderRef} to your cart!`
        );
      } else {
        toast.error("Could not add models to cart. They may be out of stock.");
      }
    } catch {
      toast.error("Failed to re-add models to cart");
    } finally {
      setReorderingOrderId(null);
    }
  };

  const copyOrderCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied #${code} to clipboard`);
  };

  // Count active filters
  const activeFiltersCount =
    (selectedStatus !== "all" ? 1 : 0) +
    (selectedTime !== "all" ? 1 : 0) +
    (search ? 1 : 0);

  // Status badge helper
  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "delivered":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold gap-1 text-xs">
            <CheckCircle2 className="size-3" /> Delivered
          </Badge>
        );
      case "shipped":
        return (
          <Badge className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-semibold gap-1 text-xs">
            <Truck className="size-3" /> Shipped
          </Badge>
        );
      case "confirmed":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold gap-1 text-xs">
            <CheckCircle2 className="size-3" /> Confirmed
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

  const totalResults = pagination.total || orderList.length;
  const startItem = totalResults > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const endItem =
    totalResults > 0 ? Math.min(pagination.page * pagination.limit, totalResults) : orderList.length;

  return (
    <div className="min-h-screen bg-background text-foreground" ref={ordersTopRef}>
      {/* ─── Orders Container (max-w-7xl) ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Heading & Amazon Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Your Orders
          </h1>

          {/* Amazon "Search all orders" */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search all orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-9 pr-8 text-xs bg-background rounded-lg border-border/80 shadow-2xs"
              />
              {search && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
            <Button
              type="submit"
              size="sm"
              className="h-9 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 font-semibold text-xs shadow-2xs cursor-pointer shrink-0"
            >
              Search Orders
            </Button>
          </form>
        </div>

        {/* Amazon Navigation Tabs */}
        <div className="flex items-center gap-1 sm:gap-6 border-b border-border/80 overflow-x-auto no-scrollbar text-sm">
          {[
            { id: "all", label: "Orders" },
            { id: "buy-again", label: "Buy Again" },
            { id: "not-yet-shipped", label: "Not Yet Shipped" },
            { id: "cancelled", label: "Cancelled Orders" },
          ].map((tab) => {
            const isActive =
              tab.id === "all"
                ? selectedStatus === "all"
                : tab.id === "not-yet-shipped"
                  ? ["placed", "confirmed"].includes(selectedStatus)
                  : tab.id === "cancelled"
                    ? selectedStatus === "cancelled"
                    : false;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (tab.id === "all") handleStatusChange("all");
                  else if (tab.id === "not-yet-shipped") handleStatusChange("placed");
                  else if (tab.id === "cancelled") handleStatusChange("cancelled");
                  else if (tab.id === "buy-again") {
                    handleStatusChange("all");
                    toast.info("Showing your past ordered models to buy again");
                  }
                }}
                className={cn(
                  "pb-2.5 px-1 border-b-2 font-medium transition-all cursor-pointer whitespace-nowrap",
                  isActive
                    ? "border-primary text-primary font-bold"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Amazon Time & Count Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 flex-wrap">
            <span>
              <strong className="text-foreground font-semibold">{totalResults} orders</strong> placed in
            </span>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger className="h-8.5 w-40 text-xs bg-background rounded-lg border-border/80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_OPTIONS.map((timeOpt) => (
                  <SelectItem key={timeOpt.id} value={timeOpt.id} className="text-xs">
                    {timeOpt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Sort by:</span>
            <Select value={sort} onValueChange={handleSortChange}>
              <SelectTrigger className="h-8.5 w-40 text-xs bg-background rounded-lg border-border/80">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-muted-foreground mr-1 text-[11px] font-medium">Active:</span>

            {search && (
              <Badge variant="secondary" className="gap-1 pr-1 bg-primary/10 text-primary border border-primary/20 font-normal">
                <span>Search: "{search}"</span>
                <button onClick={handleClearSearch} className="hover:text-destructive cursor-pointer">
                  <X className="size-3" />
                </button>
              </Badge>
            )}

            {selectedStatus !== "all" && (
              <Badge variant="secondary" className="gap-1 pr-1 bg-primary/10 text-primary border border-primary/20 font-normal">
                <span>
                  Status: {STATUS_OPTIONS.find((s) => s.id === selectedStatus)?.label || selectedStatus}
                </span>
                <button onClick={() => handleStatusChange("all")} className="hover:text-destructive cursor-pointer">
                  <X className="size-3" />
                </button>
              </Badge>
            )}

            {selectedTime !== "all" && (
              <Badge variant="secondary" className="gap-1 pr-1 bg-primary/10 text-primary border border-primary/20 font-normal">
                <span>Time: {TIME_OPTIONS.find((t) => t.id === selectedTime)?.label || selectedTime}</span>
                <button onClick={() => setSelectedTime("all")} className="hover:text-destructive cursor-pointer">
                  <X className="size-3" />
                </button>
              </Badge>
            )}

            <button
              onClick={clearAllFilters}
              className="text-primary hover:underline text-[11px] ml-1 font-semibold cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Orders Feed */}
        {isLoading ? (
          // Loading Horizontal Skeletons
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
                <div className="bg-muted/40 p-4 border-b flex justify-between">
                  <Skeleton className="h-4 w-48 rounded" />
                  <Skeleton className="h-4 w-32 rounded" />
                </div>
                <div className="p-5 flex flex-col md:flex-row gap-5">
                  <Skeleton className="size-24 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2.5">
                    <Skeleton className="h-5 w-44 rounded" />
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-4 w-1/3 rounded" />
                  </div>
                  <div className="w-full md:w-52 space-y-2 shrink-0">
                    <Skeleton className="h-9 w-full rounded-lg" />
                    <Skeleton className="h-8.5 w-full rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : orderList.length === 0 ? (
          // Empty State
          <div className="rounded-2xl border border-dashed border-border/80 bg-card p-12 text-center space-y-4">
            <div className="size-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto shadow-xs">
              <Package className="size-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground tracking-tight">
                No orders found
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                {search || selectedStatus !== "all"
                  ? "No orders match your current filter settings. Try clearing some filters."
                  : "You haven't placed any orders yet."}
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
              {activeFiltersCount > 0 ? (
                <Button variant="outline" size="sm" onClick={clearAllFilters} className="rounded-lg text-xs">
                  Reset Filters
                </Button>
              ) : null}
              <Button
                asChild
                size="sm"
                className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-xs"
              >
                <Link to="/products">
                  <span>Explore Catalog</span>
                  <ArrowRight className="size-3.5 ml-1.5" />
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          // ─── Authentic Amazon Order Cards ───
          <div className="space-y-4">
            {orderList.map((order) => {
              const orderId = order._id || order.id;
              const orderCode =
                order.code || (order._id ? order._id.slice(-8).toUpperCase() : "ORD");
              const orderDate = new Date(
                order.createdAt || order.date || Date.now()
              ).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
              const orderTotal = Number(order.pricing?.total || order.total || 0);
              const items = order.items || order.products || [];
              const primaryItem = items[0] || {};
              const primaryProd = primaryItem.product || primaryItem;
              const primarySlug = primaryProd.slug || primaryProd._id;

              const statusLower = order.status?.toLowerCase();
              const isCancelled = statusLower === "cancelled";
              const isDelivered = statusLower === "delivered";
              const isShipped = statusLower === "shipped";
              const isConfirmed = statusLower === "confirmed";
              const canCancel = ["placed", "confirmed"].includes(statusLower);

              const paymentStatus = order.payment?.status?.toLowerCase();
              const isRefunded = paymentStatus === "refunded";
              const isRefundPending =
                isCancelled &&
                !isRefunded &&
                (paymentStatus === "refund_pending" ||
                  paymentStatus === "paid" ||
                  (order.payment?.method === "online" && paymentStatus !== "failed"));

              const isPaid = isRefunded || isRefundPending || paymentStatus === "paid";

              const shippingName =
                order.shipping_address?.full_name ||
                order.shipping_address?.name ||
                order.user?.name ||
                "Customer";
              const shippingCity =
                order.shipping_address?.city ||
                order.shipping_address?.state ||
                "";

              return (
                <div
                  key={orderId}
                  className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs hover:border-primary/50 hover:shadow-md transition-all duration-300"
                >
                  {/* ─── 1. Header Banner (Clean Primary Theme) ─── */}
                  <div className="bg-muted/40 dark:bg-muted/20 border-b border-border/70 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                        {isDelivered ? (
                          <CheckCircle2 className="size-4.5" />
                        ) : isShipped ? (
                          <Truck className="size-4.5" />
                        ) : isCancelled ? (
                          <Ban className="size-4.5 text-destructive" />
                        ) : (
                          <Clock className="size-4.5" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm sm:text-base text-foreground">
                            {isDelivered
                              ? `Delivered on ${orderDate}`
                              : isShipped
                              ? "Shipped • In Transit"
                              : isCancelled
                              ? "Order Cancelled"
                              : `Order Placed on ${orderDate}`}
                          </span>
                          {getStatusBadge(order.status)}
                          {isCancelled && (
                            isRefunded ? (
                              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold gap-1">
                                <CheckCircle2 className="size-3" /> Refunded
                              </Badge>
                            ) : isRefundPending ? (
                              <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-semibold gap-1">
                                <Clock className="size-3" /> Refund Pending
                              </Badge>
                            ) : null
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {isDelivered
                            ? "Package was safely delivered to your doorstep"
                            : isShipped
                            ? `Package on the way with courier${shippingCity ? ` to ${shippingCity}` : ""}`
                            : isCancelled
                            ? (isRefunded
                                ? "Order cancelled. Full payment refund has been processed."
                                : isRefundPending
                                ? "Order cancelled. Refund of payment is currently pending."
                                : "This order was cancelled and models were restocked")
                            : "Your order is confirmed and being prepared for carrier pickup"}
                        </p>
                      </div>
                    </div>

                    {/* Order Code & Price */}
                    <div className="flex items-center gap-3 sm:gap-4 ml-auto text-right">
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
                          <span className="font-mono font-semibold text-foreground">#{orderCode}</span>
                          <button
                            type="button"
                            onClick={() => copyOrderCode(orderCode)}
                            className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                            title="Copy order code"
                          >
                            <Copy className="size-3" />
                          </button>
                        </div>
                        <div
                          className={cn(
                            "text-sm sm:text-base font-bold mt-0.5",
                            isCancelled ? "text-muted-foreground line-through" : "text-foreground"
                          )}
                        >
                          ₹{orderTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </div>
                        {isCancelled && (
                          <div className={cn(
                            "text-[10px] font-semibold uppercase tracking-wider",
                            isRefunded
                              ? "text-emerald-600 dark:text-emerald-400 font-bold"
                              : isRefundPending
                              ? "text-amber-600 dark:text-amber-400 font-bold"
                              : "text-destructive"
                          )}>
                            {isRefunded ? "Refunded" : isRefundPending ? "Refund Pending" : "Void / Cancelled"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ─── 2. Ordered Items List ─── */}
                  <div className="p-4 sm:p-6 divide-y divide-border/60">
                    {items.map((item, idx) => {
                      const prod = item.product || item;
                      const img =
                        item.image ||
                        prod.images?.[0] ||
                        prod.image ||
                        "/logo.png";
                      const slug = prod.slug || prod._id;
                      const qty = item.quantity || 1;
                      const itemPrice = Number(item.price || prod.price || 0);

                      return (
                        <div
                          key={idx}
                          className={cn(
                            "flex items-center justify-between gap-4 group cursor-pointer",
                            idx > 0 ? "pt-4" : "",
                            idx < items.length - 1 ? "pb-4" : ""
                          )}
                          onClick={() => navigate(`/orders/${orderId}?view=tracking`)}
                        >
                          {/* Thumbnail & Product Details */}
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="size-18 sm:size-20 rounded-xl bg-background border border-border/80 group-hover:border-primary p-2 flex items-center justify-center shrink-0 overflow-hidden transition-all">
                              <img
                                src={img}
                                alt={item.name || prod.name}
                                className="size-full object-contain group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>

                            <div className="space-y-1 min-w-0">
                              <h4
                                className={cn(
                                  "font-semibold text-sm sm:text-base transition-colors line-clamp-1",
                                  isCancelled
                                    ? "text-muted-foreground group-hover:text-foreground"
                                    : "text-foreground group-hover:text-primary"
                                )}
                              >
                                {item.name || prod.name || "Precision Diecast Scale Model"}
                              </h4>

                              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                                <span>
                                  Qty: <strong className="text-foreground font-semibold">{qty}</strong>
                                </span>
                                {itemPrice > 0 && (
                                  <>
                                    <span>•</span>
                                    <span>₹{itemPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })} each</span>
                                  </>
                                )}
                              </div>

                              <p className="text-[11px] text-muted-foreground">
                                {isDelivered
                                  ? "Eligible for 7-day return / replacement guarantee"
                                  : isCancelled
                                  ? "Item cancelled and restocked into inventory"
                                  : "Securely packed with original documentation"}
                              </p>
                            </div>
                          </div>

                          {/* Right Chevron */}
                          <div className="shrink-0 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all pl-2">
                            <ChevronRight className="size-5" />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* ─── 3. Action Bar (Primary Theme) ─── */}
                  <div className="bg-muted/20 dark:bg-muted/10 border-t border-border/70 px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="size-3.5 text-muted-foreground/70" />
                      <span>Ship to: <strong className="text-foreground font-medium">{shippingName}</strong></span>
                      {shippingCity && <span>({shippingCity})</span>}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {/* Secondary: Buy Again (Re-adds all models in the order) */}
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={reorderingOrderId === orderId}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuyAgain(order);
                        }}
                        className="h-8.5 rounded-xl text-xs gap-1.5 hover:border-primary hover:text-primary cursor-pointer"
                      >
                        {reorderingOrderId === orderId ? (
                          <>
                            <Loader2 className="size-3 animate-spin text-primary" />
                            <span>Adding Models...</span>
                          </>
                        ) : (
                          <>
                            <RotateCcw className="size-3 text-primary" />
                            <span>Buy Again {items.length > 1 ? `(${items.length})` : ""}</span>
                          </>
                        )}
                      </Button>

                      {/* Secondary: Invoice */}
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-8.5 rounded-xl text-xs font-medium hover:border-primary hover:text-primary cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link to={`/orders/${orderId}?view=invoice`}>
                          <FileText className="size-3.5 mr-1.5 text-muted-foreground" />
                          <span>Invoice</span>
                        </Link>
                      </Button>

                      {/* Primary Button (Always uses Primary Racing Red token) */}
                      {!isCancelled && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/orders/${orderId}?view=tracking`);
                          }}
                          className="h-8.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-2xs gap-1.5 cursor-pointer"
                        >
                          <Truck className="size-3.5" />
                          <span>Track Delivery</span>
                        </Button>
                      )}

                      {/* Cancel Dialog (if eligible) */}
                      {canCancel && (
                        <div onClick={(e) => e.stopPropagation()}>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={cancellingOrderId === orderId}
                                className="h-8.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl cursor-pointer"
                              >
                                <Ban className="size-3.5 mr-1" />
                                Cancel
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
                                    Are you sure you want to cancel this order? This action cannot be
                                    undone and reserved models will be restocked.
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
                                <AlertDialogCancel className="rounded-xl text-xs">
                                  Keep Order
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleCancelOrder(orderId)}
                                  className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-bold"
                                >
                                  Confirm Cancellation
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-border/80 bg-card shadow-2xs">
            <div className="text-xs text-muted-foreground">
              Showing page <strong className="text-foreground">{pagination.page}</strong> of{" "}
              <strong className="text-foreground">{pagination.pages}</strong> (
              <strong className="text-foreground">{pagination.total}</strong> orders total)
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="h-8 rounded-lg text-xs"
              >
                <ChevronLeft className="size-3.5 mr-1" />
                Previous
              </Button>

              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={pageNum === pagination.page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className={cn(
                    "h-8 w-8 rounded-lg text-xs font-bold",
                    pageNum === pagination.page &&
                    "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  {pageNum}
                </Button>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="h-8 rounded-lg text-xs"
              >
                Next
                <ChevronRight className="size-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
