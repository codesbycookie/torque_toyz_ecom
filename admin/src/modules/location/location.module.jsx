import { toast } from "sonner";
import { useUI } from "@/core/contexts/ui.context";
import { useLocationStore } from "./location.store";
import { modals } from "./location.modals";
import { useLocationColumns } from "./location.coulmns";
import { createCrud } from "@/core/factory/entity.crud";
import { apiurls } from "@/core/api/api.urls";
import { createEntityQueryActions } from "@/core/utils/entity.util";

export const useLocationModule = (exported) => {
  const { openModal } = useUI();
  const store = useLocationStore();
  const { set, add, update, remove, setCurrent, setQuery } = store;
  const { locations } = apiurls;

  const crud = createCrud({
    entity: "Location",
    urls: locations,
    store: store,
    getRole: () => "super_admin",
  });

  const openCreate = () => {
    return openModal(modals.create, {
      submitFn: (data) => crud.create(data),
      exported,
    });
  };

  const openEdit = (location) => {
    return openModal(modals.edit, {
      location,
      submitFn: (data) => crud.edit(location._id, data),
      exported,
    });
  };

  const openDelete = (id, name) => {
    return openModal(modals.delete, {
      id,
      name,
      submitFn: (id) => crud.delete(id),
      exported,
    });
  };

  const openDeliverableStatus = (id, status) => {
    return openModal(modals.deliverableStatus, {
      id,
      status,
      submitFn: (id, data) => crud.setDeliverableStatus(id, data),
      exported,
    });
  };

  // Read-only — no submitFn, nothing is written back.
  const openViewSlabs = (location) => {
    return openModal(modals.viewSlabs, { location, exported });
  };

  const toggleDeliverable = (location) => {
    crud.setDeliverableStatus(location._id, {
      deliverable: !location.deliverable,
    });
  };

  // --- Slab management ---
  // No dedicated slab modals exist yet in `modals`, so these are exposed as
  // direct functions. Wrap them in openModal(...) once you add
  // modals.addSlab / modals.editSlab / modals.deleteSlab.
  const addSlab = (locationId, slabData) => {
    return crud.addSlab(locationId, slabData).then(() => {
      toast.success("Slab added successfully");
    });
  };

  const updateSlab = (locationId, slabId, slabData) => {
    return crud.updateSlab(locationId, slabId, slabData).then(() => {
      toast.success("Slab updated successfully");
    });
  };

  const removeSlab = (locationId, slabId) => {
    return crud.removeSlab(locationId, slabId).then(() => {
      toast.success("Slab removed successfully");
    });
  };

  // Rate lookup — read-only, no store mutation.
  const getRate = (locationId, kgs) => {
    return crud.getRate(locationId, kgs);
  };

  const { fetch, reset, sortByColumn, presets, csv, xlsx, pdf, getQuery } =
    createEntityQueryActions({
      crud,
      getQuery: () => useLocationStore.getState().query,
      setQuery,
    });

  return {
    get state() {
      return useLocationStore.getState().list;
    },
    get loading() {
      return useLocationStore.getState().loading;
    },
    get pagination() {
      return useLocationStore.getState().pagination;
    },
    get current() {
      return useLocationStore.getState().current;
    },
    set,
    add,
    update,
    remove,
    setCurrent,
    useLocationColumns,
    openCreate,
    openEdit,
    openDelete,
    openDeliverableStatus,
    openViewSlabs,
    toggleDeliverable,
    addSlab,
    updateSlab,
    removeSlab,
    getRate,
    crud,
    fetch,
    reset,
    sortByColumn,
    filters: presets,
    csv,
    xlsx,
    pdf,
    getQuery,
  };
};