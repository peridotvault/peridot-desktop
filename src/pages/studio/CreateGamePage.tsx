// @ts-ignore
import React, { useCallback, useEffect, useState } from 'react';
import { useWallet } from '../../contexts/WalletContext';

import { faPlus, faUpLong } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import { Alert } from '../../components/molecules/Alert';
import { getGameByDeveloperId } from '../../blockchain/icp/vault/services/ICPGameService';
import { PGLMeta } from '../../blockchain/icp/vault/service.did.d';
import { optGetOr } from '../../interfaces/helpers/icp.helpers';
import { ImageLoading } from '../../constants/lib.const';
import { NewGame } from '../../components/organisms/NewGame';
import { getGameUnRegistered } from '../../blockchain/icp/factory/services/ICPFactoryService';
import { Principal } from '@dfinity/principal';
import { register_game } from '../../blockchain/icp/registry/services/ICPRegistryService';
import { CreateGameRecord } from '../../blockchain/icp/registry/service.did.d';

export const CreateGamePage = () => {
  const { wallet } = useWallet();

  const [games, setGames] = useState<PGLMeta[] | null>(null);
  const [unRegisteredGame, setUnRegisteredGame] = useState<
    { name: string; canister_id: Principal; game_id: string; registered: boolean }[]
  >([]);
  const [isCreateGameModal, setIsCreateGameModal] = useState<boolean>(false);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);

  const refetchAll = useCallback(async () => {
    if (!wallet?.principalId) return;
    const [listGame, listUnRegistered] = await Promise.all([
      getGameByDeveloperId({ dev: wallet.principalId, start: 0, limit: 200 }),
      getGameUnRegistered({ wallet }),
    ]);
    console.log(listGame);
    setGames(listGame);
    setUnRegisteredGame(listUnRegistered);
  }, [wallet?.principalId, wallet]);

  useEffect(() => {
    refetchAll().catch(console.error);
  }, [refetchAll]);

  const handleRegisterGame = async ({
    canister_id,
    developer,
  }: {
    canister_id: Principal;
    developer: string;
  }) => {
    if (busy) return;
    try {
      setBusy(true);
      const cidTxt = canister_id.toText();
      if (cidTxt === 'aaaaa-aa') {
        console.warn('Skip invalid canister id aaaaa-aa');
        return; // cukup return; jangan lempar error biar UX bersih
      }

      // optimistic remove
      setUnRegisteredGame((prev) => prev.filter((r) => r.canister_id.toText() !== cidTxt));

      const meta: CreateGameRecord = {
        canister_id,
        developer: Principal.fromText(developer),
      };
      await register_game({ meta });

      await refetchAll(); // sinkronkan ulang
    } catch (err) {
      console.error(err);
      await refetchAll(); // balikin data kalau gagal
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
              'flex aspect-square text-lg bg-accent_secondary rounded-full w-8 h-8 items-center justify-center duration-300 hover:shadow-flat-sm'
            }
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
        <hr className="border-white/20" />
      </section>

      {/* List Games   */}
      <section className="mt-4">
        {games?.length ? (
          games.map((item, index) => (
            <Link
              key={index}
              className="px-8 py-4 hover:bg-background_secondary flex gap-6 items-center justify-between"
              to={'/studio/update/' + item.pgl1_game_id.toString()}
            >
              <div className="flex gap-6 items-start">
                <div className="w-12 aspect-3/4">
                  <img
                    src={optGetOr(item.pgl1_cover_image, ImageLoading)}
                    alt={item.pgl1_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="">
                  <p className="">{item.pgl1_name}</p>
                  <p className="text-sm text-text_disabled">{item.pgl1_description}</p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <section className="flex flex-col items justify-center text-center my-8">
            <h2 className="font-bold text-lg">No Games</h2>
            <p className="">You haven`t added any games yet. To get started, click Add Games.</p>
            <div className="mt-4">
              <button
                onClick={() => setIsCreateGameModal(true)}
                className="bg-accent_secondary px-6 py-2 rounded-lg"
              >
                Add Games
              </button>
            </div>
          </section>
        )}

        {!!unRegisteredGame?.length && (
          <section className="flex flex-col gap-2 mt-8">
            <h2 className="font-bold text-lg">Unregistered Games</h2>
            <hr className="border-white/10" />
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
                        developer: wallet.principalId!,
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
};
