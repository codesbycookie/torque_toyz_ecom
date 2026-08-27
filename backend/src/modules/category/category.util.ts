import { enhanceDoc } from '@core/constants/enhancedoc.constant.ts';
import CategoryModel, { ICategory } from '@db/models/category.model.ts';

export const enhanceCategory = (category: ICategory) => {
  return enhanceDoc(CategoryModel, category, []);
};