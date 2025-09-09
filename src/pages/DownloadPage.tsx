// src/pages/DownloadPage.tsx (gantikan yang lama)
import React from 'react';
import { useDownloadManager } from '../components/molecules/DownloadManager';

export const DownloadPage: React.FC = () => {
  const { queue, removeFromQueue, cancelActive } = useDownloadManager();
  console.log('electronAPI', window.electronAPI);

  return (
    <div className="container mx-auto max-w-4xl px-6 pt-20 pb-24">
      <h1 className="text-3xl font-semibold mb-6">Download Queue</h1>

      {queue.length === 0 ? (
        <div className="opacity-70">
          Queue kosong. Klik “Install” dari Library untuk menambah unduhan.
        </div>
      ) : (
        <ul className="space-y-3">
          {queue.map((q) => (
            <li key={q.id} className="rounded-xl border border-white/10 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-medium truncate">
                    {q.appTitle} · {q.build.os} v{q.build.version}
                  </div>
                  <div className="text-xs opacity-70 truncate">{q.build.fileName}</div>
                </div>
                <div className="w-40 h-2 rounded bg-white/10 overflow-hidden">
                  <div className="h-full bg-white/60" style={{ width: `${q.progress}%` }} />
                </div>
              </div>
              <div className="mt-2 text-xs opacity-70">
                {q.status}
                {q.errorMsg ? `: ${q.errorMsg}` : ''}
              </div>
              <div className="mt-2 flex gap-2">
                {q.status === 'active' && (
                  <button
                    onClick={cancelActive}
                    className="px-3 py-1 rounded border border-white/15 text-sm"
                  >
                    Cancel Active
                  </button>
                )}
                <button
                  onClick={() => removeFromQueue(q.id)}
                  className="px-3 py-1 rounded border border-white/15 text-sm"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
