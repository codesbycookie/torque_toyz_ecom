import z from 'zod';
import {
  loginSchema,
  changePasswordSchema,
  adminResetPasswordSchema,
  registerSchema,
} from '@modules/auth/auth.validator.ts';

export type Role = 'admin' | 'user';

export interface AuthUser {
  id: string;
  role: Role;
}

export type LoginPayload = z.infer<typeof loginSchema>;

export type RegisterPayload = z.infer<typeof registerSchema>;

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface AdminResetPasswordPayload {
  targetId: string;
  newPassword: string;
}


