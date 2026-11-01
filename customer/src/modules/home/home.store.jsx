import { create } from "zustand";

export const useHomeStore = create((set) => ({
  data: {
    announcementBanner: "",
    categories: [],
    products: [],
    featuredPicks: [],
    budgetPicks: [],
    trendingProducts: [],
    bestSellers: [],
    recommendations: [],
    wishlistIds: [],
  },
  loading: false,
  error: null,
  setData: (data) => set({ data }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
