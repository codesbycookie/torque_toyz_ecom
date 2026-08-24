import { Types } from "mongoose";

const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;
const isObjectIdLike = (value: unknown): value is string =>
  typeof value === 'string' && OBJECT_ID_RE.test(value);

export const castObjectIds = (obj: Record<string, any>): void => {
  for (const [key, value] of Object.entries(obj)) {
    if (isObjectIdLike(value)) {
      obj[key] = new Types.ObjectId(value);
    } else if (value && typeof value === 'object' && '$in' in value && Array.isArray(value.$in)) {
      obj[key] = {
        $in: value.$in.map((id: any) => (isObjectIdLike(id) ? new Types.ObjectId(id) : id)),
      };
    }
  }
};