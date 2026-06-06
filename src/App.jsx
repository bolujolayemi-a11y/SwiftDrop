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

  useEffect(() => {
    const tgStartParam =
      window.Telegram?.WebApp?.initDataUnsafe?.start_param ||
      tg?.initDataUnsafe?.start_param;

    if (tgStartParam) {
      console.log('Telegram Deep Link:', tgStartParam);

      setCurrentDropId(tgStartParam);

      dropStore.incrementClickCount?.(tgStartParam);

      setCurrentPage('deeplink');
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);

    const webStartParam =
      urlParams.get('startapp') ||
      urlParams.get('dropId');

    if (webStartParam) {
      console.log('Web Deep Link:', webStartParam);

      setCurrentDropId(webStartParam);

      dropStore.incrementClickCount?.(webStartParam);

      setCurrentPage('deeplink');
    }
  }, [tg]);

  const handleNavigation = (page, params = null) => {
    setCurrentPage(page);
    setRouteParams(params);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <Providers>
      <PageWrapper>
        {currentPage !== 'deeplink' && (
          <Navbar
            onNavigate={handleNavigation}
            currentPage={currentPage}
          />
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