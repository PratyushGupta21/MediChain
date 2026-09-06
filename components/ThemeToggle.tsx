'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Laptop } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-lg border border-slate-200 bg-white/50 dark:border-slate-800 dark:bg-slate-800/50" />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Toggle theme"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white shadow-sm transition-colors"
        >
          {isDark ? (
            <Sun className="h-4 w-4 text-amber-400 transition-all hover:rotate-45" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700 transition-all dark:text-slate-200 hover:-rotate-12" />
          )}
          <span className="sr-only">Toggle theme</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 shadow-xl rounded-lg font-sans">
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className={`flex items-center gap-2 cursor-pointer text-xs rounded-md ${theme === 'light' ? 'font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30' : ''}`}
        >
          <Moon className="h-3.5 w-3.5" />
          Light Mode
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-2 cursor-pointer text-xs rounded-md ${theme === 'dark' ? 'font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30' : ''}`}
        >
          <Sun className="h-3.5 w-3.5 text-amber-500" />
          Dark Mode
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className={`flex items-center gap-2 cursor-pointer text-xs rounded-md ${theme === 'system' ? 'font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30' : ''}`}
        >
          <Laptop className="h-3.5 w-3.5" />
          System Auto
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
