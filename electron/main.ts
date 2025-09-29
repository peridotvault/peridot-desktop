import { app, BrowserWindow } from 'electron';
import { createMainWindow } from './windows/_mainWindow';
import { setupStoreHandlers } from './store';
import { AppUpdater } from './services/AppUpdater';
import { setupIpcHandlers } from './ipcHandlers';
import { autoUpdater } from 'electron-updater';
import { createUpdaterWindow, getUpdaterWindow } from './windows/updaterWindow';
import { registerUpdaterIpc } from './ipc/registerUpdaterIpc';

let mainWin: BrowserWindow | null = null;
const isDev = !app.isPackaged;

function openMainAndCloseUpdater() {
  if (!mainWin) mainWin = createMainWindow();
  getUpdaterWindow()?.close();
}

app.whenReady().then(() => {
  setupStoreHandlers();
  setupIpcHandlers();

  if (isDev) {
    // Dev: langsung ke main (biar cepat dev loop)
    mainWin = createMainWindow();
    return;
  }

  const upWin = createUpdaterWindow();
  const updater = new AppUpdater(() => getUpdaterWindow());
  registerUpdaterIpc(updater, () => openMainAndCloseUpdater());

  autoUpdater.once('update-not-available', () => {
    openMainAndCloseUpdater();
  });
  autoUpdater.once('error', () => {
    // jangan blokir user kalau updater error
    openMainAndCloseUpdater();
  });

  // Mulai check setelah UI siap
  upWin.webContents.once('did-finish-load', () => {
    void updater.check();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    // win = null;
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    openMainAndCloseUpdater();
  }
});
