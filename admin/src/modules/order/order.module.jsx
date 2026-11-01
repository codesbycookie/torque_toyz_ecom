import { toast } from "sonner";
import { useUI } from "@/core/contexts/ui.context";
import { useOrderStore } from "./order.store";
import { modals } from "./order.modals";
import { useOrderColumns } from "./order.coulmns";
import { createCrud } from "@/core/factory/entity.crud";
import { apiurls } from "@/core/api/api.urls";
import { apiRequest } from "@/core/api/api.request";
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
    return openModal(modals.view, {
      order,
      exported,
      onOpenChangeStatus: (ord, initialStatus) => openChangeStatus(ord, initialStatus),
      onOpenRefund: (ord) => openRefund(ord),
    });
  };

  const refundOrder = async (orderId, reason = "Refund approved by admin") => {
    try {
      const res = await apiRequest("post", apiurls.payments.refund.url(), {
        data: { orderId, reason },
      });

      const currentOrder = store.list?.find((o) => o._id === orderId) || store.current;
      update(orderId, {
        status: "cancelled",
        payment: { ...(currentOrder?.payment || {}), status: "refunded" },
        status_history: [
          ...(currentOrder?.status_history || []),
          { status: "cancelled", timestamp: new Date().toISOString(), note: reason },
        ],
      });

      if (store.current?._id === orderId) {
        setCurrent({
          ...store.current,
          status: "cancelled",
          payment: { ...(store.current.payment || {}), status: "refunded" },
          status_history: [
            ...(store.current.status_history || []),
            { status: "cancelled", timestamp: new Date().toISOString(), note: reason },
          ],
        });
      }

      toast.success(res?.message || "Refund processed and order marked cancelled");
      return res;
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to process refund");
      throw err;
    }
  };

  const openRefund = (order) => {
    return openModal(modals.refund, {
      order,
      submitFn: (orderId, reason) => refundOrder(orderId, reason),
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

  const openRetrieve = (id) => {
    return openModal(modals.retrieve, {
      id,
      submitFn: (id) => crud.retrieve(id),
      exported,
    });
  };

  const setStatus = async (order, status, trackingUrl) => {
    if (order.status === "cancelled") {
      toast.error("Cannot change status of a cancelled order");
      return;
    }
    if (order.status === status && !trackingUrl) return;

    if (trackingUrl) {
      await crud.updateDeliveryPartnerUrl(order._id, { delivery_partner_url: trackingUrl });
      update(order._id, { delivery_partner_url: trackingUrl });
    }

    if (order.status !== status) {
      await crud.updateStatus(order._id, { status });

      const isPaid = order.payment?.status === "paid";
      if (status === "cancelled" && isPaid) {
        try {
          await apiRequest("post", apiurls.payments.refund.url(), {
            data: { orderId: order._id, reason: "Order cancelled by admin" }
          });
        } catch {
          await crud.updatePaymentStatus(order._id, { status: "refunded" });
        }

        update(order._id, {
          status: "cancelled",
          payment: { ...(order.payment || {}), status: "refunded" },
          status_history: [
            ...(order.status_history || []),
            { status: "cancelled", timestamp: new Date().toISOString() },
          ],
        });
        toast.success(`Order ${order.code} cancelled & payment refunded`);
        return;
      }

      update(order._id, {
        status,
        status_history: [
          ...(order.status_history || []),
          { status, timestamp: new Date().toISOString() },
        ],
      });

      if (status === "cancelled") {
        toast.success(`Order ${order.code} cancelled`);
        return;
      }
    }

    toast.success(`Order ${order.code} updated to ${status}`);
  };

  const openChangeStatus = (order, initialStatus) => {
    if (order.status === "cancelled") {
      toast.error("Cannot change status of a cancelled order");
      return;
    }
    return openModal(modals.changeStatus, {
      order,
      initialStatus,
      submitFn: (order, status, trackingUrl) => setStatus(order, status, trackingUrl),
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
    openRefund,
    refundOrder,
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
