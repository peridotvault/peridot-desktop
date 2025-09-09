import { dialog, ipcMain, shell, app } from 'electron';
import { getMainWindow } from './windows/_mainWindow';
import { openWebGameWindow } from './windows/webGameWindow';
import * as http from 'node:http';
import * as https from 'node:https';
import * as fs from 'node:fs';
import * as path from 'node:path';
import extract from 'extract-zip';
import * as child from 'node:child_process';

function pickClient(urlStr: string) {
  const { protocol } = new URL(urlStr);
  return protocol === 'https:' ? https : http;
}

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

  function downloadWithRedirect(
    urlStr: string,
    filePath: string,
    onProgress: (pct: number) => void,
    maxRedirects = 5,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const win = getMainWindow();
      const client = pickClient(urlStr);

      const req = client.get(urlStr, (res) => {
        // Handle redirect
        if (
          res.statusCode &&
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          if (maxRedirects <= 0) {
            reject(new Error('Too many redirects'));
            return;
          }
          const nextUrl = new URL(res.headers.location, urlStr).toString();
          res.resume(); // drain
          downloadWithRedirect(nextUrl, filePath, onProgress, maxRedirects - 1)
            .then(resolve)
            .catch(reject);
          return;
        }

        if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`HTTP ${res.statusCode ?? 'ERR'} for ${urlStr}`));
          return;
        }

        const total = Number(res.headers['content-length'] || 0);
        let received = 0;

        const tmpPath = filePath + '.part';
        const out = fs.createWriteStream(tmpPath);

        res.on('data', (chunk) => {
          received += chunk.length;
          if (total) {
            const pct = Math.max(0, Math.min(100, Math.round((received / total) * 100)));
            onProgress(pct);
            // kirim ke UI juga (optional, sudah ada di onProgress di renderer)
            win?.webContents.send('download-progress', pct);
          }
        });

        res.pipe(out);

        out.on('finish', () => {
          out.close(() => {
            // rename .part → final
            try {
              fs.renameSync(tmpPath, filePath);
            } catch {
              // kalau rename gagal (lintas disk), copy fallback
              fs.copyFileSync(tmpPath, filePath);
              fs.unlinkSync(tmpPath);
            }
            onProgress(100);
            win?.webContents.send('download-progress', 100);
            resolve();
          });
        });

        res.on('error', (err) => {
          out.close(() => {
            try { fs.unlinkSync(tmpPath); } catch { }
            reject(err);
          });
        });

        out.on('error', (err) => {
          res.destroy();
          try { fs.unlinkSync(tmpPath); } catch { }
          reject(err);
        });
      });

      req.on('error', reject);
    });
  }

  // === Show Save Dialog handler (kalau belum ada) ===
  ipcMain.handle('show-save-dialog', async (_e, defaultName?: string) => {
    const res = await dialog.showSaveDialog(win!, {
      title: 'Save Installer',
      defaultPath: defaultName ?? 'installer',
      filters: [{ name: 'Installers', extensions: ['exe', 'dmg', 'zip'] }],
    });
    // kembalikan bentuk konsisten
    return { canceled: res.canceled, filePath: res.filePath };
  });

  ipcMain.handle('show-open-dir-dialog', async () => {
    const res = await dialog.showOpenDialog(win!, {
      title: 'Choose Install Folder',
      properties: ['openDirectory', 'createDirectory', 'promptToCreate'],
    });
    // bentuk konsisten dipakai di preload
    return { canceled: res.canceled, filePath: res.filePaths?.[0] };
  });

  // === Download-to-path handler ===
  ipcMain.handle('download-to-path', async (_evt, { url, filePath }: { url: string; filePath: string }) => {
    await downloadWithRedirect(url, filePath, (_pct) => {
      // progress ke UI sudah dikirim di dalam downloadWithRedirect
    });
    return { ok: true };
  });

  ipcMain.handle('download-and-extract-zip', async (_e, args: { url: string; destDir: string }) => {
    const { url, destDir } = args;
    const tmpZip = path.join(app.getPath('temp'), `pv-${Date.now()}.zip`);
    const proto = url.startsWith('https:') ? https : http;

    // 1) download zip -> tmp
    await new Promise<void>((resolve, reject) => {
      const req = proto.get(url, (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        const ws = fs.createWriteStream(tmpZip);
        res.pipe(ws);
        ws.on('finish', () => ws.close(() => resolve()));
        ws.on('error', reject);
      });
      req.on('error', reject);
    });

    // 2) extract ke destDir
    await extract(tmpZip, { dir: destDir });

    // 3) cleanup
    try { fs.unlinkSync(tmpZip); } catch { }

    return { ok: true };
  });

  function isExecutableFile(p: string) {
    try {
      const stat = fs.statSync(p);
      if (!stat.isFile()) return false;
      if (process.platform === 'win32') {
        return /\.exe$/i.test(p);
      }
      // mac/linux — minimal exist; permission bisa kita perbaiki saat launch
      return true;
    } catch {
      return false;
    }
  }

  function findLaunchable(dir: string): string | null {
    if (!fs.existsSync(dir)) return null;

    const entries = fs.readdirSync(dir);
    // Prioritas per OS
    if (process.platform === 'darwin') {
      // cari *.app
      const appBundle = entries.find((n) => n.toLowerCase().endsWith('.app'));
      if (appBundle) return path.join(dir, appBundle);
    }
    if (process.platform === 'win32') {
      // cari *.exe (skip tools)
      const exe = entries.find((n) => /\.exe$/i.test(n) && !/unins|uninstall/i.test(n));
      if (exe) return path.join(dir, exe);
    }

    // fallback: cari executable yg masuk akal di subdir juga (shallow)
    for (const name of entries) {
      const full = path.join(dir, name);
      try {
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          // recursive shallow
          const deeper = findLaunchable(full);
          if (deeper) return deeper;
        } else if (isExecutableFile(full)) {
          if (!/unins|uninstall/i.test(name)) return full;
        }
      } catch { }
    }
    return null;
  }

  ipcMain.handle('find-launchable-in-dir', async (_e, dirPath: string) => {
    const p = findLaunchable(dirPath);
    return { path: p ?? null };
  });

  ipcMain.handle('launch-app', async (_e, targetPath: string) => {
    try {
      if (process.platform === 'darwin') {
        // *.app bundle → open
        if (targetPath.toLowerCase().endsWith('.app')) {
          await shell.openPath(targetPath);
          return { ok: true };
        }
        // file biasa: coba buat executable lalu spawn
        try { fs.chmodSync(targetPath, 0o755); } catch { }
        child.spawn('open', [targetPath], { detached: true, stdio: 'ignore' }).unref();
        return { ok: true };
      }

      if (process.platform === 'win32') {
        // exe langsung spawn
        child.spawn(targetPath, [], { detached: true, stdio: 'ignore' }).unref();
        return { ok: true };
      }

      // linux: coba chmod + xdg-open / langsung spawn
      try { fs.chmodSync(targetPath, 0o755); } catch { }
      const opener = fs.existsSync('/usr/bin/xdg-open') ? 'xdg-open' : null;
      if (opener) {
        child.spawn(opener, [targetPath], { detached: true, stdio: 'ignore' }).unref();
      } else {
        child.spawn(targetPath, [], { detached: true, stdio: 'ignore' }).unref();
      }
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: String(e?.message || e) };
    }
  });


}
