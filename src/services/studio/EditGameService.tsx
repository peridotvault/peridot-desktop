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
import { getGameMetadata, updateGame } from '../../blockchain/icp/vault/services/ICPGameService';
import { MediaItem } from '../../components/organisms/CarouselPreview';
import { Option } from '../../interfaces/Additional';
import { HydratedAppInterface, Preview } from '../../interfaces/app/AppInterface';
import { OSKey } from '../../interfaces/CoreInterface';
import { asArray, asMap, asText, mdGet, ToOpt } from '../../interfaces/helpers/icp.helpers';
import { hasDist, nowNs, nsToDateStr } from '../../utils/Additional';

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
const statusCodeFromText = (t: string): 'publish' | 'notPublish' =>
  t === 'published' ? 'publish' : 'notPublish';
const statusTextFromCode = (code: 'publish' | 'notPublish'): string =>
  code === 'publish' ? 'published' : 'draft';

const osKeyFromNative = (osStr: string): OSKey => {
  const s = (osStr || '').toLowerCase();
  if (s.includes('mac')) return 'macos';
  if (s.includes('win')) return 'windows';
  return 'linux';
};

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
  pgl1_required_age?: number;
  pgl1_cover_image?: string;
  pgl1_distribution?: Distribution[];
  pgl1_description: string;
  pgl1_website: string;
  pgl1_name: string;
  pgl1_banner_image?: string;
  pgl1_price?: bigint;
  pgl1_game_id: GameId;
  previews?: Preview[];
  status: string;
  gameCategories?: string[];
  gameTags?: string[];
}): PGLMeta => {
  const md: Metadata = [];

  // pgl1_status
  md.push(['pgl1_status', { text: ui.status } as Value]);
  // pgl1_banner_image
  if (ui.pgl1_banner_image && ui.pgl1_banner_image) {
    md.push(['pgl1_banner_image', { text: ui.pgl1_banner_image }]);
  }
  // pgl1_previews
  if (ui.previews && ui.previews.length) {
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
  // pgl1_category
  if (ui.gameCategories?.length) {
    md.push(['pgl1_category', { array: ui.gameCategories.map((c) => ({ text: c }) as Value) }]);
  }
  // pgl1_tags
  if (ui.gameTags?.length) {
    md.push(['pgl1_tags', { array: ui.gameTags.map((t) => ({ text: t }) as Value) }]);
  }
  const meta: PGLMeta = {
    pgl1_required_age: ToOpt(BigInt(ui.pgl1_required_age!)),
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
  return meta;
};

// export type SubmitForm = {
//   // general
//   title: string;
//   description: string;
//   bannerImage?: string;
//   coverImage: string;
//   priceStr?: string; // string angka
//   requiredAgeStr?: string; // string angka
//   releaseDateNs?: bigint; // sudah di-convert di page (pakai dateStrToNs)
//   statusCode: 'publish' | 'notPublish';
//   selectedCategories: Option[];
//   appTags: string[];
//   // previews
//   previewItems: MediaItem[];
//   // distributions
//   selectedDistribution: Option[];
//   manifestsByOS: Record<OSKey, ManifestInterface[]>;
//   webUrl: string;
//   // hardware shared (dibagi ke tiap OS yang dipilih)
//   processor: string;
//   memoryStr: string; // string angka
//   storageStr: string; // string angka
//   graphics: string;
//   notes: string;
// };

/** ------------------ Class Service ------------------ */
export class EditGameService {
  private wallet: any;
  private gameAddress: string;
  private storage: InitResp | null = null;

  constructor({ wallet, gameAddress }: { wallet: any; gameAddress: string }) {
    this.wallet = wallet;
    this.gameAddress = gameAddress;
  }

  public async prepareStorage(): Promise<InitResp> {
    if (this.storage) return this.storage;
    if (!this.wallet || !this.gameAddress) throw new Error('Wallet atau AppId tidak tersedia.');
    const resp = await initAppStorage(this.gameAddress.toString());
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
  hydrateFromGame(
    a: PGLMeta, // <= dari canister
    categoryOptions: Option[], // untuk memetakan selectedCategories
  ) {
    // -------- top-level --------
    const cover = unwrapOpt<string>(a.pgl1_cover_image) ?? '';
    const price = unwrapOpt<bigint>(a.pgl1_price);
    const requiredAge = unwrapOpt<bigint>(a.pgl1_required_age);
    const dists = unwrapOpt<Distribution[]>(a.pgl1_distribution) ?? [];
    const md = a.pgl1_metadata;

    // -------- metadata keys --------
    const banner = asText(mdGet(md, 'pgl1_banner_image')) ?? '';
    const statusTxt = asText(mdGet(md, 'pgl1_status')) ?? 'draft';
    const statusCode = statusCodeFromText(statusTxt);

    // previews: array of { map: [["kind",{text}], ["url",{text}]] }
    const previewsV = asArray(mdGet(md, 'pgl1_previews')) ?? [];
    const previews = previewsV
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
      .filter(Boolean);

    // categories & tags as array of text
    const cats = (asArray(mdGet(md, 'pgl1_category')) ?? [])
      .map(asText)
      .filter(Boolean) as string[];
    const tags = (asArray(mdGet(md, 'pgl1_tags')) ?? []).map(asText).filter(Boolean) as string[];

    // (opsional) release date di metadata (nat ns)
    const releaseNsV = mdGet(md, 'release_date_ns');
    const releaseDateStr = (() => {
      const n = (releaseNsV && (releaseNsV as any).nat) as bigint | undefined;
      return n ? nsToDateStr(n as any) : '';
    })();

    // -------- distributions → UI selections --------
    const selectedDistribution: Option[] = [];
    const manifestsByOS: Record<OSKey, Manifest[]> = { windows: [], macos: [], linux: [] }; // ✅ Manifest baru
    let webUrl = '';

    // hardware (ambil dari first native build yg ada)
    let processor = '';
    let memory = '0';
    let storage = '0';
    let graphics = '';
    let notes = '';

    for (const d of dists) {
      if ((d as any).web) {
        selectedDistribution.push({ value: 'web', label: 'Web' });
        webUrl = ((d as any).web as WebBuild).url || webUrl;
        continue;
      }
      if ((d as any).native) {
        const n = (d as any).native as NativeBuild;
        const osKey = osKeyFromNative((n as any).os || '');
        if (!selectedDistribution.find((o) => o.value === osKey)) {
          selectedDistribution.push({
            value: osKey,
            label: osKey === 'macos' ? 'MacOS' : osKey.charAt(0).toUpperCase() + osKey.slice(1),
          });
        }
        // ✅ langsung pakai Manifest dari .did
        manifestsByOS[osKey] = (n.manifests || []) as Manifest[];

        // isi hardware shared kalau masih ada yang kosong
        processor ||= n.processor || '';
        memory ||= String(n.memory ?? '0');
        storage ||= String(n.storage ?? '0');
        graphics ||= n.graphics || '';
        const noteOpt = n.additionalNotes as [] | [string];
        notes ||= (noteOpt.length ? noteOpt[0] : '') || '';
      }
    }

    // -------- previews -> MediaItem untuk carousel --------
    const previewItems: MediaItem[] = previews
      .map((p) => {
        const url = (p as any).url as string;
        if (!url) return null;
        const isVid = (p!.kind as any).video !== undefined || extLooksVideo(url);
        return { kind: isVid ? 'video' : 'image', src: url, alt: 'preview' };
      })
      .filter(Boolean) as MediaItem[];

    // -------- categories → selectedCategories --------
    const selectedCategories = categoryOptions.filter((o) => cats.includes(o.label));

    return {
      title: a.pgl1_name,
      description: a.pgl1_description,
      coverImage: cover,
      bannerImage: banner,
      priceStr: price !== undefined ? String(Number(price)) : '',
      requiredAgeStr: requiredAge !== undefined ? String(Number(requiredAge)) : '',
      releaseDateStr,
      statusCode,
      selectedCategories,
      appTags: [...tags],
      previewItems,
      selectedDistribution,
      manifestsByOS, // ✅ sekarang Record<OSKey, Manifest[]>
      webUrl,
      processor,
      memory,
      storage,
      graphics,
      notes,
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

    // buat nama file final
    const ext = (() => {
      const p = file.name.split('.');
      return p.length > 1 ? '.' + p.pop()!.toLowerCase() : '';
    })();
    const versionSafe = versionRaw.replace(/[^A-Za-z0-9._-]/g, '-');
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const desiredName = `${this.gameAddress}-${osKey}-v${versionSafe}-${stamp}${ext}`;

    const baseBuildPrefix = storage.prefixes[buildPrefixKey(osKey)];
    // const baseBuildPrefix = storage.prefixes[`builds/${osKey}` as any];
    const versionPrefix = `${baseBuildPrefix}${versionSafe}/`;

    // (opsional) upload artifact
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

    // checksum & size
    const checksum = await sha256File(file);
    const sizeBytes = file.size;

    // content.json (kalau masih dipakai backend mu, ok)
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

    // BANGUN Manifest BARU (sesuai .did)
    const newManifest: Manifest = {
      version: versionRaw,
      listing: desiredName, // nama file utama
      checksum, // hex string
      size_bytes: BigInt(sizeBytes), // bytes -> bigint
      createdAt: nowNs(), // ns (bigint)
      storageRef: {
        // union storageRef, pakai S3 yg kamu pakai (Wasabi S3)
        s3: { bucket: storage.bucket, basePath: versionPrefix },
      },
    };

    // update state manifests
    const next: Record<OSKey, Manifest[]> = { ...manifestsByOS };
    next[osKey] = (next[osKey] || []).map((m, i) => (i === idx ? newManifest : m));

    return {
      manifestsByOS: next,
      message: `Uploaded ${osKey} build: ${desiredName}`,
      meta: { filename: desiredName, checksum, sizeBytes, versionPrefix, artifactKey },
    };
  }

  private buildDistributions(form: HydratedAppInterface): Distribution[] {
    const list: Distribution[] = [];

    // web
    if (hasDist(form.selectedDistribution as any, 'web')) {
      list.push({ web: { url: form.webUrl } } as any);
    }

    // native (Windows/Mac/Linux)
    (['windows', 'macos', 'linux'] as OSKey[]).forEach((osk) => {
      if (!hasDist(form.selectedDistribution as any, osk)) return;

      const osVariant =
        osk === 'windows'
          ? ({ windows: null } as any)
          : osk === 'macos'
            ? ({ macos: null } as any)
            : ({ linux: null } as any);

      const notesStr = typeof form.notes === 'string' ? form.notes : '';

      list.push({
        native: {
          os: osVariant,
          manifests: form.manifestsByOS[osk] as Manifest[], // <-- penting: Manifest baru
          processor: form.processor,
          memory: BigInt(form.memory || '0'),
          storage: BigInt(form.storage || '0'),
          graphics: form.graphics,
          additionalNotes: ToOpt(notesStr.trim() ? notesStr : undefined),
        },
      } as any);
    });

    return list;
  }

  private validate(form: HydratedAppInterface) {
    const cats = form.selectedCategories.map((c) => c.label);
    if (cats.length === 0 || cats.length > 3)
      throw new Error('Please choose 1 up to 3 categories.');
    if (!form.coverImage) throw new Error('Cover image is required.');
    if (!form.previewItems || form.previewItems.length === 0)
      throw new Error('Please upload at least one preview.');
  }

  async submitUpdate(form: HydratedAppInterface, gameAddress: string): Promise<void> {
    if (!this.wallet || !this.gameAddress) throw new Error('Wallet or AppId Not Available.');

    this.validate(form);

    const previews = previewsFromMedia(form.previewItems);
    const distributions = this.buildDistributions(form);

    // Ambil meta saat ini → jaga pgl1_game_id
    const currentMeta: PGLMeta = await getGameMetadata({
      gameAddress,
    });

    const payload = {
      pgl1_required_age: form.requiredAgeStr ? Number(form.requiredAgeStr) : undefined,
      pgl1_cover_image: form.coverImage,
      pgl1_distribution: distributions.length ? distributions : undefined,
      pgl1_description: form.description,
      pgl1_website: form.webUrl,
      pgl1_name: form.title,
      pgl1_banner_image: form.bannerImage, // → metadata
      pgl1_price: form.priceStr ? BigInt(form.priceStr) : undefined,
      pgl1_game_id: currentMeta.pgl1_game_id,
      previews: previews.length ? previews : undefined, // → metadata
      status: statusTextFromCode(form.statusCode), // ✅ string
      gameCategories: form.selectedCategories.map((c) => c.label), // → metadata
      gameTags: form.appTags.length ? form.appTags : undefined, // → metadata
    } as const;

    const meta: PGLMeta = toWireFromUI(payload);

    await updateGame({
      gameAddress,
      meta,
      wallet: this.wallet,
    });
  }
}
