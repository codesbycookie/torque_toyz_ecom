import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategoryModel extends Model<ICategory> {
  findBySlug(slug: string): Promise<ICategory | null>;
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const CategorySchema = new Schema<ICategory, ICategoryModel>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, unique: true, trim: true, lowercase: true },
    description: { type: String, trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);


CategorySchema.pre("save", async function () {
  if (this.isNew || this.isModified("name")) {
    const base = slugify(this.name);
    let candidate = base;
    let suffix = 1;
    while (
      await mongoose.models.Category.findOne({
        slug: candidate,
        _id: { $ne: this._id },
      })
    ) {
      suffix++;
      candidate = `${base}-${suffix}`;
    }
    this.slug = candidate;
  }
});

CategorySchema.statics.findBySlug = async function (
  slug: string,
): Promise<ICategory | null> {
  return this.findOne({ slug, active: true });
};

export default mongoose.model<ICategory, ICategoryModel>(
  "Category",
  CategorySchema,
);
