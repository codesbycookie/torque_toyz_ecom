import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/core/contexts/auth.context';
import { toast } from 'sonner';
import {
  Mail,
  Lock,
  KeyRound,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  RotateCcw,
  ShieldCheck,
  Zap,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const brandBg = {
  backgroundImage:
    'repeating-conic-gradient(rgba(255,255,255,.06) 0% 25%, transparent 0% 50%), linear-gradient(135deg, #b81d24 0%, #a1181e 55%, #6e0f14 100%)',
  backgroundSize: '34px 34px, 100% 100%',
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { sendPasswordResetOtp, verifyPasswordResetOtp, resetPassword } = useAuth();

  // Step state: 1 = Email, 2 = OTP, 3 = New Password
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetOtp(cleanEmail);
      setStep(2);
      setResendCooldown(60);
    } catch {
      // Error handled by ApiError toast
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setLoading(true);
    try {
      await sendPasswordResetOtp(email.trim().toLowerCase());
      setResendCooldown(60);
    } catch {
      // Error handled
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      await verifyPasswordResetOtp(email.trim().toLowerCase(), cleanOtp);
      setStep(3);
    } catch {
      // Error handled
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim().toLowerCase(), otp.trim(), newPassword);
      navigate('/login');
    } catch {
      // Error handled
    } finally {
      setLoading(false);
    }
  };

  const stepsInfo = [
    { num: 1, title: 'Email Address' },
    { num: 2, title: 'Verify Passcode' },
    { num: 3, title: 'Set New Password' },
  ];

  return (
    <div className="min-h-screen w-full bg-[#f8f8f9] font-sans text-[#1c1c1e] antialiased lg:grid lg:grid-cols-[1fr_1.1fr]">
      {/* ─── LEFT: Brand & Visual Panel (Desktop) ─── */}
      <aside
        className="relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex"
        style={brandBg}
      >
        <div className="relative inline-flex w-fit rounded-2xl bg-white px-5 py-3 shadow-xl">
          <img src="/logo.png" alt="Torque Toyzz" className="h-14 w-auto object-contain" />
        </div>

        <div className="relative flex flex-col items-start gap-6 max-w-lg">
          <Badge className="bg-white/15 text-white border-none font-bold text-xs px-3.5 py-1.5 backdrop-blur gap-1.5">
            <KeyRound className="size-3.5 text-white" />
            <span>Account Security Recover</span>
          </Badge>

          <h1 className="text-4xl xl:text-5xl font-black leading-tight tracking-tight text-white uppercase font-heading">
            Reset Your Access Passcode
          </h1>

          <p className="text-base text-white/80 leading-relaxed">
            Locked out of the cockpit? Follow our quick 3-step verification to restore your collector credentials and get back on track.
          </p>

          {/* Stepper overview */}
          <div className="w-full space-y-3 pt-4 border-t border-white/20">
            {stepsInfo.map((s) => {
              const isCurrent = step === s.num;
              const isDone = step > s.num;
              return (
                <div
                  key={s.num}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isCurrent
                      ? 'bg-white/20 shadow-md font-bold'
                      : isDone
                      ? 'bg-white/10 opacity-75'
                      : 'opacity-40'
                  }`}
                >
                  <div
                    className={`size-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      isDone
                        ? 'bg-white text-primary'
                        : isCurrent
                        ? 'bg-white text-primary ring-2 ring-white/50'
                        : 'border border-white/50'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="size-4 text-emerald-600" /> : s.num}
                  </div>
                  <span className="text-sm font-semibold">{s.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-white/80">
          <ShieldCheck className="size-4 text-white" />
          <span>256-Bit Encrypted One-Time Passcode Verification</span>
        </div>
      </aside>

      {/* ─── RIGHT: Form Container ─── */}
      <main className="flex flex-col justify-center px-4 py-8 sm:px-8 lg:px-12 xl:px-16 min-h-screen">
        <div className="mx-auto w-full max-w-md space-y-8">
          {/* Header */}
          <div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-4 group"
            >
              <ArrowLeft className="size-3.5 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Sign In</span>
            </Link>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-heading">
              {step === 1
                ? 'Forgot Password?'
                : step === 2
                ? 'Check Your Email'
                : 'Create New Password'}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
              {step === 1
                ? 'Enter your registered email address and we will dispatch a secure 6-digit verification code.'
                : step === 2
                ? `Enter the 6-digit passcode dispatched to ${email}.`
                : 'Choose a strong, unique password with at least 8 characters to secure your account.'}
            </p>
          </div>

          {/* Stepper Progress Bar (Mobile & Tablet) */}
          <div className="grid grid-cols-3 gap-2 lg:hidden">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step >= num ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* ─── STEP 1: Enter Email ─── */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="reset-email" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Registered Email Address <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <Input
                    id="reset-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="racer@torquetoyzz.com"
                    autoFocus
                    className="h-11 rounded-xl bg-card border-border pl-10 text-sm focus-visible:ring-primary/30"
                  />
                  <Mail className="size-4.5 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-md gap-2 cursor-pointer"
              >
                <span>{loading ? 'Dispatching Code...' : 'Send Verification Code'}</span>
                <ArrowRight className="size-4" />
              </Button>
            </form>
          )}

          {/* ─── STEP 2: Enter OTP ─── */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="reset-otp" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    6-Digit Passcode <span className="text-primary">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Change Email
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="reset-otp"
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    autoFocus
                    className="h-12 rounded-xl bg-card border-border pl-10 text-center font-mono font-black text-xl tracking-[0.3em] focus-visible:ring-primary/30"
                  />
                  <KeyRound className="size-4.5 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Resend Action */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Didn&apos;t receive the code?</span>
                <button
                  type="button"
                  disabled={resendCooldown > 0 || loading}
                  onClick={handleResendOtp}
                  className="font-bold text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="size-3" />
                  <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}</span>
                </button>
              </div>

              <Button
                type="submit"
                disabled={loading || otp.trim().length !== 6}
                className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-md gap-2 cursor-pointer"
              >
                <span>{loading ? 'Verifying Code...' : 'Verify & Proceed'}</span>
                <ArrowRight className="size-4" />
              </Button>
            </form>
          )}

          {/* ─── STEP 3: Enter New Password ─── */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="new-password" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  New Password <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    autoFocus
                    className="h-11 rounded-xl bg-card border-border pl-10 pr-10 text-sm focus-visible:ring-primary/30"
                  />
                  <Lock className="size-4.5 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirm-password" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Confirm New Password <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="h-11 rounded-xl bg-card border-border pl-10 pr-10 text-sm focus-visible:ring-primary/30"
                  />
                  <Lock className="size-4.5 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Password Match Hint */}
              {confirmPassword.length > 0 && (
                <div className="text-xs flex items-center gap-1.5 pt-1">
                  {newPassword === confirmPassword ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="size-3.5" /> Passwords match
                    </span>
                  ) : (
                    <span className="text-destructive font-medium">Passwords do not match yet</span>
                  )}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || newPassword.length < 8 || newPassword !== confirmPassword}
                className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-md gap-2 cursor-pointer mt-2"
              >
                <span>{loading ? 'Updating Password...' : 'Save & Sign In'}</span>
                <CheckCircle2 className="size-4" />
              </Button>
            </form>
          )}

          {/* Footer Assistance */}
          <div className="pt-4 border-t border-border/80 text-center text-xs text-muted-foreground">
            Remember your credentials?{' '}
            <Link to="/login" className="font-bold text-primary hover:underline">
              Sign In to Garage
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
