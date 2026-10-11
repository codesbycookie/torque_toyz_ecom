'use client';

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useApi } from "@/core/contexts/api.context";
import { useAuth } from "@/core/contexts/auth.context";
import { useLoader } from "@/core/hooks/useLoader";
import { toast } from "sonner";
import {
  CreditCard,
  Banknote,
  ShieldCheck,
  Truck,
  ArrowLeft,
  ArrowRight,
  Lock,
  ShoppingBag,
  Package,
} from "lucide-react";
import { CartStepper } from "@/modules/cart/cart.components";
import {
  ShippingAddressForm,
  ShippingAddressConfirmedCard,
} from "./shipping-address.components";
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
    door: "",
    street: "",
    city: "",
    state: "",
    zip: "",
  });

  const autoFilled = useRef(false);

  // Load Locations / Deliverable States via location module
  useEffect(() => {
    api.locations.fetchLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autofill user details if available
  useEffect(() => {
    if (user && locations.length > 0 && !autoFilled.current) {
      autoFilled.current = true;
      const parts = user.name ? user.name.split(" ") : [""];
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ") || "";

      const newFormData = {
        firstName,
        lastName,
        email: user.email || "",
        phone: user.phone || "",
        door: user.address?.door || "",
        street: user.address?.street || "",
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const pincodeNum = Number(formData.zip);
    if (pincodeNum >= 100000 && pincodeNum <= 999999) {
      const address = {
        door: formData.door ? formData.door.trim() : undefined,
        street: formData.street ? formData.street.trim() : undefined,
        city: formData.city ? formData.city.trim() : undefined,
        state: val,
        pincode: pincodeNum,
      };
      await updateShippingAddress(address);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Step 2 Submission -> Validate and Proceed to Step 3 (Payment)
  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.street.trim() ||
      !formData.city.trim() ||
      !formData.state ||
      !formData.zip.trim()
    ) {
      toast.error("Please fill in all required shipping fields.");
      return;
    }

    if (!/^\d{6}$/.test(formData.zip.trim())) {
      toast.error("PIN Code must be a valid 6-digit postal code.");
      return;
    }

    if (!isStateDeliverable) {
      toast.error("Selected state is not deliverable. Please choose another location.");
      return;
    }

    try {
      setIsUpdatingAddress(true);
      const address = {
        door: formData.door ? formData.door.trim() : undefined,
        street: formData.street ? formData.street.trim() : undefined,
        city: formData.city ? formData.city.trim() : undefined,
        state: formData.state,
        pincode: Number(formData.zip),
      };
      await updateShippingAddress(address);
      setCheckoutStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error("Failed to update shipping address");
    } finally {
      setIsUpdatingAddress(false);
    }
  };

  const { subtotal = 0, tax = 0, shipping_cost: shipping = 0, total = 0 } = pricing || {};
  const grandTotal = total > 0 ? total : subtotal + shipping + tax;

  const cancelOrderAndRestoreCart = async (orderId, cartBackup, errorMessage) => {
    const currentAddress = formData.state && formData.zip
      ? {
          door: formData.door ? formData.door.trim() : undefined,
          street: formData.street ? formData.street.trim() : undefined,
          city: formData.city ? formData.city.trim() : undefined,
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
      door: formData.door ? formData.door.trim() : undefined,
      street: formData.street ? formData.street.trim() : undefined,
      city: formData.city ? formData.city.trim() : undefined,
      state: formData.state,
      pincode: Number(formData.zip),
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
              color: "#e11d48", // Primary brand accent color
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
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="size-20 rounded-2xl bg-muted/40 border border-border/80 flex items-center justify-center mx-auto text-muted-foreground shadow-2xs">
            <ShoppingBag className="size-10 stroke-[1.5] text-primary" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-foreground">
            No Items in Checkout
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your shopping cart is currently empty. Add precision scale models from our catalog before proceeding with checkout.
          </p>
          <Button
            onClick={() => navigate("/products")}
            className="h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-2 shadow-xs cursor-pointer"
          >
            <ShoppingBag className="size-4" />
            <span>Browse Model Catalog</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ─── Breadcrumb Navigation ─── */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
          <Link to="/profile" className="hover:text-primary transition-colors">
            Your Account
          </Link>
          <span>›</span>
          <Link to="/cart" className="hover:text-primary transition-colors">
            Shopping Cart
          </Link>
          <span>›</span>
          <span className="text-foreground font-bold">
            Checkout {checkoutStep === 2 ? "› Shipping Details" : "› Payment & Review"}
          </span>
        </div>

        {/* ─── Stepper Progress ─── */}
        <CartStepper currentStep={checkoutStep} />

        {/* ─── Navigation Header Strip ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
          <div className="flex items-center gap-3">
            {checkoutStep === 2 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/cart")}
                className="h-8.5 rounded-xl text-xs gap-1.5 font-medium hover:border-primary hover:text-primary cursor-pointer"
              >
                <ArrowLeft className="size-3.5" />
                <span>Return to Cart</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCheckoutStep(2)}
                className="h-8.5 rounded-xl text-xs gap-1.5 font-medium hover:border-primary hover:text-primary cursor-pointer"
              >
                <ArrowLeft className="size-3.5" />
                <span>Back to Shipping</span>
              </Button>
            )}

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {checkoutStep === 2 ? "Shipping Destination" : "Payment & Order Finalization"}
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="size-3.5 text-primary" />
            <span className="font-medium text-foreground">256-Bit SSL Encrypted Garage Checkout</span>
          </div>
        </div>

        {/* ─── Checkout Main Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Left Workspace (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {checkoutStep === 2 ? (
              <ShippingAddressForm
                formData={formData}
                onInputChange={handleInputChange}
                locations={locations}
                selectedLocation={selectedLocation}
                isStateDeliverable={isStateDeliverable}
                onStateChange={handleStateChange}
                onSubmit={handleProceedToPayment}
                isUpdating={isUpdatingAddress}
              />
            ) : (
              <form onSubmit={handleFinalCheckout} className="space-y-6">
                {/* Confirmed Shipping Address Summary Card */}
                <ShippingAddressConfirmedCard
                  formData={formData}
                  selectedLocation={selectedLocation}
                  onEditAddress={() => setCheckoutStep(2)}
                />

                {/* Payment Method Selector Card */}
                <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
                  <div className="bg-muted/40 dark:bg-muted/20 border-b border-border/80 px-5 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs shrink-0 shadow-2xs">
                        3
                      </span>
                      <div>
                        <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                          Payment Method Selection
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          Select your preferred settlement channel for this dispatch
                        </p>
                      </div>
                    </div>

                    <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
                      Instant Verification
                    </Badge>
                  </div>

                  <div className="p-5 sm:p-6 space-y-4">
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                      {/* Razorpay Online */}
                      <label
                        className={cn(
                          "flex items-start gap-3.5 p-4 rounded-xl border transition-all bg-card hover:border-primary/50 cursor-pointer",
                          paymentMethod === "online"
                            ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                            : "border-border/80"
                        )}
                      >
                        <RadioGroupItem value="online" id="pay-online" className="mt-1" />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CreditCard className="size-4 text-primary" />
                            <span className="font-bold text-sm text-foreground">
                              Online UPI / Cards
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Razorpay secure gateway. Supports UPI (Google Pay, PhonePe, Paytm), Netbanking, and Credit/Debit Cards.
                          </p>
                        </div>
                      </label>

                      {/* Cash on Delivery */}
                      <label
                        className={cn(
                          "flex items-start gap-3.5 p-4 rounded-xl border transition-all bg-card hover:border-primary/50 cursor-pointer",
                          paymentMethod === "cod"
                            ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                            : "border-border/80"
                        )}
                      >
                        <RadioGroupItem value="cod" id="pay-cod" className="mt-1" />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Banknote className="size-4 text-primary" />
                            <span className="font-bold text-sm text-foreground">
                              Cash on Delivery (COD)
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Pay directly upon physical delivery at your doorstep via cash or courier UPI.
                          </p>
                        </div>
                      </label>
                    </RadioGroup>
                  </div>
                </div>

                {/* Final Submit CTA */}
                <Button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-xs transition-all gap-2 cursor-pointer"
                >
                  {isProcessing
                    ? "Securing Dispatch & Order..."
                    : paymentMethod === "cod"
                    ? `Confirm Order (COD) - ₹${grandTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
                    : `Pay ₹${grandTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })} via Razorpay`}
                  <ArrowRight className="size-4" />
                </Button>
              </form>
            )}
          </div>

          {/* Right Order Items & Pricing Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs sticky top-24">
              <div className="bg-muted/40 dark:bg-muted/20 border-b border-border/80 px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="size-4 text-primary" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Order Summary
                  </h3>
                </div>
                <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
                  {items.length} {items.length === 1 ? "model" : "models"}
                </Badge>
              </div>

              <div className="p-5 space-y-4">
                {/* Items List */}
                <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                  {items.map((item) => {
                    const itemId = item.product || item.id || item._id;
                    const price = Number(item.price || 0);
                    const qty = Number(item.quantity || 1);

                    return (
                      <div key={itemId} className="flex items-center gap-3">
                        <div className="size-14 rounded-xl bg-muted/40 border border-border/80 shrink-0 overflow-hidden flex items-center justify-center p-1">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="size-full object-contain"
                            />
                          ) : (
                            <ShoppingBag className="size-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs truncate leading-snug text-foreground">
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-muted-foreground">
                            Qty: {qty} × ₹{price.toLocaleString("en-IN")}
                          </p>
                        </div>
                        <div className="font-mono font-bold text-xs text-foreground whitespace-nowrap">
                          ₹{(price * qty).toLocaleString("en-IN")}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator className="bg-border/80" />

                {/* Price Breakdown */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-mono font-medium text-foreground">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>GST / Taxes</span>
                    <span className="font-mono font-medium text-foreground">
                      ₹{tax.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping Charges</span>
                    <span className="font-mono font-medium text-foreground">
                      {shipping > 0 ? `₹${shipping.toLocaleString("en-IN")}` : "Free"}
                    </span>
                  </div>
                </div>

                <Separator className="bg-border/80" />

                {/* Total Payable */}
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="font-bold text-sm block text-foreground">Total Payable</span>
                    <span className="text-[10px] text-muted-foreground">All taxes included</span>
                  </div>
                  <span className="font-mono text-xl font-extrabold tracking-tight text-primary">
                    ₹{grandTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Trust and Safety Badges */}
                <div className="pt-3 border-t border-border/80 space-y-2 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-3.5 text-primary shrink-0" />
                    <span>Buyer Protection & Garage Quality Assurance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="size-3.5 text-primary shrink-0" />
                    <span>Tracked Express Carrier Logistics</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
