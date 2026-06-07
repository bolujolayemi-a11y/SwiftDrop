import React, { useState, useEffect } from 'react';
import { dropStore } from '@/features/drops/dropStore';
import { ledgerStore } from '@/features/ledger/ledgerStore';
import { useTelegram } from '@/hooks/useTelegram';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import { Gift, CheckCircle, Share2, Users, AlertCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ClaimReward({ id, onNavigate }) {
  const { user, triggerHaptic, tg } = useTelegram();

  const drop = dropStore.getDropById(id);
  const userId = user?.id?.toString();

  const [state, setState] = useState('idle');
  const [amount, setAmount] = useState('0.00');
  const [status, setStatus] = useState('');

  const token = drop?.token || 'USDT';

  const isVerified = (() => {
    try {
      const data = sessionStorage.getItem(`swifty_share_${id}`);
      return data ? JSON.parse(data).verified : false;
    } catch {
      return false;
    }
  })();

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

  const fireConfetti = () => {
    const end = Date.now() + 900;
    const frame = () => {
      confetti({
        particleCount: 6,
        spread: 70,
        gravity: 0.9,
        origin: { x: Math.random(), y: Math.random() * 0.4 }
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const handleShareVerify = () => {
    const link = `https://t.me/share/url?url=https://t.me/swift_dropbot/app?startapp=${drop.id}&text=I’m unlocking rewards 🚀`;

    if (tg?.openLink) tg.openLink(link);
    else window.open(link, '_blank');

    sessionStorage.setItem(
      `swifty_share_${id}`,
      JSON.stringify({ verified: true })
    );

    triggerHaptic('success');
  };

  const handleClaim = () => {
    if (state !== 'idle') return;
    if (!userId || !drop || !isVerified) return;

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
        token
      });

      setState('revealed');
      triggerHaptic('success');
      fireConfetti();
    }, 2000);
  };

  const handleCancel = () => {
    setState('idle');
    setStatus('');
  };

  const blueButton =
    "w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 active:scale-95 transition flex items-center justify-center gap-2";

  if (!drop) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-center p-6">
        <AlertCircle className="h-8 w-8 text-zinc-600 mx-auto" />
        <p className="text-zinc-400 text-sm mt-2">Drop not found</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-3 flex flex-col min-h-[82vh] text-left">

      <BackButton onBack={() => onNavigate('home')} />

      {/* HEADER */}
      <div className="text-center space-y-2 pt-3">
        <h2 className="text-2xl font-black text-white">
          {state === 'revealed' ? 'Reward Unlocked' : drop.title}
        </h2>
        {status && <p className="text-xs text-blue-400 animate-pulse">{status}</p>}
      </div>

      {/* CENTER */}
      <div className="flex flex-1 items-center justify-center">

        {state === 'idle' && (
          <div className="flex flex-col items-center gap-5 w-full">

            {/* CLAIM BUTTON */}
            <div
              onClick={handleClaim}
              className={`h-44 w-44 rounded-full flex flex-col items-center justify-center bg-zinc-900 border transition ${
                isVerified
                  ? 'border-blue-500 cursor-pointer active:scale-95'
                  : 'border-zinc-800 opacity-50 cursor-not-allowed'
              }`}
            >
              <Gift className={`h-10 w-10 ${isVerified ? 'text-blue-400' : 'text-zinc-600'}`} />
              <span className="text-[10px] uppercase font-bold text-zinc-500 mt-2">
                {isVerified ? 'Claim Reward' : 'Share to Unlock'}
              </span>
            </div>

            {/* SHARE BLOCK */}
            {!isVerified ? (
              <div className="w-full space-y-3 text-center">

                <p className="text-xs text-zinc-500">
                  Share this drop to unlock claiming.
                </p>

                <button onClick={handleShareVerify} className={blueButton}>
                  <Share2 className="h-4 w-4" />
                  Share to Unlock Reward
                </button>

                {/* ✅ CANCEL BUTTON (FIXED LOCATION + BLUE) */}
                <button
                  onClick={handleCancel}
                  className="w-full py-3 rounded-xl font-semibold text-white bg-linear-to-r from-blue-400 to-indigo-500 active:scale-95 flex items-center justify-center gap-2"
                >
                  Cancel
                </button>

              </div>
            ) : (
              <p className="text-xs text-green-400 flex items-center gap-1 justify-center">
                <CheckCircle className="h-3 w-3" />
                Verified — you can claim now
              </p>
            )}

          </div>
        )}

        {state === 'rolling' && (
          <div className="text-center">
            <p className="text-4xl font-black text-white">${amount}</p>
          </div>
        )}

        {state === 'revealed' && (
          <div className="text-center space-y-3">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto" />
            <h3 className="text-4xl font-black text-white">
              +{amount} {token}
            </h3>
            <Sparkles className="mx-auto h-4 w-4 text-yellow-400" />
          </div>
        )}

      </div>

      {/* FOOTER */}
      {state === 'revealed' && (
        <div className="space-y-2 w-full">
          <Button onClick={() => onNavigate('wallet')} className="w-full">
            Open Wallet
          </Button>

          <Button
            variant="secondary"
            onClick={() => {
              const link = `https://t.me/share/url?url=https://t.me/swift_dropbot/app?startapp=${drop.id}&text=I just claimed ${amount} ${token}! 🚀`;
              tg?.openLink ? tg.openLink(link) : window.open(link, '_blank');
            }}
            className="w-full"
          >
            <Share2 className="h-4 w-4" />
            Invite Friends
          </Button>

          <Button variant="ghost" onClick={() => onNavigate('leaderboard')} className="w-full">
            <Users className="h-4 w-4" />
            View Leaderboard
          </Button>
        </div>
      )}

    </div>
  );
}