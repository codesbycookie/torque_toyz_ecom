import { Request, Response } from 'express';

import * as service from './otp.services.ts';
import sendResponse from '@core/constants/responsewrapper.constant.ts';
import { wrapControllers } from '@core/constants/wrapcontroller.constant.ts';

const controllers = {
  sendOtp: async (req: Request<{}, {}, { email: string; purpose: any }>, res: Response) => {
  const { email, purpose } = req.body;
  const result = await service.sendOtp(email, purpose);
  return sendResponse.success(res, result.message);
},

verifyOtp: async (req: Request<{}, {}, { email: string; purpose: any; code: string }>, res: Response) => {
  const { email, purpose, code } = req.body;
  const result = await service.verifyOtp(email, purpose, code);
  return sendResponse.success(res, 'OTP verified successfully', result);
},
};

export const { sendOtp, verifyOtp } = wrapControllers(controllers);