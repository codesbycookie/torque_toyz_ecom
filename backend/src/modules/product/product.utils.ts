import { enhanceDoc } from '@core/constants/enhancedoc.constant.ts';
import ProductModel, { IProduct } from '@db/models/product.model.ts';

export const enhanceProduct = async (product: any) => {
  const enhanced = await enhanceDoc(ProductModel, product, []);
  if (enhanced) {
    enhanced.is_in_wishlist = Boolean(product?.is_in_wishlist);
  }
  return enhanced;
};