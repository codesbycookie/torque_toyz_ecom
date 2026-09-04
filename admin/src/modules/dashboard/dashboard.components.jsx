
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Users, CreditCard, Activity, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
    Line
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
            value: data?.total_revenue ? `$${data.total_revenue.toLocaleString()}` : "$0",
            icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
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
            value: data?.avg_order_value ? `$${Math.round(data.avg_order_value).toLocaleString()}` : "$0",
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
                <Card key={idx}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {card.title}
                        </CardTitle>
                        {card.icon}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{card.value}</div>
                        <p className="text-xs text-muted-foreground">
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
            <Card>
                <CardHeader>
                    <CardTitle>Revenue By Month</CardTitle>
                    <CardDescription>Visualizing revenue trends</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px]">
                    <Skeleton className="h-full w-full" />
                </CardContent>
            </Card>
        );
    }

    // Ensure we have at least 6 months of data for a flowing chart
    const defaultMonths = Array.from({ length: 6 }).map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return { month: monthStr, revenue: 0 };
    });

    let chartData = defaultMonths;
    if (data && data.length > 0) {
        // Merge API data into the 6-month timeline
        const dataMap = new Map(data.map(d => [d.month, d.revenue]));
        chartData = defaultMonths.map(dm => ({
            month: dm.month,
            revenue: dataMap.get(dm.month) || 0
        }));

        // If the API returns months outside our default 6 months, we should include them too 
        // by just using the API data directly if it has multiple points.
        if (data.length > 1) {
            chartData = data;
        }
    }

    // Format month for display
    const formattedData = chartData.map(d => {
        const [year, month] = d.month.split('-');
        const date = new Date(year, parseInt(month) - 1);
        return {
            ...d,
            monthFormatted: date.toLocaleString('default', { month: 'short' })
        };
    });

    const config = {
        revenue: {
            label: "Revenue",
            color: "var(--chart-1)",
        },
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Monthly revenue generated</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={config} className="h-[250px] w-full">
                    <AreaChart data={formattedData} margin={{ left: 12, right: 12 }}>
                        <defs>
                            <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="monthFormatted"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Area
                            dataKey="revenue"
                            type="natural"
                            fill="url(#fillRevenue)"
                            fillOpacity={0.4}
                            stroke="var(--color-revenue)"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
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

    const chartData = data && data.length > 0 ? data.map((d, i) => ({
        ...d,
        fill: `var(--chart-${(i % 5) + 1})`
    })) : [
        { status: "pending", count: 0, fill: "var(--chart-1)" },
        { status: "delivered", count: 0, fill: "var(--chart-2)" },
    ];

    const config = chartData.reduce((acc, curr) => {
        acc[curr.status] = { label: curr.status.charAt(0).toUpperCase() + curr.status.slice(1), color: curr.fill };
        return acc;
    }, {});

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>Order Status Breakdown</CardTitle>
                <CardDescription>Current state of all orders</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer config={config} className="mx-auto aspect-square max-h-[250px]">
                    <PieChart>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Pie
                            data={chartData}
                            dataKey="count"
                            nameKey="status"
                            innerRadius={60}
                            strokeWidth={5}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm mt-4">
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
            <Card>
                <CardHeader>
                    <CardTitle>Top Performing Products</CardTitle>
                    <CardDescription>By revenue generated</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px]">
                    <Skeleton className="h-full w-full" />
                </CardContent>
            </Card>
        );
    }

    const truncatedData = (data && data.length > 0 ? data : [
        { name: "Product A", revenue: 0 },
    ]).map(d => ({
        ...d,
        shortName: d.name.length > 15 ? d.name.substring(0, 15) + '...' : d.name
    }));

    const config = {
        revenue: {
            label: "Revenue",
            color: "var(--chart-3)",
        },
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Top Performing Products</CardTitle>
                <CardDescription>Highest grossing items</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={config} className="h-[250px] w-full">
                    <BarChart
                        data={truncatedData}
                        margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="shortName"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            fontSize={12}
                        />
                        <YAxis
                            type="number"
                            hide
                        />
                        <ChartTooltip
                            cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                            content={<ChartTooltipContent />}
                        />
                        <Bar
                            dataKey="revenue"
                            fill="var(--color-revenue)"
                            radius={[4, 4, 0, 0]}
                            barSize={40}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

export function PeakTimesChart({ data, loading }) {
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Peak Order Hours</CardTitle>
                </CardHeader>
                <CardContent className="h-[250px]">
                    <Skeleton className="h-full w-full" />
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
            color: "var(--chart-4)",
        },
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Peak Order Hours</CardTitle>
                <CardDescription>When do customers buy the most?</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={config} className="h-[250px] w-full">
                    <LineChart data={chartData} margin={{ left: 12, right: 12 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="hour"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Line
                            dataKey="orders"
                            type="natural"
                            stroke="var(--color-orders)"
                            strokeWidth={2}
                            dot={{ fill: "var(--color-orders)" }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

// export function InventoryVelocityChart({ data, loading }) {
//     if (loading) {
//         return (
//             <Card className="flex flex-col">
//                 <CardHeader className="items-center pb-4">
//                     <CardTitle>Inventory Velocity</CardTitle>
//                 </CardHeader>
//                 <CardContent className="flex-1 pb-0">
//                     <Skeleton className="h-[250px] w-full rounded-full" />
//                 </CardContent>
//             </Card>
//         );
//     }

//     // Use fastest moving products for the radar chart
//     const chartData = data?.fastest_moving && data.fastest_moving.length > 0 ? data.fastest_moving.slice(0, 5).map(d => ({
//         name: d.name.substring(0, 10), // truncate for radar
//         sold: d.units_sold
//     })) : [
//         { name: "Prod A", sold: 0 },
//     ];

//     const config = {
//         sold: {
//             label: "Units Sold",
//             color: "var(--chart-5)",
//         },
//     };

//     return (
//         <Card className="flex flex-col">
//             <CardHeader className="items-center pb-4">
//                 <CardTitle>Inventory Velocity</CardTitle>
//                 <CardDescription>Fastest moving products this month</CardDescription>
//             </CardHeader>
//             <CardContent className="pb-0">
//                 <ChartContainer config={config} className="mx-auto aspect-square max-h-[250px]">
//                     <RadarChart data={chartData}>
//                         <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
//                         <PolarAngleAxis dataKey="name" />
//                         <PolarGrid />
//                         <Radar
//                             dataKey="sold"
//                             fill="var(--color-sold)"
//                             fillOpacity={0.6}
//                         />
//                     </RadarChart>
//                 </ChartContainer>
//             </CardContent>
//             <CardFooter className="flex-col gap-2 text-sm mt-4">
//                 <div className="flex items-center gap-2 leading-none font-medium">
//                     Fastest moving inventory <TrendingUp className="h-4 w-4" />
//                 </div>
//             </CardFooter>
//         </Card>
//     );
// }

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
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                    You have {orders?.length || 0} orders in this period.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders && orders.length > 0 ? (
                            orders.map((order) => (
                                <TableRow key={order._id || order.id}>
                                    <TableCell>
                                        <div className="font-medium">{order.user?.username || order.user?.email || "Guest"}</div>
                                        <div className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className={cn(
                                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                            order.status === "delivered" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                                                order.status === "cancelled" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                                                    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                        )}>
                                            {order.status}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        ${order.totalPrice?.toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
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
            <Card>
                <CardHeader>
                    <CardTitle>Revenue by Location</CardTitle>
                    <CardDescription>Top regions by sales</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px]">
                    <Skeleton className="h-full w-full" />
                </CardContent>
            </Card>
        );
    }

    const chartData = data && data.length > 0 ? data.map(d => ({
        location: d.state || "Unknown",
        revenue: d.revenue
    })) : [
        { location: "New York", revenue: 0 },
    ];

    const config = {
        revenue: {
            label: "Revenue",
            color: "var(--chart-1)",
        },
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Revenue by Location</CardTitle>
                <CardDescription>Top regions by sales</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={config} className="h-[250px] w-full">
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="location"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            fontSize={12}
                        />
                        <YAxis type="number" hide />
                        <ChartTooltip
                            cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                            content={<ChartTooltipContent />}
                        />
                        <Bar
                            dataKey="revenue"
                            fill="var(--color-revenue)"
                            radius={[4, 4, 0, 0]}
                            barSize={40}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

export function CancellationRefundChart({ data, loading }) {
    if (loading) {
        return (
            <Card className="flex flex-col">
                <CardHeader className="items-center pb-0">
                    <CardTitle>Cancellations & Refunds</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 pb-0 mt-4">
                    <Skeleton className="h-[250px] w-full rounded-full" />
                </CardContent>
            </Card>
        );
    }

    const chartData = [
        { name: "Successful", value: (data?.total || 0) - (data?.cancelled || 0), fill: "var(--chart-2)" },
        { name: "Cancelled", value: data?.cancelled || 0, fill: "var(--chart-5)" },
        { name: "Refunded", value: data?.refunded || 0, fill: "var(--chart-4)" },
    ];

    const config = {
        Successful: { label: "Successful", color: "var(--chart-2)" },
        Cancelled: { label: "Cancelled", color: "var(--chart-5)" },
        Refunded: { label: "Refunded", color: "var(--chart-4)" },
    };

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>Order Outcomes</CardTitle>
                <CardDescription>Success vs Cancellations</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer config={config} className="mx-auto aspect-square max-h-[250px]">
                    <PieChart>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={60}
                            strokeWidth={5}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm mt-4">
                <div className="leading-none text-muted-foreground">
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
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Delivery Time</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{data?.averageHours || 0} hrs</div>
                <p className="text-xs text-muted-foreground">From placed to delivered</p>
            </CardContent>
        </Card>
    );
}

export function InventoryVelocityChart({ data, loading }) {
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Fastest Moving Inventory</CardTitle>
                </CardHeader>
                <CardContent className="h-[250px]">
                    <Skeleton className="h-full w-full" />
                </CardContent>
            </Card>
        );
    }

    const chartData = data?.fastest_moving && data.fastest_moving.length > 0
        ? data.fastest_moving.slice(0, 5).map(d => ({
            name: d.name.length > 15 ? d.name.substring(0, 15) + '...' : d.name,
            sold: d.units_sold
        }))
        : [
            { name: "Product A", sold: 0 },
        ];

    const config = {
        sold: {
            label: "Units Sold",
            color: "var(--chart-3)",
        },
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Inventory Velocity</CardTitle>
                <CardDescription>Highest volume products</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={config} className="h-[250px] w-full">
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="name"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            fontSize={12}
                        />
                        <YAxis type="number" hide />
                        <ChartTooltip
                            cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                            content={<ChartTooltipContent />}
                        />
                        <Bar
                            dataKey="sold"
                            fill="var(--color-sold)"
                            radius={[4, 4, 0, 0]}
                            barSize={40}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
