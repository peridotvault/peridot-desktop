import { autoUpdater } from 'electron-updater';
import type { BrowserWindow } from 'electron';
import log from 'electron-log';
import { IPC_UPDATER, type DownloadProgress, type UpdaterStatus } from '../ipc/updaterChannels';

export class AppUpdater {
    constructor(private getWindow: () => BrowserWindow | null) {
        autoUpdater.autoDownload = false;
        autoUpdater.autoInstallOnAppQuit = true;
        autoUpdater.logger = log;
        (autoUpdater.logger as any).transports.file.level = 'info';

        autoUpdater.on('checking-for-update', () => this.status({ state: 'checking', message: 'Checking for updates…' }));
        autoUpdater.on('update-available', (info) => this.status({ state: 'available', version: info.version, message: `Update ${info.version} available` }));
        autoUpdater.on('update-not-available', () => this.status({ state: 'none', message: 'You are up to date' }));
        autoUpdater.on('error', (err) => this.status({ state: 'error', message: err?.message ?? String(err) }));
        autoUpdater.on('download-progress', (p) => this.progress({
            percent: p.percent ?? 0,
            transferred: p.transferred ?? 0,
            total: p.total ?? 0,
            bytesPerSecond: p.bytesPerSecond ?? 0
        }));
        autoUpdater.on('update-downloaded', (info) => {
            this.status({ state: 'downloaded', version: info.version, message: 'Update downloaded' });
            this.emit(IPC_UPDATER.DOWNLOADED, info);
        });
    }

    async check() {
        try { await autoUpdater.checkForUpdates(); }
        catch (e: any) { this.status({ state: 'error', message: e?.message ?? String(e) }); }
    }

    async download() {
        try {
            this.status({ state: 'downloading', message: 'Downloading…' });
            await autoUpdater.downloadUpdate();
        } catch (e: any) { this.status({ state: 'error', message: e?.message ?? String(e) }); }
    }

    installNow() {
        autoUpdater.quitAndInstall(true, true);
    }

    // helpers
    private status(s: UpdaterStatus) { this.emit(IPC_UPDATER.STATUS, s); }
    private progress(p: DownloadProgress) { this.emit(IPC_UPDATER.PROGRESS, p); }
    private emit(channel: string, payload: unknown) {
        const w = this.getWindow();
        if (!w) return;
        w.webContents.send(channel, payload);
    }
}
