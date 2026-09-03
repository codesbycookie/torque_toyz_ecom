import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import mongoose from 'mongoose';
import { bootstrap } from '../app.ts';
import Product from '@db/models/product.model.ts';
import Location from '@db/models/location.model.ts';
import Order from '@db/models/order.model.ts';
import { tester } from '@core/constants/tester.constant.ts';
import Category from '@db/models/category.model.ts';

const baseRoute = '/api/v1/orders';

let token: string;
let cleanupAdmin: () => Promise<void>;
let testProductId: string;
let testLocationId: string;
let createdOrderId: string;
let testCategoryId: string;

beforeAll(async () => {
  await bootstrap();
  const setup = await tester.setupAdmin();
  token = setup.token;
  cleanupAdmin = setup.cleanup;

  const timestamp = Date.now();

  const category = await new Category({ name: `Payment Test Category ${timestamp}` }).save();
testCategoryId = category._id.toString();


  const product = await new Product({ name: `Order Product ${timestamp}`, stock: 10, weight: 1, category: testCategoryId, images: ['http://dummy.url/test.jpg'] }).save(); // fixed
  testProductId = product._id.toString();

  const location = await new Location({
    state: `Order Test State ${timestamp}`,
    code: `O${timestamp.toString().slice(-3)}`,
    slabs: [{ min: 0, max: 5, rate: 40 }],
  }).save();
  testLocationId = location._id.toString();
});

afterAll(async () => {
  if (cleanupAdmin) await cleanupAdmin();
  await Product.findByIdAndDelete(testProductId);
  await Location.findByIdAndDelete(testLocationId);
  if (createdOrderId) await Order.findByIdAndDelete(createdOrderId);
});

describe('Order API Endpoint Suite', () => {
  it('should reject requests without authorization header', async () => {
    const res = await tester.get(`${baseRoute}/mine`);
    tester.assertUnauthorized(res, 'Unauthenticated');
  });

  it('should reject order creation for an undeliverable location', async () => {
    const nonExistentLocation = new mongoose.Types.ObjectId().toString();
    const res = await tester.post(
      baseRoute,
      {
        items: [{ product: testProductId, quantity: 1 }],
        shipping_address: { state: nonExistentLocation, pincode: 600001 },
        payment_method: 'cod',
      },
      token
    );
    tester.assertBadRequest(res);
  });

  it('should successfully create an order and deduct stock', async () => {
    const res = await tester.post(
      baseRoute,
      {
        items: [{ product: testProductId, quantity: 2 }],
        shipping_address: { state: testLocationId, pincode: 600001 },
        payment_method: 'cod',
      },
      token
    );

    tester.assertCreated(res, 'Order', (data) => {
      createdOrderId = data._id;
      expect(data.status).to.equal('placed');
      expect(data.pricing.shipping_cost).to.equal(40);
      expect(data.status_history).to.have.length(1);
    });

    const product = await Product.findById(testProductId);
    expect(product!.stock).to.equal(8);
  });

  it('should reject order creation exceeding available stock', async () => {
    const res = await tester.post(
      baseRoute,
      {
        items: [{ product: testProductId, quantity: 999 }],
        shipping_address: { state: testLocationId, pincode: 600001 },
        payment_method: 'cod',
      },
      token
    );
    tester.assertBadRequest(res);
  });

  it("should successfully fetch the user's own orders", async () => {
    const res = await tester.get(`${baseRoute}/mine`, token);
    tester.assertFetched(res, 'orders');
  });

  it('should successfully fetch order by id', async () => {
    const res = await tester.get(`${baseRoute}/${createdOrderId}`, token);
    tester.assertFetched(res, 'order');
  });

  it('should successfully update order status and append to status_history', async () => {
    const res = await tester.patch(
      `${baseRoute}/${createdOrderId}/status`,
      { status: 'confirmed', note: 'Confirmed by admin' },
      token
    );
    tester.assertUpdated(res, 'order', (data) => {
      expect(data.status).to.equal('confirmed');
      expect(data.status_history).to.have.length(2);
    });
  });

  it('should successfully update payment status', async () => {
    const res = await tester.patch(
      `${baseRoute}/${createdOrderId}/payment-status`,
      { status: 'paid', transaction_id: 'TXN123' },
      token
    );
    tester.assertUpdated(res, 'order', (data) => {
      expect(data.payment.status).to.equal('paid');
      expect(data.payment.transaction_id).to.equal('TXN123');
    });
  });

  it('should successfully soft delete order', async () => {
    const res = await tester.delete(`${baseRoute}/${createdOrderId}`, token);
    tester.assertDeleted(res, 'order');
  });

  it('should return 404 for a non-existent order', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const res = await tester.get(`${baseRoute}/${nonExistentId}`, token);
    tester.assertNotFound(res, 'order');
  });
});