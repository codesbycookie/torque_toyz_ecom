import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { bootstrap } from '../app.ts';
import Product from '@db/models/product.model.ts';
import Wishlist from '@db/models/wishlist.model.ts';
import { tester } from '@core/constants/tester.constant.ts';
import Category from '@db/models/category.model.ts';

const baseRoute = '/api/v1/wishlists';

let token: string;
let cleanupAdmin: () => Promise<void>;
let userId: string;
let testProductId: string;
let testProductId2: string;
let testCategoryId: string;

beforeAll(async () => {
  await bootstrap();
  const setup = await tester.setupAdmin();
  token = setup.token;
  cleanupAdmin = setup.cleanup;
  userId = setup.user._id.toString(); // fixed

  const timestamp = Date.now();
  const category = await new Category({ name: `Wishlist Test Category ${timestamp}-${Math.random()}`,  }).save();
testCategoryId = category._id.toString();

  const product1 = await new Product({ name: `Wishlist Product 1 ${timestamp}`, weight: 1 ,category: testCategoryId}).save();
  const product2 = await new Product({ name: `Wishlist Product 2 ${timestamp}`, weight: 1, category: testCategoryId, }).save();
  testProductId = product1._id.toString();
  testProductId2 = product2._id.toString();
}, 30000);

afterAll(async () => {
  if (cleanupAdmin) await cleanupAdmin();
  await Product.findByIdAndDelete(testProductId);
  await Product.findByIdAndDelete(testProductId2);
  await Wishlist.findOneAndDelete({ user: userId });
});

describe('Wishlist API Endpoint Suite', () => {
  it('should reject requests without authorization header', async () => {
    const res = await tester.get(baseRoute);

    console.log('STATUS:', res.status);
console.log('BODY:', res.body);
    tester.assertUnauthorized(res, 'Unauthenticated');
  });

  it('should return 404 for a user with no wishlist yet', async () => {
    const res = await tester.get(baseRoute, token);
    tester.assertNotFound(res, 'wishlist');
  });

  it('should successfully add a product to the wishlist, auto-creating it', async () => {
    const res = await tester.post(baseRoute, { product: testProductId }, token);
    tester.assertUpdated(res, 'wishlist');
    const productIds = res.body.data.products.map((p: any) => p._id || p.toString());
    expect(productIds).to.include(testProductId);
  });

  it('should not duplicate a product added twice', async () => {
    await tester.post(baseRoute, { product: testProductId }, token);
    const res = await tester.get(baseRoute, token);
    tester.assertFetched(res, 'wishlist');
    const count = res.body.data.products.filter((p: any) => (p._id || p.toString()) === testProductId).length;
    expect(count).to.equal(1);
  });

  it('should successfully add a second product', async () => {
    const res = await tester.post(baseRoute, { product: testProductId2 }, token);
    tester.assertUpdated(res, 'wishlist');
    expect(res.body.data.products).to.have.length(2);
  });

  it('should successfully remove a product from the wishlist', async () => {
    const res = await tester.delete(`${baseRoute}/${testProductId}`, token);
    tester.assertUpdated(res, 'wishlist');
    const productIds = res.body.data.products.map((p: any) => p._id || p.toString());
    expect(productIds).to.not.include(testProductId);
    expect(res.body.data.products).to.have.length(1);
  });

  it('should successfully clear the wishlist', async () => {
    const res = await tester.delete(baseRoute, token);
    tester.assertUpdated(res, 'wishlist');
    expect(res.body.data.products).to.have.length(0);
  });
});