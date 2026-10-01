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
import { MoreHorizontal, Check } from "lucide-react";
import { Hint } from "@/core/utils/tooltip.util";
import { ORDER_STATUSES, ORDER_STATUS_VARIANT } from "./order.schema";
import { safeId } from "@/core/utils/normalize-id";

export const useOrderColumns = (orders) => {
  return [
    {
      accessorKey: "code",
      header: () => Hint("Code", "Order code"),
      cell: ({ row }) => <span>{row.getValue("code")}</span>,
    },
    {
      accessorKey: "user",
      header: () => Hint("Customer", "Customer who placed the order"),
      cell: ({ row }) => <span>{safeId(row.original.user?.name || row.original.user?._id || "Guest")}</span>,
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
      cell: ({ row }) => (
        <Badge variant={row.original.payment?.status === "paid" ? "default" : "outline"}>
          {row.original.payment?.status}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: () => Hint("Status", "Order status"),
      cell: ({ row }) => (
        <Badge variant={ORDER_STATUS_VARIANT[row.getValue("status")] || "outline"}>
          {row.getValue("status")}
        </Badge>
      ),
    },
    {
      accessorKey: "actions",
      header: () => Hint("Actions", "More actions"),
      cell: ({ row }) => {
        const order = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => orders.openView(order)}>View</DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Set Status</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {ORDER_STATUSES.map((s) => (
                      <DropdownMenuItem
                        key={s}
                        disabled={order.status === s}
                        variant={s === "cancelled" ? "destructive" : undefined}
                        onClick={() => {
                          if (s === "shipped") {
                            orders.openChangeStatus(order, "shipped");
                          } else {
                            orders.setStatus(order, s);
                          }
                        }}
                      >
                        {order.status === s && <Check className="size-4" />}
                        <span className="capitalize">{s}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};