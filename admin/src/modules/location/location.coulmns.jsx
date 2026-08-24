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

export const useLocationColumns = (locations) => {
  return [
    {
      accessorKey: "state",
      header: () => Hint("State", "State name"),
      cell: ({ row }) => <span>{row.getValue("state")}</span>,
    },
    {
      accessorKey: "code",
      header: () => Hint("Code", "Location code"),
      cell: ({ row }) => <span>{row.getValue("code")}</span>,
    },
    {
      accessorKey: "slabs",
      header: () => Hint("Slabs", "Number of tariff slabs configured"),
      cell: ({ row }) => <span>{row.original.slabs?.length || 0}</span>,
    },
    {
      accessorKey: "deliverable",
      header: () => Hint("Status", "Whether the location is deliverable"),
      cell: ({ row }) => (
        <Badge variant={row.getValue("deliverable") ? "default" : "outline"}>
          {row.getValue("deliverable") ? "Deliverable" : "Non-deliverable"}
        </Badge>
      ),
    },
    {
      accessorKey: "actions",
      header: () => Hint("Actions", "More actions"),
      cell: ({ row }) => {
        const location = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => locations.openEdit(location)}>Edit</DropdownMenuItem>

              <DropdownMenuItem onClick={() => locations.openManageSlabs(location)}>
                Manage Slabs
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => locations.openDeliverableStatus(location._id, location.deliverable)}
              >
                {location.deliverable ? "Mark Non-Deliverable" : "Mark Deliverable"}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                variant="destructive"
                onClick={() => locations.openDelete(location._id, location.state)}
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
