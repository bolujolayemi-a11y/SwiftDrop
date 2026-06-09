import React, { useState, useEffect } from 'react';
import { dropStore } from '@/features/drops/dropStore';
import { addEvent } from '@/api/ledgerApi';
import { useTelegram } from '@/hooks/useTelegram';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import { Gift, CheckCircle, Share2, Users, AlertCircle } from 'lucide-react';
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

  // ✅ FIXED VERIFICATION (single source of truth)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`swifty_verified_${id}`);
      const parsed = raw ? JSON.parse(raw) : null;
      setIsVerified(parsed?.verified === true);
    } catch {
      setIsVerified(false);
    }
  }, [id]);

  const handleShareVerify = () => {
    const link =
      `https://t.me/share/url?url=https://t.me/swift_dropbot/app?startapp=drop_${drop.id}&text=I’m unlocking rewards 🚀`;

    if (tg?.openLink) tg.openLink(link);
    else window.open(link, '_blank');

    sessionStorage.setItem(
      `swifty_verified_${id}`,
      JSON.stringify({ verified: true })
    );

    setIsVerified(true); // IMPORTANT UI UPDATE
    triggerHaptic('success');
  };

  const handleClaim = () => {
    if (!isVerified) {
      triggerHaptic('warning');
      return;
    }

    // 1. Kick off the rolling loader state first
    setState('rolling');
    triggerHaptic('impact');

    setTimeout(() => {
      // 2. Fetch the actual randomized calculation payout pool balance
      const result = dropStore.claimDrop(drop.id, {
        userId,
        username: user?.username || 'user'
      });

      if (!result?.success) {
        setState('idle');
        return;
      }

      const finalAmount = result.amountClaimed || '0.00';
      setAmount(finalAmount);

      // 3. Sync events downstream to backend records
      addEvent({
        type: 'claim',
        userId,
        username: user?.username || 'user',
        dropId: drop.id,
        amount: finalAmount,
        token,
        timestamp: Date.now()
      });

      // 4. Reveal the final matched number value payload
      setState('revealed');

      // 🚀 PREMIUM DUAL-CANNON HACKATHON CONFETTI EFFECT (Fires exactly on reveal)
      const duration = 2.5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // Left side cannon shooting up and right
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        
        // Right side cannon shooting up and left
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      triggerHaptic('success');
    }, 2000);
  };

  if (!drop) {
    return (
      <div className="p-6 text-center text-zinc-400">
        <AlertCircle className="mx-auto mb-2" />
        Drop not found
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-4 text-zinc-100 text-left animate-reveal">
      <BackButton onBack={() => onNavigate('home')} />

      <h2 className="text-xl font-black text-center mt-3 tracking-tight">
        {state === 'revealed' ? 'Reward Unlocked' : drop.title}
      </h2>

      <div className="flex flex-col items-center mt-10">
        {state === 'idle' && (
          <>
            <div
              onClick={handleClaim}
              className={`h-44 w-44 flex flex-col items-center justify-center rounded-full border transition-all duration-300 relative group ${
                isVerified ? 'border-blue-500 shadow-xl shadow-blue-500/5 cursor-pointer active:scale-95' : 'opacity-40 border-zinc-800'
              }`}
            >
              <Gift className="text-blue-500 h-8 w-8" />
              <span className="text-[10px] font-mono font-black tracking-wider uppercase text-zinc-500 pt-2">
                {isVerified ? 'Tap to Claim' : 'share to unlock'}
              </span>
            </div>

            {!isVerified ? (
              <div className="mt-4 w-full space-y-3">
                <button
                  type="button"
                  onClick={handleShareVerify}
                  className="w-full py-3 bg-linear-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md"
                >
                  Share to Unlock Reward
                </button>
                <button
                  type="button"
                  onClick={() => setState('idle')}
                  className="w-full py-3 bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <p className="text-emerald-400 font-mono text-xs font-bold mt-4">
                ✓ Verified — You can claim this reward.
              </p>
            )}
          </>
        )}

        {state === 'rolling' && (
          <div className="text-center py-6 animate-pulse">
            <p className="text-5xl font-mono font-black tracking-tight text-zinc-500">Processing...</p>
          </div>
        )}

        {state === 'revealed' && (
          <div className="text-center mt-6 space-y-3 animate-reveal">
            <CheckCircle className="text-emerald-500 mx-auto" size={48} />
            <h3 className="text-4xl font-mono font-black text-white tracking-tight">
              +{amount} <span className="text-sm font-sans font-bold text-zinc-500">{token}</span>
            </h3>
          </div>
        )}
      </div>

      {state === 'revealed' && (
        <div className="space-y-2 mt-12 w-full max-w-xs mx-auto">
          <Button onClick={() => onNavigate('wallet')} className="w-full font-black text-xs uppercase tracking-wider py-3">
            Open Wallet
          </Button>

          <Button
            variant="secondary"
            onClick={() => {
              const link =
                `https://t.me/share/url?url=https://t.me/swift_dropbot/app?startapp=${drop.id}&text=I just claimed ${amount} ${token}! 🚀`;
              tg?.openLink ? tg.openLink(link) : window.open(link, '_blank');
            }}
            className="w-full text-xs font-bold py-2.5"
          >
            <Share2 className="h-4 w-4" />
            Invite Friends
          </Button>

          <Button variant="ghost" onClick={() => onNavigate('leaderboard')} className="w-full text-xs font-semibold text-zinc-500 py-2">
            <Users className="h-4 w-4" />
            Leaderboard
          </Button>
        </div>
      )}
    </div>
  );
}