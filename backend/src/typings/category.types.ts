import { createCategorySchema, updateCategorySchema } from '@modules/category/category.validator.ts';
import z from 'zod';

export type CreateCategoryPayload = z.infer<typeof createCategorySchema>;
export type UpdateCategoryPayload = z.infer<typeof updateCategorySchema>;