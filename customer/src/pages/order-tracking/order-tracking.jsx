import React, { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Truck, Package, PackageCheck, Loader2 } from "lucide-react";
import { useApi } from "@/core/contexts/api.context";
import { useLoader } from "@/core/hooks/useLoader";

export default function OrderTracking() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { orders } = useApi();
  const { loadOnly, loading } = useLoader();

  useEffect(() => {
    if (id) {
      loadOnly(async () => {
        try {
          const res = await orders.crud.getOne(id, { __options: { toast: false } });
          orders.setCurrent(res?.data || res || null);
        } catch (err) {
          orders.setCurrent(null);
        }
      });
    }
  }, [id]);

  const orderDetails = orders.useStore(s => s.current);


  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  if (!orderDetails) {
    return <div className="container mx-auto p-6 text-center text-muted-foreground">Order not found.</div>;
  }
  const steps = [
    { label: "Order Placed", status: "completed", date: "Nov 20, 10:00 AM", icon: <Package className="h-5 w-5 text-primary" /> },
    { label: "Processing", status: "completed", date: "Nov 21, 09:30 AM", icon: <PackageCheck className="h-5 w-5 text-primary" /> },
    { label: "Shipped", status: "current", date: "Nov 22, 02:15 PM", icon: <Truck className="h-5 w-5 text-blue-500" /> },
    { label: "Out for Delivery", status: "pending", date: "Pending", icon: <Truck className="h-5 w-5 text-muted-foreground" /> },
    { label: "Delivered", status: "pending", date: "Pending", icon: <CheckCircle2 className="h-5 w-5 text-muted-foreground" /> }
  ];

  return (
    <div className="container mx-auto p-6 max-w-5xl animate-in fade-in zoom-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order {orderDetails.code || orderDetails._id || orderDetails.id}</h1>
          <p className="text-muted-foreground mt-1">Placed on {new Date(orderDetails.createdAt || orderDetails.date).toLocaleDateString()}</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/orders")}>
          Back to Orders
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tracking Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative border-l border-muted-foreground/30 ml-4 space-y-8 pb-4 mt-2">
                {steps.map((step, index) => (
                  <div key={index} className="relative flex items-center pl-8">
                    <div className={`absolute -left-3.5 flex h-7 w-7 items-center justify-center rounded-full border-2 bg-background ${step.status === "completed" ? "border-primary text-primary" :
                        step.status === "current" ? "border-blue-500 text-blue-500 ring-4 ring-blue-500/20" :
                          "border-muted text-muted-foreground"
                      }`}>
                      {step.status === "completed" ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-3 w-3 fill-current" />}
                    </div>
                    <div className="flex-1 flex justify-between items-center bg-muted/30 p-4 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {step.icon}
                        <h4 className={`font-semibold ${step.status === "pending" ? "text-muted-foreground" : ""}`}>{step.label}</h4>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">{step.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Items Ordered</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(orderDetails.products || orderDetails.items || []).map((item) => {
                const prod = item.product || item;
                const quantity = item.quantity || 1;
                const price = item.price || prod.price || 0;

                return (
                  <div key={prod._id || prod.id} className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-muted rounded overflow-hidden">
                      <img src={prod.image || prod.images?.[0] || "https://via.placeholder.com/150"} alt={prod.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{prod.name}</h4>
                      <p className="text-sm text-muted-foreground">Qty: {quantity}</p>
                    </div>
                    <div className="font-semibold">
                      ${(price * quantity).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${(orderDetails.subtotal || orderDetails.total - 10 || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>${(orderDetails.shipping || 10).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${(orderDetails.total || 0).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Details</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1 text-muted-foreground">
              <p className="font-medium text-foreground">{orderDetails.shippingDetails?.firstName} {orderDetails.shippingDetails?.lastName}</p>
              <p>{orderDetails.shippingDetails?.address}</p>
              <p>{orderDetails.shippingDetails?.city}, {orderDetails.shippingDetails?.state} {orderDetails.shippingDetails?.zip}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
