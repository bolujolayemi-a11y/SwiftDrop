import React from 'react';
import { dropStore } from '@/features/drops/dropStore';
import GlassCard from '@/components/ui/GlassCard';
import BackButton from '@/components/ui/BackButton';
import { TrendingUp, Clock } from 'lucide-react';

export default function CampaignAnalytics({ id, onNavigate }) {
  const drop = dropStore.getDropById(id);

  if (!drop) {
    return (
      <div className="text-center py-10">
        <p className="text-zinc-400 text-sm">We couldn't find the analytics for this campaign.</p>
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
    <div className="space-y-5 pt-2 animate-reveal text-zinc-100 text-left">
      <BackButton onBack={() => onNavigate('dashboard')} fallbackText="Back to Dashboard" />

      <div className="space-y-0.5">
        <h2 className="text-xl font-bold tracking-tight text-white">Campaign Analytics</h2>
        <p className="text-xs text-zinc-500 font-mono">ID: {drop.id}</p>
      </div>

      {/* Dynamic Depletion Progress Status Bar Canvas */}
      <GlassCard className="bg-zinc-950/60 p-5 space-y-3 border-white/5 rounded-2xl">
        <div className="flex justify-between items-center">
          <span className="text-xs text-zinc-400 font-medium">Pool Distribution Progress</span>
          <span className="text-xs font-mono font-bold text-brand-accent">{depletionRate}% Claimed</span>
        </div>
        <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full bg-linear-to-r from-brand-accent to-emerald-500 transition-all duration-500"
            style={{ width: `${depletionRate}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-zinc-500 font-mono pt-1">
          <span>{drop.claimedCount} Rewards Claimed</span>
          <span>{Math.max(0, drop.winnersCount - drop.claimedCount)} Remaining Slots</span>
        </div>
      </GlassCard>

      {/* Grid Metrics Breakdown Metrics Row */}
      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-4 bg-zinc-900/20 border-white/5 space-y-1 rounded-xl">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-brand-accent" /> Engagement
          </span>
          <h4 className="text-xl font-black text-white tracking-tight">
            {drop.analytics?.clicks || drop.claimedCount + 3} <span className="text-xs font-normal text-zinc-500 font-sans">clicks</span>
          </h4>
        </GlassCard>

        <GlassCard className="p-4 bg-zinc-900/20 border-white/5 space-y-1 rounded-xl">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold flex items-center gap-1">
            <Clock className="h-3 w-3 text-brand-success" /> Avg Claim Speed
          </span>
          <h4 className="text-xl font-black text-white font-mono">
            {drop.analytics?.averageClaimTime || "42s"}
          </h4>
        </GlassCard>
      </div>

      {/* Real-time Live Distribution Activity Feed Component List */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase px-1">Live Activity Feed</h3>
        
        <GlassCard className="p-1.5 border-white/5 bg-zinc-950/20 rounded-2xl overflow-hidden">
          {liveHistory.length === 0 ? (
            <p className="text-center py-8 text-xs text-zinc-600 font-medium">Waiting for incoming community claims...</p>
          ) : (
            <div className="divide-y divide-white/5">
              {liveHistory.map((log, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between text-xs animate-reveal">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-brand-success shadow-xs shadow-brand-success" />
                    <span className="font-semibold text-zinc-300">
                      {log.username?.startsWith('@') ? log.username : `@${log.username || 'anonymous'}`}
                    </span>
                  </div>
                  <div className="text-right flex items-center gap-1.5">
                    <span className="font-mono font-black text-white">+{log.amount} {drop.token}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{log.time || "Just now"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}