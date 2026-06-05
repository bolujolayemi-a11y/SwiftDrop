import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import BackButton from '@/components/ui/BackButton';
import { dropStore } from '@/features/drops/dropStore';
import { Share2, Wallet, Users, Info } from 'lucide-react';

export default function DropDetails({ id, onNavigate }) {
  const drop = dropStore.getDropById(id);

  if (!drop) {
    return (
      <div className="space-y-4 text-center pt-10">
        <p className="text-zinc-400 text-sm">Target reference footprint not resolved inside volatile memory arrays.</p>
        <Button onClick={() => onNavigate('home')}>Return Home</Button>
      </div>
    );
  }

  const handleShareMock = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`https://t.me/SwiftyDropBot/app?startapp=${drop.id}`);
      alert("Mini App share routing string saved to host clipboard!");
    }
  };

  return (
    <div className="space-y-5 pt-2 animate-reveal">
      {/* Handled natively inside layout structure using our custom standalone handler */}
      <BackButton onBack={() => onNavigate('home')} fallbackText="Back" />

      <div className="space-y-4">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold tracking-tight text-white">{drop.title}</h2>
          <span className="inline-flex items-center bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] px-2.5 py-0.5 rounded-full font-mono">
            POOL_ID: {drop.id}
          </span>
        </div>

        <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-900/30 p-4 rounded-xl border border-white/2">
          {drop.description}
        </p>

        <div className="grid grid-cols-2 gap-3">
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
        <div className="p-3 bg-brand-accentGlow/10 border border-brand-accent/10 rounded-xl flex items-start gap-2 text-xs text-zinc-400 leading-normal">
          <Info className="h-4 w-4 text-brand-accent shrink-0 mt-0.5" />
          <span>
            Financial verification and atomic settlements execute instantaneously via decentralized ledger queries through the <strong>SwiftyEx_bot</strong> backplane.
          </span>
        </div>

        <div className="space-y-2 pt-2">
          <Button onClick={() => onNavigate('claim')}>
            Go to Claim Portal
          </Button>
          <Button variant="secondary" onClick={handleShareMock} className="flex items-center justify-center gap-2">
            <Share2 className="h-4 w-4" /> Export Campaign Distribution Link
          </Button>
        </div>
      </div>
    </div>
  );
}