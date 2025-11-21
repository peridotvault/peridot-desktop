import { fetchBuilds, fetchGeneral, fetchPreviews, fetchWholeDraft } from '@features/game/api/game-draft.api';
import { fetchGameMetadata } from '@features/game/api/game.api';
import type {
  GameBuilds,
  GameDraft,
  GameMetadataResponse,
  GameGeneral,
  GamePreview,
} from '@features/game/types/game-draft.type';
import type { OnChainGameMetadata } from '@features/game/types/game.type';
import type { Metadata } from '@shared/blockchain/icp/types/game.types';
import { fetchMetadata } from '@shared/api/metadata.api';
import { getGameByGameId } from './record.service';

type SettledResult<T> = PromiseSettledResult<T>;

const settledValue = <T,>(res: SettledResult<T>): T | null =>
  res.status === 'fulfilled' ? res.value : null;

const pick = <T,>(...values: (T | null | undefined)[]): T | undefined => {
  for (const value of values) {
    if (value !== null && value !== undefined) {
      return value;
    }
  }
  return undefined;
};

const loadOnChain = async (gameId: string): Promise<OnChainGameMetadata | null> => {
  try {
    return await getGameByGameId({ gameId });
  } catch (error) {
    console.warn(`[draft.service] Unable to load on-chain metadata for ${gameId}:`, error);
    return null;
  }
};

const loadMetadata = async (onChain: OnChainGameMetadata | null): Promise<Metadata | null> => {
  if (!onChain?.metadataURI) return null;
  try {
    return await fetchMetadata(onChain.metadataURI);
  } catch (error) {
    console.warn('[draft.service] Unable to resolve off-chain metadata from URI:', error);
    return null;
  }
};

const loadCatalog = async (gameId: string): Promise<GameMetadataResponse | null> => {
  try {
    return await fetchGameMetadata(gameId);
  } catch (error) {
    const statusCode = (error as any)?.statusCode;
    // A catalog 404 is expected for games that have not been published yet,
    // so skip the noisy warning in that scenario.
    if (statusCode !== 404) {
      console.warn(`[draft.service] Unable to load catalog metadata for ${gameId}:`, error);
    }
    return null;
  }
};

export interface DraftSources<T> {
  offChain: T | null;
  onChain: OnChainGameMetadata | null;
  metadata: Metadata | null;
  catalog: GameMetadataResponse | null;
}

export interface DraftGeneralResult {
  data: GameGeneral;
  sources: DraftSources<GameGeneral>;
}

export const fetchDraftGeneralCombined = async (gameId: string): Promise<DraftGeneralResult> => {
  const [generalRes, onChainRes, catalogRes] = await Promise.allSettled([
    fetchGeneral(gameId),
    loadOnChain(gameId),
    loadCatalog(gameId),
  ]);

  const offChain = settledValue(generalRes);
  const onChain = settledValue(onChainRes);
  const catalog = settledValue(catalogRes);
  const metadata = await loadMetadata(onChain);

  const categories =
    offChain?.categories && offChain.categories.length
      ? offChain.categories
      : catalog?.categories && catalog.categories.length
        ? catalog.categories
        : metadata?.categories ?? [];
  const tags =
    offChain?.tags && offChain.tags.length
      ? offChain.tags
      : catalog?.tags && catalog.tags.length
        ? catalog.tags
        : metadata?.tags ?? [];

  const data: GameGeneral = {
    name: pick(offChain?.name, onChain?.name, catalog?.name, metadata?.name) ?? '',
    description: pick(offChain?.description, onChain?.description, catalog?.description, metadata?.description) ?? '',
    requiredAge: pick(
      offChain?.requiredAge,
      offChain?.required_age,
      metadata?.requiredAge,
      metadata?.required_age,
    ),
    price: pick(offChain?.price, onChain?.price, catalog?.price, metadata?.price),
    website: pick(offChain?.website, catalog?.website, metadata?.website),
    coverVerticalImage: pick(
      offChain?.coverVerticalImage,
      offChain?.cover_vertical_image,
      catalog?.coverVerticalImage,
      catalog?.cover_vertical_image,
      metadata?.coverVerticalImage,
      metadata?.cover_vertical_image,
    ),
    coverHorizontalImage: pick(
      offChain?.coverHorizontalImage,
      offChain?.cover_horizontal_image,
      catalog?.coverHorizontalImage,
      catalog?.cover_horizontal_image,
      metadata?.coverHorizontalImage,
      metadata?.cover_horizontal_image,
    ),
    bannerImage: pick(
      offChain?.bannerImage,
      offChain?.banner_image,
      catalog?.bannerImage,
      catalog?.banner_image,
      metadata?.bannerImage,
      metadata?.banner_image,
    ),
    categories,
    tags,
  };

  return {
    data,
    sources: {
      offChain,
      onChain,
      metadata,
      catalog,
    },
  };
};

export interface DraftPreviewsResult {
  data: GamePreview;
  sources: DraftSources<GamePreview>;
}

export const fetchDraftPreviewsCombined = async (
  gameId: string,
): Promise<DraftPreviewsResult> => {
  const [previewsRes, onChainRes, catalogRes] = await Promise.allSettled([
    fetchPreviews(gameId),
    loadOnChain(gameId),
    loadCatalog(gameId),
  ]);

  const offChain = settledValue(previewsRes);
  const onChain = settledValue(onChainRes);
  const catalog = settledValue(catalogRes);
  const metadata = await loadMetadata(onChain);

  const previews =
    offChain?.previews && offChain.previews.length
      ? offChain.previews
      : catalog?.previews && catalog.previews.length
        ? catalog.previews
        : metadata?.previews && metadata.previews.length
          ? metadata.previews
          : [];

  return {
    data: { previews },
    sources: {
      offChain,
      onChain,
      metadata,
      catalog,
    },
  };
};

export interface DraftBuildsResult {
  data: GameBuilds;
  sources: DraftSources<GameBuilds>;
}

export const fetchDraftBuildsCombined = async (gameId: string): Promise<DraftBuildsResult> => {
  const [buildRes, onChainRes, catalogRes] = await Promise.allSettled([
    fetchBuilds(gameId),
    loadOnChain(gameId),
    loadCatalog(gameId),
  ]);

  const offChain = settledValue(buildRes);
  const onChain = settledValue(onChainRes);
  const catalog = settledValue(catalogRes);
  const metadata = await loadMetadata(onChain);

  const metadataDistributions = Array.isArray((metadata as any)?.distribution)
    ? ((metadata as any).distribution as GameBuilds['distributions'])
    : [];

  const distributions =
    offChain?.distributions && offChain.distributions.length
      ? offChain.distributions
      : metadataDistributions ?? [];

  return {
    data: { distributions },
    sources: {
      offChain,
      onChain,
      metadata,
      catalog,
    },
  };
};

export interface DraftSummaryResult {
  data: GameDraft;
  sources: DraftSources<GameDraft>;
}

export const fetchDraftSummaryCombined = async (
  gameId: string,
): Promise<DraftSummaryResult> => {
  const [draftRes, onChainRes, catalogRes] = await Promise.allSettled([
    fetchWholeDraft(gameId),
    loadOnChain(gameId),
    loadCatalog(gameId),
  ]);

  const offChain = settledValue(draftRes);
  const onChain = settledValue(onChainRes);
  const catalog = settledValue(catalogRes);
  const metadata = await loadMetadata(onChain);

  const metadataAny = metadata as unknown as { distribution?: GameDraft['distributions'] };

  const metadataDistributions = Array.isArray(metadataAny?.distribution)
    ? metadataAny.distribution
    : [];

  const categories =
    offChain?.categories && offChain.categories.length
      ? offChain.categories
      : catalog?.categories && catalog.categories.length
        ? catalog.categories
        : metadata?.categories ?? [];

  const tags =
    offChain?.tags && offChain.tags.length
      ? offChain.tags
      : catalog?.tags && catalog.tags.length
        ? catalog.tags
        : metadata?.tags ?? [];

  const data: GameDraft = {
    gameId: pick(offChain?.gameId, offChain?.game_id, onChain?.gameId, gameId) ?? gameId,
    name: pick(offChain?.name, onChain?.name, catalog?.name, metadata?.name) ?? '',
    description: pick(offChain?.description, onChain?.description, catalog?.description, metadata?.description) ?? '',
    requiredAge: pick(
      offChain?.requiredAge,
      offChain?.required_age,
      metadata?.requiredAge,
      metadata?.required_age,
    ),
    price: pick(offChain?.price, onChain?.price, catalog?.price, metadata?.price),
    website: pick(offChain?.website, catalog?.website, metadata?.website),
    bannerImage: pick(
      offChain?.bannerImage,
      offChain?.banner_image,
      catalog?.bannerImage,
      catalog?.banner_image,
      metadata?.bannerImage,
      metadata?.banner_image,
    ),
    coverVerticalImage: pick(
      offChain?.coverVerticalImage,
      offChain?.cover_vertical_image,
      catalog?.coverVerticalImage,
      catalog?.cover_vertical_image,
      metadata?.coverVerticalImage,
      metadata?.cover_vertical_image,
    ),
    coverHorizontalImage: pick(
      offChain?.coverHorizontalImage,
      offChain?.cover_horizontal_image,
      catalog?.coverHorizontalImage,
      catalog?.cover_horizontal_image,
      metadata?.coverHorizontalImage,
      metadata?.cover_horizontal_image,
    ),
    previews:
      offChain?.previews && offChain.previews.length
        ? offChain.previews
        : catalog?.previews && catalog.previews.length
          ? catalog.previews
          : metadata?.previews && metadata.previews.length
            ? metadata.previews
            : [],
    distributions:
      offChain?.distributions && offChain.distributions.length
        ? offChain.distributions
        : metadataDistributions ?? [],
    categories,
    tags,
    isPublished: pick(
      offChain?.isPublished,
      offChain?.is_published,
      metadata?.publishInfo?.isPublished,
      onChain?.published,
    ),
    releaseDate: pick(
      offChain?.releaseDate,
      offChain?.release_date,
      catalog?.releaseDate,
      catalog?.release_date,
      typeof metadata?.releaseDate === 'number' ? metadata?.releaseDate : undefined,
      metadata?.release_date !== undefined ? Number(metadata?.release_date) : undefined,
      metadata?.release_date_ns !== undefined
        ? Number(metadata?.release_date_ns) / 1_000_000
        : undefined,
    ),
    draftStatus: pick(offChain?.draftStatus, offChain?.draft_status, catalog?.draftStatus, catalog?.draft_status, metadata?.draftStatus),
    createdAt: pick(offChain?.createdAt, offChain?.created_at, catalog?.createdAt, catalog?.created_at, metadata?.createdAt, metadata?.created_at),
    updatedAt: pick(offChain?.updatedAt, offChain?.updated_at, catalog?.updatedAt, catalog?.updated_at, metadata?.updatedAt, metadata?.updated_at),
  };

  return {
    data,
    sources: {
      offChain,
      onChain,
      metadata,
      catalog,
    },
  };
};
