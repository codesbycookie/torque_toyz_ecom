import { z } from "zod";

export const categoryCreateSchema = z.object({
  name: z.string().min(2, { error: "Please enter the category name" }),
  description: z.string().optional(),
  active: z.boolean().default(true),
});

export const categoryEditSchema = categoryCreateSchema.extend({
  active: z.boolean().optional(),
});