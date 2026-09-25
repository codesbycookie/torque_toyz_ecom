import { FilterConfig } from '@core/constants/dynamicfilter.constant.ts';
import { IPayment } from '@db/models/payment.model.ts';

export const paymentFilterConfig: FilterConfig<IPayment> = {
    searchable: ['razorpay_order_id', 'razorpay_payment_id'],
    searchableRefs: [
        { field: 'order', ref: 'Order', matchOn: 'code' }
    ],
    filterable: ['status', 'currency', 'active', 'deleted'],
    sortable: ['createdAt', 'amount', 'status', 'razorpay_order_id'],
    defaultSort: '-createdAt',
};
