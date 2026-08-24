import { z } from 'zod';

export const sendOtpSchema = z.object({
  email: z.string().trim().email(),
  purpose: z.enum(['login', 'password_reset', 'phone_verification', 'email_verification']),
});

export const verifyOtpSchema = z.object({
  email: z.string().trim().email(),
  purpose: z.enum(['login', 'password_reset', 'phone_verification', 'email_verification']),
  code: z.string().length(6, 'OTP must be 6 digits'),
});