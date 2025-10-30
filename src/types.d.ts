// types.d.ts
import type { WalletData } from '@shared/services/wallet.service';

declare global {
  interface Window {
    electronAPI: {
      showSaveDialog: (
        defaultName?: string
      ) => Promise<{ canceled: boolean; filePath?: string }>;
      showOpenDirDialog?: () => Promise<{ canceled: boolean; filePath?: string }>;
      downloadToPath: (url: string, filePath: string) => Promise<void>;
      downloadAndExtractZip?: (url: string, destDir: string) => Promise<{ ok: true }>;
      onDownloadProgress: (cb: (pct: number) => void) => () => void;
      findLaunchableInDir: (dirPath: string) => Promise<{ path: string | null }>;
      launchApp: (targetPath: string) => Promise<{ ok: boolean; error?: string }>;
      goBack: () => void;
      goForward: () => void;
      saveWallet: (
        data: SerializedWalletData | WalletData,
      ) => Promise<{ success: boolean; error?: string }>;
      getWallet: () => Promise<{ success: boolean; data?: SerializedWalletData; error?: string }>;
      clearWallet: () => Promise<{ success: boolean; error?: string }>;
      openWebGame: (url: string) => void;

      // updater
      onStatus: (cb: (p: any) => void) => void;
      onProgress: (cb: (p: any) => void) => void;
      onDownloaded: (cb: (p: any) => void) => void;
      startDownload: () => void;
      installNow: () => void;
      skip: () => void;
    };
  }
}
