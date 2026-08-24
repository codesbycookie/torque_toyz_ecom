import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IWishlist extends Document {
  user: Types.ObjectId;
  products: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IWishlistModel extends Model<IWishlist> {
  getByUser(userId: Types.ObjectId | string): Promise<IWishlist | null>;
  addProduct(
    userId: Types.ObjectId | string,
    productId: Types.ObjectId | string
  ): Promise<IWishlist>;
  removeProduct(
    userId: Types.ObjectId | string,
    productId: Types.ObjectId | string
  ): Promise<IWishlist | null>;
  clear(userId: Types.ObjectId | string): Promise<IWishlist | null>;
}

const WishlistSchema = new Schema<IWishlist, IWishlistModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

WishlistSchema.index({ user: 1 });

WishlistSchema.statics.getByUser = async function (
  userId: Types.ObjectId | string
): Promise<IWishlist | null> {
  return this.findOne({ user: userId });
};

WishlistSchema.statics.addProduct = async function (
  userId: Types.ObjectId | string,
  productId: Types.ObjectId | string
): Promise<IWishlist> {
  return this.findOneAndUpdate(
    { user: userId },
    { $addToSet: { products: productId } },
    { upsert: true, new: true, runValidators: true, context: "query" }
  );
};

WishlistSchema.statics.removeProduct = async function (
  userId: Types.ObjectId | string,
  productId: Types.ObjectId | string
): Promise<IWishlist | null> {
  return this.findOneAndUpdate(
    { user: userId },
    { $pull: { products: productId } },
    { new: true }
  );
};

WishlistSchema.statics.clear = async function (
  userId: Types.ObjectId | string
): Promise<IWishlist | null> {
  return this.findOneAndUpdate(
    { user: userId },
    { $set: { products: [] } },
    { new: true }
  );
};

export default mongoose.model<IWishlist, IWishlistModel>(
  "Wishlist",
  WishlistSchema
);