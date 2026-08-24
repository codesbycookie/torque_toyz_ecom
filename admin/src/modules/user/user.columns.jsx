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

export const useUserColumns = (users) => {
  return [
    {
      accessorKey: "login_id",
      header: () => Hint("Login ID", "System generated login id"),
      cell: ({ row }) => <span>{row.getValue("login_id")}</span>,
    },
    {
      accessorKey: "name",
      header: () => Hint("Name", "User name"),
      cell: ({ row }) => <span>{row.getValue("name")}</span>,
    },
    {
      accessorKey: "email",
      header: () => Hint("Email", "User email"),
      cell: ({ row }) => <span>{row.getValue("email")}</span>,
    },
    {
      accessorKey: "phone",
      header: () => Hint("Phone", "Contact number"),
      cell: ({ row }) => <span>{row.getValue("phone")}</span>,
    },
    {
      accessorKey: "role",
      header: () => Hint("Role", "User role"),
      cell: ({ row }) => (
        <Badge variant={row.getValue("role") === "admin" ? "default" : "outline"}>
          {row.getValue("role")}
        </Badge>
      ),
    },
    {
      accessorKey: "address",
      header: () => Hint("Location", "City / State"),
      cell: ({ row }) => {
        const address = row.original.address || {};
        return <span>{[address.city, address.state].filter(Boolean).join(", ") || "-"}</span>;
      },
    },
    // {
    //   accessorKey: "active",
    //   header: () => Hint("Status", "Whether the user is active"),
    //   cell: ({ row }) => (
    //     <Badge variant={row.getValue("active") ? "default" : "outline"}>
    //       {row.getValue("active") ? "Active" : "Inactive"}
    //     </Badge>
    //   ),
    // },
    {
      accessorKey: "actions",
      header: () => Hint("Actions", "More actions"),
      cell: ({ row }) => {
        const user = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                variant="destructive"
                onClick={() => users.openDelete(user._id, user.name)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};