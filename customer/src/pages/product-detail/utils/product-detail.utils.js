import { toast } from "sonner";

export const formatProductPrice = (price) =>
  Number(price || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

export const getProductRating = (reviews) => {
  if (!reviews.length) return null;

  return (
    reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
    reviews.length
  );
};

export const getProductQuantity = (requestedQuantity, stock) =>
  Math.min(requestedQuantity, Math.max(stock, 1));

export const isProductWishlisted = (product, wishlist) =>
  Boolean(product.is_in_wishlist) ||
  wishlist.some((item) => item._id === product._id);

export const addProductToCart = async ({
  authenticated,
  navigate,
  cart,
  product,
  quantity = 1,
}) => {
  if (!authenticated) {
    toast.info("Please sign in to add items to your cart");
    navigate("/login");
    return;
  }

  try {
    await cart.addToCart(product, quantity);
    toast.success(`${product.name} added to cart`);
  } catch {
    toast.error("Could not add this product to your cart. Please try again.");
  }
};

export const toggleProductWishlist = ({
  authenticated,
  navigate,
  wishlist,
  product,
  isWishlisted,
}) => {
  if (!authenticated) {
    toast.info("Please sign in to use your wishlist");
    navigate("/login");
    return;
  }

  return wishlist.toggle(product, isWishlisted);
};

export const showProductReviews = (setActiveTab) => {
  setActiveTab("reviews");
  document
    .getElementById("product-tabs")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
};
