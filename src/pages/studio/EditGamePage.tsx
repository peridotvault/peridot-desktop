// @ts-ignore
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { InputFieldComponent } from '../../components/atoms/InputFieldComponent';
import {
  faBrain,
  faCheck,
  faGlobe,
  faHeading,
  faMessage,
  faMoneyBill1Wave,
  faPersonCane,
  faCalendarDays,
  faVestPatches,
} from '@fortawesome/free-solid-svg-icons';
import { PhotoFieldComponent } from '../../components/atoms/PhotoFieldComponent';
import { DropDownComponent } from '../../components/atoms/DropDownComponent';
import { MultiSelectComponent } from '../../components/atoms/MultiSelectComponent';
import CarouselPreview from '../../components/organisms/CarouselPreview';
import allCategories from '../../assets/json/app/categories.json';
import { useWallet } from '../../contexts/WalletContext';
import { BannerFieldComponent } from '../../components/atoms/BannerFieldComponent';
import { OSKey } from '../../interfaces/CoreInterface';
import { hasDist, nowNs, nsToDateStr, toOSKey, dateStrToNs } from '../../utils/Additional';
import { useParams } from 'react-router-dom'; // Import useParams
import { EditGameService as EGS } from '../../services/studio/EditGameService';
import { getGameByDeveloperId } from '../../blockchain/icp/vault/services/ICPGameService'; // Pastikan path benar
import { Manifest, PGLMeta, StorageRef } from '../../blockchain/icp/vault/service.did.d'; // Pastikan path benar
import {
  HydratedGameInterface,
  MediaItem,
  Option,
  HardwareFields,
  WebHardwareFields,
} from '../../interfaces/app/GameInterface';

function storageRefLabel(sr: StorageRef): string {
  if ('url' in sr) return sr.url.url ?? '';
  if ('s3' in sr) return `${sr.s3.bucket}/${sr.s3.basePath}`;
  if ('ipfs' in sr) return `${sr.ipfs.cid}${sr.ipfs.path?.[0] ? `/${sr.ipfs.path[0]}` : ''}`;
  return '';
}

function isUploaded(m: Manifest): boolean {
  return Boolean(m.checksum && storageRefLabel(m.storageRef));
}

export default function EditGamePage() {
  const { wallet } = useWallet();

  // ===== URL param =====
  // Ganti gameAddress menjadi gameId sesuai dengan routes.tsx
  const { gameId } = useParams<{ gameId: string }>(); // Ambil gameId dari URL

  // ===== State data dari chain =====
  const [games, setGames] = useState<PGLMeta[] | null>(null);
  const [loadedGame, setLoadedGame] = useState<PGLMeta | null>(null);

  // ===== Service =====
  // Gunakan gameId di sini juga
  const EditGameService = useMemo(
    () => new EGS({ wallet, gameId: gameId! }), // Perhatian: gameAddress mungkin perlu diganti di EditGameService
    [wallet, gameId],
  );

  // init storage (Wasabi)
  useEffect(() => {
    (async () => {
      try {
        await EditGameService.prepareStorage();
      } catch (e) {
        console.error('prepareStorage failed:', e);
      }
    })();
  }, [EditGameService]);

  // fetch all dev games
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        if (!wallet) return;
        const listGames = await getGameByDeveloperId({
          dev: wallet.principalId!,
          start: 0,
          limit: 200,
        });
        if (isMounted) setGames(listGames);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [wallet]);

  // find current game by gameId
  useEffect(() => {
    if (!games || !gameId) return; // Gunakan gameId
    // Asumsikan pgl1_game_id adalah string yang bisa dibandingkan dengan gameId
    const found = games.find((a) => String(a.pgl1_game_id) === String(gameId)); // Gunakan gameId
    if (found) setLoadedGame(found);
  }, [games, gameId]); // Gunakan gameId

  // ===== General form =====
  const [pgl1_game_id, set_pgl1_game_id] = useState('');
  const [pgl1_name, set_pgl1_name] = useState('');
  const [pgl1_description, set_pgl1_description] = useState('');
  const [pgl1_cover_image, set_pgl1_cover_image] = useState<string>('');
  const [pgl1_banner_image, set_pgl1_banner_image] = useState<string>('');
  const [pgl1_price, set_pgl1_price] = useState(''); // bigint as string
  const [pgl1_required_age, set_pgl1_required_age] = useState(''); // bigint as string

  const [releaseDateStr, setReleaseDateStr] = useState(nsToDateStr(nowNs())); // YYYY-MM-DD
  const [selectedCategories, setSelectedCategories] = useState<Option[]>([]);
  const statusOptions = [
    { code: 'publish', name: 'Publish' },
    { code: 'notPublish', name: 'Not Publish' },
  ] as const;
  const [statusCode, setStatusCode] = useState<'publish' | 'notPublish'>('publish');

  // Tags
  const [tagInput, setTagInput] = useState('');
  const [appTags, setAppTags] = useState<string[]>([]);

  // Previews
  const [previewItems, setPreviewItems] = useState<MediaItem[]>([]);

  // Distribusi/OS
  const [selectedDistribution, setSelectedDistribution] = useState<Option[]>([]);

  // per-OS manifests
  const blankManifest = (): Manifest => ({
    version: '',
    listing: '',
    checksum: '',
    size_bytes: 0n,
    createdAt: 0n,
    // default ke varian URL biar simple
    storageRef: { url: { url: '' } },
  });

  const [manifestsByOS, setManifestsByOS] = useState<Record<OSKey, Manifest[]>>({
    windows: [],
    macos: [],
    linux: [],
  });

  // meta upload per manifest (nama file & key upload)
  const [uploadedMeta, setUploadedMeta] = useState<
    Record<OSKey, { name?: string; key?: string }[]>
  >({
    windows: [],
    macos: [],
    linux: [],
  });

  // hardware per-OS
  const [hardwareByOS, setHardwareByOS] = useState<Record<OSKey, HardwareFields>>({
    windows: { processor: '', memory: '', storage: '', graphics: '', notes: '' },
    macos: { processor: '', memory: '', storage: '', graphics: '', notes: '' },
    linux: { processor: '', memory: '', storage: '', graphics: '', notes: '' },
  });

  // web build
  const [webUrl, setWebUrl] = useState('');
  const [webHardware, setWebHardware] = useState<WebHardwareFields | null>(null);

  // UI
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ ok?: string; err?: string }>({});

  // categories
  const categoryOptions = useMemo(() => {
    return allCategories.categories.map((tag: any) => ({
      value: tag.id,
      label: tag.name,
    }));
  }, []);

  // sync manifests grid when distribution changes
  useEffect(() => {
    const chosenOS = new Set(
      selectedDistribution
        .map((o) => o.value)
        .filter((v) => v !== 'web')
        .map((v) => toOSKey(v)),
    );
    setManifestsByOS((prev) => {
      const next = { ...prev };
      (['windows', 'macos', 'linux'] as OSKey[]).forEach((k) => {
        if (chosenOS.has(k) && next[k].length === 0) next[k] = [blankManifest()];
        if (!chosenOS.has(k)) next[k] = [];
      });
      return next;
    });
  }, [selectedDistribution]);

  /** ======================
   *  HYDRATE FROM EXISTING GAME
   *  ====================== */
  useEffect(() => {
    if (!loadedGame) return;

    const h = EditGameService.hydrateFromGame(loadedGame, categoryOptions);

    set_pgl1_game_id(h.pgl1_game_id ?? '');
    set_pgl1_name(h.pgl1_name ?? '');
    set_pgl1_description(h.pgl1_description ?? '');
    set_pgl1_cover_image(h.pgl1_cover_image ?? '');
    set_pgl1_banner_image(h.pgl1_banner_image ?? '');
    set_pgl1_price(h.pgl1_price ?? '');
    set_pgl1_required_age(h.pgl1_required_age ?? '');

    // release date (ns -> YYYY-MM-DD) dari pgl1_published
    const releasedAtNs = h.pgl1_published?.releasedAt;
    setReleaseDateStr(releasedAtNs ? nsToDateStr(releasedAtNs) : '');

    setStatusCode(h.pgl1_published?.status ?? 'notPublish');

    // categories: Hydrated berisi string[], convert ke Option[]
    const catsAsOptions = (h.pgl1_categories ?? []).map((cat) => {
      const opt = categoryOptions.find((o) => o.label === cat || o.value === cat);
      return opt ?? { value: cat, label: cat };
    });
    setSelectedCategories(catsAsOptions);

    setAppTags(h.pgl1_tags ?? []);
    setPreviewItems(h.pgl1_previews ?? []);
    setSelectedDistribution(h.pgl1_distribution ?? []);
    setManifestsByOS(h.manifestsByOS ?? { windows: [], macos: [], linux: [] });

    // hardware per-OS
    setHardwareByOS(
      h.hardwareByOS ?? {
        windows: { processor: '', memory: '', storage: '', graphics: '', notes: '' },
        macos: { processor: '', memory: '', storage: '', graphics: '', notes: '' },
        linux: { processor: '', memory: '', storage: '', graphics: '', notes: '' },
      },
    );

    setWebUrl(h.pgl1_website ?? '');
    setWebHardware(h.webHardware ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedGame, categoryOptions]); // ⬅️ JANGAN masukkan EditGameService di sini

  /** ======================
   *  UPLOAD HELPERS (Wasabi)
   *  ====================== */
  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const apiUrl = (await EditGameService.handleAssetChange({ e })) || '';
    set_pgl1_cover_image(apiUrl);
  }
  async function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const apiUrl = (await EditGameService.handleAssetChange({ e })) || '';
    set_pgl1_banner_image(apiUrl);
  }
  function handlePreviewUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const newly: MediaItem[] = files.map((f) => {
      const url = URL.createObjectURL(f);
      if (f.type.startsWith('video/')) {
        return { kind: 'video', src: url }; // poster bisa di-generate kemudian pakai canvas kalau mau
      }
      return { kind: 'image', src: url };
    });
    setPreviewItems((prev) => [...prev, ...newly]); // where setPreviewItems is your state setter
  }

  // Build file upload per manifest
  async function uploadBuildForManifest(osKey: OSKey, idx: number, file: File) {
    try {
      // tampilkan nama sementara
      setUploadedMeta((prev) => {
        const copy = { ...prev };
        const list = (copy[osKey] ?? []).slice();
        list[idx] = { ...(list[idx] || {}), name: file.name };
        copy[osKey] = list;
        return copy;
      });

      const {
        manifestsByOS: next,
        message,
        meta,
      } = await EditGameService.uploadBuildForManifest(osKey, idx, file, manifestsByOS, {
        uploadArtifact: true,
        validateSemver: false,
      });

      setManifestsByOS(next);
      setUploadedMeta((prev) => {
        const copy = { ...prev };
        const list = (copy[osKey] ?? []).slice();
        list[idx] = { name: meta.filename, key: meta.artifactKey };
        copy[osKey] = list;
        return copy;
      });
      setToast({ ok: message });
    } catch (e: any) {
      console.error(e);
      setToast({ err: e?.message ?? String(e) });
    }
  }

  /** ======================
   *  SUBMIT
   *  ====================== */
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setBusy(true);
      setToast({});

      if (!EditGameService) throw new Error('Wallet atau AppId tidak tersedia.');
      // Gunakan gameId dari URL, bukan gameAddress
      if (!gameId) throw new Error('Game ID tidak ditemukan dari URL.');

      // bentuk object sesuai HydratedGameInterface
      const form: HydratedGameInterface = {
        pgl1_game_id,
        pgl1_name,
        pgl1_description,
        pgl1_cover_image,
        pgl1_banner_image,
        pgl1_price,
        pgl1_required_age,
        pgl1_published: {
          status: statusCode,
          releasedAt: dateStrToNs(releaseDateStr),
        },
        pgl1_categories: selectedCategories.map((o) => o.label),
        pgl1_tags: appTags,
        pgl1_previews: previewItems,
        pgl1_distribution: selectedDistribution,
        manifestsByOS,
        pgl1_website: webUrl,
        hardwareByOS,
        webHardware,
      };

      // Kirim gameId ke submitUpdate, bukan gameAddress
      await EditGameService.submitUpdate(form, gameId); // <--- Perubahan di sini
      setToast({ ok: 'App updated successfully 🎉' });
    } catch (err: any) {
      console.error('Error Service Update App :', err);
      setToast({ err: err?.message ?? String(err) });
    } finally {
      setBusy(false);
    }
  }

  // tag add/remove
  const addTag = () => {
    const t = tagInput.trim();
    if (!t || appTags.includes(t)) return;
    setAppTags((p) => [...p, t]);
    setTagInput('');
  };
  const removeTag = (t: string) => setAppTags((p) => p.filter((x) => x !== t));

  return (
    <form onSubmit={onSubmit} className="w-full max-w-[1400px] flex flex-col gap-8">
      <h1 className="text-3xl pb-4">Update App</h1>

      {toast.ok && (
        <div className="rounded-lg border border-success text-success px-4 py-2">{toast.ok}</div>
      )}
      {toast.err && (
        <div className="rounded-lg border border-danger text-danger px-4 py-2">{toast.err}</div>
      )}

      <div className="flex gap-12">
        {/* left */}
        <div className="flex flex-col gap-8 w-full">
          <section className="flex flex-col gap-4">
            <h2 className="text-2xl font-semibold pb-2">General</h2>
            <InputFieldComponent
              name="Game Id"
              icon={faHeading}
              type="text"
              disabled={true}
              placeholder="Game Id"
              value={pgl1_game_id}
              onChange={() => {}}
            />
            <InputFieldComponent
              name="Game Name"
              icon={faHeading}
              type="text"
              placeholder="Game Name"
              value={pgl1_name}
              onChange={(e) => set_pgl1_name((e.target as HTMLInputElement).value)}
            />
            <InputFieldComponent
              name="description"
              icon={faMessage}
              type="text"
              placeholder="Description"
              value={pgl1_description}
              onChange={(e) => set_pgl1_description((e.target as HTMLInputElement).value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <InputFieldComponent
                name="price"
                icon={faMoneyBill1Wave}
                type="number"
                placeholder="Price (Nat)"
                required={false}
                value={pgl1_price}
                onChange={(e) => set_pgl1_price((e.target as HTMLInputElement).value)}
              />
              <InputFieldComponent
                name="requiredAge"
                icon={faPersonCane}
                type="number"
                placeholder="Required Age (Nat)"
                required={false}
                value={pgl1_required_age}
                onChange={(e) => set_pgl1_required_age((e.target as HTMLInputElement).value)}
              />
            </div>

            <InputFieldComponent
              name="releaseDate"
              icon={faCalendarDays}
              type="date"
              placeholder="Release Date"
              required={false}
              value={releaseDateStr}
              onChange={(e) => setReleaseDateStr((e.target as HTMLInputElement).value)}
            />

            <div className="grid grid-cols-2 gap-4">
              <DropDownComponent
                name="status"
                icon={faCheck}
                placeholder="Status"
                className=""
                value={statusCode}
                options={statusOptions.map((s) => ({ code: s.code, name: s.name }))}
                onChange={(e) =>
                  setStatusCode((e.target as HTMLSelectElement).value as 'publish' | 'notPublish')
                }
              />
              <MultiSelectComponent
                maxValue={3}
                placeholder="Category"
                selected={selectedCategories}
                options={categoryOptions}
                onChange={setSelectedCategories}
              />
            </div>

            {/* Tags */}
            <div className="flex items-center gap-3">
              <input
                className="shadow-sunken-sm rounded-lg px-3 py-2 bg-transparent w-64"
                placeholder="Add tag and press +"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
              />
              <button
                type="button"
                className="px-3 py-2 rounded-md shadow-flat-sm hover:shadow-arise-sm"
                onClick={addTag}
              >
                +
              </button>
            </div>
            {appTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {appTags.map((t) => (
                  <span key={t} className="px-2 py-1 rounded-full border text-xs">
                    {t}{' '}
                    <button type="button" className="ml-1 text-danger" onClick={() => removeTag(t)}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Designs */}
      <section className="flex flex-col gap-8">
        <hr className="border-t border-background_disabled" />
        <h2 className="text-2xl font-semibold pb-2">Designs</h2>

        <BannerFieldComponent
          title="Banner Image"
          imageUrl={pgl1_banner_image}
          onChange={handleBannerChange}
        />

        <div className="w-full flex gap-4 justify-evenly">
          <div className="w-1/2">
            <CarouselPreview
              items={previewItems}
              initialIndex={0}
              showThumbnails
              htmlElement={
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handlePreviewUpload}
                  className="h-20 aspect-video bg-transparent shadow-sunken-sm rounded-lg"
                />
              }
            />
          </div>
          <div className="w-1/3">
            <PhotoFieldComponent
              title="Cover Image"
              imageUrl={pgl1_cover_image}
              onChange={handleCoverChange}
            />
          </div>
        </div>
      </section>

      {/* Distributions */}
      <section className="flex flex-col gap-4">
        <hr className="border-t border-background_disabled" />
        <h2 className="text-2xl font-semibold pb-2">Distributions</h2>
        <MultiSelectComponent
          maxValue={4}
          placeholder="Select your Distribution"
          selected={selectedDistribution}
          options={[
            { value: 'web', label: 'Web' },
            { value: 'windows', label: 'Windows' },
            { value: 'macos', label: 'MacOS' },
            { value: 'linux', label: 'Linux' },
          ]}
          onChange={setSelectedDistribution}
        />
      </section>

      {/* Web build */}
      {hasDist(selectedDistribution, 'web') && (
        <section className="flex flex-col gap-4">
          <hr className="border-t border-background_disabled" />
          <h2 className="text-2xl font-semibold pb-2">Web Build</h2>
          <InputFieldComponent
            name="webUrl"
            icon={faGlobe}
            type="text"
            required={false}
            placeholder=" https://your-app.example/play"
            value={webUrl}
            onChange={(e) => setWebUrl((e.target as HTMLInputElement).value)}
          />

          {/* Web Hardware Requirements */}
          <div className="mt-6 p-4 bg-surface rounded-lg">
            <h3 className="text-lg font-medium mb-3">Web Hardware Requirements</h3>
            <div className="grid grid-cols-2 gap-4">
              <InputFieldComponent
                name="processor"
                icon={faBrain}
                type="text"
                required={false}
                placeholder="Processor"
                value={webHardware?.processor || ''}
                onChange={(e) =>
                  setWebHardware((hw) => (hw ? { ...hw, processor: e.target.value } : null))
                }
              />
              <InputFieldComponent
                name="memory"
                icon={faBrain}
                type="number"
                placeholder="Memory (bytes)"
                required={false}
                value={webHardware?.memory || ''}
                onChange={(e) =>
                  setWebHardware((hw) => (hw ? { ...hw, memory: e.target.value } : null))
                }
              />
              <InputFieldComponent
                name="storage"
                icon={faBrain}
                type="number"
                placeholder="Storage (bytes)"
                required={false}
                value={webHardware?.storage || ''}
                onChange={(e) =>
                  setWebHardware((hw) => (hw ? { ...hw, storage: e.target.value } : null))
                }
              />
              <InputFieldComponent
                name="graphics"
                icon={faBrain}
                type="text"
                placeholder="Graphics"
                required={false}
                value={webHardware?.graphics || ''}
                onChange={(e) =>
                  setWebHardware((hw) => (hw ? { ...hw, graphics: e.target.value } : null))
                }
              />
            </div>
            <InputFieldComponent
              name="notes"
              icon={faBrain}
              type="text"
              placeholder="Additional Notes"
              required={false}
              value={webHardware?.notes || ''}
              onChange={(e) =>
                setWebHardware((hw) => (hw ? { ...hw, notes: e.target.value } : null))
              }
            />
          </div>
        </section>
      )}

      {/* Native per-OS */}
      {(['windows', 'macos', 'linux'] as OSKey[]).map((osKey) =>
        hasDist(selectedDistribution, osKey) ? (
          <section key={osKey} className="flex flex-col gap-4">
            <hr className="border-t border-background_disabled" />
            <h2 className="text-2xl font-semibold pb-2 capitalize">{osKey} Distribution</h2>

            <ManifestList
              osKey={osKey}
              items={manifestsByOS[osKey]}
              onAdd={() =>
                setManifestsByOS((prev) => ({
                  ...prev,
                  [osKey]: [...prev[osKey], blankManifest()],
                }))
              }
              onRemove={(idx) =>
                setManifestsByOS((prev) => ({
                  ...prev,
                  [osKey]: prev[osKey].filter((_, i) => i !== idx),
                }))
              }
              onChange={(idx, _field, value) =>
                setManifestsByOS((prev) => ({
                  ...prev,
                  [osKey]: prev[osKey].map((m, i) => (i === idx ? { ...m, version: value } : m)),
                }))
              }
              onUploadFile={(idx, file) => uploadBuildForManifest(osKey, idx, file)}
              metaList={uploadedMeta[osKey] ?? []}
            />

            {/* Hardware Requirements for this OS */}
            <div className="mt-6 p-4 bg-surface rounded-lg">
              <h3 className="text-lg font-medium mb-3">Hardware Requirements</h3>
              <div className="grid grid-cols-2 gap-4">
                <InputFieldComponent
                  name="processor"
                  icon={faBrain}
                  type="text"
                  placeholder="Processor"
                  required={false}
                  value={hardwareByOS[osKey].processor}
                  onChange={(e) =>
                    setHardwareByOS((prev) => ({
                      ...prev,
                      [osKey]: { ...prev[osKey], processor: e.target.value },
                    }))
                  }
                />
                <InputFieldComponent
                  name="memory"
                  icon={faBrain}
                  type="number"
                  placeholder="Memory (bytes)"
                  required={false}
                  value={hardwareByOS[osKey].memory}
                  onChange={(e) =>
                    setHardwareByOS((prev) => ({
                      ...prev,
                      [osKey]: { ...prev[osKey], memory: e.target.value },
                    }))
                  }
                />
                <InputFieldComponent
                  name="storage"
                  icon={faBrain}
                  type="number"
                  placeholder="Storage (bytes)"
                  required={false}
                  value={hardwareByOS[osKey].storage}
                  onChange={(e) =>
                    setHardwareByOS((prev) => ({
                      ...prev,
                      [osKey]: { ...prev[osKey], storage: e.target.value },
                    }))
                  }
                />
                <InputFieldComponent
                  name="graphics"
                  icon={faBrain}
                  type="text"
                  placeholder="Graphics"
                  required={false}
                  value={hardwareByOS[osKey].graphics}
                  onChange={(e) =>
                    setHardwareByOS((prev) => ({
                      ...prev,
                      [osKey]: { ...prev[osKey], graphics: e.target.value },
                    }))
                  }
                />
              </div>
              <InputFieldComponent
                name="notes"
                icon={faBrain}
                type="text"
                placeholder="Additional Notes"
                required={false}
                value={hardwareByOS[osKey].notes}
                onChange={(e) =>
                  setHardwareByOS((prev) => ({
                    ...prev,
                    [osKey]: { ...prev[osKey], notes: e.target.value },
                  }))
                }
              />
            </div>
          </section>
        ) : null,
      )}

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={busy}
          className={`shadow-flat-sm my-6 px-6 py-3 rounded-md ${
            busy ? 'opacity-60 cursor-not-allowed' : ''
          }`}
        >
          {busy ? 'Updating...' : 'Update Game'}
        </button>
      </div>
    </form>
  );
}

function ManifestList({
  osKey,
  items,
  onChange,
  onAdd,
  onRemove,
  onUploadFile,
  metaList = [],
}: {
  osKey: OSKey;
  items: Manifest[]; // <= ganti ke Manifest dari .did
  onChange: (idx: number, field: 'version', value: string) => void; // kita cuma edit 'version'
  onAdd: () => void;
  onRemove: (idx: number) => void;
  onUploadFile: (idx: number, file: File) => void;
  metaList?: { name?: string; key?: string }[];
}) {
  const fileInputs = useRef<Record<number, HTMLInputElement | null>>({});
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const prevent = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (i: number, e: React.DragEvent<HTMLDivElement>) => {
    prevent(e);
    setDraggingIndex(null);
    const f = e.dataTransfer.files?.[0];
    if (f) onUploadFile(i, f);
  };

  return (
    <div className="space-y-4">
      {items.map((m, i) => {
        const meta = metaList[i] || {};
        const uploaded = isUploaded(m); // <= pakai helper baru

        const sizeMB =
          typeof m.size_bytes === 'bigint' && m.size_bytes > 0n
            ? `${(Number(m.size_bytes) / (1024 * 1024)).toFixed(2)} MB`
            : '';

        return (
          <div
            key={`${osKey}-${i}`}
            className="grid grid-cols-2 gap-4 p-4 rounded-xl border border-white/10"
          >
            <InputFieldComponent
              name="version"
              icon={faVestPatches}
              type="text"
              placeholder="Version (e.g. 1.0.0)"
              value={m.version}
              onChange={(e) => onChange(i, 'version', e.target.value)}
            />

            {/* Dropzone + tombol pilih file */}
            <div className="flex flex-col gap-2">
              <div
                onDragEnter={(e) => {
                  prevent(e);
                  setDraggingIndex(i);
                }}
                onDragOver={prevent}
                onDragLeave={(e) => {
                  prevent(e);
                  setDraggingIndex((d) => (d === i ? null : d));
                }}
                onDrop={(e) => handleDrop(i, e)}
                onClick={() => fileInputs.current[i]?.click()}
                className={`w-full h-24 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition
                  ${draggingIndex === i ? 'border-primary/70 bg-primary/5' : 'border-white/15 hover:border-white/30'}
                `}
                title="Klik untuk pilih file, atau drag & drop ke sini"
              >
                <div className="text-center text-sm opacity-80">
                  {uploaded
                    ? 'Re-upload Build (drag & drop / klik)'
                    : 'Upload Build (drag & drop / klik)'}
                </div>
              </div>

              <input
                type="file"
                className="hidden"
                ref={(el) => (fileInputs.current[i] = el)}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onUploadFile(i, f);
                  e.currentTarget.value = '';
                }}
              />
            </div>

            {/* Status baris penuh */}
            <div className="col-span-2 flex items-center gap-3 text-sm">
              {uploaded ? (
                <span className="px-2 py-1 rounded-md border border-emerald-500/40 text-emerald-400">
                  Uploaded ✓
                </span>
              ) : meta.name ? (
                <span className="px-2 py-1 rounded-md border border-white/15">
                  File dipilih: <span className="opacity-80">{meta.name}</span>
                </span>
              ) : (
                <span className="px-2 py-1 rounded-md border border-amber-500/40 text-amber-400">
                  Belum ada file
                </span>
              )}

              {uploaded && meta.name && <span className="opacity-60">{meta.name}</span>}
              {uploaded && sizeMB && <span className="opacity-60">{sizeMB}</span>}
            </div>

            <div className="col-span-2 flex justify-end">
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="px-3 py-1 rounded-md border border-danger text-danger hover:bg-danger/10"
              >
                Remove
              </button>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={onAdd}
        className="px-4 py-2 rounded-md shadow-flat-sm hover:shadow-arise-sm"
      >
        + Add Manifest
      </button>
    </div>
  );
}
