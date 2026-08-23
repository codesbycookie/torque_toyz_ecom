import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import mongoose from 'mongoose';
import { bootstrap } from '../app.ts';
import Location from '@db/models/location.model.ts';
import { tester } from '@core/constants/tester.constant.ts';

const baseRoute = '/api/v1/locations';

let token: string;
let cleanupAdmin: () => Promise<void>;

let createdLocationId: string;
let createdSlabId: string;

beforeAll(async () => {
    await bootstrap();
    const setup = await tester.setupAdmin();
    token = setup.token;
    cleanupAdmin = setup.cleanup;
});

afterAll(async () => {
    if (cleanupAdmin) await cleanupAdmin();
    if (createdLocationId) await Location.findByIdAndDelete(createdLocationId);
});

describe('Location API Endpoint Suite', () => {
    it('should allow fetching all locations without auth', async () => {
        const res = await tester.get(baseRoute);
        tester.assertFetched(res, 'location');
    });

    it('should reject creation without authorization header', async () => {
        const res = await tester.post(baseRoute, { state: 'Test', code: 'TS' });
        tester.assertUnauthorized(res, 'Unauthenticated');
    });

    it('should successfully create a location with slabs', async () => {
        const timestamp = Date.now();
        const res = await tester.post(
            baseRoute,
            {
                state: `Test State ${timestamp}`,
                code: `T${timestamp.toString().slice(-3)}`,
                slabs: [{ min: 0, max: 0.5, rate: 30 }],
            },
            token
        );

        tester.assertCreated(res, 'Location', (data) => {
            createdLocationId = data._id;
            createdSlabId = data.slabs[0]._id;
            expect(data.deliverable).to.equal(true);
            expect(data.slabs).to.have.length(1);
        });
    });

    it('should reject creation with no slabs', async () => {
        const res = await tester.post(
            baseRoute,
            { state: 'No Slabs State', code: 'NSX' },
            token
        );
        tester.assertValidationError(res);
    });

    it('should successfully fetch location by id', async () => {
        const res = await tester.get(`${baseRoute}/${createdLocationId}`, token);
        tester.assertFetched(res, 'location');
    });

    it('should successfully return the matching rate for a weight', async () => {
        const res = await tester.get(`${baseRoute}/${createdLocationId}/rate?kgs=0.3`, token);
        tester.assertFetched(res, 'tariff slab', (data: any) => {
            expect(data.rate).to.equal(30);
        });
    });

    it('should return not found for a weight with no matching slab', async () => {
        const res = await tester.get(`${baseRoute}/${createdLocationId}/rate?kgs=99`, token);
        tester.assertNotFound(res, 'tariff slab');
    });

    it('should successfully add a new slab', async () => {
        const res = await tester.post(
            `${baseRoute}/${createdLocationId}/slabs`,
            { min: 0.5, max: 1, rate: 45 },
            token
        );
        tester.assertUpdated(res, 'location', (data) => {
            expect(data.slabs).to.have.length(2);
        });
    });

    it('should successfully update an existing slab rate', async () => {
        const res = await tester.put(
            `${baseRoute}/${createdLocationId}/slabs/${createdSlabId}`,
            { rate: 35 },
            token
        );
        tester.assertUpdated(res, 'location', (data) => {
            const slab = data.slabs.find((s: any) => s._id === createdSlabId);
            expect(slab.rate).to.equal(35);
        });
    });

    it('should successfully toggle deliverable status', async () => {
        const res = await tester.patch(
            `${baseRoute}/${createdLocationId}/deliverable-status`,
            { deliverable: false },
            token
        );
        tester.assertUpdated(res, 'location', (data) => {
            expect(data.deliverable).to.equal(false);
        });
    });

    it('should not return a rate for a non-deliverable location', async () => {
        const res = await tester.get(`${baseRoute}/${createdLocationId}/rate?kgs=0.3`, token);
        tester.assertNotFound(res, 'tariff slab');
    });

    it('should successfully remove a slab', async () => {
        const res = await tester.delete(`${baseRoute}/${createdLocationId}/slabs/${createdSlabId}`, token);
        tester.assertUpdated(res, 'location', (data) => {
            expect(data.slabs).to.have.length(1);
        });
    });

    it('should return 404 when requesting a non-existent location', async () => {
        const nonExistentId = new mongoose.Types.ObjectId().toString();
        const res = await tester.get(`${baseRoute}/${nonExistentId}`, token);
        tester.assertNotFound(res, 'location');
    });
});