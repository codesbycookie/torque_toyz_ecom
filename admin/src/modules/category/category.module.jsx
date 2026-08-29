import { toast } from "sonner";
import { useUI } from "@/core/contexts/ui.context";
import { useCategoryStore } from "./category.store";
import { modals } from "./category.modals";
import { useCategoryColumns } from "./category.columns";
import { createCrud } from "@/core/factory/entity.crud";
import { apiurls } from "@/core/api/api.urls";
import { createEntityQueryActions } from "@/core/utils/entity.util";

export const useCategoryModule = (exported) => {
  const { openModal } = useUI();
  const store = useCategoryStore();
  const { set, add, update, remove, setCurrent, setQuery } = store;
  const { categories } = apiurls;

  const crud = createCrud({
    entity: "Category",
    urls: categories,
    store: store,
    getRole: () => "super_admin",
  });

  const openView = (category) => {
    setCurrent(category);
    return openModal(modals.view, { category, exported });
  };

  const openCreate = () => {
    return openModal(modals.create, {
      submitFn: (data) => crud.create(data),
      exported,
    });
  };

  const openEdit = (category) => {
    return openModal(modals.edit, {
      category,
      submitFn: (data) => crud.edit(category._id, data),
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

  const openActiveStatus = (id, status) => {
    return openModal(modals.activeStatus, {
      id,
      status,
      submitFn: (id, data) => crud.setActiveStatus(id, data),
      exported,
    });
  };

  // NOTE: your categories api object has no `erase` or `retrieve` endpoints
  // (unlike branches/products). These are stubbed via `edit` for now —
  // add dedicated endpoints if you want true hard-delete / soft-restore.
  const openErase = (id) => {
    return openModal(modals.erase, {
      id,
      submitFn: (id) => crud.delete(id),
      exported,
    });
  };

  const openRetrieve = (id) => {
    return openModal(modals.retrieve, {
      id,
      submitFn: (id) =>
        crud.setActiveStatus(id, { deleted: false, active: true, deletedAt: null }),
      exported,
    });
  };

  const { fetch, reset, sortByColumn, presets, csv, xlsx, pdf, getQuery } =
    createEntityQueryActions({
      crud,
      getQuery: () => useCategoryStore.getState().query,
      setQuery,
    });

  return {
    get state() {
      return useCategoryStore.getState().list;
    },
    get loading() {
      return useCategoryStore.getState().loading;
    },
    get pagination() {
      return useCategoryStore.getState().pagination;
    },
    get current() {
      return useCategoryStore.getState().current;
    },
    set,
    add,
    update,
    remove,
    setCurrent,
    useCategoryColumns,
    openView,
    openCreate,
    openEdit,
    openDelete,
    openErase,
    openRetrieve,
    openActiveStatus,
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