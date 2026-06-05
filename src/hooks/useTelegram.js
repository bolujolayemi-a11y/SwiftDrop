import { useEffect, useState } from 'react';

export function useTelegram() {
  const [tg, setTg] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const webapp = window.Telegram.WebApp;
      webapp.ready();
      webapp.expand();
      setTg(webapp);
      
      if (webapp.initDataUnsafe?.user) {
        setUser(webapp.initDataUnsafe.user);
      } else {
        // High fidelity fallback mockup data for browser/testing
        setUser({
          id: 777000,
          first_name: "Alex",
          last_name: "Lawson",
          username: "alex_lawson",
          photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"
        });
      }
    }
  }, []);

  const triggerHaptic = (type = 'light') => {
    if (tg?.HapticFeedback) {
      switch(type) {
        case 'impact': tg.HapticFeedback.impactOccurred('medium'); break;
        case 'success': tg.HapticFeedback.notificationOccurred('success'); break;
        case 'warning': tg.HapticFeedback.notificationOccurred('warning'); break;
        default: tg.HapticFeedback.impactOccurred('light');
      }
    }
  };

  return { tg, user, triggerHaptic };
}