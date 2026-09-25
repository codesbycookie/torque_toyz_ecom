import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from './auth.middleware.ts';

export const optionalAuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers?.authorization;
  const bearerToken = authHeader?.split(' ')[1];
  const token = req.cookies?.access_token || bearerToken;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
  } catch (err: any) {
    // Just ignore invalid tokens for optional auth
  }
  
  next();
};
