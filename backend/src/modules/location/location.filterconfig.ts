import { FilterConfig } from '@core/constants/dynamicfilter.constant.ts';
import { ILocation } from '@db/models/location.model.ts';

export const locationFilterConfig: FilterConfig<ILocation> = {
  searchable: ['state', 'code'],
  filterable: ['deliverable'],
  sortable: ['state', 'code', 'createdAt'],
  defaultSort: 'state',
};