import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductStars({ value = 0, className }) {
  const filled = Math.round(Number(value) || 0);
  return (
    <div
      className={cn("flex items-center gap-0.5 text-amber-500", className)}
      role="img"
      aria-label={`Rated ${Number(value).toFixed(1)} out of 5`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "size-4",
            i < filled ? "fill-current" : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
}

export default function ProductRatingBadge({ value }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-accent px-2 py-0.5 text-sm font-semibold text-accent-foreground">
      {Number(value).toFixed(1)}
      <Star className="size-3.5 fill-amber-500 text-amber-500" />
    </span>
  );
}