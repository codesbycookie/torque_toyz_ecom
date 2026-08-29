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
    reviews: [
      
  {
    _id: "r1",
    userName: "Aisha K.",
    rating: 5,
    comment: "Perfect fit and soft fabric.",
    createdAt: "2025-02-01T10:00:00.000Z",
  },
  {
    _id: "r2",
    userName: "Rahul M.",
    rating: 4,
    comment: "Good quality, runs a bit large.",
    createdAt: "2025-02-03T12:30:00.000Z",
  },
  {
    _id: "r3",
    userName: "Priya S.",
    rating: 5,
    comment: "Excellent quality and very comfortable.",
    createdAt: "2025-02-05T09:15:00.000Z",
  },
  {
    _id: "r4",
    userName: "Arjun R.",
    rating: 4,
    comment: "Looks great and feels durable.",
    createdAt: "2025-02-07T14:45:00.000Z",
  },
  {
    _id: "r5",
    userName: "Sneha P.",
    rating: 5,
    comment: "Absolutely love it. Worth the price.",
    createdAt: "2025-02-10T11:20:00.000Z",
  },
  {
    _id: "r6",
    userName: "Vikram N.",
    rating: 3,
    comment: "Decent product, but the color is slightly different.",
    createdAt: "2025-02-12T16:10:00.000Z",
  },
  {
    _id: "r7",
    userName: "Meera V.",
    rating: 5,
    comment: "Very soft material and fits perfectly.",
    createdAt: "2025-02-15T08:40:00.000Z",
  },
  {
    _id: "r8",
    userName: "Karthik S.",
    rating: 4,
    comment: "Good product for everyday use.",
    createdAt: "2025-02-18T13:25:00.000Z",
  },
  {
    _id: "r9",
    userName: "Divya M.",
    rating: 5,
    comment: "Better than expected. Highly recommended.",
    createdAt: "2025-02-21T10:50:00.000Z",
  },
  {
    _id: "r10",
    userName: "Aditya K.",
    rating: 4,
    comment: "Nice design and comfortable to wear.",
    createdAt: "2025-02-24T15:35:00.000Z",
  },
  {
    _id: "r11",
    userName: "Nandhini R.",
    rating: 5,
    comment: "Great stitching and premium feel.",
    createdAt: "2025-02-27T09:05:00.000Z",
  },
  {
    _id: "r12",
    userName: "Sanjay P.",
    rating: 3,
    comment: "The product is good, but delivery took longer than expected.",
    createdAt: "2025-03-01T17:20:00.000Z",
  },
  {
    _id: "r13",
    userName: "Keerthi A.",
    rating: 4,
    comment: "Comfortable and looks exactly like the pictures.",
    createdAt: "2025-03-04T12:10:00.000Z",
  },
  {
    _id: "r14",
    userName: "Manoj T.",
    rating: 5,
    comment: "Fantastic quality. Will definitely buy again.",
    createdAt: "2025-03-07T11:45:00.000Z",
  },
  {
    _id: "r15",
    userName: "Ananya D.",
    rating: 4,
    comment: "Good fit and nice overall finish.",
    createdAt: "2025-03-10T14:30:00.000Z",
  },
    ] 
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
    reviews: [
      {
        _id: "r3",
        userName: "Priya S.",
        rating: 5,
        comment: "Looks premium, keeps coffee warm.",
        createdAt: "2025-02-05T09:15:00.000Z",
      },
    ],
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
    reviews: [],
  },
  // ... keep other products, add reviews: [] or a few sample reviews
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
  const openReviews = (product) => {
  return openModal(modals.reviews, {
    product,
    onDeleteReview: (review) => {
      openModal(modals.deleteReview, {
        product,
        review,
        submitFn: () => {
          const nextReviews = (product.reviews || []).filter(
            (r) => r._id !== review._id
          );
          update(product._id, { reviews: nextReviews });
          toast.success("Review deleted");
        },
        exported,
      });
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
    openReviews,
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
