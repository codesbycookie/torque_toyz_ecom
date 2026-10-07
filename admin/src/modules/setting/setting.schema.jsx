import { z } from "zod";

export const settingSchema = z.object({
  site_name: z.string().min(1, { error: "Please enter the site name" }),
  support_email: z.string().email({ error: "Enter a valid email" }),
  low_stock_threshold: z.coerce.number().min(0, { error: "Cannot be negative" }),
  gst_percentage: z.coerce.number().min(0, { error: "Cannot be negative" }).max(100, { error: "Cannot exceed 100%" }),
  maintenance_mode: z.boolean().default(false),
  ecom_announcement_banner: z.string().optional(),
  ecom_sales_notifications_enabled: z.boolean().default(true),
  ecom_must_buy_count: z.coerce.number().min(1, { error: "Must be at least 1" }),
  ecom_recommended_count: z.coerce.number().min(1, { error: "Must be at least 1" }),
});