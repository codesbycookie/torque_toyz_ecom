import { toast } from "sonner";
import { useUI } from "@/core/contexts/ui.context";
import { useProductStore } from "./product.store";
import { modals } from "./product.modals";
import { useProductColumns } from "./product.coulmns";

const DUMMY_IMAGES = [
  "https://placehold.co/600x400?text=Product+1",
  "https://placehold.co/600x400?text=Product+2",
  "https://placehold.co/600x400?text=Product+3",
];

let DUMMY_PRODUCTS = [
  {
    _id: "1",
    code: "P-001",
    name: "Classic Cotton T-Shirt",
    slug: "classic-cotton-t-shirt",
    images: DUMMY_IMAGES,
    description: "Soft round-neck cotton t-shirt, everyday wear.",
    category: "Apparel",
    stock: 120,
    price: 19.99,
    weight: 0.25,
    active: true,
    deleted: false,
    deletedAt: null,
    createdAt: "2025-01-10T09:00:00.000Z",
    updatedAt: "2025-01-10T09:00:00.000Z",
  },
  {
    _id: "2",
    code: "P-002",
    name: "Ceramic Coffee Mug",
    slug: "ceramic-coffee-mug",
    images: DUMMY_IMAGES,
    description: "350ml ceramic mug, dishwasher safe.",
    category: "Home & Kitchen",
    stock: 85,
    price: 12.5,
    weight: 0.4,
    active: true,
    deleted: false,
    deletedAt: null,
    createdAt: "2025-01-12T09:00:00.000Z",
    updatedAt: "2025-01-12T09:00:00.000Z",
  },
  {
    _id: "3",
    code: "P-003",
    name: "Wireless Mouse",
    slug: "wireless-mouse",
    images: DUMMY_IMAGES,
    description: "Ergonomic wireless mouse with silent clicks.",
    category: "Electronics",
    stock: 40,
    price: 29.99,
    weight: 0.12,
    active: true,
    deleted: false,
    deletedAt: null,
    createdAt: "2025-01-15T09:00:00.000Z",
    updatedAt: "2025-01-15T09:00:00.000Z",
  },
  {
    _id: "4",
    code: "P-004",
    name: "Leather Wallet",
    slug: "leather-wallet",
    images: DUMMY_IMAGES,
    description: "Genuine leather bifold wallet.",
    category: "Apparel",
    stock: 0,
    price: 45.0,
    weight: 0.15,
    active: false,
    deleted: false,
    deletedAt: null,
    createdAt: "2025-01-18T09:00:00.000Z",
    updatedAt: "2025-01-20T09:00:00.000Z",
  },
  {
    _id: "5",
    code: "P-005",
    name: "Notebook A5",
    slug: "notebook-a5",
    images: DUMMY_IMAGES,
    description: "Hardcover ruled notebook, 192 pages.",
    category: "Stationery",
    stock: 200,
    price: 8.99,
    weight: 0.35,
    active: true,
    deleted: false,
    deletedAt: null,
    createdAt: "2025-01-20T09:00:00.000Z",
    updatedAt: "2025-01-20T09:00:00.000Z",
  },
  {
    _id: "6",
    code: "P-006",
    name: "Stainless Steel Bottle",
    slug: "stainless-steel-bottle",
    images: DUMMY_IMAGES,
    description: "750ml insulated water bottle.",
    category: "Home & Kitchen",
    stock: 65,
    price: 24.99,
    weight: 0.45,
    active: true,
    deleted: false,
    deletedAt: null,
    createdAt: "2025-01-22T09:00:00.000Z",
    updatedAt: "2025-01-22T09:00:00.000Z",
  },
  {
    _id: "7",
    code: "P-007",
    name: "Bluetooth Earbuds",
    slug: "bluetooth-earbuds",
    images: DUMMY_IMAGES,
    description: "True wireless earbuds with charging case.",
    category: "Electronics",
    stock: 28,
    price: 59.99,
    weight: 0.08,
    active: true,
    deleted: false,
    deletedAt: null,
    createdAt: "2025-01-25T09:00:00.000Z",
    updatedAt: "2025-01-25T09:00:00.000Z",
  },
  {
    _id: "8",
    code: "P-008",
    name: "Desk Lamp LED",
    slug: "desk-lamp-led",
    images: DUMMY_IMAGES,
    description: "Adjustable LED desk lamp with USB port.",
    category: "Electronics",
    stock: 15,
    price: 34.5,
    weight: 0.9,
    active: false,
    deleted: true,
    deletedAt: "2025-02-01T09:00:00.000Z",
    createdAt: "2025-01-28T09:00:00.000Z",
    updatedAt: "2025-02-01T09:00:00.000Z",
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
  const openView = (product) => {
    setCurrent(product);
    return openModal(modals.view, {
      product,
      exported,
    });
  };
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
          data?.active
            ? "Product is now active"
            : "Product has been deactivated",
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
    openView,
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
