import mongoose, { Schema, Document, Types } from 'mongoose';
import { Counter } from './counter.model.ts';

export interface IProduct extends Document {
  code: string;
  name: string;
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
      default: 0
    },
    active: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

ProductSchema.path('images').default(() => [...DEFAULT_PRODUCT_IMAGES]);

ProductSchema.pre('save', async function () {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { key: 'product' },
      { $inc: { value: 1 } },
      { upsert: true, new: true }
    );
    this.code = `P-${String(counter!.value).padStart(3, '0')}`;
  }
});

export default mongoose.model<IProduct>('Product', ProductSchema);