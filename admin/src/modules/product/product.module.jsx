import { toast } from "sonner";
import { useUI } from "@/core/contexts/ui.context";
import { useProductStore } from "./product.store";
import { modals } from "./product.modals";
import { useProductColumns } from "./product.coulmns";
import { createCrud } from "@/core/factory/entity.crud";
import { apiurls } from "@/core/api/api.urls";
import { createEntityQueryActions } from "@/core/utils/entity.util";

export const useProductModule = (exported) => {
  const { openModal } = useUI();
  const store = useProductStore();
  const { set, add, update, remove, setCurrent, setQuery } = store;
  const { products } = apiurls;

  const crud = createCrud({
    entity: "Product",
    urls: products,
    store: store,
    getRole: () => "super_admin",
  });

  const openView = (product) => {
    setCurrent(product);
    return openModal(modals.view, {
      product,
      exported,
    });
  };

  const openCreate = () => {
    return openModal(modals.create, {
      submitFn: (data) => crud.create(data),
      exported,
    });
  };

  const openEdit = (product) => {
    return openModal(modals.edit, {
      product,
      submitFn: (data) => crud.edit(product._id, data),
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

  const openErase = (id) => {
    return openModal(modals.erase, {
      id,
      submitFn: (id) => crud.erase(id),
      exported,
    });
  };

  const openRetrieve = (id) => {
    return openModal(modals.retrieve, {
      id,
      submitFn: (id) => crud.retrieve(id),
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

  const toggleActive = (product) => {
    crud.setActiveStatus(product._id, { active: !product.active });
  };

  // No dedicated stock/review endpoints provided — routed through edit for now.
  const openStockUpdate = (product) => {
    return openModal(modals.stock, {
      product,
      submitFn: (data) => crud.edit(product._id, data),
      exported,
    });
  };

  const openReviews = (product) => {
    return openModal(modals.reviews, {
      product,
      onDeleteReview: (review) => {
        openModal(modals.deleteReview, {
          product,
          review,
          submitFn: () => {
            const nextReviews = (product.reviews || []).filter(
              (r) => r._id !== review._id
            );
            crud.edit(product._id, { reviews: nextReviews }).then(() => {
              toast.success("Review deleted");
            });
          },
          exported,
        });
      },
      exported,
    });
  };

  const { fetch, reset, sortByColumn, presets, csv, xlsx, pdf, getQuery } =
    createEntityQueryActions({
      crud,
      getQuery: () => useProductStore.getState().query,
      setQuery,
    });

  return {
    get state() {
      return useProductStore.getState().list;
    },
    get loading() {
      return useProductStore.getState().loading;
    },
    get pagination() {
      return useProductStore.getState().pagination;
    },
    get current() {
      return useProductStore.getState().current;
    },
    set,
    add,
    update,
    remove,
    setCurrent,
    useProductColumns,
    openView,
    openCreate,
    openEdit,
    openDelete,
    openErase,
    openRetrieve,
    openActiveStatus,
    openReviews,
    openStockUpdate,
    toggleActive,
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