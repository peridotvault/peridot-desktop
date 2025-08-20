// @ts-ignore
import React, { useEffect, useState } from "react";
import { StarComponent } from "../../components/atoms/StarComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { AppPayment } from "../../features/wallet/views/Payment";
import { AppInterface, Preview } from "../../interfaces/app/AppInterface";
import { useParams } from "react-router-dom";
import { nsToDateStr } from "../../utils/Additional";
import {
  getAllApps,
  getAppById,
} from "../../blockchain/icp/app/services/ICPAppService";
import { useWallet } from "../../contexts/WalletContext";
import { buyApp } from "../../blockchain/icp/app/services/ICPPurchaseService";
import { PurchaseInterface } from "../../interfaces/app/PurchaseInterface";
import CarouselPreview, {
  MediaItem,
} from "../../components/organisms/CarouselPreview";

export default function GameDetail() {
  const { appId } = useParams();
  const { wallet } = useWallet();
  const [isOnPayment, setIsOnPayment] = useState(false);
  const [detailGame, setDetailGame] = useState<AppInterface | null>();
  const [allGames, setAllGames] = useState<AppInterface[] | null>();
  const [humanPriceStr, setHumanPriceStr] = useState<Number>(0);

  useEffect(() => {
    async function fetchData() {
      window.scrollTo(0, 0);

      const resDetailGame = await getAppById({ appId: Number(appId) });
      console.log(resDetailGame);
      setDetailGame(resDetailGame);
      setHumanPriceStr(Number(resDetailGame?.price) / 1e8);
      const resAllGames = await getAllApps();
      setAllGames(resAllGames);
    }

    fetchData();
  }, []);

  function isOptVecShape(v: any): v is [any[]] {
    return Array.isArray(v) && v.length === 1 && Array.isArray(v[0]);
  }

  function extLooksVideo(url = ""): boolean {
    return /\.(mp4|webm|mov|m4v)$/i.test(url);
  }

  function previewsToMediaItems(
    previewsAny?: Preview[] | [Preview[]] | null
  ): MediaItem[] {
    // 1) unwrap opt vec: [] => [], [ [..] ] => [..]
    const arr: any[] = !previewsAny
      ? []
      : isOptVecShape(previewsAny)
      ? previewsAny[0]
      : (previewsAny as any[]);

    // 2) map aman + fallback deteksi video dari ekstensi
    return arr
      .filter((p) => p && typeof p === "object")
      .map((p) => {
        const url = p.url ?? p.src ?? "";
        const kindObj = p.kind ?? {};
        const isVideo =
          (typeof kindObj === "object" && "video" in kindObj) ||
          extLooksVideo(url);
        return {
          kind: isVideo ? "video" : "image",
          src: url,
          alt: p.alt ?? "preview",
        } as MediaItem;
      });
  }

  return (
    <main className="flex justify-center duration-300">
      <div className="max-w-[1400px] w-full flex flex-col gap-6 duration-300">
        <div className="mb-20"></div>
        {/* title */}
        <div className="px-12 pt-6 flex flex-col gap-3">
          <p className="text-3xl font-bold">
            {detailGame?.title ? detailGame?.title : "PeridotVault Game"}
          </p>
          <StarComponent rate={4} />
        </div>
        {/* First Section */}
        <section className="px-12 py-6 flex gap-12 lg:gap-14 duration-300">
          {/* Left side ======================== */}
          <div className="w-3/4 flex flex-col gap-12 text-lg">
            {/* overview */}
            {/* <img
              src={
                detailGame?.coverImage
                  ? detailGame.coverImage
                  : "/assets/cover1.png"
              }
              alt=""
              className="aspect-video rounded-xl object-cover shadow-arise-sm "
            /> */}
            <CarouselPreview
              items={previewsToMediaItems(detailGame?.previews)}
              initialIndex={0}
              autoPlay
              showThumbnails
            />
            {/* section 1 */}
            <p>{detailGame?.description}</p>
          </div>
          {/* right side ======================== */}
          <div className="w-1/4 min-w-[300px] h-52 flex flex-col gap-6">
            {/* age regulation  */}
            <div className="flex items-center justify-center ">
              <div className="w-full aspect-[3/4] relative overflow-hidden shadow-arise-sm rounded-xl">
                <img
                  src={
                    detailGame?.coverImage
                      ? detailGame.coverImage
                      : "/assets/cover1.png"
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
                  A safe game for all, although it may contain some mild
                  violence or more complex themes.
                </p>
              </div>
            </div>
            {/* details game  */}
            <div className="flex flex-col">
              <GameTypes title="Developer" content="Antigane Inc." />
              <GameTypes title="Publisher" content="Antigane Inc." />
              <GameTypes
                title="Release Date"
                content={nsToDateStr(detailGame?.releaseDate.toString()) || ""}
              />
              <GameTypes title="Requirement" content="RAM 16GB / 256GB" />
              <GameTypes title="Platform" content="Windows" />
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
              <p className="text-xl font-semibold">Similar Games</p>
              <FontAwesomeIcon icon={faAngleRight} />
            </button>

            {/* contents  */}
            <div className="flex gap-6">
              {/* {allGames?.slice(0, 5).map((item) => (
                <VerticalCard
                  key={item.appId}
                  appId={item.appId}
                  imgUrl={item.coverImage}
                  title={item.title}
                  price={item.price}
                />
              ))} */}
            </div>
          </div>
        </section>
        {isOnPayment && (
          <AppPayment
            price={Number(humanPriceStr)}
            onClose={() => setIsOnPayment(false)}
            SPENDER={import.meta.env.VITE_PERIDOT_CANISTER_APP_BACKEND}
            onExecute={async () => {
              const res: PurchaseInterface = await buyApp({
                appId: Number(appId),
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
