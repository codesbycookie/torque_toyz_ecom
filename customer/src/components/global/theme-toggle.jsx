'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className, align = 'end', showLabel = false }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn('size-9 rounded-xl text-muted-foreground', className)}
        aria-label="Toggle theme"
      >
        <span className="size-4.5 rounded-full bg-muted animate-pulse" />
      </Button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'size-9 sm:size-10 rounded-xl relative text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            className
          )}
          aria-label={`Toggle theme (currently ${theme})`}
        >
          {isDark ? (
            <Moon className="size-4.5 text-amber-300 stroke-[2.2] transition-transform group-hover:rotate-12 group-hover:scale-110" />
          ) : (
            <Sun className="size-4.5 text-amber-500 stroke-[2.2] transition-transform group-hover:rotate-45 group-hover:scale-110" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className="w-36 p-1.5 rounded-2xl shadow-xl border border-border bg-popover/98 backdrop-blur-xl text-foreground"
      >
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className={cn(
            'flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer',
            theme === 'light' && 'bg-primary/10 text-primary font-bold'
          )}
        >
          <Sun className="size-4 text-amber-500" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className={cn(
            'flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer',
            theme === 'dark' && 'bg-primary/10 text-primary font-bold'
          )}
        >
          <Moon className="size-4 text-amber-300" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className={cn(
            'flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer',
            theme === 'system' && 'bg-primary/10 text-primary font-bold'
          )}
        >
          <Monitor className="size-4 text-muted-foreground" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Inline segmented control for Settings & Profile pages
export function ThemeSegmented({ className }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-48 rounded-xl bg-muted animate-pulse" />;
  }

  const options = [
    { key: 'light', label: 'Light', icon: Sun, color: 'text-amber-500' },
    { key: 'dark', label: 'Dark', icon: Moon, color: 'text-amber-300' },
    { key: 'system', label: 'System', icon: Monitor, color: 'text-muted-foreground' },
  ];

  return (
    <div
      className={cn(
        'inline-flex items-center p-1 rounded-xl bg-muted/60 border border-border/80 gap-1 select-none',
        className
      )}
      role="radiogroup"
      aria-label="Theme selection"
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const active = theme === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(opt.key)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              active
                ? 'bg-card text-foreground shadow-2xs border border-border/80 font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            )}
          >
            <Icon className={cn('size-3.5', active && opt.color)} />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
