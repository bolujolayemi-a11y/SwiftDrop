import React, { useEffect, useState } from 'react';
import BackButton from '@/components/ui/BackButton';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { useTelegram } from '@/hooks/useTelegram';
import { dropStore } from '@/features/drops/dropStore'; 
import { dropApi } from '@/services/dropApi';

export default function WalletOverview({ onNavigate }) {
  const { user, triggerHaptic } = useTelegram();
  const userId = user?.id?.toString() || 'LOCAL_USER';

  const [localEvents, setLocalEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('USDT');

  // ⚡ SIMULATION STATES FOR OUTBOUND TRANSACTIONS
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStatusText, setSimStatusText] = useState('');

  useEffect(() => {
    const computeLocalWalletData = () => {
      const allDrops = dropStore.getDrops();
      const compiledEvents = [];

      // 🧠 1. Accumulate claims filtered strictly by user context metrics
      allDrops.forEach(drop => {
        const history = drop.analytics?.history || [];
        history.forEach(record => {
          const isMyClaim = 
            (record.userId && String(record.userId) === String(userId)) || 
            (record.username && user?.username && String(record.username) === String(user.username));

          if (isMyClaim) {
            compiledEvents.push({
              id: `${drop.id}-${record.time}`,
              type: 'claim',
              amount: parseFloat(record.amount) || 0,
              token: drop.token || 'USDT',
              timestamp: Date.now()
            });
          }
        });
      });

      // 🧠 2. Pull down matching local withdrawal records
      try {
        const savedWithdrawals = JSON.parse(localStorage.getItem(`swifty_withdrawals_${userId}`) || '[]');
        compiledEvents.push(...savedWithdrawals);
      } catch (e) {
        console.error(e);
      }

      setLocalEvents(compiledEvents);
    };

    computeLocalWalletData();
    
    if (dropStore.subscribe) {
      return dropStore.subscribe(computeLocalWalletData);
    }
  }, [userId, user?.username]);

  // 💵 SEPARATED ASSET BALANCES ENGINE
  const balances = localEvents.reduce((acc, e) => {
    const token = e.token || 'USDT';
    if (e.type === 'claim') acc[token] = (acc[token] || 0) + parseFloat(e.amount || 0);
    if (e.type === 'withdraw') acc[token] = (acc[token] || 0) - parseFloat(e.amount || 0);
    return acc;
  }, { USDT: 0, USDC: 0 }); // Hard default baseline states

  const balance = balances[selectedToken] || 0;
  const MIN_WITHDRAW = 1;

  const handleWithdrawConfirm = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) return;

    if (amount < MIN_WITHDRAW) {
      alert(`Minimum withdrawal is ${MIN_WITHDRAW} ${selectedToken}`);
      return;
    }

    if (amount > balance) {
      alert(`Insufficient ${selectedToken} balance`);
      return;
    }

    triggerHaptic?.('impact');
    setIsSimulating(true);

    try {
      // 👤 Step 1: Simulate checking user compliance tiers via SwiftyEx backend
      setSimStatusText('Validating KYC clearing level...');
      const profileData = await dropApi.getSwiftyProfile();
      const kycLevel = profileData?.kyc_level || 1;
      
      await new Promise(resolve => setTimeout(resolve, 900));

      // 📡 Step 2: Initialize transaction pipeline channels
      setSimStatusText(`Routing via SwiftyEx automated nodes...`);
      await new Promise(resolve => setTimeout(resolve, 900));

      // 💾 Step 3: Write structural storage event metrics downstream
      const currentWithdrawals = JSON.parse(localStorage.getItem(`swifty_withdrawals_${userId}`) || '[]');
      const newWithdrawal = {
        id: Date.now(),
        type: 'withdraw',
        amount: amount.toFixed(2),
        token: selectedToken,
        status: 'initiated',
        timestamp: Date.now()
      };
      
      localStorage.setItem(`swifty_withdrawals_${userId}`, JSON.stringify([newWithdrawal, ...currentWithdrawals]));
      
      if (dropApi?.addEvent) {
        await dropApi.addEvent({
          type: 'withdraw',
          userId,
          username: user?.username || 'user',
          amount,
          token: selectedToken,
          timestamp: Date.now()
        });
      }

      setSimStatusText('Transaction authorized! Redirecting...');
      triggerHaptic?.('success');
      await new Promise(resolve => setTimeout(resolve, 600));

    } catch (err) {
      console.error("Simulation pipeline interruption:", err);
    } finally {
      setIsSimulating(false);
      setSimStatusText('');
      setShowModal(false);
      setWithdrawAmount('');
    }

    // 📲 Native Telegram Bridge Interface Redirection
    const botUrl = 'https://t.me/SwiftyEx_bot';
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.openTelegramLink(botUrl);
    } else {
      window.open(botUrl, '_blank');
    }

    setTimeout(() => onNavigate('withdrawals'), 500);
  };

  return (
    /* 🖥️ Responsive outer wrapper scales workspace elements neatly on desktop grids */
    <div className="space-y-4 p-4 text-left w-full max-w-md md:max-w-5xl mx-auto animate-reveal text-zinc-100">
      <BackButton onBack={() => onNavigate('claim')} fallbackText="Back to Claim" />
      
      <div className="space-y-0.5">
        <h2 className="text-xl font-black tracking-tight text-white">Wallet Studio</h2>
        <p className="text-xs text-zinc-500 font-mono">ID: {userId}</p>
      </div>

      {/* Responsive layout splitter container */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        
        {/* LEFT CARD COLUMN: Asset Selector and Current Balance Metric */}
        <div className="space-y-3 md:col-span-5 w-full">
          <div className="flex gap-1.5 bg-zinc-950/60 p-1 border border-white/5 rounded-xl w-max">
            {['USDT', 'USDC'].map(t => (
              <button
                type="button"
                key={t}
                onClick={() => setSelectedToken(t)}
                className={`px-3 py-1 rounded-lg text-[10px] font-mono font-black transition-all cursor-pointer ${
                  selectedToken === t ? 'bg-blue-500 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <GlassCard className="p-4 bg-zinc-900/20 border-white/5 rounded-xl flex flex-col gap-0.5">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Unlocked {selectedToken} Allocations</p>
            <h3 className="text-3xl font-mono font-black text-white tracking-tight">
              {balance.toFixed(2)} <span className="text-xs font-sans text-zinc-500">{selectedToken}</span>
            </h3>
          </GlassCard>
        </div>

        {/* RIGHT ACTION COLUMN: Core Actions Navigation Sub-Grids */}
        <div className="space-y-3 md:col-span-7 w-full md:pt-9">
          <Button onClick={() => setShowModal(true)} className="w-full font-black py-3.5 text-xs uppercase tracking-widest bg-emerald-500 text-black">
            Withdraw to SwiftyEx_bot
          </Button>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button variant="secondary" onClick={() => onNavigate('earnings')} className="py-2.5 text-xs font-bold">History</Button>
            <Button variant="secondary" onClick={() => onNavigate('withdrawals')} className="py-2.5 text-xs font-bold">Withdrawals</Button>
          </div>
        </div>

      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-xs animate-reveal">
          <div className="bg-zinc-950 border border-white/5 p-5 rounded-2xl w-full max-w-xs space-y-4 shadow-2xl text-left">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-white">Withdraw</h3>
              <p className="text-[10px] text-zinc-500 font-mono">Max: {balance.toFixed(2)} {selectedToken}</p>
            </div>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="0.00"
              disabled={isSimulating}
              className="w-full p-3 font-mono font-bold text-sm rounded-xl bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-zinc-700 disabled:opacity-50"
            />
            <div className="flex gap-2 text-xs font-bold pt-1">
              <button 
                type="button" 
                disabled={isSimulating}
                onClick={() => setShowModal(false)} 
                className="flex-1 py-2.5 bg-zinc-900 rounded-xl text-zinc-400 disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                type="button"
                disabled={isSimulating}
                onClick={handleWithdrawConfirm} 
                className="flex-1 py-2.5 bg-blue-500 disabled:bg-blue-600/40 text-white rounded-xl shadow-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {isSimulating ? (
                  <span className="flex items-center gap-1 animate-pulse font-medium text-[10px]">
                    <div className="w-2.5 h-2.5 border-2 border-t-white border-white/20 rounded-full animate-spin" />
                    {simStatusText}
                  </span>
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}