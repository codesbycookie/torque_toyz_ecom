
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DollarSign, IndianRupee, Users, CreditCard, Activity, Calendar as CalendarIcon, TrendingUp, RotateCcw, AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { apiRequest } from "@/core/api/api.request";
import { apiurls } from "@/core/api/api.urls";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    LineChart,
    Line,
    LabelList,
    PolarAngleAxis,
    PolarGrid,
    Radar,
    RadarChart,
    RadialBarChart,
    RadialBar,
    Label
} from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent
} from "@/components/ui/chart";

export function SummaryCards({ data, customerData, loading }) {
    const cards = [
        {
            title: "Total Revenue",
            value: data?.total_revenue ? `₹${data.total_revenue.toLocaleString()}` : "₹0",
            icon: <IndianRupee className="h-4 w-4 text-muted-foreground" />,
            description: "Lifetime revenue",
        },
        {
            title: "Orders",
            value: data?.total_orders ? `+${data.total_orders}` : "+0",
            icon: <CreditCard className="h-4 w-4 text-muted-foreground" />,
            description: "Total orders placed",
        },
        {
            title: "Total Customers",
            value: customerData?.total_customers ? `+${customerData.total_customers}` : "+0",
            icon: <Users className="h-4 w-4 text-muted-foreground" />,
            description: `Repeat rate: ${customerData?.repeat_rate || 0}%`,
        },
        {
            title: "Avg Order Value",
            value: data?.avg_order_value ? `₹${Math.round(data.avg_order_value).toLocaleString()}` : "₹0",
            icon: <Activity className="h-4 w-4 text-muted-foreground" />,
            description: "Average per order",
        },
    ];

    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-3/4 mb-2" />
                            <Skeleton className="h-3 w-1/2" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card, idx) => (
                <Card key={idx} className="shadow-sm border-border/40">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {card.title}
                        </CardTitle>
                        {card.icon}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold tracking-tight">{card.value}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {card.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export function RevenueChart({ data, loading }) {
    if (loading) {
        return (
            <Card className="flex flex-col h-full shadow-sm border-border/40">
                <CardHeader className="flex flex-col items-stretch border-b border-border/40 p-0 sm:flex-row">
                    <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-4">
                        <CardTitle>Revenue Overview</CardTitle>
                        <CardDescription>Monthly revenue generated</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 p-6">
                    <Skeleton className="h-[250px] w-full" />
                </CardContent>
            </Card>
        );
    }

    let chartData = [];
    if (data && data.length > 0) {
        chartData = [...data];
    } else {
        // Fallback for empty data
        const d = new Date();
        const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        chartData = [{ month: monthStr, revenue: 0 }];
    }

    const formattedData = chartData.map(d => {
        const [year, month] = d.month.split('-');
        const date = new Date(year, parseInt(month) - 1);
        return {
            ...d,
            monthFormatted: date.toLocaleString('default', { month: 'short', year: 'numeric' })
        };
    });

    const totalRevenue = chartData.reduce((acc, curr) => acc + (curr.revenue || 0), 0);

    const config = {
        revenue: {
            label: "Revenue",
            color: "var(--primary)",
        },
    };

    return (
        <Card className="shadow-sm border-border/40 flex flex-col h-full">
            <CardHeader>
                <CardTitle className="text-lg font-semibold tracking-tight">Revenue Overview</CardTitle>
                <CardDescription>Monthly revenue generated</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-2">
                <ChartContainer config={config} className="h-full min-h-[200px] w-full">
                    <AreaChart
                        accessibilityLayer
                        data={formattedData}
                        margin={{
                            top: 20,
                            left: 12,
                            right: 12,
                        }}
                    >
                        <defs>
                            <linearGradient id="fillRevenueOverview" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.1}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                        <XAxis
                            dataKey="monthFormatted"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            fontSize={12}
                            tick={{ fill: "var(--muted-foreground)" }}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            fontSize={12}
                            tick={{ fill: "var(--muted-foreground)" }}
                            tickFormatter={(value) => `₹${value}`}
                        />
                        <ChartTooltip
                            cursor={{ stroke: "var(--border)", strokeWidth: 1, strokeDasharray: "3 3" }}
                            content={<ChartTooltipContent indicator="line" className="w-[150px]" />}
                        />
                        <Area
                            dataKey="revenue"
                            type="natural"
                            fill="url(#fillRevenueOverview)"
                            stroke="var(--color-revenue)"
                            strokeWidth={2}
                            activeDot={{
                                r: 6,
                            }}
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm mt-4 pb-4">
                <div className="flex gap-2 leading-none font-medium text-muted-foreground">
                    Total Period Revenue: ₹{totalRevenue.toLocaleString()}
                </div>
            </CardFooter>
        </Card>
    );
}

export function OrderStatusChart({ data, loading }) {
    if (loading) {
        return (
            <Card className="flex flex-col">
                <CardHeader className="items-center pb-0">
                    <CardTitle>Order Status</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 pb-0 mt-4">
                    <Skeleton className="h-[250px] w-full rounded-full" />
                </CardContent>
            </Card>
        );
    }

    const getPrimaryShade = (index) => {
        return `var(--chart-${(index % 5) + 1})`;
    };

    const config = (data && data.length > 0 ? data : [{ status: "pending" }, { status: "delivered" }]).reduce((acc, curr, i) => {
        acc[curr.status] = { 
            label: curr.status.charAt(0).toUpperCase() + curr.status.slice(1), 
            color: getPrimaryShade(i) 
        };
        return acc;
    }, {});

    const chartData = data && data.length > 0 ? data.map((d) => ({
        ...d,
        fill: `var(--color-${d.status})`
    })) : [
        { status: "pending", count: 0, fill: "var(--color-pending)" },
        { status: "delivered", count: 0, fill: "var(--color-delivered)" },
    ];

    return (
        <Card className="flex flex-col h-full shadow-sm border-border/40">
            <CardHeader className="items-center pb-0">
                <CardTitle className="text-lg font-semibold tracking-tight">Order Status Breakdown</CardTitle>
                <CardDescription>Current state of all orders</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer config={config} className="mx-auto aspect-square max-h-[200px] pb-0 [&_.recharts-pie-label-text]:fill-foreground">
                    <PieChart>
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <Pie
                            data={chartData}
                            dataKey="count"
                            nameKey="status"
                            label
                        />
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm mt-4 pb-4 text-center">
                <div className="leading-none text-muted-foreground">
                    Showing distribution of order statuses
                </div>
            </CardFooter>
        </Card>
    );
}

export function TopProductsChart({ data, loading }) {
    if (loading) {
        return (
            <Card className="flex flex-col h-full shadow-sm border-border/40">
                <CardHeader>
                    <CardTitle>Top Performing Products</CardTitle>
                    <CardDescription>By revenue generated</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-2">
                    <Skeleton className="h-[250px] w-full" />
                </CardContent>
            </Card>
        );
    }

    const truncatedData = (data && data.length > 0 ? data : [
        { name: "Product A", revenue: 0 },
    ])
    .slice(0, 10) // Limit to top 10 products
    .map(d => ({
        ...d,
        shortName: d.name.length > 25 ? d.name.substring(0, 25) + '...' : d.name
    }));

    const config = {
        revenue: {
            label: "Revenue",
            color: "var(--primary)",
        },
    };

    return (
        <Card className="shadow-sm border-border/40 flex flex-col h-full">
            <CardHeader>
                <CardTitle className="text-lg font-semibold tracking-tight">Top Performing Products</CardTitle>
                <CardDescription>Highest grossing items</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-2">
                <ChartContainer config={config} className="h-full min-h-[220px] max-h-[250px] w-full">
                    <BarChart
                        accessibilityLayer
                        data={truncatedData}
                        layout="vertical"
                        margin={{ left: 0 }}
                    >
                        <YAxis
                            dataKey="shortName"
                            type="category"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            fontSize={12}
                            width={150}
                            tick={{ fill: "var(--muted-foreground)" }}
                        />
                        <XAxis 
                            dataKey="revenue" 
                            type="number" 
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            fontSize={12}
                            tick={{ fill: "var(--muted-foreground)" }}
                            tickFormatter={(value) => `₹${value}`}
                        />
                        <ChartTooltip
                            cursor={{ fill: 'var(--muted)', opacity: 0.1 }}
                            content={<ChartTooltipContent />}
                        />
                        <Bar
                            dataKey="revenue"
                            radius={4}
                            barSize={32}
                        >
                            {truncatedData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill="var(--primary)"
                                    fillOpacity={1 - (index * 0.08)}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm mt-4 pb-4">
                <div className="leading-none text-muted-foreground">
                    Showing top 10 products by revenue
                </div>
            </CardFooter>
        </Card>
    );
}

export function PeakTimesChart({ data, loading }) {
    if (loading) {
        return (
            <Card className="flex flex-col h-full shadow-sm border-border/40">
                <CardHeader className="pb-4">
                    <CardTitle>Peak Order Hours</CardTitle>
                    <CardDescription>When do customers buy the most?</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                    <Skeleton className="h-[250px] w-full" />
                </CardContent>
            </Card>
        );
    }

    // Create a continuous 24-hour array to make the line flow smoothly
    const defaultHours = Array.from({ length: 24 }).map((_, i) => ({
        hour: `${i.toString().padStart(2, '0')}:00`,
        orders: 0
    }));

    let chartData = defaultHours;
    if (data?.by_hour && data.by_hour.length > 0) {
        const hourMap = new Map(data.by_hour.map(d => [d.hour, d.orders]));
        chartData = defaultHours.map((dh, i) => ({
            hour: dh.hour,
            orders: hourMap.get(i) || 0
        }));
    }

    const config = {
        orders: {
            label: "Orders",
            color: "var(--chart-2)",
        },
    };

    return (
        <Card className="shadow-sm border-border/40 flex flex-col h-full pt-0">
            <CardHeader className="flex flex-col items-start gap-1 space-y-0 border-b border-border/40 py-5 sm:flex-row">
                <div className="grid flex-1 gap-1">
                    <CardTitle className="text-lg font-semibold tracking-tight">Peak Order Hours</CardTitle>
                    <CardDescription>When do customers buy the most?</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex-1 px-2 pt-4 sm:px-6 sm:pt-6 pb-2">
                <ChartContainer config={config} className="h-full min-h-[200px] w-full aspect-auto">
                    <AreaChart data={chartData} margin={{ left: 12, right: 12 }}>
                        <defs>
                            <linearGradient id="fillOrders" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-orders)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-orders)" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                        <XAxis
                            dataKey="hour"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            fontSize={12}
                            tick={{ fill: "var(--muted-foreground)" }}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                        <Area
                            dataKey="orders"
                            type="natural"
                            fill="url(#fillOrders)"
                            stroke="var(--color-orders)"
                            strokeWidth={2}
                            stackId="a"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm pb-4">
                <div className="flex items-center gap-2 leading-none text-muted-foreground">
                    Based on 24-hour distribution
                </div>
            </CardFooter>
        </Card>
    );
}

export function InventoryVelocityChart({ data, loading }) {
    if (loading) {
        return (
            <Card className="flex flex-col h-full shadow-sm border-border/40">
                <CardHeader className="items-center pb-4">
                    <CardTitle>Inventory Velocity</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                    <Skeleton className="h-[250px] w-full rounded-full" />
                </CardContent>
            </Card>
        );
    }

    const chartData = data?.fastest_moving && data.fastest_moving.length > 0 ? data.fastest_moving.slice(0, 5).map((d, index) => ({
        name: d.name.substring(0, 10),
        sold: d.units_sold,
        fill: `var(--chart-${(index % 5) + 1})`
    })) : [
        { name: "Prod A", sold: 0, fill: "var(--chart-1)" },
    ];

    const config = {
        sold: { label: "Units Sold" },
    };

    return (
        <Card className="flex flex-col h-full shadow-sm border-border/40">
            <CardHeader className="items-center pb-4">
                <CardTitle className="text-lg font-semibold tracking-tight">Inventory Velocity</CardTitle>
                <CardDescription>Fastest moving products</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer config={config} className="mx-auto aspect-square max-h-[200px]">
                    <RadialBarChart data={chartData} innerRadius={30} outerRadius={100}>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="name" />} />
                        <RadialBar dataKey="sold" background cornerRadius={10} />
                    </RadialBarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm mt-4 pb-4">
                <div className="flex items-center gap-2 leading-none font-medium">
                    Fastest moving inventory <TrendingUp className="h-4 w-4" />
                </div>
            </CardFooter>
        </Card>
    );
}

export function DatePickerWithRange({ dateRange, setDateRange, className }) {
    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[300px] justify-start text-left font-normal",
                            !dateRange && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                            dateRange.to ? (
                                <>
                                    {format(dateRange.from, "LLL dd, y")} -{" "}
                                    {format(dateRange.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(dateRange.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={(range) => {
                            if (range?.from) {
                                setDateRange(range);
                            }
                        }}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}

export function RecentOrders({ orders, loading }) {
    if (loading) {
        return (
            <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>Latest orders placed in the store.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[200px] w-full" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-3 shadow-sm border-border/40 flex flex-col h-full">
            <CardHeader>
                <CardTitle className="text-lg font-semibold tracking-tight">Recent Orders</CardTitle>
                <CardDescription>
                    You have {orders?.length || 0} orders in this period.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders && orders.length > 0 ? (
                            orders.map((order) => (
                                <TableRow key={order._id || order.id} className="border-b border-border/40 hover:bg-muted/50 transition-colors">
                                    <TableCell>
                                        <div className="font-medium text-sm">{order.user?.name || order.user?.email || "Guest"}</div>
                                        <div className="text-[11px] text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">{order.shipping_address?.city || "Unknown"}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className={cn(
                                            "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium transition-colors border",
                                            order.status === "delivered" ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" :
                                                order.status === "cancelled" ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20" :
                                                    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
                                        )}>
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-medium text-sm">
                                        ₹{order.pricing.total?.toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground text-sm">
                                    No recent orders found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export function RevenueByLocationChart({ data, loading }) {
    if (loading) {
        return (
            <Card className="flex flex-col h-full shadow-sm border-border/40">
                <CardHeader>
                    <CardTitle>Revenue by Location</CardTitle>
                    <CardDescription>Top 10 regions by sales</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-2">
                    <Skeleton className="h-[250px] w-full" />
                </CardContent>
            </Card>
        );
    }

    const chartData = data && data.length > 0 ? data
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)
        .map((d) => ({
            location: d.state || "Unknown",
            revenue: d.revenue,
        })) : [
        { location: "New York", revenue: 0 },
    ];

    const config = {
        revenue: {
            label: "Revenue",
        },
    };

    return (
        <Card className="shadow-sm border-border/40 flex flex-col h-full">
            <CardHeader>
                <CardTitle className="text-lg font-semibold tracking-tight">Revenue by Location</CardTitle>
                <CardDescription>Top 10 regions by sales</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-2">
                <ChartContainer config={config} className="h-full min-h-[220px] w-full">
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        layout="vertical"
                        margin={{ left: 0 }}
                    >
                        <YAxis
                            dataKey="location"
                            type="category"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            fontSize={12}
                            width={150}
                            tick={{ fill: "var(--muted-foreground)" }}
                            tickFormatter={(value) => value.length > 25 ? value.substring(0, 25) + '...' : value}
                        />
                        <XAxis 
                            dataKey="revenue" 
                            type="number" 
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            fontSize={12}
                            tick={{ fill: "var(--muted-foreground)" }}
                            tickFormatter={(value) => `₹${value}`}
                        />
                        <ChartTooltip
                            cursor={{ fill: 'var(--muted)', opacity: 0.1 }}
                            content={<ChartTooltipContent />}
                        />
                        <Bar dataKey="revenue" radius={5}>
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill="var(--primary)"
                                    fillOpacity={1 - (index * 0.08)}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm mt-4 pb-4">
                <div className="leading-none text-muted-foreground">
                    Showing top 10 locations by revenue
                </div>
            </CardFooter>
        </Card>
    );
}

export function CancellationRefundChart({ data, loading }) {
    if (loading) {
        return (
            <Card className="flex flex-col h-full shadow-sm border-border/40">
                <CardHeader className="items-center pb-0">
                    <CardTitle>Cancellations & Refunds</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 pb-0 mt-4">
                    <Skeleton className="h-[250px] w-full rounded-full" />
                </CardContent>
            </Card>
        );
    }

    const totalSuccessful = (data?.total || 0) - (data?.cancelled || 0);

    const chartData = [
        { name: "Successful", value: totalSuccessful, fill: "var(--color-successful)" },
        { name: "Cancelled", value: data?.cancelled || 0, fill: "var(--color-cancelled)" },
        { name: "Refunded", value: data?.refunded || 0, fill: "var(--color-refunded)" },
    ];

    const config = {
        successful: { label: "Successful", color: "var(--chart-1)" },
        cancelled: { label: "Cancelled", color: "var(--chart-3)" },
        refunded: { label: "Refunded", color: "var(--chart-4)" },
    };

    return (
        <Card className="flex flex-col h-full shadow-sm border-border/40">
            <CardHeader className="items-center pb-0">
                <CardTitle className="text-lg font-semibold tracking-tight">Order Outcomes</CardTitle>
                <CardDescription>Success vs Cancellations</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer config={config} className="mx-auto aspect-square max-h-[200px]">
                    <PieChart>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={60}
                            outerRadius={80}
                            strokeWidth={2}
                            stroke="var(--background)"
                        >
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                                <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                                                    {totalSuccessful.toLocaleString()}
                                                </tspan>
                                                <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                                                    Successful
                                                </tspan>
                                            </text>
                                        );
                                    }
                                }}
                            />
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm mt-4 pb-4">
                <div className="leading-none text-muted-foreground text-center">
                    Total orders: {data?.total || 0}
                </div>
            </CardFooter>
        </Card>
    );
}

export function DeliveryPerformanceCard({ data, loading }) {
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Avg Delivery Time</CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-10 w-1/2" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-sm border-border/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Delivery Time</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-semibold tracking-tight">{data?.averageHours || 0} hrs</div>
                <p className="text-xs text-muted-foreground mt-1">From placed to delivered</p>
            </CardContent>
        </Card>
    );
}

export function MostWishlistedChart({ data, loading }) {
    if (loading) {
        return (
            <Card className="flex flex-col h-full shadow-sm border-border/40">
                <CardHeader>
                    <CardTitle>Most Wishlisted</CardTitle>
                    <CardDescription>Products customers want</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-2">
                    <Skeleton className="h-[250px] w-full" />
                </CardContent>
            </Card>
        );
    }

    const truncatedData = (data && data.length > 0 ? data : [
        { name: "No data", count: 0 },
    ])
    .slice(0, 10)
    .map(d => ({
        ...d,
        shortName: d.name.length > 25 ? d.name.substring(0, 25) + '...' : d.name
    }));

    const config = {
        count: {
            label: "Wishlists",
            color: "var(--primary)",
        },
    };

    return (
        <Card className="shadow-sm border-border/40 flex flex-col h-full">
            <CardHeader>
                <CardTitle className="text-lg font-semibold tracking-tight">Most Wishlisted</CardTitle>
                <CardDescription>Most frequently saved items</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-2">
                <ChartContainer config={config} className="h-full min-h-[220px] max-h-[250px] w-full">
                    <BarChart
                        accessibilityLayer
                        data={truncatedData}
                        layout="vertical"
                        margin={{ left: 0 }}
                    >
                        <YAxis
                            dataKey="shortName"
                            type="category"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            fontSize={12}
                            width={150}
                            tick={{ fill: "var(--muted-foreground)" }}
                        />
                        <XAxis 
                            dataKey="count" 
                            type="number" 
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: "var(--muted-foreground)" }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar
                            dataKey="count"
                            layout="vertical"
                            fill="var(--color-count)"
                            radius={4}
                            barSize={20}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

export function MostReviewedChart({ data, loading }) {
    if (loading) {
        return (
            <Card className="flex flex-col h-full shadow-sm border-border/40">
                <CardHeader>
                    <CardTitle>Most Reviewed</CardTitle>
                    <CardDescription>Products with highest engagement</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-2">
                    <Skeleton className="h-[250px] w-full" />
                </CardContent>
            </Card>
        );
    }

    const truncatedData = (data && data.length > 0 ? data : [
        { name: "No data", count: 0, avgRating: 0 },
    ])
    .slice(0, 10)
    .map(d => ({
        ...d,
        shortName: d.name.length > 25 ? d.name.substring(0, 25) + '...' : d.name
    }));

    const config = {
        count: {
            label: "Reviews",
            color: "var(--primary)",
        },
    };

    return (
        <Card className="shadow-sm border-border/40 flex flex-col h-full">
            <CardHeader>
                <CardTitle className="text-lg font-semibold tracking-tight">Most Reviewed</CardTitle>
                <CardDescription>Products generating the most feedback</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-2">
                <ChartContainer config={config} className="h-full min-h-[220px] max-h-[250px] w-full">
                    <BarChart
                        accessibilityLayer
                        data={truncatedData}
                        layout="vertical"
                        margin={{ left: 0 }}
                    >
                        <YAxis
                            dataKey="shortName"
                            type="category"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            fontSize={12}
                            width={150}
                            tick={{ fill: "var(--muted-foreground)" }}
                        />
                        <XAxis 
                            dataKey="count" 
                            type="number" 
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: "var(--muted-foreground)" }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel formatter={(val, name, props) => [`${val} reviews (Avg: ${props.payload.avgRating}★)`, "Feedback"]} />}
                        />
                        <Bar
                            dataKey="count"
                            layout="vertical"
                            fill="var(--color-count)"
                            radius={4}
                            barSize={20}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

export function PendingRefundsWarningBanner({ data, loading, onRefresh, onNavigateToPerformance }) {
    const [expanded, setExpanded] = useState(false);
    const [processingId, setProcessingId] = useState(null);

    if (loading || !data?.summary?.total_orders) return null;

    const { total_orders, total_refund_amount } = data.summary;
    const orders = data.orders || [];

    const handleRefund = async (order) => {
        try {
            setProcessingId(order._id);
            // Try updating order payment status directly to 'refunded' (acknowledge refund)
            await apiRequest("patch", apiurls.orders.updatePaymentStatus.url(order._id), {
                data: { status: "refunded" }
            });
            toast.success(`Refund acknowledged & marked as completed for ${order.code}`);
            if (onRefresh) onRefresh();
        } catch (err) {
            toast.error(err?.response?.data?.message || err?.message || "Failed to process refund");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="rounded-lg border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-rose-500/10 p-4 shadow-sm text-foreground mb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start md:items-center gap-3">
                    <div className="p-2.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full shrink-0 animate-pulse">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="font-semibold text-base flex items-center gap-2">
                            <span className="text-amber-700 dark:text-amber-300">Action Required: Pending Refunds</span>
                            <Badge className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-2 py-0.5">
                                {total_orders} {total_orders === 1 ? 'Order' : 'Orders'}
                            </Badge>
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                            {total_orders} cancelled {total_orders === 1 ? 'order has' : 'orders have'} paid status totaling <strong className="font-bold text-rose-600 dark:text-rose-400">₹{total_refund_amount.toLocaleString()}</strong> requiring refund processing.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-100 text-xs font-medium"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? "Hide Orders" : "Quick View Orders"}
                    </Button>
                    {onNavigateToPerformance && (
                        <Button 
                            size="sm" 
                            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium"
                            onClick={onNavigateToPerformance}
                        >
                            View Full List
                        </Button>
                    )}
                </div>
            </div>

            {expanded && (
                <div className="mt-4 pt-4 border-t border-amber-500/20">
                    <div className="overflow-x-auto">
                        <Table className="bg-background/80 rounded-md border border-amber-500/20">
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="text-xs">Order Code</TableHead>
                                    <TableHead className="text-xs">Customer</TableHead>
                                    <TableHead className="text-xs">Method</TableHead>
                                    <TableHead className="text-xs">Amount</TableHead>
                                    <TableHead className="text-xs">Cancelled At</TableHead>
                                    <TableHead className="text-xs text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order._id}>
                                        <TableCell className="font-mono text-xs font-semibold">{order.code}</TableCell>
                                        <TableCell className="text-xs">
                                            <div className="font-medium">{order.user?.name || "Guest"}</div>
                                            <div className="text-muted-foreground text-[11px]">{order.user?.email || order.user?.login_id || "-"}</div>
                                        </TableCell>
                                        <TableCell className="text-xs uppercase font-semibold text-muted-foreground">{order.payment?.method || "online"}</TableCell>
                                        <TableCell className="font-semibold text-xs text-rose-600 dark:text-rose-400">₹{order.pricing?.total?.toLocaleString()}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">{order.cancelled_at ? format(new Date(order.cancelled_at), "MMM dd, yyyy") : "-"}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                variant="default"
                                                disabled={processingId === order._id}
                                                className="h-7 text-xs px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                                                onClick={() => handleRefund(order)}
                                            >
                                                {processingId === order._id ? "Refunding..." : "Acknowledge & Refund"}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
    );
}

export function PendingRefundsCard({ data, loading, onRefresh }) {
    const [processingId, setProcessingId] = useState(null);

    if (loading) {
        return (
            <Card className="flex flex-col h-full shadow-sm border-border/40">
                <CardHeader>
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-32 w-full rounded-md" />
                </CardContent>
            </Card>
        );
    }

    const summary = data?.summary || { total_orders: 0, total_refund_amount: 0 };
    const orders = data?.orders || [];

    const handleRefund = async (order) => {
        try {
            setProcessingId(order._id);
            await apiRequest("patch", apiurls.orders.updatePaymentStatus.url(order._id), {
                data: { status: "refunded" }
            });
            toast.success(`Refund acknowledged & marked as completed for ${order.code}`);
            if (onRefresh) onRefresh();
        } catch (err) {
            toast.error(err?.response?.data?.message || err?.message || "Failed to process refund");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <Card className="flex flex-col h-full shadow-sm border-border/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                    <CardTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
                        <RotateCcw className="h-5 w-5 text-amber-500" />
                        Cancelled Orders (Paid & Refund Needed)
                    </CardTitle>
                    <CardDescription>
                        Cancelled orders with paid status requiring payment refund processing
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full text-xs font-semibold">
                        {summary.total_orders} Orders Pending
                    </span>
                    <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-full text-xs font-semibold">
                        ₹{summary.total_refund_amount.toLocaleString()} Total
                    </span>
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg bg-muted/20">
                        <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" />
                        <p className="text-sm font-medium text-foreground">No Pending Refunds</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            All cancelled orders with paid status have been refunded.
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead>Order Code</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Cancelled At</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.slice(0, 10).map((order) => (
                                <TableRow key={order._id}>
                                    <TableCell className="font-mono text-xs font-semibold">
                                        {order.code}
                                    </TableCell>
                                    <TableCell className="text-xs">
                                        <div className="font-medium">{order.user?.name || "Guest"}</div>
                                        <div className="text-muted-foreground">{order.user?.email || order.user?.login_id || order.guest_id || "-"}</div>
                                    </TableCell>
                                    <TableCell className="text-xs uppercase font-semibold text-muted-foreground">
                                        {order.payment?.method || "online"}
                                    </TableCell>
                                    <TableCell className="font-semibold text-xs text-rose-600 dark:text-rose-400">
                                        ₹{order.pricing?.total?.toLocaleString() || 0}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {order.cancelled_at ? format(new Date(order.cancelled_at), "MMM dd, yyyy HH:mm") : "-"}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate">
                                        {order.cancellation_reason || "No reason specified"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            variant="default"
                                            disabled={processingId === order._id}
                                            className="h-7 text-xs px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                                            onClick={() => handleRefund(order)}
                                        >
                                            {processingId === order._id ? "Refunding..." : "Acknowledge & Refund"}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
