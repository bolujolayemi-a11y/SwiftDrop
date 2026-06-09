import React from 'react';
import ClaimReward from '@/pages/ClaimReward';

export default function DeepLink({ id, onNavigate }) {
  return (
    <ClaimReward
      id={id}
      onNavigate={onNavigate}
      isDeepLinked={true}
    />
  );
}