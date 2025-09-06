import { initAppStorage, InitResp, safeFileName, uploadToPrefix } from '../../api/wasabiClient';
import { updateApp } from '../../blockchain/icp/app/services/ICPAppService';
import { MediaItem } from '../../components/organisms/CarouselPreview';
import { Option } from '../../interfaces/Additional';
import {
  AppInterface,
  AppStatus,
  Distribution,
  HydratedAppInterface,
  ManifestInterface,
  OS,
  Preview,
  UpdateAppInterface,
} from '../../interfaces/app/AppInterface';
import { OSKey, ToOpt, toOptVec } from '../../interfaces/CoreInterface';
import { hasDist, nowNs, nsToDateStr } from '../../utils/Additional';

function osKeyFromOS(os: OS): OSKey {
  if ((os as any).windows !== undefined) return 'windows';
  if ((os as any).macos !== undefined) return 'macos';
  return 'linux';
}
type BuildPrefixKey = 'builds/windows' | 'builds/macos' | 'builds/linux';
function extLooksVideo(u: string) {
  return /(\.mp4|\.webm|\.mov|video\=)/i.test(u);
}

function unwrapOpt<T>(o: any): T | undefined {
  // Candid Option ↔︎ [] | [T]
  return Array.isArray(o) ? (o.length ? o[0] : undefined) : o;
}

export async function sha256File(file: File): Promise<string> {
  // kalau sudah ada sha256Hex util, pakai itu; ini hanya placeholder
  const buf = await file.arrayBuffer();
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

const mapStatusToBackend = (code: 'publish' | 'notPublish'): AppStatus =>
  code === 'publish' ? ({ publish: null } as any) : ({ notPublish: null } as any);

const previewsFromMedia = (items: MediaItem[]): Preview[] =>
  items
    .map((it) => {
      const url = (it as any).src ?? (it as any).url ?? '';
      if (!url || typeof url !== 'string') return null;
      return {
        kind: it.kind === 'video' ? ({ video: null } as const) : ({ image: null } as const),
        url,
      };
    })
    .filter(Boolean) as Preview[];

export type UploadBuildOptions = {
  uploadArtifact?: boolean; // default: false
  inferContentType?: boolean; // default: true
  validateSemver?: boolean; // default: false (aktifkan kalau mau paksa semver)
};

const toWireFromUI = (ui: {
  title: string;
  description: string;
  bannerImage?: string;
  coverImage?: string;
  previews?: Preview[];
  price?: bigint;
  requiredAge?: bigint;
  releaseDate?: bigint; // ns
  status: AppStatus;
  category?: string[];
  appTags?: string[];
  distributions?: Distribution[];
}): UpdateAppInterface => ({
  title: ui.title,
  description: ui.description,
  status: ui.status,
  bannerImage: ToOpt(ui.bannerImage),
  coverImage: ToOpt(ui.coverImage),
  previews: toOptVec(ui.previews),
  price: ui.price !== undefined ? ToOpt(ui.price) : [],
  requiredAge: ui.requiredAge !== undefined ? ToOpt(ui.requiredAge) : [],
  releaseDate: ui.releaseDate !== undefined ? ToOpt(ui.releaseDate) : [],
  category: toOptVec(ui.category), // ✅
  appTags: toOptVec(ui.appTags), // ✅
  distributions: toOptVec(ui.distributions), // ✅
});

export type SubmitForm = {
  // general
  title: string;
  description: string;
  bannerImage?: string;
  coverImage: string;
  priceStr?: string; // string angka
  requiredAgeStr?: string; // string angka
  releaseDateNs?: bigint; // sudah di-convert di page (pakai dateStrToNs)
  statusCode: 'publish' | 'notPublish';
  selectedCategories: Option[];
  appTags: string[];
  // previews
  previewItems: MediaItem[];
  // distributions
  selectedDistribution: Option[];
  manifestsByOS: Record<OSKey, ManifestInterface[]>;
  webUrl: string;
  // hardware shared (dibagi ke tiap OS yang dipilih)
  processor: string;
  memoryStr: string; // string angka
  storageStr: string; // string angka
  graphics: string;
  notes: string;
};

/** ------------------ Class Service ------------------ */
export class EditAppService {
  private wallet: any;
  private appId: string | number;
  private storage: InitResp | null = null;

  constructor({ wallet, appId }: { wallet: any; appId: string | number }) {
    this.wallet = wallet;
    this.appId = appId;
  }

  public async prepareStorage(): Promise<InitResp> {
    if (this.storage) return this.storage;
    if (!this.wallet || !this.appId) throw new Error('Wallet atau AppId tidak tersedia.');
    const resp = await initAppStorage(this.appId.toString());
    this.storage = resp;
    return resp;
  }

  private async ensureStorage(): Promise<InitResp> {
    return this.storage ?? (await this.prepareStorage());
  }

  /** ======================
   *  HELPERS
   *  ====================== */
  private static isSemver(v: string) {
    return /^[0-9]+(?:\.[0-9]+){1,2}(-[0-9A-Za-z.-]+)?$/.test(v); // 1.2 / 1.2.3 / 1.2.3-beta
  }

  /** ------------------ Hydration ------------------ */
  hydrateFromApp(a: AppInterface, categoryOptions: Option[]): HydratedAppInterface {
    const banner = unwrapOpt<string>((a as any).bannerImage);
    const cover = unwrapOpt<string>((a as any).coverImage);
    const prevs = unwrapOpt<Preview[]>((a as any).previews) ?? [];
    const cats = unwrapOpt<string[]>((a as any).category) ?? [];
    const tags = unwrapOpt<string[]>((a as any).appTags) ?? [];
    const dists = unwrapOpt<Distribution[]>((a as any).distributions) ?? [];
    const relNs = unwrapOpt<bigint>((a as any).releaseDate);

    const st = (a.status || {}) as any;
    const statusCode = st.publish !== undefined ? 'publish' : 'notPublish';

    const selectedCategories = categoryOptions.filter((o) => cats.includes(o.label));

    const pitems: MediaItem[] = prevs
      .map((p) => {
        const url = (p as any)?.url;
        if (!url) return null;
        return {
          kind:
            p.kind && (p.kind as any).video !== undefined
              ? 'video'
              : extLooksVideo(url)
                ? 'video'
                : 'image',
          src: url,
          alt: 'preview',
        } as MediaItem;
      })
      .filter(Boolean) as MediaItem[];

    const opts: Option[] = [];
    const nextManifests: Record<OSKey, ManifestInterface[]> = {
      windows: [],
      macos: [],
      linux: [],
    };

    let _web = '';
    let hw = { processor: '', memory: '0', storage: '0', graphics: '', notes: '' };

    dists.forEach((d) => {
      if ((d as any).web) {
        opts.push({ value: 'web', label: 'Web' });
        _web = (d as any).web.url || '';
        return;
      }
      if ((d as any).native) {
        const n = (d as any).native;
        const osKey = osKeyFromOS(n.os);
        if (!opts.find((o) => o.value === osKey)) {
          opts.push({
            value: osKey,
            label: osKey === 'macos' ? 'MacOS' : osKey.charAt(0).toUpperCase() + osKey.slice(1),
          });
        }
        nextManifests[osKey] = (n.manifests || []) as ManifestInterface[];
        hw.processor = n.processor || hw.processor;
        hw.memory = String(n.memory ?? hw.memory);
        hw.storage = String(n.storage ?? hw.storage);
        hw.graphics = n.graphics || hw.graphics;
        hw.notes = n.additionalNotes || hw.notes;
      }
    });

    return {
      title: a.title ?? '',
      description: a.description ?? '',
      coverImage: cover ?? '',
      bannerImage: banner ?? '',
      priceStr: a.price ? String((Number(a.price) / 1e8) as unknown as bigint) : '',
      requiredAgeStr: a.requiredAge ? String(a.requiredAge as unknown as bigint) : '',
      releaseDateStr: relNs ? nsToDateStr(relNs as any) : '',
      statusCode,
      selectedCategories,
      appTags: [...tags],
      previewItems: pitems,
      selectedDistribution: opts,
      manifestsByOS: nextManifests,
      webUrl: _web,
      processor: hw.processor,
      memory: hw.memory || '',
      storage: hw.storage || '',
      graphics: hw.graphics,
      notes: hw.notes,
    };
  }

  async handleAssetChange({
    e,
  }: {
    e: React.ChangeEvent<HTMLInputElement>;
  }): Promise<string | undefined> {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const storage = await this.ensureStorage();
      const { key } = await uploadToPrefix({
        file,
        prefix: storage.prefixes.assets,
        fileName: safeFileName(file.name),
        contentType: file.type,
      });
      const apiUrl = `${import.meta.env.VITE_API_BASE}/files/${key}`;
      return apiUrl;
    } catch (err) {
      console.error('upload assets failed:', err);
    } finally {
      e.target.value = '';
    }
  }

  async handlePreviewUpload(e: React.ChangeEvent<HTMLInputElement>): Promise<MediaItem | null> {
    const file = e.target.files?.[0];
    if (!file) {
      e.target.value = '';
      return null;
    }
    try {
      const storage = await this.ensureStorage();
      const { key } = await uploadToPrefix({
        file,
        prefix: storage.prefixes.previews,
        fileName: safeFileName(file.name),
        contentType: file.type || 'application/octet-stream',
      });

      const apiUrl = `${import.meta.env.VITE_API_BASE}/files/${key}`;
      const kind: MediaItem['kind'] = file.type.startsWith('video/') ? 'video' : 'image';

      // Kembalikan objek yang pasti valid sbg MediaItem
      return { kind, src: apiUrl, alt: file.name };
    } catch (err) {
      console.error('upload preview failed:', err);
      return null; // penting: konsisten return null saat gagal
    } finally {
      e.target.value = ''; // reset input
    }
  }

  async uploadBuildForManifest(
    osKey: OSKey,
    idx: number,
    file: File,
    manifestsByOS: Record<OSKey, ManifestInterface[]>,
    opts: UploadBuildOptions = {},
  ) {
    const storage = await this.ensureStorage();

    const list = manifestsByOS[osKey] || [];
    if (!list[idx]) throw new Error(`Manifest index ${idx} untuk ${osKey} tidak ditemukan`);

    const manifest = list[idx];
    const versionRaw = (manifest.version || '').trim();
    if (!versionRaw) throw new Error('Isi field Version dulu sebelum upload build.');
    if (opts.validateSemver && !EditAppService.isSemver(versionRaw)) {
      throw new Error('Version harus semver (contoh: 1.0.0)');
    }

    // --- buat nama file yang kamu mau ---
    const ext = (() => {
      const p = file.name.split('.');
      return p.length > 1 ? '.' + p.pop()!.toLowerCase() : '';
    })();

    // sanitize version supaya aman untuk path
    const versionSafe = versionRaw.replace(/[^A-Za-z0-9._-]/g, '-'); // 1.0.0-beta -> aman
    // contoh pola nama: v1.0.0 (Windows).exe  -> kamu bebas ganti sesuai selera
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const desiredName = `${this.appId}-${osKey}-v${versionSafe}-${stamp}${ext}`;

    const baseBuildPrefix = storage.prefixes[`builds/${osKey}` as BuildPrefixKey];
    const versionPrefix = `${baseBuildPrefix}${versionSafe}/`;

    // 1) (opsional) Upload artifact utama pakai nama baru
    let artifactKey: string | undefined = undefined;
    if (opts.uploadArtifact) {
      const { key } = await uploadToPrefix({
        file,
        prefix: versionPrefix,
        fileName: desiredName, // ✅ pakai nama yang kita tentukan
        contentType:
          opts.inferContentType !== false
            ? file.type || 'application/octet-stream'
            : 'application/octet-stream',
      });
      artifactKey = key;
    }

    // 2) checksum & size
    const checksum = await sha256File(file);
    const sizeBytes = file.size;
    const sizeMB = +(sizeBytes / (1024 * 1024)).toFixed(3);

    // 3) content.json ikut refer ke nama baru
    const contentJson = JSON.stringify(
      {
        artifact: desiredName, // ✅ refer ke nama baru
        files: [{ path: desiredName, size: sizeBytes, sha256: checksum }],
        totalBytes: sizeBytes,
      },
      null,
      2,
    );

    await uploadToPrefix({
      file: new File([contentJson], 'content.json', { type: 'application/json' }),
      prefix: versionPrefix,
      fileName: 'content.json',
      contentType: 'application/json',
    });

    // 4) update manifests
    const next: Record<OSKey, ManifestInterface[]> = { ...manifestsByOS };
    next[osKey] = (next[osKey] || []).map((m, i) =>
      i === idx
        ? {
            ...m,
            bucket: storage.bucket,
            basePath: versionPrefix,
            checksum,
            content: 'content.json',
            size: sizeMB,
            createdAt: nowNs(),
          }
        : m,
    );

    return {
      manifestsByOS: next,
      message: `Uploaded ${osKey} build: ${desiredName}`,
      meta: { filename: desiredName, checksum, sizeBytes, versionPrefix, artifactKey }, // ✅ filename baru
    };
  }

  private buildDistributions(form: SubmitForm): Distribution[] {
    const list: Distribution[] = [];

    if (hasDist(form.selectedDistribution as any, 'web')) {
      list.push({ web: { url: form.webUrl } } as any);
    }

    (['windows', 'macos', 'linux'] as OSKey[]).forEach((osk) => {
      if (!hasDist(form.selectedDistribution as any, osk)) return;

      const osVariant: OS =
        osk === 'windows'
          ? ({ windows: null } as any)
          : osk === 'macos'
            ? ({ macos: null } as any)
            : ({ linux: null } as any);
      const notesStr = typeof form.notes === 'string' ? form.notes : '';

      list.push({
        native: {
          os: osVariant,
          manifests: form.manifestsByOS[osk],
          processor: form.processor,
          memory: BigInt(form.memoryStr || '0'),
          storage: BigInt(form.storageStr || '0'),
          graphics: form.graphics,
          // Candid Option => [] | [text]
          additionalNotes: ToOpt(notesStr.trim() ? notesStr : undefined),
        },
      } as any);
    });

    return list;
  }

  private validate(form: SubmitForm) {
    const cats = form.selectedCategories.map((c) => c.label);
    if (cats.length === 0 || cats.length > 3)
      throw new Error('Please choose 1 up to 3 categories.');
    if (!form.coverImage) throw new Error('Cover image is required.');
    if (!form.previewItems || form.previewItems.length === 0)
      throw new Error('Please upload at least one preview.');
  }

  async submitUpdate(form: SubmitForm): Promise<void> {
    if (!this.wallet || !this.appId) throw new Error('Wallet or AppId Not Available.');

    this.validate(form);

    const previews = previewsFromMedia(form.previewItems); // -> Preview[]
    const distributions = this.buildDistributions(form);

    const payload = {
      title: form.title,
      description: form.description,
      bannerImage: form.bannerImage,
      coverImage: form.coverImage,
      previews: previews.length ? previews : undefined,
      price: form.priceStr ? BigInt(form.priceStr) : undefined,
      requiredAge: form.requiredAgeStr ? BigInt(form.requiredAgeStr) : undefined,
      releaseDate: form.releaseDateNs, // sudah bigint ns dari page
      status: mapStatusToBackend(form.statusCode),
      category: form.selectedCategories.map((c) => c.label),
      appTags: form.appTags.length ? form.appTags : undefined,
      distributions: distributions.length ? distributions : undefined,
    };

    const wire = toWireFromUI(payload);

    await updateApp({
      updateAppTypes: wire,
      appId: Number(this.appId),
      wallet: this.wallet,
    });
  }
}
