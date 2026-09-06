'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface AccessRestrictedProps {
  title: string;
  description: string;
  footer?: string;
}

export default function AccessRestricted({
  title,
  description,
  footer,
}: AccessRestrictedProps) {
  return (
    <div className="mx-auto my-12 max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-8 text-center shadow-xl dark:shadow-2xl dark:backdrop-blur-md font-sans transition-all">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 mb-5 shadow-inner">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
        {description}
      </p>
      {footer && (
        <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-4 text-xs text-slate-400 dark:text-slate-500">
          {footer}
        </div>
      )}
    </div>
  );
}
