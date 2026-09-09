import { z } from "zod";

export const productCreateSchema = z.object({
  name: z.string().min(2, { error: "Please enter the product name" }),
  description: z.string().optional(),
  images: z
    .array(z.custom((value) => value instanceof File || typeof value === "string"))
    .max(5, { error: "You can upload up to 5 images" })
    .optional(),
  category: z.string().min(1, { error: "Please select a category" }),
  stock: z.coerce.number().min(0, { error: "Stock cannot be negative" }).default(0),
  price: z.coerce.number().min(0, { error: "price cannot be negative" }).default(0),
  weight: z.coerce.number().min(0, { error: "weight cannot be negative" }).default(0),
  active: z.boolean().default(true),
});

export const productEditSchema = productCreateSchema.extend({
  active: z.boolean().optional(),
});

export const productStockSchema = z.object({
  stock: z.coerce.number().min(0, { error: "Stock cannot be negative" }),
});

export const productReviewEditSchema = z.object({
  userName: z.string().min(1, { error: "Name is required" }),
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().min(1, { error: "Comment is required" }),
});