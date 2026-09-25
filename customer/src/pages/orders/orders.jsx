import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useApi } from "@/core/contexts/api.context";
import { Input } from "@/components/ui/input";

export default function Orders() {
  const navigate = useNavigate();
  const { orders } = useApi();
  
  const orderList = orders.useStore((state) => state.list) || [];
  const loading = orders.useStore((state) => state.loading);
  const pagination = orders.useStore((state) => state.pagination);
  const [searchTerm, setSearchTerm] = useState("");

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

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered": return "bg-green-500 hover:bg-green-600";
      case "Shipped": return "bg-blue-500 hover:bg-blue-600";
      case "Processing": return "bg-yellow-500 hover:bg-yellow-600 text-yellow-950";
      default: return "bg-gray-500 hover:bg-gray-600";
    }
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
              {loading ? (
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
                orderList.map((order) => (
                  <TableRow key={order._id || order.id}>
                    <TableCell className="font-medium">{order.code || order._id || order.id}</TableCell>
                    <TableCell>{new Date(order.createdAt || order.date).toLocaleDateString()}</TableCell>
                    <TableCell>${(order.pricing?.total || order.total || 0).toFixed(2)} <span className="text-muted-foreground text-sm">({order.products?.length || order.items?.length || 0} items)</span></TableCell>
                    <TableCell>
                      <Badge className={`border-none ${getStatusColor(order.status)}`}>
                        {order.status || "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/orders/${order._id || order.id}`)}>
                        View Tracking
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
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
