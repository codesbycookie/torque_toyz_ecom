import { Router } from 'express';
import { authMiddleware } from '@core/middlewares/auth.middleware.js';
import { zodValidate } from '@core/middlewares/zod.validator.js';
import {
  createLocationSchema,
  updateLocationSchema,
  addSlabSchema,
  updateSlabSchema,
  setDeliverableStatusSchema,
} from './location.validator.js';

import {
  createLocation,
  getAllLocations,
  getLocationById,
  updateLocation,
  setDeliverableStatus,
  eraseLocation,
  addSlab,
  removeSlab,
  updateSlab,
  findRateForWeight,
} from './location.controller.js';
import { accessControl } from '@core/middlewares/access.middleware.ts';

const router = Router();


router.get('/', getAllLocations);


router.use(authMiddleware);
router.use(accessControl)

router.post(
  '/',
  zodValidate(createLocationSchema, 'body', 'CreateLocationSchema'),
  createLocation
);


router.get('/:id', getLocationById);

router.get('/:id/rate', findRateForWeight);

router.put(
  '/:id',
  zodValidate(updateLocationSchema, 'body', 'UpdateLocationSchema'),
  updateLocation
);

router.patch(
  '/:id/deliverable-status',
  zodValidate(setDeliverableStatusSchema, 'body', 'SetDeliverableStatusSchema'),
  setDeliverableStatus
);

router.delete('/:id', eraseLocation);

router.post(
  '/:id/slabs',
  zodValidate(addSlabSchema, 'body', 'AddSlabSchema'),
  addSlab
);

router.put(
  '/:id/slabs/:slabId',
  zodValidate(updateSlabSchema, 'body', 'UpdateSlabSchema'),
  updateSlab
);

router.delete('/:id/slabs/:slabId', removeSlab);

export default router;