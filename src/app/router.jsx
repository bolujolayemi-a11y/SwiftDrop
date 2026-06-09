export default function Router({
  currentPage,
  onNavigate,
  currentDropId,
  setDropId,
  params
}) {
  const commonProps = {
    onNavigate,
    setDropId
  };

  switch (currentPage) {
    case 'home':
      return <Home {...commonProps} />;

    case 'create':
      return <CreateDrop onNavigate={onNavigate} />;

    case 'dashboard':
      return <Dashboard {...commonProps} />;

    case 'details':
      return (
        <DropDetails
          id={currentDropId}
          onNavigate={onNavigate}
          setDropId={setDropId}
        />
      );

    case 'claim':
      return (
        <ClaimReward
          id={currentDropId}
          onNavigate={onNavigate}
        />
      );

    case 'deeplink':
      return (
        <DeepLink
          id={currentDropId}
          onNavigate={onNavigate}
        />
      );

    case 'verify-action':
    case 'verify':
      return (
        <VerifyAction
          id={currentDropId}
          onNavigate={onNavigate}
        />
      );

    case 'analytics':
      return (
        <CampaignAnalytics
          id={currentDropId}
          onNavigate={onNavigate}
        />
      );

    case 'gatekeeper':
      return (
        <Gatekeeper
          id={currentDropId}
          {...commonProps}
        />
      );

    case 'guide':
      return <UserGuide onNavigate={onNavigate} />;

    case 'privacy':
      return <PrivacyPolicy onNavigate={onNavigate} />;

    case 'wallet':
      return <WalletOverview {...commonProps} />;

    case 'earnings':
      return <EarningsHistory {...commonProps} />;

    case 'withdrawals':
      return <Withdrawals {...commonProps} />;

    case 'leaderboard':
      return (
        <Leaderboard
          onNavigate={onNavigate}
          dropId={currentDropId}
          params={params}
        />
      );

    default:
      return <Home {...commonProps} />;
  }
}