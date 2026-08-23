import { enhanceDoc } from '@core/constants/enhancedoc.constant.ts';
import ReviewModel, { IReview } from '@db/models/review.model.ts';

export const enhanceReview = (review: IReview) => {
  return enhanceDoc(ReviewModel, review, []);
};