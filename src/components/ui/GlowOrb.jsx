import React from 'react';

export default function GlowOrb({ className }) {
  return (
    <div className={`absolute pointer-events-none rounded-full bg-brand-accent blur-[120px] opacity-20 animate-glow-pulse ${className}`} />
  );
}