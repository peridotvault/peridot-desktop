import { BrowserWindow } from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { getMainWindow } from './_mainWindow';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let webGameWindow: BrowserWindow | null = null;

export function openWebGameWindow(url: string): void {
    const parent = getMainWindow();

    webGameWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        parent: parent || undefined,
        modal: false,
        show: false,
        title: 'Web Game',
        backgroundColor: '#000000',
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
        },
    });

    webGameWindow.loadURL(url);

    webGameWindow.once('ready-to-show', () => {
        webGameWindow?.show();
    });

    webGameWindow.on('closed', () => {
        webGameWindow = null;
    });
}
