'use client';

import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/core/contexts/auth.context";
import { useApi } from "@/core/contexts/api.context";
import { useLoader } from "@/core/hooks/useLoader";
import { toast } from "sonner";
import {
  User,
  Lock,
  MapPin,
  Bell,
  Truck,
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Package,
  ExternalLink,
  Phone,
  Mail,
  CheckCircle2,
} from "lucide-react";
import {
  AddressModalDialog,
  SavedAddressCard,
} from "@/pages/checkout/shipping-address.components";
import { cn } from "@/lib/utils";

export default function Settings() {
  const { user, setUser, changePassword } = useAuth();
  const api = useApi();
  const { loadOnly, loading: isSavingProfile } = useLoader();
  const { loadOnly: loadOnlyPassword, loading: isUpdatingPassword } = useLoader();

  // Active Tab: "profile" | "addresses" | "security" | "notifications"
  const [activeTab, setActiveTab] = useState("profile");

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Address Book State
  const [storedAddresses, setStoredAddresses] = useState(() => {
    try {
      const raw = localStorage.getItem("torque_garage_addresses");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Notification Switches State
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    milestoneTracking: true,
    rareDrops: true,
    newsletter: false,
  });

  // Fetch locations for deliverability check in Address Book
  useEffect(() => {
    api.locations.fetchLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const locations = useMemo(() => api.locations.list || [], [api.locations.list]);

  // Sync profile form when user context updates during render
  const [prevUser, setPrevUser] = useState(user);
  if (user && user !== prevUser) {
    setPrevUser(user);
    setProfileData({
      name: user.name || "",
      username: user.username || "",
      email: user.email || "",
      phone: user.phone || "",
    });
  }

  // Compute all saved addresses (user.addresses + local storage + default address)
  const savedAddresses = useMemo(() => {
    const combined = [...storedAddresses];

    if (user) {
      if (Array.isArray(user.addresses)) {
        user.addresses.forEach((ua) => {
          const id = ua._id || ua.id;
          if (id && !combined.some((c) => (c._id || c.id) === id)) {
            combined.unshift(ua);
          }
        });
      }

      if (user.address && user.address.state && !combined.some((c) => c.id === "profile_default")) {
        combined.unshift({
          id: "profile_default",
          label: "Primary Profile",
          name: user.name || "Default Contact",
          firstName: user.name ? user.name.split(" ")[0] : "",
          lastName: user.name ? user.name.split(" ").slice(1).join(" ") : "",
          phone: user.phone || "",
          email: user.email || "",
          door: user.address.door || "",
          street: user.address.street || "",
          city: user.address.city || "",
          state: user.address.state,
          zip: user.address.pincode ? String(user.address.pincode) : "",
          pincode: user.address.pincode || 0,
          isDefault: true,
        });
      }
    }

    return combined;
  }, [user, storedAddresses]);

  // Profile input change
  const handleProfileChange = (e) => {
    const { id, value } = e.target;
    setProfileData((prev) => ({ ...prev, [id]: value }));
  };

  // Password input change
  const handlePasswordChange = (e) => {
    const { id, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [id]: value }));
  };

  // Save Profile Handler
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!user?._id) {
      toast.error("Please sign in to update profile details.");
      return;
    }

    try {
      const updateFn = api.users?.edit || api.users?.update;
      if (!updateFn) {
        toast.error("User service is currently unavailable");
        return;
      }

      const updated = await loadOnly(() =>
        updateFn(
          user._id,
          {
            name: profileData.name.trim(),
            username: profileData.username.trim() || undefined,
            email: profileData.email.trim(),
            phone: profileData.phone.trim(),
          },
          { __options: { toast: true, success: "Profile updated successfully!" } }
        )
      );

      if (updated) {
        setUser({ ...user, ...updated });
      }
    } catch (err) {
      console.error("Profile save error:", err);
    }
  };

  // Update Password Handler
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.new.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    if (passwordData.new !== passwordData.confirm) {
      toast.error("New passwords do not match.");
      return;
    }

    try {
      await loadOnlyPassword(() =>
        changePassword(passwordData.current, passwordData.new)
      );
      setPasswordData({ current: "", new: "", confirm: "" });
      toast.success("Security password changed successfully!");
    } catch (err) {
      console.error("Password update error:", err);
    }
  };

  // Save new or edited address from modal dialog
  const handleSaveAddress = (newAddr) => {
    const loc =
      locations.find((l) => String(l._id) === String(newAddr.state)) ||
      locations.find(
        (l) =>
          l.state?.trim().toLowerCase() ===
          (newAddr.stateName || newAddr.state || "").trim().toLowerCase()
      );
    const cleanedAddr = {
      ...newAddr,
      state: loc?._id ? String(loc._id) : newAddr.state,
      stateName: loc?.state || newAddr.stateName || "",
    };

    const exists = storedAddresses.some(
      (a) => (a.id || a._id) === (cleanedAddr.id || cleanedAddr._id)
    );
    let updated;
    if (exists) {
      updated = storedAddresses.map((a) =>
        (a.id || a._id) === (cleanedAddr.id || cleanedAddr._id) ? cleanedAddr : a
      );
    } else {
      updated = [cleanedAddr, ...storedAddresses];
    }

    setStoredAddresses(updated);
    try {
      localStorage.setItem("torque_garage_addresses", JSON.stringify(updated));
    } catch {
      // ignore
    }

    toast.success("Shipping address saved!");
  };

  // Delete saved address
  const handleDeleteAddress = (addrId) => {
    const filtered = storedAddresses.filter((a) => (a.id || a._id) !== addrId);
    setStoredAddresses(filtered);
    try {
      localStorage.setItem("torque_garage_addresses", JSON.stringify(filtered));
    } catch {
      // ignore
    }
    toast.success("Address removed");
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "TT";

  const tabsConfig = [
    { id: "profile", label: "Profile & Identity", icon: User },
    { id: "addresses", label: "Saved Addresses", icon: MapPin, count: savedAddresses.length },
    { id: "security", label: "Security & Credentials", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ─── Page Header Strip ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Account Settings
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground pt-1">
              Manage your profile, saved addresses and notifications
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs font-semibold px-2.5 py-1">
              {user?.login_id ? `ID #${user.login_id}` : "Verified Customer"}
            </Badge>
          </div>
        </div>

        {/* ─── Settings Workspace Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column (4 cols): Collector Identity Pill & Nav Menu */}
          <div className="lg:col-span-4 space-y-6">
            {/* Collector Identity Overview Card */}
            <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
              <div className="bg-muted/40 dark:bg-muted/20 border-b border-border/80 px-5 py-3.5 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Membership
                </span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <span className="size-2 rounded-full bg-primary animate-pulse" />
                  Active
                </span>
              </div>

              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="size-16 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center font-black text-xl text-primary shrink-0 shadow-2xs">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-base sm:text-lg text-foreground truncate">
                      {user?.name || "Customer"}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email || "Signed in"}
                    </p>
                    {user?.username && (
                      <p className="text-[11px] font-mono text-primary pt-0.5">
                        @{user.username}
                      </p>
                    )}
                  </div>
                </div>

                <Separator className="bg-border/70" />

                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Account Role</span>
                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">
                      {user?.role || "Customer"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Saved Destinations</span>
                    <span className="font-bold text-foreground font-mono">
                      {savedAddresses.length} {savedAddresses.length === 1 ? "address" : "addresses"}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/70">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full h-8.5 rounded-xl text-xs font-semibold gap-1.5 hover:border-primary hover:text-primary cursor-pointer"
                  >
                    <Link to="/orders">
                      <Package className="size-3.5 text-primary" />
                      <span>View Orders & Tracking</span>
                      <ExternalLink className="size-3 ml-auto opacity-60" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Vertical Tab Navigation */}
            <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs p-2 space-y-1">
              {tabsConfig.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-2xs font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn("size-4", isActive ? "text-primary-foreground" : "text-primary")} />
                      <span>{tab.label}</span>
                    </div>
                    {tab.count !== undefined && (
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold font-mono",
                          isActive
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column (8 cols): Tab Content Panels */}
          <div className="lg:col-span-8">

            {/* ─── TAB 1: PROFILE DETAILS ─── */}
            {activeTab === "profile" && (
              <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
                <div className="bg-muted/40 dark:bg-muted/20 border-b border-border/80 px-5 sm:px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <User className="size-4 text-primary" />
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-foreground">
                        Profile & Identity Details
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Update your personal credentials and communication contacts
                      </p>
                    </div>
                  </div>

                  <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
                    Saved Live
                  </Badge>
                </div>

                <form onSubmit={handleSaveProfile} className="p-5 sm:p-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-xs font-medium text-foreground">
                        Full Name <span className="text-primary font-bold">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        required
                        className="h-10 text-xs sm:text-sm rounded-xl bg-background border-border/80 focus-visible:ring-primary/30"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="username" className="text-xs font-medium text-foreground">
                        Username
                      </Label>
                      <Input
                        id="username"
                        value={profileData.username}
                        onChange={handleProfileChange}
                        placeholder="e.g. speedster_42"
                        className="h-10 text-xs sm:text-sm rounded-xl bg-background border-border/80 focus-visible:ring-primary/30 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-medium text-foreground">
                        Email Address <span className="text-primary font-bold">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={handleProfileChange}
                          required
                          className="h-10 text-xs sm:text-sm rounded-xl bg-background border-border/80 pl-9 focus-visible:ring-primary/30"
                        />
                        <Mail className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-xs font-medium text-foreground">
                        Phone Number <span className="text-primary font-bold">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="phone"
                          type="tel"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                          required
                          className="h-10 text-xs sm:text-sm rounded-xl bg-background border-border/80 pl-9 focus-visible:ring-primary/30"
                        />
                        <Phone className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/70 flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSavingProfile}
                      className="h-10 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-2 shadow-xs cursor-pointer"
                    >
                      {isSavingProfile ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <span>Save Profile Changes</span>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* ─── TAB 2: GARAGE ADDRESS BOOK ─── */}
            {activeTab === "addresses" && (
              <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
                <div className="bg-muted/40 dark:bg-muted/20 border-b border-border/80 px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <MapPin className="size-4 text-primary" />
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-foreground">
                        Saved Addresses
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Manage your delivery addresses
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => {
                      setEditingAddress(null);
                      setIsAddressModalOpen(true);
                    }}
                    className="h-8.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs gap-1.5 font-bold shadow-2xs cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="size-3.5" />
                    <span>Add New Destination</span>
                  </Button>
                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  {savedAddresses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {savedAddresses.map((addr) => {
                        const addrId = addr.id || addr._id;
                        return (
                          <SavedAddressCard
                            key={addrId}
                            address={addr}
                            isSelected={false}
                            onSelect={() => {}}
                            onEdit={(a) => {
                              setEditingAddress(a);
                              setIsAddressModalOpen(true);
                            }}
                            onDelete={handleDeleteAddress}
                            locations={locations}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-10 px-4 border border-dashed border-border/80 rounded-2xl bg-muted/20 space-y-3">
                      <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                        <MapPin className="size-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-foreground">No Destinations Saved</h3>
                        <p className="text-xs text-muted-foreground pt-1 max-w-sm mx-auto">
                          Add a destination to fast-track precision model checkout.
                        </p>
                      </div>
                      <Button
                        type="button"
                        onClick={() => {
                          setEditingAddress(null);
                          setIsAddressModalOpen(true);
                        }}
                        className="h-9 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold gap-1.5 cursor-pointer"
                      >
                        <Plus className="size-3.5" />
                        <span>Add Your First Address</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── TAB 3: SECURITY & CREDENTIALS ─── */}
            {activeTab === "security" && (
              <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
                <div className="bg-muted/40 dark:bg-muted/20 border-b border-border/80 px-5 sm:px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Lock className="size-4 text-primary" />
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-foreground">
                        Account Password & Security
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Update your authentication password to keep your account secure
                      </p>
                    </div>
                  </div>

                  <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs font-semibold gap-1">
                    <ShieldCheck className="size-3" />
                    <span>256-Bit SSL Protected</span>
                  </Badge>
                </div>

                <form onSubmit={handleUpdatePassword} className="p-5 sm:p-6 space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="current" className="text-xs font-medium text-foreground">
                      Current Password <span className="text-primary font-bold">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="current"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.current}
                        onChange={handlePasswordChange}
                        required
                        className="h-10 text-xs sm:text-sm rounded-xl bg-background border-border/80 pr-10 focus-visible:ring-primary/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="new" className="text-xs font-medium text-foreground">
                        New Password <span className="text-primary font-bold">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="new"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.new}
                          onChange={handlePasswordChange}
                          required
                          className="h-10 text-xs sm:text-sm rounded-xl bg-background border-border/80 pr-10 focus-visible:ring-primary/30"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="confirm" className="text-xs font-medium text-foreground">
                        Confirm New Password <span className="text-primary font-bold">*</span>
                      </Label>
                      <Input
                        id="confirm"
                        type="password"
                        value={passwordData.confirm}
                        onChange={handlePasswordChange}
                        required
                        className="h-10 text-xs sm:text-sm rounded-xl bg-background border-border/80 focus-visible:ring-primary/30"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/70 flex justify-end">
                    <Button
                      type="submit"
                      disabled={isUpdatingPassword}
                      className="h-10 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-2 shadow-xs cursor-pointer"
                    >
                      {isUpdatingPassword ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          <span>Updating Password...</span>
                        </>
                      ) : (
                        <span>Update Password</span>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* ─── TAB 4: DISPATCH & DROP ALERTS ─── */}
            {activeTab === "notifications" && (
              <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
                <div className="bg-muted/40 dark:bg-muted/20 border-b border-border/80 px-5 sm:px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Bell className="size-4 text-primary" />
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-foreground">
                        Notification Preferences
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Customize tracking status alerts and exclusive catalog drops
                      </p>
                    </div>
                  </div>

                  <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
                    Instant Relay
                  </Badge>
                </div>

                <div className="p-5 sm:p-6 space-y-6">
                  {/* Toggle 1 */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Truck className="size-4 text-primary" />
                        <h4 className="font-bold text-sm text-foreground">
                          Order Shipping Updates
                        </h4>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Receive instant SMS and email updates when scale models are inspected, boxed, and handed to courier partners.
                      </p>
                    </div>
                    <Switch
                      checked={notifications.orderUpdates}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({ ...prev, orderUpdates: checked }))
                      }
                    />
                  </div>

                  <Separator className="bg-border/60" />

                  {/* Toggle 2 */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-primary" />
                        <h4 className="font-bold text-sm text-foreground">
                          Local Distribution Milestone Alerts
                        </h4>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Get live notifications when the package arrives at your local delivery hub and is out for delivery.
                      </p>
                    </div>
                    <Switch
                      checked={notifications.milestoneTracking}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({ ...prev, milestoneTracking: checked }))
                      }
                    />
                  </div>

                  <Separator className="bg-border/60" />

                  {/* Toggle 3 */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Bell className="size-4 text-primary" />
                        <h4 className="font-bold text-sm text-foreground">
                          Rare Model Drops & Limited Production Runs
                        </h4>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Early VIP access to limited 1:18, 1:43, and 1:64 diecast models before general catalog release.
                      </p>
                    </div>
                    <Switch
                      checked={notifications.rareDrops}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({ ...prev, rareDrops: checked }))
                      }
                    />
                  </div>

                  <div className="pt-2 border-t border-border/70 flex justify-end">
                    <Button
                      type="button"
                      onClick={() => toast.success("Notification preferences saved!")}
                      className="h-10 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-xs cursor-pointer"
                    >
                      Save Preferences
                    </Button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Address Edit / Add Modal Popup */}
      <AddressModalDialog
        isOpen={isAddressModalOpen}
        onOpenChange={setIsAddressModalOpen}
        onSaveAddress={handleSaveAddress}
        locations={locations}
        initialData={editingAddress}
      />
    </div>
  );
}
