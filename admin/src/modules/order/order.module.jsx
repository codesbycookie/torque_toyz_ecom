import { toast } from "sonner";
import { useUI } from "@/core/contexts/ui.context";
import { useOrderStore } from "./order.store";
import { modals } from "./order.modals";
import { useOrderColumns } from "./order.coulmns";
import { createCrud } from "@/core/factory/entity.crud";
import { apiurls } from "@/core/api/api.urls";
import { createEntityQueryActions } from "@/core/utils/entity.util";

export const useOrderModule = (exported) => {
  const { openModal } = useUI();
  const store = useOrderStore();
  const { set, update, setCurrent, setQuery } = store;
  const { orders } = apiurls;

  const crud = createCrud({
    entity: "Order",
    urls: orders,
    store: store,
    getRole: () => "super_admin",
  });

  const openView = (order) => {
    setCurrent(order);
    return openModal(modals.view, { order, exported });
  };

  const openDelete = (id, name) => {
    return openModal(modals.delete, {
      id,
      name,
      submitFn: (id) => crud.delete(id),
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

  // Admin action: change order status. Updates via API then syncs
  // status_history locally.
  const setStatus = (order, status) => {
    if (order.status === status) return;

    return crud.updateStatus(order._id, { status }).then(() => {
      update(order._id, {
        status,
        status_history: [
          ...(order.status_history || []),
          { status, timestamp: new Date().toISOString() },
        ],
      });
      toast.success(`Order ${order.code} marked as ${status}`);
    });
  };

  const openChangeStatus = (order) => {
    return openModal(modals.changeStatus, {
      order,
      submitFn: (order, status) => setStatus(order, status),
      exported,
    });
  };

  const setPaymentStatus = (order, paymentStatus) => {
    return crud.updatePaymentStatus(order._id, { status: paymentStatus }).then(() => {
      update(order._id, {
        payment: { ...order.payment, status: paymentStatus },
      });
      toast.success(`Payment for ${order.code} marked as ${paymentStatus}`);
    });
  };

  const setDeliveryPartnerUrl = (order, url) => {
    return crud.updateDeliveryPartnerUrl(order._id, { delivery_partner_url: url }).then(() => {
      update(order._id, { delivery_partner_url: url });
      toast.success(`Tracking link updated for ${order.code}`);
    });
  };

  const { fetch, reset, sortByColumn, presets, csv, xlsx, pdf, getQuery } =
    createEntityQueryActions({
      crud,
      getQuery: () => useOrderStore.getState().query,
      setQuery,
    });

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
    useOrderColumns,
    openView,
    openDelete,
    openRetrieve,
    openChangeStatus,
    setStatus,
    setPaymentStatus,
    setDeliveryPartnerUrl,
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