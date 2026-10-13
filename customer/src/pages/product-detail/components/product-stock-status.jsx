import { Badge } from "@/components/ui/badge";

export default function ProductStockStatus({ stock }) {
  if (stock <= 0) return <Badge variant="destructive">Out of stock</Badge>;

  if (stock < 10) {
    return (
      <p className="text-amber-600 font-medium text-sm">
        Only {stock} left in stock – order soon
      </p>
    );
  }

  return <p className="text-emerald-600 font-medium text-sm">In stock</p>;
}