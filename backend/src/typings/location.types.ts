import {
    createLocationSchema,
    updateLocationSchema,
    addSlabSchema,
    updateSlabSchema,
} from '@modules/location/location.validator.ts';
import z from 'zod';

export type CreateLocationPayload = z.infer<typeof createLocationSchema>;
export type UpdateLocationPayload = z.infer<typeof updateLocationSchema>;
export type SlabPayload = z.infer<typeof addSlabSchema>;
export type UpdateSlabPayload = z.infer<typeof updateSlabSchema>;