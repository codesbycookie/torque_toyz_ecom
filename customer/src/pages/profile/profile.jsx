'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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
  Edit3,
  Plus,
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
  Sparkles,
  Calendar,
  Camera,
  Sun,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ThemeSegmented } from '@/components/global/theme-toggle';
import { AddressModalDialog } from '@/pages/checkout/shipping-address.components';

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

const AVATAR_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Avatar with upload overlay
function AvatarUploader({ user, onUploaded }) {
  const { users } = useApi();
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!AVATAR_TYPES.includes(file.type)) {
      toast.error('Please choose a JPG, PNG, WEBP or GIF image.');
      return;
    }
    if (file.size > AVATAR_MAX_SIZE) {
      toast.error('Image must be smaller than 5MB.');
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploading(true);
      const updated = await users.edit(user._id, formData, { __options: { toast: false } });
      if (updated) onUploaded?.(updated);
      toast.success('Avatar updated!');
    } catch {
      // error toast handled by crud factory
    } finally {
      setUploading(false);
      setPreview(null);
    }
  };

  const src = preview || user.profile?.url;

  return (
    <div className="relative group shrink-0">
      <div className="relative size-20 sm:size-24 rounded-2xl border-2 border-border/80 bg-muted p-1 shadow-xs ring-1 ring-border/40 flex items-center justify-center overflow-hidden bg-gradient-to-br from-neutral-900 to-neutral-950">
        {src ? (
          <img
            src={src}
            alt={user.name}
            className={cn('w-full h-full object-cover rounded-xl transition-opacity', uploading && 'opacity-50')}
          />
        ) : (
          <span className="text-2xl sm:text-3xl font-black text-primary font-mono tracking-wider">
            {getInitials(user.name, user.email)}
          </span>
        )}

        <button
          id="profile-avatar-upload-btn"
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          aria-label="Change profile photo"
          className={cn(
            'absolute inset-1 rounded-xl flex flex-col items-center justify-center gap-1 bg-black/60 text-white text-[10px] font-semibold uppercase tracking-wider transition-opacity cursor-pointer',
            uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100'
          )}
        >
          {uploading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <>
              <Camera className="size-5" />
              <span>{user.profile?.url ? 'Change' : 'Upload'}</span>
            </>
          )}
        </button>
      </div>

      {/* Mobile-friendly camera badge */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label="Upload profile photo"
        className="absolute -bottom-1 -right-1 size-8 rounded-full bg-primary text-primary-foreground border-2 border-card shadow-md flex items-center justify-center hover:scale-110 transition-transform cursor-pointer disabled:opacity-60"
      >
        <Camera className="size-3.5" />
      </button>

      <input
        id="profile-avatar-input"
        ref={inputRef}
        type="file"
        accept={AVATAR_TYPES.join(',')}
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
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
            Change Password
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-muted-foreground">
            Enter your current password and choose a new one.
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

export default function Profile() {
  const { user, loading, changePassword, logout, setUser } = useAuth();
  const api = useApi();

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  useEffect(() => {
    if (api.locations?.fetchLocations) {
      api.locations.fetchLocations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const locations = useMemo(() => {
    return api.locations?.state || api.locations?.list || [];
  }, [api.locations?.state, api.locations?.list]);

  const handleSaveAddress = async (newAddr) => {
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
      is_default: true,
    };

    if (user?._id && api.users?.saveUserAddress) {
      try {
        const updatedUser = await api.users.saveUserAddress(user, cleanedAddr);
        if (updatedUser) {
          setUser(updatedUser);
        }
      } catch (err) {
        console.error("Failed to save address to user data:", err);
      }
    }

    try {
      const raw = null;
      const current = raw ? JSON.parse(raw) : [];
      const updated = [
        cleanedAddr,
        ...current.filter((c) => String(c._id || c.id) !== String(cleanedAddr._id || cleanedAddr.id)),
      ];
      // Saved directly to user profile in backend
    } catch {
      // ignore
    }

    toast.success("Shipping address saved to your profile!");
  };

  // Local storage stored addresses (same cache used in checkout & settings)
  const storedAddresses = useMemo(() => {
    try {
      const raw = null;
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  // Fetch recent orders & wishlist for live metrics when authenticated
  useEffect(() => {
    if (user) {
      if (api.orders?.getMine) {
        api.orders.getMine({ page: 1, limit: 3, sortBy: 'createdAt', order: 'desc' }).catch(() => { });
      }
      if (api.wishlist?.fetchAll) {
        api.wishlist.fetchAll().catch?.(() => { });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
              Please sign in to view your profile and orders.
            </p>
          </div>
          <Button
            asChild
            className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-10 shadow-xs"
          >
            <Link to="/login">Sign In</Link>
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
    : 'TT-USER';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* ─── Page Title Strip ─── */}
      <div className="space-y-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground uppercase">
              My Profile
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              View your orders, wishlist, addresses and account details
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
                <span>Settings</span>
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

      {/* ─── Elevated Collector Profile Card (Clean Minimalist Luxury) ─── */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-7 shadow-xs relative overflow-hidden transition-all">
        {/* Subtle Elevated Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-primary/80 to-transparent" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-5 text-center sm:text-left flex-1 min-w-0">
            {/* Avatar */}
            <AvatarUploader
              user={user}
              onUploaded={(updated) => setUser((prev) => ({ ...prev, ...updated }))}
            />

            {/* User Meta */}
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h2 className="text-2xl sm:text-3xl font-heading font-black text-foreground tracking-tight">
                  {user.name}
                </h2>
                <Badge className="bg-primary/10 text-primary border border-primary/20 text-[11px] font-bold uppercase tracking-wider">
                  Verified Collector
                </Badge>
                {user.role && (
                  <Badge variant="outline" className="text-[10px] font-medium capitalize border-border text-muted-foreground">
                    {user.role}
                  </Badge>
                )}
                <Badge variant="secondary" className="font-mono text-[11px] font-semibold text-muted-foreground">
                  {collectorId}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                {user.username && (
                  <span className="font-mono text-foreground font-semibold">
                    @{user.username}
                  </span>
                )}
                <span>{user.email}</span>
                {user.phone && <span>• {user.phone}</span>}
                <span className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                  <Calendar className="size-3 text-primary" />
                  Joined {joinedDate}
                </span>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-3 pt-0.5 text-xs">
                <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  Account Active &amp; Verified
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Links */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap justify-center sm:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-border/60">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-xl border-border/80 text-xs font-semibold gap-1.5 hover:border-primary hover:text-primary cursor-pointer shadow-2xs h-9.5"
            >
              <Link to="/wishlist">
                <Heart className="size-3.5 text-primary" />
                <span>Wishlist ({wishlistCount})</span>
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs gap-1.5 cursor-pointer shadow-xs h-9.5"
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
            <span className="text-xs font-semibold text-muted-foreground">Total Orders</span>
            <div className="size-8 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-foreground font-mono">
              {totalOrdersCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Orders placed so far
            </p>
          </div>
        </Link>

        {/* Active In Transit */}
        <Link
          to="/orders"
          className="group rounded-2xl border border-border/80 bg-card p-4 sm:p-5 hover:border-primary/60 transition-all shadow-2xs flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Active Orders</span>
            <div className="size-8 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Truck className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-foreground font-mono">
              {activeOrdersCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Orders on the way
            </p>
          </div>
        </Link>

        {/* Wishlist Garage */}
        <Link
          to="/wishlist"
          className="group rounded-2xl border border-border/80 bg-card p-4 sm:p-5 hover:border-primary/60 transition-all shadow-2xs flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Wishlist</span>
            <div className="size-8 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Heart className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-foreground font-mono">
              {wishlistCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Saved products
            </p>
          </div>
        </Link>

        {/* Garage Destinations */}
        <Link
          to="/settings"
          className="group rounded-2xl border border-border/80 bg-card p-4 sm:p-5 hover:border-primary/60 transition-all shadow-2xs flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Saved Addresses</span>
            <div className="size-8 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <MapPin className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-foreground font-mono">
              {savedAddresses.length}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Delivery addresses
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
                    Recent Orders
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Your latest orders
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
                    <p className="text-sm font-bold text-foreground">No orders yet</p>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      Browse our products to place your first order.
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
                              {items.length} {items.length === 1 ? 'item' : 'items'} • Ordered on {orderDate}
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
                    Default Address
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Your default shipping address
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
                        Default
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
                      Add a shipping address for faster checkout.
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
                    Account Details
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Your personal and contact information
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
                  <span>Username</span>
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
                  <ShieldCheck className="size-3.5 text-primary" />
                  <span>Account Status</span>
                </span>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                  Active
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs pt-3.5 border-t border-border/70">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Sun className="size-3.5 text-primary" />
                  <span>Theme (Dark / Light)</span>
                </span>
                <ThemeSegmented />
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
                    Security
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Manage your password
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
                  <span>Your account is secure</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Your login is protected with encrypted authentication.
                </p>
              </div>
            </div>
          </div>

          {/* Collector Perks & Fast Links */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-3.5 shadow-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Quick Links
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
                    <span>Browse Products</span>
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
                    <span>Track All Orders</span>
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
                    <span>Account Settings</span>
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