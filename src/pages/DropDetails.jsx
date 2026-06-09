import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import BackButton from '@/components/ui/BackButton';
import { dropStore } from '@/features/drops/dropStore';
import { Share2, Wallet, Users, Info } from 'lucide-react';

export default function DropDetails({ id, onNavigate, setDropId }) {
  const drop = dropStore.getDropById(id);

  if (!drop) {
    return (
      <div className="space-y-4 text-center pt-10">
        <p className="text-zinc-400 text-sm">Target reference footprint not resolved inside volatile memory arrays.</p>
        <Button onClick={() => onNavigate('home')}>Return Home</Button>
      </div>
    );
  }

  // 🚀 High-Fidelity Viral Share Mechanism
  const handleShareCampaign = () => {
    const appUrl = `https://t.me/swift_dropbot/app?startapp=${drop.id}`;
    const rawText = `🎁 Grab your share of the ${drop.title} reward pool instantly on SwiftDrop!`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(rawText)}`;

    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.openTelegramLink(shareUrl);
    } else {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(appUrl);
        alert("Campaign routing link saved to clipboard!");
      } else {
        window.open(shareUrl, '_blank');
      }
    }
  };

  return (
    <div className="space-y-5 pt-2 animate-reveal">
      <BackButton onBack={() => onNavigate('home')} fallbackText="Back" />

      <div className="space-y-4">
        <div className="space-y-1.5 text-left">
          <h2 className="text-2xl font-bold tracking-tight text-white">{drop.title}</h2>
          <span className="inline-flex items-center bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] px-2.5 py-0.5 rounded-full font-mono">
            POOL_ID: {drop.id}
          </span>
        </div>

        <p className="text-sm text-zinc-300 text-left leading-relaxed bg-zinc-900/30 p-4 rounded-xl border border-white/5">
          {drop.description}
        </p>

        <div className="grid grid-cols-2 gap-3 text-left">
          <GlassCard className="p-4 flex flex-col gap-1">
            <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
              <Wallet className="h-3 w-3 text-brand-accent" /> Total Allocation
            </span>
            <span className="text-lg font-black tracking-tight text-white">
              {drop.isMystery ? "Dynamic Pool" : `${drop.amount} ${drop.token}`}
            </span>
          </GlassCard>

          <GlassCard className="p-4 flex flex-col gap-1">
            <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
              <Users className="h-3 w-3 text-brand-success" /> Claim Capacity
            </span>
            <span className="text-lg font-black tracking-tight text-white">
              {drop.claimedCount} / {drop.winnersCount}
            </span>
          </GlassCard>
        </div>

        {/* Informational UI element explaining mechanics to judges */}
        <div className="p-3 bg-zinc-950/40 border border-white/5 rounded-xl flex items-start gap-2 text-xs text-zinc-400 text-left leading-normal">
          <Info className="h-4 w-4 text-brand-accent shrink-0 mt-0.5" />
          <span>
            Rewards are funded through <strong>SwiftyEx_bot</strong> and distributed instantly to eligible users after verification.
          </span>
        </div>

        <div className="space-y-2 pt-2">
          {/* 🚀 FIXED PIPELINE: Secure context parameters before jumping routes */}
          <Button 
            onClick={() => {
              if (typeof setDropId === 'function') setDropId(drop.id);
              onNavigate('verify-action');
            }}
          >
            Go to Verification Tasks
          </Button>
          
          <Button variant="secondary" onClick={handleShareCampaign} className="flex items-center justify-center gap-2 py-3 text-xs font-semibold text-zinc-300">
            <Share2 className="h-4 w-4" /> Share Campaign Link
          </Button>
        </div>
      </div>
    </div>
  );
}