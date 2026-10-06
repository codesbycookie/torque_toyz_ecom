export const ORDER_STATUSES = ["placed", "confirmed", "shipped", "delivered", "cancelled"];

export function getStatusItemState(currentStatus, targetStatus) {
  const isCurrent = currentStatus === targetStatus;
  return {
    visible: true,
    disabled: isCurrent,
    isCurrent,
  };
}

export function getCancelLabel(paymentStatus) {
  return paymentStatus === "paid" ? "Cancel & Refund" : "Cancel Order";
}

export const ORDER_STATUS_STYLES = {
  placed: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30 font-semibold capitalize",
  confirmed: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 font-semibold capitalize",
  shipped: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30 font-semibold capitalize",
  delivered: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-semibold capitalize",
  cancelled: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 font-semibold capitalize",
};

export const PAYMENT_STATUS_STYLES = {
  paid: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-semibold capitalize",
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-semibold capitalize",
  failed: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 font-semibold capitalize",
  refunded: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30 font-semibold capitalize",
  created: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30 font-semibold capitalize",
};

export const ORDER_STATUS_VARIANT = {
  placed: "secondary",
  confirmed: "default",
  shipped: "default",
  delivered: "default",
  cancelled: "destructive",
};