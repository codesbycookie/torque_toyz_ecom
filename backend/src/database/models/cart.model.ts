import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { IShippingAddress, IPricing, IOrderItem } from "./order.model.ts";

export interface ICartItem extends IOrderItem { }

export interface ICart extends Document {
  user?: Types.ObjectId;
  guest_id?: string;
  items: ICartItem[];
  shipping_address?: IShippingAddress;
  pricing: IPricing;

  active: boolean;
  deleted: boolean;
  deletedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export interface ICartModel extends Model<ICart> {
  createCart(data: any): Promise<ICart>;
  updateCart(id: string, data: any): Promise<ICart | null>;
  removeCart(id: string): Promise<ICart | null>;
  clearCart(id: string): Promise<ICart | null>;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    weight: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    door: { type: String },
    street: { type: String },
    city: { type: String },
    state: { type: Schema.Types.ObjectId, ref: "location", required: true },
    pincode: { type: Number, required: true },
  },
  { _id: false }
);

const PricingSchema = new Schema<IPricing>(
  {
    subtotal: { type: Number, required: true, min: 0 },
    total_weight: { type: Number, required: true, min: 0 },
    shipping_cost: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const CartSchema = new Schema<ICart, ICartModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    guest_id: { type: String },
    items: {
      type: [CartItemSchema],
      default: [],
    },
    shipping_address: {
      type: ShippingAddressSchema,
    },
    pricing: {
      type: PricingSchema,
      default: { subtotal: 0, total_weight: 0, shipping_cost: 0, total: 0 },
    },
    active: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

CartSchema.index({ user: 1 });
CartSchema.index({ guest_id: 1 });

CartSchema.statics.createCart = async function (data: any) {
  return new this(data).save();
};

CartSchema.statics.updateCart = async function (id: string, data: any) {
  return this.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

CartSchema.statics.removeCart = async function (id: string) {
  return this.findByIdAndUpdate(
    id,
    { deleted: true, active: false, deletedAt: new Date() },
    { new: true }
  );
};

CartSchema.statics.clearCart = async function (id: string) {
  return this.findByIdAndUpdate(
    id,
    { $set: { items: [], shipping_address: undefined } },
    { new: true }
  );
};

const Cart = mongoose.model<ICart, ICartModel>("Cart", CartSchema);

export default Cart;
