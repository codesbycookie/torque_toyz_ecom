import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import mongoose from 'mongoose';
import { bootstrap } from '../app.ts';
import Product from '@db/models/product.model.ts';
import Order from '@db/models/order.model.ts';
import Review from '@db/models/review.model.ts';
import { tester } from '@core/constants/tester.constant.ts';

const baseRoute = '/api/v1/reviews';

let token: string;
let cleanupAdmin: () => Promise<void>;
let userId: string;
let testProductId: string;
let createdReviewId: string;

beforeAll(async () => {
    await bootstrap();
    const setup = await tester.setupAdmin();
    token = setup.token;
    cleanupAdmin = setup.cleanup;
    userId = setup.userId;

    const timestamp = Date.now();
    const product = await new Product({ name: `Review Product ${timestamp}` }).save();
    testProductId = product._id.toString();

    // simulate a delivered order so the review purchase-gate passes
    await new Order({
        user: userId,
        items: [{ product: product._id, name: product.name, image: 'x.png', price: 100, weight: 1, quantity: 1 }],
        shipping_address: { state: new mongoose.Types.ObjectId(), pincode: 600001 },
        pricing: { subtotal: 100, total_weight: 1, shipping_cost: 30, total: 130 },
        payment: { method: 'cod', status: 'pending' },
        status: 'delivered',
    }).save();
});

afterAll(async () => {
    if (cleanupAdmin) await cleanupAdmin();
    await Product.findByIdAndDelete(testProductId);
    await Order.deleteMany({ 'items.product': testProductId });
    await Review.deleteMany({ product: testProductId });
});

describe('Review API Endpoint Suite', () => {
    it('should allow fetching product reviews without auth', async () => {
        const res = await tester.get(`${baseRoute}/product/${testProductId}`);
        tester.assertFetched(res, 'reviews', (data) => {
            expect(data.stats.count).to.equal(0);
        });
    });

    it('should reject review creation without authorization header', async () => {
        const res = await tester.post(baseRoute, { product: testProductId, rating: 5 });
        tester.assertUnauthorized(res, 'Unauthenticated');
    });

    it('should reject a review for an out-of-range rating', async () => {
        const res = await tester.post(baseRoute, { product: testProductId, rating: 6 }, token);
        tester.assertValidationError(res);
    });

    it('should successfully create a review after a delivered order exists', async () => {
        const res = await tester.post(
            baseRoute,
            { product: testProductId, rating: 4, comment: 'Solid product' },
            token
        );
        tester.assertCreated(res, 'Review', (data) => {
            createdReviewId = data._id;
            expect(data.rating).to.equal(4);
        });
    });

    it('should reject a second review from the same user on the same product', async () => {
        const res = await tester.post(baseRoute, { product: testProductId, rating: 5 }, token);
        tester.assertConflict(res);
    });

    it('should reflect the new review in product review stats', async () => {
        const res = await tester.get(`${baseRoute}/product/${testProductId}`);
        tester.assertFetched(res, 'reviews', (data) => {
            expect(data.stats.count).to.equal(1);
            expect(data.stats.average).to.equal(4);
        });
    });

    it('should successfully update own review', async () => {
        const res = await tester.put(`${baseRoute}/${createdReviewId}`, { rating: 5 }, token);
        tester.assertUpdated(res, 'review', (data) => {
            expect(data.rating).to.equal(5);
        });
    });

    it('should successfully delete own review', async () => {
        const res = await tester.delete(`${baseRoute}/${createdReviewId}`, token);
        tester.assertDeleted(res, 'review');
    });

    it('should return 404 for a non-existent review', async () => {
        const nonExistentId = new mongoose.Types.ObjectId().toString();
        const res = await tester.get(`${baseRoute}/${nonExistentId}`, token);
        tester.assertNotFound(res, 'review');
    });
});