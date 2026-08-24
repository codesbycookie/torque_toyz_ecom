import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { bootstrap } from '../app.ts';
import User from '@db/models/user.model.ts';
import Otp from '@db/models/otp.model.ts';
import { tester } from '@core/constants/tester.constant.ts';

const baseRoute = '/api/v1/otps';

let testEmail: string;
let cleanupAdmin: () => Promise<void>;

beforeAll(async () => {
  await bootstrap();
  const setup = await tester.setupAdmin();
  cleanupAdmin = setup.cleanup;

  const timestamp = Date.now();
  testEmail = `otptest${timestamp}@example.com`;
  await new User({
    name: `OTP Test User ${timestamp}`,
    email: testEmail,
    phone: '9876543210',
    password: 'Password@123',
    role: 'user',
  }).save();
});

afterAll(async () => {
  if (cleanupAdmin) await cleanupAdmin();
  await User.findOneAndDelete({ email: testEmail });
  await Otp.deleteMany({ identifier: testEmail });
});

describe('OTP API Endpoint Suite', () => {
  it('should reject sending an OTP for an unknown email on login purpose', async () => {
    const res = await tester.post(`${baseRoute}/send`, {
      email: 'no-such-user@example.com',
      purpose: 'login',
    });
    tester.assertNotFound(res, 'No account found with this email');
  });

  it('should reject sending an OTP with an invalid email format', async () => {
    const res = await tester.post(`${baseRoute}/send`, {
      email: 'not-an-email',
      purpose: 'login',
    });
    tester.assertValidationError(res);
  });

  it('should successfully send an OTP for a known email', async () => {
    const res = await tester.post(`${baseRoute}/send`, {
      email: testEmail,
      purpose: 'login',
    });
    tester.assertSuccess(res, 'OTP sent to your email');
  });

  it('should reject verification with a wrong code', async () => {
    const res = await tester.post(`${baseRoute}/verify`, {
      email: testEmail,
      purpose: 'login',
      code: '000000',
    });
    tester.assertBadRequest(res, 'Invalid or expired OTP');
  });

  it('should successfully verify with the correct code', async () => {
    // pull the real code directly from the DB since email sending isn't wired up yet
    const otpDoc = await Otp.findOne({ identifier: testEmail, purpose: 'login', verified: false }).sort({
      createdAt: -1,
    });
    expect(otpDoc).to.exist;

    // re-generate through the static to get a fresh plaintext code, since the stored value is hashed
    const freshCode = await Otp.generate(testEmail, 'login');

    const res = await tester.post(`${baseRoute}/verify`, {
      email: testEmail,
      purpose: 'login',
      code: freshCode,
    });
    tester.assertSuccess(res, 'OTP verified successfully');
  });

  it('should reject reusing an already-verified OTP', async () => {
    const freshCode = await Otp.generate(testEmail, 'login');
    await Otp.verify(testEmail, 'login', freshCode); // consume it directly

    const res = await tester.post(`${baseRoute}/verify`, {
      email: testEmail,
      purpose: 'login',
      code: freshCode,
    });
    tester.assertBadRequest(res, 'Invalid or expired OTP');
  });

  it('should lock out verification after max attempts', async () => {
    const freshCode = await Otp.generate(testEmail, 'phone_verification');

    // 5 wrong attempts to exhaust MAX_ATTEMPTS
    for (let i = 0; i < 5; i++) {
      await tester.post(`${baseRoute}/verify`, {
        email: testEmail,
        purpose: 'phone_verification',
        code: '111111',
      });
    }

    // even the correct code should now fail, since attempts are exhausted
    const res = await tester.post(`${baseRoute}/verify`, {
      email: testEmail,
      purpose: 'phone_verification',
      code: freshCode,
    });
    tester.assertBadRequest(res, 'Invalid or expired OTP');
  });

  it('should allow requesting a new OTP that invalidates the previous unverified one', async () => {
    const firstCode = await Otp.generate(testEmail, 'email_verification');
    const secondCode = await Otp.generate(testEmail, 'email_verification');

    expect(firstCode).to.not.equal(secondCode);

    // old code should no longer verify
    const oldRes = await tester.post(`${baseRoute}/verify`, {
      email: testEmail,
      purpose: 'email_verification',
      code: firstCode,
    });
    tester.assertBadRequest(oldRes, 'Invalid or expired OTP');

    // new code should verify
    const newRes = await tester.post(`${baseRoute}/verify`, {
      email: testEmail,
      purpose: 'email_verification',
      code: secondCode,
    });
    tester.assertSuccess(newRes, 'OTP verified successfully');
  });
});