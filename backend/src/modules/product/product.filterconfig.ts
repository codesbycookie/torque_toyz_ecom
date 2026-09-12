import { FilterConfig } from '@core/constants/dynamicfilter.constant.ts';
import { IProduct } from '@db/models/product.model.ts';

export const productFilterConfig: FilterConfig<IProduct> = {
  searchable: ['name', 'code'],
  searchableRefs: [
    { field: 'category', ref: 'Category', matchOn: 'name' }
  ],
  filterable: ['active', 'deleted', "category"],
  sortable: ['name', 'code', 'createdAt', 'active'],
  defaultSort: 'name',
};