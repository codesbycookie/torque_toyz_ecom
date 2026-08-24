import { Router } from 'express';
import { zodValidate } from '@core/middlewares/zod.validator.js';
import { sendOtpSchema, verifyOtpSchema } from './otp.validator.js';
import { sendOtp, verifyOtp } from './otp.controller.js';

const router = Router();

// both public — a user requesting an OTP or verifying one isn't logged in yet
router.post('/send', zodValidate(sendOtpSchema, 'body', 'SendOtpSchema'), sendOtp);
router.post('/verify', zodValidate(verifyOtpSchema, 'body', 'VerifyOtpSchema'), verifyOtp);

export default router;