import { z } from 'zod';

const tariffSlabSchema = z
  .object({
    min: z.number().nonnegative(),
    max: z.number().positive(),
    rate: z.number().nonnegative(),
  })
  .refine((data) => data.max > data.min, {
    message: 'max must be greater than min',
    path: ['max'],
  });

export const createLocationSchema = z.object({
  state: z.string().trim().min(2, 'State name is too short'),
  code: z.string().trim().min(2).max(4),
  deliverable: z.boolean().optional().default(true),
  slabs: z.array(tariffSlabSchema).min(1, 'At least one tariff slab is required'),
});

export const updateLocationSchema = z.object({
  state: z.string().trim().min(2).optional(),
  code: z.string().trim().min(2).max(4).optional(),
});

export const addSlabSchema = tariffSlabSchema;

export const updateSlabSchema = z
  .object({
    min: z.number().nonnegative().optional(),
    max: z.number().positive().optional(),
    rate: z.number().nonnegative().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const setDeliverableStatusSchema = z.object({
  deliverable: z.boolean(),
});

export const findRateForWeightSchema = z.object({
  kgs: z.number().positive(),
});