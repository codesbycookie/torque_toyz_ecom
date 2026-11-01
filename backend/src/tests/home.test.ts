import { describe, it, beforeAll, expect } from "vitest";
import { bootstrap } from "../app.ts";
import { tester } from "@core/constants/tester.constant.ts";

const baseRoute = "/api/v1/home";

beforeAll(async () => {
  await bootstrap();
});

describe("Home API Endpoint Suite", () => {
  it("should fetch home page data successfully without authentication", async () => {
    const res = await tester.get(baseRoute);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(typeof res.body.data.announcementBanner).toBe("string");
    expect(Array.isArray(res.body.data.categories)).toBe(true);
    expect(res.body.data.categories.length).toBeGreaterThan(0);
    expect(Array.isArray(res.body.data.products)).toBe(true);
    expect(Array.isArray(res.body.data.featuredPicks)).toBe(true);
    expect(Array.isArray(res.body.data.budgetPicks)).toBe(true);
    expect(Array.isArray(res.body.data.trendingProducts)).toBe(true);
    expect(Array.isArray(res.body.data.bestSellers)).toBe(true);
    expect(Array.isArray(res.body.data.recommendations)).toBe(true);
    expect(res.body.data.recommendations.length).toBeGreaterThan(0);
    expect(res.body.data.recommendations[0]._id).toBeDefined();
    expect(res.body.data.recommendations[0].name).toBeDefined();
    expect(Array.isArray(res.body.data.wishlistIds)).toBe(true);
  });
});
