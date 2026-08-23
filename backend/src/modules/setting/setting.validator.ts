import { z } from 'zod';

export const updateSettingSchema = z.object({
    value: z.any(),
});

export const bulkUpdateSettingsSchema = z.object({
    settings: z.array(
        z.object({
            key: z.string().min(1),
            value: z.any(),
        })
    ).min(1),
});