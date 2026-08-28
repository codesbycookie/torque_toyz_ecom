'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Loader2,
  LogIn,
  Eye,
  EyeOff,
  ShoppingBag,
  Package,
  CreditCard,
  Users,
  ArrowRight,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginId.trim() || !password) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/admin');
    }, 800);
  };

  return (
    <div className="min-h-svh grid lg:grid-cols-2">
      {/* ── Left Brand Panel ──────────────────────────────── */}
      <div className="hidden lg:flex flex-col relative overflow-hidden bg-[oklch(0.11_0_0)] text-white">
        {/* soft red glow */}
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#d83a42]/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#d83a42]/10 blur-3xl" />

        {/* subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(216,58,66,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(216,58,66,0.5) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative z-10 flex flex-1 flex-col justify-between p-12 xl:p-16">
          {/* Top brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl torque-red-bg torque-glow">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium tracking-[0.25em] torque-red uppercase">
                Torque Toyzz
              </p>
              <p className="text-sm text-white/60">Commerce Admin</p>
            </div>
          </div>

          {/* Center content */}
          <div className="max-w-md space-y-8">
            <div>
              <h1 className="text-4xl xl:text-5xl font-bold tracking-tight leading-tight text-white">
                Manage your
                <br />
                <span className="torque-red">entire store</span>
                <br />
                from one place
              </h1>
              <p className="mt-5 text-base leading-relaxed text-white/55">
                Products, orders, customers, payments and inventory —
                everything you need to run the business.
              </p>
            </div>

            {/* Feature chips */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Package, label: 'Products' },
                { icon: ShoppingBag, label: 'Orders' },
                { icon: Users, label: 'Customers' },
                { icon: CreditCard, label: 'Payments' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d83a42]/15">
                    <item.icon className="h-4 w-4 torque-red" />
                  </div>
                  <span className="text-sm font-medium text-white/80">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-[11px] tracking-wide text-white/30">
            © {new Date().getFullYear()} Torque Toyzz · All rights reserved
          </p>
        </div>
      </div>

      {/* ── Right Form Panel ──────────────────────────────── */}
      <div className="flex min-h-svh items-center justify-center bg-background px-4 py-10 sm:px-6">
        <div className="w-full max-w-[420px] space-y-8">
          {/* Mobile brand */}
          <div className="flex flex-col items-center text-center lg:hidden">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl torque-red-bg text-white torque-glow">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Torque Toyzz</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to the admin panel
            </p>
          </div>

          <Card className="torque-card border-0 shadow-2xl shadow-black/5">
            <CardHeader className="space-y-1 pb-2 pt-8 px-8">
              <CardTitle className="text-2xl font-bold tracking-tight">
                Welcome back
              </CardTitle>
              <CardDescription className="text-sm">
                Enter your credentials to access the dashboard
              </CardDescription>
            </CardHeader>

            <CardContent className="px-8 pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Login ID */}
                <div className="space-y-2">
                  <Label htmlFor="loginId" className="text-sm font-medium">
                    Login ID
                  </Label>
                  <Input
                    id="loginId"
                    type="text"
                    placeholder="admin@torquetoyzz.com"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    disabled={loading}
                    required
                    autoComplete="username"
                    className="h-12 text-sm torque-input"
                    autoFocus
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      required
                      autoComplete="current-password"
                      className="h-12 pr-11 text-sm torque-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground torque-text-hover transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4.5 w-4.5" />
                      ) : (
                        <Eye className="h-4.5 w-4.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember me */}
                <div className="flex items-center gap-2.5 pt-1">
                  <Checkbox
                    id="rememberMe"
                    className="data-[state=checked]:bg-[#d83a42] border-[#d83a42]"
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setRememberMe(checked === true)
                    }
                    disabled={loading}
                  />
                  <Label
                    htmlFor="rememberMe"
                    className="text-sm font-medium cursor-pointer text-muted-foreground"
                  >
                    Keep me signed in
                  </Label>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  size="lg"
                  disabled={loading || !loginId.trim() || !password}
                  className="h-12 w-full text-sm font-semibold torque-button mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign in to Dashboard
                    </>
                  )}
                </Button>
              </form>
            </CardContent>

            
          </Card>

          {/* Extra note */}
          <p className="text-center text-xs text-muted-foreground/70">
            Protected admin area · Unauthorized access is prohibited
          </p>
        </div>
      </div>
    </div>
  );
}