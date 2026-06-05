import React from 'react';
import BackButton from '@/components/ui/BackButton';
import GlassCard from '@/components/ui/GlassCard';
import { Shield, Lock, EyeOff, Scale } from 'lucide-react';

export default function PrivacyPolicy({ onNavigate }) {
  return (
    <div className="space-y-6 pt-2 w-full max-w-2xl mx-auto px-4 md:px-6 animate-reveal text-zinc-100">
      <BackButton onBack={() => onNavigate('home')} fallbackText="Back" />

      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Shield className="h-5 w-5 text-brand-accent" /> Privacy & Protection Policy
        </h2>
        <p className="text-xs text-zinc-400">Review how ledger parameters safeguard data records in line with local compliance requirements.</p>
      </div>

      <div className="space-y-4 text-left text-xs text-zinc-400 leading-relaxed">
        <GlassCard className="p-5 border-white/5 bg-zinc-900/20 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-zinc-200 font-bold">
            <EyeOff className="h-4 w-4 text-brand-accent" />
            <span>Ad-Free Integrity Commitment</span>
          </div>
          <p>
            We run a strict, tracking-free infrastructure interface. SwiftDrop does not use standard advertising cookie variables, meaning tracking configurations or user target profile logging elements are completely blocked.
          </p>
        </GlassCard>

        <GlassCard className="p-5 border-white/5 bg-zinc-900/20 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-zinc-200 font-bold">
            <Lock className="h-4 w-4 text-emerald-400" />
            <span>Data Collection Scope</span>
          </div>
          <p>
            We strictly collect minimal Telegram validation signatures (usernames and transaction hashes) to calculate payout allocations. Internal wallet balances represent system-only memory structures that are completely destroyed once an external cashout is pushed.
          </p>
        </GlassCard>

        <GlassCard className="p-5 border-white/5 bg-zinc-900/20 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-zinc-200 font-bold">
            <Scale className="h-4 w-4 text-brand-gold" />
            <span>Regulatory Regulatory Standards</span>
          </div>
          <p>
            Processing steps comply cleanly with standard user rights outlined in regional mandates, specifically the Nigeria Data Protection Regulation (NDPR). You maintain absolute ownership over authorization mechanics.
          </p>
        </GlassCard>

        <div className="text-center text-[10px] text-zinc-600 font-mono pt-2">
          Last updated: May 2026 • Run <span className="text-zinc-500">/privacy</span> inside your chat engine anytime.
        </div>
      </div>
    </div>
  );
}