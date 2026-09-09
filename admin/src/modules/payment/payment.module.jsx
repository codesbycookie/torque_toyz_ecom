import { toast } from "sonner";
import { useUI } from "@/core/contexts/ui.context";
import { usePaymentStore } from "./payment.store";
import { modals } from "./payment.modals";
import { usePaymentColumns } from "./payment.coulmns";
import { createCrud } from "@/core/factory/entity.crud";
import { apiurls } from "@/core/api/api.urls";
import { createEntityQueryActions } from "@/core/utils/entity.util";

export const usePaymentModule = (exported) => {
  const { openModal } = useUI();
  const store = usePaymentStore();
  const { set, update, setCurrent, setQuery } = store;
  const { payments } = apiurls;

  const crud = createCrud({
    entity: "Payment",
    urls: payments,
    store: store,
    getRole: () => "super_admin",
  });

  const openView = (payment) => {
    setCurrent(payment);
    return openModal(modals.view, {
      payment,
      exported,
    });
  };

  const openRefund = (payment) => {
    setCurrent(payment);
    return openModal(modals.refund, {
      payment,
      submitFn: (id) =>
        crud.refund({ payment: id }).then(() => {
          update(id, { status: "refunded", failure_reason: null });
          toast.success("Refund initiated successfully");
        }),
      exported,
    });
  };

  const { fetch, reset, sortByColumn, presets, csv, xlsx, pdf, getQuery } =
    createEntityQueryActions({
      crud,
      getQuery: () => usePaymentStore.getState().query,
      setQuery,
    });

  return {
    get state() {
      return usePaymentStore.getState().list;
    },
    get loading() {
      return usePaymentStore.getState().loading;
    },
    get pagination() {
      return usePaymentStore.getState().pagination;
    },
    get current() {
      return usePaymentStore.getState().current;
    },
    set,
    setCurrent,
    usePaymentColumns,
    openView,
    openRefund,
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