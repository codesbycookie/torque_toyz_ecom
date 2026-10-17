import { ProductStars } from "./product-rating-badge";

export default function ProductReviewItem({ review }) {
  return (
    <article className="py-5 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium">{review.user?.name || "Anonymous"}</p>
          {review.createdAt && (
            <time
              dateTime={review.createdAt}
              className="mt-0.5 block text-xs text-muted-foreground"
            >
              {new Date(review.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </time>
          )}
        </div>
        <ProductStars value={review.rating} />
      </div>
      {review.comment && (
        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">
          {review.comment}
        </p>
      )}
    </article>
  );
}