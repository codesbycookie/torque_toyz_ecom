import { FilterConfig } from '@core/constants/dynamicfilter.constant.ts';
import { IReview } from '@db/models/review.model.ts';

export const reviewFilterConfig: FilterConfig<IReview> = {
  searchable: ['comment'],
  filterable: ['product', 'user', 'rating', 'active', 'deleted'],
  sortable: ['rating', 'createdAt'],
  defaultSort: 'createdAt',
};