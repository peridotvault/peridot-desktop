import React, { useEffect, useState } from 'react';

type Status = 'idle' | 'checking' | 'available' | 'none' | 'downloading' | 'downloaded' | 'error';

export default function UpdaterPage() {
  const [state, setState] = useState<Status>('idle');
  const [message, setMessage] = useState('Initializing…');
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const api = (window as any).electronAPI;

    console.log(api);
    const offStatus = api.onStatus((p: any) => {
      console.log('MESSAGE = ' + p);
      setState(p.state);
      setMessage(p.message || '');
    });
    const offProgress = api.onProgress((p: any) => {
      console.log('PERCENT = ' + p);
      setState('downloading');
      setPercent(p?.percent ?? 0);
    });
    const offDownloaded = api.onDownloaded(() => {
      setState('downloaded');
      setMessage('Update downloaded');
    });

    return () => {
      if (typeof offStatus === 'function') offStatus();
      if (typeof offProgress === 'function') offProgress();
      if (typeof offDownloaded === 'function') offDownloaded();
    };
  }, []);

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
              <button
                onClick={() => (window as any).electronAPI.startDownload()}
                style={btnPrimary}
              >
                Download update
              </button>
              <button onClick={() => (window as any).electronAPI.skip()} style={btnGhost}>
                Skip
              </button>
            </>
          )}

          {state === 'downloaded' && (
            <button onClick={() => (window as any).electronAPI.installNow()} style={btnPrimary}>
              Restart to Update
            </button>
          )}

          {state === 'error' && (
            <button onClick={() => (window as any).electronAPI.skip()} style={btnGhost}>
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
