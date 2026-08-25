import { Request, Response } from 'express';

import * as service from './payment.services.ts';
import sendResponse from '@core/constants/responsewrapper.constant.ts';
import { wrapControllers } from '@core/constants/wrapcontroller.constant.ts';
// import crypto from 'crypto';

const controllers = {
  createPaymentOrder: async (req: Request<{}, {}, { orderId: string }>, res: Response) => {
    const { orderId } = req.body;
    const result = await service.createPaymentOrder(orderId);
    return sendResponse.success(res, 'Payment order created', result);
  },

  verifyPayment: async (
    req: Request<{}, {}, { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }>,
    res: Response
  ) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const result = await service.verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    return sendResponse.success(res, 'Payment verified successfully', result);
  },

  refundPayment: async (
  req: Request<{}, {}, { orderId: string; amount?: number; reason?: string }>,
  res: Response
) => {
  const { orderId, amount, reason } = req.body;
  const result = await service.refundPayment(orderId, amount, reason);
  return sendResponse.success(res, 'Refund processed successfully', result);
},

  // Webhook: Razorpay signs the raw body with your webhook secret.
  // This route MUST receive the raw (unparsed) body — see route file note.
  // handleWebhook: async (req: Request, res: Response) => {
  //   const signature = req.headers['x-razorpay-signature'] as string;
  //   const rawBody = (req as any).rawBody; // set by raw-body middleware, see route file

  //   const expected = crypto
  //     .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
  //     .update(rawBody)
  //     .digest('hex');

  //   if (expected !== signature) {
  //     return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
  //   }

  //   const payload = JSON.parse(rawBody);
  //   await service.handleWebhookEvent(payload.event, payload.payload);

  //   // Razorpay expects a 200 quickly — always acknowledge receipt
  //   return res.status(200).json({ received: true });
  // },
};

export const { createPaymentOrder, verifyPayment,refundPayment
  // handleWebhook
  } = wrapControllers(controllers);