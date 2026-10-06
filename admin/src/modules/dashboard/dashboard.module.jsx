import { useDashboardStore } from "./dashboard.store";
import { apiurls } from "@/core/api/api.urls";
import { createCrud } from "@/core/factory/entity.crud";

export const useDashboardModule = (exported) => {
  const store = useDashboardStore();
  const { setData, setDateRange, setLoading, setError, loading, data, dateRange, error } = store;

  const crud = createCrud({
    entity: "dashboard",
    store,
    urls: {
      getSummary: { method: "get", url: (qs) => apiurls.analytics.revenueSummary.url() + qs },
      getRevenueByMonth: { method: "get", url: (qs) => apiurls.analytics.revenueByMonth.url() + qs },
      getTopProducts: { method: "get", url: (qs) => apiurls.analytics.topProducts.url() + qs },
      getOrderStatusBreakdown: { method: "get", url: (qs) => apiurls.analytics.orderStatusBreakdown.url() + qs },
      getCustomerInsights: { method: "get", url: (qs) => apiurls.analytics.customerInsights.url() + qs },
      getPeakTimes: { method: "get", url: (qs) => apiurls.analytics.peakTimes.url() + qs },
      getInventoryVelocity: { method: "get", url: (qs) => apiurls.analytics.inventoryVelocity.url() + qs },
      getRevenueByLocation: { method: "get", url: (qs) => apiurls.analytics.revenueByLocation.url() + qs },
      getDeliveryPerformance: { method: "get", url: (qs) => apiurls.analytics.deliveryPerformance.url() + qs },
      getCancellationRefundRate: { method: "get", url: (qs) => apiurls.analytics.cancellationRefundRate.url() + qs },
      getPendingRefunds: { method: "get", url: (qs) => apiurls.analytics.pendingRefunds.url() + qs },
      getRecentOrders: { method: "get", url: (qs) => apiurls.orders.getAll.url() + qs + `&limit=10&sort=-createdAt` },
      getMostWishlisted: { method: "get", url: (qs) => apiurls.analytics.mostWishlisted.url() + qs },
      getMostReviewed: { method: "get", url: (qs) => apiurls.analytics.mostReviewed.url() + qs },
    }
  });

  const loadDashboardData = async () => {
    setError(null);
    try {
      const qs = `?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`;
      
      const [
        summaryRes,
        revenueRes,
        topProductsRes,
        orderStatusRes,
        customerInsightsRes,
        peakTimesRes,
        inventoryVelocityRes,
        revenueByLocationRes,
        deliveryPerformanceRes,
        cancellationRefundRateRes,
        pendingRefundsRes,
        recentOrdersRes,
        mostWishlistedRes,
        mostReviewedRes,
      ] = await Promise.all([
        crud.getSummary(qs, { __options: { toast: false } }),
        crud.getRevenueByMonth(qs, { __options: { toast: false } }),
        crud.getTopProducts(qs, { __options: { toast: false } }),
        crud.getOrderStatusBreakdown(qs, { __options: { toast: false } }),
        crud.getCustomerInsights(qs, { __options: { toast: false } }),
        crud.getPeakTimes(qs, { __options: { toast: false } }),
        crud.getInventoryVelocity(qs, { __options: { toast: false } }),
        crud.getRevenueByLocation(qs, { __options: { toast: false } }),
        crud.getDeliveryPerformance(qs, { __options: { toast: false } }),
        crud.getCancellationRefundRate(qs, { __options: { toast: false } }),
        crud.getPendingRefunds(qs, { __options: { toast: false } }),
        crud.getRecentOrders(qs, { __options: { toast: false } }),
        crud.getMostWishlisted(qs, { __options: { toast: false } }),
        crud.getMostReviewed(qs, { __options: { toast: false } }),
      ]);

      setData({
        summary: summaryRes || null,
        revenue: revenueRes || null,
        topProducts: topProductsRes || null,
        orderStatus: orderStatusRes || null,
        customerInsights: customerInsightsRes || null,
        peakTimes: peakTimesRes || null,
        inventoryVelocity: inventoryVelocityRes || null,
        revenueByLocation: revenueByLocationRes || null,
        deliveryPerformance: deliveryPerformanceRes || null,
        cancellationRefundRate: cancellationRefundRateRes || null,
        pendingRefunds: pendingRefundsRes || null,
        recentOrders: recentOrdersRes?.docs || recentOrdersRes || [],
        mostWishlisted: mostWishlistedRes || null,
        mostReviewed: mostReviewedRes || null,
      });
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError(err?.message || "Failed to load dashboard data");
    }
  };

  const methods = {
    loadDashboardData,
    setDateRange,
    dateRange,
    state: data,
    loading,
    error,
    crud
  };

  if (exported) {
    exported.dashboard = methods;
  }

  return methods;
};
