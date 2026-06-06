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
  UserCheck,
  Wallet,
  TrendingUp,
  Banknote
} from 'lucide-react';

export default function Dashboard({ onNavigate, setDropId }) {
  const { user, triggerHaptic } = useTelegram();
  const [activeDrops, setActiveDrops] = useState(dropStore.getDrops());
  const [expandedAnalytics, setExpandedAnalytics] = useState({});

  useEffect(() => {
    return dropStore.subscribe((updated) => setActiveDrops(updated));
  }, []);

  const toggleAnalytics = (id, e) => {
    e.stopPropagation();
    triggerHaptic('light');
    setExpandedAnalytics(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleDeleteCampaign = (id, e) => {
    e.stopPropagation();
    triggerHaptic('warning');

    if (window.confirm("Are you sure you want to delete this campaign?")) {
      if (dropStore.deleteDrop) {
        dropStore.deleteDrop(id);
      } else {
        dropStore.drops = dropStore.drops.filter(d => d.id !== id);
        dropStore.notifySubscribers?.();
      }
      triggerHaptic('success');
    }
  };

  const totalClaims = activeDrops.reduce((acc, d) => acc + (d.claimedCount || 0), 0);

  return (
    <div className="space-y-5 pt-2 animate-reveal text-zinc-100">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <BackButton onBack={() => onNavigate('home')} fallbackText="Back" />

        <button
          onClick={() => { triggerHaptic('impact'); onNavigate('create'); }}
          className="h-9 px-3 bg-brand-accent text-white rounded-xl flex items-center gap-2 text-xs font-bold"
        >
          <Plus className="h-4 w-4" />
          New Drop
        </button>
      </div>

      {/* USER HEADER */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
        <div className="flex items-center gap-3">
          <img
            src={user?.photo_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150"}
            className="h-12 w-12 rounded-2xl object-cover border border-zinc-800"
          />
          <div>
            <h2 className="text-lg font-bold">Dashboard</h2>
            <p className="text-xs text-zinc-500">@{user?.username || 'user'}</p>
          </div>
        </div>
      </div>

      {/* 🔥 QUICK ACTIONS (NEW) */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => onNavigate('wallet')}
          className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold flex flex-col items-center gap-1"
        >
          <Wallet className="h-4 w-4 text-blue-400" />
          Wallet
        </button>

        <button
          onClick={() => onNavigate('earnings')}
          className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold flex flex-col items-center gap-1"
        >
          <TrendingUp className="h-4 w-4 text-green-400" />
          Earnings
        </button>

        <button
          onClick={() => onNavigate('withdrawals')}
          className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold flex flex-col items-center gap-1"
        >
          <Banknote className="h-4 w-4 text-amber-400" />
          Withdrawals
        </button>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-4 bg-zinc-950/40">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Radio className="h-3 w-3 text-brand-accent" />
            Active Drops
          </div>
          <h3 className="text-2xl font-black">{activeDrops.length}</h3>
        </GlassCard>

        <GlassCard className="p-4 bg-zinc-950/40">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Activity className="h-3 w-3 text-green-400" />
            Total Claims
          </div>
          <h3 className="text-2xl font-black">{totalClaims}</h3>
        </GlassCard>
      </div>

      {/* CAMPAIGNS */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-zinc-400 uppercase">Your Campaigns</h3>

        {activeDrops.length === 0 ? (
          <div className="text-center py-10 text-zinc-500 text-xs">
            No campaigns yet. Create your first drop 🚀
          </div>
        ) : (
          activeDrops.map((drop) => (
            <div
              key={drop.id}
              onClick={() => { setDropId(drop.id); onNavigate('details'); }}
              className="p-4 rounded-xl bg-zinc-900/20 border border-zinc-800 space-y-3 cursor-pointer"
            >

              {/* TOP ROW */}
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-bold">{drop.title}</h4>
                  <p className="text-[10px] text-zinc-500">
                    {drop.isMystery ? 'Mystery Drop' : 'Standard Pool'}
                  </p>
                </div>

                <div className="text-right space-y-1">
                  <p className="text-xs font-bold">
                    {drop.amount} {drop.token}
                  </p>
                  <p className="text-[10px] text-green-400">
                    {Math.round((drop.claimedCount / drop.winnersCount) * 100)}% claimed
                  </p>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={(e) => toggleAnalytics(drop.id, e)}
                  className="p-2 rounded-lg bg-zinc-800"
                >
                  <BarChart2 className="h-3 w-3" />
                </button>

                <button
                  onClick={(e) => handleDeleteCampaign(drop.id, e)}
                  className="p-2 rounded-lg bg-red-500/10 text-red-400"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>

              {/* ANALYTICS */}
              {expandedAnalytics[drop.id] && (
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-800 text-xs">
                  <div>
                    <Eye className="h-3 w-3 text-zinc-400" />
                    <p>{drop.analytics?.clicks || 0}</p>
                  </div>

                  <div>
                    <UserCheck className="h-3 w-3 text-green-400" />
                    <p>{drop.claimedCount}</p>
                  </div>

                  <div>
                    <Calendar className="h-3 w-3 text-amber-400" />
                    <p>{drop.winnersCount - drop.claimedCount} left</p>
                  </div>
                </div>
              )}

            </div>
          ))
        )}
      </div>
    </div>
  );
}