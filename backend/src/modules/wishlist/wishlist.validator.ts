import { z } from 'zod';

export const addProductToWishlistSchema = z.object({
  product: z.string().min(1, 'Product id is required'),
});