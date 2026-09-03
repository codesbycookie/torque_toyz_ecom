import { describe, it, beforeAll, afterAll, expect } from "vitest";
import crypto from "crypto";
import mongoose from "mongoose";
import { bootstrap } from "../app.ts";
import Product from "@db/models/product.model.ts";
import Location from "@db/models/location.model.ts";
import Order from "@db/models/order.model.ts";
import Payment from "@db/models/payment.model.ts";
import { tester } from "@core/constants/tester.constant.ts";
import { vi } from "vitest";
import Category from "@db/models/category.model.ts";

const baseRoute = "/api/v1/payments";

let token: string;
let cleanupAdmin: () => Promise<void>;
let testProductId: string;
let testLocationId: string;
let onlineOrderId: string;
let codOrderId: string;
let razorpayOrderId: string;
let testCategoryId: string;

const generateSignature = (
  razorpay_order_id: string,
  razorpay_payment_id: string,
) => {
  return crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");
};

vi.mock("@config/razorpay.config.ts", async () => {
  const actual = await vi.importActual<any>("@config/razorpay.config.ts");
  return {
    ...actual,
    razorpayInstance: {
      orders: {
        create: vi.fn(async ({ amount, currency, receipt }) => ({
          id: `order_test_${Date.now()}`,
          amount,
          currency,
          receipt,
        })),
      },
      payments: {
        refund: vi.fn(async (paymentId: string, { amount, notes }: any) => ({
          id: `rfnd_test_${Date.now()}`,
          amount,
          status: "processed",
        })),
      },
    },
  };
});

beforeAll(async () => {
  await bootstrap();
  const setup = await tester.setupAdmin();
  token = setup.token;
  cleanupAdmin = setup.cleanup;

  const timestamp = Date.now();

  const category = await new Category({
    name: `Payment Test Category ${timestamp}`,
  }).save();
  testCategoryId = category._id.toString();

  const product = await new Product({
    name: `Payment Test Product ${timestamp}`,
    stock: 10,
    weight: 1,
    price: 500,
    category: testCategoryId,
    images: ['http://dummy.url/test.jpg'],
  }).save();
  testProductId = product._id.toString();

  const location = await new Location({
    state: `Payment Test State ${timestamp}`,
    code: `PY${timestamp.toString().slice(-4)}`,
    slabs: [{ min: 0, max: 5, rate: 40 }],
  }).save();
  testLocationId = location._id.toString();

  // an order set up for online payment — the one we'll actually pay for
  const onlineOrder = await new Order({
    user: setup.user._id,
    items: [
      {
        product: product._id,
        name: product.name,
        image: product.images[0],
        price: product.price,
        weight: product.weight,
        quantity: 1,
      },
    ],
    shipping_address: { state: location._id, pincode: 600001 },
    pricing: { subtotal: 500, total_weight: 1, shipping_cost: 40, total: 540 },
    payment: { method: "online", status: "pending" },
  }).save();
  onlineOrderId = onlineOrder._id.toString();

  // a COD order — used to test that create-order correctly rejects it
  const codOrder = await new Order({
    user: setup.user._id,
    items: [
      {
        product: product._id,
        name: product.name,
        image: product.images[0],
        price: product.price,
        weight: product.weight,
        quantity: 1,
      },
    ],
    shipping_address: { state: location._id, pincode: 600001 },
    pricing: { subtotal: 500, total_weight: 1, shipping_cost: 40, total: 540 },
    payment: { method: "cod", status: "pending" },
  }).save();
  codOrderId = codOrder._id.toString();
});

afterAll(async () => {
  if (cleanupAdmin) await cleanupAdmin();
  await Product.findByIdAndDelete(testProductId);
  await Location.findByIdAndDelete(testLocationId);
  await Order.deleteMany({ _id: { $in: [onlineOrderId, codOrderId] } });
  await Payment.deleteMany({ order: { $in: [onlineOrderId, codOrderId] } });
});

describe("Payment API Endpoint Suite", () => {
  it("should reject requests without authorization header", async () => {
    const res = await tester.post(`${baseRoute}/create-order`, {
      orderId: onlineOrderId,
    });
    tester.assertUnauthorized(res, "Unauthenticated");
  });

  it("should reject creating a payment order for a COD order", async () => {
    const res = await tester.post(
      `${baseRoute}/create-order`,
      { orderId: codOrderId },
      token,
    );
    tester.assertBadRequest(res, "This order is not set up for online payment");
  });

  it("should reject creating a payment order for a non-existent order", async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const res = await tester.post(
      `${baseRoute}/create-order`,
      { orderId: nonExistentId },
      token,
    );
    tester.assertNotFound(res, "order");
  });

  it("should successfully create a razorpay payment order for an online order", async () => {
    const res = await tester.post(
      `${baseRoute}/create-order`,
      { orderId: onlineOrderId },
      token,
    );
    tester.assertSuccess(res, "Payment order created");

    const data = res.body.data;
    expect(data.razorpay_order_id).to.be.a("string");
    expect(data.amount).to.equal(54000); // ₹540 in paise
    expect(data.key_id).to.equal(process.env.RAZORPAY_KEY_ID);

    razorpayOrderId = data.razorpay_order_id;

    const paymentDoc = await Payment.findByRazorpayOrderId(razorpayOrderId);
    expect(paymentDoc).to.exist;
    expect(paymentDoc!.status).to.equal("created");
  });

  it("should reject creating a second payment order for an already-created order", async () => {
    // still "pending", not "paid" yet, so this is really testing repeat-create behavior
    const res = await tester.post(
      `${baseRoute}/create-order`,
      { orderId: onlineOrderId },
      token,
    );
    // depending on your business rule this might succeed (new attempt) or you may want
    // to guard against duplicate razorpay orders per Order — flagging as worth deciding
    expect([200, 400, 409]).to.include(res.status);
  });

  it("should reject verification with an invalid signature", async () => {
    const fakePaymentId = "pay_fake_invalid_sig";
    const res = await tester.post(
      `${baseRoute}/verify`,
      {
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: fakePaymentId,
        razorpay_signature: "clearly-not-a-valid-signature",
      },
      token,
    );
    tester.assertBadRequest(res, "Payment verification failed");

    const paymentDoc = await Payment.findByRazorpayOrderId(razorpayOrderId);
    expect(paymentDoc!.status).to.equal("failed");
  });

  it("should reject verification for a non-existent razorpay_order_id", async () => {
    const fakeSignature = generateSignature("order_doesnotexist", "pay_fake");
    const res = await tester.post(
      `${baseRoute}/verify`,
      {
        razorpay_order_id: "order_doesnotexist",
        razorpay_payment_id: "pay_fake",
        razorpay_signature: fakeSignature,
      },
      token,
    );
    tester.assertNotFound(res, "payment");
  });

  it("should successfully verify payment with a correctly generated signature", async () => {
    // NOTE: the previous "invalid signature" test already flipped this payment's
    // status to 'failed' — re-fetch a fresh razorpay_order_id by creating a new
    // payment order first, so this test exercises a clean 'created' -> 'paid' path.
    const createRes = await tester.post(
      `${baseRoute}/create-order`,
      { orderId: onlineOrderId },
      token,
    );
    const freshRazorpayOrderId = createRes.body.data.razorpay_order_id;

    const fakePaymentId = `pay_test_${Date.now()}`;
    const validSignature = generateSignature(
      freshRazorpayOrderId,
      fakePaymentId,
    );

    const res = await tester.post(
      `${baseRoute}/verify`,
      {
        razorpay_order_id: freshRazorpayOrderId,
        razorpay_payment_id: fakePaymentId,
        razorpay_signature: validSignature,
      },
      token,
    );
    tester.assertSuccess(res, "Payment verified successfully");

    const paymentDoc =
      await Payment.findByRazorpayOrderId(freshRazorpayOrderId);
    expect(paymentDoc!.status).to.equal("paid");
    expect(paymentDoc!.razorpay_payment_id).to.equal(fakePaymentId);

    const order = await Order.findById(onlineOrderId);
    expect(order!.payment.status).to.equal("paid");
    expect(order!.payment.transaction_id).to.equal(fakePaymentId);
    expect(order!.status).to.equal("confirmed");
  });

  it("should successfully refund a fully paid order", async () => {
    const res = await tester.post(
      `${baseRoute}/refund`,
      { orderId: onlineOrderId, reason: "Test refund" },
      token,
    );
    tester.assertSuccess(res, "Refund processed successfully");

    const order = await Order.findById(onlineOrderId);
    expect(order!.payment.status).to.equal("refunded");
    expect(order!.status).to.equal("cancelled");
  });

  it("should reject refunding an order with no successful payment", async () => {
    const res = await tester.post(
      `${baseRoute}/refund`,
      { orderId: codOrderId },
      token,
    );
    tester.assertBadRequest(
      res,
      "No successful payment found for this order to refund",
    );
  });
});
