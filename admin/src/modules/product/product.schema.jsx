import { z } from "zod";

export const productCreateSchema = z.object({
  name: z.string().min(2, { error: "Please enter the product name" }),
  description: z.string().optional(),
  stock: z.coerce.number().min(0, { error: "Stock cannot be negative" }).default(0),
  active: z.boolean().default(true),
});

export const productEditSchema = productCreateSchema.extend({
  active: z.boolean().optional(),
});