import Location from '@db/models/location.model.ts';
import { dynamicFilter } from '@core/constants/dynamicfilter.constant.ts';
import { Role } from '@typings/auth.types.js';
import { UPDATE_OPTIONS, getVisibility } from './location.constants.ts';
import { enhanceLocation } from './location.util.ts';
import { locationFilterConfig } from './location.filterconfig.ts';
import {
  CreateLocationPayload,
  UpdateLocationPayload,
  SlabPayload,
} from '@typings/location.types.ts';

export const createLocation = async (data: CreateLocationPayload) => {
  const location = await new Location(data).save();
  return enhanceLocation(location);
};

export const getAllLocations = async (
  queries: Record<string, unknown>,
  role?: Role
) => {
  return dynamicFilter(Location, locationFilterConfig, queries, {
    visibility: getVisibility(role),
  });
};

export const getLocationById = async (id: string) => {
  const location = await Location.findById(id);
  if (!location) return null;
  return enhanceLocation(location);
};

export const updateLocation = async (id: string, data: UpdateLocationPayload) => {
  const updated = await Location.findByIdAndUpdate(id, data, UPDATE_OPTIONS);
  if (!updated) return null;
  return enhanceLocation(updated);
};

export const setDeliverableStatus = async (id: string, deliverable: boolean) => {
  return Location.findByIdAndUpdate(id, { deliverable }, { new: true });
};

export const eraseLocation = async (id: string) => {
  const erased = await Location.findByIdAndDelete(id);
  if (!erased) return null;
  return enhanceLocation(erased);
};

export const addSlab = async (id: string, slab: SlabPayload) => {
  const updated = await Location.findByIdAndUpdate(
    id,
    { $push: { slabs: slab } },
    { new: true, runValidators: true }
  );
  if (!updated) return null;
  return enhanceLocation(updated);
};

export const removeSlab = async (id: string, slabId: string) => {
  const updated = await Location.findByIdAndUpdate(
    id,
    { $pull: { slabs: { _id: slabId } } },
    { new: true }
  );
  if (!updated) return null;
  return enhanceLocation(updated);
};

export const updateSlab = async (
  id: string,
  slabId: string,
  updates: SlabPayload
) => {
  const updated = await Location.updateSlab(id, slabId, updates);
  if (!updated) return null;
  return enhanceLocation(updated);
};

export const findRateForWeight = async (id: string, kgs: number) => {
  return Location.findRateForWeight(id, kgs);
};