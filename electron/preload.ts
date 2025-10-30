// preload.ts
import { ipcRenderer, IpcRendererEvent } from 'electron';
import type { WalletData } from '@shared/services/wallet.service';
import { EncryptedData } from '@antigane/encryption';
import { IPC_UPDATER } from './ipc/updaterChannels';

interface SerializedWalletData {
  encryptedSeedPhrase: EncryptedData | null;
  principalId: string | null;
  accountId: string | null;
  encryptedPrivateKey: EncryptedData | null;
  password: string | null;
}

function normalizeSaveDialogResult(raw: any): { canceled: boolean; filePath?: string } {
  // Jika main mengembalikan string path langsung
  if (typeof raw === 'string') {
    return raw.trim()
      ? { canceled: false, filePath: raw }
      : { canceled: true };
  }
  // Jika main mengembalikan object resmi dialog Electron
  if (raw && typeof raw === 'object') {
    const canceled = !!raw.canceled;
    const filePath =
      typeof raw.filePath === 'string' && raw.filePath.trim()
        ? raw.filePath
        : Array.isArray(raw.filePaths) && raw.filePaths.length > 0
          ? raw.filePaths[0]
          : undefined;
    return { canceled, filePath };
  }
  return { canceled: true };
}
// Attach electronAPI methods with types matching types.d.ts
window.electronAPI = {
  showSaveDialog: async (defaultName?: string) => {
    const raw = await ipcRenderer.invoke('show-save-dialog', defaultName);
    return normalizeSaveDialogResult(raw);
  },
  showOpenDirDialog: () =>
    ipcRenderer.invoke('show-open-dir-dialog'),

  downloadToPath: (url: string, filePath: string) =>
    ipcRenderer.invoke('download-to-path', { url, filePath }),
  downloadAndExtractZip: (url: string, destDir: string) =>
    ipcRenderer.invoke('download-and-extract-zip', { url, destDir }),

  onDownloadProgress: (cb: (pct: number) => void) => {
    const handler = (_e: IpcRendererEvent, pct: number) => cb(pct);
    ipcRenderer.on('download-progress', handler);
    return () => ipcRenderer.off('download-progress', handler);
  },

  findLaunchableInDir: (dirPath: string) =>
    ipcRenderer.invoke('find-launchable-in-dir', dirPath) as Promise<{ path: string | null }>,

  launchApp: (targetPath: string) =>
    ipcRenderer.invoke('launch-app', targetPath) as Promise<{ ok: boolean; error?: string }>,

  goBack: (): void => {
    ipcRenderer.send('go-back');
  },
  goForward: (): void => {
    ipcRenderer.send('go-forward');
  },

  // wallet
  saveWallet: (
    data: SerializedWalletData | WalletData,
  ): Promise<{ success: boolean; error?: string }> => ipcRenderer.invoke('save-wallet', data),

  getWallet: (): Promise<{ success: boolean; data?: SerializedWalletData; error?: string }> =>
    ipcRenderer.invoke('get-wallet'),

  clearWallet: (): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('clear-wallet'),

  openWebGame: (url: string): void => {
    ipcRenderer.send('open-web-game', url);
  },

  // updater 
  // updater 
  onStatus: (cb: (p: any) => void) => {
    const handler = (_e: IpcRendererEvent, p: any) => cb(p);
    ipcRenderer.on(IPC_UPDATER.STATUS, handler);
    return () => ipcRenderer.off(IPC_UPDATER.STATUS, handler);
  },
  onProgress: (cb: (p: any) => void) => {
    const handler = (_e: IpcRendererEvent, p: any) => cb(p);
    ipcRenderer.on(IPC_UPDATER.PROGRESS, handler);
    return () => ipcRenderer.off(IPC_UPDATER.PROGRESS, handler);
  },
  onDownloaded: (cb: (p: any) => void) => {
    const handler = (_e: IpcRendererEvent, p: any) => cb(p);
    ipcRenderer.on(IPC_UPDATER.DOWNLOADED, handler);
    return () => ipcRenderer.off(IPC_UPDATER.DOWNLOADED, handler);
  },

  startDownload: () => ipcRenderer.send(IPC_UPDATER.START_DOWNLOAD),
  installNow: () => ipcRenderer.send(IPC_UPDATER.INSTALL_NOW),
  skip: () => ipcRenderer.send(IPC_UPDATER.SKIP),
};
