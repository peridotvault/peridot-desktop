// @ts-ignore
import React, { useCallback, useEffect, useState } from 'react';
import { useWallet } from '@shared/contexts/WalletContext';

import { faPlus, faUpLong } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import { getDeveloperGames } from '@shared/blockchain/icp/services/game';
import type { PGCGame } from '@shared/blockchain/icp/types/game';
import { NewGame } from '@features/game/components/new-game.modal';
import { getGameUnRegistered } from '@features/game/services/factory';
import { Principal } from '@dfinity/principal';
import { register_game } from '@shared/blockchain/icp/services/registry';
import type { CreateGameRecord } from '@shared/blockchain/icp/sdk/canisters/registry.did.d';
import { ImageLoading } from '@shared/constants/images';
import { Alert } from '@shared/components/molecules/Alert';

// ✅ Skeleton Component untuk Game Item
const GameSkeleton = () => (
  <div className="px-8 py-4 flex gap-6 items-center justify-between animate-pulse">
    <div className="flex gap-6 items-start">
      <div className="w-12 aspect-3/4 bg-muted rounded"></div>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-32"></div>
        <div className="h-3 bg-muted rounded w-48"></div>
      </div>
    </div>
  </div>
);

// ✅ Skeleton Component untuk Unregistered Game
const UnregisteredGameSkeleton = () => (
  <div className="px-8 py-4 flex gap-6 items-center justify-between animate-pulse">
    <div className="flex gap-6 items-center">
      <div className="h-12 aspect-video bg-muted rounded"></div>
      <div className="h-4 bg-muted rounded w-24"></div>
    </div>
    <div className="w-8 h-8 bg-muted rounded"></div>
  </div>
);

export default function StudioGames() {
  const { wallet } = useWallet();

  const [games, setGames] = useState<PGCGame[] | null>(null);
  const [unRegisteredGame, setUnRegisteredGame] = useState<
    { name: string; canister_id: Principal; game_id: string; registered: boolean }[]
  >([]);
  const [isCreateGameModal, setIsCreateGameModal] = useState<boolean>(false);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true); // ✅ Tambahkan loading state

  const refetchAll = useCallback(async () => {
    if (!wallet?.principalId) {
      setLoading(false);
      return;
    }

    setLoading(true); // ✅ Mulai loading
    try {
      const [listGame, listUnRegistered] = await Promise.all([
        getDeveloperGames({ dev: wallet.principalId }),
        getGameUnRegistered({ wallet }),
      ]);
      // console.log(listGame);
      // console.log( listUnRegistered);
      setGames(listGame);
      setUnRegisteredGame(listUnRegistered);
    } catch (err) {
      console.error('Failed to fetch games:', err);
      // Tetap set state kosong agar UI tetap konsisten
      setGames([]);
      setUnRegisteredGame([]);
    } finally {
      setLoading(false); // ✅ Selesai loading
    }
  }, [wallet?.principalId, wallet]);

  useEffect(() => {
    refetchAll().catch(console.error);
  }, [refetchAll]);

  const handleRegisterGame = async ({ canister_id }: { canister_id: Principal }) => {
    if (busy) return;
    try {
      setBusy(true);
      const cidTxt = canister_id.toText();
      if (cidTxt === 'aaaaa-aa') {
        console.warn('Skip invalid canister id aaaaa-aa');
        return;
      }

      // optimistic remove
      setUnRegisteredGame((prev) => prev.filter((r) => r.canister_id.toText() !== cidTxt));

      const meta: CreateGameRecord = {
        canister_id,
      };
      await register_game({ meta });

      await refetchAll();
    } catch (err) {
      console.error(err);
      await refetchAll();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-[1400px] p-8">
      {/* header   */}
      <section className="text-4xl flex flex-col gap-4 ">
        <div className="flex items-center gap-4">
          <h1 className="font-bold">Games</h1>
          <button
            onClick={() => setIsCreateGameModal(true)}
            className={
              'flex aspect-square text-lg bg-accent rounded-full w-8 h-8 items-center justify-center duration-300 hover:shadow-flat-sm'
            }
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
        <hr className="border-foreground/20" />
      </section>

      {/* List Games   */}
      <section className="mt-4">
        {loading ? (
          // ✅ Tampilkan skeleton saat loading
          <>
            <GameSkeleton />
            <GameSkeleton />
            <GameSkeleton />
          </>
        ) : games?.length ? (
          games.map((item, index) => {
            const coverImage =
              item.coverVerticalImage ??
              item.coverHorizontalImage ??
              item.bannerImage ??
              item.metadata?.coverVerticalImage ??
              item.metadata?.coverHorizontalImage ??
              item.metadata?.bannerImage ??
              ImageLoading;

            return (
              <Link
                key={index}
                className="px-8 py-4 hover:bg-card flex gap-6 items-center justify-between"
                to={'/studio/game/' + item.gameId.toString()}
              >
                <div className="flex gap-6 items-start">
                  <div className="w-12 aspect-3/4">
                    <img
                      src={coverImage}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.src = ImageLoading)}
                    />
                  </div>
                  <div className="">
                    <p className="">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <section className="flex flex-col items justify-center text-center my-8">
            <h2 className="font-bold text-lg">No Games</h2>
            <p className="">You haven`t added any games yet. To get started, click Add Games.</p>
            <div className="mt-4">
              <button
                onClick={() => setIsCreateGameModal(true)}
                className="bg-accent px-6 py-2 rounded-lg"
              >
                Add Games
              </button>
            </div>
          </section>
        )}

        {loading
          ? // ✅ Skeleton untuk unregistered games
            unRegisteredGame.length > 0 && (
              <>
                <section className="flex flex-col gap-2 mt-8">
                  <h2 className="font-bold text-lg">Unregistered Games</h2>
                  <hr className="border-foreground/10" />
                  <div className="">
                    <UnregisteredGameSkeleton />
                    <UnregisteredGameSkeleton />
                  </div>
                </section>
              </>
            )
          : !!unRegisteredGame?.length && (
              <section className="flex flex-col gap-2 mt-8">
                <h2 className="font-bold text-lg">Unregistered Games</h2>
                <hr className="border-foreground/10" />
                <div className="">
                  {unRegisteredGame.map((item, index) => (
                    <div key={index} className="px-8 py-4 flex gap-6 items-center justify-between">
                      <div className="flex gap-6 items-center">
                        <div className="h-12 aspect-video">
                          <img
                            src={ImageLoading}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="">{item.name}</p>
                      </div>
                      <button
                        onClick={() =>
                          handleRegisterGame({
                            canister_id: item.canister_id,
                          })
                        }
                        disabled={busy}
                        className="shadow-arise-sm hover:shadow-flat-sm duration-300 px-3 py-2 rounded-md"
                      >
                        <FontAwesomeIcon icon={faUpLong} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

        {alert && (
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        )}
      </section>

      {/* modal  */}
      {isCreateGameModal && (
        <div
          onClick={() => setIsCreateGameModal(false)}
          className="absolute w-full h-full right-0 top-0 p-8 z-50 flex justify-center items-center bg-black/10 backdrop-blur-md"
        >
          <NewGame
            onCreated={async () => {
              await refetchAll();
              setIsCreateGameModal(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
