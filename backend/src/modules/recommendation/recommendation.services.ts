import Product from '@db/models/product.model.ts';
import Order from '@db/models/order.model.ts';
import Wishlist from '@db/models/wishlist.model.ts';
import Cart from '@db/models/cart.model.ts';
import mongoose from 'mongoose';

export interface RecommendationQuery {
  limit?: number;
  productId?: string;
  category?: string;
  userId?: string;
  excludeCartIds?: string[];
}

export const getRecommendations = async (params: RecommendationQuery) => {
  const limit = Math.min(Math.max(Number(params.limit) || 20, 1), 50);
  const { productId, category, userId, excludeCartIds } = params;

  const filter: any = { active: true, deleted: false };
  const excludeIds: string[] = [];

  if (productId && mongoose.isValidObjectId(productId)) {
    excludeIds.push(productId);
  }

  // Exclude explicitly provided cart product IDs
  if (Array.isArray(excludeCartIds)) {
    excludeCartIds.forEach((id) => {
      if (mongoose.isValidObjectId(id)) excludeIds.push(id);
    });
  }

  // Exclude active cart products for logged-in user
  if (userId && mongoose.isValidObjectId(userId)) {
    const userCart = await Cart.findOne({ user: userId, deleted: false, active: true });
    if (userCart?.items?.length) {
      userCart.items.forEach((item: any) => {
        if (item.product) excludeIds.push(item.product.toString());
      });
    }
  }

  // 1. Identify target category if productId or category provided
  let targetCategoryId = category;
  if (productId && mongoose.isValidObjectId(productId)) {
    const targetProduct = await Product.findOne({ _id: productId, deleted: false });
    if (targetProduct && targetProduct.category) {
      targetCategoryId = targetCategoryId || targetProduct.category.toString();
    }
  }

  const recommendations: any[] = [];
  const seenIds = new Set<string>(excludeIds);

  // Helper to append unique items up to target limit
  const appendProducts = (items: any[]) => {
    for (const item of items) {
      const idStr = item._id.toString();
      if (!seenIds.has(idStr)) {
        seenIds.add(idStr);
        recommendations.push(item);
        if (recommendations.length >= limit) break;
      }
    }
  };

  // 2. Target Category Matching (High relevance)
  if (targetCategoryId && mongoose.isValidObjectId(targetCategoryId)) {
    const categoryProducts = await Product.find({
      ...filter,
      category: targetCategoryId,
      _id: { $nin: Array.from(seenIds) },
    })
      .populate('category')
      .sort({ stock: -1, createdAt: -1 })
      .limit(limit);

    appendProducts(categoryProducts);
  }

  // 3. User History / Preference Matching (Personalized)
  if (userId && mongoose.isValidObjectId(userId) && recommendations.length < limit) {
    const userWishlist = await Wishlist.findOne({ user: userId });
    const userOrders = await Order.find({ user: userId }).limit(10);

    const userCatIds = new Set<string>();
    if (userWishlist?.products?.length) {
      const wishedProducts = await Product.find({ _id: { $in: userWishlist.products } });
      wishedProducts.forEach((p) => p.category && userCatIds.add(p.category.toString()));
    }
    userOrders.forEach((o) => {
      o.items?.forEach((item: any) => {
        if (item.product) seenIds.add(item.product.toString());
      });
    });

    if (userCatIds.size > 0) {
      const personalizedProducts = await Product.find({
        ...filter,
        category: { $in: Array.from(userCatIds) },
        _id: { $nin: Array.from(seenIds) },
      })
        .populate('category')
        .sort({ createdAt: -1 })
        .limit(limit - recommendations.length);

      appendProducts(personalizedProducts);
    }
  }

  // 4. Popular & Featured Fallback Top-Up (ensures exactly 20 items returned)
  if (recommendations.length < limit) {
    const fallbackProducts = await Product.find({
      ...filter,
      _id: { $nin: Array.from(seenIds) },
    })
      .populate('category')
      .sort({ stock: -1, createdAt: -1 })
      .limit(limit - recommendations.length);

    appendProducts(fallbackProducts);
  }

  return recommendations;
};
