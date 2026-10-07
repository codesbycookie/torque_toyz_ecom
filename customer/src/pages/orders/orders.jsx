import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Loader2, ChevronLeft, ChevronRight, Search, Ban } from "lucide-react";
import { useApi } from "@/core/contexts/api.context";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Orders() {
  const navigate = useNavigate();
  const { orders } = useApi();
  
  const orderList = orders.list || [];
  const isLoading = Boolean(orders.loading?.global || orders.loading?.getMine || orders.loading?.getAll);
  const pagination = orders.pagination || null;
  const [searchTerm, setSearchTerm] = useState("");
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  useEffect(() => {
    orders.getMine();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    orders.getMine({ search: searchTerm, page: 1 });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || (pagination && newPage > pagination.pages)) return;
    orders.getMine({ page: newPage });
  };

  const handleCancelOrder = async (orderId) => {
    try {
      setCancellingOrderId(orderId);
      await orders.cancelOrder(orderId, "Cancelled by customer");
      toast.success("Order cancelled successfully");
      orders.getMine();
    } catch {
      toast.error("Failed to cancel order");
    } finally {
      setCancellingOrderId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered": return "bg-emerald-600 text-white hover:bg-emerald-700";
      case "shipped": return "bg-blue-600 text-white hover:bg-blue-700";
      case "confirmed": return "bg-amber-500 text-black hover:bg-amber-600";
      case "placed": return "bg-sky-600 text-white hover:bg-sky-700";
      case "cancelled": return "bg-red-600 text-white hover:bg-red-700";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const formatStatus = (status) => {
    if (!status) return "Placed";
    return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl animate-in fade-in zoom-in duration-500">
      <h1 className="text-3xl font-bold mb-8 tracking-tight">Order History</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Recent Orders</CardTitle>
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by order code..."
                className="pl-8 w-[250px] h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button type="submit" variant="secondary" className="h-9">Search</Button>
          </form>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : orderList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                orderList.map((order) => {
                  const orderId = order._id || order.id;
                  const statusLower = order.status?.toLowerCase();
                  const canCancel = ["placed", "confirmed"].includes(statusLower);

                  return (
                    <TableRow key={orderId}>
                      <TableCell className="font-medium font-mono">{order.code || orderId}</TableCell>
                      <TableCell>{new Date(order.createdAt || order.date).toLocaleDateString("en-IN")}</TableCell>
                      <TableCell>
                        ₹{(order.pricing?.total || order.total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}{" "}
                        <span className="text-muted-foreground text-xs">
                          ({order.items?.length || order.products?.length || 0} {order.items?.length === 1 ? "item" : "items"})
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`border-none ${getStatusColor(order.status)}`}>
                          {formatStatus(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => navigate(`/orders/${orderId}`)}>
                            View Tracking
                          </Button>

                          {canCancel && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 px-2" disabled={cancellingOrderId === orderId}>
                                  <Ban className="size-3.5 mr-1" /> Cancel
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Order #{order.code || orderId}?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to cancel this order? The order status will be marked as cancelled and stock will be restocked.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Keep Order</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleCancelOrder(orderId)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Cancel Order
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
        {pagination && (
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing page {pagination.page} of {pagination.pages} ({pagination.total} total orders)
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={pageNum === pagination.page ? "default" : "outline"}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              ))}

              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
