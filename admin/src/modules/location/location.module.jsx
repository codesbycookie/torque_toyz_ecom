import { toast } from "sonner";
import { useUI } from "@/core/contexts/ui.context";
import { useLocationStore } from "./location.store";
import { modals } from "./location.modals";
import { useLocationColumns } from "./location.coulmns";

const DUMMY_LOCATIONS = [
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

export const useLocationModule = (exported) => {
  const { openModal } = useUI();
  const store = useLocationStore();
  const {
    set,
    add,
    update,
    remove,
    setCurrent,
    setQuery,
    resetQuery,
    setPagination,
  } = store;

  // Load dummy data once (only using store methods)
  if (useLocationStore.getState().list.length === 0) {
    set(DUMMY_LOCATIONS);
    setPagination({
      page: 1,
      limit: 10,
      total: DUMMY_LOCATIONS.length,
      pages: 1,
      hasNext: false,
      hasPrev: false,
    });
  }

  const openCreate = () => {
    return openModal(modals.create, {
      submitFn: (data) => {
        const newLocation = {
          _id: `dummy-${Date.now()}`,
          ...data,
          slabs: (data.slabs || []).map((s, i) => ({
            _id: `dummy-slab-${Date.now()}-${i}`,
            ...s,
          })),
        };
        add(newLocation);
        toast.success("Location created successfully");
      },
      exported,
    });
  };

  const openEdit = (location) => {
    return openModal(modals.edit, {
      location,
      submitFn: (data) => {
        const existingSlabs = location?.slabs || [];
        update(location._id, {
          ...data,
          slabs: (data.slabs || []).map((s, i) => ({
            _id: existingSlabs[i]?._id || `dummy-slab-${Date.now()}-${i}`,
            ...s,
          })),
        });
        toast.success("Location updated successfully");
      },
      exported,
    });
  };

  const openDelete = (id, name) => {
    return openModal(modals.delete, {
      id,
      name,
      submitFn: (id) => {
        remove(id);
        toast.success("Location deleted successfully");
      },
      exported,
    });
  };

  const openDeliverableStatus = (id, status) => {
    return openModal(modals.deliverableStatus, {
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
  };

  // Read-only — no submitFn, nothing is written back.
  const openViewSlabs = (location) => {
    return openModal(modals.viewSlabs, { location, exported });
  };

  const toggleDeliverable = (location) => {
    update(location._id, { deliverable: !location.deliverable });
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
    ascending: (field) => setQuery({ sortBy: field, order: "asc" }),
    descending: (field) => setQuery({ sortBy: field, order: "desc" }),
  };

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
    set,
    add,
    update,
    remove,
    setCurrent,
    useLocationColumns,
    openCreate,
    openEdit,
    openDelete,
    openDeliverableStatus,
    openViewSlabs,
    toggleDeliverable,
    fetch,
    reset,
    sortByColumn,
    filters,
    setQuery: (q) => setQuery(q),
    getQuery: () => useLocationStore.getState().query,
  };
};