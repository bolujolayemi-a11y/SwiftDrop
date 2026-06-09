import React, { useState, useEffect } from 'react';
import { dropStore } from '@/features/drops/dropStore';
import { addEvent } from '@/api/ledgerApi';
import { useTelegram } from '@/hooks/useTelegram';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import { Gift, CheckCircle, Share2, Users } from 'lucide-react';
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

    setTimeout(() => {
      const result = dropStore.claimDrop(drop.id, {
        userId,
        username: user?.username || 'user'
      });

      if (!result?.success) {
        setState('idle');
        return;
      }

      setAmount(result.amountClaimed);

      addEvent({
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

      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });

      triggerHaptic('success');
    }, 3000);
  };

  if (!drop) {
    return <p className="p-6 text-center text-zinc-400">Drop not found</p>;
  }

  const handleBack = () => {
    if (state === 'revealed') {
      onNavigate('wallet'); // post-claim hub
    } else {
      onNavigate('home');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-4 text-white">
      <BackButton onBack={handleBack} />

      <h2 className="text-center text-xl font-bold mt-3">
        {state === 'revealed' ? 'Reward Unlocked' : drop.title}
      </h2>

      <div className="flex flex-col items-center mt-10">

        {state === 'idle' && (
          <>
            <div
              onClick={handleClaim}
              className={`h-44 w-44 flex items-center justify-center rounded-full border ${
                isVerified ? 'border-blue-500 cursor-pointer' : 'opacity-40'
              }`}
            >
              <Gift className="text-blue-500" />
            </div>

            {!isVerified ? (
              <button onClick={handleShareVerify} className="mt-4 bg-blue-600 px-4 py-2 rounded">
                Share to Unlock
              </button>
            ) : (
              <p className="text-green-400 mt-3">Verified ✔</p>
            )}
          </>
        )}

        {state === 'rolling' && (
          <div className="text-center mt-6">
            <p className="text-sm text-zinc-400 font-mono">{status}</p>
          </div>
        )}

        {state === 'revealed' && (
          <div className="text-center mt-6">
            <CheckCircle className="text-green-500 mx-auto" size={40} />
            <h3 className="text-3xl font-bold mt-2">
              +{amount} {token}
            </h3>
          </div>
        )}
      </div>

      {state === 'revealed' && (
        <div className="mt-10 space-y-2">
          <Button onClick={() => onNavigate('wallet')}>Wallet</Button>

          <Button onClick={() =>
            tg?.openLink?.(
              `https://t.me/share/url?url=https://t.me/swift_dropbot/app?startapp=${drop.id}&text=I just claimed ${amount} ${token}`
            )
          }>
            Invite Friends
          </Button>

          <Button variant="secondary" onClick={() => onNavigate('leaderboard')}>
            Leaderboard
          </Button>
        </div>
      )}
    </div>
  );
}