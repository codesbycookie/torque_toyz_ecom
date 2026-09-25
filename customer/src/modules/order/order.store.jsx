import { create } from "zustand";

export const useOrderStore = create((set) => ({
  list: [],
  current: null,
  loading: false,
  query: { page: 1, limit: 10 },
  pagination: null,
  set: (list) => set({ list }),
  setCurrent: (current) => set({ current }),
  setQuery: (query) => set({ query }),
  setPagination: (pagination) => set({ pagination }),
  startLoading: (key) => set({ loading: true }),
  stopLoading: (key) => set({ loading: false }),
}));
