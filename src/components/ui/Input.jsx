import React from 'react';
import { cn } from '@/lib/cn';

export default function Input({ label, error, className, ...props }) {
  return (
    <div className="w-full space-y-2">
      {label && <label className="text-xs uppercase tracking-widest text-zinc-400 font-medium">{label}</label>}
      <input
        className={cn(
          "w-full glass-input px-4 py-3.5 rounded-xl text-white outline-none placeholder-zinc-600 text-sm",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}