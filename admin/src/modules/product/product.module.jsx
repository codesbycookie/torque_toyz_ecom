import { toast } from "sonner";
import { useUI } from "@/core/contexts/ui.context";
import { useProductStore } from "./product.store";
import { modals } from "./product.modals";
import { useProductColumns } from "./product.coulmns";

const DUMMY_IMAGES = [
  "https://placehold.co/600x400?text=Product+1",
  "https://placehold.co/600x400?text=Product+2",
];

const DUMMY_PRODUCTS = Array.from({ length: 14 }).map((_, i) => {
  const idx = i + 1;
  const deleted = idx % 7 === 0;
  return {
    _id: `dummy-product-${idx}`,
    code: `P-${String(idx).padStart(3, "0")}`,
    name: `Sample Product ${idx}`,
    description: `Auto-generated description for product ${idx}.`,
    images: DUMMY_IMAGES,
    stock: (idx * 7) % 50,
    active: idx % 4 !== 0,
    deleted,
    deletedAt: deleted ? new Date().toISOString() : undefined,
    createdAt: new Date(Date.now() - idx * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - idx * 43200000).toISOString(),
  };
});

// Seed once — runs when the module is first imported, not on every render.
if (useProductStore.getState().list.length === 0) {
  useProductStore.setState({
    list: DUMMY_PRODUCTS,
    pagination: {
      page: 1,
      limit: 10,
      total: DUMMY_PRODUCTS.length,
      pages: Math.ceil(DUMMY_PRODUCTS.length / 10),
      hasNext: DUMMY_PRODUCTS.length > 10,
      hasPrev: false,
    },
  });
}

const sortList = (list, key, order = "asc") =>
  [...list].sort((a, b) => {
    if (a[key] === b[key]) return 0;
    const result = a[key] > b[key] ? 1 : -1;
    return order === "asc" ? result : -result;
  });

export const useProductModule = (exported) => {
  const { openModal } = useUI();
  const store = useProductStore();
  const { set, add, update, remove, setCurrent, setQuery, resetQuery } = store;

  const openCreate = () => {
    return openModal(modals.create, {
      submitFn: (data) => {
        const newProduct = {
          _id: `dummy-product-${Date.now()}`,
          code: `P-${String(store.list.length + 1).padStart(3, "0")}`,
          images: DUMMY_IMAGES,
          active: true,
          deleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...data,
        };
        add(newProduct);
        toast.success("Product created successfully");
      },
      exported,
    });
  };

  const openEdit = (product) => {
    return openModal(modals.edit, {
      product,
      submitFn: (data) => {
        update(product._id, { ...data, updatedAt: new Date().toISOString() });
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
        update(id, { deleted: true, active: false, deletedAt: new Date().toISOString() });
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
        update(id, { deleted: false, active: true, deletedAt: undefined });
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

  const fetch = () => {}; // no API — data is already seeded

  const reset = () => {
    resetQuery();
    set(DUMMY_PRODUCTS);
  };

  const sortByColumn = ({ id, desc }) => {
    setQuery({ sortBy: id, order: desc ? "desc" : "asc" });
    set(sortList(store.list, id, desc ? "desc" : "asc"));
  };

  const filters = {
    latest: () => set(sortList(store.list, "createdAt", "desc")),
    oldest: () => set(sortList(store.list, "createdAt", "asc")),
    ascending: (field) => set(sortList(store.list, field, "asc")),
    descending: (field) => set(sortList(store.list, field, "desc")),
  };

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
    set,
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
    getQuery: () => useProductStore.getState().query,
  };
};