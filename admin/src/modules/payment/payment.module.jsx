import { useUI } from "@/core/contexts/ui.context";
import { usePaymentStore } from "./payment.store";
import { modals } from "./payment.modals";
import { usePaymentColumns } from "./payment.coulmns";

const DUMMY_PAYMENTS = [
  {
    _id: "1",
    order: {
      product: "p1",
      name: "Classic Cotton T-Shirt",
      image: "https://placehold.co/100x100?text=T-Shirt",
      price: 19.99,
      weight: 0.25,
      quantity: 2,
    },
    razorpay_order_id: "order_MXYZ123456",
    razorpay_payment_id: "pay_ABC987654",
    razorpay_signature: "sig_xxx",
    amount: 39.98,
    currency: "INR",
    status: "paid",
    failure_reason: null,
  },
  {
    _id: "2",
    order: {
      product: "p2",
      name: "Ceramic Coffee Mug",
      image: "https://placehold.co/100x100?text=Mug",
      price: 12.5,
      weight: 0.4,
      quantity: 1,
    },
    razorpay_order_id: "order_MXYZ789012",
    razorpay_payment_id: null,
    razorpay_signature: null,
    amount: 12.5,
    currency: "INR",
    status: "created",
    failure_reason: null,
  },
  {
    _id: "3",
    order: {
      product: "p3",
      name: "Wireless Mouse",
      image: "https://placehold.co/100x100?text=Mouse",
      price: 29.99,
      weight: 0.12,
      quantity: 1,
    },
    razorpay_order_id: "order_MXYZ345678",
    razorpay_payment_id: "pay_DEF123456",
    razorpay_signature: "sig_yyy",
    amount: 29.99,
    currency: "INR",
    status: "failed",
    failure_reason: "Payment gateway timeout",
  },
  {
    _id: "4",
    order: {
      product: "p4",
      name: "Leather Wallet",
      image: "https://placehold.co/100x100?text=Wallet",
      price: 45.0,
      weight: 0.15,
      quantity: 1,
    },
    razorpay_order_id: "order_MXYZ901234",
    razorpay_payment_id: "pay_GHI789012",
    razorpay_signature: "sig_zzz",
    amount: 45.0,
    currency: "INR",
    status: "refunded",
    failure_reason: null,
  },
];

export const usePaymentModule = (exported) => {
  const { openModal } = useUI();
  const store = usePaymentStore();
  const {
    set,
    update,
    setCurrent,
    setQuery,
    resetQuery,
    setPagination,
  } = store;

  if (usePaymentStore.getState().list.length === 0) {
    set(DUMMY_PAYMENTS);
    setPagination({
      page: 1,
      limit: 10,
      total: DUMMY_PAYMENTS.length,
      pages: 1,
      hasNext: false,
      hasPrev: false,
    });
  }

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
      submitFn: (id) => { 
        update(id, { status: "refunded", failure_reason: null });
        toast.success("Refund initiated successfully");
      },
      exported,
    });
  };

  const fetch = (params = {}) => {
    if (Object.keys(params).length) setQuery(params);
  };

  const reset = () => {
    resetQuery();
  };

  const sortByColumn = ({ id, desc }) => {
    setQuery({ sortBy: id, order: desc ? "desc" : "asc" });
  };

  const filters = {
    ascending: (field) => setQuery({ sortBy: field, order: "asc" }),
    descending: (field) => setQuery({ sortBy: field, order: "desc" }),
  };

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
    fetch,
    reset,
    sortByColumn,
    filters,
    setQuery: (q) => setQuery(q),
    getQuery: () => usePaymentStore.getState().query,
  };
};