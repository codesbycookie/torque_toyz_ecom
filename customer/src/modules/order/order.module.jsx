import { createCrud } from "@/core/factory/entity.crud";
import { apiurls } from "@/core/api/api.urls";
import { useOrderStore } from "./order.store";
import { createEntityQueryActions } from "@/core/utils/entity.util";
import { apiRequest } from "@/core/api/api.request";

export const useOrderModule = () => {
  const { orders } = apiurls;

  const crud = createCrud({
    entity: "Order",
    urls: orders,
    store: useOrderStore.getState(),
    getRole: () => null,
  });

  const { fetch, reset, sortByColumn, presets, getQuery } =
    createEntityQueryActions({
      crud,
      getQuery: () => useOrderStore.getState().query,
      setQuery: (q) => useOrderStore.getState().setQuery(q),
    });

  const list = useOrderStore((s) => s.list || []);
  const current = useOrderStore((s) => s.current);
  const loading = useOrderStore((s) => s.loading);
  const query = useOrderStore((s) => s.query);
  const pagination = useOrderStore((s) => s.pagination);

  const getMine = async (incoming = {}) => {
    const currentQuery = useOrderStore.getState().query;
    const nextQuery = { ...currentQuery, ...incoming };
    useOrderStore.getState().setQuery(nextQuery);
    return crud.getMine(nextQuery);
  };

  const getOne = async (id) => {
    const res = await crud.getOne(id, { __options: { toast: false } });
    const data = res?.data || res || null;
    useOrderStore.getState().setCurrent(data);
    return data;
  };

  const cancelOrder = async (id, note = "Cancelled by customer") => {
    try {
      const res = await apiRequest("patch", orders.updateStatus.url(id), {
        data: { status: "cancelled", note },
      });
      const data = res?.data || res;
      if (data) {
        useOrderStore.getState().setCurrent(data);
        // Also update item in list if present
        useOrderStore.getState().update(id, data);
      }
      return data;
    } catch (err) {
      console.error("Failed to cancel order", err);
      throw err;
    }
  };

  return {
    crud,
    list,
    current,
    loading,
    query,
    pagination,
    getMine,
    getOne,
    cancelOrder,
    fetch,
    reset,
    sortByColumn,
    filters: presets,
    getQuery,
    setCurrent: (data) => useOrderStore.getState().setCurrent(data),
  };
};
