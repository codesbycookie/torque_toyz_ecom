import { z } from "zod";

export const settingSchema = z.object({
  free_delivery: z.boolean().default(false),
  low_stock_threshold: z.coerce.number().min(0, { error: "Cannot be negative" }),
  gst_percentage: z.coerce.number().min(0, { error: "Cannot be negative" }).max(100, { error: "Cannot exceed 100%" }),
  maintenance_mode: z.boolean().default(false),
  ecom_announcement_banner: z.string().optional(),
  ecom_sales_notifications_enabled: z.boolean().default(true),
});
