import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short'),
  email: z.string().trim().email(),
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
});

export const updateUserSchema = createUserSchema
  .omit({ password: true, role: true })
  .partial();

export const setUserActiveStatusSchema = z.object({
  active: z.boolean(),
});