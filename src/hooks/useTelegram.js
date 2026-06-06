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

  const triggerHaptic = (type = 'light') => {
    if (!tg?.HapticFeedback) return;

    try {
      switch (type) {
        case 'impact':
          tg.HapticFeedback.impactOccurred('medium');
          break;

        case 'success':
          tg.HapticFeedback.notificationOccurred('success');
          break;

        case 'warning':
          tg.HapticFeedback.notificationOccurred('warning');
          break;

        default:
          tg.HapticFeedback.impactOccurred('light');
      }
    } catch (error) {
      console.error('Haptic error:', error);
    }
  };

  return {
    tg,
    user,
    triggerHaptic
  };
}