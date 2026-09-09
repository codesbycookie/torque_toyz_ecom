import Category from '@db/models/category.model.ts';
import Product from '@db/models/product.model.ts';
import { dynamicFilter } from '@core/constants/dynamicfilter.constant.ts';
import { Role } from '@typings/auth.types.js';
import { ApiError } from '@core/errors/api.error.ts';
import {  getVisibility } from './category.constant.ts';
import { enhanceCategory } from './category.util.ts';
import { categoryFilterConfig } from './category.filterconfig.ts';
import { CreateCategoryPayload, UpdateCategoryPayload } from '@typings/category.types.ts';

export const createCategory = async (data: CreateCategoryPayload) => {
  const existing = await Category.findOne({ name: data.name });
  if (existing) {
    throw new ApiError(400, 'Category with this name already exists', 'DUPLICATE_CATEGORY');
  }

  const category = new Category(data);
  await category.save();
  return enhanceCategory(category);
};

export const getAllCategories = async (queries: Record<string, unknown>, role?: Role) => {
  return dynamicFilter(Category, categoryFilterConfig, queries, {
    visibility: getVisibility(role),
  });
};

export const getCategoryById = async (id: string) => {
  const category = await Category.findById(id);
  if (!category) return null;
  return enhanceCategory(category);
};

export const getCategoryBySlug = async (slug: string) => {
  const category = await Category.findBySlug(slug);
  if (!category) return null;
  return enhanceCategory(category);
};

export const updateCategory = async (id: string, data: UpdateCategoryPayload) => {
  const category = await Category.findById(id);
  if (!category) return null;

  Object.assign(category, data);
  await category.save(); 
  return enhanceCategory(category);
};

export const setCategoryActiveStatus = async (id: string, active: boolean) => {
  const updated = await Category.findByIdAndUpdate(id, { active }, { new: true });
  if (!updated) return null;
  return enhanceCategory(updated);
};

export const deleteCategory = async (id: string) => {
  const inUse = await Product.exists({ category: id, deleted: false });
  if (inUse) {
    throw new ApiError(409, 'Cannot delete a category that still has products assigned to it');
  }

  const updated = await Category.findByIdAndUpdate(
    id,
    { deleted: true, deletedAt: new Date() },
    { new: true }
  );
  if (!updated) return null;
  return enhanceCategory(updated);
};

export const retrieveCategory = async (id: string) => {
  const updated = await Category.findByIdAndUpdate(
    id,
    { deleted: false, $unset: { deletedAt: 1 } },
    { new: true }
  );
  if (!updated) return null;
  return enhanceCategory(updated);
};

export const eraseCategory = async (id: string) => {
  const inUse = await Product.exists({ category: id, deleted: false });
  if (inUse) {
    throw new ApiError(409, 'Cannot delete a category that still has products assigned to it');
  }

  const erased = await Category.findByIdAndDelete(id);
  if (!erased) return null;
  return enhanceCategory(erased);
};