import mongoose, { Schema, Document, Types, Model } from "mongoose";

export interface ITariffSlab {
  _id: Types.ObjectId;
  min: number;
  max: number;
  rate: number;
}

export interface ILocation extends Document {
  state: string;
  code: string;
  deliverable: boolean;
  slabs: ITariffSlab[];
  createdAt: Date;
  updatedAt: Date;
}

export type SlabUpdate = Partial<Pick<ITariffSlab, "min" | "max" | "rate">>;

export interface ILocationModel extends Model<ILocation> {
  findRateForWeight(
    locationId: Types.ObjectId | string,
    kgs: number,
  ): Promise<ITariffSlab | null>;
  updateSlab(
    locationId: Types.ObjectId | string,
    slabId: Types.ObjectId | string,
    updates: SlabUpdate,
  ): Promise<ILocation | null>;
}

const TariffSlabSchema = new Schema<ITariffSlab>(
  {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    rate: { type: Number, required: true },
  },
  { _id: true },
);

const LocationSchema = new Schema<ILocation, ILocationModel>(
  {
    state: { type: String, required: true, trim: true },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    deliverable: { type: Boolean, default: true },
    slabs: {
      type: [TariffSlabSchema],
      required: true,
      validate: {
        validator: (arr: ITariffSlab[]) => arr.length > 0,
        message: "At least one tariff slab is required",
      },
    },
  },
  { timestamps: true },
);


LocationSchema.statics.findRateForWeight = async function (
  locationId: Types.ObjectId | string,
  kgs: number,
): Promise<ITariffSlab | null> {
  const location = await this.findOne({ _id: locationId, deliverable: true });
  if (!location) return null;

  const slab = location.slabs.find(
    (s: ITariffSlab) => kgs > s.min && kgs <= s.max,
  );
  return slab ?? null;
};

LocationSchema.statics.updateSlab = async function (
  locationId: Types.ObjectId | string,
  slabId: Types.ObjectId | string,
  updates: SlabUpdate,
): Promise<ILocation | null> {
  const setPayload: Record<string, number> = {};
  if (updates.min !== undefined) setPayload["slabs.$.min"] = updates.min;
  if (updates.max !== undefined) setPayload["slabs.$.max"] = updates.max;
  if (updates.rate !== undefined) setPayload["slabs.$.rate"] = updates.rate;

  if (Object.keys(setPayload).length === 0) {
    throw new Error("No fields provided to update");
  }

  return this.findOneAndUpdate(
    { _id: locationId, "slabs._id": slabId },
    { $set: setPayload },
    { new: true },
  );
};

export default mongoose.model<ILocation, ILocationModel>(
  "location",
  LocationSchema,
);
