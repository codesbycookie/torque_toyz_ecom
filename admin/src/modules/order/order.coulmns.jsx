import CopyButton from "@/components/ui/copy-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Check, Eye } from "lucide-react";
import { Hint } from "@/core/utils/tooltip.util";
import {
  ORDER_STATUSES,
  ORDER_STATUS_STYLES,
  PAYMENT_STATUS_STYLES,
  getStatusItemState,
  getCancelLabel,
  isRefundEligible,
  isRefundPending,
} from "./order.schema";
import { safeId } from "@/core/utils/normalize-id";

export const useOrderColumns = (orders) => {
  return [
    {
      accessorKey: "code",
      header: () => Hint("Code", "Order code"),
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => orders.openView(row.original)}
          className="font-mono font-semibold text-foreground hover:underline cursor-pointer text-left transition-colors"
        >
          {row.getValue("code")}
        </button>
      ),
    },
    {
      accessorKey: "user",
      header: () => Hint("Customer", "Customer who placed the order"),
      cell: ({ row }) => {
        const u = row.original.user;
        const name = typeof u === "object" ? u?.name : "Guest";
        const userId = typeof u === "object" ? (u?.login_id || u?.username || u?._id) : null;
        return (
          <div className="flex items-center gap-1.5">
            <span className="truncate max-w-[130px] font-medium">{safeId(name || "Guest")}</span>
            {userId && (
              <CopyButton
                text={userId}
                label="User ID"
                className="size-5 text-muted-foreground/60 hover:text-foreground"
                iconClassName="size-3"
              />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "items",
      header: () => Hint("Items", "Number of items in the order"),
      cell: ({ row }) => <span>{row.original.items?.length || 0}</span>,
    },
    {
      accessorKey: "total",
      header: () => Hint("Total", "Order total"),
      cell: ({ row }) => <span>₹{row.original.pricing?.total ?? 0}</span>,
    },
    {
      accessorKey: "payment",
      header: () => Hint("Payment", "Payment status"),
      cell: ({ row }) => {
        const order = row.original;
        const status = order.payment?.status || "pending";
        const needsRefund = isRefundPending(order);

        return (
          <div className="flex flex-col gap-1 items-start">
            <Badge className={PAYMENT_STATUS_STYLES[status] || "bg-secondary text-secondary-foreground"}>
              {status}
            </Badge>
            {needsRefund && (
              <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded">
                Refund Needed
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => Hint("Status", "Order status"),
      cell: ({ row }) => {
        const status = row.getValue("status");
        return (
          <Badge className={ORDER_STATUS_STYLES[status] || "bg-secondary text-secondary-foreground"}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "actions",
      header: () => Hint("Actions", "More actions"),
      cell: ({ row }) => {
        const order = row.original;
        const needsRefund = isRefundPending(order);
        const canRefund = isRefundEligible(order);

        return (
          <div className="flex items-center gap-1.5">
            {needsRefund && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => orders.openRefund(order)}
                className="h-7 px-2 text-xs border-amber-500/40 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 font-medium"
              >
                Refund
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => orders.openView(order)}>
                  <Eye className="mr-2 size-4" />
                  View Details
                </DropdownMenuItem>

                {canRefund && (
                  <DropdownMenuItem
                    onClick={() => orders.openRefund(order)}
                    className="text-destructive font-medium focus:text-destructive"
                  >
                    Approve & Initiate Refund
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger disabled={order.status === "cancelled"}>
                    Set Status
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      {ORDER_STATUSES.map((s) => {
                        const { disabled, isCurrent } = getStatusItemState(order.status, s);
                        const label = s === "cancelled" ? getCancelLabel(order.payment?.status) : s;
                        return (
                          <DropdownMenuItem
                            key={s}
                            disabled={disabled}
                            variant={s === "cancelled" ? "destructive" : undefined}
                            onClick={() => {
                              if (s === "shipped") {
                                orders.openChangeStatus(order, "shipped");
                              } else {
                                orders.setStatus(order, s);
                              }
                            }}
                          >
                            {isCurrent && <Check className="size-4" />}
                            <span className="capitalize">{label}</span>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
};
