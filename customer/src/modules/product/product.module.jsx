import { useProductStore } from "./product.store";
import { createCrud } from "@/core/factory/entity.crud";
import { apiurls } from "@/core/api/api.urls";
import { createEntityQueryActions } from "@/core/utils/entity.util";
import { apiRequest } from "@/core/api/api.request";

export const useProductModule = () => {
  const { products } = apiurls;

  const crud = createCrud({
    entity: "Product",
    urls: products,
    store: useProductStore.getState(),
    getRole: () => null,
  });

  const { fetch, reset, sortByColumn, presets, getQuery } =
    createEntityQueryActions({
      crud,
      getQuery: () => useProductStore.getState().query,
      setQuery: (q) => useProductStore.getState().setQuery(q),
    });

  // Manual getBySlug — does NOT use crud.getBySlug
  const getBySlug = async (slug) => {
    const base = import.meta.env.VITE_BASE_URL;

    // Try the same pattern as categories
    const url = `${base}/products/slug/${slug}`;

    const res = await apiRequest("get", url);
    const data = res?.data || res;

    useProductStore.getState().setCurrent(data);
    return data;
  };
  const getFeatured = (limit = 8) => {
    return fetch({ limit, sortBy: "createdAt", order: "desc", page: 1 });
  };

  return {
    useStore: useProductStore,

    getAll: (params) => fetch(params),
    getOne: (id) => crud.getOne?.(id),
    getBySlug,
    getFeatured,

    fetch,
    reset,
    sortByColumn,
    filters: presets,
    getQuery,
  };
};
