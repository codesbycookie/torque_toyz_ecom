import mongoose, { Schema, Document, Model } from "mongoose";
import crypto from "crypto";

export type OtpPurpose =
  | "login"
  | "password_reset"
  | "phone_verification"
  | "email_verification";

export interface IOtp extends Document {
  identifier: string; // phone or email the OTP was sent to
  code: string; // hashed, never stored in plaintext
  purpose: OtpPurpose;
  attempts: number;
  verified: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOtpModel extends Model<IOtp> {
  generate(identifier: string, purpose: OtpPurpose): Promise<string>; // returns plaintext code to send via SMS/email
  verify(
    identifier: string,
    purpose: OtpPurpose,
    code: string,
  ): Promise<boolean>;
}

const MAX_ATTEMPTS = 5;
const EXPIRY_MINUTES = 10;

const hashCode = (code: string) =>
  crypto.createHash("sha256").update(code).digest("hex");

const OtpSchema = new Schema<IOtp, IOtpModel>(
  {
    identifier: { type: String, required: true, trim: true, lowercase: true },
    code: { type: String, required: true },
    purpose: {
      type: String,
      enum: [
        "login",
        "password_reset",
        "phone_verification",
        "email_verification",
      ],
      required: true,
    },
    attempts: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

OtpSchema.index({ identifier: 1, purpose: 1 });
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL — Mongo auto-deletes expired docs

OtpSchema.statics.generate = async function (
  identifier: string,
  purpose: OtpPurpose,
): Promise<string> {
  // invalidate any previous unverified OTPs for the same identifier+purpose
  await this.deleteMany({
    identifier: identifier.toLowerCase(),
    purpose,
    verified: false,
  });

  const code = crypto.randomInt(100000, 999999).toString(); // 6-digit code

  await this.create({
    identifier: identifier.toLowerCase(),
    code: hashCode(code),
    purpose,
    expiresAt: new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000),
  });

  return code; // plaintext — caller sends this via SMS/email, never stored as-is
};

OtpSchema.statics.verify = async function (
  identifier: string,
  purpose: OtpPurpose,
  code: string,
): Promise<boolean> {
  const otp = await this.findOne({
    identifier: identifier.toLowerCase(),
    purpose,
    verified: false,
  }).sort({ createdAt: -1 });

  if (!otp) return false;
  if (otp.expiresAt < new Date()) return false;
  if (otp.attempts >= MAX_ATTEMPTS) return false;

  const isMatch = otp.code === hashCode(code);

  if (!isMatch) {
    otp.attempts += 1;
    await otp.save();
    return false;
  }

  otp.verified = true;
  await otp.save();
  return true;
};

export default mongoose.model<IOtp, IOtpModel>("Otp", OtpSchema);
