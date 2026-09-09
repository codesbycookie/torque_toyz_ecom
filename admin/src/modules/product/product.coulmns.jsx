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
import { safeId } from "@/core/utils/normalize-id";

export const useProductColumns = (products) => {
  return [
    {
      accessorKey: "code",
      header: () => Hint("Code", "Product code"),
      cell: ({ row }) => <span>{row.getValue("code")}</span>,
    },
    {
      accessorKey: "name",
      header: () => Hint("Name", "Product name"),
      cell: ({ row }) => {
        const product = row.original;
        const firstImage = product.images?.[0];
        return (
          <div className="flex items-center gap-3">
            {firstImage ? (
              <img
                src={firstImage}
                alt={product.name}
                className="size-8 rounded-md object-cover cursor-pointer border"
                onClick={() => products.openViewImages(product)}
              />
            ) : (
              <div className="size-8 rounded-md bg-muted border flex items-center justify-center">
                <span className="text-xs text-muted-foreground">-</span>
              </div>
            )}
            <span className="font-medium">{product.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: () => Hint("Category", "Product category"),
      cell: ({ row }) => {
        const name = safeId(row.original.category?.name || row.original.category?._id);
        return <span>{name || "-"}</span>;
      },
    },
    {
      accessorKey: "stock",
      header: () => Hint("Stock", "Units available"),
      cell: ({ row }) => <span>{row.getValue("stock")}</span>,
    },
    {
      accessorKey: "price",
      header: () => Hint("Price", "Product price"),
      cell: ({ row }) => (
        <span>${Number(row.getValue("price")).toFixed(2)}</span>
      ),
    },
    {
      accessorKey: "weight",
      header: () => Hint("Weight", "Product weight (kg)"),
      cell: ({ row }) => <span>{row.getValue("weight")} kg</span>,
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
              <DropdownMenuItem onClick={() => products.openView(product)}>
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => products.openViewImages(product)}>
                View Images
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => products.openEdit(product)}>
                Edit
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => products.openStockUpdate(product)}
              >
                Update Stock
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => products.openReviews(product)}>
                Reviews ({product.reviews?.length || 0})
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() =>
                  products.openActiveStatus(product._id, product.active)
                }
              >
                {product.active ? "Deactivate" : "Activate"}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {isErased ? (
                <DropdownMenuItem
                  onClick={() => products.openRetrieve(product._id)}
                >
                  Retrieve
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() =>
                      products.openDelete(product._id, product.name)
                    }
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
