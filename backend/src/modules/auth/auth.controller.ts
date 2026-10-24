import { NextFunction, Request, Response } from 'express';
import sendResponse from '@core/constants/responsewrapper.constant.ts';
import { wrapControllers } from '@core/constants/wrapcontroller.constant.ts';
import * as service from './auth.services.js';
import { log } from '@core/constants/logger.constant.ts';
import { ENVCONFIG } from '@config/env.config.js';
import {
  LoginPayload,
  ChangePasswordPayload,
  AdminResetPasswordPayload,
  RegisterPayload,
} from '@typings/auth.types.js';
import { COOKIE, LOG, ENTITY, ERROR, SHORT_AGE, LONG_AGE } from './auth.constants.js';
import { AccessRequest } from '@core/middlewares/access.middleware.ts';

const IS_PROD = ENVCONFIG.prod;

const cookieOptions = {
  ...COOKIE.OPTIONS,
  secure: IS_PROD,
  sameSite: (IS_PROD ? 'none' : 'lax') as 'none' | 'lax',
};

const controllers = {
  loginUser: async (req: Request<{}, {}, LoginPayload>, res: Response, next: NextFunction) => {
    const { identifier, password, rememberMe } = req.body;

    const result = await service.login(identifier, password);

    if (!result) {
      return sendResponse.notFound(res, ENTITY.USER);
    }

    const { user, token } = result;


    res.cookie(COOKIE.NAME, token, {
      ...cookieOptions,
      maxAge: rememberMe ? LONG_AGE : SHORT_AGE,
    });

    const userObj = user && typeof (user as any).toObject === 'function' ? (user as any).toObject() : { ...user };
    return sendResponse.fetched(res, ENTITY.USER, { ...userObj, token });
  },

  registerUser: async (req: Request<{}, {}, RegisterPayload>, res: Response, next: NextFunction) => {
    const result = await service.register(req.body);

    const { user, token } = result;

    res.cookie(COOKIE.NAME, token, {
      ...cookieOptions,
      maxAge: LONG_AGE,
    });

    const userObj = user && typeof (user as any).toObject === 'function' ? (user as any).toObject() : { ...user };
    return sendResponse.created(res, ENTITY.USER, { ...userObj, token });
  },

  getCurrentUser: async (req: Request, res: Response, next: NextFunction) => {
    const bearer = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : undefined;
    const token = req.cookies?.access_token || bearer;

    if (!token) {
      return sendResponse.unauthorized(res, ERROR.UNAUTHENTICATED);
    }

    const user = await service.getCurrentUser(token);

    if (!user) {
      return sendResponse.unauthorized(res, ERROR.INVALID_TOKEN);
    }


    return sendResponse.fetched(res, ENTITY.USER, user);
  },

  changePassword: async (
    req: AccessRequest<{}, {}, ChangePasswordPayload>,
    res: Response,
    next: NextFunction
  ) => {
    const user = req.user;

    if (!user) return sendResponse.unauthorized(res, ERROR.UNAUTHENTICATED);

    const { currentPassword, newPassword } = req.body;


    const result = await service.changePassword({
      userId: user.id,
      currentPassword,
      newPassword,
    });

    return sendResponse.success(res, result.message);
  },

  adminResetPassword: async (
    req: AccessRequest<{}, {}, AdminResetPasswordPayload>,
    res: Response,
    next: NextFunction
  ) => {
    const admin = req.user;

    if (!admin) return sendResponse.unauthorized(res, ERROR.UNAUTHENTICATED);

    const { targetId, newPassword } = req.body;


    const result = await service.adminResetPassword({
      adminId: admin.id,
      adminRole: admin.role,
      targetId,
      newPassword,
    });


    return sendResponse.success(res, result.message);
  },

  logoutUser: async (req: Request, res: Response, next: NextFunction) => {

    res.clearCookie(COOKIE.NAME, cookieOptions);

    const result = await service.logout();


    return sendResponse.success(res, result.message);
  },

  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    const result = await service.resetPassword(req.body);
    return sendResponse.success(res, result.message);
  },
};

export const {
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  adminResetPassword,
  changePassword,
  resetPassword,
} = wrapControllers(controllers);