import { sendOtpSchema, verifyOtpSchema } from '@modules/otp/otp.validator.ts';
import z from 'zod';

export type SendOtpPayload = z.infer<typeof sendOtpSchema>;
export type VerifyOtpPayload = z.infer<typeof verifyOtpSchema>;