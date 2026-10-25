import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().trim().min(2, 'Product name is too short'),
  description: z.string().trim().optional(),
  images: z.array(z.string()).max(5, 'Maximum of 5 images allowed').optional(),
  weight: z.number().positive('Weight must be greater than 0'),
  price: z.number().nonnegative().optional().default(0),
  stock: z.number().nonnegative().optional().default(0),
  category: z.string().min(1, 'Category is required'),
  active: z.boolean().optional().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export const setProductActiveStatusSchema = z.object({
  active: z.boolean(),
});