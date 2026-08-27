import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import mongoose from 'mongoose';
import { bootstrap } from '../app.ts';
import Product from '@db/models/product.model.ts';
import Category from '@db/models/category.model.ts';
import { tester } from '@core/constants/tester.constant.ts';

const baseRoute = '/api/v1/products';

let token: string;
let cleanupAdmin: () => Promise<void>;
let createdProductId: string;
let testCategoryId: string;

beforeAll(async () => {
  await bootstrap();
  const setup = await tester.setupAdmin();
  token = setup.token;
  cleanupAdmin = setup.cleanup;

  const timestamp = Date.now();
  const category = await new Category({ name: `Product Test Category ${timestamp}` }).save();
  testCategoryId = category._id.toString();
});

afterAll(async () => {
  if (cleanupAdmin) await cleanupAdmin();
  if (createdProductId) await Product.findByIdAndDelete(createdProductId);
  if (testCategoryId) await Category.findByIdAndDelete(testCategoryId);
});

describe('Product API Endpoint Suite', () => {
  it('should allow fetching all products without auth', async () => {
    const res = await tester.get(baseRoute);
    tester.assertFetched(res, 'product');
  });

  it('should reject creation without authorization header', async () => {
    const res = await tester.post(baseRoute, { name: 'Test Product' });
    tester.assertUnauthorized(res, 'Unauthenticated');
  });

  it('should reject creation with no category assigned', async () => {
    const timestamp = Date.now();
    const res = await tester.post(
      baseRoute,
      { name: `No Category Product ${timestamp}`, weight: 1 },
      token
    );
    tester.assertValidationError(res);
  });

  it('should successfully create a product with default images and zero stock', async () => {
    const timestamp = Date.now();
    const res = await tester.post(
      baseRoute,
      {
        name: `Test Product ${timestamp}`,
        description: 'A test product',
        weight: 1,
        category: testCategoryId,
      },
      token
    );

    tester.assertCreated(res, 'Product', (data) => {
      createdProductId = data._id;
      expect(data.stock).to.equal(0);
      expect(data.images).to.have.length(3);
      expect(data.active).to.equal(true);
      expect(data.code).to.match(/^P-\d{3}$/);
      expect(data.category).to.equal(testCategoryId);
    });
  });

  it('should reject creation with a name that is too short', async () => {
    const res = await tester.post(
      baseRoute,
      { name: 'A', weight: 1, category: testCategoryId },
      token
    );
    tester.assertValidationError(res);
  });

  it('should allow fetching product by id without auth', async () => {
    const res = await tester.get(`${baseRoute}/${createdProductId}`);
    tester.assertFetched(res, 'product');
  });

  it('should successfully filter products by category', async () => {
    const res = await tester.get(`${baseRoute}?category=${testCategoryId}`);
    tester.assertFetched(res, 'product');
    const found = res.body.data.find((p: any) => p._id === createdProductId);
    expect(found).to.exist;
  });

  it('should successfully update product stock', async () => {
    const res = await tester.put(`${baseRoute}/${createdProductId}`, { stock: 50 }, token);
    tester.assertUpdated(res, 'product', (data) => {
      expect(data.stock).to.equal(50);
    });
  });

  it('should successfully soft delete product', async () => {
    const res = await tester.delete(`${baseRoute}/${createdProductId}`, token);
    tester.assertDeleted(res, 'product');
  });

  it('should not return a soft-deleted product in the public listing', async () => {
    const res = await tester.get(`${baseRoute}?search=${createdProductId}`);
    expect(res.body.data.find((p: any) => p._id === createdProductId)).to.be.undefined;
  });

  it('should successfully retrieve soft deleted product', async () => {
    const res = await tester.put(`${baseRoute}/${createdProductId}/retrieve`, undefined, token);
    tester.assertSuccess(res, 'Product retrieved successfully');
  });

  it('should successfully toggle active status', async () => {
    const res = await tester.patch(
      `${baseRoute}/${createdProductId}/active-status`,
      { active: false },
      token
    );
    tester.assertUpdated(res, 'product', (data) => {
      expect(data.active).to.equal(false);
    });
  });

  it('should successfully permanently erase product', async () => {
    const res = await tester.delete(`${baseRoute}/${createdProductId}/erase`, token);
    tester.assertDeleted(res, 'product');
  });

  it('should return 404 when requesting a non-existent product', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const res = await tester.get(`${baseRoute}/${nonExistentId}`, token);
    tester.assertNotFound(res, 'product');
  });
});