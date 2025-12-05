import type { OSKey } from '@shared/interfaces/CoreInterface';

export type PlatformType = 'web' | 'native';

export type DownloadStatus =
  | 'queued'
  | 'downloading'
  | 'installing'
  | 'completed'
  | 'error'
  | 'canceled';

export interface NativeDownloadInfo {
  os: OSKey;
  url: string;
  fileName: string;
  version?: string;
  sizeBytes?: number;
}

export interface DownloadTask {
  id: string;
  gameId: string;
  title: string;
  os: OSKey;
  url: string;
  status: DownloadStatus;
  progress: number; // 0..1
  downloadedBytes: number;
  totalBytes?: number;
  destinationDir: string;
  fileName: string;
  filePath?: string;
  version?: string;
  error?: string;
}

export interface EnqueueDownloadInput {
  gameId: string;
  title: string;
  download: NativeDownloadInfo;
  installDir: string;
}
