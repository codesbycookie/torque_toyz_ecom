// order.modals.jsx
import { ViewOrder, ChangeOrderStatus, ApproveInitiateRefund } from "./order.modal.components";

export const modals = {
  view: ViewOrder,
  changeStatus: ChangeOrderStatus,
  refund: ApproveInitiateRefund,
};
