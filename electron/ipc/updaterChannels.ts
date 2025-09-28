export const IPC_UPDATER = {
    STATUS: 'updater:status',         // payload: {state, message, version?}
    PROGRESS: 'updater:progress',     // payload: {percent, transferred, total, bytesPerSecond}
    DOWNLOADED: 'updater:downloaded', // payload: info dari electron-updater
    START_DOWNLOAD: 'updater:start-download',
    INSTALL_NOW: 'updater:install-now',
    SKIP: 'updater:skip',
} as const;

export type UpdaterState =
    | 'idle'
    | 'checking'
    | 'available'
    | 'none'
    | 'downloading'
    | 'downloaded'
    | 'error';

export interface UpdaterStatus {
    state: UpdaterState;
    message?: string;
    version?: string;
}

export interface DownloadProgress {
    percent: number;
    transferred: number;
    total: number;
    bytesPerSecond: number;
}
