import { IUserModel } from "@db/models/user.model.ts";



export const generateUniqueUsername = async (
  UserModel: IUserModel,
  seedName?: string
): Promise<string> => {
  const base = seedName
    ? seedName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "")
        .slice(0, 12) || "user"
    : "user";

  let username: string;
  let exists: boolean;

  do {
    const suffix = Math.floor(1000 + Math.random() * 9000); // 4-digit
    username = `${base}${suffix}`;
    exists = !!(await UserModel.exists({ username }));
  } while (exists);

  return username;
};