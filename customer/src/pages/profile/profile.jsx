'use client';

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/core/contexts/auth.context';
import { useApi } from '@/core/contexts/api.context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  KeyRound,
  LogOut,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Lock,
  Package,
  Truck,
  Heart,
  ExternalLink,
  Settings as SettingsIcon,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Car,
  ShieldCheck,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Helper to extract initials
function getInitials(name, email) {
  if (name && name.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return 'TT';
}

// Password update dialog modal
function ChangePasswordDialog({ onSubmit }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const reset = () => {
    setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setError('');
    setShowCurrent(false);
    setShowNew(false);
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    try {
      setSubmitting(true);
      await onSubmit(form.currentPassword, form.newPassword);
      toast.success('Password updated successfully!');
      setOpen(false);
      reset();
    } catch {
      setError('Could not update password. Please check your current password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-border/80 text-xs font-semibold gap-1.5 hover:border-primary hover:text-primary cursor-pointer"
        >
          <KeyRound className="size-3.5 text-primary" />
          <span>Change Password</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-xl">
        <DialogHeader>
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary">
            <Lock className="size-5" />
          </div>
          <DialogTitle className="text-center text-lg font-bold text-foreground">
            Change Garage Password
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-muted-foreground">
            Enter your current security password and set a new one.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword" className="text-xs font-medium text-foreground">
              Current Password <span className="text-primary font-bold">*</span>
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrent ? 'text' : 'password'}
                value={form.currentPassword}
                onChange={handleChange('currentPassword')}
                autoComplete="current-password"
                required
                className="h-10 text-xs rounded-xl pr-10 bg-background border-border/80 focus-visible:ring-primary/30"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                aria-label={showCurrent ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4 text-muted-foreground" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="newPassword" className="text-xs font-medium text-foreground">
              New Password (min. 6 chars) <span className="text-primary font-bold">*</span>
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNew ? 'text' : 'password'}
                value={form.newPassword}
                onChange={handleChange('newPassword')}
                autoComplete="new-password"
                required
                className="h-10 text-xs rounded-xl pr-10 bg-background border-border/80 focus-visible:ring-primary/30"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                aria-label={showNew ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4 text-muted-foreground" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-xs font-medium text-foreground">
              Confirm New Password <span className="text-primary font-bold">*</span>
            </Label>
            <Input
              id="confirmPassword"
              type={showNew ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={handleChange('confirmPassword')}
              autoComplete="new-password"
              required
              className="h-10 text-xs rounded-xl bg-background border-border/80 focus-visible:ring-primary/30"
            />
          </div>

          {error && (
            <Alert variant="destructive" className="py-2.5 rounded-xl border-destructive/30 bg-destructive/10 text-destructive">
              <AlertCircle className="size-4" />
              <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
              className="rounded-xl text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="rounded-xl text-xs h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5 cursor-pointer"
            >
              {submitting && <Loader2 className="size-3.5 animate-spin" />}
              Update Password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Skeleton Loader
function ProfileSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <Skeleton className="size-24 rounded-2xl" />
          <div className="space-y-2 flex-1 text-center sm:text-left">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-60" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
        <div className="lg:col-span-5 space-y-6">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-56 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const { user, loading, changePassword, logout } = useAuth();
  const api = useApi();

  // Local storage stored addresses (same cache used in checkout & settings)
  const storedAddresses = useMemo(() => {
    try {
      const raw = localStorage.getItem('torque_garage_addresses');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  // Fetch recent orders & wishlist for live metrics
  useEffect(() => {
    if (api.orders?.getMine) {
      api.orders.getMine({ page: 1, limit: 3, sortBy: 'createdAt', order: 'desc' });
    }
    if (api.wishlist?.fetchAll) {
      api.wishlist.fetchAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute all saved addresses
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

      if (user.address && user.address.state && !combined.some((c) => c.id === 'profile_default')) {
        combined.unshift({
          id: 'profile_default',
          label: 'Primary Profile',
          name: user.name || 'Default Contact',
          firstName: user.name ? user.name.split(' ')[0] : '',
          lastName: user.name ? user.name.split(' ').slice(1).join(' ') : '',
          phone: user.phone || '',
          email: user.email || '',
          door: user.address.door || '',
          street: user.address.street || '',
          city: user.address.city || '',
          state: user.address.state || '',
          pincode: user.address.pincode || '',
          isDefault: true,
        });
      }
    }

    return combined;
  }, [user, storedAddresses]);

  // Primary address
  const primaryAddress = useMemo(() => {
    return savedAddresses.find((a) => a.isDefault) || savedAddresses[0] || null;
  }, [savedAddresses]);

  // Orders list and stats
  const orderList = useMemo(() => api.orders?.list || [], [api.orders?.list]);
  const totalOrdersCount = api.orders?.pagination?.total ?? orderList.length;
  const recentOrders = useMemo(() => orderList.slice(0, 3), [orderList]);
  const activeOrdersCount = useMemo(() => {
    return orderList.filter((o) =>
      ['placed', 'confirmed', 'shipped'].includes(o.status?.toLowerCase())
    ).length;
  }, [orderList]);

  // Wishlist count
  const wishlistCount = api.wishlist?.list?.length || 0;

  if (loading) return <ProfileSkeleton />;

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-md mx-auto text-center space-y-4 rounded-2xl border border-dashed border-border/80 bg-card p-10">
          <div className="size-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto shadow-xs">
            <User className="size-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-foreground">Sign In Required</h2>
            <p className="text-xs text-muted-foreground">
              Please authenticate to access your collector profile and garage dispatches.
            </p>
          </div>
          <Button
            asChild
            className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-10 shadow-xs"
          >
            <Link to="/login">Sign In to Torque Toyzz</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Format joined date
  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
        month: 'short',
        year: 'numeric',
      })
    : '2024';

  const collectorId = user._id
    ? `TT-${user._id.slice(-6).toUpperCase()}`
    : 'TT-COLLECTOR';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* ─── Breadcrumb & Title ─── */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          <Link to="/" className="hover:text-foreground transition-colors">
            Torque Toyzz
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground font-semibold">Collector Profile</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground uppercase">
              Collector Garage Profile
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Command dashboard for your personal fleet, shipment activity, and garage preferences
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-xl border-border/80 text-xs font-semibold gap-1.5 hover:border-primary hover:text-primary cursor-pointer shadow-2xs h-9"
            >
              <Link to="/settings">
                <SettingsIcon className="size-3.5 text-primary" />
                <span>Garage Settings</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="rounded-xl border-border/80 text-xs font-semibold gap-1.5 text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10 cursor-pointer shadow-2xs h-9"
            >
              <LogOut className="size-3.5" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Collector Hero Profile Card ─── */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs relative">
        {/* Banner with subtle dark racing speed lines */}
        <div className="h-28 sm:h-32 bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border-b border-border/80 relative overflow-hidden flex items-center justify-between px-6">
          <div className="flex items-center gap-2 opacity-15 text-white font-black tracking-widest text-4xl select-none uppercase pointer-events-none">
            <Car className="size-12" />
            <span>TORQUE TOYZZ GARAGE</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Badge className="bg-primary/20 text-primary border border-primary/30 text-[10px] font-mono uppercase tracking-wider px-2.5 py-1">
              {collectorId}
            </Badge>
          </div>
        </div>

        {/* Profile Identity Bar */}
        <div className="p-5 sm:p-6 relative -mt-12 sm:-mt-14 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-5">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            {/* Avatar */}
            <div className="size-24 sm:size-26 rounded-2xl border-4 border-card bg-muted p-1 shadow-md ring-1 ring-border/80 flex items-center justify-center shrink-0 overflow-hidden bg-gradient-to-br from-neutral-800 to-neutral-950">
              {user.profile?.url ? (
                <img
                  src={user.profile.url}
                  alt={user.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <span className="text-2xl sm:text-3xl font-black text-primary font-mono tracking-wider">
                  {getInitials(user.name, user.email)}
                </span>
              )}
            </div>

            {/* User Meta */}
            <div className="space-y-1.5 pb-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                  {user.name}
                </h2>
                <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold uppercase tracking-wider">
                  Verified Collector
                </Badge>
                {user.role && (
                  <Badge variant="outline" className="text-[10px] font-medium capitalize border-border/80 text-muted-foreground">
                    {user.role}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {user.username && (
                  <span className="font-mono text-foreground font-semibold">
                    @{user.username}
                  </span>
                )}
                <span>{user.email}</span>
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <Calendar className="size-3 text-primary" />
                  Pit Crew Since {joinedDate}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Links */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-xl border-border/80 text-xs font-semibold gap-1.5 hover:border-primary hover:text-primary cursor-pointer shadow-2xs h-9"
            >
              <Link to="/wishlist">
                <Heart className="size-3.5 text-primary" />
                <span>Wishlist ({wishlistCount})</span>
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs gap-1.5 cursor-pointer shadow-xs h-9"
            >
              <Link to="/orders">
                <Package className="size-3.5" />
                <span>Track Orders</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Collector Live Statistics Cards (4 Columns) ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Orders Placed */}
        <Link
          to="/orders"
          className="group rounded-2xl border border-border/80 bg-card p-4 sm:p-5 hover:border-primary/60 transition-all shadow-2xs flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Fleet Orders</span>
            <div className="size-8 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-foreground font-mono">
              {totalOrdersCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Machines ordered all time
            </p>
          </div>
        </Link>

        {/* Active In Transit */}
        <Link
          to="/orders"
          className="group rounded-2xl border border-border/80 bg-card p-4 sm:p-5 hover:border-primary/60 transition-all shadow-2xs flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Active In Route</span>
            <div className="size-8 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Truck className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-foreground font-mono">
              {activeOrdersCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Dispatches currently in motion
            </p>
          </div>
        </Link>

        {/* Wishlist Garage */}
        <Link
          to="/wishlist"
          className="group rounded-2xl border border-border/80 bg-card p-4 sm:p-5 hover:border-primary/60 transition-all shadow-2xs flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Garage Wishlist</span>
            <div className="size-8 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Heart className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-foreground font-mono">
              {wishlistCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Saved diecast models
            </p>
          </div>
        </Link>

        {/* Garage Destinations */}
        <Link
          to="/settings"
          className="group rounded-2xl border border-border/80 bg-card p-4 sm:p-5 hover:border-primary/60 transition-all shadow-2xs flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Delivery Bays</span>
            <div className="size-8 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <MapPin className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-foreground font-mono">
              {savedAddresses.length}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Verified destination addresses
            </p>
          </div>
        </Link>
      </div>

      {/* ─── Main Content Grid (7 cols left, 5 cols right) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Recent Dispatches & Primary Address */}
        <div className="lg:col-span-7 space-y-6">
          {/* Recent Orders Card */}
          <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
            <div className="bg-muted/40 dark:bg-muted/20 border-b border-border/80 px-5 sm:px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Package className="size-4 text-primary" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-foreground">
                    Recent Fleet Dispatches
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Latest diecast and RC shipments linked to your garage
                  </p>
                </div>
              </div>

              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 rounded-xl h-8 px-2.5 cursor-pointer"
              >
                <Link to="/orders">
                  <span>View All</span>
                  <ArrowRight className="size-3.5 ml-1" />
                </Link>
              </Button>
            </div>

            <div className="p-4 sm:p-5">
              {recentOrders.length === 0 ? (
                <div className="py-10 text-center space-y-3">
                  <div className="size-12 rounded-2xl bg-muted border border-border/80 flex items-center justify-center mx-auto text-muted-foreground">
                    <Car className="size-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground">No orders in your fleet yet</p>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      Explore our 1:18, 1:24, and 1:64 collector diecasts to start your garage!
                    </p>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-9 cursor-pointer shadow-xs"
                  >
                    <Link to="/products">
                      <span>Explore Catalog</span>
                      <ArrowRight className="size-3.5 ml-1.5" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {recentOrders.map((order) => {
                    const orderId = order._id || order.id;
                    const orderCode =
                      order.code || (order._id ? order._id.slice(-8).toUpperCase() : 'ORD');
                    const orderDate = order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Recent';
                    const orderTotal = Number(order.pricing?.total || order.total || 0);
                    const items = order.items || order.products || [];
                    const statusLower = order.status?.toLowerCase();
                    const isDelivered = statusLower === 'delivered';
                    const isShipped = statusLower === 'shipped';
                    const isCancelled = statusLower === 'cancelled';

                    return (
                      <div
                        key={orderId}
                        className="rounded-xl border border-border/80 bg-background/50 hover:border-border hover:bg-muted/30 p-3.5 sm:p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Image preview of first product */}
                          <div className="size-14 rounded-xl bg-card border border-border/80 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                            {items[0] && (items[0].image || items[0].product?.images?.[0]?.url || items[0].product?.images?.[0]) ? (
                              <img
                                src={
                                  items[0].image ||
                                  items[0].product?.images?.[0]?.url ||
                                  items[0].product?.images?.[0]
                                }
                                alt="Diecast"
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <Car className="size-6 text-muted-foreground/50" />
                            )}
                          </div>

                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-bold text-foreground">
                                #{orderCode}
                              </span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-[10px] font-bold uppercase tracking-wider px-2 py-0',
                                  isDelivered && 'border-border/80 bg-muted/60 text-foreground',
                                  isShipped && 'border-primary/30 bg-primary/10 text-primary',
                                  isCancelled && 'border-destructive/20 bg-destructive/10 text-destructive',
                                  !isDelivered && !isShipped && !isCancelled && 'border-border/80 bg-muted/40 text-foreground'
                                )}
                              >
                                {order.status || 'Processing'}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {items.length} {items.length === 1 ? 'machine' : 'machines'} • Ordered on {orderDate}
                            </p>
                            <p className="text-xs font-bold font-mono text-foreground">
                              ₹{orderTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="rounded-xl text-xs h-8 px-3 border-border/80 hover:border-primary hover:text-primary cursor-pointer"
                          >
                            <Link to={`/orders/${orderId}?view=tracking`}>
                              <Truck className="size-3 text-primary mr-1" />
                              <span>Track</span>
                            </Link>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-muted/30 border-t border-border/80 px-5 py-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>Need help with a package?</span>
              <Link to="/orders" className="text-primary font-semibold hover:underline flex items-center gap-1">
                <span>View Full Order History</span>
                <ChevronRight className="size-3" />
              </Link>
            </div>
          </div>

          {/* Primary Garage Shipping Destination */}
          <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
            <div className="bg-muted/40 dark:bg-muted/20 border-b border-border/80 px-5 sm:px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <MapPin className="size-4 text-primary" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-foreground">
                    Primary Dispatch Bay
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Default shipping address for your diecast deliveries
                  </p>
                </div>
              </div>

              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 rounded-xl h-8 px-2.5 cursor-pointer"
              >
                <Link to="/settings">
                  <span>Manage All</span>
                  <ExternalLink className="size-3 ml-1" />
                </Link>
              </Button>
            </div>

            <div className="p-5 sm:p-6">
              {primaryAddress ? (
                <div className="rounded-xl border border-border/80 bg-background/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-foreground">
                        {primaryAddress.label || 'Primary Destination'}
                      </span>
                      <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-semibold">
                        Default Bay
                      </Badge>
                    </div>

                    <span className="text-xs font-mono text-muted-foreground">
                      {primaryAddress.phone || user.phone || 'No phone'}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground leading-relaxed">
                    <p className="font-semibold text-foreground">
                      {primaryAddress.name || `${primaryAddress.firstName || ''} ${primaryAddress.lastName || ''}`.trim() || user.name}
                    </p>
                    <p>
                      {[primaryAddress.door, primaryAddress.street].filter(Boolean).join(', ')}
                    </p>
                    <p>
                      {[primaryAddress.city, primaryAddress.state, primaryAddress.pincode].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border/80 p-6 text-center space-y-3">
                  <MapPin className="size-8 text-muted-foreground/50 mx-auto" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-foreground">No Shipping Address Saved</p>
                    <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                      Add a shipping address to your garage so you can checkout quickly!
                    </p>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 cursor-pointer"
                  >
                    <Link to="/settings">
                      <span>Add Destination in Settings</span>
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Identity Details & Security Hub */}
        <div className="lg:col-span-5 space-y-6">
          {/* Identity & Account Card */}
          <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
            <div className="bg-muted/40 dark:bg-muted/20 border-b border-border/80 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="size-4 text-primary" />
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Collector Credentials
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Personal identity and contact info
                  </p>
                </div>
              </div>

              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 rounded-xl h-8 px-2 cursor-pointer"
              >
                <Link to="/settings">
                  <span>Edit</span>
                </Link>
              </Button>
            </div>

            <div className="p-5 space-y-3.5 divide-y divide-border/60">
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-muted-foreground flex items-center gap-2">
                  <User className="size-3.5 text-primary" />
                  <span>Full Name</span>
                </span>
                <span className="font-semibold text-foreground">{user.name}</span>
              </div>

              <div className="flex items-center justify-between text-xs pt-3.5">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Shield className="size-3.5 text-primary" />
                  <span>Handle</span>
                </span>
                <span className="font-mono font-bold text-foreground">
                  {user.username ? `@${user.username}` : 'Not set'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-3.5">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Mail className="size-3.5 text-primary" />
                  <span>Email</span>
                </span>
                <span className="font-mono text-foreground truncate max-w-[180px]">{user.email}</span>
              </div>

              <div className="flex items-center justify-between text-xs pt-3.5">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Phone className="size-3.5 text-primary" />
                  <span>Mobile Phone</span>
                </span>
                <span className="font-mono text-foreground">{user.phone || 'Not set'}</span>
              </div>

              <div className="flex items-center justify-between text-xs pt-3.5">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Sparkles className="size-3.5 text-primary" />
                  <span>Collector Tier</span>
                </span>
                <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-semibold">
                  VIP Pit Crew Tier 1
                </Badge>
              </div>
            </div>
          </div>

          {/* Security & Password Hub */}
          <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
            <div className="bg-muted/40 dark:bg-muted/20 border-b border-border/80 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Lock className="size-4 text-primary" />
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Security & Credentials
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Password protection & active sessions
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-background/50">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-foreground">Account Password</span>
                  <p className="text-[11px] font-mono text-muted-foreground">••••••••••••</p>
                </div>

                <ChangePasswordDialog onSubmit={(curr, next) => changePassword(curr, next)} />
              </div>

              <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <CheckCircle2 className="size-3.5 text-primary" />
                  <span>Two-Factor Protection Ready</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Your credentials are guarded by encrypted token authentication across all Torque Toyzz sessions.
                </p>
              </div>
            </div>
          </div>

          {/* Collector Perks & Fast Links */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-3.5 shadow-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Garage Quick Commands
              </h3>
            </div>

            <div className="space-y-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full justify-between h-9 text-xs rounded-xl border-border/80 hover:border-primary hover:text-primary cursor-pointer"
              >
                <Link to="/products">
                  <div className="flex items-center gap-2">
                    <Car className="size-3.5 text-primary" />
                    <span>Explore Diecast Catalog</span>
                  </div>
                  <ChevronRight className="size-3 opacity-60" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full justify-between h-9 text-xs rounded-xl border-border/80 hover:border-primary hover:text-primary cursor-pointer"
              >
                <Link to="/orders">
                  <div className="flex items-center gap-2">
                    <Truck className="size-3.5 text-primary" />
                    <span>Track All Dispatches</span>
                  </div>
                  <ChevronRight className="size-3 opacity-60" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full justify-between h-9 text-xs rounded-xl border-border/80 hover:border-primary hover:text-primary cursor-pointer"
              >
                <Link to="/settings">
                  <div className="flex items-center gap-2">
                    <SettingsIcon className="size-3.5 text-primary" />
                    <span>Configure Garage Settings</span>
                  </div>
                  <ChevronRight className="size-3 opacity-60" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}