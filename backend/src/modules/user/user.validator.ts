import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short'),
  email: z.string().trim().email(),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, 'Username is too short')
    .optional(),
  phone: z.string().trim().min(10, 'Phone number is too short'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'user']),
  address: z
    .object({
      door: z.string().trim().optional(),
      street: z.string().trim().optional(),
      city: z.string().trim().optional(),
      state: z.string().optional(), // location ObjectId
      pincode: z.number().optional(),
    })
    .optional(),
  addresses: z
    .array(
      z.object({
        _id: z.string().optional(),
        label: z.string().trim().optional(),
        name: z.string().trim().optional(),
        phone: z.string().trim().optional(),
        door: z.string().trim().optional(),
        street: z.string().trim().optional(),
        city: z.string().trim().optional(),
        state: z.string().optional(),
        pincode: z.number().optional(),
        is_default: z.boolean().optional(),
      })
    )
    .optional(),
  profile: z.object({ url: z.string().url() }).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  acceptTerms: z.literal(true, { error: 'You must accept the terms and conditions' }),
});

export const updateUserSchema = createUserSchema
  .omit({ password: true, role: true })
  .partial();

export const setUserActiveStatusSchema = z.object({
  active: z.boolean(),
});