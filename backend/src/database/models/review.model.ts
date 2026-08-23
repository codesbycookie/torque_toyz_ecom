import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IReview extends Document {
    product: Types.ObjectId;
    user: Types.ObjectId;
    rating: number;
    comment?: string;
    active: boolean;
    deleted: boolean;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface IReviewModel extends Model<IReview> {
    getByProduct(productId: Types.ObjectId | string): Promise<IReview[]>;
    getAverageRating(
        productId: Types.ObjectId | string
    ): Promise<{ average: number; count: number }>;
}

const ReviewSchema = new Schema<IReview, IReviewModel>(
    {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, trim: true },
        active: { type: Boolean, default: true },
        deleted: { type: Boolean, default: false },
        deletedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

// one review per user per product
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });
ReviewSchema.index({ product: 1, createdAt: -1 });

ReviewSchema.statics.getByProduct = async function (
    productId: Types.ObjectId | string
): Promise<IReview[]> {
    return this.find({ product: productId, deleted: false, active: true })
        .sort({ createdAt: -1 })
        .populate("user", "name");
};

// Computed live via aggregation, never stored on Product —
// avoids the rating going stale if a review is edited/deleted.
ReviewSchema.statics.getAverageRating = async function (
    productId: Types.ObjectId | string
): Promise<{ average: number; count: number }> {
    const [result] = await this.aggregate([
        {
            $match: {
                product: new mongoose.Types.ObjectId(productId),
                deleted: false,
                active: true,
            },
        },
        {
            $group: {
                _id: null,
                average: { $avg: "$rating" },
                count: { $sum: 1 },
            },
        },
    ]);

    return result
        ? { average: Math.round(result.average * 10) / 10, count: result.count }
        : { average: 0, count: 0 };
};

export default mongoose.model<IReview, IReviewModel>("Review", ReviewSchema);