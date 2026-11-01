import { FilterConfig } from '@core/constants/dynamicfilter.constant.ts';
import { IOrder } from '@db/models/order.model.ts';

export const orderFilterConfig: FilterConfig<IOrder> = {
    searchable: ['code'],
    searchableRefs: [
        { field: 'user', ref: 'User', matchOn: 'name' }
    ],
    filterable: ['status', 'user', 'active', 'deleted', 'payment.status'],
    sortable: ['code', 'createdAt', 'status'],
    defaultSort: '-createdAt',
    extras: {
        select: 'email phone login_id username profile role',
    },
    forcePopulate: [
        { path: 'shipping_address.state', select: 'state code name' },
        { path: 'items.product', select: 'name images price weight stock' },
    ],
};
