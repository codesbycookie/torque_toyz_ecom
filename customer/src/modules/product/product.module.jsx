import { toast } from "sonner";
import { useProductStore } from "./product.store";
import { createCrud } from "@/core/factory/entity.crud";
import { apiurls } from "@/core/api/api.urls";
import { createEntityQueryActions } from "@/core/utils/entity.util";

export const useProductModule = (exported) => {
  const store = useProductStore();
  const { set, setCurrent, setQuery } = store;
  const { products } = apiurls;

  const crud = createCrud({
    entity: "Product",
    urls: products,
    store,
    getRole: () => null, // public / customer
  });

  // ─── Query helpers ──────────────────────────────────────
  const { fetch, reset, sortByColumn, presets, getQuery } =
    createEntityQueryActions({
      crud,
      getQuery: () => useProductStore.getState().query,
      setQuery,
    });

  // ─── Public actions ─────────────────────────────────────
  const getAll = async (params = {}) => {
    return crud.getAll(params);
  };

  const getOne = async (id) => {
    return crud.getOne(id);
  };

  const getBySlug = async (slug) => {
    try {
      const data = await crud.getBySlug(slug);
      setCurrent(data);
      return data;
    } catch (err) {
      throw err;
    }
  };

  // Convenience for home page (featured / latest)
  const getFeatured = async (limit = 8) => {
    return crud.getAll({ limit, sortBy: "createdAt", order: "desc" });
  };

  return {
    // state
    get state() {
      return useProductStore.getState().list;
    },
    get current() {
      return useProductStore.getState().current;
    },
    get loading() {
      return useProductStore.getState().loading;
    },
    get pagination() {
      return useProductStore.getState().pagination;
    },
    get query() {
      return useProductStore.getState().query;
    },

    // actions
    getAll,
    getOne,
    getBySlug,
    getFeatured,
    fetch,
    reset,
    sortByColumn,
    filters: presets,
    getQuery,
    setCurrent,
    set,
  };
};