import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useApi } from "@/core/contexts/api.context";
import { useLoader } from "@/core/hooks/useLoader";

export default function Orders() {
  const navigate = useNavigate();
  const { orders } = useApi();
  const { loadOnly, loading } = useLoader();
  const orderList = orders.useStore((state) => state.list) || [];

  useEffect(() => {
    loadOnly(orders.getMine);
  }, []);

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
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
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
                    <TableCell className="font-medium">{order._id || order.id}</TableCell>
                    <TableCell>{new Date(order.createdAt || order.date).toLocaleDateString()}</TableCell>
                    <TableCell>${(order.total || 0).toFixed(2)} <span className="text-muted-foreground text-sm">({order.products?.length || order.items || 0} items)</span></TableCell>
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
      </Card>
    </div>
  );
}
