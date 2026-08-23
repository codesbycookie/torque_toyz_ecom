import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import mongoose from 'mongoose';
import { bootstrap } from '../app.ts';
import User from '@db/models/user.model.ts';
import { tester } from '@core/constants/tester.constant.ts';

const baseRoute = '/api/v1/users';

let token: string;
let cleanupAdmin: () => Promise<void>;
let createdUserId: string;

beforeAll(async () => {
    await bootstrap();
    const setup = await tester.setupAdmin();
    token = setup.token;
    cleanupAdmin = setup.cleanup;
});

afterAll(async () => {
    if (cleanupAdmin) await cleanupAdmin();
    if (createdUserId) await User.findByIdAndDelete(createdUserId);
});

describe('User API Endpoint Suite', () => {
    it('should reject requests without authorization header', async () => {
        const res = await tester.get(baseRoute);
        tester.assertUnauthorized(res, 'Unauthenticated');
    });

    it('should successfully create a user with an auto-generated login_id', async () => {
        const timestamp = Date.now();
        const res = await tester.post(
            baseRoute,
            {
                name: `Test User ${timestamp}`,
                email: `test${timestamp}@example.com`,
                phone: '9876543210',
                password: 'Password@123',
                role: 'user',
            },
            token
        );

        tester.assertCreated(res, 'User', (data) => {
            createdUserId = data._id;
            expect(data.login_id).to.match(/^U-\d{3}$/);
            expect(data.password).to.be.undefined; // must never leak in response
        });
    });

    it('should reject creation with an invalid email', async () => {
        const res = await tester.post(
            baseRoute,
            { name: 'Bad Email', email: 'not-an-email', phone: '9876543210', password: '123456', role: 'user' },
            token
        );
        tester.assertValidationError(res);
    });

    it('should successfully fetch user by id, without password in response', async () => {
        const res = await tester.get(`${baseRoute}/${createdUserId}`, token);
        tester.assertFetched(res, 'user', (data: { password: any; }) => {
            expect(data.password).to.be.undefined;
        });
    });

    it('should successfully update user profile fields', async () => {
        const res = await tester.put(`${baseRoute}/${createdUserId}`, { name: 'Updated Name' }, token);
        tester.assertUpdated(res, 'user', (data) => {
            expect(data.name).to.equal('Updated Name');
        });
    });

    it('should not allow role to be changed via generic update', async () => {
        const res = await tester.put(`${baseRoute}/${createdUserId}`, { role: 'admin' }, token);
        // role isn't in updateUserSchema, so it's stripped, not rejected
        tester.assertUpdated(res, 'user', (data) => {
            expect(data.role).to.equal('user');
        });
    });

    it('should successfully soft delete user', async () => {
        const res = await tester.delete(`${baseRoute}/${createdUserId}`, token);
        tester.assertDeleted(res, 'user');
    });

    it('should successfully retrieve soft deleted user', async () => {
        const res = await tester.put(`${baseRoute}/${createdUserId}/retrieve`, undefined, token);
        tester.assertSuccess(res, 'User retrieved successfully');
    });

    it('should return 404 when requesting a non-existent user', async () => {
        const nonExistentId = new mongoose.Types.ObjectId().toString();
        const res = await tester.get(`${baseRoute}/${nonExistentId}`, token);
        tester.assertNotFound(res, 'user');
    });
});