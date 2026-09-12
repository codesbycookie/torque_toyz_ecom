'use client';
import { useState } from 'react';
import { useAuth } from '@/core/contexts/auth.context';
import {
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Flag,
  ShieldCheck,
  Truck,
} from 'lucide-react';

export default function Register() {
  const { register, loggingIn } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim() || form.name.trim().length < 2) {
      nextErrors.name = 'Name is too short';
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email';
    }
    if (!form.phone.trim() || form.phone.trim().length < 10) {
      nextErrors.phone = 'Phone number is too short';
    }
    if (!form.password || form.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
    }
    if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }
    if (!acceptTerms) {
      nextErrors.acceptTerms = 'You must accept the terms and conditions';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    await register({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
      role: 'user',
      acceptTerms: true,
    });
  };

  const isDisabled =
    loggingIn ||
    !form.name.trim() ||
    !form.email.trim() ||
    !form.phone.trim() ||
    !form.password ||
    !form.confirmPassword;

  return (
    <div className="min-h-screen w-full bg-background text-foreground grid lg:grid-cols-2">
      <style>{`
        .checker-strip {
          background-image:
            linear-gradient(45deg, #000 25%, transparent 25%),
            linear-gradient(-45deg, #000 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #000 75%),
            linear-gradient(-45deg, transparent 75%, #000 75%);
          background-size: 18px 18px;
          background-position: 0 0, 0 9px, 9px -9px, -9px 0px;
          background-color: #fff;
        }
      `}</style>

      {/* Left — brand / hero */}
      <div className="hidden lg:flex relative flex-col justify-between overflow-hidden torque-dark-gradient px-14 py-12">
        <div
          className="absolute -left-10 top-1/4 w-[130%] h-10 torque-red-bg opacity-20"
          style={{ transform: 'rotate(-10deg)' }}
        />
        <div
          className="absolute -left-10 top-1/3 w-[130%] h-4 torque-red-bg opacity-10"
          style={{ transform: 'rotate(-10deg)' }}
        />

        <div className="relative flex items-center gap-3">
          <span className="animate-logo-intro inline-flex w-9 h-9 rounded-full border-2 border-dashed torque-border items-center justify-center">
            <img src="@/assets/hero.png" alt="Torque Toyzz Logo" />
          </span>
          <span className="text-white font-bold tracking-tight text-lg">TORQUE TOYZZ</span>
        </div>

        <div className="relative max-w-md">
          <span className="torque-badge mb-5">
            <Flag size={12} />
            New drops weekly
          </span>
          <h1 className="text-white text-5xl font-bold tracking-tight leading-[1.05] mb-5">
            Join the
            <br />
            garage.
          </h1>
          <p className="text-white/60 text-[15px] leading-relaxed">
            Create an account to track orders, manage your builds, and get first
            access to every new kit before it sells out.
          </p>
        </div>

        <div className="relative">
          <div className="checker-strip h-3 w-24 rounded-sm mb-4" />
          <p className="text-white/40 text-xs">© Torque Toyzz. Built for racers.</p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center px-6 py-14 bg-background">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <span className="w-7 h-7 rounded-full torque-red-bg" />
            <span className="font-bold tracking-tight">TORQUE TOYZZ</span>
          </div>

          <div className="torque-card torque-glow p-8">
            <h2 className="text-2xl font-semibold tracking-tight mb-1">Create your account</h2>
            <p className="text-muted-foreground text-sm mb-7">
              Sign up to start shopping with Torque Toyzz.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1.5">
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange('name')}
                  disabled={loggingIn}
                  autoComplete="name"
                  autoFocus
                  className="torque-input w-full rounded-md border border-input bg-input/30 px-3.5 py-2.5 text-sm outline-none transition-colors"
                />
                {errors.name && (
                  <p className="text-destructive text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  value={form.email}
                  onChange={handleChange('email')}
                  disabled={loggingIn}
                  autoComplete="email"
                  className="torque-input w-full rounded-md border border-input bg-input/30 px-3.5 py-2.5 text-sm outline-none transition-colors"
                />
                {errors.email && (
                  <p className="text-destructive text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1.5">
                  Phone number
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={handleChange('phone')}
                  disabled={loggingIn}
                  autoComplete="tel"
                  className="torque-input w-full rounded-md border border-input bg-input/30 px-3.5 py-2.5 text-sm outline-none transition-colors"
                />
                {errors.phone && (
                  <p className="text-destructive text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={form.password}
                    onChange={handleChange('password')}
                    disabled={loggingIn}
                    autoComplete="new-password"
                    className="torque-input w-full rounded-md border border-input bg-input/30 px-3.5 py-2.5 pr-10 text-sm outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground torque-text-hover transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-destructive text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    value={form.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    disabled={loggingIn}
                    autoComplete="new-password"
                    className="torque-input w-full rounded-md border border-input bg-input/30 px-3.5 py-2.5 pr-10 text-sm outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground torque-text-hover transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-destructive text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => {
                      setAcceptTerms(e.target.checked);
                      setErrors((prev) => ({ ...prev, acceptTerms: undefined }));
                    }}
                    disabled={loggingIn}
                    className="w-4 h-4 mt-0.5 rounded border-input accent-primary"
                  />
                  <span className="text-sm text-muted-foreground">
                    I agree to the <a href="#">Terms &amp; Conditions</a> and{' '}
                    <a href="#">Privacy Policy</a>
                  </span>
                </label>
                {errors.acceptTerms && (
                  <p className="text-destructive text-xs mt-1">{errors.acceptTerms}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isDisabled}
                className="torque-button torque-shine w-full flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-semibold disabled:opacity-70 mt-2"
              >
                {loggingIn ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              <p className="text-muted-foreground text-sm text-center pt-2">
                Already have an account? <a href="/login">Sign in</a>
              </p>
            </form>
          </div>

          <div className="flex items-center justify-center gap-2 mt-6">
            <span className="torque-badge">
              <ShieldCheck size={12} />
              Secure checkout
            </span>
            <span className="torque-badge">
              <Truck size={12} />
              Fast RC shipping
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}