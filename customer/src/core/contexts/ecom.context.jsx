import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from "react";
import { createCrud } from "@/core/factory/entity.crud";
import { apiurls } from "@/core/api/api.urls";
import { useApi } from "./api.context";

const EcomContext = createContext(null);

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
    loading,
    fetchRecommendations,
    getRecommendations: fetchRecommendations,
  };

  return (
    <EcomContext.Provider value={value}>
      {children}
    </EcomContext.Provider>
  );
};
