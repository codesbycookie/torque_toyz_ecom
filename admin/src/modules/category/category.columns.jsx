import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye } from "lucide-react";
import { Hint } from "@/core/utils/tooltip.util";
import CopyButton from "@/components/ui/copy-button";
import { safetext } from "@/core/utils/safetext.util";

export const useCategoryColumns = (categories) => {
  return [
    {
      accessorKey: "name",
      header: () => Hint("Name", "Category name"),
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => categories.openView(row.original)}
          className="font-semibold text-foreground hover:underline cursor-pointer text-left transition-colors"
        >
          {row.getValue("name")}
        </button>
      ),
    },
    {
      accessorKey: "description",
      header: () => Hint("Description", "Category description"),
      cell: ({ row }) => {
        const description = row.getValue("description");
        return (
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span>{safetext(description, "No description provided")}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "active",
      header: () => Hint("Status", "Whether the category is active"),
      cell: ({ row }) => (
        <Badge
          className={
            row.getValue("active")
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-semibold"
              : "bg-muted text-muted-foreground"
          }
        >
          {row.getValue("active") ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      accessorKey: "actions",
      header: () => Hint("Actions", "More actions"),
      cell: ({ row }) => {
        const category = row.original;
        const isErased = Boolean(category.deleted);

        return (
          <div className="flex items-center gap-1 justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-foreground"
              onClick={() => categories.openView(category)}
              title="View Category Details"
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
                <DropdownMenuItem onClick={() => categories.openView(category)}>
                  <Eye className="mr-2 size-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => categories.openEdit(category)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    categories.openActiveStatus(category._id, category.active)
                  }
                >
                  {category.active ? "Deactivate" : "Activate"}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {isErased ? (
                  <DropdownMenuItem
                    onClick={() => categories.openRetrieve(category._id)}
                  >
                    Retrieve
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() =>
                        categories.openDelete(category._id, category.name)
                      }
                    >
                      Delete
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => categories.openErase(category._id)}
                    >
                      Erase Permanently
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
};
