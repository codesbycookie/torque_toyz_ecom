import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { bootstrap } from '../app.ts';
import Product from '@db/models/product.model.ts';
import Wishlist from '@db/models/wishlist.model.ts';
import { tester } from '@core/constants/tester.constant.ts';

const baseRoute = '/api/v1/wishlist';

let token: string;
let cleanupAdmin: () => Promise<void>;
let userId: string;
let testProductId: string;
let testProductId2: string;

beforeAll(async () => {
    await bootstrap();
    const setup = await tester.setupAdmin();
    token = setup.token;
    cleanupAdmin = setup.cleanup;
    userId = setup.userId; // assumes tester.setupAdmin exposes the created user's id

    const timestamp = Date.now();
    const product1 = await new Product({ name: `Wishlist Product 1 ${timestamp}` }).save();
    const product2 = await new Product({ name: `Wishlist Product 2 ${timestamp}` }).save();
    testProductId = product1._id.toString();
    testProductId2 = product2._id.toString();
});

afterAll(async () => {
    if (cleanupAdmin) await cleanupAdmin();
    await Product.findByIdAndDelete(testProductId);
    await Product.findByIdAndDelete(testProductId2);
    await Wishlist.findOneAndDelete({ user: userId });
});

describe('Wishlist API Endpoint Suite', () => {
    it('should reject requests without authorization header', async () => {
        const res = await tester.get(baseRoute);
        tester.assertUnauthorized(res, 'Unauthenticated');
    });

    it('should return 404 for a user with no wishlist yet', async () => {
        const res = await tester.get(baseRoute, token);
        tester.assertNotFound(res, 'wishlist');
    });

    it('should successfully add a product to the wishlist, auto-creating it', async () => {
        const res = await tester.post(baseRoute, { product: testProductId }, token);
        tester.assertUpdated(res, 'wishlist', (data) => {
            expect(data.products).to.include(testProductId);
        });
    });

    it('should not duplicate a product added twice', async () => {
        await tester.post(baseRoute, { product: testProductId }, token);
        const res = await tester.get(baseRoute, token);
        tester.assertFetched(res, 'wishlist', (data) => {
            const count = data.products.filter((p: string) => p === testProductId).length;
            expect(count).to.equal(1);
        });
    });

    it('should successfully add a second product', async () => {
        const res = await tester.post(baseRoute, { product: testProductId2 }, token);
        tester.assertUpdated(res, 'wishlist', (data) => {
            expect(data.products).to.have.length(2);
        });
    });

    it('should successfully remove a product from the wishlist', async () => {
        const res = await tester.delete(`${baseRoute}/${testProductId}`, token);
        tester.assertUpdated(res, 'wishlist', (data) => {
            expect(data.products).to.not.include(testProductId);
            expect(data.products).to.have.length(1);
        });
    });

    it('should successfully clear the wishlist', async () => {
        const res = await tester.delete(baseRoute, token);
        tester.assertUpdated(res, 'wishlist', (data) => {
            expect(data.products).to.have.length(0);
        });
    });
});