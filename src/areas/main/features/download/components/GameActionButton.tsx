import React, { useMemo, useState } from 'react';
import { ButtonWithSound } from '@shared/components/ui/ButtonWithSound';
import { detectOSKey } from '@shared/utils/os';
import { useDownloadQueue } from '../hooks/useDownloadQueue';
import { useInstalled } from '../hooks/useInstalled';
import type { NativeDownloadInfo, PlatformType } from '../interfaces/download';
import type { OSKey } from '@shared/interfaces/CoreInterface';

type GameActionButtonProps = {
  gameId: string;
  title: string;
  platform: PlatformType; // tetap ada, tapi tidak jadi penentu utama
  os?: OSKey;
  downloadInfo?: NativeDownloadInfo | null;
  resolveDownloadInfo?: () => Promise<NativeDownloadInfo | null>;
  webUrl?: string | null;
  onPlay?: () => Promise<void> | void;
  className?: string;
};

type VisualState =
  | 'web-play'
  | 'native-play'
  | 'native-install'
  | 'downloading'
  | 'queued'
  | 'disabled';

const VISUAL_STATE_CLASSES: Record<VisualState, string> = {
  // Bisa play langsung lewat URL (web only / belum ada native yang dipakai)
  'web-play': 'bg-emerald-500 text-black hover:bg-emerald-400',

  // Native sudah terinstall, play lokal
  'native-play': 'bg-accent text-black hover:bg-accent/90',

  // Ada native build tapi belum install → harus download dulu
  'native-install': 'border border-sky-400 text-sky-100 hover:bg-sky-500/10',

  // Sedang download / install
  downloading: 'bg-amber-500 text-black cursor-default',

  // Masih di antrian download
  queued: 'bg-muted text-muted-foreground cursor-default',

  // Benar-benar disabled
  disabled: 'bg-muted text-muted-foreground cursor-not-allowed',
};

export const GameActionButton: React.FC<GameActionButtonProps> = ({
  gameId,
  title,
  os,
  downloadInfo,
  resolveDownloadInfo,
  webUrl,
  onPlay,
  className,
}) => {
  const osKey = useMemo(() => os ?? detectOSKey(), [os]);

  const { installed, latest } = useInstalled(gameId, osKey);
  const { requestInstall, getTaskForGame } = useDownloadQueue();

  const [resolving, setResolving] = useState(false);

  const queueTask = getTaskForGame(gameId);
  const isDownloading = queueTask?.status === 'downloading' || queueTask?.status === 'installing';
  const isQueued = queueTask?.status === 'queued';
  const progressPercent = queueTask ? Math.round((queueTask.progress || 0) * 100) : 0;

  const hasNative = !!downloadInfo;
  const hasWeb = !!webUrl;

  const handleInstall = async () => {
    if (!hasNative) return;

    setResolving(true);
    try {
      const info = downloadInfo ?? (await resolveDownloadInfo?.());
      if (!info) {
        alert('Download info is not available for this game yet.');
        return;
      }

      await requestInstall({ gameId, title, download: info });
    } finally {
      setResolving(false);
    }
  };

  const handlePlay = async () => {
    if (isDownloading || isQueued) return;

    if (onPlay) {
      await onPlay();
      return;
    }

    if (webUrl) {
      window.open(webUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const label = (): string => {
    if (isDownloading) return `Downloading ${progressPercent}%`;
    if (isQueued) return 'Queued';
    if (installed) return 'Play';

    // Belum install
    if (hasNative) return 'Install';
    if (hasWeb) return 'Play';

    return 'Unavailable';
  };

  const disabled = resolving || isDownloading || isQueued || (!installed && !hasNative && !hasWeb);

  const visualState: VisualState = (() => {
    if (disabled && !isDownloading && !isQueued) return 'disabled';
    if (isDownloading) return 'downloading';
    if (isQueued) return 'queued';

    if (installed && hasNative) return 'native-play';
    if (!installed && hasNative) return 'native-install';
    if (hasWeb) return 'web-play';

    return 'disabled';
  })();

  const handleClick = () => {
    if (disabled) return;

    // Prioritas:
    // 1) Kalau sudah install → play native
    // 2) Kalau belum install tapi ada native → install
    // 3) Kalau hanya web → play via URL
    if (installed && hasNative) {
      void handlePlay();
    } else if (!installed && hasNative) {
      void handleInstall();
    } else if (hasWeb) {
      void handlePlay();
    }
  };

  const versionText = installed && latest?.version ? ` • v${latest.version}` : '';

  return (
    <ButtonWithSound
      onClick={handleClick}
      disabled={disabled}
      className={[
        'px-4 py-2 rounded-lg font-medium transition-colors duration-200',
        'flex items-center justify-center gap-1',
        VISUAL_STATE_CLASSES[visualState],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {label()}
      {versionText}
    </ButtonWithSound>
  );
};
