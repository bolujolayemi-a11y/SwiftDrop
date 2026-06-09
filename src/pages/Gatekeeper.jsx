import React, { useEffect } from 'react';
import { dropStore } from '@/features/drops/dropStore';
import { useTelegram } from '@/hooks/useTelegram';

export default function Gatekeeper({ id, onNavigate, setDropId }) {
  const { user } = useTelegram();

  useEffect(() => {
    if (!id) {
      onNavigate('home');
      return;
    }

    setDropId(id);

    const drop = dropStore.getDropById(id);
    if (!drop) return;

    const hasClaimed = dropStore.hasUserClaimed(user?.id || 777000, id);

    setTimeout(() => {
      if (hasClaimed) {
        onNavigate('details');
      } else if (drop.trivia) {
        onNavigate('verify-action'); // ✅ Fixed: was 'verify'
      } else {
        onNavigate('claim');
      }
    }, 1000);
  }, [id, user, onNavigate, setDropId]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-4 animate-pulse">
      <div className="h-10 w-10 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
      <div className="space-y-1">
        <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
          Resolving Swifty Campaign Routing
        </p>
        <p className="text-[11px] text-zinc-600 font-mono">
          Payload verification string: {id || 'NULL'}
        </p>
      </div>
    </div>
  );
}