import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useApi } from "@/core/contexts/api.context";

export default function Cart() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, pricing } = useApi().cart;

  const { subtotal = 0 } = pricing || {};
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="container mx-auto p-6 max-w-6xl animate-in fade-in zoom-in duration-500">
      <h1 className="text-3xl font-bold mb-8 tracking-tight">Shopping Cart</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-0 flex flex-col sm:flex-row items-center">
                <div className="h-32 w-full sm:w-32 bg-muted shrink-0">
                  <img src={item.image || "https://via.placeholder.com/150"} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="p-4 flex-1 flex flex-col sm:flex-row items-center justify-between w-full">
                  <div className="mb-4 sm:mb-0 text-center sm:text-left">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-muted-foreground">₹{(item.price || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                  </div>
                  
                  <div className="flex items-center space-x-4 sm:space-x-6">
                    <div className="flex items-center space-x-2 border rounded-md p-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="text-right font-semibold w-24 hidden sm:block">
                      ₹{((item.price || 0) * item.quantity).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive h-8 w-8"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {items.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Your cart is empty.
            </div>
          )}
        </div>

        <div>
          <Card className="sticky top-24">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold text-xl mb-4">Order Summary</h2>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (8%)</span>
                <span>₹{tax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              
              <Button className="w-full mt-6" size="lg" onClick={() => navigate("/checkout")}>
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
