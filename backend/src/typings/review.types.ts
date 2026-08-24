import { createReviewSchema, updateReviewSchema } from '@modules/review/review.validator.ts';
import z from 'zod';

export type CreateReviewPayload = z.infer<typeof createReviewSchema>;
export type UpdateReviewPayload = z.infer<typeof updateReviewSchema>;