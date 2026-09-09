import React, { useEffect } from "react";
import { useApi } from "@/core/contexts/api.context";
import { useAuth } from "@/core/contexts/auth.context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SummaryCards,
  RevenueChart,
  TopProductsChart,
  OrderStatusChart,
  PeakTimesChart,
  RecentOrders,
  DatePickerWithRange,
  RevenueByLocationChart,
  CancellationRefundChart,
  DeliveryPerformanceCard,
  InventoryVelocityChart,
  MostWishlistedChart,
  MostReviewedChart
} from "@/modules/dashboard/dashboard.components";

export default function Dashboard() {
  const { dashboard } = useApi();
  const { user } = useAuth();
  const { loadDashboardData, state: data, loading, error, dateRange, setDateRange } = dashboard;

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange.from, dateRange.to]);

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 text-red-500">
        Error loading dashboard: {error}
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0 pb-4 border-b border-border/40">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Hey, {user?.name || "Admin"}</h2>
          <p className="text-muted-foreground text-sm">
            Analyze your store's performance and metrics.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <DatePickerWithRange dateRange={dateRange} setDateRange={setDateRange} />
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6 pt-2">
        <TabsList className="bg-muted/40 p-1 rounded-lg h-auto inline-flex">
          <TabsTrigger value="overview" className="rounded-md px-5 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground">Overview</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-md px-5 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground">Analytics</TabsTrigger>
          <TabsTrigger value="performance" className="rounded-md px-5 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground">Performance</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <SummaryCards data={data?.summary} customerData={data?.customerInsights} loading={loading} />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4 flex flex-col">
              <RevenueChart data={data?.revenue} loading={loading} />
            </div>
            <RecentOrders orders={data?.recentOrders} loading={loading} />
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4 flex flex-col">
              <TopProductsChart data={data?.topProducts} loading={loading} />
            </div>
            <div className="col-span-3 flex flex-col">
              <OrderStatusChart data={data?.orderStatus} loading={loading} />
            </div>
          </div>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4 flex flex-col">
              <PeakTimesChart data={data?.peakTimes} loading={loading} />
            </div>
            <div className="col-span-3 flex flex-col">
              <RevenueByLocationChart data={data?.revenueByLocation} loading={loading} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <div className="col-span-1 flex flex-col">
              <MostWishlistedChart data={data?.mostWishlisted} loading={loading} />
            </div>
            <div className="col-span-1 flex flex-col">
              <MostReviewedChart data={data?.mostReviewed} loading={loading} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DeliveryPerformanceCard data={data?.deliveryPerformance} loading={loading} />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4 flex flex-col">
              <InventoryVelocityChart data={data?.inventoryVelocity} loading={loading} />
            </div>
            <div className="col-span-3 flex flex-col">
              <CancellationRefundChart data={data?.cancellationRefundRate} loading={loading} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
