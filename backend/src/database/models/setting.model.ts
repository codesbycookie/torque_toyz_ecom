import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISetting extends Document {
    key: string; // e.g. "low_stock_threshold", "site_name", "default_product_images"
    value: any; // flexible — string, number, boolean, array, object
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ISettingModel extends Model<ISetting> {
    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<ISetting>;
    getMany(keys: string[]): Promise<Record<string, any>>;
}

const SettingSchema = new Schema<ISetting, ISettingModel>(
    {
        key: { type: String, required: true, unique: true, trim: true },
        value: { type: Schema.Types.Mixed, required: true },
        description: { type: String, trim: true },
    },
    { timestamps: true }
);

SettingSchema.index({ key: 1 });

SettingSchema.statics.get = async function (key: string): Promise<any> {
    const setting = await this.findOne({ key });
    return setting?.value ?? null;
};

SettingSchema.statics.set = async function (key: string, value: any): Promise<ISetting> {
    return this.findOneAndUpdate(
        { key },
        { $set: { value } },
        { upsert: true, new: true, runValidators: true }
    );
};

SettingSchema.statics.getMany = async function (keys: string[]): Promise<Record<string, any>> {
    const settings = await this.find({ key: { $in: keys } });
    const result: Record<string, any> = {};
    settings.forEach((s: ISetting) => {
        result[s.key] = s.value;
    });
    return result;
};

export default mongoose.model<ISetting, ISettingModel>("Setting", SettingSchema);