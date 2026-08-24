import { toast } from "sonner";
import { useUI } from "@/core/contexts/ui.context";
import { useLocationStore } from "./location.store";
import { modals } from "./location.modals";
import { useLocationColumns } from "./location.coulmns";

let DUMMY_LOCATIONS = [
  {
    _id: "1",
    state: "Tamil Nadu",
    code: "TN",
    deliverable: true,
    slabs: [
      { _id: "s1", min: 0, max: 5, rate: 40 },
      { _id: "s2", min: 5, max: 10, rate: 65 },
    ],
  },
  {
    _id: "2",
    state: "Karnataka",
    code: "KA",
    deliverable: true,
    slabs: [{ _id: "s3", min: 0, max: 5, rate: 45 }],
  },
  {
    _id: "3",
    state: "Jammu & Kashmir",
    code: "JK",
    deliverable: false,
    slabs: [{ _id: "s4", min: 0, max: 5, rate: 120 }],
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

export const useLocationModule = (exported) => {
  const { openModal } = useUI();
  const store = useLocationStore();
  const { set, setPagination, setQuery, resetQuery, setCurrent } = store;

  const syncStore = () => {
    const { query } = useLocationStore.getState();
    let list = [...DUMMY_LOCATIONS];

    if (query.sortBy) {
      list = sortList(list, query.sortBy, query.order || "asc");
    }

    const { pageItems, pagination } = paginate(list, query.page || 1, query.limit || 10);
    set(pageItems);
    setPagination(pagination);
  };

  const add = (data) => {
    const newLocation = {
      _id: `dummy-location-${Date.now()}`,
      deliverable: true,
      slabs: [{ _id: `dummy-slab-${Date.now()}`, min: 0, max: 5, rate: 0 }],
      ...data,
    };
    DUMMY_LOCATIONS.push(newLocation);
    syncStore();
  };

  const update = (id, data) => {
    DUMMY_LOCATIONS = DUMMY_LOCATIONS.map((l) => (l._id === id ? { ...l, ...data } : l));
    syncStore();
  };

  const remove = (id) => {
    DUMMY_LOCATIONS = DUMMY_LOCATIONS.filter((l) => l._id !== id);
    syncStore();
  };

  const openCreate = () =>
    openModal(modals.create, {
      submitFn: (data) => {
        add(data);
        toast.success("Location created successfully");
      },
      exported,
    });

  const openEdit = (location) =>
    openModal(modals.edit, {
      location,
      submitFn: (data) => {
        update(location._id, data);
        toast.success("Location updated successfully");
      },
      exported,
    });

  const openDelete = (id, name) =>
    openModal(modals.delete, {
      id,
      name,
      onConfirm: (id) => {
        remove(id);
        toast.success("Location deleted successfully");
      },
      exported,
    });

  const openDeliverableStatus = (id, status) =>
    openModal(modals.deliverableStatus, {
      id,
      status,
      submitFn: (id, data) => {
        update(id, data);
        toast.success(
          data?.deliverable ? "Location is now deliverable" : "Location is now non-deliverable"
        );
      },
      exported,
    });

  const openManageSlabs = (location) =>
    openModal(modals.manageSlabs, {
      location,
      submitFn: (data) => {
        update(location._id, data);
        toast.success("Tariff slabs updated");
      },
      exported,
    });

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
    latest: () => {
      setQuery({ sortBy: "createdAt", order: "desc" });
      syncStore();
    },
    oldest: () => {
      setQuery({ sortBy: "createdAt", order: "asc" });
      syncStore();
    },
    ascending: (field) => {
      setQuery({ sortBy: field, order: "asc" });
      syncStore();
    },
    descending: (field) => {
      setQuery({ sortBy: field, order: "desc" });
      syncStore();
    },
  };

  if (useLocationStore.getState().pagination.total === 0) {
    syncStore();
  }

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
    add,
    update,
    remove,
    setCurrent,
    useLocationColumns,
    openCreate,
    openEdit,
    openDelete,
    openDeliverableStatus,
    openManageSlabs,
    fetch,
    reset,
    sortByColumn,
    filters,
    setQuery: (q) => {
      setQuery(q);
      syncStore();
    },
    getQuery: () => useLocationStore.getState().query,
  };
};