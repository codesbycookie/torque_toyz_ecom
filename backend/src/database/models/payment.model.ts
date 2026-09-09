import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type PaymentStatus = "created" | "paid" | "failed" | "refunded";

export interface IPayment extends Document {
  order: Types.ObjectId;
  razorpay_order_id: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  failure_reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPaymentModel extends Model<IPayment> {
  findByRazorpayOrderId(razorpay_order_id: string): Promise<IPayment | null>;
}

const PaymentSchema = new Schema<IPayment, IPaymentModel>(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    razorpay_order_id: { type: String, required: true, unique: true },
    razorpay_payment_id: { type: String },
    razorpay_signature: { type: String },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["created", "paid", "failed", "refunded"],
      default: "created",
    },
    failure_reason: { type: String },
  },
  { timestamps: true },
);

PaymentSchema.index({ order: 1 });

PaymentSchema.statics.findByRazorpayOrderId = async function (
  razorpay_order_id: string,
): Promise<IPayment | null> {
  return this.findOne({ razorpay_order_id });
};

export default mongoose.model<IPayment, IPaymentModel>(
  "Payment",
  PaymentSchema,
);
