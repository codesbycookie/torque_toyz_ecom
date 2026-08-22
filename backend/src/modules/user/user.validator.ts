import { z } from 'zod';
import { objectId, passwordSchema } from '@core/utils/validator.util.ts';

export const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email address'),
  phone: z.string().trim().min(10, 'Phone number must be at least 10 characters'),
  password: passwordSchema,
  role: z.enum(['admin', 'user']),
  address: z
    .object({
      door: z.string().trim().optional(),
      street: z.string().trim().optional(),
      city: z.string().trim().optional(),
      state: objectId.optional().nullable(),
      pincode: z.number().int().positive().optional(),
    })
    .optional(),
});

export const updateUserSchema = createUserSchema.partial();

export const setUserActiveStatusSchema = z.object({
  active: z.boolean(),
});
