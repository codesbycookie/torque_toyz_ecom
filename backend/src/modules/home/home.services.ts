import Product from '@db/models/product.model.ts';
import Category from '@db/models/category.model.ts';
import Wishlist from '@db/models/wishlist.model.ts';
import Setting from '@db/models/setting.model.ts';
import { getRecommendations } from '@modules/recommendation/recommendation.services.ts';

export const getHomePageData = async (userId?: string) => {
  const [categories, products, wishlist, rawBanner, rawRecommendations] =
    await Promise.all([
      Category.find({ deleted: false, active: true })
        .select('name slug description')
        .sort({ createdAt: -1 })
        .lean(),
      Product.find({ deleted: false, active: true })
        .populate('category', 'name slug')
        .populate({
          path: 'reviews',
          match: { deleted: false, active: true },
        })
        .sort({ createdAt: -1 })
        .limit(24)
        .lean(),
      userId ? Wishlist.findOne({ user: userId }).select('products').lean() : null,
      Setting.get('ecom_announcement_banner'),
      getRecommendations({ userId, limit: 12 }),
    ]);

  const wishlistSet = new Set(
    (wishlist?.products || []).map((p: any) => String(p))
  );

  const mapProduct = (p: any) => {
    const raw = p?._doc
      ? { ...p._doc, ...p }
      : p?.toObject
      ? p.toObject()
      : p;
    return {
      ...raw,
      is_in_wishlist: wishlistSet.has(String(raw._id)),
    };
  };

  const mappedProducts = products.map(mapProduct);
  const mappedRecommendations = (rawRecommendations || []).map(mapProduct);

  const featuredPicks = mappedProducts.slice(0, 4);
  const budgetPicks = mappedProducts
    .filter((p: any) => Number(p.price || 0) <= 2500)
    .slice(0, 4);
  const trendingProducts = mappedProducts.slice(0, 12);
  const bestSellers = mappedProducts.slice(4, 12);

  // Clean banner text (remove emojis, fix any ? encoding into ₹)
  const announcementBanner =
    typeof rawBanner === 'string' && rawBanner.trim().length > 0
      ? rawBanner
          .replace(/^[^\w\s\d₹%+-]+/, '')
          .replace(/\?(\d+)/g, '₹$1')
          .trim()
      : 'Special Offer: Free Shipping on prepaid orders above ₹999!';

  return {
    announcementBanner,
    categories,
    products: mappedProducts,
    featuredPicks,
    budgetPicks: budgetPicks.length >= 4 ? budgetPicks : mappedProducts.slice(0, 4),
    trendingProducts,
    bestSellers,
    recommendations: mappedRecommendations,
    wishlistIds: Array.from(wishlistSet),
  };
};
