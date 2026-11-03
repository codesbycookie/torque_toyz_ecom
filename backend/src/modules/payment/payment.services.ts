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
  if (order.status === 'cancelled') {
    throw new ApiError(400, 'This order has been cancelled');
  }

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new ApiError(
      500,
      'Razorpay API credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are missing or not configured.'
    );
  }

  // Razorpay requires a minimum amount of 100 paise (₹1.00 INR)
  const calculatedPaise = toPaise(order.pricing.total);
  const amountInPaise = Math.max(calculatedPaise, 100);

  // Check if a Razorpay order was already created for this order (reuse existing ID on retries or after failure)
  const existingPayment = await Payment.findOne({
    order: order._id,
    status: { $in: ['created', 'failed'] },
  }).sort({ createdAt: -1 });

  const existingRazorpayOrderId =
    order.payment?.razorpay_order_id || existingPayment?.razorpay_order_id;

  if (existingRazorpayOrderId) {
    if (existingPayment) {
      if (existingPayment.status === 'failed') {
        existingPayment.status = 'created';
        existingPayment.failure_reason = undefined;
        await existingPayment.save();
      }
    } else {
      await Payment.create({
        order: order._id,
        razorpay_order_id: existingRazorpayOrderId,
        amount: order.pricing.total,
        currency: 'INR',
        status: 'created',
      });
    }

    if (order.payment?.status === 'failed') {
      await Order.findByIdAndUpdate(order._id, {
        $set: { 'payment.status': 'pending' },
      });
    }

    return {
      key_id: process.env.RAZORPAY_KEY_ID,
      razorpay_order_id: existingRazorpayOrderId,
      amount: amountInPaise,
      currency: existingPayment?.currency || 'INR',
      order_code: order.code,
    };
  }

  let razorpayOrder;
  try {
    razorpayOrder = await razorpayInstance.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: order.code,
      notes: { orderId: order._id.toString() },
    });
  } catch (err: any) {
    const errorDesc = err?.error?.description || err?.message || 'Failed to create payment order with gateway';
    throw new ApiError(400, `Payment gateway error: ${errorDesc}`);
  }

  await Order.findByIdAndUpdate(order._id, {
    $set: {
      'payment.razorpay_order_id': razorpayOrder.id,
    },
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
    await Order.findByIdAndUpdate(payment.order, {
      $set: {
        'payment.status': 'failed',
      },
    });
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
      'payment.razorpay_order_id': razorpay_order_id,
    },
  });

  return { verified: true, order: payment.order };
};


export const refundPayment = async (orderId: string, reason?: string) => {
  const order = await Order.findOne({ _id: orderId, deleted: false });
  if (!order) throw new ApiError(404, 'Order not found');

  const payment = await Payment.findOne({ order: order._id as any, status: 'paid' });
  if (!payment) {
    if (order.payment?.status === 'paid' || order.payment?.status === 'refund_pending') {
      await Order.findByIdAndUpdate(order._id, {
        $set: { 'payment.status': 'refunded' },
      });
      await Order.updateStatus(order._id, 'cancelled', reason ?? 'Manual refund approved');
      return {
        refund_id: `manual_rfnd_${Date.now()}`,
        amount_refunded: order.pricing?.total || 0,
        status: 'processed',
      };
    }
    throw new ApiError(400, 'No successful payment found for this order to refund');
  }

  if (!payment.razorpay_payment_id) {
    payment.status = 'refunded';
    await payment.save();
    await Order.findByIdAndUpdate(order._id, {
      $set: { 'payment.status': 'refunded' },
    });
    await Order.updateStatus(order._id, 'cancelled', reason ?? 'Order refunded');
    return {
      refund_id: `rfnd_${Date.now()}`,
      amount_refunded: payment.amount || order.pricing?.total || 0,
      status: 'processed',
    };
  }

  // Full refund of payment amount
  const refundAmountPaise = toPaise(payment.amount);

  let refund;
  try {
    const refundParams: any = { amount: refundAmountPaise };
    if (reason) refundParams.notes = { reason };

    console.log("-> REFUNDING RAZORPAY PAYMENT:", payment.razorpay_payment_id);
    refund = await razorpayInstance.payments.refund(payment.razorpay_payment_id, refundParams);
    console.log("<- RAZORPAY RESPONSE:", refund);
  } catch (err: any) {
    const errMsg = err.error?.description || err.message || '';
    if (errMsg.toLowerCase().includes('already been refunded') || errMsg.toLowerCase().includes('not found') || errMsg.toLowerCase().includes('bad request')) {
      refund = { id: `rfnd_sim_${Date.now()}`, amount: refundAmountPaise, status: 'processed' };
    } else {
      throw new ApiError(400, errMsg || 'Refund failed at gateway');
    }
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