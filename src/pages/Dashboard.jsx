import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import BackButton from '@/components/ui/BackButton';
import { dropStore } from '@/features/drops/dropStore';
import { useTelegram } from '@/hooks/useTelegram';
import {
  Activity,
  Plus,
  Radio,
  Trash2,
  BarChart2,
  Eye,
  Calendar,
  UserCheck
} from 'lucide-react';

export default function Dashboard({ onNavigate, setDropId }) {
  const { user, triggerHaptic } = useTelegram();
  const [activeDrops, setActiveDrops] = useState(dropStore.getDrops());
  const [expandedAnalytics, setExpandedAnalytics] = useState({});

  useEffect(() => {
    const unsubscribe = dropStore.subscribe((updated) => {
      // 🧠 Ensure we filter out cloned static demos from dashboard tracks
      const cleanMerchantDrops = (updated || []).filter(d => d.isDemo !== true);
      setActiveDrops(cleanMerchantDrops);
    });

    return unsubscribe;
  }, []);

  const toggleAnalytics = (id, e) => {
    e.stopPropagation();
    triggerHaptic('light');

    setExpandedAnalytics((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleDeleteCampaign = (id, e) => {
    e.stopPropagation();
    triggerHaptic('warning');

    if (window.confirm('Are you sure you want to delete this campaign?')) {
      dropStore.deleteDrop(id);
      triggerHaptic('success');
    }
  };

  const totalClaims = activeDrops.reduce(
    (acc, d) => acc + (d.claimedCount || 0),
    0
  );

  return (
    /* 🖥️ Responsive outer layout container scales up smoothly to 5xl on desktop viewports */
    <div className="space-y-5 pt-2 animate-reveal text-zinc-100 text-left w-full max-w-md md:max-w-5xl mx-auto px-4">

      {/* HEADER ROW */}
      <div className="flex items-center justify-between">
        <BackButton onBack={() => onNavigate('home')} fallbackText="Back" />

        <button
          type="button"
          onClick={() => {
            triggerHaptic('impact');
            onNavigate('create');
          }}
          className="h-9 px-3.5 bg-brand-accent hover:bg-blue-600 active:scale-95 transition-all text-white rounded-xl flex items-center gap-1.5 text-xs font-bold shadow-lg"
        >
          <Plus className="h-4 w-4" />
          New Drop
        </button>
      </div>

      {/* USER BANNER ROW */}
      <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
        <img
          src={
            user?.photo_url ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150'
          }
          className="h-11 w-11 rounded-2xl object-cover border border-zinc-800 p-0.5 bg-zinc-950/40"
          alt="user"
        />
        <div>
          <h2 className="text-base font-black text-white">Campaign Studio</h2>
          <p className="text-xs font-mono text-zinc-500">
            @{user?.username || 'user'}
          </p>
        </div>
      </div>

      {/* 💻 Splits into a clean, side-by-side column workspace layout on desktop screens */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        
        {/* LEFT COLUMN: Macro Metrics Panels */}
        <div className="grid grid-cols-2 md:flex md:flex-col gap-3 md:col-span-4">
          <GlassCard className="p-4 bg-zinc-950/40 space-y-1.5 rounded-xl w-full">
            <div className="flex items-center gap-1.5 text-[10px] uppercase text-zinc-500 font-bold tracking-wider">
              <Radio className="h-3 w-3 text-brand-accent" />
              Active Pools
            </div>
            <h3 className="text-2xl md:text-3xl font-mono font-black">{activeDrops.length}</h3>
          </GlassCard>

          <GlassCard className="p-4 bg-zinc-950/40 space-y-1.5 rounded-xl w-full">
            <div className="flex items-center gap-1.5 text-[10px] uppercase text-zinc-500 font-bold tracking-wider">
              <Activity className="h-3 w-3 text-green-400" />
              Total Claims
            </div>
            <h3 className="text-2xl md:text-3xl font-mono font-black">{totalClaims}</h3>
          </GlassCard>
        </div>

        {/* RIGHT COLUMN: Interactive Campaign Ledger List Cards */}
        <div className="space-y-3 md:col-span-8">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">
            Your Core Campaigns
          </h3>

          {activeDrops.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl text-zinc-500 text-xs font-medium">
              No active campaigns found 🚀
            </div>
          ) : (
            <div className="space-y-2.5">
              {activeDrops.map((drop) => {
                const claimed = drop.claimedCount || 0;
                const winners = drop.winnersCount || 1;
                const fillPercent = Math.round((claimed / winners) * 100);

                return (
                  <div
                    key={drop.id}
                    onClick={() => {
                      setDropId(drop.id);
                      onNavigate('details');
                    }}
                    className="p-4 rounded-xl bg-zinc-900/10 hover:bg-zinc-900/20 border border-white/5 space-y-3 cursor-pointer transition-all active:scale-[0.99]"
                  >
                    {/* HEADER ROW */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="truncate max-w-[70%]">
                        <h4 className="text-sm font-bold text-zinc-200 truncate">
                          {drop.title}
                        </h4>
                        <span className="inline-block text-[9px] font-mono font-bold text-zinc-500 mt-0.5">
                          {drop.isMystery ? '🎰 Mystery Pool' : '✨ Standard Pool'}
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-sm font-mono font-black text-white">
                          {drop.amount} <span className="text-[10px] font-sans text-zinc-500 font-bold">{drop.token}</span>
                        </p>
                        <p className="text-[10px] font-sans font-bold text-brand-accent mt-0.5">
                          {fillPercent || 0}% filled
                        </p>
                      </div>
                    </div>

                    {/* PROGRESS BAR COMPONENT */}
                    <div className="w-full bg-zinc-950/60 h-1.5 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="bg-brand-accent h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, fillPercent)}%` }}
                      />
                    </div>

                    {/* ACTIONS SUBROW */}
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-[9px] font-mono text-zinc-600 font-semibold truncate max-w-[50%]">
                        ID: {drop.id}
                      </span>
                      
                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => toggleAnalytics(drop.id, e)}
                          className="p-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-950/20 text-zinc-400 cursor-pointer"
                        >
                          <BarChart2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteCampaign(drop.id, e)}
                          className="p-1.5 rounded-lg bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 text-red-400 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* EXPANDABLE METRICS GRID LAYER */}
                    {expandedAnalytics[drop.id] && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5 text-center bg-zinc-950/10 p-2.5 rounded-lg mt-2 animate-reveal"
                      >
                        <div>
                          <p className="text-[9px] font-sans font-bold uppercase tracking-wider text-zinc-500">Interactions</p>
                          <p className="text-xs font-mono font-black text-zinc-300">{drop.analytics?.clicks || 1}</p>
                        </div>

                        <div>
                          <p className="text-[9px] font-sans font-bold uppercase tracking-wider text-zinc-500">Claims</p>
                          <p className="text-xs font-mono font-black text-emerald-400">
                            {claimed}
                          </p>
                        </div>

                        <div>
                          <p className="text-[9px] font-sans font-bold uppercase tracking-wider text-zinc-500">Remaining</p>
                          <p className="text-xs font-mono font-black text-amber-400">
                            {Math.max(0, winners - claimed)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}