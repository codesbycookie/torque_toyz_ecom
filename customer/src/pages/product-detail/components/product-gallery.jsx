import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function ProductGallery({ images = [], name, productId }) {
  const [selected, setSelected] = useState(0);

  // Reset selected image when product changes
  useEffect(() => {
    setSelected(0);
  }, [productId]);

  return (
    <div className="space-y-3">
      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-muted border flex items-center justify-center">
        {images[selected] ? (
          <img
            src={images[selected]}
            alt={name}
            className="size-full object-contain p-4"
          />
        ) : (
          <span className="text-muted-foreground">No image</span>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelected(idx)}
              className={cn(
                "aspect-[4/3] rounded-lg overflow-hidden border-2 bg-muted transition-all",
                selected === idx
                  ? "border-primary"
                  : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <img src={img} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}