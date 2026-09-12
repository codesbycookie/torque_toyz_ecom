import { useProductStore } from "./product.store";
import { createCrud } from "@/core/factory/entity.crud";
import { apiurls } from "@/core/api/api.urls";
import { createEntityQueryActions } from "@/core/utils/entity.util";

export const useProductModule = (exported) => {
  const store = useProductStore;
  const { products } = apiurls;

  const crud = createCrud({
    entity: "Product",
    urls: products,
    store: useProductStore.getState(), // or pass the store instance if needed
    getRole: () => null,
  });

  // Better: keep a stable reference to the store
  const productStore = useProductStore;

  const { fetch, reset, sortByColumn, presets, getQuery } =
    createEntityQueryActions({
      crud,
      getQuery: () => useProductStore.getState().query,
      setQuery: (q) => useProductStore.getState().setQuery(q),
    });

  const getAll = (params = {}) => crud.getAll(params);
  const getOne = (id) => crud.getOne(id);
  const getBySlug = (slug) => crud.getBySlug(slug);

  const getFeatured = (limit = 8) => {
    return crud.getAll({ limit, sortBy: "createdAt", order: "desc" });
  };

  return {
    // Expose the Zustand store hook so pages can subscribe
    useStore: useProductStore,

    // Actions
    getAll,
    getOne,
    getBySlug,
    getFeatured,
    fetch,
    reset,
    sortByColumn,
    filters: presets,
    getQuery,
  };
};