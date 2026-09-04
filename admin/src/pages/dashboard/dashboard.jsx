import React, { useEffect } from "react";
import { useApi } from "@/core/contexts/api.context";
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
  InventoryVelocityChart
} from "@/modules/dashboard/dashboard.components";

export default function Dashboard() {
  const { dashboard } = useApi();
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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0 pb-4">


      </div>      <Tabs defaultValue="overview" className="space-y-4">

        <div className="flex items-center justify-between  space-x-2">

          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>
          <DatePickerWithRange dateRange={dateRange} setDateRange={setDateRange} />
        </div>
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
