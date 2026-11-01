import { Router } from 'express';
import { optionalAuthMiddleware } from '@core/middlewares/optionalAuth.middleware.ts';
import { getHomeData } from './home.controller.ts';

const router = Router();

export const basePath = '/home';

router.get('/', optionalAuthMiddleware, getHomeData);

export default router;

