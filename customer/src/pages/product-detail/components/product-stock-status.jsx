import { cn } from "@/lib/utils";

export default function ProductStockStatus({ stock, active = true }) {
  const isOut = stock <= 0;
  const isUnavailable = isOut || !active;
  const isLow = !isUnavailable && stock < 10;

  return (
    <div className="flex items-center gap-2 text-sm font-medium">
      <span
        className={cn(
          "size-2.5 rounded-full",
          isUnavailable
            ? "bg-muted-foreground"
            : isLow
              ? "bg-amber-500"
              : "bg-emerald-600"
        )}
      />
      <span
        className={cn(
          isUnavailable
            ? "text-muted-foreground"
            : isLow
              ? "text-amber-600 dark:text-amber-400"
              : "text-emerald-700 dark:text-emerald-400"
        )}
      >
        {isOut
          ? "Out of stock"
          : !active
            ? "Currently unavailable"
            : isLow
              ? `Only ${stock} left in stock`
              : "In stock"}
      </span>
    </div>
  );
}