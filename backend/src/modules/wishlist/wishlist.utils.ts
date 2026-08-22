import { enhanceDoc } from '@core/constants/enhancedoc.constant.ts';
import WishlistModel, { IWishlist } from '@db/models/wishlist.model.ts';

export const enhanceWishlist = (wishlist: IWishlist) => {
  return enhanceDoc(WishlistModel, wishlist, []);
};