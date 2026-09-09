import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { getNextSequence } from "@core/utils/getsequence.util.ts";

// ── Sub-document interfaces ──────────────────────────────────────────

export interface IOrderItem {
  product: Types.ObjectId;
  name: string;
  image: string;
  price: number;
  weight: number;
  quantity: number;
  
}

export interface IShippingAddress {
  door?: string;
  street?: string;
  city?: string;
  state: Types.ObjectId;
  pincode: number;
}

export interface IPricing {
  subtotal: number;
  total_weight: number;
  shipping_cost: number;
  total: number;
}

export interface IPayment {
  method: "cod" | "online";
  status: "pending" | "paid" | "failed" | "refunded";
  transaction_id?: string;
}

export interface IStatusEntry {
  status: string;
  timestamp: Date;
  note?: string;
}

// ── Main order interface ─────────────────────────────────────────────

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface IOrder extends Document {
  code: string;
  user: Types.ObjectId;
  items: IOrderItem[];
  shipping_address: IShippingAddress;
  pricing: IPricing;
  payment: IPayment;
  status: OrderStatus;
  delivery_partner_url?: string;
  status_history: IStatusEntry[];

  active: boolean;
  deleted: boolean;
  deletedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderModel extends Model<IOrder> {
  getByUser(user_id: Types.ObjectId | string): Promise<IOrder[]>;
  updateStatus(
    order_id: Types.ObjectId | string,
    status: OrderStatus,
    note?: string
  ): Promise<IOrder | null>;
}

// ── Sub-schemas ──────────────────────────────────────────────────────

const OrderItemSchema = new Schema<IOrderItem>(
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

const PaymentSchema = new Schema<IPayment>(
  {
    method: {
      type: String,
      enum: ["cod", "online"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    transaction_id: { type: String },
  },
  { _id: false }
);

const StatusEntrySchema = new Schema<IStatusEntry>(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String },
  },
  { _id: false }
);

// ── Main schema ──────────────────────────────────────────────────────

const OrderSchema = new Schema<IOrder, IOrderModel>(
  {
    code: { type: String, unique: true },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    delivery_partner_url: { type: String, trim: true },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (arr: IOrderItem[]) => arr.length > 0,
        message: "Order must contain at least one item",
      },
    },
    shipping_address: {
      type: ShippingAddressSchema,
      required: true,
    },
    pricing: {
      type: PricingSchema,
      required: true,
    },
    payment: {
      type: PaymentSchema,
      required: true,
    },
    status: {
      type: String,
      enum: ["placed", "confirmed", "shipped", "delivered", "cancelled"],
      default: "placed",
    },
    status_history: {
      type: [StatusEntrySchema],
      default: [],
    },

    active: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// ── Indexes ──────────────────────────────────────────────────────────

OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });

// ── Hooks ────────────────────────────────────────────────────────────

OrderSchema.pre("save", async function (this: IOrder & mongoose.Document) {
  if (!this.isNew) return;

  const next_seq = await getNextSequence("order");
  this.code = `ORD-${String(next_seq).padStart(3, "0")}`;

  // seed status_history with the initial "placed" entry
  if (this.status_history.length === 0) {
    this.status_history.push({
      status: this.status,
      timestamp: new Date(),
    });
  }
});

// ── Statics ──────────────────────────────────────────────────────────

OrderSchema.statics.getByUser = async function (
  user_id: Types.ObjectId | string
): Promise<IOrder[]> {
  return this.find({ user: user_id, deleted: false }).sort({ createdAt: -1 });
};

OrderSchema.statics.updateStatus = async function (
  order_id: Types.ObjectId | string,
  status: OrderStatus,
  note?: string
): Promise<IOrder | null> {
  return this.findOneAndUpdate(
    { _id: order_id, deleted: false },
    {
      $set: { status },
      $push: {
        status_history: {
          status,
          timestamp: new Date(),
          ...(note && { note }),
        },
      },
    },
    { new: true }
  );
};

export default mongoose.model<IOrder, IOrderModel>("Order", OrderSchema);
