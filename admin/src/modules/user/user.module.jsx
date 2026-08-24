import { toast } from "sonner";
import { useUI } from "@/core/contexts/ui.context";
import { useUserStore } from "./user.store";
import { modals } from "./user.modals";
import { useUserColumns } from "./user.columns";

// Plain dummy data object — no create/edit here, so this list is fixed
// aside from delete() flipping deleted/active flags on an item.
let DUMMY_USERS = [
  {
    _id: "1",
    login_id: "U-001",
    name: "Ravi Kumar",
    email: "ravi.kumar@example.com",
    phone: "9876543210",
    role: "user",
    address: { door: "12", street: "Anna Nagar Main Rd", city: "Chennai", state: "Tamil Nadu", pincode: 600040 },
    active: true,
    deleted: false,
  },
  {
    _id: "2",
    login_id: "U-002",
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    phone: "9876543211",
    role: "user",
    address: { door: "45", street: "MG Road", city: "Bengaluru", state: "Karnataka", pincode: 560001 },
    active: true,
    deleted: false,
  },
  {
    _id: "3",
    login_id: "U-003",
    name: "Arjun Reddy",
    email: "arjun.reddy@example.com",
    phone: "9876543212",
    role: "user",
    address: { door: "7", street: "Jubilee Hills", city: "Hyderabad", state: "Telangana", pincode: 500033 },
    active: false,
    deleted: false,
  },
  {
    _id: "4",
    login_id: "U-004",
    name: "Sneha Iyer",
    email: "sneha.iyer@example.com",
    phone: "9876543213",
    role: "user",
    address: { door: "3", street: "T Nagar", city: "Chennai", state: "Tamil Nadu", pincode: 600017 },
    active: true,
    deleted: false,
  },
  {
    _id: "5",
    login_id: "U-005",
    name: "Karthik Subramanian",
    email: "karthik.s@example.com",
    phone: "9876543214",
    role: "user",
    address: { door: "21", street: "Indiranagar", city: "Bengaluru", state: "Karnataka", pincode: 560038 },
    active: true,
    deleted: false,
  },
];

const sortList = (list, key, order = "asc") =>
  [...list].sort((a, b) => {
    if (a[key] === b[key]) return 0;
    const result = a[key] > b[key] ? 1 : -1;
    return order === "asc" ? result : -result;
  });

const paginate = (list, page, limit) => {
  const total = list.length;
  const pages = Math.max(Math.ceil(total / limit), 1);
  const safePage = Math.min(Math.max(page, 1), pages);
  const start = (safePage - 1) * limit;

  return {
    pageItems: list.slice(start, start + limit),
    pagination: {
      page: safePage,
      limit,
      total,
      pages,
      hasNext: safePage < pages,
      hasPrev: safePage > 1,
    },
  };
};

export const useUserModule = (exported) => {
  const { openModal } = useUI();
  const store = useUserStore();
  const { set, setPagination, setQuery, resetQuery, setCurrent } = store;

  const syncStore = () => {
    const { query } = useUserStore.getState();
    let list = [...DUMMY_USERS];

    if (query.sortBy) {
      list = sortList(list, query.sortBy, query.order || "asc");
    }

    const { pageItems, pagination } = paginate(list, query.page || 1, query.limit || 10);
    set(pageItems);
    setPagination(pagination);
  };

  const update = (id, data) => {
    DUMMY_USERS = DUMMY_USERS.map((u) => (u._id === id ? { ...u, ...data } : u));
    syncStore();
  };

  const openDelete = (id, name) => {
    return openModal(modals.delete, {
      id,
      name,
      onConfirm: (id) => {
        update(id, { deleted: true, active: false });
        toast.success("User deleted successfully");
      },
      exported,
    });
  };

  const fetch = (params = {}) => {
    if (Object.keys(params).length) setQuery(params);
    syncStore();
  };

  const reset = () => {
    resetQuery();
    syncStore();
  };

  const sortByColumn = ({ id, desc }) => {
    setQuery({ sortBy: id, order: desc ? "desc" : "asc" });
    syncStore();
  };

  const filters = {
    ascending: (field) => {
      setQuery({ sortBy: field, order: "asc" });
      syncStore();
    },
    descending: (field) => {
      setQuery({ sortBy: field, order: "desc" });
      syncStore();
    },
  };

  if (useUserStore.getState().pagination.total === 0) {
    syncStore();
  }

  return {
    get state() {
      return useUserStore.getState().list;
    },
    get loading() {
      return useUserStore.getState().loading;
    },
    get pagination() {
      return useUserStore.getState().pagination;
    },
    get current() {
      return useUserStore.getState().current;
    },
    setCurrent,
    useUserColumns,
    openDelete,
    fetch,
    reset,
    sortByColumn,
    filters,
    setQuery: (q) => {
      setQuery(q);
      syncStore();
    },
    getQuery: () => useUserStore.getState().query,
  };
};