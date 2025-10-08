import { initAppStorage, InitResp, safeFileName, uploadToPrefix } from '../../api/wasabiClient';
import {
  Distribution,
  GameId,
  Manifest,
  Metadata,
  NativeBuild,
  PGLMeta,
  Value,
  WebBuild,
} from '../../blockchain/icp/vault/service.did.d';
import { updateGame } from '../../blockchain/icp/vault/services/ICPGameService';
import {
  HydratedGameInterface,
  MediaItem,
  Preview,
  HardwareFields,
  Option,
  WebHardwareFields,
} from '../../interfaces/app/GameInterface';
import { OSKey } from '../../interfaces/CoreInterface';
import { asArray, asMap, asText, mdGet, ToOpt } from '../../interfaces/helpers/icp.helpers';
import { hasDist, nowNs } from '../../utils/Additional';

type BuildPrefixKey = 'builds/web' | 'builds/windows' | 'builds/macos' | 'builds/linux';

const buildPrefixKey = (osKey: OSKey): BuildPrefixKey =>
  osKey === 'windows'
    ? 'builds/windows'
    : osKey === 'macos'
      ? 'builds/macos'
      : osKey === 'linux'
        ? 'builds/linux'
        : 'builds/web';

const extLooksVideo = (u: string) => /(\.mp4|\.webm|\.mov|video\=)/i.test(u);
const statusTextFromCode = (code: 'publish' | 'notPublish'): 'published' | 'draft' =>
  code === 'publish' ? 'published' : 'draft';

const osKeyFromNative = (osStr: string): OSKey => {
  const s = (osStr || '').toLowerCase();
  if (s.includes('mac')) return 'macos';
  if (s.includes('win')) return 'windows';
  return 'linux';
};

function unwrapOpt<T>(o: any): T | undefined {
  return Array.isArray(o) ? (o.length ? o[0] : undefined) : o;
}

function readPublishInfo(md: [Metadata] | [] | undefined): {
  status: 'publish' | 'notPublish';
  releasedAt?: bigint;
} {
  const v = mdGet(md, 'pgl1_published');
  const m = asMap(v);
  if (!m) return { status: 'notPublish' };

  const statusTxt = (asText(m.find(([k]) => k === 'status')?.[1]) ?? '').toLowerCase();
  const okStatus = statusTxt === 'publish' || statusTxt === 'notpublish' ? statusTxt : 'notpublish';

  // izinkan 'notPublish' / 'notpublish'
  const status = okStatus === 'publish' ? 'publish' : 'notPublish';

  const rel = m.find(([k]) => k === 'releasedAt')?.[1] as any;
  const releasedAt: bigint | undefined =
    rel && typeof rel === 'object' && 'nat' in rel ? (rel.nat as bigint) : undefined;

  return releasedAt !== undefined ? { status, releasedAt } : { status };
}

const toNat = (s?: string): bigint | undefined => {
  if (s == null) return undefined;
  const t = String(s).trim();
  if (!t) return undefined;
  return BigInt(t);
};

export async function sha256File(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export type UploadBuildOptions = {
  uploadArtifact?: boolean; // default: false
  inferContentType?: boolean; // default: true
  validateSemver?: boolean; // default: false
};

/** Adapter: UI → PGLMeta */
type UIToWire = {
  pgl1_required_age?: number;
  pgl1_cover_image?: string;
  pgl1_distribution?: Distribution[];
  pgl1_description: string;
  pgl1_website?: string;
  pgl1_name: string;
  pgl1_banner_image?: string;
  pgl1_price?: bigint;
  pgl1_game_id: GameId;
  previews?: Preview[];
  categories?: string[];
  tags?: string[];
  published?: { status: 'publish' | 'notPublish'; releasedAt?: bigint };
};

const toWireFromUI = (ui: UIToWire): PGLMeta => {
  const md: Metadata = [];
  // status → text
  const statusTxt = statusTextFromCode(ui.published?.status ?? 'notPublish');
  md.push(['pgl1_status', { text: statusTxt } as Value]);

  // banner
  if (ui.pgl1_banner_image) {
    md.push(['pgl1_banner_image', { text: ui.pgl1_banner_image }]);
  }

  // previews
  if (ui.previews?.length) {
    const vals: Value[] = ui.previews.map((p) => {
      const isVideo =
        (p.kind as any)?.video !== undefined || String((p as any).kind).toLowerCase() === 'video';
      const kindTxt = isVideo ? 'video' : 'image';
      const urlTxt = (p as any).url ?? (p as any).src ?? '';
      return {
        map: [
          ['kind', { text: kindTxt }],
          ['url', { text: urlTxt }],
        ],
      } as Value;
    });
    md.push(['pgl1_previews', { array: vals }]);
  }

  // categories / tags
  if (ui.categories?.length) {
    md.push(['pgl1_category', { array: ui.categories.map((c) => ({ text: c })) }]);
  }
  if (ui.tags?.length) {
    md.push(['pgl1_tags', { array: ui.tags.map((t) => ({ text: t })) }]);
  }

  // releasedAt → nat di metadata
  if (ui.published?.releasedAt !== undefined) {
    md.push(['release_date_ns', { nat: ui.published.releasedAt }]);
  }

  return {
    pgl1_required_age: ToOpt(
      ui.pgl1_required_age !== undefined ? BigInt(ui.pgl1_required_age) : undefined,
    ),
    pgl1_cover_image: ToOpt(ui.pgl1_cover_image),
    pgl1_distribution: ToOpt(ui.pgl1_distribution),
    pgl1_description: ui.pgl1_description,
    pgl1_name: ui.pgl1_name,
    pgl1_banner_image: ToOpt(ui.pgl1_banner_image),
    pgl1_metadata: ToOpt(md),
    pgl1_price: ToOpt(ui.pgl1_price),
    pgl1_game_id: ui.pgl1_game_id,
    pgl1_website: ToOpt(ui.pgl1_website),
  };
};

/** ------------------ Class Service ------------------ */
export class EditGameService {
  private wallet: any;
  private gameId: string;
  private storage: InitResp | null = null;

  constructor({ wallet, gameId }: { wallet: any; gameId: string }) {
    this.wallet = wallet;
    this.gameId = gameId;
  }

  public async prepareStorage(): Promise<InitResp> {
    if (this.storage) return this.storage;
    if (!this.wallet || !this.gameId) throw new Error('Wallet atau AppId tidak tersedia.');
    const resp = await initAppStorage(this.gameId.toString());
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
    return /^[0-9]+(?:\.[0-9]+){1,2}(-[0-9A-Za-z.-]+)?$/.test(v);
  }

  /** ------------------ Hydration (PGLMeta -> HydratedGameInterface) ------------------ */
  hydrateFromGame(a: PGLMeta, categoryOptions: Option[]): HydratedGameInterface {
    // top-level
    const cover = unwrapOpt<string>(a.pgl1_cover_image) ?? '';
    const bannerMeta = asText(mdGet(a.pgl1_metadata, 'pgl1_banner_image')) ?? '';
    const banner = unwrapOpt<string>(a.pgl1_banner_image) ?? bannerMeta;
    const price = unwrapOpt<bigint>(a.pgl1_price);
    const requiredAge = unwrapOpt<bigint>(a.pgl1_required_age);
    const dists = unwrapOpt<Distribution[]>(a.pgl1_distribution) ?? [];
    const website = unwrapOpt<string>(a.pgl1_website) ?? '';
    const md = a.pgl1_metadata;

    // previews
    const previewsV = asArray(mdGet(md, 'pgl1_previews')) ?? [];
    const previews: Preview[] = previewsV
      .map((v) => {
        const m = asMap(v);
        if (!m) return null;
        const kindTxt = asText(m.find(([k]) => k === 'kind')?.[1]) ?? '';
        const url = asText(m.find(([k]) => k === 'url')?.[1]) ?? '';
        if (!url) return null;
        return {
          kind: kindTxt === 'video' ? ({ video: null } as const) : ({ image: null } as const),
          url,
        };
      })
      .filter(Boolean) as Preview[];

    // categories & tags
    const catsText = (asArray(mdGet(md, 'pgl1_category')) ?? [])
      .map(asText)
      .filter(Boolean) as string[];
    const tagsText = (asArray(mdGet(md, 'pgl1_tags')) ?? [])
      .map(asText)
      .filter(Boolean) as string[];

    // release date (opsional)
    const published = readPublishInfo(md);

    // distributions -> UI selections + hardware per OS
    const selectedDistribution: Option[] = [];
    const manifestsByOS: Record<OSKey, Manifest[]> = { windows: [], macos: [], linux: [] };
    const hardwareByOS: Record<OSKey, HardwareFields> = {
      windows: { processor: '', memory: '', storage: '', graphics: '', notes: '' },
      macos: { processor: '', memory: '', storage: '', graphics: '', notes: '' },
      linux: { processor: '', memory: '', storage: '', graphics: '', notes: '' },
    };
    let webHardware: HydratedGameInterface['webHardware'] = null;

    for (const d of dists) {
      if ('web' in d) {
        selectedDistribution.push({ value: 'web', label: 'Web' });
        const w = d.web as WebBuild;
        webHardware = {
          processor: w.processor ?? '',
          memory: String(w.memory ?? 0n),
          storage: String(w.storage ?? 0n),
          graphics: w.graphics ?? '',
          notes: (w.additionalNotes as [] | [string])?.[0] ?? '',
        };
        continue;
      }
      if ('native' in d) {
        const n = d.native as NativeBuild;
        const osKey = osKeyFromNative(String(n.os || ''));
        if (!selectedDistribution.find((o) => o.value === osKey)) {
          selectedDistribution.push({
            value: osKey,
            label: osKey === 'macos' ? 'MacOS' : osKey.charAt(0).toUpperCase() + osKey.slice(1),
          });
        }
        manifestsByOS[osKey] = (n.manifests || []) as Manifest[];
        hardwareByOS[osKey] = {
          processor: n.processor || '',
          memory: String(n.memory ?? 0n),
          storage: String(n.storage ?? 0n),
          graphics: n.graphics || '',
          notes: (n.additionalNotes as [] | [string])?.[0] ?? '',
        };
      }
    }

    // map previews -> MediaItem
    const mediaItems: MediaItem[] = previews
      .map((p) => {
        const url = (p as any).url as string;
        if (!url) return null;
        const isVid = (p!.kind as any).video !== undefined || extLooksVideo(url);
        return { kind: isVid ? 'video' : 'image', src: url, alt: 'preview' };
      })
      .filter(Boolean) as MediaItem[];

    // categories -> Option[] utk UI (pakai label utk dicocokkan)
    const selectedCategories = categoryOptions.filter((o) => catsText.includes(o.label));

    return {
      /** general */
      pgl1_game_id: a.pgl1_game_id,
      pgl1_name: a.pgl1_name,
      pgl1_description: a.pgl1_description,
      pgl1_cover_image: cover,
      pgl1_banner_image: banner,
      pgl1_price: price !== undefined ? String(price) : undefined,
      pgl1_required_age: requiredAge !== undefined ? String(requiredAge) : undefined,
      pgl1_website: website,

      /** metadata (UI) */
      pgl1_tags: [...tagsText],
      pgl1_categories: selectedCategories.map((o) => o.label),
      pgl1_previews: mediaItems,
      pgl1_published: published,

      /** distribusi & hardware */
      pgl1_distribution: selectedDistribution,
      manifestsByOS,
      webHardware,
      hardwareByOS,
    };
  }

  /** ======================
   *  ASSET UPLOADS
   *  ====================== */
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
      return { kind, src: apiUrl, alt: file.name };
    } catch (err) {
      console.error('upload preview failed:', err);
      return null;
    } finally {
      e.target.value = '';
    }
  }

  /** ======================
   *  BUILD UPLOAD PER MANIFEST
   *  ====================== */
  async uploadBuildForManifest(
    osKey: OSKey,
    idx: number,
    file: File,
    manifestsByOS: Record<OSKey, Manifest[]>,
    opts: UploadBuildOptions = {},
  ) {
    const storage = await this.ensureStorage();

    const list = manifestsByOS[osKey] || [];
    if (!list[idx]) throw new Error(`Manifest index ${idx} untuk ${osKey} tidak ditemukan`);

    const manifest = list[idx];
    const versionRaw = (manifest.version || '').trim();
    if (!versionRaw) throw new Error('Isi field Version dulu sebelum upload build.');
    if (opts.validateSemver && !EditGameService.isSemver(versionRaw)) {
      throw new Error('Version harus semver (contoh: 1.0.0)');
    }

    const ext = (() => {
      const p = file.name.split('.');
      return p.length > 1 ? '.' + p.pop()!.toLowerCase() : '';
    })();
    const versionSafe = versionRaw.replace(/[^A-Za-z0-9._-]/g, '-');
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const desiredName = `${this.gameId}-${osKey}-v${versionSafe}-${stamp}${ext}`;

    const baseBuildPrefix = storage.prefixes[buildPrefixKey(osKey)];
    const versionPrefix = `${baseBuildPrefix}${versionSafe}/`;

    // optional artifact
    let artifactKey: string | undefined;
    if (opts.uploadArtifact) {
      const { key } = await uploadToPrefix({
        file,
        prefix: versionPrefix,
        fileName: desiredName,
        contentType:
          opts.inferContentType !== false
            ? file.type || 'application/octet-stream'
            : 'application/octet-stream',
      });
      artifactKey = key;
    }

    const checksum = await sha256File(file);
    const sizeBytes = file.size;

    // optional manifest content.json
    const contentJson = JSON.stringify(
      {
        artifact: desiredName,
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

    const newManifest: Manifest = {
      version: versionRaw,
      listing: desiredName,
      checksum,
      size_bytes: BigInt(sizeBytes),
      createdAt: nowNs(),
      storageRef: { s3: { bucket: storage.bucket, basePath: versionPrefix } },
    };

    const next: Record<OSKey, Manifest[]> = { ...manifestsByOS };
    next[osKey] = (next[osKey] || []).map((m, i) => (i === idx ? newManifest : m));

    return {
      manifestsByOS: next,
      message: `Uploaded ${osKey} build: ${desiredName}`,
      meta: { filename: desiredName, checksum, sizeBytes, versionPrefix, artifactKey },
    };
  }

  /** ======================
   *  BUILD DISTRIBUTIONS (UI -> Distribution[])
   *  ====================== */
  private buildDistributions({
    selectedDistribution,
    manifestsByOS,
    hardwareByOS,
    webHardware,
    pgl1_website,
  }: {
    selectedDistribution: Option[];
    manifestsByOS: Record<OSKey, Manifest[]>;
    hardwareByOS: Record<OSKey, HardwareFields>;
    webHardware: WebHardwareFields | null;
    pgl1_website?: string;
  }): Distribution[] {
    const list: Distribution[] = [];

    // WEB
    if (hasDist(selectedDistribution, 'web')) {
      const wh = webHardware ?? {
        processor: '',
        memory: '0',
        storage: '0',
        graphics: '',
        notes: '',
      };
      const webUrl = pgl1_website || ''; // gunakan website sebagai play URL untuk web build
      const wb: WebBuild = {
        url: webUrl,
        processor: wh.processor || '',
        memory: toNat(wh.memory) ?? 0n,
        storage: toNat(wh.storage) ?? 0n,
        graphics: wh.graphics || '',
        additionalNotes: ToOpt(wh.notes?.trim() ? wh.notes : undefined),
      };
      list.push({ web: wb });
    }

    // NATIVE
    (['windows', 'macos', 'linux'] as OSKey[]).forEach((osk) => {
      if (!hasDist(selectedDistribution, osk)) return;

      const hw = hardwareByOS[osk] ?? {
        processor: '',
        memory: '0',
        storage: '0',
        graphics: '',
        notes: '',
      };
      const manifests = manifestsByOS[osk] ?? [];

      const native: NativeBuild = {
        os: osk, // DID kamu bertipe string; kalau variant, ubah di sini.
        manifests,
        processor: hw.processor,
        memory: toNat(hw.memory) ?? 0n,
        storage: toNat(hw.storage) ?? 0n,
        graphics: hw.graphics,
        additionalNotes: ToOpt(hw.notes?.trim() ? hw.notes : undefined),
      };
      list.push({ native });
    });

    return list;
  }

  /** ======================
   *  SUBMIT UPDATE
   *  ====================== */
  async submitUpdate(form: HydratedGameInterface, gameId: string): Promise<void> {
    // Hapus validasi !this.gameId karena gameId sekarang parameter
    if (!this.wallet) throw new Error('Wallet Not Available.');

    // === VALIDASI UI BARU ===
    if (!form.pgl1_cover_image) throw new Error('Cover image is required.');
    const cats = (form.pgl1_categories ?? []) as string[]; // kalau Category = string
    if (cats.length === 0 || cats.length > 3)
      throw new Error('Please choose 1 up to 3 categories.');
    if (!form.pgl1_previews?.length) throw new Error('Please upload at least one preview.');

    // rakit Distribution[] dari manifests & hardware
    const distributions = this.buildDistributions({
      selectedDistribution: form.pgl1_distribution || [],
      manifestsByOS: form.manifestsByOS || { windows: [], macos: [], linux: [] },
      hardwareByOS: form.hardwareByOS || {
        windows: { processor: '', memory: '', storage: '', graphics: '', notes: '' },
        macos: { processor: '', memory: '', storage: '', graphics: '', notes: '' },
        linux: { processor: '', memory: '', storage: '', graphics: '', notes: '' },
      },
      webHardware: form.webHardware || null,
      pgl1_website: form.pgl1_website,
    });

    // Buat payload, tetapi pastikan pgl1_game_id tidak berubah
    const payload: UIToWire = {
      pgl1_required_age: form.pgl1_required_age ? Number(form.pgl1_required_age) : undefined,
      pgl1_cover_image: form.pgl1_cover_image,
      pgl1_distribution: distributions.length ? distributions : undefined,
      pgl1_description: form.pgl1_description,
      pgl1_website: form.pgl1_website,
      pgl1_name: form.pgl1_name,
      pgl1_banner_image: form.pgl1_banner_image,
      pgl1_price: form.pgl1_price ? BigInt(form.pgl1_price) : undefined,
      pgl1_game_id: gameId,
      previews: (form.pgl1_previews ?? []).map((it) => ({
        kind: it.kind === 'video' ? ({ video: null } as const) : ({ image: null } as const),
        url: it.src,
      })),
      categories: cats,
      tags: form.pgl1_tags ?? [],
      published: form.pgl1_published, // <- ambil langsung dari UI
    };

    const meta: PGLMeta = toWireFromUI(payload);

    // Panggil updateGame dan tangani error dari canister
    try {
      const updateResult = await updateGame({
        gameId: meta.pgl1_game_id,
        meta,
        wallet: this.wallet,
      });

      // Periksa apakah updateGame mengembalikan ApiResponse (seperti yang didefinisikan di .did)
      if ('err' in updateResult) {
        // Jika ada error dari canister
        const [errorCode, errorMessage] = Object.entries(updateResult)[0] as [string, string];
        console.error('Error from updateGame canister:', errorCode, errorMessage);
        throw new Error(`Failed to update game: ${errorCode} - ${errorMessage}`);
      }

      // Jika tidak ada error ('ok' dalam result), maka update dianggap sukses
      console.log('Game updated successfully in canister. New metadata:', updateResult);
      // Jika updateResult.ok berisi metadata baru, Anda bisa mengembalikannya jika diperlukan
      // return updateResult.ok;
    } catch (updateError) {
      // Tangani error dari pemanggilan updateGame (jaringan, agen, atau error dari canister yang tidak ditangani di atas)
      console.error('Error calling updateGame service:', updateError);
      if (updateError instanceof Error) {
        throw new Error(`Error Service Update Game Call: ${updateError.message}`);
      } else {
        throw new Error(`Error Service Update Game Call: ${String(updateError)}`);
      }
    }
  }
}
