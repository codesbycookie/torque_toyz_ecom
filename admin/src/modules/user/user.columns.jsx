import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("name")}</span>
      ),
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
      accessorKey: "address",
      header: () => Hint("Location", "City / State"),
      cell: ({ row }) => {
        const address = row.original.address || {};
        return (
          <span>
            {[
              address.door,
              address.street,
              address.city,
              address.state,
              address.pincode,
            ]
              .filter(Boolean)
              .join(", ") || "-"}
          </span>
        );
      },
    },
    {
      accessorKey: "active",
      header: () => Hint("Status", "Whether the user is active"),
      cell: ({ row }) => (
        <Badge variant={row.getValue("active") ? "default" : "outline"}>
          {row.getValue("active") ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      accessorKey: "actions",
      header: () => Hint("Actions", "More actions"),
      cell: ({ row }) => {
        const user = row.original;
        const isErased = Boolean(user.deleted);

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => users.openView(user)}>
                View
              </DropdownMenuItem>
              {isErased ? (
                <DropdownMenuItem onClick={() => users.openRetrieve(user._id, user.name)}>
                  Retrieve
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => users.openDelete(user._id, user.name)}
                  >
                    Delete
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => users.openResetPassword(user)}
                  >
                    Reset Password
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      users.openDisable(user._id, user.name, user.active)
                    }
                  >
                    {user.active ? "Disable" : "Enable"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => users.openErase(user._id, user.name)}
                  >
                    Erase Permanently
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
