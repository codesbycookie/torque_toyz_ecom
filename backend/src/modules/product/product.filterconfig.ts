import { FilterConfig } from '@core/constants/dynamicfilter.constant.ts';
import { IProduct } from '@db/models/product.model.ts';

export const productFilterConfig: FilterConfig<IProduct> = {
  searchable: ['name', 'code'],
  searchableRefs: [
    { field: 'category', ref: 'Category', matchOn: 'name' }
  ],
  filterable: ['active', 'deleted', 'category', 'price', 'stock', 'ui.is_trending'],
  sortable: ['name', 'code', 'createdAt', 'active', 'price', 'stock', 'weight', 'ui.actual_price', 'ui.slash_price'],
  defaultSort: 'name',
};
