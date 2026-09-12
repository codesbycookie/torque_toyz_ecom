import { useProductStore } from "./product.store";
import { createCrud } from "@/core/factory/entity.crud";
import { apiurls } from "@/core/api/api.urls";
import { createEntityQueryActions } from "@/core/utils/entity.util";

export const useProductModule = (exported) => {
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

  const getFeatured = (limit = 8) => {
    return fetch({ limit, sortBy: "createdAt", order: "desc", page: 1 });
  };

  return {
    // reactive store access
    useStore: useProductStore,

    // main actions
    getAll: (params) => fetch(params),
    getOne: (id) => crud.getOne(id),
    getBySlug: (slug) => crud.getBySlug(slug),
    getFeatured,

    // query helpers from createEntityQueryActions
    fetch,
    reset,
    sortByColumn,
    filters: presets, // ← contains search, latest, oldest, etc.
    getQuery,
  };
};