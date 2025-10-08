// @ts-ignore
import React, { useEffect, useState } from 'react';
import { StarComponent } from '../../components/atoms/StarComponent';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight, faMessage } from '@fortawesome/free-solid-svg-icons';
import { AppPayment } from '../../features/wallet/views/Payment';
import { useParams } from 'react-router-dom';
import { useWallet } from '../../contexts/WalletContext';
import CarouselPreview from '../../components/organisms/CarouselPreview';
import { VerticalCard } from '../../components/cards/VerticalCard';
import { AnnouncementContainer } from '../../components/atoms/AnnouncementContainer';
import Modal from '@mui/material/Modal';
import { InputFieldComponent } from '../../components/atoms/InputFieldComponent';
import {
  getPublishedGames,
  getGamesByGameId,
} from '../../blockchain/icp/vault/services/ICPGameService';
import {
  GameAnnouncementType,
  Metadata,
  PGLMeta,
  PurchaseType,
  Value,
} from '../../blockchain/icp/vault/service.did.d';
import {
  commentByAnnouncementId,
  getAllAnnouncementsByGameId,
  getAnnouncementsByAnnouncementId,
} from '../../blockchain/icp/vault/services/ICPAnnouncementService';
import { asMap, asText, mdGet, optGetOr } from '../../interfaces/helpers/icp.helpers';
import { ImageLoading } from '../../constants/lib.const';
import { buyGame } from '../../blockchain/icp/vault/services/ICPPurchaseService';
import { MediaItem } from '../../interfaces/app/GameInterface';

export default function GameDetail() {
  const { gameId } = useParams();
  const { wallet } = useWallet();
  const [isOnPayment, setIsOnPayment] = useState(false);
  const [detailGame, setDetailGame] = useState<PGLMeta | null>();
  // const [developerData, setDeveloperData] = useState<UserInterface | null>();
  const [allGames, setAllGames] = useState<PGLMeta[] | null>();
  const [humanPriceStr, setHumanPriceStr] = useState<Number>(0);
  const [announcements, setAnnouncements] = useState<GameAnnouncementType[] | null>(null);
  const [isAnnouncementModalShowed, setIsAnnouncementModalShowed] = useState(false);
  const [comment, setComment] = useState('');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<GameAnnouncementType | null>(
    null,
  );

  useEffect(() => {
    async function fetchData() {
      window.scrollTo(0, 0);

      const resDetailGame = (await getGamesByGameId({
        gameId: gameId!,
      })) as PGLMeta;
      // const developer = await getUserByPrincipalId({
      //   userId: resDetailGame.,
      // });
      console.log(gameId);
      console.log(resDetailGame);
      setDetailGame(resDetailGame);
      // setDeveloperData(developer);
      setHumanPriceStr(Number(resDetailGame?.pgl1_price) / 1e8);
      const resAllGames = await getPublishedGames({ start: 0, limit: 200 });
      setAllGames(resAllGames);
    }

    fetchData();
  }, []);

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
      console.log(announcement?.headline);
    } catch (err) {
      console.error(err);
    }
  }

  async function onCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const result = await commentByAnnouncementId({
        annId: BigInt(Number(selectedAnnouncement?.announcementId)),
        wallet,
        comment,
      });
      console.log(result?.comment);
    } catch (err) {
      console.error(err);
    }
  }

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
        <div className="mb-20"></div>
        {/* title */}
        <div className="px-12 pt-6 flex flex-col gap-3">
          <h1 className="text-3xl font-bold">
            {detailGame?.pgl1_name ? detailGame?.pgl1_name : 'PeridotVault Game'}
          </h1>
          <StarComponent rate={4} />
        </div>
        {/* First Section */}
        <section className="px-12 py-6 flex gap-12 lg:gap-14 duration-300">
          {/* Left side ======================== */}
          <div className="w-3/4 flex flex-col gap-12 text-lg">
            {/* overview */}
            <CarouselPreview
              items={previewsFromMetadata(detailGame?.pgl1_metadata)}
              initialIndex={0}
              autoPlay
              showThumbnails
            />
            {/* section 1 */}
            <p>{detailGame?.pgl1_description}</p>

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
          </div>
          {/* right side ======================== */}
          <div className="w-1/4 min-w-[300px]  flex flex-col gap-6">
            {/* age regulation  */}
            <div className="flex items-center justify-center ">
              <div className="w-full aspect-[3/4] relative overflow-hidden shadow-arise-sm rounded-xl">
                <img
                  src={
                    detailGame ? optGetOr(detailGame.pgl1_cover_image, ImageLoading) : ImageLoading
                  }
                  className="w-full h-full object-cover"
                  alt=""
                />
              </div>
            </div>
            {/* age regulation  */}
            <div className="flex shadow-arise-sm p-6 rounded-xl items-start gap-4 ">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQll4aojWlhPmKpt6mBEgv1HSk55vIHpG92aY3w-zTsmTUwGs7bv31r8qluHXf6g1SezkY&usqp=CAU"
                alt=""
                className="w-10 object-contain"
              />
              <div className="flex flex-col gap-2">
                <p className="font-bold">Everyone</p>
                <hr className="border-text_disabled/50" />
                <p>
                  A safe game for all, although it may contain some mild violence or more complex
                  themes.
                </p>
              </div>
            </div>
            {/* details game  */}
            <div className="flex flex-col">
              {/* <GameTypes title="Developer" content={developerData?.displayName!} /> */}
              {/* <GameTypes title="Publisher" content="Antigane Inc." /> */}
              {/* <GameTypes
                title="Release Date"
                content={nsToDateStr(detailGame?.releaseDate.toString()) || ''}
              /> */}
              <GameTypes title="Requirement" content="RAM 8GB" />
              <GameTypes title="Platform" content="Web" />
            </div>
            {/* Buy Game  */}
            <div className="flex flex-col gap-4 py-3">
              {Number(humanPriceStr!) > 0 ? (
                <div className="flex gap-2 items-center text-start">
                  <img
                    src="/assets/coin-peridot.png"
                    className="h-6 aspect-square object-contain"
                  />
                  <p className="text-lg">{humanPriceStr.toString()} PER</p>
                </div>
              ) : (
                <div className="flex gap-2 items-center text-start text-lg font-bold">
                  <p>FREE</p>
                </div>
              )}

              <button
                className="w-full p-4 rounded-xl bg-accent_secondary"
                onClick={() => setIsOnPayment(true)}
              >
                Buy Now
              </button>
              <button className="w-full p-4 rounded-xl shadow-sunken-sm hover:shadow-arise-sm duration-300">
                Add To Cart
              </button>
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
                  price={Number(item.pgl1_price)}
                />
              ))}
            </div>
          </div>
        </section>
        {isOnPayment && (
          <AppPayment
            price={Number(humanPriceStr)}
            onClose={() => setIsOnPayment(false)}
            SPENDER={import.meta.env.VITE_PERIDOT_CANISTER_APP_BACKEND}
            onExecute={async () => {
              const res: PurchaseType = await buyGame({
                gameId: gameId!,
                wallet: wallet,
              });

              console.log(res);
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
        <p className="text-text_disabled">{title}</p>
        <p>{content}</p>
      </div>
      <hr className="border-text_disabled/50" />
    </div>
  );
};
