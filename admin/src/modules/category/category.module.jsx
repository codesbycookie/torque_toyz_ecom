import { toast } from "sonner";
import { useUI } from "@/core/contexts/ui.context";
import { useCategoryStore } from "./category.store";
import { modals } from "./category.modals";
import { useCategoryColumns } from "./category.columns";

const DUMMY_CATEGORIES = [
  {
    _id: "1",
    name: "Apparel",
    slug: "apparel",
    description: "Clothing and wearable items.",
    active: true,
    deleted: false,
    deletedAt: null,
    createdAt: "2025-01-05T09:00:00.000Z",
    updatedAt: "2025-01-05T09:00:00.000Z",
  },
  {
    _id: "2",
    name: "Home & Kitchen",
    slug: "home-kitchen",
    description: "Everyday household and kitchen essentials.",
    active: true,
    deleted: false,
    deletedAt: null,
    createdAt: "2025-01-08T09:00:00.000Z",
    updatedAt: "2025-01-08T09:00:00.000Z",
  },
  {
    _id: "3",
    name: "Electronics",
    slug: "electronics",
    description: "Gadgets and electronic accessories.",
    active: true,
    deleted: false,
    deletedAt: null,
    createdAt: "2025-01-10T09:00:00.000Z",
    updatedAt: "2025-01-10T09:00:00.000Z",
  },
  {
    _id: "4",
    name: "Stationery",
    slug: "stationery",
    description: "Notebooks, pens, and office supplies.",
    active: false,
    deleted: false,
    deletedAt: null,
    createdAt: "2025-01-12T09:00:00.000Z",
    updatedAt: "2025-01-14T09:00:00.000Z",
  },
  {
    _id: "5",
    name: "Discontinued Line",
    slug: "discontinued-line",
    description: "Old product line, no longer sold.",
    active: false,
    deleted: true,
    deletedAt: "2025-02-01T09:00:00.000Z",
    createdAt: "2025-01-01T09:00:00.000Z",
    updatedAt: "2025-02-01T09:00:00.000Z",
  },
];

const sortList = (list, key, order = "asc") =>
  [...list].sort((a, b) => {
    if (a[key] === b[key]) return 0;
    const result = a[key] > b[key] ? 1 : -1;
    return order === "asc" ? result : -result;
  });

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const useCategoryModule = (exported) => {
  const { openModal } = useUI();
  const store = useCategoryStore();
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
  if (useCategoryStore.getState().list.length === 0) {
    set(DUMMY_CATEGORIES);
    setPagination({
      page: 1,
      limit: 10,
      total: DUMMY_CATEGORIES.length,
      pages: 1,
      hasNext: false,
      hasPrev: false,
    });
  }
  const openActiveStatus = (id, status) => {
    return openModal(modals.activeStatus, {
      id,
      status,
      submitFn: (id, data) => {
        update(id, data);
        toast.success(
          data?.active
            ? "Category is now active"
            : "Category has been deactivated",
        );
      },
      exported,
    });
  };
  const openCreate = () => {
    return openModal(modals.create, {
      submitFn: (data) => {
        const newCategory = {
          _id: `dummy-category-${Date.now()}`,
          slug: slugify(data.name),
          active: true,
          deleted: false,
          deletedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...data,
        };
        add(newCategory);
        toast.success("Category created successfully");
      },
      exported,
    });
  };

  const openEdit = (category) => {
    return openModal(modals.edit, {
      category,
      submitFn: (data) => {
        update(category._id, {
          ...data,
          slug: slugify(data.name),
          updatedAt: new Date().toISOString(),
        });
        toast.success("Category updated successfully");
      },
      exported,
    });
  };

  const openView = (category) => {
    setCurrent(category);
    return openModal(modals.view, { category, exported });
  };

  const openDelete = (id, name) => {
    return openModal(modals.delete, {
      id,
      name,
      submitFn: (id) => {
        update(id, {
          deleted: true,
          active: false,
          deletedAt: new Date().toISOString(),
        });
        toast.success("Category deleted successfully");
      },
      exported,
    });
  };

  const openErase = (id) => {
    return openModal(modals.erase, {
      id,
      submitFn: (id) => {
        remove(id);
        toast.success("Category deleted permanently");
      },
      exported,
    });
  };

  const openRetrieve = (id) => {
    return openModal(modals.retrieve, {
      id,
      submitFn: (id) => {
        update(id, { deleted: false, active: true, deletedAt: null });
        toast.success("Category retrieved successfully");
      },
      exported,
    });
  };

  // fetch/reset/sortByColumn/filters operate directly on store.list —
  // since add/update/remove come straight from entity.store.jsx, there's
  // no separate "full dataset" to re-derive from, so we sort/filter
  // whatever's currently in the store.
  const fetch = (incoming = {}) => {
    const currentQuery = useCategoryStore.getState().query;
    const nextQuery = { ...currentQuery, ...incoming };
    setQuery(nextQuery);

    let list = [...useCategoryStore.getState().list];
    if (nextQuery.search) {
      const term = nextQuery.search.toLowerCase();
      list = list.filter((c) => c.name?.toLowerCase().includes(term));
    }
    if (nextQuery.sortBy) {
      list = sortList(list, nextQuery.sortBy, nextQuery.order || "asc");
    }
    set(list);
  };

  const reset = (extras = {}) => {
    resetQuery();
    if (Object.keys(extras).length) setQuery(extras);
    set(DUMMY_CATEGORIES);
    setPagination({
      page: 1,
      limit: 10,
      total: DUMMY_CATEGORIES.length,
      pages: 1,
      hasNext: false,
      hasPrev: false,
    });
  };

  const sortByColumn = (sortBy, order, limit = 10) => {
    fetch({ page: 1, limit, sortBy, order });
  };

  const filters = {
    latest: (f = {}) =>
      fetch({ sortBy: "createdAt", order: "desc", page: 1, ...f }),
    oldest: (f = {}) =>
      fetch({ sortBy: "createdAt", order: "asc", page: 1, ...f }),
    ascending: (field = "name", f = {}) =>
      fetch({ sortBy: field, order: "asc", page: 1, ...f }),
    descending: (field = "name", f = {}) =>
      fetch({ sortBy: field, order: "desc", page: 1, ...f }),
    search: (term, f = {}) => fetch({ search: term, page: 1, ...f }),
  };

  return {
    get state() {
      return useCategoryStore.getState().list;
    },
    get loading() {
      return useCategoryStore.getState().loading;
    },
    get pagination() {
      return useCategoryStore.getState().pagination;
    },
    get current() {
      return useCategoryStore.getState().current;
    },
    set,
    add,
    update,
    remove,
    setCurrent,
    useCategoryColumns,
    openCreate,
    openEdit,
    openView,
    openDelete,
    openErase,
    openRetrieve,
    openActiveStatus,
    fetch,
    reset,
    sortByColumn,
    filters,
    setQuery: (q) => setQuery(q),
    getQuery: () => useCategoryStore.getState().query,
  };
};
