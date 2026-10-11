import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Mail,
  Phone,
  MapPin,
  KeyRound,
  LogOut,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  User,
  Lock,
  AtSign,
  Package,
  Heart,
  ShieldCheck,
  CalendarDays,
  Hash,
  ChevronRight,
  Palette,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ───────────────────────── helpers ───────────────────────── */

export function getInitials(name) {
  if (!name) return "U";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function formatMonthYear(date) {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/* Sidebar / pill menu items. "anchor" scrolls to a section, "link" navigates. */
export const PROFILE_NAV_ITEMS = [
  { type: "anchor", id: "personal", label: "Personal information", icon: User },
  { type: "anchor", id: "address", label: "Saved address", icon: MapPin },
  { type: "anchor", id: "security", label: "Account & security", icon: ShieldCheck },
  { type: "link", to: "/orders", label: "My orders", icon: Package },
  { type: "link", to: "/wishlist", label: "Saved items", icon: Heart },
];

export const PROFILE_SECTION_IDS = PROFILE_NAV_ITEMS.filter(
  (i) => i.type === "anchor"
).map((i) => i.id);

/* ───────────────────────── small UI pieces ───────────────────────── */

export function SectionCard({ id, icon: Icon, title, description, children }) {
  return (
    <section
      id={id}
      className="scroll-mt-24 overflow-hidden rounded-2xl border bg-card shadow-sm"
    >
      <header className="flex items-start gap-3 border-b px-5 py-4 sm:px-6">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-[18px]" />
        </span>
        <div>
          <h2 className="text-lg font-bold leading-tight tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </header>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function InfoField({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3.5 rounded-xl border bg-muted/30 p-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background">
        <Icon className="size-4 text-muted-foreground" />
      </span>
      <div className="min-w-0 space-y-0.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-sm font-semibold text-foreground">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function StatTile({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 sm:px-6">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-sm font-bold">{value}</p>
      </div>
    </div>
  );
}

function SettingRow({ icon: Icon, title, description, children }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/30 p-4">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 size-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

/* ───────────────────────── change password ───────────────────────── */

/* `onSubmit` is changePassword from useAuth. That function handles API errors
   itself (shows a toast and returns undefined), so a falsy result means it failed. */
export function ChangePasswordDialog({ onSubmit }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const reset = () => {
    setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setError("");
    setShowCurrent(false);
    setShowNew(false);
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }
    if (form.newPassword === form.currentPassword) {
      setError("New password must be different from the current one");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    try {
      setSubmitting(true);
      const res = await onSubmit(form.currentPassword, form.newPassword);

      setOpen(false);
      reset();
    } catch {
      setError("Could not update password. Check your current password.");
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
        <Button variant="outline" size="sm" className="gap-2">
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
                type={showCurrent ? "text" : "password"}
                value={form.currentPassword}
                onChange={handleChange("currentPassword")}
                autoComplete="current-password"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                aria-label={showCurrent ? "Hide password" : "Show password"}
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
                type={showNew ? "text" : "password"}
                value={form.newPassword}
                onChange={handleChange("newPassword")}
                autoComplete="new-password"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                aria-label={showNew ? "Hide password" : "Show password"}
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
              type={showNew ? "text" : "password"}
              value={form.confirmPassword}
              onChange={handleChange("confirmPassword")}
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

/* ───────────────────────── header ───────────────────────── */

export function ProfileHeader({ user, savedCount = 0, onLogout }) {
  const memberSince = formatMonthYear(user.createdAt);

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="h-24 bg-gradient-to-br from-primary/25 via-primary/10 to-transparent sm:h-28" />

      <div className="relative -mt-12 flex flex-col gap-5 px-5 pb-6 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
          <Avatar className="size-24 border-4 border-background shadow-lg">
            <AvatarImage src={user.profile?.url} alt={user.name} />
            <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-1.5 text-center sm:pb-1 sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {user.name}
              </h1>
              {user.role && (
                <Badge variant="secondary" className="font-medium capitalize">
                  {user.role}
                </Badge>
              )}
              {user.active && (
                <Badge className="gap-1 bg-emerald-600 font-medium text-white hover:bg-emerald-600">
                  <CheckCircle2 className="size-3" />
                  Active
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground sm:justify-start">
              {user.email && (
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="size-3.5" />
                  {user.email}
                </span>
              )}
              {user.phone && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="size-3.5" />
                  {user.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onLogout}
          className="gap-2 self-center sm:self-auto"
        >
          <LogOut size={14} />
          Log out
        </Button>
      </div>

      {/* Stats row: real values only */}
      <div className="grid grid-cols-1 divide-y border-t bg-muted/30 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {user.login_id && (
          <StatTile icon={Hash} label="Customer ID" value={user.login_id} />
        )}
        {memberSince && (
          <StatTile icon={CalendarDays} label="Member since" value={memberSince} />
        )}
        <StatTile icon={Heart} label="Saved items" value={savedCount} />
      </div>
    </div>
  );
}

/* ───────────────────────── nav (desktop menu + mobile pills) ───────────────────────── */

export function ProfileNav({
  items = PROFILE_NAV_ITEMS,
  activeSection,
  onSelect,
  onLogout,
}) {
  return (
    <aside className="lg:sticky lg:top-24">
      {/* Mobile: horizontal pills */}
      <nav
        aria-label="Account sections"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        {items.map((item) => {
          const isActive = item.type === "anchor" && activeSection === item.id;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onSelect(item)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card text-foreground hover:bg-muted"
              )}
            >
              <item.icon className="size-3.5" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Desktop: vertical menu */}
      <nav
        aria-label="Account sections"
        className="hidden overflow-hidden rounded-2xl border bg-card p-2 shadow-sm lg:block"
      >
        <p className="px-3 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          My account
        </p>

        {items.map((item) => {
          const isActive = item.type === "anchor" && activeSection === item.id;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onSelect(item)}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              )}
            >
              <item.icon className="size-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              <ChevronRight
                className={cn(
                  "size-4 transition-transform",
                  isActive
                    ? "opacity-100"
                    : "opacity-0 group-hover:translate-x-0.5 group-hover:opacity-60"
                )}
              />
            </button>
          );
        })}

        <div className="my-2 border-t" />
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </nav>
    </aside>
  );
}

/* ───────────────────────── sections ───────────────────────── */

export function PersonalInfoSection({ user }) {
  return (
    <SectionCard
      id="personal"
      icon={User}
      title="Personal information"
      description="Your name and contact details on this account."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <InfoField icon={User} label="Full name" value={user.name} />
        <InfoField icon={Mail} label="Email address" value={user.email} />
        <InfoField icon={Phone} label="Phone number" value={user.phone} />
        {user.username && (
          <InfoField icon={AtSign} label="Username" value={user.username} />
        )}
      </div>
    </SectionCard>
  );
}

export function AddressSection({ user }) {
  const address = user.address || {};

  const lines = useMemo(() => {
    const line1 = [address.door, address.street].filter(Boolean).join(", ");
    const line2 = [address.city, address.pincode].filter(Boolean).join(" – ");
    return [line1, line2].filter(Boolean);
  }, [address.door, address.street, address.city, address.pincode]);

  return (
    <SectionCard
      id="address"
      icon={MapPin}
      title="Saved address"
      description="Where your orders get shipped."
    >
      {lines.length > 0 ? (
        <div className="flex items-start gap-3.5 rounded-xl border bg-muted/30 p-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background">
            <MapPin className="size-4 text-muted-foreground" />
          </span>
          <div className="min-w-0 space-y-0.5">
            <p className="text-sm font-semibold">{user.name}</p>
            {lines.map((line) => (
              <p key={line} className="text-sm text-muted-foreground">
                {line}
              </p>
            ))}
            {user.phone && (
              <p className="flex items-center gap-1.5 pt-1.5 text-xs text-muted-foreground">
                <Phone className="size-3" />
                {user.phone}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-10 text-center">
          <MapPin className="size-8 text-muted-foreground/50" />
          <p className="text-sm font-medium">No address added yet</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            Your shipping address will show here once you add one at checkout.
          </p>
        </div>
      )}
    </SectionCard>
  );
}

export function SecuritySection({ user, onChangePassword, onLogout }) {
  return (
    <SectionCard
      id="security"
      icon={ShieldCheck}
      title="Account & security"
      description="Password, appearance and session."
    >
      <div className="space-y-3">
        <SettingRow
          icon={Lock}
          title="Password"
          description="Keep your account secure with a strong password."
        >
          <ChangePasswordDialog onSubmit={onChangePassword} />
        </SettingRow>

        {user.theme && (
          <SettingRow
            icon={Palette}
            title="Appearance"
            description="Theme preference saved on your account."
          >
            <Badge variant="secondary" className="font-medium">
              {capitalize(user.theme)}
            </Badge>
          </SettingRow>
        )}

        <SettingRow
          icon={LogOut}
          title="Session"
          description="Sign out of this device."
        >
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut size={14} />
            Sign out
          </Button>
        </SettingRow>
      </div>
    </SectionCard>
  );
}

/* ───────────────────────── not signed in ───────────────────────── */

export function ProfileNotSignedIn() {
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