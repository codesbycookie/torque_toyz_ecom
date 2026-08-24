import { z } from "zod";

export const slabSchema = z
  .object({
    min: z.coerce.number().min(0, { error: "Min must be 0 or greater" }),
    max: z.coerce.number().min(0, { error: "Max must be 0 or greater" }),
    rate: z.coerce.number().min(0, { error: "Rate must be 0 or greater" }),
  })
  .refine((s) => s.max > s.min, {
    error: "Max must be greater than min",
    path: ["max"],
  });

export const locationCreateSchema = z.object({
  state: z.string().min(2, { error: "Please enter the state name" }),
  code: z
    .string()
    .min(2, { error: "Please enter a location code" })
    .transform((v) => v.toUpperCase()),
  deliverable: z.boolean().default(true),
});

export const locationEditSchema = locationCreateSchema.extend({
  deliverable: z.boolean().optional(),
});

export const slabsFormSchema = z.object({
  slabs: z.array(slabSchema).min(1, { error: "At least one tariff slab is required" }),
});