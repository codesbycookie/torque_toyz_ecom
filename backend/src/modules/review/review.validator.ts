import { z } from 'zod';

export const createReviewSchema = z.object({
  product: z.string().min(1, 'Product id is required'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().trim().max(1000).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field is required',
});

export const setReviewActiveStatusSchema = z.object({
  active: z.boolean(),
});