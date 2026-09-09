import { enhanceDoc } from '@core/constants/enhancedoc.constant.ts';
import UserModel, { IUser } from '@db/models/user.model.ts';

export const enhanceUser = async (user: IUser) => {
  const enhanced = await enhanceDoc(UserModel, user, []);
  const obj = enhanced.toObject ? enhanced.toObject() : enhanced;
  delete obj.password;
  return obj;
};
