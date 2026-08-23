import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { bootstrap } from '../app.ts';
import { tester } from '@core/constants/tester.constant.ts';

const baseRoute = '/api/v1/analytics';

let token: string;
let cleanupAdmin: () => Promise<void>;

beforeAll(async () => {
    await bootstrap();
    const setup = await tester.setupAdmin();
    token = setup.token;
    cleanupAdmin = setup.cleanup;
});

afterAll(async () => {
    if (cleanupAdmin) await cleanupAdmin();
});

describe('Analytics API Endpoint Suite', () => {
    it('should reject requests without authorization header', async () => {
        const res = await tester.get(`${baseRoute}/revenue-summary`);
        tester.assertUnauthorized(res, 'Unauthenticated');
    });

    it('should successfully fetch revenue summary with defaults for no data', async () => {
        const res = await tester.get(`${baseRoute}/revenue-summary`, token);
        tester.assertFetched(res, 'revenue summary', (data) => {
            expect(data).to.have.property('total_revenue');
            expect(data).to.have.property('total_orders');
        });
    });

    it('should successfully fetch dashboard overview', async () => {
        const res = await tester.get(`${baseRoute}/dashboard-overview`, token);
        tester.assertFetched(res, 'dashboard overview', (data) => {
            expect(data).to.have.property('revenue');
            expect(data).to.have.property('low_stock');
            expect(data).to.have.property('recent_orders');
        });
    });

    it('should reject an invalid date range query', async () => {
        const res = await tester.get(`${baseRoute}/revenue-by-month?from=not-a-date`, token);
        tester.assertValidationError(res);
    });

    it('should successfully fetch top products', async () => {
        const res = await tester.get(`${baseRoute}/top-products?limit=5`, token);
        tester.assertFetched(res, 'top products');
    });

    it('should successfully fetch cancellation and refund rate', async () => {
        const res = await tester.get(`${baseRoute}/cancellation-refund-rate`, token);
        tester.assertFetched(res, 'cancellation and refund rate');
    });

    it('should successfully fetch peak order times', async () => {
        const res = await tester.get(`${baseRoute}/peak-times`, token);
        tester.assertFetched(res, 'peak order times');
    });
});