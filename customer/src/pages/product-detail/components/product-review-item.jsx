import ProductRatingBadge from "./product-rating-badge";

export default function ProductReviewItem({ review }) {
  return (
    <div className="rounded-xl border bg-background p-4 space-y-2">
      <div className="flex items-center gap-2">
        <ProductRatingBadge value={review.rating} />
        <span className="text-sm font-medium">
          {review.user?.name || "Anonymous"}
        </span>
      </div>
      {review.comment && (
        <p className="text-sm text-muted-foreground">{review.comment}</p>
      )}
    </div>
  );
}