'use client';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/core/contexts/auth.context';
import {
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Truck,
  User,
  Mail,
  Phone,
  Lock,
  Check,
} from 'lucide-react';

/* ---------- UI-only helpers (no auth logic here) ---------- */

const css = `
@keyframes tt-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes tt-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
@keyframes tt-lines{from{background-position:0 0}to{background-position:-240px 0}}
.tt-rise{animation:tt-rise .55s cubic-bezier(.2,.8,.2,1) both}
.tt-shake{animation:tt-shake .35s}
.tt-lines{animation:tt-lines 2.6s linear infinite}
@media (prefers-reduced-motion:reduce){.tt-rise,.tt-shake,.tt-lines{animation:none}}
@keyframes tt-pulse{0%,100%{filter:drop-shadow(0 0 0 rgba(255,255,255,0))}50%{filter:drop-shadow(0 0 14px rgba(255,255,255,.65))}}
@keyframes tt-shine{from{transform:translateX(-120%) skewX(-20deg)}to{transform:translateX(260%) skewX(-20deg)}}
@keyframes tt-drive{from{left:-80px}to{left:100%}}
@keyframes tt-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
@keyframes tt-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
.tt-pulse{animation:tt-pulse 1.4s ease-in-out infinite}
.tt-drive{animation:tt-drive 5s linear infinite}
.tt-drive svg{animation:tt-bob .35s ease-in-out infinite}
.tt-float{animation:tt-float 4s ease-in-out infinite}
.tt-shine{position:relative;overflow:hidden}
.tt-shine:not(:disabled)::after{content:"";position:absolute;inset:0 auto 0 0;width:40%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent);animation:tt-shine 2.8s ease-in-out infinite}
.tt-stagger>*{animation:tt-rise .5s cubic-bezier(.2,.8,.2,1) both}
${Array.from({ length: 10 }, (_, i) => `.tt-stagger>*:nth-child(${i + 1}){animation-delay:${0.15 + i * 0.07}s}`).join('')}
@media (prefers-reduced-motion:reduce){.tt-pulse,.tt-drive,.tt-drive svg,.tt-float,.tt-shine::after,.tt-stagger>*{animation:none!important}}
`;

const brandBg = {
  backgroundImage:
    'repeating-conic-gradient(rgba(255,255,255,.06) 0% 25%, transparent 0% 50%), linear-gradient(135deg, #b81d24 0%, #a1181e 55%, #6e0f14 100%)',
  backgroundSize: '34px 34px, 100% 100%',
};

const Car = () => (
  <div aria-hidden="true" className="relative h-9 w-full overflow-hidden">
    <div className="tt-drive absolute bottom-[3px] left-0">
      <svg width="64" height="30" viewBox="0 0 64 30">
        <path d="M4 22 L8 12 Q10 8 16 8 H34 L44 14 H56 Q62 15 62 22 Z" fill="#fff" />
        <path d="M18 11 H32 L38 14 H15 Z" fill="#b81d24" opacity=".4" />
        <circle cx="16" cy="23" r="6" fill="#1c1c1e" stroke="#fff" strokeWidth="2" />
        <circle cx="50" cy="23" r="6" fill="#1c1c1e" stroke="#fff" strokeWidth="2" />
      </svg>
    </div>
    <div className="absolute bottom-0 h-[2px] w-full" style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,.45) 0 18px, transparent 18px 34px)' }} />
  </div>
);

const SpeedLines = () => (
  <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
    {[18, 42, 66, 84].map((top, i) => (
      <div
        key={top}
        className="tt-lines absolute left-0 h-[2px] w-full opacity-60"
        style={{
          top: `${top}%`,
          animationDuration: `${2 + i * 0.7}s`,
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(255,255,255,.28) 0 60px, transparent 60px 180px)',
        }}
      />
    ))}
  </div>
);

const Dial = ({ className = '' }) => (
  <svg
    className={`fill-none stroke-current ${className}`}
    viewBox="0 0 24 24"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 14l3-3" />
    <path d="M3.34 19a10 10 0 1 1 17.32 0" />
  </svg>
);

const Gauge = ({ value, label }) => {
  const p = Math.min(1, Math.max(0, value));
  const arc = 'M20 100A80 80 0 0 1 180 100';
  return (
    <div className={`w-full max-w-[240px] ${p === 1 ? 'tt-pulse' : ''}`}>
      <svg viewBox="0 0 200 118" className="w-full" role="img" aria-label={label}>
        <path d={arc} fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="12" strokeLinecap="round" />
        <path
          d={arc}
          fill="none"
          stroke="#fff"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${251.3 * p} 251.3`}
          style={{ transition: 'stroke-dasharray .6s ease' }}
        />
        <g
          style={{
            transform: `rotate(${-90 + 180 * p}deg)`,
            transformOrigin: '100px 100px',
            transition: 'transform .7s cubic-bezier(.3,1.5,.5,1)',
          }}
        >
          <line x1="100" y1="100" x2="100" y2="36" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
        </g>
        <circle cx="100" cy="100" r="8" fill="#fff" />
        <circle cx="100" cy="100" r="3" fill="#b81d24" />
      </svg>
      <p className="mt-1 text-center text-sm font-semibold text-white/90">{label}</p>
    </div>
  );
};

// Shared input look: same grey fill, white + red focus ring as before
const inputCls = (error, pr = 'pr-3.5') =>
  `w-full rounded-xl border bg-[#eef0f4] py-3 pl-10 ${pr} text-sm text-[#111827] outline-none transition-all placeholder:text-[#9ca3af] focus:border-[#b81d24] focus:bg-white focus:ring-2 focus:ring-[#b81d24]/15 ${
    error ? 'border-[#8b151b] bg-white' : 'border-transparent'
  }`;

const Field = ({ id, label, icon: Icon, error, right, hint, children }) => (
  <div>
    <label
      htmlFor={id}
      className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#4b5563]"
    >
      {label}
    </label>
    <div className={`group relative ${error ? 'tt-shake' : ''}`}>
      <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-[#9ca3af] transition-colors group-focus-within:text-[#b81d24]" />
      {children}
      {error ? (
        <AlertCircle className="pointer-events-none absolute right-3.5 top-1/2 size-5 -translate-y-1/2 stroke-[2] text-[#8b151b]" />
      ) : (
        right
      )}
    </div>
    {error ? (
      <p className="mt-1 text-xs font-semibold text-[#8b151b]" role="alert">
        {error}
      </p>
    ) : (
      hint
    )}
  </div>
);

const EyeToggle = ({ shown, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={shown ? 'Hide password' : 'Show password'}
    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[#6b7280] transition-colors hover:text-[#111827]"
  >
    {shown ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
  </button>
);

const OkTick = () => (
  <span className="pointer-events-none absolute right-3.5 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded-full bg-[#8b151b]">
    <Check className="size-3 stroke-[3] text-white" />
  </span>
);

/* ---------- Page ---------- */

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
      nextErrors.name = 'Enter your full name';
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

  /* UI-only derived values (live feedback) */
  const okName = form.name.trim().length >= 2;
  const okEmail = /^\S+@\S+\.\S+$/.test(form.email.trim());
  const okPhone = form.phone.trim().length >= 10;
  const okPass = form.password.length >= 6;
  const okConfirm = !!form.confirmPassword && form.confirmPassword === form.password;

  const steps = [
    ['Name', okName],
    ['Email', okEmail],
    ['Phone', okPhone],
    ['Password', okPass],
    ['Confirm', okConfirm],
    ['Terms', acceptTerms],
  ];
  const done = steps.filter(([, ok]) => ok).length;
  const progress = done / steps.length;
  const gaugeLabel =
    done === steps.length ? 'Ready to race' : `${done} of ${steps.length} checks passed`;

  const p = form.password;
  const score = p
    ? Math.max(
        1,
        (p.length >= 6) +
          (p.length >= 10) +
          (/[A-Z]/.test(p) && /[a-z]/.test(p) && /\d/.test(p)) +
          /[^A-Za-z0-9]/.test(p)
      )
    : 0;
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][score];
  const strengthColor = ['', '#b81d24', '#d97706', '#65a30d', '#15803d'][score];

  return (
    <div className="min-h-screen w-full bg-[#f8f8f9] font-sans text-[#1c1c1e] antialiased lg:grid lg:grid-cols-[1fr_1.1fr]">
      <style>{css}</style>

      {/* Desktop brand panel */}
      <aside
        className="sticky top-0 hidden h-screen flex-col justify-between self-start overflow-hidden p-12 text-white lg:flex"
        style={brandBg}
      >
        <SpeedLines />
        <div className="tt-float relative inline-flex w-fit rounded-2xl bg-white px-5 py-3 shadow-xl">
          <img src="/logo.png" alt="Torque Toyzz" className="h-14 w-auto object-contain" />
        </div>

        <div className="relative flex flex-col items-start gap-6">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-bold backdrop-blur">
              <Dial className="size-4" />
              <span>RC driver portal</span>
            </div>
            <h1 className="max-w-md text-4xl font-extrabold leading-tight tracking-tight text-white xl:text-5xl">
              Build your garage.
            </h1>
            <p className="mt-3 max-w-sm text-base text-white/80">
              One account for orders, tracking and every part you tune.
            </p>
          </div>

          <Gauge value={progress} label={gaugeLabel} />

          <ul className="grid grid-cols-3 gap-x-5 gap-y-2">
            {steps.map(([text, ok]) => (
              <li
                key={text}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  ok ? 'text-white' : 'text-white/55'
                }`}
              >
                <span
                  className={`grid size-4.5 place-items-center rounded-full border transition-all ${
                    ok ? 'border-white bg-white' : 'border-white/40'
                  }`}
                >
                  {ok && <Check className="size-3 stroke-[3] text-[#b81d24]" />}
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <Car />
          <div className="mt-3 flex flex-wrap gap-2">
          {[
            [ShieldCheck, 'Secure checkout'],
            [Truck, 'Fast RC shipping'],
          ].map(([Icon, text]) => (
            <div
              key={text}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold backdrop-blur"
            >
              <Icon className="size-3.5" />
              <span>{text}</span>
            </div>
          ))}
          </div>
        </div>
      </aside>

      {/* Form side */}
      <main className="flex flex-col pb-10 lg:items-center lg:justify-center lg:px-8 lg:py-10">
        {/* Mobile hero */}
        <header
          className="relative overflow-hidden rounded-b-[2rem] px-5 pb-14 pt-6 text-white lg:hidden"
          style={brandBg}
        >
          <SpeedLines />
          <div className="relative flex items-center gap-3">
            <div className="grid size-14 shrink-0 place-items-center rounded-full bg-white p-1.5 shadow-lg ring-4 ring-white/25">
              <img src="/logo.png" alt="Torque Toyzz" className="size-full object-contain" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-extrabold leading-tight tracking-tight">Torque Toyzz</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-white/80">
                <Dial className="size-3.5 shrink-0" />
                <span className="truncate">RC driver portal</span>
              </p>
            </div>
          </div>
        </header>

        <div className="tt-rise relative z-10 mx-auto -mt-10 w-full max-w-[460px] px-4 lg:mt-0 lg:px-0">
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.12)] sm:p-8">
            <div className="mb-1 flex items-start justify-between gap-3">
              <h2 className="text-2xl font-extrabold tracking-tight text-[#111827]">
                Create your account
              </h2>
              <span className="mt-1 shrink-0 rounded-full bg-[#fae8e8] px-2.5 py-0.5 text-[11px] font-bold text-[#8b151b]">
                {done}/{steps.length}
              </span>
            </div>
            <p className="mb-4 text-sm text-[#6b7280]">Sign up for your Torque Toyzz account.</p>

            {/* Live progress */}
            <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-[#eef0f4]" aria-hidden="true">
              <div
                className="h-full rounded-full bg-[#b81d24] transition-all duration-500"
                style={{ width: `${progress * 100}%` }}
              />
            </div>

            <form onSubmit={handleSubmit} className="tt-stagger space-y-4" noValidate>
              <Field id="name" label="Full name" icon={User} error={errors.name} right={okName && <OkTick />}>
                <input
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={handleChange('name')}
                  disabled={loggingIn}
                  autoComplete="name"
                  autoFocus
                  className={inputCls(errors.name, 'pr-10')}
                />
              </Field>

              <Field id="email" label="Email" icon={Mail} error={errors.email} right={okEmail && <OkTick />}>
                <input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  value={form.email}
                  onChange={handleChange('email')}
                  disabled={loggingIn}
                  autoComplete="email"
                  className={inputCls(errors.email, 'pr-10')}
                />
              </Field>

              <Field
                id="phone"
                label="Phone number"
                icon={Phone}
                error={errors.phone}
                right={okPhone && <OkTick />}
              >
                <input
                  id="phone"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={form.phone}
                  onChange={handleChange('phone')}
                  disabled={loggingIn}
                  autoComplete="tel"
                  inputMode="tel"
                  className={inputCls(errors.phone, 'pr-10')}
                />
              </Field>

              <Field
                id="password"
                label="Password"
                icon={Lock}
                error={errors.password}
                right={<EyeToggle shown={showPassword} onClick={() => setShowPassword(!showPassword)} />}
                hint={
                  form.password && (
                    <div className="mt-2" aria-live="polite">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="h-1.5 flex-1 rounded-full transition-colors duration-300"
                            style={{ background: i <= score ? strengthColor : '#e5e7eb' }}
                          />
                        ))}
                      </div>
                      <p className="mt-1 text-xs font-semibold" style={{ color: strengthColor }}>
                        {strengthLabel}
                        <span className="font-normal text-[#6b7280]">
                          {score < 3 ? ' · add length, numbers or symbols' : ''}
                        </span>
                      </p>
                    </div>
                  )
                }
              >
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={handleChange('password')}
                  disabled={loggingIn}
                  autoComplete="new-password"
                  className={inputCls(errors.password, 'pr-11')}
                />
              </Field>

              <Field
                id="confirmPassword"
                label="Confirm password"
                icon={Lock}
                error={errors.confirmPassword}
                right={
                  <>
                    {okConfirm && (
                      <span className="pointer-events-none absolute right-11 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded-full bg-[#8b151b]">
                        <Check className="size-3 stroke-[3] text-white" />
                      </span>
                    )}
                    <EyeToggle
                      shown={showConfirmPassword}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                  </>
                }
                hint={
                  form.confirmPassword && !okConfirm ? (
                    <p className="mt-1 text-xs font-medium text-[#6b7280]">Keep typing, passwords must match</p>
                  ) : null
                }
              >
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  disabled={loggingIn}
                  autoComplete="new-password"
                  className={inputCls(errors.confirmPassword, 'pr-20')}
                />
              </Field>

              {/* Terms */}
              <div className="pt-0.5">
                <label
                  className={`flex cursor-pointer select-none items-start gap-3 rounded-xl border p-3 transition-colors ${
                    acceptTerms
                      ? 'border-[#b81d24]/40 bg-[#fae8e8]/60'
                      : errors.acceptTerms
                        ? 'tt-shake border-[#8b151b]'
                        : 'border-[#e5e7eb] hover:bg-[#f8f8f9]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => {
                      setAcceptTerms(e.target.checked);
                      setErrors((prev) => ({ ...prev, acceptTerms: undefined }));
                    }}
                    disabled={loggingIn}
                    className="mt-0.5 size-4.5 shrink-0 cursor-pointer rounded-[4px] border border-[#d1d5db] text-[#b81d24] accent-[#b81d24]"
                  />
                  <span className="text-xs leading-relaxed text-[#374151]">
                    I agree to the{' '}
                    <span className="font-semibold text-[#8b151b] hover:underline">
                      Terms &amp; Conditions
                    </span>{' '}
                    and{' '}
                    <span className="font-semibold text-[#8b151b] hover:underline">Privacy Policy</span>
                  </span>
                </label>
                {errors.acceptTerms && (
                  <p className="mt-1 text-xs font-semibold text-[#8b151b]" role="alert">
                    {errors.acceptTerms}
                  </p>
                )}
              </div>

              {/* Create account */}
              <button
                type="submit"
                disabled={isDisabled}
                className="tt-shine group mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#b81d24] py-3.5 text-base font-bold text-white shadow-md shadow-[#b81d24]/20 transition-all hover:bg-[#a1181e] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loggingIn ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create account</span>
                    <ArrowRight className="size-4.5 stroke-[2.5] transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>

              <p className="pt-1 text-center text-sm text-[#4b5563]">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-[#b81d24] hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </div>

          {/* Mobile badges */}
          <div className="mt-6 flex flex-col items-center gap-2.5 lg:hidden">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#fae8e8] px-3.5 py-1.5 text-xs font-semibold text-[#8b151b]">
                <ShieldCheck className="size-3.5" />
                <span>Secure checkout</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#fae8e8] px-3.5 py-1.5 text-xs font-semibold text-[#8b151b]">
                <Truck className="size-3.5" />
                <span>Fast RC shipping</span>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9ca3af]">
              <Dial className="size-3.5 shrink-0" />
              <span>Pro-grade RC hobby supplies &amp; parts</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}