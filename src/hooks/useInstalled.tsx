// src/hooks/useInstalled.ts
import { useEffect, useState } from 'react';
import { OSKey } from '../interfaces/CoreInterface';
import { getLatestInstalled, InstalledEntry, isInstalled } from '../lib/utils/installedStorage';

export function useInstalled(appId?: string | number | bigint, os?: OSKey) {
  const [installed, setInstalled] = useState(false);
  const [latest, setLatest] = useState<InstalledEntry | undefined>(undefined);

  useEffect(() => {
    if (appId == null) {
      setInstalled(false);
      setLatest(undefined);
      return;
    }
    setInstalled(isInstalled(appId, os));
    setLatest(getLatestInstalled(appId, os));
    // bisa ditambah event listener custom bila kamu ingin reaktif setelah download:
    // window.addEventListener('pv:installed:changed', handler)
  }, [appId, os]);

  return { installed, latest };
}
