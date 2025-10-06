// src/download/DownloadManager.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { OSKey } from '../../interfaces/CoreInterface';
import { Distribution, ManifestInterface, NativeBuild } from '../../interfaces/app/AppInterface';
import { upsertInstalledEntry } from '../../utils/installedStorage';
import { PGLMeta } from '../../blockchain/icp/vault/service.did.d';

type ResolvedBuild = {
  os: OSKey;
  version: string;
  fileName: string;
  url: string;
  checksum?: string;
  sizeMB?: number;
  createdAt?: bigint;
};

type QueueItem = {
  id: string;
  appId: string;
  appTitle: string;
  cover?: string;
  build: ResolvedBuild;
  targetPath?: string; // Electron save path
  fileHandle?: any; // FileSystemFileHandle (web)
  installDir?: string;
  progress: number; // 0..100
  status: 'queued' | 'active' | 'done' | 'error' | 'canceled';
  errorMsg?: string;
};

type DownloadContextValue = {
  queue: QueueItem[];
  openInstallModal: (app: PGLMeta) => void;
  removeFromQueue: (id: string) => void;
  cancelActive: () => void;
};

const DownloadContext = createContext<DownloadContextValue | null>(null);

export const useDownloadManager = () => {
  const ctx = useContext(DownloadContext);
  if (!ctx) throw new Error('useDownloadManager must be used within DownloadProvider');
  return ctx;
};

/* ========= Helpers ========= */
const isElectron = () => {
  const w = window as any;
  return !!w?.electronAPI?.showSaveDialog || !!(window as any).process?.versions?.electron;
};
const isZip = (name: string) => name.toLowerCase().endsWith('.zip');

function unwrapOptVec<T>(v: any): T[] {
  // Motoko ?[T] sering datang sebagai [ [ ... ] ]
  if (!v) return [];
  if (Array.isArray(v) && v.length === 1 && Array.isArray(v[0])) return v[0] as T[];
  return v as T[];
}

function latestPerOS(builds: ResolvedBuild[]): ResolvedBuild[] {
  // asumsikan builds sudah di-sort desc (terbaru duluan)
  const seen = new Set<OSKey>();
  const out: ResolvedBuild[] = [];
  for (const b of builds) {
    if (!seen.has(b.os)) {
      out.push(b);
      seen.add(b.os);
    }
  }
  return out;
}

const detectOS = (): OSKey => {
  const p = (navigator.platform || '').toLowerCase();
  const ua = (navigator.userAgent || '').toLowerCase();
  if (p.includes('win') || ua.includes('windows')) return 'windows';
  if (p.includes('mac') || ua.includes('mac') || ua.includes('darwin')) return 'macos';
  return 'linux';
};
const osKeyFromNative = (n: NativeBuild): OSKey =>
  (n.os as any).windows !== undefined
    ? 'windows'
    : (n.os as any).macos !== undefined
      ? 'macos'
      : 'linux';

/* ========= Resolve manifest -> file URL ========= */
async function resolveManifest(
  manifest: ManifestInterface,
  os: OSKey,
): Promise<ResolvedBuild | null> {
  const base = (import.meta as any).env?.VITE_API_BASE || '';
  const contentKey = `${manifest.basePath}${manifest.content}`; // …/1.0.0/content.json
  const contentUrl = `${base}/files/${contentKey}`;

  try {
    const res = await fetch(contentUrl);
    if (!res.ok) {
      console.warn('[DM] content.json fetch failed', res.status, contentUrl);
      return null;
    }
    const json = await res.json();
    const artifact = json?.artifact as string | undefined;
    if (!artifact) {
      console.warn('[DM] content.json missing "artifact"', json);
      return null;
    }
    const fileKey = `${manifest.basePath}${artifact}`;
    const fileUrl = `${base}/files/${fileKey}`;
    return {
      os,
      version: manifest.version,
      fileName: artifact,
      url: fileUrl,
      checksum: manifest.checksum,
      sizeMB: manifest.size,
      createdAt: manifest.createdAt,
    };
  } catch (e) {
    console.error('[DM] resolveManifest error', e, { contentUrl, manifest });
    return null;
  }
}

async function resolveFromApp(app: PGLMeta): Promise<ResolvedBuild[]> {
  const out: ResolvedBuild[] = [];

  // ⬇️ penting: unwrap opsional vector
  const dists = unwrapOptVec<Distribution>((app as any).distributions);

  console.log('[DM] resolveFromApp distributions len =', dists.length, dists);

  for (const d of dists) {
    if ('native' in d) {
      const nb = d.native;
      const osk = osKeyFromNative(nb);

      const manifests = unwrapOptVec<ManifestInterface>((nb as any).manifests);
      console.log('[DM] native OS =', osk, 'manifests len =', manifests.length);

      for (const mf of manifests) {
        const r = await resolveManifest(mf, osk);
        if (r) out.push(r);
      }
    }
  }

  // sort newest
  out.sort((a, b) => {
    const ta = a.createdAt ? Number(a.createdAt) : 0;
    const tb = b.createdAt ? Number(b.createdAt) : 0;
    if (tb !== ta) return tb - ta;
    return (b.version || '').localeCompare(a.version || '', undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  });

  console.log('[DM] resolveFromApp builds len =', out.length, out);
  return out;
}

/* ========= File pickers abstraction ========= */
type PickSuccess =
  | { kind: 'success'; filePath: string } // file path (non-zip)
  | { kind: 'success-dir'; dirPath: string } // directory (zip)
  | { kind: 'success-handle'; fileHandle: any }; // browser (optional)

type PickError = {
  kind: 'error';
  reason: 'no-electron-and-no-fsaccess' | 'not-secure-context' | 'user-cancel';
};
type PickResult = PickSuccess | PickError;

async function pickSaveTarget(defaultName: string, mode: 'file' | 'dir'): Promise<PickResult> {
  const api = (window as any).electronAPI;

  // Electron
  if (api?.showSaveDialog && api?.showOpenDirDialog) {
    try {
      if (mode === 'dir') {
        const raw = await api.showOpenDirDialog();
        if (raw?.canceled) return { kind: 'error', reason: 'user-cancel' };
        if (raw?.filePath) return { kind: 'success-dir', dirPath: raw.filePath };
        return { kind: 'error', reason: 'user-cancel' };
      } else {
        const raw = await api.showSaveDialog(defaultName);
        if (raw?.canceled) return { kind: 'error', reason: 'user-cancel' };
        if (raw?.filePath) return { kind: 'success', filePath: raw.filePath };
        return { kind: 'error', reason: 'user-cancel' };
      }
    } catch {
      return { kind: 'error', reason: 'user-cancel' };
    }
  }

  // Browser FS Access (secure context only)
  // @ts-ignore
  const hasPicker = typeof window.showSaveFilePicker === 'function';
  const secure = window.isSecureContext === true;
  if (!hasPicker) return { kind: 'error', reason: 'no-electron-and-no-fsaccess' };
  if (!secure) return { kind: 'error', reason: 'not-secure-context' };

  try {
    // @ts-ignore
    const h = await window.showSaveFilePicker({
      suggestedName: defaultName,
      types: [{ description: 'Installer', accept: { '*/*': ['.exe', '.dmg', '.zip'] } }],
    });
    return { kind: 'error', reason: 'no-electron-and-no-fsaccess' };
  } catch {
    return { kind: 'error', reason: 'user-cancel' };
  }
}

/* ========= Provider + Modal ========= */
export const DownloadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [show, setShow] = useState(false);
  const [resolves, setResolves] = useState<ResolvedBuild[]>([]);
  const [selectedBuild, setSelectedBuild] = useState<ResolvedBuild | null>(null);
  const [working, setWorking] = useState(false);
  const currentIdRef = useRef<string | null>(null);
  const [modalMeta, setModalMeta] = useState<{ appId: string; title: string; cover?: string }>({
    appId: '',
    title: '',
    cover: undefined,
  });

  useEffect(() => {
    console.log('[DownloadManager] isElectron:', isElectron());
    console.log(
      '[DownloadManager] electronAPI keys:',
      Object.keys((window as any).electronAPI || {}),
    );
  }, []);

  /** buka modal dari halaman game */
  const openInstallModal = useCallback(async (app: PGLMeta) => {
    const builds = await resolveFromApp(app);
    const latestBuilds = latestPerOS(builds);
    const osPref = detectOS();
    const first = latestBuilds.find((b) => b.os === osPref) || latestBuilds[0];

    const appIdStr =
      typeof (app as any).appId === 'bigint'
        ? (app as any).appId.toString()
        : String((app as any).appId);

    const coverRaw = (app as any).coverImage;
    const cover =
      Array.isArray(coverRaw) && coverRaw.length > 0
        ? coverRaw[0]
        : (coverRaw as string | undefined);

    setModalMeta({ appId: appIdStr, title: app.pgl1_name, cover });
    setResolves(latestBuilds); // ⬅️ gunakan latestBuilds
    setSelectedBuild(first || null); // ⬅️ preselect latest utk OS user
    setShow(true);
  }, []);

  /** tambahkan ke queue */
  const enqueue = useCallback(
    (
      appId: string,
      appTitle: string,
      cover: string | undefined,
      build: ResolvedBuild,
      targetPath?: string,
      fileHandle?: any,
      installDir?: string, // <— baru
    ) => {
      const id = `${appId}-${build.os}-${build.version}-${Date.now()}`;
      const q: QueueItem = {
        id,
        appId,
        appTitle,
        cover,
        build,
        targetPath,
        fileHandle,
        installDir, // <—
        progress: 0,
        status: 'queued',
      };
      setQueue((prev) => [...prev, q]);
    },
    [],
  );

  /** proses queue sekuensial */
  useEffect(() => {
    const run = async () => {
      if (working) return;
      const next = queue.find((q) => q.status === 'queued');
      if (!next) return;

      setWorking(true);
      currentIdRef.current = next.id;

      setQueue((prev) =>
        prev.map((q) => (q.id === next.id ? { ...q, status: 'active', progress: 0 } : q)),
      );

      try {
        const zip = isZip(next.build.fileName);

        // pastikan target
        let { targetPath, fileHandle, installDir } = next;

        if (zip) {
          // butuh folder
          if (!installDir) {
            const picked = await pickSaveTarget('Install Folder', 'dir');
            if (picked.kind !== 'success-dir') throw new Error('Install folder is required.');
            installDir = picked.dirPath;
            setQueue((prev) => prev.map((q) => (q.id === next.id ? { ...q, installDir } : q)));
          }
        } else {
          // butuh file
          if (!targetPath && !fileHandle) {
            const picked = await pickSaveTarget(next.build.fileName, 'file');
            if (picked.kind === 'error') {
              throw new Error(
                picked.reason === 'not-secure-context'
                  ? 'Secure context diperlukan (https/localhost).'
                  : picked.reason === 'no-electron-and-no-fsaccess'
                    ? 'Browser tidak mendukung pemilihan lokasi.'
                    : 'Save canceled',
              );
            }
            if (picked.kind === 'success') targetPath = picked.filePath;
            if (picked.kind === 'success-handle') fileHandle = picked.fileHandle;

            setQueue((prev) =>
              prev.map((q) => (q.id === next.id ? { ...q, targetPath, fileHandle } : q)),
            );
          }
        }

        let launchPath: string | undefined;

        if (zip) {
          // cari executable di installDir (Electron)
          if ((window as any).electronAPI?.findLaunchableInDir && installDir) {
            const res = await (window as any).electronAPI.findLaunchableInDir(installDir);
            if (res?.path) launchPath = res.path;
          }
        } else {
          // non-zip: kalau file akhir jelas bisa dieksekusi (exe/app/appimage), jadikan launchPath
          const lower = (targetPath || '').toLowerCase();
          if (lower.endsWith('.exe') || lower.endsWith('.app') || lower.endsWith('.appimage')) {
            launchPath = targetPath!;
          }
        }

        // selesai → tandai installed
        const sizeBytes = next.build.sizeMB
          ? Math.round(next.build.sizeMB * 1024 * 1024)
          : undefined;

        upsertInstalledEntry(
          next.appId,
          {
            version: next.build.version,
            os: next.build.os,
            filePath: zip ? undefined : targetPath,
            installDir: zip ? installDir : undefined,
            launchPath, // ⬅️ simpan path yang bisa di-launch
            fileName: next.build.fileName,
            sizeBytes,
            checksum: next.build.checksum,
            checksumVerified: !!next.build.checksum,
            installedAt: Date.now(),
          },
          { title: next.appTitle, cover: next.cover },
        );

        setQueue((prev) =>
          prev.map((q) => (q.id === next.id ? { ...q, progress: 100, status: 'done' } : q)),
        );
      } catch (e: any) {
        console.error(e);
        setQueue((prev) =>
          prev.map((q) =>
            q.id === next.id ? { ...q, status: 'error', errorMsg: String(e?.message || e) } : q,
          ),
        );
      } finally {
        setWorking(false);
        currentIdRef.current = null;
      }
    };
    run();
  }, [queue, working]);

  const removeFromQueue = useCallback((id: string) => {
    setQueue((prev) => prev.filter((q) => q.id !== id));
  }, []);

  const cancelActive = useCallback(() => {
    const id = currentIdRef.current;
    if (id) setQueue((prev) => prev.map((q) => (q.id === id ? { ...q, status: 'canceled' } : q)));
  }, []);

  const ctxValue = useMemo<DownloadContextValue>(
    () => ({
      queue,
      openInstallModal,
      removeFromQueue,
      cancelActive,
    }),
    [queue, openInstallModal, removeFromQueue, cancelActive],
  );

  /* ========= Modal UI ========= */
  const Modal: React.FC = () => {
    const [picking, setPicking] = useState(false);
    const [target, setTarget] = useState<PickSuccess | null>(null);

    if (!show) return null;

    const buildsByOS: Record<OSKey, ResolvedBuild[]> = { windows: [], macos: [], linux: [] };
    resolves.forEach((b) => buildsByOS[b.os].push(b));
    (Object.keys(buildsByOS) as OSKey[]).forEach((k) =>
      buildsByOS[k].sort((a, b) =>
        b.version.localeCompare(a.version, undefined, { numeric: true }),
      ),
    );

    const pickSave = async () => {
      setPicking(true);
      try {
        const suggested = selectedBuild?.fileName || 'installer';
        const zip = isZip(suggested);

        if (zip) {
          // ZIP → pilih FOLDER install
          if (!(window as any).electronAPI?.showOpenDirDialog) {
            return;
          }
          const res = await window.electronAPI!.showOpenDirDialog!();
          if (res.canceled || !res.filePath) {
            return;
          }
          setTarget({ kind: 'success-dir', dirPath: res.filePath });
        } else {
          // Non-ZIP → pilih FILE lokasi simpan
          const res = await window.electronAPI!.showSaveDialog(suggested);
          if (res.canceled || !res.filePath) {
            return;
          }
          setTarget({ kind: 'success', filePath: res.filePath });
        }
      } finally {
        setPicking(false);
      }
    };

    useEffect(() => {
      if (show) {
        console.log('[DM] modal open. selectedBuild=', selectedBuild);
        console.log('[DM] resolves len=', resolves.length);
      }
    }, [show, selectedBuild, resolves.length]);

    const confirm = () => {
      if (!selectedBuild || !modalMeta.appId || !modalMeta.title) return;

      const installDir = (target as any)?.dirPath as string | undefined;
      const filePath = (target as any)?.filePath as string | undefined;
      const fileHandle = (target as any)?.fileHandle;

      enqueue(
        modalMeta.appId,
        modalMeta.title,
        modalMeta.cover,
        selectedBuild,
        // untuk non-zip: filePath
        filePath,
        // handle web (optional)
        fileHandle,
        // untuk zip: dir
        installDir,
      );

      setShow(false);
      setTarget(null);
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-background_primary p-6 shadow-arise-sm">
          <div className="flex items-start justify-between">
            <h3 className="text-xl font-semibold">Install</h3>
            <button onClick={() => setShow(false)} className="opacity-70 hover:opacity-100">
              ✕
            </button>
          </div>

          {/* Pilih OS */}
          <div className="mt-4 flex flex-wrap gap-2">
            {(['windows', 'macos', 'linux'] as OSKey[]).map((k) => (
              <button
                key={k}
                onClick={() => setSelectedBuild(buildsByOS[k][0] || null)}
                disabled={!buildsByOS[k].length}
                className={`px-3 py-1 rounded border text-sm ${selectedBuild?.os === k ? 'border-white/40' : 'border-white/15 hover:border-white/30'} ${!buildsByOS[k].length ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                {k === 'macos' ? 'macOS' : k[0].toUpperCase() + k.slice(1)}
              </button>
            ))}
          </div>

          {/* Versi */}
          <div className="mt-3">
            <label className="text-sm opacity-70">Version</label>
            <div className="mt-2 text-sm">
              {selectedBuild ? (
                <span className="px-2 py-1 rounded border border-white/15">
                  Latest v{selectedBuild.version}
                </span>
              ) : (
                <span className="opacity-70">No builds</span>
              )}
            </div>
          </div>

          {/* Info file */}
          {selectedBuild && (
            <div className="mt-4 text-sm">
              <div>
                <span className="opacity-60">File:</span> {selectedBuild.fileName}
              </div>
              {selectedBuild.sizeMB ? (
                <div className="opacity-60">Size: {selectedBuild.sizeMB.toFixed(1)} MB</div>
              ) : null}
              {selectedBuild.checksum ? (
                <div className="opacity-60 break-all">SHA-256: {selectedBuild.checksum}</div>
              ) : null}
            </div>
          )}

          {/* Path picker */}
          <div className="mt-4">
            <button
              onClick={pickSave}
              className="px-3 py-2 rounded-md border border-white/15 hover:border-white/30 text-sm"
              disabled={picking}
            >
              {picking
                ? 'Opening…'
                : isZip(selectedBuild?.fileName || '')
                  ? 'Choose Install Folder'
                  : 'Choose Download Location'}
            </button>
            <div className="mt-2 text-xs">
              {'dirPath' in (target || {}) ? (
                <span className="opacity-70">Install to: {(target as any).dirPath}</span>
              ) : 'filePath' in (target || {}) ? (
                <span className="opacity-70">Path: {(target as any).filePath}</span>
              ) : 'fileHandle' in (target || {}) ? (
                <span className="opacity-70">Handle ready (browser)</span>
              ) : (
                <span className="opacity-60">No location selected</span>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setShow(false)}
              className="px-3 py-2 rounded-md border border-white/15 hover:border-white/30 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={confirm}
              disabled={
                !selectedBuild ||
                (isZip(selectedBuild.fileName)
                  ? !(target as any)?.dirPath // zip: butuh dirPath
                  : !(target as any)?.filePath && !(target as any)?.fileHandle) // non-zip: butuh filePath/handle
              }
              className="px-4 py-2 rounded-md shadow-flat-sm border border-white/15"
            >
              Add to Queue
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DownloadContext.Provider value={ctxValue}>
      {children}
      <Modal />
      {/* Mini queue overlay */}
      <div className="fixed right-4 bottom-4 z-40 w-80 space-y-2">
        {queue.slice(-3).map((q) => (
          <div
            key={q.id}
            className="rounded-xl border border-white/10 bg-background_primary/80 backdrop-blur p-3"
          >
            <div className="text-xs opacity-70 mb-1">
              {q.appTitle} · {q.build.os} v{q.build.version}
            </div>
            <div className="w-full h-2 rounded bg-white/10 overflow-hidden">
              <div className="h-full bg-white/60" style={{ width: `${q.progress}%` }} />
            </div>
            <div className="mt-1 text-xs opacity-70">
              {q.status}
              {q.errorMsg ? `: ${q.errorMsg}` : ''}
            </div>
          </div>
        ))}
      </div>
    </DownloadContext.Provider>
  );
};
