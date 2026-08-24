import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { bootstrap } from '../app.ts';
import User from '@db/models/user.model.ts';
import { tester } from '@core/constants/tester.constant.ts';
import { generateToken } from '@lib/jwt.ts';

const baseRoute = '/api/v1/auths';

let cleanupAdmin: () => Promise<void>;
let testLoginId: string;
const testPassword = 'Password@123';
let userToken: string;


beforeAll(async () => {
  await bootstrap();

  const setup = await tester.setupAdmin();
  cleanupAdmin = setup.cleanup;

  const timestamp = Date.now();

  const user = new User({
    name: `Auth Test User ${timestamp}`,
    email: `authtest${timestamp}@example.com`,
    phone: '9876543210',
    password: testPassword,
    role: 'user',
  });

  await user.save();

  testLoginId = user.login_id;

  userToken = generateToken({
    id: user._id,
    role: user.role,
  });
});

afterAll(async () => {
  if (cleanupAdmin) await cleanupAdmin();
  await User.findOneAndDelete({ login_id: testLoginId });
});

describe('Auth API Endpoint Suite', () => {


  it('should reject login with wrong password', async () => {
    const res = await tester.post(`${baseRoute}/login`, {
      login_id: testLoginId,
      password: 'WrongPassword',
    });
    tester.assertUnauthorized(res, 'Invalid password');
  });

  it('should reject login for a non-existent login_id', async () => {
    const res = await tester.post(`${baseRoute}/login`, {
      login_id: 'U-999',
      password: testPassword,
    });
    tester.assertUnauthorized(res, 'User not found');
  });

  it('should successfully login with correct credentials', async () => {
    const res = await tester.post(`${baseRoute}/login`, {
      login_id: testLoginId,
      password: testPassword,
    });

    tester.assertFetched(res, 'session');
    userToken = res.body.data.token;
  });

  it('should reject login for an inactive/deleted account', async () => {
    await User.findOneAndUpdate({ login_id: testLoginId }, { active: false });

    const res = await tester.post(`${baseRoute}/login`, {
      login_id: testLoginId,
      password: testPassword,
    });
    tester.assertForbidden(res);

    await User.findOneAndUpdate({ login_id: testLoginId }, { active: true });
  });

it('should reject change-password without authorization', async () => {
  const res = await tester.post(
    `${baseRoute}/change-password`,
    {
      currentPassword: testPassword,
      newPassword: 'NewPassword@123',
    }
  );

  tester.assertUnauthorized(res, 'Unauthenticated');
});

it('should reject change-password with wrong current password', async () => {
  const res = await tester.post(
    `${baseRoute}/change-password`,
    {
      currentPassword: 'WrongOldPassword',
      newPassword: 'NewPassword@123',
    },
    userToken
  );
  console.log(res.data)
  tester.assertUnauthorized(res, 'Unauthenticated');
});

it('should successfully change password with correct current password', async () => {
  const res = await tester.post(
    `${baseRoute}/change-password`,
    {
      currentPassword: testPassword,
      newPassword: 'NewPassword@123',
    },
    userToken
  );

  tester.assertSuccess(res, 'Password changed successfully');
});

it('should successfully login with the new password after change', async () => {
  const res = await tester.post(`${baseRoute}/login`, {
    login_id: testLoginId,
    password: 'NewPassword@123',
  });

  tester.assertFetched(res, 'session');
});
});