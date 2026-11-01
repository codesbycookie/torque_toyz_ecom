import Product from '@db/models/product.model.ts';
import Setting from '@db/models/setting.model.ts';
import { dynamicFilter } from '@core/constants/dynamicfilter.constant.ts';
import { CreateProductPayload, UpdateProductPayload } from '@typings/product.types.ts';
import { Role } from '@typings/auth.types.js';
import { UPDATE_OPTIONS, SOFT_DELETE, RETRIEVE, getVisibility } from './product.constants.ts';
import { enhanceProduct } from './product.utils.ts';
import { productFilterConfig } from './product.filterconfig.ts';

export const createProduct = async (data: CreateProductPayload) => {
  const product = await new Product(data).save();
  return enhanceProduct(product);
};

export const getAllProducts = async (queries: Record<string, unknown>, role?: Role) => {
  const rawQuery: Record<string, any> = {};

  if (queries.minPrice !== undefined || queries.maxPrice !== undefined) {
    const priceFilter: Record<string, number> = {};
    if (queries.minPrice !== undefined && queries.minPrice !== '') {
      priceFilter.$gte = Number(queries.minPrice);
    }
    if (queries.maxPrice !== undefined && queries.maxPrice !== '') {
      priceFilter.$lte = Number(queries.maxPrice);
    }
    if (Object.keys(priceFilter).length > 0) {
      rawQuery.price = priceFilter;
    }
  }

  if (queries.inStock === 'true' || queries.inStock === true) {
    rawQuery.stock = { $gt: 0 };
  }

  if (queries.lowStock === 'true' || queries.lowStock === true) {
    const settingVal = await Setting.get('low_stock_threshold');
    const threshold =
      settingVal !== null && settingVal !== undefined && !isNaN(Number(settingVal))
        ? Number(settingVal)
        : 10;
    rawQuery.stock = { $lte: threshold };
  }

  return dynamicFilter(Product, productFilterConfig, queries, {
    visibility: getVisibility(role),
    rawQuery,
    forcePopulate: [
      {
        path: 'reviews',
        match: { deleted: false, active: true },
        options: { sort: { createdAt: -1 } },
      },
    ],
  });
};

export const getProductById = async (id: string) => {
  const product = await Product.findById(id);
  if (!product) return null;
  return enhanceProduct(product);
};

export const getProductBySlug = async(slug: string) => {
  const product = await Product.getProductBySlug(slug);
  if(!product) return null;
  return enhanceProduct(product);
}
export const updateProduct = async (id: string, data: UpdateProductPayload) => {
  if (data.ui?.actual_price !== undefined) {
    data.price = data.ui.actual_price;
  } else if (data.price !== undefined && data.ui) {
    data.ui.actual_price = data.price;
  }
  const updated = await Product.findByIdAndUpdate(id, data, UPDATE_OPTIONS);
  if (!updated) return null;
  return enhanceProduct(updated);
};

export const removeProduct = async (id: string) => {
  const removed = await Product.findByIdAndUpdate(id, SOFT_DELETE, { new: true });
  if (!removed) return null;
  return enhanceProduct(removed);
};

export const retrieveProduct = async (id: string) => {
  const retrieved = await Product.findByIdAndUpdate(id, RETRIEVE, { new: true });
  if (!retrieved) return null;
  return enhanceProduct(retrieved);
};

export const eraseProduct = async (id: string) => {
  const erased = await Product.findByIdAndDelete(id);
  if (!erased) return null;
  return enhanceProduct(erased);
};

export const setProductActiveStatus = async (id: string, active: boolean) => {
  const updated = await Product.findByIdAndUpdate(
    id,
    { active, ...(active ? { deleted: false, deletedAt: null } : {}) },
    { new: true }
  );
  if (!updated) return null;
  return enhanceProduct(updated);
};
