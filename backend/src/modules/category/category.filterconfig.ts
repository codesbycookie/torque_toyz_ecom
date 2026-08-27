import { FilterConfig } from '@core/constants/dynamicfilter.constant.ts';
import { ICategory } from '@db/models/category.model.ts';

export const categoryFilterConfig: FilterConfig<ICategory> = {
  searchable: ['name', 'slug'],
  filterable: ['active'],
  sortable: ['name', 'createdAt'],
  defaultSort: 'name',
};