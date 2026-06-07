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
    <div className="space-y-5 pt-2 animate-reveal text-zinc-100 text-left w-full max-w-md mx-auto px-4">

      {/* HEADER */}
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

      {/* USER */}
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

      {/* STATS */}
      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-4 bg-zinc-950/40 space-y-1.5 rounded-xl">
          <div className="flex items-center gap-1.5 text-[10px] uppercase text-zinc-500">
            <Radio className="h-3 w-3 text-brand-accent" />
            Active Pools
          </div>
          <h3 className="text-2xl font-black">{activeDrops.length}</h3>
        </GlassCard>

        <GlassCard className="p-4 bg-zinc-950/40 space-y-1.5 rounded-xl">
          <div className="flex items-center gap-1.5 text-[10px] uppercase text-zinc-500">
            <Activity className="h-3 w-3 text-green-400" />
            Total Claims
          </div>
          <h3 className="text-2xl font-black">{totalClaims}</h3>
        </GlassCard>
      </div>

      {/* CAMPAIGNS */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">
          Your Core Campaigns
        </h3>

        {activeDrops.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl text-zinc-500 text-xs">
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
                    <div className="truncate max-w-[65%]">
                      <h4 className="text-sm font-bold text-zinc-200 truncate">
                        {drop.title}
                      </h4>
                      <span className="text-[9px] text-zinc-500">
                        {drop.isMystery ? '🎰 Mystery' : '✨ Standard'}
                      </span>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-black">
                        {drop.amount} {drop.token}
                      </p>
                      <p className="text-[10px] text-brand-accent">
                        {fillPercent || 0}% filled
                      </p>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={(e) => toggleAnalytics(drop.id, e)}
                      className="p-2 rounded-lg border text-zinc-400"
                    >
                      <BarChart2 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteCampaign(drop.id, e)}
                      className="p-2 rounded-lg bg-red-500/10 text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* ANALYTICS */}
                  {expandedAnalytics[drop.id] && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5"
                    >
                      <div>
                        <p className="text-[9px] text-zinc-500">Interactions</p>
                        <p className="text-xs font-black">{drop.analytics?.clicks || 0}</p>
                      </div>

                      <div>
                        <p className="text-[9px] text-zinc-500">Claims</p>
                        <p className="text-xs font-black text-green-400">
                          {claimed}
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] text-zinc-500">Remaining</p>
                        <p className="text-xs font-black text-amber-400">
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
  );
}