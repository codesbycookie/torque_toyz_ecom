import { useState } from "react";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const arrowClass =
  "absolute top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full border bg-background/90 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-accent hover:text-accent-foreground";

// Render with key={productId} so the selection resets when the product changes.
export default function ProductGallery({ images = [], name }) {
  const [selected, setSelected] = useState(0);
  const index = Math.min(selected, Math.max(images.length - 1, 0));
  const hasMany = images.length > 1;
  const go = (step) =>
    setSelected((index + step + images.length) % images.length);

  return (
    <div className="min-w-0 space-y-3">
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border bg-card">
        {images[index] ? (
          <img
            src={images[index]}
            alt={name}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Package className="size-12" />
            <span className="text-sm">No product images available</span>
          </div>
        )}

        {hasMany && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => go(-1)}
              className={cn(arrowClass, "left-3")}
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => go(1)}
              className={cn(arrowClass, "right-3")}
            >
              <ChevronRight className="size-5" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              {index + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {hasMany && (
        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
          {images.map((image, i) => (
            <button
              key={`${image}-${i}`}
              type="button"
              aria-label={`View product image ${i + 1}`}
              aria-pressed={index === i}
              onClick={() => setSelected(i)}
              className={cn(
                "aspect-[4/3] w-20 shrink-0 snap-start overflow-hidden rounded-xl border-2 bg-card transition-colors sm:w-auto",
                index === i
                  ? "border-primary"
                  : "border-transparent hover:border-primary/40"
              )}
            >
              <img
                src={image}
                alt=""
                loading="lazy"
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}