import { enhanceDoc } from '@core/constants/enhancedoc.constant.ts';
import OrderModel, { IOrder } from '@db/models/order.model.ts';

export const enhanceOrder = async (order: IOrder) => {
    order = await order.populate([
        { path: 'user', select: 'name email phone login_id username profile role' },
        { path: 'shipping_address.state', select: 'state code name' },
        { path: 'items.product', select: 'name images price weight stock' }
    ]);
    return enhanceDoc(OrderModel, order, []);
};
