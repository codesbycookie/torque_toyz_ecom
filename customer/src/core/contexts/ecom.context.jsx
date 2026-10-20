import React, { createContext, useContext, useState, useMemo, useCallback, useEffect, useRef } from "react";
import { createCrud } from "@/core/factory/entity.crud";
import { apiurls } from "@/core/api/api.urls";
import { useApi } from "./api.context";

const EcomContext = createContext(null);

// Max items to keep in recently viewed
const MAX_RECENTLY_VIEWED = 12;
const STORAGE_KEY = "torque_recently_viewed";

export const useEcom = () => {
  const ctx = useContext(EcomContext);
  if (!ctx) {
    throw new Error("useEcom must be used within an <EcomProvider>");
  }
  return ctx;
};

export const EcomProvider = ({ children }) => {
  const { cart } = useApi();
  const cartItems = cart?.items || [];

  const cartProductIds = useMemo(() => {
    return cartItems
      .map((item) => (typeof item.product === "object" ? item.product?._id : item.product))
      .filter(Boolean);
  }, [cartItems]);

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  // ─── Recently Viewed Products (persisted in localStorage) ───
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage whenever it changes
  const recentlyViewedRef = useRef(recentlyViewed);
  recentlyViewedRef.current = recentlyViewed;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentlyViewed));
    } catch {
      // localStorage full or unavailable – silently ignore
    }
  }, [recentlyViewed]);

  const addRecentlyViewed = useCallback((product) => {
    if (!product?._id) return;
    setRecentlyViewed((prev) => {
      // Remove if already exists, then prepend
      const filtered = prev.filter((p) => p._id !== product._id);
      return [product, ...filtered].slice(0, MAX_RECENTLY_VIEWED);
    });
  }, []);

  // Get recommended products for a specific product (filter out the product itself + cart items)
  const getRecommendedFor = useCallback(
    (productId) => {
      return recommendations.filter(
        (p) => p._id !== productId && !cartProductIds.includes(p._id)
      );
    },
    [recommendations, cartProductIds]
  );

  // Instantiating recommendation CRUD using crudFactory
  const crud = useMemo(
    () => createCrud({ entity: "Recommendation", urls: apiurls.recommendations, store: null }),
    []
  );

  const fetchRecommendations = useCallback(
    async (params = { limit: 20 }) => {
      try {
        setLoading(true);
        const requestParams = {
          limit: 20,
          ...params,
          excludeCartIds: cartProductIds.length ? cartProductIds.join(",") : undefined,
        };

        const res = await crud.get(requestParams, { __options: { toast: false } });
        const items = Array.isArray(res) ? res : res?.data || [];

        // Backend recommendation engine filters cart items before limiting to 20
        setRecommendations(items);
        return items;
      } catch (err) {
        console.error("[ecom.context] Recommendation fetch error:", err);
        setRecommendations([]);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [crud, cartProductIds]
  );

  useEffect(() => {
    fetchRecommendations({ limit: 20 });
  }, [fetchRecommendations]);

  const value = {
    recommendations,
    recentlyViewed,
    loading,
    fetchRecommendations,
    getRecommendations: fetchRecommendations,
    addRecentlyViewed,
    getRecommendedFor,
  };

  return (
    <EcomContext.Provider value={value}>
      {children}
    </EcomContext.Provider>
  );
};
