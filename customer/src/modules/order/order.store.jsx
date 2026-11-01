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
  update: (id, data) =>
    set((state) => ({
      list: state.list.map((item) =>
        (item._id === id || item.id === id ? { ...item, ...data } : item)
      ),
      current:
        state.current && (state.current._id === id || state.current.id === id)
          ? { ...state.current, ...data }
          : state.current,
    })),
}));
