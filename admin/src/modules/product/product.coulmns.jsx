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

export const useProductColumns = (products, options = {}) => {
  const lowStockThreshold = options?.lowStockThreshold ?? 10;
  return [
    {
      accessorKey: "code",
      header: () => Hint("Code", "Product code"),
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => products.openView(row.original)}
          className="font-mono font-semibold text-foreground hover:underline cursor-pointer text-left transition-colors"
        >
          {row.getValue("code")}
        </button>
      ),
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
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => products.openView(product)}
                  className="font-medium truncate text-foreground hover:underline cursor-pointer text-left transition-colors"
                >
                  {product.name}
                </button>
                {product.ui?.is_trending && (
                  <Badge
                    variant="secondary"
                    className="h-4 px-1.5 text-[10px] font-normal"
                  >
                    Trending
                  </Badge>
                )}
              </div>
              {product.ui?.badges?.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {product.ui.badges.slice(0, 2).map((badge, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-sm border px-1 py-0 text-[10px] font-normal text-muted-foreground bg-muted/30"
                    >
                      {badge}
                    </span>
                  ))}
                  {product.ui.badges.length > 2 && (
                    <span className="text-[10px] text-muted-foreground">
                      +{product.ui.badges.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
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
      cell: ({ row }) => {
        const product = row.original;
        const stock = Number(product.stock ?? 0);
        const needsMoreStock = stock <= lowStockThreshold;

        return (
          <div className="flex flex-col gap-1 items-start">
            <span className="font-medium text-xs text-foreground">
              {stock}
            </span>
            {needsMoreStock && (
              <span className="text-[10px] font-medium text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded leading-none">
                Need more stock
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "price",
      header: () => Hint("Price", "Product price & promotional slash price"),
      cell: ({ row }) => {
        const product = row.original;
        const actual = product.ui?.actual_price ?? product.price ?? 0;
        const slash = product.ui?.slash_price;
        const hasSlash = Number(slash) > Number(actual);

        return (
          <div className="flex flex-col">
            <span className="font-medium">₹{Number(actual).toFixed(2)}</span>
            {hasSlash && (
              <span className="text-xs text-muted-foreground line-through">
                ₹{Number(slash).toFixed(2)}
              </span>
            )}
          </div>
        );
      },
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
              <DropdownMenuItem onClick={() => products.openUISettings(product)}>
                UI Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => products.openStockUpdate(product)}
              >
                Update Stock & Rate
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
