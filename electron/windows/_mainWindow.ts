import { BrowserWindow, app } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { VITE_DEV_SERVER_URL, RENDERER_DIST, VITE_PUBLIC } from '../constants';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;

export function createMainWindow(): BrowserWindow {
  // DEBUG LOGGING
  console.log('=== DEBUG MAIN WINDOW ===');
  console.log('app.isPackaged:', app.isPackaged);
  console.log('process.resourcesPath:', process.resourcesPath);
  console.log('app.getAppPath():', app.getAppPath());
  console.log('__dirname:', __dirname);
  console.log('RENDERER_DIST:', RENDERER_DIST);
  console.log('VITE_PUBLIC:', VITE_PUBLIC);
  
  const indexPath = path.join(RENDERER_DIST, 'index.html');
  console.log('index.html path:', indexPath);
  console.log('index.html exists?', fs.existsSync(indexPath));
  
  // List files in RENDERER_DIST
  if (fs.existsSync(RENDERER_DIST)) {
    console.log('Files in RENDERER_DIST:', fs.readdirSync(RENDERER_DIST));
  } else {
    console.error('RENDERER_DIST does not exist!');
  }
  console.log('========================');

  mainWindow = new BrowserWindow({
    width: 1100,
    minWidth: 1100,
    height: 600,
    minHeight: 600,
    backgroundColor: '#1C1F1D',
    vibrancy: 'under-window',
    visualEffectState: 'active',
    icon: path.join(VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: false,
      nodeIntegration: true,
      sandbox: false,
    },
  });

  // mainWindow.webContents.openDevTools(); // AKTIFKAN untuk lihat error di console

  mainWindow.webContents.on('did-fail-load', ( errorCode, errorDescription) => {
    console.error('Page failed to load:', errorCode, errorDescription);
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✓ Page loaded successfully');
    mainWindow?.webContents.send('main-process-message', new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    console.log('Loading DEV URL:', VITE_DEV_SERVER_URL);
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
  } else {
    console.log('Loading FILE:', indexPath);
    mainWindow.loadFile(indexPath).catch((err) => {
      console.error('loadFile ERROR:', err);
    });
  }

  return mainWindow;
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}