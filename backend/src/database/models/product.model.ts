import mongoose, { Schema, Document, Types } from "mongoose";
import { Counter } from "./counter.model.ts";
import "./review.model.ts";

export interface IProduct extends Document {
  code: string;
  name: string;
  slug: string;
  category: Types.ObjectId;
  images: string[];
  description?: string;
  weight: number;
  price: number;
  active: boolean;
  deleted: boolean;
  stock: number;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  reviews?: any[];
}

interface IProductModel extends mongoose.Model<IProduct> {
  getProductBySlug(slug: string): Promise<IProduct | null>;
}

const DEFAULT_PRODUCT_IMAGES = [
  "https://placehold.co/600x400?text=Product+1",
  "https://placehold.co/600x400?text=Product+2",
  "https://placehold.co/600x400?text=Product+3",
];

const ProductSchema = new Schema<IProduct>(
  {
    code: { type: String, unique: true },
    name: { type: String, required: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    slug: { type: String, unique: true, trim: true, lowercase: true },
    description: { type: String, trim: true },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    weight: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      default: 0,
    },
    active: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

ProductSchema.path("images").default(() => [...DEFAULT_PRODUCT_IMAGES]);

ProductSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
  match: { deleted: false, active: true },
  options: { sort: { createdAt: -1 } },
});

ProductSchema.statics.findBySlug = function (slug: string) {
  return this.findOne({ slug, deleted: false });
};

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

ProductSchema.pre("save", async function (this: IProduct & mongoose.Document) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { key: "product" },
      { $inc: { value: 1 } },
      { upsert: true, new: true },
    );
    this.code = `P-${String(counter!.value).padStart(3, "0")}`;
  }

  if (this.isNew || this.isModified("name")) {
    const base = slugify(this.name);
    let candidate = base;
    let suffix = 1;
    while (
      await mongoose.models.Product.findOne({
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

export default mongoose.model<IProduct, IProductModel>(
  "Product",
  ProductSchema,
);
