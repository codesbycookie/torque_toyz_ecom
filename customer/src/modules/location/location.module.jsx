import { useLocationStore } from "./location.store";
import { createCrud } from "@/core/factory/entity.crud";
import { apiurls } from "@/core/api/api.urls";
import { createEntityQueryActions } from "@/core/utils/entity.util";

export const useLocationModule = () => {
  const { locations } = apiurls;

  const crud = createCrud({
    entity: "Location",
    urls: locations,
    store: useLocationStore.getState(),
    getRole: () => null,
  });

  const { fetch, reset, getQuery } = createEntityQueryActions({
    crud,
    getQuery: () => useLocationStore.getState().query,
    setQuery: (q) => useLocationStore.getState().setQuery(q),
  });

  const list = useLocationStore((s) => s.list);
  const loading = useLocationStore((s) => s.loading);

  const fetchLocations = async (params = {}) => {
    return fetch(params);
  };

  return {
    crud,
    list,
    loading,
    fetchLocations,
    getAll: fetchLocations,
    getOne: (id) => crud.getOne?.(id),
    fetch,
    reset,
    getQuery,
  };
};
