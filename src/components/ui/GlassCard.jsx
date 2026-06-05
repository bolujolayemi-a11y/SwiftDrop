import React from 'react';
import { cn } from '@/lib/cn';

export default function GlassCard({ children, className, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "glass-panel rounded-2xl p-5 transition-all duration-300",
        onClick && "hover:border-white/10 active:scale-[0.98] cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}