import { app, BrowserWindow } from 'electron';
import { createMainWindow } from './windows/_mainWindow';
import { setupStoreHandlers } from './store';
import { setupIpcHandlers } from './ipcHandlers';

// let win: BrowserWindow | null;

app.whenReady().then(() => {
  setupStoreHandlers();
  createMainWindow();
  setupIpcHandlers();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    // win = null;
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
