import CopyButton from "@/components/ui/copy-button";
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
import { formatAddress } from "./user.modal.components";

export const useUserColumns = (users) => {
  return [
    {
      accessorKey: "login_id",
      header: () => Hint("Login ID", "System generated login id"),
      cell: ({ row }) => {
        const id = row.getValue("login_id");
        return (
          <div className="flex items-center gap-1 font-mono">
            <button
              type="button"
              onClick={() => users.openView(row.original)}
              className="font-semibold text-foreground hover:underline cursor-pointer text-left transition-colors"
            >
              {id}
            </button>
            {id && (
              <CopyButton
                text={id}
                label="Login ID"
                className="size-5 text-muted-foreground/60 hover:text-foreground"
                iconClassName="size-3"
              />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: () => Hint("Name", "User name"),
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => users.openView(row.original)}
          className="font-medium text-foreground hover:underline cursor-pointer text-left transition-colors"
        >
          {row.getValue("name")}
        </button>
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
      header: () => Hint("Location", "Primary / saved addresses"),
      cell: ({ row }) => {
        const user = row.original;
        const addressCount = (user.addresses?.length || 0) + (user.address && !user.addresses?.length ? 1 : 0);
        const address =
          user.address ||
          (user.addresses?.length
            ? user.addresses.find((a) => a.is_default) || user.addresses[0]
            : null);
        const formatted = formatAddress(address);
        return (
          <div className="flex items-center gap-2 max-w-[280px]">
            <span className="truncate">{formatted || "-"}</span>
            {addressCount > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-6 px-1.5 text-[11px] font-medium text-primary hover:text-primary gap-1 shrink-0"
                onClick={() => users.openViewAddresses(user)}
                title="View all addresses"
              >
                <span>{addressCount} addr{addressCount !== 1 ? "s" : ""}</span>
              </Button>
            )}
          </div>
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
              <DropdownMenuItem onClick={() => users.openViewAddresses(user)}>
                View Addresses
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
