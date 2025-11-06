// @ts-ignore
import React, { useEffect, useState } from 'react';
// import { StarComponent } from '../../components/atoms/StarComponent';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight, faGlobe, faMessage } from '@fortawesome/free-solid-svg-icons';
import { faWindows, faApple, faLinux, faAndroid } from '@fortawesome/free-brands-svg-icons';
import { AppPayment } from '../../features/wallet/views/Payment';
import { useParams } from 'react-router-dom';
import { useWallet } from '@shared/contexts/WalletContext';
import CarouselPreview from '../../features/game/components/carousel-preview';
import { VerticalCard } from '../../components/cards/VerticalCard';
import { PriceCoin } from '@shared/lib/constants/const-price';
import { AnnouncementContainer } from '../../features/announcement/components/ann-container.component';
import Modal from '@mui/material/Modal';
import { InputFieldComponent } from '../../components/atoms/InputFieldComponent';
import { getPublishedGames, getGameByGameId } from '@features/game/services/game-legacy.service';
import { GameAnnouncementType, Metadata, PGLMeta, Value } from '@shared/blockchain/icp/types/legacy.types';
import {
  commentByAnnouncementId,
  getAllAnnouncementsByGameId,
  getAnnouncementsByAnnouncementId,
} from '@features/game/services/announcement.service';
import {
  asArray,
  asBigInt,
  asMap,
  asText,
  mdGet,
  NativeSpec,
  NormalizedDist,
  normalizeDistribution,
  optGet,
  optGetOr,
  PlatformKey,
  WebSpec,
} from '../../interfaces/helpers/icp.helpers';
import { ImageLoading } from '../../constants/lib.const';
import { buyGame } from '@features/game/services/purchase.service';
import type { PurchaseResult } from '@shared/blockchain/icp/sdk/canisters/pgc1.did.d';
import { getGameRecordById } from '../../features/game/services/record.service';
import { MediaItem } from '../../interfaces/app/GameInterface';
import { Distribution } from '@shared/blockchain/icp/types/legacy.types';
import {
  isZeroTokenAmount,
  resolveTokenInfo,
  subunitsToNumber,
} from '@shared/utils/token-info';

export default function GameDetail() {
  const { gameId } = useParams();
  const { wallet } = useWallet();
  const [isOnPayment, setIsOnPayment] = useState(false);
  const [detailGame, setDetailGame] = useState<PGLMeta | null>(null);
  // const [developerData, setDeveloperData] = useState<UserInterface | null>();
  const [allGames, setAllGames] = useState<PGLMeta[] | null>();
  const [announcements, setAnnouncements] = useState<GameAnnouncementType[] | null>(null);
  const [canisterId, setCanisterId] = useState<string | null>(null);
  const [purchaseState, setPurchaseState] = useState<{ status: 'success' | 'error'; message: string } | null>(null);
  const [buying, setBuying] = useState(false);
  const [isAnnouncementModalShowed, setIsAnnouncementModalShowed] = useState(false);
  const [comment, setComment] = useState('');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<GameAnnouncementType | null>(
    null,
  );
  const [dist, setDist] = useState<NormalizedDist>({});
  const [activeTab, setActiveTab] = useState<PlatformKey | null>(null);

  useEffect(() => {
    async function fetchData() {
      // window.scrollTo(0, 0);

      if (!gameId) return;

      const resDetailGame = (await getGameByGameId({
        gameId,
      })) as PGLMeta;
      // const developer = await getUserByPrincipalId({
      //   userId: resDetailGame.,
      // });
      setDetailGame(resDetailGame);
      const norm = normalizeDistribution(resDetailGame?.pgl1_distribution);
      setDist(norm);
      const firstTab = (['Website', 'Windows', 'macOS', 'Linux', 'Other'] as PlatformKey[]).find(
        (k) => (norm as any)[k]?.length,
      );
      setActiveTab(firstTab ?? null);

      // setDeveloperData(developer);
      try {
        const record = await getGameRecordById({ gameId });
        setCanisterId(record.canister_id.toString());
      } catch (err) {
        console.error('Unable to resolve game canister id:', err);
      }
      const resAllGames = await getPublishedGames({ start: 0, limit: 200 });
      const publishedGames = Array.isArray(resAllGames)
        ? resAllGames.filter((game) => game?.pgl1_published !== false)
        : resAllGames;
      setAllGames(publishedGames);
    }

    fetchData();
  }, [gameId]);

  // Get all announcements by app id
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        if (!wallet) return;
        let listAnnouncement =
          (await getAllAnnouncementsByGameId({
            gameId: gameId!,
            wallet,
          })) ?? [];
        // Sort: pinned first, then by createdAt descending
        // Filter only published announcements
        listAnnouncement = listAnnouncement.filter(
          (item) =>
            item.status &&
            typeof item.status === 'object' &&
            Object.keys(item.status)[0] === 'published',
        );
        // Sort: pinned first, then by createdAt descending
        listAnnouncement = listAnnouncement.sort((a, b) => {
          // Pinned first
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          // Then by createdAt descending
          const aCreated = a.createdAt ? Number(a.createdAt) : 0;
          const bCreated = b.createdAt ? Number(b.createdAt) : 0;
          return bCreated - aCreated;
        });

        if (isMounted) setAnnouncements(listAnnouncement);
      } catch (e) {
        console.error(e);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [gameId, wallet]);

  function extLooksVideo(url = ''): boolean {
    return /\.(mp4|webm|mov|m4v)$/i.test(url);
  }

  function previewsFromMetadata(md?: [] | [Metadata] | null): MediaItem[] {
    // Ambil Value untuk key "pgl1_previews"
    const pvVal: Value | undefined = mdGet(md!, 'pgl1_previews');
    // Value bisa {array: Value[]} atau undefined
    const list = (pvVal && (pvVal as any).array) as Value[] | undefined;
    if (!Array.isArray(list)) return [];

    return list
      .map((v) => {
        // v diharapkan { map: [ ["kind",{text}], ["url",{text}] ] }
        const m = asMap(v);
        if (!m) return null;
        const kindTxt = asText(m.find(([k]) => k === 'kind')?.[1]) ?? '';
        const url = asText(m.find(([k]) => k === 'url')?.[1]) ?? '';
        if (!url) return null;

        const isVideo = kindTxt === 'video' || extLooksVideo(url);
        return { kind: isVideo ? 'video' : 'image', src: url, alt: 'preview' } as MediaItem;
      })
      .filter(Boolean) as MediaItem[];
  }

  async function fetchAnnouncementByAnnouncementId(announcementId: any) {
    setSelectedAnnouncement(null);
    setIsAnnouncementModalShowed(true);
    try {
      const announcement = await getAnnouncementsByAnnouncementId({
        announcementId: BigInt(Number(announcementId)),
        wallet,
      });

      setSelectedAnnouncement(announcement);
    } catch (err) {
      console.error(err);
    }
  }

  async function onCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await commentByAnnouncementId({
        annId: BigInt(Number(selectedAnnouncement?.announcementId)),
        wallet,
        comment,
      });
    } catch (err) {
      console.error(err);
    }
  }

  const getGameCategories = ({ md }: { md: [Metadata] | undefined | [] }): string[] => {
    const categoriesText = (asArray(mdGet(md, 'pgl1_category')) ?? [])
      .map(asText)
      .filter(Boolean) as string[];
    return categoriesText;
  };

  const getTags = ({ md }: { md: [Metadata] | undefined | [] }): string[] => {
    const tagsText = (asArray(mdGet(md, 'pgl1_tags')) ?? [])
      .map(asText)
      .filter(Boolean) as string[];
    return tagsText;
  };

  const getReleaseDate = ({ md }: { md: [Metadata] | [] | undefined }): string => {
    // const releaseDate = mdGet(md, 'release_date_ns') ?? [];
    const releaseDate = (asArray(mdGet(md, 'release_date_ns')) ?? []).map(asBigInt).filter(Boolean);
    return releaseDate.toString();
  };

  const tokenCanister = detailGame ? optGet(detailGame.pgl1_token_payment ?? []) : undefined;
  const rawPrice = detailGame ? optGet(detailGame.pgl1_price ?? []) ?? 0 : 0;
  const tokenInfo = resolveTokenInfo(tokenCanister);
  const priceIsFree = isZeroTokenAmount(rawPrice, tokenInfo.decimals);
  const humanPriceNumber = subunitsToNumber(rawPrice, tokenInfo.decimals);
  const vaultSpenderId = (import.meta.env.VITE_PERIDOT_CANISTER_VAULT_BACKEND ?? '').trim();

  const interpretPurchaseResult = (result: PurchaseResult): { status: 'success' | 'error'; message: string } => {
    if (result && typeof result === 'object') {
      if ('success' in result) {
        return {
          status: 'success',
          message: 'Game added to your library.',
        };
      }
      if ('alreadyOwned' in result) {
        return {
          status: 'success',
          message: 'You already own this game.',
        };
      }
      if ('paymentFailed' in result) {
        return {
          status: 'error',
          message: `Payment failed: ${result.paymentFailed}`,
        };
      }
      if ('insufficientAllowance' in result) {
        return {
          status: 'error',
          message: 'Purchase failed: insufficient allowance. Please approve more tokens and try again.',
        };
      }
      if ('soldOut' in result) {
        return {
          status: 'error',
          message: 'Purchase failed: this game is sold out.',
        };
      }
      if ('notPublished' in result) {
        return {
          status: 'error',
          message: 'Purchase failed: the game is not published.',
        };
      }
      const [code] = Object.keys(result);
      if (code) {
        return {
          status: 'error',
          message: `Purchase failed: ${code}`,
        };
      }
    }
    return {
      status: 'error',
      message: 'Purchase failed due to an unexpected response.',
    };
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
    if (outcome.status === 'success') {
      setPurchaseState(outcome);
    } else {
      setPurchaseState(outcome);
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
        message: 'Payment configuration is missing the spender canister id. Please update your .env.',
      });
      return;
    }

    setIsOnPayment(true);
  };

  const KRow = ({ k, v }: { k: string; v?: string }) => {
    if (!v) return null;
    return (
      <tr className="align-top">
        <td className="pr-8 py-2 text-muted-foreground">{k}</td>
        <td className="py-2">{v}</td>
      </tr>
    );
  };

  const NativeCard = ({ s }: { s: NativeSpec }) => (
    <table className="w-full">
      <tbody>
        <KRow k="OS" v={s.os} />
        <KRow k="Processor" v={s.processor} />
        <KRow k="Graphics" v={s.graphics} />
        <KRow k="Memory" v={s.memory} />
        <KRow k="Storage" v={s.storage} />
        <KRow k="Notes" v={s.notes} />
      </tbody>
    </table>
  );

  const WebCard = ({ s }: { s: WebSpec }) => (
    <table className="w-full">
      <tbody>
        <KRow k="Processor" v={s.processor} />
        <KRow k="Graphics" v={s.graphics} />
        <KRow k="Memory" v={s.memory} />
        <KRow k="Storage" v={s.storage} />
        <KRow k="Notes" v={s.notes} />
      </tbody>
    </table>
  );

  const platformsFromDistribution = (distOpt: [] | [Array<Distribution>] | undefined): string[] => {
    if (!distOpt || !Array.isArray(distOpt) || distOpt.length === 0) return [];
    const dist = distOpt[0] ?? [];
    const out: string[] = [];

    for (const d of dist) {
      if ('web' in d) {
        out.push('Web');
      } else if ('native' in d) {
        const os = d.native.os.toLowerCase();
        if (os.includes('win')) out.push('Windows');
        else if (os.includes('mac') || os.includes('os x') || os.includes('darwin'))
          out.push('macOS');
        else if (os.includes('linux') || os.includes('ubuntu') || os.includes('debian'))
          out.push('Linux');
        else out.push('Other');
      }
    }
    // unik + urutan yang enak
    const order = ['Web', 'Windows', 'macOS', 'Linux', 'Android', 'iOS', 'Other'];
    return Array.from(new Set(out)).sort((a, b) => order.indexOf(a) - order.indexOf(b));
  };

  return (
    <main className="flex justify-center duration-300">
      {/* Announcement modal */}
      <Modal
        open={isAnnouncementModalShowed}
        onClose={() => setIsAnnouncementModalShowed(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-shadow_primary rounded-2xl w-3/5 h-3/4 border-2 border-green-900 p-12">
          <p
            className="absolute top-0 right-0 pb-4 px-5 translate-x-1/2 -translate-y-1/2 bg-green-900 rounded-full cursor-pointer text-4xl"
            onClick={() => setIsAnnouncementModalShowed(false)}
          >
            x
          </p>

          <div className="mb-12">
            <div className="mb-12">
              <div className="mb-4">
                <p className="text-4xl">{selectedAnnouncement?.headline}</p>
              </div>
              <div>
                <p className="text-gray-500">
                  PUBLISHED{' '}
                  {selectedAnnouncement?.createdAt !== undefined
                    ? new Date(
                        Number(selectedAnnouncement.createdAt) / 1_000_000,
                      ).toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : ''}
                </p>
              </div>
            </div>
            <div>
              <p>{selectedAnnouncement?.content}</p>
            </div>
          </div>
          <div>
            <div className="mb-4">
              <p className="text-2xl">Comments</p>
            </div>
            <div>
              <form onSubmit={onCommentSubmit}>
                <InputFieldComponent
                  name="Comment"
                  icon={faMessage}
                  type="text"
                  placeholder="Comment"
                  value={comment}
                  onChange={(e) => setComment((e.target as HTMLInputElement).value)}
                />
                <div className="flex justify-end">
                  <button type="submit" className={`shadow-flat-sm my-6 px-6 py-3 rounded-md`}>
                    Post Comment
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div></div>
        </div>
      </Modal>
      <div className="max-w-[1400px] w-full flex flex-col gap-6 duration-300">
        {/* Header  =========================== */}
        <section className="w-full h-120 relative">
          {/* title */}
          <div className="px-12 py-8 flex gap-3 h-full justify-between items-end">
            <div className="flex flex-col gap-4 w-3/5">
              {/* tags  */}
              <div className="flex gap-2 text-sm">
                {getGameCategories({ md: detailGame?.pgl1_metadata }).map((item, idx) => (
                  <span
                    key={idx}
                    className="bg-white/10 px-4 py-1 rounded-full border border-white/20 uppercase backdrop-blur-sm font-bold"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <h1 className="text-5xl font-bold leading-tight">
                {detailGame?.pgl1_name ? detailGame?.pgl1_name : 'PeridotVault Game'}
              </h1>
              {/* <StarComponent rate={4} /> */}
            </div>

            <div className="flex gap-6 items-center w-2/5 justify-end">
              {priceIsFree ? (
                <div className="flex gap-2 items-center text-start text-lg font-bold">
                  <p>FREE</p>
                </div>
              ) : (
                <PriceCoin amount={rawPrice ?? 0} tokenCanister={tokenCanister} textSize="lg" />
              )}
              <button
                className={`px-12 font-bold py-3 rounded-md bg-accent ${buying ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={handleBuyClick}
                disabled={buying}
              >
                {buying ? 'Processing…' : 'Buy Now'}
              </button>
              {purchaseState ? (
                <span
                  className={`text-sm font-medium ${
                    purchaseState.status === 'success' ? 'text-success' : 'text-chart-5'
                  }`}
                >
                  {purchaseState.message}
                </span>
              ) : null}
            </div>
          </div>

          {/* background  */}
          <div className="w-full h-full absolute top-0 left-0 -z-10">
            <img
              src={detailGame ? optGetOr(detailGame.pgl1_banner_image, ImageLoading) : ImageLoading}
              alt=""
              className="w-full h-full object-cover absolute"
            />
            <div className="bg-linear-to-t from-background w-full h-full absolute"></div>
          </div>
        </section>

        {/* First Section */}
        <section className="px-12 py-6 flex gap-12 lg:gap-14 duration-300">
          {/* Left side ======================== */}
          <div className="w-3/4 flex flex-col gap-10 text-lg">
            {/* overview */}
            <CarouselPreview
              items={previewsFromMetadata(detailGame?.pgl1_metadata)}
              initialIndex={0}
              autoPlay
              showThumbnails
            />

            {/* Description */}
            <div className="flex flex-col gap-3">
              <h2 className="text-base text-muted-foreground">Description</h2>
              <p>{detailGame?.pgl1_description}</p>
            </div>

            {/* Tags */}
            <div className="flex flex-col gap-3">
              <h2 className="text-base text-muted-foreground">Tags</h2>
              <div className="flex gap-2 text-sm">
                {getTags({ md: detailGame?.pgl1_metadata }).map((item, idx) => (
                  <span
                    key={idx}
                    className="bg-white/10 px-4 py-1 rounded-full border border-white/20 uppercase backdrop-blur-sm font-bold"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Announcement */}
            <div className="flex flex-col gap-6">
              {/* title  */}
              <button className="flex items-center gap-3">
                <h2 className="text-xl font-bold">Announcements</h2>
                <FontAwesomeIcon icon={faAngleRight} />
              </button>
              <div className="flex flex-col gap-6">
                {announcements?.map((item, index) => (
                  <AnnouncementContainer
                    key={index}
                    item={item}
                    onClick={() => fetchAnnouncementByAnnouncementId(item.announcementId)}
                  />
                ))}
              </div>
            </div>

            {/* System Requirements */}
            <div className="flex flex-col gap-3">
              <h2 className="text-base text-muted-foreground">System Requirements</h2>
              {/* Navbar  */}
              <nav className="flex gap-2 flex-wrap border-b border-white/20">
                {(['Website', 'Windows', 'macOS', 'Linux', 'Other'] as PlatformKey[])
                  .filter((p) => (dist as any)[p]?.length)
                  .map((pf) => {
                    const isActive = pf === activeTab;
                    return (
                      <button
                        key={pf}
                        onClick={() => setActiveTab(pf)}
                        className={[
                          'pb-3',
                          isActive && 'border-b border-accent-foreground  text-accent-foreground',
                        ].join(' ')}
                      >
                        {pf}
                      </button>
                    );
                  })}
              </nav>

              {/* description  */}
              {!activeTab ? (
                <p className="text-sm text-muted-foreground">No distribution data.</p>
              ) : activeTab === 'Website' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {dist.Website!.map((s, i) => (
                    <WebCard key={i} s={s} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {(dist[activeTab] as NativeSpec[]).map((s, i) => (
                    <NativeCard key={i} s={s} />
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* right side ======================== */}
          <div className="w-1/4 min-w-[300px] flex flex-col gap-6">
            {/* age regulation  */}
            <div className="flex shadow-arise-sm p-6 rounded-xl items-start gap-4 ">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQll4aojWlhPmKpt6mBEgv1HSk55vIHpG92aY3w-zTsmTUwGs7bv31r8qluHXf6g1SezkY&usqp=CAU"
                alt=""
                className="w-10 object-contain"
              />
              <div className="flex flex-col gap-2">
                <p className="font-bold">Everyone</p>
                <hr className="border-muted-foreground/50" />
                <p>
                  A safe game for all, although it may contain some mild violence or more complex
                  themes.
                </p>
              </div>
            </div>
            {/* details game  */}
            <div className="flex flex-col">
              <GameTypes title="Publisher" content="Antigane Inc" />
              <GameTypes
                title="Release Date"
                content={getReleaseDate({ md: detailGame?.pgl1_metadata })}
              />
              <GamePlatforms
                title="Platform"
                platforms={platformsFromDistribution(detailGame?.pgl1_distribution)}
              />
            </div>
            {/* Buy Game  */}
            <div className="flex flex-col gap-4 py-3">
              <button className="w-full p-4 rounded-xl shadow-sunken-sm hover:shadow-arise-sm duration-300">
                Add To Wishlist
              </button>
            </div>
          </div>
        </section>

        {/* Similar Games  */}
        <section className="flex justify-center px-12 py-6">
          <div className="flex flex-col gap-6 w-full max-w-[1400px]">
            {/* title  */}
            <button className="flex items-center gap-3">
              <p className="text-xl font-bold">Similar Games</p>
              <FontAwesomeIcon icon={faAngleRight} />
            </button>

            {/* contents  */}
            <div className="flex gap-6">
              {allGames?.slice(0, 5).map((item, idx) => (
                <VerticalCard
                  key={idx}
                  gameId={item.pgl1_game_id}
                  gameName={item.pgl1_name}
                  imgUrl={optGetOr(item.pgl1_cover_image, ImageLoading)}
                  price={optGet(item.pgl1_price ?? []) ?? 0}
                  tokenCanister={optGet(item.pgl1_token_payment ?? [])}
                />
              ))}
            </div>
          </div>
        </section>
        {isOnPayment && (
          <AppPayment
            price={humanPriceNumber}
            onClose={() => setIsOnPayment(false)}
            SPENDER={vaultSpenderId}
            tokenCanisterId={tokenCanister}
            tokenSymbol={tokenInfo.symbol}
            tokenLogoUrl={tokenInfo.logo}
            onExecute={async () => {
              await finalizePurchase();
            }}
          />
        )}
        <div className="mb-20"></div>
      </div>
    </main>
  );
}

const GameTypes = ({ title, content }: { title: string; content: string }) => {
  return (
    <div className="flex flex-col">
      <div className="flex justify-between py-4">
        <label className="text-muted-foreground">{title}</label>
        {content}
      </div>
      <hr className="border-muted-foreground/50" />
    </div>
  );
};

const GamePlatforms = ({ title, platforms }: { title: string; platforms: string[] }) => {
  // hilangkan duplikat + hanya ambil yang kita kenal
  const normalizePlatform = (p: string) => p.trim().toLowerCase().replace(/\s+/g, '');

  const PLATFORM_ICON: Record<string, { icon: any; label: string }> = {
    web: { icon: faGlobe, label: 'Web' },
    windows: { icon: faWindows, label: 'Windows' },
    macos: { icon: faApple, label: 'macOS' },
    linux: { icon: faLinux, label: 'Linux' },
    android: { icon: faAndroid, label: 'Android' },
    ios: { icon: faApple, label: 'iOS' },
  };
  const uniq = Array.from(
    new Set(platforms.map(normalizePlatform).filter((p) => PLATFORM_ICON[p] !== undefined)),
  );
  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center py-4">
        <label className="text-muted-foreground">{title}</label>

        <div className="flex items-center gap-3">
          {uniq.length === 0 ? (
            <span className="text-muted-foreground">—</span>
          ) : (
            uniq.map((key) => {
              const { icon } = PLATFORM_ICON[key];
              return <FontAwesomeIcon key={key} icon={icon} />;
            })
          )}
        </div>
      </div>
      <hr className="border-muted-foreground/50" />
    </div>
  );
};
