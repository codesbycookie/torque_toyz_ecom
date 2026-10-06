'use client';

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useApi } from "@/core/contexts/api.context";
import { useAuth } from "@/core/contexts/auth.context";
import { useLoader } from "@/core/hooks/useLoader";
import { toast } from "sonner";
import {
  CreditCard,
  Banknote,
  ShieldCheck,
  Truck,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Lock,
  ShoppingBag,
  Edit3,
} from "lucide-react";
import { CartStepper } from "@/modules/cart/cart.components";
import { cn } from "@/lib/utils";

export default function Checkout() {
  const navigate = useNavigate();
  const api = useApi();
  const { user } = useAuth();
  const { loadOnly, loading: isProcessing } = useLoader();
  const { items = [], pricing, updateShippingAddress, checkoutDraft, restoreCart } = api.cart;
  const locations = api.locations.list || [];

  // Checkout Step state: 2 = Shipping Details, 3 = Payment & Order
  const [checkoutStep, setCheckoutStep] = useState(2);
  const [paymentMethod, setPaymentMethod] = useState("online"); // 'online' | 'cod'
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  const autoFilled = useRef(false);

  // Load Locations / Deliverable States via location module
  useEffect(() => {
    api.locations.fetchLocations();
  }, []);

  // Autofill user details if available
  useEffect(() => {
    if (user && locations.length > 0 && !autoFilled.current) {
      autoFilled.current = true;
      const parts = user.name ? user.name.split(" ") : [""];
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ") || "";
      const address = user.address?.door
        ? `${user.address.door} ${user.address.street || ""}`
        : user.address?.street || "";

      const newFormData = {
        firstName,
        lastName,
        email: user.email || "",
        phone: user.phone || "",
        address,
        city: user.address?.city || "",
        state: user.address?.state || "",
        zip: user.address?.pincode ? String(user.address.pincode) : "",
      };

      if (user.address?.state) {
        const loc = locations.find((l) => l._id === user.address.state);
        if (loc && !loc.deliverable) {
          toast.error("Your default location is not deliverable. Please choose another address.");
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

  const selectedLocation = locations.find((l) => l._id === formData.state);
  const isStateDeliverable = selectedLocation ? selectedLocation.deliverable : true;

  const handleStateChange = async (val) => {
    const loc = locations.find((l) => l._id === val);
    if (loc && !loc.deliverable) {
      toast.error("This state is currently not deliverable. Please select a deliverable state.");
      setFormData((prev) => ({ ...prev, state: val }));
      return;
    }

    setFormData((prev) => ({ ...prev, state: val }));
    const address = {
      door: formData.address.split(" ")[0] || "",
      street: formData.address,
      city: formData.city,
      state: val,
      pincode: Number(formData.zip) || 0,
    };
    await updateShippingAddress(address);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Step 2 Submission -> Validate and Proceed to Step 3 (Payment)
  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.address || !formData.city || !formData.state || !formData.zip) {
      toast.error("Please fill in all required shipping fields.");
      return;
    }

    if (!isStateDeliverable) {
      toast.error("Selected state is not deliverable. Please choose another location.");
      return;
    }

    try {
      setIsUpdatingAddress(true);
      const address = {
        door: formData.address.split(" ")[0] || "",
        street: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: Number(formData.zip) || 0,
      };
      await updateShippingAddress(address);
      setCheckoutStep(3);
    } catch {
      toast.error("Failed to update shipping address");
    } finally {
      setIsUpdatingAddress(false);
    }
  };

  const { subtotal = 0, tax = 0, shipping_cost: shipping = 0, total = 0 } = pricing || {};
  const grandTotal = total > 0 ? total : subtotal + shipping + tax;


  const cancelOrderAndRestoreCart = async (orderId, cartBackup, errorMessage) => {
    const currentAddress = formData.state
      ? {
          door: formData.address.split(" ")[0] || "",
          street: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: Number(formData.zip) || 0,
        }
      : null;

    await restoreCart({
      orderId,
      cartBackup,
      errorMessage,
      shippingAddress: currentAddress,
    });

    if (errorMessage) {
      toast.error(errorMessage);
    }
  };

  // Step 3 Submission -> Place Order / Trigger Payment
  const handleFinalCheckout = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    const cartBackup = items.map((i) => ({
      product: typeof i.product === "object" ? i.product?._id || i.product?.id : i.product || i.id || i._id,
      quantity: i.quantity || 1,
    }));

    const currentAddress = {
      door: formData.address.split(" ")[0] || "",
      street: formData.address,
      city: formData.city,
      state: formData.state,
      pincode: Number(formData.zip) || 0,
    };

    try {
      // Step 1: Create order draft in backend
      const res = await loadOnly(() => checkoutDraft(paymentMethod, currentAddress));

      if (res) {
        const orderId = res._id || res.id;

        // If Cash On Delivery, redirect directly to order detail page
        if (paymentMethod === "cod") {
          toast.success("Order placed successfully with Cash on Delivery!");
          navigate(`/orders/${orderId}`);
          return;
        }

        // Online Payment Flow (Razorpay)
        const isScriptLoaded = await api.payments.loadScript();
        if (!isScriptLoaded) {
          await cancelOrderAndRestoreCart(
            orderId,
            cartBackup,
            "Razorpay Payment Gateway failed to load. Please check your internet connection."
          );
          return;
        }

        try {
          const rzpOrder = await loadOnly(() => api.payments.createPaymentOrder(orderId));

          let paymentHandled = false;

          const options = {
            key: rzpOrder.key_id,
            amount: rzpOrder.amount,
            currency: rzpOrder.currency,
            name: "Torque Toyz",
            description: `Order #${rzpOrder.order_code || orderId.slice(-6)}`,
            order_id: rzpOrder.razorpay_order_id,
            handler: async function (response) {
              paymentHandled = true;
              try {
                await loadOnly(() =>
                  api.payments.verifyPayment({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  })
                );
                toast.success("Payment successful!");
                navigate(`/orders/${orderId}`);
              } catch (err) {
                console.error(err);
                await cancelOrderAndRestoreCart(
                  orderId,
                  cartBackup,
                  "Payment verification failed. Please try again."
                );
              }
            },
            modal: {
              ondismiss: async function () {
                if (!paymentHandled) {
                  await cancelOrderAndRestoreCart(
                    orderId,
                    cartBackup,
                    "Payment was cancelled. You can try again or select Cash on Delivery."
                  );
                }
              },
            },
            prefill: {
              name: `${formData.firstName} ${formData.lastName}`.trim(),
              email: formData.email || user?.email || "customer@torquetoyz.com",
              contact: formData.phone || user?.phone || "9999999999",
            },
            theme: {
              color: "#facc15",
            },
          };

          const rzp = new window.Razorpay(options);
          rzp.on("payment.failed", async function (response) {
            paymentHandled = true;
            const msg = response.error?.description || "Payment failed";
            await cancelOrderAndRestoreCart(orderId, cartBackup, msg);
          });
          rzp.open();
        } catch (err) {
          console.error("Payment initialization error:", err);
          await cancelOrderAndRestoreCart(
            orderId,
            cartBackup,
            "Could not initiate online payment. Please try again."
          );
        }
      }
    } catch (err) {
      console.error("Checkout error:", err.response?.data || err);
      toast.error(
        err.response?.data?.message || err.message || "Failed to place order. Please try again."
      );
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="size-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 text-muted-foreground">
          <ShoppingBag className="size-10 stroke-[1.5]" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">No Items to Checkout</h2>
        <p className="text-sm text-muted-foreground mb-6">Your cart is empty. Add products to your cart before proceeding.</p>
        <Button onClick={() => navigate("/products")} className="gap-2 font-semibold">
          <ShoppingBag className="size-4" /> Browse Store
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 min-h-[85vh]">
      {/* Checkout Stepper Progress (Step 2 or 3) */}
      <CartStepper currentStep={checkoutStep} />

      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <div className="flex items-center gap-3">
          {checkoutStep === 2 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/cart")}
              className="gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" /> Return to Cart
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCheckoutStep(2)}
              className="gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" /> Back to Shipping Details
            </Button>
          )}
          <Separator orientation="vertical" className="h-4" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {checkoutStep === 2 ? "Shipping Details" : "Payment & Order"}
          </h1>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="size-3.5 text-emerald-600" />
          <span>Encrypted SSL Payment</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Form (Step 2 or Step 3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 2: SHIPPING DETAILS FORM */}
          {checkoutStep === 2 && (
            <form onSubmit={handleProceedToPayment} className="space-y-6">
              <Card className="border shadow-xs">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs">
                        2
                      </span>
                      <CardTitle className="text-lg">Shipping Address</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-xs font-normal">
                      <MapPin className="size-3 mr-1 text-primary" /> Delivery Info
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName" className="text-xs font-medium">First Name *</Label>
                      <Input id="firstName" value={formData.firstName} onChange={handleInputChange} required className="h-9 text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName" className="text-xs font-medium">Last Name *</Label>
                      <Input id="lastName" value={formData.lastName} onChange={handleInputChange} required className="h-9 text-sm" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-medium">Email Address</Label>
                      <Input id="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleInputChange} className="h-9 text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-xs font-medium">Phone Number</Label>
                      <Input id="phone" type="tel" placeholder="+91 9876543210" value={formData.phone} onChange={handleInputChange} className="h-9 text-sm" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="address" className="text-xs font-medium">Street Address / House No. *</Label>
                    <Input id="address" placeholder="Flat No., Building, Street Name" value={formData.address} onChange={handleInputChange} required className="h-9 text-sm" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="city" className="text-xs font-medium">City *</Label>
                      <Input id="city" value={formData.city} onChange={handleInputChange} required className="h-9 text-sm" />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="state" className="text-xs font-medium">State / Region *</Label>
                      <Select value={formData.state} onValueChange={handleStateChange}>
                        <SelectTrigger id="state" className="h-9 text-sm">
                          <SelectValue placeholder="Select State" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((loc) => (
                            <SelectItem key={loc._id} value={loc._id}>
                              {loc.state} {!loc.deliverable && "(Not Deliverable)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="zip" className="text-xs font-medium">PIN Code *</Label>
                      <Input id="zip" value={formData.zip} onChange={handleInputChange} required className="h-9 text-sm" />
                    </div>
                  </div>

                  {/* Deliverability Warning */}
                  {formData.state && !isStateDeliverable && (
                    <Alert variant="destructive" className="mt-3">
                      <AlertCircle className="size-4" />
                      <AlertTitle className="text-xs font-semibold">Location Not Deliverable</AlertTitle>
                      <AlertDescription className="text-xs">
                        We currently do not ship to the selected state. Please select a deliverable state to continue.
                      </AlertDescription>
                    </Alert>
                  )}

                  {formData.state && isStateDeliverable && (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                      <CheckCircle2 className="size-4 shrink-0" />
                      <span>Shipping available to this address via Express Logistics!</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button
                type="submit"
                size="lg"
                disabled={isUpdatingAddress || !formData.state || !isStateDeliverable}
                className="w-full font-bold gap-2 text-base py-6 shadow-md hover:shadow-lg transition-all"
              >
                {isUpdatingAddress ? "Saving Address..." : "Continue to Payment"}
                <ArrowRight className="size-5" />
              </Button>
            </form>
          )}

          {/* STEP 3: PAYMENT & ORDER REVIEW */}
          {checkoutStep === 3 && (
            <form onSubmit={handleFinalCheckout} className="space-y-6">
              {/* Confirmed Shipping Address Summary Card */}
              <Card className="border bg-card shadow-2xs">
                <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Delivering to:
                      </span>
                      <Badge variant="secondary" className="text-[10px] font-medium">
                        {selectedLocation?.state}
                      </Badge>
                    </div>
                    <p className="font-semibold text-sm">
                      {formData.firstName} {formData.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formData.address}, {formData.city}, {selectedLocation?.state} - {formData.zip}
                    </p>
                    {formData.phone && (
                      <p className="text-xs text-muted-foreground">Phone: {formData.phone}</p>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCheckoutStep(2)}
                    className="gap-1.5 text-xs font-medium shrink-0"
                  >
                    <Edit3 className="size-3.5" /> Edit
                  </Button>
                </CardContent>
              </Card>

              {/* Payment Method Selector */}
              <Card className="border shadow-xs">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs">
                        3
                      </span>
                      <CardTitle className="text-lg">Select Payment Method</CardTitle>
                    </div>
                    <Badge variant="secondary" className="text-xs font-semibold">
                      100% Encrypted
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    {/* Razorpay Online */}
                    <label
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all bg-card hover:border-primary/50",
                        paymentMethod === "online" && "border-primary bg-primary/5 ring-1 ring-primary"
                      )}
                    >
                      <RadioGroupItem value="online" id="pay-online" className="mt-1" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CreditCard className="size-4 text-primary" />
                          <span className="font-semibold text-sm">Online Payment / UPI</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Pay securely using Razorpay, Credit/Debit Card, Netbanking, or UPI apps.
                        </p>
                      </div>
                    </label>

                    {/* Cash on Delivery */}
                    <label
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all bg-card hover:border-primary/50",
                        paymentMethod === "cod" && "border-primary bg-primary/5 ring-1 ring-primary"
                      )}
                    >
                      <RadioGroupItem value="cod" id="pay-cod" className="mt-1" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Banknote className="size-4 text-emerald-600" />
                          <span className="font-semibold text-sm">Cash on Delivery (COD)</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Pay cash directly to the courier partner upon package delivery.
                        </p>
                      </div>
                    </label>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Final Submit Button */}
              <Button
                type="submit"
                size="lg"
                disabled={isProcessing}
                className="w-full font-bold gap-2 text-base py-6 shadow-md hover:shadow-lg transition-all"
              >
                {isProcessing
                  ? "Processing Order..."
                  : paymentMethod === "cod"
                  ? `Place Order (COD) - ₹${grandTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
                  : `Pay ₹${grandTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })} via Razorpay`}
              </Button>
            </form>
          )}
        </div>

        {/* Right Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 border shadow-xs overflow-hidden">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold">Order Items</CardTitle>
                <Badge variant="secondary" className="text-xs font-semibold">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              {/* Product List */}
              <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                {items.map((item) => {
                  const itemId = item.product || item.id || item._id;
                  const price = Number(item.price || 0);
                  const qty = Number(item.quantity || 1);

                  return (
                    <div key={itemId} className="flex items-center gap-3">
                      <div className="size-14 rounded-lg bg-muted/40 border shrink-0 overflow-hidden flex items-center justify-center p-1">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="size-full object-contain" />
                        ) : (
                          <ShoppingBag className="size-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-xs truncate leading-snug">{item.name}</h4>
                        <p className="text-[11px] text-muted-foreground">Qty: {qty} × ₹{price.toLocaleString("en-IN")}</p>
                      </div>
                      <div className="font-bold text-xs whitespace-nowrap">
                        ₹{(price * qty).toLocaleString("en-IN")}
                      </div>
                    </div>
                  );
                })}
              </div>

              <Separator />

              {/* Pricing Breakdown */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-medium text-foreground">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>GST / Tax</span>
                  <span className="font-medium text-foreground">
                    ₹{tax.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping Charges</span>
                  <span className="font-medium text-foreground">
                    {shipping > 0 ? `₹${shipping.toLocaleString("en-IN")}` : "Free"}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Grand Total */}
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="font-bold text-base block">Total Payable</span>
                  <span className="text-[10px] text-muted-foreground">All taxes included</span>
                </div>
                <span className="text-xl font-extrabold tracking-tight text-primary">
                  ₹{grandTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Security & Support Guarantee */}
              <div className="pt-3 border-t space-y-2 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-3.5 text-emerald-600 shrink-0" />
                  <span>Buyer Protection Guaranteed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="size-3.5 text-primary shrink-0" />
                  <span>Tracked Express Shipping</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
