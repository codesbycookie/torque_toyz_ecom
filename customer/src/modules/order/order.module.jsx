import { createCrud } from "@/core/factory/entity.crud";
import { apiurls } from "@/core/api/api.urls";
import { useOrderStore } from "./order.store";

export const useOrderModule = () => {
  const { orders } = apiurls;
  const store = useOrderStore();
  const { set, update, setCurrent, setQuery } = store;

  const crud = createCrud({
    entity: "Order",
    urls: orders,
    store,
    getRole: () => null,
  });

  const getMine = async (incoming = {}) => {
    const currentQuery = useOrderStore.getState().query;
    const nextQuery = { ...currentQuery, ...incoming };
    setQuery(nextQuery);
    return crud.getMine(nextQuery);
  };

  return {
    get state() {
      return useOrderStore.getState().list;
    },
    get loading() {
      return useOrderStore.getState().loading;
    },
    get pagination() {
      return useOrderStore.getState().pagination;
    },
    get current() {
      return useOrderStore.getState().current;
    },
    setCurrent,
    crud,
    getMine,
    useStore: useOrderStore,
  };
};
