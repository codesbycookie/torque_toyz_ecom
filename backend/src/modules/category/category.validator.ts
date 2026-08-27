import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().trim().min(2, 'Category name is too short'),
  description: z.string().trim().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const setCategoryActiveStatusSchema = z.object({
  active: z.boolean(),
});