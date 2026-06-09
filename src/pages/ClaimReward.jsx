import React, { useState, useEffect } from 'react';
import { dropStore } from '@/features/drops/dropStore';
import { addEvent } from '@/api/ledgerApi';
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
  const [shareVerified, setShareVerified] = useState(false);

  const token = drop?.token || 'USDT';

  const [isVerified, setIsVerified] = useState(false);
    useEffect(() => {
      try {
        const verification = sessionStorage.getItem(
          `swifty_verified_${id}`
        );

        if (verification) {
          const parsed = JSON.parse(verification);
          setIsVerified(parsed?.verified === true);
        }
      } catch {
        setIsVerified(false);
      }
    }, [id]);

  useEffect(() => {
    if (!drop || !userId) return;
  }, [drop, userId]);

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

  const handleShareVerify = () => {
    const link =
      `https://t.me/share/url?url=https://t.me/swift_dropbot/app?startapp=${drop.id}&text=I’m unlocking rewards 🚀`;

    if (tg?.openLink) tg.openLink(link);
    else window.open(link, '_blank');

    sessionStorage.setItem(
      `swifty_share_${id}`,
      JSON.stringify({ verified: true })
    );

    setShareVerified(true);
    triggerHaptic('success');
  };

  const handleClaim = async () => {
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

    setTimeout(async () => {
      clearInterval(interval);
      clearInterval(roll);

     const reward = await dropApi.claimDrop({
        dropId: drop.id,
        userId
      });
      setAmount(reward.amount);

      await addEvent({
        type: 'claim',
        userId,
        username: user?.username || 'user',
        dropId: drop.id,
        amount: reward.amount,
        token,
        timestamp: Date.now()
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
        <p className="text-zinc-400 text-sm font-medium">Drop not found</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-3 flex flex-col min-h-[82vh]">

      <BackButton onBack={() => onNavigate('home')} fallbackText="Back" />

      <div className="text-center space-y-2 pt-3">
        <h2 className="text-2xl font-black text-white">
          {state === 'revealed' ? 'Reward Unlocked' : drop.title}
        </h2>
        {status && <p className="text-xs text-blue-400 animate-pulse">{status}</p>}
      </div>

      <div className="flex flex-1 items-center justify-center">
        {state === 'idle' && (
          <div className="flex flex-col items-center gap-4 w-full">

            <div
              onClick={handleClaim}
              className={`h-44 w-44 rounded-full flex flex-col items-center justify-center bg-zinc-900 border ${
                isVerified ? 'border-blue-500 cursor-pointer' : 'opacity-50'
              }`}
            >
              <Gift className="h-10 w-10 text-blue-400" />
              <span className="text-xs mt-2 text-zinc-400">
                {isVerified ? 'Claim Reward' : 'Share to Unlock'}
              </span>
            </div>

            {!isVerified ? (
              <div className="w-full space-y-3 text-center">

                <button
                  onClick={handleShareVerify}
                  className={blueButton}
                >
                  <Share2 className="h-4 w-4" />
                  Share to Unlock Reward
                </button>

                {/* 👇 MOVED CANCEL UNDER SHARE BUTTON */}
                <button
                  onClick={handleCancel}
                  className="text-xs text-zinc-500 underline"
                >
                  Cancel
                </button>

              </div>
            ) : (
              <p className="text-xs text-green-400">
                Verified — you can claim now
              </p>
            )}
          </div>
        )}

        {state === 'rolling' && (
          <p className="text-4xl font-bold text-white">${amount}</p>
        )}

        {state === 'revealed' && (
          <div className="text-center space-y-3">
            <CheckCircle className="h-14 w-14 text-green-500 mx-auto" />
            <h3 className="text-4xl font-bold">
              +{amount} {token}
            </h3>
          </div>
        )}
      </div>

      {state === 'revealed' && (
        <div className="space-y-2 mt-auto">

          <Button onClick={() => onNavigate('wallet')}>
            Open Wallet
          </Button>

          <Button
            variant="secondary"
            onClick={() => {
              const link =
                `https://t.me/share/url?url=https://t.me/swift_dropbot/app?startapp=${drop.id}&text=I just claimed ${amount} ${token}`;
              tg?.openLink ? tg.openLink(link) : window.open(link, '_blank');
            }}
          >
            <Share2 className="h-4 w-4" />
            Invite Friends
          </Button>

          <Button variant="ghost" onClick={() => onNavigate('leaderboard')}>
            <Users className="h-4 w-4" />
            Leaderboard
          </Button>

        </div>
      )}
    </div>
  );
}