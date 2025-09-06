// UpdateApp.tsx (replaces your old CreateApp.tsx for edit flow)
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
import { Option } from '../../interfaces/Additional';
import CarouselPreview, { MediaItem } from '../../components/organisms/CarouselPreview';
import { AppStatus, ManifestInterface, AppInterface } from '../../interfaces/app/AppInterface';
import allCategories from '../../assets/json/app/categories.json';
import { useWallet } from '../../contexts/WalletContext';
import { getAppByDeveloperId } from '../../blockchain/icp/app/services/ICPAppService';
import { BannerFieldComponent } from '../../components/atoms/BannerFieldComponent';
import { OSKey } from '../../interfaces/CoreInterface';
import { dateStrToNs, hasDist, nowNs, nsToDateStr, toOSKey } from '../../utils/Additional';
import { useParams } from 'react-router-dom';
import { EditAppService as EditService } from '../../services/studio/EditAppService';

export default function EditAppPage() {
  const { wallet } = useWallet();
  /** ======================
   *  Storage App ID (folder)
   *  ====================== */
  const { appId } = useParams();
  const [apps, setApps] = useState<AppInterface[] | null>(null);
  const [loadedApp, setLoadedApp] = useState<AppInterface | null>(null);
  const EditAppService = useMemo(
    () => new EditService({ wallet, appId: Number(appId) }),
    [wallet, appId],
  );

  useEffect(() => {
    (async () => {
      try {
        await EditAppService.prepareStorage();
      } catch (e) {
        console.error('prepareStorage failed:', e);
      }
    })();
  }, [EditAppService]);

  // fetch all dev apps (so we can hydrate by appId)
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        if (!wallet) return;
        const listApp = await getAppByDeveloperId({ wallet });
        if (isMounted) setApps(listApp);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [wallet]);

  // find current app by appId once apps are loaded
  useEffect(() => {
    if (!apps || !appId) return;
    const found = apps.find((a) => String(a.appId) === String(appId));
    if (found) setLoadedApp(found);
  }, [apps, appId]);

  // ===== General form =====
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState<string>('');
  const [bannerImage, setBannerImage] = useState<string>('');

  const [priceStr, setPriceStr] = useState(''); // bigint
  const [requiredAgeStr, setRequiredAgeStr] = useState(''); // bigint
  const [releaseDateStr, setReleaseDateStr] = useState(nsToDateStr(nowNs())); // YYYY-MM-DD
  const [selectedCategories, setSelectedCategories] = useState<Option[]>([]);
  const statusOptions = [
    { code: 'publish', name: 'Publish' },
    { code: 'notPublish', name: 'Not Publish' },
  ];
  const [statusCode, setStatusCode] = useState('publish');

  // Tags (string array)
  const [tagInput, setTagInput] = useState('');
  const [appTags, setAppTags] = useState<string[]>([]);

  // Previews (URL public Wasabi)
  const [previewItems, setPreviewItems] = useState<MediaItem[]>([]);

  // Distribusi/OS
  const [selectedDistribution, setSelectedDistribution] = useState<Option[]>([]);

  const [uploadedMeta, setUploadedMeta] = useState<
    Record<OSKey, { name?: string; key?: string }[]>
  >({
    windows: [],
    macos: [],
    linux: [],
  });

  // per-OS manifests
  const blankManifest = (): ManifestInterface => ({
    version: '',
    size: 0,
    bucket: '',
    basePath: '',
    checksum: '',
    content: '',
    createdAt: 0n,
  });
  const [manifestsByOS, setManifestsByOS] = useState<Record<OSKey, ManifestInterface[]>>({
    windows: [],
    macos: [],
    linux: [],
  });

  useEffect(() => {
    (['windows', 'macos', 'linux'] as OSKey[]).forEach((k) => {
      setUploadedMeta((prev) => {
        const want = manifestsByOS[k].length;
        const cur = prev[k]?.length ?? 0;
        if (want === cur) return prev;
        const nextForK = Array.from({ length: want }, (_, i) => prev[k]?.[i] ?? {});
        return { ...prev, [k]: nextForK };
      });
    });
  }, [manifestsByOS]);

  // native shared hw
  const [processor, setProcessor] = useState('');
  const [memoryStr, setMemoryStr] = useState(''); // bigint
  const [storageStr, setStorageStr] = useState(''); // bigint
  const [graphics, setGraphics] = useState('');
  const [notes, setNotes] = useState('');
  const categoryOptions = allCategories.categories.map((tag: any) => ({
    value: tag.id,
    label: tag.name,
  }));
  // web build (URL app web public)
  const [webUrl, setWebUrl] = useState('');

  // UI
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ ok?: string; err?: string }>({});

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
   *  HYDRATE FROM EXISTING APP
   *  ====================== */
  useEffect(() => {
    if (loadedApp) {
      const h = EditAppService.hydrateFromApp(loadedApp, categoryOptions);
      setTitle(h.title);
      setDescription(h.description);
      setCoverImage(h.coverImage);
      setBannerImage(h.bannerImage);
      setPriceStr(h.priceStr);
      setRequiredAgeStr(h.requiredAgeStr);
      setReleaseDateStr(h.releaseDateStr);
      setStatusCode(h.statusCode);
      setSelectedCategories(h.selectedCategories);
      setAppTags(h.appTags);
      setPreviewItems(h.previewItems);
      setSelectedDistribution(h.selectedDistribution);
      setManifestsByOS(h.manifestsByOS);
      setWebUrl(h.webUrl);
      setProcessor(h.processor);
      setMemoryStr(h.memory);
      setStorageStr(h.storage);
      setGraphics(h.graphics);
      setNotes(h.notes);
    }
  }, [loadedApp]);

  /** ======================
   *  UPLOAD HELPERS (Wasabi)
   *  ====================== */
  async function handleAssetChange(e: React.ChangeEvent<HTMLInputElement>) {
    const apiUrl = (await EditAppService.handleAssetChange({ e })) || '';
    setCoverImage(apiUrl);
  }

  async function handlePreviewUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const item = await EditAppService.handlePreviewUpload(e);
    if (!item) return;
    setPreviewItems((prev) => [...prev, item]);
  }

  // Build file upload per manifest
  async function uploadBuildForManifest(osKey: OSKey, idx: number, file: File) {
    try {
      // tampilkan nama sementara (sebelum await, biar langsung kelihatan)
      setUploadedMeta((prev) => {
        const copy = { ...prev };
        const list = (copy[osKey] ?? []).slice();
        list[idx] = { ...(list[idx] || {}), name: file.name }; // temp
        copy[osKey] = list;
        return copy;
      });

      // ⚠️ get "meta" from service!
      const {
        manifestsByOS: next,
        message,
        meta,
      } = await EditAppService.uploadBuildForManifest(osKey, idx, file, manifestsByOS, {
        uploadArtifact: true,
        validateSemver: false,
      });

      setManifestsByOS(next);
      setUploadedMeta((prev) => {
        const copy = { ...prev };
        const list = (copy[osKey] ?? []).slice();
        list[idx] = { name: meta.filename, key: meta.artifactKey }; // final
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
   *  Payload ke canister
   *  ====================== */

  // ====== submit ======
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setBusy(true);
      setToast({});

      if (!EditAppService) throw new Error('Wallet atau AppId tidak tersedia.');

      await EditAppService.submitUpdate({
        // === General ===
        title,
        description,
        bannerImage,
        coverImage,
        priceStr,
        requiredAgeStr,
        releaseDateNs: releaseDateStr ? dateStrToNs(releaseDateStr) : undefined,
        statusCode: statusCode as 'publish' | 'notPublish',
        selectedCategories,
        appTags,

        // === Previews ===
        previewItems,

        // === Distributions & manifests ===
        selectedDistribution,
        manifestsByOS,
        webUrl,

        // === Hardware (shared untuk semua OS yang dipilih) ===
        processor,
        memoryStr,
        storageStr,
        graphics,
        notes,
      });

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
    if (!t) return;
    if (appTags.includes(t)) return;
    setAppTags((p) => [...p, t]);
    setTagInput('');
  };
  const removeTag = (t: string) => setAppTags((p) => p.filter((x) => x !== t));

  return (
    <form onSubmit={onSubmit} className="container flex flex-col gap-8">
      <h1 className="text-3xl pb-4">Update App</h1>

      {toast.ok && (
        <div className="rounded-lg border border-success text-success px-4 py-2">{toast.ok}</div>
      )}
      {toast.err && (
        <div className="rounded-lg border border-danger text-danger px-4 py-2">{toast.err}</div>
      )}

      <div className="flex gap-12">
        {/* left */}
        <div className="flex flex-col gap-8 w-2/3">
          <section className="flex flex-col gap-4">
            <h2 className="text-2xl font-semibold pb-2">General</h2>

            <InputFieldComponent
              name="title"
              icon={faHeading}
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle((e.target as HTMLInputElement).value)}
            />
            <InputFieldComponent
              name="description"
              icon={faMessage}
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription((e.target as HTMLInputElement).value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <InputFieldComponent
                name="price"
                icon={faMoneyBill1Wave}
                type="number"
                placeholder="Price (Nat)"
                value={priceStr}
                onChange={(e) => setPriceStr((e.target as HTMLInputElement).value)}
              />
              <InputFieldComponent
                name="requiredAge"
                icon={faPersonCane}
                type="number"
                placeholder="Required Age (Nat)"
                value={requiredAgeStr}
                onChange={(e) => setRequiredAgeStr((e.target as HTMLInputElement).value)}
              />
            </div>

            <InputFieldComponent
              name="releaseDate"
              icon={faCalendarDays}
              type="date"
              placeholder="Release Date"
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
                options={statusOptions.map((s) => ({
                  code: s.code,
                  name: s.name,
                }))}
                onChange={(e) =>
                  setStatusCode((e.target as HTMLSelectElement).value as keyof AppStatus)
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

        {/* Banner & Cover: setImageUrl DI-INTERCEPT untuk upload */}
        <BannerFieldComponent
          title="Banner Image"
          imageUrl={bannerImage}
          onChange={handleAssetChange}
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
              imageUrl={coverImage}
              onChange={handleAssetChange}
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
            placeholder="https://your-app.example/play"
            value={webUrl}
            onChange={(e) => setWebUrl((e.target as HTMLInputElement).value)}
          />
        </section>
      )}

      {/* Native per-OS */}
      {(['windows', 'macos', 'linux'] as OSKey[]).map((osKey) =>
        hasDist(selectedDistribution, osKey) ? (
          <section key={osKey} className="flex flex-col gap-4">
            <hr className="border-t border-background_disabled" />
            <h2 className="text-2xl font-semibold pb-2 capitalize">{osKey} Manifests</h2>

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
              onChange={(idx, field, value) =>
                setManifestsByOS((prev) => ({
                  ...prev,
                  [osKey]: prev[osKey].map((m, i) =>
                    i === idx
                      ? {
                          ...m,
                          [field]: field === 'size' ? Number(value || '0') : (value as any),
                        }
                      : m,
                  ),
                }))
              }
              onUploadFile={(idx, file) => uploadBuildForManifest(osKey, idx, file)}
              metaList={uploadedMeta[osKey] ?? []}
            />
          </section>
        ) : null,
      )}

      {/* Native shared hardware */}
      {(hasDist(selectedDistribution, 'windows') ||
        hasDist(selectedDistribution, 'macos') ||
        hasDist(selectedDistribution, 'linux')) && (
        <section className="flex flex-col gap-4">
          <h3 className="text-xl font-semibold pt-2">Native Hardware</h3>
          <div className="grid grid-cols-2 gap-4">
            <InputFieldComponent
              name="processor"
              icon={faBrain}
              type="text"
              placeholder="Processor"
              value={processor}
              onChange={(e) => setProcessor((e.target as HTMLInputElement).value)}
            />
            <InputFieldComponent
              name="memory"
              icon={faBrain}
              type="number"
              placeholder="Memory (Nat)"
              value={memoryStr}
              onChange={(e) => setMemoryStr((e.target as HTMLInputElement).value)}
            />
            <InputFieldComponent
              name="storage"
              icon={faBrain}
              type="number"
              placeholder="Storage (Nat)"
              value={storageStr}
              onChange={(e) => setStorageStr((e.target as HTMLInputElement).value)}
            />
            <InputFieldComponent
              name="graphics"
              icon={faBrain}
              type="text"
              placeholder="Graphics"
              value={graphics}
              onChange={(e) => setGraphics((e.target as HTMLInputElement).value)}
            />
          </div>
          <InputFieldComponent
            name="notes"
            icon={faBrain}
            type="text"
            placeholder="Additional Notes"
            value={notes}
            onChange={(e) => setNotes((e.target as HTMLInputElement).value)}
          />
        </section>
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
          {busy ? 'Updating...' : 'Update App'}
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
  items: ManifestInterface[];
  onChange: (idx: number, field: keyof ManifestInterface, value: string) => void;
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
        const uploaded = Boolean(m.checksum && m.basePath); // sudah tersimpan di manifest
        const hasName = Boolean(meta.name);
        const sizeMB = typeof m.size === 'number' && m.size > 0 ? `${m.size} MB` : '';

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
              ) : hasName ? (
                <span className="px-2 py-1 rounded-md border border-white/15">
                  File dipilih: <span className="opacity-80">{meta.name}</span>
                </span>
              ) : (
                <span className="px-2 py-1 rounded-md border border-amber-500/40 text-amber-400">
                  Belum ada file
                </span>
              )}

              {/* info tambahan yang sudah tersedia dari manifest */}
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
