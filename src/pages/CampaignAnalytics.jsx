import React from 'react';
import { dropStore } from '@/features/drops/dropStore';
import GlassCard from '@/components/ui/GlassCard';
import BackButton from '@/components/ui/BackButton';
import { TrendingUp, Clock, Radio, Users } from 'lucide-react';

export default function CampaignAnalytics({ id, onNavigate }) {
  const drop = dropStore.getDropById(id);

  if (!drop) {
    return (
      <div className="text-center py-12 max-w-md mx-auto px-4">
        <p className="text-zinc-400 text-sm mb-4">We couldn't find the analytics for this campaign.</p>
        <BackButton onBack={() => onNavigate('dashboard')} />
      </div>
    );
  }

  // Prevent NaN boundaries if slots haven't been declared properly
  const totalSlots = parseInt(drop.winnersCount, 10) || 1;
  const depletionRate = Math.round((drop.claimedCount / totalSlots) * 100);

  // Fallback map: Extract live claims sync structures from dropStore
  const liveHistory = drop.claimsList || drop.analytics?.history || [];

  return (
    /* 🖥️ Responsive outer container handles desktop layouts gracefully up to 5xl */
    <div className="space-y-5 pt-2 animate-reveal text-zinc-100 text-left w-full max-w-md md:max-w-5xl mx-auto px-4">
      <BackButton onBack={() => onNavigate('dashboard')} fallbackText="Back to Dashboard" />

      <div className="space-y-0.5">
        <h2 className="text-xl font-black tracking-tight text-white">Campaign Analytics</h2>
        <p className="text-xs text-zinc-500 font-mono">ID: {drop.id}</p>
      </div>

      {/* 💻 Splits workspace into two distinct columns on desktop layouts */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        
        {/* LEFT COLUMN: Distribution Progress & Macro Numbers */}
        <div className="md:col-span-6 space-y-4">
          
          {/* Dynamic Depletion Progress Status Bar Canvas */}
          <GlassCard className="bg-zinc-950/60 p-5 space-y-3 border-white/5 rounded-2xl">
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider text-[10px]">Pool Progress</span>
              <span className="text-xs font-mono font-black text-brand-accent">{depletionRate}% Claimed</span>
            </div>
            <div className="w-full bg-zinc-900/60 h-2.5 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-brand-accent to-emerald-500 transition-all duration-500"
                style={{ width: `${Math.min(100, depletionRate)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-zinc-500 font-mono pt-1 font-bold">
              <span>{drop.claimedCount} Rewards Claimed</span>
              <span>{Math.max(0, drop.winnersCount - drop.claimedCount)} Remaining Slots</span>
            </div>
          </GlassCard>

          {/* Grid Metrics Breakdown Metrics Row */}
          <div className="grid grid-cols-2 gap-3">
            <GlassCard className="p-4 bg-zinc-900/20 border-white/5 space-y-1.5 rounded-xl">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-brand-accent" /> Engagement
              </span>
              <h4 className="text-2xl font-mono font-black text-white tracking-tight">
                {drop.analytics?.clicks || drop.claimedCount + 3} <span className="text-xs font-bold text-zinc-500 font-sans uppercase">Clicks</span>
              </h4>
            </GlassCard>

            <GlassCard className="p-4 bg-zinc-900/20 border-white/5 space-y-1.5 rounded-xl">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold flex items-center gap-1">
                <Clock className="h-3 w-3 text-emerald-400" /> Avg Speed
              </span>
              <h4 className="text-2xl font-black text-white font-mono tracking-tight">
                {drop.analytics?.averageClaimTime || "42s"}
              </h4>
            </GlassCard>
          </div>

          {/* Campaign Core Settings Reference Block */}
          <GlassCard className="p-4 bg-zinc-950/20 border-white/5 rounded-xl text-xs font-mono space-y-2 text-zinc-400">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-zinc-500">Campaign Title</span>
              <span className="text-zinc-200 font-sans font-bold truncate max-w-[60%]">{drop.title}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-zinc-500">Asset Pool Allocation</span>
              <span className="text-emerald-400 font-black">{drop.amount} {drop.token}</span>
            </div>
          </GlassCard>
        </div>

        {/* RIGHT COLUMN: Real-time Live Distribution Activity Feed Component List */}
        <div className="md:col-span-6 space-y-2">
          <h3 className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase px-1">
            Live Activity Feed
          </h3>
          
          <GlassCard className="p-1.5 border-white/5 bg-zinc-950/20 rounded-2xl overflow-hidden min-h-[30vh] md:min-h-[38vh]">
            {liveHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-xs text-zinc-600 font-medium">Waiting for incoming community claims...</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5 max-h-[36vh] md:max-h-[44vh] overflow-y-auto custom-scrollbar">
                {liveHistory.map((log, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between text-xs animate-reveal hover:bg-white/[0.01]">
                    <div className="flex items-center gap-2.5 min-w-[50%] truncate">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400 shrink-0" />
                      <span className="font-bold text-zinc-300 truncate">
                        {log.username?.startsWith('@') ? log.username : `@${log.username || 'anonymous'}`}
                      </span>
                    </div>
                    <div className="text-right flex items-center gap-2 shrink-0 font-mono">
                      <span className="font-black text-white">+{log.amount} {drop.token}</span>
                      <span className="text-[10px] text-zinc-500">{log.time || "Just now"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

      </div>
    </div>
  );
}