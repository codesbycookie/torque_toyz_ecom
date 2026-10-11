import { useCategoryStore } from "./category.store";
import { createCrud } from "@/core/factory/entity.crud";
import { apiurls } from "@/core/api/api.urls";
import { createEntityQueryActions } from "@/core/utils/entity.util";

export const useCategoryModule = () => {
  const { categories } = apiurls;

  const crud = createCrud({
    entity: "Category",
    urls: categories,
    store: useCategoryStore.getState(),
    getRole: () => null,
  });

  const { fetch, reset, getQuery } = createEntityQueryActions({
    crud,
    getQuery: () => useCategoryStore.getState().query,
    setQuery: (q) => useCategoryStore.getState().setQuery(q),
  });

  const list = useCategoryStore((s) => s.list || []);
  const current = useCategoryStore((s) => s.current);
  const loading = useCategoryStore((s) => s.loading || {});
  const query = useCategoryStore((s) => s.query || {});
  const pagination = useCategoryStore((s) => s.pagination || {});

  return {
    crud,
    list,
    current,
    loading,
    query,
    pagination,
    getAll: (params) => fetch(params),
    getOne: (id) => crud.getOne?.(id),
    fetch,
    reset,
    getQuery,
  };
};
