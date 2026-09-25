import { create } from "zustand";

export const useUserStore = create((set) => ({
  list: [],
  current: null,
  set: (list) => set({ list }),
  setCurrent: (current) => set({ current }),
}));
