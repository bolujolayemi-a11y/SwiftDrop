import React, { useState, useEffect } from 'react';
import Providers from '@/app/providers';
import Navbar from '@/components/layout/Navbar';
import PageWrapper from '@/components/layout/PageWrapper';
import Router from '@/app/router';
import { useTelegram } from '@/hooks/useTelegram';
import { dropStore } from '@/features/drops/dropStore';

export default function App() {
  const { tg } = useTelegram();

  const [currentPage, setCurrentPage] = useState('home');
  const [currentDropId, setCurrentDropId] = useState(null);
  const [routeParams, setRouteParams] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initApp = () => {
      try {
        const webApp = window.Telegram?.WebApp;

        const rawStartParam =
          webApp?.initDataUnsafe?.start_param ||
          tg?.initDataUnsafe?.start_param ||
          new URLSearchParams(window.location.search).get('startapp') ||
          new URLSearchParams(window.location.search).get('tgWebAppStartParam');

        if (rawStartParam) {
          let cleanDropId = String(rawStartParam)
          .replace(/^(drop_|claim_|drop-)/, '')
          .split('_')[0]
          .trim();

          const drops = dropStore.getDrops();
          const demos = dropStore.getDemos();

          const targetDrop =
            drops.find(d => String(d.id) === cleanDropId) ||
            drops.find(d => String(d.id).includes(cleanDropId)) ||
            dropStore.getDemos?.()?.find(d => String(d.id) === cleanDropId);

          const finalId = targetDrop ? targetDrop.id : cleanDropId;

          setCurrentDropId(finalId);

          // 🔥 IMPORTANT: force claim page
          setCurrentPage('claim');

          setInitialized(true);
          return;
        }

        setInitialized(true);
      } catch (err) {
        console.error('App init error:', err);
        setInitialized(true);
      }
    };

    const timer = setTimeout(initApp, 150);
    return () => clearTimeout(timer);
  }, [tg]);

  const handleNavigation = (page, params = null) => {
    setCurrentPage(page);
    setRouteParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!initialized) return null;

  return (
    <Providers>
      <PageWrapper>
        {currentPage !== 'deeplink' && (
          <Navbar onNavigate={handleNavigation} currentPage={currentPage} />
        )}

        <Router
          currentPage={currentPage}
          onNavigate={handleNavigation}
          currentDropId={currentDropId}
          setDropId={setCurrentDropId}
          params={routeParams}
        />
      </PageWrapper>
    </Providers>
  );
}