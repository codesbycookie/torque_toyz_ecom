import { Router } from 'express';
import {
  loginUser,
  registerUser,
  getCurrentUser,
  logoutUser,
  adminResetPassword,
  changePassword,
} from './auth.controller.ts';

import { authMiddleware } from '@core/middlewares/auth.middleware.ts';
import { accessControl } from '@core/middlewares/access.middleware.ts';
import { zodValidate } from '@core/middlewares/zod.validator.ts';

import {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  adminResetPasswordSchema,
} from './auth.validator.ts';

const router = Router();

router.post(
  '/login',
  zodValidate(loginSchema, 'body', 'LoginSchema'),
  loginUser
);

router.post(
  '/register',
  zodValidate(registerSchema, 'body', 'RegisterSchema'),
  registerUser
);

router.get('/me', authMiddleware, getCurrentUser);

router.post('/logout', authMiddleware, logoutUser);

router.use(authMiddleware);
router.use(accessControl);

router.post(
  '/change-password',
  zodValidate(changePasswordSchema, 'body', 'ChangePasswordSchema'),
  changePassword
);

router.post(
  '/admin/reset-password',
  zodValidate(adminResetPasswordSchema, 'body', 'AdminResetPasswordSchema'),
  adminResetPassword
);

export default router;
