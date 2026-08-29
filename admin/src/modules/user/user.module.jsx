import { toast } from "sonner";
import { useUI } from "@/core/contexts/ui.context";
import { useUserStore } from "./user.store";
import { modals } from "./user.modals";
import { useUserColumns } from "./user.columns";

let DUMMY_USERS = [
  {
    _id: "1",
    login_id: "U-001",
    name: "Ravi Kumar",
    email: "ravi.kumar@example.com",
    phone: "9876543210",
    role: "user",
    address: { door: "12", street: "Anna Nagar Main Rd", city: "Chennai", state: "Tamil Nadu", pincode: 600040 },
    accepted_terms_at: "2025-01-10T09:15:00.000Z",
    active: true,
    deleted: false,
    deletedAt: null,
    createdAt: "2025-01-10T09:00:00.000Z",
    updatedAt: "2025-01-10T09:15:00.000Z",
  },
  {
    _id: "2",
    login_id: "U-002",
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    phone: "9876543211",
    role: "user",
    address: { door: "45", street: "MG Road", city: "Bengaluru", state: "Karnataka", pincode: 560001 },
    accepted_terms_at: "2025-01-12T10:00:00.000Z",
    active: true,
    deleted: false,
    deletedAt: null,
    createdAt: "2025-01-12T09:45:00.000Z",
    updatedAt: "2025-01-12T10:00:00.000Z",
  },
  {
    _id: "3",
    login_id: "U-003",
    name: "Arjun Reddy",
    email: "arjun.reddy@example.com",
    phone: "9876543212",
    role: "user",
    address: { door: "7", street: "Jubilee Hills", city: "Hyderabad", state: "Telangana", pincode: 500033 },
    accepted_terms_at: null,
    active: false,
    deleted: false,
    deletedAt: null,
    createdAt: "2025-01-15T08:30:00.000Z",
    updatedAt: "2025-01-16T11:00:00.000Z",
  },
  {
    _id: "4",
    login_id: "U-004",
    name: "Sneha Iyer",
    email: "sneha.iyer@example.com",
    phone: "9876543213",
    role: "user",
    address: { door: "3", street: "T Nagar", city: "Chennai", state: "Tamil Nadu", pincode: 600017 },
    accepted_terms_at: "2025-01-18T14:20:00.000Z",
    active: true,
    deleted: false,
    deletedAt: null,
    createdAt: "2025-01-18T14:00:00.000Z",
    updatedAt: "2025-01-18T14:20:00.000Z",
  },
  {
    _id: "5",
    login_id: "A-005",
    name: "Karthik Subramanian",
    email: "karthik.s@example.com",
    phone: "9876543214",
    role: "admin",
    address: { door: "21", street: "Indiranagar", city: "Bengaluru", state: "Karnataka", pincode: 560038 },
    accepted_terms_at: "2025-01-20T09:00:00.000Z",
    active: true,
    deleted: true,
    deletedAt: "2025-02-05T10:00:00.000Z",
    createdAt: "2025-01-20T08:50:00.000Z",
    updatedAt: "2025-02-05T10:00:00.000Z",
  },
];

export const useUserModule = (exported) => {
  const { openModal } = useUI();
  const store = useUserStore();
  const {
    set,
    update,
    remove,
    setCurrent,
    setQuery,
    resetQuery,
    setPagination,
  } = store;

  // Load dummy data once (only using store methods)
  if (useUserStore.getState().list.length === 0) {
    set(DUMMY_USERS);
    setPagination({
      page: 1,
      limit: 10,
      total: DUMMY_USERS.length,
      pages: 1,
      hasNext: false,
      hasPrev: false,
    });
  }

  const openView = (user) => {
  setCurrent(user);
  return openModal(modals.view, {
    user,
    exported,
  });
};

  // Soft delete → item stays in list with deleted: true
  const openDelete = (id, name) => {
    return openModal(modals.delete, {
      id,
      name,
      submitFn: (id) => {
        update(id, { deleted: true, active: false });
        toast.success("User deleted successfully");
      },
      exported,
    });
  };
  const openResetPassword = (user) => {
    return openModal(modals.resetPassword, {
      user,
      submitFn: () => {
        // dummy — no password stored/updated in mock data, just simulate success
        toast.success("Password reset successfully");
      },
      exported,
    });
  };

  const openDisable = (id, name, status) => {
    return openModal(modals.disable, {
      id,
      name,
      status,
      submitFn: (id, data) => {
        update(id, data);
        toast.success(
          data?.active ? "User enabled successfully" : "User has been disabled",
        );
      },
      exported,
    });
  };
  // Permanent erase → removes item from list
  const openErase = (id) => {
    return openModal(modals.erase, {
      id,
      submitFn: (id) => {
        remove(id);
        toast.success("User deleted permanently");
      },
      exported,
    });
  };

  // Retrieve a soft-deleted user
  const openRetrieve = (id) => {
    return openModal(modals.retrieve, {
      id,
      submitFn: (id) => {
        update(id, { deleted: false, active: true });
        toast.success("User retrieved successfully");
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
    set,
    update,
    remove,
    setCurrent,
    useUserColumns,
    openDelete,
    openView,
    openResetPassword,
    openDisable,
    openErase,
    openRetrieve,
    fetch,
    reset,
    sortByColumn,
    filters,
    setQuery: (q) => setQuery(q),
    getQuery: () => useUserStore.getState().query,
  };
};
