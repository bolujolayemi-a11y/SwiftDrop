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
} from 'lucide-react';

export default function Dashboard({ onNavigate, setDropId }) {
  const { user, triggerHaptic } = useTelegram();
  const [activeDrops, setActiveDrops] = useState(dropStore.getDrops());
  const [expandedAnalytics, setExpandedAnalytics] = useState({});

  useEffect(() => {
    const unsubscribe = dropStore.subscribe((updated) => {
      setActiveDrops(updated || []);
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
    /* 🖥️ Responsive Outer Workspace: Constrained on mobile, broad 5xl canvas grid on desktop */
    <div className="space-y-6 pt-2 pb-10 animate-reveal text-zinc-100 text-left w-full max-w-md md:max-w-5xl mx-auto px-4">

      {/* FIXED HEADER RESPONSIVE ROW */}
      <div className="flex items-center justify-between w-full">
        <BackButton onBack={() => onNavigate('home')} fallbackText="Back" />

        <button
          type="button"
          onClick={() => {
            triggerHaptic('impact');
            onNavigate('create');
          }}
          className="h-9 px-4 bg-brand-accent hover:bg-blue-600 active:scale-95 transition-all text-white rounded-xl flex items-center gap-1.5 text-xs font-bold shadow-lg cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          New Drop
        </button>
      </div>

      {/* CORE ADAPTIVE SPLITTER GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* 📱 LEFT COLUMN (md:col-span-4): Profiles & Metric Aggregates */}
        <div className="space-y-4 md:col-span-4 md:sticky md:top-4">
          
          {/* USER CONTEXT BLOCK */}
          <div className="flex items-center gap-3 bg-zinc-900/10 md:bg-zinc-900/20 md:p-4 border border-white/0 md:border-white/5 rounded-2xl pb-4 md:pb-4">
            <img
              src={
                user?.photo_url ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150'
              }
              className="h-12 w-12 rounded-2xl object-cover border border-zinc-800 p-0.5 bg-zinc-950/40"
              alt="user"
            />
            <div>
              <h2 className="text-base font-black text-white">Campaign Studio</h2>
              <p className="text-xs font-mono text-zinc-500">
                @{user?.username || 'user'}
              </p>
            </div>
          </div>

          {/* STATS AGGREGATE DISPLAY */}
          <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
            <GlassCard className="p-4 bg-zinc-950/40 space-y-1.5 rounded-xl border-white/5">
              <div className="flex items-center gap-1.5 text-[10px] uppercase text-zinc-500 font-bold tracking-wider">
                <Radio className="h-3 w-3 text-brand-accent" />
                Active Pools
              </div>
              <h3 className="text-2xl md:text-3xl font-mono font-black">{activeDrops.length}</h3>
            </GlassCard>

            <GlassCard className="p-4 bg-zinc-950/40 space-y-1.5 rounded-xl border-white/5">
              <div className="flex items-center gap-1.5 text-[10px] uppercase text-zinc-500 font-bold tracking-wider">
                <Activity className="h-3 w-3 text-green-400" />
                Total Claims
              </div>
              <h3 className="text-2xl md:text-3xl font-mono font-black">{totalClaims}</h3>
            </GlassCard>
          </div>

        </div>

        {/* 💻 RIGHT COLUMN (md:col-span-8): Main Core Activity Lists */}
        <div className="space-y-3 md:col-span-8 w-full">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">
            Your Core Campaigns
          </h3>

          {activeDrops.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl text-zinc-500 text-xs font-medium">
              No active campaigns found 🚀
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-3">
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
                    className="p-4 rounded-xl bg-zinc-900/10 hover:bg-zinc-900/20 border border-white/5 space-y-3 cursor-pointer transition-all active:scale-[0.995] flex flex-col justify-between"
                  >
                    <div>
                      {/* HEADER ROW */}
                      <div className="flex justify-between items-start gap-4">
                        <div className="truncate max-w-[70%]">
                          <h4 className="text-sm font-bold text-zinc-200 truncate">
                            {drop.title}
                          </h4>
                          <span className="text-[9px] text-zinc-500 uppercase font-mono tracking-wider">
                            {drop.isMystery ? '🎰 Mystery Box' : '✨ Standard Drop'}
                          </span>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-sm font-mono font-black text-white">
                            {drop.amount} <span className="text-[10px] text-zinc-400 font-sans">{drop.token}</span>
                          </p>
                          <p className="text-[10px] text-brand-accent font-bold">
                            {fillPercent || 0}% filled
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* INTERACTION AND ANALYTICS BOTTOM TRACK */}
                    <div className="space-y-3 pt-2">
                      {/* ACTIONS BAR */}
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={(e) => toggleAnalytics(drop.id, e)}
                          className="p-2 rounded-lg border border-white/5 bg-zinc-950/40 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                        >
                          <BarChart2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteCampaign(drop.id, e)}
                          className="p-2 rounded-lg bg-red-500/10 border border-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* CONDITIONAL DRILLDOWN ANALYTICS PANEL */}
                      {expandedAnalytics[drop.id] && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5 text-center bg-zinc-950/20 p-2 rounded-lg"
                        >
                          <div>
                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Views</p>
                            <p className="text-sm font-mono font-black text-zinc-300">{drop.analytics?.clicks || 0}</p>
                          </div>

                          <div>
                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Claims</p>
                            <p className="text-sm font-mono font-black text-green-400">
                              {claimed}
                            </p>
                          </div>

                          <div>
                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Left</p>
                            <p className="text-sm font-mono font-black text-amber-400">
                              {Math.max(0, winners - claimed)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

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