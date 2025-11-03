import { fetchBuilds, fetchGeneral, fetchPreviews, fetchWholeDraft } from '@features/game/api/game-draft.api';
import type { GameBuilds, GameDraft, GameGeneral, GamePreview } from '@features/game/types/game-draft.type';
import type { OnChainGameMetadata } from '@features/game/types/game.type';
import type { Metadata } from '@shared/blockchain/icp/types/game.types';
import { fetchMetadata } from '@shared/api/metadata.api';
import { getGameByGameId } from './record.service';

type SettledResult<T> = PromiseSettledResult<T>;

const settledValue = <T,>(res: SettledResult<T>): T | null =>
  res.status === 'fulfilled' ? res.value : null;

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

export interface DraftSources<T> {
  offChain: T | null;
  onChain: OnChainGameMetadata | null;
  metadata: Metadata | null;
}

export interface DraftGeneralResult {
  data: GameGeneral;
  sources: DraftSources<GameGeneral>;
}

export const fetchDraftGeneralCombined = async (gameId: string): Promise<DraftGeneralResult> => {
  const [generalRes, onChainRes] = await Promise.allSettled([
    fetchGeneral(gameId),
    loadOnChain(gameId),
  ]);

  const offChain = settledValue(generalRes);
  const onChain = settledValue(onChainRes);
  const metadata = await loadMetadata(onChain);

  const data: GameGeneral = {
    name: offChain?.name ?? onChain?.name ?? '',
    description: offChain?.description ?? onChain?.description ?? '',
    required_age: offChain?.required_age ?? metadata?.required_age ?? undefined,
    price: offChain?.price ?? onChain?.price ?? undefined,
    website: offChain?.website ?? metadata?.social_media?.website ?? undefined,
    cover_vertical_image:
      offChain?.cover_vertical_image ?? metadata?.cover_vertical_image ?? undefined,
    cover_horizontal_image:
      offChain?.cover_horizontal_image ?? metadata?.cover_horizontal_image ?? undefined,
    banner_image: offChain?.banner_image ?? metadata?.banner_image ?? undefined,
    categories: offChain?.categories ?? metadata?.categories ?? [],
    tags: offChain?.tags ?? metadata?.tags ?? [],
  };

  return {
    data,
    sources: {
      offChain,
      onChain,
      metadata,
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
  const [previewsRes, onChainRes] = await Promise.allSettled([
    fetchPreviews(gameId),
    loadOnChain(gameId),
  ]);

  const offChain = settledValue(previewsRes);
  const onChain = settledValue(onChainRes);
  const metadata = await loadMetadata(onChain);

  const previews =
    offChain?.previews && offChain.previews.length
      ? offChain.previews
      : metadata?.previews && metadata.previews.length
        ? metadata.previews
        : [];

  return {
    data: { previews },
    sources: {
      offChain,
      onChain,
      metadata,
    },
  };
};

export interface DraftBuildsResult {
  data: GameBuilds;
  sources: DraftSources<GameBuilds>;
}

export const fetchDraftBuildsCombined = async (gameId: string): Promise<DraftBuildsResult> => {
  const [buildRes, onChainRes] = await Promise.allSettled([
    fetchBuilds(gameId),
    loadOnChain(gameId),
  ]);

  const offChain = settledValue(buildRes);
  const onChain = settledValue(onChainRes);
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
  const [draftRes, onChainRes] = await Promise.allSettled([
    fetchWholeDraft(gameId),
    loadOnChain(gameId),
  ]);

  const offChain = settledValue(draftRes);
  const onChain = settledValue(onChainRes);
  const metadata = await loadMetadata(onChain);

  const metadataDistributions = Array.isArray((metadata as any)?.distribution)
    ? ((metadata as any).distribution as GameDraft['distributions'])
    : [];

  const data: GameDraft = {
    game_id: offChain?.game_id ?? onChain?.gameId ?? gameId,
    name: offChain?.name ?? onChain?.name ?? '',
    description: offChain?.description ?? onChain?.description ?? '',
    required_age: offChain?.required_age ?? metadata?.required_age ?? undefined,
    price: offChain?.price ?? onChain?.price ?? undefined,
    website: offChain?.website ?? metadata?.social_media?.website ?? undefined,
    banner_image: offChain?.banner_image ?? metadata?.banner_image ?? undefined,
    cover_vertical_image:
      offChain?.cover_vertical_image ?? metadata?.cover_vertical_image ?? undefined,
    cover_horizontal_image:
      offChain?.cover_horizontal_image ?? metadata?.cover_horizontal_image ?? undefined,
    previews:
      offChain?.previews && offChain.previews.length
        ? offChain.previews
        : metadata?.previews && metadata.previews.length
          ? metadata.previews
          : [],
    distributions:
      offChain?.distributions && offChain.distributions.length
        ? offChain.distributions
        : metadataDistributions ?? [],
    categories: offChain?.categories ?? metadata?.categories ?? [],
    tags: offChain?.tags ?? metadata?.tags ?? [],
    is_published: offChain?.is_published ?? onChain?.published ?? undefined,
    release_date: offChain?.release_date ?? undefined,
    draft_status: offChain?.draft_status ?? undefined,
    created_at: offChain?.created_at ?? undefined,
    updated_at: offChain?.updated_at ?? undefined,
  };

  return {
    data,
    sources: {
      offChain,
      onChain,
      metadata,
    },
  };
};
