import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().trim().min(2, 'Product name is too short'),
  description: z.string().trim().optional(),
  images: z.array(z.string().url()).optional(),
  stock: z.number().nonnegative().optional().default(0),
});

export const updateProductSchema = createProductSchema.partial();

export const setProductActiveStatusSchema = z.object({
  active: z.boolean(),
});