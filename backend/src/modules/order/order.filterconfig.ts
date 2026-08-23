import { FilterConfig } from '@core/constants/dynamicfilter.constant.ts';
import { IOrder } from '@db/models/order.model.ts';

export const orderFilterConfig: FilterConfig<IOrder> = {
    searchable: ['code'],
    filterable: ['status', 'user', 'active', 'deleted'],
    sortable: ['code', 'createdAt', 'status'],
    defaultSort: 'createdAt',
};