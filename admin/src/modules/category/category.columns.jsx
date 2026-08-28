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

export const useCategoryColumns = (categories) => {
  return [
    {
      accessorKey: "name",
      header: () => Hint("Name", "Category name"),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("name")}</span>
      ),
    },
    {
      accessorKey: "slug",
      header: () => Hint("Slug", "URL-friendly identifier"),
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.getValue("slug")}</span>
      ),
    },
    {
      accessorKey: "active",
      header: () => Hint("Status", "Whether the category is active"),
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
        const category = row.original;
        const isErased = Boolean(category.deleted);

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => categories.openView(category)}>
                View
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
        );
      },
    },
  ];
};
