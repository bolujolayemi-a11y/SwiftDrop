import React, { useState, useEffect } from 'react';
import { dropStore } from '@/features/drops/dropStore';
import GlassCard from '@/components/ui/GlassCard';
import BackButton from '@/components/ui/BackButton';
import { Trophy, Award, TrendingUp } from 'lucide-react';

export default function Leaderboard({ onNavigate, dropId }) {
  const [rankings, setRankings] = useState([]);
  const [globalStats, setGlobalStats] = useState({ totalDistributed: 0, distinctClaimers: 0 });

  useEffect(() => {
    const computeRealRankings = () => {
      const liveDrops = dropStore.getDrops();
      const userStatsMap = {};
      let runningTotalCapital = 0;

      // 🧠 Map directly to the proper operational storage paths (drop.analytics.history)
      liveDrops.forEach((drop) => {
        const history = drop.analytics?.history || [];
        history.forEach((claim) => {
          const username = claim.username || "anonymous_user";
          const claimAmount = parseFloat(claim.amount) || 0;

          runningTotalCapital += claimAmount;

          if (!userStatsMap[username]) {
            userStatsMap[username] = { user: username, claims: 0, total: 0 };
          }
          userStatsMap[username].claims += 1;
          userStatsMap[username].total += claimAmount;
        });
      });

      const processedRankings = Object.values(userStatsMap)
        .sort((a, b) => b.total - a.total)
        .map((item, index) => ({
          ...item,
          rank: index + 1,
          total: item.total.toFixed(2)
        }));

      setGlobalStats({
        totalDistributed: runningTotalCapital.toFixed(2),
        distinctClaimers: processedRankings.length
      });

      return processedRankings;
    };

    setRankings(computeRealRankings());

    if (dropStore.subscribe) {
      return dropStore.subscribe(() => {
        setRankings(computeRealRankings());
      });
    }
  }, []);

  return (
    /* 🖥️ Responsive outer layout expands elegantly on wide monitors up to 4xl */
    <div className="w-full max-w-md md:max-w-4xl mx-auto px-4 pt-2 space-y-5 animate-reveal text-zinc-100 text-left">
      
      <div>
        <BackButton 
          onBack={() => {
            if (dropId) {
              onNavigate('claim'); // 🎯 Loops back right into the active claim token viewport context
            } else {
              onNavigate('home');
            }
          }} 
          fallbackText={dropId ? "Back to Claim Screen" : "Back to Home"} 
        />
      </div>

      {/* Hero Header Area */}
      <div className="text-center space-y-1.5 py-2">
        <div className="relative inline-block">
          <Trophy className="h-10 w-10 text-amber-400 mx-auto animate-pulse" />
          <Award className="h-4 w-4 text-blue-500 absolute -bottom-1 -right-1" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">SwiftDrop Elites</h2>
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Global Reward Rankings</p>
      </div>

      {/* 💻 Top Responsive Summary Row Splitter */}
      <div className="grid grid-cols-2 gap-3 max-w-xl mx-auto w-full">
        <GlassCard className="p-3.5 bg-zinc-950/40 border-white/5 rounded-xl flex flex-col gap-0.5">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-emerald-400" /> Settled Capital
          </span>
          <p className="text-base font-mono font-black text-white">${globalStats.totalDistributed}</p>
        </GlassCard>
        <GlassCard className="p-3.5 bg-zinc-950/40 border-white/5 rounded-xl flex flex-col gap-0.5">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
            <Award className="h-3 w-3 text-blue-400" /> Human Claims
          </span>
          <p className="text-base font-mono font-black text-white">{globalStats.distinctClaimers} Wallets</p>
        </GlassCard>
      </div>

      {/* Rankings List Card Stream */}
      <div className="space-y-2.5 max-w-xl mx-auto w-full pt-1">
        {rankings.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl text-zinc-500 text-xs font-medium">
            No distributions recorded on this node path yet.
          </div>
        ) : (
          rankings.map((item) => (
            <GlassCard 
              key={item.rank} 
              className={`flex items-center justify-between p-4 border rounded-2xl transition-all ${
                item.rank === 1 
                  ? 'border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-zinc-950 shadow-lg shadow-amber-500/[0.02]' 
                  : 'border-white/5 bg-zinc-900/10'
              }`}
            >
              <div className="flex items-center gap-4 truncate max-w-[70%]">
                <span className={`text-base font-mono font-black shrink-0 ${
                  item.rank === 1 ? 'text-amber-400' : item.rank === 2 ? 'text-zinc-400' : 'text-zinc-500'
                }`}>
                  {item.rank === 1 ? '👑' : `#${item.rank}`}
                </span>
                <div className="truncate">
                  <p className="font-bold text-sm text-zinc-200 truncate">
                    {item.user?.startsWith('@') ? item.user : `@${item.user}`}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-medium">{item.claims} Successful Claims</p>
                </div>
              </div>
              
              <div className="text-right shrink-0">
                <p className="text-sm font-mono font-black text-emerald-400">+${item.total}</p>
                <p className="text-[9px] text-zinc-500 font-sans font-bold uppercase tracking-wider">Settled</p>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}