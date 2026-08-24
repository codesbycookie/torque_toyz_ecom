import z from 'zod';
import {
  loginSchema,
  changePasswordSchema,
  adminResetPasswordSchema,
} from '@modules/auth/auth.validator.ts';

export type Role = 'admin' | 'user';

export interface AuthUser {
  id: string;
  role: Role;
}

export type LoginPayload = z.infer<typeof loginSchema>;

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface AdminResetPasswordPayload {
  targetId: string;
  newPassword: string;
}


