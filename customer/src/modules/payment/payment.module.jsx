import { apiurls } from "@/core/api/api.urls";
import { apiRequest } from "@/core/api/api.request";

export const usePaymentModule = () => {
  const { payments } = apiurls;

  const createPaymentOrder = async (orderId) => {
    try {
      const res = await apiRequest(payments.createOrder.method, payments.createOrder.url(), {
        data: { orderId },
      });
      return res?.data || res;
    } catch (err) {
      throw err;
    }
  };

  const verifyPayment = async (verificationData) => {
    try {
      const res = await apiRequest(payments.verify.method, payments.verify.url(), {
        data: verificationData,
      });
      return res?.data || res;
    } catch (err) {
      throw err;
    }
  };

  return {
    createPaymentOrder,
    verifyPayment,
  };
};
