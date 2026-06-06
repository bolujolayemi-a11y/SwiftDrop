import React, { useEffect } from 'react';
import { dropStore } from '@/features/drops/dropStore';
import ClaimReward from '@/pages/ClaimReward';

export default function DeepLink({
  id,
  onNavigate,
}) {
  useEffect(() => {
    if (!id) return;

    // Track campaign visits
    if (dropStore.incrementClickCount) {
      dropStore.incrementClickCount(id);
    }
  }, [id]);

  return (
    <ClaimReward
      id={id}
      onNavigate={onNavigate}
      isDeepLinked={true}
    />
  );
}