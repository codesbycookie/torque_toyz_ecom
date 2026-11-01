import { z } from "zod";

export const settingSchema = z.object({
  free_delivery: z.preprocess((val) => Boolean(val), z.boolean()),
  low_stock_threshold: z.coerce.number().min(0, { message: "Cannot be negative" }).default(10),
  gst_percentage: z.coerce.number().min(0, { message: "Cannot be negative" }).max(100, { message: "Cannot exceed 100%" }).default(18),
  ecom_announcement_banner: z.preprocess((val) => (typeof val === "string" ? val : ""), z.string()),
});
