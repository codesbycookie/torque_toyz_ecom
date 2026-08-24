import Review from '@db/models/review.model.ts';
import Order from '@db/models/order.model.ts';
import { dynamicFilter } from '@core/constants/dynamicfilter.constant.ts';
import { Role } from '@typings/auth.types.js';
import { ApiError } from '@core/errors/api.error.ts';
import { UPDATE_OPTIONS, SOFT_DELETE, RETRIEVE, getVisibility } from './review.constants.ts';
import { enhanceReview } from './review.util.ts';
import { reviewFilterConfig } from './review.filterconfig.ts';
import { CreateReviewPayload, UpdateReviewPayload } from '@typings/review.types.ts';

export const createReview = async (userId: string, data: CreateReviewPayload) => {
  // only allow reviewing products the user has actually received
  const hasPurchased = await Order.exists({
    user: userId,
    'items.product': data.product,
    status: 'delivered',
    deleted: false,
  });
  if (!hasPurchased) {
    throw new ApiError(403, 'You can only review products you have purchased and received');
  }

  const existing = await Review.findOne({ product: data.product, user: userId });
  if (existing) {
    throw new ApiError(409, 'You have already reviewed this product');
  }

  const review = await new Review({ ...data, user: userId }).save();
  return enhanceReview(review);
};

export const getAllReviews = async (queries: Record<string, unknown>, role?: Role) => {
  return dynamicFilter(Review, reviewFilterConfig, queries, {
    visibility: getVisibility(role),
  });
};

export const getReviewsByProduct = async (productId: string) => {
  const [reviews, stats] = await Promise.all([
    Review.getByProduct(productId),
    Review.getAverageRating(productId),
  ]);
  return { reviews: reviews.map(enhanceReview), stats };
};

export const getReviewById = async (id: string) => {
  const review = await Review.findById(id);
  if (!review) return null;
  return enhanceReview(review);
};

export const updateReview = async (id: string, userId: string, data: UpdateReviewPayload) => {
  const updated = await Review.findOneAndUpdate({ _id: id, user: userId }, data, UPDATE_OPTIONS);
  if (!updated) return null;
  return enhanceReview(updated);
};

export const removeReview = async (id: string) => {
  const removed = await Review.findByIdAndUpdate(id, SOFT_DELETE, { new: true });
  if (!removed) return null;
  return enhanceReview(removed);
};

export const retrieveReview = async (id: string) => {
  const retrieved = await Review.findByIdAndUpdate(id, RETRIEVE, { new: true });
  if (!retrieved) return null;
  return enhanceReview(retrieved);
};

export const setReviewActiveStatus = async (id: string, active: boolean) => {
  const updated = await Review.findByIdAndUpdate(
    id,
    { active, ...(active ? { deleted: false, deletedAt: null } : {}) },
    { new: true }
  );
  if (!updated) return null;
  return enhanceReview(updated);
};

export const deleteOwnReview = async (id: string, userId: string) => {
  const removed = await Review.findOneAndUpdate({ _id: id, user: userId }, SOFT_DELETE, { new: true });
  if (!removed) return null;
  return enhanceReview(removed);
};