'use client';

import { useState } from 'react';
import { useAuth } from '@/core/contexts/auth.context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
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
  User,
  Lock,
} from 'lucide-react';

function getInitials(name) {
  if (!name) return 'U';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="group flex items-start gap-3.5 rounded-lg border border-transparent p-3 transition-colors hover:border-border hover:bg-muted/40">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-background shadow-sm">
        <Icon size={16} className="text-muted-foreground transition-colors group-hover:text-foreground" />
      </div>
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-sm font-medium text-foreground">
          {value || '—'}
        </p>
      </div>
    </div>
  );
}

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
      setError('New password must be at least 6 characters');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    try {
      setSubmitting(true);
      await onSubmit(form.currentPassword, form.newPassword);
      setOpen(false);
      reset();
    } catch {
      setError('Could not update password. Check your current password.');
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
        <Button variant="outline" size="sm" className="gap-2 shadow-sm">
          <KeyRound size={14} />
          Change password
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <DialogTitle className="text-center">Change password</DialogTitle>
          <DialogDescription className="text-center">
            Enter your current password and choose a new one. You&apos;ll be
            signed out after this change.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword">Current password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrent ? 'text' : 'password'}
                value={form.currentPassword}
                onChange={handleChange('currentPassword')}
                autoComplete="current-password"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                aria-label={showCurrent ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="newPassword">New password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNew ? 'text' : 'password'}
                value={form.newPassword}
                onChange={handleChange('newPassword')}
                autoComplete="new-password"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                aria-label={showNew ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type={showNew ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={handleChange('confirmPassword')}
              autoComplete="new-password"
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Update password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <Card className="overflow-hidden">
        <div className="h-24 bg-muted/60" />
        <CardContent className="relative -mt-10 flex flex-col items-center gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-end">
            <Skeleton className="h-20 w-20 rounded-full border-4 border-background" />
            <div className="space-y-2 text-center sm:text-left">
              <Skeleton className="mx-auto h-5 w-40 sm:mx-0" />
              <Skeleton className="mx-auto h-4 w-56 sm:mx-0" />
            </div>
          </div>
          <Skeleton className="h-9 w-28" />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-14 w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-56" />
        </CardHeader>
        <CardFooter>
          <Skeleton className="h-9 w-36" />
        </CardFooter>
      </Card>
    </div>
  );
}

export default function Profile() {
  const { user, loading, changePassword, logout } = useAuth();

  if (loading) return <ProfileSkeleton />;

  if (!user) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center px-6 py-24">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <User className="h-6 w-6 text-muted-foreground" />
        </div>
        <Alert className="w-full">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not signed in</AlertTitle>
          <AlertDescription>
            You need to sign in to view your profile.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const address = user.address || {};
  const hasAddress =
    address.door || address.street || address.city || address.pincode;
  const addressLine = hasAddress
    ? [address.door, address.street, address.city, address.pincode]
        .filter(Boolean)
        .join(', ')
    : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      {/* Profile Header */}
      <Card className="overflow-hidden border-none shadow-md">
        <div className="h-28 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
        <CardContent className="relative -mt-12 flex flex-col gap-5 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
            <Avatar className="h-24 w-24 border-4 border-background shadow-lg ring-2 ring-background">
              <AvatarImage src={user.profile?.url} alt={user.name} />
              <AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1.5 text-center sm:pb-1 sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-2xl font-semibold tracking-tight">
                  {user.name}
                </h1>
                {user.role && (
                  <Badge
                    variant="secondary"
                    className="capitalize font-medium"
                  >
                    {user.role}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="gap-2 self-center shadow-sm sm:self-auto"
          >
            <LogOut size={14} />
            Log out
          </Button>
        </CardContent>
      </Card>

      {/* Contact + Address grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact details */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Contact details
            </CardTitle>
            <CardDescription>
              Your account&apos;s contact information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5">
            <InfoRow icon={Mail} label="Email" value={user.email} />
            <InfoRow icon={Phone} label="Phone" value={user.phone} />
            {user.username && (
              <InfoRow
                icon={Shield}
                label="Username"
                value={user.username}
              />
            )}
          </CardContent>
        </Card>

        {/* Address */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Address
            </CardTitle>
            <CardDescription>
              Where your orders get shipped.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {addressLine ? (
              <InfoRow
                icon={MapPin}
                label="Shipping address"
                value={addressLine}
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-8 text-center">
                <MapPin className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  No address added yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator className="my-2" />

      {/* Security */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-4 w-4 text-muted-foreground" />
            Security
          </CardTitle>
          <CardDescription>
            Manage your password to keep your account secure.
          </CardDescription>
        </CardHeader>
        <CardFooter className="border-t bg-muted/20 px-6 py-4">
          <ChangePasswordDialog
            onSubmit={(current, next) => changePassword(current, next)}
          />
        </CardFooter>
      </Card>
    </div>
  );
}