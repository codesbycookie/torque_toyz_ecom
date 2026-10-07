import { Router } from 'express';
import { getRecommendations } from './recommendation.controller.ts';

const router = Router();

// Public recommendation endpoint serving up to 20 products
router.get('/', getRecommendations);

export default router;
