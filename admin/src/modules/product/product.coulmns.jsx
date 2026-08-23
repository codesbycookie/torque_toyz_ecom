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

export const useProductColumns = (products) => {
  return [
    {
      accessorKey: "images",
      header: () => Hint("Image", "Product image"),
      cell: ({ row }) => (
        <img
          src={row.original.images?.[0]}
          alt={row.original.name}
          className="size-10 rounded object-cover"
        />
      ),
    },
    {
      accessorKey: "code",
      header: () => Hint("Code", "Product code"),
      cell: ({ row }) => <span>{row.getValue("code")}</span>,
    },
    {
      accessorKey: "name",
      header: () => Hint("Name", "Product name"),
      cell: ({ row }) => <span>{row.getValue("name")}</span>,
    },
    {
      accessorKey: "stock",
      header: () => Hint("Stock", "Units available"),
      cell: ({ row }) => <span>{row.getValue("stock")}</span>,
    },
    {
      accessorKey: "active",
      header: () => Hint("Status", "Whether the product is active"),
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
        const product = row.original;
        const isErased = Boolean(product.deleted);

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => products.openEdit(product)}>
                Edit
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => products.openActiveStatus(product._id, product.active)}
              >
                {product.active ? "Deactivate" : "Activate"}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {isErased ? (
                <DropdownMenuItem onClick={() => products.openRetrieve(product._id)}>
                  Retrieve
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => products.openDelete(product._id, product.name)}
                  >
                    Delete
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => products.openErase(product._id)}
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