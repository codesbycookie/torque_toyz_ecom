import z from 'zod';

export const loginSchema = z.object({
  loginId: z.string().min(1, 'Login ID is required'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(4, 'New password must be at least 4 characters'),
});

export const adminResetPasswordSchema = z.object({
  targetId: z.string().min(1, 'Target user ID is required'),
  targetRole: z.enum(['junior_admin', 'student', 'teacher', 'staff', 'shop_admin']),
  newPassword: z.string().min(4, 'New password must be at least 4 characters'),
});

export type Role = 'student' | 'teacher' | 'junior_admin' | 'super_admin' | 'staff' | 'shop_admin';

export interface AuthUser {
  id: string;
  branch: string;
  permissions: string[];
  role: Role;
  batches?: string[] | { _id: string }[];
  standard?: string | { _id: string };
}

export type LoginPayload = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type AdminResetPasswordInput = z.infer<typeof adminResetPasswordSchema>;
