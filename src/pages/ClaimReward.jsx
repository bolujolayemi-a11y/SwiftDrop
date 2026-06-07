import React, { useState, useEffect } from 'react';
import { dropStore } from '@/features/drops/dropStore';
import { ledgerStore } from '@/features/ledger/ledgerStore';
import { useTelegram } from '@/hooks/useTelegram';
import BackButton from '@/components/ui/BackButton';
import { Gift, CheckCircle, Share2, Users, X } from 'lucide-react';
import confetti from 'canvas-confetti';

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
        particleCount: 5,
        spread: 60,
        gravity: 0.9,
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
  };

  /* -----------------------------
     CLAIM
  ------------------------------ */
  const handleClaim = () => {
    if (state !== 'idle') return;
    if (!userId || !drop) return;

    if (!isVerified) {
      triggerHaptic('warning');
      alert('Share first to unlock claim');
      return;
    }

    triggerHaptic('impact');
    setState('rolling');

    const fakeStatuses = [
      'Connecting...',
      'Checking eligibility...',
      'Allocating reward...',
      'Finalizing...'
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
    }, 1800);
  };

  /* -----------------------------
     CANCEL CLAIM
  ------------------------------ */
  const handleCancel = () => {
    setState('idle');
    setStatus('');
  };

  /* -----------------------------
     UI STYLES
  ------------------------------ */
  const blueButton =
    "w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 active:scale-95 transition";

  if (!drop) {
    return (
      <div className="text-center py-10 text-sm text-zinc-400">
        Drop not found
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 flex flex-col min-h-[80vh]">

      <BackButton onBack={() => onNavigate('home')} />

      {/* TITLE */}
      <div className="text-center mt-4 space-y-2">
        <h2 className="text-xl font-bold text-white">
          {state === 'revealed' ? 'Reward Unlocked' : drop.title}
        </h2>

        {status && (
          <p className="text-xs text-zinc-500 animate-pulse">
            {status}
          </p>
        )}
      </div>

      {/* CLAIM AREA */}
      <div className="flex flex-1 items-center justify-center flex-col gap-4">

        {state === 'idle' && (
          <>
            <div
              onClick={handleClaim}
              className="h-40 w-40 rounded-full flex flex-col items-center justify-center bg-zinc-900 border cursor-pointer active:scale-95 transition"
            >
              <Gift className="h-9 w-9 text-white" />
              <p className="text-[10px] text-zinc-500 mt-2">Tap to Claim</p>
            </div>

            {/* CANCEL BUTTON */}
            <button
              onClick={handleCancel}
              className="text-xs text-zinc-500 underline"
            >
              Cancel
            </button>

            {/* SHARE GATE */}
            {!isVerified && (
              <button
                onClick={handleShareVerify}
                className={blueButton}
              >
                <Share2 className="h-4 w-4 inline mr-2" />
                Share to Unlock Claim
              </button>
            )}
          </>
        )}

        {state === 'revealed' && (
          <div className="text-center space-y-3">
            <CheckCircle className="mx-auto text-green-400 h-10 w-10" />
            <h3 className="text-4xl font-black text-white">
              +{amount} {token}
            </h3>
          </div>
        )}
      </div>

      {/* ACTIONS */}
      {state === 'revealed' && (
        <div className="space-y-2 mt-auto">

          <button
            onClick={() => onNavigate('wallet')}
            className={blueButton}
          >
            Open Wallet
          </button>

          <button
            onClick={() => {
              const link = `https://t.me/share/url?url=https://t.me/swift_dropbot/app?startapp=${drop.id}&text=I just claimed ${amount} ${token}! 🚀`;
              tg?.openLink ? tg.openLink(link) : window.open(link, '_blank');
            }}
            className={blueButton}
          >
            <Share2 className="h-4 w-4 inline mr-2" />
            Invite Friends
          </button>

          <button
            onClick={() => onNavigate('leaderboard')}
            className={blueButton}
          >
            <Users className="h-4 w-4 inline mr-2" />
            View Leaderboard
          </button>

        </div>
      )}

    </div>
  );
}