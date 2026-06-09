import { useEffect, useState } from 'react';

export function useTelegram() {
  const [tg, setTg] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initializeTelegram = () => {
      const telegram = window.Telegram;

      console.log('Telegram Object:', telegram);

      if (telegram?.WebApp) {
        const webapp = telegram.WebApp;

        console.log('Telegram WebApp Initialized');
        console.log('Init Data Unsafe:', webapp.initDataUnsafe);

        try {
          webapp.ready();
          webapp.expand();
        } catch (error) {
          console.error('Telegram initialization error:', error);
        }

        setTg(webapp);

        if (webapp.initDataUnsafe?.user) {
          setUser(webapp.initDataUnsafe.user);
        } else {
          console.warn('No Telegram user found, using fallback.');

          setUser({
            id: 777000,
            first_name: 'Alex',
            last_name: 'Lawson',
            username: 'alex_lawson',
            photo_url:
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'
          });
        }
      } else {
        console.warn('Telegram SDK not detected. Browser mode enabled.');

        setUser({
          id: 777000,
          first_name: 'Alex',
          last_name: 'Lawson',
          username: 'alex_lawson',
          photo_url:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'
        });
      }
    };

    const timer = setTimeout(initializeTelegram, 300);

    return () => clearTimeout(timer);
  }, []);

  const triggerHaptic = (type = 'impact') => {
  const haptic = window.Telegram?.WebApp?.HapticFeedback;

  if (!haptic || typeof haptic !== 'object') return; // ❌ not supported

  try {
    if (type === 'impact') {
      haptic.impactOccurred?.('medium');
    }

    if (type === 'success') {
      haptic.notificationOccurred?.('success');
    }

    if (type === 'warning') {
      haptic.notificationOccurred?.('warning');
    }
  } catch (e) {
    // silently fail
  }
};

  return {
    tg,
    user,
    triggerHaptic
  };
}