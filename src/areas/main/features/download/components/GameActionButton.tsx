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
  platform: PlatformType;
  os?: OSKey;
  downloadInfo?: NativeDownloadInfo | null;
  resolveDownloadInfo?: () => Promise<NativeDownloadInfo | null>;
  webUrl?: string | null;
  onPlay?: () => Promise<void> | void;
  className?: string;
};

export const GameActionButton: React.FC<GameActionButtonProps> = ({
  gameId,
  title,
  platform,
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
  const isDownloading =
    queueTask?.status === 'downloading' || queueTask?.status === 'installing';
  const isQueued = queueTask?.status === 'queued';
  const progressPercent = queueTask ? Math.round((queueTask.progress || 0) * 100) : 0;

  const effectivePlatform: PlatformType = platform === 'web' ? 'web' : 'native';

  const handleInstall = async () => {
    if (effectivePlatform === 'web') return;
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

  const label = () => {
    if (effectivePlatform === 'web') return 'Play';
    if (installed) return 'Play';
    if (isDownloading) return `Downloading ${progressPercent}%`;
    if (isQueued) return 'Queued';
    return 'Install';
  };

  const disabled =
    resolving ||
    (effectivePlatform === 'native' && !installed && !!queueTask) ||
    (effectivePlatform === 'web' && !webUrl && !onPlay);

  const handleClick = () => {
    if (effectivePlatform === 'web' || installed) {
      void handlePlay();
    } else {
      void handleInstall();
    }
  };

  return (
    <ButtonWithSound
      onClick={handleClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg font-medium ${installed ? 'bg-accent text-black' : 'border border-white/15'} ${className ?? ''}`}
    >
      {label()}
      {installed && latest?.version ? ` • v${latest.version}` : null}
    </ButtonWithSound>
  );
};
