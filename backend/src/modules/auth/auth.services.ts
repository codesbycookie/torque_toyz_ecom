import { Types } from "mongoose";

import User from "@db/models/user.model.ts";

import { generateToken, verifyToken } from "@lib/jwt.ts";
import { ApiError } from "@core/errors/api.error.ts";

import { ROLE, ERROR, SUCCESS } from "./auth.constants.ts";
import { buildPayload } from "./auth.utils.ts";

type Role = (typeof ROLE)[keyof typeof ROLE];

interface DecodedToken {
  id: string;
  login_id?: string;
  role: Role;
  iat?: number;
  exp?: number;
}

interface ReturnedUser {
  _id: Types.ObjectId;
  role: Role;
  [key: string]: any;
}

export const login = async (identifier: string, password?: string) => {

  const normalized = identifier.toLowerCase();
  const user = await User.findOne({
    $or: [
      { login_id: identifier },
      { username: normalized },
      { email: normalized },
    ],
  });

  if (!user) throw new ApiError(404, ERROR.USER_NOT_FOUND);

  if (!user.active) throw new ApiError(403, ERROR.USER_INACTIVE);

  const isMatch = await User.comparePassword(password!, user.password);
  if (!isMatch) throw new ApiError(401, ERROR.INVALID_PASSWORD);

  const role: Role = user.role;
  const payload = buildPayload(user, role, user.login_id);

  return {
    user: {
      ...user.toObject(),
      role,
    },
    token: generateToken(payload),
  };
};

export const adminResetPassword = async (data: {
  adminId: string;
  adminRole: string;
  targetId: string;
  newPassword: string;
}) => {


  const user = await User.findById(data.targetId);
  if (!user) throw new ApiError(404, ERROR.TARGET_NOT_FOUND);

  user.password = data.newPassword;
  await user.save();

  return { message: SUCCESS.PASSWORD_RESET };
};

export const changePassword = async (data: {
  userId: string;
  currentPassword: string;
  newPassword: string;
}) => {

  const user = await User.findById(data.userId);
  if (!user) throw new ApiError(404, ERROR.USER_NOT_FOUND);
  console.log("🔐 CHANGE PASSWORD DEBUG");
  console.log("userId:", data.userId);
  console.log("user found:", !!user);
  console.log("current password:", data.currentPassword);
  console.log("stored hash:", user?.password);
  const isMatch = await User.comparePassword(
    data.currentPassword,
    user.password,
  );
  if (!isMatch) throw new ApiError(401, ERROR.CURRENT_PASSWORD_INVALID);

  user.password = data.newPassword;
  await user.save();

  return { message: SUCCESS.PASSWORD_CHANGED };
};

export const getCurrentUser = async (token: string): Promise<ReturnedUser> => {
  if (!token) throw new ApiError(401, ERROR.TOKEN_MISSING);

  let decoded: DecodedToken;
  try {
    decoded = verifyToken(token) as DecodedToken;
  } catch {
    throw new ApiError(401, ERROR.TOKEN_INVALID);
  }

  const { id, role } = decoded;

  const user = await User.findById(id).select("-password").lean();
  if (!user) throw new ApiError(404, ERROR.USER_NOT_FOUND);

  return {
    ...(user as any),
    _id: (user as any)._id as Types.ObjectId,
    role: (user as any).role || role,
  };
};

export const logout = async () => {
  return { message: SUCCESS.LOGOUT };
};

export const verifyPassword = async (data: {
  userId: string;
  password: string;
}): Promise<{ verified: boolean; message: string }> => {
  const user = await User.findById(data.userId);
  if (!user) throw new ApiError(404, ERROR.USER_NOT_FOUND);

  const match = await User.comparePassword(data.password, user.password);

  return match
    ? { verified: true, message: SUCCESS.VERIFICATION_SUCCESS }
    : { verified: false, message: ERROR.VERIFICATION_FAILED };
};
