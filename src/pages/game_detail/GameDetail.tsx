import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faApple, faLinux, faWindows } from '@fortawesome/free-brands-svg-icons';
import { faAngleRight, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { useWallet } from '@shared/contexts/WalletContext';
import CarouselPreview from '@features/game/components/carousel-preview';
import { VerticalCard } from '../../components/cards/VerticalCard';
import { PriceCoin } from '@shared/lib/constants/const-price';
import { AppPayment } from '@features/wallet/views/Payment';
import { ImageLoading } from '../../constants/lib.const';
import {
  normalizeDistribution,
  NormalizedDist,
  NativeSpec,
  WebSpec,
} from '../../interfaces/helpers/icp.helpers';
import { buyGame } from '@features/game/services/purchase.service';
import type { PurchaseResult } from '@shared/blockchain/icp/sdk/canisters/pgc1.did.d';
import { getGameRecordById } from '@features/game/services/record.service';
import { getGameByGameId, getPublishedGames } from '@features/game/services/dto.service';
import { Distribution, Metadata, PGCGame } from '@shared/blockchain/icp/types/game.types';
import { isZeroTokenAmount, resolveTokenInfo, subunitsToNumber } from '@shared/utils/token-info';
import type { MediaItem } from '../../interfaces/app/GameInterface';
import { AnnouncementContainer } from '@features/announcement/components/ann-container.component';
import type { GameAnnouncementType } from '@shared/blockchain/icp/types/game.types';
import { getAllAnnouncementsByGameId } from '@features/game/services/announcement.service';
import { TypographyH2 } from '@shared/components/ui/typography-h2';

type PlatformTab = keyof Pick<NormalizedDist, 'Website' | 'Windows' | 'macOS' | 'Linux' | 'Other'>;

const PLATFORM_ORDER: PlatformTab[] = ['Website', 'Windows', 'macOS', 'Linux', 'Other'];

const PLATFORM_ICON: Record<PlatformTab, any> = {
  Website: faGlobe,
  Windows: faWindows,
  macOS: faApple,
  Linux: faLinux,
  Other: faGlobe,
};

const normalizePreviews = (items: MediaItem[] | undefined): MediaItem[] => {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      const src = (item.src ?? item.url ?? '').trim();
      if (!src) return null;
      const isVideo = /\.(mp4|webm|mov|m4v)$/i.test(src) || item.kind === 'video';
      return {
        ...item,
        src,
        url: src,
        kind: isVideo ? 'video' : 'image',
      } as MediaItem;
    })
    .filter(Boolean) as MediaItem[];
};

const extractMetadataArray = (raw: unknown): string[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      if (typeof entry === 'string') return entry.trim();
      if (typeof entry === 'number') return entry.toString();
      if (entry && typeof entry === 'object') {
        const obj = entry as Record<string, unknown>;
        const keys = ['id', 'value', 'categoryId', 'tagId', 'name'];
        for (const key of keys) {
          const value = obj[key];
          if (typeof value === 'string' && value.trim()) return value.trim();
        }
      }
      return null;
    })
    .filter((v): v is string => !!v);
};

const mergeDistributions = (
  primary: Distribution[] | undefined,
  fallback: Distribution[] | undefined,
): Distribution[] =>
  Array.isArray(primary) && primary.length ? primary : Array.isArray(fallback) ? fallback : [];

const resolveReleaseDate = (metadata: Metadata | null | undefined): number | undefined => {
  if (!metadata) return undefined;
  if (typeof metadata.releaseDate === 'number') return metadata.releaseDate;
  if (typeof metadata.release_date === 'number') return metadata.release_date;
  if (metadata.publishInfo?.releaseDate) return Number(metadata.publishInfo.releaseDate);
  if (metadata.release_date_ns) {
    return Number(metadata.release_date_ns) / 1_000_000;
  }
  return undefined;
};

const useAnnouncements = (gameId: string | undefined, wallet: any) => {
  const [announcements, setAnnouncements] = useState<GameAnnouncementType[]>([]);

  useEffect(() => {
    let mounted = true;
    if (!gameId || !wallet) return;
    (async () => {
      try {
        const list =
          (await getAllAnnouncementsByGameId({
            gameId,
            wallet,
          })) ?? [];
        if (!mounted) return;
        const filtered = list
          .filter((item) => {
            if (!item.status || typeof item.status !== 'object') return true;
            const statusKey = Object.keys(item.status)[0];
            return statusKey === 'published';
          })
          .sort((a, b) => {
            const aPinned = a.pinned ? 1 : 0;
            const bPinned = b.pinned ? 1 : 0;
            if (aPinned !== bPinned) return bPinned - aPinned;
            const aCreated = a.createdAt ? Number(a.createdAt) : 0;
            const bCreated = b.createdAt ? Number(b.createdAt) : 0;
            return bCreated - aCreated;
          });
        setAnnouncements(filtered);
      } catch (err) {
        console.error('[GameDetail] Unable to fetch announcements', err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [gameId, wallet]);

  return announcements;
};

export default function GameDetail(): React.ReactElement {
  const { gameId } = useParams();
  const { wallet } = useWallet();

  const [game, setGame] = useState<PGCGame | null>(null);
  const [otherGames, setOtherGames] = useState<PGCGame[]>([]);
  const [dist, setDist] = useState<NormalizedDist>({});
  const [activeTab, setActiveTab] = useState<PlatformTab | null>(null);
  const [canisterId, setCanisterId] = useState<string | null>(null);
  const [isOnPayment, setIsOnPayment] = useState(false);
  const [buying, setBuying] = useState(false);
  const [purchaseState, setPurchaseState] = useState<{
    status: 'success' | 'error';
    message: string;
  } | null>(null);

  const announcements = useAnnouncements(gameId, wallet);

  useEffect(() => {
    if (!gameId) return;

    let mounted = true;
    (async () => {
      try {
        const detail = await getGameByGameId({ gameId });
        if (!mounted) return;
        setGame(detail ?? null);

        if (detail) {
          const combinedDistribution = mergeDistributions(
            detail.distribution,
            detail.metadata?.distribution as Distribution[] | undefined,
          );
          const normalized = normalizeDistribution(combinedDistribution);
          setDist(normalized);
          const firstTab = PLATFORM_ORDER.find((tab) => {
            const items = (normalized as Record<string, NativeSpec[] | WebSpec[] | undefined>)[tab];
            return Array.isArray(items) && items.length > 0;
          });
          setActiveTab(firstTab ?? null);
        }
      } catch (err) {
        console.error('[GameDetail] Unable to fetch game detail', err);
      }
    })();

    (async () => {
      try {
        const record = await getGameRecordById({ gameId });
        if (!record) return;
        if (!mounted) return;
        setCanisterId(record.canister_id.toString());
      } catch (err) {
        console.error('[GameDetail] Unable to resolve game canister id', err);
      }
    })();

    (async () => {
      try {
        const published = await getPublishedGames({ start: 0, limit: 200 });
        if (!mounted) return;
        setOtherGames(
          Array.isArray(published)
            ? published.filter((item) => item?.gameId !== gameId && item?.published !== false)
            : [],
        );
      } catch (err) {
        console.error('[GameDetail] Unable to resolve recommended games', err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [gameId]);

  const metadata = game?.metadata ?? null;

  const previews = useMemo(() => {
    const primary = normalizePreviews(game?.previews);
    if (primary.length) return primary;
    return normalizePreviews(metadata?.previews as MediaItem[] | undefined);
  }, [game?.previews, metadata?.previews]);

  const categories = useMemo(
    () => extractMetadataArray(metadata?.categories),
    [metadata?.categories],
  );
  const tags = useMemo(() => extractMetadataArray(metadata?.tags), [metadata?.tags]);
  const website = metadata?.website ?? metadata?.website ?? undefined;
  const releaseDate = resolveReleaseDate(metadata);

  const tokenCanister = game?.tokenPayment;
  const rawPrice = game?.price ?? 0;
  const tokenInfo = resolveTokenInfo(tokenCanister ?? undefined);
  const priceIsFree = isZeroTokenAmount(rawPrice, tokenInfo.decimals);
  const vaultSpenderId = (import.meta.env.VITE_PERIDOT_CANISTER_VAULT_BACKEND ?? '').trim();
  const humanPriceNumber = subunitsToNumber(rawPrice, tokenInfo.decimals);

  const availablePlatforms = useMemo(() => {
    const platforms = new Set<string>();
    const source = mergeDistributions(
      game?.distribution,
      metadata?.distribution as Distribution[] | undefined,
    );
    source.forEach((entry) => {
      if ('web' in entry) {
        platforms.add('Website');
      } else if ('native' in entry) {
        platforms.add(entry.native.os);
      }
    });
    return Array.from(platforms);
  }, [game?.distribution, metadata?.distribution]);

  const interpretPurchaseResult = (
    result: PurchaseResult,
  ): { status: 'success' | 'error'; message: string } => {
    if (result && typeof result === 'object') {
      if ('success' in result) {
        return { status: 'success', message: 'Game added to your library.' };
      }
      if ('alreadyOwned' in result) {
        return { status: 'success', message: 'You already own this game.' };
      }
      if ('paymentFailed' in result) {
        return { status: 'error', message: `Payment failed: ${result.paymentFailed}` };
      }
      if ('insufficientAllowance' in result) {
        return {
          status: 'error',
          message:
            'Purchase failed: insufficient allowance. Please approve more tokens and try again.',
        };
      }
      if ('soldOut' in result) {
        return { status: 'error', message: 'Purchase failed: this game is sold out.' };
      }
      if ('notPublished' in result) {
        return { status: 'error', message: 'Purchase failed: the game is not published.' };
      }
      const [code] = Object.keys(result);
      if (code) {
        return { status: 'error', message: `Purchase failed: ${code}` };
      }
    }
    return { status: 'error', message: 'Purchase failed due to an unexpected response.' };
  };

  const finalizePurchase = async (): Promise<PurchaseResult> => {
    if (!wallet?.encryptedPrivateKey) {
      throw new Error('Please connect your wallet before purchasing the game.');
    }
    if (!gameId) {
      throw new Error('Missing game identifier.');
    }

    const result = await buyGame({
      gameId,
      wallet,
      canisterId: canisterId ?? undefined,
    });

    const outcome = interpretPurchaseResult(result);
    setPurchaseState(outcome);
    if (outcome.status === 'error') {
      throw new Error(outcome.message);
    }
    return result;
  };

  const handleBuyClick = async () => {
    setPurchaseState(null);

    if (!wallet?.encryptedPrivateKey) {
      setPurchaseState({ status: 'error', message: 'Please connect your wallet first.' });
      return;
    }

    if (priceIsFree) {
      if (buying) return;
      try {
        setBuying(true);
        await finalizePurchase();
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setPurchaseState((prev) => prev ?? { status: 'error', message });
      } finally {
        setBuying(false);
      }
      return;
    }

    if (!vaultSpenderId) {
      setPurchaseState({
        status: 'error',
        message:
          'Payment configuration is missing the spender canister id. Please update your environment variables.',
      });
      return;
    }

    setIsOnPayment(true);
  };

  const KRow = ({ label, value }: { label: string; value?: React.ReactNode }) => {
    if (!value) return null;
    return (
      <tr className="align-top">
        <td className="pr-6 py-2 text-muted-foreground">{label}</td>
        <td className="py-2 break-words">{value}</td>
      </tr>
    );
  };

  const renderHardwareCard = (tab: PlatformTab) => {
    const specs = (dist as Record<string, NativeSpec[] | WebSpec[] | undefined>)[tab];
    if (!Array.isArray(specs) || specs.length === 0) {
      return <p>No hardware requirements provided.</p>;
    }

    return specs.map((spec, index) => {
      const note = 'notes' in spec ? spec.notes : undefined;
      return (
        <div
          key={`${tab}-${index}`}
          className="rounded-lg border border-border bg-card px-6 py-4 shadow-flat-sm space-y-2"
        >
          {'os' in spec ? <KRow label="OS" value={spec.os} /> : null}
          <KRow label="Processor" value={spec.processor} />
          <KRow label="Graphics" value={spec.graphics} />
          <KRow label="Memory" value={'memory' in spec ? spec.memory : undefined} />
          <KRow label="Storage" value={'storage' in spec ? spec.storage : undefined} />
          <KRow label="Notes" value={note} />
        </div>
      );
    });
  };

  if (!game) {
    return (
      <main className="flex justify-center py-24">
        <div className="max-w-[720px] text-center">
          <h1 className="text-3xl font-semibold mb-4">Game not found</h1>
          <p className="text-muted-foreground">
            We could not find the game you are looking for. It might be unpublished or removed from
            the catalog.
          </p>
        </div>
      </main>
    );
  }

  const bannerImage =
    game.bannerImage ??
    metadata?.bannerImage ??
    metadata?.banner_image ??
    metadata?.coverHorizontalImage ??
    metadata?.cover_horizontal_image ??
    ImageLoading;

  const coverImage =
    game.coverVerticalImage ??
    metadata?.coverVerticalImage ??
    metadata?.cover_vertical_image ??
    metadata?.coverImage ??
    metadata?.cover_image ??
    ImageLoading;

  return (
    <main className="flex justify-center duration-300">
      <div className="max-w-[1400px] w-full flex flex-col gap-10 duration-300 px-6 sm:px-8 md:px-12">
        {/* Hero */}
        <section className="relative w-full min-h-[320px] overflow-hidden shadow-flat-lg">
          <img
            src={bannerImage}
            alt={game.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-between items-end px-8 md:px-12 py-10 h-full">
            <div className="flex flex-col gap-4 md:w-3/5">
              <div className="flex flex-wrap gap-2 text-sm">
                {categories.map((item) => (
                  <span
                    key={item}
                    className="bg-white/10 px-4 py-1 rounded-full border border-white/10 uppercase tracking-wide text-foreground backdrop-blur-sm font-semibold"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                {game.name ?? 'PeridotVault Game'}
              </h1>
            </div>
            <div className="flex flex-col md:flex-row gap-4 items-center md:w-2/5 justify-end">
              <PriceCoin amount={rawPrice} tokenCanister={tokenCanister} textSize="lg" />
              <button
                type="button"
                className={`px-10 font-semibold py-2 rounded-md bg-accent transition ${
                  buying ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-flat-lg'
                }`}
                onClick={handleBuyClick}
                disabled={buying}
              >
                {buying ? 'Processing…' : priceIsFree ? 'Purchase' : 'Buy Now'}
              </button>
              {purchaseState ? (
                <span
                  className={`text-sm font-medium ${
                    purchaseState.status === 'success' ? 'text-success' : 'text-destructive'
                  }`}
                >
                  {purchaseState.message}
                </span>
              ) : null}
            </div>
          </div>
        </section>

        {/* Body */}
        <div className="grid gap-12 lg:grid-cols-[3fr_1.25fr]">
          <div className="flex flex-col gap-12">
            {/* Previews */}
            <section className="overflow-hidden">
              <CarouselPreview
                items={
                  previews.length
                    ? previews
                    : [
                        {
                          kind: 'image',
                          src: coverImage,
                        },
                      ]
                }
              />
            </section>

            {/* About */}
            <section className="space-y-6">
              <div className="space-y-3">
                <TypographyH2 text="About" />
                <p className="">
                  {game.description ?? metadata?.description ?? 'No description available.'}
                </p>
              </div>
              <table className="w-full text-sm md:text-base">
                <tbody>
                  <KRow
                    label="Released"
                    value={releaseDate ? new Date(releaseDate).toLocaleDateString() : undefined}
                  />
                  <KRow
                    label="Website"
                    value={
                      website ? (
                        <a
                          href={website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-2"
                        >
                          <FontAwesomeIcon icon={faGlobe} />
                          {website}
                        </a>
                      ) : undefined
                    }
                  />
                  <KRow
                    label="Supported Platforms"
                    value={availablePlatforms.length ? availablePlatforms.join(', ') : undefined}
                  />
                  <KRow
                    label="Tags"
                    value={tags.length ? tags.map((t) => `#${t}`).join(' ') : undefined}
                  />
                </tbody>
              </table>
            </section>

            {/* Hardware requirements */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <TypographyH2 text="Hardware Requirements" />
                <div className="flex gap-2 flex-wrap">
                  {PLATFORM_ORDER.filter((tab) => {
                    const specs = (dist as Record<string, NativeSpec[] | WebSpec[] | undefined>)[
                      tab
                    ];
                    return Array.isArray(specs) && specs.length > 0;
                  }).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={[
                        'px-4 py-2 rounded-md border transition flex items-center gap-2 text-sm',
                        tab === activeTab
                          ? 'bg-primary text-primary-foreground shadow-flat-md'
                          : 'bg-muted hover:bg-muted/80',
                      ].join(' ')}
                    >
                      <FontAwesomeIcon icon={PLATFORM_ICON[tab]} />
                      <span>{tab}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-4">
                {activeTab ? (
                  renderHardwareCard(activeTab)
                ) : (
                  <p>Hardware information will appear here once configured.</p>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-8">
            <div className="rounded-lg shadow-arise-sm p-6 space-y-6">
              <div className="flex gap-4">
                <img
                  src={game.coverHorizontalImage}
                  alt={game.name}
                  className="w-full aspect-video object-cover rounded-md"
                />
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faAngleRight} />
                  <span>
                    Required age:{' '}
                    {metadata?.requiredAge ??
                      metadata?.required_age ??
                      game.requiredAge ??
                      'All ages'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faAngleRight} />
                  <span>Total purchased: {game.totalPurchased?.toLocaleString() ?? '0'}</span>
                </div>
              </div>
            </div>

            {/* {announcements.length ? (
              <div className="rounded-2xl border border-border bg-card shadow-flat-sm p-6 space-y-4">
                <h2 className="text-xl font-semibold">Latest Announcements</h2>
                <div className="flex flex-col gap-4">
                  {announcements.map((ann) => (
                    <AnnouncementContainer key={ann.announcementId} item={ann} />
                  ))}
                </div>
              </div>
            ) : null} */}
          </aside>
        </div>

        {/* Recommended */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold">More from the vault</h2>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {otherGames.slice(0, 8).map((item) => {
              const cover =
                item.coverVerticalImage ??
                item.coverHorizontalImage ??
                item.bannerImage ??
                item.metadata?.coverVerticalImage ??
                item.metadata?.cover_vertical_image ??
                ImageLoading;
              return (
                <VerticalCard
                  key={item.gameId}
                  gameId={item.gameId}
                  gameName={item.name ?? 'Unknown Game'}
                  imgUrl={cover}
                  price={item.price ?? 0}
                  tokenCanister={item.tokenPayment}
                />
              );
            })}
          </div>
        </section>
      </div>

      {isOnPayment ? (
        <AppPayment
          onClose={() => setIsOnPayment(false)}
          price={humanPriceNumber}
          tokenCanisterId={tokenCanister ?? undefined}
          tokenSymbol={tokenInfo.symbol}
          tokenLogoUrl={tokenInfo.logo ?? undefined}
          SPENDER={vaultSpenderId}
          onExecute={async () => {
            await finalizePurchase();
            setIsOnPayment(false);
          }}
        />
      ) : null}
    </main>
  );
}
