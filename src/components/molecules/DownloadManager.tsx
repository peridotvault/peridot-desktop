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
import { upsertInstalledEntry } from '@shared/lib/utils/installedStorage';
import { open as openDialog, save as saveDialog } from '@tauri-apps/plugin-dialog';
// Gunakan tipe dari service.did.d
import type {
  PGCGame,
  NativeDistribution,
  Manifest,
  StorageRef,
  Distribution,
} from '@shared/blockchain/icp/types/game.types';

// Gunakan tipe yang sesuai dengan .did
type ResolvedBuild = {
  os: OSKey;
  version: string;
  fileName: string;
  url: string; // URL yang dihasilkan dari StorageRef dan VITE_API_BASE
  checksum?: string;
  sizeMB?: number;
  createdAt?: bigint;
};

// Definisikan QueueItem type
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

// Definisikan DownloadContextValue type
type DownloadContextValue = {
  queue: QueueItem[];
  openInstallModal: (app: PGCGame) => void;
  removeFromQueue: (id: string) => void;
  cancelActive: () => void;
};

// Definisikan tipe PickSuccess, PickError, PickResult di sini, di luar fungsi pickSaveTarget
type PickSuccess =
  | { kind: 'success'; filePath: string } // file path (non-zip)
  | { kind: 'success-dir'; dirPath: string } // directory (zip)
  | { kind: 'success-handle'; fileHandle: any }; // browser (optional)

type PickError = {
  kind: 'error';
  reason: 'no-native-picker' | 'not-secure-context' | 'user-cancel';
};
type PickResult = PickSuccess | PickError;

const DownloadContext = createContext<DownloadContextValue | null>(null);

export const useDownloadManager = () => {
  const ctx = useContext(DownloadContext);
  if (!ctx) throw new Error('useDownloadManager must be used within DownloadProvider');
  return ctx;
};

/* ========= Helpers ========= */
const isDesktopRuntime = () =>
  typeof window !== 'undefined' && Boolean((window as any).__TAURI__);
const isZip = (name: string) => name.toLowerCase().endsWith('.zip');

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

// Konversi tipe OS dari string ke OSKey
const osKeyFromString = (osString: string): OSKey => {
  const lowerOs = osString.toLowerCase();
  if (lowerOs.includes('windows') || lowerOs === 'win') return 'windows';
  if (lowerOs.includes('mac') || lowerOs.includes('darwin') || lowerOs === 'macos') return 'macos';
  if (lowerOs.includes('linux') || lowerOs === 'lin') return 'linux';
  // Fallback jika tidak dikenal
  console.warn('Unknown OS string in NativeBuildDid:', osString);
  return 'linux'; // atau nilai default lain
};

/* ========= Resolve manifest (baru) -> file URL ========= */
// Fungsi baru untuk mengekstrak path relatif dari StorageRef yang bisa digunakan oleh API backend
function extractPathFromStorageRef(storageRef: StorageRef): string | null {
  // Kita asumsikan API backend Anda menangani path ini relatif terhadap /files/
  if ('url' in storageRef && storageRef.url.url) {
    // Jika menggunakan URL langsung, mungkin perlu logika khusus atau tidak didukung untuk download
    // Untuk sekarang, kita fokus ke S3/IPFS
    console.warn(
      'DownloadManager: Using direct URL for download is not standard for backend proxying.',
      storageRef.url.url,
    );
    return null; // Atau proses URL untuk dijadikan path jika formatnya konsisten
  }
  if ('s3' in storageRef && storageRef.s3.bucket && storageRef.s3.basePath) {
    // Format yang diharapkan oleh API backend: /files/{basePath}
    // Contoh: basePath = "icp/apps/31DBAB8Q/builds/macos/0.0.1/nama_file.zip"
    // API Anda di VITE_API_BASE/files/icp/apps/... akan menanganinya
    // Gabungkan basePath dan listing (nama file) dari manifest
    // Dalam output console, listing adalah nama file: "31DBAB8Q-macos-v0.0.1-2025-10-08T00-44-03-177Z.zip"
    // StorageRef basePath: "icp/apps/31DBAB8Q/builds/macos/0.0.1/"
    // Path final: "icp/apps/31DBAB8Q/builds/macos/0.0.1/31DBAB8Q-macos-v0.0.1-2025-10-08T00-44-03-177Z.zip"
    // Kita asumsikan listing adalah nama file yang valid
    return storageRef.s3.basePath; // Kita kembalikan basePath, dan nanti di resolveManifest kita tambahkan listing
    // Atau, jika listing adalah path lengkap, kembalikan listing
    // Untuk kasus Anda, sepertinya listing adalah nama file, jadi gabungkan basePath dan listing
  }
  if ('ipfs' in storageRef && storageRef.ipfs.cid) {
    // Format yang diharapkan oleh API backend untuk IPFS (jika didukung): /files/ipfs/{cid}/{path}
    // Contoh: API Anda menangani /files/ipfs/Qm.../file.zip
    const pathPart = storageRef.ipfs.path?.[0] ? `/${storageRef.ipfs.path[0]}` : '';
    return `ipfs/${storageRef.ipfs.cid}${pathPart}`;
  }
  return null;
}

async function resolveManifest(manifest: Manifest, os: OSKey): Promise<ResolvedBuild | null> {
  const storageRef = manifest.storage ?? manifest.storageRef;
  if (!storageRef) {
    console.warn('[DM] Manifest missing storage reference', manifest);
    return null;
  }

  const basePath = extractPathFromStorageRef(storageRef);
  if (!basePath) {
    console.warn('[DM] Cannot resolve basePath from storageRef', storageRef);
    return null;
  }

  // Ambil base URL dari environment variable
  const base = import.meta.env.VITE_API_BASE;
  if (!base) {
    console.error('VITE_API_BASE is not set in environment variables.');
    return null;
  }

  // Gabungkan basePath dari StorageRef dan listing dari Manifest untuk membentuk path lengkap
  // listing dalam output console: "31DBAB8Q-macos-v0.0.1-2025-10-08T00-44-03-177Z.zip"
  // basePath dalam output console: "icp/apps/31DBAB8Q/builds/macos/0.0.1/"
  // Path final: "icp/apps/31DBAB8Q/builds/macos/0.0.1/31DBAB8Q-macos-v0.0.1-2025-10-08T00-44-03-177Z.zip"
  const listing = (manifest.listing ?? '').trim();
  const fullFilePath = `${basePath}${listing}`.replace('//', '/'); // Pastikan tidak ada // ganda

  // Bangun URL final menggunakan base API dan path dari StorageRef + listing
  const url = `${base}/files/${fullFilePath}`;

  // Ambil fileName dari listing (atau gunakan listing langsung)
  const fileName = listing || basePath.split('/').filter(Boolean).pop() || 'build.bin';

  const checksumValue = (() => {
    const raw = manifest.checksum;
    if (typeof raw === 'string') return raw;
    const arr = raw instanceof Uint8Array ? Array.from(raw) : Array.isArray(raw) ? raw : [];
    return arr.map((b) => b.toString(16).padStart(2, '0')).join('');
  })();

  const sizeBytes = manifest.sizeBytes ?? manifest.size_bytes;

  return {
    os,
    version: manifest.version,
    fileName,
    url, // <-- URL yang akan digunakan untuk download
    checksum: checksumValue || undefined,
    sizeMB: sizeBytes ? Number(sizeBytes) / (1024 * 1024) : undefined,
    createdAt:
      manifest.createdAt === undefined
        ? undefined
        : typeof manifest.createdAt === 'bigint'
          ? manifest.createdAt
          : BigInt(manifest.createdAt),
  };
}

async function resolveFromApp(app: PGCGame): Promise<ResolvedBuild[]> {
  const out: ResolvedBuild[] = [];

  // Ambil distribusi dari PGLMeta (baru)
  // Karena struktur saat ini adalah Array<Array<Distribution>>, kita perlu menyesuaikan
  const distributions: Distribution[] = Array.isArray(app.distribution) ? app.distribution : [];

  for (const dist of distributions) {
    if ('native' in dist) {
      const nb: NativeDistribution = dist.native;
      const osk = osKeyFromString(nb.os);
      const manifests = nb.manifests ?? [];
      console.log('[DM] native OS =', osk, 'manifests len =', manifests.length);

      for (const mf of manifests) {
        const r = await resolveManifest(mf as Manifest, osk);
        if (r) out.push(r);
      }
    }
    // TODO: support direct web builds when download flow is ready.
  }

  // sort newest (by createdAt, then by version string)
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
// Definisi PickSuccess, PickError, PickResult sudah dipindah ke atas
// Fungsi pickSaveTarget sekarang bisa menggunakan tipe yang sudah didefinisikan di atas
async function pickSaveTarget(defaultName: string, mode: 'file' | 'dir'): Promise<PickResult> {
  if (isDesktopRuntime()) {
    try {
      if (mode === 'dir') {
        const dir = (await openDialog({
          directory: true,
          multiple: false,
        })) as string | string[] | null;
        if (typeof dir === 'string') return { kind: 'success-dir', dirPath: dir };
        if (Array.isArray(dir) && dir.length > 0 && typeof dir[0] === 'string') {
          return { kind: 'success-dir', dirPath: dir[0] as string };
        }
        return { kind: 'error', reason: 'user-cancel' };
      } else {
        const filePath = await saveDialog({ defaultPath: defaultName });
        if (typeof filePath === 'string') {
          return { kind: 'success', filePath };
        }
        return { kind: 'error', reason: 'user-cancel' };
      }
    } catch (error) {
      console.error('Failed to open native dialog', error);
      return { kind: 'error', reason: 'user-cancel' };
    }
  }

  // Browser FS Access (secure context only)
  // @ts-ignore
  const hasPicker = typeof window.showSaveFilePicker === 'function';
  const secure = window.isSecureContext === true;
  if (!hasPicker) return { kind: 'error', reason: 'no-native-picker' };
  if (!secure) return { kind: 'error', reason: 'not-secure-context' };

  try {
    // @ts-ignore
    const h = await window.showSaveFilePicker({
      suggestedName: defaultName,
      types: [{ description: 'Installer', accept: { '*/*': ['.exe', '.dmg', '.zip'] } }],
    });
    // Perbaiki baris ini: seharusnya mengembalikan handle, bukan error
    return { kind: 'success-handle', fileHandle: h };
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
    console.log('[DownloadManager] running in desktop runtime:', isDesktopRuntime());
  }, []);

  /** buka modal dari halaman game */
  const openInstallModal = useCallback(async (app: PGCGame) => {
    const appIdStr = app.gameId;
    const cover =
      app.coverVerticalImage ??
      app.coverHorizontalImage ??
      app.bannerImage ??
      app.metadata?.cover_vertical_image ??
      app.metadata?.cover_horizontal_image ??
      app.metadata?.banner_image;

    const builds = await resolveFromApp(app);
    const latestBuilds = latestPerOS(builds);
    const osPref = detectOS();
    const first = latestBuilds.find((b) => b.os === osPref) || latestBuilds[0];

    setModalMeta({ appId: appIdStr, title: app.name, cover });
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
                  : picked.reason === 'no-native-picker'
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

        // --- VERIFIKASI AWAL ---
        // Pastikan targetPath atau installDir telah ditentukan sebelum melanjutkan
        if (zip && !installDir) {
          throw new Error('Installation directory is missing after picking.');
        }
        if (!zip && !targetPath && !fileHandle) {
          throw new Error('Target file path or handle is missing after picking.');
        }
        // --- AKHIR VERIFIKASI AWAL ---

        let launchPath: string | undefined = undefined; // Inisialisasi sebagai undefined

        if (zip) {
          if (!installDir) {
            // Jika installDir tidak ada, seharusnya tidak sampai sini karena sudah diverifikasi di atas
            throw new Error('Installation directory is required for zip files.');
          }
          console.warn(
            '[DownloadManager] Automatic executable detection is not available in this runtime.',
          );
        } else {
          // non-zip: kalau file akhir jelas bisa dieksekusi (exe/app/appimage), jadikan launchPath
          const lower = (targetPath || '').toLowerCase();
          if (lower.endsWith('.exe') || lower.endsWith('.app') || lower.endsWith('.appimage')) {
            launchPath = targetPath!;
            console.log(`[DM] Launchable file path set: ${launchPath}`);
          } else {
            // Jika bukan file eksekutabel, kita tidak bisa meluncurkan langsung.
            // Tapi kita bisa menyimpan filePath agar bisa dibuka di folder.
            // Tidak error, hanya set launchPath ke filePath jika targetPath ada.
            if (targetPath) {
              launchPath = targetPath; // Opsional: bisa diubah sesuai kebutuhan, misalnya ke folder
              console.log(
                `[DM] Non-executable file path set for potential folder launch: ${launchPath}`,
              );
            } else if (fileHandle) {
              // Jika menggunakan fileHandle web, kita tidak bisa set launchPath langsung.
              console.warn(
                `[DM] Cannot determine launch path for web file handle: ${next.build.fileName}. Launch path will be undefined.`,
              );
              // launchPath tetap undefined
            }
          }
        }

        // --- SIMPAN KE LOCAL STORAGE JIKA LANGKAH-LANGKAH SEBELUMNYA SELESAI ---
        // selesai → tandai installed
        const sizeBytes = next.build.sizeMB
          ? Math.round(next.build.sizeMB * 1024 * 1024)
          : undefined;

        upsertInstalledEntry(
          next.appId,
          {
            version: next.build.version,
            os: next.build.os,
            filePath: zip ? undefined : targetPath, // filePath hanya untuk non-zip
            installDir: zip ? installDir : undefined, // installDir hanya untuk zip
            launchPath, // launchPath bisa undefined jika tidak ditemukan
            fileName: next.build.fileName,
            sizeBytes,
            checksum: next.build.checksum,
            checksumVerified: !!next.build.checksum,
            installedAt: Date.now(),
          },
          { title: next.appTitle, cover: next.cover },
        );
        // --- AKHIR SIMPAN ---

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
    // Gunakan tipe PickSuccess yang sudah didefinisikan di atas
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

        const picked = await pickSaveTarget(suggested, zip ? 'dir' : 'file');
        if (picked.kind === 'error') {
          if (picked.reason !== 'user-cancel') {
            alert('File picker tidak tersedia di lingkungan ini.');
          }
          return;
        }
        setTarget(picked);
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
