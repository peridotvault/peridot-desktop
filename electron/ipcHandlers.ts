import { ipcMain, shell } from 'electron';
import { getMainWindow } from './windows/_mainWindow';
import { openWebGameWindow } from './windows/webGameWindow';

export function setupIpcHandlers() {
  const win = getMainWindow();

  ipcMain.on('go-back', () => {
    win?.webContents.goBack();
  });

  ipcMain.on('go-forward', () => {
    win?.webContents.goForward();
  });

  ipcMain.on('open-external-link', (_event, url) => {
    shell.openExternal(url);
  });

  // Games
  ipcMain.on('open-web-game', (_event, url: string) => {
    openWebGameWindow(url);
  });
}
