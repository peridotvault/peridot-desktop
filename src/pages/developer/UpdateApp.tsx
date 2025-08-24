// UpdateApp.tsx (replaces your old CreateApp.tsx for edit flow)
// @ts-ignore
import React, { useEffect, useMemo, useRef, useState } from "react";
import { InputFieldComponent } from "../../components/atoms/InputFieldComponent";
import {
  faBrain,
  faCheck,
  faGlobe,
  faHeading,
  faMessage,
  faMoneyBill1Wave,
  faPersonCane,
  faCalendarDays,
} from "@fortawesome/free-solid-svg-icons";
import { PhotoFieldComponent } from "../../components/atoms/PhotoFieldComponent";
import { DropDownComponent } from "../../components/atoms/DropDownComponent";
import { MultiSelectComponent } from "../../components/atoms/MultiSelectComponent";
import { Option } from "../../interfaces/Additional";
import CarouselPreview, {
  MediaItem,
} from "../../components/organisms/CarouselPreview";

import {
  AppStatus,
  ManifestInterface,
  Preview,
  Distribution,
  OS,
  UpdateAppInterface,
  AppInterface,
} from "../../interfaces/app/AppInterface";
import allCategories from "../../assets/json/app/categories.json";
import { useWallet } from "../../contexts/WalletContext";
import {
  getAppByDeveloperId,
  updateApp, // <<< make sure this exists in ICPAppService
} from "../../blockchain/icp/app/services/ICPAppService";
import { BannerFieldComponent } from "../../components/atoms/BannerFieldComponent";
import { Opt, OSKey, ToOpt } from "../../interfaces/CoreInterface";
import {
  dateStrToNs,
  hasDist,
  nowNs,
  nsToDateStr,
  toOSKey,
} from "../../utils/Additional";

import { sha256Hex } from "../../utils/file";
import {
  initAppStorage,
  InitResp,
  safeFileName,
  uploadToPrefix,
} from "../../api/wasabiClient";
import { useParams } from "react-router-dom";
import { AnnouncementInterface, AnnouncementStatus, CreateAnnouncementInterface } from "../../interfaces/announcement/AnnouncementInterface";
import { createAnnouncement, getAllAnnouncementsByAppId } from "../../blockchain/icp/app/services/ICPAnnouncementService";

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function UpdateApp() {
  const { wallet } = useWallet();

  /** ======================
   *  Storage App ID (folder)
   *  ====================== */
  const { appId } = useParams();
  const [storage, setStorage] = useState<InitResp | null>(null);
  const [apps, setApps] = useState<AppInterface[] | null>(null);
  const [announcements, setAnnouncements] = useState<AnnouncementInterface[] | null>(null);
  const [loadedApp, setLoadedApp] = useState<AppInterface | null>(null);

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

  // Init Wasabi folder structure (cover/, previews/, builds/..., metadata/)
  useEffect(() => {
    (async () => {
      try {
        if (!wallet || !appId) return;
        const s = await initAppStorage(appId!);
        setStorage(s);
      } catch (e) {
        console.error("initAppStorage failed:", e);
      }
    })();
  }, [appId, wallet]);

  // Get all announcements by app id
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        if (!wallet) return;
        const listAnnouncement = await getAllAnnouncementsByAppId({ appId: Number(appId), wallet });
        if (isMounted) setAnnouncements(listAnnouncement);
      } catch (e) {
        console.error(e);
      }
    })();

    return () => {
      isMounted = false;
    }
  }, [appId, wallet])

  // ===== Announcements =====
  const [headline, setHeadline] = useState("");
  const [content, setContent] = useState("");
  const [announcementCoverImage, setAnnouncementCoverImage] = useState<string>("");
  const [announcementStatus, setAnnouncementStatus] = useState("");
  const [isAnnouncementPinned, setIsAnnouncementPinned] = useState(false);
  const announcementStatusOptions = [
    {code: "draft", name: "Draft"},
    {code: "published", name: "Published"},
    {code: "archived", name: "Archived"},
  ]

  // ===== General form =====
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState<string>("");
  const [bannerImage, setBannerImage] = useState<string>("");

  const [priceStr, setPriceStr] = useState(""); // bigint
  const [requiredAgeStr, setRequiredAgeStr] = useState(""); // bigint
  const [releaseDateStr, setReleaseDateStr] = useState(nsToDateStr(nowNs())); // YYYY-MM-DD
  const [selectedCategories, setSelectedCategories] = useState<Option[]>([]);
  const statusOptions = [
    { code: "publish", name: "Publish" },
    { code: "notPublish", name: "Not Publish" },
  ];
  const [statusCode, setStatusCode] = useState("publish");

  // Tags (string array)
  const [tagInput, setTagInput] = useState("");
  const [appTags, setAppTags] = useState<string[]>([]);

  // Previews (URL public Wasabi)
  const [previewItems, setPreviewItems] = useState<MediaItem[]>([]);
  const previewsToPayload: Preview[] = useMemo(() => {
    return previewItems
      .map((it) => {
        const url =
          (it as any).storageKey ??
          (it as any).src ??
          (it as any).url ?? // kalau ada
          "";
        if (typeof url !== "string" || url.trim() === "") return null; // ⬅️ filter
        return {
          kind:
            it.kind === "video"
              ? ({ video: null } as const)
              : ({ image: null } as const),
          url,
        };
      })
      .filter(Boolean) as Preview[];
  }, [previewItems]);

  // Distribusi/OS
  const [selectedDistribution, setSelectedDistribution] = useState<Option[]>(
    []
  );

  // per-OS manifests
  const blankManifest = (): ManifestInterface => ({
    version: "",
    size: 0,
    bucket: "",
    basePath: "",
    checksum: "",
    content: "",
    createdAt: 0n,
  });
  const [manifestsByOS, setManifestsByOS] = useState<
    Record<OSKey, ManifestInterface[]>
  >({
    windows: [],
    macos: [],
    linux: [],
  });

  // native shared hw
  const [processor, setProcessor] = useState("");
  const [memoryStr, setMemoryStr] = useState(""); // bigint
  const [storageStr, setStorageStr] = useState(""); // bigint
  const [graphics, setGraphics] = useState("");
  const [notes, setNotes] = useState("");
  const categoryOptions = allCategories.categories.map((tag: any) => ({
    value: tag.id,
    label: tag.name,
  }));
  // web build (URL app web public)
  const [webUrl, setWebUrl] = useState("");

  // UI
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ ok?: string; err?: string }>({});

  // sync manifests grid when distribution changes
  useEffect(() => {
    const chosenOS = new Set(
      selectedDistribution
        .map((o) => o.value)
        .filter((v) => v !== "web")
        .map((v) => toOSKey(v))
    );
    setManifestsByOS((prev) => {
      const next = { ...prev };
      (["windows", "macos", "linux"] as OSKey[]).forEach((k) => {
        if (chosenOS.has(k) && next[k].length === 0)
          next[k] = [blankManifest()];
        if (!chosenOS.has(k)) next[k] = [];
      });
      return next;
    });
  }, [selectedDistribution]);

  /** ======================
   *  HYDRATE FROM EXISTING APP
   *  ====================== */
  function osKeyFromOS(os: OS): OSKey {
    if ((os as any).windows !== undefined) return "windows";
    if ((os as any).macos !== undefined) return "macos";
    return "linux";
  }

  function extLooksVideo(u: string) {
    return /(\.mp4|\.webm|\.mov|video\=)/i.test(u);
  }

  function unwrapOpt<T>(o: any): T | undefined {
    // Candid Option ↔︎ [] | [T]
    return Array.isArray(o) ? (o.length ? o[0] : undefined) : o;
  }

  function hydrateFromApp(a: AppInterface) {
    // --- unwrapping semua Option dari canister
    const banner = unwrapOpt<string>((a as any).bannerImage);
    const cover = unwrapOpt<string>((a as any).coverImage);
    const prevs = unwrapOpt<Preview[]>((a as any).previews) ?? [];
    const cats = unwrapOpt<string[]>((a as any).category) ?? [];
    const tags = unwrapOpt<string[]>((a as any).appTags) ?? [];
    const dists = unwrapOpt<Distribution[]>((a as any).distributions) ?? [];
    const relNs = unwrapOpt<bigint>((a as any).releaseDate);

    // --- general
    setTitle(a.title ?? "");
    setDescription(a.description ?? "");
    setCoverImage(cover ?? "");
    setBannerImage(banner ?? "");

    setPriceStr(
      a.price ? String((Number(a.price) / 1e8) as unknown as bigint) : ""
    );
    setRequiredAgeStr(
      a.requiredAge ? String(a.requiredAge as unknown as bigint) : ""
    );
    setReleaseDateStr(relNs ? nsToDateStr(relNs as any) : "");

    // status
    const st = (a.status || {}) as any;
    setStatusCode(st.publish !== undefined ? "publish" : "notPublish");

    // categories -> cocokkan ke options by label
    const selected = categoryOptions.filter((o) => cats.includes(o.label));
    setSelectedCategories(selected);

    setAppTags([...tags]);

    // previews -> MediaItem[] (skip yang tidak punya url)
    const pitems: MediaItem[] = prevs
      .map((p) => {
        const url = (p as any)?.url;
        if (!url) return null;
        return {
          kind:
            p.kind && (p.kind as any).video !== undefined
              ? "video"
              : extLooksVideo(url)
              ? "video"
              : "image",
          src: url,
          alt: "preview",
        } as MediaItem;
      })
      .filter(Boolean) as MediaItem[];
    setPreviewItems(pitems);

    // distributions -> selected + manifests + HW
    const opts: Option[] = [];
    const nextManifests: Record<OSKey, ManifestInterface[]> = {
      windows: [],
      macos: [],
      linux: [],
    };

    let _web = "";
    let hw = {
      processor: "",
      memory: "0",
      storage: "0",
      graphics: "",
      notes: "",
    };

    dists.forEach((d) => {
      if ((d as any).web) {
        opts.push({ value: "web", label: "Web" });
        _web = (d as any).web.url || "";
        return;
      }
      if ((d as any).native) {
        const n = (d as any).native;
        const osKey = osKeyFromOS(n.os);
        if (!opts.find((o) => o.value === osKey)) {
          opts.push({
            value: osKey,
            label:
              osKey === "macos"
                ? "MacOS"
                : osKey.charAt(0).toUpperCase() + osKey.slice(1),
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

    setSelectedDistribution(opts);
    setManifestsByOS(nextManifests);
    setWebUrl(_web);

    setProcessor(hw.processor);
    setMemoryStr(hw.memory || "");
    setStorageStr(hw.storage || "");
    setGraphics(hw.graphics);
    setNotes(hw.notes);
  }

  // run hydrate whenever loadedApp changes
  useEffect(() => {
    if (loadedApp) hydrateFromApp(loadedApp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedApp]);

  /** ======================
   *  UPLOAD HELPERS (Wasabi)
   *  ====================== */
  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !storage) return;
    try {
      const { key } = await uploadToPrefix({
        file,
        prefix: storage.prefixes.assets,
        fileName: safeFileName(file.name),
        contentType: file.type,
      });
      const apiUrl = `${import.meta.env.VITE_API_BASE}/files/${key}`;
      setCoverImage(apiUrl);
    } catch (err) {
      console.error("upload cover failed:", err);
    } finally {
      e.target.value = "";
    }
  }

  async function handleAnnouncementCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !storage) return;

    try {
      const {key} = await uploadToPrefix({
        file,
        prefix: storage.prefixes.announcements,
        fileName: safeFileName(file.name),
        contentType: file.type
      })

      const apiUrl = `${import.meta.env.VITE_API_BASE}/files/${key}`;
      setAnnouncementCoverImage(apiUrl);
    } catch(err) {
      console.error("Upload announcement cover failed:", err)
    } finally {
      e.target.value = "";
    }
  }

  async function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !storage) return;
    try {
      const { key } = await uploadToPrefix({
        file,
        prefix: storage.prefixes.assets,
        fileName: safeFileName(file.name),
        contentType: file.type,
      });
      const apiUrl = `${import.meta.env.VITE_API_BASE}/files/${key}`;
      setBannerImage(apiUrl);
    } catch (err) {
      console.error("upload banner failed:", err);
    } finally {
      e.target.value = "";
    }
  }

  const toOptVec = <T,>(arr?: T[] | null): Opt<T[]> =>
    arr && arr.length ? [arr] : [];

  function toWireFromUI(ui: {
    title: string;
    description: string;
    bannerImage?: string;
    coverImage?: string;
    previews?: Preview[];
    price?: bigint;
    requiredAge?: bigint;
    releaseDate?: bigint; // Timestamp (ns)
    status: AppStatus;
    createdAt?: bigint; // Timestamp (ns), opsional sesuai Motoko
    category?: string[];
    appTags?: string[];
    distributions?: Distribution[];
  }): UpdateAppInterface {
    return {
      title: ui.title,
      description: ui.description,
      status: ui.status,
      bannerImage: ToOpt(ui.bannerImage),
      coverImage: ToOpt(ui.coverImage),
      price: ui.price !== undefined ? ToOpt(ui.price) : [],
      requiredAge: ui.requiredAge !== undefined ? ToOpt(ui.requiredAge) : [],
      releaseDate: ui.releaseDate !== undefined ? ToOpt(ui.releaseDate) : [],
      previews: toOptVec(ui.previews),
      category: toOptVec(ui.category),
      appTags: toOptVec(ui.appTags),
      distributions: toOptVec(ui.distributions),
    };
  }

  // Previews: langsung dari <input type="file">
  async function handlePreviewUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !storage) return;

    try {
      const { key } = await uploadToPrefix({
        file,
        prefix: storage.prefixes.previews,
        fileName: safeFileName(file.name),
        contentType: file.type || "application/octet-stream",
      });

      const apiUrl = `${import.meta.env.VITE_API_BASE}/files/${key}`;
      const kind: MediaItem["kind"] = file.type.startsWith("video/")
        ? "video"
        : "image";

      setPreviewItems((prev) => [
        ...prev,
        { kind, src: apiUrl, alt: file.name },
      ]);
    } catch (err) {
      console.error("upload preview failed:", err);
    } finally {
      e.target.value = "";
    }
  }

  // Build file upload per manifest
  async function uploadBuildForManifest(osKey: OSKey, idx: number, file: File) {
    try {
      if (!storage) throw new Error("Storage belum siap. Coba lagi sebentar.");

      const m = manifestsByOS[osKey][idx];
      const version = (m.version || "").trim();
      if (!version)
        throw new Error("Isi field Version dulu sebelum upload build.");

      const filename = safeFileName(file.name);

      type BuildPrefixKey = "builds/windows" | "builds/macos" | "builds/linux";
      const baseBuildPrefix =
        storage.prefixes[`builds/${osKey}` as BuildPrefixKey];
      const versionPrefix = `${baseBuildPrefix}${version}/`;

      const checksum = await sha256Hex(file);
      const sizeMB = +(file.size / (1024 * 1024)).toFixed(3);

      setManifestsByOS((prev) => ({
        ...prev,
        [osKey]: prev[osKey].map((mm, i) =>
          i === idx
            ? {
                ...mm,
                bucket: storage.bucket,
                basePath: versionPrefix,
                size: sizeMB,
                checksum,
                content: filename,
                createdAt: nowNs(),
              }
            : mm
        ),
      }));

      setToast({ ok: `Uploaded ${osKey} build: ${filename}` });
    } catch (e: any) {
      console.error(e);
      setToast({ err: e.message || String(e) });
    }
  }

  /** ======================
   *  Payload ke canister
   *  ====================== */
  function distributionsToPayload(): Distribution[] {
    const list: Distribution[] = [];

    if (hasDist(selectedDistribution, "web")) {
      list.push({ web: { url: webUrl } } as any);
    }

    (["windows", "macos", "linux"] as OSKey[]).forEach((osk) => {
      if (!hasDist(selectedDistribution, osk)) return;
      const osVariant: OS =
        osk === "windows"
          ? ({ windows: null } as any)
          : osk === "macos"
          ? ({ macos: null } as any)
          : ({ linux: null } as any);
      list.push({
        native: {
          os: osVariant,
          manifests: manifestsByOS[osk],
          processor,
          memory: BigInt(memoryStr || "0"),
          storage: BigInt(storageStr || "0"),
          graphics,
          additionalNotes: notes ? notes : null,
        },
      } as any);
    });

    return list;
  }

  function mapStatusToBackend(code: string): AppStatus {
    if (code === "publish") return { publish: null } as unknown as AppStatus;
    return { notPublish: null } as unknown as AppStatus;
  }

  function mapAnnouncementStatusToBackend(code: string): AnnouncementStatus {
    if (code === "draft") return {draft: null} as unknown as AnnouncementStatus;
    if (code === "published") return {published: null} as unknown as AnnouncementStatus;
    return {archived: null} as unknown as AnnouncementStatus;
  }

  // ====== submit ======
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setBusy(true);
      setToast({});

      const categoriesText: string[] = selectedCategories.map((c) => c.label);
      if (categoriesText.length === 0 || categoriesText.length > 3) {
        throw new Error("Please choose 1 up to 3 categories.");
      }
      if (!coverImage) throw new Error("Cover image is required.");
      if (previewItems.length === 0)
        throw new Error("Please upload at least one preview.");

      const payload = {
        title,
        description,
        bannerImage, // (string | undefined)
        coverImage,
        previews: previewsToPayload.length ? previewsToPayload : undefined,
        price: priceStr ? BigInt(priceStr) : undefined,
        requiredAge: requiredAgeStr ? BigInt(requiredAgeStr) : undefined,
        releaseDate: releaseDateStr ? dateStrToNs(releaseDateStr) : undefined,
        status: mapStatusToBackend(statusCode),
        category: categoriesText.length ? categoriesText : undefined,
        appTags: appTags.length ? appTags : undefined,
        distributions: (() => {
          const d = distributionsToPayload();
          return d.length ? d : undefined;
        })(),
      } as any;

      if (!wallet || !appId)
        throw new Error("Wallet atau AppId tidak tersedia.");

      const wire = toWireFromUI(payload);
      await updateApp({ updateAppTypes: wire, appId: Number(appId), wallet });

      setToast({ ok: "App updated successfully 🎉" });
    } catch (err: any) {
      console.error(err);
      setToast({ err: err?.message ?? String(err) });
    } finally {
      setBusy(false);
    }
  }

  // ===== submit announcement =====
  const [isCreateAnnouncementFormDisplayed, setIsCreateAnnouncementFormDisplayed] = useState(false);
  async function onAnnouncementSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setBusy(true);
      setToast({});

      if (!announcementCoverImage) throw new Error("Announcement cover image is required.");

      const createData: CreateAnnouncementInterface = {
        headline: headline,
        content: content, 
        coverImage: announcementCoverImage,
        pinned: isAnnouncementPinned,
        status: mapAnnouncementStatusToBackend(announcementStatus)
      }

      const announcementCreated = await createAnnouncement({
        createAnnouncementTypes: createData,
        wallet: wallet,
        appId: BigInt(Number(appId))
      })
      
      // Refresh announcements list without reloading the page
      if (wallet && appId) {
        const listAnnouncement = await getAllAnnouncementsByAppId({ appId: Number(appId), wallet });
        setAnnouncements(listAnnouncement);
      }

      setIsCreateAnnouncementFormDisplayed(false);
      setHeadline("");
      setContent("");
      setAnnouncementCoverImage("");
      setIsAnnouncementPinned(false);
      setAnnouncementStatus("");
      setToast({ok: "Announcement created successfully 🎉"})
    } catch (err: any) {
      console.error(err)
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
    setTagInput("");
  };
  const removeTag = (t: string) => setAppTags((p) => p.filter((x) => x !== t));

  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div className="w-full flex flex-col justify-center px-8 pt-8 pb-32">
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
            <Tab label="Announcements" {...a11yProps(0)} />
            <Tab label="Settings" {...a11yProps(1)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <div>
            <h1 className="text-3xl pb-4">Announcements</h1>
            {toast.ok && (
              <div className="rounded-lg border border-success text-success px-4 py-2">
                {toast.ok}
              </div>
            )}
            {toast.err && (
              <div className="rounded-lg border border-danger text-danger px-4 py-2">
                {toast.err}
              </div>
            )}
            <div className="flex justify-start">
              <button
                type="button"
                disabled={busy}
                className={isCreateAnnouncementFormDisplayed ? "shadow-flat-sm my-6 px-6 py-3 rounded-md bg-red-500/20" : "shadow-flat-sm my-6 px-6 py-3 rounded-md bg-green-500/20"}
                onClick={() => setIsCreateAnnouncementFormDisplayed(!isCreateAnnouncementFormDisplayed)}
              >
                {isCreateAnnouncementFormDisplayed ? "Cancel": "Create New Announcement"}
                
              </button>
            </div>
            <form onSubmit={onAnnouncementSubmit} className={isCreateAnnouncementFormDisplayed ? "container flex flex-col gap-8" : "hidden"}>
              <h1 className="text-3xl pb-4">Announcements</h1>

              <InputFieldComponent
                name="Headline"
                icon={faHeading}
                type="text"
                placeholder="Headline"
                value={headline}
                onChange={(e) => setHeadline((e.target as HTMLInputElement).value)}
              />
              <InputFieldComponent
                name="Content"
                icon={faMessage}
                type="text"
                placeholder="Content"
                value={content}
                onChange={(e) => setContent((e.target as HTMLInputElement).value)}
              />
              <PhotoFieldComponent
                title="Cover Image"
                imageUrl={announcementCoverImage}
                onChange={handleAnnouncementCoverChange}
              />
              <DropDownComponent
                name="status"
                icon={faCheck}
                placeholder="Status"
                className=""
                value={announcementStatus}
                options={announcementStatusOptions.map((s) => ({
                  code: s.code,
                  name: s.name,
                }))}
                onChange={(e) =>
                  setAnnouncementStatus(
                    (e.target as HTMLSelectElement).value as keyof AppStatus
                  )
                }
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pin-announcement"
                  checked={isAnnouncementPinned}
                  onChange={(e) => setIsAnnouncementPinned(e.target.checked)}
                />
                <label htmlFor="pin-announcement" className="cursor-pointer select-none">
                  Pin Announcement
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={busy}
                  className={`shadow-flat-sm my-6 px-6 py-3 rounded-md ${
                    busy ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  {busy ? "Creating..." : "Create Announcement"}
                </button>
              </div>
            </form>
            <div className="flex flex-col gap-6">
            {announcements?.map((item, index) => (
                <div key={index} className="bg-gray-600 p-6 flex justify-between">
                  <div>
                    <div className="flex content-center mb-8">
                        <p className="text-xl capitalize mr-4">
                          {item.status && typeof item.status === 'object'
                            ? Object.keys(item.status)[0]
                            : ''}
                        </p>
                        <p>
                          {item.createdAt
                            ? new Date(Number(item.createdAt) / 1_000_000).toLocaleDateString()
                            : ""}
                        </p>
                    </div>
                    <div className="mb-4">
                      <p className="text-3xl font-bold">{item.headline}</p>
                    </div>
                    <div>
                      <p className="text-lg">{item.content}</p>
                    </div>
                  </div>
                  <div>
                    <img
                      src={item.coverImage}
                      className="w-64 h-72 object-cover"
                      alt="preview"
                    />
                  </div>
                </div>
            ))}
            </div>
          </div>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <form onSubmit={onSubmit} className="container flex flex-col gap-8">
            <h1 className="text-3xl pb-4">Update App</h1>

            {toast.ok && (
              <div className="rounded-lg border border-success text-success px-4 py-2">
                {toast.ok}
              </div>
            )}
            {toast.err && (
              <div className="rounded-lg border border-danger text-danger px-4 py-2">
                {toast.err}
              </div>
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
                    onChange={(e) =>
                      setDescription((e.target as HTMLInputElement).value)
                    }
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <InputFieldComponent
                      name="price"
                      icon={faMoneyBill1Wave}
                      type="number"
                      placeholder="Price (Nat)"
                      value={priceStr}
                      onChange={(e) =>
                        setPriceStr((e.target as HTMLInputElement).value)
                      }
                    />
                    <InputFieldComponent
                      name="requiredAge"
                      icon={faPersonCane}
                      type="number"
                      placeholder="Required Age (Nat)"
                      value={requiredAgeStr}
                      onChange={(e) =>
                        setRequiredAgeStr((e.target as HTMLInputElement).value)
                      }
                    />
                  </div>

                  <InputFieldComponent
                    name="releaseDate"
                    icon={faCalendarDays}
                    type="date"
                    placeholder="Release Date"
                    value={releaseDateStr}
                    onChange={(e) =>
                      setReleaseDateStr((e.target as HTMLInputElement).value)
                    }
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
                        setStatusCode(
                          (e.target as HTMLSelectElement).value as keyof AppStatus
                        )
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
                        <span
                          key={t}
                          className="px-2 py-1 rounded-full border text-xs"
                        >
                          {t}{" "}
                          <button
                            type="button"
                            className="ml-1 text-danger"
                            onClick={() => removeTag(t)}
                          >
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
                    imageUrl={coverImage}
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
                  { value: "web", label: "Web" },
                  { value: "windows", label: "Windows" },
                  { value: "macos", label: "MacOS" },
                  { value: "linux", label: "Linux" },
                ]}
                onChange={setSelectedDistribution}
              />
            </section>

            {/* Web build */}
            {hasDist(selectedDistribution, "web") && (
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
            {(["windows", "macos", "linux"] as OSKey[]).map((osKey) =>
              hasDist(selectedDistribution, osKey) ? (
                <section key={osKey} className="flex flex-col gap-4">
                  <hr className="border-t border-background_disabled" />
                  <h2 className="text-2xl font-semibold pb-2 capitalize">
                    {osKey} Manifests
                  </h2>

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
                                [field]:
                                  field === "size"
                                    ? Number(value || "0")
                                    : (value as any),
                              }
                            : m
                        ),
                      }))
                    }
                    onUploadFile={(idx, file) =>
                      uploadBuildForManifest(osKey, idx, file)
                    }
                  />
                </section>
              ) : null
            )}

            {/* Native shared hardware */}
            {(hasDist(selectedDistribution, "windows") ||
              hasDist(selectedDistribution, "macos") ||
              hasDist(selectedDistribution, "linux")) && (
              <section className="flex flex-col gap-4">
                <h3 className="text-xl font-semibold pt-2">Native Hardware</h3>
                <div className="grid grid-cols-2 gap-4">
                  <InputFieldComponent
                    name="processor"
                    icon={faBrain}
                    type="text"
                    placeholder="Processor"
                    value={processor}
                    onChange={(e) =>
                      setProcessor((e.target as HTMLInputElement).value)
                    }
                  />
                  <InputFieldComponent
                    name="memory"
                    icon={faBrain}
                    type="number"
                    placeholder="Memory (Nat)"
                    value={memoryStr}
                    onChange={(e) =>
                      setMemoryStr((e.target as HTMLInputElement).value)
                    }
                  />
                  <InputFieldComponent
                    name="storage"
                    icon={faBrain}
                    type="number"
                    placeholder="Storage (Nat)"
                    value={storageStr}
                    onChange={(e) =>
                      setStorageStr((e.target as HTMLInputElement).value)
                    }
                  />
                  <InputFieldComponent
                    name="graphics"
                    icon={faBrain}
                    type="text"
                    placeholder="Graphics"
                    value={graphics}
                    onChange={(e) =>
                      setGraphics((e.target as HTMLInputElement).value)
                    }
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
                  busy ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {busy ? "Updating..." : "Update App"}
              </button>
            </div>
          </form>
        </CustomTabPanel>
      </Box>
    </div>
  );
}

function ManifestList({
  osKey,
  items,
  onChange,
  onAdd,
  onRemove,
  onUploadFile,
}: {
  osKey: OSKey;
  items: ManifestInterface[];
  onChange: (
    idx: number,
    field: keyof ManifestInterface,
    value: string
  ) => void;
  onAdd: () => void;
  onRemove: (idx: number) => void;
  onUploadFile: (idx: number, file: File) => void;
}) {
  const fileInputs = useRef<Record<number, HTMLInputElement | null>>({});

  return (
    <div className="space-y-4">
      {items.map((m, i) => (
        <div
          key={`${osKey}-${i}`}
          className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-background_secondary"
        >
          <input
            className="shadow-sunken-sm rounded-lg px-3 py-2 bg-transparent"
            placeholder="Version (e.g. 1.0.0)"
            value={m.version}
            onChange={(e) => onChange(i, "version", e.target.value)}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-3 py-2 rounded-md shadow-flat-sm hover:shadow-arise-sm flex items-center gap-2"
              onClick={() => fileInputs.current[i]?.click()}
            >
              <span>Upload Build</span>
              <i className="text-sm">
                <svg viewBox="0 0 24 24" className="w-4 h-4">
                  <path
                    fill="currentColor"
                    d="M5 20h14v-2H5m14-9h-4V3H9v6H5l7 7Z"
                  />
                </svg>
              </i>
            </button>
            <input
              type="file"
              className="hidden"
              ref={(el) => (fileInputs.current[i] = el)}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUploadFile(i, f);
                e.currentTarget.value = "";
              }}
            />
          </div>

          <input
            className="shadow-sunken-sm rounded-lg px-3 py-2 bg-transparent"
            placeholder="Bucket"
            value={m.bucket}
            onChange={(e) => onChange(i, "bucket", e.target.value)}
          />
          <input
            className="shadow-sunken-sm rounded-lg px-3 py-2 bg-transparent"
            placeholder="Base Path"
            value={m.basePath}
            onChange={(e) => onChange(i, "basePath", e.target.value)}
          />
          <input
            className="shadow-sunken-sm rounded-lg px-3 py-2 bg-transparent"
            placeholder="Checksum (sha256)"
            value={m.checksum}
            onChange={(e) => onChange(i, "checksum", e.target.value)}
          />
          <input
            className="shadow-sunken-sm rounded-lg px-3 py-2 bg-transparent"
            placeholder="Content / filename"
            value={m.content}
            onChange={(e) => onChange(i, "content", e.target.value)}
          />
          <input
            className="shadow-sunken-sm rounded-lg px-3 py-2 bg-transparent"
            placeholder="Size (MB)"
            type="number"
            value={Number.isFinite(m.size) ? String(m.size) : ""}
            onChange={(e) => onChange(i, "size", e.target.value)}
          />

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
      ))}

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
