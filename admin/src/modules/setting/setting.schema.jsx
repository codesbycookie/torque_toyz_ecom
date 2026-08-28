import { z } from "zod";

export const settingSchema = z.object({
  site_name: z.string().min(1, { error: "Please enter the site name" }),
  support_email: z.string().email({ error: "Enter a valid email" }),
  low_stock_threshold: z.coerce.number().min(0, { error: "Cannot be negative" }),
  maintenance_mode: z.boolean().default(false),
});