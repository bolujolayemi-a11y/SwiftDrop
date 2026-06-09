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

    setState('rolling');

    setTimeout(() => {
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

      addEvent({
        type: 'claim',
        userId,
        username: user?.username || 'user',
        dropId: drop.id,
        amount: finalAmount,
        token,
        timestamp: Date.now()
      });

      setState('revealed');
      confetti();
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
    <div className="max-w-md mx-auto px-4 pt-4">

      <BackButton onBack={() => onNavigate('home')} />

      <h2 className="text-xl font-bold text-center mt-3">
        {state === 'revealed' ? 'Reward Unlocked' : drop.title}
      </h2>

      <div className="flex flex-col items-center mt-10">

        {state === 'idle' && (
          <>
            <div
              onClick={handleClaim}
              className={`h-44 w-44 flex items-center justify-center rounded-full border cursor-pointer ${
                isVerified ? 'border-blue-500' : 'opacity-40'
              }`}
            >
              <Gift className="text-blue-500" />
            </div>

            {!isVerified ? (
              <div className="mt-4 w-full space-y-3">

                <button
                  onClick={handleShareVerify}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl"
                >
                  Share to Unlock Reward
                </button>

                {/* ✅ FIXED CANCEL BUTTON */}
                <button
                  onClick={() => setState('idle')}
                  className="w-full py-3 bg-gradient-to-r from-blue-400 to-indigo-500 text-white rounded-xl"
                >
                  Cancel
                </button>

              </div>
            ) : (
              <p className="text-green-400 text-sm mt-3">
                Verified — you can claim now
              </p>
            )}
          </>
        )}

        {state === 'rolling' && (
          <p className="text-4xl font-bold">${amount}</p>
        )}

        {state === 'revealed' && (
          <div className="text-center mt-10">
            <CheckCircle className="text-green-500 mx-auto" size={50} />
            <h3 className="text-3xl font-bold mt-2">
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