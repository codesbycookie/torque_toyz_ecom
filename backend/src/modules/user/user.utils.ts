import { enhanceDoc } from '@core/constants/enhancedoc.constant.ts';
import UserModel, { IUser } from '@db/models/user.model.ts';
import { ApiError } from '@core/errors/api.error.ts';

export const enhanceUser = async (user: IUser) => {
  const enhanced = await enhanceDoc(UserModel, user, []);
  const obj = enhanced.toObject ? enhanced.toObject() : enhanced;
  delete obj.password;
  return obj;
};

/**
 * Throws 409 if the username is already used by another user.
 * Case-insensitive; pass excludeId when updating an existing user.
 */
export const ensureUsernameAvailable = async (username?: string, excludeId?: string) => {
  if (!username) return;
  const normalized = username.trim().toLowerCase();
  const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const taken = await UserModel.exists({
    username: { $regex: `^${escaped}$`, $options: 'i' },
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  });
  if (taken) throw new ApiError(409, 'Username is already taken');
};
