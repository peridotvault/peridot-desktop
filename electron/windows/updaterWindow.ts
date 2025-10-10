// electron/windows/_updaterWindow.ts
import { BrowserWindow } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { VITE_DEV_SERVER_URL, RENDERER_DIST } from '../constants';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let updaterWindow: BrowserWindow | null = null;

export function createUpdaterWindow(): BrowserWindow {
    updaterWindow = new BrowserWindow({
        width: 420,
        height: 300,
        resizable: false,
        maximizable: false,
        minimizable: false,
        frame: true,
        title: 'PeridotVault — Checking for updates…',
        backgroundColor: '#111315',
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.mjs'),
            contextIsolation: false,
            nodeIntegration: true,
            sandbox: false,
        },
    });
    // updaterWindow.webContents.openDevTools();

    updaterWindow.once('ready-to-show', () => updaterWindow?.show());

    if (VITE_DEV_SERVER_URL) {
        // Updater page terpisah saat dev
        updaterWindow.loadURL(`${VITE_DEV_SERVER_URL}#/updater`);
    } else {
        updaterWindow.loadFile(path.join(RENDERER_DIST, 'index.html'), { hash: 'updater' });
    }

    updaterWindow.on('closed', () => (updaterWindow = null));
    return updaterWindow;
}

export function getUpdaterWindow(): BrowserWindow | null {
    return updaterWindow;
}
