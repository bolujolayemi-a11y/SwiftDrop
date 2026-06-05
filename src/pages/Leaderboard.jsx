import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import BackButton from '@/components/ui/BackButton';
import { dropStore } from '@/features/drops/dropStore';
import { Trophy } from 'lucide-react';

// 🚀 Accepted dropId prop passed from Router configuration parameters
export default function Leaderboard({ onNavigate, dropId }) {
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    // Helper function to build real ranking statistics from live store data
    const computeRealRankings = () => {
      const liveDrops = dropStore.getDrops();
      const userStatsMap = {};

      // Aggregate all real claim data present in your active store
      liveDrops.forEach((drop) => {
        // If your store has a historical list of claims, we map them here
        if (drop.claimsList && Array.isArray(drop.claimsList)) {
          drop.claimsList.forEach((claim) => {
            const username = claim.username || "anonymous_user";
            const claimAmount = parseFloat(claim.amount) || 0;

            if (!userStatsMap[username]) {
              userStatsMap[username] = { user: username, claims: 0, total: 0 };
            }
            userStatsMap[username].claims += 1;
            userStatsMap[username].total += claimAmount;
          });
        }
      });

      // Sort users by total amount earned to find the true elites
      return Object.values(userStatsMap)
        .sort((a, b) => b.total - a.total)
        .map((item, index) => ({
          ...item,
          rank: index + 1,
          total: item.total.toFixed(2)
        }));
    };

    // Set initial calculations
    setRankings(computeRealRankings());

    // Keep the leaderboard strictly synchronized whenever a new drop is claimed live
    if (dropStore.subscribe) {
      return dropStore.subscribe(() => {
        setRankings(computeRealRankings());
      });
    }
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-6 pt-2 space-y-6 animate-reveal text-zinc-100">
      
      {/* Upper Framework Backing Header */}
      <div className="text-left">
        {/* 🎯 Back button loops back onto the specific Claim Reward instance if dropId parameter exists */}
        <BackButton 
          onBack={() => {
            if (dropId) {
              onNavigate('claim');
            } else {
              onNavigate('home');
            }
          }} 
          fallbackText={dropId ? "Back to Claim Screen" : "Back to Home"} 
        />
      </div>

      <div className="text-center space-y-2">
        <Trophy className="h-10 w-10 text-brand-gold mx-auto animate-bounce" />
        <h2 className="text-2xl font-black text-white">SwiftDrop Elites</h2>
        <p className="text-xs text-zinc-500 uppercase tracking-widest">Global Reward Rankings</p>
      </div>

      <div className="space-y-3 max-w-xl mx-auto w-full">
        {rankings.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-8">
            No distributions claimed yet. Be the first to claim and secure Rank #1!
          </p>
        ) : (
          rankings.map((item) => (
            <GlassCard key={item.rank} className="flex items-center justify-between p-4 border-white/5 bg-linear-to-br from-zinc-950 to-zinc-900/40 rounded-2xl">
              <div className="flex items-center gap-4">
                <span className={`text-lg font-black ${
                  item.rank === 1 ? 'text-brand-gold' : item.rank === 2 ? 'text-zinc-400' : 'text-zinc-500'
                }`}>
                  #{item.rank}
                </span>
                <div>
                  <p className="font-bold text-sm text-zinc-200">@{item.user}</p>
                  <p className="text-[10px] text-zinc-500">{item.claims} Successful Claims</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-brand-success">+${item.total}</p>
                <p className="text-[9px] text-brand-accent uppercase font-bold tracking-wider">Total Settled</p>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}