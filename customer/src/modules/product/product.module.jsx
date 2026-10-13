import { useProductStore } from "./product.store";
import { createCrud } from "@/core/factory/entity.crud";
import { apiurls } from "@/core/api/api.urls";
import { createEntityQueryActions } from "@/core/utils/entity.util";
import { apiRequest } from "@/core/api/api.request";

const getBySlug = async (slug) => {
  const { products } = apiurls;
  const isObjectId = /^[a-f\d]{24}$/i.test(slug);
  const endpoint = isObjectId ? products.getOne : products.getBySlug;
  const url = endpoint.url(slug);

  const res = await apiRequest(endpoint.method, url);
  const data = res?.data || res;

  useProductStore.getState().setCurrent(data);
  return data;
};

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

  const list = useProductStore((s) => s.list || []);
  const current = useProductStore((s) => s.current);
  const loading = useProductStore((s) => s.loading);
  const query = useProductStore((s) => s.query);
  const pagination = useProductStore((s) => s.pagination);

  const getFeatured = (limit = 8) => {
    return fetch({ limit, sortBy: "createdAt", order: "desc", page: 1 });
  };

  return {
    crud,
    list,
    current,
    loading,
    query,
    pagination,
    getAll: (params) => fetch(params),
    getOne: (id) => crud.getOne?.(id),
    getBySlug,
    getProductBySlug: getBySlug,
    getFeatured,
    fetch,
    reset,
    sortByColumn,
    filters: presets,
    getQuery,
    setCurrent: (data) => useProductStore.getState().setCurrent(data),
  };
};
