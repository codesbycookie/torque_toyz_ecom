import { toast } from "sonner";
import { useUI } from "@/core/contexts/ui.context";
import { useOrderStore } from "./order.store";
import { modals } from "./order.modals";
import { useOrderColumns } from "./order.coulmns";

const DUMMY_ORDERS = [
  {
    _id: "1",
    code: "ORD-001",
    user: "u1",
    customerName: "Arjun Mehta",
    items: [
      {
        product: "p1",
        name: "Classic Cotton T-Shirt",
        image: "https://placehold.co/100x100?text=Item",
        price: 19.99,
        weight: 0.25,
        quantity: 2,
      },
    ],
    shipping_address: {
      door: "12A",
      street: "MG Road",
      city: "Chennai",
      stateName: "Tamil Nadu",
      pincode: 600001,
    },
    pricing: { subtotal: 39.98, total_weight: 0.5, shipping_cost: 40, total: 79.98 },
    payment: { method: "cod", status: "pending" },
    status: "confirmed",
    delivery_partner_url: null,
    status_history: [{ status: "confirmed", timestamp: "2026-08-20T10:00:00Z" }],
    active: true,
    deleted: false,
    createdAt: "2026-08-20T10:00:00Z",
  },
  {
    _id: "2",
    code: "ORD-002",
    user: "u2",
    customerName: "Priya Raman",
    items: [
      {
        product: "p3",
        name: "Wireless Mouse",
        image: "https://placehold.co/100x100?text=Item",
        price: 29.99,
        weight: 0.12,
        quantity: 1,
      },
    ],
    shipping_address: {
      door: "45",
      street: "Brigade Road",
      city: "Bengaluru",
      stateName: "Karnataka",
      pincode: 560001,
    },
    pricing: { subtotal: 29.99, total_weight: 0.12, shipping_cost: 45, total: 74.99 },
    payment: { method: "online", status: "paid", transaction_id: "txn_001" },
    status: "shipped",
    delivery_partner_url: "https://track.delhivery.com/AWB123456789",
    status_history: [
      { status: "confirmed", timestamp: "2026-08-18T09:00:00Z" },
      { status: "shipped", timestamp: "2026-08-18T11:00:00Z" },
    ],
    active: true,
    deleted: false,
    createdAt: "2026-08-18T09:00:00Z",
  },
  {
    _id: "3",
    code: "ORD-003",
    user: "u3",
    customerName: "Karthik Iyer",
    items: [
      {
        product: "p7",
        name: "Bluetooth Earbuds",
        image: "https://placehold.co/100x100?text=Item",
        price: 59.99,
        weight: 0.08,
        quantity: 1,
      },
    ],
    shipping_address: {
      door: "8",
      street: "Residency Road",
      city: "Srinagar",
      stateName: "Jammu & Kashmir",
      pincode: 190001,
    },
    pricing: { subtotal: 59.99, total_weight: 0.08, shipping_cost: 120, total: 179.99 },
    payment: { method: "online", status: "paid", transaction_id: "txn_002" },
    status: "delivered",
    delivery_partner_url: "https://track.bluedart.com/AWB987654321",
    status_history: [
      { status: "confirmed", timestamp: "2026-08-15T09:00:00Z" },
      { status: "shipped", timestamp: "2026-08-16T09:00:00Z" },
      { status: "delivered", timestamp: "2026-08-17T15:00:00Z" },
    ],
    active: true,
    deleted: false,
    createdAt: "2026-08-15T09:00:00Z",
  },
];

export const useOrderModule = (exported) => {
  const { openModal } = useUI();
  const store = useOrderStore();
  const {
    set,
    update,
    setCurrent,
    setQuery,
    resetQuery,
    setPagination,
  } = store;

  // Load dummy data once (only using store methods)
  if (useOrderStore.getState().list.length === 0) {
    set(DUMMY_ORDERS);
    setPagination({
      page: 1,
      limit: 10,
      total: DUMMY_ORDERS.length,
      pages: 1,
      hasNext: false,
      hasPrev: false,
    });
  }

  const openView = (order) => {
    return openModal(modals.view, { order, exported });
  };

  const setStatus = (order, status) => {
    if (order.status === status) return;

    update(order._id, {
      status,
      status_history: [
        ...(order.status_history || []),
        { status, timestamp: new Date().toISOString() },
      ],
    });

    toast.success(`Order ${order.code} marked as ${status}`);
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
    latest: () => setQuery({ sortBy: "createdAt", order: "desc" }),
    oldest: () => setQuery({ sortBy: "createdAt", order: "asc" }),
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
    useOrderColumns,
    openView,
    setStatus,
    fetch,
    reset,
    sortByColumn,
    filters,
    setQuery: (q) => setQuery(q),
    getQuery: () => useOrderStore.getState().query,
  };
};