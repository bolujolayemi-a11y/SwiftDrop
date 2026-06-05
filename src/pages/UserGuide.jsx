import React from 'react';
import BackButton from '@/components/ui/BackButton';
import GlassCard from '@/components/ui/GlassCard';
import { HelpCircle, Gift, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function UserGuide({ onNavigate }) {
  return (
    <div className="space-y-6 pt-2 w-full max-w-2xl mx-auto px-4 md:px-6 animate-reveal text-zinc-100">
      <BackButton onBack={() => onNavigate('home')} fallbackText="Back" />

      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-brand-accent" /> SwiftDrop User Guide
        </h2>
        <p className="text-xs text-zinc-400">Learn how to effortlessly claim crypto rewards and secure network balances.</p>
      </div>

      <div className="space-y-4">
        {/* Step 1 */}
        <GlassCard className="p-4 border-white/5 bg-zinc-900/20 rounded-xl space-y-2 text-left">
          <div className="flex items-center gap-2">
            <span className="h-5 w-5 rounded-full bg-brand-accent/10 text-[11px] font-mono font-bold text-brand-accent flex items-center justify-center border border-brand-accent/20">1</span>
            <h3 className="text-sm font-bold text-zinc-200">Find or Create an Active Pool</h3>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed pl-7">
            Browse active distribution campaigns on your home dashboard or design your own viral targeted link via the creator control panel.
          </p>
        </GlassCard>

        {/* Step 2 */}
        <GlassCard className="p-4 border-white/5 bg-zinc-900/20 rounded-xl space-y-2 text-left">
          <div className="flex items-center gap-2">
            <span className="h-5 w-5 rounded-full bg-amber-500/10 text-[11px] font-mono font-bold text-amber-400 flex items-center justify-center border border-amber-500/20">2</span>
            <h3 className="text-sm font-bold text-zinc-200">Complete Human Verification</h3>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed pl-7">
            Answer the anti-bot question parameter and forward the distribution loop payload straight to your chat channels to authorize access.
          </p>
        </GlassCard>

        {/* Step 3 */}
        <GlassCard className="p-4 border-white/5 bg-zinc-900/20 rounded-xl space-y-2 text-left">
          <div className="flex items-center gap-2">
            <span className="h-5 w-5 rounded-full bg-emerald-500/10 text-[11px] font-mono font-bold text-emerald-400 flex items-center justify-center border border-emerald-500/20">3</span>
            <h3 className="text-sm font-bold text-zinc-200">Instant Settlement Processing</h3>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed pl-7">
            Tap to trigger the cinematic settlement engine. Winnings immediately accumulate inside your internal ledger balance layout.
          </p>
        </GlassCard>

        {/* Telegram Shortcut Tip Box */}
        <div className="bg-zinc-950/40 border border-dashed border-white/5 rounded-xl p-4 text-center text-xs text-zinc-500 font-mono">
          💡 Telegram Bot Shortcut: Run <span className="text-brand-accent">/guide</span> directly inside your text input terminal to recall these documentation parameters.
        </div>
      </div>
    </div>
  );
}