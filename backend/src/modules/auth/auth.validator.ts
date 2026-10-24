import { z } from 'zod';
import { objectId, passwordSchema } from '@core/utils/validator.util.ts';

export const loginSchema = z.object({
  identifier: z.string({error: 'Identifier is required'}).trim().min(3, 'Login ID is too short'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const getCurrentUserSchema = z.object({
  cookies: z.object({
    access_token: z.string().optional(),
  }),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

export const adminResetPasswordSchema = z.object({
  targetId: objectId,
  newPassword: passwordSchema,
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short'),
  email: z.string().trim().email(),
  username: z.string().trim().toLowerCase().min(2, 'Username is too short').optional(),
  phone: z.string().trim().min(10, 'Phone number is too short'),
  password: passwordSchema,
  acceptTerms: z.literal(true, { error: 'You must accept the terms and conditions' }),
});

export const resetPasswordSchema = z.object({
  email: z.string().trim().email(),
  code: z.string().length(6, 'OTP must be 6 digits').optional(),
  newPassword: passwordSchema,
});

