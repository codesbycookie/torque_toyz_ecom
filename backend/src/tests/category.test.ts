import { describe, it, beforeAll, afterAll, expect } from "vitest";
import mongoose from "mongoose";
import { bootstrap } from "../app.ts";
import Category from "@db/models/category.model.ts";
import Product from "@db/models/product.model.ts";
import { tester } from "@core/constants/tester.constant.ts";

const baseRoute = "/api/v1/categories";

let token: string;
let cleanupAdmin: () => Promise<void>;
let createdCategoryId: string;
let createdCategorySlug: string;
let inUseCategoryId: string;
let linkedProductId: string;

beforeAll(async () => {
  await bootstrap();
  const setup = await tester.setupAdmin();
  token = setup.token;
  cleanupAdmin = setup.cleanup;
});

afterAll(async () => {
  if (cleanupAdmin) await cleanupAdmin();
  if (createdCategoryId) await Category.findByIdAndDelete(createdCategoryId);
  if (linkedProductId) await Product.findByIdAndDelete(linkedProductId);
  if (inUseCategoryId) await Category.findByIdAndDelete(inUseCategoryId);
});

describe("Category API Endpoint Suite", () => {
  it("should allow fetching all categories without auth", async () => {
    const res = await tester.get(baseRoute);
    tester.assertFetched(res, "category");
  });

  it("should reject creation without authorization header", async () => {
    const res = await tester.post(baseRoute, { name: "Test Category" });
    tester.assertUnauthorized(res, "Unauthenticated");
  });

  it("should successfully create a category with an auto-generated slug", async () => {
    const timestamp = Date.now();
    const res = await tester.post(
      baseRoute,
      {
        name: `Waterproof ${timestamp}`,
        description: "Water-resistant products",
      },
      token,
    );

    tester.assertCreated(res, "Category", (data) => {
      createdCategoryId = data._id;
      createdCategorySlug = data.slug;
      expect(data.slug).to.match(/^[a-z0-9-]+$/);
      expect(data.active).to.equal(true);
    });
  });

  it("should reject creation with a name that is too short", async () => {
    const res = await tester.post(baseRoute, { name: "A" }, token);
    tester.assertValidationError(res);
  });

  it("should reject creating a duplicate category name", async () => {
    const category = await Category.findById(createdCategoryId);
    console.log('category testing', category)
    const res = await tester.post(baseRoute, { name: category!.name }, token);
    tester.assertBadRequest(res);
  });

  it("should allow fetching category by id without auth", async () => {
    const res = await tester.get(`${baseRoute}/${createdCategoryId}`);
    tester.assertFetched(res, "category");
  });

  it("should allow fetching category by slug without auth", async () => {
    const res = await tester.get(`${baseRoute}/slug/${createdCategorySlug}`);
    tester.assertFetched(res, "category");
  });

  it("should return 404 for a non-existent slug", async () => {
    const res = await tester.get(`${baseRoute}/slug/does-not-exist-xyz`);
    tester.assertNotFound(res, "category");
  });

  it("should successfully update category name and regenerate slug", async () => {
    const timestamp = Date.now();
    const res = await tester.put(
      `${baseRoute}/${createdCategoryId}`,
      { name: `Updated Waterproof ${timestamp}` },
      token,
    );
    tester.assertUpdated(res, "category", (data) => {
      expect(data.slug).to.not.equal(createdCategorySlug);
      createdCategorySlug = data.slug;
    });
  });

  it("should successfully toggle active status", async () => {
    const res = await tester.patch(
      `${baseRoute}/${createdCategoryId}/active-status`,
      { active: false },
      token,
    );
    tester.assertUpdated(res, "category", (data) => {
      expect(data.active).to.equal(false);
    });
  });

  it("should not return an inactive category in the public listing", async () => {
    const res = await tester.get(baseRoute);
    const found = res.body.data.find((c: any) => c._id === createdCategoryId);
    expect(found).to.be.undefined;
  });

//   it("should still show the inactive category to an admin", async () => {
//     const res = await tester.get(baseRoute, token);
//     const found = res.body.data.find((c: any) => c._id === createdCategoryId);
//     expect(found).to.exist;
//   });

  it("should reject deleting a category that still has products assigned", async () => {
    const timestamp = Date.now();
    const category = await new Category({
      name: `In Use Category ${timestamp}`,
    }).save();
    inUseCategoryId = category._id.toString();

    const product = await new Product({
      name: `Linked Product ${timestamp}`,
      weight: 1,
      price: 100,
      category: category._id,
    }).save();
    linkedProductId = product._id.toString();

    const res = await tester.delete(`${baseRoute}/${inUseCategoryId}`, token);
    tester.assertConflict(
      res,
      "Cannot delete a category that still has products assigned to it",
    );
  });

  it("should successfully delete a category with no linked products", async () => {
    const res = await tester.delete(`${baseRoute}/${createdCategoryId}`, token);
    tester.assertDeleted(res, "category");
    createdCategoryId = "";
  });

  it("should return 404 for a non-existent category id", async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const res = await tester.get(`${baseRoute}/${nonExistentId}`, token);
    tester.assertNotFound(res, "category");
  });
});
