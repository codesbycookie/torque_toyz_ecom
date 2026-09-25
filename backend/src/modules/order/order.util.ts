import { enhanceDoc } from '@core/constants/enhancedoc.constant.ts';
import OrderModel, { IOrder } from '@db/models/order.model.ts';

export const enhanceOrder = async (order: IOrder) => {
    order = await order.populate([
        { path: 'user', select: 'name email phone' },
        { path: 'shipping_address.state', select: 'name' },
        { path: 'items.product', select: 'name images price weight stock' }
    ]);
    return enhanceDoc(OrderModel, order, []);
};