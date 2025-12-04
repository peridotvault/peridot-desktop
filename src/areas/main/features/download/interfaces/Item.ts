export type DownloadStatus = 'queued' | 'downloading' | 'installing' | 'installed' | 'error';

export type DownloadItem = {
  gameId: string;
  title: string;
  status: DownloadStatus;
  progress: number; // 0 - 1
  downloadedBytes: number;
  totalBytes: number;
};
