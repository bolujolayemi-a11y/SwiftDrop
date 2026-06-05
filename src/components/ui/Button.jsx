import React from 'react';
import { cn } from '@/lib/cn';

export default function Button({ children, variant = 'primary', className, ...props }) {
  return (
    <button
      className={cn(
        "w-full py-4 px-6 rounded-xl font-medium tracking-wide transition-all duration-200 flex items-center justify-center gap-2",
        variant === 'primary' && "bg-brand-accent hover:bg-blue-600 text-white shadow-lg shadow-brand-accent/20 active:scale-[0.98]",
        variant === 'secondary' && "bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 active:scale-[0.98]",
        variant === 'ghost' && "bg-transparent text-zinc-400 hover:text-white",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}