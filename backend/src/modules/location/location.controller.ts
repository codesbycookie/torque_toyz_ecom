import { Request, Response } from 'express';

import * as service from './location.services.ts';
import { CreateLocationPayload, UpdateLocationPayload } from '@typings/location.types.ts';
import { createStatusControllers } from '@core/constants/createstatuscontroller.constant.ts';
import sendResponse from '@core/constants/responsewrapper.constant.ts';
import { buildQuery } from '@core/constants/querybuilder.constant.ts';
import { wrapControllers } from '@core/constants/wrapcontroller.constant.ts';

const locationStatus = createStatusControllers(
  {
    setActiveStatus: service.setDeliverableStatus,
  },
  'location'
);

const controllers = {
  createLocation: async (req: Request<{}, {}, CreateLocationPayload>, res: Response) => {
    const location = await service.createLocation(req.body);
    return sendResponse.created(res, 'Location', location);
  },

  getAllLocations: async (req: Request, res: Response) => {
    const queries = buildQuery(req);
    const result = await service.getAllLocations(queries, 'admin');
    return sendResponse.paginated(res, 'location', result);
  },

  getLocationById: async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const location = await service.getLocationById(id);
    if (!location) return sendResponse.notFound(res, 'location');
    return sendResponse.fetched(res, 'location', location);
  },

  updateLocation: async (
    req: Request<{ id: string }, {}, UpdateLocationPayload>,
    res: Response
  ) => {
    const { id } = req.params;
    const location = await service.updateLocation(id, req.body);
    if (!location) return sendResponse.notFound(res, 'location');
    return sendResponse.updated(res, 'location', location);
  },

  setDeliverableStatus: locationStatus.setActiveStatus,

  eraseLocation: async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const location = await service.eraseLocation(id);
    if (!location) return sendResponse.notFound(res, 'location');
    return sendResponse.deleted(res, 'location');
  },

  addSlab: async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const location = await service.addSlab(id, req.body);
    if (!location) return sendResponse.notFound(res, 'location');
    return sendResponse.updated(res, 'location', location);
  },

  removeSlab: async (req: Request<{ id: string; slabId: string }>, res: Response) => {
    const { id, slabId } = req.params;
    const location = await service.removeSlab(id, slabId);
    if (!location) return sendResponse.notFound(res, 'location');
    return sendResponse.updated(res, 'location', location);
  },

  updateSlab: async (req: Request<{ id: string; slabId: string }>, res: Response) => {
    const { id, slabId } = req.params;
    const location = await service.updateSlab(id, slabId, req.body);
    if (!location) return sendResponse.notFound(res, 'location');
    return sendResponse.updated(res, 'location', location);
  },

  findRateForWeight: async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const { kgs } = req.query;
    const slab = await service.findRateForWeight(id, Number(kgs));
    if (!slab) return sendResponse.notFound(res, 'tariff slab');
    return sendResponse.fetched(res, 'tariff slab', slab);
  },
};

export const {
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
} = wrapControllers(controllers);