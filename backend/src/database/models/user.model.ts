import { getNextSequence } from "@core/utils/getsequence.util.ts";
import bcrypt from "bcryptjs";
import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  login_id: string;
  email: string;
  phone: string;
  address?: {
    door?: string;
    street?: string;
    city?: string;
    state?: mongoose.Types.ObjectId;
    pincode?: number;
  };
  password: string;
  role: "admin" | "user";

  active: boolean;
  deleted: boolean;
  deletedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    login_id: { type: String, unique: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: {
      door: {type: String},
      street: {type: String},
      city: {type: String},
      state: { type: Schema.Types.ObjectId, ref: "location" },
      pincode: { type: Number },
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "user"],
      required: true,
    },

    active: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

UserSchema.index({ login_id: 1 });

UserSchema.pre("validate", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

UserSchema.pre("save", async function () {
  if (!this.isNew) return;

  const nextSeq = await getNextSequence("user");

  this.login_id = `${this.role[0].toUpperCase()}-${String(nextSeq).padStart(3, "0")}`;
});

export default mongoose.model<IUser>("User", UserSchema);