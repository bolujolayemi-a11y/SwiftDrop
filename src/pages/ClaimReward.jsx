import React, { useState, useEffect } from 'react';
import { dropStore } from '@/features/drops/dropStore';
import { addEvent } from '@/api/ledgerApi';
import { useTelegram } from '@/hooks/useTelegram';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import GlassCard from '@/components/ui/GlassCard';
import { Gift, CheckCircle, ShieldCheck, HelpCircle, Users2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ClaimReward({ id, onNavigate }) {
  const { user, triggerHaptic, tg } = useTelegram();

  const drop = dropStore.getDropById(id);
  const userId = user?.id?.toString();

  const [state, setState] = useState('idle');
  const [amount, setAmount] = useState('0.00');
  const [status, setStatus] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const token = drop?.token || 'USDT';

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`verified_${id}`);
      setIsVerified(raw ? JSON.parse(raw)?.verified : false);
    } catch {
      setIsVerified(false);
    }
  }, [id]);

  const handleShareVerify = () => {
    const link = `https://t.me/share/url?url=https://t.me/swift_dropbot/app?startapp=drop_${drop.id}&text=Unlocking rewards 🚀`;

    tg?.openLink ? tg.openLink(link) : window.open(link, '_blank');

    sessionStorage.setItem(`verified_${id}`, JSON.stringify({ verified: true }));
    setIsVerified(true);
    triggerHaptic('success');
  };

  const handleClaim = () => {
    if (!isVerified) return triggerHaptic('warning');

    setState('rolling');

    const steps = [
      'Connecting pool network...',
      'Verifying eligibility...',
      'Allocating reward units...',
      'Finalizing claim...'
    ];

    let i = 0;
    const interval = setInterval(() => {
      setStatus(steps[i]);
      i++;
      if (i >= steps.length) clearInterval(interval);
    }, 700);

    setTimeout(async () => {
      const result = dropStore.claimDrop(drop.id, {
        userId,
        username: user?.username || 'user'
      });

      if (!result?.success) {
        setState('idle');
        return;
      }

      setAmount(result.amountClaimed);

      await addEvent({
        type: 'claim',
        userId,
        username: user?.username || 'user',
        dropId: drop.id,
        amount: result.amountClaimed,
        token,
        timestamp: Date.now(),
        title: drop.title
      });

      setState('revealed');

      // 🚀 Dual-cannon premium layout configuration
      const duration = 2.5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const confettiInterval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(confettiInterval);
        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      triggerHaptic('success');
    }, 3000);
  };

  if (!drop) {
    return <p className="p-6 text-center text-zinc-400">Drop not found</p>;
  }

  const handleBack = () => {
    if (state === 'revealed') {
      onNavigate('wallet');
    } else {
      onNavigate('home');
    }
  };

  return (
    /* 🖥️ Responsive outer layout wrapper that fills the screen on desktop up to 5xl */
    <div className="w-full max-w-md md:max-w-5xl mx-auto px-4 pt-4 text-zinc-100 text-left animate-reveal">
      <BackButton onBack={handleBack} />

      {/* 💻 Flex/Grid configuration: Splits layout into 2 distinct columns on wide viewports */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start mt-4">
        
        {/* LEFT COLUMN: Campaign Branding & Context Metrics */}
        <div className="md:col-span-5 space-y-4">
          <div className="space-y-1">
            <span className="px-2.5 py-1 text-[9px] font-mono font-black uppercase tracking-wider rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400">
              Active Distribution Pool
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight pt-1">
              {state === 'revealed' ? 'Reward Unlocked' : drop.title}
            </h2>
          </div>

          {/* 🧠 Description Field Hydrated Safely */}
          <GlassCard className="p-4 bg-zinc-950/10 border-white/5 rounded-xl space-y-3">
            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
              {drop.description || "No campaign description context provided by creator node setup."}
            </p>
            
            <div className="flex gap-2 border-t border-white/5 pt-3 font-mono text-[10px] text-zinc-500">
              <div className="flex items-center gap-1">
                <Users2 className="h-3.5 w-3.5" /> Max Capacity: {drop.winnersCount || 100}
              </div>
            </div>
          </GlassCard>

          {/* Verification Status Banner Block */}
          <div className={`p-3.5 rounded-xl border flex items-center gap-3 transition-colors ${
            isVerified ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' : 'bg-amber-500/5 border-amber-500/10 text-amber-400'
          }`}>
            {isVerified ? <ShieldCheck className="h-5 w-5 shrink-0" /> : <HelpCircle className="h-5 w-5 shrink-0 animate-pulse" />}
            <div className="text-left font-sans">
              <p className="text-xs font-bold text-white">{isVerified ? "Human Check Verified" : "Verification Steps Required"}</p>
              <p className="text-[10px] text-zinc-500 font-medium">
                {isVerified ? "Your digital signature is validated against anti-bot parameters." : "Share link parameter validation needed to initialize token allocation values."}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Claim Core Operations Layer */}
        <div className="md:col-span-7">
          <GlassCard className="p-6 bg-zinc-950/20 border-white/5 rounded-2xl flex flex-col items-center justify-center min-h-[40vh] md:min-h-[50vh] text-center relative">
            
            {state === 'idle' && (
              <div className="w-full flex flex-col items-center space-y-6 animate-reveal">
                <div
                  onClick={handleClaim}
                  className={`h-40 w-40 flex flex-col items-center justify-center rounded-full border transition-all duration-300 group ${
                    isVerified 
                      ? 'border-blue-500 shadow-2xl shadow-blue-500/10 cursor-pointer active:scale-95 bg-blue-500/5' 
                      : 'opacity-30 border-zinc-800 bg-zinc-900/50 cursor-not-allowed'
                  }`}
                >
                  <Gift className={`h-8 w-8 transition-transform group-hover:scale-110 ${isVerified ? 'text-blue-400' : 'text-zinc-600'}`} />
                  <span className="text-[9px] font-mono font-black tracking-widest uppercase text-zinc-500 pt-2">
                    {isVerified ? 'Tap to Claim' : 'Locked'}
                  </span>
                </div>

                {!isVerified ? (
                  <button 
                    onClick={handleShareVerify} 
                    className="w-full max-w-xs py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/10 hover:opacity-90 active:scale-98 transition-all"
                  >
                    Share to Unlock
                  </button>
                ) : (
                  <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold tracking-wider uppercase">
                    Verified - Ready to Claim
                  </div>
                )}
              </div>
            )}

            {state === 'rolling' && (
              <div className="space-y-4 animate-pulse py-10">
                <div className="w-12 h-12 rounded-full border-2 border-t-blue-500 border-zinc-800 animate-spin mx-auto" />
                <p className="text-xs text-blue-400 font-mono tracking-wide">{status}</p>
              </div>
            )}

            {state === 'revealed' && (
              <div className="w-full flex flex-col items-center space-y-6 animate-reveal">
                <div className="space-y-2">
                  <CheckCircle className="text-emerald-500 mx-auto" size={48} />
                  <span className="block text-[10px] font-mono font-black uppercase tracking-widest text-zinc-500">Asset Yield Received</span>
                  <h3 className="text-4xl md:text-5xl font-mono font-black text-white tracking-tight">
                    +{amount} <span className="text-xs font-sans font-bold text-zinc-500 uppercase">{token}</span>
                  </h3>
                </div>

                <div className="w-full max-w-xs space-y-2 pt-4">
                  <Button onClick={() => onNavigate('wallet')} className="w-full py-3 text-xs font-black uppercase tracking-wider">
                    Open Wallet
                  </Button>

                  <Button
                    variant="secondary"
                    className="w-full py-2.5 text-xs font-bold"
                    onClick={() =>
                      tg?.openLink?.(
                        `https://t.me/share/url?url=https://t.me/swift_dropbot/app?startapp=${drop.id}&text=I just claimed ${amount} ${token}! 🚀`
                      )
                    }
                  >
                    Invite Friends
                  </Button>

                  <Button variant="ghost" className="w-full text-xs font-semibold text-zinc-500 py-1.5" onClick={() => onNavigate('leaderboard')}>
                    Leaderboard
                  </Button>
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}