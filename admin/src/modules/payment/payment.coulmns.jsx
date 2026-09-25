import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Hint } from "@/core/utils/tooltip.util";

const statusVariant = {
  created: "secondary",
  paid: "default",
  failed: "destructive",
  refunded: "outline",
};

export const usePaymentColumns = (payments) => {
  return [
    {
      accessorKey: "order",
      header: () => Hint("Order ID", "Order id"),
      cell: ({ row }) => {
        const order = row.original.order;
        return <span className="font-medium">{order?.code || "-"}</span>;
      },
    },
    {
      accessorKey: "razorpay_order_id",
      header: () => Hint("Razorpay Order", "Razorpay Order ID"),
      cell: ({ row }) => (
        <span className="font-mono text-xs">
          {row.getValue("razorpay_order_id")}
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: () => Hint("Amount", "Payment amount"),
      cell: ({ row }) => {
        const amount = row.getValue("amount");
        const currency = row.original.currency || "INR";
        return (
          <span>
            {currency} {Number(amount).toFixed(2)}
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
          <Badge variant={statusVariant[status] || "secondary"}>{status}</Badge>
        );
      },
    },
    {
      accessorKey: "actions",
      header: () => Hint("Actions", "More actions"),
      cell: ({ row }) => {
        const payment = row.original;
        const isPaid = payment.status === "paid";

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => payments.openView(payment)}>
                View
              </DropdownMenuItem>
              {isPaid && (
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => payments.openRefund(payment)}
                >
                  Initiate Refund
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
