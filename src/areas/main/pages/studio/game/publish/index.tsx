import React, { useEffect, useState } from 'react';
import type { FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faCircleXmark, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { faAndroid, faApple, faLinux, faWindows } from '@fortawesome/free-brands-svg-icons';
import { ButtonWithSound } from '@shared/components/ui/ButtonWithSound';
import { useParams } from 'react-router-dom';
import type {
  Platform,
  Manifest,
  MediaItem,
  Distribution,
  NativeDistribution,
  WebDistribution,
  OnChainGameMetadata,
} from '@shared/blockchain/icp/types/game';
import { GameDraft, GameWhole } from '@shared/interfaces/gameDraft';
import { fetchDraftSummaryCombined } from '@features/game/services/draft';
import { setGameWhole } from '@features/game/api/game.api';
import {
  publishGameOnChain,
  type HardwareUpdatePayload,
  type LiveVersionPayload,
  type PublishManifestPayload,
} from '@features/game/services/publish';
import { useWallet } from '@shared/contexts/WalletContext';

type PlatformBuildInfo = {
  key: Platform;
  info: {
    webUrl?: string;
    fileName?: string;
    fileSizeMB?: number;
    requirement: {
      processor: string;
      graphics: string;
      memory: string;
      storage: string;
      notes: string;
    };
  };
};

const platformIcon: Record<Platform, any> = {
  windows: faWindows,
  macos: faApple,
  linux: faLinux,
  web: faGlobe,
  android: faAndroid,
  ios: faApple,
  other: faGlobe,
};

const unwrapOptString = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value.length ? String(value[0] ?? '') : '';
  }
  return typeof value === 'string' ? value : '';
};

const normalizeNotesText = (value: unknown): string | undefined => {
  const text = unwrapOptString(value).trim();
  return text.length ? text : undefined;
};

const isWebDistribution = (dist: Distribution): dist is { web: WebDistribution } => 'web' in dist;

const isNativeDistribution = (dist: Distribution): dist is { native: NativeDistribution } =>
  'native' in dist;

export const StudioGamePublish: FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { wallet } = useWallet();
  const [draftData, setDraftData] = useState<GameDraft | null>(null);
  const [onChainMeta, setOnChainMeta] = useState<OnChainGameMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);

  const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '');

  const normalizeStringArray = (values: unknown[] | undefined): string[] | undefined => {
    if (!Array.isArray(values) || !values.length) return undefined;
    const normalized = values
      .map((value) => {
        if (typeof value === 'string') return value.trim();
        if (typeof value === 'number') return value.toString();
        if (value && typeof value === 'object') {
          const candidate =
            (value as any).category_id ??
            (value as any).tag_id ??
            (value as any).id ??
            (value as any).value ??
            (value as any).name;
          if (typeof candidate === 'string' || typeof candidate === 'number') {
            return String(candidate).trim();
          }
        }
        return null;
      })
      .filter((entry): entry is string => !!entry && entry.trim().length > 0)
      .map((entry) => entry.trim());

    const unique = Array.from(new Set(normalized));
    return unique.length ? unique : undefined;
  };

  const normalizePreviews = (items: MediaItem[] | undefined): MediaItem[] | undefined => {
    if (!Array.isArray(items) || !items.length) return undefined;
    const normalized: MediaItem[] = [];

    items.forEach((item) => {
      const rawSrc = (item as any).src ?? (item as any).url;
      const src = typeof rawSrc === 'string' ? rawSrc.trim() : '';
      if (!src) return;

      if (item.kind === 'image') {
        normalized.push({
          kind: 'image',
          src,
          ...(item.alt ? { alt: item.alt } : {}),
          ...(item.storageKey ? { storageKey: item.storageKey } : {}),
        });
      } else if (item.kind === 'video') {
        normalized.push({
          kind: 'video',
          src,
          ...(item.poster ? { poster: item.poster } : {}),
          ...(item.alt ? { alt: item.alt } : {}),
          ...(item.storageKey ? { storageKey: item.storageKey } : {}),
        });
      }
    });

    return normalized.length ? normalized : undefined;
  };

  const createWebManifest = (web: WebDistribution): Manifest | null => {
    const url = web.url?.trim();
    if (!url) return null;
    const now = Date.now();
    let listing = url;
    try {
      const parsed = new URL(url);
      const candidate = parsed.pathname.split('/').filter(Boolean).pop();
      listing = candidate || url;
    } catch {
      listing = url;
    }
    return {
      listing,
      version: url,
      size_bytes: 0,
      sizeBytes: 0,
      createdAt: now,
      checksum: [],
      storageRef: { url: { url } },
    };
  };

  const toNumberValue = (value: unknown): number | undefined => {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : undefined;
    }
    if (typeof value === 'bigint') {
      return Number(value);
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return undefined;
      const parsed = Number(trimmed);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
  };

  const shouldApplyHardware = (payload: HardwareUpdatePayload): boolean => {
    return Boolean(
      payload.processor?.trim() ||
        payload.graphics?.trim() ||
        (payload.memoryMB !== undefined && payload.memoryMB > 0) ||
        (payload.storageMB !== undefined && payload.storageMB > 0) ||
        payload.additionalNotes?.trim(),
    );
  };

  const toTimestamp = (value: number | string | undefined): number | undefined => {
    if (typeof value === 'number' && !Number.isNaN(value)) return value;
    if (typeof value === 'string' && value.trim()) {
      const parsed = Date.parse(value);
      return Number.isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
  };

  const toIsoString = (value: number | string | undefined, fallbackMs: number): string => {
    if (typeof value === 'string' && value.trim()) return value;
    if (typeof value === 'number' && !Number.isNaN(value)) return new Date(value).toISOString();
    return new Date(fallbackMs).toISOString();
  };

  // State untuk data yang sudah diproses
  const [processedData, setProcessedData] = useState<{
    details: any;
    media: {
      coverVerticalImage: string;
      coverHorizontalImage: string;
      bannerImage: string;
      previews: any[];
    };
    builds: PlatformBuildInfo[];
    chain?: {
      metadataURI: string;
      tokenPayment: string;
      maxSupply: number;
      price: number;
      totalPurchased: number;
      published: boolean;
    };
  } | null>(null);

  // ✅ Ambil data dari draft service
  useEffect(() => {
    const loadDraftData = async () => {
      if (!gameId) {
        setError('Game ID is required');
        setLoading(false);
        return;
      }

      try {
        const { data, sources } = await fetchDraftSummaryCombined(gameId);
        console.log({
          offChainDraft: sources.offChain,
          onChainMeta: sources.onChain,
          metadata: sources.metadata,
        });

        if (!data) {
          setError('Game draft not found');
          setLoading(false);
          return;
        }

        setDraftData(data);
        setOnChainMeta(sources.onChain);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load draft:', err);
        setError('Failed to load game data');
        setLoading(false);
      }
    };

    loadDraftData();
  }, [gameId]);

  // ✅ Proses data draft menjadi format yang bisa ditampilkan
  useEffect(() => {
    if (!draftData || loading) return;

    try {
      // Ekstrak details
      const details: GameDraft = {
        gameId: draftData.gameId,
        name: draftData.name,
        description: draftData.description,
        requiredAge: draftData.requiredAge,
        price: draftData.price,
        website: draftData.website,
        categories: draftData.categories,
        tags: draftData.tags,
      };

      // ✅ Ekstrak media — GUNAKAN FIELD YANG BENAR
      const media = {
        coverVerticalImage: draftData.coverVerticalImage || '',
        coverHorizontalImage: draftData.coverHorizontalImage || '',
        bannerImage: draftData.bannerImage || '',
        previews: draftData.previews || [],
      };

      // ✅ Ekstrak HANYA build LIVE
      const liveBuilds: PlatformBuildInfo[] = [];

      if (draftData.distributions) {
        for (const dist of draftData.distributions) {
          if (isWebDistribution(dist)) {
            // Web build selalu live
            liveBuilds.push({
              key: 'web',
              info: {
                webUrl: dist.web.url ?? '',
                requirement: {
                  processor: dist.web.processor ?? '',
                  graphics: dist.web.graphics ?? '',
                  memory: dist.web.memory === undefined ? '0' : String(dist.web.memory),
                  storage: dist.web.storage === undefined ? '0' : String(dist.web.storage),
                  notes: unwrapOptString(dist.web.additionalNotes),
                },
              },
            });
          } else if (isNativeDistribution(dist)) {
            // Cek apakah ada versi live
            const liveVersion = dist.native.liveVersion;
            if (liveVersion) {
              const liveManifest = dist.native.manifests.find(
                (m: Manifest) => m.version === liveVersion,
              );

              if (liveManifest) {
                liveBuilds.push({
                  key: dist.native.os as Platform,
                  info: {
                    fileName: liveManifest.listing,
                    fileSizeMB: Number(liveManifest.sizeBytes ?? 0) / (1024 * 1024),
                    requirement: {
                      processor: dist.native.processor ?? '',
                      graphics: dist.native.graphics ?? '',
                      memory: dist.native.memory === undefined ? '0' : String(dist.native.memory),
                      storage:
                        dist.native.storage === undefined ? '0' : String(dist.native.storage),
                      notes: unwrapOptString(dist.native.additionalNotes),
                    },
                  },
                });
              }
            }
          }
        }
      }

      setProcessedData({
        details,
        media,
        builds: liveBuilds,
        chain: onChainMeta
          ? {
              metadataURI: onChainMeta.metadataURI,
              tokenPayment: onChainMeta.tokenPayment,
              maxSupply: onChainMeta.maxSupply,
              price: onChainMeta.price,
              totalPurchased: onChainMeta.totalPurchased,
              published: onChainMeta.published,
            }
          : undefined,
      });
    } catch (err) {
      console.error('Failed to process draft data:', err);
      setError('Failed to process game data');
    }
  }, [draftData, loading, onChainMeta]);

  // ✅ Validasi kelengkapan data — PERBAIKI COVER IMAGE
  const checkDetails = () => {
    const missing: string[] = [];
    if (!processedData?.details.name) missing.push('Name');
    if (!processedData?.details.description) missing.push('Description');
    if (!processedData?.details.categories?.length) missing.push('Categories');
    if (!processedData?.details.tags?.length) missing.push('Tags');
    return { ok: missing.length === 0, missing };
  };

  const checkMedia = () => {
    const missing: string[] = [];
    // ✅ Periksa cover vertical (atau horizontal — sesuaikan kebutuhan)
    if (!processedData?.media.coverVerticalImage) missing.push('Cover Image (Vertical)');
    if (!processedData?.media.bannerImage) missing.push('Banner Image');
    if (!processedData?.media.previews?.length) missing.push('Previews (min. 1)');
    return { ok: missing.length === 0, missing };
  };

  const checkBuilds = () => {
    const missing: string[] = [];
    if (!processedData?.builds?.length) missing.push('At least 1 live platform');

    processedData?.builds?.forEach((p) => {
      const r = p.info.requirement;
      if (p.key === 'web') {
        if (!p.info.webUrl) missing.push('Web URL (Website)');
      }
      if (!r?.processor) missing.push(`Processor (${p.key})`);
      if (!r?.graphics) missing.push(`Graphics (${p.key})`);
      if (!r?.memory) missing.push(`Memory GB (${p.key})`);
      if (!r?.storage) missing.push(`Storage GB (${p.key})`);
    });
    return { ok: missing.length === 0, missing };
  };

  const vDetails = checkDetails();
  const vMedia = checkMedia();
  const vBuilds = checkBuilds();
  const allOk = vDetails.ok && vMedia.ok && vBuilds.ok;

  const handlePublish = async () => {
    if (!gameId) {
      setPublishError('Game ID is missing');
      return;
    }
    if (!draftData) {
      setPublishError('Game data is not ready');
      return;
    }
    if (!allOk) {
      return;
    }

    setPublishError(null);
    setPublishMessage(null);
    setPublishing(true);

    try {
      const nowMs = Date.now();
      const releaseDate =
        typeof draftData.releaseDate === 'number' && !Number.isNaN(draftData.releaseDate)
          ? draftData.releaseDate
          : nowMs;

      const categories = normalizeStringArray(draftData.categories as unknown[] | undefined);
      const tags = normalizeStringArray(draftData.tags as unknown[] | undefined);
      const previews = normalizePreviews(draftData.previews);
      const distributions =
        Array.isArray(draftData.distributions) && draftData.distributions.length
          ? draftData.distributions
          : undefined;

      const hardwareUpdates: HardwareUpdatePayload[] = [];
      const liveVersionUpdates: LiveVersionPayload[] = [];
      const manifestPayloads: PublishManifestPayload[] = [];

      (draftData.distributions ?? []).forEach((dist) => {
        if ('web' in dist) {
          const webHardware: HardwareUpdatePayload = {
            platform: 'web',
            processor: dist.web.processor?.trim() || undefined,
            graphics: dist.web.graphics?.trim() || undefined,
            memoryMB: toNumberValue(dist.web.memory),
            storageMB: toNumberValue(dist.web.storage),
            additionalNotes: normalizeNotesText(dist.web.additionalNotes),
          };
          if (shouldApplyHardware(webHardware)) {
            hardwareUpdates.push(webHardware);
          }
          const webManifest = createWebManifest(dist.web);
          if (webManifest) {
            manifestPayloads.push({
              platform: 'web',
              manifest: webManifest,
            });
          }
        } else if ('native' in dist) {
          const nativeHardware: HardwareUpdatePayload = {
            platform: dist.native.os as Platform,
            processor: dist.native.processor?.trim() || undefined,
            graphics: dist.native.graphics?.trim() || undefined,
            memoryMB: toNumberValue(dist.native.memory),
            storageMB: toNumberValue(dist.native.storage),
            additionalNotes: normalizeNotesText(dist.native.additionalNotes),
          };
          if (shouldApplyHardware(nativeHardware)) {
            hardwareUpdates.push(nativeHardware);
          }
          dist.native.manifests?.forEach((manifest: Manifest) => {
            manifestPayloads.push({
              platform: dist.native.os as Platform,
              manifest,
            });
          });
          if (dist.native.liveVersion) {
            liveVersionUpdates.push({
              platform: dist.native.os as Platform,
              version: dist.native.liveVersion,
            });
          }
        }
      });

      const createdAtIso = toIsoString(draftData.createdAt, nowMs);
      const updatedAtIso = new Date(nowMs).toISOString();
      const createdAtMs = toTimestamp(createdAtIso) ?? nowMs;
      const updatedAtMs = toTimestamp(updatedAtIso) ?? nowMs;

      const payload: GameWhole = {
        gameId: draftData.gameId ?? gameId,
        name: draftData.name?.trim() || undefined,
        description: draftData.description?.trim() || undefined,
        requiredAge: typeof draftData.requiredAge === 'number' ? draftData.requiredAge : undefined,
        price: typeof draftData.price === 'number' ? draftData.price : undefined,
        website: draftData.website?.trim() || undefined,
        bannerImage: draftData.bannerImage?.trim() || undefined,
        coverVerticalImage: draftData.coverVerticalImage?.trim() || undefined,
        coverHorizontalImage: draftData.coverHorizontalImage?.trim() || undefined,
        previews: previews && previews.length ? previews : undefined,
        distributions,
        categories,
        tags,
        isPublished: true,
        releaseDate: releaseDate,
        draftStatus: 'published',
        createdAt: createdAtIso,
        updatedAt: updatedAtIso,
      };

      const saved = await setGameWhole(gameId, payload);

      let chainUpdated = false;
      const metadataURI = gameId && apiBase ? `${apiBase}/api/games/${gameId}/metadata` : '';

      if (metadataURI && wallet) {
        try {
          await publishGameOnChain({
            gameId,
            metadataURI,
            name: payload.name,
            description: payload.description,
            published: true,
            hardware: hardwareUpdates,
            liveVersions: liveVersionUpdates,
            manifests: manifestPayloads,
            wallet,
          });
          chainUpdated = true;
          setOnChainMeta((prev) =>
            prev
              ? {
                  ...prev,
                  name: payload.name ?? prev.name,
                  description: payload.description ?? prev.description,
                  metadataURI,
                  published: true,
                }
              : prev,
          );
        } catch (chainErr) {
          console.error('Failed to update blockchain state:', chainErr);
          setPublishError(
            `Blockchain update failed: ${
              chainErr instanceof Error ? chainErr.message : 'Unknown error'
            }`,
          );
        }
      } else if (!wallet) {
        console.warn('Wallet not available – skipping on-chain publish.');
      }

      const nextCreatedAt = toTimestamp(saved.createdAt) ?? createdAtMs;
      const nextUpdatedAt = toTimestamp(saved.updatedAt) ?? updatedAtMs;

      const nextCreatedAtIso = toIsoString(saved.createdAt ?? payload.createdAt, nextCreatedAt);
      const nextUpdatedAtIso = toIsoString(saved.updatedAt ?? payload.updatedAt, nextUpdatedAt);

      const nextDraft: GameDraft = {
        ...(draftData ?? {}),
        ...saved,
        previews: saved.previews ?? payload.previews ?? draftData.previews,
        distributions: saved.distributions ?? payload.distributions ?? draftData.distributions,
        categories: saved.categories ?? payload.categories ?? draftData.categories,
        tags: saved.tags ?? payload.tags ?? draftData.tags,
        isPublished: true,
        releaseDate: releaseDate,
        draftStatus: 'published',
        createdAt: nextCreatedAtIso,
        updatedAt: nextUpdatedAtIso,
      };

      setDraftData(nextDraft);
      setPublishMessage(
        chainUpdated
          ? 'Game published successfully (off-chain & on-chain).'
          : 'Game saved to off-chain storage.',
      );
    } catch (err) {
      console.error('Failed to publish game:', err);
      setPublishError(err instanceof Error ? err.message : 'Failed to publish game');
    } finally {
      setPublishing(false);
    }
  };

  const bytes = (mb: number) => `${mb.toFixed(0)} MB`;
  const mdy = (t: number) =>
    new Date(t).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });

  if (loading) {
    return (
      <div className="flex justify-center w-full">
        <div className="w-full max-w-[1400px] flex flex-col p-10 gap-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mb-4"></div>
            <div className="h-4 bg-muted rounded w-96 mb-8"></div>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-background rounded-xl border border-muted-foreground/40 p-5"
                >
                  <div className="h-6 bg-muted rounded w-32 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center w-full">
        <div className="w-full max-w-[1400px] flex flex-col p-10 gap-8 text-chart-5">{error}</div>
      </div>
    );
  }

  if (!processedData) {
    return (
      <div className="flex justify-center w-full p-10">
        <div className="text-center text-muted-foreground">No data available</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-[1400px] flex flex-col p-10 gap-8">
        {/* Header  */}
        <section className="flex justify-between items-center gap-4 flex-wrap md:flex-nowrap">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">Review & Publish</h1>
            <p className="text-foreground/70">This information appears on PeridotVault</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <ButtonWithSound
              disabled={!allOk || publishing}
              onClick={handlePublish}
              className={`bg-card-foreground text-card font-bold py-2 px-6 rounded-md ${!allOk || publishing ? 'cursor-not-allowed opacity-40' : ''}`}
            >
              <span>{publishing ? 'Publishing...' : 'Publish'}</span>
            </ButtonWithSound>
            {publishError && (
              <span className="text-sm text-chart-5 text-right max-w-sm">{publishError}</span>
            )}
            {publishMessage && (
              <span className="text-sm text-success text-right max-w-sm">{publishMessage}</span>
            )}
          </div>
        </section>

        {processedData.chain && (
          <section className="grid gap-3 rounded-lg border border-foreground/10 bg-card/40 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">On-chain Snapshot</h2>
              <span
                className={`text-sm font-medium ${
                  processedData.chain.published ? 'text-success' : 'text-muted-foreground'
                }`}
              >
                {processedData.chain.published ? 'Published' : 'Not yet published'}
              </span>
            </div>
            <div className="grid gap-2 text-sm text-foreground/80 md:grid-cols-2">
              <div className="flex flex-col gap-1 rounded-md bg-background/60 p-3">
                <span className="text-muted-foreground">Token Payment</span>
                <span className="font-medium">{processedData.chain.tokenPayment || '—'}</span>
              </div>
              <div className="flex flex-col gap-1 rounded-md bg-background/60 p-3">
                <span className="text-muted-foreground">Price</span>
                <span className="font-medium">
                  {typeof processedData.chain.price === 'number' ? processedData.chain.price : '—'}
                </span>
              </div>
              <div className="flex flex-col gap-1 rounded-md bg-background/60 p-3">
                <span className="text-muted-foreground">Max Supply</span>
                <span className="font-medium">
                  {typeof processedData.chain.maxSupply === 'number'
                    ? processedData.chain.maxSupply
                    : '—'}
                </span>
              </div>
              <div className="flex flex-col gap-1 rounded-md bg-background/60 p-3">
                <span className="text-muted-foreground">Total Purchased</span>
                <span className="font-medium">
                  {typeof processedData.chain.totalPurchased === 'number'
                    ? processedData.chain.totalPurchased
                    : '—'}
                </span>
              </div>
              <div className="flex flex-col gap-1 rounded-md bg-background/60 p-3 md:col-span-2">
                <span className="text-muted-foreground">Metadata URI</span>
                <span className="font-medium break-all">
                  {processedData.chain.metadataURI || '—'}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Meta ringkas + Publish */}
        <div className="flex flex-wrap items-center gap-8">
          <div>
            <div className="text-sm text-muted-foreground">Game ID</div>
            <div className="text-lg font-medium">{gameId}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Last Updated</div>
            <div className="text-lg font-medium">{mdy(Date.now())}</div>
          </div>
        </div>

        {/* DETAILS */}
        <SectionCard title="Details" ok={vDetails.ok} missing={vDetails.missing}>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Name</div>
              <div className="text-lg">{processedData.details.name || '—'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Required Age</div>
              <div className="text-lg">
                {processedData.details.required_age
                  ? `${processedData.details.required_age}+`
                  : '—'}
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="text-sm text-muted-foreground">Description</div>
              <div className="text-lg whitespace-pre-wrap">
                {processedData.details.description || '—'}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Categories</div>
              <div className="text-lg">
                {processedData.details.categories?.length
                  ? processedData.details.categories.join(', ')
                  : '—'}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Tags</div>
              <div className="text-lg">
                {processedData.details.tags?.length ? processedData.details.tags.join(', ') : '—'}
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="text-sm text-muted-foreground">Website</div>
              <div className="text-lg break-all">{processedData.details.website || '—'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Price</div>
              <div className="text-lg">
                {processedData.details.price ? `$${processedData.details.price}` : '—'}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* MEDIA */}
        <SectionCard title="Media" ok={vMedia.ok} missing={vMedia.missing}>
          <div className="grid grid-cols-3 gap-4">
            {/* Banner */}
            <div className="rounded-lg border border-muted-foreground/30 aspect-[4/1] overflow-hidden col-span-full">
              {processedData.media.bannerImage ? (
                <img
                  src={processedData.media.bannerImage.trim()} // ✅ trim whitespace
                  alt="banner"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No banner
                </div>
              )}
            </div>

            {/* ✅ Tampilkan cover vertical */}
            <div className="col-span-1">
              <div className="">
                <div className="text-sm mb-2 text-muted-foreground">Cover (Vertical)</div>
                {processedData.media.coverVerticalImage ? (
                  <img
                    src={processedData.media.coverVerticalImage.trim()} // ✅ trim whitespace
                    alt="cover vertical"
                    className="rounded-lg border border-muted-foreground/30 w-full aspect-[3/4] object-cover"
                  />
                ) : (
                  <div className="rounded-lg border border-muted-foreground/30 w-full aspect-[3/4] flex items-center justify-center text-muted-foreground">
                    No cover
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-2 flex flex-col gap-4">
              {/* ✅ Tampilkan cover Horizontal */}
              <div className="col-span-1">
                <div className="text-sm mb-2 text-muted-foreground">Cover (Horizontal)</div>
                {processedData.media.coverHorizontalImage ? (
                  <img
                    src={processedData.media.coverHorizontalImage.trim()} // ✅ trim whitespace
                    alt="cover horizontal"
                    className="rounded-lg border border-muted-foreground/30 w-full aspect-video object-cover"
                  />
                ) : (
                  <div className="rounded-lg border border-muted-foreground/30 w-full aspect-video flex items-center justify-center text-muted-foreground">
                    No cover
                  </div>
                )}
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-2">
                  Horizontal Cover & Previews
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {/* Previews */}
                  {processedData.media.previews.slice(0, 5).map((p: any, i: number) => (
                    <div
                      key={i}
                      className="rounded-lg border border-muted-foreground/30 aspect-video overflow-hidden"
                    >
                      {p.kind === 'image' ? (
                        <img
                          src={p.src?.trim()} // ✅ gunakan `src`, bukan `url`, dan trim
                          className="w-full h-full object-cover"
                          alt={`preview ${i}`}
                        />
                      ) : (
                        <video
                          src={p.src?.trim()}
                          className="w-full h-full object-cover"
                          controls
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* BUILDS - HANYA LIVE */}
        <SectionCard title="Live Builds" ok={vBuilds.ok} missing={vBuilds.missing}>
          <div className="grid gap-3">
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <div className="text-sm text-muted-foreground">Platforms</div>
                <div className="flex items-center gap-4 text-xl">
                  {processedData.builds.map((p) => (
                    <span key={p.key} title={p.key}>
                      <FontAwesomeIcon icon={platformIcon[p.key]} />
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {processedData.builds.map((p) => (
                <div key={p.key} className="rounded-lg border border-muted-foreground/30 p-4">
                  <div className="flex items-center gap-2 text-lg font-medium mb-2 capitalize">
                    <FontAwesomeIcon icon={platformIcon[p.key]} />
                    {p.key}
                  </div>

                  {p.key === 'web' ? (
                    <div className="text-base grid gap-2">
                      <div>
                        <div className="text-sm text-muted-foreground">Web URL</div>
                        <div className="break-all">{p.info.webUrl || '—'}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="CPU" value={p.info.requirement.processor} />
                        <Field label="GPU" value={p.info.requirement.graphics} />
                        <Field label="Memory (GB)" value={p.info.requirement.memory} />
                        <Field label="Storage (GB)" value={p.info.requirement.storage} />
                      </div>
                      {p.info.requirement.notes && (
                        <div>
                          <div className="text-sm text-muted-foreground">Notes</div>
                          <div>{p.info.requirement.notes}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-base grid gap-2">
                      <div className="flex items-center justify-between rounded-md border border-muted-foreground/30 px-3 py-2">
                        <div className="text-muted-foreground">File</div>
                        <div className="font-medium">
                          {p.info.fileName || '—'}{' '}
                          {p.info.fileSizeMB && `(${bytes(p.info.fileSizeMB)})`}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Field label="CPU" value={p.info.requirement.processor} />
                        <Field label="GPU" value={p.info.requirement.graphics} />
                        <Field label="Memory (GB)" value={p.info.requirement.memory} />
                        <Field label="Storage (GB)" value={p.info.requirement.storage} />
                      </div>
                      {p.info.requirement.notes && (
                        <div>
                          <div className="text-sm text-muted-foreground">Notes</div>
                          <div>{p.info.requirement.notes}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

/** kecil-kecil */
const SectionCard: React.FC<{
  title: string;
  ok: boolean;
  missing: string[];
  children?: React.ReactNode;
}> = ({ title, ok, missing, children }) => (
  <div className="rounded-xl border border-muted-foreground/40 bg-background">
    <div className="flex items-center justify-between px-5 py-4 border-b border-muted-foreground/20">
      <h3 className="text-xl font-semibold">{title}</h3>
      {ok ? (
        <span className="inline-flex items-center gap-2 text-green-600">
          <FontAwesomeIcon icon={faCheckCircle} />
          Complete
        </span>
      ) : (
        <span className="inline-flex items-center gap-2 text-chart-5">
          <FontAwesomeIcon icon={faCircleXmark} />
          Incomplete
        </span>
      )}
    </div>
    <div className="p-5 grid gap-4">
      {children}
      {!ok && missing.length > 0 && (
        <div className="text-base">
          <div className="mb-2 font-medium">Missing:</div>
          <ul className="list-disc pl-6 text-chart-5">
            {missing.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </div>
);

const Field: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div>
    <div className="text-sm text-muted-foreground">{label}</div>
    <div>{value || '—'}</div>
  </div>
);

export default StudioGamePublish;
