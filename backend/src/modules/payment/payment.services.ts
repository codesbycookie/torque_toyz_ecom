import crypto from 'crypto';
import Payment from '@db/models/payment.model.ts';
import Order from '@db/models/order.model.ts';
import { ApiError } from '@core/errors/api.error.ts';
import { razorpayInstance, toPaise, toRupees } from '@config/razorpay.config.ts';
import { dynamicFilter } from '@core/constants/dynamicfilter.constant.ts';
import { paymentFilterConfig } from './payment.filterconfig.ts';

export const createPaymentOrder = async (orderId: string) => {
  const order = await Order.findOne({ _id: orderId, deleted: false });
  if (!order) throw new ApiError(404, 'Order not found');

  if (!order.payment || order.payment.method !== 'online') {
    throw new ApiError(400, 'This order is not set up for online payment');
  }
  if (order.payment.status === 'paid') {
    throw new ApiError(409, 'This order has already been paid');
  }

  const razorpayOrder = await razorpayInstance.orders.create({
    amount: toPaise(order.pricing.total),
    currency: 'INR',
    receipt: order.code,
    notes: { orderId: order._id.toString() },
  });

  await Payment.create({
    order: order._id,
    razorpay_order_id: razorpayOrder.id,
    amount: order.pricing.total,
    currency: 'INR',
    status: 'created',
  });

  return {
    key_id: process.env.RAZORPAY_KEY_ID,
    razorpay_order_id: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    order_code: order.code,
  };
};

export const getAllPayments = async (queries: Record<string, unknown>, role?: string) => {
  return dynamicFilter(Payment, paymentFilterConfig, queries, {
    visibility: role === 'super_admin' ? 'all' : 'active-only',
  });
};

export const verifyPayment = async (
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
) => {
  const payment = await Payment.findByRazorpayOrderId(razorpay_order_id);
  if (!payment) throw new ApiError(404, 'Payment not found');

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  const isValid = expectedSignature === razorpay_signature;

  if (!isValid) {
    payment.status = 'failed';
    payment.failure_reason = 'Signature verification failed';
    await payment.save();
    throw new ApiError(400, 'Payment verification failed');
  }

  payment.razorpay_payment_id = razorpay_payment_id;
  payment.razorpay_signature = razorpay_signature;
  payment.status = 'paid';
  await payment.save();

  await Order.updateStatus(payment.order, 'confirmed', 'Payment received via Razorpay');
  await Order.findByIdAndUpdate(payment.order, {
    $set: {
      'payment.status': 'paid',
      'payment.transaction_id': razorpay_payment_id,
    },
  });

  return { verified: true, order: payment.order };
};


export const refundPayment = async (orderId: string, reason?: string) => {
  const order = await Order.findOne({ _id: orderId, deleted: false });
  if (!order) throw new ApiError(404, 'Order not found');

  const payment = await Payment.findOne({ order: order._id, status: 'paid' });
  if (!payment) throw new ApiError(400, 'No successful payment found for this order to refund');

  if (!payment.razorpay_payment_id) {
    throw new ApiError(400, 'Payment record is missing a Razorpay payment id');
  }

  // Full refund of payment amount
  const refundAmountPaise = toPaise(payment.amount);

  let refund;
  try {
    const refundParams: any = { amount: refundAmountPaise };
    if (reason) refundParams.notes = { reason };

    console.log("-> REFUNDING RAZORPAY PAYMENT:", payment.razorpay_payment_id);
    console.log("-> REFUND PARAMS:", refundParams);

    refund = await razorpayInstance.payments.refund(payment.razorpay_payment_id, refundParams);
    console.log("<- RAZORPAY RESPONSE:", refund)
  } catch (err: any) {
    console.log(err)
    throw new ApiError(400, err.error?.description || err.message || 'Refund failed at gateway');
  }

  const isFullRefund = refundAmountPaise === toPaise(payment.amount);

  payment.status = isFullRefund ? 'refunded' : 'paid'; // partial refund keeps status as 'paid'
  await payment.save();

  await Order.findByIdAndUpdate(order._id, {
    $set: { 'payment.status': isFullRefund ? 'refunded' : 'paid' },
  });

  if (isFullRefund) {
    await Order.updateStatus(order._id, 'cancelled', reason ?? 'Order refunded');
  }


  console.log(refund, payment, order)

  return {
    refund_id: refund.id,
    amount_refunded: toRupees(refund.amount as number),
    status: refund.status,
  };
};

// Called by the webhook — same signature check, different HMAC key
// (webhook secret, not the API key secret), and idempotent since
// Razorpay can retry webhook delivery.
// export const handleWebhookEvent = async (event: string, payload: any) => {
//   if (event === 'payment.captured') {
//     const razorpayPaymentId = payload.payment.entity.id;
//     const razorpayOrderId = payload.payment.entity.order_id;

//     const payment = await Payment.findByRazorpayOrderId(razorpayOrderId);
//     if (!payment) return; // unknown order, ignore silently

//     if (payment.status === 'paid') return; // already processed, idempotent no-op

//     payment.razorpay_payment_id = razorpayPaymentId;
//     payment.status = 'paid';
//     await payment.save();

//     await Order.updateStatus(payment.order, 'confirmed', 'Payment confirmed via webhook');
//     await Order.findByIdAndUpdate(payment.order, {
//       $set: { 'payment.status': 'paid', 'payment.transaction_id': razorpayPaymentId },
//     });
//   }

//   if (event === 'payment.failed') {
//     const razorpayOrderId = payload.payment.entity.order_id;
//     const payment = await Payment.findByRazorpayOrderId(razorpayOrderId);
//     if (!payment) return;

//     payment.status = 'failed';
//     payment.failure_reason = payload.payment.entity.error_description ?? 'Payment failed';
//     await payment.save();

//     await Order.findByIdAndUpdate(payment.order, {
//       $set: { 'payment.status': 'failed' },
//     });
//   }

//   if (event === 'refund.processed') {
//     const razorpayPaymentId = payload.refund.entity.payment_id;
//     const payment = await Payment.findOne({ razorpay_payment_id: razorpayPaymentId });
//     if (!payment) return;

//     payment.status = 'refunded';
//     await payment.save();

//     await Order.findByIdAndUpdate(payment.order, {
//       $set: { 'payment.status': 'refunded' },
//     });
//   }
// };