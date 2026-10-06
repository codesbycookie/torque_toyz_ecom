import { apiurls } from "@/core/api/api.urls";
import { createCrud } from "@/core/factory/entity.crud";
import { loadRazorpayScript } from "./payment.helpers";

export const usePaymentModule = () => {
  const { payments } = apiurls;

  const crud = createCrud({
    entity: "Payment",
    urls: payments,
    store: null,
    getRole: () => null,
  });

  const createPaymentOrder = async (orderId) => {
    return crud.createOrder({ orderId }, { __options: { toast: false } });
  };

  const verifyPayment = async (verificationData) => {
    return crud.verify(verificationData, { __options: { toast: false } });
  };

  return {
    crud,
    createPaymentOrder,
    verifyPayment,
    loadScript: loadRazorpayScript,
  };
};
