import { ipcMain } from 'electron';
import { IPC_UPDATER } from './updaterChannels';
import { AppUpdater } from '../services/AppUpdater';

export function registerUpdaterIpc(updater: AppUpdater, onSkip: () => void) {
    ipcMain.on(IPC_UPDATER.START_DOWNLOAD, () => updater.download());
    ipcMain.on(IPC_UPDATER.INSTALL_NOW, () => updater.installNow());
    ipcMain.on(IPC_UPDATER.SKIP, () => onSkip());
}
