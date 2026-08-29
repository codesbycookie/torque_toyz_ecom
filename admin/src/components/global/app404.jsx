import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowRight } from 'lucide-react';

import unserviceableImg from '/logo.png';
import { useAuth } from '@/core/contexts/auth.context';

const roleConfig = {
  admin: {
    label: 'Page Not Found',
    message: 'This page doesn’t exist in the admin workspace.',
    redirect: '/admin/',
    cta: 'Go to Admin Dashboard',
  },
};

export default function InsiderNotFound() {
  const { user } = useAuth();
  const role = user?.role || 'admin';
  const config = roleConfig[role];

  return (
    <div className="relative flex h-screen max-h-full w-full items-center justify-center overflow-y-hidden  px-4">
      

      <Card className="relative w-full max-w-2xl overflow-hidden border-border/60 shadow-2xl backdrop-blur-sm">
        {/* Top accent bar */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary" />

        <CardContent className="flex flex-col items-center gap-6 py-14 text-center">
          {/* Status badge */}
          <span className="inline-flex items-center gap-2 rounded-full bg-destructive/10 px-4 py-1.5 text-xs font-medium text-destructive ring-1 ring-destructive/20">
            <ShieldAlert className="h-3.5 w-3.5 animate-pulse" />
            {config.label}
          </span>

          {/* Logo with glow + float */}
          <div className="relative mx-auto w-fit">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl opacity-70" />
            <img
              src={unserviceableImg}
              alt="Restricted access"
              className="relative mx-auto w-44 max-w-full animate-[float_4s_ease-in-out_infinite] drop-shadow-lg"
            />
          </div>

          {/* 404 heading */}
          <h1 className="bg-gradient-to-br from-foreground to-foreground/40 bg-clip-text text-6xl font-extrabold tracking-tight text-transparent sm:text-7xl">
            404
          </h1>

          {/* Message */}
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            {config.message}
          </p>

          <div className="h-px w-20 bg-gradient-to-r from-transparent via-border to-transparent" />

          <p className="text-xs text-muted-foreground/80">
            Nothing is broken. You can continue safely from your dashboard.
          </p>

          {/* CTA */}
          <Link to={config.redirect} className="w-full max-w-xs">
            <Button className="group w-full gap-2 text-white shadow-md transition-all hover:shadow-lg hover:shadow-primary/20">
              {config.cta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}