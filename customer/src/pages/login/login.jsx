'use client';
import { useState } from 'react';
import { Link } from 'react-router-dom';
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

export default function Login() {
  const { login, loggingIn } = useAuth();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginId.trim() || !password) return;

    await login({ identifier: loginId.trim(), password, rememberMe });
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
            Full throttle.
            <br />
            Every time.
          </h1>
          <p className="text-white/60 text-[15px] leading-relaxed">
            Sign in to track orders, manage your builds, and get first access to
            every new kit before it sells out.
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
            <h2 className="text-2xl font-semibold tracking-tight mb-1">Welcome back, racer</h2>
            <p className="text-muted-foreground text-sm mb-7">
              Sign in to your Torque Toyzz account.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="loginId" className="block text-sm font-medium mb-1.5">
                  Email or username
                </label>
                <input
                  id="loginId"
                  type="text"
                  placeholder="you@email.com"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  disabled={loggingIn}
                  required
                  autoComplete="username"
                  autoFocus
                  className="torque-input w-full rounded-md border border-input bg-input/30 px-3.5 py-2.5 text-sm outline-none transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium">
                    Password
                  </label>
                  <a href="/forgot-password" className="text-xs">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loggingIn}
                    required
                    autoComplete="current-password"
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
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loggingIn}
                  className="w-4 h-4 rounded border-input accent-primary"
                />
                <span className="text-sm text-muted-foreground">Keep me signed in</span>
              </label>

              <button
                type="submit"
                disabled={loggingIn || !loginId.trim() || !password}
                className="torque-button torque-shine w-full flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-semibold disabled:opacity-70 mt-2"
              >
                {loggingIn ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              <p className="text-muted-foreground text-sm text-center pt-2">
                New to Torque Toyzz? <Link to="/register" className="text-primary hover:underline">
                  Create an account
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