import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { dropStore } from '@/features/drops/dropStore';
import { Sparkles, ArrowRight, BarChart3, ShieldCheck, Terminal } from 'lucide-react';

export default function Home({ onNavigate, setDropId }) {
  const [activeDrops, setActiveDrops] = useState(dropStore.getDrops());
  // Fetch static demos separated from the state storage arrays
  const demos = dropStore.getDemos();

  useEffect(() => {
    return dropStore.subscribe((updated) => setActiveDrops(updated));
  }, []);

  const handleOpenDrop = (id, e) => {
    setDropId(id);
    if (e.target.closest('.claim-btn-trigger')) {
      const targetDrop = dropStore.getDropById(id);
      if (targetDrop?.hasTrivia) {
        onNavigate('verify');
      } else {
        onNavigate('claim');
      }
    } else {
      onNavigate('details');
    }
  };

  return (
    <div className="space-y-6 pt-2 w-full max-w-6xl mx-auto px-4 md:px-6 animate-reveal">
      {/* Hero Header Section */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-1.5 bg-brand-accentGlow border border-brand-accent/20 px-3 py-1 rounded-full text-xs font-semibold text-brand-accent tracking-wide uppercase">
          <Sparkles className="h-3 w-3" /> Settlement Engine Active
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-linear-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent leading-tight">
          Instant Claim Links. <br/>Infinte Group Growth.
        </h1>
        <p className="text-sm text-zinc-400 max-w-xs mx-auto font-normal leading-relaxed">
          Create premium, instant payout campaigns funded cleanly with <span className="text-white font-medium">SwiftyEx_bot</span>.
        </p>
      </div>

      {/* Primary Control Deck Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto w-full pt-2">
        <Button onClick={() => onNavigate('create')} className="relative overflow-hidden group w-full py-3">
          <div className="absolute inset-0 bg-linear-to-r from-brand-accent to-blue-600 transition-all group-hover:opacity-90" />
          <span className="relative z-10 flex items-center justify-center gap-2 text-sm font-bold">
            Deploy New Campaign <ArrowRight className="h-4 w-4" />
          </span>
        </Button>
        
        <Button 
          variant="secondary" 
          onClick={() => onNavigate('dashboard')} 
          className="flex items-center justify-center gap-2 border border-white/5 bg-zinc-900/40 hover:bg-zinc-900 text-sm font-bold text-zinc-200 transition-all duration-200 w-full py-3"
        >
          <BarChart3 className="h-4 w-4 text-brand-accent" />
          <span>Create & Track Campaigns</span>
        </Button>
      </div>

      {/* --- RESPONSIVE SPLIT MAIN FEED CONTAINER --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
        
        {/* 🟢 LEFT CONTAINER: LIVE USER-PROMPTED CAMPAIGNS (Spans 2 columns on desktop) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2 px-1 pb-1">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-success"></span>
            </span>
            <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase">Live Active Campaigns</h3>
          </div>

          {activeDrops.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeDrops.map((drop) => (
                <GlassCard 
                  key={drop.id} 
                  onClick={(e) => handleOpenDrop(drop.id, e)}
                  className="border-brand-success/20 bg-zinc-950/40 hover:bg-zinc-950 transition-all p-5 relative group overflow-hidden flex flex-col justify-between min-h-36.25 cursor-pointer"
                >
                  {/* Absolute Corner Identification Tag */}
                  <div className="absolute top-0 left-0 bg-brand-success/10 border-r border-b border-brand-success/20 px-2 py-0.5 rounded-br-lg flex items-center gap-1 text-[9px] font-bold text-brand-success uppercase tracking-wider">
                    <ShieldCheck className="h-2.5 w-2.5" /> Active Campaign
                  </div>

                  <div className="flex justify-between items-start gap-4 pt-2">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <h4 className="font-bold text-base text-zinc-100 group-hover:text-white transition-colors truncate">
                        {drop.title}
                      </h4>
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{drop.description}</p>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <span className="text-base font-black text-white block tracking-tight">
                        {drop.isMystery ? "???" : `${drop.amount}`} <span className="text-xs text-brand-accent font-bold">{drop.token}</span>
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">
                        {drop.claimedCount} / {drop.winnersCount} claimed
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between gap-4">
                    <div className="flex-1 bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-brand-success" style={{ width: `${(drop.claimedCount / drop.winnersCount) * 100}%` }} />
                    </div>
                    <button className="claim-btn-trigger text-xs font-black text-brand-accent hover:text-blue-400 flex items-center gap-0.5 transition-colors shrink-0 cursor-pointer">
                      🚀 Express Claim <ArrowRight className="h-3 w-3 ml-0.5" />
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            /* Pristine empty pipeline view fallback inside active column grid */
            <GlassCard className="p-10 border-dashed border-white/5 text-center flex flex-col   items-center justify-center space-y-2">
              <span className="text-zinc-200 text-xs font-bold tracking-tight block">
                No Campaigns Found
              </span>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                You haven't created any custom rewards yet. Tap "Deploy New Campaign" above to make your first campaign!
              </p>
            </GlassCard>
          )}
        </div>

        {/* 🟡 RIGHT CONTAINER: INTERACTIVE DEMOS COLUMN (Spans 1 column on desktop) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1 pb-1">
            <Terminal className="h-3.5 w-3.5 text-brand-gold" />
            <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase">Interactive Demos</h3>
          </div>

          <div className="space-y-4 flex flex-col">
            {demos.map((demo) => (
              <GlassCard 
                key={demo.id} 
                onClick={(e) => handleOpenDrop(demo.id, e)}
                className="border-brand-gold/20 bg-zinc-950/20 hover:bg-zinc-950/60 transition-all p-4 relative group flex flex-col justify-between min-h-33.75 cursor-pointer"
              >
                {/* Absolute Corner Sandbox Identification Tag */}
                <div className="absolute top-0 left-0 bg-brand-gold/10 border-r border-b border-brand-gold/20 px-2 py-0.5 rounded-br-lg text-[9px] font-bold text-brand-gold uppercase tracking-wider">
                  ⚡ Onboarding Demo
                </div>

                <div className="flex justify-between items-start gap-3 pt-2">
                  <div className="space-y-1 flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-zinc-200 group-hover:text-white transition-colors truncate">
                      {demo.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{demo.description}</p>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-white block tracking-tight">
                      {demo.isMystery ? "???" : `${demo.amount}`} <span className="text-[10px] text-brand-gold font-bold">{demo.token}</span>
                    </span>
                    <span className="text-[9px] text-zinc-500 font-mono block">
                      {demo.claimedCount} / {demo.winnersCount} loaded
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-2.5 border-t border-white/5 flex items-center justify-between gap-3">
                  <div className="flex-1 bg-zinc-900 h-1 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-brand-gold" style={{ width: `${(demo.claimedCount / demo.winnersCount) * 100}%` }} />
                  </div>
                  <button className="claim-btn-trigger text-[11px] font-bold text-brand-gold hover:text-amber-300 flex items-center shrink-0 cursor-pointer">
                    {demo.isMystery ? '🎰 Roll Mystery' : '🚀 Try Claim'} <ArrowRight className="h-3 w-3 ml-0.5" />
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}