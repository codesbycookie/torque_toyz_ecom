import User from '@db/models/user.model.ts';
import { dynamicFilter } from '@core/constants/dynamicfilter.constant.ts';
import { CreateUserPayload, UpdateUserPayload } from '@typings/user.types.ts';
import { Role } from '@typings/auth.types.js';
import { UPDATE_OPTIONS, SOFT_DELETE, RETRIEVE, getVisibility } from './user.constants.ts';
import { enhanceUser } from './user.utils.ts';
import { userFilterConfig } from './user.filterconfig.ts';

export const createUser = async (data: CreateUserPayload) => {
  const user = await new User(data).save();
  return enhanceUser(user);
};

export const getAllUsers = async (queries: Record<string, unknown>, role?: Role) => {
  return dynamicFilter(User, userFilterConfig, queries, {
    visibility: getVisibility(role),
  });
};

export const getUserById = async (id: string) => {
  const user = await User.findById(id);
  if (!user) return null;
  return enhanceUser(user);
};

export const updateUser = async (id: string, data: UpdateUserPayload) => {
  const updated = await User.findByIdAndUpdate(id, data, UPDATE_OPTIONS);
  if (!updated) return null;
  return enhanceUser(updated);
};

export const removeUser = async (id: string) => {
  const removed = await User.findByIdAndUpdate(id, SOFT_DELETE, { new: true });
  if (!removed) return null;
  return enhanceUser(removed);
};

export const retrieveUser = async (id: string) => {
  const retrieved = await User.findByIdAndUpdate(id, RETRIEVE, { new: true });
  if (!retrieved) return null;
  return enhanceUser(retrieved);
};

export const eraseUser = async (id: string) => {
  const erased = await User.findByIdAndDelete(id);
  if (!erased) return null;
  return enhanceUser(erased);
};

export const setUserActiveStatus = async (id: string, active: boolean) => {
  const updated = await User.findByIdAndUpdate(
    id,
    { active, ...(active ? { deleted: false, deletedAt: null } : {}) },
    { new: true }
  );
  if (!updated) return null;
  return enhanceUser(updated);
};