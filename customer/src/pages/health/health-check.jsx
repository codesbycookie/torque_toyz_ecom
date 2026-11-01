import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Activity, RefreshCw, Server, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import axios from "axios";

const POLL_INTERVAL_SECONDS = 12;

export default function HealthCheck() {
  const location = useLocation();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [isHealthy, setIsHealthy] = useState(false);
  const [countdown, setCountdown] = useState(POLL_INTERVAL_SECONDS);
  const [attempts, setAttempts] = useState(0);

  // Target path to navigate to once backend is healthy
  const targetPath =
    location.state?.from?.pathname ||
    new URLSearchParams(location.search).get("redirect") ||
    "/";

  const isCheckingRef = useRef(false);

  const checkHealth = async () => {
    if (isCheckingRef.current || isHealthy) return;
    try {
      isCheckingRef.current = true;
      setChecking(true);
      const baseUrl =
        import.meta.env.VITE_BASE_URL || "http://192.168.29.100:3000/api/v1";

      const res = await axios.get(`${baseUrl}/health`, { timeout: 4000 });

      if (res.status === 200 && res.data?.status === "ok") {
        setIsHealthy(true);
        setTimeout(() => {
          navigate(targetPath, { replace: true });
        }, 1200);
        return;
      }
    } catch {
      // Backend is still offline or starting up
    } finally {
      setAttempts((prev) => prev + 1);
      setChecking(false);
      setCountdown(POLL_INTERVAL_SECONDS);
      isCheckingRef.current = false;
    }
  };

  // Run initial health check immediately on mount
  useEffect(() => {
    checkHealth();
  }, []);

  // 1-second interval to handle the 10-15s polling countdown
  useEffect(() => {
    if (isHealthy) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          checkHealth();
          return POLL_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isHealthy]);

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between items-center px-4 py-12 relative overflow-hidden select-none">
      {/* Background glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <header className="w-full max-w-3xl flex items-center justify-between pb-6 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black tracking-wider text-lg border border-primary/20">
            TT
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">
            TORQUE<span className="text-primary">TOYZ</span>
          </span>
        </div>

        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
            isHealthy
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              : "bg-amber-500/10 text-amber-500 border-amber-500/20"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isHealthy ? "bg-emerald-500" : "bg-amber-500 animate-ping"
            }`}
          />
          {isHealthy ? "Backend Operational" : "Awaiting Service"}
        </div>
      </header>

      {/* Main Content Card */}
      <main className="max-w-md w-full text-center my-auto py-8 space-y-6">
        <div className="relative mx-auto w-24 h-24 rounded-3xl bg-card border border-border/80 flex items-center justify-center shadow-xl">
          {isHealthy ? (
            <CheckCircle2 className="h-12 w-12 text-emerald-500 animate-bounce" />
          ) : (
            <Server className={`h-12 w-12 text-primary ${checking ? "animate-pulse" : ""}`} />
          )}

          <div
            className={`absolute -bottom-1 -right-1 p-1.5 rounded-full shadow-md text-white ${
              isHealthy ? "bg-emerald-500" : "bg-amber-500"
            }`}
          >
            {isHealthy ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <Activity className={`h-4 w-4 ${checking ? "animate-spin" : ""}`} />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {isHealthy ? "Systems Online!" : "Connecting to Services"}
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {isHealthy
              ? "Backend API responded successfully. Navigating to storefront..."
              : "Checking system vitals and establishing connection to Torque Toyz backend."}
          </p>
        </div>

        {/* Polling Countdown Indicator */}
        <div className="p-4 rounded-xl bg-card border border-border/70 space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Next automatic poll in:</span>
            <span className="font-mono font-bold text-foreground">
              {isHealthy ? "Ready" : `${countdown}s`}
            </span>
          </div>

          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-1000 ease-linear rounded-full"
              style={{
                width: isHealthy ? "100%" : `${((POLL_INTERVAL_SECONDS - countdown) / POLL_INTERVAL_SECONDS) * 100}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
            <span>Attempts: {attempts}</span>
            <span className="flex items-center gap-1">
              <Activity className="h-3 w-3 text-primary" /> Auto-polling (12s)
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          {isHealthy ? (
            <Button
              size="lg"
              className="w-full font-semibold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
              onClick={() => navigate(targetPath, { replace: true })}
            >
              Enter Storefront
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="lg"
              className="w-full font-semibold gap-2 shadow-md shadow-primary/20"
              disabled={checking}
              onClick={() => checkHealth()}
            >
              <RefreshCw className={`h-4 w-4 ${checking ? "animate-spin" : ""}`} />
              {checking ? "Checking Connection..." : "Check Status Now"}
            </Button>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-3xl pt-6 border-t border-border/40 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Torque Toyz Scale Models. All rights reserved.
      </footer>
    </div>
  );
}

