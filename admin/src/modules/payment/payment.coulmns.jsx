import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, RefreshCw } from "lucide-react";
import { Hint } from "@/core/utils/tooltip.util";
import CopyButton from "@/components/ui/copy-button";

export const PAYMENT_STATUS_STYLES = {
  paid: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-semibold capitalize",
  created: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-semibold capitalize",
  failed: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 font-semibold capitalize",
  refunded: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30 font-semibold capitalize",
};

export const usePaymentColumns = (payments) => {
  return [
    {
      accessorKey: "order",
      header: () => Hint("Order Code", "Order reference code"),
      cell: ({ row }) => {
        const order = row.original.order;
        const code = typeof order === "object" ? order?.code : (order || "-");
        return (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => payments.openView(row.original)}
              className="font-mono font-semibold text-foreground hover:underline cursor-pointer text-left transition-colors"
            >
              {code}
            </button>
            {code !== "-" && (
              <CopyButton
                text={code}
                label="Order Code"
                className="size-5 text-muted-foreground/60 hover:text-foreground"
                iconClassName="size-3"
              />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "razorpay_order_id",
      header: () => Hint("Razorpay Order", "Gateway Order ID"),
      cell: ({ row }) => {
        const id = row.getValue("razorpay_order_id");
        return (
          <div className="flex items-center gap-1 font-mono text-xs">
            <span>{id}</span>
            {id && (
              <CopyButton
                text={id}
                label="Razorpay Order ID"
                className="size-5 text-muted-foreground/60 hover:text-foreground"
                iconClassName="size-3"
              />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "amount",
      header: () => Hint("Amount", "Payment amount"),
      cell: ({ row }) => {
        const amount = row.getValue("amount");
        const currency = row.original.currency || "INR";
        return (
          <span className="font-semibold">
            {currency === "INR" ? "₹" : currency} {Number(amount).toFixed(2)}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => Hint("Status", "Payment status"),
      cell: ({ row }) => {
        const status = row.getValue("status");
        return (
          <Badge className={PAYMENT_STATUS_STYLES[status] || "bg-secondary text-secondary-foreground"}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "actions",
      header: () => Hint("Actions", "Actions"),
      cell: ({ row }) => {
        const payment = row.original;
        const isPaid = payment.status === "paid";

        return (
          <div className="flex items-center gap-1 justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-foreground"
              onClick={() => payments.openView(payment)}
              title="View Payment Details"
            >
              <Eye className="size-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => payments.openView(payment)}>
                  <Eye className="mr-2 size-4" />
                  View Details
                </DropdownMenuItem>
                {isPaid && (
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => payments.openRefund(payment)}
                  >
                    <RefreshCw className="mr-2 size-4" />
                    Initiate Refund
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
};
