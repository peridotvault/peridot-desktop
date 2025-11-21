import React, { useEffect, useMemo, useState } from 'react';
import { check, DownloadEvent, Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

type Status = 'idle' | 'checking' | 'available' | 'none' | 'downloading' | 'downloaded' | 'error';

interface UpdaterPageProps {
  onContinue?: () => void;
  autoContinueDelayMs?: number;
}

const isDesktopRuntime = () => typeof window !== 'undefined' && Boolean((window as any).__TAURI__);
const isDevEnvironment = Boolean(import.meta.env?.DEV);
const devUpdaterOverride = import.meta.env?.VITE_ENABLE_DEV_UPDATER === 'true';

export default function UpdaterPage({ onContinue, autoContinueDelayMs = 800 }: UpdaterPageProps) {
  const [state, setState] = useState<Status>('idle');
  const [message, setMessage] = useState('Initializing…');
  const [percent, setPercent] = useState(0);
  const [updateInfo, setUpdateInfo] = useState<Update | null>(null);
  const shouldSkipUpdater = useMemo(
    () => !devUpdaterOverride && (!isDesktopRuntime() || isDevEnvironment),
    [],
  );

  useEffect(() => {
    let active = true;
    async function run() {
      if (shouldSkipUpdater) {
        setState('none');
        if (!isDesktopRuntime()) {
          setMessage('Updater hanya tersedia di aplikasi desktop.');
        } else {
          setMessage('Skipping update check while in development mode.');
        }
        return;
      }
      setState('checking');
      setMessage('Checking for updates…');
      try {
        const result = await check();
        if (!active) return;
        if (result?.available) {
          setUpdateInfo(result);
          setState('available');
          setMessage(`Version ${result.version} is available.`);
        } else {
          setState('none');
          setMessage('You already have the latest version.');
        }
      } catch (error) {
        console.error('Failed to check updates', error);
        if (!active) return;
        if (isDevEnvironment && !devUpdaterOverride) {
          setState('none');
          setMessage('Skipping update check while in development mode.');
        } else {
          setState('error');
          setMessage('Failed to check for updates.');
        }
      }
    }

    run();
    return () => {
      active = false;
    };
  }, [shouldSkipUpdater]);

  useEffect(() => {
    if (!onContinue) return;
    if (state === 'none') {
      const id = setTimeout(() => {
        onContinue?.();
      }, autoContinueDelayMs);
      return () => clearTimeout(id);
    }
  }, [autoContinueDelayMs, onContinue, state]);

  const handleDownload = async () => {
    if (!updateInfo) return;
    setState('downloading');
    setMessage('Downloading update…');
    setPercent(0);
    try {
      let totalBytes = 0;
      let downloaded = 0;
      await updateInfo.downloadAndInstall((event: DownloadEvent) => {
        if (event.event === 'Started') {
          totalBytes = event.data.contentLength ?? 0;
          downloaded = 0;
          setPercent(0);
        } else if (event.event === 'Progress') {
          downloaded += event.data.chunkLength;
          if (totalBytes > 0) {
            setPercent(Math.min(99, (downloaded / totalBytes) * 100));
          }
        } else if (event.event === 'Finished') {
          setPercent(100);
        }
      });
      setState('downloaded');
      setMessage('Update downloaded. Restart to apply.');
      setPercent(100);
    } catch (error) {
      console.error('Failed to download update', error);
      setState('error');
      setMessage('Failed to download update.');
    }
  };

  const skipUpdate = () => {
    setState('none');
    setMessage('Skipping update for now.');
    onContinue?.();
  };

  const installNow = async () => {
    try {
      await relaunch();
    } catch (error) {
      console.error('Failed to relaunch application', error);
      setState('error');
      setMessage('Failed to restart application.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f1113',
        color: '#e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          width: 360,
          borderRadius: 16,
          background: '#15181b',
          border: '1px solid #252a30',
          padding: 20,
        }}
      >
        <h1 style={{ fontSize: 16, margin: 0, fontWeight: 600 }}>PeridotVault — Updater</h1>
        <p style={{ marginTop: 8, color: '#9aa4b2', fontSize: 14 }}>{message}</p>

        {state === 'downloading' && (
          <>
            <div
              style={{
                width: '100%',
                height: 8,
                background: '#23272e',
                borderRadius: 999,
                overflow: 'hidden',
                marginTop: 10,
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${percent.toFixed(1)}%`,
                  background: '#3b82f6',
                  transition: 'width .15s linear',
                }}
              />
            </div>
            <p style={{ marginTop: 6, color: '#6b7280', fontSize: 12 }}>{percent.toFixed(1)}%</p>
          </>
        )}

        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          {state === 'available' && (
            <>
              <button onClick={handleDownload} style={btnPrimary}>
                Download update
              </button>
              <button onClick={skipUpdate} style={btnGhost}>
                Skip
              </button>
            </>
          )}

          {state === 'downloaded' && (
            <button onClick={installNow} style={btnPrimary}>
              Restart to Update
            </button>
          )}

          {state === 'error' && (
            <button onClick={() => onContinue?.()} style={btnGhost}>
              Continue to app
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  border: 0,
  borderRadius: 10,
  padding: '10px 12px',
  background: '#2563eb',
  color: '#e5e7eb',
  cursor: 'pointer',
};
const btnGhost: React.CSSProperties = {
  border: 0,
  borderRadius: 10,
  padding: '10px 12px',
  background: '#1f2329',
  color: '#e5e7eb',
  cursor: 'pointer',
};
