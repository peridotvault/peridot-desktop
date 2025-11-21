// src/hooks/useInstalled.ts
import { useEffect, useState } from 'react';
import { OSKey } from '@interfaces/CoreInterface';
import {
  getLatestInstalled,
  InstalledEntry,
  INSTALLED_EVENT,
  isInstalled,
} from '@shared/utils/installedStorage';

export function useInstalled(appId?: string | number | bigint, os?: OSKey) {
  const [installed, setInstalled] = useState(false);
  const [latest, setLatest] = useState<InstalledEntry | undefined>(undefined);

  useEffect(() => {
    let alive = true;

    async function refresh() {
      if (appId == null) {
        if (alive) {
          setInstalled(false);
          setLatest(undefined);
        }
        return;
      }
      const [installedValue, latestEntry] = await Promise.all([
        isInstalled(appId, os),
        getLatestInstalled(appId, os),
      ]);
      if (!alive) return;
      setInstalled(installedValue);
      setLatest(latestEntry);
    }

    refresh();

    const handler = (event: Event) => {
      if (!appId) return;
      const detail = (event as CustomEvent<{ appId: string }>).detail;
      if (!detail || detail.appId !== String(appId)) return;
      refresh();
    };

    window.addEventListener(INSTALLED_EVENT, handler);

    return () => {
      alive = false;
      window.removeEventListener(INSTALLED_EVENT, handler);
    };
  }, [appId, os]);

  return { installed, latest };
}
