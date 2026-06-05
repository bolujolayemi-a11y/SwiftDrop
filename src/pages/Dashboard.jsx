import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import BackButton from '@/components/ui/BackButton';
import { dropStore } from '@/features/drops/dropStore';
import { useTelegram } from '@/hooks/useTelegram';
import { Activity, Plus, Radio, Trash2 } from 'lucide-react';

export default function Dashboard({ onNavigate, setDropId }) {
  const { user } = useTelegram();
  const [activeDrops, setActiveDrops] = useState(dropStore.getDrops());

  useEffect(() => {
    return dropStore.subscribe((updated) => setActiveDrops(updated));
  }, []);

  const handleDeleteCampaign = (id, e) => {
    e.stopPropagation(); // 🛑 Stops the row click from opening the details page by mistake
    
    if (window.confirm("Are you sure you want to delete this campaign?")) {
      // Calls your store to remove it and refreshes the list automatically
      if (dropStore.deleteDrop) {
        dropStore.deleteDrop(id);
      } else {
        // Fallback filter if you haven't written the store method yet
        dropStore.drops = dropStore.drops.filter(drop => drop.id !== id);
        if (dropStore.notifySubscribers) dropStore.notifySubscribers();
      }
    }
  };

  return (
    <div className="space-y-5 pt-2 animate-reveal">
      
      {/* Top Utility Row */}
      <div className="flex items-center justify-between">
        <BackButton onBack={() => onNavigate('home')} fallbackText="Back to Home" />
      </div>
      
      {/* User Welcome Header */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
        <div className="flex items-center gap-3">
          <img 
            src={user?.photo_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"} 
            alt="User avatar" 
            className="h-12 w-12 rounded-2xl object-cover border border-zinc-800 p-0.5 bg-zinc-900"
          />
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white">Create & Track</h2>
            <p className="text-xs text-zinc-500 font-medium">Overview for @{user?.username || 'user'}</p>
          </div>
        </div>
        <button 
          onClick={() => onNavigate('create')}
          className="h-9 w-9 bg-brand-accent text-white rounded-xl flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg shadow-brand-accent/20 cursor-pointer active:scale-95 duration-200"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Simplified Metrics Block */}
      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-4 bg-zinc-950/40 space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 flex items-center gap-1">
            <Radio className="h-3 w-3 text-brand-accent animate-pulse" /> Active Pools
          </span>
          <h4 className="text-2xl font-black text-white">{activeDrops.length}</h4>
        </GlassCard>
        <GlassCard className="p-4 bg-zinc-950/40 space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 flex items-center gap-1">
            <Activity className="h-3 w-3 text-brand-success" /> Total Claims
          </span>
          <h4 className="text-2xl font-black text-white">
            {activeDrops.reduce((acc, d) => acc + d.claimedCount, 0)}
          </h4>
        </GlassCard>
      </div>

      {/* Campaigns Workspace List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase px-1">Your Campaigns</h3>
        
        <div className="space-y-2.5">
          {activeDrops.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-6">No campaigns found. Create one above!</p>
          ) : (
            activeDrops.map((drop) => (
              <div 
                key={drop.id}
                onClick={() => { setDropId(drop.id); onNavigate('details'); }}
                className="glass-panel rounded-xl p-4 flex items-center justify-between cursor-pointer border-white/3 hover:border-white/10 transition-all active:scale-[0.99]"
              >
                <div className="space-y-0.5 max-w-[60%]">
                  <h4 className="text-sm font-bold text-zinc-200 truncate">{drop.title}</h4>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                    <span>{drop.isMystery ? 'Mystery Box' : 'Standard Pool'}</span>
                  </div>
                </div>

                <div className="text-right flex items-center gap-3 shrink-0">
                  <div>
                    <span className="text-xs font-bold text-zinc-300 block">
                      {drop.isMystery ? '🎰 Variable' : `${drop.amount} ${drop.token}`}
                    </span>
                    <span className="text-[10px] font-mono text-brand-accent block">
                      {Math.round((drop.claimedCount / drop.winnersCount) * 100)}% Claimed
                    </span>
                  </div>
                  
                  {/* Action Delete Trash Can */}
                  <button
                    type="button"
                    onClick={(e) => handleDeleteCampaign(drop.id, e)}
                    className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}