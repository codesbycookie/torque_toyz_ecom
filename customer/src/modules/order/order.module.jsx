import { createCrud } from "@/core/factory/entity.crud";
import { apiurls } from "@/core/api/api.urls";
import { useOrderStore } from "./order.store";

export const useOrderModule = () => {
  const { orders } = apiurls;
  const store = useOrderStore();

  const crud = createCrud({
    entity: "Order",
    urls: orders,
    store,
    getRole: () => null,
  });

  const getMine = async () => {
    try {
      const res = await crud.getMine({ __options: { toast: false } });
      store.set(res || []);
      return res;
    } catch (err) {
      store.set([]);
      throw err;
    }
  };

  const create = async (payload) => {
    return await crud.create(payload, { __options: { toast: true, success: "Order placed successfully" } });
  };
  
  const getOne = async (id) => {
    try {
      const res = await crud.getOne(id, { __options: { toast: false } });
      store.setCurrent(res || null);
      return res;
    } catch (err) {
      store.setCurrent(null);
      throw err;
    }
  };

  return {
    ...crud,
    getMine,
    create,
    getOne,
    useStore: useOrderStore,
  };
};
