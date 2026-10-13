import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ProductRatingBadge({ value }) {
  return (
    <Badge variant="secondary" className="gap-1 font-medium">
      {value}
      <Star className="size-3 fill-amber-400 text-amber-400" />
    </Badge>
  );
}