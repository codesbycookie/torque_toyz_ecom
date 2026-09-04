import { create } from "zustand";

export const useDashboardStore = create((set) => ({
  data: {
    summary: null,
    revenue: null,
    topProducts: null,
    orderStatus: null,
    customerInsights: null,
    peakTimes: null,
    inventoryVelocity: null,
    revenueByLocation: null,
    deliveryPerformance: null,
    cancellationRefundRate: null,
  },
  dateRange: {
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  },
  loading: true,
  error: null,
  setData: (data) => set({ data }),
  setDateRange: (dateRange) => set({ dateRange }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  startLoading: () => set({ loading: true }),
  stopLoading: () => set({ loading: false }),
}));
