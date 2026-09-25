import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApi } from "@/core/contexts/api.context";
import { useAuth } from "@/core/contexts/auth.context";
import { useLoader } from "@/core/hooks/useLoader";
import { apiurls } from "@/core/api/api.urls";
import { toast } from "sonner";

export default function Checkout() {
  const navigate = useNavigate();
  const api = useApi();
  const { user } = useAuth();
  const { loadOnly, loading: isProcessing } = useLoader();
  const { items, pricing, clearCart, updateShippingAddress, checkoutDraft } = api.cart;
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetch(apiurls.locations.getAll.url())
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.data)) {
          setLocations(data.data);
        } else if (Array.isArray(data)) {
          setLocations(data);
        }
      })
      .catch(console.error);
  }, []);

  const autoFilled = useRef(false);

  useEffect(() => {
    if (user && locations.length > 0 && !autoFilled.current) {
      autoFilled.current = true;
      const parts = user.name ? user.name.split(" ") : [""];
      const firstName = parts[0];
      const lastName = parts.slice(1).join(" ");
      const address = user.address?.door ? `${user.address.door} ${user.address.street}` : (user.address?.street || "");
      
      const newFormData = {
        ...formData,
        firstName,
        lastName,
        address,
        city: user.address?.city || "",
        state: user.address?.state || "",
        zip: user.address?.pincode ? String(user.address.pincode) : "",
      };
      
      if (user.address?.state) {
         const loc = locations.find(l => l._id === user.address.state);
         if (loc && !loc.deliverable) {
            toast.error("Your default location is not deliverable. Please try another address.");
            newFormData.state = "";
         } else {
            updateShippingAddress({
              door: user.address.door || "",
              street: user.address.street || "",
              city: user.address.city || "",
              state: user.address.state,
              pincode: user.address.pincode || 0,
            });
         }
      }
      setFormData(newFormData);
    }
  }, [user, locations]);

  const handleStateChange = async (val) => {
    const loc = locations.find(l => l._id === val);
    if (loc && !loc.deliverable) {
      toast.error("This location is not deliverable. Please try another address.");
      return;
    }
    
    setFormData(prev => ({ ...prev, state: val }));
    const address = {
      door: formData.address.split(' ')[0] || "",
      street: formData.address,
      city: formData.city,
      state: val,
      pincode: Number(formData.zip) || 0,
    };
    await updateShippingAddress(address);
  };

  const { subtotal, shipping_cost: shipping, total } = pricing || { subtotal: 0, shipping_cost: 0, total: 0 };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    try {
      const res = await loadOnly(() => checkoutDraft("online"));
      if (res) {
        const orderId = res._id || res.id;
        
        const isScriptLoaded = await loadRazorpayScript();
        if (!isScriptLoaded) {
          toast.error("Razorpay SDK failed to load. Are you online?");
          return;
        }
        
        try {
          const rzpOrder = await loadOnly(() => api.payments.createPaymentOrder(orderId));
          
          const options = {
            key: rzpOrder.key_id,
            amount: rzpOrder.amount,
            currency: rzpOrder.currency,
            name: "Torque Toyz",
            description: `Order ${rzpOrder.order_code}`,
            order_id: rzpOrder.razorpay_order_id,
            handler: async function (response) {
              try {
                await loadOnly(() => api.payments.verifyPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                }));
                navigate(`/orders/${orderId}`);
              } catch (err) {
                console.error(err);
                navigate(`/orders/${orderId}`);
              }
            },
            prefill: {
              name: `${formData.firstName} ${formData.lastName}`,
              email: "customer@torquetoyz.com",
              contact: "9999999999",
            },
            theme: {
              color: "#facc15"
            }
          };
          
          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', function (response){
            toast.error(response.error.description);
            navigate(`/orders/${orderId}`);
          });
          rzp.open();
        } catch (err) {
          console.error(err);
          toast.error("Could not initiate payment.");
        }
      }
    } catch (err) {
      console.error("Checkout error:", err.response?.data || err);
      toast.error(err.response?.data?.message || err.message || "Failed to place order.");
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl animate-in fade-in zoom-in duration-500">
      <h1 className="text-3xl font-bold mb-8 tracking-tight">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleCheckout} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" value={formData.firstName} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" value={formData.lastName} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" placeholder="123 Main St" value={formData.address} onChange={handleInputChange} required />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2 col-span-3 sm:col-span-1">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={formData.city} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2 col-span-3 sm:col-span-1">
                    <Label htmlFor="state">State</Label>
                    <Select value={formData.state} onValueChange={handleStateChange}>
                      <SelectTrigger id="state">
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map(loc => (
                          <SelectItem key={loc._id} value={loc._id}>
                            {loc.state} {!loc.deliverable && "(Not Deliverable)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-3 sm:col-span-1">
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input id="zip" value={formData.zip} onChange={handleInputChange} required />
                  </div>
                </div>
              </CardContent>
            </Card>



            <Button type="submit" size="lg" className="w-full" disabled={isProcessing || !formData.state}>
              {isProcessing ? "Processing..." : `Pay ₹${total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
            </Button>
          </form>
        </div>

        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-80 overflow-y-auto space-y-4 pr-2">
                {items.map((item) => (
                  <div key={item.id || item._id} className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-muted rounded overflow-hidden shrink-0">
                      <img src={item.image || (item.images && item.images[0]) || "https://via.placeholder.com/150"} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <div className="font-medium text-sm whitespace-nowrap">₹{((item.price || 0) * item.quantity).toLocaleString("en-IN")}</div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>₹{shipping.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
