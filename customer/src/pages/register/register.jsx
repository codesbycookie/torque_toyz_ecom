'use client';
import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/core/contexts/auth.context';
import logo from '@/assets/hero.png';
import {
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Flag,
  ShieldCheck,
  Truck,
} from 'lucide-react';

/* ───────────────────────── validation ───────────────────────── */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(f) {
  const e = {};
  if (!f.name.trim()) e.name = 'Enter your full name';
  if (!f.email.trim()) e.email = 'Enter your email address';
  else if (!EMAIL_RE.test(f.email.trim())) e.email = 'Enter a valid email address';
  if (!f.phone.trim()) e.phone = 'Enter your phone number';
  else if (!/^\d{10}$/.test(f.phone.trim())) e.phone = 'Phone number must be 10 digits';
  if (!f.password) e.password = 'Create a password';
  else if (f.password.length < 6) e.password = 'Password must be at least 6 characters';
  if (!f.confirm) e.confirm = 'Re-enter your password';
  else if (f.confirm !== f.password) e.confirm = 'Passwords do not match';
  if (!f.terms) e.terms = 'You need to accept the terms to continue';
  return e;
}

function getStrength(pw) {
  if (!pw) return { score: 0, label: '' };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw) && /\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return { score, label: ['Weak', 'Fair', 'Good', 'Strong', 'Strong'][score] };
}

const STRENGTH_COLORS = [
  'bg-destructive',
  'bg-destructive',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-emerald-600',
];

/* ───────────────────────── page ───────────────────────── */

export default function Register() {
  const { authenticated, register, loggingIn } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
    terms: false,
  });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const errors = useMemo(() => validate(form), [form]);
  const strength = useMemo(() => getStrength(form.password), [form.password]);

  if (authenticated) return <Navigate to="/" replace />;

  const fieldError = (field) => (touched[field] || submitted ? errors[field] : undefined);

  const set = (field) => (e) => {
    const value =
      field === 'phone' ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value;
    setForm((p) => ({ ...p, [field]: value }));
    setError('');
  };

  const blur = (field) => () => setTouched((p) => ({ ...p, [field]: true }));

  const inputClass = (field, extra = '') =>
    `torque-input w-full rounded-md border bg-input/30 px-3.5 py-2.5 text-sm outline-none transition-colors ${
      fieldError(field) ? 'border-destructive' : 'border-input'
    } ${extra}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length) return;

    // register() navigates home on success and returns the error on failure
    const result = await register({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      password: form.password,
      accepted_terms: true,
    });

    if (result) {
      setError(
        result?.response?.data?.message ||
          result?.message ||
          'Could not create your account. Please try again.'
      );
    }
  };

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
            <img src={logo} alt="Torque Toyzz Logo" />
          </span>
          <span className="text-white font-bold tracking-tight text-lg">TORQUE TOYZZ</span>
        </div>

        <div className="relative max-w-md">
          <span className="torque-badge mb-5">
            <Flag size={12} />
            New drops weekly
          </span>
          <h1 className="text-white text-5xl font-bold tracking-tight leading-[1.05] mb-5">
            Join the grid.
            <br />
            Start your engine.
          </h1>
          <p className="text-white/60 text-[15px] leading-relaxed">
            Create an account to track orders, save your favourite builds, and get
            first access to every new kit before it sells out.
          </p>
        </div>

        <div className="relative">
          <div className="checker-strip h-3 w-24 rounded-sm mb-4" />
          <p className="text-white/40 text-xs">© Torque Toyzz. Built for racers.</p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center px-6 py-14 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <span className="w-7 h-7 rounded-full torque-red-bg" />
            <span className="font-bold tracking-tight">TORQUE TOYZZ</span>
          </div>

          <div className="torque-card torque-glow p-8">
            <h2 className="text-2xl font-semibold tracking-tight mb-1">Create your account</h2>
            <p className="text-muted-foreground text-sm mb-7">
              Sign up for your Torque Toyzz account.
            </p>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Full name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1.5">
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={set('name')}
                  onBlur={blur('name')}
                  disabled={loggingIn}
                  autoComplete="name"
                  autoFocus
                  aria-invalid={!!fieldError('name')}
                  className={inputClass('name')}
                />
                {fieldError('name') && (
                  <p className="text-xs text-destructive mt-1.5">{fieldError('name')}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  value={form.email}
                  onChange={set('email')}
                  onBlur={blur('email')}
                  disabled={loggingIn}
                  autoComplete="email"
                  aria-invalid={!!fieldError('email')}
                  className={inputClass('email')}
                />
                {fieldError('email') && (
                  <p className="text-xs text-destructive mt-1.5">{fieldError('email')}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1.5">
                  Phone number
                </label>
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="10-digit mobile number"
                  value={form.phone}
                  onChange={set('phone')}
                  onBlur={blur('phone')}
                  disabled={loggingIn}
                  autoComplete="tel"
                  aria-invalid={!!fieldError('phone')}
                  className={inputClass('phone')}
                />
                {fieldError('phone') && (
                  <p className="text-xs text-destructive mt-1.5">{fieldError('phone')}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={form.password}
                    onChange={set('password')}
                    onBlur={blur('password')}
                    disabled={loggingIn}
                    autoComplete="new-password"
                    aria-invalid={!!fieldError('password')}
                    className={inputClass('password', 'pr-10')}
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
                {fieldError('password') && (
                  <p className="text-xs text-destructive mt-1.5">{fieldError('password')}</p>
                )}

                {/* Strength meter */}
                {form.password && (
                  <div className="mt-2.5 flex items-center gap-3">
                    <div className="flex flex-1 gap-1" aria-hidden="true">
                      {[1, 2, 3, 4].map((i) => (
                        <span
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            i <= strength.score ? STRENGTH_COLORS[strength.score] : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="w-12 text-right text-xs text-muted-foreground">
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label htmlFor="confirm" className="block text-sm font-medium mb-1.5">
                  Confirm password
                </label>
                <input
                  id="confirm"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={form.confirm}
                  onChange={set('confirm')}
                  onBlur={blur('confirm')}
                  disabled={loggingIn}
                  autoComplete="new-password"
                  aria-invalid={!!fieldError('confirm')}
                  className={inputClass('confirm')}
                />
                {fieldError('confirm') && (
                  <p className="text-xs text-destructive mt-1.5">{fieldError('confirm')}</p>
                )}
              </div>

              {/* Terms */}
              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.terms}
                    onChange={(e) => {
                      setForm((p) => ({ ...p, terms: e.target.checked }));
                      setTouched((p) => ({ ...p, terms: true }));
                      setError('');
                    }}
                    disabled={loggingIn}
                    className="w-4 h-4 mt-0.5 rounded border-input accent-primary"
                  />
                  <span className="text-sm text-muted-foreground leading-snug">
                    I agree to the{' '}
                    <Link
                      to="/terms"
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      Terms &amp; Conditions
                    </Link>{' '}
                    and{' '}
                    <Link
                      to="/privacy"
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {fieldError('terms') && (
                  <p className="text-xs text-destructive mt-1.5">{fieldError('terms')}</p>
                )}
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-md border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loggingIn}
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
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
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