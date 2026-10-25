'use client';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/core/contexts/auth.context';
import {
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Lock,
  User,
  CheckCircle2,
  ShieldCheck,
  Truck,
  SlidersHorizontal,
  TriangleAlert,
} from 'lucide-react';

/* ---------- UI-only helpers (no auth logic here) ---------- */

const css = `
@keyframes tt-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes tt-lines{from{background-position:0 0}to{background-position:-240px 0}}
.tt-rise{animation:tt-rise .55s cubic-bezier(.2,.8,.2,1) both}
.tt-lines{animation:tt-lines 2.6s linear infinite}
@media (prefers-reduced-motion:reduce){.tt-rise,.tt-lines{animation:none}}
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
    <div className={`w-full max-w-[260px] ${p === 1 ? 'tt-pulse' : ''}`}>
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

const Field = ({ id, label, icon: Icon, right, extra, children }) => (
  <div>
    <div className="mb-1.5 flex items-center justify-between">
      <label
        htmlFor={id}
        className="block text-[11px] font-bold uppercase tracking-wider text-[#4b5563]"
      >
        {label}
      </label>
      {extra}
    </div>
    <div className="group relative">
      <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-[#9ca3af] transition-colors group-focus-within:text-[#b81d24]" />
      {children}
      {right}
    </div>
  </div>
);

const Chip = ({ icon: Icon, children, tone = 'red' }) => (
  <div
    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold ${
      tone === 'blue' ? 'bg-[#e8edfa] text-[#2563eb]' : 'bg-[#fae8e8] text-[#8b151b]'
    }`}
  >
    <Icon className="size-3.5" />
    <span>{children}</span>
  </div>
);

/* ---------- Page ---------- */

export default function Login() {
  const { login, loggingIn } = useAuth();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [capsOn, setCapsOn] = useState(false); // UI hint only

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginId.trim() || !password) return;

    await login({ identifier: loginId.trim(), password, rememberMe });
  };

  const hasIdentifier = loginId.trim().length > 0;

  // UI-only: drives the gauge
  const progress = (hasIdentifier ? 0.5 : 0) + (password ? 0.5 : 0);
  const gaugeLabel =
    progress === 1 ? 'Green light. Hit sign in' : progress > 0 ? 'Warming up the engine' : 'Engine idle';

  return (
    <div className="min-h-screen w-full bg-[#f8f8f9] font-sans text-[#1c1c1e] antialiased lg:grid lg:grid-cols-[1fr_1.05fr]">
      <style>{css}</style>

      {/* Desktop brand panel */}
      <aside
        className="relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex"
        style={brandBg}
      >
        <SpeedLines />
        <div className="tt-float relative inline-flex w-fit rounded-2xl bg-white px-5 py-3 shadow-xl">
          <img src="/logo.png" alt="Torque Toyzz" className="h-14 w-auto object-contain" />
        </div>

        <div className="relative flex flex-col items-start gap-8">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-bold backdrop-blur">
              <Dial className="size-4" />
              <span>Customer Portal</span>
            </div>
            <h1 className="max-w-md text-4xl font-extrabold leading-tight tracking-tight text-white xl:text-5xl">
              Back on the grid, racer.
            </h1>
            <p className="mt-3 max-w-sm text-base text-white/80">
              Pro-grade RC cars, parts and upgrades. Sign in to pick up where you left off.
            </p>
          </div>
          <Gauge value={progress} label={gaugeLabel} />
        </div>

        <div className="relative">
          <Car />
          <div className="mt-3 flex flex-wrap gap-2">
          {[
            [ShieldCheck, 'Secure checkout'],
            [Truck, 'Fast RC shipping'],
            [SlidersHorizontal, 'Pro-grade tuning'],
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
                <span className="truncate">Customer Portal</span>
              </p>
            </div>
          </div>
        </header>

        {/* Card */}
        <div className="tt-rise relative z-10 mx-auto -mt-10 w-full max-w-[430px] px-4 lg:mt-0 lg:px-0">
          <div className="rounded-2xl border border-t-[3.5px] border-[#e5e7eb] border-t-[#b81d24] bg-white p-6 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.12)] sm:p-8">
            <div className="mb-1 flex items-start justify-between gap-3">
              <h2 className="text-2xl font-extrabold tracking-tight text-[#111827]">
                Welcome back, racer
              </h2>
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#fae8e8] text-[#b81d24]">
                <Dial className="size-5" />
              </div>
            </div>
            <p className="mb-6 text-sm text-[#6b7280]">Sign in to your Torque Toyzz account.</p>

            {/* Mobile-only live progress bar */}
            <div className="mb-5 lg:hidden" aria-hidden="true">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#eef0f4]">
                <div
                  className="h-full rounded-full bg-[#b81d24] transition-all duration-500"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs font-medium text-[#6b7280]">{gaugeLabel}</p>
            </div>

            <form onSubmit={handleSubmit} className="tt-stagger space-y-4" noValidate>
              {/* Email or Username */}
              <Field
                id="loginId"
                label="Email or username"
                icon={User}
                right={
                  hasIdentifier && (
                    <div className="absolute right-3.5 top-1/2 flex -translate-y-1/2 items-center justify-center">
                      <CheckCircle2 className="size-5 fill-[#8b151b] stroke-white text-[#8b151b]" />
                    </div>
                  )
                }
              >
                <input
                  id="loginId"
                  type="text"
                  placeholder="you@email.com or username"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  disabled={loggingIn}
                  required
                  autoComplete="username"
                  autoFocus
                  className={`w-full rounded-xl bg-white py-3 pl-10 pr-10 text-sm font-medium text-[#111827] outline-none transition-all placeholder:text-[#9ca3af] ${
                    hasIdentifier
                      ? 'border-2 border-[#8b151b] shadow-xs'
                      : 'border border-[#d1d5db] focus:border-[#b81d24] focus:ring-2 focus:ring-[#b81d24]/15'
                  }`}
                />
              </Field>

              {/* Password */}
              <div>
                <Field
                  id="password"
                  label="Password"
                  icon={Lock}
                  extra={
                    <Link
                      to="/forgot-password"
                      className="rounded text-xs font-semibold text-[#b81d24] hover:underline focus-visible:outline-2 focus-visible:outline-[#b81d24]"
                    >
                      Forgot password?
                    </Link>
                  }
                  right={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[#6b7280] transition-colors hover:text-[#111827]"
                    >
                      {showPassword ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
                    </button>
                  }
                >
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyUp={(e) => setCapsOn(!!e.getModifierState?.('CapsLock'))}
                    onBlur={() => setCapsOn(false)}
                    disabled={loggingIn}
                    required
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-transparent bg-[#eef0f4] py-3 pl-10 pr-11 text-sm text-[#111827] outline-none transition-all placeholder:text-[#9ca3af] focus:border-[#b81d24] focus:bg-white focus:ring-2 focus:ring-[#b81d24]/15"
                  />
                </Field>
                {capsOn && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#8b151b]" role="status">
                    <TriangleAlert className="size-3.5" />
                    Caps Lock is on
                  </p>
                )}
              </div>

              {/* Keep me signed in & SSL */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <label className="inline-flex cursor-pointer select-none items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loggingIn}
                    className="size-4.5 cursor-pointer rounded-[4px] border border-[#d1d5db] text-[#b81d24] accent-[#b81d24]"
                  />
                  <span className="text-sm font-medium text-[#374151]">Keep me signed in</span>
                </label>
                <div className="inline-flex items-center gap-1 text-xs font-semibold text-[#4b5563]">
                  <Lock className="size-3.5 stroke-[2.2]" />
                  <span>SSL 256-bit</span>
                </div>
              </div>

              {/* Sign in */}
              <button
                type="submit"
                disabled={loggingIn || !loginId.trim() || !password}
                className="tt-shine group mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#b81d24] py-3.5 text-base font-bold text-white shadow-md shadow-[#b81d24]/20 transition-all hover:bg-[#a1181e] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loggingIn ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="size-4.5 stroke-[2.5] transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>

              <p className="pt-1 text-center text-sm text-[#4b5563]">
                New to Torque Toyzz?{' '}
                <Link
                  to="/register"
                  className="font-bold text-[#b81d24] hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </form>
          </div>

          {/* Mobile badges */}
          <div className="mt-6 flex flex-col items-center gap-2.5 lg:hidden">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Chip icon={ShieldCheck}>Secure checkout</Chip>
              <Chip icon={Truck}>Fast RC shipping</Chip>
            </div>
            <Chip icon={SlidersHorizontal} tone="blue">
              Pro-grade tuning
            </Chip>
          </div>
        </div>
      </main>
    </div>
  );
}