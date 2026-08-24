import { toast } from "sonner";
import { useUI } from "@/core/contexts/ui.context";
import { useProductStore } from "./product.store";
import { modals } from "./product.modals";
import { useProductColumns } from "./product.coulmns";

const DUMMY_IMAGES = [
  "https://placehold.co/600x400?text=Product+1",
  "https://placehold.co/600x400?text=Product+2",
];

// Plain dummy data object — add() pushes into this, update() edits by _id.
let DUMMY_PRODUCTS = [
  { _id: "1", code: "P-001", name: "Sample Product 1", description: "First sample product.", images: DUMMY_IMAGES, stock: 12, active: true, deleted: false },
  { _id: "2", code: "P-002", name: "Sample Product 2", description: "Second sample product.", images: DUMMY_IMAGES, stock: 30, active: true, deleted: false },
  { _id: "3", code: "P-003", name: "Sample Product 3", description: "Third sample product.", images: DUMMY_IMAGES, stock: 0, active: false, deleted: false },
  { _id: "4", code: "P-004", name: "Sample Product 4", description: "Fourth sample product.", images: DUMMY_IMAGES, stock: 8, active: true, deleted: true },
  { _id: "5", code: "P-005", name: "Sample Product 5", description: "Fifth sample product.", images: DUMMY_IMAGES, stock: 45, active: true, deleted: false },
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

export const useProductModule = (exported) => {
  const { openModal } = useUI();
  const store = useProductStore();
  const { set, setPagination, setQuery, resetQuery, setCurrent } = store;

  const syncStore = () => {
    const { query } = useProductStore.getState();
    let list = [...DUMMY_PRODUCTS];

    if (query.sortBy) {
      list = sortList(list, query.sortBy, query.order || "asc");
    }

    const { pageItems, pagination } = paginate(list, query.page || 1, query.limit || 10);
    set(pageItems);
    setPagination(pagination);
  };

  const add = (data) => {
    const newProduct = {
      _id: `dummy-product-${Date.now()}`,
      code: `P-${String(DUMMY_PRODUCTS.length + 1).padStart(3, "0")}`,
      images: DUMMY_IMAGES,
      active: true,
      deleted: false,
      ...data,
    };
    DUMMY_PRODUCTS.push(newProduct);
    syncStore();
  };

  const update = (id, data) => {
    DUMMY_PRODUCTS = DUMMY_PRODUCTS.map((p) => (p._id === id ? { ...p, ...data } : p));
    syncStore();
  };

  const remove = (id) => {
    DUMMY_PRODUCTS = DUMMY_PRODUCTS.filter((p) => p._id !== id);
    syncStore();
  };

  const openCreate = () => {
    return openModal(modals.create, {
      submitFn: (data) => {
        add(data);
        toast.success("Product created successfully");
      },
      exported,
    });
  };

  const openEdit = (product) => {
    return openModal(modals.edit, {
      product,
      submitFn: (data) => {
        update(product._id, data);
        toast.success("Product updated successfully");
      },
      exported,
    });
  };

  const openDelete = (id, name) => {
    return openModal(modals.delete, {
      id,
      name,
      onConfirm: (id) => {
        update(id, { deleted: true, active: false });
        toast.success("Product deleted successfully");
      },
      exported,
    });
  };

  const openErase = (id) => {
    return openModal(modals.erase, {
      id,
      submitFn: (id) => {
        remove(id);
        toast.success("Product deleted permanently");
      },
      exported,
    });
  };

  const openRetrieve = (id) => {
    return openModal(modals.retrieve, {
      id,
      submitFn: (id) => {
        update(id, { deleted: false, active: true });
        toast.success("Product retrieved successfully");
      },
      exported,
    });
  };

  const openActiveStatus = (id, status) => {
    return openModal(modals.activeStatus, {
      id,
      status,
      submitFn: (id, data) => {
        update(id, data);
        toast.success(data?.active ? "Product is now active" : "Product has been deactivated");
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

  if (useProductStore.getState().pagination.total === 0) {
    syncStore();
  }

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
    add,
    update,
    remove,
    setCurrent,
    useProductColumns,
    openCreate,
    openEdit,
    openDelete,
    openErase,
    openRetrieve,
    openActiveStatus,
    fetch,
    reset,
    sortByColumn,
    filters,
    setQuery: (q) => {
      setQuery(q);
      syncStore();
    },
    getQuery: () => useProductStore.getState().query,
  };
}; 