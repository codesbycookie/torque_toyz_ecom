import { FilterConfig } from '@core/constants/dynamicfilter.constant.ts';
import { IReview } from '@db/models/review.model.ts';

export const reviewFilterConfig: FilterConfig<IReview> = {
  searchable: ['comment'],
  searchableRefs: [
    { field: 'user', ref: 'User', matchOn: 'name' },
    { field: 'product', ref: 'Product', matchOn: 'name' }
  ],
  filterable: ['product', 'user', 'rating', 'active', 'deleted'],
  sortable: ['rating', 'createdAt'],
  defaultSort: 'createdAt',
};