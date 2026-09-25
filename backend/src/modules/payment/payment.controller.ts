import { Request, Response } from 'express';

import * as service from './payment.services.ts';
import sendResponse from '@core/constants/responsewrapper.constant.ts';
import { wrapControllers } from '@core/constants/wrapcontroller.constant.ts';
import { buildQuery } from '@core/constants/querybuilder.constant.ts';
import { AccessRequest } from '@core/middlewares/access.middleware.ts';

const controllers = {
  getAllPayments: async (req: AccessRequest, res: Response) => {
    const queries = buildQuery(req);
    const result = await service.getAllPayments(queries, req.user?.role);
    return sendResponse.paginated(res, 'payment', result);
  },

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
  req: Request<{}, {}, { orderId: string; reason?: string }>,
  res: Response
) => {
  const { orderId, reason } = req.body;
  const result = await service.refundPayment(orderId, reason);
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

export const { getAllPayments, createPaymentOrder, verifyPayment,refundPayment
  // handleWebhook
  } = wrapControllers(controllers);