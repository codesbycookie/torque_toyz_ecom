import { toast } from "sonner";
import { useUI } from "@/core/contexts/ui.context";
import { useProductStore } from "./product.store";
import { modals } from "./product.modals";
import { useProductColumns } from "./product.coulmns";

const DUMMY_PRODUCTS = [
  {
    _id: "1",
    code: "P-001",
    name: "Classic Cotton T-Shirt",
    description: "Soft round-neck cotton t-shirt, everyday wear.",
    stock: 120,
    price: 19.99,
    weight: 0.25,
    active: true,
  },
  {
    _id: "2",
    code: "P-002",
    name: "Ceramic Coffee Mug",
    description: "350ml ceramic mug, dishwasher safe.",
    stock: 85,
    price: 12.5,
    weight: 0.4,
    active: true,
  },
  {
    _id: "3",
    code: "P-003",
    name: "Wireless Mouse",
    description: "Ergonomic wireless mouse with silent clicks.",
    stock: 40,
    price: 29.99,
    weight: 0.12,
    active: true,
  },
  {
    _id: "4",
    code: "P-004",
    name: "Leather Wallet",
    description: "Genuine leather bifold wallet.",
    stock: 0,
    price: 45.0,
    weight: 0.15,
    active: false,
  },
  {
    _id: "5",
    code: "P-005",
    name: "Notebook A5",
    description: "Hardcover ruled notebook, 192 pages.",
    stock: 200,
    price: 8.99,
    weight: 0.35,
    active: true,
  },
  {
    _id: "6",
    code: "P-006",
    name: "Stainless Steel Bottle",
    description: "750ml insulated water bottle.",
    stock: 65,
    price: 24.99,
    weight: 0.45,
    active: true,
  },
  {
    _id: "7",
    code: "P-007",
    name: "Bluetooth Earbuds",
    description: "True wireless earbuds with charging case.",
    stock: 28,
    price: 59.99,
    weight: 0.08,
    active: true,
  },
  {
    _id: "8",
    code: "P-008",
    name: "Desk Lamp LED",
    description: "Adjustable LED desk lamp with USB port.",
    stock: 15,
    price: 34.5,
    weight: 0.9,
    active: false,
  },
];

export const useProductModule = (exported) => {
  const { openModal } = useUI();
  const store = useProductStore();
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
  if (useProductStore.getState().list.length === 0) {
    set(DUMMY_PRODUCTS);
    setPagination({
      page: 1,
      limit: 10,
      total: DUMMY_PRODUCTS.length,
      pages: 1,
      hasNext: false,
      hasPrev: false,
    });
  }

  const openCreate = () => {
    return openModal(modals.create, {
      submitFn: (data) => {
        const newProduct = {
          _id: `dummy-${Date.now()}`,
          code: `P-${String(Date.now()).slice(-3)}`,
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
      submitFn: (id) => {
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

  const openStockUpdate = (product) => {
  return openModal(modals.stock, {
    product,
    submitFn: (data) => {
      update(product._id, data);
      toast.success("Stock updated successfully");
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
        toast.success(
          data?.active ? "Product is now active" : "Product has been deactivated"
        );
      },
      exported,
    });
  };

  const toggleActive = (product) => {
    update(product._id, { active: !product.active });
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
    openStockUpdate,
    toggleActive,
    fetch,
    reset,
    sortByColumn,
    filters,
    setQuery: (q) => setQuery(q),
    getQuery: () => useProductStore.getState().query,
  };
};