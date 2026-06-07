import React, { useState, useEffect } from 'react';
import { dropStore } from '@/features/drops/dropStore';
import { ledgerStore } from '@/features/ledger/ledgerStore';
import { useTelegram } from '@/hooks/useTelegram';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button'; 
import { Gift, CheckCircle, Share2, Users, AlertCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti'; // Clean package module reference

export default function ClaimReward({ id, onNavigate }) {
  const { user, triggerHaptic, tg } = useTelegram();

  const drop = dropStore.getDropById(id);
  const userId = user?.id?.toString();

  const [state, setState] = useState('idle'); 
  const [amount, setAmount] = useState('0.00');
  const [status, setStatus] = useState('');
  const [shareVerified, setShareVerified] = useState(false);

  const token = drop?.token || 'USDT';

  /* -----------------------------
     ANTI-BOT SHARE CHECK
  ------------------------------ */
  const isVerified = (() => {
    try {
      const data = sessionStorage.getItem(`swifty_share_${id}`);
      return data ? JSON.parse(data).verified : false;
    } catch {
      return false;
    }
  })();

  /* -----------------------------
     INIT / RESTORE CLAIM
  ------------------------------ */
  useEffect(() => {
    if (!drop || !userId) return;

    const hasClaimed = dropStore.hasUserClaimed(userId, drop.id);

    if (hasClaimed) {
      const pastClaim = ledgerStore
        .getUserEvents(userId)
        .find(e => e.type === 'claim' && String(e.dropId) === String(drop.id));

      setAmount(pastClaim?.amount ?? '0.00');
      setState('revealed');
    }
  }, [drop, userId]);

  /* -----------------------------
     CONFETTI
  ------------------------------ */
  const fireConfetti = () => {
    const end = Date.now() + 900;
    const frame = () => {
      confetti({
        particleCount: 6,
        spread: 70,
        gravity: 0.9,
        ticks: 200,
        origin: { x: Math.random(), y: Math.random() * 0.4 }
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  /* -----------------------------
     SHARE VERIFICATION (ANTI BOT GATE)
  ------------------------------ */
  const handleShareVerify = () => {
    const link = `https://t.me/share/url?url=https://t.me/swift_dropbot/app?startapp=${drop.id}&text=I’m unlocking rewards 🚀`;

    if (tg?.openLink) tg.openLink(link);
    else window.open(link, '_blank');

    sessionStorage.setItem(
      `swifty_share_${id}`,
      JSON.stringify({ verified: true })
    );

    setShareVerified(true);
    triggerHaptic('success');
  };

  /* -----------------------------
     CLAIM TRANSACTION SEQUENCE
  ------------------------------ */
  const handleClaim = () => {
    if (state !== 'idle') return;
    if (!userId || !drop) return;

    if (!isVerified) {
      triggerHaptic('warning');
      return;
    }

    triggerHaptic('impact');
    setState('rolling');

    const fakeStatuses = [
      'Checking your entry...',
      'Unlocking your reward...',
      'Almost there...',
      'Claiming reward...'
    ];

    let i = 0;
    const interval = setInterval(() => {
      setStatus(fakeStatuses[i % fakeStatuses.length]);
      i++;
    }, 450);

    const roll = setInterval(() => {
      setAmount((Math.random() * 50 + 1).toFixed(2));
    }, 70);

    setTimeout(() => {
      clearInterval(interval);
      clearInterval(roll);

      const result = dropStore.claimDrop(drop.id, {
        userId,
        username: user?.username || 'user'
      });

      if (!result?.success) {
        setState('idle');
        setStatus('');
        return;
      }

      const finalAmount = String(result.amountClaimed ?? '0.00');
      setAmount(finalAmount);

      ledgerStore.addEvent({
        type: 'claim',
        userId,
        username: user?.username || 'user',
        dropId: drop.id,
        amount: finalAmount,
        token: drop.token || 'USDT'
      });

      setState('revealed');
      triggerHaptic('success');
      fireConfetti();
    }, 2000);
  };

  /* -----------------------------
     CANCEL TRIGGER ACTION
  ------------------------------ */
  const handleCancel = () => {
    setState('idle');
    setStatus('');
  };

  /* -----------------------------
     NATIVE FALLBACK CSS DECK
  ------------------------------ */
  const blueButton =
    "w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 active:scale-95 transition flex items-center justify-center gap-2";

  if (!drop) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-center p-6 animate-reveal">
        <div className="space-y-3">
          <AlertCircle className="h-8 w-8 text-zinc-600 mx-auto" />
          <p className="text-zinc-400 text-sm font-medium">Drop not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-3 flex flex-col justify-between min-h-[82vh] animate-reveal text-left">
      
      {/* HEADER BAR AREA */}
      <div className="space-y-4">
        <BackButton onBack={() => onNavigate('home')} fallbackText="Back" />
        
        <div className="pt-2 text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800/60 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-zinc-400 tracking-wider uppercase">
            🎁 Reward Campaign
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight leading-tight">
            {state === 'revealed' ? 'Reward Unlocked' : drop.title}
          </h2>
          {status && (
            <p className="text-xs font-mono text-brand-accent animate-pulse">
              {status}
            </p>
          )}
        </div>
      </div>

      {/* CENTER ENGINE VIEWPORT CONTAINER */}
      <div className="flex flex-1 items-center justify-center my-auto py-8 w-full">
        
        {/* RUNNING IDLE GATE STAGE */}
        {state === 'idle' && (
          <div className="flex flex-col items-center gap-5 w-full animate-reveal">
            <div
              onClick={handleClaim}
              className={`h-44 w-44 rounded-full flex flex-col items-center justify-center bg-zinc-900 border transition-all duration-300 relative group select-none ${
                isVerified 
                  ? 'border-brand-accent/40 hover:border-brand-accent shadow-xl shadow-brand-accent/5 cursor-pointer active:scale-95' 
                  : 'border-zinc-800/80 opacity-50 cursor-not-allowed'
              }`}
            >
              {isVerified && (
                <div className="absolute inset-0 rounded-full bg-brand-accent/10 blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
              )}
              <Gift className={`h-10 w-10 relative z-10 transition-transform duration-300 ${isVerified ? 'text-brand-accent group-hover:scale-110' : 'text-zinc-500'}`} />
              <span className="text-[10px] font-black tracking-widest uppercase text-zinc-500 pt-2 relative z-10">
                {isVerified ? 'Claim Reward' : 'Share to Unlock'}
              </span>
            </div>

            {/* VOLATILE CANCEL CONTROLLER ACTION */}
            <button
              type="button"
              onClick={handleCancel}
              className="text-xs text-zinc-500 hover:text-zinc-400 font-medium underline tracking-wide cursor-pointer transition-colors"
            >
              Cancel
            </button>

            {!isVerified ? (
              <div className="w-full space-y-3 text-center pt-2 animate-reveal">
                <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
                  Share this drop with friends to unlock your reward claim.
                </p>
                <button
                  type="button"
                  onClick={handleShareVerify}
                  className={blueButton}
                >
                  <Share2 className="h-4 w-4" />
                  Share to Unlock Reward
                </button>
              </div>
            ) : (
              <p className="text-xs text-brand-success font-medium flex items-center gap-1.5 animate-reveal pt-2">
                <CheckCircle className="h-3.5 w-3.5" /> Verification complete. You can now claim your reward.
              </p>
            )}
          </div>
        )}

        {/* NUMERIC RANDOM DISTRIBUTION ROLL ENGINE */}
        {state === 'rolling' && (
          <div className="text-center bg-zinc-950/40 px-10 py-6 border border-white/5 rounded-3xl backdrop-blur-md shadow-2xl animate-pulse">
            <p className="text-5xl font-mono font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-r from-white via-zinc-400 to-zinc-600">
              ${amount}
            </p>
          </div>
        )}

        {/* COMPLETED REVEALED SUCCESS BLOCK */}
        {state === 'revealed' && (
          <div className="text-center space-y-4 w-full animate-reveal">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-success/20 blur-2xl opacity-40 rounded-full w-24 h-24 mx-auto" />
              <CheckCircle className="h-14 w-14 text-brand-success mx-auto relative z-10 filter drop-shadow-[0_4px_12px_rgba(34,197,94,0.2)]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-5xl font-black text-white tracking-tighter">
                +{amount} <span className="text-lg font-mono font-bold text-zinc-400">{token}</span>
              </h3>
              <p className="text-xs text-zinc-500 font-medium">
                Your reward has been successfully processed.
              </p>
            </div>

            <Sparkles className="mx-auto h-4 w-4 text-amber-400 animate-pulse" />
          </div>
        )}
      </div>

      {/* CORE FORM FACTOR FOOTER CONTEXT BUTTONS */}
      {state === 'revealed' && (
        <div className="space-y-2.5 mt-auto w-full max-w-sm mx-auto">
          <Button 
            onClick={() => onNavigate('wallet')} 
            className="w-full py-3.5 font-bold text-xs uppercase tracking-wider"
          >
            Open Wallet
          </Button>

          <Button 
            variant="secondary" 
            onClick={() => {
              const link = `https://t.me/share/url?url=https://t.me/swift_dropbot/app?startapp=${drop.id}&text=I just claimed ${amount} ${token}! 🚀`;
              tg?.openLink ? tg.openLink(link) : window.open(link, '_blank');
            }} 
            className="w-full py-3 text-xs font-bold"
          >
            <Share2 className="h-4 w-4" />
            Invite Friends
          </Button>

          <Button 
            variant="ghost" 
            onClick={() => onNavigate('leaderboard')} 
            className="w-full py-3 text-xs font-semibold text-zinc-400"
          >
            <Users className="h-4 w-4" />
            View Leaderboard
          </Button>
        </div>
      )}
      
    </div>
  );
}