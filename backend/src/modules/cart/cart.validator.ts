import { z } from "zod";

export const addItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1").default(1),
});

export const updateQuantitySchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().min(0, "Quantity cannot be negative"),
});

export const updateShippingAddressSchema = z.object({
  shipping_address: z.object({
    door: z.string().optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().min(1, "State is required"),
    pincode: z.number().min(100000, "Pincode must be 6 digits").max(999999, "Pincode must be 6 digits"),
  }),
});

export const checkoutCartSchema = z.object({
  payment_method: z.enum(["cod", "online"]),
  shipping_address: z
    .object({
      door: z.string().optional(),
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().min(1, "State is required").optional(),
      pincode: z.number().min(100000, "Pincode must be 6 digits").max(999999, "Pincode must be 6 digits").optional(),
    })
    .optional(),
});
